
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  Plus, 
  Trash2, 
  Search,
  Check,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { PantryIngredient } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import UniversalTooltip from '@/components/universal-tooltip';

interface PantryModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PantryModal({ isOpen, onOpenChange }: PantryModalProps) {
  const { toast } = useToast();
  const [pantryItems, setPantryItems] = useState<PantryIngredient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchPantryItems();
    }
  }, [isOpen]);

  const fetchPantryItems = async () => {
    try {
      const response = await fetch('/api/pantry');
      if (response.ok) {
        const data = await response.json();
        setPantryItems(data.pantryItems || []);
      }
    } catch (error) {
      console.error('Error fetching pantry items:', error);
      toast({
        title: "Error",
        description: "Failed to load pantry items.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addPantryItem = async () => {
    if (!newItemName.trim()) return;
    
    setIsAdding(true);
    try {
      const response = await fetch('/api/pantry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newItemName.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.alreadyExists) {
          toast({
            title: "Already in pantry",
            description: "This ingredient is already in your pantry.",
          });
        } else {
          setPantryItems(prev => [...prev, data.item].sort((a, b) => a.name.localeCompare(b.name)));
          toast({
            title: "Added to pantry",
            description: `${newItemName} added to your pantry.`,
          });
        }
        
        setNewItemName('');
      }
    } catch (error) {
      console.error('Error adding pantry item:', error);
      toast({
        title: "Error",
        description: "Failed to add item to pantry.",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  const removePantryItem = async (itemId: number, itemName: string) => {
    setDeletingId(itemId);
    try {
      const response = await fetch(`/api/pantry?itemId=${itemId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setPantryItems(prev => prev.filter(item => item.id !== itemId));
        toast({
          title: "Removed from pantry",
          description: `${itemName} removed from your pantry.`,
        });
      }
    } catch (error) {
      console.error('Error removing pantry item:', error);
      toast({
        title: "Error",
        description: "Failed to remove item from pantry.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const filteredItems = pantryItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const commonIngredients = [
    'salt', 'pepper', 'olive oil', 'garlic', 'onion', 'butter', 'eggs',
    'flour', 'sugar', 'milk', 'cheese', 'bread', 'rice', 'pasta',
    'tomatoes', 'chicken', 'ground beef', 'potatoes', 'carrots'
  ];

  const suggestedItems = commonIngredients.filter(ingredient =>
    !pantryItems.some(item => item.name.includes(ingredient.toLowerCase())) &&
    ingredient.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-accent" />
            My Pantry
            <Badge variant="secondary">{pantryItems.length}</Badge>
          </DialogTitle>
          <DialogDescription>
            Manage ingredients you already have. These won't be added to new grocery lists.
          </DialogDescription>
        </DialogHeader>

        {/* Add Item Section */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Add ingredient to pantry..."
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addPantryItem()}
              className="flex-1"
            />
            <Button 
              onClick={addPantryItem} 
              disabled={!newItemName.trim() || isAdding}
              size="sm"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search pantry items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <Package className="w-8 h-8 text-muted-foreground mx-auto animate-pulse mb-2" />
              <p className="text-muted-foreground">Loading pantry items...</p>
            </div>
          ) : (
            <>
              {/* Current Pantry Items */}
              {filteredItems.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">
                    In Your Pantry ({filteredItems.length})
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    <AnimatePresence>
                      {filteredItems.map((item) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                        >
                          <Card className="p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-green-600" />
                                <span className="font-medium capitalize">{item.name}</span>
                              </div>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    disabled={deletingId === item.id}
                                    className="p-2 h-8 w-8 text-red-400 hover:text-red-300"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Remove from Pantry</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to remove "{item.name}" from your pantry?
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => removePantryItem(item.id, item.name)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Remove
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </Card>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* Suggested Items */}
              {searchTerm && suggestedItems.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">
                    Quick Add
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {suggestedItems.slice(0, 8).map((ingredient) => (
                      <Button
                        key={ingredient}
                        variant="outline"
                        size="sm"
                        onClick={() => setNewItemName(ingredient)}
                        className="text-xs"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        {ingredient}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {!isLoading && filteredItems.length === 0 && !searchTerm && (
                <div className="text-center py-8 space-y-4">
                  <Package className="w-12 h-12 text-muted-foreground mx-auto" />
                  <div>
                    <h3 className="font-semibold mb-2">Your pantry is empty</h3>
                    <p className="text-muted-foreground text-sm">
                      Add ingredients you already have to avoid duplicates in grocery lists.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {commonIngredients.slice(0, 6).map((ingredient) => (
                      <Button
                        key={ingredient}
                        variant="outline"
                        size="sm"
                        onClick={() => setNewItemName(ingredient)}
                        className="text-xs"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        {ingredient}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* No Search Results */}
              {!isLoading && filteredItems.length === 0 && searchTerm && (
                <div className="text-center py-8">
                  <X className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">
                    No pantry items match "{searchTerm}"
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
