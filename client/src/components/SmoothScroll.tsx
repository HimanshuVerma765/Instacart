import Lenis from "lenis";
import { useEffect, type ReactNode } from "react";

interface SmoothScrollProps {
  children: ReactNode;
}

const SmoothScroll = ({ children }: SmoothScrollProps) => {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
    });
    let animationFrame = 0;

    const raf = (time: number) => {
      lenis.raf(time);
      animationFrame = requestAnimationFrame(raf);
    };

    animationFrame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(animationFrame);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
};

export default SmoothScroll;
