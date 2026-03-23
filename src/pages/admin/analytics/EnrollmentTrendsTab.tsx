import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { AreaChart, Area, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { fetchEnrollmentTrends } from '@/lib/api/analytics';

const chartConfig = {
  newEnrollments: { label: 'New Enrollments', color: 'hsl(221, 83%, 53%)' },
  cumulativeEnrollments: { label: 'Cumulative', color: 'hsl(262, 83%, 58%)' },
};

export default function EnrollmentTrendsTab() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'analytics', 'enrollment-trends'],
    queryFn: fetchEnrollmentTrends,
  });

  if (isLoading) {
    return <div className="py-8 text-center text-muted-foreground">Loading enrollment trends...</div>;
  }

  if (!data || data.length === 0) {
    return <div className="py-8 text-center text-muted-foreground">No enrollment trend data available.</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Daily New Enrollments</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="aspect-[3/1] w-full">
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                tick={{ fontSize: 10 }}
                interval={13}
              />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
              <ChartTooltip
                content={<ChartTooltipContent />}
                labelFormatter={(d) => new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="newEnrollments"
                stroke="var(--color-newEnrollments)"
                fill="var(--color-newEnrollments)"
                fillOpacity={0.15}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="cumulativeEnrollments"
                stroke="var(--color-cumulativeEnrollments)"
                strokeWidth={2}
                dot={false}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Enrollments</p>
            <p className="text-xl font-bold">{data[data.length - 1]?.cumulativeEnrollments ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Last 7 Days</p>
            <p className="text-xl font-bold">
              {data.slice(-7).reduce((s, d) => s + d.newEnrollments, 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Last 30 Days</p>
            <p className="text-xl font-bold">
              {data.slice(-30).reduce((s, d) => s + d.newEnrollments, 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Daily Average</p>
            <p className="text-xl font-bold">
              {data.length > 0 ? (data.reduce((s, d) => s + d.newEnrollments, 0) / data.length).toFixed(1) : 0}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
