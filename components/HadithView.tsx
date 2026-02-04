import React, { useState } from 'react';
import { getHadithCollections, getHadithBooks, getHadiths } from '../services/dataService';
import { HadithCollection, HadithBook, Hadith } from '../types';
import { Search, ScrollText, Bookmark, ChevronLeft, ChevronRight, Book, Share2, Library } from 'lucide-react';

type ViewMode = 'COLLECTIONS' | 'BOOKS' | 'HADITHS';

export const HadithView: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('COLLECTIONS');
  const [selectedCollection, setSelectedCollection] = useState<HadithCollection | null>(null);
  const [selectedBook, setSelectedBook] = useState<HadithBook | null>(null);
  const [search, setSearch] = useState('');

  // Data
  const collections = getHadithCollections();
  const books = selectedCollection ? getHadithBooks(selectedCollection.id) : [];
  const hadiths = selectedBook ? getHadiths(selectedBook.id) : [];

  // Filter Logic
  const filteredCollections = collections.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.arabicName?.includes(search)
  );

  const filteredBooks = books.filter(b => 
    b.name.toLowerCase().includes(search.toLowerCase()) || 
    b.arabicName?.includes(search)
  );

  const filteredHadiths = hadiths.filter(h => 
    h.translation.toLowerCase().includes(search.toLowerCase()) || 
    h.arabic.includes(search) || 
    h.narrator.toLowerCase().includes(search.toLowerCase())
  );

  // Navigation Handlers
  const handleSelectCollection = (collection: HadithCollection) => {
    setSelectedCollection(collection);
    setViewMode('BOOKS');
    setSearch('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectBook = (book: HadithBook) => {
    setSelectedBook(book);
    setViewMode('HADITHS');
    setSearch('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    if (viewMode === 'HADITHS') {
      setViewMode('BOOKS');
      setSelectedBook(null);
      setSearch('');
    } else if (viewMode === 'BOOKS') {
      setViewMode('COLLECTIONS');
      setSelectedCollection(null);
      setSearch('');
    }
  };

  // Render Functions

  const renderHeader = () => (
    <div className="relative bg-slate-50 dark:bg-slate-950 pt-2 pb-4 z-10 space-y-4 transition-colors">
       {viewMode !== 'COLLECTIONS' && (
         <button 
           onClick={handleBack}
           className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors group text-sm md:text-base"
         >
           <div className="p-1 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 transition-colors">
             <ChevronLeft size={20} />
           </div>
           <span className="font-medium">
             {viewMode === 'HADITHS' ? `Back to ${selectedCollection?.name} Books` : 'Back to Collections'}
           </span>
         </button>
       )}

       <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1">
            {viewMode === 'COLLECTIONS' && 'Hadith Library'}
            {viewMode === 'BOOKS' && selectedCollection?.name}
            {viewMode === 'HADITHS' && selectedBook?.name}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm">
             {viewMode === 'COLLECTIONS' && 'Authentic narrations from the Prophet ﷺ'}
             {viewMode === 'BOOKS' && selectedCollection?.description}
             {viewMode === 'HADITHS' && `${selectedBook?.hadithCount} Narrations`}
          </p>
       </div>
       
       <div className="relative">
         <input 
           type="text" 
           placeholder={
             viewMode === 'COLLECTIONS' ? "Search collections..." :
             viewMode === 'BOOKS' ? "Search books..." :
             "Search hadiths..."
           }
           value={search}
           onChange={(e) => setSearch(e.target.value)}
           className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm text-sm md:text-base dark:text-slate-100"
         />
         <Search className="absolute left-3 top-3.5 text-slate-400" size={18} />
       </div>
    </div>
  );

  const renderCollections = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in slide-in-from-right-4">
      {filteredCollections.map((col) => (
        <button
          key={col.id}
          onClick={() => handleSelectCollection(col)}
          className="flex flex-col text-left p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-md transition-all group h-full"
        >
          <div className="flex items-start justify-between w-full mb-3">
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Library size={24} />
            </div>
            <div className="font-arabic text-xl text-slate-400 dark:text-slate-600 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              {col.arabicName}
            </div>
          </div>
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors mb-1">{col.name}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 flex-1">{col.description}</p>
          <div className="flex items-center text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1.5 rounded-lg w-fit">
            {col.totalHadiths.toLocaleString()} Hadiths
          </div>
        </button>
      ))}
    </div>
  );

  const renderBooks = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in slide-in-from-right-4">
      {filteredBooks.length === 0 ? (
        <div className="col-span-full text-center py-20 text-slate-400">No books found matching your search.</div>
      ) : (
        filteredBooks.map((book) => (
          <button
            key={book.id}
            onClick={() => handleSelectBook(book)}
            className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-md transition-all text-left group"
          >
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg flex items-center justify-center text-sm font-bold group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                 {book.number}
               </div>
               <div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-100">{book.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{book.hadithCount} Hadiths</p>
               </div>
            </div>
            <div className="flex items-center gap-3">
               {book.arabicName && <span className="font-arabic text-lg text-slate-400 dark:text-slate-600">{book.arabicName}</span>}
               <ChevronRight className="text-slate-300 dark:text-slate-600 group-hover:text-emerald-500 dark:group-hover:text-emerald-400" size={18} />
            </div>
          </button>
        ))
      )}
    </div>
  );

  const renderHadiths = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
      {filteredHadiths.length === 0 ? (
        <div className="text-center py-20 text-slate-400">No hadiths found in this section.</div>
      ) : (
        filteredHadiths.map((hadith) => (
          <div key={hadith.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-2">
                 <span className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-100 dark:border-emerald-900/50">
                   {hadith.grade || 'Sahih'}
                 </span>
              </div>
               <div className="flex gap-3 text-slate-400 ml-auto">
                <button className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"><Bookmark size={18} /></button>
                <button className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"><Share2 size={18} /></button>
              </div>
            </div>

            <div className="mb-6">
               {hadith.chapterTitle && (
                 <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 opacity-80">{hadith.chapterTitle}</h4>
               )}
               <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm font-medium mb-2 border-l-4 border-emerald-500 pl-3">
                Narrated {hadith.narrator}:
              </p>
              <p className="font-arabic text-xl md:text-2xl text-right leading-[2.2] text-slate-800 dark:text-slate-200 mb-4" dir="rtl">
                {hadith.arabic}
              </p>
              <div className="bg-slate-50/50 dark:bg-slate-800/50 p-4 rounded-xl">
                <p className="text-slate-800 dark:text-slate-200 text-base md:text-lg leading-relaxed">
                  {hadith.translation}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center text-xs text-slate-400">
              <span className="font-medium text-slate-500 dark:text-slate-400">{hadith.reference}</span>
              <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">{selectedCollection?.name}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {renderHeader()}
      {viewMode === 'COLLECTIONS' && renderCollections()}
      {viewMode === 'BOOKS' && renderBooks()}
      {viewMode === 'HADITHS' && renderHadiths()}
    </div>
  );
};