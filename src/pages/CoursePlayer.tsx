import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, PlayCircle, BookOpen, Loader2, Menu, CheckCircle2, Pencil } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import Navbar from '@/components/Navbar';
import VideoPlayer from '@/components/player/VideoPlayer';
import MarkdownContent from '@/components/MarkdownContent';
import JournalPrompts from '@/components/player/JournalPrompts';
import { useCourseBySlug, useCourseChapters } from '@/hooks/use-courses';
import { useCourseProgress } from '@/hooks/use-progress';
import { CourseContentEntry } from '@/lib/api/courses';
import SEOHead from '@/components/SEOHead';
import { useToast } from '@/components/ui/use-toast';
import { markCourseCompleted, updateLessonProgress } from '@/lib/api/progress';
import CourseReviewDialog from '@/components/reviews/CourseReviewDialog';
import { useAuth } from '@/hooks/use-auth';
import { recordChapterIntroView } from '@/lib/api/chapter-intro-analytics';

export default function CoursePlayer() {
  const { courseSlug, lessonId } = useParams<{ courseSlug: string; lessonId?: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { isAdmin, isProfileLoading } = useAuth();
  const { data: course, isLoading: courseLoading } = useCourseBySlug(courseSlug);
  const { data: chapters = [], isLoading: chaptersLoading } = useCourseChapters(course?.id);
  const { data: courseProgress = [] } = useCourseProgress(course?.id);
  const [currentEntry, setCurrentEntry] = useState<CourseContentEntry | null>(null);
  const [mobileCourseMenuOpen, setMobileCourseMenuOpen] = useState(false);
  const [openChapters, setOpenChapters] = useState<string[]>([]);
  const [isAdvancingLesson, setIsAdvancingLesson] = useState(false);
  const [isCompletingCourse, setIsCompletingCourse] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const lastOpenedEntryIdRef = useRef<string | null>(null);

  const allEntries = chapters.flatMap((chapter) => [chapter.chapterIntro, ...chapter.lessons]);
  const allLessons = chapters.flatMap(ch => ch.lessons);
  const activeChapterId = chapters.find((chapter) =>
    [chapter.chapterIntro, ...chapter.lessons].some((entry) => entry.id === currentEntry?.id)
  )?.id;
  const completedLessonIds = new Set(courseProgress.filter((entry) => entry.completed).map((entry) => entry.lesson_id));

  useEffect(() => {
    if (allEntries.length === 0) return;

    if (lessonId) {
      const found = allEntries.find((entry) => entry.id === lessonId);
      if (found) {
        setCurrentEntry(found);
        return;
      }
    }
    setCurrentEntry(allEntries[0]);
  }, [allEntries, lessonId]);

  useEffect(() => {
    if (!currentEntry || lastOpenedEntryIdRef.current === currentEntry.id) return;

    lastOpenedEntryIdRef.current = currentEntry.id;

    if (currentEntry.kind === 'chapter_intro') {
      void recordChapterIntroView(currentEntry.chapterId).catch((error) => {
        console.error('Failed to record chapter intro view:', error);
      });
    }
  }, [currentEntry]);

  useEffect(() => {
    if (chapters.length === 0) return;

    setOpenChapters((current) => {
      const chapterIds = chapters.map((chapter) => chapter.id);
      const nextOpenChapters = current.filter((chapterId) => chapterIds.includes(chapterId));

      if (nextOpenChapters.length === 0) {
        return chapterIds;
      }

      if (activeChapterId && !nextOpenChapters.includes(activeChapterId)) {
        return [...nextOpenChapters, activeChapterId];
      }

      return nextOpenChapters;
    });
  }, [chapters, activeChapterId]);

  const currentEntryIndex = currentEntry ? allEntries.findIndex((entry) => entry.id === currentEntry.id) : -1;
  const currentLessonIndex = currentEntry?.kind === 'lesson'
    ? allLessons.findIndex((lesson) => lesson.id === currentEntry.id)
    : -1;
  const prevEntry = currentEntryIndex > 0 ? allEntries[currentEntryIndex - 1] : null;
  const nextEntry = currentEntryIndex < allEntries.length - 1 ? allEntries[currentEntryIndex + 1] : null;
  const lessonProgressLabel = currentEntry?.kind === 'lesson' && allLessons.length > 0
    ? `Lesson ${Math.max(currentLessonIndex + 1, 1)} of ${allLessons.length}`
    : 'Chapter Intro';

  const navigateToEntry = (entry: CourseContentEntry) => {
    navigate(`/learn/${courseSlug}/${entry.id}`, { replace: true });
    setCurrentEntry(entry);
    setMobileCourseMenuOpen(false);
  };

  const handleNextLesson = async () => {
    if (!currentEntry || !nextEntry) return;

    setIsAdvancingLesson(true);
    try {
      if (currentEntry.kind === 'lesson') {
        await updateLessonProgress(currentEntry.id, { completed: true });
        void queryClient.invalidateQueries({ queryKey: ['course-progress'] });
      }
      navigateToEntry(nextEntry);
    } catch (error) {
      toast({
        title: 'Unable to save lesson completion',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsAdvancingLesson(false);
    }
  };

  const handleCompleteCourse = async () => {
    if (!course) return;

    setIsCompletingCourse(true);

    try {
      await markCourseCompleted(course.id);
      void queryClient.invalidateQueries({ queryKey: ['course-progress'] });
      void queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      setReviewDialogOpen(true);
    } catch (error) {
      toast({
        title: 'Unable to complete course',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsCompletingCourse(false);
    }
  };

  const renderCourseContent = (variant: 'desktop' | 'mobile') => (
    <Accordion
      type="multiple"
      value={openChapters}
      onValueChange={setOpenChapters}
      className="w-full"
    >
      {chapters.map((chapter) => (
        <AccordionItem key={chapter.id} value={chapter.id} className="border-b border-border">
          <AccordionTrigger
            className={`px-4 py-4 text-left hover:bg-muted/70 hover:no-underline ${
              variant === 'mobile' ? 'text-base' : 'text-sm'
            }`}
          >
            <div className="flex min-w-0 flex-col items-start gap-1 pr-4">
              <span className="font-semibold text-card-foreground">{chapter.title}</span>
              <span className="flex items-center gap-1.5 text-xs font-normal uppercase tracking-[0.08em] text-muted-foreground">
                <span>
                  {chapter.lessons.length} {chapter.lessons.length === 1 ? 'lesson' : 'lessons'}
                </span>
                {chapter.lessons.length > 0 && chapter.lessons.every((lesson) => completedLessonIds.has(lesson.id)) && (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                )}
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-0">
            <ul className="border-t border-border/70 bg-background/20">
              {[chapter.chapterIntro, ...chapter.lessons].map((entry) => {
                const isActive = currentEntry?.id === entry.id;
                const isCompleted = entry.kind === 'lesson' && completedLessonIds.has(entry.id);

                return (
                  <li key={entry.id}>
                    <button
                      onClick={() => navigateToEntry(entry)}
                      className={`flex w-full items-start justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/60 ${
                        isActive ? 'border-l-2 border-foreground bg-foreground/10' : ''
                      }`}
                    >
                      <div className="flex min-w-0 items-start gap-3">
                        {isCompleted ? (
                          <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                        ) : entry.kind === 'chapter_intro' ? (
                          <BookOpen className={`mt-0.5 h-4 w-4 flex-shrink-0 ${
                            isActive ? 'text-foreground' : 'text-muted-foreground'
                          }`} />
                        ) : (
                          <PlayCircle className={`mt-0.5 h-4 w-4 flex-shrink-0 ${
                            isActive ? 'text-foreground' : 'text-muted-foreground'
                          }`} />
                        )}
                        <div className="min-w-0 flex-grow">
                          <p className={`text-sm ${
                            isActive || isCompleted ? 'font-medium text-foreground' : 'text-card-foreground'
                          }`}>
                            {entry.title}
                          </p>
                          {entry.durationSeconds > 0 && (
                            <p className="mt-1 text-xs uppercase tracking-[0.08em] text-muted-foreground">
                              {Math.floor(entry.durationSeconds / 60)} min
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );

  if (courseLoading || chaptersLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="mobile-shell flex flex-1 items-center justify-center pt-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="mobile-shell flex flex-1 items-center justify-center pt-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Course Not Found</h1>
            <Link to="/courses">
              <Button variant="accentCta">
                Browse Courses
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead title={course?.title || "Course Player"} description="Course player" noIndex />
      <Navbar />

      <main className="flex min-w-0 flex-1 flex-col pt-20">
        {/* Top bar */}
        <div className="mobile-shell border-b border-border bg-secondary py-3">
          <div className="mx-auto flex max-w-screen-2xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-2 sm:gap-4">
              <Link to={`/course/${courseSlug}`} className="shrink-0">
                <Button variant="outline" size="sm" className="shrink-0 border-border bg-background px-2 text-xs text-foreground hover:border-primary/50 hover:bg-secondary hover:text-foreground sm:px-3 sm:text-sm">
                  <BookOpen className="h-4 w-4 mr-1" />
                  COURSE
                </Button>
              </Link>
              {!isProfileLoading && isAdmin && course && (
                <Link to={`/admin/courses/${course.id}/edit`} className="shrink-0">
                  <Button variant="outline" size="sm" className="shrink-0 border-border bg-background px-2 text-xs text-foreground hover:border-primary/50 hover:bg-secondary hover:text-foreground sm:px-3 sm:text-sm">
                    <Pencil className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </Link>
              )}
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground sm:hidden">
                  {lessonProgressLabel}
                </p>
                <h1 className="truncate text-sm font-medium text-secondary-foreground">
                  {course.title}
                </h1>
              </div>
            </div>
            <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-end">
              <div className="hidden text-sm text-muted-foreground sm:block">
                {lessonProgressLabel}
              </div>
              <Sheet open={mobileCourseMenuOpen} onOpenChange={setMobileCourseMenuOpen}>
                <Button
                  variant="outline"
                  size="sm"
                  aria-label="Open course content"
                  className="w-full justify-center border-border bg-background px-3 text-xs text-foreground hover:border-primary/50 hover:bg-secondary hover:text-foreground active:bg-muted sm:min-w-[10rem] sm:w-auto sm:text-sm lg:hidden"
                  onClick={() => setMobileCourseMenuOpen(true)}
                >
                  <Menu className="h-4 w-4 mr-2" />
                  <span className="truncate">Course&nbsp;Content</span>
                </Button>
                <SheetContent
                  side="right"
                  className="flex h-full w-full max-w-sm flex-col border-l border-border bg-card p-0 text-card-foreground sm:max-w-md"
                >
                  <SheetHeader className="shrink-0 border-b border-border bg-secondary px-5 py-4 text-left">
                    <SheetTitle className="flex items-center gap-2 text-card-foreground">
                      <BookOpen className="h-4 w-4" />
                      Course Content
                    </SheetTitle>
                    <SheetDescription>
                      {lessonProgressLabel}
                    </SheetDescription>
                  </SheetHeader>
                  <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-8">
                    {renderCourseContent('mobile')}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-1 flex-col lg:flex-row">
          {/* Video area */}
          <div className="min-w-0 flex-grow p-2 sm:p-4 lg:p-8">
            {currentEntry ? (
              <>
                <VideoPlayer entry={currentEntry} />
                <div className="mt-6">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-foreground">
                    {lessonProgressLabel}
                  </p>
                  <h2 className="text-2xl font-bold text-foreground mb-2">{currentEntry.title}</h2>
                  {currentEntry.kind === 'lesson' && currentEntry.description && (
                    <p className="text-muted-foreground">{currentEntry.description}</p>
                  )}
                  {currentEntry.kind === 'chapter_intro' && currentEntry.blurb && (
                    <p className="text-muted-foreground">{currentEntry.blurb}</p>
                  )}
                </div>

                {currentEntry.kind === 'lesson' && currentEntry.content && (
                  <div className="mt-8">
                    <MarkdownContent content={currentEntry.content} />
                  </div>
                )}

                {currentEntry.kind === 'lesson' && (
                  <JournalPrompts prompts={currentEntry.journalPrompts} />
                )}

                {/* Navigation */}
                <div className="mt-8 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
                  {prevEntry ? (
                    <Button variant="outline" className="w-full sm:w-auto" onClick={() => navigateToEntry(prevEntry)}>
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>
                  ) : <div />}
                  {nextEntry ? (
                    <Button className="w-full sm:w-auto" onClick={() => void handleNextLesson()} disabled={isAdvancingLesson}>
                      {isAdvancingLesson ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          Next
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button className="w-full sm:w-auto" onClick={() => void handleCompleteCourse()} disabled={isCompletingCourse}>
                      {isCompletingCourse ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                      )}
                      Complete Course
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <div className="aspect-video bg-muted flex items-center justify-center">
                <p className="text-muted-foreground">No lessons available yet.</p>
              </div>
            )}
          </div>

          {/* Desktop sidebar */}
          <aside className="hidden border-l border-border bg-card rounded-lg lg:sticky lg:top-20 lg:block lg:w-96 lg:flex-shrink-0 lg:self-start">
            <div className="border-b border-border p-4">
              <h3 className="font-bold text-card-foreground flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Course Content
              </h3>
              <p className="mt-2 text-xs uppercase tracking-[0.08em] text-muted-foreground">
                {allLessons.length} lessons across {chapters.length} chapters
              </p>
            </div>
            <div>{renderCourseContent('desktop')}</div>
          </aside>
        </div>
      </main>

      <CourseReviewDialog
        courseId={course.id}
        courseTitle={course.title}
        open={reviewDialogOpen}
        onOpenChange={setReviewDialogOpen}
      />
    </div>
  );
}
