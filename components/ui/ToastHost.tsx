"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { onToast } from "@/lib/toast";

export function ToastHost() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    return onToast((msg) => {
      setMessage(msg);
      setTimeout(() => setMessage(null), 6000);
    });
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex justify-center px-4">
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="card pointer-events-auto max-w-xs px-4 py-2.5 text-center text-sm"
            onClick={() => setMessage(null)}
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
