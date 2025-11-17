import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SpendingChartProps {
  data: Array<{
    team_name: string;
    spent: number;
    remaining_budget: number;
  }>;
}

export default function SpendingChart({ data }: SpendingChartProps) {
  const chartData = data.map(team => ({
    name: team.team_name.length > 15 ? team.team_name.substring(0, 15) + '...' : team.team_name,
    Spent: team.spent,
    Remaining: team.remaining_budget
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
        <YAxis />
        <Tooltip formatter={(value) => `₹${Number(value).toLocaleString()}`} />
        <Legend />
        <Bar dataKey="Spent" fill="#ef4444" />
        <Bar dataKey="Remaining" fill="#22c55e" />
      </BarChart>
    </ResponsiveContainer>
  );
}
