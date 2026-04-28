import { useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoMuteToggleProps {
  /** Ref to the <video> element this toggle controls */
  videoRef: React.RefObject<HTMLVideoElement>;
  /** Initial muted state (defaults to true so autoplay still works) */
  defaultMuted?: boolean;
  /** Position preset relative to the video container */
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  className?: string;
}

const positionClasses: Record<NonNullable<VideoMuteToggleProps["position"]>, string> = {
  "bottom-right": "bottom-3 right-3",
  "bottom-left": "bottom-3 left-3",
  "top-right": "top-3 right-3",
  "top-left": "top-3 left-3",
};

/**
 * Reusable sound on/off toggle for autoplaying videos.
 * Place inside a relatively-positioned video container alongside the <video>.
 */
const VideoMuteToggle = ({
  videoRef,
  defaultMuted = true,
  position = "bottom-right",
  className,
}: VideoMuteToggleProps) => {
  const [isMuted, setIsMuted] = useState(defaultMuted);

  // Keep the actual video element in sync if it mounts after this component
  useEffect(() => {
    const video = videoRef.current;
    if (video) video.muted = isMuted;
  }, [isMuted, videoRef]);

  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;
    const next = !isMuted;
    video.muted = next;
    if (!next) {
      // Ensure audible volume when unmuting
      video.volume = 1;
      // Resume playback if browser paused on autoplay-with-sound
      video.play().catch(() => undefined);
    }
    setIsMuted(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isMuted ? "Unmute video" : "Mute video"}
      aria-pressed={!isMuted}
      className={cn(
        "absolute z-20 inline-flex items-center justify-center h-10 w-10 rounded-full",
        "bg-black/55 text-white hover:bg-black/75 backdrop-blur-sm",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
        "transition-colors",
        positionClasses[position],
        className,
      )}
    >
      {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
    </button>
  );
};

export default VideoMuteToggle;
