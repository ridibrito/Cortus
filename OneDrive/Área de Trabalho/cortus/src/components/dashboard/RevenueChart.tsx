"use client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface RevenueChartProps {
  data?: Array<{ month: string; receita: number }>;
}

const defaultData = [
  { month: 'Jan', receita: 0 },
  { month: 'Fev', receita: 0 },
  { month: 'Mar', receita: 0 },
  { month: 'Abr', receita: 0 },
  { month: 'Mai', receita: 0 },
  { month: 'Jun', receita: 0 },
];

export default function RevenueChart({ data = defaultData }: RevenueChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
        <XAxis 
          dataKey="month" 
          className="text-xs text-gray-600 dark:text-gray-400"
          tick={{ fill: 'currentColor' }}
        />
        <YAxis 
          className="text-xs text-gray-600 dark:text-gray-400"
          tick={{ fill: 'currentColor' }}
          tickFormatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: 'var(--tw-color-gray-800)',
            border: '1px solid var(--tw-color-gray-700)',
            borderRadius: '0.5rem',
          }}
          labelStyle={{ color: 'var(--tw-color-gray-300)' }}
          formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR')}`}
        />
        <Legend />
        <Bar 
          dataKey="receita" 
          fill="#10b981" 
          name="Receita"
          radius={[8, 8, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

