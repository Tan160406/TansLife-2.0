import React, { useState, useEffect, useRef } from 'react';
import { 
  Clock, 
  Play, 
  Pause, 
  RotateCcw, 
  Plus, 
  Trash, 
  Check, 
  Sparkles, 
  Award,
  Zap,
  TrendingUp,
  Heart
} from 'lucide-react';
import { DailyTimelineTask, FocusSessionLog, Subject, LifeOSData } from '../types';
import { ThemeConfig } from '../themes';

interface ProductivityProps {
  data: LifeOSData;
  onUpdateTimeline: (newTimeline: DailyTimelineTask[]) => void;
  onUpdateFocusLogs: (newLogs: FocusSessionLog[]) => void;
  theme: ThemeConfig;
  triggerXp: (amount: number, toastName: string) => void;
}

export const ProductivitySection: React.FC<ProductivityProps> = ({
  data,
  onUpdateTimeline,
  onUpdateFocusLogs,
  theme,
  triggerXp
}) => {
  // Focus Session States
  const [timerMode, setTimerMode] = useState<'focus' | 'short-break' | 'long-break'>('focus');
  const [sessionStartMinutes, setSessionStartMinutes] = useState(60);
  const [minutes, setMinutes] = useState(60);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedSubFocus, setSelectedSubFocus] = useState('');
  const [sessionEvents, setSessionEvents] = useState<{ type: 'start' | 'pause' | 'resume' | 'end' | 'reset'; time: string }[]>([]);
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [actualStartTime, setActualStartTime] = useState<string>('');

  // Manual Past Focus Session states
  const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]);
  const [manualStartTime, setManualStartTime] = useState('10:00');
  const [manualDuration, setManualDuration] = useState(60);
  const [manualSubjectId, setManualSubjectId] = useState('');
  const [showManualForm, setShowManualForm] = useState(false);

  // Ledger Editing States
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editSessionDate, setEditSessionDate] = useState('');
  const [editSessionSubId, setEditSessionSubId] = useState('');
  const [editSessionStartTime, setEditSessionStartTime] = useState('');
  const [editSessionEndTime, setEditSessionEndTime] = useState('');
  const [editSessionDuration, setEditSessionDuration] = useState(30);
  
  // Custom Timer settings
  const [customFocusLen, setCustomFocusLen] = useState(45);
  
  // Clock ticker references
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Request Notification permission on mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Countdown timer clock loops
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            handleTimerComplete();
          } else {
            setMinutes(prev => prev - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(prev => prev - 1);
        }
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, minutes, seconds]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setSessionEvents(prev => [...prev, { type: 'end', time: nowStr }]);

    // Play synthesized complete beep
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.8);
    } catch (err) {
      console.log("Audio play blocked", err);
    }

    // Trigger browser notification
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification("⏱️ TansLife 2.0 Timer Complete!", {
          body: timerMode === 'focus' ? "Phenomenal focus session complete! Perfect study interval." : "Break duration complete. Ready for new focus?"
        });
      }
    }

    // Add to Focus Logs if focus session complete
    if (timerMode === 'focus') {
      const completionTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      const computedStart = actualStartTime || (() => {
        const d = new Date();
        const start = new Date(d.getTime() - sessionStartMinutes * 60000);
        return start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      })();
      const addedLog: FocusSessionLog = {
        id: `flog-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        durationMinutes: sessionStartMinutes,
        subjectId: selectedSubFocus || undefined,
        type: 'pomodoro',
        startTime: computedStart,
        endTime: completionTime
      };
      onUpdateFocusLogs([...data.focusLogs, addedLog]);
      triggerXp(0, `${sessionStartMinutes}-Min Deep Focus Completed & Saved!`);
    } else {
      triggerXp(0, "Mindful Break session completed.");
    }

    // Reset clock loop
    setMinutes(timerMode === 'focus' ? sessionStartMinutes : 15);
    setSeconds(0);
  };

  const calculateEndTime = (startHHMM: string, durationMin: number): string => {
    try {
      const [h, m] = startHHMM.split(':').map(Number);
      if (isNaN(h) || isNaN(m)) return '';
      const date = new Date();
      date.setHours(h, m, 0, 0);
      const end = new Date(date.getTime() + durationMin * 60 * 1000);
      return end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch (e) {
      return '';
    }
  };

  const handleSaveSessionEdit = (id: string) => {
    const updated = data.focusLogs.map(log => {
      if (log.id === id) {
        return {
          ...log,
          date: editSessionDate,
          subjectId: editSessionSubId || undefined,
          startTime: editSessionStartTime || undefined,
          endTime: editSessionEndTime || undefined,
          durationMinutes: Number(editSessionDuration)
        };
      }
      return log;
    });
    onUpdateFocusLogs(updated);
    setEditingSessionId(null);
    triggerXp(15, "Focus ledger log updated ✏️");
  };

  const handleAddManualSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualDuration <= 0) return;

    const computedEndTime = calculateEndTime(manualStartTime, manualDuration);

    const addedLog: FocusSessionLog = {
      id: `flog-${Date.now()}`,
      date: manualDate,
      durationMinutes: Number(manualDuration),
      subjectId: manualSubjectId || undefined,
      type: 'custom',
      startTime: manualStartTime,
      endTime: computedEndTime || undefined
    };

    onUpdateFocusLogs([...data.focusLogs, addedLog]);
    triggerXp(0, `${manualDuration}-Min Past Study Session Saved!`);
    
    // Reset manual form inputs
    setManualDuration(60);
    setManualSubjectId('');
    setShowManualForm(false);
  };

  const startTimer = () => {
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setIsRunning(true);
    const hasStarted = sessionEvents.some(e => e.type === 'start');
    if (!hasStarted) {
      setSessionEvents([{ type: 'start', time: nowStr }]);
      setActualStartTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    } else {
      setSessionEvents(prev => [...prev, { type: 'resume', time: nowStr }]);
    }
  };

  const pauseTimer = () => {
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setIsRunning(false);
    setSessionEvents(prev => [...prev, { type: 'pause', time: nowStr }]);
  };

  const resetTimer = () => {
    setIsRunning(false);
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setSessionEvents(prev => [...prev, { type: 'reset', time: nowStr }]);
    if (timerMode === 'focus') {
      setMinutes(sessionStartMinutes);
    } else {
      setMinutes(15);
    }
    setSeconds(0);
  };

  const setTimerPreset = (type: '1h' | '2h' | '3h' | 'custom') => {
    setIsRunning(false);
    setSessionEvents([]);
    setTimerMode('focus');
    let mins = 60;
    if (type === '1h') {
      mins = 60;
    } else if (type === '2h') {
      mins = 120;
    } else if (type === '3h') {
      mins = 180;
    } else {
      mins = customFocusLen;
    }
    setSessionStartMinutes(mins);
    setMinutes(mins);
    setSeconds(0);
  };

  // Timeline scheduler states
  const [customTaskTitle, setCustomTaskTitle] = useState('');
  const [customTaskTime, setCustomTaskTime] = useState('09:00');
  const [customTaskCategory, setCustomTaskCategory] = useState<'academic' | 'focus' | 'habit' | 'personal' | 'leisure'>('academic');

  const handleAddTimelineTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTaskTitle.trim()) return;

    const newTask: DailyTimelineTask = {
      id: `task-${Date.now()}`,
      title: customTaskTitle,
      startTime: customTaskTime,
      durationMinutes: 60,
      completed: false,
      category: customTaskCategory
    };

    onUpdateTimeline([...data.timelineTasks, newTask]);
    setCustomTaskTitle('');
    triggerXp(30, "Day Schedule Block Programmed!");
  };

  const toggleTaskDone = (id: string) => {
    const adjusted = data.timelineTasks.map(t => {
      if (t.id === id) {
        const nextState = !t.completed;
        if (nextState) triggerXp(0, "Timeline Task Completed! 🎉");
        return { ...t, completed: nextState };
      }
      return t;
    });
    onUpdateTimeline(adjusted);
  };

  const deleteTimelineTask = (id: string) => {
    onUpdateTimeline(data.timelineTasks.filter(t => t.id !== id));
  };

  // Calculate stats hours
  const totalFocusMinutes = data.focusLogs.reduce((acc, log) => acc + log.durationMinutes, 0);
  const totalFocusHours = Math.round((totalFocusMinutes / 60) * 10) / 10;
  
  // Weekly and Monthly limits
  const weeklyFocusHours = Math.round((data.focusLogs.filter(l => {
    const logDate = new Date(l.date);
    const today = new Date();
    const oneWeekAgo = new Date(today.setDate(today.getDate() - 7));
    return logDate >= oneWeekAgo;
  }).reduce((acc, l) => acc + l.durationMinutes, 0) / 60) * 10) / 10;

  const totalSeconds = timerMode === 'focus' ? (sessionStartMinutes * 60) : (15 * 60);
  const currentSeconds = minutes * 60 + seconds;
  const progressPercent = totalSeconds > 0 ? (currentSeconds / totalSeconds) : 1;
  const circleRadius = 70;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference * (1 - progressPercent);
  const timerStarted = isRunning || (currentSeconds !== totalSeconds);

  return (
    <div className="w-full py-4 text-white space-y-6">
      
      {/* 1. INTERACTIVE POMODORO CLOCK ENGINE */}
      <div id="pomodoro-core-card" className={`w-full max-w-5xl mx-auto p-6 md:p-8 rounded-3xl ${theme.card} border border-white/5 shadow-2xl`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* Left Column: Clock Controls */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-4">
                <h3 className="font-bold flex items-center gap-2 text-sm uppercase font-mono tracking-wider">
                  <Clock className="w-4 h-4 text-pink-400 animate-pulse" />
                  Mindful Pomodoro Core
                </h3>
                <span className="text-[10px] uppercase font-mono px-3 py-1 bg-black/30 border border-white/5 rounded-full text-indigo-300 font-bold">
                  {timerMode === 'focus' ? '🎯 Focus Session' : '🧘 Break Level'}
                </span>
              </div>

              {/* Mode Switchers */}
              <div className="grid grid-cols-4 gap-1 p-1 bg-black/20 rounded-xl mb-4 font-mono text-[10px] font-bold">
                <button
                  onClick={() => { setTimerMode('focus'); setSessionStartMinutes(60); setMinutes(60); setSeconds(0); setIsRunning(false); }}
                  className={`py-1.5 rounded-lg transition-all ${timerMode === 'focus' && sessionStartMinutes === 60 ? 'bg-pink-600 shadow-md text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  1h Focus
                </button>
                <button
                  onClick={() => { setTimerMode('focus'); setSessionStartMinutes(120); setMinutes(120); setSeconds(0); setIsRunning(false); }}
                  className={`py-1.5 rounded-lg transition-all ${timerMode === 'focus' && sessionStartMinutes === 120 ? 'bg-pink-600 shadow-md text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  2h Focus
                </button>
                <button
                  onClick={() => { setTimerMode('focus'); setSessionStartMinutes(180); setMinutes(180); setSeconds(0); setIsRunning(false); }}
                  className={`py-1.5 rounded-lg transition-all ${timerMode === 'focus' && sessionStartMinutes === 180 ? 'bg-pink-600 shadow-md text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  3h Focus
                </button>
                <button
                  onClick={() => { setTimerMode('long-break'); setMinutes(15); setSeconds(0); setIsRunning(false); }}
                  className={`py-1.5 rounded-lg transition-all ${timerMode === 'long-break' ? 'bg-blue-600 shadow-md text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  15m Break
                </button>
              </div>

              {/* Large timer visual display */}
              <div className="text-center py-4 flex flex-col items-center justify-center bg-black/10 rounded-2xl border border-white/5 mb-4">
                {timerStarted ? (
                  <div className="relative w-36 h-36 flex items-center justify-center my-1">
                    {/* SVG Ring Background/Progress */}
                    <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                      <circle
                        cx="80"
                        cy="80"
                        r={circleRadius}
                        className="stroke-white/5"
                        strokeWidth="6"
                        fill="transparent"
                      />
                      <circle
                        cx="80"
                        cy="80"
                        r={circleRadius}
                        className="stroke-pink-500 transition-all duration-300 ease-out"
                        strokeWidth="6"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                      />
                    </svg>
                    
                    {/* Inner Clock text */}
                    <div className="text-center z-10 space-y-0.5">
                      <div className="text-3xl font-bold font-mono tracking-tight text-white">
                        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                      </div>
                      <p className="text-[9px] text-gray-400 font-mono uppercase tracking-wider">
                        {timerMode === 'focus' ? '🎯 Focus' : '🧘 Break'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="py-4">
                    <div className="text-6xl font-bold font-mono tracking-tight text-white drop-shadow-[0_4px_12px_rgba(255,255,255,0.05)]">
                      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                    </div>
                  </div>
                )}

                <p className="text-[10px] mt-2 font-mono text-gray-400">
                  {isRunning ? "🧠 Mind engaged. Avoid phone tabs & notifications..." : "Press Play to activate deep work state."}
                </p>
              </div>
            </div>

            <div className="w-full">
              {/* Linked Subject selection */}
              <div className="space-y-1 mb-3 text-left">
                <label className="text-[10px] uppercase font-mono text-gray-400">Class Focus Target:</label>
                <select
                  value={selectedSubFocus}
                  onChange={(e) => setSelectedSubFocus(e.target.value)}
                  className="w-full text-xs p-2.5 bg-black/30 border border-white/10 rounded-xl focus:outline-none focus:border-indigo-500 text-white cursor-pointer"
                >
                  <option value="">No subject link (General study)</option>
                  {data.subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name || s.id}</option>
                  ))}
                </select>
              </div>

              {/* Control Dials */}
              <div className="flex gap-2">
                {isRunning ? (
                  <button
                    type="button"
                    onClick={pauseTimer}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black py-2.5 rounded-xl font-bold font-mono text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <Pause className="w-4 h-4" /> Pause Session
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={startTimer}
                    className="flex-1 bg-gradient-to-r from-pink-500 to-indigo-600 hover:from-pink-400 hover:to-indigo-500 text-white py-2.5 rounded-xl font-bold font-mono text-xs flex items-center justify-center gap-1.5 transition shadow-lg"
                  >
                    <Play className="w-4 h-4 font-bold" /> Trigger Timer
                  </button>
                )}

                <button
                  type="button"
                  onClick={resetTimer}
                  title="Reset Timer"
                  className="px-4 bg-black/30 border border-white/10 rounded-xl hover:bg-black/45 transition"
                >
                  <RotateCcw className="w-4 h-4 text-gray-300" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Active Session Event Monitor */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
            <div className="flex flex-col justify-between h-full bg-black/25 border border-white/5 rounded-2xl p-4 md:p-6 space-y-4">
              <div>
                <div className="flex justify-between items-center text-gray-300 border-b border-white/15 pb-2 mb-2 font-mono text-xs font-bold">
                  <span className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-400 animate-pulse" />
                    ACTIVE SESSION EVENT MONITOR
                  </span>
                  {sessionEvents.length > 0 && (
                    <button 
                      type="button" 
                      onClick={() => setSessionEvents([])} 
                      className="text-[9px] text-pink-450 hover:underline hover:text-pink-300"
                    >
                      Clear Events
                    </button>
                  )}
                </div>
                
                {sessionEvents.length === 0 ? (
                  <div className="text-gray-500 text-center py-10 flex flex-col items-center justify-center italic text-xs font-mono space-y-2">
                    <span>No timer logs currently active in this session.</span>
                    <span className="text-[10px] text-gray-600">Start, pause, or complete timers to view dynamic events here.</span>
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1 font-mono text-[11px]">
                    {sessionEvents.map((event, idx) => {
                      const eventLabels = {
                        start: { label: '🚀 SESSION INITIALIZED', color: 'text-emerald-400 animate-pulse' },
                        pause: { label: '⏸️ SESSION PAUSED', color: 'text-amber-400' },
                        resume: { label: '▶️ SESSION RESUMED', color: 'text-cyan-400' },
                        reset: { label: '🔄 SESSION RESET', color: 'text-gray-400' },
                        end: { label: '🏆 SESSION COMPLETED', color: 'text-pink-400 font-bold' },
                      };
                      const meta = eventLabels[event.type] || { label: event.type.toUpperCase(), color: 'text-white' };
                      return (
                        <div key={idx} className="flex justify-between items-center border-b border-white/5 pb-1">
                          <span className={`${meta.color}`}>{meta.label}</span>
                          <span className="text-gray-400">{event.time}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              
              <div className="bg-black/30 p-3 rounded-xl border border-white/5 text-[10px] font-mono text-gray-400 leading-relaxed text-left">
                💡 <span className="text-indigo-300 font-bold">Focus Protocol:</span> All active runs completed through the timer are logged directly into your historical database trends listed below.
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 2. FOCUS DURATION TRENDS & HISTORICAL DATABASE */}
      <div id="focus-trends-card" className={`w-full max-w-5xl mx-auto p-6 md:p-8 rounded-3xl ${theme.card} border border-white/5 shadow-2xl space-y-6`}>
        
        {/* Header containing Filters */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/10 pb-4 gap-4">
          <div>
            <h3 className="text-md font-bold flex items-center gap-1.5 text-indigo-400">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              Focus Duration Trends & History
            </h3>
            <p className="text-[11px] text-gray-400 mt-1">
              Analyze complete historical focus sessions database, log past study sessions manually, and inspect trends.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowManualForm(!showManualForm)}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-mono transition flex items-center gap-1.5 font-bold"
            >
              <Plus className="w-4 h-4" />
              {showManualForm ? 'Hide Manual Form' : 'Log Past Session'}
            </button>
            
            <div className="flex items-center gap-1.5 bg-black/35 px-2.5 py-1 rounded-xl border border-white/5">
              <span className="text-[10px] font-mono text-gray-400">Filter Area:</span>
              <select
                value={subjectFilter}
                onChange={(e) => {
                  setSubjectFilter(e.target.value);
                  setSelectedSessionId(null);
                }}
                className="bg-transparent border-none text-[10px] text-pink-300 font-mono focus:outline-none cursor-pointer font-bold"
              >
                <option value="all">🌐 All Subjects</option>
                {data.subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name.slice(0, 20)}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Form to Log Past Session Manually (Collapsible) */}
        {showManualForm && (
          <form onSubmit={handleAddManualSession} className="bg-black/35 p-4 rounded-2xl border border-indigo-500/25 space-y-3 animate-fade-in text-left">
            <h4 className="text-xs font-bold font-mono text-pink-300 uppercase tracking-wider flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              Log a Past Focus Session Manually
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-mono uppercase text-gray-400">Session Date</label>
                <input
                  type="date"
                  value={manualDate}
                  onChange={(e) => setManualDate(e.target.value)}
                  required
                  className="w-full text-xs p-2 bg-black/45 border border-white/10 rounded-lg text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-mono uppercase text-gray-400">Start Time (24h)</label>
                <input
                  type="text"
                  value={manualStartTime}
                  onChange={(e) => setManualStartTime(e.target.value)}
                  placeholder="e.g. 14:30"
                  required
                  className="w-full text-xs p-2 bg-black/45 border border-white/10 rounded-lg text-white font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-mono uppercase text-gray-400">Duration (Minutes)</label>
                <input
                  type="number"
                  value={manualDuration}
                  onChange={(e) => setManualDuration(Math.max(1, Number(e.target.value)))}
                  required
                  className="w-full text-xs p-2 bg-black/45 border border-white/10 rounded-lg text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-mono uppercase text-gray-400">Category Subject Link</label>
                <select
                  value={manualSubjectId}
                  onChange={(e) => setManualSubjectId(e.target.value)}
                  className="w-full text-xs p-2 bg-black/45 border border-white/10 rounded-lg text-white cursor-pointer"
                >
                  <option value="">General Work / Study</option>
                  {data.subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex justify-between items-center pt-2">
              <span className="text-[10px] font-mono text-gray-400">
                Estimated End Time: <span className="text-emerald-400 font-bold">{calculateEndTime(manualStartTime, manualDuration) || '--:--'}</span>
              </span>
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white rounded-xl text-xs font-mono font-bold transition shadow-lg"
              >
                Save Focus Log Entry
              </button>
            </div>
          </form>
        )}

        {/* Bento Splitting: Trends Graph and Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Trends interactive scrollable graph (Left 7/12 cols) */}
          <div className="lg:col-span-7 bg-black/25 p-4 rounded-2xl border border-white/5 space-y-4 text-left flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase text-indigo-400 font-bold">SESSION DURATION HISTOGRAM (CHRONOLOGICAL)</span>
              <p className="text-[9px] text-gray-500 mt-0.5">Click any bar to inspect metadata or delete individual logging registers.</p>
              
              {/* Improved interactive scrollable graph */}
              <div className="bg-black/20 p-3.5 rounded-xl border border-white/5 mt-3">
                <div className="overflow-x-auto pb-2 scrollbar-thin">
                  {/* Min-width calculates dynamically so all sessions keep their proper size */}
                  <div 
                    className="h-28 flex items-end gap-2.5 px-1 pb-1"
                    style={{ minWidth: `${Math.max(280, data.focusLogs.filter(l => subjectFilter === 'all' || l.subjectId === subjectFilter).length * 48)}px` }}
                  >
                    {data.focusLogs.filter(l => subjectFilter === 'all' || l.subjectId === subjectFilter).length === 0 ? (
                      <div className="w-full text-center text-gray-500 text-[10px] font-mono py-10">
                        No deep focus runs found for this selection!
                      </div>
                    ) : (
                      data.focusLogs
                        .filter(l => subjectFilter === 'all' || l.subjectId === subjectFilter)
                        .map((log, idx) => {
                          const heightPercent = Math.min(100, Math.round((log.durationMinutes / 185) * 100));
                          const connectedSub = data.subjects.find(s => s.id === log.subjectId);
                          const isSelected = selectedSessionId === log.id;
                          return (
                            <button
                              key={log.id || idx}
                              type="button"
                              onClick={() => setSelectedSessionId(isSelected ? null : (log.id || `${idx}`))}
                              className="flex-1 min-w-[32px] flex flex-col items-center gap-1 group relative focus:outline-none transition-transform active:scale-95 cursor-pointer animate-fade-in"
                            >
                              {/* Visible duration badge directly above each bar */}
                              <span className={`text-[8.5px] font-mono font-bold transition ${isSelected ? 'text-pink-300 scale-110 font-black' : 'text-slate-300 group-hover:text-white'}`}>
                                {log.durationMinutes}m
                              </span>

                              {/* Hover tooltip */}
                              <div className="absolute bottom-full mb-1.5 hidden group-hover:flex flex-col bg-slate-950/95 backdrop-blur-md border border-slate-800 text-white text-[9px] rounded-lg p-2 shadow-2xl z-30 whitespace-nowrap pointer-events-none text-left">
                                <span className="font-mono text-[9.5px] text-pink-400 font-bold block">⏱️ {log.durationMinutes} mins</span>
                                <span className="text-[8px] text-gray-400 block mt-0.5">Logged: {log.date}</span>
                                <span className="text-[8px] text-cyan-300 block">Area: {connectedSub ? connectedSub.name : "General Workspace"}</span>
                                <span className="text-[8px] text-indigo-300 block">Interval: {log.startTime || '-'}-{log.endTime || '-'}</span>
                              </div>
                              
                              <div className={`w-full bg-black/45 h-14 rounded-lg overflow-hidden flex items-end border p-0.5 ${
                                isSelected ? 'border-pink-400 bg-pink-500/10' : 'border-white/5'
                              }`}>
                                <div 
                                  className={`w-full rounded-md transition-all ${
                                    isSelected 
                                      ? 'bg-gradient-to-t from-pink-500 to-indigo-400' 
                                      : 'bg-gradient-to-t from-indigo-500/80 to-pink-500/80 group-hover:from-indigo-400 group-hover:to-pink-400'
                                  }`}
                                  style={{ height: `${heightPercent || 20}%` }}
                                />
                              </div>
                              <span className={`text-[7px] font-mono ${isSelected ? 'text-pink-300 font-bold' : 'text-gray-500'}`}>
                                #{idx + 1}
                              </span>
                            </button>
                          );
                        })
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive selected session detail inspector */}
            {selectedSessionId && (() => {
              // Find log either by id or by hypothetical index string if id wasn't set
              const selectedLog = data.focusLogs.find(l => l.id === selectedSessionId) || 
                                  data.focusLogs[Number(selectedSessionId)];
              if (!selectedLog) return null;
              const connectedSub = data.subjects.find(s => s.id === selectedLog.subjectId);
              return (
                <div className="p-3 bg-black/35 border border-pink-500/15 rounded-xl space-y-2 text-[10px] font-mono transition-all animate-fade-in">
                  <div className="flex justify-between items-center text-pink-300">
                    <span className="font-bold">🔍 SELECTED SESSION DETAIL INSPECTOR</span>
                    <button
                      type="button"
                      onClick={() => {
                        onUpdateFocusLogs(data.focusLogs.filter(l => l.id !== selectedLog.id));
                        setSelectedSessionId(null);
                        triggerXp(0, "Focus log session deleted");
                      }}
                      className="text-red-400 hover:text-red-300 underline font-bold cursor-pointer"
                    >
                      Delete Log
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-gray-300">
                    <div><span className="text-gray-500">Duration:</span> {selectedLog.durationMinutes} Minutes</div>
                    <div><span className="text-gray-500">Date Logged:</span> {selectedLog.date}</div>
                    <div><span className="text-gray-500">Start Time:</span> {selectedLog.startTime || '-'}</div>
                    <div><span className="text-gray-500">End Time:</span> {selectedLog.endTime || '-'}</div>
                    <div className="col-span-2 text-cyan-300">
                      <span className="text-gray-500">Category Area:</span> {connectedSub ? connectedSub.name : "General Workspace Study / Pomodoro"}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Quick Metrics & Protocol Card (Right 5/12 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            <div className="bg-[#0e0e14] border border-white/5 p-4 rounded-2xl flex-1 flex flex-col justify-between text-left space-y-4">
              <div className="space-y-3">
                <span className="text-[10px] font-mono uppercase text-pink-400 font-bold">TOTAL PERFORMANCE METRICS</span>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                    <span className="text-[8px] font-mono text-gray-500 uppercase block">Weekly Volume</span>
                    <span className="text-lg font-bold font-mono text-white mt-1 block">{weeklyFocusHours} hrs</span>
                  </div>
                  <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                    <span className="text-[8px] font-mono text-gray-500 uppercase block">Lifetime Sum</span>
                    <span className="text-lg font-bold font-mono text-white mt-1 block">{totalFocusHours} hrs</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 text-[10px] font-mono text-gray-400 leading-relaxed bg-black/20 p-3.5 rounded-xl border border-white/5">
                <span className="text-indigo-300 font-bold block mb-1">⏱️ Pomodoro Formula:</span>
                Each block uses high-density study intervals paired with 15-minute relaxation periods to preserve peak neurological activity.
              </div>
            </div>
          </div>

        </div>

        {/* 3. DETAILED HISTORICAL DATABASE TABLE */}
        <div className="bg-black/20 p-4 md:p-6 rounded-2xl border border-white/5 space-y-3 text-left">
          <div className="flex justify-between items-center border-b border-white/10 pb-2.5">
            <h4 className="text-xs font-mono font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>📋 COMPLETE FOCUS SESSIONS LEDGER DATABASE</span>
            </h4>
            <span className="text-[10px] font-mono text-gray-400 bg-black/35 px-2.5 py-0.5 rounded-full border border-white/5 font-bold">
              Total Logged: {data.focusLogs.filter(l => subjectFilter === 'all' || l.subjectId === subjectFilter).length} Runs
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b border-white/15 text-pink-400 uppercase text-[9.5px] tracking-wider">
                  <th className="py-2.5 px-2">Date</th>
                  <th className="py-2.5 px-2">Subject Link / Area</th>
                  <th className="py-2.5 px-2">Start Time</th>
                  <th className="py-2.5 px-2">End Time</th>
                  <th className="py-2.5 px-2">Total Duration</th>
                  <th className="py-2.5 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-300">
                {data.focusLogs.filter(l => subjectFilter === 'all' || l.subjectId === subjectFilter).length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500 italic text-[10.5px]">No matching study sessions logged in historical registers.</td>
                  </tr>
                ) : (
                  [...data.focusLogs]
                    .filter(l => subjectFilter === 'all' || l.subjectId === subjectFilter)
                    .reverse() // latest logged sessions on top
                    .map((log) => {
                      const connectedSub = data.subjects.find(s => s.id === log.subjectId);
                      const isEditing = editingSessionId === log.id;
                      return (
                        <tr key={log.id} className="hover:bg-white/5 transition-colors">
                          {isEditing ? (
                            <>
                              <td className="py-2.5 px-2">
                                <input 
                                  type="date"
                                  value={editSessionDate}
                                  onChange={(e) => setEditSessionDate(e.target.value)}
                                  className="bg-black/35 border border-white/10 rounded px-1.5 py-1 text-xs text-white max-w-[125px] focus:outline-none focus:border-indigo-500"
                                />
                              </td>
                              <td className="py-2.5 px-2">
                                <select
                                  value={editSessionSubId}
                                  onChange={(e) => setEditSessionSubId(e.target.value)}
                                  className="bg-black/35 border border-white/10 rounded px-1.5 py-1 text-xs text-white focus:outline-none focus:border-indigo-500"
                                >
                                  <option value="">General Work & Study</option>
                                  {data.subjects.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                  ))}
                                </select>
                              </td>
                              <td className="py-2.5 px-2">
                                <input 
                                  type="time"
                                  value={editSessionStartTime}
                                  onChange={(e) => setEditSessionStartTime(e.target.value)}
                                  className="bg-black/35 border border-white/10 rounded px-1.5 py-1 text-xs text-white focus:outline-none focus:border-indigo-500"
                                />
                              </td>
                              <td className="py-2.5 px-2">
                                <input 
                                  type="time"
                                  value={editSessionEndTime}
                                  onChange={(e) => setEditSessionEndTime(e.target.value)}
                                  className="bg-black/35 border border-white/10 rounded px-1.5 py-1 text-xs text-white focus:outline-none focus:border-indigo-500"
                                />
                              </td>
                              <td className="py-2.5 px-2">
                                <input 
                                  type="number"
                                  min={1}
                                  value={editSessionDuration}
                                  onChange={(e) => setEditSessionDuration(Number(e.target.value))}
                                  className="bg-black/35 border border-white/10 rounded px-1.5 py-1 text-xs text-white max-w-[70px] focus:outline-none focus:border-indigo-500 font-extrabold"
                                />
                              </td>
                              <td className="py-2.5 px-2 text-right">
                                <div className="flex gap-2 justify-end">
                                  <button
                                    type="button"
                                    onClick={() => handleSaveSessionEdit(log.id)}
                                    className="text-emerald-400 hover:text-emerald-300 font-bold hover:underline cursor-pointer text-[10px]"
                                  >
                                    Save
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingSessionId(null)}
                                    className="text-gray-400 hover:text-white hover:underline cursor-pointer text-[10px]"
                                  >
                                    Cancel
                                  </button>
                               </div>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="py-2.5 px-2 text-white font-bold">{log.date}</td>
                              <td className="py-2.5 px-2 text-cyan-300 font-bold">{connectedSub ? connectedSub.name : 'General Work & Study'}</td>
                              <td className="py-2.5 px-2">{log.startTime || '-'}</td>
                              <td className="py-2.5 px-2">{log.endTime || '-'}</td>
                              <td className="py-2.5 px-2 text-pink-400 font-extrabold">{log.durationMinutes} Minutes</td>
                              <td className="py-2.5 px-2 text-right">
                                <div className="flex gap-2.5 justify-end">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingSessionId(log.id);
                                      setEditSessionDate(log.date);
                                      setEditSessionSubId(log.subjectId || '');
                                      setEditSessionStartTime(log.startTime || '');
                                      setEditSessionEndTime(log.endTime || '');
                                      setEditSessionDuration(log.durationMinutes);
                                    }}
                                    className="text-indigo-400 hover:text-indigo-300 underline text-[10px] font-bold cursor-pointer"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onUpdateFocusLogs(data.focusLogs.filter(l => l.id !== log.id));
                                      triggerXp(0, "Study session deleted successfully");
                                    }}
                                    className="text-red-400 hover:text-red-300 underline text-[10px] font-bold cursor-pointer"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                      );
                    })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
};
