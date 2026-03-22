import { useEffect, useMemo, useState } from 'react';
import { Loader2 } from '@/lib/icons';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { useCourseReviews } from '@/hooks/use-course-reviews';
import { ReviewStars } from '@/components/reviews/ReviewStars';

type CourseReviewsSectionProps = {
  courseId: string;
  rating: number;
  ratingCount: number;
};

const PAGE_SIZE = 5;

function formatReviewDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function CourseReviewsSection({
  courseId,
  rating,
  ratingCount,
}: CourseReviewsSectionProps) {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useCourseReviews(courseId, page, PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [courseId]);

  const pageNumbers = useMemo(
    () => Array.from({ length: data?.totalPages ?? 0 }, (_, index) => index + 1),
    [data?.totalPages],
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data || data.totalCount === 0 || ratingCount === 0) {
    return (
      <div className="rounded-lg bg-muted px-6 py-10 text-center">
        <h2 className="text-xl font-bold text-foreground">No reviews yet</h2>
        <p className="mt-2 text-muted-foreground">
          Completed students will be able to leave a review after finishing this course.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-muted px-6 py-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-3xl font-bold text-foreground">{rating.toFixed(1)}</p>
            <div className="mt-2 flex items-center gap-3">
              <ReviewStars rating={rating} />
              <span className="text-sm text-muted-foreground">
                {ratingCount} approved review{ratingCount === 1 ? '' : 's'}
              </span>
            </div>
          </div>
          <p className="max-w-md text-sm text-muted-foreground">
            Reviews are written by completed students and published after admin approval.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {data.reviews.map((review) => (
          <article key={review.id} className="rounded-lg border border-border bg-card p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-card-foreground">{review.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{review.reviewerName}</p>
              </div>
              <div className="flex flex-col items-start gap-2 sm:items-end">
                <ReviewStars rating={review.rating} />
                <span className="text-xs uppercase tracking-[0.08em] text-muted-foreground">
                  {formatReviewDate(review.createdAt)}
                </span>
              </div>
            </div>
            <p className="mt-4 whitespace-pre-wrap break-words text-muted-foreground">{review.body}</p>
          </article>
        ))}
      </div>

      {data.totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#course-reviews"
                onClick={(event) => {
                  event.preventDefault();
                  setPage((currentPage) => Math.max(1, currentPage - 1));
                }}
                className={page === 1 ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>

            {pageNumbers.map((pageNumber) => (
              <PaginationItem key={pageNumber}>
                <PaginationLink
                  href="#course-reviews"
                  isActive={pageNumber === page}
                  onClick={(event) => {
                    event.preventDefault();
                    setPage(pageNumber);
                  }}
                >
                  {pageNumber}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                href="#course-reviews"
                onClick={(event) => {
                  event.preventDefault();
                  setPage((currentPage) => Math.min(data.totalPages, currentPage + 1));
                }}
                className={page === data.totalPages ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
