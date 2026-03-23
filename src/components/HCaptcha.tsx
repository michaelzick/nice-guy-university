import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

interface HCaptchaProps {
  siteKey?: string;
  onVerify: (token: string) => void;
}

export interface HCaptchaHandle {
  reset: () => void;
}

declare global {
  interface Window {
    hcaptcha?: {
      render: (
        container: HTMLElement | string,
        params: {
          sitekey: string;
          callback: (token: string) => void;
          'expired-callback': () => void;
          'error-callback': () => void;
        },
      ) => string | number;
      reset: (widgetId: string | number) => void;
    };
  }
}

let hCaptchaScriptPromise: Promise<void> | null = null;

function loadHCaptchaScript(): Promise<void> {
  if (typeof window === 'undefined' || window.hcaptcha) {
    return Promise.resolve();
  }

  if (hCaptchaScriptPromise) {
    return hCaptchaScriptPromise;
  }

  hCaptchaScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>('script[src*="js.hcaptcha.com/1/api.js"]');

    if (existingScript) {
      const waitForCaptcha = () => {
        if (window.hcaptcha) {
          resolve();
          return;
        }

        window.setTimeout(waitForCaptcha, 50);
      };

      waitForCaptcha();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.hcaptcha.com/1/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Unable to load hCaptcha.'));
    document.head.appendChild(script);
  });

  return hCaptchaScriptPromise;
}

const HCaptcha = forwardRef<HCaptchaHandle, HCaptchaProps>(function HCaptcha(
  { siteKey, onVerify },
  ref,
) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | number | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const resetCaptcha = useCallback(() => {
    if (window.hcaptcha && widgetIdRef.current !== null) {
      window.hcaptcha.reset(widgetIdRef.current);
    }

    onVerify('');
  }, [onVerify]);

  useImperativeHandle(ref, () => ({
    reset: resetCaptcha,
  }), [resetCaptcha]);

  useEffect(() => {
    if (!siteKey) {
      onVerify('');
      return;
    }

    let cancelled = false;

    void loadHCaptchaScript()
      .then(() => {
        if (cancelled || !containerRef.current || widgetIdRef.current !== null || !window.hcaptcha) {
          return;
        }

        widgetIdRef.current = window.hcaptcha.render(containerRef.current, {
          sitekey: siteKey,
          callback: (token: string) => onVerify(token),
          'expired-callback': () => onVerify(''),
          'error-callback': () => onVerify(''),
        });
      })
      .catch((error) => {
        if (!cancelled) {
          setLoadError(error instanceof Error ? error.message : 'Unable to load hCaptcha.');
          onVerify('');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [onVerify, siteKey]);

  if (!siteKey) {
    return (
      <div className="rounded-lg border border-border bg-background/80 px-4 py-3 text-sm text-muted-foreground">
        Contact form is temporarily unavailable until the hCaptcha site key is configured.
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        {loadError}
      </div>
    );
  }

  return <div ref={containerRef} className="min-h-[78px]" />;
});

export default HCaptcha;
