
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
  ChevronRight,
  X,
  Save,
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
  Sparkles,
  Palette,
  Goal,
  Leaf,
  Flower2,
  TreePine,
  Wind
} from 'lucide-react';
import { Book, Genre, Vocabulary, Note, UserProfile } from './types';
import { getDefinition } from './services/geminiService';

const AVATAR_STYLES = [
  { id: 'lorelei', label: 'Sprout' },
  { id: 'big-smile', label: 'Sunny' },
  { id: 'pixel-art', label: 'Petal' },
  { id: 'fun-emoji', label: 'Dew' },
  { id: 'adventurer', label: 'Flora' },
  { id: 'notionists', label: 'Bloom' }
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [books, setBooks] = useState<Book[]>([]);
  const [profile, setProfile] = useState<UserProfile>({
    name: 'Garden Reader',
    bio: 'Nurturing ideas like spring blossoms.',
    readingGoal: 50,
    favoriteGenre: 'Philosophy',
    avatarSeed: 'spring-breeze',
    avatarChoice: 'lorelei'
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    main: true,
    library: true,
    personal: true
  });

  useEffect(() => {
    const savedBooks = localStorage.getItem('book_corner_data');
    const savedProfile = localStorage.getItem('book_corner_profile');
    if (savedBooks) setBooks(JSON.parse(savedBooks));
    if (savedProfile) setProfile(JSON.parse(savedProfile));
  }, []);

  useEffect(() => {
    localStorage.setItem('book_corner_data', JSON.stringify(books));
    localStorage.setItem('book_corner_profile', JSON.stringify(profile));
  }, [books, profile]);

  const stats = useMemo(() => ({
    total: books.length,
    completed: books.filter(b => b.isCompleted).length,
    active: books.filter(b => !b.isCompleted).length,
    words: books.reduce((acc, b) => acc + b.dictionary.length, 0),
    college: books.filter(b => b.isCollegeMaterial).length,
  }), [books]);

  const filteredBooks = useMemo(() => {
    let result = books;
    if (activeTab === 'college') result = result.filter(b => b.isCollegeMaterial);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(b => 
        b.title.toLowerCase().includes(q) || 
        b.author.toLowerCase().includes(q) ||
        b.subgenres.some(s => s.toLowerCase().includes(q))
      );
    }
    return result;
  }, [books, activeTab, searchQuery]);

  const handleAddBook = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const now = Date.now();
    const title = formData.get('title') as string;
    const newBook: Book = {
      id: now.toString(),
      title,
      author: formData.get('author') as string,
      genre: formData.get('genre') as Genre,
      subgenres: (formData.get('subgenres') as string).split(',').map(s => s.trim()).filter(Boolean),
      currentChapter: Number(formData.get('chapter')) || 1,
      rating: 0,
      isCompleted: false,
      notes: [],
      dictionary: [],
      isCollegeMaterial: formData.get('isCollege') === 'on',
      lastUpdated: now,
      dateStarted: now,
      progressHistory: [{ date: new Date().toISOString().split('T')[0], chapter: Number(formData.get('chapter')) || 1 }],
      coverUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(title)}&backgroundColor=a7c957,6a994e,f28482,f4e285,fdf0d5`
    };
    setBooks([newBook, ...books]);
    setIsAddModalOpen(false);
  };

  const updateBook = (updated: Book) => {
    setBooks(books.map(b => b.id === updated.id ? { ...updated, lastUpdated: Date.now() } : b));
    if (selectedBook?.id === updated.id) setSelectedBook(updated);
  };

  const NavItem: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
    <button 
      onClick={onClick} 
      className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all relative group ${
        active 
        ? 'bg-white text-[#386641] shadow-md border-l-4 border-[#a7c957]' 
        : 'text-[#6a994e] hover:bg-white/50 hover:text-[#386641]'
      }`}
    >
      {active && <div className="absolute right-3 w-2 h-2 bg-[#f28482] rounded-full animate-pulse"></div>}
      <span className={`${active ? 'text-[#a7c957]' : 'text-[#bc8a5f] group-hover:text-[#a7c957]'} transition-colors`}>{icon}</span>
      {label}
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row text-[#386641]">
      {/* Sidebar: Tree Branching Spring Navigation */}
      <nav className="w-full md:w-72 bg-[#f7f9f2]/90 backdrop-blur-lg border-r-4 border-[#e2e8ce] p-8 flex flex-col fixed md:relative h-auto md:h-screen z-20 no-print overflow-y-auto">
        <div className="flex items-center gap-4 mb-12 px-2 animate-float">
          <div className="p-3 bg-gradient-to-br from-[#a7c957] to-[#6a994e] text-white rounded-[1.25rem] shadow-lg border-2 border-white">
            <TreePine size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight serif-font text-[#386641]">Spring Corner</h1>
            <p className="text-[9px] font-bold text-[#f28482] uppercase tracking-widest">A Living Library</p>
          </div>
        </div>

        <div className="flex-1 space-y-8">
          <div>
            <button 
              onClick={() => setExpandedGroups(prev => ({...prev, main: !prev.main}))}
              className="w-full flex items-center justify-between text-[10px] font-bold text-[#bc8a5f] uppercase tracking-[0.2em] px-2 mb-3 hover:text-[#386641] transition-colors"
            >
              <span>The Sprout</span>
              <ChevronDown size={12} className={`transition-transform duration-300 ${expandedGroups.main ? '' : '-rotate-90'}`} />
            </button>
            {expandedGroups.main && (
              <div className="space-y-1 pl-1 border-l-2 border-[#e2e8ce] ml-2 animate-in slide-in-from-top-2 duration-300">
                <NavItem active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={18}/>} label="The Glade" />
                <NavItem active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} icon={<BarChart3 size={18}/>} label="Growth" />
              </div>
            )}
          </div>

          <div>
            <button 
              onClick={() => setExpandedGroups(prev => ({...prev, library: !prev.library}))}
              className="w-full flex items-center justify-between text-[10px] font-bold text-[#bc8a5f] uppercase tracking-[0.2em] px-2 mb-3 hover:text-[#386641] transition-colors"
            >
              <span>The Grove</span>
              <ChevronDown size={12} className={`transition-transform duration-300 ${expandedGroups.library ? '' : '-rotate-90'}`} />
            </button>
            {expandedGroups.library && (
              <div className="space-y-1 pl-1 border-l-2 border-[#e2e8ce] ml-2 animate-in slide-in-from-top-2 duration-300">
                <NavItem active={activeTab === 'library'} onClick={() => setActiveTab('library')} icon={<Library size={18}/>} label="All Seeds" />
                <NavItem active={activeTab === 'college'} onClick={() => setActiveTab('college')} icon={<GraduationCap size={18}/>} label="Academy Wing" />
                <NavItem active={activeTab === 'dictionary'} onClick={() => setActiveTab('dictionary')} icon={<Languages size={18}/>} label="Lexicon" />
              </div>
            )}
          </div>

          <div>
            <button 
              onClick={() => setExpandedGroups(prev => ({...prev, personal: !prev.personal}))}
              className="w-full flex items-center justify-between text-[10px] font-bold text-[#bc8a5f] uppercase tracking-[0.2em] px-2 mb-3 hover:text-[#386641] transition-colors"
            >
              <span>The Gardener</span>
              <ChevronDown size={12} className={`transition-transform duration-300 ${expandedGroups.personal ? '' : '-rotate-90'}`} />
            </button>
            {expandedGroups.personal && (
              <div className="space-y-1 pl-1 border-l-2 border-[#e2e8ce] ml-2 animate-in slide-in-from-top-2 duration-300">
                <NavItem active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<User size={18}/>} label="Profile" />
                <NavItem active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<SettingsIcon size={18}/>} label="Garden Settings" />
                <NavItem active={activeTab === 'sync'} onClick={() => setActiveTab('sync')} icon={<Database size={18}/>} label="Vault Sync" />
              </div>
            )}
          </div>
        </div>

        <div className="mt-auto pt-8 border-t border-[#e2e8ce] opacity-50 flex items-center justify-center">
           <Leaf size={16} className="text-[#a7c957] animate-sway" />
           <span className="text-[10px] ml-2 font-bold tracking-widest text-[#6a994e] uppercase">EST. SPRING 2024</span>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 md:ml-0 mt-20 md:mt-0 p-6 md:p-12 overflow-y-auto no-print">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h2 className="text-4xl font-bold serif-font text-[#386641] leading-tight flex items-center gap-3">
              {activeTab === 'dashboard' && 'Morning Dew'}
              {activeTab === 'stats' && 'Blossom Report'}
              {activeTab === 'library' && 'Wildflowers'}
              {activeTab === 'college' && 'Academy Garden'}
              {activeTab === 'dictionary' && 'Root Meanings'}
              {activeTab === 'profile' && 'Gardener Profile'}
              {activeTab === 'sync' && 'Seed Vault'}
              {activeTab === 'settings' && 'Garden Rules'}
              <Flower2 className="text-[#f28482]" size={28} />
            </h2>
            <p className="text-[#6a994e] font-medium mt-1">Watching ideas take root and bloom.</p>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a7c957]" size={18} />
              <input 
                type="text" placeholder="Find a seed of knowledge..."
                className="w-full pl-12 pr-6 py-4 bg-white/70 border-2 border-[#e2e8ce] rounded-3xl outline-none focus:border-[#a7c957] focus:ring-4 focus:ring-[#a7c957]/10 shadow-sm transition-all"
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 bg-[#6a994e] hover:bg-[#386641] text-white px-8 py-4 rounded-3xl shadow-lg transition-all font-bold">
              <Plus size={20} /> Plant Seed
            </button>
          </div>
        </div>

        <div className="animate-in fade-in duration-500">
          {activeTab === 'dashboard' && (
            <div className="space-y-12">
               <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Total Seeds" value={stats.total} color="#a7c957" icon={<TreePine size={20} />} />
                <StatCard label="Fully Bloomed" value={stats.completed} color="#f28482" icon={<Flower2 size={20} />} />
                <StatCard label="Word Roots" value={stats.words} color="#f4e285" icon={<Languages size={20} />} />
                <StatCard label="Vitality" value={`${Math.round((stats.completed / Math.max(stats.total, 1)) * 100)}%`} color="#bc8a5f" icon={<Goal size={20} />} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-6">
                  <h3 className="text-xl font-bold serif-font text-[#386641] flex items-center gap-3">
                    <Leaf size={20} className="text-[#a7c957]" /> Growing Now
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {books.filter(b => !b.isCompleted).slice(0, 4).map(book => (
                      <div key={book.id} onClick={() => setSelectedBook(book)} className="spring-card p-6 flex gap-6 group cursor-pointer border-2 border-[#e2e8ce] bg-white/60">
                        <div className="w-20 h-28 rounded-2xl overflow-hidden flex-shrink-0 shadow-lg group-hover:rotate-2 transition-all border-2 border-white">
                          <img src={book.coverUrl} className="w-full h-full object-cover" alt={book.title} />
                        </div>
                        <div className="flex-1 flex flex-col justify-between py-1">
                          <div>
                            <h4 className="font-bold text-[#386641] line-clamp-1 serif-font text-lg leading-tight">{book.title}</h4>
                            <p className="text-[10px] font-bold text-[#6a994e] uppercase tracking-widest">{book.author}</p>
                          </div>
                          <div className="flex items-center gap-2">
                             <span className="text-[10px] font-bold text-white bg-[#a7c957] px-2 py-1 rounded-full">Ch {book.currentChapter}</span>
                             <span className="text-[9px] font-bold text-[#f28482] uppercase">{book.genre}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {books.filter(b => !b.isCompleted).length === 0 && (
                      <div className="col-span-2 py-16 spring-card border-dashed border-2 flex flex-col items-center justify-center text-[#6a994e] bg-white/30">
                        <Wind size={32} className="opacity-20 mb-3 animate-sway" />
                        <p className="serif-font italic">The glade is quiet... no seeds growing yet.</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-6">
                  <h3 className="text-xl font-bold serif-font text-[#386641]">Recent Roots</h3>
                  <div className="spring-card p-8 bg-white/40 min-h-[400px]">
                    <div className="space-y-6">
                      {books.flatMap(b => b.dictionary).sort((a,b) => b.dateAdded - a.dateAdded).slice(0, 6).map(v => (
                        <div key={v.id} className="pb-4 border-b border-[#e2e8ce] last:border-0 group cursor-help">
                          <div className="flex justify-between items-center mb-1">
                            <p className="font-bold text-[#386641] group-hover:text-[#a7c957] transition-colors">{v.word}</p>
                            <span className="text-[8px] font-bold text-white bg-[#f28482] px-2 py-0.5 rounded-full">{v.language}</span>
                          </div>
                          <p className="text-xs text-[#6a994e] italic line-clamp-1">"{v.meaning}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="max-w-4xl mx-auto space-y-10 animate-in slide-in-from-bottom-6 duration-500">
              <div className="spring-card p-12 flex flex-col md:flex-row items-center gap-12 bg-white/70 border-4 border-[#e2e8ce]">
                <div className="relative group">
                   <div className="w-44 h-44 rounded-[2.5rem] bg-[#f7f9f2] border-8 border-white shadow-xl overflow-hidden flex-shrink-0 animate-float">
                    <img src={`https://api.dicebear.com/7.x/${profile.avatarChoice}/svg?seed=${profile.avatarSeed}`} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute -bottom-4 -right-4 p-3 bg-white rounded-2xl shadow-lg border-2 border-[#a7c957] text-[#386641]">
                    <Flower2 size={20} />
                  </div>
                </div>
               
                <div className="flex-1 text-center md:text-left space-y-6">
                  <div>
                    <h3 className="text-5xl font-bold serif-font text-[#386641]">{profile.name}</h3>
                    <p className="text-lg text-[#6a994e] italic mt-2">"{profile.bio}"</p>
                  </div>
                  <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                    <div className="px-6 py-2.5 bg-[#fdf0d5] rounded-2xl border-2 border-[#e2e8ce] text-xs font-bold uppercase tracking-widest text-[#386641]">Goal: {profile.readingGoal} Blooms</div>
                    <div className="px-6 py-2.5 bg-[#fdf0d5] rounded-2xl border-2 border-[#e2e8ce] text-xs font-bold uppercase tracking-widest text-[#386641]">Fav: {profile.favoriteGenre}</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="spring-card p-10 space-y-8 bg-white/40">
                  <h4 className="font-bold serif-font text-2xl text-[#386641] flex items-center gap-3">
                    <User size={24} className="text-[#a7c957]" /> Gardener Details
                  </h4>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-[#bc8a5f] uppercase tracking-widest">Name</label>
                      <input 
                        value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} 
                        className="w-full px-6 py-4 bg-white/50 border-2 border-[#e2e8ce] rounded-2xl outline-none focus:border-[#a7c957]" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-[#bc8a5f] uppercase tracking-widest">Motto</label>
                      <textarea 
                        value={profile.bio} onChange={(e) => setProfile({...profile, bio: e.target.value})} 
                        className="w-full px-6 py-4 bg-white/50 border-2 border-[#e2e8ce] rounded-2xl outline-none h-32 resize-none" 
                      />
                    </div>
                  </div>
                </div>

                <div className="spring-card p-10 space-y-8 bg-white/40">
                  <h4 className="font-bold serif-font text-2xl text-[#386641] flex items-center gap-3">
                    <Sparkles size={24} className="text-[#f28482]" /> Sprout Style
                  </h4>
                  <div className="space-y-8">
                    <div className="grid grid-cols-3 gap-3">
                      {AVATAR_STYLES.map(style => (
                        <button 
                          key={style.id}
                          onClick={() => setProfile({...profile, avatarChoice: style.id as any})}
                          className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                            profile.avatarChoice === style.id ? 'border-[#a7c957] bg-[#a7c957]/10 scale-105 shadow-md' : 'border-[#e2e8ce] bg-white/30'
                          }`}
                        >
                          <img src={`https://api.dicebear.com/7.x/${style.id}/svg?seed=preview`} className="w-10 h-10" alt={style.label} />
                          <span className="text-[8px] font-bold uppercase text-[#386641] text-center">{style.label}</span>
                        </button>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-[#bc8a5f] uppercase tracking-widest">Seed Word (Variation)</label>
                      <input 
                        value={profile.avatarSeed} onChange={(e) => setProfile({...profile, avatarSeed: e.target.value})} 
                        className="w-full px-6 py-4 bg-white/50 border-2 border-[#e2e8ce] rounded-2xl outline-none focus:border-[#a7c957]" 
                        placeholder="Type anything..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-3xl mx-auto space-y-8 animate-in slide-in-from-bottom-6 duration-500">
               <div className="spring-card p-12 space-y-12 bg-white/60 border-4 border-[#e2e8ce]">
                  <h3 className="text-3xl font-bold serif-font text-[#386641] flex items-center gap-4">
                    <SettingsIcon size={32} className="text-[#a7c957]" /> Garden Rules
                  </h3>

                  <div className="space-y-10">
                    <section className="space-y-6">
                      <h4 className="text-[10px] font-bold text-[#bc8a5f] uppercase tracking-[0.3em]">Harvest Goals</h4>
                      <div className="p-8 bg-white/50 rounded-[2.5rem] border-2 border-[#e2e8ce] flex items-center justify-between">
                         <div>
                           <p className="font-bold text-lg text-[#386641]">Annual Bloom Target</p>
                           <p className="text-sm text-[#6a994e]">How many books will you finish this season?</p>
                         </div>
                         <input 
                          type="number" value={profile.readingGoal} onChange={(e) => setProfile({...profile, readingGoal: Number(e.target.value)})}
                          className="w-24 px-4 py-3 bg-white border-2 border-[#a7c957] rounded-2xl font-bold text-center text-[#386641] outline-none"
                         />
                      </div>
                    </section>

                    <section className="space-y-6">
                       <h4 className="text-[10px] font-bold text-[#bc8a5f] uppercase tracking-[0.3em]">Garden Theme</h4>
                       <div className="p-8 bg-white/50 rounded-[2.5rem] border-2 border-[#e2e8ce] space-y-4">
                         <div className="flex items-center justify-between">
                            <p className="font-bold text-lg text-[#386641]">Spring Palette</p>
                            <span className="px-4 py-1.5 bg-[#a7c957] text-white text-[10px] font-bold rounded-full uppercase">Enabled</span>
                         </div>
                         <p className="text-sm text-[#6a994e]">Sprouts, leaves, and blossoms adorn your library.</p>
                       </div>
                    </section>

                    <section className="space-y-6 pt-10 border-t-2 border-[#e2e8ce]">
                      <h4 className="text-[10px] font-bold text-red-300 uppercase tracking-[0.3em]">Danger Zone</h4>
                       <button onClick={() => {
                         if(confirm("Uproot the entire garden? This deletes ALL data permanently!")) {
                           localStorage.clear();
                           window.location.reload();
                         }
                       }} className="w-full py-5 border-2 border-red-100 rounded-3xl text-red-300 font-bold uppercase tracking-widest text-xs hover:bg-red-50 hover:text-red-500 transition-all">
                         Clear All Seeds & History
                       </button>
                    </section>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'sync' && (
            <div className="max-w-4xl mx-auto space-y-10 animate-in slide-in-from-bottom-6 duration-500">
              <div className="spring-card p-12 space-y-10 bg-white/60 border-4 border-[#a7c957]">
                 <div className="flex items-center gap-6">
                    <div className="p-5 bg-[#fdf0d5] rounded-[2rem] shadow-lg text-[#bc8a5f]"><Database size={40} /></div>
                    <div>
                       <h3 className="text-3xl font-bold serif-font text-[#386641]">Seed Vault</h3>
                       <p className="text-[#6a994e] font-medium">Protect your garden records for different seasons.</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="p-10 bg-white/50 rounded-[3rem] border-2 border-[#e2e8ce] space-y-6 flex flex-col items-center text-center">
                     <Download size={48} className="text-[#a7c957]" />
                     <h4 className="text-xl font-bold text-[#386641]">Save Garden Scroll</h4>
                     <p className="text-sm text-[#6a994e]">Export all books and lexicon entries as a JSON seed file.</p>
                     <button 
                      onClick={() => {
                        const blob = new Blob([JSON.stringify({books, profile})], {type: 'application/json'});
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `spring_corner_vault_${new Date().toISOString().split('T')[0]}.json`;
                        a.click();
                      }}
                      className="w-full py-5 bg-[#6a994e] text-white rounded-3xl font-bold shadow-xl hover:bg-[#386641] transition-all"
                     >
                       Download Vault
                     </button>
                   </div>

                   <div className="p-10 bg-white/50 rounded-[3rem] border-2 border-[#e2e8ce] space-y-6 flex flex-col items-center text-center">
                     <Upload size={48} className="text-[#f28482]" />
                     <h4 className="text-xl font-bold text-[#386641]">Replant Garden</h4>
                     <p className="text-sm text-[#6a994e]">Restore your collection from a previously saved JSON vault.</p>
                     <label className="w-full py-5 bg-[#bc8a5f] text-white rounded-3xl font-bold shadow-xl hover:bg-[#a6714a] transition-all flex items-center justify-center cursor-pointer">
                        Upload Scroll
                        <input type="file" className="hidden" accept=".json" onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (re) => {
                              try {
                                const data = JSON.parse(re.target?.result as string);
                                if (data.books) setBooks(data.books);
                                if (data.profile) setProfile(data.profile);
                                alert("Garden successfully replanted!");
                              } catch(e) {
                                alert("The scroll format is incorrect.");
                              }
                            };
                            reader.readAsText(file);
                          }
                        }} />
                     </label>
                   </div>
                 </div>
              </div>
            </div>
          )}

          {(activeTab === 'library' || activeTab === 'college') && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-10">
              {filteredBooks.map(book => (
                <div key={book.id} onClick={() => setSelectedBook(book)} className="group cursor-pointer">
                  <div className="relative aspect-[2/3] spring-card overflow-hidden shadow-lg group-hover:-translate-y-4 transition-all duration-500 mb-6 bg-white/50">
                    <img src={book.coverUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={book.title} />
                    <div className="absolute top-4 right-4 flex flex-col gap-2">
                       {book.isCompleted && <div className="bg-[#f28482] p-2.5 rounded-2xl text-white shadow-xl ring-2 ring-white"><CheckCircle2 size={12} /></div>}
                       {book.isCollegeMaterial && <div className="bg-[#bc8a5f] p-2.5 rounded-2xl text-white shadow-xl ring-2 ring-white"><GraduationCap size={12} /></div>}
                    </div>
                  </div>
                  <div className="px-2">
                    <h4 className="font-bold text-[#386641] line-clamp-1 serif-font text-xl mb-1">{book.title}</h4>
                    <p className="text-[10px] font-bold text-[#6a994e] uppercase tracking-[0.2em]">{book.author}</p>
                  </div>
                </div>
              ))}
              {filteredBooks.length === 0 && (
                 <div className="col-span-full py-24 text-center">
                    <Wind size={64} className="mx-auto mb-4 opacity-10 text-[#6a994e] animate-sway" />
                    <p className="serif-font italic text-2xl text-[#6a994e] opacity-40">No blooms found in this patch...</p>
                 </div>
              )}
            </div>
          )}

          {activeTab === 'dictionary' && (
             <div className="spring-card p-12 bg-white/60 border-4 border-[#e2e8ce] shadow-sm">
                <div className="flex justify-between items-center border-b-2 border-[#e2e8ce] pb-8 mb-8">
                   <h3 className="text-3xl font-bold serif-font text-[#386641] flex items-center gap-4">
                     <Languages size={32} className="text-[#a7c957]" /> Global Lexicon
                   </h3>
                   <p className="text-[10px] font-bold text-[#6a994e] uppercase tracking-[0.3em]">{stats.words} Decoded Terms</p>
                </div>
                <div className="space-y-8">
                   {books.flatMap(b => b.dictionary.map(v => ({...v, bookTitle: b.title}))).sort((a,b) => b.dateAdded - a.dateAdded).map(item => (
                     <div key={item.id} className="p-8 bg-white/50 rounded-[2.5rem] border-2 border-[#e2e8ce] flex flex-col md:flex-row md:items-start gap-6 group hover:bg-white transition-all">
                       <div className="flex-1 space-y-3">
                          <div className="flex flex-wrap items-center gap-3">
                             <h4 className="text-2xl font-bold text-[#386641] tracking-tight">{item.word}</h4>
                             <span className="text-[9px] font-bold text-white bg-[#a7c957] px-3 py-1.5 rounded-full uppercase">{item.language}</span>
                             <span className="text-xs font-bold text-[#6a994e] italic opacity-60">— from {item.bookTitle}</span>
                          </div>
                          <p className="text-[#386641] text-lg leading-relaxed italic">"{item.meaning}"</p>
                       </div>
                       <span className="text-[10px] text-[#bc8a5f] font-bold uppercase tracking-widest self-end md:self-auto">{new Date(item.dateAdded).toLocaleDateString()}</span>
                     </div>
                   ))}
                </div>
             </div>
          )}
        </div>
      </main>

      {selectedBook && (
        <BookDetailOverlay 
          book={selectedBook} 
          onClose={() => setSelectedBook(null)} 
          onUpdate={updateBook}
          onDelete={(id) => {
            if (confirm("Remove this flower from the patch?")) {
              setBooks(books.filter(b => b.id !== id));
              setSelectedBook(null);
            }
          }}
        />
      )}

      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#386641]/30 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[3.5rem] p-12 relative shadow-2xl border-4 border-[#e2e8ce]">
            <button onClick={() => setIsAddModalOpen(false)} className="absolute top-12 right-12 p-3 text-[#a7c957] hover:text-[#386641] transition-colors"><X size={28} /></button>
            <h2 className="text-3xl font-bold serif-font text-[#386641] mb-10 flex items-center gap-3">
               <Leaf className="text-[#a7c957]" /> Plant New Seed
            </h2>
            <form onSubmit={handleAddBook} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#bc8a5f] uppercase tracking-widest ml-1">Title</label>
                <input required name="title" className="w-full px-6 py-4.5 bg-[#f7f9f2]/30 border-2 border-[#e2e8ce] rounded-[1.5rem] outline-none focus:border-[#a7c957] transition-all" placeholder="e.g. Garden of Emuna" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#bc8a5f] uppercase tracking-widest ml-1">Author</label>
                <input required name="author" className="w-full px-6 py-4.5 bg-[#f7f9f2]/30 border-2 border-[#e2e8ce] rounded-[1.5rem] outline-none focus:border-[#a7c957] transition-all" placeholder="e.g. Nature Writer" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#bc8a5f] uppercase tracking-widest ml-1">Genre</label>
                <select name="genre" className="w-full px-6 py-4.5 bg-[#f7f9f2]/30 border-2 border-[#e2e8ce] rounded-[1.5rem] outline-none appearance-none cursor-pointer">
                  <option>Novel</option><option>Philosophy</option><option>Self-Help</option><option>Manga</option><option>Web Novel</option><option>Textbook</option><option>Manhwa</option><option>Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#bc8a5f] uppercase tracking-widest ml-1">Start Depth (Ch)</label>
                <input type="number" name="chapter" defaultValue="1" className="w-full px-6 py-4.5 bg-[#f7f9f2]/30 border-2 border-[#e2e8ce] rounded-[1.5rem] outline-none" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-bold text-[#bc8a5f] uppercase tracking-widest ml-1">Tags (Comma separated)</label>
                <input name="subgenres" className="w-full px-6 py-4.5 bg-[#f7f9f2]/30 border-2 border-[#e2e8ce] rounded-[1.5rem] outline-none focus:border-[#a7c957] transition-all" placeholder="e.g. Hope, Growth, Sunlight" />
              </div>
              <div className="md:col-span-2 flex items-center gap-4 p-2">
                 <input type="checkbox" name="isCollege" id="isCollege" className="w-6 h-6 accent-[#a7c957]" />
                 <label htmlFor="isCollege" className="text-sm font-bold text-[#386641] cursor-pointer">Nurture in Academy Garden</label>
              </div>
              <button type="submit" className="md:col-span-2 w-full bg-[#6a994e] text-white font-bold py-6 rounded-[2rem] shadow-xl hover:bg-[#386641] transition-all text-xl">Plant in Corner</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Child Components ---

const StatCard: React.FC<{ label: string; value: number | string; icon: React.ReactNode; color: string }> = ({ label, value, icon, color }) => (
  <div className="spring-card p-8 flex flex-col items-center justify-center text-center space-y-4 border-b-8 shadow-sm group hover:scale-105" style={{ borderBottomColor: color, backgroundColor: 'white' }}>
    <div className="p-4 rounded-[1.5rem] mb-1 group-hover:scale-110 transition-transform" style={{ backgroundColor: `${color}20`, color: '#386641' }}>{icon}</div>
    <span className="text-4xl font-bold serif-font text-[#386641] tracking-tight">{value}</span>
    <span className="text-[10px] font-bold text-[#bc8a5f] uppercase tracking-[0.3em]">{label}</span>
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
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-[#386641]/30 backdrop-blur-xl p-4 overflow-y-auto no-print">
      <div className="bg-[#f7f9f2] w-full max-w-7xl min-h-[90vh] rounded-[4rem] shadow-2xl flex flex-col md:flex-row overflow-hidden relative animate-in zoom-in-95 duration-500 border-8 border-white">
        
        <button onClick={onClose} className="absolute top-10 right-10 p-4 text-[#a7c957] hover:text-[#386641] z-20 transition-all bg-white/50 backdrop-blur-sm rounded-3xl shadow-sm"><X size={32} /></button>
        
        <div className="md:w-[450px] bg-white/40 border-r-4 border-[#e2e8ce] p-16 flex flex-col items-center">
          <div className="w-72 aspect-[2/3] rounded-[3rem] shadow-[0_30px_60px_rgba(56,102,65,0.15)] overflow-hidden mb-12 border-[10px] border-white animate-float">
            <img src={book.coverUrl} className="w-full h-full object-cover" alt={book.title} />
          </div>
          <h2 className="text-5xl font-bold serif-font text-center leading-[1.1] mb-4 px-6 text-[#386641]">{book.title}</h2>
          <p className="text-[#bc8a5f] font-bold uppercase tracking-[0.4em] text-[11px] mb-12">{book.author}</p>
          
          <div className="flex gap-3 mb-12 scale-150">
            {[1,2,3,4,5].map(i => (
              <Star 
                key={i} 
                size={22} 
                className={`cursor-pointer transition-all hover:scale-125 ${i <= book.rating ? 'fill-[#f4e285] text-[#f4e285]' : 'text-white'}`} 
                onClick={() => onUpdate({...book, rating: i})}
              />
            ))}
          </div>

          <div className="w-full space-y-6 mb-12">
            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-[0.3em] text-[#6a994e] border-b-2 border-[#e2e8ce] pb-6">
              <span>Genre Bloom</span><span className="text-[#386641] font-bold">{book.genre}</span>
            </div>
            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-[0.3em] text-[#6a994e] border-b-2 border-[#e2e8ce] pb-6">
              <span>Harvest Status</span><span className={book.isCompleted ? 'text-[#f28482]' : 'text-[#386641]'}>{book.isCompleted ? 'Harvested' : `Growing (Ch ${book.currentChapter})`}</span>
            </div>
            <div className="space-y-3 pt-2">
               <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#6a994e]">Botanical Tags</span>
               <div className="flex flex-wrap gap-2.5">
                 {book.subgenres.map((s, i) => (
                   <span key={i} className="text-[10px] font-bold text-white bg-[#a7c957] px-4 py-2 rounded-full uppercase tracking-widest">{s}</span>
                 ))}
                 {book.subgenres.length === 0 && <span className="text-xs text-[#bc8a5f] italic">No tags applied.</span>}
               </div>
            </div>
          </div>

          <div className="w-full space-y-5 no-print mt-auto">
            <button 
              onClick={() => onUpdate({...book, isCompleted: !book.isCompleted})} 
              className={`w-full py-6 rounded-[2.5rem] font-bold text-sm transition-all shadow-xl ${
                book.isCompleted ? 'bg-white text-[#386641] border-2 border-[#a7c957]' : 'bg-[#6a994e] text-white shadow-[#6a994e]/20'
              }`}
            >
              {book.isCompleted ? 'Back to Soil (Active)' : 'Mark as Harvested (Completed)'}
            </button>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => window.print()} className="flex items-center justify-center gap-3 bg-white border-2 border-[#e2e8ce] py-5 rounded-[2rem] text-[10px] font-bold uppercase tracking-[0.2em] text-[#386641] hover:bg-[#a7c957] hover:text-white transition-all">
                <FileText size={18}/> Export PDF
              </button>
              <button onClick={() => onDelete(book.id)} className="flex items-center justify-center gap-3 bg-white border-2 border-[#f28482]/20 py-5 rounded-[2rem] text-[10px] font-bold uppercase tracking-[0.2em] text-[#f28482] hover:bg-[#f28482] hover:text-white transition-all">
                <Trash2 size={18} /> Uproot
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 p-12 md:p-24 overflow-y-auto bg-white/20">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-24">
            
            <section className="space-y-12">
              <h3 className="text-4xl font-bold serif-font flex items-center gap-5 text-[#386641] border-b-4 border-[#a7c957] pb-8">
                <Edit3 size={32} className="text-[#a7c957]" /> Blossom Notes
              </h3>
              <div className="relative group no-print">
                <textarea 
                  value={newNote} 
                  onChange={(e) => setNewNote(e.target.value)} 
                  placeholder="Note down insights, growth, or vibrant quotes..." 
                  className="w-full h-56 p-10 bg-white border-4 border-[#e2e8ce] rounded-[3.5rem] text-sm outline-none resize-none focus:border-[#a7c957] transition-all shadow-inner" 
                />
                <button 
                  onClick={addNote} 
                  className="absolute bottom-8 right-10 bg-[#a7c957] text-white px-10 py-4 rounded-3xl text-xs font-bold shadow-xl opacity-0 group-focus-within:opacity-100 transition-all translate-y-3 group-focus-within:translate-y-0"
                >
                  Save Insight
                </button>
              </div>
              <div className="space-y-8">
                {book.notes.map(n => (
                  <div key={n.id} className="p-10 bg-white/60 backdrop-blur-sm rounded-[3rem] border-2 border-[#e2e8ce] relative group animate-in slide-in-from-top-6 duration-700 shadow-sm">
                    <p className="text-[#386641] leading-relaxed text-xl serif-font italic opacity-90">"{n.content}"</p>
                    <div className="flex items-center justify-between mt-8 pt-8 border-t-2 border-[#e2e8ce]">
                      <span className="text-[10px] text-[#6a994e] font-bold uppercase tracking-[0.3em]">{new Date(n.dateAdded).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                      <button onClick={() => onUpdate({...book, notes: book.notes.filter(note => note.id !== n.id)})} className="text-red-100 hover:text-[#f28482] transition-colors"><Trash2 size={18}/></button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-12">
              <h3 className="text-4xl font-bold serif-font flex items-center gap-5 text-[#386641] border-b-4 border-[#a7c957] pb-8">
                <Languages size={32} className="text-[#a7c957]" /> Root Meanings
              </h3>
              <div className="flex gap-4 no-print">
                <input 
                  value={newWord} 
                  onChange={(e) => setNewWord(e.target.value)} 
                  onKeyPress={(e) => e.key === 'Enter' && addWord()} 
                  placeholder="Identify a complex root..." 
                  className="flex-1 px-10 py-6 bg-white border-4 border-[#e2e8ce] rounded-[3rem] text-sm outline-none focus:border-[#a7c957] transition-all shadow-inner" 
                />
                <button 
                  disabled={isDefining} 
                  onClick={addWord} 
                  className="bg-[#a7c957] text-white px-12 rounded-[3rem] font-bold text-xs shadow-xl hover:bg-[#386641] transition-all flex items-center justify-center"
                >
                  {isDefining ? <RefreshCw className="animate-spin" size={24} /> : 'Decode'}
                </button>
              </div>
              <div className="space-y-8">
                {book.dictionary.map(v => (
                  <div key={v.id} className="p-10 bg-white/80 rounded-[3rem] border-2 border-[#a7c957]/20 relative group animate-in slide-in-from-top-6 duration-700 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-bold text-[#386641] text-3xl tracking-tight">{v.word}</h4>
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] font-bold text-white bg-[#a7c957] px-4 py-2 rounded-full uppercase tracking-widest">{v.language}</span>
                        <button onClick={() => onUpdate({...book, dictionary: book.dictionary.filter(word => word.id !== v.id)})} className="text-red-100 hover:text-[#f28482] transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={18}/></button>
                      </div>
                    </div>
                    <p className="text-[#6a994e] leading-relaxed text-xl italic">"{v.meaning}"</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
