import { Character, IdeaItem, Script, Video } from "./types";

export interface SearchIdeaResult {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  tags: string[];
  category: string;
}

export interface SearchCharacterResult {
  id: string;
  name: string;
  role: string;
  subtitle: string;
  href: string;
  avatar: string;
}

export interface SearchScriptResult {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  status: string;
  scenesCount: number;
}

export interface SearchVideoResult {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  platform: string;
  status: string;
}

export interface GlobalSearchResultGroup {
  ideas: SearchIdeaResult[];
  characters: SearchCharacterResult[];
  scripts: SearchScriptResult[];
  videos: SearchVideoResult[];
}

export interface SearchDataset {
  ideas: IdeaItem[];
  characters: Character[];
  scripts: Script[];
  videos: Video[];
}

/**
 * Searches across Ideas, Characters, Scripts, and Videos using multi-field matching.
 */
export function performGlobalSearch(
  query: string,
  dataset: SearchDataset
): GlobalSearchResultGroup {
  const trimmed = query.trim().toLowerCase();

  if (!trimmed) {
    return {
      ideas: [],
      characters: [],
      scripts: [],
      videos: [],
    };
  }

  // 1. Search Ideas (title, description, tags)
  const ideas: SearchIdeaResult[] = dataset.ideas
    .filter((idea) => {
      const titleMatch = idea.title.toLowerCase().includes(trimmed);
      const descMatch = idea.description.toLowerCase().includes(trimmed);
      const tagMatch = idea.tags.some((t) => t.toLowerCase().includes(trimmed));
      const catMatch = idea.category.toLowerCase().includes(trimmed);
      return titleMatch || descMatch || tagMatch || catMatch;
    })
    .slice(0, 5)
    .map((idea) => ({
      id: idea.id,
      title: idea.title,
      subtitle: `${idea.category} • ${idea.status} • Score ${idea.potentialScore}/10`,
      href: `/ideas?search=${encodeURIComponent(idea.title)}`,
      tags: idea.tags,
      category: idea.category,
    }));

  // 2. Search Characters (name, description, personality, tags)
  const characters: SearchCharacterResult[] = dataset.characters
    .filter((char) => {
      const nameMatch = char.name.toLowerCase().includes(trimmed);
      const descMatch = char.description.toLowerCase().includes(trimmed);
      const persMatch = char.personality.toLowerCase().includes(trimmed);
      const tagMatch = char.tags.some((t) => t.toLowerCase().includes(trimmed));
      return nameMatch || descMatch || persMatch || tagMatch;
    })
    .slice(0, 5)
    .map((char) => ({
      id: char.id,
      name: char.name,
      role: char.role,
      subtitle: `${char.role} • ${char.personality}`,
      href: `/characters?search=${encodeURIComponent(char.name)}`,
      avatar: char.avatar || char.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100",
    }));

  // 3. Search Scripts (title, hook, description, tags)
  const scripts: SearchScriptResult[] = dataset.scripts
    .filter((script) => {
      const titleMatch = script.title.toLowerCase().includes(trimmed);
      const hookMatch = script.hook.toLowerCase().includes(trimmed);
      const descMatch = (script.description || "").toLowerCase().includes(trimmed);
      const tagMatch = script.tags.some((t) => t.toLowerCase().includes(trimmed));
      return titleMatch || hookMatch || descMatch || tagMatch;
    })
    .slice(0, 5)
    .map((script) => ({
      id: script.id,
      title: script.title,
      subtitle: `${script.status} • Hook: "${script.hook.slice(0, 45)}..."`,
      href: `/scripts?scriptId=${script.id}`,
      status: script.status,
      scenesCount: script.scenes.length,
    }));

  // 4. Search Videos (title, description, tags)
  const videos: SearchVideoResult[] = dataset.videos
    .filter((video) => {
      const titleMatch = video.title.toLowerCase().includes(trimmed);
      const descMatch = (video.description || "").toLowerCase().includes(trimmed);
      const tagMatch = video.tags.some((t) => t.toLowerCase().includes(trimmed));
      return titleMatch || descMatch || tagMatch;
    })
    .slice(0, 5)
    .map((video) => ({
      id: video.id,
      title: video.title,
      subtitle: `${video.platform.replace(/_/g, " ")} • ${video.status}`,
      href: `/videos?videoId=${video.id}`,
      platform: video.platform,
      status: video.status,
    }));

  return {
    ideas,
    characters,
    scripts,
    videos,
  };
}

/**
 * Returns total count of search hits across all 4 categories.
 */
export function getTotalResultCount(results: GlobalSearchResultGroup): number {
  return (
    results.ideas.length +
    results.characters.length +
    results.scripts.length +
    results.videos.length
  );
}
