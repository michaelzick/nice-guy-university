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
  avgWatchPercent: { label: 'Avg Watch %', color: 'hsl(195, 100%, 55%)' },
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
              <ChartContainer config={chartConfig} className="aspect-[4/3] w-full sm:aspect-[2.5/1]">
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
                    <TableHead className="hidden text-right sm:table-cell">Avg Sessions</TableHead>
                    <TableHead className="hidden text-right sm:table-cell">Avg Watch Time</TableHead>
                    <TableHead className="text-right">Intro Views</TableHead>
                    <TableHead className="text-right">Intro Plays</TableHead>
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
                              ? 'border-emerald-300 bg-emerald-50 text-emerald-600 dark:border-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300'
                              : row.completionRate >= 40
                              ? 'border-amber-300 bg-amber-50 text-amber-600 dark:border-amber-600 dark:bg-amber-900/30 dark:text-amber-300'
                              : 'border-[hsl(var(--ngu-orange)/0.4)] text-[hsl(var(--ngu-orange))] dark:border-[hsl(var(--ngu-orange)/0.55)] dark:text-[hsl(var(--ngu-orange))]'
                          }
                        >
                          {row.completionRate}%
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden text-right sm:table-cell">{row.avgSessions}</TableCell>
                      <TableCell className="hidden text-right sm:table-cell">{formatTime(row.avgWatchTimeSeconds)}</TableCell>
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
