
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, ArrowUp, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { localStorage } from '@/lib/utils';

export default function SwipeGuideOverlay() {
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    const hasSeenGuide = localStorage.get('hasSeenSwipeGuide');
    if (!hasSeenGuide) {
      // Show guide after a short delay when on recipe pages
      const timer = setTimeout(() => {
        if (window.location.pathname.includes('/recipes')) {
          setShowGuide(true);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setShowGuide(false);
    localStorage.set('hasSeenSwipeGuide', true);
  };

  return (
    <AnimatePresence>
      {showGuide && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="bg-card rounded-2xl p-6 max-w-sm w-full text-center relative"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="absolute top-2 right-2 p-2"
            >
              <X className="w-4 h-4" />
            </Button>

            <h2 className="text-2xl font-bold mb-6 text-foreground">
              Swipe to Choose!
            </h2>

            <div className="space-y-6">
              {/* Skip */}
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                  <ArrowLeft className="w-6 h-6 text-red-400" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-red-400">Swipe Left</div>
                  <div className="text-sm text-muted-foreground">Skip recipe</div>
                </div>
              </motion.div>

              {/* Save for Later */}
              <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <ArrowUp className="w-6 h-6 text-blue-400" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-blue-400">Swipe Up</div>
                  <div className="text-sm text-muted-foreground">Save for later</div>
                </div>
              </motion.div>

              {/* Keep It */}
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                  <ArrowRight className="w-6 h-6 text-green-400" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-green-400">Swipe Right</div>
                  <div className="text-sm text-muted-foreground">Keep & rate recipe</div>
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <Button
                onClick={handleClose}
                className="w-full mt-6 bg-accent hover:bg-accent/90"
              >
                Got it!
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
