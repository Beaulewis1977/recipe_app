
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Users, Plus, Minus, Bookmark, Heart, AlertTriangle, ExternalLink, ChefHat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Recipe } from '@/lib/types';
import { formatCookTime, getSpicinessEmoji, getSpicinessName, formatRecipeText, formatInstructionSteps } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

export default function RecipeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  
  const [recipe, setRecipe] = useState<(Recipe & {
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
  }) | null>(null);
  const [servings, setServings] = useState(4);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isTried, setIsTried] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchRecipe(parseInt(params.id as string));
    }
  }, [params.id]);

  useEffect(() => {
    if (recipe) {
      setServings(recipe.servings || 4);
      checkRecipeStatus();
    }
  }, [recipe]);

  const fetchRecipe = async (id: number) => {
    try {
      console.log(`Fetching recipe with ID: ${id}`);
      const response = await fetch(`/api/recipes/${id}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.recipe) {
          setRecipe(data.recipe);
          console.log(`Successfully loaded recipe: ${data.recipe.title} (source: ${data.source})`);
        } else {
          throw new Error('Recipe not found in response');
        }
      } else if (response.status === 404) {
        console.error('Recipe not found');
        toast({
          title: "Recipe Not Found",
          description: "The recipe you're looking for doesn't exist.",
          variant: "destructive",
        });
      } else {
        throw new Error(`Failed to fetch recipe: ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching recipe:', error);
      toast({
        title: "Error",
        description: "Failed to load recipe details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkRecipeStatus = async () => {
    if (!recipe) return;
    
    try {
      // Check if saved
      const savedResponse = await fetch('/api/recipes/saved');
      if (savedResponse.ok) {
        const savedData = await savedResponse.json();
        setIsSaved(savedData.savedRecipes?.some((sr: any) => sr.recipe.id === recipe.id) || false);
      }

      // Check if tried
      const triedResponse = await fetch('/api/recipes/tried');
      if (triedResponse.ok) {
        const triedData = await triedResponse.json();
        setIsTried(triedData.triedRecipes?.some((tr: any) => tr.recipe.id === recipe.id) || false);
      }
    } catch (error) {
      console.error('Error checking recipe status:', error);
    }
  };

  const handleSaveRecipe = async () => {
    if (!recipe) return;

    try {
      if (isSaved) {
        // Remove from saved
        await fetch(`/api/recipes/saved?recipeId=${recipe.id}`, { method: 'DELETE' });
        setIsSaved(false);
        toast({ title: "Recipe removed", description: "Removed from saved recipes." });
      } else {
        // Add to saved
        await fetch('/api/recipes/saved', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ recipeId: recipe.id }),
        });
        setIsSaved(true);
        toast({ title: "Recipe saved!", description: "Added to your saved recipes." });
      }
    } catch (error) {
      console.error('Error toggling saved status:', error);
      toast({ title: "Error", description: "Failed to update recipe.", variant: "destructive" });
    }
  };

  const handleTryRecipe = async () => {
    if (!recipe) return;

    try {
      await fetch('/api/recipes/tried', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipeId: recipe.id }),
      });
      setIsTried(true);
      toast({ title: "Recipe marked as tried!", description: "Added to your tried recipes." });
    } catch (error) {
      console.error('Error marking recipe as tried:', error);
      toast({ title: "Error", description: "Failed to mark recipe as tried.", variant: "destructive" });
    }
  };

  const adjustServings = (increment: boolean) => {
    setServings(prev => Math.max(1, increment ? prev + 1 : prev - 1));
  };

  const getAdjustedAmount = (originalAmount: number, originalServings: number) => {
    const ratio = servings / originalServings;
    const adjusted = originalAmount * ratio;
    return adjusted % 1 === 0 ? adjusted.toString() : adjusted.toFixed(1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading recipe...</p>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md w-full">
          <h2 className="text-2xl font-bold mb-4">Recipe Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The recipe you're looking for could not be found.
          </p>
          <Button onClick={() => router.push('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Card>
      </div>
    );
  }

  // Enhanced safety warning detection
  const safetyWarnings = recipe?.safetyWarnings || [];
  const hasAllergenWarning = recipe?.hasAllergenWarning || safetyWarnings.some(w => w.type === 'allergy');
  const hasDietaryWarning = recipe?.hasDietaryWarning || safetyWarnings.some(w => w.type === 'dietary');
  
  // Legacy fallback for older recipe format
  const legacyHasAllergens = recipe?.allergens?.length > 0;

  // Generate individual warning tags (same as recipe card)
  const getWarningTags = () => {
    const tags: Array<{
      text: string;
      type: 'allergy' | 'dietary';
      icon: '⚠️';
    }> = [];

    // Add allergen warning tags
    if (hasAllergenWarning || legacyHasAllergens) {
      const allergens = recipe?.detectedAllergens || recipe?.allergens || ['Allergens'];
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
      const mismatches = recipe?.dietaryMismatches || [];
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b">
        <div className="flex items-center justify-between p-4 max-w-md mx-auto">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSaveRecipe}
              className={isSaved ? 'text-blue-400' : ''}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            </Button>
            {recipe.sourceUrl && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(recipe.sourceUrl, '_blank')}
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto">
        {/* Hero Image */}
        <div className="relative h-64 bg-muted">
          {recipe.image ? (
            <Image
              src={recipe.image}
              alt={recipe.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 400px"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              No Image Available
            </div>
          )}
          <div className="absolute inset-0 gradient-overlay" />
          
          {/* Spiciness Badge */}
          <div className="absolute top-4 right-4">
            <Badge variant="secondary" className="bg-black/50 text-white border-0">
              {getSpicinessEmoji(recipe.spiciness)} {getSpicinessName(recipe.spiciness)}
            </Badge>
          </div>
        </div>



        {/* Recipe Content */}
        <div className="p-4 space-y-6">
          {/* Title and Meta */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-2xl font-bold mb-3">{recipe.title}</h1>
            
            <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
              {recipe.readyInMinutes && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatCookTime(recipe.readyInMinutes)}
                </div>
              )}
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => adjustServings(false)}
                    className="h-6 w-6 p-0"
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <span className="font-medium">{servings}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => adjustServings(true)}
                    className="h-6 w-6 p-0"
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              
              {/* Individual Warning Tags - Same style as recipe card */}
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
          </motion.div>

          {/* Summary */}
          {recipe.summary && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="p-4">
                <div className="text-sm text-muted-foreground space-y-3">
                  {(() => {
                    // Clean and format summary into paragraphs
                    const cleanSummary = recipe.summary
                      .replace(/<[^>]*>/g, '') // Remove HTML tags
                      .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces
                      .replace(/&amp;/g, '&') // Decode entities
                      .replace(/&lt;/g, '<')
                      .replace(/&gt;/g, '>')
                      .replace(/&quot;/g, '"')
                      .replace(/&#39;/g, "'")
                      .trim();
                    
                    // Split into sentences and group into paragraphs
                    const sentences = cleanSummary.split(/\.\s+/).filter(sentence => sentence.trim());
                    
                    // Create paragraphs (2-3 sentences each)
                    const paragraphs: string[] = [];
                    for (let i = 0; i < sentences.length; i += 2) {
                      const paragraph = sentences.slice(i, i + 2).join('. ');
                      if (paragraph.trim()) {
                        paragraphs.push(paragraph.trim() + (paragraph.endsWith('.') ? '' : '.'));
                      }
                    }
                    
                    return paragraphs.map((paragraph, index) => (
                      <p key={index} className="leading-relaxed">
                        {paragraph}
                      </p>
                    ));
                  })()}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Ingredients */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="p-4">
              <h2 className="text-lg font-semibold mb-4">Ingredients</h2>
              <ul className="space-y-3">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm">
                    <div className="w-2 h-2 bg-accent rounded-full flex-shrink-0 mt-2"></div>
                    <div className="flex-1 flex justify-between items-start gap-3">
                      <span className="font-medium text-foreground">{ingredient.name}</span>
                      <span className="text-muted-foreground font-medium">
                        {recipe.servings ? 
                          getAdjustedAmount(ingredient.amount, recipe.servings) : 
                          ingredient.amount
                        } {ingredient.unit}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          </motion.div>

          {/* Equipment */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="p-4">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-accent" />
                Equipment Needed
              </h2>
              <ul className="space-y-2">
                {(() => {
                  // Extract equipment from recipe data or provide defaults
                  const equipment = (recipe as any)?.equipment || [];
                  
                  // If no equipment data, provide common defaults
                  if (equipment.length === 0) {
                    const commonEquipment = ['Stove', 'Mixing Bowl', 'Knife', 'Cutting Board'];
                    return commonEquipment.map((item, index) => (
                      <li key={index} className="flex items-center gap-3 text-sm">
                        <div className="w-2 h-2 bg-accent rounded-full flex-shrink-0"></div>
                        <span className="text-foreground">{item}</span>
                      </li>
                    ));
                  }
                  
                  return equipment.map((item: any, index: number) => (
                    <li key={index} className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-accent rounded-full flex-shrink-0"></div>
                      <span className="text-foreground">
                        {typeof item === 'string' ? item : item.name || 'Kitchen Equipment'}
                      </span>
                    </li>
                  ));
                })()}
              </ul>
            </Card>
          </motion.div>

          {/* Instructions */}
          {recipe.instructions && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
            >
              <Card className="p-4">
                <h2 className="text-lg font-semibold mb-4">Instructions</h2>
                <div className="space-y-4">
                  {(() => {
                    // Clean instructions text
                    const cleanInstructions = recipe.instructions
                      .replace(/<[^>]*>/g, '') // Remove HTML tags
                      .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces
                      .replace(/&amp;/g, '&') // Decode entities
                      .replace(/&lt;/g, '<')
                      .replace(/&gt;/g, '>')
                      .replace(/&quot;/g, '"')
                      .replace(/&#39;/g, "'")
                      .trim();
                    
                    // Split instructions into steps
                    let steps: string[] = [];
                    
                    // First try to split by numbered steps (1., 2., etc.)
                    const numberedSteps = cleanInstructions.split(/(?=\d+\.\s)/).filter(step => step.trim());
                    if (numberedSteps.length > 1) {
                      steps = numberedSteps.map(step => step.replace(/^\d+\.\s*/, '').trim());
                    } else {
                      // Try splitting by line breaks
                      const lineSteps = cleanInstructions.split(/\n+/).filter(step => step.trim());
                      if (lineSteps.length > 1) {
                        steps = lineSteps;
                      } else {
                        // For very long single instructions, split by sentence boundaries that indicate new actions
                        const sentenceSteps = cleanInstructions.split(/(?<=\.)\s+(?=[A-Z])/).filter(step => step.trim());
                        if (sentenceSteps.length > 1 && sentenceSteps.length <= 8) {
                          steps = sentenceSteps;
                        } else {
                          // Fallback: treat as single step
                          steps = [cleanInstructions];
                        }
                      }
                    }
                    
                    return steps.map((step, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="flex-shrink-0 w-7 h-7 bg-accent text-white text-sm font-bold rounded-full flex items-center justify-center">
                          {index + 1}
                        </div>
                        <div className="flex-1 pt-1">
                          <p className="text-sm leading-relaxed text-foreground">
                            {step.trim().replace(/^\d+\.\s*/, '')}
                          </p>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Nutritional Information */}
          {recipe.nutrition && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
            >
              <Card className="p-4">
                <h2 className="text-lg font-semibold mb-4">Nutritional Information</h2>
                
                {/* Primary nutrition facts */}
                <div className="space-y-3 mb-4">
                  {recipe.nutrition.calories && (
                    <div className="flex justify-between items-center py-2 border-b border-muted">
                      <span className="font-semibold text-foreground">Calories</span>
                      <span className="font-bold text-accent">{Math.round(recipe.nutrition.calories)} kcal</span>
                    </div>
                  )}
                </div>
                
                {/* Macronutrients */}
                <div className="space-y-2 mb-4">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Macronutrients</h3>
                  <ul className="space-y-2">
                    {recipe.nutrition.protein && (
                      <li className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                        <div className="flex-1 flex justify-between">
                          <span className="text-sm font-medium">Protein</span>
                          <span className="text-sm text-muted-foreground">{recipe.nutrition.protein}g</span>
                        </div>
                      </li>
                    )}
                    {recipe.nutrition.carbohydrates && (
                      <li className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                        <div className="flex-1 flex justify-between">
                          <span className="text-sm font-medium">Carbohydrates</span>
                          <span className="text-sm text-muted-foreground">{recipe.nutrition.carbohydrates}g</span>
                        </div>
                      </li>
                    )}
                    {recipe.nutrition.fat && (
                      <li className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full flex-shrink-0"></div>
                        <div className="flex-1 flex justify-between">
                          <span className="text-sm font-medium">Fat</span>
                          <span className="text-sm text-muted-foreground">{recipe.nutrition.fat}g</span>
                        </div>
                      </li>
                    )}
                  </ul>
                </div>
                
                {/* Other nutrients */}
                {(recipe.nutrition.fiber || recipe.nutrition.sugar || recipe.nutrition.sodium || recipe.nutrition.cholesterol) && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Other Nutrients</h3>
                    <ul className="space-y-2">
                      {recipe.nutrition.fiber && (
                        <li className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0"></div>
                          <div className="flex-1 flex justify-between">
                            <span className="text-sm font-medium">Dietary Fiber</span>
                            <span className="text-sm text-muted-foreground">{recipe.nutrition.fiber}g</span>
                          </div>
                        </li>
                      )}
                      {recipe.nutrition.sugar && (
                        <li className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                          <div className="flex-1 flex justify-between">
                            <span className="text-sm font-medium">Sugar</span>
                            <span className="text-sm text-muted-foreground">{recipe.nutrition.sugar}g</span>
                          </div>
                        </li>
                      )}
                      {recipe.nutrition.sodium && (
                        <li className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
                          <div className="flex-1 flex justify-between">
                            <span className="text-sm font-medium">Sodium</span>
                            <span className="text-sm text-muted-foreground">{recipe.nutrition.sodium}mg</span>
                          </div>
                        </li>
                      )}
                      {recipe.nutrition.cholesterol && (
                        <li className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-pink-500 rounded-full flex-shrink-0"></div>
                          <div className="flex-1 flex justify-between">
                            <span className="text-sm font-medium">Cholesterol</span>
                            <span className="text-sm text-muted-foreground">{recipe.nutrition.cholesterol}mg</span>
                          </div>
                        </li>
                      )}
                    </ul>
                  </div>
                )}
                
                {/* Serving information */}
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-muted-foreground text-center">
                    Nutritional values are per serving ({servings} serving{servings !== 1 ? 's' : ''} total)
                  </p>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex gap-3 pb-8"
          >
            <Button
              variant="outline"
              onClick={handleSaveRecipe}
              className={`flex-1 ${isSaved ? 'bg-blue-50 border-blue-200 text-blue-700' : ''}`}
            >
              <Bookmark className={`w-4 h-4 mr-2 ${isSaved ? 'fill-current' : ''}`} />
              {isSaved ? 'Saved' : 'Save Recipe'}
            </Button>
            <Button
              onClick={handleTryRecipe}
              disabled={isTried}
              className={`flex-1 ${isTried ? 'bg-green-600' : 'bg-accent hover:bg-accent/90'}`}
            >
              <Heart className={`w-4 h-4 mr-2 ${isTried ? 'fill-current' : ''}`} />
              {isTried ? 'Tried!' : 'Mark as Tried'}
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
