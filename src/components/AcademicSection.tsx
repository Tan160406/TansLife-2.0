import React, { useState } from 'react';
import { 
  BookOpen, 
  Plus, 
  Trash, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink,
  Edit,
  Sparkles,
  Award,
  BookOpenCheck,
  Calendar,
  Layers,
  ChevronDown,
  Clock,
  ThumbsDown,
  ThumbsUp
} from 'lucide-react';
import { Subject, Assignment, Exam, LifeOSData } from '../types';
import { ThemeConfig } from '../themes';

interface AcademicProps {
  data: LifeOSData;
  onUpdateSubjects: (newSubjects: Subject[]) => void;
  onUpdateAssignments: (newAssignments: Assignment[]) => void;
  onUpdateExams: (newExams: Exam[]) => void;
  theme: ThemeConfig;
  triggerXp: (amount: number, toastName: string) => void;
}

export const AcademicSection: React.FC<AcademicProps> = ({
  data,
  onUpdateSubjects,
  onUpdateAssignments,
  onUpdateExams,
  theme,
  triggerXp
}) => {
  // Modal / Form triggers
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [showAddAssignment, setShowAddAssignment] = useState(false);
  const [showAddExam, setShowAddExam] = useState(false);

  // Edit states
  const [editingAssignmentId, setEditingAssignmentId] = useState<string | null>(null);
  const [editingExamId, setEditingExamId] = useState<string | null>(null);

  // Edit Assignment forms state
  const [editAsgTitle, setEditAsgTitle] = useState('');
  const [editAsgPriority, setEditAsgPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [editAsgHours, setEditAsgHours] = useState(0);
  const [editAsgDeadline, setEditAsgDeadline] = useState('');
  const [editAsgSub, setEditAsgSub] = useState('');
  const [editAsgSubCustomVal, setEditAsgSubCustomVal] = useState('');

  // Edit Exam forms state
  const [editExamTitle, setEditExamTitle] = useState('');
  const [editExamDate, setEditExamDate] = useState('');
  const [editExamSyll, setEditExamSyll] = useState(0);
  const [editExamConf, setEditExamConf] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [editExamGrade, setEditExamGrade] = useState('');
  const [editExamSub, setEditExamSub] = useState('');
  const [editExamSubCustomVal, setEditExamSubCustomVal] = useState('');

  // Custom subject helpers
  const [newAsgSubCustomVal, setNewAsgSubCustomVal] = useState('');
  const [newExamSubCustomVal, setNewExamSubCustomVal] = useState('');

  // New Subject input
  const [newSubName, setNewSubName] = useState('');
  const [newSubColor, setNewSubColor] = useState('indigo');
  const [newSubAttP, setNewSubAttP] = useState(15);
  const [newSubAttT, setNewSubAttT] = useState(18);
  const [newSubSyll, setNewSubSyll] = useState(50);
  const [newSubNotes, setNewSubNotes] = useState('');

  // New Assignment Input
  const [newAsgTitle, setNewAsgTitle] = useState('');
  const [newAsgSub, setNewAsgSub] = useState('');
  const [newAsgPriority, setNewAsgPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [newAsgHours, setNewAsgHours] = useState(4);
  const [newAsgDeadline, setNewAsgDeadline] = useState('');

  // New Exam Input
  const [newExamTitle, setNewExamTitle] = useState('');
  const [newExamSub, setNewExamSub] = useState('');
  const [newExamDate, setNewExamDate] = useState('');
  const [newExamSyll, setNewExamSyll] = useState(20);
  const [newExamConf, setNewExamConf] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [newExamGrade, setNewExamGrade] = useState('A');

  // Submit and save helpers
  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName.trim()) return;

    const newSub: Subject = {
      id: `sub-${Date.now()}`,
      name: newSubName,
      color: newSubColor,
      attendancePresent: Number(newSubAttP),
      attendanceTotal: Number(newSubAttT),
      internalMarks: 0,
      internalTotal: 0,
      syllabusProgress: Number(newSubSyll),
      notesLink: newSubNotes.trim() || undefined
    };

    onUpdateSubjects([...data.subjects, newSub]);
    setNewSubName('');
    setNewSubNotes('');
    setShowAddSubject(false);
    triggerXp(120, `Created New Subject: ${newSub.name}`);
  };

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAsgTitle.trim() || !newAsgSub) return;

    const finalSubject = newAsgSub === 'custom' ? newAsgSubCustomVal.trim() : newAsgSub;
    if (!finalSubject) return;

    const newAsg: Assignment = {
      id: `asg-${Date.now()}`,
      title: newAsgTitle,
      subjectId: finalSubject,
      priority: newAsgPriority,
      deadline: newAsgDeadline || new Date().toISOString().split('T')[0],
      estimatedHours: Number(newAsgHours),
      status: 'Not Started',
      progress: 0
    };

    onUpdateAssignments([...data.assignments, newAsg]);
    setNewAsgTitle('');
    setNewAsgDeadline('');
    setNewAsgHours(4);
    setNewAsgSub('');
    setNewAsgSubCustomVal('');
    setShowAddAssignment(false);
    triggerXp(80, `Assignment Added: ${newAsg.title}`);
  };

  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExamTitle.trim() || !newExamSub) return;

    const finalSubject = newExamSub === 'custom' ? newExamSubCustomVal.trim() : newExamSub;
    if (!finalSubject) return;

    const newExam: Exam = {
      id: `ex-${Date.now()}`,
      title: newExamTitle,
      subjectId: finalSubject,
      date: newExamDate || `${new Date().toISOString().split('T')[0]}T10:00`,
      syllabusCoverage: Number(newExamSyll),
      revisionStatus: 'Not Started',
      confidence: newExamConf,
      expectedGrade: newExamGrade
    };

    onUpdateExams([...data.exams, newExam]);
    setNewExamTitle('');
    setNewExamDate('');
    setNewExamSub('');
    setNewExamSubCustomVal('');
    setShowAddExam(false);
    triggerXp(100, `Exam Tracked: ${newExam.title}`);
  };

  // Start edit logic helpers
  const handleStartEditAssignment = (asg: Assignment) => {
    setEditingAssignmentId(asg.id);
    setEditAsgTitle(asg.title);
    setEditAsgPriority(asg.priority);
    setEditAsgHours(asg.estimatedHours);
    setEditAsgDeadline(asg.deadline);
    const subExists = data.subjects.some(s => s.id === asg.subjectId);
    if (subExists) {
      setEditAsgSub(asg.subjectId);
      setEditAsgSubCustomVal('');
    } else {
      setEditAsgSub('custom');
      setEditAsgSubCustomVal(asg.subjectId);
    }
  };

  const handleSaveEditAssignment = (id: string) => {
    const finalSubject = editAsgSub === 'custom' ? editAsgSubCustomVal.trim() : editAsgSub;
    if (!finalSubject) return;

    const updated = data.assignments.map(a => {
      if (a.id === id) {
        return {
          ...a,
          title: editAsgTitle,
          priority: editAsgPriority,
          estimatedHours: Number(editAsgHours),
          deadline: editAsgDeadline,
          subjectId: finalSubject
        };
      }
      return a;
    });
    onUpdateAssignments(updated);
    setEditingAssignmentId(null);
    triggerXp(40, "Assignment Updated!");
  };

  const handleDeleteAssignment = (id: string) => {
    onUpdateAssignments(data.assignments.filter(a => a.id !== id));
    triggerXp(10, "Assignment Deleted");
  };

  const handleStartEditExam = (ex: Exam) => {
    setEditingExamId(ex.id);
    setEditExamTitle(ex.title);
    setEditExamDate(ex.date);
    setEditExamSyll(ex.syllabusCoverage);
    setEditExamConf(ex.confidence);
    setEditExamGrade(ex.expectedGrade);
    const subExists = data.subjects.some(s => s.id === ex.subjectId);
    if (subExists) {
      setEditExamSub(ex.subjectId);
      setEditExamSubCustomVal('');
    } else {
      setEditExamSub('custom');
      setEditExamSubCustomVal(ex.subjectId);
    }
  };

  const handleSaveEditExam = (id: string) => {
    const finalSubject = editExamSub === 'custom' ? editExamSubCustomVal.trim() : editExamSub;
    if (!finalSubject) return;

    const updated = data.exams.map(e => {
      if (e.id === id) {
        return {
          ...e,
          title: editExamTitle,
          date: editExamDate,
          syllabusCoverage: Number(editExamSyll),
          confidence: editExamConf,
          expectedGrade: editExamGrade,
          subjectId: finalSubject
        };
      }
      return e;
    });
    onUpdateExams(updated);
    setEditingExamId(null);
    triggerXp(50, "Exam Updated!");
  };

  const handleDeleteExam = (id: string) => {
    onUpdateExams(data.exams.filter(e => e.id !== id));
    triggerXp(10, "Exam Deleted");
  };

  // Toggle statuses
  const toggleAssignmentStatus = (id: string) => {
    const adjusted = data.assignments.map(asg => {
      if (asg.id === id) {
        let nextStatus: 'Not Started' | 'In Progress' | 'Submitted' | 'Overdue' = 'In Progress';
        let progress = 35;
        if (asg.status === 'Not Started') {
          nextStatus = 'In Progress';
          progress = 40;
        } else if (asg.status === 'In Progress') {
          nextStatus = 'Submitted';
          progress = 100;
          triggerXp(150, "Assignment Completed!");
        } else {
          nextStatus = 'Not Started';
          progress = 0;
        }
        return { ...asg, status: nextStatus, progress };
      }
      return asg;
    });
    onUpdateAssignments(adjusted);
  };

  const handleModifyAttendance = (subId: string, presentChange: number, totalChange: number) => {
    const updated = data.subjects.map(s => {
      if (s.id === subId) {
        return {
          ...s,
          attendancePresent: Math.max(0, s.attendancePresent + presentChange),
          attendanceTotal: Math.max(0, s.attendanceTotal + totalChange)
        };
      }
      return s;
    });
    onUpdateSubjects(updated);
    triggerXp(20, "Attendance updated!");
  };

  const handleModifySyllabus = (subId: string, progressChange: number) => {
    const updated = data.subjects.map(s => {
      if (s.id === subId) {
        return {
          ...s,
          syllabusProgress: Math.min(100, Math.max(0, s.syllabusProgress + progressChange))
        };
      }
      return s;
    });
    onUpdateSubjects(updated);
    triggerXp(20, "Syllabus coverage updated!");
  };

  const deleteSubject = (id: string) => {
    onUpdateSubjects(data.subjects.filter(s => s.id !== id));
    // clean orphaned assignments and exams
    onUpdateAssignments(data.assignments.filter(a => a.subjectId !== id));
    onUpdateExams(data.exams.filter(e => e.subjectId !== id));
  };

  // Helper date calculations
  const getExamCountdown = (dateString: string): string => {
    const examDate = new Date(dateString);
    const today = new Date("2026-06-16T22:10:40-07:00"); // Standard mock absolute baseline time!
    const diffTime = examDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "Completed";
    if (diffDays === 0) return "EXAM TODAY ⚠️";
    if (diffDays === 1) return "Exam tomorrow 🚨";
    return `Exam in ${diffDays} days`;
  };

  return (
    <div className="space-y-6">
      {/* 1. SUBJECT MANAGER SECTION */}
      <div className={`p-6 rounded-3xl ${theme.card} space-y-4`}>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-white/5 pb-4">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              Academic Classes & Classes Manager
            </h2>
            <p className="text-xs text-gray-400 mt-1">Add class sheets, notes repositories, current internals, and automatic class attendance counters:</p>
          </div>
          <button 
            type="button"
            onClick={() => setShowAddSubject(!showAddSubject)}
            className="self-start sm:self-center bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-2xl flex items-center gap-2 text-xs font-mono font-bold font-semibold transition"
          >
            <Plus className="w-4 h-4" />
            Add New Subject
          </button>
        </div>

        {/* Add Subject Collateral Form */}
        {showAddSubject && (
          <form onSubmit={handleCreateSubject} className="bg-black/20 p-4 rounded-2xl border border-white/5 space-y-3 antialiased">
            <h3 className="text-xs uppercase font-mono text-gray-300 font-bold">New Subject Registration</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input
                type="text"
                value={newSubName}
                onChange={(e) => setNewSubName(e.target.value)}
                placeholder="E.g. Computer Graphics (CS-405)"
                required
                className="p-2.5 bg-black/30 border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              />
              <select
                value={newSubColor}
                onChange={(e) => setNewSubColor(e.target.value)}
                className="p-2.5 bg-black/30 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="indigo">💜 Indigo Lavender</option>
                <option value="pink">🌸 Pink Blossom</option>
                <option value="cyan">🐳 Ocean Abyssal</option>
                <option value="emerald">🌿 Mystic Forest</option>
                <option value="amber">🔥 Golden Sun</option>
                <option value="rose">🌹 Crimson Rose</option>
                <option value="violet">🧬 Cosmic Violet</option>
                <option value="teal">🌊 Mystic Teal</option>
                <option value="orange">🍊 Sunset Amber</option>
                <option value="slate">🪨 Slate Charcoal</option>
              </select>
              <div className="flex flex-col gap-1 w-full">
                <div className="flex gap-2">
                  <div className="w-1/2">
                    <span className="text-[9px] font-mono text-indigo-300 uppercase block mb-0.5">Lectures Attended:</span>
                    <input
                      type="number"
                      value={newSubAttP}
                      onChange={(e) => setNewSubAttP(Number(e.target.value))}
                      placeholder="e.g. 15"
                      required
                      className="w-full p-2.5 bg-black/30 border border-white/10 rounded-xl text-xs text-white"
                    />
                  </div>
                  <div className="w-1/2">
                    <span className="text-[9px] font-mono text-indigo-300 uppercase block mb-0.5">Total Lectures:</span>
                    <input
                      type="number"
                      value={newSubAttT}
                      onChange={(e) => setNewSubAttT(Number(e.target.value))}
                      placeholder="e.g. 20"
                      required
                      className="w-full p-2.5 bg-black/30 border border-white/10 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>
              </div>
              <input
                type="text"
                value={newSubNotes}
                onChange={(e) => setNewSubNotes(e.target.value)}
                placeholder="Google Drive/Notion URL For Notes"
                className="p-2.5 bg-black/30 border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              />
            </div>


            <div className="flex gap-3 justify-end pt-2">
              <button 
                type="button" 
                onClick={() => setShowAddSubject(false)}
                className="text-xs text-gray-400 font-mono"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="bg-indigo-600 hover:bg-slate-700 text-white px-4 py-1.5 rounded-xl text-xs font-mono font-bold"
              >
                Create Subject
              </button>
            </div>
          </form>
        )}

        {/* Dynamic Class Cards Carousel */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {data.subjects.map((sub) => {
            const attRate = sub.attendanceTotal > 0 
              ? Math.round((sub.attendancePresent / sub.attendanceTotal) * 100) 
              : 100;
            const isAttendanceShort = attRate < 75; // warn if attendance critical!

            // Color preset loaders
            const colorPresets: Record<string, string> = {
              indigo: 'border-indigo-500/20 bg-indigo-950/10 text-indigo-200',
              pink: 'border-pink-500/20 bg-pink-950/10 text-pink-200',
              cyan: 'border-cyan-500/20 bg-cyan-950/10 text-cyan-200',
              emerald: 'border-emerald-500/20 bg-emerald-950/10 text-emerald-200',
              amber: 'border-amber-500/20 bg-amber-950/10 text-amber-200',
              rose: 'border-rose-500/20 bg-rose-950/10 text-rose-200',
              violet: 'border-violet-500/20 bg-violet-950/10 text-violet-200',
              teal: 'border-teal-500/20 bg-teal-950/10 text-teal-200',
              orange: 'border-orange-500/20 bg-orange-950/10 text-orange-200',
              slate: 'border-slate-500/20 bg-slate-950/10 text-slate-200',
            };

            return (
              <div 
                key={sub.id} 
                className={`p-4 rounded-2xl border flex flex-col justify-between min-h-[190px] transition-all hover:scale-[1.01] ${
                  colorPresets[sub.color] || colorPresets['indigo']
                }`}
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-1">
                    <h3 className="font-bold text-xs tracking-tight truncate flex-1 uppercase font-mono">{sub.name}</h3>
                    <button
                      type="button"
                      onClick={() => deleteSubject(sub.id)}
                      className="p-1 hover:bg-white/10 text-gray-400 hover:text-red-450 rounded-lg transition cursor-pointer"
                      title="Delete Subject"
                    >
                      <Trash className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Attendance display and modifier (Request 6) */}
                  <div className="space-y-1.5 p-2 bg-black/20 rounded-xl border border-white/5">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-gray-400 font-mono text-[9px]">ATTENDANCE:</span>
                      <span className={`font-mono font-bold ${isAttendanceShort ? 'text-red-400' : 'text-gray-200'}`}>
                        {sub.attendancePresent}/{sub.attendanceTotal} ({attRate}%)
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1 text-[9px] font-mono">
                      <button
                        type="button"
                        onClick={() => handleModifyAttendance(sub.id, 1, 1)}
                        className="py-1 px-1.5 bg-green-500/10 hover:bg-green-500/20 border border-green-500/25 text-green-300 rounded text-center transition cursor-pointer"
                      >
                        ✅ Attended
                      </button>
                      <button
                        type="button"
                        onClick={() => handleModifyAttendance(sub.id, 0, 1)}
                        className="py-1 px-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 text-red-300 rounded text-center transition cursor-pointer"
                      >
                        ❌ Missed
                      </button>
                    </div>
                  </div>

                  {sub.notesLink && (
                    <a
                      href={sub.notesLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[9px] font-mono text-indigo-400 hover:underline"
                    >
                      <ExternalLink className="w-2.5 h-2.5" />
                      <span>Workspace notes link</span>
                    </a>
                  )}
                </div>

                {/* Syllabus Coverage & Prep controls (Request 6) */}
                <div className="space-y-1.5 pt-2 border-t border-white/5">
                  <div className="flex justify-between items-center text-[10px] text-gray-400">
                    <span className="uppercase font-mono text-[8.5px]">SYLLABUS PREP:</span>
                    <div className="flex items-center gap-1 font-mono">
                      <button
                        type="button"
                        onClick={() => handleModifySyllabus(sub.id, -5)}
                        className="w-4 h-4 rounded bg-black/30 hover:bg-black/50 text-gray-300 font-bold flex items-center justify-center text-[10px] cursor-pointer"
                        title="Reduce Syllabus coverage -5%"
                      >
                        -
                      </button>
                      <span className="font-bold text-gray-300 w-8 text-center">{sub.syllabusProgress}%</span>
                      <button
                        type="button"
                        onClick={() => handleModifySyllabus(sub.id, 5)}
                        className="w-4 h-4 rounded bg-black/30 hover:bg-black/50 text-gray-300 font-bold flex items-center justify-center text-[10px] cursor-pointer"
                        title="Increase Syllabus coverage +5%"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="w-full bg-black/45 h-1 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${isAttendanceShort ? 'bg-amber-400' : 'bg-indigo-400'}`}
                      style={{ width: `${sub.syllabusProgress}%` }}
                    />
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* 2. ASSIGNMENT TRACKER HUB */}
        <div className={`p-6 rounded-3xl ${theme.card} space-y-4`}>
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <div>
              <h2 className="text-md font-bold flex items-center gap-2">
                <BookOpenCheck className="w-4 h-4 text-pink-400" />
                Active Homework & Assignments Tracker
              </h2>
              <span className="text-[10px] text-gray-400">Track and manage your upcoming course deadlines!</span>
            </div>
            <button 
              onClick={() => setShowAddAssignment(!showAddAssignment)}
              className="bg-pink-600 hover:bg-pink-500 text-white px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition"
            >
              + Add
            </button>
          </div>

          {showAddAssignment && (
            <form onSubmit={handleCreateAssignment} className="bg-black/25 p-3.5 rounded-2xl border border-white/5 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                <div>
                  <span className="text-[9px] font-mono text-pink-300 uppercase block mb-0.5">Assignment/Homework Title:</span>
                  <input
                    type="text"
                    value={newAsgTitle}
                    onChange={(e) => setNewAsgTitle(e.target.value)}
                    placeholder="e.g. Lab report 4 draft, Calculus set 2..."
                    required
                    className="w-full p-2 bg-black/30 border border-white/10 rounded-lg text-xs placeholder-gray-500 text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div>
                  <span className="text-[9px] font-mono text-pink-300 uppercase block mb-0.5">Class Group:</span>
                  <select
                    value={newAsgSub}
                    onChange={(e) => setNewAsgSub(e.target.value)}
                    required
                    className="w-full p-2 bg-black/30 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-pink-500"
                  >
                    <option value="">Select Class Group...</option>
                    {data.subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                    <option value="custom">✍️ Type Custom Subject Name...</option>
                  </select>
                </div>

                {newAsgSub === 'custom' && (
                  <div className="md:col-span-2">
                    <span className="text-[9px] font-mono text-pink-300 uppercase block mb-0.5">Custom Subject / Class Name:</span>
                    <input
                      type="text"
                      value={newAsgSubCustomVal}
                      onChange={(e) => setNewAsgSubCustomVal(e.target.value)}
                      placeholder="Type custom subject name (e.g. Astrophysics II)..."
                      required
                      className="w-full p-2 bg-black/35 border border-pink-500/30 rounded-lg text-xs text-white focus:outline-none"
                    />
                  </div>
                )}

                <div>
                  <span className="text-[9px] font-mono text-pink-300 uppercase block mb-0.5">Priority Level:</span>
                  <select
                    value={newAsgPriority}
                    onChange={(e) => setNewAsgPriority(e.target.value as any)}
                    className="w-full p-2 bg-black/30 border border-white/10 rounded-lg text-xs text-white focus:outline-none"
                  >
                    <option value="Low">Low Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="High">High Priority</option>
                  </select>
                </div>

                <div className="flex gap-2 w-full">
                  <div className="w-1/3">
                    <span className="text-[9px] font-mono text-pink-300 uppercase block mb-0.5">Est. Hours:</span>
                    <input
                      type="number"
                      value={newAsgHours}
                      onChange={(e) => setNewAsgHours(Number(e.target.value))}
                      className="p-2 bg-black/30 border border-white/10 rounded-lg text-xs w-full text-white focus:outline-none"
                      placeholder="Hours"
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <span className="text-[9px] font-mono text-pink-300 uppercase block mb-0.5">Deadline/Due Date:</span>
                    <input
                      type="date"
                      value={newAsgDeadline}
                      onChange={(e) => setNewAsgDeadline(e.target.value)}
                      className="p-2 bg-black/30 border border-white/10 rounded-lg text-xs w-full text-white font-mono focus:outline-none"
                      required
                    />
                  </div>
                </div>
              </div>



              <div className="flex justify-end gap-2 pt-1.5 font-mono">
                <button 
                  type="button" 
                  onClick={() => setShowAddAssignment(false)} 
                  className="px-3 py-1.5 text-xs text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-pink-600 hover:bg-pink-500 px-4 py-1.5 rounded-xl text-xs text-white font-bold"
                >
                  Save Assignment
                </button>
              </div>
            </form>
          )}

          {/* List items assignments */}
          <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
            {data.assignments.map((asg) => {
              const connectedSub = data.subjects.find(s => s.id === asg.subjectId);
              
              const priorityBadges: Record<string, string> = {
                Low: 'border-green-500/30 text-green-400 bg-green-500/5',
                Medium: 'border-yellow-400/30 text-yellow-400 bg-yellow-400/5',
                High: 'border-red-500/30 text-red-500 bg-red-500/5',
              };

              const isCompleted = asg.status === 'Submitted';

              // INLINE COMPACT EDIT FORM
              if (editingAssignmentId === asg.id) {
                return (
                  <div key={asg.id} className="p-3.5 rounded-2xl border border-indigo-500/40 bg-indigo-950/20 space-y-3">
                    <div className="flex justify-between items-center pb-1 border-b border-indigo-500/10">
                      <span className="text-[9px] uppercase font-mono text-indigo-300 font-bold">Edit Assignment</span>
                      <button 
                        type="button"
                        onClick={() => setEditingAssignmentId(null)} 
                        className="text-[9px] font-mono text-gray-400 hover:text-white"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="space-y-0.5">
                        <label className="text-[9px] font-mono text-gray-400 uppercase">Title</label>
                        <input
                          type="text"
                          value={editAsgTitle}
                          onChange={(e) => setEditAsgTitle(e.target.value)}
                          className="w-full p-2 bg-black/45 border border-white/5 rounded-lg text-white"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-0.5">
                          <label className="text-[9px] font-mono text-gray-400 uppercase">Class Group</label>
                          <select
                            value={editAsgSub}
                            onChange={(e) => setEditAsgSub(e.target.value)}
                            className="w-full p-2 bg-black/45 border border-white/5 rounded-lg text-white"
                          >
                            <option value="">Select Subject...</option>
                            {data.subjects.map(s => (
                              <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                            <option value="custom">✍️ Type Custom Subject Name...</option>
                          </select>
                        </div>

                        <div className="space-y-0.5">
                          <label className="text-[9px] font-mono text-gray-400 uppercase">Priority</label>
                          <select
                            value={editAsgPriority}
                            onChange={(e) => setEditAsgPriority(e.target.value as any)}
                            className="w-full p-2 bg-black/45 border border-white/5 rounded-lg text-white"
                          >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                          </select>
                        </div>
                      </div>

                      {editAsgSub === 'custom' && (
                        <div className="space-y-0.5">
                          <label className="text-[9px] font-mono text-gray-400 uppercase">Custom Subject / Class Name</label>
                          <input
                            type="text"
                            value={editAsgSubCustomVal}
                            onChange={(e) => setEditAsgSubCustomVal(e.target.value)}
                            className="w-full p-2 bg-black/45 border border-indigo-500/20 rounded-lg text-white"
                            required
                          />
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-0.5">
                          <label className="text-[9px] font-mono text-gray-400 uppercase">Est. Hours</label>
                          <input
                            type="number"
                            value={editAsgHours}
                            onChange={(e) => setEditAsgHours(Number(e.target.value))}
                            className="w-full p-2 bg-black/45 border border-white/5 rounded-lg text-white"
                            required
                          />
                        </div>

                        <div className="space-y-0.5">
                          <label className="text-[9px] font-mono text-gray-400 uppercase">Deadline</label>
                          <input
                            type="date"
                            value={editAsgDeadline}
                            onChange={(e) => setEditAsgDeadline(e.target.value)}
                            className="w-full p-2 bg-black/45 border border-white/5 rounded-lg text-white font-mono"
                            required
                          />
                        </div>
                      </div>

                      {editAsgHours > 0 && (
                        <div className="p-2 bg-indigo-500/10 border border-indigo-500/15 rounded-xl text-[10px] text-indigo-300 font-mono text-center">
                          ⏱️ New Estimate Load: <span className="font-bold">{editAsgHours} Hours</span> (~{editAsgHours * 60} mins)
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => handleSaveEditAssignment(asg.id)}
                        className="w-full mt-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold font-mono text-xs py-2 rounded-lg"
                      >
                        Save Adjustments
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div 
                  key={asg.id} 
                  className={`p-3.5 rounded-2xl border ${
                    isCompleted ? 'border-indigo-900/10 bg-indigo-950/5 opacity-60' : 'border-white/5 bg-black/10'
                  } flex flex-col md:flex-row justify-between items-start md:items-center gap-2`}
                >
                  <div className="space-y-1 flex-1 min-w-0">
                    <h3 className={`text-xs font-bold leading-tight truncate ${isCompleted ? 'line-through text-gray-500 font-mono' : 'text-gray-100'}`}>
                      {asg.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 text-[10px] text-gray-400 font-mono">
                      <span className="text-indigo-400">Subject: {connectedSub ? connectedSub.name.split(' (')[0] : asg.subjectId}</span>
                      <span>• Hours: {asg.estimatedHours}h</span>
                      <span>• Due: {asg.deadline}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center">
                    <span className={`text-[9px] uppercase font-mono px-2 py-0.5 border rounded-full font-bold ${priorityBadges[asg.priority]}`}>
                      {asg.priority}
                    </span>
                    <button 
                      onClick={() => toggleAssignmentStatus(asg.id)}
                      className={`text-[10px] font-mono px-2.5 py-1 rounded-lg ${
                        isCompleted 
                          ? 'bg-green-950 text-green-400 border border-green-500/10 font-bold' 
                          : 'bg-indigo-600 text-white hover:bg-indigo-500'
                      }`}
                    >
                      {isCompleted ? '✓ Done' : 'Mark Done'}
                    </button>

                    <button
                      onClick={() => handleStartEditAssignment(asg)}
                      className="p-1.5 text-gray-400 hover:text-indigo-400 transition"
                      title="Edit Assignment"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteAssignment(asg.id)}
                      className="p-1.5 text-gray-400 hover:text-red-400 transition"
                      title="Delete Assignment"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. EXAM READY COUNTER & SCHEDULER */}
        <div className={`p-6 rounded-3xl ${theme.card} space-y-4`}>
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <div>
              <h2 className="text-md font-bold flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-400" />
                Midterm & Semester Exam Planner
              </h2>
              <p className="text-[10px] text-gray-400">Track syllabus preparation levels and upcoming exam alerts:</p>
            </div>
            <button 
              onClick={() => setShowAddExam(!showAddExam)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition"
            >
              + Add Exam
            </button>
          </div>

          {showAddExam && (
            <form onSubmit={handleCreateExam} className="bg-black/25 p-3.5 rounded-2xl border border-white/5 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                <div>
                  <span className="text-[9px] font-mono uppercase block mb-0.5 font-bold text-indigo-300">Exam/Syllabus Title:</span>
                  <input
                    type="text"
                    value={newExamTitle}
                    onChange={(e) => setNewExamTitle(e.target.value)}
                    placeholder="e.g. Midterm Physics, Finals Calculus II..."
                    required
                    className="w-full p-2 bg-black/30 border border-white/10 rounded-lg text-xs placeholder-gray-500 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <span className="text-[9px] font-mono uppercase block mb-0.5 font-bold text-indigo-300">Class Subject:</span>
                  <select
                    value={newExamSub}
                    onChange={(e) => setNewExamSub(e.target.value)}
                    required
                    className="w-full p-2 bg-black/30 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">Linked Class Subject...</option>
                    {data.subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                    <option value="custom">✍️ Type Custom Subject Name...</option>
                  </select>
                </div>

                {newExamSub === 'custom' && (
                  <div className="md:col-span-2">
                    <span className="text-[9px] font-mono uppercase block mb-0.5 font-bold text-indigo-300">Custom Subject / Class Name:</span>
                    <input
                      type="text"
                      value={newExamSubCustomVal}
                      onChange={(e) => setNewExamSubCustomVal(e.target.value)}
                      placeholder="Type custom subject name (e.g. Mechanical Engineering III)..."
                      required
                      className="w-full p-2 bg-black/35 border border-indigo-500/30 rounded-lg text-xs text-white focus:outline-none"
                    />
                  </div>
                )}

                <div className="flex gap-2 w-full md:col-span-2">
                  <div className="flex-1">
                    <span className="text-[9px] font-mono text-indigo-300 uppercase block mb-0.5">Exam Date & Time:</span>
                    <input
                      type="datetime-local"
                      value={newExamDate}
                      onChange={(e) => setNewExamDate(e.target.value)}
                      className="p-2.5 bg-black/30 border border-white/10 rounded-lg text-xs w-full text-white font-mono focus:outline-none"
                      required
                    />
                  </div>
                  <div className="w-1/3">
                    <span className="text-[9px] font-mono text-indigo-300 uppercase block mb-0.5 font-bold">Syllabus Prep %:</span>
                    <input
                      type="number"
                      value={newExamSyll}
                      min="0"
                      max="100"
                      onChange={(e) => setNewExamSyll(Number(e.target.value))}
                      placeholder="e.g. 50"
                      className="p-2.5 bg-black/30 border border-white/10 rounded-lg text-xs w-full text-white focus:outline-none"
                      required
                    />
                  </div>
                </div>



                <div className="flex gap-2 w-full">
                  <div className="w-1/2">
                    <span className="text-[9px] font-mono text-indigo-400 uppercase block mb-0.5">Confidence Level:</span>
                    <select
                      value={newExamConf}
                      onChange={(e) => setNewExamConf(e.target.value as any)}
                      className="p-2.5 bg-black/30 border border-white/10 rounded-lg text-xs w-full text-white focus:outline-none"
                    >
                      <option value="Low">Low Confidence</option>
                      <option value="Medium">Medium Confidence</option>
                      <option value="High">High Confidence</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <span className="text-[9px] font-mono text-indigo-400 uppercase block mb-0.5">Target/Expected Grade:</span>
                    <input
                      type="text"
                      value={newExamGrade}
                      onChange={(e) => setNewExamGrade(e.target.value)}
                      placeholder="e.g. A+"
                      className="p-2.5 bg-black/30 border border-white/10 rounded-lg text-xs w-full text-white focus:outline-none"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1 font-mono">
                <button 
                  type="button" 
                  onClick={() => setShowAddExam(false)} 
                  className="px-3 py-1.5 text-xs text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-indigo-600 hover:bg-indigo-500 px-4 py-1.5 rounded-xl text-xs text-white font-bold"
                >
                  Register Exam
                </button>
              </div>
            </form>
          )}

          {/* Exams Countdown panels list */}
          <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
            {data.exams.map((ex) => {
              const connectedSub = data.subjects.find(s => s.id === ex.subjectId);
              const countdownText = getExamCountdown(ex.date);
              
              // Confidence highlights
              const confColors = {
                Low: 'text-red-400 bg-red-500/10 border-red-500/20',
                Medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
                High: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
              };

              // INLINE COMPACT EDIT FORM FOR EXAMS
              if (editingExamId === ex.id) {
                return (
                  <div key={ex.id} className="p-3.5 rounded-2xl border border-indigo-500/40 bg-indigo-950/20 space-y-3 font-sans">
                    <div className="flex justify-between items-center pb-1 border-b border-indigo-500/10">
                      <span className="text-[9px] uppercase font-mono text-indigo-300 font-bold">Edit Exam Target</span>
                      <button 
                        type="button"
                        onClick={() => setEditingExamId(null)} 
                        className="text-[9px] font-mono text-gray-400 hover:text-white"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="space-y-0.5">
                        <label className="text-[9px] font-mono text-gray-400 uppercase">Exam Title</label>
                        <input
                          type="text"
                          value={editExamTitle}
                          onChange={(e) => setEditExamTitle(e.target.value)}
                          className="w-full p-2 bg-black/45 border border-white/5 rounded-lg text-white"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-0.5">
                          <label className="text-[9px] font-mono text-gray-400 uppercase">Class Subject</label>
                          <select
                            value={editExamSub}
                            onChange={(e) => setEditExamSub(e.target.value)}
                            className="w-full p-2 bg-black/45 border border-white/5 rounded-lg text-white"
                          >
                            <option value="">Select Subject...</option>
                            {data.subjects.map(s => (
                              <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                            <option value="custom">✍️ Type Custom Subject Name...</option>
                          </select>
                        </div>

                        <div className="space-y-0.5">
                          <label className="text-[9px] font-mono text-gray-400 uppercase">Confidence</label>
                          <select
                            value={editExamConf}
                            onChange={(e) => setEditExamConf(e.target.value as any)}
                            className="w-full p-2 bg-black/45 border border-white/5 rounded-lg text-white"
                          >
                            <option value="Low font-sans">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                          </select>
                        </div>
                      </div>

                      {editExamSub === 'custom' && (
                        <div className="space-y-0.5">
                          <label className="text-[9px] font-mono text-gray-400 uppercase">Custom Subject / Class Name</label>
                          <input
                            type="text"
                            value={editExamSubCustomVal}
                            onChange={(e) => setEditExamSubCustomVal(e.target.value)}
                            className="w-full p-2 bg-black/45 border border-indigo-500/20 rounded-lg text-white font-semibold"
                            required
                          />
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2 font-sans">
                        <div className="space-y-0.5">
                          <label className="text-[9px] font-mono text-gray-400 uppercase">Syllabus Prep %</label>
                          <input
                            type="number"
                            value={editExamSyll}
                            min="0"
                            max="100"
                            onChange={(e) => setEditExamSyll(Number(e.target.value))}
                            className="w-full p-2 bg-black/45 border border-white/5 rounded-lg text-white font-sans"
                            required
                          />
                        </div>

                        <div className="space-y-0.5">
                           <label className="text-[9px] font-mono text-gray-400 uppercase">Expected Grade</label>
                          <input
                            type="text"
                            value={editExamGrade}
                            onChange={(e) => setEditExamGrade(e.target.value)}
                            className="w-full p-2 bg-black/45 border border-white/5 rounded-lg text-white font-sans"
                            required
                          />
                        </div>
                      </div>

                      {editExamSyll >= 0 && (
                        <div className="p-2 bg-indigo-505/10 bg-indigo-500/10 border border-indigo-500/15 rounded-xl text-[10px] text-indigo-300 font-mono text-center">
                          📚 Syllabus coverage: <span className="font-bold">{editExamSyll}% Covered</span> ({editExamSyll >= 75 ? '🔥 READY' : '⚠️ REVISING'})
                        </div>
                      )}

                      <div className="space-y-0.5">
                        <label className="text-[9px] font-mono text-gray-400 uppercase">Exam Date & Time</label>
                        <input
                          type="datetime-local"
                          value={editExamDate}
                          onChange={(e) => setEditExamDate(e.target.value)}
                          className="w-full p-2 bg-black/45 border border-white/5 rounded-lg text-white font-sans font-mono"
                          required
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSaveEditExam(ex.id)}
                        className="w-full mt-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold font-mono text-xs py-2 rounded-lg"
                      >
                        Save Adjustments
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div key={ex.id} className="p-4 rounded-2xl bg-black/10 border border-white/5 space-y-3 relative group">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xs font-bold font-mono tracking-tight">{ex.title}</h3>
                      <div className="text-[10px] font-mono text-gray-400 mt-1 flex flex-col gap-0.5">
                        <span className="text-pink-400">Class Subject: {connectedSub ? connectedSub.name.split(' (')[0] : ex.subjectId}</span>
                        <span>Syllabus prep: {ex.syllabusCoverage}% complete</span>
                      </div>
                    </div>
                    
                    {/* Visual countdown box */}
                    <span className="text-[10px] font-semibold font-mono bg-pink-500/20 text-pink-300 border border-pink-500/20 px-2.5 py-1 rounded-xl">
                      ⏰ {countdownText}
                    </span>
                  </div>

                  <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full rounded-full transition-all" style={{ width: `${ex.syllabusCoverage}%` }} />
                  </div>

                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <div className="flex items-center gap-1">
                      <span className="text-gray-400">Prep level:</span>
                      <span className={`px-2 py-0.5 rounded border text-[9px] ${confColors[ex.confidence] || confColors.Medium}`}>
                        {ex.confidence} Confidence
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center gap-1 text-yellow-400 bg-black/10 px-2 py-0.5 rounded">
                        <Award className="w-3.5 h-3.5 text-yellow-500" />
                        <span>Expected: {ex.expectedGrade}</span>
                      </div>
                      
                      {/* Compact edit actions */}
                      <button
                        onClick={() => handleStartEditExam(ex)}
                        className="p-1 text-gray-400 hover:text-indigo-400 transition"
                        title="Edit Exam"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteExam(ex.id)}
                        className="p-1 text-gray-400 hover:text-red-400 transition"
                        title="Delete Exam"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
