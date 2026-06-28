import React, { useState } from 'react';
import { 
  DollarSign, 
  Plus, 
  Trash, 
  ArrowUpRight, 
  ArrowDownLeft, 
  PiggyBank, 
  Sparkles,
  Award,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';
import { FinancialLog, LifeOSData } from '../types';
import { ThemeConfig } from '../themes';

interface FinProps {
  data: LifeOSData;
  onUpdateFinances: (newFinances: FinancialLog[]) => void;
  theme: ThemeConfig;
  triggerXp: (amount: number, toastName: string) => void;
}

export const FinancialSection: React.FC<FinProps> = ({
  data,
  onUpdateFinances,
  theme,
  triggerXp
}) => {
  const [showAddLog, setShowAddLog] = useState(false);
  
  // States inputs
  const [type, setType] = useState<'income' | 'expense' | 'savings'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food & Meals');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense' | 'savings'>('all');

  const handleQuickAdd = (title: string, amt: number, cat: string, t: 'income' | 'expense' | 'savings') => {
    const newLog: FinancialLog = {
      id: `f-tr-${Date.now()}`,
      type: t,
      amount: amt,
      category: cat,
      date: new Date().toISOString().split('T')[0],
      description: title
    };
    onUpdateFinances([...data.finances, newLog]);
    triggerXp(40, `Quick recorded ₹${amt} for ${title}!`);
  };

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0 || !description.trim()) return;

    const newLog: FinancialLog = {
      id: `f-tr-${Date.now()}`,
      type,
      amount: Number(amount),
      category,
      date,
      description: description.trim()
    };

    onUpdateFinances([...data.finances, newLog]);
    setAmount('');
    setDescription('');
    setShowAddLog(false);
    triggerXp(50, `Transaction Registered: ₹${newLog.amount} in ${newLog.category}`);
  };

  const deleteTransaction = (id: string) => {
    onUpdateFinances(data.finances.filter(f => f.id !== id));
  };

  // Helper values
  const totalIncome = data.finances
    .filter(f => f.type === 'income')
    .reduce((acc, current) => acc + current.amount, 0);

  const totalExpense = data.finances
    .filter(f => f.type === 'expense')
    .reduce((acc, current) => acc + current.amount, 0);

  const totalSavings = data.finances
    .filter(f => f.type === 'savings')
    .reduce((acc, current) => acc + current.amount, 0);

  const netBalance = totalIncome - totalExpense - totalSavings;
  const isBudgetCritical = totalExpense > totalIncome * 0.7 && totalIncome > 0; // alerting if spend > 70% income

  const categoriesPreset = {
    income: [
      'Freelance Design', 
      'Scholarship', 
      'Allowance & Pocket Money', 
      'Part-time Job', 
      'Gifts',
      'Stipend / Internships',
      'Academic Prize',
      'Consulting / Tutoring',
      'Resale / Secondhand Items',
      'Investments / Interest Dividends',
      'Other Inflow'
    ],
    expense: [
      'Food & Meals', 
      'Rent & Housing', 
      'Subscriptions & Digital Services', 
      'Textbooks & Course Materials', 
      'Travel & Transport', 
      'Leisure & Entertainment', 
      'Gifts & Donations',
      'Stationery & Supplies',
      'Gym & Health',
      'Clothing & Apparel',
      'Gadgets & Hardware',
      'Utilities (Electricity, Internet, Mobile)',
      'Cafe & Coffee',
      'Emergency / Miscellaneous'
    ],
    savings: [
      'Tech Fund', 
      'Travel Savings', 
      'Emergency savings', 
      'Investment Fund',
      'Retirement Plan',
      'Educational Course Fund',
      'Major Purchase Goal'
    ]
  };

  return (
    <div className="space-y-6">
      
      {/* 1. BALANCES SUMMARY ROW */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Total Assets Balance Card */}
        <div className={`p-5 rounded-3xl ${theme.card} flex items-center justify-between`}>
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-gray-400 uppercase">Available Net Balance</span>
            <h3 className={`text-2xl font-bold font-mono ${netBalance >= 0 ? 'text-indigo-400' : 'text-red-400'}`}>
              ₹{netBalance}
            </h3>
            <p className="text-[9px] text-gray-500">Asset buffer ratio</p>
          </div>
          <span className="text-xl font-bold opacity-30 text-indigo-400 font-mono">₹</span>
        </div>

        {/* Total Income balance sheet */}
        <div className={`p-5 rounded-3xl ${theme.card} flex items-center justify-between`}>
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-gray-400 uppercase">Monthly Inflow</span>
            <h3 className="text-2xl font-bold font-mono text-emerald-400">
              +₹{totalIncome}
            </h3>
            <span className="text-[9px] text-emerald-400/80 font-mono flex items-center gap-0.5">
              <ArrowUpRight className="w-3 h-3" /> Inflow assets
            </span>
          </div>
          <ArrowUpRight className="w-8 h-8 opacity-25 text-emerald-400" />
        </div>

        {/* Expenses tracker */}
        <div className={`p-5 rounded-3xl ${theme.card} flex items-center justify-between`}>
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-gray-400 uppercase">Cash Outflow</span>
            <h3 className="text-2xl font-bold font-mono text-red-400">
              -₹{totalExpense}
            </h3>
            <span className="text-[9px] text-red-400/80 font-mono flex items-center gap-0.5">
              <ArrowDownLeft className="w-3 h-3" /> Outflow ledger
            </span>
          </div>
          <ArrowDownLeft className="w-8 h-8 opacity-25 text-red-400" />
        </div>

        {/* Dynamic Savings Vault */}
        <div className={`p-5 rounded-3xl ${theme.card} flex items-center justify-between`}>
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-gray-400 uppercase">Savings Vault</span>
            <h3 className="text-2xl font-bold font-mono text-cyan-400">
              ₹{totalSavings}
            </h3>
            <span className="text-[9px] text-cyan-400/80 font-mono flex items-center gap-0.5">
              <PiggyBank className="w-3 h-3" /> Compound index
            </span>
          </div>
          <PiggyBank className="w-8 h-8 opacity-25 text-cyan-300" />
        </div>

      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* LEDGERS REGISTER LOG */}
        <div className={`xl:col-span-8 p-6 rounded-3xl ${theme.card} space-y-4 max-h-[480px] overflow-y-auto`}>
          <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
            <div>
              <h2 className="text-md font-bold flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-indigo-400 animate-pulse" />
                Durable Transaction Ledgers
              </h2>
              <p className="text-[10px] text-gray-400">Analyze current outflows, food expenses, and subscription plans:</p>
            </div>

            <button
              onClick={() => { setShowAddLog(!showAddLog); setCategory(categoriesPreset[type][0]); }}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all"
            >
              + Register Outflow
            </button>
          </div>

          {/* Quick-add ledger template buttons */}
          <div className="bg-black/15 p-3 rounded-2xl border border-white/5 space-y-2">
            <span className="text-[9px] font-mono uppercase text-indigo-400 font-bold block">⚡ 1-Click Fast Ledger Logger</span>
            <div className="flex flex-wrap gap-1.5 font-mono">
              <button
                type="button"
                onClick={() => handleQuickAdd('Cafe Craft Coffee', 120, 'Food & Meals', 'expense')}
                className="px-2.5 py-1 bg-black/35 hover:bg-black/55 border border-white/5 hover:border-white/10 rounded-xl text-[9.5px] text-gray-300 transition-all cursor-pointer"
              >
                ☕ Coffee (₹120)
              </button>
              <button
                type="button"
                onClick={() => handleQuickAdd('Student Dinner Meal', 350, 'Food & Meals', 'expense')}
                className="px-2.5 py-1 bg-black/35 hover:bg-black/55 border border-white/5 hover:border-white/10 rounded-xl text-[9.5px] text-gray-300 transition-all cursor-pointer"
              >
                🍕 Lunch Meal (₹350)
              </button>
              <button
                type="button"
                onClick={() => handleQuickAdd('GitHub Copilot Sub', 820, 'Subscriptions', 'expense')}
                className="px-2.5 py-1 bg-black/35 hover:bg-black/55 border border-white/5 hover:border-white/10 rounded-xl text-[9.5px] text-gray-300 transition-all cursor-pointer"
              >
                💻 GitHub Copilot (₹820)
              </button>
              <button
                type="button"
                onClick={() => handleQuickAdd('Freelance Coding Gig', 3500, 'Freelance Design', 'income')}
                className="px-2.5 py-1 bg-emerald-950/25 hover:bg-emerald-950/50 border border-emerald-500/10 rounded-xl text-[9.5px] text-emerald-400 font-semibold transition-all cursor-pointer"
              >
                🎓 Freelance +₹3.5k
              </button>
              <button
                type="button"
                onClick={() => handleQuickAdd('Piggy Savings Deposit', 1000, 'Tech Fund', 'savings')}
                className="px-2.5 py-1 bg-cyan-950/25 hover:bg-cyan-950/50 border border-cyan-500/10 rounded-xl text-[9.5px] text-cyan-400 font-semibold transition-all cursor-pointer"
              >
                🐷 Deposit ₹1k
              </button>
            </div>
          </div>

          {/* Interactive filter categories */}
          <div className="flex flex-wrap items-center gap-2 py-1.5 border-t border-b border-white/5 font-mono text-[9.5px]">
            <span className="text-gray-500 uppercase font-bold mr-1">Filter ledger:</span>
            {(['all', 'expense', 'income', 'savings'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setFilterType(mode)}
                className={`px-3 py-1 rounded-lg font-bold border transition capitalize ${
                  filterType === mode
                    ? 'bg-indigo-600 border-indigo-555 text-white shadow-sm'
                    : 'bg-black/20 border-white/5 text-slate-400 hover:text-white hover:border-white/10'
                }`}
              >
                {mode === 'all' ? 'All Ledgers' : mode === 'expense' ? 'Expenses' : mode === 'income' ? 'Income' : 'Piggy Savings'}
              </button>
            ))}
          </div>

          {/* Warning banner of critical expenses */}
          {isBudgetCritical && (
            <div className="bg-red-950/60 border border-red-500/20 text-red-300 p-3.5 rounded-2xl text-xs flex items-start gap-2 animate-pulse">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Overload Warning: High Outflow ratio detected!</span>
                <p className="text-[10px] opacity-85 mt-0.5">Your cash outflow is greater than 70% of inflows. We recommend freezing leisure expenses & subscriptions.</p>
              </div>
            </div>
          )}

          {/* Add transaction modal/form */}
          {showAddLog && (
            <form onSubmit={handleAddTransaction} className="bg-black/25 p-4 rounded-xl border border-white/5 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <select
                  value={type}
                  onChange={(e) => {
                    const sel = e.target.value as any;
                    setType(sel);
                    setCategory(categoriesPreset[sel][0]);
                  }}
                  className="p-2.5 bg-black/30 border border-white/10 rounded-xl text-xs text-slate-100"
                >
                  <option value="expense">📉 Expense Outflow</option>
                  <option value="income">📈 Income Inflow</option>
                  <option value="savings">🐷 Piggy Savings</option>
                </select>

                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="In Rupees (₹)"
                  required
                  min="0"
                  step="any"
                  className="p-2.5 bg-black/30 border border-white/10 rounded-xl text-xs text-white"
                />

                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="p-2.5 bg-black/30 border border-white/10 rounded-xl text-xs text-white"
                >
                  {categoriesPreset[type].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>

                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="p-2.5 bg-black/30 border border-white/10 rounded-xl text-xs text-white"
                />
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Weekly study-group sushi dinner"
                  required
                  className="flex-1 p-2.5 bg-black/30 border border-white/10 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
                <button type="submit" className="bg-indigo-600 px-4 rounded-xl text-xs font-mono font-bold font-semibold text-white">Save Log</button>
              </div>
            </form>
          )}

          {/* Ledger logs listed */}
          <div className="space-y-2">
            {data.finances
              .filter(f => filterType === 'all' ? true : f.type === filterType)
              .map((log) => {
              
              const valColors = {
                income: 'text-emerald-400 font-bold',
                expense: 'text-red-400',
                savings: 'text-cyan-400 font-medium'
              };

              const actionSymbol = {
                income: '+',
                expense: '-',
                savings: '•'
              };

              return (
                <div key={log.id} className="p-3.5 rounded-2xl bg-black/10 border border-white/5 flex justify-between items-center text-xs">
                  <div className="flex gap-3 items-center">
                    <span className="text-lg p-1.5 bg-black/25 rounded-md flex items-center justify-center">
                      {log.type === 'income' ? '📈' : log.type === 'expense' ? '📉' : '🐷'}
                    </span>
                    <div>
                      <h4 className="font-bold text-gray-100">{log.description}</h4>
                      <div className="flex gap-2 text-[9px] font-mono text-gray-400">
                        <span className="text-indigo-400">{log.category}</span>
                        <span>•</span>
                        <span>{log.date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`font-mono font-bold text-md ${valColors[log.type]}`}>
                      {actionSymbol[log.type]}₹{log.amount}
                    </span>
                    <button
                      onClick={() => deleteTransaction(log.id)}
                      className="p-1 text-gray-500 hover:text-red-400 transition"
                      title="Erase log"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* FINANCES STAGE TARGETS */}
        <div className={`xl:col-span-4 p-6 rounded-3xl ${theme.card} flex flex-col justify-between`}>
          <div className="space-y-4">
            <div className="border-b border-white/5 pb-2">
              <h3 className="font-bold flex items-center gap-1.5 text-white">
                🛡️ Outflow Budget Guideline
              </h3>
              <p className="text-[10px] text-gray-400">Optimal breakdown percentages matching student profiles:</p>
            </div>

            <div className="space-y-4 pt-2">
              {[
                { 
                  title: 'Food & Meals (Target: <30%)', 
                  desc: 'Daily meals, student pantry', 
                  color: 'bg-indigo-500', 
                  amount: data.finances.filter(f => f.category === 'Food & Meals' && f.type === 'expense').reduce((sum, f) => sum + f.amount, 0),
                  targetPct: 30
                },
                { 
                  title: 'Subscriptions (Target: <10%)', 
                  desc: 'GitHub, Spotify, Notion, Copilot', 
                  color: 'bg-pink-500', 
                  amount: data.finances.filter(f => f.category === 'Subscriptions' && f.type === 'expense').reduce((sum, f) => sum + f.amount, 0),
                  targetPct: 10
                },
                { 
                  title: 'Leisure & Rest (Target: <20%)', 
                  desc: 'Gaming lounges, cinemas, events', 
                  color: 'bg-amber-500', 
                  amount: data.finances.filter(f => (f.category === 'Leisure' || f.category === 'Leisure & Rest') && f.type === 'expense').reduce((sum, f) => sum + f.amount, 0),
                  targetPct: 20
                },
                { 
                  title: 'Savings Buffer (Target: >20%)', 
                  desc: 'Pushed to Piggy Vault', 
                  color: 'bg-emerald-500', 
                  amount: totalSavings,
                  targetPct: 20
                },
              ].map((bgG, idx) => {
                const maxBudgetPool = totalIncome > 0 ? totalIncome : 10000;
                const spendPct = Math.min(100, Math.round((bgG.amount / maxBudgetPool) * 100));
                const isOverBudget = bgG.targetPct && spendPct > bgG.targetPct && bgG.title.indexOf('Savings') === -1;

                return (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between text-[10px] font-mono">
                      <span className={`font-bold ${isOverBudget ? 'text-red-400 animate-pulse font-bold' : 'text-gray-300'}`}>
                        {bgG.title}
                      </span>
                      <span className="text-indigo-300 font-bold">₹{bgG.amount}</span>
                    </div>
                    <div className="w-full bg-black/45 h-1.5 rounded-full overflow-hidden relative">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${isOverBudget ? 'bg-red-500' : bgG.color}`} 
                        style={{ width: `${Math.max(3, spendPct)}%` }} 
                      />
                    </div>
                    <div className="flex justify-between text-[8px] font-mono text-gray-400 leading-none">
                      <span>{spendPct}% of pool used (₹{maxBudgetPool} ref)</span>
                      {isOverBudget && <span className="text-red-405 font-bold text-red-400 font-bold">Over Target Plan!</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Secure financial backing indicators */}
          <div className="text-[9px] font-mono text-gray-500 p-2 border border-white/5 rounded-xl bg-black/10 text-center leading-relaxed mt-4">
            Financial figures are client-side only and held locally under security guidelines.
          </div>
        </div>

      </div>
    </div>
  );
};
