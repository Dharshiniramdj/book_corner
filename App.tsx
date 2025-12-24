
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
  Sparkles,
  Goal,
  Leaf,
  Flower2,
  TreePine,
  Wind,
  ArrowUpDown,
  ClipboardCheck,
  Globe
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

type SortOption = 'recent' | 'title' | 'author' | 'rating';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [books, setBooks] = useState<Book[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('recent');
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
    let result = [...books];
    if (activeTab === 'college') result = result.filter(b => b.isCollegeMaterial);
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(b => 
        b.title.toLowerCase().includes(q) || 
        b.author.toLowerCase().includes(q) ||
        (b.source && b.source.toLowerCase().includes(q)) ||
        b.subgenres.some(s => s.toLowerCase().includes(q))
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
      <span className={`${active ? 'text-[#a7c957]' : 'text-[#bc8a5f] group-hover:text-[#a7c957]'} transition-colors`}>{icon}</span>
      {label}
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <nav className="w-full md:w-72 bg-[#f7f9f2] border-r-2 border-[#e2e8ce] p-6 flex flex-col fixed md:relative h-auto md:h-screen z-20 no-print">
        <div className="flex items-center gap-3 mb-10 px-2 animate-float">
          <div className="p-2.5 bg-[#6a994e] text-white rounded-xl shadow-lg">
            <TreePine size={22} />
          </div>
          <div>
            <h1 className="text-lg font-bold serif-font text-[#386641]">Spring Corner</h1>
            <p className="text-[8px] font-bold text-[#f28482] uppercase tracking-widest">Digital Sanctuary</p>
          </div>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto pr-2">
          <div>
            <button 
              onClick={() => setExpandedGroups(prev => ({...prev, main: !prev.main}))}
              className="w-full flex items-center justify-between text-[9px] font-bold text-[#bc8a5f] uppercase tracking-widest px-2 mb-2"
            >
              <span>The Sprout</span>
              <ChevronDown size={10} className={`transition-transform ${expandedGroups.main ? '' : '-rotate-90'}`} />
            </button>
            {expandedGroups.main && (
              <div className="space-y-1 pl-2 border-l border-[#e2e8ce] ml-2">
                <NavItem active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={18}/>} label="Glade" />
                <NavItem active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} icon={<BarChart3 size={18}/>} label="Growth" />
              </div>
            )}
          </div>

          <div>
            <button 
              onClick={() => setExpandedGroups(prev => ({...prev, library: !prev.library}))}
              className="w-full flex items-center justify-between text-[9px] font-bold text-[#bc8a5f] uppercase tracking-widest px-2 mb-2"
            >
              <span>The Grove</span>
              <ChevronDown size={10} className={`transition-transform ${expandedGroups.library ? '' : '-rotate-90'}`} />
            </button>
            {expandedGroups.library && (
              <div className="space-y-1 pl-2 border-l border-[#e2e8ce] ml-2">
                <NavItem active={activeTab === 'library'} onClick={() => setActiveTab('library')} icon={<Library size={18}/>} label="All Seeds" />
                <NavItem active={activeTab === 'college'} onClick={() => setActiveTab('college')} icon={<GraduationCap size={18}/>} label="Academy" />
                <NavItem active={activeTab === 'dictionary'} onClick={() => setActiveTab('dictionary')} icon={<Languages size={18}/>} label="Lexicon" />
              </div>
            )}
          </div>

          <div>
            <button 
              onClick={() => setExpandedGroups(prev => ({...prev, personal: !prev.personal}))}
              className="w-full flex items-center justify-between text-[9px] font-bold text-[#bc8a5f] uppercase tracking-widest px-2 mb-2"
            >
              <span>The Gardener</span>
              <ChevronDown size={10} className={`transition-transform ${expandedGroups.personal ? '' : '-rotate-90'}`} />
            </button>
            {expandedGroups.personal && (
              <div className="space-y-1 pl-2 border-l border-[#e2e8ce] ml-2">
                <NavItem active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<User size={18}/>} label="Profile" />
                <NavItem active={activeTab === 'sync'} onClick={() => setActiveTab('sync')} icon={<Database size={18}/>} label="Seed Vault" />
                <NavItem active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<SettingsIcon size={18}/>} label="Settings" />
              </div>
            )}
          </div>
        </div>

        <div className="mt-auto pt-6 border-t border-[#e2e8ce] flex items-center justify-center opacity-40">
           <Leaf size={14} className="text-[#a7c957] animate-sway" />
           <span className="text-[9px] ml-2 font-bold tracking-widest text-[#6a994e]">EST. 2024</span>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 md:ml-0 mt-20 md:mt-0 p-6 md:p-10 overflow-y-auto no-print">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
          <div>
            <h2 className="text-3xl font-bold serif-font text-[#386641] flex items-center gap-2">
              {activeTab === 'dashboard' && 'Morning Dew'}
              {activeTab === 'library' && 'Wildflowers'}
              {activeTab === 'college' && 'Academy Garden'}
              {activeTab === 'dictionary' && 'Root Meanings'}
              {activeTab === 'sync' && 'Vault Access'}
              <Flower2 className="text-[#f28482]" size={24} />
            </h2>
            <p className="text-[#6a994e] text-sm mt-0.5">Nurturing your digital bookshelf.</p>
          </div>
          
          <div className="flex items-center gap-4 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a7c957]" size={16} />
              <input 
                type="text" placeholder="Search seeds..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#e2e8ce] rounded-full outline-none focus:border-[#a7c957] shadow-sm text-sm"
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 bg-[#6a994e] hover:bg-[#386641] text-white px-5 py-2.5 rounded-full shadow-md transition-all font-bold text-sm">
              <Plus size={18} /> Plant Seed
            </button>
          </div>
        </div>

        <div className="animate-in fade-in duration-500">
          {activeTab === 'dashboard' && (
            <div className="space-y-10">
               <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Total Seeds" value={stats.total} color="#a7c957" icon={<TreePine size={18} />} />
                <StatCard label="Fully Bloomed" value={stats.completed} color="#f28482" icon={<CheckCircle2 size={18} />} />
                <StatCard label="Word Roots" value={stats.words} color="#f4e285" icon={<Languages size={18} />} />
                <StatCard label="Academy Wing" value={stats.college} color="#bc8a5f" icon={<GraduationCap size={18} />} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                  <h3 className="text-lg font-bold serif-font text-[#386641] flex items-center gap-2">
                    <Leaf size={18} className="text-[#a7c957]" /> Growing Now
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {books.filter(b => !b.isCompleted).slice(0, 4).map(book => (
                      <div key={book.id} onClick={() => setSelectedBook(book)} className="spring-card p-4 flex gap-4 cursor-pointer group">
                        <div className="w-16 h-22 rounded-lg overflow-hidden flex-shrink-0 shadow-sm border border-white/50">
                          <img src={book.coverUrl} className="w-full h-full object-cover" alt={book.title} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-[#386641] truncate text-sm serif-font leading-tight">{book.title}</h4>
                          <p className="text-[10px] text-[#6a994e] truncate uppercase tracking-wider">{book.author}</p>
                          <div className="mt-2 flex items-center gap-2">
                             <span className="text-[9px] font-bold text-white bg-[#a7c957] px-2 py-0.5 rounded-full">Ch {book.currentChapter}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-bold serif-font text-[#386641]">Recent Roots</h3>
                  <div className="spring-card p-5 space-y-4 h-full">
                    {books.flatMap(b => b.dictionary).sort((a,b) => b.dateAdded - a.dateAdded).slice(0, 5).map(v => (
                      <div key={v.id} className="pb-3 border-b border-[#e2e8ce] last:border-0">
                        <p className="font-bold text-xs text-[#386641]">{v.word}</p>
                        <p className="text-[10px] text-[#6a994e] italic truncate">"{v.meaning}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sync' && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="spring-card p-8 space-y-6 border-2 border-[#a7c957]">
                <div className="flex items-center gap-4 border-b border-[#e2e8ce] pb-6">
                  <div className="p-3 bg-[#fdf0d5] rounded-xl text-[#bc8a5f]"><Database size={32}/></div>
                  <div>
                    <h3 className="text-xl font-bold serif-font text-[#386641]">Seed Vault (Sync)</h3>
                    <p className="text-xs text-[#6a994e]">Synchronize your garden across all your devices.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-white border border-[#e2e8ce] rounded-2xl flex flex-col items-center text-center">
                    <Download size={32} className="text-[#a7c957] mb-3" />
                    <h4 className="font-bold text-sm text-[#386641] mb-1">Export Scroll</h4>
                    <p className="text-[10px] text-[#6a994e] mb-4">Save your entire library data to a file for backup or sync.</p>
                    <button 
                      onClick={() => {
                        const blob = new Blob([JSON.stringify({books, profile})], {type: 'application/json'});
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `book_corner_vault_${new Date().toISOString().split('T')[0]}.json`;
                        a.click();
                      }}
                      className="w-full py-2.5 bg-[#6a994e] text-white rounded-lg text-xs font-bold hover:bg-[#386641] transition-colors"
                    >
                      Download Vault
                    </button>
                  </div>

                  <div className="p-6 bg-white border border-[#e2e8ce] rounded-2xl flex flex-col items-center text-center">
                    <Upload size={32} className="text-[#f28482] mb-3" />
                    <h4 className="font-bold text-sm text-[#386641] mb-1">Import Scroll</h4>
                    <p className="text-[10px] text-[#6a994e] mb-4">Upload a previously saved vault file to restore your garden.</p>
                    <label className="w-full py-2.5 bg-[#bc8a5f] text-white rounded-lg text-xs font-bold hover:bg-[#a6714a] transition-colors flex items-center justify-center cursor-pointer">
                      Restore Vault
                      <input type="file" className="hidden" accept=".json" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (re) => {
                            try {
                              const data = JSON.parse(re.target?.result as string);
                              if (data.books) setBooks(data.books);
                              if (data.profile) setProfile(data.profile);
                              alert("Garden restored successfully!");
                            } catch(e) { alert("Invalid vault file."); }
                          };
                          reader.readAsText(file);
                        }
                      }} />
                    </label>
                  </div>
                </div>

                <div className="p-6 bg-[#f7f9f2] rounded-2xl border border-dashed border-[#a7c957]">
                  <h4 className="font-bold text-sm text-[#386641] mb-2 flex items-center gap-2">
                    <ClipboardCheck size={16} /> Quick Clipboard Sync
                  </h4>
                  <p className="text-[10px] text-[#6a994e] mb-4">Copy your raw garden data to paste into the corner on another device.</p>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify({books, profile}));
                      alert("Vault data copied to clipboard!");
                    }}
                    className="w-full py-2 bg-white border border-[#a7c957] text-[#386641] rounded-lg text-xs font-bold hover:bg-[#a7c957] hover:text-white transition-all"
                  >
                    Copy Raw Seed Data
                  </button>
                </div>
              </div>
            </div>
          )}

          {(activeTab === 'library' || activeTab === 'college') && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#e2e8ce] pb-4">
                <div className="flex items-center gap-3 text-sm text-[#6a994e] font-bold">
                  <ArrowUpDown size={16} />
                  <span>Sort:</span>
                  <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="bg-transparent border-b border-[#a7c957] outline-none cursor-pointer"
                  >
                    <option value="recent">Recent Growth</option>
                    <option value="title">Alphabetical</option>
                    <option value="author">Author</option>
                    <option value="rating">Rating</option>
                  </select>
                </div>
                <div className="text-[10px] font-bold uppercase text-[#bc8a5f]">
                  {filteredBooks.length} Blooms
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                {filteredBooks.map(book => (
                  <div key={book.id} onClick={() => setSelectedBook(book)} className="group cursor-pointer">
                    <div className="relative aspect-[3/4] spring-card overflow-hidden shadow-sm group-hover:-translate-y-2 transition-transform duration-300 mb-3">
                      <img src={book.coverUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt={book.title} />
                      <div className="absolute top-2 right-2 flex flex-col gap-1">
                        {book.isCompleted && <div className="bg-[#f28482] p-1.5 rounded-full text-white shadow-md"><CheckCircle2 size={10} /></div>}
                        {book.isCollegeMaterial && <div className="bg-[#bc8a5f] p-1.5 rounded-full text-white shadow-md"><GraduationCap size={10} /></div>}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-[#386641] truncate text-sm serif-font">{book.title}</h4>
                      <p className="text-[9px] text-[#6a994e] truncate uppercase tracking-widest">{book.author}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'dictionary' && (
             <div className="spring-card p-8 border border-[#e2e8ce]">
                <div className="flex justify-between items-center mb-8 border-b border-[#e2e8ce] pb-4">
                   <h3 className="text-xl font-bold serif-font text-[#386641] flex items-center gap-2">
                     <Languages size={22} className="text-[#a7c957]" /> Global Lexicon
                   </h3>
                   <span className="text-[10px] font-bold text-[#bc8a5f] uppercase">{stats.words} Terms Decoded</span>
                </div>
                <div className="space-y-4">
                   {books.flatMap(b => b.dictionary.map(v => ({...v, bookTitle: b.title}))).sort((a,b) => b.dateAdded - a.dateAdded).map(item => (
                     <div key={item.id} className="p-4 bg-[#f7f9f2] rounded-2xl border border-[#e2e8ce] group hover:bg-white transition-colors">
                       <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h4 className="font-bold text-[#386641]">{item.word}</h4>
                          <span className="text-[8px] font-bold text-white bg-[#a7c957] px-2 py-0.5 rounded-full uppercase">{item.language}</span>
                          <span className="text-[10px] text-[#6a994e] italic opacity-60">— {item.bookTitle}</span>
                       </div>
                       <p className="text-[#386641] text-xs italic opacity-80">"{item.meaning}"</p>
                     </div>
                   ))}
                </div>
             </div>
          )}
        </div>
      </main>

      {/* Detail Overlay */}
      {selectedBook && (
        <BookDetailOverlay 
          book={selectedBook} 
          onClose={() => setSelectedBook(null)} 
          onUpdate={updateBook}
          onDelete={(id) => {
            if (confirm("Uproot this bloom?")) {
              setBooks(books.filter(b => b.id !== id));
              setSelectedBook(null);
            }
          }}
        />
      )}

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#386641]/20 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 relative shadow-2xl border border-[#e2e8ce]">
            <button onClick={() => setIsAddModalOpen(false)} className="absolute top-6 right-6 text-[#a7c957] hover:text-[#386641]"><X size={24} /></button>
            <h2 className="text-2xl font-bold serif-font text-[#386641] mb-6 flex items-center gap-2">
               <Leaf className="text-[#a7c957]" /> Plant New Seed
            </h2>
            <form onSubmit={handleAddBook} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] font-bold text-[#bc8a5f] uppercase tracking-widest ml-1">Title</label>
                <input required name="title" className="w-full px-4 py-2 bg-[#f7f9f2] border border-[#e2e8ce] rounded-xl outline-none focus:border-[#a7c957]" placeholder="e.g. Meditations" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#bc8a5f] uppercase tracking-widest ml-1">Author</label>
                <input required name="author" className="w-full px-4 py-2 bg-[#f7f9f2] border border-[#e2e8ce] rounded-xl outline-none focus:border-[#a7c957]" placeholder="Marcus Aurelius" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#bc8a5f] uppercase tracking-widest ml-1">Source (URL/App)</label>
                <input name="source" className="w-full px-4 py-2 bg-[#f7f9f2] border border-[#e2e8ce] rounded-xl outline-none focus:border-[#a7c957]" placeholder="Kindle / Web" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#bc8a5f] uppercase tracking-widest ml-1">Genre</label>
                <select name="genre" className="w-full px-4 py-2 bg-[#f7f9f2] border border-[#e2e8ce] rounded-xl outline-none">
                  <option>Novel</option><option>Philosophy</option><option>Self-Help</option><option>Manga</option><option>Web Novel</option><option>Textbook</option><option>Manhwa</option><option>Other</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#bc8a5f] uppercase tracking-widest ml-1">Current Chapter</label>
                <input type="number" name="chapter" defaultValue="1" className="w-full px-4 py-2 bg-[#f7f9f2] border border-[#e2e8ce] rounded-xl outline-none" />
              </div>
              <div className="md:col-span-2 flex items-center gap-2 px-1">
                 <input type="checkbox" name="isCollege" id="isCollege" className="accent-[#a7c957]" />
                 <label htmlFor="isCollege" className="text-[11px] font-bold text-[#386641] cursor-pointer">Place in Academy Wing (College Material)</label>
              </div>
              <button type="submit" className="md:col-span-2 w-full bg-[#6a994e] text-white font-bold py-3 rounded-xl shadow-lg hover:bg-[#386641] transition-all text-sm mt-2">Plant Seed</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: number | string; icon: React.ReactNode; color: string }> = ({ label, value, icon, color }) => (
  <div className="spring-card p-5 flex flex-col items-center justify-center text-center space-y-2 border-b-4" style={{ borderBottomColor: color }}>
    <div className="p-2 rounded-lg opacity-80" style={{ backgroundColor: `${color}20`, color: '#386641' }}>{icon}</div>
    <span className="text-xl font-bold serif-font text-[#386641]">{value}</span>
    <span className="text-[9px] font-bold text-[#bc8a5f] uppercase tracking-widest">{label}</span>
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
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-[#386641]/30 backdrop-blur-md p-4 overflow-y-auto no-print">
      <div className="bg-[#f7f9f2] w-full max-w-5xl min-h-[80vh] rounded-[2.5rem] shadow-2xl flex flex-col lg:flex-row overflow-hidden relative animate-in zoom-in duration-300">
        
        <button onClick={onClose} className="absolute top-6 right-6 p-2 text-[#a7c957] hover:text-[#386641] z-20 bg-white/50 rounded-full shadow-sm"><X size={24} /></button>
        
        <div className="lg:w-80 bg-white/50 border-r border-[#e2e8ce] p-8 flex flex-col items-center">
          <div className="w-48 aspect-[3/4] rounded-xl shadow-lg overflow-hidden mb-6 border-4 border-white">
            <img src={book.coverUrl} className="w-full h-full object-cover" alt={book.title} />
          </div>
          <h2 className="text-2xl font-bold serif-font text-center leading-tight mb-1 text-[#386641]">{book.title}</h2>
          <p className="text-[10px] text-[#bc8a5f] font-bold uppercase tracking-widest mb-6">{book.author}</p>
          
          <div className="flex gap-1.5 mb-8">
            {[1,2,3,4,5].map(i => (
              <Star 
                key={i} 
                size={18} 
                className={`cursor-pointer transition-transform hover:scale-110 ${i <= book.rating ? 'fill-[#f4e285] text-[#f4e285]' : 'text-[#e2e8ce]'}`} 
                onClick={() => onUpdate({...book, rating: i})}
              />
            ))}
          </div>

          <div className="w-full space-y-4 mb-8">
            <div className="flex justify-between items-center text-[10px] font-bold uppercase text-[#6a994e] border-b border-[#e2e8ce] pb-2">
              <span>Chapter</span><span className="text-[#386641]">{book.currentChapter}</span>
            </div>
            {book.source && (
              <div className="flex justify-between items-center text-[10px] font-bold uppercase text-[#6a994e] border-b border-[#e2e8ce] pb-2">
                <span>Source</span><span className="text-[#386641] truncate max-w-[120px]">{book.source}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-[10px] font-bold uppercase text-[#6a994e] border-b border-[#e2e8ce] pb-2">
              <span>Status</span><span className={book.isCompleted ? 'text-[#f28482]' : 'text-[#386641]'}>{book.isCompleted ? 'Harvested' : 'Growing'}</span>
            </div>
          </div>

          <div className="w-full space-y-3 mt-auto">
            <button 
              onClick={() => onUpdate({...book, isCompleted: !book.isCompleted})} 
              className={`w-full py-2.5 rounded-xl font-bold text-[11px] uppercase transition-all shadow-md ${
                book.isCompleted ? 'bg-white text-[#386641] border border-[#a7c957]' : 'bg-[#6a994e] text-white'
              }`}
            >
              {book.isCompleted ? 'Back to Soil' : 'Mark as Harvested'}
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => window.print()} className="flex items-center justify-center gap-2 bg-white border border-[#e2e8ce] py-2 rounded-lg text-[9px] font-bold uppercase text-[#386641] hover:bg-[#a7c957] hover:text-white transition-all">
                <FileText size={14}/> PDF
              </button>
              <button onClick={() => onDelete(book.id)} className="flex items-center justify-center gap-2 bg-white border border-[#f28482]/20 py-2 rounded-lg text-[9px] font-bold uppercase text-[#f28482] hover:bg-[#f28482] hover:text-white transition-all">
                <Trash2 size={14} /> Uproot
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 p-8 lg:p-12 overflow-y-auto">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
            
            <section className="space-y-6">
              <h3 className="text-xl font-bold serif-font flex items-center gap-3 text-[#386641] border-b-2 border-[#a7c957]/30 pb-3">
                <Edit3 size={20} className="text-[#a7c957]" /> Blossom Notes
              </h3>
              <div className="relative group">
                <textarea 
                  value={newNote} 
                  onChange={(e) => setNewNote(e.target.value)} 
                  placeholder="Note down insights..." 
                  className="w-full h-40 p-5 bg-white border border-[#e2e8ce] rounded-2xl text-xs outline-none resize-none focus:border-[#a7c957] shadow-inner" 
                />
                <button onClick={addNote} className="absolute bottom-4 right-4 bg-[#a7c957] text-white px-4 py-1.5 rounded-full text-[10px] font-bold shadow-md hover:bg-[#386641] transition-colors">
                  Save Note
                </button>
              </div>
              <div className="space-y-4">
                {book.notes.map(n => (
                  <div key={n.id} className="p-5 bg-white/70 rounded-2xl border border-[#e2e8ce] relative group">
                    <p className="text-[#386641] text-sm serif-font italic opacity-90 leading-relaxed">"{n.content}"</p>
                    <div className="flex items-center justify-between mt-3 opacity-60">
                      <span className="text-[9px] font-bold uppercase">{new Date(n.dateAdded).toLocaleDateString()}</span>
                      <button onClick={() => onUpdate({...book, notes: book.notes.filter(note => note.id !== n.id)})} className="text-[#f28482] opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14}/></button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-6">
              <h3 className="text-xl font-bold serif-font flex items-center gap-3 text-[#386641] border-b-2 border-[#a7c957]/30 pb-3">
                <Globe size={20} className="text-[#a7c957]" /> Word Decoding
              </h3>
              <div className="flex gap-2">
                <input 
                  value={newWord} 
                  onChange={(e) => setNewWord(e.target.value)} 
                  onKeyPress={(e) => e.key === 'Enter' && addWord()} 
                  placeholder="Identify a complex root..." 
                  className="flex-1 px-4 py-2 bg-white border border-[#e2e8ce] rounded-xl text-xs outline-none focus:border-[#a7c957]" 
                />
                <button 
                  disabled={isDefining} 
                  onClick={addWord} 
                  className="bg-[#a7c957] text-white px-5 rounded-xl font-bold text-[10px] shadow-md hover:bg-[#386641] transition-colors"
                >
                  {isDefining ? <RefreshCw className="animate-spin" size={16} /> : 'Decode'}
                </button>
              </div>
              <div className="space-y-4">
                {book.dictionary.map(v => (
                  <div key={v.id} className="p-4 bg-white/80 rounded-2xl border border-[#a7c957]/10 relative group shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-bold text-[#386641] text-lg">{v.word}</h4>
                      <span className="text-[8px] font-bold text-white bg-[#a7c957] px-2 py-0.5 rounded-full uppercase">{v.language}</span>
                    </div>
                    <p className="text-[#6a994e] text-xs italic">"{v.meaning}"</p>
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
