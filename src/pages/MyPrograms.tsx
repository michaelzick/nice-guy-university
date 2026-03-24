import { Link } from 'react-router-dom';
import { BookOpen, ChevronRight, PlayCircle, Loader2, CheckCircle2, XCircle } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { EnrollmentWithCourse, useMyEnrollments } from '@/hooks/use-enrollments';
import { markCourseCompleted, markCourseIncomplete } from '@/lib/api/progress';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { useState } from 'react';
import CourseReviewDialog from '@/components/reviews/CourseReviewDialog';

type ReviewCourseState = {
  courseId: string;
  courseTitle: string;
};

type PendingCompletionChange = {
  enrollment: EnrollmentWithCourse;
  nextCompleted: boolean;
};

export default function MyPrograms() {
  const { data: enrollments = [], isLoading } = useMyEnrollments();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [reviewCourse, setReviewCourse] = useState<ReviewCourseState | null>(null);
  const [pendingCompletionChange, setPendingCompletionChange] = useState<PendingCompletionChange | null>(null);

  const handleToggleCompletion = async (change: PendingCompletionChange) => {
    const course = change.enrollment.courses;
    if (!course) return;

    setTogglingId(change.enrollment.id);
    try {
      if (change.nextCompleted) {
        await markCourseCompleted(course.id);
        setReviewCourse({
          courseId: course.id,
          courseTitle: course.title,
        });
      } else {
        await markCourseIncomplete(course.id);
        toast({ title: 'Marked incomplete', description: `${course.title} has been marked as in progress.` });
      }
      void queryClient.invalidateQueries({ queryKey: ['course-progress'] });
      void queryClient.invalidateQueries({ queryKey: ['enrollments'] });
    } catch {
      toast({ title: 'Something went wrong', description: 'Please try again.', variant: 'destructive' });
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead title="Enrollments" description="Your enrolled courses" noIndex />
      <Navbar />

      <main className="flex-grow mobile-shell pb-16 pt-32">
        <div className="container mx-auto content-stack">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Enrollments</h1>
            <p className="text-muted-foreground">Continue your recovery journey.</p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : enrollments.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-muted mb-6">
                <BookOpen className="h-10 w-10 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-4">No Enrollments Yet</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                You haven't enrolled in any courses yet. Browse our catalog to get started.
              </p>
              <Link to="/courses">
                <Button variant="accentCta">
                  Browse Courses
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 items-stretch gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
              {enrollments.map((enrollment) => {
                const course = enrollment.courses;
                if (!course) return null;
                const isCompleted = !!enrollment.completed_at;
                const isToggling = togglingId === enrollment.id;

                return (
                  <Card key={enrollment.id} className="flex h-full flex-col overflow-hidden">
                    <Link
                      to={`/learn/${course.slug}`}
                      className="group block relative shrink-0 overflow-hidden pb-[56.25%]"
                    >
                      <img
                        src={`${course.thumbnail_url}?auto=format&fit=crop&w=600&q=80`}
                        alt={course.title}
                        className="absolute inset-0 h-full w-full object-cover transform transition-transform duration-300 group-hover:scale-105"
                      />
                      {isCompleted && (
                        <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-foreground px-3 py-1 text-xs font-semibold text-background shadow-md">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Completed
                        </div>
                      )}
                    </Link>
                    <CardContent className="flex flex-1 flex-col p-4 sm:p-5">
                      <Link to={`/learn/${course.slug}`} className="group block">
                        <h3 className="mb-2 line-clamp-2 font-bold tracking-[0.01em] text-card-foreground transition-colors group-hover:text-foreground/70">
                          {course.title}
                        </h3>
                      </Link>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {course.short_description}
                      </p>
                      <div className="mt-auto flex flex-col gap-2">
                        {isCompleted && (
                          <Button
                            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                            onClick={() => setReviewCourse({ courseId: course.id, courseTitle: course.title })}
                          >
                            <PlayCircle className="h-4 w-4 mr-2" />
                            Review Course
                          </Button>
                        )}
                        {!isCompleted && (
                          <Link to={`/learn/${course.slug}`}>
                            <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                              <PlayCircle className="h-4 w-4 mr-2" />
                              Continue Learning
                            </Button>
                          </Link>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`w-full text-xs ${isCompleted ? 'text-muted-foreground hover:text-foreground' : 'text-foreground hover:text-foreground/70'}`}
                          onClick={() => setPendingCompletionChange({
                            enrollment,
                            nextCompleted: !isCompleted,
                          })}
                          disabled={isToggling}
                        >
                          {isToggling ? (
                            <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                          ) : isCompleted ? (
                            <XCircle className="mr-2 h-3.5 w-3.5" />
                          ) : (
                            <CheckCircle2 className="mr-2 h-3.5 w-3.5" />
                          )}
                          {isCompleted ? 'Mark as Incomplete' : 'Mark as Complete'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <AlertDialog
        open={!!pendingCompletionChange}
        onOpenChange={(open) => {
          if (!open) {
            setPendingCompletionChange(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm completion change</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure? You will lose your current completion state. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const change = pendingCompletionChange;
                if (!change) return;
                setPendingCompletionChange(null);
                void handleToggleCompletion(change);
              }}
            >
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CourseReviewDialog
        courseId={reviewCourse?.courseId}
        courseTitle={reviewCourse?.courseTitle ?? ''}
        open={!!reviewCourse}
        onOpenChange={(open) => {
          if (!open) {
            setReviewCourse(null);
          }
        }}
      />

      <Footer />
    </div>
  );
}
