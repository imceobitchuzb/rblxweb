"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Plus,
  Search,
  Filter,
  X,
  Sparkles,
} from "lucide-react";
import { Character, CharacterRole, Script } from "@/lib/types";
import { ALL_ROLES, ROLE_CONFIG, ROLE_LABELS } from "@/lib/constants";
import { INITIAL_CHARACTERS } from "@/lib/mock-characters";
import { INITIAL_SCRIPTS } from "@/lib/mock-scripts";
import { filterCharacters } from "@/lib/roster-script-utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { CharacterCard } from "@/components/characters/CharacterCard";
import { CharacterModal } from "@/components/characters/CharacterModal";
import { CharacterDetailsModal } from "@/components/characters/CharacterDetailsModal";
import { DeleteCharacterDialog } from "@/components/characters/DeleteCharacterDialog";
import {
  createCharacterAction,
  deleteCharacterAction,
  fetchCharactersAction,
  updateCharacterAction,
} from "@/app/actions/characters";
import { fetchScriptsAction } from "@/app/actions/scripts";
import { cn } from "@/lib/utils";

export default function CharactersPage() {
  const router = useRouter();

  // Characters state
  const [characters, setCharacters] = React.useState<Character[]>(INITIAL_CHARACTERS);
  // Shared scripts state for cross-module linking
  const [scripts, setScripts] = React.useState<Script[]>(INITIAL_SCRIPTS);
  const [actionError, setActionError] = React.useState<string | null>(null);

  // Load characters and scripts on mount
  React.useEffect(() => {
    let mounted = true;
    async function load() {
      const [charRes, scriptRes] = await Promise.all([
        fetchCharactersAction(),
        fetchScriptsAction(),
      ]);
      if (mounted) {
        if (charRes.success) setCharacters(charRes.data);
        if (scriptRes.success) setScripts(scriptRes.data);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  // Search and filter state
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedRole, setSelectedRole] = React.useState<string>("ALL");

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [editingCharacter, setEditingCharacter] = React.useState<Character | null>(null);
  const [inspectingCharacter, setInspectingCharacter] = React.useState<Character | null>(null);
  const [deletingCharacter, setDeletingCharacter] = React.useState<Character | null>(null);

  // Filtered characters
  const filteredCharacters = React.useMemo(() => {
    return filterCharacters(characters, {
      search: searchTerm,
      role: selectedRole,
    });
  }, [characters, searchTerm, selectedRole]);

  const hasActiveFilters = Boolean(searchTerm.trim()) || selectedRole !== "ALL";

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedRole("ALL");
  };

  // CRUD Handlers
  const handleSaveCharacter = async (
    charData: Omit<Character, "id" | "createdAt" | "updatedAt"> & { id?: string }
  ) => {
    setActionError(null);
    if (charData.id) {
      // Edit
      const res = await updateCharacterAction(charData.id, charData);
      if (res.success) {
        setCharacters((prev) =>
          prev.map((item) => (item.id === charData.id ? res.data : item))
        );
        if (inspectingCharacter?.id === charData.id) {
          setInspectingCharacter(res.data);
        }
      } else {
        setActionError(res.error);
      }
    } else {
      // Create
      const res = await createCharacterAction(charData as never);
      if (res.success) {
        setCharacters((prev) => [res.data, ...prev]);
      } else {
        setActionError(res.error);
      }
    }
    setEditingCharacter(null);
  };

  const handleDeleteCharacter = async (character: Character) => {
    setActionError(null);
    const res = await deleteCharacterAction(character.id);
    if (res.success) {
      setCharacters((prev) => prev.filter((item) => item.id !== character.id));
      if (inspectingCharacter?.id === character.id) {
        setInspectingCharacter(null);
      }
    } else {
      setActionError(res.error);
    }
  };

  const handleNavigateToScript = (scriptId: string) => {
    router.push(`/scripts?id=${scriptId}`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Character Roster
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/30 font-semibold">
              Roblox Universe
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Maintain avatars, archetypes, personalities, and recurring cast members across your scripts.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => {
            setEditingCharacter(null);
            setIsCreateModalOpen(true);
          }}
        >
          <Plus className="w-4 h-4" />
          <span>New Character</span>
        </Button>
      </div>

      {actionError && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center justify-between">
          <span>{actionError}</span>
          <button
            onClick={() => setActionError(null)}
            className="text-red-400/80 hover:text-red-300 font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-white/[0.06] space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="flex-1 max-w-md relative">
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, personality, outfit, or tags..."
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

          {/* Role Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setSelectedRole("ALL")}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap",
                selectedRole === "ALL"
                  ? "bg-violet-600 text-white shadow-sm"
                  : "bg-surface-canvas/70 text-slate-400 hover:text-white border border-white/5"
              )}
            >
              All Roles ({characters.length})
            </button>

            {ALL_ROLES.map((r) => {
              const count = characters.filter((c) => c.role === r).length;
              const isSelected = selectedRole === r;
              return (
                <button
                  key={r}
                  onClick={() => setSelectedRole(r)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap",
                    isSelected
                      ? "bg-violet-600 text-white shadow-sm"
                      : "bg-surface-canvas/70 text-slate-400 hover:text-white border border-white/5"
                  )}
                >
                  {ROLE_LABELS[r]} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Counter & Reset */}
        <div className="flex items-center justify-between pt-2 border-t border-white/[0.04] text-xs">
          <div className="text-slate-400">
            Showing <strong className="text-white">{filteredCharacters.length}</strong> of{" "}
            <strong className="text-white">{characters.length}</strong> characters
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

      {/* Grid Content Area */}
      {characters.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No characters in roster"
          badge="Empty Cast"
          description="Create your first Roblox avatar character profile to start assigning lines in Script Studio."
          actionLabel="Create First Character"
          onAction={() => {
            setEditingCharacter(null);
            setIsCreateModalOpen(true);
          }}
        />
      ) : filteredCharacters.length === 0 ? (
        <EmptyState
          icon={Filter}
          title="No characters match your search"
          badge="Filter Result"
          description="Try broadening your search term or selecting a different character role filter."
          actionLabel="Reset Filters"
          onAction={handleResetFilters}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCharacters.map((character) => (
            <CharacterCard
              key={character.id}
              character={character}
              onSelect={(selected) => setInspectingCharacter(selected)}
              onEdit={(target) => setEditingCharacter(target)}
              onDelete={(target) => setDeletingCharacter(target)}
            />
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <CharacterModal
        isOpen={isCreateModalOpen || Boolean(editingCharacter)}
        initialData={editingCharacter}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingCharacter(null);
        }}
        onSubmit={handleSaveCharacter}
      />

      {/* Details Dossier Modal */}
      <CharacterDetailsModal
        isOpen={Boolean(inspectingCharacter)}
        character={inspectingCharacter}
        scripts={scripts}
        onClose={() => setInspectingCharacter(null)}
        onEdit={(target) => setEditingCharacter(target)}
        onDelete={(target) => setDeletingCharacter(target)}
        onNavigateToScript={handleNavigateToScript}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteCharacterDialog
        isOpen={Boolean(deletingCharacter)}
        character={deletingCharacter}
        scripts={scripts}
        onClose={() => setDeletingCharacter(null)}
        onConfirm={handleDeleteCharacter}
      />
    </div>
  );
}
