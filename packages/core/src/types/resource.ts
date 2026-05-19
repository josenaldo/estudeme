import type { BaseFrontmatter, Wikilink } from './base.js';

export type ResourceType =
  | 'video' | 'book' | 'article' | 'course' | 'podcast'
  | 'paper' | 'documentation' | 'cheatsheet' | 'repo';

export type ResourceStatus =
  | 'to-consume' | 'in-progress' | 'consumed' | 'watched' | 'read';

export interface ResourceFrontmatter extends BaseFrontmatter {
  type: 'resource';
  'resource-type': ResourceType;
  url?: string;
  trail?: Wikilink;
  module?: Wikilink;
  status: ResourceStatus;
  rating?: 1 | 2 | 3 | 4 | 5;
}
