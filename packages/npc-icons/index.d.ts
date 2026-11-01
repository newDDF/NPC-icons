export type IconFormat = 'svg' | 'png';
export type IconOrigin = 'official' | 'repository' | 'traced' | 'original' | 'other';
export type IconStatus = 'active';
export interface NPCIcon {
  id: string;
  status: IconStatus;
  legacyId: string;
  legacyIds: string[];
  name: string;
  color: string;
  format: IconFormat;
  source: string;
  info: string;
  category: string[];
  origin: IconOrigin | null;
  by: string | null;
  updatedAt: string | null;
  filename: string;
  path: string;
  url: string;
  apiUrl: string;
  legacyApiUrl: string;
}
export interface IconQueryOptions {
  format?: IconFormat;
  category?: string | string[];
}
export interface NPCIconStats { total: number; svg: number; png: number; }
export function getIcons(options?: IconQueryOptions): NPCIcon[];
export function getIcon(name: string, format?: IconFormat): NPCIcon | null;
export function searchIcons(query: string): NPCIcon[];
export function getIconSvg(name: string): string | null;
export function getStats(): NPCIconStats;
