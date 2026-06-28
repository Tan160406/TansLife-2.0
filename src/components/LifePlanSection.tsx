import React, { useState } from 'react';
import { 
  Layers, 
  Plus, 
  Trash, 
  Check, 
  Sparkles, 
  Compass, 
  Heart, 
  Gift, 
  Calendar,
  AlertTriangle,
  MapPin
} from 'lucide-react';
import { BucketListItem, VisionBoardItem, MemoryEvent, LifeOSData } from '../types';
import { ThemeConfig } from '../themes';

interface LifeProps {
  data: LifeOSData;
  onUpdateBucketList: (newBucket: BucketListItem[]) => void;
  onUpdateVisionBoard: (newBoard: VisionBoardItem[]) => void;
  onUpdateMemories: (newMemories: MemoryEvent[]) => void;
  theme: ThemeConfig;
  triggerXp: (amount: number, toastName: string) => void;
}

export const LifePlanSection: React.FC<LifeProps> = ({
  data,
  onUpdateBucketList,
  onUpdateVisionBoard,
  onUpdateMemories,
  theme,
  triggerXp
}) => {
  // Toggle forms
  const [showAddVision, setShowAddVision] = useState(false);
  const [showAddBucket, setShowAddBucket] = useState(false);
  const [showAddMemory, setShowAddMemory] = useState(false);

  // States inputs
  const [visionTitle, setVisionTitle] = useState('');
  const [visionImg, setVisionImg] = useState('');
  const [visionCat, setVisionCat] = useState<'career' | 'edu' | 'travel' | 'lifestyle'>('career');
  const [visionDesc, setVisionDesc] = useState('');

  const [bucketTitle, setBucketTitle] = useState('');

  const [memTitle, setMemTitle] = useState('');
  const [memDesc, setMemDesc] = useState('');
  const [memDate, setMemDate] = useState(new Date().toISOString().split('T')[0]);
  const [memCat, setMemCat] = useState<'academic' | 'milestone' | 'travel' | 'personal'>('academic');

  const handleAddVision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visionTitle.trim() || !visionImg.trim()) return;

    const newItem: VisionBoardItem = {
      id: `vb-${Date.now()}`,
      title: visionTitle.trim(),
      category: visionCat,
      imageUrl: visionImg.trim(),
      description: visionDesc.trim() || undefined
    };

    onUpdateVisionBoard([...data.visionBoard, newItem]);
    setVisionTitle('');
    setVisionImg('');
    setVisionDesc('');
    setShowAddVision(false);
    triggerXp(100, `Vision Board Target Added: ${newItem.title}`);
  };

  const handleDeleteVision = (id: string) => {
    onUpdateVisionBoard(data.visionBoard.filter(item => item.id !== id));
  };

  const handleAddBucket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bucketTitle.trim()) return;

    const newItem: BucketListItem = {
      id: `bl-${Date.now()}`,
      title: bucketTitle.trim(),
      completed: false
    };

    onUpdateBucketList([...data.bucketList, newItem]);
    setBucketTitle('');
    setShowAddBucket(false);
    triggerXp(50, `Bucket List Registered: ${newItem.title}`);
  };

  const toggleBucket = (id: string) => {
    const adjusted = data.bucketList.map(item => {
      if (item.id === id) {
        const nextVal = !item.completed;
        if (nextVal) triggerXp(0, `Bucket List accomplished: ${item.title}! 🎉`);
        return {
          ...item,
          completed: nextVal,
          completedDate: nextVal ? new Date().toISOString().split('T')[0] : undefined
        };
      }
      return item;
    });
    onUpdateBucketList(adjusted);
  };

  const handleDeleteBucket = (id: string) => {
    onUpdateBucketList(data.bucketList.filter(item => item.id !== id));
  };

  const handleAddMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memTitle.trim() || !memDesc.trim()) return;

    const newMem: MemoryEvent = {
      id: `m-ev-${Date.now()}`,
      title: memTitle.trim(),
      description: memDesc.trim(),
      date: memDate,
      category: memCat
    };

    onUpdateMemories([newMem, ...data.memories]);
    setMemTitle('');
    setMemDesc('');
    setShowAddMemory(false);
    triggerXp(100, `Memory Event Chronicled: ${newMem.title}`);
  };

  const handleDeleteMemory = (id: string) => {
    onUpdateMemories(data.memories.filter(m => m.id !== id));
  };

  return (
    <div className="space-y-6">
      
      {/* 1. VISION BOARD CONTAINER (DREAM GRIDS) */}
      <div className={`p-6 rounded-3xl ${theme.card} space-y-4`}>
        <div className="flex justify-between items-center border-b border-white/5 pb-3">
          <div>
            <h2 className="text-md font-bold flex items-center gap-1.5 text-pink-400">
              <Compass className="w-5 h-5 animate-spin-slow text-pink-400" />
              Manifestation Vision Board
            </h2>
            <p className="text-[10px] text-gray-400">Envision your dream colleges, tech setups, and travel targets:</p>
          </div>
          <button 
            onClick={() => setShowAddVision(!showAddVision)}
            className="bg-pink-605 hover:bg-pink-500 text-white bg-pink-600 px-3 py-1.5 rounded-xl text-xs font-mono font-bold font-semibold transition"
          >
            + Pin Vision
          </button>
        </div>

        {/* Vision board pin prompt */}
        {showAddVision && (
          <form onSubmit={handleAddVision} className="bg-black/25 p-3.5 rounded-xl border border-white/5 space-y-2 text-xs text-white">
            <h3 className="font-bold text-[10px] uppercase text-pink-300 font-mono">Pin Dream Visual</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <input
                type="text"
                value={visionTitle}
                onChange={(e) => setVisionTitle(e.target.value)}
                placeholder="Dream College, job, destination title"
                required
                className="p-2 bg-black/30 border border-white/10 rounded-lg text-xs"
              />
              <input
                type="text"
                value={visionImg}
                onChange={(e) => setVisionImg(e.target.value)}
                placeholder="Unsplash absolute photo URL"
                required
                className="p-2 bg-black/30 border border-white/10 rounded-lg text-xs"
              />
              <select
                value={visionCat}
                onChange={(e) => setVisionCat(e.target.value as any)}
                className="p-2 bg-black/30 border border-white/10 rounded-lg text-xs text-white"
              >
                <option value="career">Work & Career</option>
                <option value="edu">Elite Universities</option>
                <option value="travel">Expeditions</option>
                <option value="lifestyle">Ambient setups</option>
              </select>
              <input
                type="text"
                value={visionDesc}
                onChange={(e) => setVisionDesc(e.target.value)}
                placeholder="Short aspiration summary memo..."
                className="p-2 bg-black/30 border border-white/10 rounded-lg text-xs"
              />
            </div>
            <div className="flex justify-end gap-3 font-mono pt-1">
              <button type="submit" className="bg-pink-600 px-3.5 py-1 rounded text-white font-bold">Pin Goal</button>
            </div>
          </form>
        )}

        {/* Responsive Polaroids display grids */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {data.visionBoard.map((vb) => (
            <div key={vb.id} className="p-3 rounded-2xl bg-white text-black shadow-lg transform hover:-rotate-1 hover:scale-101 transition-all">
              <div className="relative">
                <img 
                  src={vb.imageUrl || "https://images.unsplash.com/photo-1541339907198-e08756dedf3f"} 
                  alt={vb.title}
                  className="w-full h-44 rounded-lg object-cover shadow-inner"
                />
                <button
                  onClick={() => handleDeleteVision(vb.id)}
                  className="absolute top-2 right-2 p-1.5 bg-black/55 text-white hover:text-red-400 hover:bg-black/80 rounded-full transition"
                  title="Remove Goal"
                >
                  <Trash className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Polaroid bottom white area with descriptive elegant typography */}
              <div className="pt-3 pb-1 text-center space-y-1">
                <span className="text-[8px] font-mono uppercase font-bold text-indigo-605 tracking-widest bg-indigo-50 px-1.5 py-0.5 rounded text-indigo-600">
                  {vb.category}
                </span>
                <h4 className="font-bold text-xs tracking-tight text-neutral-900 font-mono pt-1">{vb.title}</h4>
                {vb.description && <p className="text-[10px] font-sans text-neutral-500 italic">"{vb.description}"</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* 2. BUCKET LIST MANAGEMENT SYSTEM */}
        <div className={`xl:col-span-5 p-6 rounded-3xl ${theme.card} space-y-4`}>
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <div>
              <h3 className="font-bold flex items-center gap-1">
                <Gift className="w-4 h-4 text-emerald-400" />
                Bucket List Milestones
              </h3>
              <p className="text-[10px] text-gray-400">Log experiences to achieve premium badges:</p>
            </div>
            
            <button
              onClick={() => setShowAddBucket(!showAddBucket)}
              className="bg-emerald-650 hover:bg-emerald-500 text-white bg-emerald-600 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition"
            >
              + Add Experience
            </button>
          </div>

          {showAddBucket && (
            <form onSubmit={handleAddBucket} className="bg-black/25 p-3 rounded-xl border border-white/5 flex gap-2">
              <input
                type="text"
                value={bucketTitle}
                onChange={(e) => setBucketTitle(e.target.value)}
                placeholder="e.g. Publish Computer Vision paper"
                required
                className="flex-grow p-2 bg-black/30 border border-white/10 rounded-xl text-xs"
              />
              <button type="submit" className="bg-emerald-600 px-3.5 rounded-xl text-xs font-mono font-bold text-white">Save</button>
            </form>
          )}

          {/* List bucket items */}
          <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
            {data.bucketList.map((item) => (
              <div 
                key={item.id}
                className={`p-3 rounded-2xl border flex items-center justify-between gap-4 transition-all ${
                  item.completed 
                    ? 'border-emerald-500/20 bg-emerald-950/5 opacity-60' 
                    : 'border-white/5 bg-black/10 hover:border-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleBucket(item.id)}
                    className={`w-5.5 h-5.5 rounded-lg border flex items-center justify-center transition-all ${
                      item.completed 
                        ? 'bg-emerald-600 border-emerald-500 text-white' 
                        : 'border-white/20 bg-black/20 hover:border-emerald-400'
                    }`}
                  >
                    {item.completed && <Check className="w-3.5 h-3.5" />}
                  </button>
                  <div>
                    <h4 className={`text-xs font-medium ${item.completed ? 'line-through text-gray-500 font-mono' : 'text-gray-200'}`}>
                      {item.title}
                    </h4>
                    {item.completedDate && (
                      <span className="text-[8px] font-mono text-emerald-400">Accomplished on: {item.completedDate}</span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteBucket(item.id)}
                  className="p-1 text-gray-500 hover:text-red-450 transition text-gray-500 hover:text-red-400"
                  title="Remove asset"
                >
                  <Trash className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 3. HISTORIC MEMORIES TIMELINE MAP */}
        <div className={`xl:col-span-7 p-6 rounded-3xl ${theme.card} space-y-4`}>
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <div>
              <h3 className="font-bold flex items-center gap-1.5 text-indigo-400">
                <Calendar className="w-4 h-4 text-indigo-400 animate-pulse" />
                Histograph Memory Timeline
              </h3>
              <p className="text-[10px] text-gray-400">A timeline of your life highlights and academic achievements:</p>
            </div>
            
            <button
              onClick={() => setShowAddMemory(!showAddMemory)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition"
            >
              + Record Event
            </button>
          </div>

          {/* Form memory log prompt */}
          {showAddMemory && (
            <form onSubmit={handleAddMemory} className="bg-black/20 p-4 rounded-xl border border-white/5 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <input
                  type="text"
                  value={memTitle}
                  onChange={(e) => setMemTitle(e.target.value)}
                  placeholder="e.g. Won Inter-University Hackathon"
                  required
                  className="p-2 bg-black/30 border border-white/10 rounded-xl text-xs flex-grow"
                />
                <input
                  type="date"
                  value={memDate}
                  onChange={(e) => setMemDate(e.target.value)}
                  className="p-2 bg-black/30 border border-white/10 rounded-xl text-xs"
                />
                <select
                  value={memCat}
                  onChange={(e) => setMemCat(e.target.value as any)}
                  className="p-2 bg-black/30 border border-white/10 rounded-xl text-xs text-white"
                >
                  <option value="academic">Academic Honor</option>
                  <option value="milestone">Life Milestone</option>
                  <option value="travel">Travel Voyage</option>
                  <option value="personal">Personal Success</option>
                </select>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={memDesc}
                  onChange={(e) => setMemDesc(e.target.value)}
                  placeholder="Write a concise description of this memory block..."
                  required
                  className="flex-grow p-2 bg-black/30 border border-white/10 rounded-xl text-xs"
                />
                <button type="submit" className="bg-indigo-400 px-4 rounded-xl text-xs text-slate-900 font-mono font-bold">Chronicle</button>
              </div>
            </form>
          )}

          {/* Map timelines */}
          <div className="space-y-4 max-h-[280px] overflow-y-auto pr-1">
            {data.memories.map((mem) => {
              const iconPreset = {
                academic: '🎓',
                milestone: '🏆',
                travel: '✈️',
                personal: '💖',
              };

              return (
                <div key={mem.id} className="relative pl-6 border-l border-indigo-500/20 space-y-1 group">
                  {/* Timeline dot marker node */}
                  <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-indigo-500 ring-4 ring-indigo-500/10 group-hover:scale-125 transition-all" />
                  
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <span className="text-[9px] font-mono text-indigo-400 font-bold uppercase">
                        {iconPreset[mem.category]} {mem.category} • {mem.date}
                      </span>
                      <h4 className="text-xs font-bold font-mono text-white leading-tight mt-0.5">{mem.title}</h4>
                      <p className="text-[11px] text-gray-400 leading-relaxed mt-1">{mem.description}</p>
                    </div>

                    <button
                      onClick={() => handleDeleteMemory(mem.id)}
                      className="p-1 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition duration-200"
                      title="Delete event record"
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
    </div>
  );
};
