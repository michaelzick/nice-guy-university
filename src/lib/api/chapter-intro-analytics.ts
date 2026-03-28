import { supabase } from '@/lib/supabase';
import { DbChapterIntroAnalytics } from '@/types/database';

type ChapterIntroAnalyticsMutation = {
  incrementViews?: number;
  incrementVideoPlays?: number;
  watchedSeconds?: number;
  lastPositionSeconds?: number;
};

type ChapterIntroAnalyticsInsert = {
  user_id: string;
  chapter_id: string;
  view_count: number;
  video_play_count: number;
  watched_seconds: number;
  last_position_seconds: number;
  first_viewed_at: string;
  last_viewed_at: string;
};

async function fetchExistingChapterIntroAnalytics(userId: string, chapterId: string) {
  const { data, error } = await supabase
    .from('chapter_intro_analytics')
    .select('*')
    .eq('user_id', userId)
    .eq('chapter_id', chapterId)
    .maybeSingle();

  if (error) throw error;
  return (data ?? null) as DbChapterIntroAnalytics | null;
}

function buildInsertPayload(
  userId: string,
  chapterId: string,
  mutation: ChapterIntroAnalyticsMutation,
  timestamp: string,
): ChapterIntroAnalyticsInsert {
  return {
    user_id: userId,
    chapter_id: chapterId,
    view_count: mutation.incrementViews ?? 0,
    video_play_count: mutation.incrementVideoPlays ?? 0,
    watched_seconds: Math.max(0, Math.floor(mutation.watchedSeconds ?? 0)),
    last_position_seconds: Math.max(0, Math.floor(mutation.lastPositionSeconds ?? 0)),
    first_viewed_at: timestamp,
    last_viewed_at: timestamp,
  };
}

function buildUpdatePayload(existing: DbChapterIntroAnalytics, mutation: ChapterIntroAnalyticsMutation, timestamp: string) {
  return {
    view_count: existing.view_count + (mutation.incrementViews ?? 0),
    video_play_count: existing.video_play_count + (mutation.incrementVideoPlays ?? 0),
    watched_seconds: Math.max(existing.watched_seconds, Math.floor(mutation.watchedSeconds ?? existing.watched_seconds)),
    last_position_seconds: Math.max(existing.last_position_seconds, Math.floor(mutation.lastPositionSeconds ?? existing.last_position_seconds)),
    last_viewed_at: timestamp,
  };
}

async function mutateChapterIntroAnalytics(chapterId: string, mutation: ChapterIntroAnalyticsMutation) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const timestamp = new Date().toISOString();
  const existing = await fetchExistingChapterIntroAnalytics(user.id, chapterId);

  if (existing) {
    const { error } = await supabase
      .from('chapter_intro_analytics')
      .update(buildUpdatePayload(existing, mutation, timestamp))
      .eq('id', existing.id);

    if (error) throw error;
    return;
  }

  const insertPayload = buildInsertPayload(user.id, chapterId, mutation, timestamp);
  const { error: insertError } = await supabase
    .from('chapter_intro_analytics')
    .insert(insertPayload);

  if (!insertError) return;

  if (insertError.code === '23505') {
    const retryExisting = await fetchExistingChapterIntroAnalytics(user.id, chapterId);
    if (!retryExisting) throw insertError;

    const { error: retryUpdateError } = await supabase
      .from('chapter_intro_analytics')
      .update(buildUpdatePayload(retryExisting, mutation, timestamp))
      .eq('id', retryExisting.id);

    if (retryUpdateError) throw retryUpdateError;
    return;
  }

  throw insertError;
}

export async function recordChapterIntroView(chapterId: string) {
  await mutateChapterIntroAnalytics(chapterId, { incrementViews: 1 });
}

export async function recordChapterIntroVideoPlay(chapterId: string) {
  await mutateChapterIntroAnalytics(chapterId, { incrementVideoPlays: 1 });
}

export async function updateChapterIntroVideoProgress(
  chapterId: string,
  progress: { watchedSeconds: number; lastPositionSeconds: number },
) {
  await mutateChapterIntroAnalytics(chapterId, progress);
}
