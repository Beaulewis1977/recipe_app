
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useIngredientStorage } from '@/components/ingredient-storage-provider';
import { localStorage } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Plus, X, Search, ArrowLeft, ChefHat, Cookie } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function IngredientModePage() {
  const { selectedIngredients: ingredients, updateSelectedIngredients, isLoading } = useIngredientStorage();
  const [inputValue, setInputValue] = useState('');
  const [activeTab, setActiveTab] = useState('main-course');
  const router = useRouter();

  // Main Course ingredients
  const mainCourseCategories = {
    'Proteins': [
      'Chicken', 'Beef', 'Salmon', 'Pork', 'Turkey', 'Shrimp', 'Tofu', 'Eggs'
    ],
    'Carbs & Grains': [
      'Pasta', 'Rice', 'Bread', 'Quinoa', 'Potato', 'Noodles', 'Tortilla'
    ],
    'Vegetables': [
      'Tomato', 'Onion', 'Garlic', 'Spinach', 'Broccoli', 'Carrot', 'Bell Pepper', 'Mushroom'
    ],
    'Dairy': [
      'Cheese', 'Butter', 'Milk', 'Cream', 'Yogurt', 'Mozzarella', 'Parmesan'
    ],
    'Seasonings': [
      'Olive Oil', 'Salt', 'Black Pepper', 'Herbs', 'Lemon', 'Ginger', 'Chili'
    ]
  };

  // Dessert categories as requested
  const dessertCategories = {
    'Chocolate': [
      'Dark Chocolate', 'Milk Chocolate', 'White Chocolate', 'Cocoa Powder', 'Chocolate Chips'
    ],
    'Fruits': [
      'Banana', 'Apple', 'Strawberry', 'Lemon', 'Orange', 'Blueberry', 'Raspberry', 'Cherry'
    ],
    'Baked Goods': [
      'Pie Crust', 'Cake Mix', 'Cookies', 'Graham Crackers', 'Pastry', 'Biscuits'
    ],
    'Dairy': [
      'Heavy Cream', 'Cream Cheese', 'Butter', 'Ice Cream', 'Mascarpone', 'Whipped Cream'
    ],
    'Nuts': [
      'Almonds', 'Walnuts', 'Pecans', 'Hazelnuts', 'Pistachios', 'Peanuts'
    ],
    'Spices': [
      'Vanilla Extract', 'Cinnamon', 'Caramel', 'Maple Syrup', 'Honey', 'Nutmeg', 'Cardamom'
    ]
  };

  const addIngredient = (ingredient: string) => {
    const trimmed = ingredient.trim();
    if (trimmed && !ingredients.includes(trimmed)) {
      const newIngredients = [...ingredients, trimmed];
      updateSelectedIngredients(newIngredients);
      setInputValue('');
    }
  };

  const removeIngredient = (ingredient: string) => {
    const newIngredients = ingredients.filter(i => i !== ingredient);
    updateSelectedIngredients(newIngredients);
  };

  const handleSubmit = () => {
    if (ingredients.length === 0) return;
    
    // Ingredients are automatically saved via provider
    const query = ingredients.join(',');
    router.push(`/recipes?ingredients=${encodeURIComponent(query)}&mode=ingredient`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addIngredient(inputValue);
    }
  };

  // Show loading state while ingredients are being loaded
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto"></div>
          <p className="text-muted-foreground">Loading ingredients...</p>
        </div>
      </div>
    );
  }

  // Helper function to render ingredient categories
  const renderIngredientCategories = (categories: Record<string, string[]>) => {
    return (
      <Accordion type="multiple" className="w-full">
        {Object.entries(categories).map(([categoryName, categoryIngredients]) => (
          <AccordionItem key={categoryName} value={categoryName}>
            <AccordionTrigger className="text-left">
              <div className="flex items-center justify-between w-full pr-4">
                <span>{categoryName}</span>
                <Badge variant="secondary" className="text-xs">
                  {categoryIngredients.filter(ing => !ingredients.includes(ing)).length} available
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-2 gap-2 pt-2">
                {categoryIngredients
                  .filter(ingredient => !ingredients.includes(ingredient))
                  .map((ingredient) => (
                    <Button
                      key={ingredient}
                      variant="outline"
                      size="sm"
                      onClick={() => addIngredient(ingredient)}
                      className="justify-start text-sm h-8"
                    >
                      <Plus className="w-3 h-3 mr-2" />
                      {ingredient}
                    </Button>
                  ))}
              </div>
              {categoryIngredients.every(ing => ingredients.includes(ing)) && (
                <p className="text-sm text-muted-foreground mt-2 text-center">
                  All ingredients from this category are already selected!
                </p>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b p-4">
        <div className="flex items-center gap-4 max-w-md mx-auto">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-xl font-bold">What's in your kitchen?</h1>
        </div>
      </div>

      <div className="p-4 max-w-md mx-auto space-y-6">
        {/* Ingredient Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-4">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add an ingredient..."
                className="flex-1"
              />
              <Button
                onClick={() => addIngredient(inputValue)}
                disabled={!inputValue.trim()}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Added Ingredients */}
        {ingredients.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Your Ingredients ({ingredients.length})</h3>
              <div className="flex flex-wrap gap-2">
                {ingredients.map((ingredient) => (
                  <Badge
                    key={ingredient}
                    variant="secondary"
                    className="px-3 py-1 text-sm"
                  >
                    {ingredient}
                    <button
                      onClick={() => removeIngredient(ingredient)}
                      className="ml-2 hover:text-red-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Ingredient Categories with Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="p-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="main-course" className="flex items-center gap-2">
                  <ChefHat className="w-4 h-4" />
                  Main Course
                </TabsTrigger>
                <TabsTrigger value="dessert" className="flex items-center gap-2">
                  <Cookie className="w-4 h-4" />
                  Dessert
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="main-course" className="mt-4">
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="font-semibold text-lg">Main Course Ingredients</h3>
                    <p className="text-sm text-muted-foreground">
                      Select ingredients for savory dishes
                    </p>
                  </div>
                  {renderIngredientCategories(mainCourseCategories)}
                </div>
              </TabsContent>
              
              <TabsContent value="dessert" className="mt-4">
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="font-semibold text-lg">Dessert Ingredients</h3>
                    <p className="text-sm text-muted-foreground">
                      Select ingredients for sweet treats
                    </p>
                  </div>
                  {renderIngredientCategories(dessertCategories)}
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </motion.div>

        {/* Search Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="sticky bottom-24 z-10"
        >
          <Button
            onClick={handleSubmit}
            disabled={ingredients.length === 0}
            className="w-full h-12 text-lg font-bold bg-accent hover:bg-accent/90 btn-press"
            size="lg"
          >
            <Search className="w-5 h-5 mr-2" />
            Find Recipes ({ingredients.length} ingredients)
          </Button>
        </motion.div>

        {/* Help Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center text-sm text-muted-foreground"
        >
          <p>
            Add ingredients you have available and we'll find recipes that use them.
            The more ingredients you add, the better the matches!
          </p>
        </motion.div>
      </div>
    </div>
  );
}
