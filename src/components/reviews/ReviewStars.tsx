import { Star } from '@/lib/icons';
import { cn } from '@/lib/utils';

type ReviewStarsProps = {
  rating: number;
  className?: string;
  starClassName?: string;
};

export function ReviewStars({ rating, className, starClassName }: ReviewStarsProps) {
  const filledStars = Math.round(rating);

  return (
    <div className={cn('flex items-center gap-1', className)} aria-hidden="true">
      {Array.from({ length: 5 }, (_, index) => {
        const isFilled = index < filledStars;
        return (
          <Star
            key={index}
            className={cn(
              'h-4 w-4',
              isFilled ? 'fill-foreground text-foreground' : 'text-muted-foreground',
              starClassName,
            )}
          />
        );
      })}
    </div>
  );
}

type StarRatingInputProps = {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
};

export function StarRatingInput({ value, onChange, disabled = false }: StarRatingInputProps) {
  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Course rating">
      {Array.from({ length: 5 }, (_, index) => {
        const nextValue = index + 1;
        const isFilled = nextValue <= value;

        return (
          <button
            key={nextValue}
            type="button"
            role="radio"
            aria-checked={value === nextValue}
            aria-label={`${nextValue} star${nextValue === 1 ? '' : 's'}`}
            disabled={disabled}
            onClick={() => onChange(nextValue)}
            className={cn(
              'rounded-sm p-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
              isFilled ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Star className={cn('h-6 w-6', isFilled && 'fill-current')} />
          </button>
        );
      })}
    </div>
  );
}
