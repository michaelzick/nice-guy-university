import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { fetchCourseCompletionData } from '@/lib/api/analytics';

const chartConfig = {
  completed: { label: 'Completed', color: 'hsl(142, 76%, 36%)' },
  inProgress: { label: 'In Progress', color: 'hsl(48, 96%, 53%)' },
  notStarted: { label: 'Not Started', color: 'hsl(0, 0%, 63%)' },
};

function truncateTitle(title: string, maxLen = 30) {
  return title.length > maxLen ? title.slice(0, maxLen) + '...' : title;
}

export default function CourseCompletionTab() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'analytics', 'course-completion'],
    queryFn: fetchCourseCompletionData,
  });

  if (isLoading) {
    return <div className="py-8 text-center text-muted-foreground">Loading course completion data...</div>;
  }

  if (!data || data.length === 0) {
    return <div className="py-8 text-center text-muted-foreground">No completion data available.</div>;
  }

  const chartData = data.map((row) => ({
    name: truncateTitle(row.courseTitle),
    fullName: row.courseTitle,
    completed: row.completed,
    inProgress: row.inProgress,
    notStarted: row.notStarted,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Course Completion by Status</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="w-full"
          style={{ aspectRatio: `${Math.max(2, chartData.length * 0.5)} / 1`, minHeight: chartData.length * 50 + 80 }}
        >
          <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis
              type="category"
              dataKey="name"
              width={180}
              tick={{ fontSize: 11 }}
            />
            <ChartTooltip
              content={<ChartTooltipContent />}
              labelFormatter={(_label, payload) => {
                const item = payload?.[0]?.payload;
                return item?.fullName ?? _label;
              }}
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="completed" stackId="status" fill="var(--color-completed)" />
            <Bar dataKey="inProgress" stackId="status" fill="var(--color-inProgress)" />
            <Bar dataKey="notStarted" stackId="status" fill="var(--color-notStarted)" />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
