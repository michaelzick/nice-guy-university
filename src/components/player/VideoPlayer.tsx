import { useRef, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { CourseContentEntry } from '@/lib/api/courses';
import YouTubeEmbed from './YouTubeEmbed';
import VimeoEmbed from './VimeoEmbed';
import ScormPlayer from './ScormPlayer';
import { XapiStatement, XapiTracker } from './XapiTracker';
import { updateLessonProgress } from '@/lib/api/progress';
import { useAuth } from '@/hooks/use-auth';
import { recordChapterIntroVideoPlay, updateChapterIntroVideoProgress } from '@/lib/api/chapter-intro-analytics';

type VideoPlayerProps = {
  entry: CourseContentEntry;
};

export default function VideoPlayer({ entry }: VideoPlayerProps) {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const videoRef = useRef<HTMLVideoElement>(null);
  const trackerRef = useRef<XapiTracker | null>(null);
  const lastIntroProgressSecondRef = useRef(-1);

  const persistIntroProgress = useCallback((positionSeconds: number) => {
    if (entry.kind !== 'chapter_intro') return;

    if (
      positionSeconds !== 0 &&
      positionSeconds !== entry.durationSeconds &&
      positionSeconds - lastIntroProgressSecondRef.current < 5
    ) {
      return;
    }

    lastIntroProgressSecondRef.current = positionSeconds;

    void updateChapterIntroVideoProgress(entry.chapterId, {
      watchedSeconds: positionSeconds,
      lastPositionSeconds: positionSeconds,
    }).catch((error) => {
      console.error('Failed to save chapter intro progress:', error);
    });
  }, [entry]);

  const handleIntroPlay = useCallback(() => {
    if (entry.kind !== 'chapter_intro') return;

    void recordChapterIntroVideoPlay(entry.chapterId).catch((error) => {
      console.error('Failed to save chapter intro play count:', error);
    });
  }, [entry]);

  const handleIntroEnded = useCallback(() => {
    if (entry.kind !== 'chapter_intro') return;
    persistIntroProgress(entry.durationSeconds);
  }, [entry, persistIntroProgress]);

  const handleIntroEmbedProgress = useCallback((progressPercent: number, positionSeconds: number) => {
    if (entry.kind !== 'chapter_intro') return;

    const watchedSeconds = entry.durationSeconds > 0
      ? Math.round((progressPercent / 100) * entry.durationSeconds)
      : positionSeconds;

    persistIntroProgress(Math.max(watchedSeconds, positionSeconds));
  }, [entry, persistIntroProgress]);

  const persistLessonXapiInitialized = useCallback(async (statement: XapiStatement) => {
    if (entry.kind !== 'lesson') return;
    await updateLessonProgress(entry.id, {
      xapiStatement: statement as unknown as Record<string, unknown>,
    });
  }, [entry]);

  const persistLessonXapiProgress = useCallback(async (statement: XapiStatement, progressPercent: number, positionSeconds: number) => {
    if (entry.kind !== 'lesson') return;
    await updateLessonProgress(entry.id, {
      progressPercent,
      lastPositionSeconds: positionSeconds,
      xapiStatement: statement as unknown as Record<string, unknown>,
    });
  }, [entry]);

  const persistLessonXapiCompleted = useCallback(async (statement: XapiStatement) => {
    if (entry.kind !== 'lesson') return;
    await updateLessonProgress(entry.id, {
      completed: true,
      progressPercent: 100,
      xapiStatement: statement as unknown as Record<string, unknown>,
    });
    void queryClient.invalidateQueries({ queryKey: ['course-progress'] });
  }, [entry, queryClient]);

  const persistIntroXapiInitialized = useCallback(async (_statement: XapiStatement) => {
    // Initialization is informative for the external LRS, but intro analytics
    // only become meaningful once the learner actually starts playback.
  }, []);

  const persistIntroXapiProgress = useCallback(async (_statement: XapiStatement, progressPercent: number, positionSeconds: number) => {
    if (entry.kind !== 'chapter_intro') return;

    const watchedSeconds = entry.durationSeconds > 0
      ? Math.round((progressPercent / 100) * entry.durationSeconds)
      : positionSeconds;

    await updateChapterIntroVideoProgress(entry.chapterId, {
      watchedSeconds: Math.max(watchedSeconds, positionSeconds),
      lastPositionSeconds: positionSeconds,
    });
  }, [entry]);

  const persistIntroXapiCompleted = useCallback(async (_statement: XapiStatement) => {
    if (entry.kind !== 'chapter_intro') return;
    await updateChapterIntroVideoProgress(entry.chapterId, {
      watchedSeconds: entry.durationSeconds,
      lastPositionSeconds: entry.durationSeconds,
    });
  }, [entry]);

  useEffect(() => {
    trackerRef.current = null;
    lastIntroProgressSecondRef.current = -1;

    if (entry.videoSourceType === 'xapi' && entry.xapiEndpoint && entry.xapiActivityId && user) {
      trackerRef.current = new XapiTracker({
        endpoint: entry.xapiEndpoint,
        activityId: entry.xapiActivityId,
        actorEmail: user.email ?? '',
        actorName: `${profile?.firstName ?? ''} ${profile?.lastName ?? ''}`.trim(),
        onInitialized: entry.kind === 'lesson' ? persistLessonXapiInitialized : persistIntroXapiInitialized,
        onProgressed: entry.kind === 'lesson' ? persistLessonXapiProgress : persistIntroXapiProgress,
        onCompleted: entry.kind === 'lesson' ? persistLessonXapiCompleted : persistIntroXapiCompleted,
      });
      void trackerRef.current.initialized().catch((error) => {
        console.error('Failed to initialize xAPI content:', error);
      });
    }
  }, [
    entry,
    persistIntroXapiCompleted,
    persistIntroXapiInitialized,
    persistIntroXapiProgress,
    persistLessonXapiCompleted,
    persistLessonXapiInitialized,
    persistLessonXapiProgress,
    profile,
    user,
  ]);

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.duration === 0) return;

    const percent = (video.currentTime / video.duration) * 100;
    const positionSeconds = Math.floor(video.currentTime);

    if (entry.kind === 'chapter_intro') {
      persistIntroProgress(positionSeconds);
      return;
    }

    if (entry.videoSourceType === 'xapi' && trackerRef.current) {
      void trackerRef.current.progressed(percent, positionSeconds).catch((error) => {
        console.error('Failed to save xAPI progress:', error);
      });
      return;
    }

    void updateLessonProgress(entry.id, {
      progressPercent: percent,
      lastPositionSeconds: positionSeconds,
    }).catch((error) => {
      console.error('Failed to save lesson progress:', error);
    });
  }, [entry, persistIntroProgress]);

  const handleEnded = useCallback(async () => {
    try {
      if (entry.kind === 'chapter_intro') {
        handleIntroEnded();
        return;
      }

      if (entry.videoSourceType === 'xapi' && trackerRef.current) {
        await trackerRef.current.completed();
      } else {
        await updateLessonProgress(entry.id, {
          completed: true,
          progressPercent: 100,
        });
      }

      void queryClient.invalidateQueries({ queryKey: ['course-progress'] });
    } catch (error) {
      console.error('Failed to mark lesson complete:', error);
    }
  }, [entry, handleIntroEnded, queryClient]);

  if (entry.videoSourceType === 'no_video') {
    return null;
  }

  switch (entry.videoSourceType) {
    case 'youtube':
      return (
        <YouTubeEmbed
          url={entry.videoUrl ?? ''}
          title={entry.title}
          onPlay={entry.kind === 'chapter_intro' ? handleIntroPlay : undefined}
          onProgress={entry.kind === 'chapter_intro' ? handleIntroEmbedProgress : undefined}
          onEnded={entry.kind === 'chapter_intro' ? handleIntroEnded : undefined}
        />
      );

    case 'vimeo':
      return (
        <VimeoEmbed
          url={entry.videoUrl ?? ''}
          title={entry.title}
          onPlay={entry.kind === 'chapter_intro' ? handleIntroPlay : undefined}
          onProgress={entry.kind === 'chapter_intro' ? handleIntroEmbedProgress : undefined}
          onEnded={entry.kind === 'chapter_intro' ? handleIntroEnded : undefined}
        />
      );

    case 'scorm':
      return (
        <ScormPlayer
          packageUrl={entry.scormPackageUrl ?? ''}
          lessonId={entry.kind === 'lesson' ? entry.id : undefined}
          onPlay={entry.kind === 'chapter_intro' ? handleIntroPlay : undefined}
        />
      );

    case 'self_hosted':
    case 's3':
    case 'xapi':
      return (
        <div className="aspect-video w-full">
          <video
            ref={videoRef}
            src={entry.videoUrl ?? ''}
            controls
            className="w-full h-full rounded-lg bg-black"
            onPlay={entry.kind === 'chapter_intro' ? handleIntroPlay : undefined}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
          >
            Your browser does not support the video tag.
          </video>
        </div>
      );

    default:
      return (
        <div className="aspect-video w-full bg-muted flex items-center justify-center rounded-lg">
          <p className="text-muted-foreground">Unsupported video format</p>
        </div>
      );
  }
}
