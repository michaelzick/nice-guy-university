import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  deleteAdminCourseReview,
  fetchAdminCourseReviews,
  fetchApprovedCourseReviews,
  fetchMyCourseReview,
  updateAdminCourseReviewStatus,
  upsertCourseReview,
} from '@/lib/api/courses';
import { CourseReviewInput } from '@/types/course';
import { useAuth } from '@/hooks/use-auth';

export function useCourseReviews(courseId: string | undefined, page: number, pageSize = 5) {
  return useQuery({
    queryKey: ['courseReviews', courseId, page, pageSize],
    queryFn: () => fetchApprovedCourseReviews(courseId!, page, pageSize),
    enabled: !!courseId,
  });
}

export function useMyCourseReview(courseId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['courseReview', 'me', user?.id, courseId],
    queryFn: () => fetchMyCourseReview(courseId!),
    enabled: !!user && !!courseId,
  });
}

export function useUpsertCourseReview(courseId: string | undefined) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (input: CourseReviewInput) => upsertCourseReview(courseId!, input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['courses'] }),
        queryClient.invalidateQueries({ queryKey: ['course'] }),
        queryClient.invalidateQueries({ queryKey: ['courseReviews', courseId] }),
        queryClient.invalidateQueries({ queryKey: ['courseReview', 'me', user?.id, courseId] }),
        queryClient.invalidateQueries({ queryKey: ['enrollments'] }),
        queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] }),
        queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] }),
        queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] }),
      ]);
    },
  });
}

export function useAdminCourseReviews(filters: {
  status?: 'pending' | 'approved' | 'hidden' | 'all';
  courseId?: string | 'all';
  search?: string;
}) {
  return useQuery({
    queryKey: ['admin', 'reviews', filters],
    queryFn: () => fetchAdminCourseReviews(filters),
  });
}

function invalidateReviewAdminQueries(queryClient: ReturnType<typeof useQueryClient>) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] }),
    queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] }),
    queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] }),
    queryClient.invalidateQueries({ queryKey: ['courses'] }),
    queryClient.invalidateQueries({ queryKey: ['course'] }),
    queryClient.invalidateQueries({ queryKey: ['courseReviews'] }),
  ]);
}

export function useApproveCourseReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewId: string) => updateAdminCourseReviewStatus(reviewId, 'approved'),
    onSuccess: async () => {
      await invalidateReviewAdminQueries(queryClient);
    },
  });
}

export function useHideCourseReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewId: string) => updateAdminCourseReviewStatus(reviewId, 'hidden'),
    onSuccess: async () => {
      await invalidateReviewAdminQueries(queryClient);
    },
  });
}

export function useDeleteCourseReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAdminCourseReview,
    onSuccess: async () => {
      await invalidateReviewAdminQueries(queryClient);
    },
  });
}
