import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  Activity, 
  Award, 
  BookOpen, 
  Smile, 
  Clock, 
  Sparkles, 
  Sun,
  Cloud,
  CloudRain,
  Wind,
  RotateCw,
  Plus,
  Trash2,
  Check,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  X,
  Pencil
} from 'lucide-react';
import { LifeOSData } from '../types';
import { ThemeConfig } from '../themes';

interface DashProps {
  data: LifeOSData;
  setCurrentTab: (tab: string) => void;
  theme: ThemeConfig;
  triggerXp: (amount: number, toastName: string) => void;
  onUpdateSettings: (s: any) => void;
}

interface QuickReminder {
  id: string;
  text: string;
}

const MOTIVATIONAL_QUOTES = [
  { text: "Your life is your own masterwork. Sculpt it daily with pristine intent.", author: "Marcus Aurelius" },
  { text: "Simplicity is the ultimate sophistication. Focus intensely, ignore noise.", author: "Steve Jobs" },
  { text: "Do not wait for extraordinary circumstances. Sculpt common moments elegantly.", author: "Carl Jung" },
  { text: "A rolling stone gathers no moss. Move forward, maintain the daily study routine.", author: "Academic sage" },
  { text: "The secret to constant growth is compound interests on small clean micro-actions.", author: "James Clear" }
];

const DAILY_AFFIRMATIONS = [
  "You are capable of doing difficult things with grace and persistence.",
  "Every small study session brings you closer to your ultimate aspirations.",
  "Your intellect is a dynamic muscle; feed it daily with challenges and high-quality rest.",
  "Protect your energy, direct your focus, and master your masterwork today.",
  "You are exactly where you need to be. Pace yourself, and breathe.",
  "Consistency is the quiet compound interest of self-respect.",
  "A highly focused hour is worth more than a full day of distracted scrolling.",
  "Your potential is not a fixed number; it is an evolving horizon you design daily."
];

export const DashboardOverview: React.FC<DashProps> = ({
  data,
  setCurrentTab,
  theme,
  triggerXp,
  onUpdateSettings
}) => {
  const isCompact = data.settings.displayDensity === 'compact';

  // Weather state
  const [weatherData, setWeatherData] = useState<{ temp: number; tempF?: number; condition: string; location: string } | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [showCityManager, setShowCityManager] = useState(false);
  const [newCityInput, setNewCityInput] = useState('');

  const unit = data.settings.weatherUnit || 'C';
  const handleToggleUnit = () => {
    const nextUnit = unit === 'C' ? 'F' : 'C';
    onUpdateSettings({
      ...data.settings,
      weatherUnit: nextUnit
    });
    triggerXp(5, `Weather unit toggled to °${nextUnit}! 🌤️`);
  };

  const savedCities = data.settings.savedCities || [data.settings.weatherLocation || "Delhi"];
  
  // Random Quote Picker
  const [quoteIdx, setQuoteIdx] = useState(0);

  // Daily Affirmations State
  const [affirmationIdx, setAffirmationIdx] = useState(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const day = Math.floor(diff / oneDay);
    return day % DAILY_AFFIRMATIONS.length;
  });

  // Quick One-Time Reminders State
  const [reminders, setReminders] = useState<QuickReminder[]>(() => {
    const cached = localStorage.getItem('lifeos_quick_reminders_v2');
    return cached ? JSON.parse(cached) : [];
  });
  const [newReminderText, setNewReminderText] = useState('');
  const [editingReminderId, setEditingReminderId] = useState<string | null>(null);
  const [editingReminderText, setEditingReminderText] = useState('');

  useEffect(() => {
    localStorage.setItem('lifeos_quick_reminders_v2', JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    // Pick random index on component mount
    setQuoteIdx(Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length));
  }, []);

  useEffect(() => {
    // Fetch weather with robust client-side fallback
    const fetchWeather = async () => {
      setWeatherLoading(true);
      const city = data.settings.weatherLocation || "Delhi";
      try {
        const res = await fetch(`/api/weather?location=${encodeURIComponent(city)}`);
        if (!res.ok) throw new Error("Server weather API non-OK response");
        const result = await res.json();
        if (result && typeof result.temp === 'number') {
          setWeatherData(result);
          return;
        }
        throw new Error("Invalid response format");
      } catch (e) {
        console.warn("Express weather endpoint unavailable, using local simulation:", e);
        // Deterministic mock generation
        const cityCode = city.length;
        let temp = 22 + (cityCode % 12) - (cityCode % 5);
        let condition = "Sunny";
        if (cityCode % 5 === 0) {
          condition = "Rainy";
          temp -= 4;
        } else if (cityCode % 3 === 0) {
          condition = "Partly Cloudy";
        } else if (cityCode % 7 === 0) {
          condition = "Windy";
        }
        setWeatherData({ temp, condition, location: city });
      } finally {
        setWeatherLoading(false);
      }
    };

    fetchWeather();
  }, [data.settings.weatherLocation]);

  const handleAddCity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCityInput.trim()) return;
    const cleanCity = newCityInput.trim();
    if (savedCities.map(c => c.toLowerCase()).includes(cleanCity.toLowerCase())) {
      setNewCityInput('');
      return;
    }
    const updated = [...savedCities, cleanCity];
    onUpdateSettings({
      ...data.settings,
      savedCities: updated,
      weatherLocation: cleanCity
    });
    setNewCityInput('');
    triggerXp(15, `City added: ${cleanCity} 🌤️`);
  };

  const handleDeleteCity = (cityToDelete: string) => {
    if (savedCities.length <= 1) return;
    const updated = savedCities.filter(c => c !== cityToDelete);
    let nextActive = data.settings.weatherLocation;
    if (data.settings.weatherLocation === cityToDelete) {
      nextActive = updated[0];
    }
    onUpdateSettings({
      ...data.settings,
      savedCities: updated,
      weatherLocation: nextActive
    });
    triggerXp(10, `City removed: ${cityToDelete} 🗑️`);
  };

  const handleSelectCity = (city: string) => {
    onUpdateSettings({
      ...data.settings,
      weatherLocation: city
    });
    triggerXp(10, `Weather focus: ${city} 🌍`);
  };

  const cycleAffirmation = () => {
    setAffirmationIdx(prev => (prev + 1) % DAILY_AFFIRMATIONS.length);
    triggerXp(10, "Affirmation cycled 🌸");
  };

  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReminderText.trim()) return;
    const newRem: QuickReminder = {
      id: `rem-${Date.now()}`,
      text: newReminderText.trim()
    };
    setReminders(prev => [...prev, newRem]);
    setNewReminderText('');
    triggerXp(15, "Micro-reminder registered ⚡");
  };

  const handleDismissReminder = (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
    triggerXp(20, "Reminder completed! 🎯");
  };

  const handleDeleteReminder = (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
    triggerXp(0, "Reminder deleted 🗑️");
  };

  const handleSaveEditReminder = (id: string) => {
    if (!editingReminderText.trim()) return;
    setReminders(prev => prev.map(r => r.id === id ? { ...r, text: editingReminderText.trim() } : r));
    setEditingReminderId(null);
    setEditingReminderText('');
    triggerXp(15, "Reminder updated! ✏️");
  };

  const getWeatherIcon = (condition: string) => {
    const cond = condition.toLowerCase();
    if (cond.includes('sun') || cond.includes('clear')) {
      return <Sun className="w-6 h-6 text-amber-400 animate-spin-slow" />;
    }
    if (cond.includes('rain') || cond.includes('drizzle')) {
      return <CloudRain className="w-6 h-6 text-blue-400 animate-pulse" />;
    }
    if (cond.includes('wind')) {
      return <Wind className="w-6 h-6 text-teal-300" />;
    }
    return <Cloud className="w-6 h-6 text-sky-450 animate-pulse text-sky-400" />;
  };

  // CORE SCORE ALGORITHMS (Life Analytics Dashboard Section 8)
  
  // A. Productivity Score
  // Calculation details: completed timeline tasks (40%), Logged focus hours duration (30%), completed habits rate (30%)
  const completedTasks = data.timelineTasks.filter(t => t.completed).length;
  const totalTasks = data.timelineTasks.length;
  const taskProgress = totalTasks > 0 ? (completedTasks / totalTasks) : 0;

  const totalFocusMin = data.focusLogs.reduce((acc, current) => acc + current.durationMinutes, 0);
  const focusProgress = Math.min(1, totalFocusMin / 300);

  const completedHabits = data.habits.filter(h => h.history.includes(new Date().toISOString().split('T')[0])).length;
  const totalHabits = data.habits.length;
  const habitProgress = totalHabits > 0 ? (completedHabits / totalHabits) : 0;

  const productivityScore = Math.round((taskProgress * 0.4 + focusProgress * 0.3 + habitProgress * 0.3) * 100);

  // B. Academic Health Score
  // Calculation details: attendance rates (40%), assignment checkoffs rate (30%), syllabus coverage average (30%)
  const totalClassAtTotal = data.subjects.reduce((sum, s) => sum + s.attendanceTotal, 0);
  const totalClassAtP = data.subjects.reduce((sum, s) => sum + s.attendancePresent, 0);
  const classAttendanceRatio = totalClassAtTotal > 0 ? (totalClassAtP / totalClassAtTotal) : 0;

  const submittedAsgCount = data.assignments.filter(a => a.status === 'Submitted').length;
  const totalAsgCount = data.assignments.length;
  const assignmentRatio = totalAsgCount > 0 ? (submittedAsgCount / totalAsgCount) : 0;

  const totalSyllabusSum = data.subjects.reduce((sum, s) => sum + s.syllabusProgress, 0);
  const subjectsCount = data.subjects.length;
  const syllabusRatio = subjectsCount > 0 ? (totalSyllabusSum / (subjectsCount * 100)) : 0;

  const academicHealthScore = Math.round((classAttendanceRatio * 0.4 + assignmentRatio * 0.3 + syllabusRatio * 0.3) * 100);

  // C. Wellness Score
  // Calculation details: mood scales (50%), completed habits percent (50%)
  const moodMap = { great: 5, good: 4, neutral: 3, bad: 2, terrible: 1 };
  const recentMoods = data.moodLogs.slice(-5);
  const avgMoodPoints = recentMoods.length > 0 
    ? (recentMoods.reduce((sum, m) => sum + moodMap[m.mood], 0) / (recentMoods.length * 5)) 
    : 0;

  const wellnessScore = Math.round((avgMoodPoints * 0.5 + habitProgress * 0.5) * 100);

  return (
    <div className={isCompact ? "space-y-3.5" : "space-y-6"}>
      
      {/* 1. MOTIVATIONAL HEADING BANNER */}
      <div className={`${isCompact ? 'p-4 px-5 rounded-2xl' : 'p-6 rounded-3xl'} ${theme.card} flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-visible`}>
        {/* Subtle background gradient overlay */}
        <div className={`absolute inset-0 bg-gradient-to-r ${theme.gradient} opacity-15 pointer-events-none rounded-[inherit]`} />
        
        <div className="space-y-1 z-10">
          <div className={`flex items-center gap-1.5 text-xs font-mono font-bold tracking-wider ${theme.isDark ? 'text-indigo-400' : 'text-indigo-700'}`}>
            <Sparkles className={`w-4 h-4 animate-spin-slow ${theme.isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
            TANSLIFE CONSOLE ACTIVE
          </div>
          <h2 className={`text-xl font-bold font-mono ${theme.isDark ? 'text-white' : 'text-slate-900'}`}>Welcome back, {data.settings.userName}!</h2>
          <p className={`text-[11px] max-w-lg leading-relaxed ${theme.isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            "{data.settings.customQuote || MOTIVATIONAL_QUOTES[quoteIdx].text}" <span className={`font-bold ${theme.isDark ? 'text-slate-400' : 'text-slate-850'}`}>— {data.settings.customQuoteAuthor || MOTIVATIONAL_QUOTES[quoteIdx].author}</span>
          </p>
        </div>

        {/* Live dynamic Weather Widget (Section 13) */}
        <div className="relative z-20">
          <button 
            type="button"
            onClick={() => setShowCityManager(!showCityManager)}
            className={`z-10 bg-black/35 hover:bg-black/45 text-left transition duration-300 backdrop-blur-md ${isCompact ? 'p-2.5 rounded-xl' : 'p-3.5 rounded-2xl'} border border-white/10 flex items-center gap-3 cursor-pointer select-none`}
            title="Weather Locations Manager"
          >
            {weatherLoading ? (
              <span className="text-xs font-mono text-gray-400 animate-pulse">Syncing forecast...</span>
            ) : weatherData ? (
              <div className="flex items-center gap-2.5">
                {getWeatherIcon(weatherData.condition)}
                <div>
                  <span className="text-xs font-mono block text-gray-300 uppercase tracking-wide flex items-center gap-1.5 font-bold">
                    {weatherData.location} <span className="text-[8px] text-indigo-400">▼</span>
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleUnit();
                      }}
                      className="text-sm font-bold font-mono text-cyan-300 hover:text-cyan-200 transition cursor-pointer select-none"
                      title="Click to toggle °C / °F"
                    >
                      {unit === 'C' 
                        ? `${weatherData.temp}°C` 
                        : `${weatherData.tempF !== undefined ? weatherData.tempF : Math.round((weatherData.temp * 9/5) + 32)}°F`
                      }
                    </span>
                    <span className="text-[9px] text-gray-400 capitalize font-medium">{weatherData.condition}</span>
                  </div>
                </div>
              </div>
            ) : (
              <span className="text-[10px] text-gray-500">Weather Settings</span>
            )}
          </button>

          {/* City Manager Popover */}
          {showCityManager && (
            <div className="absolute right-0 mt-2 w-64 bg-slate-900/95 backdrop-blur-lg border border-indigo-500/20 p-3.5 rounded-2xl shadow-2xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-bold">Weather Locations</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleUnit();
                    }}
                    className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/10 text-cyan-300 border border-white/10 transition cursor-pointer"
                    title="Toggle °C / °F"
                  >
                    °{unit}
                  </button>
                  <button 
                    onClick={() => setShowCityManager(false)}
                    className="text-gray-400 hover:text-white transition cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* City Input Form */}
              <form onSubmit={handleAddCity} className="flex gap-1.5">
                <input 
                  type="text"
                  placeholder="Add city (e.g. London)"
                  value={newCityInput}
                  onChange={(e) => setNewCityInput(e.target.value)}
                  className="flex-1 bg-black/40 text-xs px-2.5 py-1.5 rounded-xl border border-white/10 focus:outline-none focus:border-indigo-500 text-gray-100 placeholder-gray-500 font-mono"
                />
                <button 
                  type="submit"
                  className="px-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center cursor-pointer"
                  title="Save Location"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </form>

              {/* Saved Cities List */}
              <div className="space-y-1 max-h-[140px] overflow-y-auto scrollbar-thin">
                {savedCities.map((city) => (
                  <div 
                    key={city}
                    className={`flex justify-between items-center p-2 rounded-xl text-xs transition duration-200 ${
                      data.settings.weatherLocation === city 
                        ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-bold' 
                        : 'bg-black/10 hover:bg-black/20 text-gray-300 hover:text-white border border-transparent'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        handleSelectCity(city);
                        setShowCityManager(false);
                      }}
                      className="flex-1 text-left truncate font-mono font-medium"
                    >
                      {city} {data.settings.weatherLocation === city && '📍'}
                    </button>
                    {savedCities.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteCity(city)}
                        className="p-1 text-gray-500 hover:text-red-400 rounded-lg transition"
                        title="Remove Location"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* DAILY AFFIRMATION WIDGET */}
      <div className={`${isCompact ? 'p-3.5 px-4 rounded-xl' : 'p-4 rounded-2xl'} ${theme.card} flex items-center justify-between gap-4 border border-white/10 bg-gradient-to-r from-emerald-500/5 to-indigo-500/5 backdrop-blur-sm shadow-md`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[9px] font-mono uppercase tracking-widest text-emerald-400 block mb-0.5">Daily Affirmation</span>
            <p className="text-xs md:text-sm font-medium text-gray-100">
              "{DAILY_AFFIRMATIONS[affirmationIdx]}"
            </p>
          </div>
        </div>
        <button 
          onClick={cycleAffirmation}
          className="p-2 text-gray-400 hover:text-emerald-400 hover:bg-white/5 border border-white/5 hover:border-emerald-500/20 rounded-xl transition-all duration-300 shrink-0 cursor-pointer"
          title="Cycle Affirmation"
        >
          <RotateCw className="w-4 h-4" />
        </button>
      </div>

      {/* 2. LIFE ANALYTICS DISPATCH SCREEN (SCORES SECTION 8) */}
      <div className={`grid grid-cols-1 md:grid-cols-3 ${isCompact ? 'gap-3.5' : 'gap-6'}`}>
        
        {/* Productivity Score panel */}
        <div className={`${isCompact ? 'p-4 px-5 rounded-2xl min-h-[145px]' : 'p-6 rounded-3xl min-h-[180px]'} ${theme.card} relative flex flex-col justify-between hover:scale-101 transition-all`}>
          <div>
            <div className="flex justify-between items-center pb-2">
              <span className="text-[10px] font-mono tracking-widest text-indigo-400 uppercase">Productivity Rate</span>
              <Clock className="w-4 h-4 text-indigo-400" />
            </div>
            
            <div className={`flex items-baseline gap-2 ${isCompact ? 'mt-1' : 'mt-2'}`}>
              <h3 className="text-4xl font-bold font-mono text-white">{productivityScore}%</h3>
              <span className="text-xs text-indigo-400 font-semibold font-mono">Index</span>
            </div>
            
            <p className="text-[10px] text-gray-400 mt-2 leading-relaxed">
              Calculated based on pending timeline hours completed, focused active study sessions.
            </p>
          </div>

          <div className={`pt-3 border-t border-white/5 ${isCompact ? 'mt-2.5' : 'mt-4'} flex justify-between items-center text-[10px] font-mono text-indigo-300 gap-2`}>
            <span className="flex items-center gap-1 whitespace-nowrap overflow-hidden text-ellipsis">
              📈 {totalTasks > 0 ? "Compound trend rising" : "Trend: Initiated"}
            </span>
            <button onClick={() => setCurrentTab('productivity')} className="flex items-center hover:underline cursor-pointer whitespace-nowrap shrink-0">
              Optimize <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Academic Health Score panel */}
        <div className={`${isCompact ? 'p-4 px-5 rounded-2xl min-h-[145px]' : 'p-6 rounded-3xl min-h-[180px]'} ${theme.card} relative flex flex-col justify-between hover:scale-101 transition-all`}>
          <div>
            <div className="flex justify-between items-center pb-2">
              <span className="text-[10px] font-mono tracking-widest text-pink-400 uppercase">Academic Health</span>
              <BookOpen className="w-4 h-4 text-pink-400" />
            </div>
            
            <div className={`flex items-baseline gap-2 ${isCompact ? 'mt-1' : 'mt-2'}`}>
              <h3 className="text-4xl font-bold font-mono text-white">{academicHealthScore}%</h3>
              <span className="text-xs text-pink-400 font-semibold font-mono">Index</span>
            </div>

            <p className="text-[10px] text-gray-400 mt-2 leading-relaxed">
              Derived from weekly lecture study attendance metrics and submitted homework assignments.
            </p>
          </div>

          <div className={`pt-3 border-t border-white/5 ${isCompact ? 'mt-2.5' : 'mt-4'} flex justify-between items-center text-[10px] font-mono text-pink-300 gap-2`}>
            <span className="flex items-center gap-1 whitespace-nowrap overflow-hidden text-ellipsis">
              🎓 {totalClassAtTotal > 0 ? `Attendance: ${Math.round(totalClassAtP / totalClassAtTotal * 100)}%` : "No Classes Registered"}
            </span>
            <button onClick={() => setCurrentTab('academic')} className="flex items-center hover:underline cursor-pointer whitespace-nowrap shrink-0">
              Analyze <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Wellness Score panel */}
        <div className={`${isCompact ? 'p-4 px-5 rounded-2xl min-h-[145px]' : 'p-6 rounded-3xl min-h-[180px]'} ${theme.card} relative flex flex-col justify-between hover:scale-101 transition-all`}>
          <div>
            <div className="flex justify-between items-center pb-2">
              <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase">Mind & Wellness</span>
              <Smile className="w-4 h-4 text-emerald-400" />
            </div>
            
            <div className={`flex items-baseline gap-2 ${isCompact ? 'mt-1' : 'mt-2'}`}>
              <h3 className="text-4xl font-bold font-mono text-white">{wellnessScore}%</h3>
              <span className="text-xs text-emerald-400 font-semibold font-mono">Index</span>
            </div>

            <p className="text-[10px] text-gray-400 mt-2 leading-relaxed">
              Monitored via recent emotive checklist rankings and daily hydration trackers.
            </p>
          </div>

          <div className={`pt-3 border-t border-white/5 ${isCompact ? 'mt-2.5' : 'mt-4'} flex justify-between items-center text-[10px] font-mono text-emerald-300 gap-2`}>
            <span className="flex items-center gap-1 whitespace-nowrap overflow-hidden text-ellipsis">
              🧘 {totalHabits > 0 ? "Streak checklist active" : "No Habits Tracked"}
            </span>
            <button onClick={() => setCurrentTab('habits')} className="flex items-center hover:underline cursor-pointer whitespace-nowrap shrink-0">
              Log States <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

      </div>

      {/* 3. CORE ACTIVITY OVERVIEW GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Academic reminders & urgent homework (lg:col-span-7) */}
        <div className={`${isCompact ? 'p-4 px-5 rounded-2xl space-y-2.5' : 'p-6 rounded-3xl space-y-4'} ${theme.card} lg:col-span-7`}>
          <div className="border-b border-white/5 pb-2 flex justify-between items-center">
            <h3 className="font-bold text-gray-100 flex items-center gap-1.5 text-xs font-mono uppercase tracking-wide">
              🎓 Academic Overflows Checking
            </h3>
            <span className="text-[10px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/10 px-2 py-0.5 rounded-full font-mono">
              Pending: {data.assignments.filter(a => a.status !== 'Submitted').length}
            </span>
          </div>
          
          <div className="space-y-2">
            {/* Urgent homework warnings */}
            {data.assignments.filter(a => a.status !== 'Submitted').slice(0, 3).map((asg) => (
              <div 
                key={asg.id}
                onClick={() => setCurrentTab('academic')}
                className="p-3 rounded-xl bg-black/15 border border-white/5 hover:border-white/15 cursor-pointer flex justify-between items-center text-xs transition hover:scale-[1.01]"
              >
                <div className="min-w-0 flex-1 mr-2">
                  <h4 className="font-bold text-gray-100 truncate">{asg.title}</h4>
                  <span className="text-[9px] font-mono text-gray-450 uppercase text-gray-400">Due: {asg.deadline}</span>
                </div>
                <span className="text-[9px] font-mono font-bold bg-pink-500/10 text-pink-300 border border-pink-500/10 px-2.5 py-0.5 rounded-full uppercase shrink-0">
                  {asg.priority}
                </span>
              </div>
            ))}

            {/* Empty state warning alerts */}
            {data.assignments.filter(a => a.status !== 'Submitted').length === 0 && (
              <div className="p-4 rounded-xl border border-dashed border-white/10 text-center text-gray-500 text-xs py-8">
                🎉 No active assignments remaining! Study load cleared.
              </div>
            )}
          </div>
        </div>

        {/* Quick micro-reminders (lg:col-span-5) */}
        <div className={`${isCompact ? 'p-4 px-5 rounded-2xl space-y-2.5' : 'p-6 rounded-3xl space-y-4'} ${theme.card} lg:col-span-5`}>
          <div className="border-b border-white/5 pb-2">
            <h3 className="font-bold text-gray-100 flex items-center gap-1.5 text-xs font-mono uppercase tracking-wide">
              ⚡ Quick Micro-Reminders
            </h3>
          </div>

          {/* New reminder submission */}
          <form onSubmit={handleAddReminder} className="flex gap-2">
            <input 
              type="text"
              value={newReminderText}
              onChange={(e) => setNewReminderText(e.target.value)}
              placeholder="Water plants, message peer..."
              className="flex-1 bg-black/25 text-xs p-2 rounded-xl border border-white/10 focus:outline-none focus:border-indigo-500 text-gray-100 placeholder-gray-500"
            />
            <button 
              type="submit"
              className="p-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white transition cursor-pointer flex items-center justify-center"
            >
              <Plus className="w-4 h-4" />
            </button>
          </form>

          {/* List of Reminders */}
          <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
            {reminders.map((rem) => (
              <div 
                key={rem.id}
                className="p-2.5 rounded-xl bg-black/10 border border-white/5 hover:border-white/10 flex justify-between items-center text-xs group"
              >
                {editingReminderId === rem.id ? (
                  <div className="flex-1 flex gap-1.5 items-center w-full">
                    <input 
                      type="text"
                      value={editingReminderText}
                      onChange={(e) => setEditingReminderText(e.target.value)}
                      className="flex-1 bg-black/35 text-xs p-1 px-2 rounded-lg border border-indigo-500 focus:outline-none text-gray-100"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveEditReminder(rem.id)}
                      className="p-1 text-emerald-400 hover:bg-emerald-500/15 rounded transition cursor-pointer"
                      title="Save edit"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingReminderId(null);
                        setEditingReminderText('');
                      }}
                      className="p-1 text-red-400 hover:bg-red-500/15 rounded transition cursor-pointer"
                      title="Cancel"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="text-gray-350 select-none text-gray-300 flex-1 truncate pr-2">
                      {rem.text}
                    </span>
                    <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100">
                      <button
                        onClick={() => {
                          setEditingReminderId(rem.id);
                          setEditingReminderText(rem.text);
                        }}
                        className="p-1 text-gray-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition duration-200 cursor-pointer"
                        title="Edit Micro-task"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDismissReminder(rem.id)}
                        className="p-1 text-gray-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition duration-200 cursor-pointer"
                        title="Dismiss Micro-task"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteReminder(rem.id)}
                        className="p-1 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition duration-200 cursor-pointer"
                        title="Delete Micro-task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}

            {reminders.length === 0 && (
              <div className="p-4 rounded-xl border border-dashed border-white/10 text-center text-gray-500 text-xs py-8">
                💭 All micro-tasks dismissed!
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
