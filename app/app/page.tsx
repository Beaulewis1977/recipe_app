
'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Shuffle, ChefHat, Loader2 } from 'lucide-react';
import { generateRandomIngredients, localStorage } from '@/lib/utils';
import { useSettings } from '@/components/settings-provider';
import { useIngredientStorage } from '@/components/ingredient-storage-provider';
import { useRouter, useSearchParams } from 'next/navigation';

function HomePageContent() {
  const [slotValues, setSlotValues] = useState(['PASTA', 'CHICKEN', 'TOMATO']);
  const [isSpinning, setIsSpinning] = useState(false);
  const [mode, setMode] = useState<'spin' | 'ingredient'>('spin');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { settings } = useSettings();
  const { selectedIngredients } = useIngredientStorage();

  // Initialize slot values based on selected ingredients
  useEffect(() => {
    const userIngredients = getUserIngredientsForDisplay();
    if (userIngredients && userIngredients.length > 0) {
      setSlotValues(userIngredients);
    } else {
      setSlotValues(generateRandomIngredients());
    }
  }, []);

  // Check for active user selections when component mounts
  useEffect(() => {
    // Check if we came from ingredient mode with active ingredients
    const urlIngredients = searchParams?.get('ingredients');
    if (urlIngredients) {
      // If we have ingredients from URL, stay in ingredient mode context
      setMode('ingredient');
    }
  }, [searchParams]);

  // Helper function to get user ingredients for slot display
  const getUserIngredientsForDisplay = () => {
    // Check URL parameters first
    const urlIngredients = searchParams?.get('ingredients');
    if (urlIngredients && urlIngredients.trim().length > 0) {
      const ingredients = urlIngredients.split(',').map(ing => ing.trim().toUpperCase());
      // Take first 3 ingredients and pad with random if needed
      return ingredients.slice(0, 3).concat(
        generateRandomIngredients().slice(ingredients.length, 3)
      ).slice(0, 3);
    }
    
    // Check provider for saved ingredients
    if (selectedIngredients && Array.isArray(selectedIngredients) && selectedIngredients.length > 0) {
      const ingredients = selectedIngredients.map((ing: string) => ing.toUpperCase());
      // Take first 3 ingredients and pad with random if needed
      return ingredients.slice(0, 3).concat(
        generateRandomIngredients().slice(ingredients.length, 3)
      ).slice(0, 3);
    }
    
    // No ingredients selected, return null to use random ingredients
    return null;
  };

  // Helper function to check for active user settings
  const hasActiveUserSettings = () => {
    if (!settings) return false;
    
    const hasAllergens = settings.allergies && settings.allergies.length > 0;
    const hasDietaryFilters = settings.dietaryFilters && settings.dietaryFilters.length > 0;
    const hasSpiciness = settings.maxSpiciness !== 6; // 6 = Any level
    
    return hasAllergens || hasDietaryFilters || hasSpiciness;
  };

  // Helper function to check for active ingredients
  const hasActiveIngredients = () => {
    const urlIngredients = searchParams?.get('ingredients');
    return (urlIngredients && urlIngredients.trim().length > 0) || 
           (selectedIngredients && Array.isArray(selectedIngredients) && selectedIngredients.length > 0);
  };

  // Helper function to get active ingredients
  const getActiveIngredients = () => {
    const urlIngredients = searchParams?.get('ingredients');
    if (urlIngredients && urlIngredients.trim().length > 0) {
      return urlIngredients;
    }
    if (selectedIngredients && Array.isArray(selectedIngredients) && selectedIngredients.length > 0) {
      return selectedIngredients.join(',');
    }
    return null;
  };

  const handleSpin = async () => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    
    // Determine what ingredients to use for spinning animation
    const userIngredients = getUserIngredientsForDisplay();
    const useUserIngredients = userIngredients && userIngredients.length > 0;
    
    // Animate slot machine
    const spinDuration = 2000;
    const interval = setInterval(() => {
      if (useUserIngredients) {
        // Mix user ingredients with some random variety during spinning
        const mixedIngredients = [
          ...userIngredients.slice(0, 2),
          generateRandomIngredients()[Math.floor(Math.random() * 3)]
        ];
        setSlotValues(mixedIngredients);
      } else {
        setSlotValues(generateRandomIngredients());
      }
    }, 100);

    setTimeout(() => {
      clearInterval(interval);
      
      // Set final values based on user selection
      let finalValues;
      if (useUserIngredients) {
        finalValues = userIngredients;
      } else {
        finalValues = generateRandomIngredients();
      }
      setSlotValues(finalValues);
      setIsSpinning(false);
      
      // CRITICAL FIX: Check for active selections before deciding navigation
      const activeIngredients = hasActiveIngredients();
      const activeSettings = hasActiveUserSettings();
      const ingredientsToUse = getActiveIngredients();
      
      let navigationUrl = '';
      
      if (activeIngredients && ingredientsToUse) {
        // INGREDIENTS ARE SELECTED: Filter by ingredients + settings
        navigationUrl = `/recipes?ingredients=${encodeURIComponent(ingredientsToUse)}&mode=ingredient`;
      } else if (activeSettings) {
        // ONLY SETTINGS ACTIVE: Apply settings filters in spin mode
        navigationUrl = `/recipes?mode=spin&applySettings=true`;
      } else {
        // NOTHING SELECTED: Show truly random recipes
        navigationUrl = `/recipes?mode=spin`;
      }
      
      console.log('Spin navigation decision:', {
        activeIngredients,
        activeSettings,
        ingredientsToUse,
        useUserIngredients,
        finalValues,
        navigationUrl
      });
      
      router.push(navigationUrl);
    }, spinDuration);
  };

  const handleIngredientMode = () => {
    router.push('/ingredient-mode');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto space-y-8">
        {/* App Title */}
        <div className="text-center space-y-2">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <ChefHat className="w-12 h-12 mx-auto text-accent mb-4" />
            <h1 className="text-3xl font-bold text-foreground">Recipe Slot</h1>
            <p className="text-muted-foreground">Spin to discover amazing recipes</p>
          </motion.div>
        </div>

        {/* Mode Toggle */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="p-4">
            <div className="flex gap-2">
              <Button
                variant={mode === 'spin' ? 'default' : 'outline'}
                onClick={() => setMode('spin')}
                className="flex-1"
              >
                <Shuffle className="w-4 h-4 mr-2" />
                Spin Mode
              </Button>
              <Button
                variant={mode === 'ingredient' ? 'default' : 'outline'}
                onClick={() => setMode('ingredient')}
                className="flex-1"
              >
                <ChefHat className="w-4 h-4 mr-2" />
                Ingredient Mode
              </Button>
            </div>
          </Card>
        </motion.div>

        {mode === 'spin' ? (
          <>
            {/* Slot Machine */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="p-6 bg-card/50 backdrop-blur">
                <div className="flex justify-center gap-4 mb-6">
                  {slotValues.map((value, index) => (
                    <div
                      key={index}
                      className={`w-24 h-24 bg-muted rounded-lg flex items-center justify-center overflow-hidden ${
                        isSpinning ? 'slot-spin' : ''
                      }`}
                    >
                      <span className="text-sm font-bold text-center px-2 leading-tight">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
                
                <Button
                  onClick={handleSpin}
                  disabled={isSpinning}
                  className={`w-full h-12 text-lg font-bold btn-press ${
                    isSpinning ? 'pulse-glow' : ''
                  }`}
                  size="lg"
                >
                  {isSpinning ? 'SPINNING...' : 'SPIN'}
                </Button>
              </Card>
            </motion.div>
          </>
        ) : (
          /* Ingredient Mode */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="p-6 bg-card/50 backdrop-blur text-center">
              <div className="space-y-4">
                <ChefHat className="w-16 h-16 mx-auto text-accent" />
                <h3 className="text-xl font-semibold">What's in your kitchen?</h3>
                <p className="text-muted-foreground">
                  Enter your available ingredients and we'll find perfect recipes for you
                </p>
                <Button
                  onClick={handleIngredientMode}
                  className="w-full h-12 text-lg font-bold btn-press"
                  size="lg"
                >
                  Enter Ingredients
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="grid grid-cols-3 gap-4 text-center"
        >
          <div className="space-y-1">
            <div className="text-2xl font-bold text-accent">1000+</div>
            <div className="text-xs text-muted-foreground">Recipes</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-accent">⚡</div>
            <div className="text-xs text-muted-foreground">Fast Results</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-accent">🔥</div>
            <div className="text-xs text-muted-foreground">Trending</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-accent mx-auto" />
          <p className="text-muted-foreground">Loading Recipe Slot...</p>
        </div>
      </div>
    }>
      <HomePageContent />
    </Suspense>
  );
}
