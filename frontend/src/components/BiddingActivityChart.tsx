import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface BiddingActivityChartProps {
  data: Array<{
    team_name: string;
    total_bids: number;
    players_won: number;
  }>;
}

export default function BiddingActivityChart({ data }: BiddingActivityChartProps) {
  const chartData = data.map(team => ({
    name: team.team_name.length > 15 ? team.team_name.substring(0, 15) + '...' : team.team_name,
    'Total Bids': team.total_bids,
    'Players Won': team.players_won
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="Total Bids" stroke="#3b82f6" strokeWidth={2} />
        <Line type="monotone" dataKey="Players Won" stroke="#22c55e" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}
