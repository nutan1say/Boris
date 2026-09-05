import { VIDEO_BACKGROUND_URL } from '@/lib/videoBackground';

/**
 * Fullscreen looping video backdrop.
 * @param {{ className?: string, veil?: boolean, fixed?: boolean }} props
 */
export default function VideoBackdrop({ className = '', veil = true, fixed = false }) {
  const position = fixed ? 'fixed' : 'absolute';

  return (
    <div className={`${position} inset-0 overflow-hidden ${className}`} aria-hidden>
      <video
        className="h-full w-full object-cover"
        src={VIDEO_BACKGROUND_URL}
        autoPlay
        muted
        loop
        playsInline
      />
      {veil && <div className="absolute inset-0 bg-black/45" />}
    </div>
  );
}
