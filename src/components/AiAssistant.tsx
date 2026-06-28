import React, { useState } from 'react';
import { 
  Cpu, 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  HelpCircle,
  AlertTriangle,
  BookmarkCheck,
  ChevronRight
} from 'lucide-react';
import { LifeOSData } from '../types';
import { ThemeConfig } from '../themes';

interface AiProps {
  data: LifeOSData;
  theme: ThemeConfig;
  triggerXp: (amount: number, toastName: string) => void;
}

export const AiAssistant: React.FC<AiProps> = ({
  data,
  theme,
  triggerXp
}) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    {
      role: 'assistant',
      content: `Greetings Tanishka! 🔮 I am pathfinder, your digital butler for TansLife 2.0.
      
I've analyzed your academic spreadsheet. You currently have **${data.assignments.filter(a => a.status !== 'Submitted').length} pending assignments**, active streaking habits, and your upcoming Quantum physics midterm in 5 days.

How can I optimize your schedules today? Click one of my dynamic commands below or start talking to me!`,
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [userInput, setUserInput] = useState('');

  const sendMessageToGemini = async (msgText: string) => {
    if (!msgText.trim()) return;

    const newMsgs = [...messages, { role: 'user' as const, content: msgText }];
    setMessages(newMsgs);
    setUserInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: msgText,
          fullData: data, // provide the full state context!
        }),
      });

      const responseData = await res.json();
      if (responseData.error) {
        setMessages([...newMsgs, { role: 'assistant', content: `⚠️ **AI Config alert**: ${responseData.error}` }]);
      } else {
        setMessages([...newMsgs, { role: 'assistant', content: responseData.reply }]);
        triggerXp(40, "AI Butler suggestion consulted!");
      }

    } catch (e) {
      console.error(e);
      setMessages([...newMsgs, { role: 'assistant', content: "⚠️ **System connection error**: Failed to reach Express server. Ensure dev server binds are responsive." }]);
    } finally {
      setLoading(false);
    }
  };

  const dynamicPrompts = [
    { title: "Suggest Study Plan", prompt: "Suggest a tailored weekly study revision plan focusing on Quantum Physics PHY-301." },
    { title: "Detect Overloaded Weeks", prompt: "Evaluate my semester assignments and exams schedules. Do we detect overloaded weeks?" },
    { title: "Recommend Breaks", prompt: "Recommend stress-relieving breaks based on my moods and daily timeline." },
    { title: "Generate Revision Steps", prompt: "Generate concrete 3-step revision schedules for my Machine Learning Cs-402 finals." }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 max-w-6xl mx-auto h-[calc(100vh-190px)] min-h-[550px]">
      
      {/* 1. CHAT HISTORY SHELF */}
      <div className={`lg:col-span-8 p-5 rounded-3xl ${theme.card} flex flex-col justify-between h-full`}>
        <div className="flex flex-col h-full justify-between">
          <div>
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <div className="flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-indigo-400 animate-pulse" />
                <h2 className="font-bold text-sm">TansLife 2.0 Smart Butler Console</h2>
              </div>
              <span className="text-[9px] uppercase font-mono px-2 py-0.5 bg-indigo-600/30 text-indigo-300 rounded font-bold">
                Online • Pathfinder v2.5
              </span>
            </div>
          </div>

          {/* Scrolling messages wrapper */}
          <div className="flex-1 my-3 overflow-y-auto space-y-3 pr-1 max-h-[350px] lg:max-h-[380px]">
            {messages.map((m, idx) => {
              const isBot = m.role === 'assistant';
              return (
                <div 
                  key={idx} 
                  className={`flex gap-3 max-w-[85%] ${isBot ? 'mr-auto' : 'ml-auto flex-row-reverse text-right'}`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    isBot ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/20' : 'bg-pink-600/20 text-pink-400 border border-pink-500/20'
                  }`}>
                    {isBot ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                  </div>

                  <div className={`p-3 rounded-2xl text-[11px] leading-relaxed whitespace-pre-wrap ${
                    isBot 
                      ? 'bg-black/15 text-gray-200 border border-white/5 rounded-tl-sm' 
                      : 'bg-indigo-600 text-white rounded-tr-sm text-left'
                  }`}>
                    {m.content}
                  </div>
                </div>
              );
            })}
            
            {loading && (
              <div className="flex gap-2 mr-auto items-center text-[10px] text-gray-500 font-mono">
                <span className="animate-spin text-indigo-400">🌀</span>
                <span>Pathfinder is decoding workload vectors...</span>
              </div>
            )}
          </div>

          {/* Prompt writer */}
          <form 
            onSubmit={(e) => { e.preventDefault(); sendMessageToGemini(userInput); }}
            className="flex items-center gap-2 border-t border-white/5 pt-2.5"
          >
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Ask me: Is my exam workload high? Create ML study cards..."
              disabled={loading}
              className="flex-1 p-2.5 bg-black/20 border border-white/10 rounded-xl text-xs focus:outline-none focus:border-indigo-400 text-slate-100 placeholder-gray-500"
            />
            <button 
              type="submit"
              disabled={loading || !userInput.trim()}
              className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 rounded-xl text-white transition flex items-center justify-center cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* 2. BUTLER OPERATIONS BAR */}
      <div className={`lg:col-span-4 p-5 rounded-3xl ${theme.card} flex flex-col justify-between h-full`}>
        <div className="space-y-4">
          <div className="border-b border-white/5 pb-2">
            <h3 className="font-bold flex items-center gap-1.5 text-gray-300 text-xs">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              Dynamic Auto Commands
            </h3>
            <p className="text-[9px] text-gray-400 mt-0.5">⚡ Quick-trigger pre-programmed agent optimizations</p>
          </div>

          <div className="flex flex-col gap-2">
            {dynamicPrompts.map((btn, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => sendMessageToGemini(btn.prompt)}
                disabled={loading}
                title={btn.prompt}
                className="text-left p-2.5 rounded-xl bg-black/20 border border-white/5 hover:border-indigo-500/30 text-xs transition hover:bg-black/35 group disabled:opacity-50 flex flex-col justify-between h-[52px] cursor-pointer"
              >
                <span className="font-bold text-gray-300 font-mono leading-tight group-hover:text-indigo-300 transition truncate w-full">{btn.title}</span>
                <span className="text-[9px] text-indigo-400 font-mono group-hover:text-indigo-300 mt-1">Run ⚡</span>
              </button>
            ))}
          </div>
        </div>

        {/* Pathfinder Memory Matrix */}
        <div className="p-3 bg-black/20 border border-white/5 rounded-2xl text-[9px] font-mono text-gray-400 leading-normal w-full mt-4">
          <div className="flex gap-1.5 items-center text-indigo-400 font-bold mb-1">
            <BookmarkCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>Memory Matrix Active</span>
          </div>
          <p className="text-gray-400 text-[9px] leading-relaxed">Syncs checklist, grades, mood, and habits securely for real-time tailored guidance.</p>
        </div>
      </div>

    </div>
  );
};
