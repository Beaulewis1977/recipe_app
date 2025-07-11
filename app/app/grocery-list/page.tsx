
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  ShoppingCart, 
  Plus, 
  Check, 
  Trash2, 
  Package,
  Edit3,
  Milk,
  Apple,
  Beef,
  Coffee,
  Download,
  FileText,
  Share,
  Mail,
  ChefHat,
  Eye,
  EyeOff,
  Bookmark
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { GroceryList, GroceryListItem, PantryIngredient } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { sortAndFilterGroceryItems } from '@/lib/utils';
import UniversalTooltip from '@/components/universal-tooltip';
import PantryModal from '@/components/pantry-modal';
import TemplatesModal from '@/components/templates-modal';
import GrocerySortFilter, { SortFilterOptions } from '@/components/grocery-sort-filter';
import Image from 'next/image';

const categoryIcons: Record<string, any> = {
  produce: Apple,
  dairy: Milk,
  meat: Beef,
  beverages: Coffee,
  pantry: Package,
  frozen: Package,
};

const categoryColors: Record<string, string> = {
  produce: 'bg-green-100 text-green-800',
  dairy: 'bg-blue-100 text-blue-800',
  meat: 'bg-red-100 text-red-800',
  beverages: 'bg-purple-100 text-purple-800',
  pantry: 'bg-yellow-100 text-yellow-800',
  frozen: 'bg-cyan-100 text-cyan-800',
};

export default function GroceryListPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [groceryList, setGroceryList] = useState<GroceryList | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemAmount, setNewItemAmount] = useState('');
  const [newItemUnit, setNewItemUnit] = useState('');
  const [showPantryModal, setShowPantryModal] = useState(false);
  const [pantryItems, setPantryItems] = useState<PantryIngredient[]>([]);
  const [hiddenItems, setHiddenItems] = useState<Set<number>>(new Set());
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [sortFilterOptions, setSortFilterOptions] = useState<SortFilterOptions>({
    searchTerm: '',
    sortBy: 'priority',
    sortOrder: 'desc',
    showCompleted: true,
    filterCategories: [],
    filterPriorities: [],
    filterStoreSections: []
  });

  useEffect(() => {
    fetchGroceryList();
    fetchPantryItems();
  }, []);

  const fetchGroceryList = async () => {
    try {
      const response = await fetch('/api/grocery-list');
      if (response.ok) {
        const data = await response.json();
        setGroceryList(data.groceryList || null);
      }
    } catch (error) {
      console.error('Error fetching grocery list:', error);
      toast({
        title: "Error",
        description: "Failed to load grocery list.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPantryItems = async () => {
    try {
      const response = await fetch('/api/pantry');
      if (response.ok) {
        const data = await response.json();
        setPantryItems(data.pantryItems || []);
      }
    } catch (error) {
      console.error('Error fetching pantry items:', error);
      // Don't show error toast for pantry - it's not critical
    }
  };

  const toggleItemInPantry = async (item: GroceryListItem) => {
    const itemName = item.name.toLowerCase();
    const isInPantry = pantryItems.some(pantryItem => pantryItem.name === itemName);
    
    try {
      if (isInPantry) {
        // Remove from pantry
        const response = await fetch(`/api/pantry?name=${encodeURIComponent(itemName)}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          setPantryItems(prev => prev.filter(pantryItem => pantryItem.name !== itemName));
          setHiddenItems(prev => {
            const newSet = new Set(prev);
            newSet.delete(item.id);
            return newSet;
          });
          
          toast({
            title: "Removed from pantry",
            description: `${item.name} removed from your pantry.`,
          });
        }
      } else {
        // Add to pantry
        const response = await fetch('/api/pantry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: itemName }),
        });
        
        if (response.ok) {
          const data = await response.json();
          setPantryItems(prev => [...prev, data.item].sort((a, b) => a.name.localeCompare(b.name)));
          setHiddenItems(prev => {
            const newSet = new Set(prev);
            newSet.add(item.id);
            return newSet;
          });
          
          toast({
            title: "Added to pantry",
            description: `${item.name} added to your pantry and hidden from list.`,
          });
        }
      }
    } catch (error) {
      console.error('Error toggling pantry item:', error);
      toast({
        title: "Error",
        description: "Failed to update pantry.",
        variant: "destructive",
      });
    }
  };

  const toggleItemComplete = async (item: GroceryListItem) => {
    setUpdatingId(item.id);
    try {
      const response = await fetch('/api/grocery-list', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          itemId: item.id, 
          isCompleted: !item.isCompleted 
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setGroceryList(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            items: prev.items?.map(i => 
              i.id === item.id ? data.item : i
            ) ?? []
          };
        });
        
        toast({
          title: item.isCompleted ? "Item unchecked" : "Item completed",
          description: `${item.name} ${item.isCompleted ? 'marked as needed' : 'marked as completed'}.`,
        });
      }
    } catch (error) {
      console.error('Error updating item:', error);
      toast({
        title: "Error",
        description: "Failed to update item.",
        variant: "destructive",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const addNewItem = async () => {
    if (!newItemName.trim()) return;

    try {
      const response = await fetch('/api/grocery-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: newItemName.trim(),
          amount: newItemAmount ? parseFloat(newItemAmount) : null,
          unit: newItemUnit.trim() || null
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.alreadyExists) {
          toast({
            title: "Item already exists",
            description: "This item is already in your grocery list.",
          });
        } else {
          setGroceryList(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              items: [data.item, ...(prev.items ?? [])]
            };
          });
          
          toast({
            title: "Item added",
            description: `${newItemName} added to your grocery list.`,
          });
        }
        
        setNewItemName('');
        setNewItemAmount('');
        setNewItemUnit('');
        setShowAddDialog(false);
      }
    } catch (error) {
      console.error('Error adding item:', error);
      toast({
        title: "Error",
        description: "Failed to add item.",
        variant: "destructive",
      });
    }
  };

  const removeItem = async (itemId: number, itemName: string) => {
    setDeletingId(itemId);
    try {
      const response = await fetch(`/api/grocery-list?itemId=${itemId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setGroceryList(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            items: prev.items?.filter(item => item.id !== itemId) ?? []
          };
        });
        
        toast({
          title: "Item removed",
          description: `${itemName} removed from your grocery list.`,
        });
      }
    } catch (error) {
      console.error('Error removing item:', error);
      toast({
        title: "Error",
        description: "Failed to remove item.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const clearCompleted = async () => {
    const completedItems = groceryList?.items?.filter(item => item.isCompleted) ?? [];
    
    if (completedItems.length === 0) return;

    try {
      // Delete all completed items
      await Promise.all(
        completedItems.map(item =>
          fetch(`/api/grocery-list?itemId=${item.id}`, {
            method: 'DELETE',
          })
        )
      );

      setGroceryList(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          items: prev.items?.filter(item => !item.isCompleted) ?? []
        };
      });

      toast({
        title: "Completed items cleared",
        description: `Removed ${completedItems.length} completed items.`,
      });
    } catch (error) {
      console.error('Error clearing completed items:', error);
      toast({
        title: "Error",
        description: "Failed to clear completed items.",
        variant: "destructive",
      });
    }
  };

  // Export functionality
  const exportAsText = () => {
    if (!groceryList?.items?.length) {
      toast({
        title: "Nothing to export",
        description: "Your grocery list is empty.",
        variant: "destructive",
      });
      return;
    }

    const categories = Object.entries(groupedItems) as [string, GroceryListItem[]][];
    let textContent = `🛒 ${groceryList.name}\n`;
    textContent += `Generated: ${new Date().toLocaleDateString()}\n`;
    textContent += `Total Items: ${totalItems} (${completedItems} completed)\n\n`;

    categories.forEach(([category, items]) => {
      if (items.length === 0) return;
      
      textContent += `📦 ${category.toUpperCase()}\n`;
      textContent += ''.padEnd(category.length + 6, '-') + '\n';
      
      items.forEach((item: GroceryListItem) => {
        const checkbox = item.isCompleted ? '✅' : '☐';
        const amount = item.amount ? `${item.amount} ` : '';
        const unit = item.unit ? `${item.unit} ` : '';
        const recipe = item.recipe ? ` (from ${item.recipe.title})` : '';
        
        textContent += `${checkbox} ${amount}${unit}${item.name}${recipe}\n`;
      });
      
      textContent += '\n';
    });

    // Create and download text file
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grocery-list-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Export completed",
      description: "Your grocery list has been exported as a text file.",
    });
  };

  const exportAsPrintableHTML = () => {
    if (!groceryList?.items?.length) {
      toast({
        title: "Nothing to export",
        description: "Your grocery list is empty.",
        variant: "destructive",
      });
      return;
    }

    const categories = Object.entries(groupedItems) as [string, GroceryListItem[]][];
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${groceryList.name}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
          .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
          .category { margin-bottom: 25px; }
          .category-title { 
            background: #f5f5f5; 
            padding: 8px 12px; 
            margin-bottom: 10px; 
            font-weight: bold;
            border-left: 4px solid #007bff;
          }
          .item { 
            padding: 5px 0; 
            border-bottom: 1px dotted #ccc; 
            display: flex;
            align-items: center;
          }
          .item:last-child { border-bottom: none; }
          .checkbox { margin-right: 10px; transform: scale(1.2); }
          .completed { text-decoration: line-through; color: #666; }
          .amount { font-weight: bold; color: #007bff; }
          .recipe-source { font-size: 0.9em; color: #666; font-style: italic; }
          .summary { background: #e9ecef; padding: 15px; margin-bottom: 20px; border-radius: 5px; }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🛒 ${groceryList.name}</h1>
          <div class="summary">
            <strong>Generated:</strong> ${new Date().toLocaleDateString()}<br>
            <strong>Total Items:</strong> ${totalItems} (${completedItems} completed)
          </div>
        </div>
    `;

    categories.forEach(([category, items]) => {
      if (items.length === 0) return;
      
      htmlContent += `
        <div class="category">
          <div class="category-title">${category.toUpperCase()}</div>
      `;
      
      items.forEach((item: GroceryListItem) => {
        const completedClass = item.isCompleted ? 'completed' : '';
        const amount = item.amount ? `<span class="amount">${item.amount} ${item.unit || ''}</span> ` : '';
        const recipe = item.recipe ? `<span class="recipe-source">(from ${item.recipe.title})</span>` : '';
        
        htmlContent += `
          <div class="item ${completedClass}">
            <input type="checkbox" class="checkbox" ${item.isCompleted ? 'checked' : ''}>
            ${amount}${item.name} ${recipe}
          </div>
        `;
      });
      
      htmlContent += `</div>`;
    });

    htmlContent += `
        <div class="no-print" style="margin-top: 30px; text-align: center;">
          <button onclick="window.print()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
            Print This List
          </button>
        </div>
      </body>
      </html>
    `;

    // Open in new window for printing
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(htmlContent);
      newWindow.document.close();
    }

    toast({
      title: "Export completed",
      description: "Your grocery list has opened in a new window ready for printing.",
    });
  };

  const shareGroceryList = async () => {
    if (!groceryList?.items?.length) {
      toast({
        title: "Nothing to share",
        description: "Your grocery list is empty.",
        variant: "destructive",
      });
      return;
    }

    const categories = Object.entries(groupedItems) as [string, GroceryListItem[]][];
    let shareText = `🛒 ${groceryList.name}\n\n`;
    
    categories.forEach(([category, items]) => {
      if (items.length === 0) return;
      
      shareText += `📦 ${category.toUpperCase()}\n`;
      
      items.forEach((item: GroceryListItem) => {
        const amount = item.amount ? `${item.amount} ${item.unit || ''} ` : '';
        shareText += `• ${amount}${item.name}\n`;
      });
      
      shareText += '\n';
    });

    shareText += `Generated by Recipe Slot App - ${new Date().toLocaleDateString()}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: groceryList.name,
          text: shareText,
        });
        
        toast({
          title: "Shared successfully",
          description: "Your grocery list has been shared.",
        });
      } catch (error) {
        // User cancelled sharing or error occurred
        copyToClipboard(shareText);
      }
    } else {
      copyToClipboard(shareText);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied to clipboard",
        description: "Your grocery list has been copied to the clipboard.",
      });
    }).catch(() => {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard. Please try again.",
        variant: "destructive",
      });
    });
  };

  const emailGroceryList = () => {
    if (!groceryList?.items?.length) {
      toast({
        title: "Nothing to email",
        description: "Your grocery list is empty.",
        variant: "destructive",
      });
      return;
    }

    const categories = Object.entries(groupedItems) as [string, GroceryListItem[]][];
    let emailBody = `${groceryList.name}%0D%0A`;
    emailBody += `Generated: ${new Date().toLocaleDateString()}%0D%0A`;
    emailBody += `Total Items: ${totalItems} (${completedItems} completed)%0D%0A%0D%0A`;

    categories.forEach(([category, items]) => {
      if (items.length === 0) return;
      
      emailBody += `${category.toUpperCase()}%0D%0A`;
      emailBody += ''.padEnd(category.length + 6, '-') + '%0D%0A';
      
      items.forEach((item: GroceryListItem) => {
        const checkbox = item.isCompleted ? '✅' : '☐';
        const amount = item.amount ? `${item.amount} ` : '';
        const unit = item.unit ? `${item.unit} ` : '';
        const recipe = item.recipe ? ` (from ${item.recipe.title})` : '';
        
        emailBody += `${checkbox} ${amount}${unit}${item.name}${recipe}%0D%0A`;
      });
      
      emailBody += '%0D%0A';
    });

    emailBody += `Generated by Recipe Slot App - ${new Date().toLocaleDateString()}`;

    const subject = encodeURIComponent(`Grocery List: ${groceryList.name}`);
    const mailtoLink = `mailto:?subject=${subject}&body=${emailBody}`;
    
    // Try to open email client
    window.location.href = mailtoLink;
    
    toast({
      title: "Email client opened",
      description: "Your grocery list has been prepared for email.",
    });
  };

  // Apply sorting and filtering to items
  const sortedFilteredItems = groceryList?.items ? 
    sortAndFilterGroceryItems(groceryList.items, sortFilterOptions, hiddenItems) : [];

  // Group sorted and filtered items by category
  const groupedItems = sortedFilteredItems.reduce((groups, item) => {
    const category = item.category || 'other';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
    return groups;
  }, {} as Record<string, GroceryListItem[]>);

  const totalItems = sortedFilteredItems.length;
  const completedItems = sortedFilteredItems.filter(item => item.isCompleted).length;
  const rawTotalItems = groceryList?.items?.length ?? 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <ShoppingCart className="w-12 h-12 text-accent mx-auto animate-pulse" />
          <p className="text-muted-foreground">Loading grocery list...</p>
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
          <div className="flex items-center gap-2 flex-1">
            <ShoppingCart className="w-5 h-5 text-accent" />
            <h1 className="text-xl font-bold">Grocery List</h1>
            <Badge variant="secondary">{totalItems}</Badge>
          </div>
          
          {/* Templates Button */}
          <UniversalTooltip content="Save and load grocery list templates for quick reuse" position="bottom">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTemplatesModal(true)}
            >
              <Bookmark className="w-4 h-4" />
            </Button>
          </UniversalTooltip>

          {/* Pantry Button */}
          <UniversalTooltip content="Manage pantry items - ingredients you already have" position="bottom">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPantryModal(true)}
            >
              <ChefHat className="w-4 h-4" />
            </Button>
          </UniversalTooltip>

          {/* Export Buttons */}
          {totalItems > 0 && (
            <div className="flex items-center gap-1">
              <UniversalTooltip content="Download grocery list as a text file" position="bottom">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={exportAsText}
                >
                  <FileText className="w-4 h-4" />
                </Button>
              </UniversalTooltip>
              <UniversalTooltip content="Open printable version in new window" position="bottom">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={exportAsPrintableHTML}
                >
                  <Download className="w-4 h-4" />
                </Button>
              </UniversalTooltip>
              <UniversalTooltip content="Share grocery list via system share or copy to clipboard" position="bottom">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={shareGroceryList}
                >
                  <Share className="w-4 h-4" />
                </Button>
              </UniversalTooltip>
              <UniversalTooltip content="Email grocery list using your default email client" position="bottom">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={emailGroceryList}
                >
                  <Mail className="w-4 h-4" />
                </Button>
              </UniversalTooltip>
            </div>
          )}
          
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Item</DialogTitle>
                <DialogDescription>
                  Add a new item to your grocery list.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Input
                    placeholder="Item name"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addNewItem()}
                  />
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Amount"
                    value={newItemAmount}
                    onChange={(e) => setNewItemAmount(e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Unit"
                    value={newItemUnit}
                    onChange={(e) => setNewItemUnit(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={addNewItem} disabled={!newItemName.trim()}>
                  Add Item
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="p-4 max-w-md mx-auto">
        {/* Sort and Filter */}
        {rawTotalItems > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <GrocerySortFilter
              items={groceryList?.items ?? []}
              options={sortFilterOptions}
              onOptionsChange={setSortFilterOptions}
              hiddenItems={hiddenItems}
            />
          </motion.div>
        )}

        {/* Progress & Actions */}
        {totalItems > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm text-muted-foreground">
                  {completedItems} of {totalItems} completed
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 mb-3">
                <div 
                  className="bg-accent h-2 rounded-full transition-all duration-300"
                  style={{ width: `${totalItems > 0 ? (completedItems / totalItems) * 100 : 0}%` }}
                />
              </div>
              {completedItems > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={clearCompleted}
                  className="w-full"
                >
                  Clear {completedItems} Completed Items
                </Button>
              )}
            </Card>
          </motion.div>
        )}

        {totalItems === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 space-y-4"
          >
            <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto" />
            <h2 className="text-xl font-semibold">No Items Yet</h2>
            <p className="text-muted-foreground">
              Add items manually or from your saved recipes to get started!
            </p>
            <div className="flex flex-col gap-2">
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
              <Button variant="outline" onClick={() => router.push('/saved')}>
                Browse Saved Recipes
              </Button>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {(Object.entries(groupedItems) as [string, GroceryListItem[]][]).map(([category, items]) => {
              if (items.length === 0) return null;
              
              const CategoryIcon = categoryIcons[category] || Package;
              const categoryColor = categoryColors[category] || 'bg-gray-100 text-gray-800';
              
              return (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <CategoryIcon className="w-4 h-4" />
                    <h3 className="font-semibold capitalize">{category}</h3>
                    <Badge variant="secondary" className={`text-xs ${categoryColor}`}>
                      {items.length}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    {items.map((item: GroceryListItem, index: number) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className={`p-3 transition-all ${
                          item.isCompleted ? 'opacity-60 bg-muted/50' : ''
                        }`}>
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={item.isCompleted}
                              onCheckedChange={() => toggleItemComplete(item)}
                              disabled={updatingId === item.id}
                              className="flex-shrink-0"
                            />
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className={`font-medium text-sm ${
                                  item.isCompleted ? 'line-through text-muted-foreground' : ''
                                }`}>
                                  {item.name}
                                </span>
                                {item.amount && (
                                  <Badge variant="outline" className="text-xs">
                                    {item.amount} {item.unit || ''}
                                  </Badge>
                                )}
                              </div>
                              
                              {item.recipe && (
                                <div className="flex items-center gap-2 mt-1">
                                  <div className="w-4 h-4 bg-muted rounded overflow-hidden relative flex-shrink-0">
                                    {item.recipe.image ? (
                                      <Image
                                        src={item.recipe.image}
                                        alt={item.recipe.title}
                                        fill
                                        className="object-cover"
                                        sizes="16px"
                                      />
                                    ) : (
                                      <div className="w-full h-full bg-muted" />
                                    )}
                                  </div>
                                  <span className="text-xs text-muted-foreground truncate">
                                    From: {item.recipe.title}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Pantry Toggle Button */}
                            <UniversalTooltip
                              content={
                                pantryItems.some(pantryItem => pantryItem.name === item.name.toLowerCase())
                                  ? "Remove from pantry (show in future lists)"
                                  : "I already have this (add to pantry)"
                              }
                              position="top"
                            >
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleItemInPantry(item)}
                                className={`p-2 h-8 w-8 flex-shrink-0 ${
                                  pantryItems.some(pantryItem => pantryItem.name === item.name.toLowerCase())
                                    ? 'text-orange-600 hover:text-orange-500'
                                    : 'text-muted-foreground hover:text-primary'
                                }`}
                              >
                                {pantryItems.some(pantryItem => pantryItem.name === item.name.toLowerCase()) ? (
                                  <EyeOff className="w-3 h-3" />
                                ) : (
                                  <Eye className="w-3 h-3" />
                                )}
                              </Button>
                            </UniversalTooltip>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={deletingId === item.id}
                                  className="p-2 h-8 w-8 text-red-400 hover:text-red-300 flex-shrink-0"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remove Item</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to remove "{item.name}" from your grocery list?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => removeItem(item.id, item.name)}
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
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pantry Modal */}
      <PantryModal 
        isOpen={showPantryModal} 
        onOpenChange={setShowPantryModal}
      />

      {/* Templates Modal */}
      <TemplatesModal 
        isOpen={showTemplatesModal} 
        onOpenChange={setShowTemplatesModal}
        currentGroceryList={groceryList}
        onListUpdated={fetchGroceryList}
      />
    </div>
  );
}
