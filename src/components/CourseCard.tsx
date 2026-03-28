import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, BookOpen, ShoppingCart } from '@/lib/icons';
import { Course } from '@/types/course';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/hooks/use-cart';
import { useAuth } from '@/hooks/use-auth';
import { useMyEnrollments } from '@/hooks/use-enrollments';
import { cn } from '@/lib/utils';
import { ReviewStars } from '@/components/reviews/ReviewStars';

interface CourseCardProps {
  course: Course;
  className?: string;
}

export default function CourseCard({ course, className }: CourseCardProps) {
  const { addToCart, isInCart } = useCart();
  const { user } = useAuth();
  const { data: enrollments = [] } = useMyEnrollments();
  const videoRef = useRef<HTMLVideoElement>(null);
  const hoverIntentRef = useRef(false);
  const [showHoverVideo, setShowHoverVideo] = useState(false);
  const [hoverVideoFailed, setHoverVideoFailed] = useState(false);
  const showViewCourse = !!user && enrollments.some((enrollment) => enrollment.course_id === course.id);
  const coursePlayerHref = `/learn/${course.slug}`;
  const hasHoverVideo = Boolean(course.thumbnailVideoUrl) && !hoverVideoFailed;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const categoryLabel = course.category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const thumbnailImageUrl = `${course.thumbnailUrl}?auto=format&fit=crop&w=800&q=80`;

  useEffect(() => {
    hoverIntentRef.current = false;
    setShowHoverVideo(false);
    setHoverVideoFailed(false);

    const video = videoRef.current;
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
  }, [course.id, course.thumbnailVideoUrl]);

  useEffect(() => {
    const video = videoRef.current;

    return () => {
      if (video) {
        video.pause();
        video.currentTime = 0;
      }
    };
  }, []);

  const handleMediaMouseEnter = () => {
    const video = videoRef.current;
    if (!video || !hasHoverVideo) return;

    hoverIntentRef.current = true;
    video.currentTime = 0;

    const playPromise = video.play();
    if (playPromise) {
      void playPromise.then(() => {
        if (!hoverIntentRef.current) {
          video.pause();
          video.currentTime = 0;
          return;
        }

        setShowHoverVideo(true);
      }).catch(() => {
        video.pause();
        video.currentTime = 0;
        setShowHoverVideo(false);
        setHoverVideoFailed(true);
      });
      return;
    }

    setShowHoverVideo(true);
  };

  const handleMediaMouseLeave = () => {
    hoverIntentRef.current = false;
    setShowHoverVideo(false);

    const video = videoRef.current;
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
  };

  const handleVideoError = () => {
    hoverIntentRef.current = false;
    setShowHoverVideo(false);
    setHoverVideoFailed(true);

    const video = videoRef.current;
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
  };

  return (
    <div className={cn("course-card content-stack flex h-full flex-col overflow-hidden bg-card rounded-lg transition-all duration-300", className)}>
      <Link
        to={`/course/${course.slug}`}
        className="group block relative shrink-0 overflow-hidden pb-[56.25%]"
        onMouseEnter={handleMediaMouseEnter}
        onMouseLeave={handleMediaMouseLeave}
      >
        <img
          src={thumbnailImageUrl}
          alt={course.title}
          className={cn(
            "absolute inset-0 w-full h-full object-cover transition-all duration-300",
            showHoverVideo ? 'scale-100 opacity-0' : 'opacity-100 group-hover:scale-105',
          )}
        />
        {hasHoverVideo && (
          <video
            ref={videoRef}
            src={course.thumbnailVideoUrl}
            poster={thumbnailImageUrl}
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-200",
              showHoverVideo ? 'opacity-100' : 'opacity-0',
            )}
            onError={handleVideoError}
          />
        )}
        {course.bestseller && (
          <Badge className="absolute top-3 left-3 bg-foreground text-background">
            Popular
          </Badge>
        )}
        {course.salePrice && course.salePrice < course.price && (
          <Badge className="absolute top-3 right-3 bg-destructive text-destructive-foreground">
            Sale
          </Badge>
        )}
      </Link>
      
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="mb-2 flex items-start justify-between gap-3">
          <span className="text-xs font-bold text-foreground uppercase tracking-[0.05em]">
            {categoryLabel}
          </span>
          {course.ratingCount > 0 ? (
            <div className="flex shrink-0 items-center gap-2">
              <ReviewStars rating={course.rating} starClassName="h-3.5 w-3.5" />
              <div className="text-right">
                <p className="text-sm font-medium text-card-foreground">{course.rating.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">
                  {course.ratingCount} review{course.ratingCount === 1 ? '' : 's'}
                </p>
              </div>
            </div>
          ) : (
            <span className="text-xs font-medium uppercase tracking-[0.05em] text-muted-foreground">
              No reviews yet
            </span>
          )}
        </div>
        
        <Link to={`/course/${course.slug}`} className="group block">
          <h3 className="font-bold text-card-foreground mb-2 line-clamp-2 group-hover:text-foreground/70 transition-colors tracking-[0.01em]">
            {course.title}
          </h3>
        </Link>
        
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {course.shortDescription}
        </p>
        
        <div className="flex items-center text-sm text-muted-foreground mb-4">
          <Clock className="w-4 h-4 mr-1" />
          <span className="mr-3">{course.duration}</span>
          <BookOpen className="w-4 h-4 mr-1" />
          <span>{course.lectureCount} lessons</span>
        </div>
        
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm text-muted-foreground">By {course.instructor}</span>
          <div className="flex items-center sm:justify-end">
            {course.salePrice ? (
              <>
                <span className="text-sm font-bold text-card-foreground">
                  {formatPrice(course.salePrice)}
                </span>
                <span className="text-xs text-muted-foreground line-through ml-2">
                  {formatPrice(course.price)}
                </span>
              </>
            ) : (
              <span className="text-sm font-bold text-card-foreground">
                {formatPrice(course.price)}
              </span>
            )}
          </div>
        </div>
        
        <div className="mt-auto">
          {showViewCourse ? (
            <Button asChild className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
              <Link to={coursePlayerHref}>
                View Course
              </Link>
            </Button>
          ) : isInCart(course.id) ? (
            <Link to="/cart" className="block w-full">
              <Button variant="outline" className="w-full border-border text-foreground hover:bg-muted">
                <ShoppingCart className="w-4 h-4 mr-2" />
                View in Cart
              </Button>
            </Link>
          ) : (
            <Button 
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
              onClick={(e) => {
                e.preventDefault();
                addToCart(course.id);
              }}
            >
              Enroll Now
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
