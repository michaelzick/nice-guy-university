
import { Course } from '@/types/course';

export type PriceRangeType = [number, number];

export interface FilterState {
  selectedLevels: Course['level'][];
  selectedCategories: Course['category'][];
  priceRange: PriceRangeType;
  searchQuery: string;
}

export interface FilterProps {
  filterState: FilterState;
  toggleLevel: (level: Course['level']) => void;
  toggleCategory: (category: Course['category']) => void;
  setPriceRange: (range: PriceRangeType) => void;
  clearFilters: () => void;
  hasFilters: () => boolean;
}
