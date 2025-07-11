
'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion, PanInfo, useAnimation } from 'framer-motion';
import { Clock, Users, AlertTriangle, Star, ShoppingCart } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { UniversalTooltip, TooltipIcon } from '@/components/universal-tooltip';
import { Recipe, SwipeDirection } from '@/lib/types';
import { formatCookTime, getSpicinessEmoji, getSpicinessName, formatRecipeText } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface RecipeCardProps {
  recipe: Recipe & {
    safetyWarnings?: Array<{
      type: 'allergy' | 'dietary';
      level: 'critical' | 'warning';
      message: string;
      allergens?: string[];
      mismatches?: string[];
    }>;
    hasAllergenWarning?: boolean;
    hasDietaryWarning?: boolean;
    detectedAllergens?: string[];
    dietaryMismatches?: string[];
  };
  onSwipe: (direction: SwipeDirection, recipe: Recipe) => void;
  onTap?: (recipe: Recipe) => void;
  userAllergens?: string[];
}

export default function RecipeCard({ 
  recipe, 
  onSwipe, 
  onTap,
  userAllergens = [] 
}: RecipeCardProps) {
  const { toast } = useToast();
  const [exitDirection, setExitDirection] = useState<SwipeDirection | null>(null);
  const [hasExited, setHasExited] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartTime, setDragStartTime] = useState<number>(0);
  const [isAddingToGroceryList, setIsAddingToGroceryList] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();

  // Set mounted state after component mounts
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // ENHANCED: Reset card state when recipe changes with better cleanup
  useEffect(() => {
    if (!isMounted) return;
    
    console.log(`RecipeCard: Initializing for recipe ${recipe.id}`);
    
    // Reset all swipe-related state
    setExitDirection(null);
    setHasExited(false);
    setIsDragging(false);
    setDragStartTime(0);
    
    // Reset animation controls to initial state
    controls.set({ x: 0, y: 0, rotate: 0, opacity: 1 });
    
    console.log(`RecipeCard: State reset complete for recipe ${recipe.id}`);
  }, [recipe.id, controls, isMounted]);

  // Enhanced warning detection for individual tags
  const safetyWarnings = recipe.safetyWarnings || [];
  const hasAllergenWarning = recipe.hasAllergenWarning || safetyWarnings.some(w => w.type === 'allergy');
  const hasDietaryWarning = recipe.hasDietaryWarning || safetyWarnings.some(w => w.type === 'dietary');
  
  // Legacy fallback for older recipe format
  const legacyHasAllergens = recipe.allergens?.some(allergen => 
    userAllergens.includes(allergen.toLowerCase())
  ) || false;

  // Generate individual warning tags
  const getWarningTags = () => {
    const tags: Array<{
      text: string;
      type: 'allergy' | 'dietary';
      icon: '⚠️';
    }> = [];

    // Add allergen warning tags
    if (hasAllergenWarning || legacyHasAllergens) {
      const allergens = recipe.detectedAllergens || recipe.allergens || ['Allergens'];
      allergens.forEach(allergen => {
        tags.push({
          text: `Contains ${allergen.charAt(0).toUpperCase() + allergen.slice(1)}`,
          type: 'allergy',
          icon: '⚠️'
        });
      });
    }

    // Add dietary warning tags
    if (hasDietaryWarning) {
      const mismatches = recipe.dietaryMismatches || [];
      mismatches.forEach(mismatch => {
        tags.push({
          text: `Not ${mismatch.charAt(0).toUpperCase() + mismatch.slice(1)}`,
          type: 'dietary',
          icon: '⚠️'
        });
      });
    }

    return tags;
  };

  const warningTags = getWarningTags();

  const handleDragStart = () => {
    if (!isMounted || hasExited) return;
    
    setIsDragging(true);
    setDragStartTime(Date.now());
    console.log(`RecipeCard: Drag started for recipe ${recipe.id}`);
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    setIsDragging(false);
    
    // ENHANCED: Prevent multiple swipes and ensure component is ready
    if (hasExited || !isMounted) {
      console.log(`RecipeCard: Ignoring drag end - hasExited: ${hasExited}, isMounted: ${isMounted}`);
      return;
    }

    const { offset, velocity } = info;
    const swipeThreshold = 100;
    const swipeVelocityThreshold = 500;

    let direction: SwipeDirection | null = null;

    // Determine swipe direction
    if (Math.abs(offset.x) > Math.abs(offset.y)) {
      // Horizontal swipe
      if (offset.x > swipeThreshold || velocity.x > swipeVelocityThreshold) {
        direction = 'right';
      } else if (offset.x < -swipeThreshold || velocity.x < -swipeVelocityThreshold) {
        direction = 'left';
      }
    } else {
      // Vertical swipe
      if (offset.y < -swipeThreshold || velocity.y < -swipeVelocityThreshold) {
        direction = 'up';
      }
    }

    if (direction) {
      console.log(`RecipeCard: Detected ${direction} swipe for recipe ${recipe.id}`);
      setExitDirection(direction);
      handleSwipe(direction);
    } else {
      // Snap back to center - only if component is mounted
      if (isMounted) {
        controls.start({ x: 0, y: 0, rotate: 0 });
      }
    }
    
    // Reset drag timing after a short delay to prevent accidental taps
    setTimeout(() => {
      if (isMounted) {
        setDragStartTime(0);
      }
    }, 100);
  };

  const handleSwipe = (direction: SwipeDirection) => {
    // ENHANCED: Prevent multiple swipes and validate state
    if (hasExited || !isMounted) {
      console.log(`RecipeCard: Ignoring swipe - hasExited: ${hasExited}, isMounted: ${isMounted}`);
      return;
    }
    
    console.log(`RecipeCard: Executing ${direction} swipe for recipe ${recipe.id}`);
    setHasExited(true);
    
    const exitX = direction === 'left' ? -300 : direction === 'right' ? 300 : 0;
    const exitY = direction === 'up' ? -300 : 0;
    
    // Only start animation if component is mounted
    if (isMounted) {
      controls.start({
        x: exitX,
        y: exitY,
        rotate: direction === 'left' ? -30 : direction === 'right' ? 30 : 0,
        opacity: 0,
        transition: { duration: 0.3 }
      }).then(() => {
        // Double-check that component is still mounted before calling onSwipe
        if (isMounted) {
          console.log(`RecipeCard: Animation complete, calling onSwipe for recipe ${recipe.id}`);
          onSwipe(direction, recipe);
        }
      }).catch((error) => {
        console.error('RecipeCard: Animation error:', error);
        // Still call onSwipe even if animation fails
        if (isMounted) {
          onSwipe(direction, recipe);
        }
      });
    } else {
      // If not mounted, just trigger the callback immediately
      console.log(`RecipeCard: Component not mounted, calling onSwipe immediately`);
      onSwipe(direction, recipe);
    }
  };

  const handleButtonClick = (direction: SwipeDirection, e: React.MouseEvent) => {
    e.stopPropagation();
    handleSwipe(direction);
  };

  // ENHANCED: Prevent accidental navigation during swipe gestures
  const handleClick = (e: React.MouseEvent) => {
    // Prevent navigation if recently dragging or currently in a swipe motion
    const timeSinceDragStart = Date.now() - dragStartTime;
    const wasRecentlyDragging = dragStartTime > 0 && timeSinceDragStart < 200;
    
    if (isDragging || hasExited || wasRecentlyDragging) {
      console.log(`RecipeCard: Preventing click navigation - isDragging: ${isDragging}, hasExited: ${hasExited}, recentDrag: ${wasRecentlyDragging}`);
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    
    console.log(`RecipeCard: Allowing click navigation for recipe ${recipe.id}`);
    onTap?.(recipe);
  };

  // Grocery cart handler
  const handleAddToGroceryList = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card navigation
    e.preventDefault();
    
    if (isAddingToGroceryList || hasExited) return;
    
    setIsAddingToGroceryList(true);
    
    try {
      const response = await fetch('/api/grocery-list/add-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipeId: recipe.id }),
      });
      
      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Added to grocery list!",
          description: `Ingredients from "${recipe.title}" have been added to your grocery list.`,
        });
      } else {
        throw new Error('Failed to add to grocery list');
      }
    } catch (error) {
      console.error('Error adding to grocery list:', error);
      toast({
        title: "Error",
        description: "Failed to add recipe to grocery list. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAddingToGroceryList(false);
    }
  };

  return (
    <motion.div
      ref={cardRef}
      className="absolute inset-0 cursor-grab active:cursor-grabbing swipe-card"
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.2}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      animate={controls}
      whileDrag={{
        scale: 1.05,
        rotate: 0,
      }}
      initial={{ scale: 0, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onClick={handleClick}
    >
      <Card className="h-full overflow-hidden bg-card/95 backdrop-blur border-2">

        {/* Recipe Image */}
        <div className="relative h-64 bg-muted">
          {recipe.image ? (
            <Image
              src={recipe.image}
              alt={recipe.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 400px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              No Image Available
            </div>
          )}
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 gradient-overlay" />
          
          {/* Top Right Actions */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
            {/* Grocery Cart Button */}
            <UniversalTooltip 
              content="Add all ingredients from this recipe to your grocery list"
              position="left"
            >
              <Button
                size="sm"
                variant="secondary"
                onClick={handleAddToGroceryList}
                disabled={isAddingToGroceryList}
                className="bg-green-600 hover:bg-green-700 text-white border-0 h-8 w-8 p-0 rounded-full shadow-lg"
              >
                {isAddingToGroceryList ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <ShoppingCart className="w-4 h-4" />
                  </motion.div>
                ) : (
                  <ShoppingCart className="w-4 h-4" />
                )}
              </Button>
            </UniversalTooltip>
            
            {/* Spiciness Badge */}
            <UniversalTooltip 
              content={`Spice level: ${getSpicinessName(recipe.spiciness)} (${recipe.spiciness}/5). You can filter recipes by spice level in settings.`}
              position="left"
            >
              <Badge variant="secondary" className="bg-black/50 text-white border-0 cursor-help">
                {getSpicinessEmoji(recipe.spiciness)} {getSpicinessName(recipe.spiciness)}
              </Badge>
            </UniversalTooltip>
          </div>
        </div>

        {/* Recipe Info */}
        <div className="p-6 flex-1 flex flex-col">
          <h3 className="text-xl font-bold mb-2 line-clamp-2">{recipe.title}</h3>
          
          {/* Meta Info with Individual Warning Tags */}
          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4 flex-wrap">
            {recipe.readyInMinutes && (
              <UniversalTooltip 
                content={`Total cooking time: ${formatCookTime(recipe.readyInMinutes)}. This includes prep and cooking time.`}
                position="top"
              >
                <div className="flex items-center gap-1 cursor-help">
                  <Clock className="w-4 h-4" />
                  {formatCookTime(recipe.readyInMinutes)}
                </div>
              </UniversalTooltip>
            )}
            {recipe.servings && (
              <UniversalTooltip 
                content={`This recipe serves ${recipe.servings} people. You can scale ingredients when adding to grocery list.`}
                position="top"
              >
                <div className="flex items-center gap-1 cursor-help">
                  <Users className="w-4 h-4" />
                  Serves {recipe.servings}
                </div>
              </UniversalTooltip>
            )}
            
            {/* Individual Warning Tags - Same style as spicy indicator */}
            {warningTags.map((warning, index) => (
              <Badge
                key={index}
                variant="secondary"
                className={`text-xs font-medium inline-flex items-center gap-1 ${
                  warning.type === 'allergy' 
                    ? 'bg-amber-100 text-amber-800 border-amber-200' 
                    : 'bg-amber-100 text-amber-800 border-amber-200'
                }`}
              >
                <span className="text-amber-600">{warning.icon}</span>
                {warning.text}
              </Badge>
            ))}
          </div>

          {/* Summary */}
          {recipe.summary && (
            <div 
              className="text-sm text-muted-foreground mb-6 flex-1 overflow-hidden"
              style={{ 
                whiteSpace: 'pre-wrap', 
                lineHeight: '1.6',
                wordBreak: 'break-word',
                display: '-webkit-box',
                WebkitLineClamp: 4,
                WebkitBoxOrient: 'vertical'
              }}
            >
              {formatRecipeText(recipe.summary, 'summary')}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 mt-auto">
            <UniversalTooltip 
              content="Skip this recipe and move to the next one. Swipe left for the same action."
              position="top"
            >
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => handleButtonClick('left', e)}
                className="flex-1 text-red-400 border-red-400 hover:bg-red-400/10"
              >
                Skip
              </Button>
            </UniversalTooltip>
            
            <UniversalTooltip 
              content="Save this recipe to view later without trying it now. Swipe up for the same action."
              position="top"
            >
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => handleButtonClick('up', e)}
                className="flex-1 text-blue-400 border-blue-400 hover:bg-blue-400/10"
              >
                Save for Later
              </Button>
            </UniversalTooltip>
            
            <UniversalTooltip 
              content="Mark this recipe as tried and add it to your collection. Swipe right for the same action."
              position="top"
            >
              <Button
                size="sm"
                onClick={(e) => handleButtonClick('right', e)}
                className="flex-1 bg-accent hover:bg-accent/90"
              >
                Keep It
              </Button>
            </UniversalTooltip>
          </div>
        </div>

        {/* Swipe Indicators */}
        <motion.div
          className="absolute top-1/2 left-8 transform -translate-y-1/2 text-red-400 font-bold text-6xl opacity-0"
          animate={{
            opacity: exitDirection === 'left' ? 1 : 0,
            scale: exitDirection === 'left' ? 1.2 : 1,
          }}
        >
          SKIP
        </motion.div>
        
        <motion.div
          className="absolute top-1/2 right-8 transform -translate-y-1/2 text-green-400 font-bold text-6xl opacity-0"
          animate={{
            opacity: exitDirection === 'right' ? 1 : 0,
            scale: exitDirection === 'right' ? 1.2 : 1,
          }}
        >
          KEEP
        </motion.div>
        
        <motion.div
          className="absolute top-8 left-1/2 transform -translate-x-1/2 text-blue-400 font-bold text-4xl opacity-0"
          animate={{
            opacity: exitDirection === 'up' ? 1 : 0,
            scale: exitDirection === 'up' ? 1.2 : 1,
          }}
        >
          SAVE
        </motion.div>
      </Card>
    </motion.div>
  );
}
