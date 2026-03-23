import { supabase } from '@/lib/supabase';
import type {
  AnalyticsOverview,
  CourseCompletionRow,
  ChapterProgressRow,
  VideoTrackingRow,
  EnrollmentTrendRow,
  CourseOption,
} from '@/types/analytics';

export async function fetchAnalyticsOverview(): Promise<AnalyticsOverview> {
  const [enrollmentsRes, summaryRes] = await Promise.all([
    supabase.from('dummy_analytics_enrollments').select('status'),
    supabase
      .from('dummy_analytics_daily_summary')
      .select('*')
      .order('date', { ascending: false })
      .limit(30),
  ]);

  const enrollments = enrollmentsRes.data ?? [];
  const summaries = summaryRes.data ?? [];

  const completed = enrollments.filter((e) => e.status === 'completed').length;
  const inProgress = enrollments.filter((e) => e.status === 'in_progress').length;
  const notStarted = enrollments.filter((e) => e.status === 'not_started').length;
  const total = enrollments.length;

  const uniqueUserIds = new Set(enrollments.map(() => Math.random())); // dummy count
  const totalLearners = total > 0 ? Math.round(total / 6) : 0; // ~50 users

  // Get actual unique learner count from enrollments
  const learnersRes = await supabase
    .from('dummy_analytics_enrollments')
    .select('user_id');
  const uniqueLearners = new Set((learnersRes.data ?? []).map((e) => e.user_id)).size;

  const avgCompletionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Avg watch time from last 30 days
  const totalWatchTime = summaries.reduce((s, d) => s + (d.total_watch_time_seconds || 0), 0);
  const avgWatchTimeMinutes = summaries.length > 0
    ? Math.round(totalWatchTime / summaries.length / 60)
    : 0;

  // Active learners in last 7 days
  const last7 = summaries.slice(0, 7);
  const activeLearners7d = last7.length > 0
    ? Math.round(last7.reduce((s, d) => s + (d.active_learners || 0), 0) / last7.length)
    : 0;

  // Recent trend (reverse so oldest first)
  const recentTrend = [...summaries].reverse().map((d) => ({
    date: d.date,
    enrollments: d.new_enrollments,
  }));

  return {
    totalLearners: uniqueLearners,
    avgCompletionRate,
    avgWatchTimeMinutes,
    activeLearners7d,
    completionDistribution: { completed, inProgress, notStarted },
    recentTrend,
  };
}

export async function fetchCourseCompletionData(): Promise<CourseCompletionRow[]> {
  const { data, error } = await supabase
    .from('dummy_analytics_enrollments')
    .select('course_id, course_title, status');

  if (error) throw error;

  const grouped = new Map<string, CourseCompletionRow>();

  for (const row of data ?? []) {
    const existing = grouped.get(row.course_id) ?? {
      courseId: row.course_id,
      courseTitle: row.course_title,
      completed: 0,
      inProgress: 0,
      notStarted: 0,
      total: 0,
    };

    if (row.status === 'completed') existing.completed++;
    else if (row.status === 'in_progress') existing.inProgress++;
    else existing.notStarted++;
    existing.total++;

    grouped.set(row.course_id, existing);
  }

  return Array.from(grouped.values()).sort((a, b) => b.total - a.total);
}

export async function fetchAnalyticsCourses(): Promise<CourseOption[]> {
  const { data, error } = await supabase
    .from('dummy_analytics_chapter_progress')
    .select('course_id, course_title');

  if (error) throw error;

  const seen = new Map<string, string>();
  for (const row of data ?? []) {
    if (!seen.has(row.course_id)) {
      seen.set(row.course_id, row.course_title);
    }
  }

  return Array.from(seen.entries()).map(([id, title]) => ({ id, title }));
}

export async function fetchChapterProgressData(courseId: string): Promise<ChapterProgressRow[]> {
  const { data, error } = await supabase
    .from('dummy_analytics_chapter_progress')
    .select('chapter_id, chapter_title, chapter_sort_order, watch_percent, completed')
    .eq('course_id', courseId);

  if (error) throw error;

  const grouped = new Map<string, {
    chapterId: string;
    chapterTitle: string;
    chapterSortOrder: number;
    totalWatchPercent: number;
    completedCount: number;
    count: number;
  }>();

  for (const row of data ?? []) {
    const existing = grouped.get(row.chapter_id) ?? {
      chapterId: row.chapter_id,
      chapterTitle: row.chapter_title,
      chapterSortOrder: row.chapter_sort_order,
      totalWatchPercent: 0,
      completedCount: 0,
      count: 0,
    };

    existing.totalWatchPercent += Number(row.watch_percent);
    if (row.completed) existing.completedCount++;
    existing.count++;

    grouped.set(row.chapter_id, existing);
  }

  return Array.from(grouped.values())
    .map((g) => ({
      chapterId: g.chapterId,
      chapterTitle: g.chapterTitle,
      chapterSortOrder: g.chapterSortOrder,
      avgWatchPercent: Math.round((g.totalWatchPercent / g.count) * 10) / 10,
      completionRate: Math.round((g.completedCount / g.count) * 100),
      totalLearners: g.count,
    }))
    .sort((a, b) => a.chapterSortOrder - b.chapterSortOrder);
}

export async function fetchVideoTrackingData(courseId: string): Promise<VideoTrackingRow[]> {
  const { data, error } = await supabase
    .from('dummy_analytics_chapter_progress')
    .select('chapter_id, chapter_title, chapter_sort_order, watch_percent, completed, sessions_count, watched_seconds')
    .eq('course_id', courseId);

  if (error) throw error;

  const grouped = new Map<string, {
    chapterId: string;
    chapterTitle: string;
    chapterSortOrder: number;
    totalWatchPercent: number;
    completedCount: number;
    totalSessions: number;
    totalWatchTime: number;
    count: number;
  }>();

  for (const row of data ?? []) {
    const existing = grouped.get(row.chapter_id) ?? {
      chapterId: row.chapter_id,
      chapterTitle: row.chapter_title,
      chapterSortOrder: row.chapter_sort_order,
      totalWatchPercent: 0,
      completedCount: 0,
      totalSessions: 0,
      totalWatchTime: 0,
      count: 0,
    };

    existing.totalWatchPercent += Number(row.watch_percent);
    if (row.completed) existing.completedCount++;
    existing.totalSessions += row.sessions_count;
    existing.totalWatchTime += row.watched_seconds;
    existing.count++;

    grouped.set(row.chapter_id, existing);
  }

  return Array.from(grouped.values())
    .map((g) => ({
      chapterId: g.chapterId,
      chapterTitle: g.chapterTitle,
      chapterSortOrder: g.chapterSortOrder,
      avgWatchPercent: Math.round((g.totalWatchPercent / g.count) * 10) / 10,
      completionRate: Math.round((g.completedCount / g.count) * 100),
      avgSessions: Math.round((g.totalSessions / g.count) * 10) / 10,
      avgWatchTimeSeconds: Math.round(g.totalWatchTime / g.count),
      totalLearners: g.count,
    }))
    .sort((a, b) => a.chapterSortOrder - b.chapterSortOrder);
}

export async function fetchEnrollmentTrends(): Promise<EnrollmentTrendRow[]> {
  const { data, error } = await supabase
    .from('dummy_analytics_daily_summary')
    .select('date, new_enrollments')
    .order('date', { ascending: true });

  if (error) throw error;

  let cumulative = 0;
  return (data ?? []).map((row) => {
    cumulative += row.new_enrollments;
    return {
      date: row.date,
      newEnrollments: row.new_enrollments,
      cumulativeEnrollments: cumulative,
    };
  });
}
