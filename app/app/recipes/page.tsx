
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RotateCcw, Loader2, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import RecipeCard from '@/components/recipe-card';
import RecipeFilterModal, { FilterOptions } from '@/components/recipe-filter-modal';
import { Recipe, SwipeDirection } from '@/lib/types';
import { localStorage } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

function RecipesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [cascadingGroups, setCascadingGroups] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [userAllergens, setUserAllergens] = useState<string[]>([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [currentFilters, setCurrentFilters] = useState<FilterOptions>({
    diet: [],
    intolerances: [],
    maxReadyTime: 120,
    equipment: [],
    excludeAllergens: true,
    cuisine: [],
    type: [],
    spiciness: 6 // 6 = Any level
  });

  const ingredients = searchParams.get('ingredients');
  const mode = searchParams.get('mode');
  const applySettings = searchParams.get('applySettings') === 'true';

  useEffect(() => {
    // Load user settings and initialize filters
    const settings = localStorage.get('userSettings');
    const savedFilters = localStorage.get('recipeFilters');
    
    if (settings?.allergies) {
      setUserAllergens(settings.allergies);
    }
    
    // Initialize filters from saved filters or user settings
    if (savedFilters) {
      setCurrentFilters(savedFilters);
    } else if (settings) {
      setCurrentFilters(prev => ({
        ...prev,
        diet: settings.dietaryFilters || [],
        intolerances: settings.allergies || [],
        excludeAllergens: true
      }));
    }
    
    // Fetch recipes
    fetchRecipes();
  }, [ingredients, mode, applySettings]);

  const fetchRecipes = async (filters?: FilterOptions) => {
    try {
      setIsLoading(true);
      
      const filtersToUse = filters || currentFilters;
      
      // Load user settings to apply preferences
      const settings = localStorage.get('userSettings');
      const userDietaryFilters = settings?.dietaryFilters || [];
      const userAllergies = settings?.allergies || [];
      
      let endpoint;
      
      if (mode === 'ingredient' && ingredients && ingredients.trim()) {
        // Build query parameters for ingredient-based search with user preferences
        const params = new URLSearchParams({
          ingredients: ingredients
        });
        
        // Apply user settings and current filters
        const combinedDiet = Array.from(new Set([...userDietaryFilters, ...filtersToUse.diet]));
        const combinedIntolerances = Array.from(new Set([...userAllergies, ...filtersToUse.intolerances]));
        
        if (combinedDiet.length > 0) {
          params.append('diet', combinedDiet.join(','));
        }
        if (combinedIntolerances.length > 0) {
          params.append('intolerances', combinedIntolerances.join(','));
        }
        if (filtersToUse.maxReadyTime < 120) {
          params.append('maxReadyTime', filtersToUse.maxReadyTime.toString());
        }
        if (filtersToUse.cuisine.length > 0) {
          params.append('cuisine', filtersToUse.cuisine.join(','));
        }
        if (filtersToUse.type.length > 0) {
          params.append('type', filtersToUse.type.join(','));
        }
        if (filtersToUse.excludeAllergens && userAllergies.length > 0) {
          params.append('excludeIngredients', userAllergies.join(','));
        }
        if (filtersToUse.spiciness !== 6) { // 6 = Any level
          params.append('spiciness', filtersToUse.spiciness.toString());
        }
        
        endpoint = `/api/recipes/by-ingredients?${params.toString()}`;
      } else if (mode === 'spin') {
        // ENHANCED SPIN MODE: Apply filters based on active selections and settings
        const params = new URLSearchParams({
          count: '10' // Optimized: Balanced number for faster loading
        });
        
        // Check for active user settings and filters
        const hasModalFilters = getActiveFilterCount() > 0;
        const shouldApplyUserSettings = applySettings || hasModalFilters;
        
        console.log('Spin mode filter decision:', {
          applySettings,
          hasModalFilters,
          shouldApplyUserSettings,
          userSettings: settings
        });
        
        if (shouldApplyUserSettings) {
          // Apply user settings and modal filters in spin mode
          
          // Combine user dietary settings with modal filters
          const combinedDiet = Array.from(new Set([...userDietaryFilters, ...filtersToUse.diet]));
          if (combinedDiet.length > 0) {
            params.append('diet', combinedDiet.join(','));
          }
          
          // Combine user allergies with modal intolerances
          const combinedIntolerances = Array.from(new Set([...userAllergies, ...filtersToUse.intolerances]));
          if (combinedIntolerances.length > 0) {
            params.append('intolerances', combinedIntolerances.join(','));
          }
          
          // Apply cooking time filter
          if (filtersToUse.maxReadyTime < 120) {
            params.append('maxReadyTime', filtersToUse.maxReadyTime.toString());
          }
          
          // Apply cuisine filter
          if (filtersToUse.cuisine.length > 0) {
            params.append('cuisine', filtersToUse.cuisine.join(','));
          }
          
          // Apply meal type filter
          if (filtersToUse.type.length > 0) {
            params.append('type', filtersToUse.type.join(','));
          }
          
          // Apply spiciness filter (check both user settings and modal filters)
          const userMaxSpiciness = settings?.maxSpiciness;
          const modalSpiciness = filtersToUse.spiciness;
          const effectiveSpiciness = Math.min(
            userMaxSpiciness !== undefined ? userMaxSpiciness : 6,
            modalSpiciness !== undefined ? modalSpiciness : 6
          );
          
          if (effectiveSpiciness !== 6) { // 6 = Any level
            params.append('spiciness', effectiveSpiciness.toString());
          }
        }
        
        // ALWAYS apply critical safety filters for allergies (highest priority)
        if (filtersToUse.excludeAllergens && userAllergies.length > 0) {
          params.append('excludeIngredients', userAllergies.join(','));
          // Ensure allergies are also in intolerances for double protection
          const existingIntolerances = params.get('intolerances');
          const allIntolerances = existingIntolerances 
            ? Array.from(new Set([...existingIntolerances.split(','), ...userAllergies]))
            : userAllergies;
          params.set('intolerances', allIntolerances.join(','));
        }
        
        endpoint = `/api/recipes/random?${params.toString()}`;
      } else {
        // Build query parameters for random recipes with full filtering
        const params = new URLSearchParams({
          count: '10'
        });
        
        if (ingredients) {
          params.append('ingredients', ingredients);
        }
        
        // Apply user settings and current filters
        const combinedDiet = Array.from(new Set([...userDietaryFilters, ...filtersToUse.diet]));
        const combinedIntolerances = Array.from(new Set([...userAllergies, ...filtersToUse.intolerances]));
        
        if (combinedDiet.length > 0) {
          params.append('diet', combinedDiet.join(','));
        }
        if (combinedIntolerances.length > 0) {
          params.append('intolerances', combinedIntolerances.join(','));
        }
        if (filtersToUse.maxReadyTime < 120) {
          params.append('maxReadyTime', filtersToUse.maxReadyTime.toString());
        }
        if (filtersToUse.cuisine.length > 0) {
          params.append('cuisine', filtersToUse.cuisine.join(','));
        }
        if (filtersToUse.type.length > 0) {
          params.append('type', filtersToUse.type.join(','));
        }
        if (filtersToUse.excludeAllergens && userAllergies.length > 0) {
          params.append('excludeIngredients', userAllergies.join(','));
        }
        if (filtersToUse.spiciness !== 6) { // 6 = Any level
          params.append('spiciness', filtersToUse.spiciness.toString());
        }
        
        endpoint = `/api/recipes/random?${params.toString()}`;
      }
      
      console.log('Fetching recipes with endpoint:', endpoint);
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error('Failed to fetch recipes');
      
      const data = await response.json();
      
      // Handle different response formats
      if (mode === 'ingredient' && data.cascadingResults) {
        // Ingredient mode with cascading results
        setCascadingGroups(data.cascadingResults);
        // Flatten all recipes for the swipe interface
        const allRecipes = data.cascadingResults.reduce((acc: Recipe[], group: any) => {
          return [...acc, ...group.recipes];
        }, []);
        setRecipes(allRecipes);
      } else {
        // Regular mode or fallback
        setCascadingGroups([]);
        setRecipes(data.recipes || []);
      }
      
      setCurrentIndex(0);
      setCurrentGroupIndex(0);
    } catch (error) {
      console.error('Error fetching recipes:', error);
      toast({
        title: "Error",
        description: "Failed to load recipes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getActiveFilterCount = () => {
    return (
      currentFilters.diet.length +
      currentFilters.intolerances.length +
      currentFilters.equipment.length +
      currentFilters.cuisine.length +
      currentFilters.type.length +
      (currentFilters.maxReadyTime < 120 ? 1 : 0) +
      (currentFilters.spiciness !== 6 ? 1 : 0) // 6 = Any level
    );
  };

  const handleApplyFilters = (filters: FilterOptions) => {
    setCurrentFilters(filters);
    fetchRecipes(filters);
    
    // Save filters to localStorage for persistence
    localStorage.set('recipeFilters', filters);
    
    toast({
      title: "Filters applied",
      description: "Fetching recipes with your preferences...",
    });
  };

  const handleSwipe = async (direction: SwipeDirection, recipe: Recipe) => {
    try {
      console.log(`Processing ${direction} swipe for recipe ${recipe.id}, current index: ${currentIndex}`);
      
      switch (direction) {
        case 'left':
          // Skip - move to next recipe
          toast({
            title: "Recipe skipped",
            description: "Moving to the next recipe...",
          });
          break;
          
        case 'right':
          // Keep it - save as tried
          await fetch('/api/recipes/tried', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ recipeId: recipe.id }),
          });
          toast({
            title: "Recipe saved!",
            description: "Added to your tried recipes.",
          });
          break;
          
        case 'up':
          // Save for later - FIXED: Now moves to next recipe automatically for consistent UX
          await fetch('/api/recipes/saved', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ recipeId: recipe.id }),
          });
          toast({
            title: "Saved for later!",
            description: "Added to your saved recipes.",
          });
          break;
      }
      
      // UNIFIED INDEX ADVANCEMENT: Always move to next recipe after any swipe action
      // This ensures consistent behavior and prevents users from getting stuck
      const nextIndex = currentIndex + 1;
      console.log(`Advancing from index ${currentIndex} to ${nextIndex}`);
      setCurrentIndex(nextIndex);
      
    } catch (error) {
      console.error('Error handling swipe:', error);
      toast({
        title: "Error",
        description: "Failed to save recipe. Please try again.",
        variant: "destructive",
      });
      
      // Still advance index even if API call fails to prevent getting stuck
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleRecipeTap = (recipe: Recipe) => {
    router.push(`/recipe/${recipe.id}`);
  };

  const currentRecipe = recipes[currentIndex];
  const hasMoreRecipes = currentIndex < recipes.length;
  
  // Find which group the current recipe belongs to (for ingredient mode)
  const getCurrentGroup = () => {
    if (cascadingGroups.length === 0 || !currentRecipe) return null;
    
    for (const group of cascadingGroups) {
      if (group.recipes.some((r: any) => r.id === currentRecipe.id)) {
        return group;
      }
    }
    return null;
  };
  
  const currentGroup = getCurrentGroup();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-accent mx-auto" />
          <p className="text-muted-foreground">Finding perfect recipes...</p>
        </div>
      </div>
    );
  }

  if (!hasMoreRecipes) {
    const getNoRecipesMessage = () => {
      const activeFilters = getActiveFilterCount();
      
      if (mode === 'spin') {
        if (activeFilters > 0) {
          return "No recipes match your current filters. Try adjusting your preferences or clearing some filters for more variety!";
        } else {
          return "Unable to load recipes at the moment. This might be a temporary issue - try spinning again!";
        }
      } else if (mode === 'ingredient') {
        return `No recipes found with your selected ingredients${activeFilters > 0 ? ' and current filters' : ''}. Try different ingredients or adjust your preferences!`;
      } else {
        return "No recipes found. Try adjusting your search or filters!";
      }
    };

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md w-full">
          <h2 className="text-2xl font-bold mb-4">
            {mode === 'spin' ? 'No Recipes to Spin!' : 'No More Recipes!'}
          </h2>
          <p className="text-muted-foreground mb-6">
            {getNoRecipesMessage()}
          </p>
          <div className="space-y-3">
            <Button onClick={() => router.push('/')} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            {getActiveFilterCount() > 0 && (
              <Button 
                variant="outline" 
                onClick={() => setShowFilterModal(true)} 
                className="w-full"
              >
                <Filter className="w-4 h-4 mr-2" />
                Adjust Filters ({getActiveFilterCount()} active)
              </Button>
            )}
            <Button variant="outline" onClick={() => fetchRecipes()} className="w-full">
              <RotateCcw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b p-4">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex flex-col items-center gap-1">
            <div className="text-sm text-muted-foreground">
              {currentIndex + 1} of {recipes.length}
            </div>
            {currentGroup && (
              <div className="text-center">
                <Badge 
                  variant={currentGroup.isFullMatch ? "default" : "secondary"} 
                  className="text-xs mb-1"
                >
                  {currentGroup.heading}
                </Badge>
                {currentGroup.warning && (
                  <div className="text-xs text-amber-600 font-medium">
                    {currentGroup.warning}
                  </div>
                )}
              </div>
            )}
            {getActiveFilterCount() > 0 && (
              <Badge variant="outline" className="text-xs">
                {getActiveFilterCount()} filters active
              </Badge>
            )}
          </div>
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowFilterModal(true)}
              className={getActiveFilterCount() > 0 ? 'text-accent' : ''}
            >
              <Filter className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => fetchRecipes()}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Recipe Cards Stack */}
      <div className="px-4 py-6">
        <div className="max-w-md mx-auto">
          <div className="relative h-[600px]">
            <AnimatePresence mode="wait">
              {/* ENHANCED: Improved key strategy to ensure proper card transitions */}
              {currentRecipe && (
                <motion.div
                  key={`swipeable-card-${currentIndex}-${currentRecipe.id}`}
                  className="absolute inset-0"
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <RecipeCard
                    recipe={currentRecipe}
                    onSwipe={handleSwipe}
                    onTap={handleRecipeTap}
                    userAllergens={userAllergens}
                  />
                </motion.div>
              )}
              
              {/* Show next recipe as background for depth */}
              {recipes[currentIndex + 1] && (
                <motion.div
                  key={`next-preview-${currentIndex + 1}-${recipes[currentIndex + 1].id}`}
                  className="absolute inset-0"
                  initial={{ scale: 0.95, opacity: 0.3, y: 8 }}
                  animate={{ scale: 0.95, opacity: 0.3, y: 8 }}
                  transition={{ duration: 0.3 }}
                  style={{ zIndex: -1 }}
                >
                  <Card className="h-full bg-card/50 border-dashed" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Filter Modal */}
      <RecipeFilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApplyFilters={handleApplyFilters}
        currentFilters={currentFilters}
      />
    </div>
  );
}

export default function RecipesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    }>
      <RecipesContent />
    </Suspense>
  );
}
