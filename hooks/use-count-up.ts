"use client";

import { useEffect, useRef, useState } from "react";
import { animate } from "framer-motion";

export function useCountUp(target: number, durationMs = 900) {
  const [value, setValue] = useState(0);
  const previousTarget = useRef(0);

  useEffect(() => {
    const controls = animate(previousTarget.current, target, {
      duration: durationMs / 1000,
      ease: "easeOut",
      onUpdate: (latest) => setValue(latest),
    });

    previousTarget.current = target;
    return () => controls.stop();
  }, [target, durationMs]);

  return value;
}
