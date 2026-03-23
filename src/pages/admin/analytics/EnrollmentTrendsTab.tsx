import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { AreaChart, Area, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Users, Activity, Calendar, TrendingUp } from '@/lib/icons';
import { fetchEnrollmentTrends } from '@/lib/api/analytics';

const chartConfig = {
  newEnrollments: { label: 'New Enrollments', color: 'hsl(195, 100%, 55%)' },
  cumulativeEnrollments: { label: 'Cumulative', color: 'hsl(320, 100%, 60%)' },
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
          <ChartContainer config={chartConfig} className="aspect-[4/3] sm:aspect-[2/1] lg:aspect-[3/1] w-full">
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                tick={{ fontSize: 11 }}
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

      <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
        {[
          { label: 'Total Enrollments', value: data[data.length - 1]?.cumulativeEnrollments ?? 0, icon: Users },
          { label: 'Last 7 Days', value: data.slice(-7).reduce((s, d) => s + d.newEnrollments, 0), icon: Activity },
          { label: 'Last 30 Days', value: data.slice(-30).reduce((s, d) => s + d.newEnrollments, 0), icon: Calendar },
          { label: 'Daily Average', value: data.length > 0 ? (data.reduce((s, d) => s + d.newEnrollments, 0) / data.length).toFixed(1) : 0, icon: TrendingUp },
        ].map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="flex items-center gap-3 p-4 sm:p-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-primary/10">
                <kpi.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">{kpi.label}</p>
                <p className="text-xl sm:text-2xl font-bold">{kpi.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
