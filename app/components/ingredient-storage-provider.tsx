
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { localStorage } from '@/lib/utils';

interface IngredientStorageContextType {
  selectedIngredients: string[];
  updateSelectedIngredients: (ingredients: string[]) => void;
  clearSelectedIngredients: () => void;
  isLoading: boolean;
}

const IngredientStorageContext = createContext<IngredientStorageContextType | undefined>(undefined);

export function IngredientStorageProvider({ children }: { children: ReactNode }) {
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load ingredients on mount
  useEffect(() => {
    const loadIngredients = () => {
      try {
        const savedIngredients = localStorage.get('selectedIngredients');
        
        if (savedIngredients && Array.isArray(savedIngredients)) {
          console.log('IngredientStorageProvider: Loaded ingredients from localStorage:', savedIngredients);
          setSelectedIngredients(savedIngredients);
        } else {
          console.log('IngredientStorageProvider: No saved ingredients found');
          setSelectedIngredients([]);
        }
      } catch (error) {
        console.error('IngredientStorageProvider: Error loading ingredients:', error);
        setSelectedIngredients([]);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(loadIngredients, 100);
    return () => clearTimeout(timer);
  }, []);

  const updateSelectedIngredients = (ingredients: string[]) => {
    console.log('IngredientStorageProvider: Updating ingredients:', ingredients);
    setSelectedIngredients(ingredients);
    
    try {
      localStorage.set('selectedIngredients', ingredients);
      console.log('IngredientStorageProvider: Ingredients saved to localStorage');
    } catch (error) {
      console.error('IngredientStorageProvider: Error saving ingredients:', error);
    }
  };

  const clearSelectedIngredients = () => {
    console.log('IngredientStorageProvider: Clearing ingredients');
    setSelectedIngredients([]);
    
    try {
      localStorage.remove('selectedIngredients');
      console.log('IngredientStorageProvider: Ingredients cleared from localStorage');
    } catch (error) {
      console.error('IngredientStorageProvider: Error clearing ingredients:', error);
    }
  };

  return (
    <IngredientStorageContext.Provider value={{ 
      selectedIngredients, 
      updateSelectedIngredients, 
      clearSelectedIngredients,
      isLoading 
    }}>
      {children}
    </IngredientStorageContext.Provider>
  );
}

export function useIngredientStorage() {
  const context = useContext(IngredientStorageContext);
  if (context === undefined) {
    throw new Error('useIngredientStorage must be used within an IngredientStorageProvider');
  }
  return context;
}
