export interface Pet {
  id: string;
  name: string;
  species: string; // default 'Budgie'
  color: string; // Hex code for chart differentiation
  createdAt: number;
}

export interface WeightRecord {
  id: string;
  petId: string;
  weight: number; // in grams
  date: string; // ISO Date string YYYY-MM-DD
  notes?: string;
  timestamp: number; // for sorting
}

export type ViewMode = 'dashboard' | 'history' | 'charts' | 'settings';

export interface ChartDataPoint {
  date: string;
  [petId: string]: number | string;
}
