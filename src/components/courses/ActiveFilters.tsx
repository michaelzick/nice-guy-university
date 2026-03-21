
import { X } from '@/lib/icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { categories } from './constants';
import { createDefaultPriceRange, getPriceFilterLabel, isDefaultPriceRange } from './filterQueryParams';
import { FilterProps } from './types';

interface ActiveFiltersProps extends FilterProps {
  setSearchQuery: (query: string) => void;
}

export default function ActiveFilters({
  filterState,
  toggleLevel,
  toggleCategory,
  setPriceRange,
  setSearchQuery,
  clearFilters,
  hasFilters
}: ActiveFiltersProps) {
  const { selectedLevels, selectedCategories, priceRange, searchQuery } = filterState;
  
  if (!hasFilters()) return null;
  
  return (
    <div className="mt-4 flex flex-wrap gap-2 items-center">
      <span className="text-sm text-muted-foreground mr-2 font-bold uppercase tracking-[0.04em]">Active filters:</span>
      
      {selectedLevels.map(level => (
        <Badge 
          key={level} 
          variant="outline" 
          className="bg-muted text-foreground hover:bg-muted/80 font-semibold"
        >
          {level}
          <X 
            className="h-3 w-3 ml-1 cursor-pointer" 
            onClick={() => toggleLevel(level)}
          />
        </Badge>
      ))}
      
      {selectedCategories.map(catId => {
        const category = categories.find(c => c.id === catId);
        return (
          <Badge 
            key={catId} 
            variant="outline" 
            className="bg-muted text-foreground hover:bg-muted/80 font-semibold"
          >
            {category?.label}
            <X 
              className="h-3 w-3 ml-1 cursor-pointer" 
              onClick={() => toggleCategory(catId)}
            />
          </Badge>
        );
      })}
      
      {!isDefaultPriceRange(priceRange) && (
        <Badge 
          variant="outline" 
          className="bg-muted text-foreground hover:bg-muted/80 font-semibold"
        >
          {getPriceFilterLabel(priceRange)}
          <X 
            className="h-3 w-3 ml-1 cursor-pointer" 
            onClick={() => setPriceRange(createDefaultPriceRange())}
          />
        </Badge>
      )}
      
      {searchQuery && (
        <Badge 
          variant="outline" 
          className="bg-muted text-foreground hover:bg-muted/80 font-semibold"
        >
          "{searchQuery}"
          <X 
            className="h-3 w-3 ml-1 cursor-pointer" 
            onClick={() => setSearchQuery('')}
          />
        </Badge>
      )}
      
      <Button 
        variant="ghost" 
        size="sm" 
        className="text-muted-foreground hover:text-foreground ml-auto"
        onClick={clearFilters}
      >
        Clear All
      </Button>
    </div>
  );
}
