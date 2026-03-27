import { useEffect, useMemo, useRef } from 'react';

declare global {
  interface Window {
    YT?: {
      Player: new (
        element: HTMLElement,
        options: {
          videoId: string;
          playerVars?: Record<string, string | number>;
          events?: {
            onStateChange?: (event: { data: number }) => void;
          };
        },
      ) => {
        destroy: () => void;
        getDuration: () => number;
        getCurrentTime: () => number;
      };
      PlayerState: {
        BUFFERING: number;
        ENDED: number;
        PAUSED: number;
        PLAYING: number;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
    __nguYoutubeApiReady?: Promise<void>;
  }
}

function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?#]+)/);
  return match?.[1] ?? null;
}

function loadYouTubeApi() {
  if (window.YT?.Player) {
    return Promise.resolve();
  }

  if (!window.__nguYoutubeApiReady) {
    window.__nguYoutubeApiReady = new Promise<void>((resolve) => {
      const previousReady = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        previousReady?.();
        resolve();
      };

      const existingScript = document.querySelector('script[data-ngu-youtube-api]');
      if (!existingScript) {
        const script = document.createElement('script');
        script.src = 'https://www.youtube.com/iframe_api';
        script.async = true;
        script.dataset.nguYoutubeApi = 'true';
        document.head.appendChild(script);
      }
    });
  }

  return window.__nguYoutubeApiReady;
}

type YouTubeEmbedProps = {
  url: string;
  title?: string;
  onPlay?: () => void;
  onProgress?: (progressPercent: number, positionSeconds: number) => void;
  onEnded?: () => void;
};

export default function YouTubeEmbed({ url, title, onPlay, onProgress, onEnded }: YouTubeEmbedProps) {
  const videoId = extractYouTubeId(url);
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<number | null>(null);
  const playerRef = useRef<{
    destroy: () => void;
    getDuration: () => number;
    getCurrentTime: () => number;
  } | null>(null);
  const isPlayingRef = useRef(false);
  const lastReportedSecondRef = useRef(-1);
  const shouldUseApiPlayer = useMemo(() => !!(onPlay || onProgress || onEnded), [onEnded, onPlay, onProgress]);

  useEffect(() => {
    if (!videoId || !shouldUseApiPlayer || !containerRef.current) return;

    let cancelled = false;

    const stopProgressInterval = () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    const emitProgress = () => {
      if (!playerRef.current || !onProgress) return;

      const duration = playerRef.current.getDuration();
      const currentTime = playerRef.current.getCurrentTime();
      if (!duration || Number.isNaN(duration)) return;

      const roundedSecond = Math.floor(currentTime);
      if (roundedSecond === lastReportedSecondRef.current) return;
      lastReportedSecondRef.current = roundedSecond;
      onProgress((currentTime / duration) * 100, roundedSecond);
    };

    const startProgressInterval = () => {
      emitProgress();
      stopProgressInterval();
      intervalRef.current = window.setInterval(emitProgress, 5000);
    };

    void loadYouTubeApi().then(() => {
      if (cancelled || !containerRef.current || !window.YT?.Player) return;

      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId,
        playerVars: {
          rel: 0,
          modestbranding: 1,
          iv_load_policy: 3,
          playsinline: 1,
        },
        events: {
          onStateChange: (event) => {
            if (!window.YT?.PlayerState) return;

            if (event.data === window.YT.PlayerState.PLAYING) {
              if (!isPlayingRef.current) {
                onPlay?.();
              }
              isPlayingRef.current = true;
              startProgressInterval();
              return;
            }

            if (event.data === window.YT.PlayerState.ENDED) {
              emitProgress();
              stopProgressInterval();
              isPlayingRef.current = false;
              onEnded?.();
              return;
            }

            if (event.data === window.YT.PlayerState.PAUSED || event.data === window.YT.PlayerState.BUFFERING) {
              emitProgress();
              stopProgressInterval();
              isPlayingRef.current = false;
            }
          },
        },
      });
    });

    return () => {
      cancelled = true;
      stopProgressInterval();
      playerRef.current?.destroy();
      playerRef.current = null;
      isPlayingRef.current = false;
      lastReportedSecondRef.current = -1;
    };
  }, [onEnded, onPlay, onProgress, shouldUseApiPlayer, videoId]);

  if (!videoId) {
    return <div className="aspect-video bg-muted flex items-center justify-center text-muted-foreground">Invalid YouTube URL</div>;
  }

  if (!shouldUseApiPlayer) {
    return (
      <div className="aspect-video w-full">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&iv_load_policy=3&playsinline=1`}
          title={title ?? 'Video'}
          className="w-full h-full rounded-lg"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return <div ref={containerRef} className="aspect-video w-full overflow-hidden rounded-lg" aria-label={title ?? 'Video'} />;
}
