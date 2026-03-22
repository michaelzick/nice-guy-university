import { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Loader2,
  Search,
  Eye,
  EyeOff,
  Trash2,
} from '@/lib/icons';
import { useQuery } from '@tanstack/react-query';
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { fetchAllCoursesAdmin } from '@/lib/api/admin';
import {
  useAdminCourseReviews,
  useApproveCourseReview,
  useDeleteCourseReview,
  useHideCourseReview,
} from '@/hooks/use-course-reviews';
import { AdminCourseReview } from '@/types/course';
import { ReviewStars } from '@/components/reviews/ReviewStars';

function formatReviewDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getStatusBadgeClass(status: AdminCourseReview['status']) {
  switch (status) {
    case 'approved':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    case 'hidden':
      return 'bg-muted text-foreground dark:bg-muted/40 dark:text-foreground';
    default:
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
  }
}

export default function AdminReviewsList() {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'hidden' | 'all'>('pending');
  const [courseFilter, setCourseFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selectedReview, setSelectedReview] = useState<AdminCourseReview | null>(null);

  const { data: courses = [] } = useQuery({
    queryKey: ['admin', 'courses', 'filter'],
    queryFn: fetchAllCoursesAdmin,
  });

  const {
    data: reviews = [],
    isLoading,
    error,
  } = useAdminCourseReviews({
    status: statusFilter,
    courseId: courseFilter,
    search,
  });

  const approveReview = useApproveCourseReview();
  const hideReview = useHideCourseReview();
  const deleteReview = useDeleteCourseReview();

  const sortedCourses = useMemo(
    () => [...courses].sort((left, right) => left.title.localeCompare(right.title)),
    [courses],
  );

  const handleApprove = async (reviewId: string) => {
    try {
      await approveReview.mutateAsync(reviewId);
      toast({ title: 'Review approved' });
    } catch (error) {
      toast({
        title: 'Unable to approve review',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleHide = async (reviewId: string) => {
    try {
      await hideReview.mutateAsync(reviewId);
      toast({ title: 'Review hidden' });
    } catch (error) {
      toast({
        title: 'Unable to hide review',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (reviewId: string) => {
    try {
      await deleteReview.mutateAsync(reviewId);
      toast({ title: 'Review deleted' });
      if (selectedReview?.id === reviewId) {
        setSelectedReview(null);
      }
    } catch (error) {
      toast({
        title: 'Unable to delete review',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const isMutating = approveReview.isPending || hideReview.isPending || deleteReview.isPending;

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reviews</h1>
          <p className="mt-2 text-muted-foreground">Moderate submitted course reviews and control what appears publicly.</p>
        </div>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-[minmax(0,1fr)_220px_220px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search reviewer, title, or course"
            className="pl-9"
          />
        </div>

        <Select value={statusFilter} onValueChange={(value: 'pending' | 'approved' | 'hidden' | 'all') => setStatusFilter(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="hidden">Hidden</SelectItem>
          </SelectContent>
        </Select>

        <Select value={courseFilter} onValueChange={setCourseFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by course" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All courses</SelectItem>
            {sortedCourses.map((course) => (
              <SelectItem key={course.id} value={course.id}>
                {course.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="p-6 text-sm text-destructive">
            Unable to load reviews. {error instanceof Error ? error.message : 'Please try again.'}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-4 md:p-0">
            <div className="space-y-4 md:hidden">
              {reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="space-y-4 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="font-bold text-card-foreground">{review.title}</h2>
                        <p className="mt-1 text-sm text-muted-foreground">{review.courseTitle}</p>
                      </div>
                      <Badge className={getStatusBadgeClass(review.status)}>
                        {review.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Reviewer</p>
                        <p className="mt-1 font-medium text-card-foreground">{review.reviewerName}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Submitted</p>
                        <p className="mt-1 font-medium text-card-foreground">{formatReviewDate(review.createdAt)}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Rating</p>
                        <div className="mt-1 flex items-center gap-2">
                          <ReviewStars rating={review.rating} />
                          <span className="font-medium text-card-foreground">{review.rating}/5</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" className="w-full" onClick={() => setSelectedReview(review)}>
                        <Search className="mr-2 h-4 w-4" />
                        View
                      </Button>
                      {review.status === 'approved' ? (
                        <Button variant="outline" className="w-full" onClick={() => void handleHide(review.id)} disabled={isMutating}>
                          <EyeOff className="mr-2 h-4 w-4" />
                          Hide
                        </Button>
                      ) : (
                        <Button className="w-full" onClick={() => void handleApprove(review.id)} disabled={isMutating}>
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Approve
                        </Button>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" className="w-full text-destructive hover:text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Review</AlertDialogTitle>
                            <AlertDialogDescription>
                              Delete the review titled "{review.title}" from {review.reviewerName}? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => void handleDelete(review.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {reviews.length === 0 && (
                <p className="py-8 text-center text-muted-foreground">
                  No reviews match the current filters.
                </p>
              )}
            </div>

            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead>Reviewer</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reviews.map((review) => (
                    <TableRow key={review.id}>
                      <TableCell className="font-medium">{review.courseTitle}</TableCell>
                      <TableCell>{review.reviewerName}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <ReviewStars rating={review.rating} />
                          <span>{review.rating}/5</span>
                        </div>
                      </TableCell>
                      <TableCell>{review.title}</TableCell>
                      <TableCell>{formatReviewDate(review.createdAt)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeClass(review.status)}>
                          {review.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => setSelectedReview(review)}>
                            <Search className="h-4 w-4" />
                          </Button>
                          {review.status !== 'approved' && (
                            <Button variant="ghost" size="icon" onClick={() => void handleApprove(review.id)} disabled={isMutating}>
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                          )}
                          {review.status !== 'hidden' && (
                            <Button variant="ghost" size="icon" onClick={() => void handleHide(review.id)} disabled={isMutating}>
                              <EyeOff className="h-4 w-4" />
                            </Button>
                          )}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Review</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Delete the review titled "{review.title}" from {review.reviewerName}? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => void handleDelete(review.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}

                  {reviews.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                        No reviews match the current filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={!!selectedReview} onOpenChange={(open) => !open && setSelectedReview(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedReview?.title}</DialogTitle>
            <DialogDescription>
              {selectedReview?.reviewerName} on {selectedReview ? formatReviewDate(selectedReview.createdAt) : ''}
            </DialogDescription>
          </DialogHeader>

          {selectedReview && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    {selectedReview.courseTitle}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <ReviewStars rating={selectedReview.rating} />
                    <span className="text-sm font-medium text-card-foreground">{selectedReview.rating}/5</span>
                  </div>
                </div>
                <Badge className={getStatusBadgeClass(selectedReview.status)}>
                  {selectedReview.status}
                </Badge>
              </div>

              <p className="whitespace-pre-wrap break-words text-muted-foreground">{selectedReview.body}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
