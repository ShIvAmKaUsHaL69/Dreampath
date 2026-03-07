'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/contexts/AppContext';
import { ChatMessage } from '@/types';
import { cn } from '@/lib/utils';
import { Send, Bot, User, Sparkles, Trash2 } from 'lucide-react';

const suggestedQuestions = [
  'What skills do I need for software engineering?',
  'How do I prepare for JEE Main?',
  'Compare Data Science vs Software Engineering',
  'What are backup career options for medicine?',
  'How to improve my time management?',
];



export function AIChat() {
  const { chatMessages, addChatMessage, clearChat } = useApp();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    addChatMessage(userMessage);
    const messageText = input;
    setInput('');
    setIsTyping(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message: messageText }),
      });

      if (!res.ok) {
        const err = await res.json();
        addChatMessage({
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: err.error || 'Sorry, I had trouble processing your request. Please try again.',
          timestamp: new Date(),
        });
        setIsTyping(false);
        return;
      }

      // Check if streaming response
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('text/event-stream')) {
        // Stream response
        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let fullContent = '';
        const assistantMsgId = (Date.now() + 1).toString();

        // Add empty assistant message that we'll update
        addChatMessage({
          id: assistantMsgId,
          role: 'assistant',
          content: '',
          timestamp: new Date(),
        });

        let buffer = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim();
              if (data === '[DONE]') continue;
              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  fullContent += parsed.content;
                  // Update the last message in chat
                  addChatMessage({
                    id: assistantMsgId,
                    role: 'assistant',
                    content: fullContent,
                    timestamp: new Date(),
                  });
                }
              } catch { /* skip */ }
            }
          }
        }
      } else {
        // Non-streaming response (fallback)
        const data = await res.json();
        addChatMessage({
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response || 'I received your message but could not generate a response.',
          timestamp: new Date(),
        });
      }
    } catch (error) {
      addChatMessage({
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, there was a connection error. Please check your internet and try again.',
        timestamp: new Date(),
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)]">
      <Card className="flex-1 flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between border-b py-4">
          <CardTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            DreamPath AI Assistant
          </CardTitle>
          {chatMessages.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearChat} className="gap-1">
              <Trash2 className="h-4 w-4" />
              Clear
            </Button>
          )}
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            {chatMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  How can I help you today?
                </h3>
                <p className="text-muted-foreground text-sm max-w-md mb-6">
                  Ask me anything about careers, exams, study tips, or your roadmap.
                  I&apos;m here to guide you!
                </p>
                <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                  {suggestedQuestions.map((question) => (
                    <Badge
                      key={question}
                      variant="outline"
                      className="cursor-pointer hover:bg-primary/10 py-2 px-3"
                      onClick={() => handleSuggestedQuestion(question)}
                    >
                      {question}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      'flex gap-3',
                      message.role === 'user' && 'flex-row-reverse'
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      )}
                    >
                      {message.role === 'user' ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                    </div>
                    <div
                      className={cn(
                        'rounded-lg px-4 py-3 max-w-[80%]',
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      )}
                    >
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        {message.content.split('\n').map((line, i) => (
                          <p key={i} className="mb-1 last:mb-0">
                            {line}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="rounded-lg bg-muted px-4 py-3">
                      <div className="flex gap-1">
                        <span className="h-2 w-2 rounded-full bg-foreground/50 animate-bounce" />
                        <span className="h-2 w-2 rounded-full bg-foreground/50 animate-bounce delay-100" />
                        <span className="h-2 w-2 rounded-full bg-foreground/50 animate-bounce delay-200" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Input */}
          <div className="border-t p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything about your career path..."
                className="flex-1"
              />
              <Button type="submit" disabled={!input.trim() || isTyping}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
