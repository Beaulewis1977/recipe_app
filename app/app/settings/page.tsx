
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronRight, Trash2, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { UserSettings } from '@/lib/types';
import { useSettings } from '@/components/settings-provider';
import { useIngredientStorage } from '@/components/ingredient-storage-provider';
import { localStorage } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { settings, updateSettings, isLoading } = useSettings();
  const { clearSelectedIngredients } = useIngredientStorage();
  
  const [newAllergen, setNewAllergen] = useState('');

  const commonAllergens = [
    'Dairy', 'Nuts', 'Gluten', 'Eggs', 'Shellfish', 'Fish', 'Soy', 'Peanuts'
  ];

  const dietaryOptions = [
    'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Paleo'
  ];

  const spicinessLevels = [
    { value: 0, label: 'Not Spicy', emoji: '🌿' },
    { value: 1, label: 'Level 1', emoji: '🌶️' },
    { value: 2, label: 'Level 2', emoji: '🌶️🌶️' },
    { value: 3, label: 'Level 3', emoji: '🌶️🌶️🌶️' },
    { value: 4, label: 'Level 4', emoji: '🌶️🌶️🌶️🌶️' },
    { value: 5, label: 'Level 5', emoji: '🌶️🌶️🌶️🌶️🌶️' },
    { value: 6, label: 'Any Level', emoji: '✨' }
  ];

  const getSpicinessLabel = (value: number) => {
    const level = spicinessLevels.find(l => l.value === value);
    return level ? `${level.emoji} ${level.label}` : '✨ Any Level';
  };

  const saveSettings = (newSettings: Partial<UserSettings>) => {
    updateSettings(newSettings);
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated.",
    });
  };

  const addAllergen = (allergen: string) => {
    const trimmed = allergen.trim();
    if (trimmed && !settings.allergies.includes(trimmed)) {
      saveSettings({ allergies: [...settings.allergies, trimmed] });
      setNewAllergen('');
    }
  };

  const removeAllergen = (allergen: string) => {
    saveSettings({ allergies: settings.allergies.filter(a => a !== allergen) });
  };

  const toggleDietaryFilter = (filter: string) => {
    const filters = settings.dietaryFilters.includes(filter)
      ? settings.dietaryFilters.filter(f => f !== filter)
      : [...settings.dietaryFilters, filter];
    saveSettings({ dietaryFilters: filters });
  };

  const clearAllData = async () => {
    if (confirm('Are you sure you want to clear all saved recipes and settings?')) {
      try {
        // Clear from database
        await fetch('/api/recipes/clear-all', { method: 'DELETE' });
        
        // Clear localStorage
        localStorage.remove('userSettings');
        localStorage.remove('hasSeenSwipeGuide');
        localStorage.remove('recipeFilters');
        
        // Clear ingredients from provider
        clearSelectedIngredients();
        
        // Reset settings using provider
        updateSettings({
          id: 1,
          servingsDefault: 2,
          measurementUnits: 'US',
          dietaryFilters: [],
          allergies: [],
          maxSpiciness: 6, // 6 = Any level
          hasSeenSwipeOverlay: false,
          showAllergyWarning: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        toast({
          title: "Data cleared",
          description: "All your data has been cleared successfully.",
        });
      } catch (error) {
        console.error('Error clearing data:', error);
        toast({
          title: "Error",
          description: "Failed to clear data. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  // Show loading state while settings are being loaded
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto"></div>
          <p className="text-muted-foreground">Loading settings...</p>
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
          <h1 className="text-xl font-bold">Settings</h1>
        </div>
      </div>

      <div className="p-4 max-w-md mx-auto space-y-6">
        {/* Allergies Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Allergies</h3>
                <Badge variant="secondary">{settings.allergies.length}</Badge>
              </div>
              
              {/* Show Allergy Warning Toggle */}
              <div className="flex items-center justify-between">
                <Label htmlFor="show-warning">Show allergy warnings</Label>
                <Switch
                  id="show-warning"
                  checked={settings.showAllergyWarning}
                  onCheckedChange={(checked) => saveSettings({ showAllergyWarning: checked })}
                />
              </div>

              <Separator />

              {/* Current Allergies */}
              {settings.allergies.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Your allergies:</Label>
                  <div className="flex flex-wrap gap-2">
                    {settings.allergies.map((allergen) => (
                      <Badge
                        key={allergen}
                        variant="destructive"
                        className="px-3 py-1"
                      >
                        {allergen}
                        <button
                          onClick={() => removeAllergen(allergen)}
                          className="ml-2 hover:text-red-200"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Custom Allergen */}
              <div className="flex gap-2">
                <Input
                  value={newAllergen}
                  onChange={(e) => setNewAllergen(e.target.value)}
                  placeholder="Add custom allergen..."
                  onKeyPress={(e) => e.key === 'Enter' && addAllergen(newAllergen)}
                />
                <Button
                  onClick={() => addAllergen(newAllergen)}
                  disabled={!newAllergen.trim()}
                  size="sm"
                >
                  Add
                </Button>
              </div>

              {/* Common Allergens */}
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Common allergens:</Label>
                <div className="grid grid-cols-2 gap-2">
                  {commonAllergens
                    .filter(allergen => !settings.allergies.includes(allergen))
                    .map((allergen) => (
                      <Button
                        key={allergen}
                        variant="outline"
                        size="sm"
                        onClick={() => addAllergen(allergen)}
                        className="justify-start text-xs"
                      >
                        {allergen}
                      </Button>
                    ))}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Dietary Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Dietary Preferences</h3>
                <Badge variant="secondary">{settings.dietaryFilters.length}</Badge>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {dietaryOptions.map((option) => (
                  <Button
                    key={option}
                    variant={settings.dietaryFilters.includes(option) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleDietaryFilter(option)}
                    className="justify-start text-xs"
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Spiciness Preference */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <Card className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-500" />
                  Maximum Spiciness
                </h3>
                <Badge variant="secondary">{getSpicinessLabel(settings.maxSpiciness)}</Badge>
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                {spicinessLevels.map((level) => (
                  <Button
                    key={level.value}
                    variant={settings.maxSpiciness === level.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => saveSettings({ maxSpiciness: level.value })}
                    className="justify-start text-sm h-10"
                  >
                    <span className="mr-2">{level.emoji}</span>
                    {level.label}
                  </Button>
                ))}
              </div>
              
              <p className="text-xs text-muted-foreground">
                Choose your maximum preferred spiciness level. Recipes spicier than this will be filtered out.
              </p>
            </div>
          </Card>
        </motion.div>

        {/* App Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="p-4">
            <div className="space-y-4">
              <h3 className="font-semibold">App Preferences</h3>
              
              {/* Default Servings */}
              <div className="flex items-center justify-between">
                <Label htmlFor="servings">Default servings</Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => saveSettings({ servingsDefault: Math.max(1, settings.servingsDefault - 1) })}
                  >
                    -
                  </Button>
                  <span className="w-8 text-center">{settings.servingsDefault}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => saveSettings({ servingsDefault: settings.servingsDefault + 1 })}
                  >
                    +
                  </Button>
                </div>
              </div>

              {/* Measurement Units */}
              <div className="flex items-center justify-between">
                <Label>Measurement units</Label>
                <div className="flex gap-2">
                  <Button
                    variant={settings.measurementUnits === 'US' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => saveSettings({ measurementUnits: 'US' })}
                  >
                    US
                  </Button>
                  <Button
                    variant={settings.measurementUnits === 'Metric' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => saveSettings({ measurementUnits: 'Metric' })}
                  >
                    Metric
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Navigation Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="space-y-3"
        >
          <Button
            variant="outline"
            className="w-full justify-between"
            onClick={() => router.push('/saved')}
          >
            Saved Recipes
            <ChevronRight className="w-4 h-4" />
          </Button>
          
          <Button
            variant="outline"
            className="w-full justify-between"
            onClick={() => router.push('/tried')}
          >
            Tried Recipes
            <ChevronRight className="w-4 h-4" />
          </Button>
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="p-4 border-destructive/50">
            <div className="space-y-4">
              <h3 className="font-semibold text-destructive">Danger Zone</h3>
              <Button
                variant="destructive"
                onClick={clearAllData}
                className="w-full"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All Data
              </Button>
              <p className="text-xs text-muted-foreground">
                This will permanently delete all your saved recipes, settings, and preferences.
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
