import React, { useState } from 'react';
import { 
  Smile, 
  Plus, 
  Award, 
  Trash, 
  Check, 
  Activity, 
  Sparkles,
  Heart,
  Droplet,
  Calendar
} from 'lucide-react';
import { Habit, MoodLog, MoodType, LifeOSData } from '../types';
import { ThemeConfig } from '../themes';

interface HabitsProps {
  data: LifeOSData;
  onUpdateHabits: (newHabits: Habit[]) => void;
  onUpdateMoodLogs: (newMoodLogs: MoodLog[]) => void;
  theme: ThemeConfig;
  triggerXp: (amount: number, toastName: string) => void;
}

const MOOD_DESCS: Record<MoodType, { emoji: string; text: string; bg: string; textCol: string; score: number }> = {
  great: { emoji: '😀', text: 'Great Day', bg: 'bg-emerald-500/10 border-emerald-500/30', textCol: 'text-emerald-400', score: 5 },
  good: { emoji: '🙂', text: 'Good Day', bg: 'bg-blue-500/10 border-blue-500/30', textCol: 'text-blue-400', score: 4 },
  neutral: { emoji: '😐', text: 'Neutral', bg: 'bg-stone-500/10 border-stone-500/30', textCol: 'text-stone-400', score: 3 },
  bad: { emoji: '😔', text: 'Bad Day', bg: 'bg-amber-500/10 border-amber-500/30', textCol: 'text-amber-400', score: 2 },
  terrible: { emoji: '😭', text: 'Terrible Day', bg: 'bg-red-500/10 border-red-500/30', textCol: 'text-red-400', score: 1 },
};

export const HabitsMoodSection: React.FC<HabitsProps> = ({
  data,
  onUpdateHabits,
  onUpdateMoodLogs,
  theme,
  triggerXp
}) => {
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitFreq, setNewHabitFreq] = useState<'daily' | 'weekly'>('daily');
  const [showAddHabit, setShowAddHabit] = useState(false);

  // Mood dialog inputs
  const [tempMood, setTempMood] = useState<MoodType>('great');
  const [tempMoodNotes, setTempMoodNotes] = useState('');
  const [loggedToday, setLoggedToday] = useState(false);

  // Water counters local state
  const [waterCups, setWaterCups] = useState(4);

  // Mood Heatmap calculations & states
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [editorNotes, setEditorNotes] = useState('');
  const [editorMood, setEditorMood] = useState<MoodType>('great');

  const past30Logs = React.useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    const cutoffStr = cutoff.toISOString().split('T')[0];
    return data.moodLogs.filter(log => log.date >= cutoffStr);
  }, [data.moodLogs]);

  const avgMoodScore = React.useMemo(() => {
    if (past30Logs.length === 0) return 3.0;
    const sum = past30Logs.reduce((acc, log) => {
      const score = MOOD_DESCS[log.mood]?.score || 3;
      return acc + score;
    }, 0);
    return Number((sum / past30Logs.length).toFixed(1));
  }, [past30Logs]);

  const dominantMood = React.useMemo(() => {
    if (past30Logs.length === 0) return 'None' as MoodType | 'None';
    const counts: Record<MoodType, number> = {
      great: 0,
      good: 0,
      neutral: 0,
      bad: 0,
      terrible: 0
    };
    past30Logs.forEach(log => {
      if (counts[log.mood] !== undefined) {
        counts[log.mood] = (counts[log.mood] || 0) + 1;
      }
    });
    let maxCount = -1;
    let maxMood: MoodType | 'None' = 'None';
    (Object.keys(counts) as MoodType[]).forEach(k => {
      if (counts[k] > maxCount) {
        maxCount = counts[k];
        maxMood = k;
      }
    });
    return maxMood;
  }, [past30Logs]);

  const heatmapDates = React.useMemo(() => {
    const daysToShow = 35;
    return Array.from({ length: daysToShow }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (daysToShow - 1 - i));
      return d.toISOString().split('T')[0];
    });
  }, []);

  const dateToMoodMap = React.useMemo(() => {
    const map: Record<string, MoodLog> = {};
    data.moodLogs.forEach(log => {
      map[log.date] = log;
    });
    return map;
  }, [data.moodLogs]);

  const handleCreateHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    const newHab: Habit = {
      id: `h-${Date.now()}`,
      name: newHabitName,
      frequency: newHabitFreq,
      createdAt: new Date().toISOString().split('T')[0],
      history: [],
      streak: 0
    };

    onUpdateHabits([...data.habits, newHab]);
    setNewHabitName('');
    setShowAddHabit(false);
    triggerXp(60, `Habit Created: ${newHab.name}`);
  };

  const checkoffHabit = (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    
    const adjusted = data.habits.map(hab => {
      if (hab.id === id) {
        const containsToday = hab.history.includes(today);
        let updatedHistory = [...hab.history];
        let calculatedStreak = hab.streak;

        if (containsToday) {
          // Uncheck habit
          updatedHistory = updatedHistory.filter(date => date !== today);
          calculatedStreak = Math.max(0, calculatedStreak - 1);
        } else {
          // Checkoff habit
          updatedHistory.push(today);
          calculatedStreak += 1;
          triggerXp(0, `Habit Complete: ${hab.name}! ✅`);
        }

        return {
          ...hab,
          history: updatedHistory,
          streak: calculatedStreak
        };
      }
      return hab;
    });

    onUpdateHabits(adjusted);
  };

  const deleteHabit = (id: string) => {
    onUpdateHabits(data.habits.filter(h => h.id !== id));
  };

  // Mood submit logic
  const handleLogMood = (e: React.FormEvent) => {
    e.preventDefault();
    const today = new Date().toISOString().split('T')[0];

    const newLog: MoodLog = {
      date: today,
      mood: tempMood,
      notes: tempMoodNotes.trim() || undefined
    };

    // Filter out previous entries for today
    const filteredMoods = data.moodLogs.filter(m => m.date !== today);
    onUpdateMoodLogs([...filteredMoods, newLog]);
    setTempMoodNotes('');
    setLoggedToday(true);
    triggerXp(100, `Mood Logged: ${MOOD_DESCS[tempMood].emoji} ${MOOD_DESCS[tempMood].text}!`);
  };

  // Helper completion average calculate
  const totalHabitsCount = data.habits.length;
  const habitsCheckedTodayCount = data.habits.filter(h => {
    const today = new Date().toISOString().split('T')[0];
    return h.history.includes(today);
  }).length;

  const habitCompletionRate = totalHabitsCount > 0 
    ? Math.round((habitsCheckedTodayCount / totalHabitsCount) * 100) 
    : 100;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      
      {/* 1. HEALTH HABITS ENGINE */}
      <div className={`xl:col-span-7 p-4 md:p-5 rounded-3xl ${theme.card} flex flex-col justify-between`}>
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <div>
              <h2 className="text-md font-bold flex items-center gap-1.5">
                <Smile className="w-4 h-4 text-emerald-400" />
                Durable Habit Streaks Core
              </h2>
              <p className="text-[10px] text-gray-400">Lock high streaking metrics to boost mental wellness scores:</p>
            </div>
            
            <button
              onClick={() => setShowAddHabit(!showAddHabit)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-xl text-xs font-mono transition"
            >
              + Create Habit
            </button>
          </div>

          {/* Add Habit parameters */}
          {showAddHabit && (
            <form onSubmit={handleCreateHabit} className="bg-black/20 p-3 rounded-2xl border border-white/5 space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  placeholder="e.g. Read Physics journals, Practice ML math"
                  required
                  className="p-2 bg-black/30 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
                <select
                  value={newHabitFreq}
                  onChange={(e) => setNewHabitFreq(e.target.value as any)}
                  className="p-2 bg-black/30 border border-white/10 rounded-xl text-xs text-white"
                >
                  <option value="daily">Daily frequency</option>
                  <option value="weekly">Weekly frequency</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 text-xs font-mono pt-1">
                <button type="submit" className="bg-emerald-600 px-3 py-1 rounded text-white">+ Create Habit</button>
              </div>
            </form>
          )}

          {/* Habit Checklist Rows */}
          <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
            {data.habits.map((hab) => {
              const today = new Date().toISOString().split('T')[0];
              const isChecked = hab.history.includes(today);

              return (
                <div 
                  key={hab.id}
                  className={`p-3 rounded-2xl border flex items-center justify-between gap-4 transition-all ${
                    isChecked 
                      ? 'bg-neutral-900/10 border-emerald-900/10 opacity-70' 
                      : 'bg-black/10 border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => checkoffHabit(hab.id)}
                      className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                        isChecked 
                          ? 'bg-emerald-600 border-emerald-500 text-white' 
                          : 'border-white/20 hover:border-emerald-400 bg-black/20'
                      }`}
                    >
                      {isChecked && <Check className="w-4 h-4" />}
                    </button>
                    <div>
                      <h4 className={`text-xs font-bold ${isChecked ? 'line-through text-gray-500' : 'text-gray-100'}`}>
                        {hab.name}
                      </h4>
                      <p className="text-[10px] font-mono text-gray-400 capitalize">
                        Freq: {hab.frequency}
                      </p>
                    </div>
                  </div>

                  {/* Streak displays */}
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1">
                        🔥 {hab.streak} Day streak
                      </span>
                    </div>
                    <button
                      onClick={() => deleteHabit(hab.id)}
                      className="p-1 text-gray-500 hover:text-red-400 transition"
                      title="Remove habit"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* 2. MOOD & MENTAL WELLNESS CO-ORDINATOR */}
      <div className={`xl:col-span-5 p-4 md:p-5 rounded-3xl ${theme.card} flex flex-col justify-between`}>
        <div className="space-y-3">
          <div className="border-b border-white/5 pb-2">
            <h2 className="text-sm font-bold flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-pink-400" />
              Emotional & Mental Health Log
            </h2>
            <p className="text-[10px] text-gray-400">Log emotional states daily to analyze correlations with study sessions:</p>
          </div>

          {/* Quick Emoji selection list */}
          <form onSubmit={handleLogMood} className="space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-gray-400 uppercase">How do you feel today?</label>
              <div className="grid grid-cols-5 gap-1.5 pt-0.5">
                {(Object.keys(MOOD_DESCS) as MoodType[]).map((moodKey) => {
                  const item = MOOD_DESCS[moodKey];
                  const isCur = tempMood === moodKey;
                  return (
                    <button
                      key={moodKey}
                      type="button"
                      onClick={() => setTempMood(moodKey)}
                      className={`py-1.5 rounded-xl border text-center flex flex-col items-center justify-center gap-0.5 relative transition-all ${
                        isCur 
                          ? 'bg-indigo-600/20 border-indigo-400 text-white scale-102 ring-2 ring-indigo-500/20' 
                          : 'border-white/5 bg-black/10 hover:border-white/10'
                      }`}
                    >
                      <span className="text-xl">{item.emoji}</span>
                      <span className="text-[8px] uppercase font-mono text-gray-400 truncate w-full max-w-[45px] text-center">{moodKey}</span>
                      {isCur && <span className="absolute top-1 right-1 w-1 h-1 rounded-full bg-indigo-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick mood notes */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-gray-400">Mental journaling triggers / blockers</label>
              <input
                type="text"
                value={tempMoodNotes}
                onChange={(e) => setTempMoodNotes(e.target.value)}
                placeholder="E.g. Stressing about midterm math, finished labs"
                className="w-full p-2 bg-black/25 border border-white/10 rounded-xl text-xs placeholder-gray-500 text-slate-100"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-500 to-indigo-600 hover:from-emerald-600 hover:to-indigo-700 text-white py-2 rounded-xl text-xs font-mono font-bold transition flex items-center justify-center gap-1 shadow-md"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Save Mood Check-In
            </button>

          </form>
        </div>

      </div>

      {/* 3. VISUAL MOOD & EMOTIONAL TRENDS HEATMAP */}
      <div id="mood-heatmap-panel" className={`xl:col-span-12 p-4 md:p-5 rounded-3xl ${theme.card} flex flex-col space-y-3 mt-6`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-3 gap-3">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-md font-bold flex items-center gap-1.5 text-indigo-400">
                <Calendar className="w-5 h-5" />
                Emotional Landscape Heatmap
              </h2>
              <span className="text-[10px] font-mono uppercase bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded-lg font-bold">
                📈 30D Avg Mood: {avgMoodScore} / 5.0
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              Track 35-day emotional, academic, and mental wellness frequencies. Move cursor over cells to view check-in details.
            </p>
          </div>
          
          {/* Legend keys */}
          <div className="flex flex-wrap items-center gap-2 bg-black/20 p-2 rounded-xl border border-white/5 text-[9px] font-mono">
            <span className="text-gray-500 uppercase mr-1">Intensity:</span>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500" />
              <span className="text-gray-300 font-mono">Great</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-blue-500" />
              <span className="text-gray-300 font-mono">Good</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-stone-500" />
              <span className="text-gray-300 font-mono">Neutral</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-amber-500" />
              <span className="text-gray-300 font-mono">Bad</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-red-500" />
              <span className="text-gray-300 font-mono">Terrible</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-gray-800 border border-white/10" />
              <span className="text-gray-500 font-mono">Empty</span>
            </div>
          </div>
        </div>

        {/* Heatmap Grid & Analytics dashboard bento split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">

          {/* MAIN GRID LEFT */}
          <div className="lg:col-span-6 flex flex-col justify-start py-6 items-center bg-black/10 p-4 border border-white/5 rounded-2xl">
            <div className="w-full text-center mb-2 flex justify-between items-center px-1">
              <span className="text-[10px] font-mono text-gray-500">← 35 Days Ago</span>
              <span className="text-[10px] font-mono text-indigo-400 font-bold">TansLife 2.0 Landscape Chart</span>
              <span className="text-[10px] font-mono text-gray-500">Today →</span>
            </div>

            {/* 35 squares calendar matrix */}
            <div className="grid grid-cols-7 gap-2 mx-auto">
              {heatmapDates.map((dateStr) => {
                const log = dateToMoodMap[dateStr];
                const dayLabel = new Date(dateStr).getDate();
                const isToday = dateStr === new Date().toISOString().split('T')[0];

                let bgClass = "bg-gray-800/45 border border-white/5 text-gray-500 hover:bg-gray-800/80";
                if (log) {
                  switch (log.mood) {
                    case 'great':
                      bgClass = "bg-emerald-500 text-white shadow-[0_0_8px_rgba(16,185,129,0.355)]";
                      break;
                    case 'good':
                      bgClass = "bg-blue-500 text-white shadow-[0_0_8px_rgba(59,130,246,0.355)]";
                      break;
                    case 'neutral':
                      bgClass = "bg-stone-500 text-white shadow-[0_0_8px_rgba(120,113,108,0.3)]";
                      break;
                    case 'bad':
                      bgClass = "bg-amber-500 text-white shadow-[0_0_8px_rgba(245,158,11,0.355)]";
                      break;
                    case 'terrible':
                      bgClass = "bg-red-500 text-white shadow-[0_0_8px_rgba(239,68,68,0.3555)]";
                      break;
                  }
                }

                const isSelected = selectedDate === dateStr;
                const isHovered = hoveredDate === dateStr && !selectedDate;
                return (
                  <button
                    key={dateStr}
                    type="button"
                    onMouseEnter={() => setHoveredDate(dateStr)}
                    onMouseLeave={() => setHoveredDate(null)}
                    onClick={() => {
                      const log = dateToMoodMap[dateStr];
                      setSelectedDate(selectedDate === dateStr ? null : dateStr);
                      if (log) {
                        setEditorMood(log.mood);
                        setEditorNotes(log.notes || '');
                      } else {
                        setEditorMood('great');
                        setEditorNotes('');
                      }
                      triggerXp(10, `Focusing slot: ${dateStr}`);
                    }}
                    className={`aspect-square w-8 h-8 rounded flex flex-col items-center justify-center text-[9px] font-mono font-semibold transition-all relative duration-150 active:scale-95 ${bgClass} ${
                      isHovered ? 'ring-2 ring-indigo-400 z-10' : ''
                    } ${isSelected ? 'border border-pink-400 ring-2 ring-pink-500/30 z-10' : ''} ${
                      isToday ? 'ring-1 ring-white ring-offset-1 ring-offset-[#0A0A0C]' : ''
                    }`}
                    title={`${dateStr}: ${log ? log.mood : 'No Log'}`}
                  >
                    <span>{dayLabel}</span>
                  </button>
                );
              })}
            </div>
            <div className="grid grid-cols-7 gap-2.5 w-full max-w-[270px] mx-auto mt-2 px-0.5 text-center text-[7.5px] font-mono text-gray-500 font-bold uppercase">
              <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
            </div>
          </div>
 
          {/* DYNAMIC FOCUSED VIEW RIGHT */}
          <div className="lg:col-span-6 bg-[#0d0d12]/60 p-4 border border-white/5 rounded-2xl flex flex-col justify-between min-h-[300px]">
            <div>
              <span className="text-[9px] font-mono text-indigo-400 uppercase tracking-widest font-bold">Interactive Deck</span>
              {(() => {
                const activeDate = selectedDate || hoveredDate || new Date().toISOString().split('T')[0];
                const activeLog = dateToMoodMap[activeDate];
                const cleanDate = new Date(activeDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
                const isSaved = !!activeLog;

                return (
                  <div className="mt-2 space-y-2.5">
                    <h5 className="text-[11px] font-bold text-pink-300 font-mono flex items-center justify-between">
                      <span>{selectedDate ? `Editing: ${cleanDate}` : `Inspecting: ${cleanDate}`}</span>
                      {activeDate === new Date().toISOString().split('T')[0] ? (
                        <span className="text-[8px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded">Today</span>
                      ) : selectedDate ? (
                        <span className="text-[8px] px-1.5 py-0.5 bg-pink-500/20 text-pink-500 rounded animate-pulse font-bold">Selected</span>
                      ) : null}
                    </h5>

                    {/* Interactive Editor Form */}
                    <div className="space-y-2 bg-black/25 p-3 rounded-xl border border-white/5">
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-gray-500 uppercase block">Set Emotional Rating</label>
                        <div className="flex gap-1.5 justify-between">
                          {(['great', 'good', 'neutral', 'bad', 'terrible'] as MoodType[]).map((m) => (
                            <button
                              key={m}
                              type="button"
                              onClick={() => setEditorMood(m)}
                              title={m}
                              className={`text-base p-1.5 rounded-lg transition-all border ${
                                editorMood === m 
                                  ? 'bg-indigo-500/10 border-indigo-400 scale-110 text-white font-bold' 
                                  : 'bg-black/20 border-white/5 text-gray-400 hover:text-white hover:border-white/10'
                              }`}
                            >
                              {MOOD_DESCS[m]?.emoji}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1 pt-1">
                        <label className="text-[9px] font-mono text-gray-500 uppercase block">Mental Notes</label>
                        <input
                          type="text"
                          value={editorNotes}
                          onChange={(e) => setEditorNotes(e.target.value)}
                          placeholder="What triggered this state today?"
                          className="w-full text-xs p-2 bg-black/30 border border-white/10 rounded-lg focus:outline-none focus:border-indigo-400 text-slate-100 placeholder-gray-650 font-mono"
                        />
                      </div>

                      <div className="flex gap-1.5 pt-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            const targetDate = activeDate;
                            const existingIndex = data.moodLogs.findIndex(l => l.date === targetDate);
                            let updatedLogs = [...data.moodLogs];
                            if (existingIndex >= 0) {
                              updatedLogs[existingIndex] = {
                                ...updatedLogs[existingIndex],
                                mood: editorMood,
                                notes: editorNotes
                              };
                            } else {
                              updatedLogs.push({
                                date: targetDate,
                                mood: editorMood,
                                notes: editorNotes
                              });
                            }
                            onUpdateMoodLogs(updatedLogs);
                            triggerXp(120, `Saved checking for ${targetDate}`);
                          }}
                          className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold text-[10px] rounded-lg cursor-pointer transition text-center"
                        >
                          {isSaved ? 'Update Day' : 'Log New Day'}
                        </button>
                        
                        {isSaved && (
                          <button
                            type="button"
                            onClick={() => {
                              onUpdateMoodLogs(data.moodLogs.filter(l => l.date !== activeDate));
                              setSelectedDate(null);
                              setEditorNotes('');
                              triggerXp(10, `Deleted mood entry`);
                            }}
                            className="px-2.5 py-1.5 bg-red-950/40 hover:bg-red-900/40 text-red-400 border border-red-500/15 font-mono text-[10px] rounded-lg cursor-pointer transition"
                          >
                            Delete Log
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Recorded status label */}
                    {activeLog && (
                      <div className="bg-[#0f172a]/30 p-2 rounded-xl border border-indigo-500/10 text-[9.5px]">
                        <span className="text-[8px] uppercase tracking-wider text-indigo-400 font-mono font-bold block mb-0.5">RECORDED INSIGHT</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm">{MOOD_DESCS[activeLog.mood]?.emoji}</span>
                          <span className={`font-bold ${MOOD_DESCS[activeLog.mood]?.textCol}`}>{MOOD_DESCS[activeLog.mood]?.text}</span>
                        </div>
                        {activeLog.notes && <p className="text-gray-400 italic text-[9px] mt-0.5 leading-snug">"{activeLog.notes}"</p>}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
            
            <p className="text-[8.5px] text-gray-500 leading-normal border-t border-white/5 pt-2 mt-2">
              💡 <span className="text-gray-400 font-semibold font-mono">TansLife 2.0 Pro Tip:</span> Consistent logging rewards high multipliers enabling advanced digital butler predictions.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};
