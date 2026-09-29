"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  FileText,
  Plus,
  Search,
  Filter,
  X,
  Lightbulb,
  Clock,
  Sparkles,
} from "lucide-react";
import { Character, IdeaItem, Script, ScriptStatus } from "@/lib/types";
import {
  ALL_SCRIPT_STATUSES,
  SCRIPT_STATUS_CONFIG,
  SCRIPT_STATUS_LABELS,
} from "@/lib/constants";
import { INITIAL_SCRIPTS } from "@/lib/mock-scripts";
import { INITIAL_CHARACTERS } from "@/lib/mock-characters";
import { INITIAL_IDEAS } from "@/lib/mock-ideas";
import { filterScripts } from "@/lib/roster-script-utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { ScriptCard } from "@/components/scripts/ScriptCard";
import { CreateScriptModal } from "@/components/scripts/CreateScriptModal";
import { ScriptEditor } from "@/components/scripts/ScriptEditor";
import { DeleteScriptDialog } from "@/components/scripts/DeleteScriptDialog";
import { cn } from "@/lib/utils";
import {
  createScriptAction,
  deleteScriptAction,
  fetchScriptsAction,
  updateScriptAction,
} from "@/app/actions/scripts";
import { fetchCharactersAction } from "@/app/actions/characters";
import { fetchIdeasAction } from "@/app/actions/ideas";

function ScriptsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // State
  const [scripts, setScripts] = React.useState<Script[]>(INITIAL_SCRIPTS);
  const [characters, setCharacters] = React.useState<Character[]>(INITIAL_CHARACTERS);
  const [ideas, setIdeas] = React.useState<IdeaItem[]>(INITIAL_IDEAS);

  // Active script in editor (if null, display library view)
  const [activeScriptId, setActiveScriptId] = React.useState<string | null>(null);

  // Load from persistent storage on mount
  React.useEffect(() => {
    let mounted = true;
    async function load() {
      const [scriptRes, charRes, ideaRes] = await Promise.all([
        fetchScriptsAction(),
        fetchCharactersAction(),
        fetchIdeasAction(),
      ]);
      if (mounted) {
        if (scriptRes.success) setScripts(scriptRes.data);
        if (charRes.success) setCharacters(charRes.data);
        if (ideaRes.success) setIdeas(ideaRes.data);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  // Search and filter state
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedStatus, setSelectedStatus] = React.useState<string>("ALL");

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [deletingScript, setDeletingScript] = React.useState<Script | null>(null);

  // Check URL param on mount or URL change
  React.useEffect(() => {
    const idParam = searchParams.get("id");
    if (idParam && scripts.some((s) => s.id === idParam)) {
      setActiveScriptId(idParam);
    }
  }, [searchParams, scripts]);

  // Active script object
  const activeScript = React.useMemo(() => {
    return scripts.find((s) => s.id === activeScriptId) || null;
  }, [scripts, activeScriptId]);

  // Filtered scripts
  const filteredScripts = React.useMemo(() => {
    return filterScripts(scripts, {
      search: searchTerm,
      status: selectedStatus,
    });
  }, [scripts, searchTerm, selectedStatus]);

  const hasActiveFilters = Boolean(searchTerm.trim()) || selectedStatus !== "ALL";

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedStatus("ALL");
  };

  // CRUD Handlers
  const handleCreateScript = async (newScript: Script) => {
    const res = await createScriptAction({
      ideaId: newScript.ideaId,
      title: newScript.title,
      description: newScript.description,
      status: newScript.status,
      hook: newScript.hook,
      tags: newScript.tags,
      characters: newScript.characters,
    });
    if (res.success) {
      setScripts((prev) => [res.data, ...prev]);
      setActiveScriptId(res.data.id);
    } else {
      setScripts((prev) => [newScript, ...prev]);
      setActiveScriptId(newScript.id);
    }
  };

  const handleSaveScript = async (updatedScript: Script) => {
    setScripts((prev) =>
      prev.map((s) => (s.id === updatedScript.id ? updatedScript : s))
    );
    await updateScriptAction(updatedScript.id, {
      title: updatedScript.title,
      description: updatedScript.description,
      status: updatedScript.status,
      hook: updatedScript.hook,
      tags: updatedScript.tags,
      estimatedDuration: updatedScript.estimatedDuration,
    });
  };

  const handleDeleteScript = async (script: Script) => {
    setScripts((prev) => prev.filter((s) => s.id !== script.id));
    if (activeScriptId === script.id) {
      setActiveScriptId(null);
    }
    await deleteScriptAction(script.id);
  };

  const handleCloseEditor = () => {
    setActiveScriptId(null);
    router.replace("/scripts");
  };

  // If a script is opened, show the 3-pane Script Studio Editor!
  if (activeScript) {
    return (
      <ScriptEditor
        script={activeScript}
        characters={characters}
        onBack={handleCloseEditor}
        onSaveScript={handleSaveScript}
      />
    );
  }

  // Otherwise, render the Script Library List view
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Script Studio
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/30 font-semibold">
              Roblox Screenplay OS
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Write structured scene-by-scene scripts, dialogue cues, and character lines.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Plus className="w-4 h-4" />
          <span>New Script</span>
        </Button>
      </div>

      {/* Search and Filters Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-white/[0.06] space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="flex-1 max-w-md relative">
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search scripts by title, hook, or tags..."
              icon={<Search className="w-4 h-4" />}
              className="bg-surface-canvas/90 h-10 text-xs"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Status Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setSelectedStatus("ALL")}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap",
                selectedStatus === "ALL"
                  ? "bg-violet-600 text-white shadow-sm"
                  : "bg-surface-canvas/70 text-slate-400 hover:text-white border border-white/5"
              )}
            >
              All Statuses ({scripts.length})
            </button>

            {ALL_SCRIPT_STATUSES.map((st) => {
              const count = scripts.filter((s) => s.status === st).length;
              const isSelected = selectedStatus === st;
              return (
                <button
                  key={st}
                  onClick={() => setSelectedStatus(st)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap",
                    isSelected
                      ? "bg-violet-600 text-white shadow-sm"
                      : "bg-surface-canvas/70 text-slate-400 hover:text-white border border-white/5"
                  )}
                >
                  {SCRIPT_STATUS_LABELS[st]} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Counter & Reset */}
        <div className="flex items-center justify-between pt-2 border-t border-white/[0.04] text-xs">
          <div className="text-slate-400">
            Showing <strong className="text-white">{filteredScripts.length}</strong> of{" "}
            <strong className="text-white">{scripts.length}</strong> scripts
          </div>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="text-xs text-violet-400 hover:text-violet-300 h-7 px-2"
            >
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      {/* Scripts Library Grid */}
      {scripts.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No scripts created yet"
          badge="Empty Studio"
          description="Create your first Roblox screenplay to script dialogue, hooks, and scene pacing."
          actionLabel="Create First Script"
          onAction={() => setIsCreateModalOpen(true)}
        />
      ) : filteredScripts.length === 0 ? (
        <EmptyState
          icon={Filter}
          title="No scripts match your search"
          badge="Filter Result"
          description="Try broadening your search query or selecting a different status filter."
          actionLabel="Reset Filters"
          onAction={handleResetFilters}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredScripts.map((script) => (
            <ScriptCard
              key={script.id}
              script={script}
              onOpen={(s) => setActiveScriptId(s.id)}
              onDelete={(s) => setDeletingScript(s)}
            />
          ))}
        </div>
      )}

      {/* Create Script Modal (Scratch or From Idea) */}
      <CreateScriptModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        availableIdeas={ideas}
        onSubmit={handleCreateScript}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteScriptDialog
        isOpen={Boolean(deletingScript)}
        script={deletingScript}
        onClose={() => setDeletingScript(null)}
        onConfirm={handleDeleteScript}
      />
    </div>
  );
}

export default function ScriptsPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-slate-400">Loading Script Studio...</div>}>
      <ScriptsContent />
    </React.Suspense>
  );
}
