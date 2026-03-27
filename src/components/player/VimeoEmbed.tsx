import { useEffect, useMemo, useRef } from 'react';

declare global {
  interface Window {
    Vimeo?: {
      Player: new (
        element: HTMLElement,
        options: {
          id: number;
          byline?: boolean;
          portrait?: boolean;
          title?: boolean;
        },
      ) => {
        destroy: () => Promise<void>;
        on: (eventName: string, callback: (payload?: { percent?: number; seconds?: number; duration?: number }) => void) => void;
      };
    };
    __nguVimeoApiReady?: Promise<void>;
  }
}

function extractVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return match?.[1] ?? null;
}

function loadVimeoApi() {
  if (window.Vimeo?.Player) {
    return Promise.resolve();
  }

  if (!window.__nguVimeoApiReady) {
    window.__nguVimeoApiReady = new Promise<void>((resolve, reject) => {
      const existingScript = document.querySelector('script[data-ngu-vimeo-api]') as HTMLScriptElement | null;
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve(), { once: true });
        existingScript.addEventListener('error', () => reject(new Error('Failed to load Vimeo API')), { once: true });
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://player.vimeo.com/api/player.js';
      script.async = true;
      script.dataset.nguVimeoApi = 'true';
      script.addEventListener('load', () => resolve(), { once: true });
      script.addEventListener('error', () => reject(new Error('Failed to load Vimeo API')), { once: true });
      document.head.appendChild(script);
    });
  }

  return window.__nguVimeoApiReady;
}

type VimeoEmbedProps = {
  url: string;
  title?: string;
  onPlay?: () => void;
  onProgress?: (progressPercent: number, positionSeconds: number) => void;
  onEnded?: () => void;
};

export default function VimeoEmbed({ url, title, onPlay, onProgress, onEnded }: VimeoEmbedProps) {
  const videoId = extractVimeoId(url);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<{ destroy: () => Promise<void>; on: (eventName: string, callback: (payload?: { percent?: number; seconds?: number; duration?: number }) => void) => void } | null>(null);
  const lastReportedSecondRef = useRef(-1);
  const shouldUseApiPlayer = useMemo(() => !!(onPlay || onProgress || onEnded), [onEnded, onPlay, onProgress]);

  useEffect(() => {
    if (!videoId || !shouldUseApiPlayer || !wrapperRef.current) return;

    let cancelled = false;
    const mountNode = document.createElement('div');
    mountNode.className = 'h-full w-full';
    wrapperRef.current.replaceChildren(mountNode);

    void loadVimeoApi()
      .then(() => {
        if (cancelled || !window.Vimeo?.Player) return;

        try {
          playerRef.current = new window.Vimeo.Player(mountNode, {
            id: Number(videoId),
            byline: false,
            portrait: false,
            title: false,
          });

          playerRef.current.on('play', () => {
            onPlay?.();
          });

          playerRef.current.on('timeupdate', (payload) => {
            if (!onProgress || !payload?.duration) return;

            const roundedSecond = Math.floor(payload.seconds ?? 0);
            if (roundedSecond === lastReportedSecondRef.current) return;
            lastReportedSecondRef.current = roundedSecond;
            onProgress((payload.percent ?? 0) * 100, roundedSecond);
          });

          playerRef.current.on('ended', () => {
            onEnded?.();
          });
        } catch (error) {
          console.error('Failed to initialize Vimeo player:', error);
        }
      })
      .catch((error) => {
        console.error(error);
      });

    return () => {
      cancelled = true;
      lastReportedSecondRef.current = -1;
      if (playerRef.current) {
        void playerRef.current.destroy().catch((error) => {
          console.error('Failed to destroy Vimeo player:', error);
        });
      }
      playerRef.current = null;
      if (wrapperRef.current) {
        wrapperRef.current.replaceChildren();
      }
    };
  }, [onEnded, onPlay, onProgress, shouldUseApiPlayer, videoId]);

  if (!videoId) {
    return <div className="aspect-video bg-muted flex items-center justify-center text-muted-foreground">Invalid Vimeo URL</div>;
  }

  if (!shouldUseApiPlayer) {
    return (
      <div className="aspect-video w-full">
        <iframe
          src={`https://player.vimeo.com/video/${videoId}?byline=0&portrait=0`}
          title={title ?? 'Video'}
          className="w-full h-full rounded-lg"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return <div ref={wrapperRef} className="aspect-video w-full overflow-hidden rounded-lg" aria-label={title ?? 'Video'} />;
}
