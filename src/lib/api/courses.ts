import { supabase } from '@/lib/supabase';
import {
  AdminCourseReview,
  Course,
  CourseReview,
  CourseReviewInput,
  CourseReviewPage,
} from '@/types/course';
import { DbCourse, DbChapter, DbCourseReview, DbLesson } from '@/types/database';

type AdminCourseReviewRow = DbCourseReview & {
  courses: {
    title: string;
    slug: string;
  } | null;
};

export function mapDbCourseToCourse(db: DbCourse): Course {
  return {
    id: db.id,
    title: db.title,
    slug: db.slug,
    instructor: db.instructor,
    instructorAvatar: db.instructor_avatar ?? undefined,
    coachId: db.coach_id ?? null,
    category: db.category as Course['category'],
    level: db.level as Course['level'],
    price: Number(db.price),
    salePrice: db.sale_price ? Number(db.sale_price) : undefined,
    rating: Number(db.rating),
    ratingCount: db.rating_count,
    studentsCount: db.students_count,
    duration: db.duration,
    lectureCount: db.lecture_count,
    description: db.description,
    shortDescription: db.short_description,
    thumbnailUrl: db.thumbnail_url,
    featured: db.featured,
    bestseller: db.bestseller,
    lastUpdated: db.last_updated,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
    language: db.language,
    topics: db.topics,
    whatYouWillLearn: db.what_you_will_learn,
  };
}

export function mapDbCourseReviewToCourseReview(db: DbCourseReview): CourseReview {
  return {
    id: db.id,
    courseId: db.course_id,
    userId: db.user_id,
    reviewerName: db.reviewer_name,
    title: db.title,
    body: db.body,
    rating: db.rating,
    status: db.status,
    approvedAt: db.approved_at,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
  };
}

function mapAdminCourseReview(row: AdminCourseReviewRow): AdminCourseReview {
  const review = mapDbCourseReviewToCourseReview(row);

  return {
    ...review,
    courseTitle: row.courses?.title ?? 'Deleted Course',
    courseSlug: row.courses?.slug ?? '',
    profileFirstName: null,
    profileLastName: null,
  };
}

export async function fetchCourses(): Promise<Course[]> {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as DbCourse[]).map(mapDbCourseToCourse);
}

export async function fetchAllCourses(): Promise<Course[]> {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as DbCourse[]).map(mapDbCourseToCourse);
}

export async function fetchCourseBySlug(slug: string): Promise<Course | null> {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return mapDbCourseToCourse(data as DbCourse);
}

export async function fetchCoursesByIds(ids: string[]): Promise<Course[]> {
  if (ids.length === 0) return [];
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .in('id', ids);

  if (error) throw error;
  return (data as DbCourse[]).map(mapDbCourseToCourse);
}

export async function fetchFeaturedCourses(): Promise<Course[]> {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('published', true)
    .eq('featured', true)
    .limit(3);

  if (error) throw error;
  return (data as DbCourse[]).map(mapDbCourseToCourse);
}

export type ChapterWithLessons = {
  id: string;
  title: string;
  description: string | null;
  sortOrder: number;
  lessons: LessonItem[];
};

export type LessonItem = {
  id: string;
  title: string;
  description: string | null;
  sortOrder: number;
  durationSeconds: number;
  videoSourceType: DbLesson['video_source_type'];
  videoUrl: string | null;
  scormPackageUrl: string | null;
  xapiEndpoint: string | null;
  xapiActivityId: string | null;
  content: string | null;
  journalPrompts: string[];
  isPreview: boolean;
};

export async function fetchCourseChapters(courseId: string): Promise<ChapterWithLessons[]> {
  const { data: chapters, error: chapError } = await supabase
    .from('chapters')
    .select('*')
    .eq('course_id', courseId)
    .order('sort_order');

  if (chapError) throw chapError;

  const { data: lessons, error: lessonError } = await supabase
    .from('lessons')
    .select('*')
    .in('chapter_id', (chapters as DbChapter[]).map(c => c.id))
    .order('sort_order');

  if (lessonError) throw lessonError;

  return (chapters as DbChapter[]).map(ch => ({
    id: ch.id,
    title: ch.title,
    description: ch.description,
    sortOrder: ch.sort_order,
    lessons: (lessons as DbLesson[])
      .filter(l => l.chapter_id === ch.id)
      .map(l => ({
        id: l.id,
        title: l.title,
        description: l.description,
        sortOrder: l.sort_order,
        durationSeconds: l.duration_seconds,
        videoSourceType: l.video_source_type,
        videoUrl: l.video_url,
        scormPackageUrl: l.scorm_package_url,
        xapiEndpoint: l.xapi_endpoint,
        xapiActivityId: l.xapi_activity_id,
        content: l.content,
        journalPrompts: l.journal_prompts ?? [],
        isPreview: l.is_preview,
      })),
  }));
}

export async function fetchRelatedCourses(courseId: string, category: string, limit = 4): Promise<Course[]> {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('published', true)
    .eq('category', category)
    .neq('id', courseId)
    .limit(limit);

  if (error) throw error;
  return (data as DbCourse[]).map(mapDbCourseToCourse);
}

export async function fetchApprovedCourseReviews(
  courseId: string,
  page = 1,
  pageSize = 5,
): Promise<CourseReviewPage> {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from('course_reviews')
    .select('*', { count: 'exact' })
    .eq('course_id', courseId)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;

  const totalCount = count ?? 0;

  return {
    reviews: (data as DbCourseReview[]).map(mapDbCourseReviewToCourseReview),
    totalCount,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(totalCount / pageSize)),
  };
}

export async function fetchMyCourseReview(courseId: string): Promise<CourseReview | null> {
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return null;

  const { data, error } = await supabase
    .from('course_reviews')
    .select('*')
    .eq('course_id', courseId)
    .eq('user_id', authData.user.id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return mapDbCourseReviewToCourseReview(data as DbCourseReview);
}

export async function upsertCourseReview(
  courseId: string,
  input: CourseReviewInput,
): Promise<CourseReview> {
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) throw new Error('Not authenticated');

  const payload = {
    course_id: courseId,
    user_id: authData.user.id,
    reviewer_name: input.reviewerName.trim(),
    title: input.title.trim(),
    body: input.body.trim(),
    rating: input.rating,
    status: 'pending' as const,
  };

  const { data, error } = await supabase
    .from('course_reviews')
    .upsert(payload, { onConflict: 'course_id,user_id' })
    .select('*')
    .single();

  if (error) throw error;

  return mapDbCourseReviewToCourseReview(data as DbCourseReview);
}

export async function fetchAdminCourseReviews(filters: {
  status?: 'pending' | 'approved' | 'hidden' | 'all';
  courseId?: string | 'all';
  search?: string;
} = {}): Promise<AdminCourseReview[]> {
  const { status = 'all', courseId = 'all', search = '' } = filters;
  let query = supabase
    .from('course_reviews')
    .select('*, courses(title, slug)')
    .order('created_at', { ascending: false });

  if (status !== 'all') {
    query = query.eq('status', status);
  }

  if (courseId !== 'all') {
    query = query.eq('course_id', courseId);
  }

  const { data, error } = await query;

  if (error) throw error;

  const normalizedSearch = search.trim().toLowerCase();
  const reviews = (data as AdminCourseReviewRow[]).map(mapAdminCourseReview);

  if (!normalizedSearch) {
    return reviews;
  }

  return reviews.filter((review) => {
    return review.reviewerName.toLowerCase().includes(normalizedSearch)
      || review.title.toLowerCase().includes(normalizedSearch)
      || review.courseTitle.toLowerCase().includes(normalizedSearch);
  });
}

export async function updateAdminCourseReviewStatus(
  reviewId: string,
  status: 'approved' | 'hidden',
): Promise<AdminCourseReview> {
  const { data, error } = await supabase
    .from('course_reviews')
    .update({ status })
    .eq('id', reviewId)
    .select('*, courses(title, slug)')
    .single();

  if (error) throw error;

  return mapAdminCourseReview(data as AdminCourseReviewRow);
}

export async function deleteAdminCourseReview(reviewId: string) {
  const { error } = await supabase
    .from('course_reviews')
    .delete()
    .eq('id', reviewId);

  if (error) throw error;
}
