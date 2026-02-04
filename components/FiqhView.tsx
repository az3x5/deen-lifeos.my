import React, { useState } from 'react';
import { getFiqhArticles } from '../services/dataService';
import { BookOpen, ChevronRight, Search } from 'lucide-react';

export const FiqhView: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const articles = getFiqhArticles();

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="sticky top-0 bg-slate-50 dark:bg-slate-950 pt-2 pb-4 z-10 transition-colors">
        <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">Fiqh Encyclopedia</h2>
        <div className="bg-emerald-900 dark:bg-emerald-950 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden mb-6">
           <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
             <BookOpen size={200} />
           </div>
           <h3 className="text-lg md:text-xl font-bold mb-2">Knowledge is Light</h3>
           <p className="text-emerald-100 max-w-md text-xs md:text-sm leading-relaxed">
             Explore rulings on Purification, Prayer, Fasting and more according to authentic sources.
           </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {articles.map((article) => (
          <div key={article.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors">
            <button 
              onClick={() => setSelectedTopic(selectedTopic === article.id ? null : article.id)}
              className="w-full text-left p-4 flex justify-between items-center"
            >
              <div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1 block">
                  {article.category}
                </span>
                <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm md:text-base">{article.title}</h3>
                {selectedTopic !== article.id && (
                  <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm mt-1 line-clamp-2">{article.summary}</p>
                )}
              </div>
              <ChevronRight 
                className={`text-slate-300 dark:text-slate-600 transition-transform duration-300 ${
                  selectedTopic === article.id ? 'rotate-90 text-emerald-600 dark:text-emerald-400' : ''
                }`} 
              />
            </button>
            
            {/* Expanded Content */}
            {selectedTopic === article.id && (
              <div className="px-5 pb-5 pt-0 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="h-px bg-slate-100 dark:bg-slate-700 w-full mb-4"></div>
                <div className="prose prose-sm prose-emerald dark:prose-invert text-slate-600 dark:text-slate-300 leading-relaxed text-sm md:text-base">
                  {article.content}
                </div>
                <div className="mt-4 flex justify-end">
                   <button className="text-xs text-emerald-600 dark:text-emerald-400 font-medium hover:underline">
                     Read Full Source
                   </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};