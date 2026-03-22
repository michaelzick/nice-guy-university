
import { Course } from '@/types/course';
import { FilterState } from './types';

export default function useCoursesFilter(
  initialCourses: Course[],
  filterState: FilterState,
  sortOption: string,
) {
  const { searchQuery, selectedLevels, selectedCategories, priceRange } = filterState;

  let filteredCourses = [...initialCourses];

  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filteredCourses = filteredCourses.filter((course) =>
      course.title.toLowerCase().includes(query)
      || course.description.toLowerCase().includes(query),
    );
  }

  if (selectedLevels.length > 0) {
    filteredCourses = filteredCourses.filter((course) => selectedLevels.includes(course.level));
  }

  if (selectedCategories.length > 0) {
    filteredCourses = filteredCourses.filter((course) => selectedCategories.includes(course.category));
  }

  filteredCourses = filteredCourses.filter((course) => {
    const coursePrice = course.salePrice !== undefined ? Number(course.salePrice) : Number(course.price);
    return coursePrice >= Number(priceRange[0]) && coursePrice <= Number(priceRange[1]);
  });

  switch (sortOption) {
    case 'popular':
      filteredCourses.sort((a, b) => b.studentsCount - a.studentsCount);
      break;
    case 'rating':
      filteredCourses.sort((a, b) => b.rating - a.rating);
      break;
    case 'newest':
      filteredCourses.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
    case 'oldest':
      filteredCourses.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      break;
    case 'price-low':
      filteredCourses.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
      break;
    case 'price-high':
      filteredCourses.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
      break;
    default:
      break;
  }

  const hasFilters = () =>
    selectedLevels.length > 0
    || selectedCategories.length > 0
    || priceRange[0] > 0
    || priceRange[1] < 500
    || searchQuery.trim().length > 0;

  return {
    filteredCourses,
    hasFilters,
  };
}
