"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  Lightbulb,
  Users,
  FileText,
  Video as VideoIcon,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { INITIAL_IDEAS } from "@/lib/mock-ideas";
import { INITIAL_CHARACTERS } from "@/lib/mock-characters";
import { INITIAL_SCRIPTS } from "@/lib/mock-scripts";
import { INITIAL_VIDEOS } from "@/lib/mock-videos";
import {
  getTotalResultCount,
  performGlobalSearch,
  SearchDataset,
} from "@/lib/search-utils";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils";

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");

  const dataset: SearchDataset = React.useMemo(
    () => ({
      ideas: INITIAL_IDEAS,
      characters: INITIAL_CHARACTERS,
      scripts: INITIAL_SCRIPTS,
      videos: INITIAL_VIDEOS,
    }),
    []
  );

  const searchResults = React.useMemo(() => {
    return performGlobalSearch(query, dataset);
  }, [query, dataset]);

  const totalResults = getTotalResultCount(searchResults);

  React.useEffect(() => {
    if (!isOpen) {
      setQuery("");
    }
  }, [isOpen]);

  const handleSelect = (href: string) => {
    onClose();
    router.push(href);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-cyan-400" />
          <span>Search Creator Workspace</span>
        </div>
      }
      description="Quick search across Ideas, Characters, Screenplays, and Video Assets"
      maxWidth="xl"
    >
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, tag, character name, or hook..."
            className="w-full bg-surface-canvas text-sm text-white placeholder:text-slate-500 border border-white/10 rounded-xl pl-10 pr-9 py-2.5 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto space-y-4 pr-1">
          {!query.trim() ? (
            <div className="py-8 text-center text-xs text-slate-500 space-y-1.5">
              <p className="font-semibold text-slate-400">
                Type a query to search your entire studio
              </p>
              <p>Try searching &quot;Sheriff&quot;, &quot;MM2&quot;, &quot;Bacon&quot;, or &quot;Chroma&quot;</p>
            </div>
          ) : totalResults === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500 space-y-1">
              <p className="font-semibold text-slate-300">
                No results found for &quot;{query}&quot;
              </p>
              <p>Check your spelling or search by broader keywords.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Ideas Results */}
              {searchResults.ideas.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-400 uppercase tracking-wider px-1">
                    <Lightbulb className="w-3 h-3" />
                    <span>Ideas ({searchResults.ideas.length})</span>
                  </div>
                  <div className="space-y-1">
                    {searchResults.ideas.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleSelect(item.href)}
                        className="p-2.5 rounded-xl bg-surface-canvas/60 hover:bg-amber-950/20 border border-white/5 hover:border-amber-500/30 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                      >
                        <div className="min-w-0">
                          <h6 className="text-xs font-bold text-white group-hover:text-amber-300 truncate">
                            {item.title}
                          </h6>
                          <p className="text-[10px] text-slate-400 truncate">
                            {item.subtitle}
                          </p>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Characters Results */}
              {searchResults.characters.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-violet-400 uppercase tracking-wider px-1">
                    <Users className="w-3 h-3" />
                    <span>Characters ({searchResults.characters.length})</span>
                  </div>
                  <div className="space-y-1">
                    {searchResults.characters.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleSelect(item.href)}
                        className="p-2.5 rounded-xl bg-surface-canvas/60 hover:bg-violet-950/20 border border-white/5 hover:border-violet-500/30 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg overflow-hidden bg-surface-elevated ring-1 ring-white/10 shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={item.avatar}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <h6 className="text-xs font-bold text-white group-hover:text-violet-300 truncate">
                              {item.name}
                            </h6>
                            <p className="text-[10px] text-slate-400 truncate">
                              {item.subtitle}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Scripts Results */}
              {searchResults.scripts.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-purple-400 uppercase tracking-wider px-1">
                    <FileText className="w-3 h-3" />
                    <span>Scripts ({searchResults.scripts.length})</span>
                  </div>
                  <div className="space-y-1">
                    {searchResults.scripts.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleSelect(item.href)}
                        className="p-2.5 rounded-xl bg-surface-canvas/60 hover:bg-purple-950/20 border border-white/5 hover:border-purple-500/30 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                      >
                        <div className="min-w-0">
                          <h6 className="text-xs font-bold text-white group-hover:text-purple-300 truncate">
                            {item.title}
                          </h6>
                          <p className="text-[10px] text-slate-400 truncate">
                            {item.subtitle}
                          </p>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Videos Results */}
              {searchResults.videos.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-cyan-400 uppercase tracking-wider px-1">
                    <VideoIcon className="w-3 h-3" />
                    <span>Videos ({searchResults.videos.length})</span>
                  </div>
                  <div className="space-y-1">
                    {searchResults.videos.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleSelect(item.href)}
                        className="p-2.5 rounded-xl bg-surface-canvas/60 hover:bg-cyan-950/20 border border-white/5 hover:border-cyan-500/30 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                      >
                        <div className="min-w-0">
                          <h6 className="text-xs font-bold text-white group-hover:text-cyan-300 truncate">
                            {item.title}
                          </h6>
                          <p className="text-[10px] text-slate-400 truncate">
                            {item.subtitle}
                          </p>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
