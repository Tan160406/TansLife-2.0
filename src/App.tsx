import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  Settings, 
  LogOut, 
  Sparkles, 
  Award, 
  Menu, 
  X,
  Bot,
  Search
} from 'lucide-react';

// Sections components
import { Sidebar } from './components/Sidebar';
import { DashboardOverview } from './components/DashboardOverview';
import { CalendarSection } from './components/CalendarSection';
import { AcademicSection } from './components/AcademicSection';
import { ProductivitySection } from './components/ProductivitySection';
import { HabitsMoodSection } from './components/HabitsMoodSection';
import { JournalSection } from './components/JournalSection';
import { GoalsSection } from './components/GoalsSection';
import { FinancialSection } from './components/FinancialSection';
import { LifePlanSection } from './components/LifePlanSection';
import { AiAssistant } from './components/AiAssistant';
import { SettingsSection } from './components/SettingsSection';

// Initial defaults data
import { getInitialData } from './defaultData';
import { THEMES } from './themes';
import { LifeOSData, Subject, Assignment, Exam, CalendarDayMark, DailyTimelineTask, FocusSessionLog, Habit, MoodLog, JournalEntry, Goal, FinancialLog, VisionBoardItem, BucketListItem, MemoryEvent, ProfileSettings } from './types';

export default function App() {
  // Main Data States with durable local retrieval
  const [data, setData] = useState<LifeOSData>(() => {
    const cached = localStorage.getItem('lifeos_persistent_v2');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.error("Local registry failed parsing. Loading system default data.", e);
      }
    }
    return getInitialData();
  });

  // Hot syncing helper
  useEffect(() => {
    localStorage.setItem('lifeos_persistent_v2', JSON.stringify(data));
  }, [data]);

  // Visual Tabs controller states
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Active theme states
  const activeTheme = THEMES[data.settings.theme] || THEMES.galaxy;

  // Apply active theme background to body to avoid any white background on page bounce/scroll
  useEffect(() => {
    if (activeTheme) {
      document.body.className = `${activeTheme.bg} transition-colors duration-500 min-h-screen`;
      document.documentElement.className = activeTheme.isDark ? 'bg-slate-950' : 'bg-neutral-50';
    }
  }, [activeTheme]);

  // Gamification popup toasts triggers
  const [xpToasts, setXpToasts] = useState<{ id: string; msg: string; active: boolean }[]>([]);

  const triggerXp = (amount: number, toastName: string) => {
    // Spawn a sleek physical dashboard notification toaster
    const id = `xp-${Date.now()}`;
    setXpToasts(prev => [...prev, { id, msg: toastName, active: true }]);
    
    setTimeout(() => {
      setXpToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // State handlers helpers passing down
  const onUpdateSubjects = (s: Subject[]) => setData(p => ({ ...p, subjects: s }));
  const onUpdateAssignments = (a: Assignment[]) => setData(p => ({ ...p, assignments: a }));
  const onUpdateExams = (e: Exam[]) => setData(p => ({ ...p, exams: e }));
  const onUpdateCalendarMarks = (m: CalendarDayMark[]) => setData(p => ({ ...p, calendarMarks: m }));
  const onUpdateTimeline = (t: DailyTimelineTask[]) => setData(p => ({ ...p, timelineTasks: t }));
  const onUpdateFocusLogs = (l: FocusSessionLog[]) => setData(p => ({ ...p, focusLogs: l }));
  const onUpdateHabits = (h: Habit[]) => setData(p => ({ ...p, habits: h }));
  const onUpdateMoodLogs = (m: MoodLog[]) => setData(p => ({ ...p, moodLogs: m }));
  const onUpdateJournals = (j: JournalEntry[]) => setData(p => ({ ...p, journals: j }));
  const onUpdateGoals = (g: Goal[]) => setData(p => ({ ...p, goals: g }));
  const onUpdateFinances = (f: FinancialLog[]) => setData(p => ({ ...p, finances: f }));
  const onUpdateVisionBoard = (v: VisionBoardItem[]) => setData(p => ({ ...p, visionBoard: v }));
  const onUpdateBucketList = (b: BucketListItem[]) => setData(p => ({ ...p, bucketList: b }));
  const onUpdateMemories = (m: MemoryEvent[]) => setData(p => ({ ...p, memories: m }));
  const onUpdateSettings = (s: ProfileSettings) => setData(p => ({ ...p, settings: s }));

  const onSelectTheme = (k: string) => setData(p => ({ ...p, settings: { ...p.settings, theme: k } }));

  // Dynamic header summaries
  const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <div className={`min-h-screen ${activeTheme.bg} ${activeTheme.text} transition-colors duration-500 flex flex-col md:flex-row relative`}>
      
      {/* SYSTEM NOTIFICATIONS OVERLAYS */}
      <div className="fixed bottom-6 right-6 z-55 space-y-2 pointer-events-none max-w-sm">
        {xpToasts.map(toast => (
          <div 
            key={toast.id} 
            className="flex items-center gap-2 bg-slate-900/95 backdrop-blur border border-indigo-500/30 text-white p-3.5 rounded-2xl shadow-2xl animate-bounce pointer-events-auto"
          >
            <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
            <span className="text-xs font-mono font-bold leading-none">{toast.msg}</span>
          </div>
        ))}
      </div>

      {/* MOBILE FLOATING BAR NAVIGATION HEADERS */}
      <div className="md:hidden p-4 bg-black/45 backdrop-blur-md border-b border-white/5 flex justify-between items-center z-40">
        <div className="flex items-center gap-1.5 font-mono text-sm tracking-widest font-bold">
          <Compass className="w-5 h-5 text-indigo-400" />
          LIFEOS
        </div>
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1 px-2.5 bg-white/5 border border-white/10 rounded-lg text-xs font-mono uppercase text-gray-300"
        >
          {sidebarOpen ? 'Close Menu' : 'Open Menu'}
        </button>
      </div>

      {/* SIDEBAR NAVIGATION CONTROLS */}
      <div className={`
        fixed inset-0 z-50 md:sticky md:block md:translate-x-0 transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0 bg-neutral-950/95 md:bg-transparent' : '-translate-x-full md:translate-x-0'}
      `}>
        {sidebarOpen && (
          <button 
            onClick={() => setSidebarOpen(false)}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        )}
        <Sidebar 
          currentTab={currentTab}
          setCurrentTab={(tab) => { setCurrentTab(tab); setSidebarOpen(false); }}
          data={data}
          updateTheme={onSelectTheme}
          theme={activeTheme}
          currentThemeKey={data.settings.theme}
        />
      </div>

      {/* PRIMARY ACTIVE CONTENT DISPLAY WINDOW */}
      <main className="flex-1 p-4 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
        
        {/* TOP STATUS HEADER BAR */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-4 relative">
          {searchQuery && (
            <div 
              className="fixed inset-0 z-40 cursor-default" 
              onClick={() => setSearchQuery('')}
            />
          )}

          <div className="z-10">
            <span className="text-[10px] font-mono tracking-widest text-indigo-400 uppercase">Core Dashboard Workspace</span>
            <div className="flex items-center gap-2 mt-1">
              <h1 className="text-2xl font-bold tracking-tight text-white capitalize">{currentTab.replace('-', ' ')}</h1>
              <span className="text-xs bg-white/5 px-2.5 py-1 rounded-full text-indigo-300 border border-white/5 font-mono">{todayStr}</span>
            </div>
          </div>

          {/* GLOBAL HEADER SEARCH BAR */}
          <div className="w-full md:max-w-md relative z-50">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search assignments, tasks, goals, journals..."
                className="w-full bg-black/35 text-xs pl-9 pr-8 py-2 rounded-2xl border border-white/10 focus:outline-none focus:border-indigo-500 focus:bg-black/50 text-gray-200 placeholder-gray-500 transition-all duration-300"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* FLOATING SEARCH RESULTS */}
            {searchQuery && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#121218]/95 backdrop-blur-lg border border-white/15 rounded-2xl shadow-2xl overflow-hidden max-h-[320px] overflow-y-auto z-50">
                <div className="p-2 border-b border-white/5 bg-black/20 flex justify-between items-center">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-indigo-400">Search Results</span>
                  <span className="text-[9px] text-gray-500 font-mono">TansLife 2.0 Indexer</span>
                </div>
                
                <div className="p-1.5 space-y-3">
                  {/* Category: Assignments */}
                  {data.assignments.filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 && (
                    <div>
                      <span className="text-[9px] font-mono text-pink-400 px-2 uppercase block mb-1">🎓 Assignments</span>
                      <div className="space-y-0.5">
                        {data.assignments
                          .filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase()))
                          .map(asg => (
                            <button
                              key={asg.id}
                              onClick={() => {
                                setCurrentTab('academic');
                                setSearchQuery('');
                                triggerXp(15, `Searched Assignment: ${asg.title} 🎓`);
                              }}
                              className="w-full text-left p-2 rounded-xl hover:bg-white/5 text-xs text-gray-300 hover:text-white flex justify-between items-center transition truncate cursor-pointer"
                            >
                              <span className="truncate flex-1">{asg.title}</span>
                              <span className="text-[8px] uppercase font-mono px-1.5 py-0.5 bg-pink-500/10 text-pink-300 rounded border border-pink-500/10 ml-2 shrink-0">{asg.priority}</span>
                            </button>
                          ))
                        }
                      </div>
                    </div>
                  )}

                  {/* Category: Tasks */}
                  {data.timelineTasks.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 && (
                    <div>
                      <span className="text-[9px] font-mono text-indigo-400 px-2 uppercase block mb-1">📋 Daily Tasks</span>
                      <div className="space-y-0.5">
                        {data.timelineTasks
                          .filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()))
                          .map(task => (
                            <button
                              key={task.id}
                              onClick={() => {
                                setCurrentTab('productivity');
                                setSearchQuery('');
                                triggerXp(15, `Searched Task: ${task.title} 📋`);
                              }}
                              className="w-full text-left p-2 rounded-xl hover:bg-white/5 text-xs text-gray-300 hover:text-white flex justify-between items-center transition truncate cursor-pointer"
                            >
                              <span className="truncate flex-1">{task.title}</span>
                              <span className="text-[8px] font-mono text-gray-500 ml-2 shrink-0">{task.startTime}</span>
                            </button>
                          ))
                        }
                      </div>
                    </div>
                  )}

                  {/* Category: Goals */}
                  {data.goals.filter(g => g.title.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 && (
                    <div>
                      <span className="text-[9px] font-mono text-emerald-400 px-2 uppercase block mb-1">🎯 Goals</span>
                      <div className="space-y-0.5">
                        {data.goals
                          .filter(g => g.title.toLowerCase().includes(searchQuery.toLowerCase()))
                          .map(goal => (
                            <button
                              key={goal.id}
                              onClick={() => {
                                setCurrentTab('goals');
                                setSearchQuery('');
                                triggerXp(15, `Searched Goal: ${goal.title} 🎯`);
                              }}
                              className="w-full text-left p-2 rounded-xl hover:bg-white/5 text-xs text-gray-300 hover:text-white flex justify-between items-center transition truncate cursor-pointer"
                            >
                              <span className="truncate flex-1">{goal.title}</span>
                              <span className="text-[8px] font-mono text-emerald-300 ml-2 shrink-0">{goal.progress}%</span>
                            </button>
                          ))
                        }
                      </div>
                    </div>
                  )}

                  {/* Category: Journals */}
                  {data.journals.filter(j => j.title.toLowerCase().includes(searchQuery.toLowerCase()) || j.content.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 && (
                    <div>
                      <span className="text-[9px] font-mono text-purple-400 px-2 uppercase block mb-1">📝 Journal Entries</span>
                      <div className="space-y-0.5">
                        {data.journals
                          .filter(j => j.title.toLowerCase().includes(searchQuery.toLowerCase()) || j.content.toLowerCase().includes(searchQuery.toLowerCase()))
                          .map(entry => (
                            <button
                              key={entry.id}
                              onClick={() => {
                                setCurrentTab('journal');
                                setSearchQuery('');
                                triggerXp(15, `Searched Journal: ${entry.title} 📝`);
                              }}
                              className="w-full text-left p-2 rounded-xl hover:bg-white/5 text-xs text-gray-300 hover:text-white flex flex-col transition cursor-pointer"
                            >
                              <span className="truncate font-medium w-full text-gray-200 text-left">{entry.title}</span>
                              <span className="text-[9px] text-gray-500 font-mono mt-0.5 text-left">{entry.date}</span>
                            </button>
                          ))
                        }
                      </div>
                    </div>
                  )}

                  {/* Empty state inside results */}
                  {data.assignments.filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 &&
                   data.timelineTasks.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 &&
                   data.goals.filter(g => g.title.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 &&
                   data.journals.filter(j => j.title.toLowerCase().includes(searchQuery.toLowerCase()) || j.content.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                    <div className="p-8 text-center text-gray-500 text-xs">
                      No matches found for "{searchQuery}"
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 z-10">
            {/* Preferences settings trigger shortcut */}
            <button 
              onClick={() => setCurrentTab('settings')}
              className="p-2 bg-black/25 text-gray-300 hover:text-white border border-white/10 rounded-2xl hover:bg-black/45 transition cursor-pointer"
              title="Global preferences"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* CONDITIONALLY RENDER SECTIONS BASED ON TAB CONTROLS */}
        <div className="focus-target-wrapper transition-opacity duration-300">
          {currentTab === 'dashboard' && (
            <DashboardOverview 
              data={data}
              setCurrentTab={setCurrentTab}
              theme={activeTheme}
              triggerXp={triggerXp}
              onUpdateSettings={onUpdateSettings}
            />
          )}

          {currentTab === 'calendar' && (
            <CalendarSection 
              data={data}
              onUpdateCalendarMarks={onUpdateCalendarMarks}
              onUpdateTimeline={onUpdateTimeline}
              theme={activeTheme}
              triggerXp={triggerXp}
            />
          )}

          {currentTab === 'academic' && (
            <AcademicSection 
              data={data}
              onUpdateSubjects={onUpdateSubjects}
              onUpdateAssignments={onUpdateAssignments}
              onUpdateExams={onUpdateExams}
              theme={activeTheme}
              triggerXp={triggerXp}
            />
          )}

          {currentTab === 'productivity' && (
            <ProductivitySection 
              data={data}
              onUpdateTimeline={onUpdateTimeline}
              onUpdateFocusLogs={onUpdateFocusLogs}
              theme={activeTheme}
              triggerXp={triggerXp}
            />
          )}

          {currentTab === 'habits' && (
            <HabitsMoodSection 
              data={data}
              onUpdateHabits={onUpdateHabits}
              onUpdateMoodLogs={onUpdateMoodLogs}
              theme={activeTheme}
              triggerXp={triggerXp}
            />
          )}

          {currentTab === 'journal' && (
            <JournalSection 
              data={data}
              onUpdateJournals={onUpdateJournals}
              theme={activeTheme}
              triggerXp={triggerXp}
            />
          )}

          {currentTab === 'goals' && (
            <GoalsSection 
              data={data}
              onUpdateGoals={onUpdateGoals}
              theme={activeTheme}
              triggerXp={triggerXp}
            />
          )}

          {currentTab === 'finances' && (
            <FinancialSection 
              data={data}
              onUpdateFinances={onUpdateFinances}
              theme={activeTheme}
              triggerXp={triggerXp}
            />
          )}

          {currentTab === 'life-plan' && (
            <LifePlanSection 
              data={data}
              onUpdateBucketList={onUpdateBucketList}
              onUpdateVisionBoard={onUpdateVisionBoard}
              onUpdateMemories={onUpdateMemories}
              theme={activeTheme}
              triggerXp={triggerXp}
            />
          )}

          {currentTab === 'ai' && (
            <AiAssistant 
              data={data}
              theme={activeTheme}
              triggerXp={triggerXp}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsSection 
              data={data}
              onUpdateSettings={onUpdateSettings}
              selectedThemeKey={data.settings.theme}
              onSelectTheme={onSelectTheme}
              themesMap={THEMES}
              theme={activeTheme}
              triggerXp={triggerXp}
            />
          )}
        </div>

      </main>

    </div>
  );
}
