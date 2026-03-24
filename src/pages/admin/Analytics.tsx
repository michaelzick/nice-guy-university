import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OverviewTab from './analytics/OverviewTab';
import CourseCompletionTab from './analytics/CourseCompletionTab';
import ChapterProgressTab from './analytics/ChapterProgressTab';
import VideoTrackingTab from './analytics/VideoTrackingTab';
import EnrollmentTrendsTab from './analytics/EnrollmentTrendsTab';

export default function Analytics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">Course completion, video tracking, and learner engagement.</p>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="course-completion">Course Completion</TabsTrigger>
          <TabsTrigger value="chapter-progress">Chapter Progress</TabsTrigger>
          <TabsTrigger value="video-tracking">Video Tracking</TabsTrigger>
          <TabsTrigger value="enrollment-trends">Enrollment Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <OverviewTab />
        </TabsContent>

        <TabsContent value="course-completion" className="mt-6">
          <CourseCompletionTab />
        </TabsContent>

        <TabsContent value="chapter-progress" className="mt-6">
          <ChapterProgressTab />
        </TabsContent>

        <TabsContent value="video-tracking" className="mt-6">
          <VideoTrackingTab />
        </TabsContent>

        <TabsContent value="enrollment-trends" className="mt-6">
          <EnrollmentTrendsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
