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

// Simulated AI responses
const getAIResponse = (question: string): string => {
  const lowerQ = question.toLowerCase();
  
  if (lowerQ.includes('software') && lowerQ.includes('skill')) {
    return `Great question! For software engineering, you'll need these key skills:

**Technical Skills:**
- Programming languages (Python, Java, JavaScript)
- Data Structures & Algorithms
- Database management
- Version control (Git)
- Problem-solving

**Soft Skills:**
- Communication
- Teamwork
- Time management
- Continuous learning mindset

I recommend starting with Python for beginners and gradually moving to other languages. Practice coding daily on platforms like HackerRank or LeetCode!`;
  }
  
  if (lowerQ.includes('jee')) {
    return `Here's your JEE Main preparation strategy:

**Phase 1 (Foundation):**
- Complete NCERT thoroughly for all subjects
- Understand concepts deeply, don't just memorize

**Phase 2 (Practice):**
- Solve previous year papers (last 10 years)
- Take mock tests regularly
- Focus on weak areas

**Subject-wise Tips:**
- **Physics:** Focus on concepts and numericals
- **Chemistry:** Balance between organic, inorganic, and physical
- **Mathematics:** Practice is key - solve daily

Would you like a detailed study timetable?`;
  }
  
  if (lowerQ.includes('compare') || lowerQ.includes('vs')) {
    return `Here's a comparison between Data Science and Software Engineering:

| Aspect | Data Science | Software Engineering |
|--------|--------------|---------------------|
| Focus | Data analysis & insights | Building applications |
| Skills | Statistics, ML, Python | Programming, system design |
| Math Required | High (statistics) | Moderate |
| Job Market | Growing rapidly | Always in demand |
| Salary | ₹8-40 LPA | ₹6-25 LPA |

**Choose Data Science if:** You love math, statistics, and finding patterns in data.

**Choose Software Engineering if:** You enjoy building products, solving logical problems, and creating applications.

Both are excellent choices with great career prospects!`;
  }
  
  if (lowerQ.includes('backup') || lowerQ.includes('alternative')) {
    return `Smart thinking about backup options! Here are alternatives for common career paths:

**Medicine:**
- Pharmacist
- Medical Lab Technician
- Healthcare Administrator
- Biomedical Engineer

**Engineering:**
- Data Analyst
- Technical Writer
- IT Support
- Project Manager

**Law:**
- Legal Advisor (corporate)
- Compliance Officer
- Paralegal
- Legal Writer

Having backup options is wise planning, not giving up. It shows maturity in your career planning!`;
  }
  
  if (lowerQ.includes('time management')) {
    return `Here are proven time management strategies:

**1. The Pomodoro Technique:**
- Study for 25 minutes
- Take 5-minute breaks
- After 4 sessions, take a longer break

**2. Priority Matrix:**
- Urgent + Important: Do first
- Important but not urgent: Schedule
- Urgent but not important: Delegate
- Neither: Eliminate

**3. Daily Planning:**
- Plan your day the night before
- Set 3 main goals for each day
- Review progress weekly

**Pro tip:** Start with your most difficult task when your energy is highest!`;
  }
  
  return `Thanks for your question! Let me help you with that.

Based on your query, here are some key points to consider:

1. **Research thoroughly:** Understand all aspects of your question
2. **Take action:** Small consistent steps lead to big results
3. **Stay focused:** Keep your goals in mind

Would you like me to explain anything specific in more detail? Feel free to ask follow-up questions!`;
};

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
    setInput('');
    setIsTyping(true);

    // Simulate AI thinking
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: getAIResponse(input),
        timestamp: new Date(),
      };
      addChatMessage(aiResponse);
      setIsTyping(false);
    }, 1500);
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
