
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { levels, categories } from './constants';
import { isSamePriceRange, priceFilterOptions } from './filterQueryParams';
import { FilterProps } from './types';

interface FilterSidebarProps extends FilterProps {
  isDesktop?: boolean;
  onFilterClose?: () => void;
}

export default function FilterSidebar({ 
  filterState, 
  toggleLevel, 
  toggleCategory, 
  setPriceRange, 
  clearFilters,
  hasFilters,
  isDesktop = true,
  onFilterClose
}: FilterSidebarProps) {
  const { selectedLevels, selectedCategories, priceRange } = filterState;
  const idPrefix = isDesktop ? '' : 'mobile-';

  return (
    <div className={`${isDesktop ? 'hidden md:block w-1/4 fade-in' : 'md:hidden fade-in'}`}>
      <div className="sticky top-24 overflow-hidden bg-card rounded-lg">
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-foreground tracking-[0.02em]">Filters</h2>
            {hasFilters() && (
              <button 
                className="text-muted-foreground hover:text-foreground text-sm font-bold tracking-normal"
                onClick={clearFilters}
              >
                Clear All
              </button>
            )}
          </div>
          
          <Accordion type="multiple" defaultValue={['levels', 'categories', 'price']} className="w-full">
            <AccordionItem value="levels" className="border-b-0">
              <AccordionTrigger className="py-3 hover:no-underline">
                <span className="font-bold uppercase tracking-[0.04em] text-foreground">Level</span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  {levels.map(level => (
                    <div key={level} className="flex items-center">
                      <Checkbox 
                        id={`${idPrefix}level-${level}`} 
                        checked={selectedLevels.includes(level)}
                        onCheckedChange={() => toggleLevel(level)}
                        className="mr-2 data-[state=checked]:bg-primary data-[state=checked]:border-foreground"
                      />
                      <label htmlFor={`${idPrefix}level-${level}`} className="text-sm text-foreground/85 cursor-pointer font-medium tracking-normal">
                        {level}
                      </label>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="categories" className="border-b-0">
              <AccordionTrigger className="py-3 hover:no-underline">
                <span className="font-bold uppercase tracking-[0.04em] text-foreground">Category</span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  {categories.map(category => (
                    <div key={category.id} className="flex items-center">
                      <Checkbox 
                        id={`${idPrefix}category-${category.id}`} 
                        checked={selectedCategories.includes(category.id)}
                        onCheckedChange={() => toggleCategory(category.id)}
                        className="mr-2 data-[state=checked]:bg-primary data-[state=checked]:border-foreground"
                      />
                      <label htmlFor={`${idPrefix}category-${category.id}`} className="text-sm text-foreground/85 cursor-pointer font-medium tracking-normal">
                        {category.label}
                      </label>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="price" className="border-b-0">
              <AccordionTrigger className="py-3 hover:no-underline">
                <span className="font-bold uppercase tracking-[0.04em] text-foreground">Price</span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  {priceFilterOptions.map((option) => {
                    const checked = isSamePriceRange(priceRange, option.range);

                    return (
                      <div key={option.id} className="flex items-center">
                        <Checkbox
                          id={`${idPrefix}price-${option.id}`}
                          checked={checked}
                          onCheckedChange={() => setPriceRange(checked ? priceFilterOptions[0].range : option.range)}
                          className="mr-2 data-[state=checked]:bg-primary data-[state=checked]:border-foreground"
                        />
                        <label htmlFor={`${idPrefix}price-${option.id}`} className="text-sm text-foreground/85 cursor-pointer font-medium tracking-normal">
                          {option.label}
                        </label>
                      </div>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          
          {!isDesktop && (
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <button 
                className="w-full bg-muted px-3 py-2 text-foreground font-bold uppercase tracking-[0.04em]"
                onClick={clearFilters}
              >
                Clear All
              </button>
              <button 
                className="w-full bg-primary px-3 py-2 font-bold tracking-normal text-primary-foreground hover:bg-primary/85"
                onClick={onFilterClose}
              >
                Apply Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
