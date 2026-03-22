import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from '@/lib/icons';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useMyCourseReview, useUpsertCourseReview } from '@/hooks/use-course-reviews';
import { StarRatingInput } from '@/components/reviews/ReviewStars';

const courseReviewSchema = z.object({
  reviewerName: z.string().trim().min(2, 'Name must be at least 2 characters.').max(60, 'Name must be 60 characters or less.'),
  rating: z.number().int().min(1, 'Choose a star rating.').max(5, 'Star rating must be between 1 and 5.'),
  title: z.string().trim().min(3, 'Review title must be at least 3 characters.').max(100, 'Review title must be 100 characters or less.'),
  body: z.string().trim().min(20, 'Review description must be at least 20 characters.').max(500, 'Review description must be 500 characters or less.'),
});

type CourseReviewFormData = z.infer<typeof courseReviewSchema>;

type CourseReviewDialogProps = {
  courseId: string | undefined;
  courseTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
};

function getDefaultReviewerName(firstName?: string, lastName?: string) {
  return `${firstName ?? ''} ${lastName ?? ''}`.trim();
}

export default function CourseReviewDialog({
  courseId,
  courseTitle,
  open,
  onOpenChange,
  onSaved,
}: CourseReviewDialogProps) {
  const { toast } = useToast();
  const { profile } = useAuth();
  const { data: existingReview, isLoading: isLoadingReview } = useMyCourseReview(courseId);
  const upsertReview = useUpsertCourseReview(courseId);
  const defaultReviewerName = getDefaultReviewerName(profile?.firstName, profile?.lastName);

  const form = useForm<CourseReviewFormData>({
    resolver: zodResolver(courseReviewSchema),
    defaultValues: {
      reviewerName: defaultReviewerName,
      rating: 0,
      title: '',
      body: '',
    },
  });

  useEffect(() => {
    if (!open) return;

    form.reset({
      reviewerName: existingReview?.reviewerName ?? defaultReviewerName,
      rating: existingReview?.rating ?? 0,
      title: existingReview?.title ?? '',
      body: existingReview?.body ?? '',
    });
  }, [defaultReviewerName, existingReview, form, open]);

  const reviewBody = form.watch('body') ?? '';
  const reviewStatusMessage = existingReview?.status === 'approved'
    ? 'Saving changes will resubmit this review for admin approval before it appears publicly.'
    : existingReview?.status === 'pending'
      ? 'This review is currently pending admin approval.'
      : 'Your review will be published after admin approval.';

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      await upsertReview.mutateAsync(values);
      toast({
        title: existingReview ? 'Review saved' : 'Review submitted',
        description: 'Your review is saved and pending admin approval.',
      });
      onOpenChange(false);
      onSaved?.();
    } catch (error) {
      toast({
        title: 'Unable to save review',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Review {courseTitle}</DialogTitle>
          <DialogDescription>
            Share your rating and feedback. Reviews are capped at 500 characters and only appear publicly after admin approval.
          </DialogDescription>
        </DialogHeader>

        {isLoadingReview ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="course-review-rating">Star Rating</Label>
              <StarRatingInput
                value={form.watch('rating')}
                onChange={(value) => form.setValue('rating', value, { shouldValidate: true })}
                disabled={upsertReview.isPending}
              />
              {form.formState.errors.rating && (
                <p className="text-sm text-destructive">{form.formState.errors.rating.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="course-review-name">Your Name</Label>
              <Input
                id="course-review-name"
                {...form.register('reviewerName')}
                disabled={upsertReview.isPending}
                placeholder="Your name"
              />
              {form.formState.errors.reviewerName && (
                <p className="text-sm text-destructive">{form.formState.errors.reviewerName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="course-review-title">Review Title</Label>
              <Input
                id="course-review-title"
                {...form.register('title')}
                disabled={upsertReview.isPending}
                placeholder="Short summary of your experience"
              />
              {form.formState.errors.title && (
                <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-4">
                <Label htmlFor="course-review-body">Review Description</Label>
                <span className="text-xs text-muted-foreground">{reviewBody.length}/500</span>
              </div>
              <Textarea
                id="course-review-body"
                {...form.register('body')}
                disabled={upsertReview.isPending}
                placeholder="What did this course help you change or understand?"
                rows={6}
                maxLength={500}
              />
              {form.formState.errors.body && (
                <p className="text-sm text-destructive">{form.formState.errors.body.message}</p>
              )}
            </div>

            <div className="rounded-md bg-muted px-4 py-3 text-sm text-muted-foreground">
              {reviewStatusMessage}
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={upsertReview.isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={upsertReview.isPending}>
                {upsertReview.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Review
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
