import React, { useState, useEffect } from 'react';
import { BookOpen, Heart, ScrollText, Trash2, ArrowRight, Loader2, Lock } from 'lucide-react';
import { bookmarkService, BookmarkType } from '../services/bookmarkService';
import { useAuth } from '../contexts/AuthContext';

type BookmarkType = 'ALL' | 'QURAN' | 'DUA' | 'HADITH';

export const BookmarksView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<BookmarkType | 'ALL'>('ALL');
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadBookmarks();
    } else {
      setBookmarks([]);
      setLoading(false);
    }
  }, [user, activeTab]);

  const loadBookmarks = async () => {
    setLoading(true);
    try {
      // In a real app we might optimize this query based on 'activeTab' 
      // but client-side filtering is fine for small lists
      const data = await bookmarkService.getBookmarks(activeTab === 'ALL' ? undefined : activeTab as BookmarkType);
      setBookmarks(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load bookmarks');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await bookmarkService.removeBookmark(id);
      setBookmarks(prev => prev.filter(b => b.id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete bookmark');
    }
  };

  // ... (keeping icon/label helpers same, simplified for brevity)
  const getIcon = (type: string) => {
    switch (type) {
      case 'QURAN': return <BookOpen size={18} />;
      case 'DUA': return <Heart size={18} />;
      case 'HADITH': return <ScrollText size={18} />;
      default: return <BookOpen size={18} />;
    }
  };

  const getLabel = (type: string) => {
    switch (type) {
      case 'QURAN': return 'Ayah';
      case 'DUA': return 'Dua';
      case 'HADITH': return 'Hadith';
      default: return 'Item';
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4 animate-in fade-in">
        <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-full mb-6">
          <Lock size={48} className="text-slate-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Sign in to view bookmarks</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-sm">
          Your bookmarks are synced securely to your account. Please sign in to access them.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="sticky top-0 bg-slate-50 dark:bg-slate-950 pt-2 pb-4 z-10 space-y-4 transition-colors">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Saved Bookmarks</h2>

        {/* Tabs */}
        <div className="flex bg-slate-200/50 dark:bg-slate-800/50 p-1 rounded-xl w-full md:w-fit overflow-x-auto">
          {(['ALL', 'QURAN', 'DUA', 'HADITH'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${activeTab === tab
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
            >
              {tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-emerald-600" size={32} />
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-600 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-300 dark:text-slate-500">
              <BookmarkIcon size={32} />
            </div>
            <p>No saved items in this category.</p>
          </div>
        ) : (
          bookmarks.map((item) => (
            <div key={item.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <span className={`p-1.5 rounded-lg ${item.type === 'QURAN' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' :
                    item.type === 'DUA' ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400' :
                      'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                    }`}>
                    {getIcon(item.type)}
                  </span>
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    {getLabel(item.type)}
                  </span>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => handleDelete(item.id, e)}
                    className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="flex flex-col-reverse md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg mb-1">{item.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">{item.subtitle}</p>
                  {/* Date parsing could be better but sticking to simplicity */}
                  <p className="text-xs text-slate-300 dark:text-slate-600 mt-2">Saved {new Date(item.created_at).toLocaleDateString()}</p>
                </div>
                {item.arabic_text && (
                  <p className="font-arabic text-xl text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-xl text-right md:text-left self-end md:self-auto">
                    {item.arabic_text}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const BookmarkIcon = ({ size }: { size: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
  </svg>
);