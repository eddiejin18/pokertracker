import React, { useState, useEffect, useRef } from 'react';

/**
 * Minimal full-screen loader: white background, small % that smoothly follows `percent` (0–100).
 */
const LoadingPercentScreen = ({ percent = 0 }) => {
  const targetRef = useRef(0);
  const [shown, setShown] = useState(0);

  useEffect(() => {
    targetRef.current = Math.min(100, Math.max(0, Number(percent)));
  }, [percent]);

  useEffect(() => {
    if (percent <= 0) {
      setShown(0);
    }
  }, [percent]);

  useEffect(() => {
    let raf;
    const step = () => {
      setShown((s) => {
        const t = targetRef.current;
        const k = t >= 98 ? 0.45 : 0.14;
        const next = s + (t - s) * k;
        if (Math.abs(t - next) < 0.08) return t;
        return next;
      });
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  const n = Math.round(Math.min(100, Math.max(0, shown)));

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <p className="text-xs sm:text-sm tabular-nums tracking-wide text-gray-400 font-medium select-none">
        {n}%
      </p>
    </div>
  );
};

export default LoadingPercentScreen;
