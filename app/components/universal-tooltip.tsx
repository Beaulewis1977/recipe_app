
'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface UniversalTooltipProps {
  children: ReactNode;
  content: string | ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  disabled?: boolean;
  className?: string;
  contentClassName?: string;
}

export function UniversalTooltip({
  children,
  content,
  position = 'top',
  delay = 300,
  disabled = false,
  className,
  contentClassName
}: UniversalTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const longPressTimeoutRef = useRef<NodeJS.Timeout>();
  const touchStartRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Detect if we're on a mobile device
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || 'ontouchstart' in window);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (longPressTimeoutRef.current) clearTimeout(longPressTimeoutRef.current);
    };
  }, []);

  const showTooltip = () => {
    if (disabled) return;
    
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (longPressTimeoutRef.current) clearTimeout(longPressTimeoutRef.current);
    setIsVisible(false);
  };

  // Desktop hover handlers
  const handleMouseEnter = () => {
    if (!isMobile) {
      showTooltip();
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      hideTooltip();
    }
  };

  // Mobile long press handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) return;
    
    touchStartRef.current = Date.now();
    
    // Clear any existing timeout
    if (longPressTimeoutRef.current) clearTimeout(longPressTimeoutRef.current);
    
    // Start long press detection
    longPressTimeoutRef.current = setTimeout(() => {
      e.preventDefault(); // Prevent context menu
      showTooltip();
    }, 500); // 500ms for long press
  };

  const handleTouchEnd = () => {
    if (!isMobile) return;
    
    const touchDuration = Date.now() - touchStartRef.current;
    
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
    }
    
    // If it was a long press and tooltip is showing, keep it for a bit
    if (touchDuration >= 500 && isVisible) {
      setTimeout(() => {
        setIsVisible(false);
      }, 2000); // Hide after 2 seconds
    } else {
      hideTooltip();
    }
  };

  const handleTouchMove = () => {
    // Cancel long press if user moves finger
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
    }
  };

  // Click handler to hide tooltip on mobile
  const handleClick = () => {
    if (isMobile && isVisible) {
      hideTooltip();
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
      case 'bottom':
        return 'top-full left-1/2 transform -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 transform -translate-y-1/2 mr-2';
      case 'right':
        return 'left-full top-1/2 transform -translate-y-1/2 ml-2';
      default:
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
    }
  };

  const getArrowClasses = () => {
    switch (position) {
      case 'top':
        return 'top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent';
      case 'bottom':
        return 'bottom-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent';
      case 'left':
        return 'left-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent';
      case 'right':
        return 'right-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent';
      default:
        return 'top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent';
    }
  };

  if (disabled || !content) {
    return <>{children}</>;
  }

  return (
    <div
      ref={containerRef}
      className={cn("relative inline-block", className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      onClick={handleClick}
    >
      {children}
      
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg pointer-events-none",
              "max-w-xs break-words",
              getPositionClasses(),
              contentClassName
            )}
            style={{
              // Ensure tooltip doesn't go off screen
              maxWidth: '90vw'
            }}
          >
            {content}
            
            {/* Arrow */}
            <div
              className={cn(
                "absolute w-0 h-0 border-4",
                getArrowClasses()
              )}
              style={{
                borderTopColor: position === 'bottom' ? 'transparent' : '#1f2937',
                borderBottomColor: position === 'top' ? 'transparent' : '#1f2937',
                borderLeftColor: position === 'right' ? 'transparent' : '#1f2937',
                borderRightColor: position === 'left' ? 'transparent' : '#1f2937',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Convenience wrapper for common use cases
export function TooltipButton({ 
  children, 
  tooltip, 
  position = 'top',
  ...props 
}: { 
  children: ReactNode; 
  tooltip: string; 
  position?: 'top' | 'bottom' | 'left' | 'right';
  [key: string]: any;
}) {
  return (
    <UniversalTooltip content={tooltip} position={position}>
      <button {...props}>
        {children}
      </button>
    </UniversalTooltip>
  );
}

// Wrapper for icons with tooltips
export function TooltipIcon({ 
  children, 
  tooltip, 
  position = 'top',
  className,
  ...props 
}: { 
  children: ReactNode; 
  tooltip: string; 
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  [key: string]: any;
}) {
  return (
    <UniversalTooltip content={tooltip} position={position}>
      <div className={cn("cursor-help", className)} {...props}>
        {children}
      </div>
    </UniversalTooltip>
  );
}

// Export default
export default UniversalTooltip;
