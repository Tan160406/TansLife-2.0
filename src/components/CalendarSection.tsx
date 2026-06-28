import React, { useState } from 'react';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Trash, 
  Info, 
  Layers, 
  Clock, 
  Sparkles, 
  BookOpenCheck,
  Award,
  BookOpen,
  Edit2,
  Trash2,
  Check
} from 'lucide-react';
import { CalendarDayMark, CalendarStatusType, CalendarViewType, DailyTimelineTask, LifeOSData } from '../types';
import { ThemeConfig } from '../themes'; 

interface CalendarProps {
  data: LifeOSData;
  onUpdateCalendarMarks: (newMarks: CalendarDayMark[]) => void;
  onUpdateTimeline: (newTasks: DailyTimelineTask[]) => void;
  theme: ThemeConfig;
  triggerXp: (amount: number, toastName: string) => void;
}

export const STATUS_PRESETS: Record<CalendarStatusType, { label: string; color: string; icon: string }> = {
  free: { label: 'Free Day', color: 'bg-emerald-500 text-emerald-950', icon: '🟢' },
  busy: { label: 'Busy', color: 'bg-red-500 text-red-950', icon: '🔴' },
  assignment: { label: 'Assignment Due', color: 'bg-purple-500 text-purple-950', icon: '🟣' },
  exam: { label: 'Exam Day', color: 'bg-amber-500 text-amber-950', icon: '🟡' },
  appointment: { label: 'Appointment', color: 'bg-blue-500 text-blue-950', icon: '🔵' },
  holiday: { label: 'Holiday', color: 'bg-orange-400 text-orange-950', icon: '🟠' },
  family: { label: 'Family Event', color: 'bg-pink-400 text-pink-950', icon: '🌸' },
  travel: { label: 'Travel Day', color: 'bg-sky-400 text-sky-950', icon: '✈️' },
  study: { label: 'Study Day', color: 'bg-lime-400 text-lime-950', icon: '📚' },
  project: { label: 'Project Deadline', color: 'bg-teal-400 text-teal-950', icon: '⚡' },
  personal: { label: 'Personal Day', color: 'bg-fuchsia-400 text-fuchsia-950', icon: '💖' },
};

export const CalendarSection: React.FC<CalendarProps> = ({
  data,
  onUpdateCalendarMarks,
  onUpdateTimeline,
  theme,
  triggerXp
}) => {
  const [currentView, setCurrentView] = useState<CalendarViewType>('monthly');
  const [selectedDateStr, setSelectedDateStr] = useState<string>(new Date().toISOString().split('T')[0]);
  const [activeDate, setActiveDate] = useState<Date>(new Date());
  
  // Status edit values
  const [customNote, setCustomNote] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<CalendarStatusType>('study');
  
  // Custom manual classes status preset registry
  const [customPresets, setCustomPresets] = useState<Record<string, { label: string; color: string; icon: string }>>({});
  const [newLabel, setNewLabel] = useState('');
  const [newIcon, setNewIcon] = useState('🏷️');
  const [highlightCoordinator, setHighlightCoordinator] = useState(false);

  // Hourly Micro Planner edit states
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [addingHourSlot, setAddingHourSlot] = useState<number | null>(null);
  const [newSlotTitle, setNewSlotTitle] = useState('');
  const [newSlotCategory, setNewSlotCategory] = useState('Study');

  const allPresets: Record<string, { label: string; color: string; icon: string }> = {
    ...STATUS_PRESETS,
    ...customPresets
  };

  const handleAddCustomStatus = () => {
    if (!newLabel.trim()) return;
    const key = `custom-${newLabel.toLowerCase().trim().replace(/[^a-z0-0a-z]/g, '-')}`;
    const colors = [
      'bg-teal-500 text-teal-950',
      'bg-indigo-400 text-indigo-950',
      'bg-pink-400 text-pink-950',
      'bg-sky-400 text-sky-950',
      'bg-lime-400 text-lime-950',
      'bg-fuchsia-400 text-fuchsia-950'
    ];
    const color = colors[newLabel.length % colors.length];
    
    setCustomPresets(prev => ({
      ...prev,
      [key]: {
        label: newLabel.trim(),
        color,
        icon: newIcon
      }
    }));
    
    setSelectedStatus(key as any);
    setNewLabel('');
    triggerXp(0, `Manual Status Group Created: ${newLabel.trim()}! 🏷️`);
  };

  // Month navigation helpers
  const handlePrevMonth = () => {
    setActiveDate(new Date(activeDate.getFullYear(), activeDate.getMonth() - 1, 1));
  };
  
  const handleNextMonth = () => {
    setActiveDate(new Date(activeDate.getFullYear(), activeDate.getMonth() + 1, 1));
  };

  // Helper logs search
  const getMarkForDate = (dateStr: string): CalendarDayMark | undefined => {
    return data.calendarMarks.find(mark => mark.date === dateStr);
  };

  // Apply marked schedule status
  const handleSaveStatus = (statusToApply?: CalendarStatusType) => {
    const finalStatus = statusToApply || selectedStatus;
    const existingIndex = data.calendarMarks.findIndex(m => m.date === selectedDateStr);
    
    let updated = [...data.calendarMarks];
    if (existingIndex > -1) {
      updated[existingIndex] = {
        date: selectedDateStr,
        status: finalStatus,
        note: customNote.trim() || undefined
      };
    } else {
      updated.push({
        date: selectedDateStr,
        status: finalStatus,
        note: customNote.trim() || undefined
      });
    }

    onUpdateCalendarMarks(updated);
    setCustomNote('');
    const matchedPreset = allPresets[finalStatus] || STATUS_PRESETS[finalStatus as CalendarStatusType];
    triggerXp(40, `Day Marked: ${matchedPreset ? matchedPreset.label : finalStatus}`);
  };

  // Clear marking
  const handleClearStatus = () => {
    const updated = data.calendarMarks.filter(m => m.date !== selectedDateStr);
    onUpdateCalendarMarks(updated);
    setCustomNote('');
  };

  // Build grid calendar counts
  const year = activeDate.getFullYear();
  const month = activeDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // Sunday starts at 0
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = activeDate.toLocaleString('default', { month: 'long' });

  const getWeeksArray = () => {
    const weeks: (string | null)[][] = [];
    let currentWeek: (string | null)[] = Array(7).fill(null);
    let dayOfWeek = firstDayOfMonth;

    for (let d = 1; d <= totalDaysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      currentWeek[dayOfWeek] = dateStr;
      
      if (dayOfWeek === 6 || d === totalDaysInMonth) {
        weeks.push(currentWeek);
        currentWeek = Array(7).fill(null);
        dayOfWeek = 0;
      } else {
        dayOfWeek++;
      }
    }
    return weeks;
  };

  const weeks = getWeeksArray();

  return (
    <div className="space-y-6">
      {/* Upper navigation and tabs bar */}
      <div className={`p-4 rounded-2xl ${theme.card} flex flex-col md:flex-row justify-between items-center gap-4`}>
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-indigo-400" />
          <h2 className="text-xl font-bold">Interactive Calendar Engine</h2>
        </div>
        
        {/* Toggleable view controllers */}
        <div className="flex flex-wrap gap-1 bg-black/20 p-1.5 rounded-xl">
          {(['monthly', 'weekly', 'daily', 'heatmap'] as CalendarViewType[]).map((v) => {
            const labels: Record<string, string> = {
              monthly: 'Month',
              weekly: 'Week',
              daily: 'Day',
              heatmap: 'Activity'
            };
            return (
              <button
                key={v}
                onClick={() => setCurrentView(v)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  currentView === v 
                    ? 'bg-white/10 text-white shadow-sm font-bold' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {labels[v] || v}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Display Grid Panel */}
        <div className={`${currentView === 'monthly' ? 'xl:col-span-2' : 'xl:col-span-3'} p-6 rounded-3xl ${theme.card} min-h-[480px] flex flex-col justify-between`}>
          
          {/* MONTHLY VIEW */}
          {currentView === 'monthly' && (
            <div className="w-full">
              <div className="flex justify-between items-center mb-6">
                <button 
                  onClick={handlePrevMonth}
                  className="p-2 hover:bg-white/5 rounded-xl transition"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h3 className="text-lg font-bold font-mono tracking-wide">
                  {monthName} {year}
                </h3>
                <button 
                  onClick={handleNextMonth}
                  className="p-2 hover:bg-white/5 rounded-xl transition"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Days label header */}
              <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-gray-400 mb-2 font-mono">
                <span>SUN</span>
                <span>MON</span>
                <span>TUE</span>
                <span>WED</span>
                <span>THU</span>
                <span>FRI</span>
                <span>SAT</span>
              </div>

              {/* Days display matrix */}
              <div className="space-y-2">
                {weeks.map((week, wid) => (
                  <div key={wid} className="grid grid-cols-7 gap-2">
                    {week.map((dateString, did) => {
                      if (!dateString) {
                        return <div key={did} className="aspect-video bg-black/5 rounded-xl" />;
                      }
                      
                      const dayNum = dateString.split('-')[2];
                      const isSelected = selectedDateStr === dateString;
                      const isToday = new Date().toISOString().split('T')[0] === dateString;
                      const dayMark = getMarkForDate(dateString);
                      const statusConfig = dayMark ? (allPresets[dayMark.status] || STATUS_PRESETS[dayMark.status as CalendarStatusType]) : null;

                      return (
                        <div
                          key={did}
                          role="button"
                          tabIndex={0}
                          onClick={() => {
                            setSelectedDateStr(dateString);
                            if (dayMark) {
                              setCustomNote(dayMark.note || '');
                              setSelectedStatus(dayMark.status);
                              setHighlightCoordinator(true);
                              setTimeout(() => setHighlightCoordinator(false), 800);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              setSelectedDateStr(dateString);
                              if (dayMark) {
                                setCustomNote(dayMark.note || '');
                                setSelectedStatus(dayMark.status);
                                setHighlightCoordinator(true);
                                setTimeout(() => setHighlightCoordinator(false), 800);
                              }
                            }
                          }}
                          className={`aspect-video rounded-xl p-2 relative flex flex-col justify-between text-left transition-all group border cursor-pointer select-none outline-none ${
                            isSelected 
                              ? 'border-indigo-500 bg-indigo-500/10 scale-102 ring-2 ring-indigo-500/20' 
                              : isToday 
                                ? 'border-pink-500/60 bg-pink-500/5' 
                                : 'border-white/5 hover:border-white/10 bg-black/10'
                          }`}
                        >
                          <div className="flex justify-between items-center w-full">
                            <span className={`text-xs font-mono font-bold ${isToday ? 'text-pink-400' : 'text-gray-400'}`}>
                              {parseInt(dayNum)}
                            </span>
                            {dayMark && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onUpdateCalendarMarks(data.calendarMarks.filter(m => m.date !== dateString));
                                  triggerXp(10, "Day status deleted 🗑️");
                                }}
                                className="text-[8px] opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 font-bold transition-opacity cursor-pointer bg-red-500/10 hover:bg-red-500/20 px-1 py-0.5 rounded border border-red-500/20"
                                title="Delete Day Status"
                              >
                                ❌
                              </button>
                            )}
                          </div>
                          
                          {/* Inner status representation */}
                          {statusConfig ? (
                            <div className="flex items-center gap-1">
                              <span className="text-xs">{statusConfig.icon}</span>
                              <span className="hidden md:inline text-[9px] uppercase font-mono tracking-tight truncate text-gray-300">
                                {statusConfig.label.slice(0, 8)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[9px] opacity-0 group-hover:opacity-100 text-gray-500 font-mono">
                              + MARK
                            </span>
                          )}

                          {dayMark?.note && (
                            <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400" title={dayMark.note} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* WEEKLY VIEW */}
          {currentView === 'weekly' && (
            <div className="space-y-4 w-full">
              <h3 className="text-lg font-bold font-mono border-b border-white/5 pb-2">Weekly Agenda View</h3>
              <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
                {Array.from({ length: 7 }).map((_, i) => {
                  const dayDate = new Date();
                  // Shift to show current week starting from today
                  dayDate.setDate(dayDate.getDate() + i);
                  const dateStr = dayDate.toISOString().split('T')[0];
                  const dayName = dayDate.toLocaleString('default', { weekday: 'short' });
                  const dayNum = dayDate.getDate();
                  const mark = getMarkForDate(dateStr);
                  const isSelected = selectedDateStr === dateStr;

                  return (
                    <div 
                      key={i} 
                      onClick={() => setSelectedDateStr(dateStr)}
                      className={`p-4 rounded-2xl flex flex-col justify-between min-h-[160px] cursor-pointer border ${
                        isSelected 
                          ? 'border-indigo-400 bg-indigo-500/10' 
                          : 'border-white/5 bg-black/10 hover:border-white/10'
                      }`}
                    >
                      <div>
                        <div className="text-xs text-indigo-400 font-mono font-bold uppercase">{dayName}</div>
                        <div className="text-2xl font-bold font-mono mt-1">{dayNum}</div>
                      </div>

                      {mark ? (
                        (() => {
                          const config = allPresets[mark.status] || STATUS_PRESETS[mark.status as CalendarStatusType] || { label: mark.status, color: 'bg-indigo-500 text-white', icon: '🔖' };
                          return (
                            <div className={`mt-4 p-2 rounded-xl text-xs font-medium space-y-1 ${config.color}`}>
                              <div className="font-bold flex items-center gap-1">
                                <span>{config.icon}</span>
                                <span>{config.label}</span>
                              </div>
                              {mark.note && <p className="text-[10px] italic opacity-85 truncate">{mark.note}</p>}
                            </div>
                          );
                        })()
                      ) : (
                        <div className="text-[10px] text-gray-500 font-mono mt-4 italic">+ Click to mark status</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* DAILY VIEW & TIMELINE WORKFLOW */}
          {currentView === 'daily' && (
            <div className="space-y-6 w-full">
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <h3 className="text-lg font-bold">Hourly Micro Planner</h3>
                <span className="text-xs font-mono bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full uppercase">
                  Selected: {selectedDateStr}
                </span>
              </div>
              <p className="text-xs text-gray-400 mb-2">Track academic review blocks, class timings, and leisure breaks mapped cleanly onto your timeline below:</p>
              
              {/* Daily status day edit box */}
              {(() => {
                const dayMark = getMarkForDate(selectedDateStr);
                const markConfig = dayMark ? (allPresets[dayMark.status] || STATUS_PRESETS[dayMark.status as CalendarStatusType]) : null;
                return dayMark && markConfig ? (
                  <div className="p-3 rounded-xl bg-black/25 border border-white/5 flex justify-between items-center text-xs my-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{markConfig.icon}</span>
                      <div>
                        <span className="font-bold text-gray-200 block">{markConfig.label}</span>
                        {dayMark.note && <span className="text-[10px] text-gray-400 font-mono italic mt-0.5 block">{dayMark.note}</span>}
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        onUpdateCalendarMarks(data.calendarMarks.filter(m => m.date !== selectedDateStr));
                        setCustomNote('');
                        triggerXp(10, "Day status deleted 🗑️");
                      }}
                      className="px-2 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 text-[10px] transition font-mono cursor-pointer"
                    >
                      ❌ Delete Day Status
                    </button>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-black/15 border border-dashed border-white/5 text-center text-gray-500 text-xs font-mono my-2">
                    ☁️ No general day status set. Use the coordinator sidebar to mark this day!
                  </div>
                );
              })()}
              
              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                {Array.from({ length: 9 }).map((_, idx) => {
                  const hour = 6 + idx * 2; // Span 6 AM to 10 PM
                  const formattedTime = `${String(hour).padStart(2, '0')}:00`;
                  const nextHourText = `${String(hour + 2).padStart(2, '0')}:00`;
                  
                  // Check tasks that overlap
                  const taskOverlap = data.timelineTasks.find(t => {
                    const tHour = parseInt(t.startTime.split(':')[0]);
                    return tHour >= hour && tHour < hour + 2;
                  });

                  return (
                    <div key={idx} className="flex gap-4 items-center bg-black/15 p-3 rounded-xl border border-white/5 hover:border-white/10">
                      <span className="w-16 text-center text-xs font-mono font-bold text-indigo-400">
                        {formattedTime}
                      </span>
                      <div className="flex-1 min-h-[44px] flex items-center p-2 rounded-xl bg-black/20 border border-dashed border-white/10">
                        {taskOverlap ? (
                          editingTaskId === taskOverlap.id ? (
                            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 w-full p-1 bg-black/30 rounded-lg">
                              <input 
                                type="text" 
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="flex-1 text-xs p-1.5 bg-black/40 border border-white/10 rounded-lg text-slate-200 outline-none focus:border-indigo-500"
                                placeholder="Edit title..."
                              />
                              <select
                                value={editCategory}
                                onChange={(e) => setEditCategory(e.target.value)}
                                className="text-xs p-1.5 bg-neutral-900 border border-white/10 rounded-lg text-slate-200 outline-none focus:border-indigo-500"
                              >
                                <option value="Study">Study</option>
                                <option value="Class">Class</option>
                                <option value="Revision">Revision</option>
                                <option value="Leisure">Leisure</option>
                                <option value="Routine">Routine</option>
                              </select>
                              <div className="flex justify-end gap-1.5 text-[10px] font-mono">
                                <button
                                  type="button"
                                  onClick={() => setEditingTaskId(null)}
                                  className="px-2 py-1 text-gray-400 hover:text-white"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (!editTitle.trim()) return;
                                    onUpdateTimeline(data.timelineTasks.map(t => 
                                      t.id === taskOverlap.id 
                                        ? { ...t, title: editTitle.trim(), category: editCategory } 
                                        : t
                                    ));
                                    setEditingTaskId(null);
                                    triggerXp(0, "Hourly block updated 📝");
                                  }}
                                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-bold"
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    onUpdateTimeline(data.timelineTasks.map(t => 
                                      t.id === taskOverlap.id 
                                        ? { ...t, completed: !t.completed } 
                                        : t
                                    ));
                                  }}
                                  className={`w-4 h-4 rounded border flex items-center justify-center transition cursor-pointer ${
                                    taskOverlap.completed 
                                      ? 'bg-emerald-500 border-emerald-500' 
                                      : 'border-white/20 hover:border-white/40'
                                  }`}
                                >
                                  {taskOverlap.completed && <Check className="w-2.5 h-2.5 text-black font-extrabold" />}
                                </button>
                                <span className={`text-xs font-medium ${taskOverlap.completed ? 'line-through text-gray-500' : 'text-slate-200'}`}>
                                  🚀 {taskOverlap.title}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] uppercase font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                                  {taskOverlap.category}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingTaskId(taskOverlap.id);
                                    setEditTitle(taskOverlap.title);
                                    setEditCategory(taskOverlap.category);
                                  }}
                                  className="p-1.5 hover:bg-white/5 rounded text-gray-400 hover:text-indigo-400 transition cursor-pointer"
                                  title="Edit Block"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    onUpdateTimeline(data.timelineTasks.filter(t => t.id !== taskOverlap.id));
                                    triggerXp(0, "Hourly block deleted 🗑️");
                                  }}
                                  className="p-1.5 hover:bg-white/5 rounded text-gray-400 hover:text-red-400 transition cursor-pointer"
                                  title="Delete Block"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          )
                        ) : (
                          addingHourSlot === hour ? (
                            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 w-full p-1 bg-black/30 rounded-lg">
                              <input 
                                type="text" 
                                value={newSlotTitle}
                                onChange={(e) => setNewSlotTitle(e.target.value)}
                                className="flex-1 text-xs p-1.5 bg-black/40 border border-white/10 rounded-lg text-slate-200 outline-none focus:border-indigo-500"
                                placeholder="Study, class, leisure title..."
                              />
                              <select
                                value={newSlotCategory}
                                onChange={(e) => setNewSlotCategory(e.target.value)}
                                className="text-xs p-1.5 bg-neutral-900 border border-white/10 rounded-lg text-slate-200 outline-none focus:border-indigo-500"
                              >
                                <option value="Study">Study</option>
                                <option value="Class">Class</option>
                                <option value="Revision">Revision</option>
                                <option value="Leisure">Leisure</option>
                                <option value="Routine">Routine</option>
                              </select>
                              <div className="flex justify-end gap-1.5 text-[10px] font-mono">
                                <button
                                  type="button"
                                  onClick={() => setAddingHourSlot(null)}
                                  className="px-2 py-1 text-gray-400 hover:text-white"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (!newSlotTitle.trim()) return;
                                    const newTask: DailyTimelineTask = {
                                      id: `task-${Date.now()}`,
                                      title: newSlotTitle.trim(),
                                      startTime: formattedTime,
                                      durationMinutes: 120,
                                      completed: false,
                                      category: newSlotCategory
                                    };
                                    onUpdateTimeline([...data.timelineTasks, newTask]);
                                    setNewSlotTitle('');
                                    setAddingHourSlot(null);
                                    triggerXp(0, "Hourly block registered 📋");
                                  }}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold"
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between w-full">
                              <span className="text-[10px] text-gray-500 italic font-mono flex-1">
                                No hourly block registered. Empty space for revision or meditation.
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setAddingHourSlot(hour);
                                  setNewSlotTitle('');
                                  setNewSlotCategory('Study');
                                }}
                                className="px-2 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 hover:text-indigo-200 border border-indigo-500/20 rounded-lg text-[10px] transition font-mono flex items-center gap-1 cursor-pointer"
                              >
                                <Plus className="w-3 h-3" /> Add Block
                              </button>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* YEARLY HEATMAP VIEW */}
          {currentView === 'heatmap' && (
            <div className="space-y-4 w-full">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold font-mono">Yearly Consistency Matrix</h3>
                <div className="flex gap-2 text-[10px]">
                  <span className="flex items-center gap-1 text-gray-400"><span>🟢</span> Free</span>
                  <span className="flex items-center gap-1 text-gray-400"><span>🔴</span> Busy</span>
                  <span className="flex items-center gap-1 text-gray-400"><span>📚</span> Study</span>
                  <span className="flex items-center gap-1 text-gray-400"><span>🟣</span> Event</span>
                </div>
              </div>
              <p className="text-xs text-gray-400">This matrix maps daily achievements, focus scores, and habit streaks across the school term in a GitHub style contribution board:</p>
              
              {/* Custom SVG mockup Heatmap Grid */}
              <div className="bg-black/20 p-4 rounded-2xl border border-white/5 overflow-x-auto">
                <div className="flex gap-1 min-w-[500px]">
                  {Array.from({ length: 48 }).map((_, colIdx) => (
                    <div key={colIdx} className="flex flex-col gap-1">
                      {Array.from({ length: 7 }).map((_, rowIdx) => {
                        // Create past dates
                        const diffDays = -(colIdx * 7 + rowIdx);
                        const heatDateStr = new Date(new Date().setDate(new Date().getDate() + diffDays)).toISOString().split('T')[0];
                        const mark = getMarkForDate(heatDateStr);
                        
                        let cellColor = 'bg-stone-850 hover:bg-stone-700'; // empty state
                        if (mark) {
                          if (mark.status === 'free') cellColor = 'bg-emerald-500';
                          else if (mark.status === 'study') cellColor = 'bg-lime-400';
                          else if (mark.status === 'exam') cellColor = 'bg-amber-500';
                          else if (mark.status === 'assignment' || mark.status === 'project') cellColor = 'bg-purple-500';
                          else cellColor = 'bg-blue-400';
                        }

                        return (
                          <div 
                            key={rowIdx}
                            className={`w-3.5 h-3.5 rounded-sm transition-all cursor-pointer ${cellColor}`}
                            title={`Date: ${heatDateStr} ${mark ? `• Status: ${mark.status}` : '• No logs'}`}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ACADEMIC SEMESTER VIEW */}
          {currentView === 'semester' && (
            <div className="space-y-4 w-full h-full justify-between">
              <div>
                <h3 className="text-lg font-bold">Fall Academic Semester Calendar</h3>
                <p className="text-xs text-gray-400 mt-1">Breakdown of midterms, lab sessions, and internal milestones registered across the 16-week semester schedule:</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-4">
                {[
                  { title: 'Week 1-4 (Intro)', progress: 100, label: 'Core Basics Complete', status: 'Completed' },
                  { title: 'Week 5-8 (Midterms)', progress: 80, label: 'Midterm Evaluations', status: 'Active' },
                  { title: 'Week 9-12 (Labs)', progress: 40, label: 'Lab submissions & drafts', status: 'Pending' },
                  { title: 'Week 13-16 (Finals)', progress: 0, label: 'Revision & syllabus final', status: 'Locked' },
                ].map((wk, wid) => (
                  <div key={wid} className="p-4 rounded-2xl bg-black/15 border border-white/5 space-y-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-bold">{wk.title}</span>
                    <h4 className="text-xs font-bold font-mono mt-1">{wk.label}</h4>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded font-mono font-bold">{wk.status}</span>
                      <span className="text-xs font-mono font-bold text-gray-300">{wk.progress}%</span>
                    </div>
                    <div className="w-full bg-black/30 h-1 rounded-full overflow-hidden">
                      <div className="bg-indigo-500 h-full" style={{ width: `${wk.progress}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Stats Panel */}
          <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-3 gap-2 text-center">
            <div className="bg-black/15 p-2 rounded-xl">
              <p className="text-[9px] uppercase font-mono text-gray-400">Total Marks</p>
              <p className="text-sm font-bold font-mono text-indigo-400">{data.calendarMarks.length} Days</p>
            </div>
            <div className="bg-black/15 p-2 rounded-xl">
              <p className="text-[9px] uppercase font-mono text-gray-400">Study Days</p>
              <p className="text-sm font-bold font-mono text-lime-400">
                {data.calendarMarks.filter(m => m.status === 'study').length} Days
              </p>
            </div>
            <div className="bg-black/15 p-2 rounded-xl">
              <p className="text-[9px] uppercase font-mono text-gray-400">Exam Blockers</p>
              <p className="text-sm font-bold font-mono text-amber-400">
                {data.calendarMarks.filter(m => m.status === 'exam' || m.status === 'assignment').length} Days
              </p>
            </div>
          </div>

        </div>

        {/* Sidebar Planner Actions Panel */}
        {currentView === 'monthly' && (
          <div className={`p-5 rounded-3xl ${theme.card} flex flex-col justify-between border transition-all duration-500 ${
            highlightCoordinator 
              ? 'border-indigo-400 ring-4 ring-indigo-500/20 scale-[1.02]' 
              : 'border-white/5'
          }`}>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <h3 className="font-bold text-xs uppercase font-mono tracking-wider">Status Coordinator</h3>
                <span className="text-[10px] font-mono bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/20 font-bold">
                  {selectedDateStr}
                </span>
              </div>

              {/* Custom Notes Input */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-gray-400">Marking Notes / Reminders</label>
                <textarea
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder="E.g. Study Quantum Physics unit 3, team meetup at library..."
                  className="w-full text-xs p-2 bg-black/25 border border-white/10 rounded-lg focus:outline-none focus:border-indigo-500 h-10 resize-none text-slate-150 scrollbar-none"
                />
              </div>

              {/* Target Status Presets select version (Request 4 & 6) */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase text-gray-400 block pb-0.5">Select Status Group</label>
                <div className="grid grid-cols-3 gap-1 max-h-[140px] overflow-y-auto p-1.5 bg-black/25 border border-white/5 rounded-xl scrollbar-thin">
                  {Object.keys(allPresets).map((statusKey) => {
                    const item = allPresets[statusKey];
                    const isSelected = selectedStatus === statusKey;
                    return (
                      <button
                        type="button"
                        key={statusKey}
                        onClick={() => {
                          setSelectedStatus(statusKey as any);
                          triggerXp(10, `Status: ${item.label}`);
                        }}
                        title={item.label}
                        className={`p-1 rounded-lg border flex flex-col items-center justify-center gap-0.5 text-center transition cursor-pointer select-none ${
                          isSelected 
                            ? 'border-indigo-400 bg-indigo-500/10 scale-102 font-bold shadow shadow-indigo-500/15' 
                            : 'border-white/5 bg-black/10 hover:border-white/10'
                        }`}
                      >
                        <span className="text-sm">{item.icon}</span>
                        <span className="text-[8.5px] tracking-tight truncate w-full text-slate-300 font-mono font-medium">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Manual Status Registry Form (Request 5) */}
              <div className="p-2.5 bg-black/15 rounded-xl border border-dashed border-white/5 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] uppercase font-mono text-pink-300 font-bold">Add Manual Status Group</span>
                </div>
                <div className="flex gap-1.5 items-center">
                  <input
                    type="text"
                    maxLength={4}
                    placeholder="Emoji"
                    value={newIcon}
                    onChange={(e) => setNewIcon(e.target.value)}
                    className="w-12 text-center px-1.5 py-1.5 bg-black/35 border border-white/10 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-indigo-400"
                    title="Choose any emoji from your keyboard"
                  />
                  <input
                    type="text"
                    placeholder="Label (e.g. Gym)"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    className="flex-1 px-2 py-1.5 bg-black/35 border border-white/10 rounded-lg text-slate-200 text-[9.5px] focus:outline-none focus:border-indigo-400"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomStatus}
                    className="px-2 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-mono font-bold transition cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-1.5 pt-4">
              <button
                onClick={() => handleSaveStatus()}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white py-2.5 rounded-xl text-center text-xs font-bold font-mono shadow-md transition-transform hover:scale-[1.01] flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Save Day Marker
              </button>
              
              {getMarkForDate(selectedDateStr) && (
                <button
                  onClick={handleClearStatus}
                  className="w-full bg-red-950/40 hover:bg-red-900/40 border border-red-500/10 text-red-300 py-1.5 rounded-xl text-center text-xs font-mono transition"
                >
                  Clear Day Status
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
