import React, { useState, useRef } from 'react';
import { 
  Settings, 
  User, 
  Cpu, 
  MapPin, 
  Bell, 
  Sparkles, 
  CheckSquare, 
  Eye, 
  UserPlus,
  Upload,
  Image as ImageIcon,
  Link as LinkIcon
} from 'lucide-react';
import { ProfileSettings, LifeOSData } from '../types';
import { ThemeConfig } from '../themes';

interface SettingsProps {
  data: LifeOSData;
  onUpdateSettings: (newSettings: ProfileSettings) => void;
  selectedThemeKey: string;
  onSelectTheme: (key: string) => void;
  themesMap: Record<string, ThemeConfig>;
  theme: ThemeConfig;
  triggerXp: (amount: number, toastName: string) => void;
}

const PRESET_AVATARS = [
  { name: "Pixel Sage", url: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Tanishka" },
  { name: "Cyber Rebel", url: "https://api.dicebear.com/7.x/bottts/svg?seed=Rebel" },
  { name: "Scholar", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Scholar" },
  { name: "Lofi Dream", url: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Dreamer" },
  { name: "Gazer", url: "https://api.dicebear.com/7.x/fun-emoji/svg?seed=Stargazer" },
  { name: "Spunky", url: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Spunky" }
];

export const SettingsSection: React.FC<SettingsProps> = ({
  data,
  onUpdateSettings,
  selectedThemeKey,
  onSelectTheme,
  themesMap,
  theme,
  triggerXp
}) => {
  const [name, setName] = useState(data.settings.userName);
  const [city, setCity] = useState(data.settings.weatherLocation || 'Delhi');
  const [notify, setNotify] = useState(data.settings.notificationsEnabled);
  const [avatarUrl, setAvatarUrl] = useState(data.settings.avatarUrl || 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Tanishka');
  const [displayDensity, setDisplayDensity] = useState<'compact' | 'spacious'>(data.settings.displayDensity || 'spacious');
  const [customQuote, setCustomQuote] = useState(data.settings.customQuote || 'Your life is your own masterwork. Sculpt it daily with pristine intent.');
  const [customQuoteAuthor, setCustomQuoteAuthor] = useState(data.settings.customQuoteAuthor || 'Marcus Aurelius');
  const [isDragging, setIsDragging] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onUpdateSettings({
      ...data.settings,
      userName: name.trim(),
      theme: selectedThemeKey,
      weatherLocation: city.trim(),
      notificationsEnabled: notify,
      avatarUrl: avatarUrl,
      displayDensity: displayDensity,
      customQuote: customQuote.trim(),
      customQuoteAuthor: customQuoteAuthor.trim()
    });

    triggerXp(0, "Global Profile Parameters Saved! ⚙️");
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Strict warning details: Select/drop image types only.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setAvatarUrl(event.target.result as string);
        triggerXp(0, "Custom Profile Photo Loaded! 📸");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleApplyCustomUrl = () => {
    if (customUrlInput.trim()) {
      setAvatarUrl(customUrlInput.trim());
      setCustomUrlInput('');
      triggerXp(0, "Custom Web Avatar Connected! 🌐");
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      
      {/* 1. CONFIGURATION CONSOLE PANEL */}
      <div className={`xl:col-span-8 p-6 rounded-3xl ${theme.card} space-y-4`}>
        <div className="border-b border-white/5 pb-2.5">
          <h2 className="text-md font-bold flex items-center gap-1.5">
            <Settings className="w-5 h-5 text-indigo-400 rotate-45" />
            System Preferences Panel
          </h2>
          <p className="text-[10px] text-gray-400">Lock global username identifiers, notification vectors, and API weather coords:</p>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-4 text-xs text-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Username identifiers */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase text-gray-400 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-indigo-300" /> Username Identifier
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name display"
                required
                className="w-full p-2.5 bg-black/25 border border-white/10 rounded-xl focus:outline-none focus:border-indigo-400"
              />
            </div>

            {/* Weather coords */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase text-gray-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-pink-300" /> Weather Coords Latitude-Longitude Location
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. San Francisco"
                required
                className="w-full p-2.5 bg-black/25 border border-white/10 rounded-xl focus:outline-none focus:border-indigo-400"
              />
            </div>

          </div>

          {/* Motivational Core Quote Configuration */}
          <div className="p-4 bg-black/15 rounded-2xl border border-white/5 space-y-3">
            <h4 className="font-bold flex items-center gap-1.5 text-pink-300">
              <Sparkles className="w-4 h-4 text-pink-300 animate-pulse" /> Personal Core Quote Display
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
              <div className="md:col-span-8 space-y-1">
                <label className="text-[10px] font-mono uppercase text-gray-400">Custom Headline Quote</label>
                <textarea
                  value={customQuote}
                  onChange={(e) => setCustomQuote(e.target.value)}
                  placeholder="e.g. Your life is your own masterwork. Sculpt it daily with pristine intent."
                  rows={2}
                  className="w-full p-2.5 bg-black/25 border border-white/10 rounded-xl focus:outline-none focus:border-indigo-400 text-white"
                />
              </div>
              <div className="md:col-span-4 space-y-1">
                <label className="text-[10px] font-mono uppercase text-gray-400">Quote Author Attribution</label>
                <input
                  type="text"
                  value={customQuoteAuthor}
                  onChange={(e) => setCustomQuoteAuthor(e.target.value)}
                  placeholder="e.g. Marcus Aurelius"
                  className="w-full p-2.5 bg-black/25 border border-white/10 rounded-xl focus:outline-none focus:border-indigo-400 text-white"
                />
              </div>
            </div>
          </div>

          {/* Avatar Picture Configuration */}
          <div className="p-4 bg-black/15 rounded-2xl border border-white/5 space-y-4">
            <h4 className="font-bold flex items-center gap-1.5 text-pink-300">
              <ImageIcon className="w-4 h-4" /> Customize profile picture / avatar
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Left Column: Live Preview & Presets */}
              <div className="md:col-span-6 space-y-3">
                <span className="text-[10px] font-mono uppercase text-gray-400 block pb-1">Current Active Preview</span>
                <div className="flex items-center gap-4 bg-black/20 p-3 rounded-2xl border border-white/5">
                  <div className="relative flex-shrink-0">
                    <img 
                      src={avatarUrl} 
                      alt="Current avatar preview" 
                      className="w-16 h-16 rounded-full border-2 border-pink-400/60 object-cover bg-black/30"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-pink-500 text-black font-bold text-[8px] px-1 rounded-full uppercase scale-90">
                      LIVE
                    </div>
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-200">Interactive Image Node</h5>
                    <p className="text-[9px] text-gray-400 leading-tight">Your changes will update instantly across the sidebar and global console frames.</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-mono uppercase text-gray-400 block">Select from Premium Presets</span>
                  <div className="grid grid-cols-6 gap-2">
                    {PRESET_AVATARS.map((p) => {
                      const isSelected = avatarUrl === p.url;
                      return (
                        <button
                          type="button"
                          key={p.name}
                          onClick={() => {
                            setAvatarUrl(p.url);
                            triggerXp(10, `Preset ${p.name} chosen!`);
                          }}
                          className={`relative p-0.5 rounded-xl border transition-all hover:scale-105 bg-black/20 ${
                            isSelected ? 'border-pink-400 scale-105 shadow-md shadow-pink-400/10' : 'border-white/5 hover:border-white/25'
                          }`}
                          title={p.name}
                        >
                          <img 
                            src={p.url} 
                            alt={p.name} 
                            className="w-10 h-10 rounded-lg object-contain bg-black/10 mx-auto" 
                            referrerPolicy="no-referrer"
                          />
                          {isSelected && (
                            <div className="absolute -top-1 -right-1 bg-pink-500 w-3.5 h-3.5 rounded-full flex items-center justify-center border border-black shadow">
                              <span className="text-[8px] font-bold text-black font-mono">✓</span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column: Custom Image upload & Custom URL */}
              <div className="md:col-span-6 space-y-3">
                <span className="text-[10px] font-mono uppercase text-gray-400 block">Add your own pictures</span>
                
                {/* Drag-and-Drop + Click to Upload Dropzone */}
                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-1 h-24 ${
                    isDragging 
                      ? 'border-pink-400 bg-pink-400/10 scale-102' 
                      : 'border-white/10 bg-black/25 hover:border-white/20 hover:bg-black/35'
                  }`}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/*" 
                    className="hidden" 
                  />
                  <Upload className={`w-5 h-5 ${isDragging ? 'text-pink-400 animate-bounce' : 'text-gray-400'}`} />
                  <span className="text-[10px] font-medium text-gray-300">
                    Drag & Drop your picture or <span className="text-pink-300 underline font-semibold">Browse</span>
                  </span>
                  <p className="text-[8px] text-gray-500 uppercase">JPEG, PNG, SVG or WebP files</p>
                </div>

                {/* URL Connector */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono uppercase text-gray-400 block">Or Paste Custom Image Link URL</span>
                  <div className="flex gap-1.5">
                    <div className="relative flex-1">
                      <LinkIcon className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-400" />
                      <input
                        type="url"
                        value={customUrlInput}
                        onChange={(e) => setCustomUrlInput(e.target.value)}
                        placeholder="https://example.com/your-image.jpg"
                        className="w-full pl-8 pr-2.5 py-2 bg-black/30 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-pink-300"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleApplyCustomUrl();
                          }
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleApplyCustomUrl}
                      className="bg-black/30 hover:bg-black/45 hover:text-white text-gray-300 border border-white/10 px-3 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1"
                    >
                      Connect
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>


          {/* Notifications setting */}
          <div className="p-3 bg-black/15 rounded-2xl border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h4 className="font-bold flex items-center gap-1">
                  <Bell className="w-3.5 h-3.5 text-indigo-400" />
                  Enable Smart Notifications
                </h4>
                <p className="text-[9px] text-gray-400">Triggers custom sound alerts before midterm exam deadlines start ticking.</p>
              </div>

              <input
                type="checkbox"
                checked={notify}
                onChange={(e) => setNotify(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded bg-black/30 border-white/10 focus:ring-indigo-500 cursor-pointer"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold py-2.5 rounded-xl transition"
          >
            Save Preferences
          </button>
        </form>
      </div>

      {/* 2. CORE THEME REVIEWS */}
      <div className={`xl:col-span-4 p-6 rounded-3xl ${theme.card} flex flex-col justify-between`}>
        <div className="space-y-4">
          <div className="border-b border-white/5 pb-2">
            <h3 className="font-bold flex items-center gap-1 text-gray-300">
              <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
              Physical Layout Theme
            </h3>
            <p className="text-[10px] text-gray-400">Lock color gradients to represent your aesthetic study mood:</p>
          </div>

          {/* Render Theme buttons mapping */}
          <div className="grid grid-cols-3 gap-1.5 pb-2">
            {Object.keys(themesMap).map((themeKey) => {
              const item = themesMap[themeKey];
              const isSelected = selectedThemeKey === themeKey;
              return (
                <button
                  type="button"
                  key={themeKey}
                  onClick={() => { onSelectTheme(themeKey); triggerXp(40, `Layout theme updated to: ${themeKey}`); }}
                  title={item.name}
                  className={`p-2 rounded-xl border flex flex-col justify-between items-center text-center transition-all cursor-pointer ${
                    isSelected 
                      ? 'border-indigo-400 bg-white/10 scale-[1.02] shadow shadow-indigo-400/20' 
                      : 'border-white/5 bg-black/15 hover:border-white/10'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full bg-gradient-to-r ${item.gradient} shadow-sm`} />
                  <span className={`text-[10px] font-mono truncate w-full mt-1.5 ${isSelected ? 'text-indigo-300 font-bold' : 'text-gray-400 font-normal'}`}>
                    {themeKey}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Locked Profile system indicators */}
        <div className="text-[9px] font-mono text-gray-500 text-center leading-relaxed mt-4 p-2.5 border border-white/5 bg-black/10 rounded-xl">
          TansLife 2.0 utilizes LocalStorage registers ensuring local data stays client-authoritative.
        </div>
      </div>

    </div>
  );
};
