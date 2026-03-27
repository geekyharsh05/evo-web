"use client";

import { motion } from "motion/react";

export const GradientBackground = () => {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="fixed bottom-0 left-0 w-full h-[90vh] -z-10"
        style={{
          background:
            "radial-gradient(1920px 100% at 50% 100%, rgba(63,148,247,0.7) 0%, rgba(63,148,247,0.5) 40%, rgba(0,82,204,0.3) 70%, transparent 100%)",
          maskImage:
            "radial-gradient(1920px 100% at 50% 100%, #000 0%, rgba(0, 0, 0, .5) 50%, transparent 100%)",
        }}
      />
    </>
  );
};
