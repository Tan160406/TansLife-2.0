import React, { useState } from 'react';
import { 
  Target, 
  Plus, 
  Trash, 
  CheckSquare, 
  Award, 
  Sparkles, 
  ListTodo,
  TrendingUp,
  Heart,
  Edit2
} from 'lucide-react';
import { Goal, LifeOSData } from '../types';
import { ThemeConfig } from '../themes';

interface GoalsProps {
  data: LifeOSData;
  onUpdateGoals: (newGoals: Goal[]) => void;
  theme: ThemeConfig;
  triggerXp: (amount: number, toastName: string) => void;
}

export const GoalsSection: React.FC<GoalsProps> = ({
  data,
  onUpdateGoals,
  theme,
  triggerXp
}) => {
  const [goalType, setGoalType] = useState<'long-term' | 'short-term'>('long-term');
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalDeadline, setNewGoalDeadline] = useState('');
  const [showAddGoal, setShowAddGoal] = useState(false);

  // States for Editing existing goals
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [editGoalTitle, setEditGoalTitle] = useState('');
  const [editGoalType, setEditGoalType] = useState<'long-term' | 'short-term'>('short-term');
  const [editGoalDeadline, setEditGoalDeadline] = useState('');

  const startEditingGoal = (goal: Goal) => {
    setEditingGoalId(goal.id);
    setEditGoalTitle(goal.title);
    setEditGoalType(goal.type);
    setEditGoalDeadline(goal.deadline || '');
  };

  const saveEditedGoal = (id: string) => {
    if (!editGoalTitle.trim()) return;
    const updated = data.goals.map(g => {
      if (g.id === id) {
        return {
          ...g,
          title: editGoalTitle.trim(),
          type: editGoalType,
          deadline: editGoalDeadline || undefined
        };
      }
      return g;
    });
    onUpdateGoals(updated);
    setEditingGoalId(null);
    triggerXp(85, "Goal updated successfully!");
  };

  // Achievements gamified state variables
  const [selectedAchIdx, setSelectedAchIdx] = useState<number | null>(null);
  const [claimedAchs, setClaimedAchs] = useState<string[]>([]);
  const [achFilter, setAchFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  // Milestone input helpers
  const [milestoneInputs, setMilestoneInputs] = useState<string[]>(['', '']);

  const handleUpdateMilestoneCount = (delta: number) => {
    if (delta > 0) {
      setMilestoneInputs([...milestoneInputs, '']);
    } else if (milestoneInputs.length > 1) {
      setMilestoneInputs(milestoneInputs.slice(0, -1));
    }
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;

    // Filter out blank milestones
    const cleanMilestones = milestoneInputs
      .filter(m => m.trim() !== '')
      .map((m, idx) => ({
        id: `ms-${Date.now()}-${idx}`,
        title: m.trim(),
        completed: false
      }));

    const newGoal: Goal = {
      id: `g-${Date.now()}`,
      title: newGoalTitle.trim(),
      type: goalType,
      deadline: newGoalDeadline || undefined,
      progress: 0,
      milestones: cleanMilestones,
      completed: false
    };

    onUpdateGoals([...data.goals, newGoal]);
    
    // Clear inputs
    setNewGoalTitle('');
    setNewGoalDeadline('');
    setMilestoneInputs(['', '']);
    setShowAddGoal(false);
    triggerXp(120, `New Goal Configured: ${newGoal.title}`);
  };

  const toggleMilestone = (goalId: string, milestoneId: string) => {
    const adjusted = data.goals.map(goal => {
      if (goal.id === goalId) {
        const milestones = goal.milestones.map(ms => {
          if (ms.id === milestoneId) {
            const nextVal = !ms.completed;
            if (nextVal) triggerXp(40, `Milestone Achieved: ${ms.title}`);
            return { ...ms, completed: nextVal };
          }
          return ms;
        });

        // Recalculate progress rate
        const checkedCount = milestones.filter(m => m.completed).length;
        const total = milestones.length;
        const nextProgress = total > 0 ? Math.round((checkedCount / total) * 100) : 0;
        const isGoalFinished = nextProgress === 100;

        if (isGoalFinished && !goal.completed) {
          triggerXp(0, `Major Goal Complete: ${goal.title}! 🎉`);
        }

        return {
          ...goal,
          milestones,
          progress: nextProgress,
          completed: isGoalFinished
        };
      }
      return goal;
    });

    onUpdateGoals(adjusted);
  };

  const deleteGoal = (id: string) => {
    onUpdateGoals(data.goals.filter(g => g.id !== id));
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      
      {/* 1. GOALS DIRECTORY & CONSOLE */}
      <div className={`xl:col-span-12 p-6 rounded-3xl ${theme.card} flex flex-col justify-between min-h-[480px]`}>
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <div>
              <h2 className="text-md font-bold flex items-center gap-1.5">
                <Target className="w-5 h-5 text-indigo-400" />
                Durable Milestones & Goals Master
              </h2>
              <p className="text-[10px] text-gray-400">Lock long-term academic grades & tech achievements:</p>
            </div>

            <button
              onClick={() => setShowAddGoal(!showAddGoal)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition"
            >
              + Launch Goal
            </button>
          </div>

          {/* Goals creation form */}
          {showAddGoal && (
            <form onSubmit={handleCreateGoal} className="bg-black/20 p-4 rounded-xl border border-white/5 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <input
                  type="text"
                  value={newGoalTitle}
                  onChange={(e) => setNewGoalTitle(e.target.value)}
                  placeholder="e.g. Master React & Web Engines State"
                  required
                  className="p-2.5 bg-black/30 border border-white/10 rounded-xl text-xs flex-1 text-white focus:outline-none focus:border-indigo-500"
                />
                <select
                  value={goalType}
                  onChange={(e) => setGoalType(e.target.value as any)}
                  className="p-2.5 bg-black/30 border border-white/10 rounded-xl text-xs text-white"
                >
                  <option value="long-term">Long-Term Goal</option>
                  <option value="short-term">Short-Term Target</option>
                </select>
                <input
                  type="date"
                  value={newGoalDeadline}
                  onChange={(e) => setNewGoalDeadline(e.target.value)}
                  className="p-2.5 bg-black/30 border border-white/10 rounded-xl text-xs text-white"
                />
              </div>

              {/* Dynamic milestones triggers */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between items-center">
                  <label className="text-[9px] uppercase font-mono text-gray-400">Assemble Milestone Steps:</label>
                  <div className="flex gap-1.5">
                    <button type="button" onClick={() => handleUpdateMilestoneCount(-1)} className="px-1.5 py-0.5 bg-black/30 text-xs rounded font-bold">-</button>
                    <button type="button" onClick={() => handleUpdateMilestoneCount(1)} className="px-1.5 py-0.5 bg-indigo-500/30 text-xs text-indigo-300 rounded font-bold">+</button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 max-h-[110px] overflow-y-auto">
                  {milestoneInputs.map((val, idx) => (
                    <input
                      key={idx}
                      type="text"
                      value={val}
                      onChange={(e) => {
                        const copy = [...milestoneInputs];
                        copy[idx] = e.target.value;
                        setMilestoneInputs(copy);
                      }}
                      placeholder={`Milestone Step ${idx + 1}`}
                      className="p-2 bg-black/30 border border-white/10 rounded-lg text-xs"
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowAddGoal(false)} className="text-xs text-gray-400 font-mono">Cancel</button>
                <button type="submit" className="bg-indigo-600 px-4 py-1.5 rounded-xl text-xs font-mono font-bold">Register Goal</button>
              </div>
            </form>
          )}

          {/* Render goals dynamic list */}
          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
            {data.goals.map((g) => {
              const borderCol = g.completed ? 'border-emerald-500/20 bg-emerald-950/5' : 'border-white/5 bg-black/10';
              return (
                <div key={g.id} className={`p-4 rounded-3xl border ${borderCol} space-y-4`}>
                  {editingGoalId === g.id ? (
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-gray-400 uppercase">Edit Goal Title</label>
                        <input
                          type="text"
                          value={editGoalTitle}
                          onChange={(e) => setEditGoalTitle(e.target.value)}
                          className="w-full text-xs p-2 bg-black/45 border border-white/10 rounded-xl text-white font-mono placeholder-gray-500"
                          placeholder="e.g. Master React & Web Engines State"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-gray-400 uppercase">Goal Type</label>
                          <select
                            value={editGoalType}
                            onChange={(e) => setEditGoalType(e.target.value as any)}
                            className="w-full text-xs p-2 bg-black/45 border border-white/10 rounded-xl text-white font-mono"
                          >
                            <option value="long-term">Long-Term Goal</option>
                            <option value="short-term">Short-Term Target</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-gray-400 uppercase">Deadline Date</label>
                          <input
                            type="date"
                            value={editGoalDeadline}
                            onChange={(e) => setEditGoalDeadline(e.target.value)}
                            className="w-full text-xs p-2 bg-black/45 border border-white/10 rounded-xl text-white font-mono"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setEditingGoalId(null)}
                          className="text-[10px] text-gray-400 font-mono hover:text-white px-2 py-1 transition"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => saveEditedGoal(g.id)}
                          className="text-[10px] bg-indigo-600 hover:bg-indigo-550 text-white font-mono font-bold px-3 py-1 rounded-lg cursor-pointer transition"
                        >
                          Save Update
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className="text-[8px] uppercase font-mono px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded-md border border-indigo-500/10 font-bold">
                          {g.type}
                        </span>
                        <h3 className="text-xs font-bold mt-1.5 font-mono text-white leading-tight">{g.title}</h3>
                        {g.deadline && <span className="text-[9px] font-mono text-gray-400">Target complete date: {g.deadline}</span>}
                      </div>

                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => startEditingGoal(g)}
                          className="p-1 text-gray-500 hover:text-indigo-400 transition"
                          title="Edit goal"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteGoal(g.id)}
                          className="p-1 text-gray-500 hover:text-red-400 transition"
                          title="Abort goal"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Progress representations */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                      <span>Milestones checklist completion:</span>
                      <span className="text-gray-300 font-bold">{g.progress}% Complete</span>
                    </div>
                    <div className="w-full bg-black/45 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${g.completed ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                        style={{ width: `${g.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Checkable milestone list */}
                  {g.milestones.length > 0 && (
                    <div className="bg-black/15 p-2 rounded-2xl border border-white/5 shadow-inner space-y-1">
                      {g.milestones.map((ms) => (
                        <div 
                          key={ms.id}
                          onClick={() => toggleMilestone(g.id, ms.id)}
                          className="flex items-center gap-2 cursor-pointer p-1 rounded-md hover:bg-white/5"
                        >
                          <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition-all ${
                            ms.completed ? 'bg-indigo-650 border-indigo-500 text-white bg-indigo-650' : 'border-white/30 bg-black/20'
                          }`}>
                            {ms.completed && <CheckSquare className="w-2.5 h-2.5 text-white" />}
                          </div>
                          <span className={`text-[10px] font-mono ${ms.completed ? 'line-through text-gray-500' : 'text-gray-300'}`}>
                            {ms.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
