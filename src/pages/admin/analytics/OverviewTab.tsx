import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Users, TrendingUp, Clock, Activity } from '@/lib/icons';
import { fetchAnalyticsOverview } from '@/lib/api/analytics';
import type { AnalyticsOverview } from '@/types/analytics';

const COLORS = {
  completed: 'hsl(150, 100%, 50%)',
  inProgress: 'hsl(45, 100%, 55%)',
  notStarted: 'hsl(280, 80%, 65%)',
};

const pieChartConfig = {
  completed: { label: 'Completed', color: COLORS.completed },
  inProgress: { label: 'In Progress', color: COLORS.inProgress },
  notStarted: { label: 'Not Started', color: COLORS.notStarted },
};

const trendChartConfig = {
  enrollments: { label: 'Enrollments', color: 'hsl(195, 100%, 55%)' },
};

export default function OverviewTab() {
  const { data, isLoading } = useQuery<AnalyticsOverview>({
    queryKey: ['admin', 'analytics', 'overview'],
    queryFn: fetchAnalyticsOverview,
  });

  if (isLoading) {
    return <div className="py-8 text-center text-muted-foreground">Loading overview...</div>;
  }

  if (!data) return null;

  const kpis = [
    { label: 'Total Learners', value: data.totalLearners, icon: Users },
    { label: 'Avg Completion', value: `${data.avgCompletionRate}%`, icon: TrendingUp },
    { label: 'Avg Watch Time', value: `${data.avgWatchTimeMinutes}m`, icon: Clock },
    { label: 'Active (7d)', value: data.activeLearners7d, icon: Activity },
  ];

  const pieData = [
    { name: 'completed', value: data.completionDistribution.completed },
    { name: 'inProgress', value: data.completionDistribution.inProgress },
    { name: 'notStarted', value: data.completionDistribution.notStarted },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="flex items-center gap-3 p-4 sm:pt-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-primary/10">
                <kpi.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{kpi.label}</p>
                <p className="text-xl font-bold">{kpi.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Enrollment Trend (30 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={trendChartConfig} className="aspect-[2/1] w-full">
              <AreaChart data={data.recentTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  tick={{ fontSize: 11 }}
                />
                <YAxis tick={{ fontSize: 11 }} />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  labelFormatter={(d) => new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                />
                <Area
                  type="monotone"
                  dataKey="enrollments"
                  stroke="var(--color-enrollments)"
                  fill="var(--color-enrollments)"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Completion Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={pieChartConfig} className="aspect-[2/1] w-full">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius="40%"
                  outerRadius="70%"
                  dataKey="value"
                  nameKey="name"
                >
                  {pieData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={COLORS[entry.name as keyof typeof COLORS]}
                    />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
            <div className="mt-2 flex justify-center gap-4 text-xs">
              {pieData.map((entry) => (
                <div key={entry.name} className="flex items-center gap-1.5">
                  <div
                    className="h-2.5 w-2.5"
                    style={{ backgroundColor: COLORS[entry.name as keyof typeof COLORS] }}
                  />
                  <span className="text-muted-foreground">
                    {pieChartConfig[entry.name as keyof typeof pieChartConfig]?.label}: {entry.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
