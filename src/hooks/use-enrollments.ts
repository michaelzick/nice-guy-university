import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import { DbCourse, DbEnrollment } from '@/types/database';

export type EnrollmentWithCourse = DbEnrollment & {
  courses: DbCourse | null;
};

export function useMyEnrollments() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['enrollments', user?.id],
    queryFn: async (): Promise<EnrollmentWithCourse[]> => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('enrollments')
        .select('*, courses(*)')
        .eq('user_id', user.id)
        .order('enrolled_at', { ascending: false });

      if (error) throw error;
      return (data ?? []) as EnrollmentWithCourse[];
    },
    enabled: !!user,
  });
}

export function useIsEnrolled(courseId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['enrollment', user?.id, courseId],
    queryFn: async () => {
      if (!user || !courseId) return false;
      const { data, error } = await supabase
        .from('enrollments')
        .select('id')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .single();

      if (error && error.code === 'PGRST116') return false;
      if (error) throw error;
      return !!data;
    },
    enabled: !!user && !!courseId,
  });
}
