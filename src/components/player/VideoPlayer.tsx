import { useRef, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { LessonItem } from '@/lib/api/courses';
import YouTubeEmbed from './YouTubeEmbed';
import VimeoEmbed from './VimeoEmbed';
import ScormPlayer from './ScormPlayer';
import { XapiTracker } from './XapiTracker';
import { updateLessonProgress } from '@/lib/api/progress';
import { useAuth } from '@/hooks/use-auth';

type VideoPlayerProps = {
  lesson: LessonItem;
};

export default function VideoPlayer({ lesson }: VideoPlayerProps) {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const videoRef = useRef<HTMLVideoElement>(null);
  const trackerRef = useRef<XapiTracker | null>(null);

  // Set up xAPI tracker for xAPI lessons
  useEffect(() => {
    trackerRef.current = null;

    if (lesson.videoSourceType === 'xapi' && lesson.xapiEndpoint && lesson.xapiActivityId && user) {
      trackerRef.current = new XapiTracker({
        endpoint: lesson.xapiEndpoint,
        activityId: lesson.xapiActivityId,
        lessonId: lesson.id,
        actorEmail: user.email ?? '',
        actorName: `${profile?.firstName ?? ''} ${profile?.lastName ?? ''}`.trim(),
      });
      void trackerRef.current.initialized().catch((error) => {
        console.error('Failed to initialize xAPI lesson:', error);
      });
    }
  }, [lesson, user, profile]);

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.duration === 0) return;

    const percent = (video.currentTime / video.duration) * 100;

    if (lesson.videoSourceType === 'xapi' && trackerRef.current) {
      void trackerRef.current.progressed(percent, Math.floor(video.currentTime)).catch((error) => {
        console.error('Failed to save xAPI progress:', error);
      });
    } else {
      void updateLessonProgress(lesson.id, {
        progressPercent: percent,
        lastPositionSeconds: Math.floor(video.currentTime),
      }).catch((error) => {
        console.error('Failed to save lesson progress:', error);
      });
    }
  }, [lesson]);

  const handleEnded = useCallback(async () => {
    try {
      if (lesson.videoSourceType === 'xapi' && trackerRef.current) {
        await trackerRef.current.completed();
      } else {
        await updateLessonProgress(lesson.id, {
          completed: true,
          progressPercent: 100,
        });
      }

      void queryClient.invalidateQueries({ queryKey: ['course-progress'] });
    } catch (error) {
      console.error('Failed to mark lesson complete:', error);
    }
  }, [lesson, queryClient]);

  switch (lesson.videoSourceType) {
    case 'youtube':
      return <YouTubeEmbed url={lesson.videoUrl ?? ''} title={lesson.title} />;

    case 'vimeo':
      return <VimeoEmbed url={lesson.videoUrl ?? ''} title={lesson.title} />;

    case 'scorm':
      return <ScormPlayer packageUrl={lesson.scormPackageUrl ?? ''} lessonId={lesson.id} />;

    case 'self_hosted':
    case 's3':
    case 'xapi':
      return (
        <div className="aspect-video w-full">
          <video
            ref={videoRef}
            src={lesson.videoUrl ?? ''}
            controls
            className="w-full h-full rounded-lg bg-black"
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
