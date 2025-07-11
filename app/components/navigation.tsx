
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, Bookmark, Heart, ShoppingCart, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import UniversalTooltip from '@/components/universal-tooltip';

const navItems = [
  { href: '/', icon: Home, label: 'Home', tooltip: 'Discover new recipes by swiping through recommendations' },
  { href: '/saved', icon: Bookmark, label: 'Saved', tooltip: 'View and manage recipes you saved for later' },
  { href: '/tried', icon: Heart, label: 'Tried', tooltip: 'Browse recipes you tried and rate them' },
  { href: '/grocery-list', icon: ShoppingCart, label: 'Grocery', tooltip: 'Manage your grocery list and add ingredients from recipes' },
  { href: '/settings', icon: Settings, label: 'Settings', tooltip: 'Customize your dietary preferences and app settings' },
];

export default function Navigation() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <motion.nav
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-card/80 backdrop-blur-md border-t border-border"
      >
        <div className="flex items-center justify-around py-2 px-4 max-w-md mx-auto">
          {navItems.map(({ href, icon: Icon, label, tooltip }) => {
            const isActive = pathname === href;
            
            return (
              <UniversalTooltip
                key={href}
                content={tooltip}
                position="top"
              >
                <Link
                  href={href}
                  className={cn(
                    "flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-colors",
                    isActive
                      ? "text-accent"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    className="relative"
                  >
                    <Icon className="w-5 h-5" />
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-accent rounded-full"
                      />
                    )}
                  </motion.div>
                  <span className="text-xs font-medium">{label}</span>
                </Link>
              </UniversalTooltip>
            );
          })}
        </div>
      </motion.nav>
    </div>
  );
}
