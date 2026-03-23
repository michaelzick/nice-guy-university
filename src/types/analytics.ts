export type EnrollmentStatus = 'not_started' | 'in_progress' | 'completed';

export interface AnalyticsEnrollment {
  id: string;
  userId: string;
  userName: string;
  courseId: string;
  courseTitle: string;
  enrolledAt: string;
  completedAt: string | null;
  status: EnrollmentStatus;
}

export interface AnalyticsChapterProgress {
  id: string;
  userId: string;
  userName: string;
  courseId: string;
  chapterId: string;
  courseTitle: string;
  chapterTitle: string;
  chapterSortOrder: number;
  videoDurationSeconds: number;
  watchedSeconds: number;
  watchPercent: number;
  completed: boolean;
  lastPositionSeconds: number;
  sessionsCount: number;
  firstWatchedAt: string;
  lastWatchedAt: string;
}

export interface AnalyticsDailySummary {
  id: string;
  date: string;
  newEnrollments: number;
  activeLearners: number;
  lessonsCompleted: number;
  chaptersCompleted: number;
  avgWatchPercent: number;
  totalWatchTimeSeconds: number;
}

// Derived types for charts

export interface CourseCompletionRow {
  courseId: string;
  courseTitle: string;
  completed: number;
  inProgress: number;
  notStarted: number;
  total: number;
}

export interface ChapterProgressRow {
  chapterId: string;
  chapterTitle: string;
  chapterSortOrder: number;
  avgWatchPercent: number;
  completionRate: number;
  totalLearners: number;
}

export interface VideoTrackingRow {
  chapterId: string;
  chapterTitle: string;
  chapterSortOrder: number;
  avgWatchPercent: number;
  completionRate: number;
  avgSessions: number;
  avgWatchTimeSeconds: number;
  totalLearners: number;
}

export interface EnrollmentTrendRow {
  date: string;
  newEnrollments: number;
  cumulativeEnrollments: number;
}

export interface AnalyticsOverview {
  totalLearners: number;
  avgCompletionRate: number;
  avgWatchTimeMinutes: number;
  activeLearners7d: number;
  completionDistribution: {
    completed: number;
    inProgress: number;
    notStarted: number;
  };
  recentTrend: { date: string; enrollments: number }[];
}

export interface CourseOption {
  id: string;
  title: string;
}
