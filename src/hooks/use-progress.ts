import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { fetchCourseProgress } from '@/lib/api/progress';

export function useCourseProgress(courseId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['course-progress', user?.id, courseId],
    queryFn: () => fetchCourseProgress(courseId!),
    enabled: !!user && !!courseId,
  });
}
