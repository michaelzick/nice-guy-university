import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { fetchChapterProgressData, fetchAnalyticsCourses } from '@/lib/api/analytics';
import { useIsMobile } from '@/hooks/use-mobile';

const chartConfig = {
  avgWatchPercent: { label: 'Avg Watch %', color: 'hsl(195, 100%, 55%)' },
  completionRate: { label: 'Completion Rate %', color: 'hsl(150, 100%, 50%)' },
};

export default function ChapterProgressTab() {
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const isMobile = useIsMobile();

  const { data: courses } = useQuery({
    queryKey: ['admin', 'analytics', 'courses'],
    queryFn: fetchAnalyticsCourses,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'analytics', 'chapter-progress', selectedCourse],
    queryFn: () => fetchChapterProgressData(selectedCourse),
    enabled: !!selectedCourse,
  });

  // Auto-select first course
  if (courses && courses.length > 0 && !selectedCourse) {
    setSelectedCourse(courses[0].id);
  }

  const maxLen = isMobile ? 15 : 25;

  const chartData = (data ?? []).map((row) => ({
    name: row.chapterTitle.length > maxLen ? row.chapterTitle.slice(0, maxLen) + '...' : row.chapterTitle,
    fullName: row.chapterTitle,
    avgWatchPercent: row.avgWatchPercent,
    completionRate: row.completionRate,
    learners: row.totalLearners,
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium">Course:</label>
        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
          <SelectTrigger className="w-full max-w-xs sm:max-w-md">
            <SelectValue placeholder="Select a course" />
          </SelectTrigger>
          <SelectContent>
            {(courses ?? []).map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading && (
        <div className="py-8 text-center text-muted-foreground">Loading chapter progress...</div>
      )}

      {!isLoading && selectedCourse && chartData.length === 0 && (
        <div className="py-8 text-center text-muted-foreground">No chapter progress data for this course.</div>
      )}

      {chartData.length > 0 && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Chapter Completion & Watch Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="aspect-[4/3] w-full sm:aspect-[2/1]">
                <BarChart data={chartData} margin={{ left: 10, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" height={60} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    labelFormatter={(_label, payload) => {
                      const item = payload?.[0]?.payload;
                      return item?.fullName ? `${item.fullName} (${item.learners} learners)` : _label;
                    }}
                  />
                  <Bar dataKey="avgWatchPercent" fill="var(--color-avgWatchPercent)" />
                  <Bar dataKey="completionRate" fill="var(--color-completionRate)" />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Chapter Intro Engagement</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Chapter</TableHead>
                    <TableHead className="text-right">Intro Views</TableHead>
                    <TableHead className="text-right">Intro Plays</TableHead>
                    <TableHead className="text-right">Learners</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(data ?? []).map((row) => (
                    <TableRow key={row.chapterId}>
                      <TableCell className="font-medium">{row.chapterTitle}</TableCell>
                      <TableCell className="text-right">{row.chapterIntroViews}</TableCell>
                      <TableCell className="text-right">{row.chapterIntroVideoPlays}</TableCell>
                      <TableCell className="text-right">{row.totalLearners}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
