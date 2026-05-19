export type FieldType = 'string' | 'number' | 'array' | 'wikilink';

export interface FieldSchema {
  type: FieldType;
  required: boolean;
  enum?: string[];
}

export type TypeSchema = Record<string, FieldSchema>;

const STATUS_ENUM = ['active', 'completed', 'paused', 'in-progress', 'not-started'];
const LEVEL_ENUM = ['beginner', 'intermediate', 'advanced'];

export const SCHEMAS: Record<string, TypeSchema> = {
  trail: {
    title:  { type: 'string', required: true },
    level:  { type: 'string', required: true, enum: LEVEL_ENUM },
    status: { type: 'string', required: true, enum: STATUS_ENUM },
    description:   { type: 'string', required: false },
    prerequisites: { type: 'array',  required: false },
  },
  module: {
    title:  { type: 'string',   required: true },
    trail:  { type: 'wikilink', required: true },
    order:  { type: 'number',   required: true },
    status: { type: 'string',   required: true, enum: STATUS_ENUM },
  },
  note: {
    title:      { type: 'string',   required: true },
    trail:      { type: 'wikilink', required: false },
    module:     { type: 'wikilink', required: false },
    difficulty: { type: 'number',   required: false },
  },
  card: {
    title:       { type: 'string',   required: true },
    'card-type': { type: 'string',   required: true, enum: ['basic', 'cloze', 'vocab', 'scenario', 'pitfall'] },
    trail:       { type: 'wikilink', required: false },
    module:      { type: 'wikilink', required: false },
    source:      { type: 'wikilink', required: false },
    difficulty:  { type: 'number',   required: false },
  },
  quiz: {
    title:          { type: 'string',   required: true },
    trail:          { type: 'wikilink', required: false },
    module:         { type: 'wikilink', required: false },
    questions:      { type: 'number',   required: true },
    'passing-score': { type: 'number',  required: true },
  },
  exam: {
    title:           { type: 'string',   required: true },
    trail:           { type: 'wikilink', required: false },
    questions:       { type: 'number',   required: true },
    'time-limit':    { type: 'number',   required: true },
    'passing-score': { type: 'number',   required: true },
  },
  resource: {
    title:           { type: 'string', required: true },
    'resource-type': { type: 'string', required: true, enum: ['video', 'book', 'article', 'course', 'podcast', 'paper', 'documentation', 'cheatsheet', 'repo'] },
    trail:           { type: 'wikilink', required: false },
    module:          { type: 'wikilink', required: false },
    status:          { type: 'string',   required: true, enum: ['to-consume', 'in-progress', 'consumed', 'watched', 'read'] },
    url:             { type: 'string',   required: false },
    rating:          { type: 'number',   required: false },
  },
  performance: {
    title:    { type: 'string',   required: true },
    date:     { type: 'string',   required: true },
    activity: { type: 'string',   required: true, enum: ['card-review', 'quiz', 'exam', 'study-session'] },
    trail:    { type: 'wikilink', required: false },
    module:   { type: 'wikilink', required: false },
    score:    { type: 'number',   required: false },
    duration: { type: 'number',   required: false },
  },
};
