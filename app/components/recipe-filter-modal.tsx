
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Filter, Clock, Users, ChefHat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { localStorage } from '@/lib/utils';

export interface FilterOptions {
  diet: string[];
  intolerances: string[];
  maxReadyTime: number;
  equipment: string[];
  excludeAllergens: boolean;
  cuisine: string[];
  type: string[];
  spiciness: number; // 0-5 for levels, 6 for any level
}

interface RecipeFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterOptions) => void;
  currentFilters: FilterOptions;
}

const dietOptions = [
  'Vegetarian', 'Vegan', 'Gluten Free', 'Ketogenic', 'Paleo', 
  'Primal', 'Low FODMAP', 'Whole30', 'Pescetarian'
];

const intoleranceOptions = [
  'Dairy', 'Egg', 'Gluten', 'Grain', 'Peanut', 'Seafood', 
  'Sesame', 'Shellfish', 'Soy', 'Sulfite', 'Tree Nut', 'Wheat'
];

const cuisineOptions = [
  'African', 'Asian', 'American', 'British', 'Cajun', 'Caribbean', 
  'Chinese', 'Eastern European', 'European', 'French', 'German', 
  'Greek', 'Indian', 'Irish', 'Italian', 'Japanese', 'Jewish', 
  'Korean', 'Latin American', 'Mediterranean', 'Mexican', 'Middle Eastern', 
  'Nordic', 'Southern', 'Spanish', 'Thai', 'Vietnamese'
];

const typeOptions = [
  'Main Course', 'Side Dish', 'Dessert', 'Appetizer', 'Salad', 
  'Bread', 'Breakfast', 'Soup', 'Beverage', 'Sauce', 'Marinade', 
  'Fingerfood', 'Snack', 'Drink'
];

const equipmentOptions = [
  'Oven', 'Stovetop', 'Microwave', 'Grill', 'Slow Cooker', 
  'Pressure Cooker', 'Air Fryer', 'Blender', 'Food Processor', 
  'No Equipment Required'
];

const spicinessOptions = [
  { value: 6, label: 'Any Level', emoji: '✨' },
  { value: 0, label: 'Not Spicy', emoji: '🌿' },
  { value: 1, label: 'Level 1', emoji: '🌶️' },
  { value: 2, label: 'Level 2', emoji: '🌶️🌶️' },
  { value: 3, label: 'Level 3', emoji: '🌶️🌶️🌶️' },
  { value: 4, label: 'Level 4', emoji: '🌶️🌶️🌶️🌶️' },
  { value: 5, label: 'Level 5', emoji: '🌶️🌶️🌶️🌶️🌶️' }
];

export default function RecipeFilterModal({ 
  isOpen, 
  onClose, 
  onApplyFilters, 
  currentFilters 
}: RecipeFilterModalProps) {
  const [filters, setFilters] = useState<FilterOptions>(currentFilters);
  const [userAllergens, setUserAllergens] = useState<string[]>([]);

  useEffect(() => {
    // Load user allergens from settings
    const settings = localStorage.get('userSettings');
    if (settings?.allergies) {
      setUserAllergens(settings.allergies);
    }
  }, []);

  useEffect(() => {
    setFilters(currentFilters);
  }, [currentFilters]);

  const toggleArrayOption = (array: string[], option: string) => {
    return array.includes(option)
      ? array.filter(item => item !== option)
      : [...array, option];
  };

  const handleApplyFilters = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleResetFilters = () => {
    const resetFilters: FilterOptions = {
      diet: [],
      intolerances: [],
      maxReadyTime: 120,
      equipment: [],
      excludeAllergens: true,
      cuisine: [],
      type: [],
      spiciness: 6 // 6 = Any level
    };
    setFilters(resetFilters);
  };

  const getActiveFilterCount = () => {
    return (
      filters.diet.length +
      filters.intolerances.length +
      filters.equipment.length +
      filters.cuisine.length +
      filters.type.length +
      (filters.maxReadyTime < 120 ? 1 : 0) +
      (filters.spiciness !== 6 ? 1 : 0) + // 6 = Any level
      (filters.excludeAllergens ? 0 : 0) // Don't count this as it's usually on
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 500 }}
          className="w-full max-w-md max-h-[90vh] bg-background rounded-t-xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-background border-b p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-accent" />
              <h2 className="text-lg font-semibold">Filter Recipes</h2>
              {getActiveFilterCount() > 0 && (
                <Badge variant="secondary">{getActiveFilterCount()} active</Badge>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Scrollable Content */}
          <div className="overflow-y-auto flex-1 p-4 space-y-6">
            {/* Max Ready Time */}
            <Card className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Max Cooking Time
                  </Label>
                  <span className="text-sm text-muted-foreground">
                    {filters.maxReadyTime === 120 ? '2+ hours' : `${filters.maxReadyTime} min`}
                  </span>
                </div>
                <Slider
                  value={[filters.maxReadyTime]}
                  onValueChange={(value) => setFilters({ ...filters, maxReadyTime: value[0] })}
                  max={120}
                  min={15}
                  step={15}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>15 min</span>
                  <span>2+ hours</span>
                </div>
              </div>
            </Card>

            {/* Allergen Exclusion */}
            {userAllergens.length > 0 && (
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Exclude My Allergens</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Avoid recipes with: {userAllergens.join(', ')}
                    </p>
                  </div>
                  <Switch
                    checked={filters.excludeAllergens}
                    onCheckedChange={(checked) => setFilters({ ...filters, excludeAllergens: checked })}
                  />
                </div>
              </Card>
            )}

            {/* Diet Preferences */}
            <Card className="p-4">
              <Label className="text-sm font-medium mb-3 block">Diet Preferences</Label>
              <div className="grid grid-cols-2 gap-2">
                {dietOptions.map((diet) => (
                  <Button
                    key={diet}
                    variant={filters.diet.includes(diet) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilters({ 
                      ...filters, 
                      diet: toggleArrayOption(filters.diet, diet) 
                    })}
                    className="justify-start text-xs h-8"
                  >
                    {diet}
                  </Button>
                ))}
              </div>
            </Card>

            {/* Intolerances */}
            <Card className="p-4">
              <Label className="text-sm font-medium mb-3 block">Intolerances</Label>
              <div className="grid grid-cols-2 gap-2">
                {intoleranceOptions.map((intolerance) => (
                  <Button
                    key={intolerance}
                    variant={filters.intolerances.includes(intolerance) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilters({ 
                      ...filters, 
                      intolerances: toggleArrayOption(filters.intolerances, intolerance) 
                    })}
                    className="justify-start text-xs h-8"
                  >
                    {intolerance}
                  </Button>
                ))}
              </div>
            </Card>

            {/* Cuisine */}
            <Card className="p-4">
              <Label className="text-sm font-medium mb-3 block">Cuisine Type</Label>
              <div className="grid grid-cols-2 gap-2">
                {cuisineOptions.map((cuisine) => (
                  <Button
                    key={cuisine}
                    variant={filters.cuisine.includes(cuisine) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilters({ 
                      ...filters, 
                      cuisine: toggleArrayOption(filters.cuisine, cuisine) 
                    })}
                    className="justify-start text-xs h-8"
                  >
                    {cuisine}
                  </Button>
                ))}
              </div>
            </Card>

            {/* Meal Type */}
            <Card className="p-4">
              <Label className="text-sm font-medium mb-3 block">Meal Type</Label>
              <div className="grid grid-cols-2 gap-2">
                {typeOptions.map((type) => (
                  <Button
                    key={type}
                    variant={filters.type.includes(type) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilters({ 
                      ...filters, 
                      type: toggleArrayOption(filters.type, type) 
                    })}
                    className="justify-start text-xs h-8"
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </Card>

            {/* Equipment */}
            <Card className="p-4">
              <Label className="text-sm font-medium mb-3 block">Equipment Available</Label>
              <div className="grid grid-cols-2 gap-2">
                {equipmentOptions.map((equipment) => (
                  <Button
                    key={equipment}
                    variant={filters.equipment.includes(equipment) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilters({ 
                      ...filters, 
                      equipment: toggleArrayOption(filters.equipment, equipment) 
                    })}
                    className="justify-start text-xs h-8"
                  >
                    {equipment}
                  </Button>
                ))}
              </div>
            </Card>

            {/* Spiciness Level */}
            <Card className="p-4">
              <Label className="text-sm font-medium mb-3 block">Maximum Spiciness Level</Label>
              <div className="grid grid-cols-1 gap-2">
                {spicinessOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={filters.spiciness === option.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilters({ 
                      ...filters, 
                      spiciness: option.value
                    })}
                    className="justify-start text-sm h-10"
                  >
                    <span className="mr-2">{option.emoji}</span>
                    {option.label}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Filter recipes by maximum spiciness level you can handle.
              </p>
            </Card>
          </div>

          {/* Footer Actions */}
          <div className="sticky bottom-0 bg-background border-t p-4 space-y-3">
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleResetFilters}
                className="flex-1"
              >
                Reset
              </Button>
              <Button
                onClick={handleApplyFilters}
                className="flex-1 bg-accent hover:bg-accent/90"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
