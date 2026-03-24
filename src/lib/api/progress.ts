import { supabase } from '@/lib/supabase';
import { DbLessonProgress } from '@/types/database';

export type CourseProgressRow = DbLessonProgress & {
  lessons: {
    chapter_id: string;
    chapters: {
      course_id: string;
    };
  };
};

type LessonProgressInput = {
  completed?: boolean;
  progressPercent?: number;
  lastPositionSeconds?: number;
  xapiStatement?: Record<string, unknown>;
  scormData?: Record<string, unknown>;
};

type LessonProgressInsert = {
  user_id: string;
  lesson_id: string;
  completed: boolean;
  progress_percent: number;
  last_position_seconds: number;
  xapi_statement: Record<string, unknown> | null;
  scorm_data: Record<string, unknown> | null;
  updated_at: string;
};

type ExistingLessonProgress = Pick<
  DbLessonProgress,
  'lesson_id' | 'progress_percent' | 'last_position_seconds' | 'xapi_statement' | 'scorm_data'
>;

async function fetchLessonIdsForCourse(courseId: string) {
  const { data: chapters, error: chapterError } = await supabase
    .from('chapters')
    .select('id')
    .eq('course_id', courseId)
    .order('sort_order');

  if (chapterError) throw chapterError;

  const chapterIds = (chapters ?? []).map((chapter) => chapter.id);
  if (chapterIds.length === 0) return [];

  const { data: lessons, error: lessonError } = await supabase
    .from('lessons')
    .select('id, chapter_id')
    .in('chapter_id', chapterIds)
    .order('sort_order');

  if (lessonError) throw lessonError;

  return (lessons ?? []).map((lesson) => lesson.id);
}

async function fetchExistingLessonProgress(userId: string, lessonIds: string[]) {
  if (lessonIds.length === 0) return [];

  const { data, error } = await supabase
    .from('lesson_progress')
    .select('lesson_id, progress_percent, last_position_seconds, xapi_statement, scorm_data')
    .eq('user_id', userId)
    .in('lesson_id', lessonIds);

  if (error) throw error;

  return (data ?? []) as ExistingLessonProgress[];
}

function buildLessonProgressInsert(
  userId: string,
  lessonId: string,
  data: LessonProgressInput,
  updatedAt: string,
): LessonProgressInsert {
  return {
    user_id: userId,
    lesson_id: lessonId,
    completed: data.completed ?? false,
    progress_percent: data.progressPercent ?? (data.completed ? 100 : 0),
    last_position_seconds: data.lastPositionSeconds ?? 0,
    xapi_statement: data.xapiStatement ?? null,
    scorm_data: data.scormData ?? null,
    updated_at: updatedAt,
  };
}

function buildLessonProgressUpdate(data: LessonProgressInput, updatedAt: string) {
  const payload: Record<string, unknown> = {
    updated_at: updatedAt,
  };

  if (data.completed !== undefined) payload.completed = data.completed;
  if (data.progressPercent !== undefined) payload.progress_percent = data.progressPercent;
  if (data.lastPositionSeconds !== undefined) payload.last_position_seconds = data.lastPositionSeconds;
  if (data.xapiStatement !== undefined) payload.xapi_statement = data.xapiStatement;
  if (data.scormData !== undefined) payload.scorm_data = data.scormData;

  return payload;
}

async function setCourseCompletionState(courseId: string, completed: boolean) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const updatedAt = new Date().toISOString();
  const lessonIds = await fetchLessonIdsForCourse(courseId);

  if (lessonIds.length > 0) {
    const existingLessonProgress = await fetchExistingLessonProgress(user.id, lessonIds);
    const existingByLessonId = new Map(existingLessonProgress.map((row) => [row.lesson_id, row]));

    const lessonProgressRows = lessonIds.map((lessonId) => {
      const existing = existingByLessonId.get(lessonId);

      return {
        user_id: user.id,
        lesson_id: lessonId,
        completed,
        progress_percent: existing?.progress_percent ?? (completed ? 100 : 0),
        last_position_seconds: existing?.last_position_seconds ?? 0,
        xapi_statement: existing?.xapi_statement ?? null,
        scorm_data: existing?.scorm_data ?? null,
        updated_at: updatedAt,
      };
    });

    const { error: lessonProgressError } = await supabase
      .from('lesson_progress')
      .upsert(lessonProgressRows, {
        onConflict: 'user_id,lesson_id',
      });

    if (lessonProgressError) throw lessonProgressError;
  }

  const { error: enrollmentError } = await supabase
    .from('enrollments')
    .update({ completed_at: completed ? updatedAt : null })
    .eq('user_id', user.id)
    .eq('course_id', courseId);

  if (enrollmentError) throw enrollmentError;
}

export async function updateLessonProgress(lessonId: string, data: LessonProgressInput) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const updatedAt = new Date().toISOString();
  const updatePayload = buildLessonProgressUpdate(data, updatedAt);
  const insertPayload = buildLessonProgressInsert(user.id, lessonId, data, updatedAt);

  const { data: updatedRows, error: updateError } = await supabase
    .from('lesson_progress')
    .update(updatePayload)
    .eq('user_id', user.id)
    .eq('lesson_id', lessonId)
    .select('id');

  if (updateError) throw updateError;
  if ((updatedRows ?? []).length > 0) return;

  const { error: insertError } = await supabase
    .from('lesson_progress')
    .insert(insertPayload);

  if (!insertError) return;

  if (insertError.code === '23505') {
    const { error: retryUpdateError } = await supabase
      .from('lesson_progress')
      .update(updatePayload)
      .eq('user_id', user.id)
      .eq('lesson_id', lessonId);

    if (retryUpdateError) throw retryUpdateError;
    return;
  }

  throw insertError;
}

export async function fetchCourseProgress(courseId: string): Promise<CourseProgressRow[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('lesson_progress')
    .select(`
      *,
      lessons!inner (
        chapter_id,
        chapters!inner (
          course_id
        )
      )
    `)
    .eq('user_id', user.id)
    .eq('lessons.chapters.course_id', courseId);

  if (error) throw error;
  return (data ?? []) as CourseProgressRow[];
}

export async function markCourseCompleted(courseId: string) {
  await setCourseCompletionState(courseId, true);
}

export async function markCourseIncomplete(courseId: string) {
  await setCourseCompletionState(courseId, false);
}

export async function fetchLessonProgress(lessonId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('lesson_progress')
    .select('*')
    .eq('user_id', user.id)
    .eq('lesson_id', lessonId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}
