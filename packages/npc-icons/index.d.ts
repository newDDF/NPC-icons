export type IconFormat = 'svg' | 'png';
export interface NPCIcon { id: string; name: string; color: string; format: IconFormat; source: string; info: string; category: string[]; filename: string; path: string; url: string; apiUrl: string; }
export interface IconQueryOptions { format?: IconFormat; category?: string; }
export interface NPCIconStats { total: number; svg: number; png: number; }
export function getIcons(options?: IconQueryOptions): NPCIcon[];
export function getIcon(name: string, format?: IconFormat): NPCIcon | null;
export function searchIcons(query: string): NPCIcon[];
export function getIconSvg(name: string): string | null;
export function getStats(): NPCIconStats;
