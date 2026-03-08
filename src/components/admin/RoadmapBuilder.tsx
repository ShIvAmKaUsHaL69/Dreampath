'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/components/ui/Toaster';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  useSortable, verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Plus, Trash2, GripVertical, ArrowLeft, ChevronDown, ChevronRight,
  Loader2, Award, CheckCircle, FileQuestion,
} from 'lucide-react';

const TASK_CATEGORIES = ['study', 'skill', 'research', 'self-improvement'];
const PRIORITIES = ['low', 'medium', 'high'];

interface RoadmapItem {
  id: number; type: 'task' | 'milestone'; title: string; description: string;
  category: string; priority: string; passing_score: number; sort_order: number;
  questionCount: number; days_offset: number;
}

interface QuizQuestion {
  id: number; question: string; options: string[]; correct_index: number;
}

/* ── Sortable Row Component ──────── */
function SortableItem({
  item, onDelete, onExpand, expanded,
}: {
  item: RoadmapItem; onDelete: (id: number) => void;
  onExpand: (id: number) => void; expanded: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style = {
    transform: CSS.Transform.toString(transform), transition,
    zIndex: isDragging ? 50 : undefined, opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={`flex items-center gap-3 rounded-lg border p-3 bg-card ${isDragging ? 'shadow-lg' : ''}`}>
      <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
        <GripVertical className="h-4 w-4" />
      </button>
      <Badge variant={item.type === 'milestone' ? 'default' : 'secondary'} className="shrink-0 capitalize">
        {item.type === 'milestone' ? <><Award className="h-3 w-3 mr-1" /> Milestone</> : 'Task'}
      </Badge>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{item.title}</p>
        {item.description && <p className="text-xs text-muted-foreground truncate">{item.description}</p>}
      </div>
      {item.type === 'task' && (
        <div className="flex gap-1 shrink-0">
          <Badge variant="outline" className="capitalize text-xs">{item.category}</Badge>
          <Badge variant="outline" className="capitalize text-xs">{item.priority}</Badge>
          {item.days_offset > 0 && <Badge variant="outline" className="text-xs">{item.days_offset}d</Badge>}
        </div>
      )}
      {item.type === 'milestone' && (
        <Badge variant="outline" className="shrink-0 text-xs">
          <FileQuestion className="h-3 w-3 mr-1" /> {item.questionCount} Q{item.questionCount !== 1 ? 's' : ''} | Pass: {item.passing_score}%
        </Badge>
      )}
      {item.type === 'milestone' && (
        <Button variant="ghost" size="icon" onClick={() => onExpand(item.id)} className="shrink-0 cursor-pointer" title="Quiz Editor">
          {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      )}
      <Button variant="ghost" size="icon" onClick={() => onDelete(item.id)} className="shrink-0 cursor-pointer">
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );
}

/* ── Main Component ──────── */
export function RoadmapBuilder({ careerId, careerTitle, onBack }: {
  careerId: number; careerTitle: string; onBack: () => void;
}) {
  const { apiFetch } = useApp();
  const { showToast } = useToast();

  const [items, setItems] = useState<RoadmapItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedMilestone, setExpandedMilestone] = useState<number | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);

  // Add item form
  const [addType, setAddType] = useState<'task' | 'milestone'>('task');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('study');
  const [priority, setPriority] = useState('medium');
  const [passingScore, setPassingScore] = useState('50');
  const [daysOffset, setDaysOffset] = useState('7');

  // Add question form
  const [qText, setQText] = useState('');
  const [qOptions, setQOptions] = useState(['', '', '', '']);
  const [qCorrect, setQCorrect] = useState(0);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  /* ── Fetchers ──────── */
  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/admin/careers/${careerId}/roadmap-items`);
      if (res.ok) setItems((await res.json()).items);
    } finally { setLoading(false); }
  }, [apiFetch, careerId]);

  const fetchQuestions = async (itemId: number) => {
    const res = await apiFetch(`/api/admin/careers/${careerId}/roadmap-items/${itemId}/questions`);
    if (res.ok) setQuestions((await res.json()).questions);
  };

  useEffect(() => { fetchItems(); }, [fetchItems]);

  /* ── Drag & Drop ──────── */
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex(i => i.id === active.id);
    const newIndex = items.findIndex(i => i.id === over.id);
    const newItems = arrayMove(items, oldIndex, newIndex);
    setItems(newItems);

    // Persist new order
    await apiFetch(`/api/admin/careers/${careerId}/roadmap-items`, {
      method: 'PUT', body: JSON.stringify({ orderedIds: newItems.map(i => i.id) }),
    });
  };

  /* ── Add Item ──────── */
  const addItem = async () => {
    if (!title) return;
    const res = await apiFetch(`/api/admin/careers/${careerId}/roadmap-items`, {
      method: 'POST',
      body: JSON.stringify({ type: addType, title, description, category, priority, passingScore: parseInt(passingScore) || 50, daysOffset: parseInt(daysOffset) || 0 }),
    });
    if (res.ok) {
      showToast(`${addType === 'milestone' ? 'Milestone' : 'Task'} added`, 'success');
      setTitle(''); setDescription(''); setDaysOffset('7');
      fetchItems();
    }
  };

  const deleteItem = async (id: number) => {
    if (!confirm('Delete this item?')) return;
    await apiFetch(`/api/admin/careers/${careerId}/roadmap-items`, {
      method: 'DELETE', body: JSON.stringify({ itemId: id }),
    });
    showToast('Item deleted', 'success');
    if (expandedMilestone === id) setExpandedMilestone(null);
    fetchItems();
  };

  const toggleExpand = (id: number) => {
    if (expandedMilestone === id) { setExpandedMilestone(null); return; }
    setExpandedMilestone(id);
    fetchQuestions(id);
  };

  /* ── Quiz Questions ──────── */
  const addQuestion = async () => {
    if (!qText || !expandedMilestone || qOptions.filter(Boolean).length < 2) {
      showToast('Question and at least 2 options required', 'error'); return;
    }
    const res = await apiFetch(`/api/admin/careers/${careerId}/roadmap-items/${expandedMilestone}/questions`, {
      method: 'POST',
      body: JSON.stringify({ question: qText, options: qOptions.filter(Boolean), correctIndex: qCorrect }),
    });
    if (res.ok) {
      showToast('Question added', 'success');
      setQText(''); setQOptions(['', '', '', '']); setQCorrect(0);
      fetchQuestions(expandedMilestone);
      fetchItems(); // refresh question count
    }
  };

  const deleteQuestion = async (qId: number) => {
    if (!expandedMilestone) return;
    await apiFetch(`/api/admin/careers/${careerId}/roadmap-items/${expandedMilestone}/questions`, {
      method: 'DELETE', body: JSON.stringify({ questionId: qId }),
    });
    fetchQuestions(expandedMilestone);
    fetchItems();
  };

  /* ── Render ──────── */
  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2 cursor-pointer">
        <ArrowLeft className="h-4 w-4" /> Back to Careers
      </Button>
      <div>
        <h2 className="text-2xl font-bold">Roadmap Builder — {careerTitle}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Define tasks and milestones (with quizzes) for this career. Drag to reorder. Tasks after a milestone are locked until the user passes its quiz.
        </p>
      </div>

      {/* ── Add Item Form ──────── */}
      <Card className="border-primary/30">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm">Add Item</CardTitle>
            <div className="flex gap-1 ml-auto">
              <Button size="sm" variant={addType === 'task' ? 'default' : 'outline'} onClick={() => setAddType('task')} className="text-xs cursor-pointer h-7">Task</Button>
              <Button size="sm" variant={addType === 'milestone' ? 'default' : 'outline'} onClick={() => setAddType('milestone')} className="text-xs cursor-pointer h-7">Milestone</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label className="text-xs">Title *</Label><Input value={title} onChange={e => setTitle(e.target.value)} placeholder={addType === 'milestone' ? 'e.g., Fundamentals Checkpoint' : 'e.g., Research entrance exams'} /></div>
            <div className="space-y-1.5"><Label className="text-xs">Description</Label><Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional description" /></div>
          </div>
          {addType === 'task' ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Category</Label>
                <DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline" size="sm" className="w-full justify-between h-9 text-xs capitalize cursor-pointer">{category} <ChevronDown className="h-3 w-3" /></Button></DropdownMenuTrigger>
                <DropdownMenuContent>{TASK_CATEGORIES.map(c => <DropdownMenuItem key={c} onClick={() => setCategory(c)} className="capitalize cursor-pointer">{c}</DropdownMenuItem>)}</DropdownMenuContent></DropdownMenu>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Priority</Label>
                <DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline" size="sm" className="w-full justify-between h-9 text-xs capitalize cursor-pointer">{priority} <ChevronDown className="h-3 w-3" /></Button></DropdownMenuTrigger>
                <DropdownMenuContent>{PRIORITIES.map(p => <DropdownMenuItem key={p} onClick={() => setPriority(p)} className="capitalize cursor-pointer">{p}</DropdownMenuItem>)}</DropdownMenuContent></DropdownMenu>
              </div>
              <div className="space-y-1.5"><Label className="text-xs">Due in (days)</Label><Input type="number" min={1} max={365} value={daysOffset} onChange={e => setDaysOffset(e.target.value)} placeholder="e.g. 7" /></div>
              <div className="flex items-end"><Button onClick={addItem} disabled={!title} className="w-full cursor-pointer gap-2 h-9"><Plus className="h-4 w-4" /> Add Task</Button></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5"><Label className="text-xs">Passing Score (%)</Label><Input type="number" min={10} max={100} value={passingScore} onChange={e => setPassingScore(e.target.value)} /></div>
              <div className="col-span-2 flex items-end"><Button onClick={addItem} disabled={!title} className="cursor-pointer gap-2 h-9"><Plus className="h-4 w-4" /> Add Milestone</Button></div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Sortable Items ──────── */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : items.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No items yet. Add tasks and milestones above to define the career roadmap.</CardContent></Card>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {items.map(item => (
                <div key={item.id}>
                  <SortableItem item={item} onDelete={deleteItem} onExpand={toggleExpand} expanded={expandedMilestone === item.id} />

                  {/* Expanded Quiz Editor */}
                  {item.type === 'milestone' && expandedMilestone === item.id && (
                    <div className="ml-8 mt-2 mb-4 space-y-3">
                      <Card className="border-dashed">
                        <CardHeader className="pb-2 pt-3"><CardTitle className="text-sm flex items-center gap-2"><FileQuestion className="h-4 w-4" /> Quiz Questions — {item.title}</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                          {/* Existing questions */}
                          {questions.map((q, qi) => (
                            <div key={q.id} className="p-3 rounded-lg border bg-muted/30 space-y-2">
                              <div className="flex items-start justify-between">
                                <p className="font-medium text-sm">Q{qi + 1}: {q.question}</p>
                                <Button variant="ghost" size="icon" onClick={() => deleteQuestion(q.id)} className="shrink-0 cursor-pointer h-6 w-6"><Trash2 className="h-3 w-3 text-destructive" /></Button>
                              </div>
                              <div className="grid grid-cols-2 gap-1.5">
                                {q.options.map((opt: string, oi: number) => (
                                  <div key={oi} className={`text-xs px-2 py-1.5 rounded border ${oi === q.correct_index ? 'border-green-500 bg-green-50 dark:bg-green-900/20 font-medium' : 'border-muted'}`}>
                                    {String.fromCharCode(65 + oi)}. {opt} {oi === q.correct_index && <CheckCircle className="inline h-3 w-3 text-green-600 ml-1" />}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}

                          {/* Add question form */}
                          <div className="space-y-3 pt-2 border-t">
                            <p className="text-xs font-medium text-muted-foreground">Add Question</p>
                            <Textarea value={qText} onChange={e => setQText(e.target.value)} placeholder="Enter the question..." className="min-h-[50px] text-sm" />
                            <div className="grid grid-cols-2 gap-2">
                              {qOptions.map((opt, i) => (
                                <div key={i} className="flex items-center gap-2">
                                  <button
                                    onClick={() => setQCorrect(i)}
                                    className={`shrink-0 flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium cursor-pointer transition-colors ${
                                      qCorrect === i ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground hover:bg-muted-foreground/20'
                                    }`}
                                  >{String.fromCharCode(65 + i)}</button>
                                  <Input
                                    value={opt} onChange={e => { const n = [...qOptions]; n[i] = e.target.value; setQOptions(n); }}
                                    placeholder={`Option ${String.fromCharCode(65 + i)}`} className="h-8 text-xs"
                                  />
                                </div>
                              ))}
                            </div>
                            <p className="text-xs text-muted-foreground">Click A/B/C/D to set the correct answer (green = correct).</p>
                            <Button onClick={addQuestion} disabled={!qText || qOptions.filter(Boolean).length < 2} size="sm" className="cursor-pointer gap-2">
                              <Plus className="h-3 w-3" /> Add Question
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
