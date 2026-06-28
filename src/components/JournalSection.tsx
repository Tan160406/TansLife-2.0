import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Trash, 
  Sparkles, 
  ChevronRight, 
  Search, 
  Tag, 
  Heart, 
  Bookmark,
  ChevronDown
} from 'lucide-react';
import { JournalEntry, LifeOSData } from '../types';
import { ThemeConfig } from '../themes';

interface JournalProps {
  data: LifeOSData;
  onUpdateJournals: (newJournals: JournalEntry[]) => void;
  theme: ThemeConfig;
  triggerXp: (amount: number, toastName: string) => void;
}

export const JournalSection: React.FC<JournalProps> = ({
  data,
  onUpdateJournals,
  theme,
  triggerXp
}) => {
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Create state inputs
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['#Personal']);
  const [imageUrl, setImageUrl] = useState('');

  const [activeEntry, setActiveEntry] = useState<JournalEntry | null>(data.journals[0] || null);

  const tagsPreset = ['#College', '#Exams', '#Travel', '#Ideas', '#Personal'];

  const toggleFormTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSaveJournal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const newEntry: JournalEntry = {
      id: `j-${Date.now()}`,
      title: title.trim(),
      content: content.trim(),
      date: new Date().toISOString().split('T')[0],
      tags: selectedTags,
      imageUrl: imageUrl.trim() || undefined
    };

    const updated = [newEntry, ...data.journals];
    onUpdateJournals(updated);
    setActiveEntry(newEntry);
    
    // Clear inputs
    setTitle('');
    setContent('');
    setImageUrl('');
    setSelectedTags(['#Personal']);
    
    triggerXp(0, "Journal Written! Memory Saved ✍️");
  };

  const handleDeleteJournal = (id: string) => {
    const updated = data.journals.filter(j => j.id !== id);
    onUpdateJournals(updated);
    if (activeEntry?.id === id) {
      setActiveEntry(updated[0] || null);
    }
  };

  // Filters logic
  const filteredJournals = data.journals.filter(entry => {
    const matchTag = selectedTag === 'All' || entry.tags.includes(selectedTag);
    const matchSearch = entry.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        entry.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchTag && matchSearch;
  });

  return (
    <div className="space-y-6">
      
      <div className={`p-5 rounded-2xl ${theme.card} flex flex-col md:flex-row justify-between items-center gap-4`}>
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-400" />
          <h2 className="text-xl font-bold">Personal Daily Journal</h2>
        </div>

        {/* Filters and tag searchers */}
        <div className="flex flex-wrap gap-1.5 items-center bg-black/20 p-1.5 rounded-xl">
          <button
            onClick={() => setSelectedTag('All')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium font-mono ${
              selectedTag === 'All' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            #All
          </button>
          {tagsPreset.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium font-mono ${
                selectedTag === tag ? 'bg-indigo-600/30 text-white border border-indigo-500/20' : 'text-gray-400 hover:text-white'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* JOURNAL LIST ARCHIVE */}
        <div className={`xl:col-span-4 p-6 rounded-3xl ${theme.card} space-y-4 max-h-[580px] overflow-y-auto`}>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search journals..."
              className="w-full text-xs pl-9 pr-4 py-2 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-indigo-400 text-slate-100"
            />
          </div>

          <div className="space-y-3">
            {filteredJournals.map((entry) => {
              const isActive = activeEntry?.id === entry.id;
              return (
                <div
                  key={entry.id}
                  onClick={() => setActiveEntry(entry)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isActive 
                      ? 'bg-white/15 border-indigo-400 scale-[1.01]' 
                      : 'border-white/5 bg-black/10 hover:border-white/10'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[9px] font-mono text-gray-400">{entry.date}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteJournal(entry.id); }}
                      className="text-gray-500 hover:text-red-400 transition p-0.5"
                    >
                      <Trash className="w-3 h-3" />
                    </button>
                  </div>
                  
                  <h3 className="text-xs font-bold font-mono tracking-tight text-white mt-1.5 truncate">
                    {entry.title}
                  </h3>
                  
                  <p className="text-[11px] text-gray-400 line-clamp-2 mt-1 whitespace-pre-wrap leading-relaxed">
                    {entry.content}
                  </p>

                  <div className="flex flex-wrap gap-1 mt-3">
                    {entry.tags.map(t => (
                      <span key={t} className="text-[9px] font-mono px-1.5 py-0.5 bg-indigo-500/10 text-indigo-400 rounded-md border border-indigo-500/10">
                        {t}
                      </span>
                    ))}
                  </div>

                </div>
              );
            })}
          </div>
        </div>

        {/* EDIT & ACTIVE VIEWER TERMINAL */}
        <div className={`xl:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6`}>
          
          {/* Active entry document viewer */}
          <div className={`p-6 rounded-3xl ${theme.card} flex flex-col justify-between min-h-[480px]`}>
            {activeEntry ? (
              <div className="space-y-4 h-full flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                    <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider">💾 Memory Registry</span>
                    <span className="text-[10px] font-mono text-gray-400">{activeEntry.date}</span>
                  </div>

                  <h2 className="text-sm font-bold font-mono mt-3 text-white leading-tight">
                    {activeEntry.title}
                  </h2>
                  
                  {activeEntry.imageUrl && (
                    <img 
                      src={activeEntry.imageUrl} 
                      alt="Journal visual attachments" 
                      className="w-full h-36 rounded-xl object-cover border border-white/10 my-3"
                    />
                  )}

                  <p className="text-xs text-gray-300 whitespace-pre-wrap leading-relaxed mt-4">
                    {activeEntry.content}
                  </p>
                </div>

                <div className="flex gap-1 pt-3 border-t border-white/5 mt-4">
                  {activeEntry.tags.map(t => (
                    <span key={t} className="text-[10px] font-mono px-2 py-0.5 bg-pink-500/25 text-pink-300 rounded-md">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center text-gray-500 h-full">
                <Bookmark className="w-10 h-10 mb-2 opacity-35" />
                <p className="text-xs italic">Select a memory from the sidebar to analyze, or compile another below.</p>
              </div>
            )}
          </div>

          {/* Create new document terminal */}
          <div className={`p-6 rounded-3xl ${theme.card} flex flex-col justify-between`}>
            <form onSubmit={handleSaveJournal} className="space-y-4 flex flex-col justify-between h-full">
              <div className="space-y-3">
                <div className="border-b border-white/5 pb-2 font-mono text-xs font-bold text-gray-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                  Compile New Life Entry
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-gray-400">Memory Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="E.g. Midterm victories & code sprints"
                    required
                    className="w-full text-xs p-2.5 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-indigo-400 text-slate-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-gray-400">Journal Content</label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Draft thoughts, code strategies, life insights..."
                    required
                    className="w-full text-xs p-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-indigo-400 h-40 resize-none text-slate-100 leading-relaxed"
                  />
                </div>

                {/* Tags checklists */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-gray-400">Select entry tags</label>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {tagsPreset.map((tag) => {
                      const isChecked = selectedTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleFormTag(tag)}
                          className={`text-[9px] font-mono px-2 py-1 rounded-md border ${
                            isChecked 
                              ? 'bg-indigo-650 text-white border-indigo-400 bg-indigo-600' 
                              : 'border-white/5 bg-black/10 text-gray-300'
                          }`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-gray-450">Unsplash Link or Polaroid attachment (optional)</label>
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="E.g. https://images.unsplash.com/photo-..."
                    className="w-full text-[10px] p-2 bg-black/20 border border-white/10 rounded-xl text-slate-300"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl text-xs font-mono font-bold font-semibold transition mt-4"
              >
                Compile Journal Profile
              </button>

            </form>
          </div>

        </div>

      </div>
    </div>
  );
};
