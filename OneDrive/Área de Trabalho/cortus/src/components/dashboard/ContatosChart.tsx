"use client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ContatosChartProps {
  data?: Array<{ month: string; contatos: number }>;
}

const defaultData = [
  { month: 'Jan', contatos: 0 },
  { month: 'Fev', contatos: 0 },
  { month: 'Mar', contatos: 0 },
  { month: 'Abr', contatos: 0 },
  { month: 'Mai', contatos: 0 },
  { month: 'Jun', contatos: 0 },
];

export default function ContatosChart({ data = defaultData }: ContatosChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
        <XAxis 
          dataKey="month" 
          className="text-xs text-gray-600 dark:text-gray-400"
          tick={{ fill: 'currentColor' }}
        />
        <YAxis 
          className="text-xs text-gray-600 dark:text-gray-400"
          tick={{ fill: 'currentColor' }}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: 'var(--tw-color-gray-800)',
            border: '1px solid var(--tw-color-gray-700)',
            borderRadius: '0.5rem',
          }}
          labelStyle={{ color: 'var(--tw-color-gray-300)' }}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="contatos" 
          stroke="#3b82f6" 
          strokeWidth={2}
          name="Contatos"
          dot={{ fill: '#3b82f6', r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

