import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { fetchVideoTrackingData, fetchAnalyticsCourses } from '@/lib/api/analytics';

const chartConfig = {
  avgWatchPercent: { label: 'Avg Watch %', color: 'hsl(221, 83%, 53%)' },
};

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export default function VideoTrackingTab() {
  const [selectedCourse, setSelectedCourse] = useState<string>('');

  const { data: courses } = useQuery({
    queryKey: ['admin', 'analytics', 'courses'],
    queryFn: fetchAnalyticsCourses,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'analytics', 'video-tracking', selectedCourse],
    queryFn: () => fetchVideoTrackingData(selectedCourse),
    enabled: !!selectedCourse,
  });

  if (courses && courses.length > 0 && !selectedCourse) {
    setSelectedCourse(courses[0].id);
  }

  const chartData = (data ?? []).map((row, i) => ({
    name: `Ch ${i + 1}`,
    fullName: row.chapterTitle,
    avgWatchPercent: row.avgWatchPercent,
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium">Course:</label>
        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
          <SelectTrigger className="w-full max-w-md">
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
        <div className="py-8 text-center text-muted-foreground">Loading video tracking...</div>
      )}

      {!isLoading && selectedCourse && (data ?? []).length === 0 && (
        <div className="py-8 text-center text-muted-foreground">No video tracking data for this course.</div>
      )}

      {chartData.length > 0 && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Video Watch Drop-off by Chapter</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="aspect-[2.5/1] w-full">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    labelFormatter={(_label, payload) => payload?.[0]?.payload?.fullName ?? _label}
                  />
                  <Area
                    type="monotone"
                    dataKey="avgWatchPercent"
                    stroke="var(--color-avgWatchPercent)"
                    fill="var(--color-avgWatchPercent)"
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Chapter Video Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Chapter</TableHead>
                    <TableHead className="text-right">Avg Watch %</TableHead>
                    <TableHead className="text-right">Completion</TableHead>
                    <TableHead className="text-right">Avg Sessions</TableHead>
                    <TableHead className="text-right">Avg Watch Time</TableHead>
                    <TableHead className="text-right">Learners</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(data ?? []).map((row) => (
                    <TableRow key={row.chapterId}>
                      <TableCell className="max-w-[200px] truncate font-medium">{row.chapterTitle}</TableCell>
                      <TableCell className="text-right">{row.avgWatchPercent}%</TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant="outline"
                          className={
                            row.completionRate >= 70
                              ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : row.completionRate >= 40
                              ? 'border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                              : 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400'
                          }
                        >
                          {row.completionRate}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{row.avgSessions}</TableCell>
                      <TableCell className="text-right">{formatTime(row.avgWatchTimeSeconds)}</TableCell>
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
