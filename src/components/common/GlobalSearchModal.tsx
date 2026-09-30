import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Search, X, FolderOpen, Bookmark, UserCheck, Layers } from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [query, setQuery] = useState('');
  const [projects, setProjects] = useState<any[]>([]);
  const [prompts, setPrompts] = useState<any[]>([]);
  const [characters, setCharacters] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      api.getProjects().then(r => setProjects(r.projects || [])).catch(() => {});
      api.getPrompts().then(r => setPrompts(r.prompts || [])).catch(() => {});
      api.getCharacters().then(r => setCharacters(r.characters || [])).catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredProjects = projects.filter(p => p.name?.toLowerCase().includes(query.toLowerCase()));
  const filteredPrompts = prompts.filter(p => p.title?.toLowerCase().includes(query.toLowerCase()) || p.content?.toLowerCase().includes(query.toLowerCase()));
  const filteredCharacters = characters.filter(c => c.name?.toLowerCase().includes(query.toLowerCase()));

  const totalResults = filteredProjects.length + filteredPrompts.length + filteredCharacters.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#111111] border border-white/[0.1] shadow-2xl overflow-hidden">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.08]">
          <Search className="w-5 h-5 text-[#D4AF37]" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Cari di seluruh workspace (project, prompt, influencer)..."
            autoFocus
            className="flex-1 bg-transparent text-sm text-white placeholder-white/40 focus:outline-none"
          />
          <button onClick={onClose} className="text-white/40 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {query.trim() === '' ? (
            <div className="text-center py-8 text-xs text-white/40">
              Ketik kata kunci untuk mencari project, prompt, atau influencer tersimpan.
            </div>
          ) : totalResults === 0 ? (
            <div className="text-center py-8 text-xs text-white/40">
              Tidak ditemukan hasil untuk "{query}".
            </div>
          ) : (
            <>
              {/* Projects */}
              {filteredProjects.length > 0 && (
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-[#D4AF37] mb-2 flex items-center gap-1.5">
                    <FolderOpen className="w-3.5 h-3.5" />
                    <span>Projects ({filteredProjects.length})</span>
                  </div>
                  <div className="space-y-1">
                    {filteredProjects.map(p => (
                      <div
                        key={p.id}
                        onClick={() => {
                          onNavigate('projects');
                          onClose();
                        }}
                        className="p-2.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] cursor-pointer flex items-center justify-between transition-colors"
                      >
                        <span className="text-xs font-semibold text-white truncate">{p.name}</span>
                        <span className="text-[10px] text-white/40">{p.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Characters */}
              {filteredCharacters.length > 0 && (
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-[#D4AF37] mb-2 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>AI Influencers ({filteredCharacters.length})</span>
                  </div>
                  <div className="space-y-1">
                    {filteredCharacters.map(c => (
                      <div
                        key={c.id}
                        onClick={() => {
                          onNavigate('ai-influencer');
                          onClose();
                        }}
                        className="p-2.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] cursor-pointer flex items-center gap-3 transition-colors"
                      >
                        <img src={c.avatar} alt={c.name} className="w-6 h-6 rounded-full object-cover" />
                        <span className="text-xs font-semibold text-white">{c.name}</span>
                        <span className="text-[10px] text-white/40">· {c.style}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Prompts */}
              {filteredPrompts.length > 0 && (
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-[#D4AF37] mb-2 flex items-center gap-1.5">
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>Prompt Library ({filteredPrompts.length})</span>
                  </div>
                  <div className="space-y-1">
                    {filteredPrompts.map(p => (
                      <div
                        key={p.id}
                        onClick={() => {
                          onNavigate('prompt-library');
                          onClose();
                        }}
                        className="p-2.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] cursor-pointer transition-colors"
                      >
                        <div className="text-xs font-semibold text-white">{p.title}</div>
                        <div className="text-[11px] text-white/50 truncate mt-0.5">{p.content}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
