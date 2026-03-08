import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { insert, query } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const authResult = await authenticateRequest(req);
    if (authResult instanceof NextResponse) return authResult;

    const body = await req.json();
    const { message } = body;
    if (!message) return NextResponse.json({ error: 'Message is required' }, { status: 400 });

    // Save user message
    await insert('INSERT INTO chat_messages (user_id, role, content) VALUES (?, ?, ?)', [authResult.userId, 'user', message]);

    // Fetch user profile for context
    const userInfo = await query<any[]>(
      'SELECT name, grade, stream, goal_intensity FROM users WHERE id = ?',
      [authResult.userId]
    );
    const interests = await query<any[]>('SELECT name FROM user_interests WHERE user_id = ?', [authResult.userId]);
    const skills = await query<any[]>('SELECT name FROM user_skills WHERE user_id = ?', [authResult.userId]);

    const user = userInfo[0] || {};
    const systemPrompt = `You are DreamRoute AI Assistant, a friendly and knowledgeable career guidance counselor for Indian students in Class 8-12. 
The student's name is ${user.name || 'Student'}, they are in Class ${user.grade || '10'}, stream: ${user.stream || 'undecided'}, goal intensity: ${user.goal_intensity || 'serious'}.
Their interests: ${interests.map((i: any) => i.name).join(', ') || 'not specified'}.
Their skills: ${skills.map((s: any) => s.name).join(', ') || 'not specified'}.
Provide personalized, practical career advice. Be encouraging but realistic. Use Indian context (JEE, NEET, UPSC, etc).`;

    // Fetch recent chat history for context
    const history = await query<any[]>(
      'SELECT role, content FROM chat_messages WHERE user_id = ? ORDER BY created_at DESC LIMIT 20',
      [authResult.userId]
    );
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.reverse().map((m: any) => ({ role: m.role, content: m.content })),
      { role: 'user', content: message },
    ];

    const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;
    if (!NVIDIA_API_KEY) {
      // Fallback: return a mock response if no API key
      const fallback = `I'm here to help with your career questions! However, the AI service is not configured yet. Please ask your administrator to set up the NVIDIA API key.`;
      await insert('INSERT INTO chat_messages (user_id, role, content) VALUES (?, ?, ?)', [authResult.userId, 'assistant', fallback]);
      return NextResponse.json({ response: fallback, stream: false });
    }

    // Stream from NVIDIA API
    const nvidiaResponse = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NVIDIA_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
      },
      body: JSON.stringify({
        model: 'qwen/qwen3.5-397b-a17b',
        messages,
        max_tokens: 16384,
        temperature: 0.60,
        top_p: 0.95,
        top_k: 20,
        presence_penalty: 0,
        repetition_penalty: 1,
        stream: true,
        chat_template_kwargs: { enable_thinking: true },
      }),
    });

    if (!nvidiaResponse.ok) {
      const errText = await nvidiaResponse.text();
      console.error('NVIDIA API error:', errText);
      return NextResponse.json({ error: 'AI service unavailable' }, { status: 502 });
    }

    // Create a TransformStream to process SSE and forward
    const encoder = new TextEncoder();
    let fullResponse = '';

    const stream = new ReadableStream({
      async start(controller) {
        const reader = nvidiaResponse.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6).trim();
                if (data === '[DONE]') {
                  // Save full response to DB
                  if (fullResponse) {
                    await insert('INSERT INTO chat_messages (user_id, role, content) VALUES (?, ?, ?)', [authResult.userId, 'assistant', fullResponse]);
                  }
                  controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
                  controller.close();
                  return;
                }
                try {
                  const parsed = JSON.parse(data);
                  const delta = parsed.choices?.[0]?.delta?.content || '';
                  if (delta) {
                    fullResponse += delta;
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: delta })}\n\n`));
                  }
                } catch {
                  // Skip unparseable lines
                }
              }
            }
          }
          // Save whatever we got
          if (fullResponse) {
            await insert('INSERT INTO chat_messages (user_id, role, content) VALUES (?, ?, ?)', [authResult.userId, 'assistant', fullResponse]);
          }
          controller.close();
        } catch (err) {
          console.error('Stream error:', err);
          controller.close();
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('AI chat error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET chat history
export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateRequest(req);
    if (authResult instanceof NextResponse) return authResult;

    const messages = await query<any[]>(
      'SELECT id, role, content, created_at FROM chat_messages WHERE user_id = ? ORDER BY created_at ASC',
      [authResult.userId]
    );

    return NextResponse.json({
      messages: messages.map((m: any) => ({
        id: String(m.id),
        role: m.role,
        content: m.content,
        timestamp: m.created_at,
      })),
    });
  } catch (error) {
    console.error('Chat history error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE chat history
export async function DELETE(req: NextRequest) {
  try {
    const authResult = await authenticateRequest(req);
    if (authResult instanceof NextResponse) return authResult;

    await query('DELETE FROM chat_messages WHERE user_id = ?', [authResult.userId]);
    return NextResponse.json({ message: 'Chat history cleared' });
  } catch (error) {
    console.error('Chat clear error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
