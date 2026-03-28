
export type Course = {
  id: string;
  title: string;
  slug: string;
  instructor: string;
  instructorAvatar?: string;
  coachId: string | null;
  category: CourseCategory;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
  price: number;
  salePrice?: number;
  rating: number;
  ratingCount: number;
  studentsCount: number;
  duration: string;
  lectureCount: number;
  description: string;
  shortDescription: string;
  thumbnailUrl: string;
  thumbnailVideoUrl?: string;
  featured?: boolean;
  bestseller?: boolean;
  lastUpdated: string;
  createdAt?: string;
  updatedAt?: string;
  language: string;
  topics: string[];
  whatYouWillLearn: string[];
};

export type CourseReviewStatus = 'pending' | 'approved' | 'hidden';

export type CourseReview = {
  id: string;
  courseId: string;
  userId: string;
  reviewerName: string;
  title: string;
  body: string;
  rating: number;
  status: CourseReviewStatus;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CourseReviewInput = {
  reviewerName: string;
  title: string;
  body: string;
  rating: number;
};

export type CourseReviewPage = {
  reviews: CourseReview[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type AdminCourseReview = CourseReview & {
  courseTitle: string;
  courseSlug: string;
  profileFirstName: string | null;
  profileLastName: string | null;
};

export type CourseCategory = 
  | 'nice-guy-recovery' 
  | 'relationship-skills' 
  | 'boundaries-communication' 
  | 'self-worth-identity';

export type CartItem = {
  courseId: string;
};
