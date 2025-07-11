
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc,
  X, 
  Check,
  Clock,
  AlertTriangle,
  Minus,
  Package,
  Apple,
  Milk,
  Beef,
  Coffee,
  Snowflake
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { GroceryListItem } from '@/lib/types';
import UniversalTooltip from '@/components/universal-tooltip';

export interface SortFilterOptions {
  searchTerm: string;
  sortBy: 'priority' | 'alphabetical' | 'category' | 'dateAdded' | 'storeSection';
  sortOrder: 'asc' | 'desc';
  showCompleted: boolean;
  filterCategories: string[];
  filterPriorities: string[];
  filterStoreSections: string[];
}

interface GrocerySortFilterProps {
  items: GroceryListItem[];
  options: SortFilterOptions;
  onOptionsChange: (options: SortFilterOptions) => void;
  hiddenItems: Set<number>;
}

const categoryIcons = {
  produce: Apple,
  dairy: Milk,
  meat: Beef,
  beverages: Coffee,
  pantry: Package,
  frozen: Snowflake,
};

const priorityConfig = {
  high: { icon: AlertTriangle, color: 'text-red-600', label: 'High' },
  medium: { icon: Minus, color: 'text-yellow-600', label: 'Medium' },
  low: { icon: Clock, color: 'text-green-600', label: 'Low' },
};

const storeSections = [
  'entrance',
  'produce', 
  'deli',
  'bakery',
  'dairy',
  'meat',
  'frozen',
  'pantry',
  'checkout'
];

export default function GrocerySortFilter({
  items,
  options,
  onOptionsChange,
  hiddenItems
}: GrocerySortFilterProps) {
  const [showFilters, setShowFilters] = useState(false);

  // Get visible items (not hidden by pantry)
  const visibleItems = items.filter(item => !hiddenItems.has(item.id));

  // Get unique values for filters
  const categories = Array.from(new Set(
    visibleItems.map(item => item.category).filter((category): category is string => Boolean(category))
  ));
  const usedStoreSections = Array.from(new Set(
    visibleItems.map(item => item.storeSection).filter((section): section is string => Boolean(section))
  ));

  const updateOptions = (updates: Partial<SortFilterOptions>) => {
    onOptionsChange({ ...options, ...updates });
  };

  // Count active filters
  const activeFilterCount = 
    (options.filterCategories.length > 0 ? 1 : 0) +
    (options.filterPriorities.length > 0 ? 1 : 0) +
    (options.filterStoreSections.length > 0 ? 1 : 0) +
    (!options.showCompleted ? 1 : 0);

  const clearAllFilters = () => {
    updateOptions({
      searchTerm: '',
      filterCategories: [],
      filterPriorities: [],
      filterStoreSections: [],
      showCompleted: true
    });
  };

  const quickFilterByPriority = (priority: string) => {
    updateOptions({
      filterPriorities: [priority],
      sortBy: 'priority',
      sortOrder: 'desc'
    });
  };

  const quickFilterByCategory = (category: string) => {
    updateOptions({
      filterCategories: [category],
      sortBy: 'category'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      {/* Search and Sort Bar */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search items..."
            value={options.searchTerm}
            onChange={(e) => updateOptions({ searchTerm: e.target.value })}
            className="pl-10"
          />
          {options.searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => updateOptions({ searchTerm: '' })}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>

        {/* Sort */}
        <Select
          value={`${options.sortBy}-${options.sortOrder}`}
          onValueChange={(value) => {
            const [sortBy, sortOrder] = value.split('-') as [typeof options.sortBy, typeof options.sortOrder];
            updateOptions({ sortBy, sortOrder });
          }}
        >
          <SelectTrigger className="w-40">
            <div className="flex items-center gap-2">
              {options.sortOrder === 'asc' ? (
                <SortAsc className="w-4 h-4" />
              ) : (
                <SortDesc className="w-4 h-4" />
              )}
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="priority-desc">Priority ↓</SelectItem>
            <SelectItem value="priority-asc">Priority ↑</SelectItem>
            <SelectItem value="alphabetical-asc">A-Z</SelectItem>
            <SelectItem value="alphabetical-desc">Z-A</SelectItem>
            <SelectItem value="category-asc">Category</SelectItem>
            <SelectItem value="dateAdded-desc">Newest</SelectItem>
            <SelectItem value="dateAdded-asc">Oldest</SelectItem>
            <SelectItem value="storeSection-asc">Store Layout</SelectItem>
          </SelectContent>
        </Select>

        {/* Filters */}
        <Popover open={showFilters} onOpenChange={setShowFilters}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="relative">
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs"
                >
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Filters</h4>
                {activeFilterCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="text-xs"
                  >
                    Clear all
                  </Button>
                )}
              </div>

              {/* Show Completed */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="show-completed"
                  checked={options.showCompleted}
                  onCheckedChange={(checked) => updateOptions({ showCompleted: Boolean(checked) })}
                />
                <Label htmlFor="show-completed" className="text-sm">
                  Show completed items
                </Label>
              </div>

              <Separator />

              {/* Priority Filter */}
              <div>
                <Label className="text-sm font-medium">Priority</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {Object.entries(priorityConfig).map(([priority, config]) => {
                    const Icon = config.icon;
                    const isSelected = options.filterPriorities.includes(priority);
                    return (
                      <Button
                        key={priority}
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          const newPriorities = isSelected
                            ? options.filterPriorities.filter(p => p !== priority)
                            : [...options.filterPriorities, priority];
                          updateOptions({ filterPriorities: newPriorities });
                        }}
                        className={`text-xs ${!isSelected ? config.color : ''}`}
                      >
                        <Icon className="w-3 h-3 mr-1" />
                        {config.label}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Category Filter */}
              {categories.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <Label className="text-sm font-medium">Categories</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {categories.map((category) => {
                        const Icon = categoryIcons[category as keyof typeof categoryIcons] || Package;
                        const isSelected = options.filterCategories.includes(category);
                        return (
                          <Button
                            key={category}
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              const newCategories = isSelected
                                ? options.filterCategories.filter(c => c !== category)
                                : [...options.filterCategories, category];
                              updateOptions({ filterCategories: newCategories });
                            }}
                            className="text-xs capitalize"
                          >
                            <Icon className="w-3 h-3 mr-1" />
                            {category}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* Store Section Filter */}
              {usedStoreSections.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <Label className="text-sm font-medium">Store Sections</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {usedStoreSections.map((section) => {
                        const isSelected = options.filterStoreSections.includes(section);
                        return (
                          <Button
                            key={section}
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              const newSections = isSelected
                                ? options.filterStoreSections.filter(s => s !== section)
                                : [...options.filterStoreSections, section];
                              updateOptions({ filterStoreSections: newSections });
                            }}
                            className="text-xs capitalize"
                          >
                            {section}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Quick Filters */}
      <AnimatePresence>
        {visibleItems.length > 5 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-nowrap gap-1 overflow-x-auto scrollbar-hide"
          >
            <span className="text-xs text-muted-foreground self-center flex-shrink-0">Quick filters:</span>
            
            {/* Priority Quick Filters */}
            <UniversalTooltip content="Show only high priority items">
              <Button
                variant="outline"
                size="sm"
                onClick={() => quickFilterByPriority('high')}
                className="text-xs text-red-600 hover:text-red-500 flex-shrink-0 px-2"
              >
                <AlertTriangle className="w-3 h-3 mr-1" />
                High Priority
              </Button>
            </UniversalTooltip>

            {/* Category Quick Filters */}
            {categories.slice(0, 3).map((category) => {
              const Icon = categoryIcons[category as keyof typeof categoryIcons] || Package;
              return (
                <UniversalTooltip key={category} content={`Show only ${category} items`}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => quickFilterByCategory(category)}
                    className="text-xs capitalize flex-shrink-0 px-2"
                  >
                    <Icon className="w-3 h-3 mr-1" />
                    {category}
                  </Button>
                </UniversalTooltip>
              );
            })}

            {/* Show Incomplete Only */}
            {!options.showCompleted && (
              <Badge variant="secondary" className="text-xs">
                <Check className="w-3 h-3 mr-1" />
                Hiding completed
              </Badge>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Filters Summary */}
      <AnimatePresence>
        {activeFilterCount > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2 items-center"
          >
            <span className="text-xs text-muted-foreground">Active filters:</span>
            
            {options.filterPriorities.map((priority) => (
              <Badge key={priority} variant="outline" className="text-xs">
                {priorityConfig[priority as keyof typeof priorityConfig].label} Priority
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => updateOptions({
                    filterPriorities: options.filterPriorities.filter(p => p !== priority)
                  })}
                  className="ml-1 h-3 w-3 p-0"
                >
                  <X className="w-2 h-2" />
                </Button>
              </Badge>
            ))}

            {options.filterCategories.map((category) => (
              <Badge key={category} variant="outline" className="text-xs capitalize">
                {category}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => updateOptions({
                    filterCategories: options.filterCategories.filter(c => c !== category)
                  })}
                  className="ml-1 h-3 w-3 p-0"
                >
                  <X className="w-2 h-2" />
                </Button>
              </Badge>
            ))}

            {options.filterStoreSections.map((section) => (
              <Badge key={section} variant="outline" className="text-xs capitalize">
                {section}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => updateOptions({
                    filterStoreSections: options.filterStoreSections.filter(s => s !== section)
                  })}
                  className="ml-1 h-3 w-3 p-0"
                >
                  <X className="w-2 h-2" />
                </Button>
              </Badge>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
