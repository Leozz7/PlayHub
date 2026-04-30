import { useEffect } from "react";
import { motion, useSpring, useTransform, useMotionValue } from "framer-motion";

export function AnimatedNumber({ value }: { value: number }) {
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 50,
    stiffness: 100,
  });

  useEffect(() => {
    motionValue.set(value);
  }, [motionValue, value]);

  const display = useTransform(springValue, (current) => Math.round(current));

  return <motion.span>{display}</motion.span>;
}
