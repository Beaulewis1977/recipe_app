
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Bookmark, Trash2, ExternalLink, Clock, Users, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import UniversalTooltip from '@/components/universal-tooltip';
import { SavedRecipe } from '@/lib/types';
import { formatCookTime, getSpicinessEmoji } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

export default function SavedRecipesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [addingToGroceryListId, setAddingToGroceryListId] = useState<number | null>(null);
  const [showServingSizeModal, setShowServingSizeModal] = useState(false);
  const [selectedRecipeForGroceryList, setSelectedRecipeForGroceryList] = useState<{ id: number; title: string } | null>(null);
  const [servingSize, setServingSize] = useState<number>(4);

  useEffect(() => {
    fetchSavedRecipes();
  }, []);

  const fetchSavedRecipes = async () => {
    try {
      const response = await fetch('/api/recipes/saved');
      if (response.ok) {
        const data = await response.json();
        setSavedRecipes(data.savedRecipes || []);
      }
    } catch (error) {
      console.error('Error fetching saved recipes:', error);
      toast({
        title: "Error",
        description: "Failed to load saved recipes.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removeSavedRecipe = async (recipeId: number) => {
    setDeletingId(recipeId);
    try {
      const response = await fetch(`/api/recipes/saved?recipeId=${recipeId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSavedRecipes(savedRecipes.filter(sr => sr.recipe.id !== recipeId));
        toast({
          title: "Recipe removed",
          description: "Recipe removed from your saved collection.",
        });
      }
    } catch (error) {
      console.error('Error removing saved recipe:', error);
      toast({
        title: "Error",
        description: "Failed to remove recipe.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const addRecipeToGroceryList = (recipeId: number, recipeTitle: string) => {
    setSelectedRecipeForGroceryList({ id: recipeId, title: recipeTitle });
    setShowServingSizeModal(true);
  };

  const addRecipeToGroceryListWithServingSize = async (useServingSize: number) => {
    if (!selectedRecipeForGroceryList) return;

    setAddingToGroceryListId(selectedRecipeForGroceryList.id);
    try {
      const response = await fetch('/api/grocery-list/add-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          recipeId: selectedRecipeForGroceryList.id, 
          servingSize: useServingSize 
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const scalingMessage = useServingSize !== 4 ? ` (scaled for ${useServingSize} servings)` : '';
        toast({
          title: "Recipe added to grocery list",
          description: `Added ingredients from "${selectedRecipeForGroceryList.title}" to your grocery list${scalingMessage}.`,
        });
      }
    } catch (error) {
      console.error('Error adding recipe to grocery list:', error);
      toast({
        title: "Error",
        description: "Failed to add recipe to grocery list.",
        variant: "destructive",
      });
    } finally {
      setAddingToGroceryListId(null);
      setShowServingSizeModal(false);
      setSelectedRecipeForGroceryList(null);
    }
  };

  const handleServingSizeConfirm = () => {
    addRecipeToGroceryListWithServingSize(servingSize);
  };

  const handleServingSizeCancel = () => {
    setShowServingSizeModal(false);
    setSelectedRecipeForGroceryList(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Bookmark className="w-12 h-12 text-accent mx-auto animate-pulse" />
          <p className="text-muted-foreground">Loading saved recipes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b p-4">
        <div className="flex items-center gap-4 max-w-md mx-auto">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-accent" />
            <h1 className="text-xl font-bold">Saved Recipes</h1>
            <Badge variant="secondary">{savedRecipes.length}</Badge>
          </div>
        </div>
      </div>

      <div className="p-4 max-w-md mx-auto">
        {savedRecipes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 space-y-4"
          >
            <Bookmark className="w-16 h-16 text-muted-foreground mx-auto" />
            <h2 className="text-xl font-semibold">No Saved Recipes</h2>
            <p className="text-muted-foreground">
              Swipe up on recipe cards to save them for later!
            </p>
            <Button onClick={() => router.push('/')} className="mt-4">
              Discover Recipes
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {savedRecipes.map((savedRecipe, index) => (
              <motion.div
                key={savedRecipe.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="overflow-hidden">
                  <div className="flex gap-4 p-4">
                    
                    {/* Recipe Image */}
                    <div className="w-24 h-24 bg-muted rounded-lg overflow-hidden relative flex-shrink-0">
                      {savedRecipe.recipe.image ? (
                        <Image
                          src={savedRecipe.recipe.image}
                          alt={savedRecipe.recipe.title}
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                          No Image
                        </div>
                      )}
                    </div>

                    {/* Recipe Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm line-clamp-2 mb-2">
                        {savedRecipe.recipe.title}
                      </h3>
                      
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                        {savedRecipe.recipe.readyInMinutes && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatCookTime(savedRecipe.recipe.readyInMinutes)}
                          </div>
                        )}
                        {savedRecipe.recipe.servings && (
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {savedRecipe.recipe.servings}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-xs">
                          {getSpicinessEmoji(savedRecipe.recipe.spiciness)} {savedRecipe.recipe.spiciness}
                        </Badge>
                        
                        <div className="flex gap-1">
                          <UniversalTooltip
                            content="Add all ingredients from this recipe to your grocery list with serving size selection"
                            position="top"
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => addRecipeToGroceryList(savedRecipe.recipe.id, savedRecipe.recipe.title)}
                              disabled={addingToGroceryListId === savedRecipe.recipe.id}
                              className="p-2 h-8 w-8 text-green-600 hover:text-green-500"
                            >
                              <ShoppingCart className="w-3 h-3" />
                            </Button>
                          </UniversalTooltip>
                          
                          <UniversalTooltip
                            content="View full recipe details, ingredients, and instructions"
                            position="top"
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/recipe/${savedRecipe.recipe.id}`)}
                              className="p-2 h-8 w-8"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                          </UniversalTooltip>
                          
                          <AlertDialog>
                            <UniversalTooltip
                              content="Remove this recipe from your saved collection permanently"
                              position="top"
                            >
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={deletingId === savedRecipe.recipe.id}
                                  className="p-2 h-8 w-8 text-red-400 hover:text-red-300"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </AlertDialogTrigger>
                            </UniversalTooltip>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Saved Recipe</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to remove "{savedRecipe.recipe.title}" from your saved recipes? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => removeSavedRecipe(savedRecipe.recipe.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Serving Size Selection Modal */}
      <Dialog open={showServingSizeModal} onOpenChange={setShowServingSizeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Serving Size</DialogTitle>
            <DialogDescription>
              Choose the number of servings to add to your grocery list. 
              Ingredient amounts will be automatically scaled.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6">
            <div className="flex items-center justify-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setServingSize(Math.max(1, servingSize - 1))}
                disabled={servingSize <= 1}
              >
                -
              </Button>
              
              <div className="text-center min-w-[120px]">
                <div className="text-3xl font-bold text-accent">{servingSize}</div>
                <div className="text-sm text-muted-foreground">
                  serving{servingSize !== 1 ? 's' : ''}
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setServingSize(Math.min(20, servingSize + 1))}
                disabled={servingSize >= 20}
              >
                +
              </Button>
            </div>
            
            {/* Quick select buttons */}
            <div className="flex justify-center space-x-2 mt-4">
              {[2, 4, 6, 8].map(size => (
                <Button
                  key={size}
                  variant={servingSize === size ? "default" : "outline"}
                  size="sm"
                  onClick={() => setServingSize(size)}
                  className="w-12"
                >
                  {size}
                </Button>
              ))}
            </div>
            
            {selectedRecipeForGroceryList && (
              <div className="text-center text-sm text-muted-foreground mt-4">
                Recipe: {selectedRecipeForGroceryList.title}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={handleServingSizeCancel}>
              Cancel
            </Button>
            <Button 
              onClick={handleServingSizeConfirm}
              disabled={addingToGroceryListId !== null}
            >
              {addingToGroceryListId !== null ? "Adding..." : "Add to Grocery List"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
