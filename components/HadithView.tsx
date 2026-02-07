import React, { useState, useEffect } from 'react';
import {
  fetchHadithEditions,
  fetchHadithCollection,
  fetchHadithBySection,
  HadithEdition,
  HadithData,
  HadithMetadata
} from '../services/hadithService';
import { Search, ScrollText, Bookmark, ChevronLeft, ChevronRight, Book, Share2, Library, Loader2 } from 'lucide-react';

type ViewMode = 'COLLECTIONS' | 'SECTIONS' | 'HADITHS';

interface Section {
  id: number;
  name: string;
}

export const HadithView: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('COLLECTIONS');
  const [editions, setEditions] = useState<Record<string, HadithEdition>>({});
  const [selectedEdition, setSelectedEdition] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<HadithMetadata | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState<number | null>(null);
  const [hadiths, setHadiths] = useState<HadithData[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(false);

  useEffect(() => {
    loadEditions();
  }, []);

  const loadEditions = async () => {
    setLoading(true);
    const editionsData = await fetchHadithEditions();
    setEditions(editionsData);
    setLoading(false);
  };

  const handleSelectCollection = async (editionName: string) => {
    setContentLoading(true);
    setSelectedEdition(editionName);

    const data = await fetchHadithCollection(editionName);
    if (data) {
      setMetadata(data.metadata);

      // Convert sections to array
      const sectionsList: Section[] = Object.entries(data.metadata.section || {}).map(([id, name]) => ({
        id: parseInt(id),
        name: name as string
      }));
      setSections(sectionsList);
      setViewMode('SECTIONS');
    }
    setContentLoading(false);
    setSearch('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectSection = async (sectionNumber: number) => {
    if (!selectedEdition) return;

    setContentLoading(true);
    setSelectedSection(sectionNumber);

    const data = await fetchHadithBySection(selectedEdition, sectionNumber);
    if (data) {
      setHadiths(data.hadiths || []);
      setViewMode('HADITHS');
    }
    setContentLoading(false);
    setSearch('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    if (viewMode === 'HADITHS') {
      setViewMode('SECTIONS');
      setSelectedSection(null);
      setHadiths([]);
      setSearch('');
    } else if (viewMode === 'SECTIONS') {
      setViewMode('COLLECTIONS');
      setSelectedEdition(null);
      setMetadata(null);
      setSections([]);
      setSearch('');
    }
  };

  // Filter Logic
  const filteredEditions = Object.entries(editions).filter(([key, edition]) =>
    edition.name?.toLowerCase().includes(search.toLowerCase()) ||
    edition.collection_name?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredSections = sections.filter(section =>
    section.name?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredHadiths = hadiths.filter(hadith =>
    hadith.text?.toLowerCase().includes(search.toLowerCase())
  );

  // Helper function to get grade color
  const getGradeColor = (grade?: string) => {
    if (!grade) return 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400';
    const lowerGrade = grade.toLowerCase();
    if (lowerGrade.includes('sahih')) return 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400';
    if (lowerGrade.includes('hasan')) return 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
    if (lowerGrade.includes('daif')) return 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400';
    return 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400';
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
            {viewMode === 'HADITHS' ? `Back to ${metadata?.name || 'Sections'}` : 'Back to Collections'}
          </span>
        </button>
      )}

      <div>
        <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1">
          {viewMode === 'COLLECTIONS' && 'Hadith Library'}
          {viewMode === 'SECTIONS' && metadata?.name}
          {viewMode === 'HADITHS' && sections.find(s => s.id === selectedSection)?.name}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm">
          {viewMode === 'COLLECTIONS' && 'Authentic narrations from the Prophet ﷺ'}
          {viewMode === 'SECTIONS' && `${sections.length} Sections Available`}
          {viewMode === 'HADITHS' && `${hadiths.length} Narrations`}
        </p>
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder={
            viewMode === 'COLLECTIONS' ? "Search collections..." :
              viewMode === 'SECTIONS' ? "Search sections..." :
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
      {filteredEditions.map(([key, edition]) => (
        <button
          key={key}
          onClick={() => handleSelectCollection(key)}
          className="flex flex-col text-left p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-md transition-all group h-full"
        >
          <div className="flex items-start justify-between w-full mb-3">
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Library size={24} />
            </div>
          </div>
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors mb-1">
            {edition.name}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 flex-1">
            {edition.collection_name || 'Hadith Collection'}
          </p>
          <div className="flex items-center text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1.5 rounded-lg w-fit">
            {edition.total_hadiths?.toLocaleString() || '0'} Hadiths
          </div>
        </button>
      ))}
    </div>
  );

  const renderSections = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in slide-in-from-right-4">
      {filteredSections.length === 0 ? (
        <div className="col-span-full text-center py-20 text-slate-400">No sections found matching your search.</div>
      ) : (
        filteredSections.map((section) => (
          <button
            key={section.id}
            onClick={() => handleSelectSection(section.id)}
            className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-md transition-all text-left group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg flex items-center justify-center text-sm font-bold group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                {section.id}
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-100">{section.name}</h3>
              </div>
            </div>
            <ChevronRight className="text-slate-300 dark:text-slate-600 group-hover:text-emerald-500 dark:group-hover:text-emerald-400" size={18} />
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
        filteredHadiths.map((hadith, index) => (
          <div key={hadith.hadithnumber || index} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-2 flex-wrap">
                {hadith.grades && hadith.grades.length > 0 ? (
                  hadith.grades.map((gradeObj, idx) => (
                    <span key={idx} className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getGradeColor(gradeObj.grade)}`}>
                      {gradeObj.grade || 'Ungraded'} {gradeObj.name && `(${gradeObj.name})`}
                    </span>
                  ))
                ) : (
                  <span className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                    Grade Unknown
                  </span>
                )}
              </div>
              <div className="flex gap-3 text-slate-400 ml-auto">
                <button className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"><Bookmark size={18} /></button>
                <button className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"><Share2 size={18} /></button>
              </div>
            </div>

            <div className="mb-4">
              <div className="bg-slate-50/50 dark:bg-slate-800/50 p-4 rounded-xl">
                <p className="text-slate-800 dark:text-slate-200 text-base md:text-lg leading-relaxed">
                  {hadith.text}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center text-xs text-slate-400">
              <span className="font-medium text-slate-500 dark:text-slate-400">
                Hadith #{hadith.hadithnumber}
                {hadith.reference?.book && ` • Book ${hadith.reference.book}`}
                {hadith.reference?.hadith && ` • ${hadith.reference.hadith}`}
              </span>
              <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">
                {metadata?.name || selectedEdition}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="animate-spin text-emerald-500" size={48} />
        <p className="text-slate-500 dark:text-slate-400">Loading Hadith Collections...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {renderHeader()}
      {contentLoading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="animate-spin text-emerald-500" size={48} />
          <p className="text-slate-500 dark:text-slate-400">Loading...</p>
        </div>
      ) : (
        <>
          {viewMode === 'COLLECTIONS' && renderCollections()}
          {viewMode === 'SECTIONS' && renderSections()}
          {viewMode === 'HADITHS' && renderHadiths()}
        </>
      )}
    </div>
  );
};