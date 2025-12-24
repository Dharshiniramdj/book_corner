
export type Genre = 'Novel' | 'Self-Help' | 'Philosophy' | 'Web Novel' | 'Manga' | 'Manhwa' | 'Textbook' | 'Other';

export interface Vocabulary {
  id: string;
  word: string;
  meaning: string;
  language: string;
  context?: string;
  dateAdded: number;
}

export interface Note {
  id: string;
  content: string;
  dateAdded: number;
}

export interface UserProfile {
  name: string;
  bio: string;
  readingGoal: number;
  favoriteGenre: string;
  avatarSeed: string;
  // Changed from specific union to string to support all available Dicebear styles used in the app, fixing type error on initial profile state.
  avatarChoice: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  genre: Genre;
  subgenres: string[];
  source?: string;
  currentChapter: number;
  totalChapters?: number;
  rating: number;
  isCompleted: boolean;
  notes: Note[];
  dictionary: Vocabulary[];
  isCollegeMaterial: boolean;
  coverUrl?: string;
  lastUpdated: number;
  dateStarted: number;
  dateCompleted?: number;
  progressHistory: { date: string; chapter: number }[];
}
