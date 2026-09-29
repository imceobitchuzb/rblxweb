"use client";

import * as React from "react";
import {
  Lightbulb,
  Plus,
  Search,
  Filter,
  LayoutGrid,
  Columns3,
  X,
  Sparkles,
} from "lucide-react";
import { IdeaCategory, IdeaItem, IdeaPriority, IdeaStatus } from "@/lib/types";
import {
  ALL_CATEGORIES,
  ALL_PRIORITIES,
  ALL_STATUSES,
  CATEGORY_LABELS,
  PRIORITY_CONFIG,
  STATUS_LABELS,
} from "@/lib/constants";
import { INITIAL_IDEAS } from "@/lib/mock-ideas";
import { calculateIdeaStats, filterIdeas, getNextStatus } from "@/lib/ideas-utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { IdeasStats } from "@/components/ideas/IdeasStats";
import { IdeaCard } from "@/components/ideas/IdeaCard";
import { KanbanBoard } from "@/components/ideas/KanbanBoard";
import { IdeaModal } from "@/components/ideas/IdeaModal";
import { IdeaDetailsModal } from "@/components/ideas/IdeaDetailsModal";
import { DeleteIdeaDialog } from "@/components/ideas/DeleteIdeaDialog";
import { cn } from "@/lib/utils";

export default function IdeasStudioPage() {
  // State for all ideas in workspace
  const [ideas, setIdeas] = React.useState<IdeaItem[]>(INITIAL_IDEAS);

  // Search & filter state
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = React.useState<string>("ALL");
  const [selectedPriority, setSelectedPriority] = React.useState<string>("ALL");

  // View mode: 'grid' | 'kanban'
  const [viewMode, setViewMode] = React.useState<"grid" | "kanban">("grid");

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [editingIdea, setEditingIdea] = React.useState<IdeaItem | null>(null);
  const [inspectingIdea, setInspectingIdea] = React.useState<IdeaItem | null>(null);
  const [deletingIdea, setDeletingIdea] = React.useState<IdeaItem | null>(null);

  // Filter ideas based on current search & active filters
  const filteredIdeas = React.useMemo(() => {
    return filterIdeas(ideas, {
      search: searchTerm,
      category: selectedCategory,
      status: selectedStatus,
      priority: selectedPriority,
    });
  }, [ideas, searchTerm, selectedCategory, selectedStatus, selectedPriority]);

  // Derived statistics from current data
  const stats = React.useMemo(() => {
    return calculateIdeaStats(ideas);
  }, [ideas]);

  const hasActiveFilters =
    Boolean(searchTerm.trim()) ||
    selectedCategory !== "ALL" ||
    selectedStatus !== "ALL" ||
    selectedPriority !== "ALL";

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("ALL");
    setSelectedStatus("ALL");
    setSelectedPriority("ALL");
  };

  // CRUD Handlers
  const handleSaveIdea = (
    ideaData: Omit<IdeaItem, "id" | "createdAt" | "updatedAt"> & { id?: string }
  ) => {
    const timestamp = new Date().toISOString();

    if (ideaData.id) {
      // Edit existing idea
      setIdeas((prev) =>
        prev.map((item) =>
          item.id === ideaData.id
            ? {
                ...item,
                ...ideaData,
                id: item.id,
                updatedAt: timestamp,
              }
            : item
        )
      );

      // Also update inspecting idea if currently opened
      if (inspectingIdea && inspectingIdea.id === ideaData.id) {
        setInspectingIdea((prev) =>
          prev
            ? {
                ...prev,
                ...ideaData,
                updatedAt: timestamp,
              }
            : null
        );
      }
    } else {
      // Create new idea
      const newIdea: IdeaItem = {
        ...ideaData,
        id: `idea-${Date.now()}`,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      setIdeas((prev) => [newIdea, ...prev]);
    }
    setEditingIdea(null);
  };

  const handleDeleteIdea = (idea: IdeaItem) => {
    setIdeas((prev) => prev.filter((item) => item.id !== idea.id));
    if (inspectingIdea?.id === idea.id) {
      setInspectingIdea(null);
    }
  };

  const handleAdvanceStatus = (idea: IdeaItem, nextStatus: IdeaStatus) => {
    const timestamp = new Date().toISOString();
    setIdeas((prev) =>
      prev.map((item) =>
        item.id === idea.id
          ? {
              ...item,
              status: nextStatus,
              updatedAt: timestamp,
            }
          : item
      )
    );

    if (inspectingIdea?.id === idea.id) {
      setInspectingIdea((prev) =>
        prev
          ? {
              ...prev,
              status: nextStatus,
              updatedAt: timestamp,
            }
          : null
      );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Ideas Studio
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/30 font-semibold">
              Roblox Content Hub
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Plan, organize and develop your next Roblox videos.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center bg-surface-panel p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                viewMode === "grid"
                  ? "bg-violet-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              )}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              onClick={() => setViewMode("kanban")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                viewMode === "kanban"
                  ? "bg-violet-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              )}
              title="Kanban View"
            >
              <Columns3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kanban</span>
            </button>
          </div>

          {/* New Idea Button */}
          <Button
            variant="primary"
            onClick={() => {
              setEditingIdea(null);
              setIsCreateModalOpen(true);
            }}
          >
            <Plus className="w-4 h-4" />
            <span>New Idea</span>
          </Button>
        </div>
      </div>

      {/* Summary Statistics */}
      <IdeasStats stats={stats} />

      {/* Search and Filters Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-white/[0.06] space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="flex-1 max-w-lg relative">
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search ideas by title, concept hook, or #tags..."
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

          {/* Dropdown Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Category Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">
                Category:
              </span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-surface-canvas/90 text-slate-200 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-violet-500"
              >
                <option value="ALL">All Categories</option>
                {ALL_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {CATEGORY_LABELS[cat]}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">
                Status:
              </span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-surface-canvas/90 text-slate-200 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-violet-500"
              >
                <option value="ALL">All Statuses</option>
                {ALL_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {STATUS_LABELS[st]}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">
                Priority:
              </span>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="bg-surface-canvas/90 text-slate-200 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-violet-500"
              >
                <option value="ALL">All Priorities</option>
                {ALL_PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {PRIORITY_CONFIG[p].label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Active Filters Bar and Count */}
        <div className="flex items-center justify-between pt-2 border-t border-white/[0.04] text-xs">
          <div className="text-slate-400">
            Showing <strong className="text-white">{filteredIdeas.length}</strong> of{" "}
            <strong className="text-white">{ideas.length}</strong> ideas
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

      {/* Main Content Area: Grid View or Kanban View */}
      {ideas.length === 0 ? (
        /* Empty Workspace State */
        <EmptyState
          icon={Lightbulb}
          title="No ideas yet"
          badge="Empty Studio"
          description="Create your first Roblox video idea to start planning your YouTube and TikTok uploads."
          actionLabel="Create First Idea"
          onAction={() => {
            setEditingIdea(null);
            setIsCreateModalOpen(true);
          }}
        />
      ) : filteredIdeas.length === 0 ? (
        /* No Search / Filter Matches */
        <EmptyState
          icon={Filter}
          title="No matching ideas found"
          badge="Filter Result"
          description="No ideas match your current search and filters. Try tweaking your query or clearing filter criteria."
          actionLabel="Reset Filters"
          onAction={handleResetFilters}
        />
      ) : viewMode === "grid" ? (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredIdeas.map((idea) => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              viewMode="grid"
              onSelect={(selected) => setInspectingIdea(selected)}
              onEdit={(target) => setEditingIdea(target)}
              onDelete={(target) => setDeletingIdea(target)}
              onAdvanceStatus={handleAdvanceStatus}
            />
          ))}
        </div>
      ) : (
        /* Kanban View */
        <KanbanBoard
          ideas={filteredIdeas}
          onSelect={(selected) => setInspectingIdea(selected)}
          onEdit={(target) => setEditingIdea(target)}
          onDelete={(target) => setDeletingIdea(target)}
          onAdvanceStatus={handleAdvanceStatus}
        />
      )}

      {/* Create / Edit Idea Modal */}
      <IdeaModal
        isOpen={isCreateModalOpen || Boolean(editingIdea)}
        initialData={editingIdea}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingIdea(null);
        }}
        onSubmit={handleSaveIdea}
      />

      {/* Idea Specification Details Modal */}
      <IdeaDetailsModal
        isOpen={Boolean(inspectingIdea)}
        idea={inspectingIdea}
        onClose={() => setInspectingIdea(null)}
        onEdit={(target) => setEditingIdea(target)}
        onDelete={(target) => setDeletingIdea(target)}
        onAdvanceStatus={handleAdvanceStatus}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteIdeaDialog
        isOpen={Boolean(deletingIdea)}
        idea={deletingIdea}
        onClose={() => setDeletingIdea(null)}
        onConfirm={handleDeleteIdea}
      />
    </div>
  );
}
