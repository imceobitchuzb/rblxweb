import { IdeaCategory, IdeaItem, IdeaPriority, IdeaStatus } from "./types";
import { ALL_CATEGORIES, ALL_PRIORITIES, ALL_STATUSES, STATUS_PROGRESSION } from "./constants";

export interface FilterOptions {
  search?: string;
  category?: string;
  status?: string;
  priority?: string;
}

export interface IdeaStats {
  total: number;
  hot: number;
  planning: number;
  production: number;
  published: number;
}

export interface IdeaFormData {
  title: string;
  description: string;
  category: IdeaCategory;
  status: IdeaStatus;
  priority: IdeaPriority;
  tagsString: string;
  potentialScore: number;
}

/**
 * Filter ideas by search term, category, status, and priority simultaneously.
 */
export function filterIdeas(ideas: IdeaItem[], options: FilterOptions): IdeaItem[] {
  const searchTerm = options.search?.trim().toLowerCase() || "";
  const categoryFilter = options.category && options.category !== "ALL" ? options.category : null;
  const statusFilter = options.status && options.status !== "ALL" ? options.status : null;
  const priorityFilter = options.priority && options.priority !== "ALL" ? options.priority : null;

  return ideas.filter((idea) => {
    // 1. Search filter: check title, description, and tags
    if (searchTerm) {
      const matchTitle = idea.title.toLowerCase().includes(searchTerm);
      const matchDesc = idea.description.toLowerCase().includes(searchTerm);
      const matchTags = idea.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm)
      );
      if (!matchTitle && !matchDesc && !matchTags) {
        return false;
      }
    }

    // 2. Category filter
    if (categoryFilter && idea.category !== categoryFilter) {
      return false;
    }

    // 3. Status filter
    if (statusFilter && idea.status !== statusFilter) {
      return false;
    }

    // 4. Priority filter
    if (priorityFilter && idea.priority !== priorityFilter) {
      return false;
    }

    return true;
  });
}

/**
 * Derive summary statistics from current list of ideas.
 */
export function calculateIdeaStats(ideas: IdeaItem[]): IdeaStats {
  return {
    total: ideas.length,
    hot: ideas.filter((idea) => idea.priority === "HOT").length,
    planning: ideas.filter((idea) => idea.status === "PLANNING").length,
    production: ideas.filter((idea) => idea.status === "PRODUCTION").length,
    published: ideas.filter((idea) => idea.status === "PUBLISHED").length,
  };
}

/**
 * Get the next linear status in the content progression pipeline.
 * Returns null if the idea is already at the terminal ARCHIVED status.
 */
export function getNextStatus(currentStatus: IdeaStatus): IdeaStatus | null {
  const currentIndex = STATUS_PROGRESSION.indexOf(currentStatus);
  if (currentIndex === -1 || currentIndex >= STATUS_PROGRESSION.length - 1) {
    return null;
  }
  return STATUS_PROGRESSION[currentIndex + 1];
}

/**
 * Parse a comma- or space-separated string into normalized tags.
 */
export function parseTags(input: string): string[] {
  if (!input) return [];
  return input
    .split(/[,]+/g)
    .map((t) => t.trim().replace(/^#+/, ""))
    .filter((t) => t.length > 0);
}

/**
 * Validate an idea form submission.
 */
export function validateIdeaForm(data: {
  title: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  potentialScore: number;
}): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (!data.title || !data.title.trim()) {
    errors.title = "Title is required";
  } else if (data.title.trim().length < 3) {
    errors.title = "Title must be at least 3 characters long";
  }

  if (!data.description || !data.description.trim()) {
    errors.description = "Description is required";
  }

  if (!ALL_CATEGORIES.includes(data.category as IdeaCategory)) {
    errors.category = "Please select a valid category";
  }

  if (!ALL_STATUSES.includes(data.status as IdeaStatus)) {
    errors.status = "Please select a valid status";
  }

  if (!ALL_PRIORITIES.includes(data.priority as IdeaPriority)) {
    errors.priority = "Please select a valid priority";
  }

  if (
    typeof data.potentialScore !== "number" ||
    isNaN(data.potentialScore) ||
    data.potentialScore < 1 ||
    data.potentialScore > 10
  ) {
    errors.potentialScore = "Potential score must be between 1 and 10";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
