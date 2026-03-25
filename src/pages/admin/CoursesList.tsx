import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Eye, EyeOff, Loader2 } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { fetchAllCoursesAdmin, deleteCourse } from '@/lib/api/admin';
import { useToast } from '@/components/ui/use-toast';
import { DbCourse } from '@/types/database';

export default function AdminCoursesList() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['admin', 'courses'],
    queryFn: fetchAllCoursesAdmin,
  });

  const deleteCourseMutation = useMutation({
    mutationFn: deleteCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] });
      toast({ title: 'Course deleted' });
    },
    onError: () => {
      toast({ title: 'Failed to delete course', variant: 'destructive' });
    },
  });

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-foreground">Courses</h1>
        <Link to="/admin/courses/new">
          <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            New Course
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-4 md:p-0">
          <div className="space-y-4 md:hidden">
            {courses.map((course: DbCourse) => (
              <Card key={course.id}>
                <CardContent className="space-y-4 p-4">
                  <div className="flex items-start gap-3">
                    <img
                      src={`${course.thumbnail_url}?auto=format&fit=crop&w=120&q=60`}
                      alt=""
                      className="h-16 w-24 flex-shrink-0 object-cover"
                    />
                    <div className="content-stack">
                      <Link
                        to={`/learn/${course.slug}`}
                        className="font-bold text-card-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
                      >
                        {course.title}
                      </Link>
                      <p className="mt-1 text-xs uppercase tracking-[0.08em] text-muted-foreground">{course.level}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Category</p>
                      <p className="mt-1 font-medium text-card-foreground">{course.category.replace(/-/g, ' ')}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Price</p>
                      <div className="mt-1">
                        {course.sale_price ? (
                          <>
                            <span className="font-medium text-card-foreground">{formatPrice(Number(course.sale_price))}</span>
                            <span className="ml-1 text-xs text-muted-foreground line-through">{formatPrice(Number(course.price))}</span>
                          </>
                        ) : (
                          <span className="font-medium text-card-foreground">{formatPrice(Number(course.price))}</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Students</p>
                      <p className="mt-1 font-medium text-card-foreground">{course.students_count}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Reviews</p>
                      <p className="mt-1 font-medium text-card-foreground">
                        {course.rating_count > 0 ? `${Number(course.rating).toFixed(1)} / 5 (${course.rating_count})` : 'No reviews'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Status</p>
                      <div className="mt-1">
                        {course.published ? (
                          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            <Eye className="mr-1 h-3 w-3" />
                            Published
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <EyeOff className="mr-1 h-3 w-3" />
                            Draft
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Link to={`/admin/courses/${course.id}/edit`} className="block w-full">
                      <Button variant="outline" className="w-full">
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                    </Link>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" className="w-full text-destructive hover:text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Course</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{course.title}"? This will also delete all chapters and lessons. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteCourseMutation.mutate(course.id)}
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
            {courses.length === 0 && (
              <p className="py-8 text-center text-muted-foreground">
                No courses yet. Create your first course.
              </p>
            )}
          </div>

          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Reviews</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((course: DbCourse) => (
                  <TableRow key={course.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={`${course.thumbnail_url}?auto=format&fit=crop&w=80&q=60`}
                          alt=""
                          className="h-8 w-12 object-cover"
                        />
                        <div>
                          <Link
                            to={`/learn/${course.slug}`}
                            className="font-medium underline-offset-4 transition-colors hover:text-primary hover:underline"
                          >
                            {course.title}
                          </Link>
                          <p className="text-xs text-muted-foreground">{course.level}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {course.category.replace(/-/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {course.sale_price ? (
                        <div>
                          <span className="font-medium">{formatPrice(Number(course.sale_price))}</span>
                          <span className="ml-1 text-sm text-muted-foreground line-through">
                            {formatPrice(Number(course.price))}
                          </span>
                        </div>
                      ) : (
                        formatPrice(Number(course.price))
                      )}
                    </TableCell>
                    <TableCell>{course.students_count}</TableCell>
                    <TableCell>
                      {course.rating_count > 0 ? `${Number(course.rating).toFixed(1)} / 5 (${course.rating_count})` : 'No reviews'}
                    </TableCell>
                    <TableCell>
                      {course.published ? (
                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          <Eye className="mr-1 h-3 w-3" />
                          Published
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <EyeOff className="mr-1 h-3 w-3" />
                          Draft
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/admin/courses/${course.id}/edit`}>
                          <Button variant="ghost" size="icon">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Course</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{course.title}"? This will also delete all chapters and lessons. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteCourseMutation.mutate(course.id)}
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
                {courses.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                      No courses yet. Create your first course.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
