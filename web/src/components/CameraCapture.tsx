import { useEffect, useRef, useState } from 'react';
import { t, type Lang } from '../i18n';

/**
 * Guided selfie capture: live preview with a face-oval overlay,
 * 3-second auto-capture countdown, plus gallery upload fallback.
 */
export default function CameraCapture({
  lang,
  onCapture,
}: {
  lang: Lang;
  onCapture: (file: File) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [mode, setMode] = useState<'idle' | 'live' | 'countdown' | 'denied'>('idle');
  const [count, setCount] = useState(3);

  const stop = () => {
    streamRef.current?.getTracks().forEach((tr) => tr.stop());
    streamRef.current = null;
  };

  useEffect(() => stop, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 1280 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setMode('live');
    } catch {
      setMode('denied');
    }
  };

  const doCapture = () => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0) return;
    const size = Math.min(video.videoWidth, video.videoHeight);
    const canvas = document.createElement('canvas');
    canvas.width = 960;
    canvas.height = 960;
    const ctx = canvas.getContext('2d')!;
    // center-crop to square, mirror front camera
    ctx.translate(960, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(
      video,
      (video.videoWidth - size) / 2,
      (video.videoHeight - size) / 2,
      size,
      size,
      0,
      0,
      960,
      960,
    );
    canvas.toBlob(
      (blob) => {
        if (blob) {
          stop();
          setMode('idle');
          onCapture(new File([blob], 'selfie.jpg', { type: 'image/jpeg' }));
        }
      },
      'image/jpeg',
      0.92,
    );
  };

  const beginCountdown = () => {
    setMode('countdown');
    setCount(3);
    let n = 3;
    const iv = setInterval(() => {
      n -= 1;
      if (n <= 0) {
        clearInterval(iv);
        doCapture();
      } else {
        setCount(n);
      }
    }, 1000);
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 8 * 1024 * 1024) {
      alert(t(lang, 'c_file_big'));
      return;
    }
    onCapture(f);
    e.target.value = '';
  };

  return (
    <div>
      {mode === 'idle' && (
        <div className="flex flex-col items-center gap-3">
          <div className="flex flex-wrap justify-center gap-3">
            <button onClick={startCamera} className="btn-primary rounded-2xl px-6 py-3 text-sm">
              {t(lang, 'skin_camera')}
            </button>
            <label className="btn-ghost cursor-pointer rounded-2xl px-6 py-3 text-sm">
              {t(lang, 'skin_upload')}
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={onFile} />
            </label>
          </div>
          <p className="text-xs text-white/40">{t(lang, 'skin_choose')}</p>
        </div>
      )}

      {mode === 'denied' && (
        <div className="glass rounded-2xl p-5 text-center">
          <p className="text-sm text-white/70">{t(lang, 'c_camera_denied')}</p>
          <label className="btn-primary mt-4 inline-block cursor-pointer rounded-2xl px-6 py-3 text-sm">
            {t(lang, 'skin_upload')}
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={onFile} />
          </label>
        </div>
      )}

      {(mode === 'live' || mode === 'countdown') && (
        <div className="mx-auto max-w-sm">
          <div className="relative overflow-hidden rounded-3xl border border-white/15">
            <video ref={videoRef} playsInline muted className="aspect-square w-full -scale-x-100 object-cover" />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="face-oval h-3/5 w-1/2" />
            </div>
            {mode === 'countdown' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-display text-7xl font-bold text-white drop-shadow-lg">{count}</span>
              </div>
            )}
          </div>
          <div className="mt-4 flex justify-center gap-3">
            {mode === 'live' && (
              <>
                <button onClick={beginCountdown} className="btn-primary rounded-2xl px-8 py-3 text-sm">
                  {t(lang, 'skin_capture')}
                </button>
                <button
                  onClick={() => {
                    stop();
                    setMode('idle');
                  }}
                  className="btn-ghost rounded-2xl px-5 py-3 text-sm"
                >
                  {t(lang, 'c_close')}
                </button>
              </>
            )}
            {mode === 'countdown' && <p className="py-3 text-sm text-white/70">{t(lang, 'skin_capturing')}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
