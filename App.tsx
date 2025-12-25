
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Book as BookIcon, 
  Library, 
  GraduationCap, 
  Search, 
  Plus, 
  Settings as SettingsIcon, 
  LayoutDashboard, 
  Languages, 
  Star, 
  X,
  Trash2,
  RefreshCw,
  Edit3,
  Download,
  FileText,
  Upload,
  CheckCircle2,
  BarChart3,
  User,
  ChevronDown,
  Database,
  Globe,
  Bookmark,
  TrendingUp,
  PieChart,
  Calendar,
  BookOpen,
  ArrowUpDown,
  Sun,
  Moon,
  Cloud,
  Wind,
  Heart,
  Palette,
  RotateCcw,
  FlipHorizontal,
  ShieldCheck
} from 'lucide-react';
import { Book, Genre, Vocabulary, Note, UserProfile } from './types';
import { getDefinition } from './services/geminiService';

const AVATAR_STYLES = [
  { id: 'adventurer', label: 'Explorer' },
  { id: 'avataaars', label: 'Persona' },
  { id: 'big-ears', label: 'Fable' },
  { id: 'big-smile', label: 'Jolly' },
  { id: 'bottts', label: 'Droid' },
  { id: 'croodles', label: 'Doodle' },
  { id: 'fun-emoji', label: 'Emoji' },
  { id: 'lorelei', label: 'Scholar' },
  { id: 'notionists', label: 'Writer' },
  { id: 'open-peeps', label: 'Citizen' },
  { id: 'personas', label: 'Minimal' },
  { id: 'pixel-art', label: '8-Bit' }
];

type SortOption = 'recent' | 'title' | 'author' | 'rating';
type ThemeMode = 'dawn' | 'dusk';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [books, setBooks] = useState<Book[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [theme, setTheme] = useState<ThemeMode>('dawn');
  const [isProfileEditing, setIsProfileEditing] = useState(false);
  const [isAvatarStudioOpen, setIsAvatarStudioOpen] = useState(false);
  
  const [profile, setProfile] = useState<UserProfile>({
    name: 'Air Voyager',
    bio: 'Breathing life into literature and decoding the unknown.',
    readingGoal: 30,
    favoriteGenre: 'Philosophy',
    avatarSeed: 'save-the-air',
    avatarChoice: 'notionists',
    avatarFlip: false,
    avatarRotate: 0
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    try {
      const savedBooks = localStorage.getItem('book_corner_data');
      const savedProfile = localStorage.getItem('book_corner_profile');
      const savedTheme = localStorage.getItem('book_corner_theme') as ThemeMode;
      if (savedBooks && savedBooks !== "undefined") setBooks(JSON.parse(savedBooks));
      if (savedProfile && savedProfile !== "undefined") setProfile(JSON.parse(savedProfile));
      if (savedTheme) setTheme(savedTheme);
    } catch (error) {
      console.error("Hydration Error:", error);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('book_corner_data', JSON.stringify(books));
    localStorage.setItem('book_corner_profile', JSON.stringify(profile));
    localStorage.setItem('book_corner_theme', theme);
  }, [books, profile, theme]);

  const stats = useMemo(() => {
    const genreCount: Record<string, number> = {};
    books.forEach(b => {
      genreCount[b.genre] = (genreCount[b.genre] || 0) + 1;
    });

    return {
      total: books.length,
      completed: books.filter(b => b.isCompleted).length,
      active: books.filter(b => !b.isCompleted).length,
      vocabulary: books.reduce((acc, b) => acc + b.dictionary.length, 0),
      academic: books.filter(b => b.isCollegeMaterial).length,
      genreDistribution: genreCount,
      completionRate: books.length ? Math.round((books.filter(b => b.isCompleted).length / books.length) * 100) : 0,
      progressToGoal: Math.min(100, Math.round((books.filter(b => b.isCompleted).length / (profile.readingGoal || 1)) * 100))
    };
  }, [books, profile.readingGoal]);

  const filteredBooks = useMemo(() => {
    let result = [...books];
    if (activeTab === 'college') result = result.filter(b => b.isCollegeMaterial);
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(b => 
        b.title.toLowerCase().includes(q) || 
        b.author.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'author') return a.author.localeCompare(b.author);
      if (sortBy === 'rating') return b.rating - a.rating;
      return b.lastUpdated - a.lastUpdated; 
    });

    return result;
  }, [books, activeTab, searchQuery, sortBy]);

  const handleAddBook = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const now = Date.now();
    const title = formData.get('title') as string;
    const newBook: Book = {
      id: now.toString(),
      title,
      author: formData.get('author') as string,
      source: formData.get('source') as string,
      genre: formData.get('genre') as Genre,
      subgenres: [],
      currentChapter: Number(formData.get('chapter')) || 1,
      rating: 0,
      isCompleted: false,
      notes: [],
      dictionary: [],
      isCollegeMaterial: formData.get('isCollege') === 'on',
      lastUpdated: now,
      dateStarted: now,
      progressHistory: [{ date: new Date().toISOString().split('T')[0], chapter: Number(formData.get('chapter')) || 1 }],
      coverUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(title)}&backgroundColor=8A9A5B,8E9AAF,D2B48C`
    };
    setBooks([newBook, ...books]);
    setIsAddModalOpen(false);
  };

  const updateBook = (updated: Book) => {
    setBooks(books.map(b => b.id === updated.id ? { ...updated, lastUpdated: Date.now() } : b));
    if (selectedBook?.id === updated.id) setSelectedBook(updated);
  };

  const handleProfileSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setProfile({
      ...profile,
      name: formData.get('name') as string,
      bio: formData.get('bio') as string,
      readingGoal: Number(formData.get('readingGoal')),
      favoriteGenre: formData.get('favoriteGenre') as string
    });
    setIsProfileEditing(false);
  };

  const getAvatarUrl = (p: UserProfile) => {
    return `https://api.dicebear.com/7.x/${p.avatarChoice}/svg?seed=${p.avatarSeed}&flip=${p.avatarFlip ? 'true' : 'false'}&rotate=${p.avatarRotate || 0}`;
  };

  const NavItem: React.FC<{ id: string; active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
    <button 
      onClick={onClick} 
      className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-[1.8rem] text-sm font-semibold transition-all ${
        active 
        ? 'bg-[#8A9A5B] text-white shadow-lg' 
        : 'text-[#5A6D60] hover:bg-[#E5E4E2]/40'
      }`}
    >
      <span className={active ? 'text-[#FFF1E1]' : 'text-[#8E9AAF]'}>{icon}</span>
      {label}
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <nav className="w-full md:w-72 bg-transparent border-r border-[#border] p-8 flex flex-col md:fixed h-full z-30 no-print">
        <div className="flex items-center gap-4 mb-12 px-2 animate-float">
          <div className="p-3 bg-[#8A9A5B] text-white rounded-2xl shadow-xl">
            <Cloud size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold serif-font tracking-tight leading-none">Book Corner</h1>
            <p className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-40 mt-1">Sanctuary</p>
          </div>
        </div>

        <div className="flex-1 space-y-8 overflow-y-auto scrollbar-hide">
          <div>
            <p className="text-[10px] font-bold opacity-30 uppercase tracking-[0.3em] px-3 mb-3">Main View</p>
            <div className="space-y-1.5">
              <NavItem id="dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={20}/>} label="Dashboard" />
              <NavItem id="stats" active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} icon={<BarChart3 size={20}/>} label="Reader Stats" />
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold opacity-30 uppercase tracking-[0.3em] px-3 mb-3">Collections</p>
            <div className="space-y-1.5">
              <NavItem id="library" active={activeTab === 'library'} onClick={() => setActiveTab('library')} icon={<Library size={20}/>} label="The Shelf" />
              <NavItem id="college" active={activeTab === 'college'} onClick={() => setActiveTab('college')} icon={<GraduationCap size={20}/>} label="Academic Wing" />
              <NavItem id="dictionary" active={activeTab === 'dictionary'} onClick={() => setActiveTab('dictionary')} icon={<Languages size={20}/>} label="Dictionary" />
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold opacity-30 uppercase tracking-[0.3em] px-3 mb-3">Personal</p>
            <div className="space-y-1.5">
              <NavItem id="profile" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<User size={20}/>} label="Profile" />
              <NavItem id="sync" active={activeTab === 'sync'} onClick={() => setActiveTab('sync')} icon={<Database size={20}/>} label="Data Sync" />
              <NavItem id="settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<SettingsIcon size={20}/>} label="Atmosphere" />
            </div>
          </div>
        </div>

        <div className="mt-auto pt-8 border-t border-[#border]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-full rainbow-gradient p-0.5 animate-pulse">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                    <Wind size={12} className="text-[#8A9A5B]" />
                  </div>
               </div>
               <span className="text-[10px] font-bold opacity-40 tracking-widest uppercase">Save the Air</span>
            </div>
            <button 
              onClick={() => setTheme(theme === 'dawn' ? 'dusk' : 'dawn')}
              className="p-3 glass-card hover:bg-white/50 transition-all text-[#8E9AAF]"
            >
              {theme === 'dawn' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 md:ml-72 p-8 md:p-12 animate-in relative">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-16 no-print">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-[2rem] p-1 border-2 border-[#8E9AAF]/30 shadow-inner">
              <img src={getAvatarUrl(profile)} className="w-full h-full rounded-[1.8rem] bg-white object-cover" alt="Avatar" />
            </div>
            <div>
              <h2 className="text-4xl font-bold serif-font tracking-tight">
                {activeTab === 'dashboard' && 'Greetings'}
                {activeTab === 'stats' && 'Insights'}
                {activeTab === 'library' && 'Curations'}
                {activeTab === 'college' && 'Academy'}
                {activeTab === 'dictionary' && 'Lexicon'}
                {activeTab === 'profile' && 'Persona'}
                {activeTab === 'sync' && 'Safehouse'}
                {activeTab === 'settings' && 'Canvas'}
              </h2>
              <p className="text-sm font-medium opacity-50 mt-1 flex items-center gap-2">
                <Cloud size={14} className="text-[#8A9A5B]" />
                {profile.name} • Atmosphere: {theme === 'dawn' ? 'Fresh Dawn' : 'Glistening Dusk'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-80">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 opacity-30" size={18} />
              <input 
                type="text" placeholder="Locate a scroll..."
                className="w-full pl-14 pr-6 py-4 glass-card bg-white/40 border-none outline-none focus:ring-4 focus:ring-[#8A9A5B]/10 text-sm placeholder:opacity-40"
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 bg-[#8A9A5B] text-white px-8 py-4 rounded-[2rem] shadow-xl hover:scale-105 transition-all font-bold text-sm">
              <Plus size={22} /> Add Book
            </button>
          </div>
        </div>

        <div className="space-y-12">
          {activeTab === 'dashboard' && (
            <div className="space-y-16">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <StatBox label="Sanctuary" value={stats.total} icon={<BookIcon size={20}/>} color="#E5E4E2" />
                <StatBox label="Completed" value={stats.completed} icon={<CheckCircle2 size={20}/>} color="#8A9A5B" />
                <StatBox label="Definitions" value={stats.vocabulary} icon={<Languages size={20}/>} color="#8E9AAF" />
                <StatBox label="Progress" value={`${stats.progressToGoal}%`} icon={<TrendingUp size={20}/>} color="#D2B48C" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold serif-font flex items-center gap-3">
                      <BookOpen size={24} className="text-[#8A9A5B]" /> Open Scrolls
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    {books.filter(b => !b.isCompleted).slice(0, 4).map(book => (
                      <div key={book.id} onClick={() => setSelectedBook(book)} className="glass-card p-6 flex gap-6 cursor-pointer group">
                        <div className="relative flex-shrink-0">
                          <img src={book.coverUrl} className="w-24 h-36 rounded-2xl shadow-xl object-cover transition-all group-hover:scale-110" alt={book.title} />
                          <div className="absolute -top-3 -left-3 bg-[#D2B48C] text-white px-3 py-1 rounded-full text-[9px] font-bold shadow-md uppercase tracking-widest">
                            {book.genre}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <h4 className="font-bold text-xl serif-font truncate leading-tight group-hover:text-[#8A9A5B] transition-colors">{book.title}</h4>
                            <p className="text-xs opacity-50 truncate mt-1">{book.author}</p>
                          </div>
                          <div className="pt-4">
                            <div className="flex justify-between text-[10px] font-bold uppercase mb-2 opacity-60">
                              <span>Chapter {book.currentChapter}</span>
                              <span>Reading</span>
                            </div>
                            <div className="h-2 w-full bg-[#8E9AAF]/10 rounded-full overflow-hidden shadow-inner">
                              <div className="h-full bg-gradient-to-r from-[#8A9A5B] to-[#8E9AAF]" style={{ width: '55%' }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {books.filter(b => !b.isCompleted).length === 0 && (
                      <div className="col-span-2 p-16 text-center glass-card border-dashed">
                        <Wind className="mx-auto mb-6 opacity-10" size={64} />
                        <p className="text-lg font-medium opacity-40 italic">The air is still. All scrolls are returned to their shelves.</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-8">
                  <h3 className="text-2xl font-bold serif-font flex items-center gap-3">
                    <Heart size={24} className="text-[#8E9AAF]" /> Deciphered
                  </h3>
                  <div className="glass-card p-8 space-y-6">
                    {books.flatMap(b => b.dictionary).sort((a,b) => b.dateAdded - a.dateAdded).slice(0, 5).map(v => (
                      <div key={v.id} className="pb-5 border-b border-[#border] last:border-0 last:pb-0 group">
                        <div className="flex justify-between items-center mb-1.5">
                          <p className="font-bold text-base group-hover:text-[#8A9A5B] transition-colors">{v.word}</p>
                          <span className="text-[9px] font-bold bg-[#E5E4E2] text-[#5A6D60] px-3 py-0.5 rounded-full uppercase">{v.language}</span>
                        </div>
                        <p className="text-xs opacity-60 italic leading-relaxed">"{v.meaning}"</p>
                      </div>
                    ))}
                    <button onClick={() => setActiveTab('dictionary')} className="w-full text-center text-xs font-bold text-[#8A9A5B] uppercase tracking-widest hover:underline pt-4 transition-all">Open Full Lexicon</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="max-w-5xl mx-auto space-y-12">
              <div className="glass-card p-12 flex flex-col md:flex-row items-center gap-16">
                <div className="relative group">
                  <div className="w-48 h-48 rounded-[3.5rem] p-1.5 rainbow-gradient shadow-2xl">
                    <div className="w-full h-full rounded-[3.2rem] bg-white overflow-hidden p-2">
                      <img src={getAvatarUrl(profile)} className="w-full h-full" alt="Avatar" />
                    </div>
                  </div>
                  <div className="absolute -bottom-2 -right-2 flex flex-col gap-2">
                    <button 
                      onClick={() => setProfile({...profile, avatarSeed: Math.random().toString()})}
                      title="New Seed"
                      className="p-3 bg-[#8A9A5B] text-white rounded-full shadow-xl hover:scale-110 active:scale-95 transition-all"
                    >
                      <RefreshCw size={20} />
                    </button>
                  </div>
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  {isProfileEditing ? (
                    <form onSubmit={handleProfileSave} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[11px] font-bold uppercase opacity-40 ml-2 tracking-widest">Voyager Name</label>
                          <input required name="name" defaultValue={profile.name} className="w-full px-6 py-4 glass-card bg-white/30 border-none outline-none focus:ring-4 focus:ring-[#8A9A5B]/20" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[11px] font-bold uppercase opacity-40 ml-2 tracking-widest">Reading Goal</label>
                          <input type="number" required name="readingGoal" defaultValue={profile.readingGoal} className="w-full px-6 py-4 glass-card bg-white/30 border-none outline-none focus:ring-4 focus:ring-[#8A9A5B]/20" />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                          <label className="text-[11px] font-bold uppercase opacity-40 ml-2 tracking-widest">Philosophy & Bio</label>
                          <textarea name="bio" defaultValue={profile.bio} className="w-full px-6 py-4 glass-card bg-white/30 border-none outline-none focus:ring-4 focus:ring-[#8A9A5B]/20 resize-none h-28" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[11px] font-bold uppercase opacity-40 ml-2 tracking-widest">Preferred Scroll</label>
                          <input name="favoriteGenre" defaultValue={profile.favoriteGenre} className="w-full px-6 py-4 glass-card bg-white/30 border-none outline-none focus:ring-4 focus:ring-[#8A9A5B]/20" />
                        </div>
                        <div className="flex items-end">
                           <button type="submit" className="w-full py-4 bg-[#8A9A5B] text-white font-bold rounded-[1.8rem] shadow-xl hover:brightness-110 transition-all uppercase text-xs tracking-widest">Finalize Updates</button>
                        </div>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-5xl font-bold serif-font tracking-tight">{profile.name}</h3>
                        <p className="text-lg opacity-60 mt-3 max-w-lg leading-relaxed">{profile.bio}</p>
                      </div>
                      <div className="flex flex-wrap gap-6 pt-6">
                        <div className="px-6 py-4 glass-card bg-[#E5E4E2]/30 flex flex-col items-center min-w-[120px]">
                          <p className="text-[10px] font-bold uppercase opacity-40 tracking-widest">Library</p>
                          <p className="text-3xl font-bold mt-1">{stats.total}</p>
                        </div>
                        <div className="px-6 py-4 glass-card bg-[#8A9A5B]/10 flex flex-col items-center min-w-[120px]">
                          <p className="text-[10px] font-bold uppercase opacity-40 tracking-widest">Milestone</p>
                          <p className="text-3xl font-bold mt-1">{stats.completed}/{profile.readingGoal}</p>
                        </div>
                        <div className="px-6 py-4 glass-card bg-[#8E9AAF]/10 flex flex-col items-center min-w-[120px]">
                          <p className="text-[10px] font-bold uppercase opacity-40 tracking-widest">Lexicon</p>
                          <p className="text-3xl font-bold mt-1">{stats.vocabulary}</p>
                        </div>
                      </div>
                      <button onClick={() => setIsProfileEditing(true)} className="flex items-center gap-3 text-sm font-bold text-[#8A9A5B] hover:scale-105 transition-all mt-6 px-6 py-3 glass-card bg-[#8A9A5B]/5">
                        <Edit3 size={18} /> Edit Sanctuary Persona
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 glass-card p-0 overflow-hidden">
                  <button 
                    onClick={() => setIsAvatarStudioOpen(!isAvatarStudioOpen)}
                    className="w-full flex items-center justify-between p-10 hover:bg-white/10 transition-colors group"
                  >
                    <h4 className="text-2xl font-bold serif-font flex items-center gap-3">
                      <Palette size={24} className="text-[#8E9AAF]" /> Avatar Studio
                    </h4>
                    <ChevronDown size={24} className={`text-[#8E9AAF] transition-transform duration-300 ${isAvatarStudioOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isAvatarStudioOpen && (
                    <div className="p-10 pt-0 space-y-10 animate-in fade-in slide-in-from-top-4 duration-300">
                      <div className="space-y-8">
                        {/* Style Selection */}
                        <div className="space-y-4">
                          <p className="text-xs font-bold uppercase opacity-40 tracking-widest">Choose a Style</p>
                          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                            {AVATAR_STYLES.map(style => (
                              <button 
                                key={style.id}
                                onClick={() => setProfile({...profile, avatarChoice: style.id})}
                                className={`p-2 rounded-2xl transition-all border-2 flex flex-col items-center group ${profile.avatarChoice === style.id ? 'border-[#8A9A5B] bg-[#8A9A5B]/10 scale-105' : 'border-transparent bg-white/10 hover:bg-white/40'}`}
                              >
                                <div className="w-12 h-12 mb-1 overflow-hidden rounded-full">
                                   <img src={`https://api.dicebear.com/7.x/${style.id}/svg?seed=preview`} className="w-full h-full group-hover:scale-110 transition-transform" alt={style.label} />
                                </div>
                                <p className="text-[8px] font-bold uppercase tracking-tighter opacity-60">{style.label}</p>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Customization Controls */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-[#border]">
                          <div className="space-y-4">
                            <p className="text-xs font-bold uppercase opacity-40 tracking-widest">Orientation</p>
                            <div className="flex items-center gap-4">
                               <button 
                                onClick={() => setProfile({...profile, avatarFlip: !profile.avatarFlip})}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border-2 ${profile.avatarFlip ? 'bg-[#8A9A5B] text-white border-[#8A9A5B]' : 'bg-transparent border-[#border] opacity-60'}`}
                               >
                                <FlipHorizontal size={14} /> Flip
                               </button>
                               <div className="flex-1 space-y-2">
                                 <div className="flex justify-between text-[10px] font-bold opacity-40">
                                    <span>ROTATION</span>
                                    <span>{profile.avatarRotate || 0}°</span>
                                 </div>
                                 <input 
                                  type="range" min="0" max="360" step="45"
                                  value={profile.avatarRotate || 0}
                                  onChange={(e) => setProfile({...profile, avatarRotate: parseInt(e.target.value)})}
                                  className="w-full h-1 bg-[#8E9AAF]/20 rounded-full appearance-none accent-[#8A9A5B] cursor-pointer"
                                 />
                               </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <p className="text-xs font-bold uppercase opacity-40 tracking-widest">Visual Hash</p>
                            <div className="flex gap-2">
                              <input 
                                type="text" 
                                value={profile.avatarSeed}
                                onChange={(e) => setProfile({...profile, avatarSeed: e.target.value})}
                                placeholder="Unique seed..."
                                className="flex-1 px-4 py-2 glass-card bg-white/30 border-none outline-none text-xs focus:ring-2 focus:ring-[#8A9A5B]/20"
                              />
                              <button 
                                onClick={() => setProfile({...profile, avatarSeed: Math.random().toString(36).substring(7)})}
                                className="p-2 glass-card bg-[#8A9A5B] text-white"
                              >
                                <RefreshCw size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-8">
                  <div className="glass-card p-10 flex flex-col items-center justify-center text-center space-y-6 h-full">
                    <div className="p-6 bg-[#D2B48C]/10 rounded-full">
                      <TrendingUp size={48} className="text-[#D2B48C]" />
                    </div>
                    <div>
                      <h4 className="text-2xl font-bold serif-font">Reader Velocity</h4>
                      <p className="text-sm opacity-50 max-w-xs mt-2 mx-auto">You've successfully deciphered {stats.completed} books toward your target of {profile.readingGoal}.</p>
                    </div>
                    <div className="w-full h-6 bg-[#8E9AAF]/10 rounded-full overflow-hidden relative shadow-inner p-1">
                      <div className="h-full bg-gradient-to-r from-[#8A9A5B] to-[#D2B48C] rounded-full transition-all duration-1000" style={{ width: `${stats.progressToGoal}%` }}></div>
                      <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-[#344037] mix-blend-overlay">
                        {stats.progressToGoal}% Complete
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sync' && (
            <div className="max-w-4xl mx-auto space-y-12">
              <div className="glass-card p-12 space-y-10">
                <div className="flex items-center gap-6">
                  <div className="p-5 bg-[#8E9AAF] text-white rounded-[2rem] shadow-xl">
                    <Database size={32} />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold serif-font tracking-tight">Library Safehouse</h3>
                    <p className="text-base opacity-60 leading-relaxed">Protect your reading sanctuary. Export your curated data or restore it from a backup.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="p-8 glass-card bg-[#FFF1E1]/40 border-2 border-[#D2B48C]/20 flex flex-col items-center text-center space-y-6">
                    <div className="p-4 bg-white/60 rounded-full shadow-sm">
                      <Download size={40} className="text-[#8A9A5B]" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold serif-font">Export Sanctuary</h4>
                      <p className="text-xs opacity-60 mt-2">Download a snapshot of your library, dictionary, and profile as a portable JSON file.</p>
                    </div>
                    <button 
                      onClick={() => {
                        const data = JSON.stringify({ books, profile });
                        const blob = new Blob([data], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `sanctuary_backup_${new Date().toISOString().split('T')[0]}.json`;
                        a.click();
                      }}
                      className="w-full py-4 bg-[#8A9A5B] text-white font-bold rounded-[1.8rem] shadow-xl hover:brightness-110 transition-all flex items-center justify-center gap-2 uppercase text-xs tracking-widest"
                    >
                      <Download size={16} /> Generate Backup
                    </button>
                  </div>

                  <div className="p-8 glass-card bg-[#8E9AAF]/10 border-2 border-[#8E9AAF]/20 flex flex-col items-center text-center space-y-6">
                    <div className="p-4 bg-white/60 rounded-full shadow-sm">
                      <Upload size={40} className="text-[#8E9AAF]" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold serif-font">Restore Scrolls</h4>
                      <p className="text-xs opacity-60 mt-2">Restore your sanctuary from a previously exported JSON file. This will replace current data.</p>
                    </div>
                    <label className="w-full py-4 bg-[#8E9AAF] text-white font-bold rounded-[1.8rem] shadow-xl hover:brightness-110 transition-all flex items-center justify-center gap-2 uppercase text-xs tracking-widest cursor-pointer">
                      <Upload size={16} /> Select Backup File
                      <input 
                        type="file" 
                        className="hidden" 
                        accept=".json" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (re) => {
                              try {
                                const data = JSON.parse(re.target?.result as string);
                                if (data.books && data.profile) {
                                  if (confirm("This will overwrite your existing library. Proceed?")) {
                                    setBooks(data.books);
                                    setProfile(data.profile);
                                    alert("Sanctuary restored successfully!");
                                  }
                                } else {
                                  alert("Invalid backup format.");
                                }
                              } catch (err) {
                                alert("Failed to parse the file.");
                              }
                            };
                            reader.readAsText(file);
                          }
                        }} 
                      />
                    </label>
                  </div>
                </div>

                <div className="pt-8 border-t border-[#border] flex items-center gap-3 text-xs opacity-40 font-bold uppercase tracking-widest justify-center">
                  <ShieldCheck size={16} /> Local Storage Protection Enabled
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-3xl mx-auto space-y-10">
              <div className="glass-card p-12 space-y-12">
                <div>
                  <h3 className="text-3xl font-bold serif-font mb-3">Atmosphere Canvas</h3>
                  <p className="text-base opacity-60 leading-relaxed">Adjust the visual purity and air of your reading sanctuary. Switch between the light of dawn and the calm of dusk.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <button 
                    onClick={() => setTheme('dawn')}
                    className={`p-8 glass-card flex flex-col items-center text-center gap-6 transition-all border-4 ${theme === 'dawn' ? 'border-[#8A9A5B] bg-[#FFF1E1]/40' : 'border-transparent bg-white/10 opacity-60 hover:opacity-100'}`}
                  >
                    <div className="p-5 bg-[#8A9A5B] text-white rounded-[2rem] shadow-xl">
                      <Sun size={32} />
                    </div>
                    <div>
                      <p className="text-xl font-bold">Fresh Dawn</p>
                      <p className="text-xs opacity-60 mt-1">Light, high-key palette of Platinum and Coconut.</p>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 border-[#8A9A5B] flex items-center justify-center ${theme === 'dawn' ? 'bg-[#8A9A5B]' : ''}`}>
                       {theme === 'dawn' && <CheckCircle2 size={14} className="text-white" />}
                    </div>
                  </button>

                  <button 
                    onClick={() => setTheme('dusk')}
                    className={`p-8 glass-card flex flex-col items-center text-center gap-6 transition-all border-4 ${theme === 'dusk' ? 'border-[#8E9AAF] bg-[#1C2321]/80' : 'border-transparent bg-white/10 opacity-60 hover:opacity-100'}`}
                  >
                    <div className="p-5 bg-[#8E9AAF] text-white rounded-[2rem] shadow-xl">
                      <Moon size={32} />
                    </div>
                    <div>
                      <p className="text-xl font-bold">Glistening Dusk</p>
                      <p className="text-xs opacity-60 mt-1 text-[#8E9AAF]">Muted tones with Turtle Green accents for night reading.</p>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 border-[#8E9AAF] flex items-center justify-center ${theme === 'dusk' ? 'bg-[#8E9AAF]' : ''}`}>
                       {theme === 'dusk' && <CheckCircle2 size={14} className="text-white" />}
                    </div>
                  </button>
                </div>

                <div className="pt-10 border-t border-[#border] space-y-8">
                  <h4 className="text-[12px] font-bold uppercase opacity-30 tracking-[0.4em]">Reader Preferences</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-6 glass-card bg-white/10">
                      <div>
                        <p className="font-bold text-lg">AI Lexicon Engine</p>
                        <p className="text-xs opacity-60">Real-time word decoding while you read.</p>
                      </div>
                      <div className="w-14 h-7 bg-[#8A9A5B] rounded-full relative shadow-inner p-1">
                        <div className="absolute right-1 top-1 w-5 h-5 bg-white rounded-full shadow-md"></div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-6 glass-card bg-white/10 opacity-40 grayscale cursor-not-allowed">
                      <div>
                        <p className="font-bold text-lg">Cloud Syncing</p>
                        <p className="text-xs opacity-60">Synchronize your scrolls across devices.</p>
                      </div>
                      <div className="w-14 h-7 bg-[#E5E4E2] rounded-full relative shadow-inner">
                        <div className="absolute left-1 top-1 w-5 h-5 bg-white rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'library' && (
            <div className="space-y-12">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#border] pb-8 gap-4">
                <div className="flex items-center gap-8 text-xs font-bold">
                  <div className="flex items-center gap-3 text-[#8A9A5B] bg-[#8A9A5B]/10 px-5 py-2.5 rounded-full">
                    <ArrowUpDown size={16} />
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)} className="bg-transparent outline-none cursor-pointer">
                      <option value="recent">Recently Added</option>
                      <option value="title">Alphabetical</option>
                      <option value="rating">Top Rated</option>
                    </select>
                  </div>
                  <span className="opacity-40 tracking-widest">{filteredBooks.length} SCROLLS IN SANCTUARY</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-10">
                {filteredBooks.map(book => (
                  <div key={book.id} onClick={() => setSelectedBook(book)} className="group cursor-pointer">
                    <div className="relative aspect-[3/4] glass-card overflow-hidden mb-5 shadow-lg group-hover:-translate-y-4 transition-all duration-500">
                      <img src={book.coverUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={book.title} />
                      {book.isCompleted && (
                        <div className="absolute inset-0 bg-[#8A9A5B]/50 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <CheckCircle2 size={40} className="text-white drop-shadow-lg" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3 flex flex-col gap-2">
                        {book.isCollegeMaterial && (
                          <div className="p-2 bg-[#D2B48C] text-white rounded-full shadow-md"><GraduationCap size={14} /></div>
                        )}
                      </div>
                    </div>
                    <h4 className="font-bold text-lg serif-font truncate leading-tight group-hover:text-[#8A9A5B] transition-colors">{book.title}</h4>
                    <p className="text-[10px] opacity-50 mt-1 truncate uppercase tracking-[0.1em]">{book.author}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Overlays */}
      {selectedBook && (
        <BookDetailOverlay 
          book={selectedBook} 
          onClose={() => setSelectedBook(null)} 
          onUpdate={updateBook}
          onDelete={(id) => {
            if (confirm("Uproot this book from your sanctuary?")) {
              setBooks(books.filter(b => b.id !== id));
              setSelectedBook(null);
            }
          }}
        />
      )}

      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#1C2321]/60 backdrop-blur-xl animate-in">
          <div className="bg-white/95 backdrop-blur-2xl w-full max-w-xl rounded-[4rem] p-12 relative shadow-2xl border border-white/20">
            <button onClick={() => setIsAddModalOpen(false)} className="absolute top-10 right-10 text-[#8E9AAF] hover:scale-110 transition-transform"><X size={32} /></button>
            <div className="flex items-center gap-4 mb-10">
               <div className="p-4 bg-[#8A9A5B] text-white rounded-[1.8rem] shadow-xl">
                 <Cloud size={32} />
               </div>
               <h2 className="text-4xl font-bold serif-font tracking-tight">New Scroll</h2>
            </div>
            <form onSubmit={handleAddBook} className="space-y-8">
              <div className="space-y-2">
                <label className="text-[11px] font-bold opacity-30 uppercase ml-3 tracking-[0.3em]">Scroll Title</label>
                <input required name="title" className="w-full px-6 py-4 glass-card bg-white/50 border-none outline-none focus:ring-4 focus:ring-[#8A9A5B]/20 text-lg" />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold opacity-30 uppercase ml-3 tracking-[0.3em]">Origin Author</label>
                <input required name="author" className="w-full px-6 py-4 glass-card bg-white/50 border-none outline-none focus:ring-4 focus:ring-[#8A9A5B]/20 text-lg" />
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold opacity-30 uppercase ml-3 tracking-[0.3em]">Essence</label>
                  <select name="genre" className="w-full px-6 py-4 glass-card bg-white/50 border-none outline-none focus:ring-4 focus:ring-[#8A9A5B]/20 cursor-pointer">
                    <option>Novel</option><option>Philosophy</option><option>Self-Help</option><option>Manga</option><option>Textbook</option><option>Web Novel</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold opacity-30 uppercase ml-3 tracking-[0.3em]">Position</label>
                  <input type="number" name="chapter" defaultValue="1" className="w-full px-6 py-4 glass-card bg-white/50 border-none outline-none focus:ring-4 focus:ring-[#8A9A5B]/20" />
                </div>
              </div>
              <div className="flex items-center gap-4 px-3 py-2 group cursor-pointer">
                 <input type="checkbox" name="isCollege" id="isCollege" className="w-6 h-6 accent-[#8A9A5B] cursor-pointer" />
                 <label htmlFor="isCollege" className="text-base font-semibold opacity-60 group-hover:opacity-100 transition-opacity cursor-pointer">Assign to Academic Collection</label>
              </div>
              <button type="submit" className="w-full bg-[#8A9A5B] text-white font-bold py-5 rounded-[2.5rem] shadow-2xl hover:brightness-110 active:scale-95 transition-all text-base tracking-widest mt-6">SAVE TO SANCTUARY</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const StatBox: React.FC<{ label: string; value: string | number; icon: React.ReactNode; color: string }> = ({ label, value, icon, color }) => (
  <div className="glass-card p-8 flex flex-col items-center justify-center text-center space-y-4 border-b-[10px]" style={{ borderBottomColor: color }}>
    <div className="p-4 rounded-[1.8rem] shadow-sm flex items-center justify-center" style={{ backgroundColor: `${color}40`, color: '#344037' }}>{icon}</div>
    <span className="text-3xl font-bold serif-font leading-none">{value}</span>
    <span className="text-[10px] font-bold opacity-30 uppercase tracking-[0.3em]">{label}</span>
  </div>
);

const BookDetailOverlay: React.FC<{ book: Book; onClose: () => void; onUpdate: (b: Book) => void; onDelete: (id: string) => void }> = ({ book, onClose, onUpdate, onDelete }) => {
  const [newNote, setNewNote] = useState('');
  const [newWord, setNewWord] = useState('');
  const [isDefining, setIsDefining] = useState(false);

  const addNote = () => {
    if (!newNote.trim()) return;
    const note: Note = { id: Date.now().toString(), content: newNote, dateAdded: Date.now() };
    onUpdate({ ...book, notes: [note, ...book.notes] });
    setNewNote('');
  };

  const addWord = async () => {
    if (!newWord.trim()) return;
    setIsDefining(true);
    const { meaning, language } = await getDefinition(newWord);
    const vocab: Vocabulary = { id: Date.now().toString(), word: newWord, meaning, language, dateAdded: Date.now() };
    onUpdate({ ...book, dictionary: [vocab, ...book.dictionary] });
    setNewWord('');
    setIsDefining(false);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-[#1C2321]/70 backdrop-blur-2xl p-4 no-print overflow-y-auto">
      <div className="bg-white/90 backdrop-blur-3xl w-full max-w-7xl rounded-[4.5rem] shadow-[0_60px_120px_-30px_rgba(0,0,0,0.5)] flex flex-col lg:flex-row overflow-hidden animate-in">
        <div className="lg:w-[26rem] bg-[#8A9A5B]/10 p-16 flex flex-col items-center border-r border-white/40">
          <div className="relative group mb-12">
            <img src={book.coverUrl} className="w-64 aspect-[3/4] rounded-[2.5rem] shadow-2xl object-cover transition-all group-hover:scale-105 group-hover:rotate-2" alt={book.title} />
            <div className="absolute -top-5 -right-5 bg-white p-4 rounded-[1.5rem] shadow-xl text-[#8A9A5B]">
               <Bookmark size={32} />
            </div>
          </div>
          <h2 className="text-3xl font-bold serif-font text-center leading-tight mb-3 px-6">{book.title}</h2>
          <p className="text-sm font-semibold opacity-40 italic mb-10 uppercase tracking-widest">{book.author}</p>
          
          <div className="w-full space-y-6 mb-12">
            <div className="flex justify-between text-[12px] font-bold uppercase border-b border-white/50 pb-4">
              <span className="opacity-30 tracking-widest">POSITION</span>
              <span className="text-[#8A9A5B]">Chapter {book.currentChapter}</span>
            </div>
            <div className="flex justify-between text-[12px] font-bold uppercase border-b border-white/50 pb-4">
              <span className="opacity-30 tracking-widest">AURA</span>
              <span className={book.isCompleted ? 'text-[#8A9A5B]' : 'text-[#8E9AAF]'}>{book.isCompleted ? 'Deciphered' : 'Ongoing'}</span>
            </div>
            <div className="flex justify-between text-[12px] font-bold uppercase border-b border-white/50 pb-4">
              <span className="opacity-30 tracking-widest">COLLECTION</span>
              <span>{book.genre}</span>
            </div>
          </div>

          <div className="w-full space-y-4 mt-auto">
            <button onClick={() => onUpdate({...book, isCompleted: !book.isCompleted})} className={`w-full py-5 rounded-[2rem] text-sm font-bold transition-all shadow-xl hover:scale-105 ${book.isCompleted ? 'bg-white text-[#344037] border-2 border-[#8A9A5B]' : 'bg-[#8A9A5B] text-white shadow-[#8A9A5B]/30'}`}>
              {book.isCompleted ? 'Reopen Scroll' : 'Archive as Finished'}
            </button>
            <button onClick={() => onDelete(book.id)} className="w-full py-4 text-[#8E9AAF] text-xs font-bold hover:text-red-400 rounded-2xl uppercase tracking-[0.2em] transition-all">Remove Record</button>
          </div>
        </div>

        <div className="flex-1 p-12 lg:p-20 overflow-y-auto max-h-[90vh] scrollbar-hide">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-20">
            <div className="space-y-10">
              <div className="flex items-center justify-between border-b border-[#border] pb-6">
                 <h3 className="text-2xl font-bold serif-font flex items-center gap-4">
                  <Edit3 size={24} className="text-[#8A9A5B]" /> Reader Insights
                </h3>
              </div>
              <div className="relative group">
                <textarea 
                  value={newNote} 
                  onChange={(e) => setNewNote(e.target.value)} 
                  placeholder="Inscribe your thoughts on the air..." 
                  className="w-full h-48 p-8 glass-card bg-white/40 border-none outline-none focus:ring-4 focus:ring-[#8A9A5B]/10 text-base italic resize-none shadow-inner" 
                />
                <button onClick={addNote} className="absolute bottom-6 right-6 bg-[#8A9A5B] text-white px-8 py-3 rounded-full text-xs font-bold shadow-xl hover:scale-105 transition-all">Inscribe</button>
              </div>
              <div className="space-y-6">
                {book.notes.map(n => (
                  <div key={n.id} className="p-8 glass-card bg-white/60 border-none relative group shadow-sm hover:shadow-lg transition-all">
                    <p className="text-base italic opacity-90 leading-relaxed">"{n.content}"</p>
                    <div className="flex justify-between items-center mt-6">
                      <span className="text-[10px] opacity-20 font-bold uppercase tracking-widest">{new Date(n.dateAdded).toLocaleDateString()}</span>
                      <button onClick={() => onUpdate({...book, notes: book.notes.filter(note => note.id !== n.id)})} className="text-red-200 opacity-0 group-hover:opacity-100 transition-all hover:text-red-500"><Trash2 size={20}/></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-10">
              <div className="flex items-center justify-between border-b border-[#border] pb-6">
                 <h3 className="text-2xl font-bold serif-font flex items-center gap-4">
                  <Globe size={24} className="text-[#8E9AAF]" /> Global Lexicon
                </h3>
              </div>
              <div className="flex gap-4">
                <input 
                  value={newWord} 
                  onChange={(e) => setNewWord(e.target.value)} 
                  onKeyPress={(e) => e.key === 'Enter' && addWord()} 
                  placeholder="Decipher complex root..." 
                  className="flex-1 px-8 py-4 glass-card bg-white/40 border-none outline-none focus:ring-4 focus:ring-[#8A9A5B]/10 text-base" 
                />
                <button 
                  disabled={isDefining} 
                  onClick={addWord} 
                  className="bg-[#8E9AAF] text-white px-10 rounded-[1.8rem] text-xs font-bold shadow-xl hover:scale-105 active:scale-95 transition-all"
                >
                  {isDefining ? <RefreshCw className="animate-spin" size={20} /> : 'Decode'}
                </button>
              </div>
              <div className="space-y-6">
                {book.dictionary.map(v => (
                  <div key={v.id} className="p-8 glass-card bg-[#8A9A5B]/5 border-none shadow-sm hover:bg-[#8A9A5B]/10 transition-all">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-bold text-2xl serif-font">{v.word}</h4>
                      <span className="text-[10px] font-bold text-white bg-[#8E9AAF] px-4 py-1 rounded-full uppercase tracking-widest shadow-sm">{v.language}</span>
                    </div>
                    <p className="text-base italic leading-relaxed opacity-60">"{v.meaning}"</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
