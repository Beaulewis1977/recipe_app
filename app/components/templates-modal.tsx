
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bookmark, 
  Plus, 
  Trash2, 
  Download,
  Upload,
  Save,
  List,
  Calendar,
  ShoppingCart,
  Package,
  Copy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { GroceryListTemplate, GroceryList } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import UniversalTooltip from '@/components/universal-tooltip';

interface TemplatesModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentGroceryList: GroceryList | null;
  onListUpdated: () => void;
}

export default function TemplatesModal({ 
  isOpen, 
  onOpenChange, 
  currentGroceryList,
  onListUpdated 
}: TemplatesModalProps) {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<GroceryListTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Save template form
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  
  // Load template options
  const [replaceExisting, setReplaceExisting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
    }
  }, [isOpen]);

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/grocery-templates');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || []);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: "Error",
        description: "Failed to load templates.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveCurrentListAsTemplate = async () => {
    if (!templateName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for the template.",
        variant: "destructive",
      });
      return;
    }

    if (!currentGroceryList?.items?.length) {
      toast({
        title: "No items to save",
        description: "Your grocery list is empty.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/grocery-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: templateName.trim(),
          description: templateDescription.trim(),
          fromCurrentList: true
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setTemplates(prev => [data.template, ...prev]);
        setTemplateName('');
        setTemplateDescription('');
        setShowSaveDialog(false);
        
        toast({
          title: "Template saved",
          description: `"${templateName}" template created successfully.`,
        });
      }
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: "Error",
        description: "Failed to save template.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const loadTemplate = async (template: GroceryListTemplate) => {
    setLoadingId(template.id);
    try {
      const response = await fetch('/api/grocery-templates/load', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          templateId: template.id,
          replaceExisting
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        toast({
          title: "Template loaded",
          description: data.message,
        });

        // Refresh the grocery list
        onListUpdated();
        
        // Close modal after successful load
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error loading template:', error);
      toast({
        title: "Error",
        description: "Failed to load template.",
        variant: "destructive",
      });
    } finally {
      setLoadingId(null);
    }
  };

  const deleteTemplate = async (templateId: number, templateName: string) => {
    setDeletingId(templateId);
    try {
      const response = await fetch(`/api/grocery-templates?templateId=${templateId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTemplates(prev => prev.filter(template => template.id !== templateId));
        toast({
          title: "Template deleted",
          description: `"${templateName}" template deleted successfully.`,
        });
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: "Error",
        description: "Failed to delete template.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const predefinedTemplates = [
    {
      name: "Weekly Essentials",
      description: "Basic groceries for the week",
      items: [
        { name: "milk", amount: 1, unit: "gallon", category: "dairy" },
        { name: "bread", amount: 1, unit: "loaf", category: "pantry" },
        { name: "eggs", amount: 12, unit: "count", category: "dairy" },
        { name: "bananas", amount: 1, unit: "bunch", category: "produce" },
        { name: "chicken breast", amount: 2, unit: "lbs", category: "meat" },
        { name: "rice", amount: 1, unit: "bag", category: "pantry" }
      ]
    },
    {
      name: "Baking Basics",
      description: "Common baking ingredients",
      items: [
        { name: "flour", amount: 5, unit: "lbs", category: "pantry" },
        { name: "sugar", amount: 2, unit: "lbs", category: "pantry" },
        { name: "butter", amount: 1, unit: "pack", category: "dairy" },
        { name: "vanilla extract", amount: 1, unit: "bottle", category: "pantry" },
        { name: "baking powder", amount: 1, unit: "container", category: "pantry" },
        { name: "salt", amount: 1, unit: "container", category: "pantry" }
      ]
    },
    {
      name: "Fresh Produce",
      description: "Weekly fruits and vegetables",
      items: [
        { name: "spinach", amount: 1, unit: "bag", category: "produce" },
        { name: "tomatoes", amount: 3, unit: "count", category: "produce" },
        { name: "onions", amount: 2, unit: "count", category: "produce" },
        { name: "garlic", amount: 1, unit: "bulb", category: "produce" },
        { name: "carrots", amount: 1, unit: "bag", category: "produce" },
        { name: "apples", amount: 6, unit: "count", category: "produce" }
      ]
    }
  ];

  const createPredefinedTemplate = async (template: any) => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/grocery-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: template.name,
          description: template.description,
          items: template.items
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setTemplates(prev => [data.template, ...prev]);
        
        toast({
          title: "Template created",
          description: `"${template.name}" template added to your collection.`,
        });
      }
    } catch (error) {
      console.error('Error creating template:', error);
      toast({
        title: "Error",
        description: "Failed to create template.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const currentItemCount = currentGroceryList?.items?.length ?? 0;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-accent" />
            Grocery List Templates
            <Badge variant="secondary">{templates.length}</Badge>
          </DialogTitle>
          <DialogDescription>
            Save and reuse common grocery lists to speed up your shopping.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="my-templates" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="my-templates">My Templates</TabsTrigger>
            <TabsTrigger value="quick-start">Quick Start</TabsTrigger>
          </TabsList>
          
          <TabsContent value="my-templates" className="flex-1 flex flex-col overflow-hidden space-y-4">
            {/* Save Current List */}
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Save Current List</h4>
                  <p className="text-sm text-muted-foreground">
                    Save your current grocery list ({currentItemCount} items) as a reusable template
                  </p>
                </div>
                <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
                  <DialogTrigger asChild>
                    <Button 
                      disabled={currentItemCount === 0}
                      size="sm"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save as Template
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Save Template</DialogTitle>
                      <DialogDescription>
                        Create a template from your current grocery list ({currentItemCount} items)
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="template-name">Template Name</Label>
                        <Input
                          id="template-name"
                          placeholder="e.g., Weekly Groceries"
                          value={templateName}
                          onChange={(e) => setTemplateName(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="template-desc">Description (optional)</Label>
                        <Textarea
                          id="template-desc"
                          placeholder="Brief description of this template..."
                          value={templateDescription}
                          onChange={(e) => setTemplateDescription(e.target.value)}
                          rows={3}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={saveCurrentListAsTemplate}
                        disabled={!templateName.trim() || isSaving}
                      >
                        {isSaving ? 'Saving...' : 'Save Template'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </Card>

            {/* Load Options */}
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <Switch 
                  id="replace-existing"
                  checked={replaceExisting}
                  onCheckedChange={setReplaceExisting}
                />
                <div>
                  <Label htmlFor="replace-existing" className="text-sm font-medium">
                    Replace existing items
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {replaceExisting 
                      ? 'Clear current list and replace with template items'
                      : 'Add template items to current list (skip duplicates)'
                    }
                  </p>
                </div>
              </div>
            </Card>

            {/* Templates List */}
            <div className="flex-1 overflow-y-auto space-y-4">
              {isLoading ? (
                <div className="text-center py-8">
                  <Bookmark className="w-8 h-8 text-muted-foreground mx-auto animate-pulse mb-2" />
                  <p className="text-muted-foreground">Loading templates...</p>
                </div>
              ) : templates.length === 0 ? (
                <div className="text-center py-8 space-y-4">
                  <List className="w-12 h-12 text-muted-foreground mx-auto" />
                  <div>
                    <h3 className="font-semibold mb-2">No templates yet</h3>
                    <p className="text-muted-foreground text-sm">
                      Save your current grocery list as a template or try the Quick Start options.
                    </p>
                  </div>
                </div>
              ) : (
                <AnimatePresence>
                  {templates.map((template) => (
                    <motion.div
                      key={template.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <Card className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{template.name}</h4>
                              <Badge variant="outline" className="text-xs">
                                {template.items.length} items
                              </Badge>
                            </div>
                            {template.description && (
                              <p className="text-sm text-muted-foreground mb-2">
                                {template.description}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              Created {new Date(template.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 ml-4">
                            <UniversalTooltip content="Load this template into your grocery list">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => loadTemplate(template)}
                                disabled={loadingId === template.id}
                                className="text-green-600 hover:text-green-500"
                              >
                                {loadingId === template.id ? (
                                  <Package className="w-4 h-4 animate-pulse" />
                                ) : (
                                  <Download className="w-4 h-4" />
                                )}
                              </Button>
                            </UniversalTooltip>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={deletingId === template.id}
                                  className="text-red-400 hover:text-red-300"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Template</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{template.name}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteTemplate(template.id, template.name)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </TabsContent>

          <TabsContent value="quick-start" className="flex-1 overflow-y-auto space-y-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Common Templates</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Get started quickly with these pre-made templates. You can customize them after adding.
                </p>
              </div>
              
              {predefinedTemplates.map((template, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{template.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {template.items.length} items
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {template.description}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {template.items.slice(0, 4).map((item, itemIndex) => (
                          <Badge key={itemIndex} variant="secondary" className="text-xs">
                            {item.name}
                          </Badge>
                        ))}
                        {template.items.length > 4 && (
                          <Badge variant="secondary" className="text-xs">
                            +{template.items.length - 4} more
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => createPredefinedTemplate(template)}
                        disabled={isSaving}
                        className="text-blue-600 hover:text-blue-500"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
