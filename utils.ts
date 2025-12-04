import { Pet } from './types';

// Generate a random ID
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

// Get today's date in YYYY-MM-DD
export const getTodayStr = (): string => {
  return new Date().toISOString().split('T')[0];
};

// Budgie-themed colors for charts
export const BUDGIE_COLORS = [
  '#84cc16', // Lime (Green)
  '#0ea5e9', // Sky (Blue)
  '#eab308', // Yellow
  '#a855f7', // Purple
  '#64748b', // Slate (Grey)
  '#14b8a6', // Teal
  '#f43f5e', // Rose
];

export const getRandomColor = (index: number): string => {
  return BUDGIE_COLORS[index % BUDGIE_COLORS.length];
};

export const formatGram = (val: number) => `${val}g`;

// Format date for display
export const formatDateDisplay = (dateStr: string) => {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('zh-TW', {
    month: 'long',
    day: 'numeric',
    weekday: 'short'
  }).format(date);
};
