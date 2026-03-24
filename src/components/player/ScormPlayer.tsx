import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { updateLessonProgress } from '@/lib/api/progress';

type ScormPlayerProps = {
  packageUrl: string;
  lessonId: string;
};

export default function ScormPlayer({ packageUrl, lessonId }: ScormPlayerProps) {
  const queryClient = useQueryClient();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const scormDataRef = useRef<Record<string, string>>({});
  const completionInvalidatedRef = useRef(false);

  const saveProgress = useCallback(async () => {
    const completed = scormDataRef.current['cmi.core.lesson_status'] === 'completed' ||
                      scormDataRef.current['cmi.core.lesson_status'] === 'passed';

    await updateLessonProgress(lessonId, {
      completed,
      scormData: { ...scormDataRef.current },
    });

    if (completed && !completionInvalidatedRef.current) {
      completionInvalidatedRef.current = true;
      void queryClient.invalidateQueries({ queryKey: ['course-progress'] });
    }
  }, [lessonId, queryClient]);

  useEffect(() => {
    completionInvalidatedRef.current = false;
  }, [lessonId]);

  useEffect(() => {
    // SCORM 1.2 API adapter
    const api = {
      LMSInitialize: () => 'true',
      LMSFinish: () => {
        void saveProgress().catch((error) => {
          console.error('Failed to save SCORM progress:', error);
        });
        return 'true';
      },
      LMSGetValue: (key: string) => scormDataRef.current[key] ?? '',
      LMSSetValue: (key: string, value: string) => {
        scormDataRef.current[key] = value;
        return 'true';
      },
      LMSCommit: () => {
        void saveProgress().catch((error) => {
          console.error('Failed to save SCORM progress:', error);
        });
        return 'true';
      },
      LMSGetLastError: () => '0',
      LMSGetErrorString: () => '',
      LMSGetDiagnostic: () => '',
    };

    // Expose API on window for SCORM content to find
    (window as Record<string, unknown>).API = api;

    return () => {
      delete (window as Record<string, unknown>).API;
      void saveProgress().catch((error) => {
        console.error('Failed to save SCORM progress:', error);
      });
    };
  }, [saveProgress]);

  return (
    <div className="aspect-video w-full">
      <iframe
        ref={iframeRef}
        src={packageUrl}
        title="SCORM Content"
        className="w-full h-full rounded-lg border border-border"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      />
    </div>
  );
}
