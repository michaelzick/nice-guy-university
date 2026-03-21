import { Course } from '@/types/course';
import { categories, levels } from './constants';
import { FilterState, PriceRangeType } from './types';

type PriceFilterOption = {
  id: string;
  label: string;
  paramValue?: string;
  range: PriceRangeType;
};

const createPriceRange = (min: number, max: number): PriceRangeType => [min, max];

const levelToParamMap: Record<Course['level'], string> = {
  Beginner: 'beginner',
  Intermediate: 'intermediate',
  Advanced: 'advanced',
  'All Levels': 'all-levels',
};

const paramToLevelMap = Object.fromEntries(
  Object.entries(levelToParamMap).map(([level, param]) => [param, level]),
) as Record<string, Course['level']>;

const validCategoryIds = new Set(categories.map((category) => category.id));
const validLevelParams = new Set(Object.values(levelToParamMap));

export const priceFilterOptions: PriceFilterOption[] = [
  { id: 'all', label: 'All Prices', range: createPriceRange(0, 500) },
  { id: 'free', label: 'Free', paramValue: 'free', range: createPriceRange(0, 0) },
  { id: 'paid', label: 'Paid', paramValue: 'paid', range: createPriceRange(0.01, 500) },
  { id: 'under-50', label: 'Under $50', paramValue: 'under-50', range: createPriceRange(0, 50) },
  { id: '50-100', label: '$50 - $100', paramValue: '50-100', range: createPriceRange(50, 100) },
  { id: '100-plus', label: '$100+', paramValue: '100-plus', range: createPriceRange(100, 500) },
];

const clonePriceRange = ([min, max]: PriceRangeType): PriceRangeType => [min, max];

const getUniqueValues = (values: string[]) => Array.from(new Set(values));

const normalizeCategories = (selectedCategories: FilterState['selectedCategories']) => {
  const selectedSet = new Set(selectedCategories.filter((category) => validCategoryIds.has(category)));
  return categories
    .map((category) => category.id)
    .filter((categoryId) => selectedSet.has(categoryId));
};

const normalizeLevels = (selectedLevels: FilterState['selectedLevels']) => {
  const selectedSet = new Set(selectedLevels.filter((level) => level in levelToParamMap));
  return levels.filter((level) => selectedSet.has(level));
};

export const createDefaultPriceRange = (): PriceRangeType => clonePriceRange(priceFilterOptions[0].range);

export const createDefaultFilterState = (): FilterState => ({
  selectedLevels: [],
  selectedCategories: [],
  priceRange: createDefaultPriceRange(),
  searchQuery: '',
});

export const isSamePriceRange = (left: PriceRangeType, right: PriceRangeType) =>
  left[0] === right[0] && left[1] === right[1];

export const isDefaultPriceRange = (priceRange: PriceRangeType) =>
  isSamePriceRange(priceRange, priceFilterOptions[0].range);

export const getPriceFilterOption = (priceRange: PriceRangeType) =>
  priceFilterOptions.find((option) => isSamePriceRange(option.range, priceRange));

export const getPriceFilterLabel = (priceRange: PriceRangeType) => {
  const option = getPriceFilterOption(priceRange);

  if (option) {
    return option.label;
  }

  return `$${priceRange[0]} - $${priceRange[1]}`;
};

export const parseCoursesFilterSearchParams = (searchParams: URLSearchParams): FilterState => {
  const selectedCategories = normalizeCategories(
    getUniqueValues(searchParams.getAll('category')) as FilterState['selectedCategories'],
  );

  const selectedLevels = normalizeLevels(
    getUniqueValues(searchParams.getAll('level'))
      .filter((levelParam) => validLevelParams.has(levelParam))
      .map((levelParam) => paramToLevelMap[levelParam]),
  );

  const priceRange = clonePriceRange(
    priceFilterOptions.find((option) => option.paramValue === searchParams.get('price'))?.range
      ?? priceFilterOptions[0].range,
  );

  return {
    selectedLevels,
    selectedCategories,
    priceRange,
    searchQuery: searchParams.get('search')?.trim() ?? '',
  };
};

export const buildCoursesFilterSearchParams = (filterState: FilterState) => {
  const searchParams = new URLSearchParams();

  normalizeCategories(filterState.selectedCategories).forEach((categoryId) => {
    searchParams.append('category', categoryId);
  });

  normalizeLevels(filterState.selectedLevels).forEach((level) => {
    searchParams.append('level', levelToParamMap[level]);
  });

  const priceFilter = getPriceFilterOption(filterState.priceRange);
  if (priceFilter?.paramValue) {
    searchParams.set('price', priceFilter.paramValue);
  }

  const trimmedSearchQuery = filterState.searchQuery.trim();
  if (trimmedSearchQuery) {
    searchParams.set('search', trimmedSearchQuery);
  }

  return searchParams;
};

export const buildCoursesHref = (partialFilterState: Partial<FilterState> = {}) => {
  const filterState = createDefaultFilterState();

  if (partialFilterState.selectedCategories) {
    filterState.selectedCategories = partialFilterState.selectedCategories;
  }

  if (partialFilterState.selectedLevels) {
    filterState.selectedLevels = partialFilterState.selectedLevels;
  }

  if (partialFilterState.priceRange) {
    filterState.priceRange = clonePriceRange(partialFilterState.priceRange);
  }

  if (partialFilterState.searchQuery !== undefined) {
    filterState.searchQuery = partialFilterState.searchQuery;
  }

  const searchParams = buildCoursesFilterSearchParams(filterState);
  const queryString = searchParams.toString();

  return queryString ? `/courses?${queryString}` : '/courses';
};
