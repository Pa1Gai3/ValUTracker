import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { BudgetCategory } from '../types';

interface ChartProps {
  categories: BudgetCategory[];
}

const COLORS = {
  income: '#4ADE80', // Green
  bill: '#818CF8',   // Indigo
  expense: '#F87171', // Red
  savings: '#34D399', // Emerald
  debt: '#FCD34D',    // Amber
};

export const AllocationPieChart: React.FC<ChartProps> = ({ categories }) => {
  const data = categories.reduce((acc: any[], cat) => {
    if (cat.type === 'income') return acc;
    const existing = acc.find(item => item.name === cat.type);
    if (existing) {
      existing.value += cat.budgetedAmount;
    } else {
      acc.push({ name: cat.type, value: cat.budgetedAmount });
    }
    return acc;
  }, []);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
          stroke="none"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
          ))}
        </Pie>
        <Tooltip 
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '10px', fontSize: '12px', fontWeight: 600 }}
            formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export const CashFlowBarChart: React.FC<ChartProps> = ({ categories }) => {
  const data = [
    'income', 'bill', 'expense'
  ].map(type => {
    const items = categories.filter(c => c.type === type);
    const actual = items.reduce((sum, c) => sum + c.spentAmount, 0);
    return {
      name: type.charAt(0).toUpperCase() + type.slice(1),
      Actual: actual,
    };
  });

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }} barSize={20}>
        <XAxis type="number" hide />
        <YAxis dataKey="name" type="category" width={60} tick={{fontSize: 11, fontWeight: 600, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
        <Tooltip 
            cursor={{fill: 'transparent'}}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
            formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`}
        />
        <Bar dataKey="Actual" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.name === 'Income' ? '#4ADE80' : entry.name === 'Bill' ? '#818CF8' : '#F87171'} />
            ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export const SpendLeftDonut: React.FC<{ totalBudget: number, totalSpent: number }> = ({ totalBudget, totalSpent }) => {
  const remaining = Math.max(0, totalBudget - totalSpent);
  const data = [
    { name: 'Spent', value: totalSpent },
    { name: 'Left', value: remaining },
  ];

  return (
    <div className="relative h-full w-full flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
        <PieChart>
            <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            startAngle={90}
            endAngle={-270}
            dataKey="value"
            stroke="none"
            paddingAngle={2}
            >
            <Cell fill="#EF4444" /> {/* Spent (Red) */}
            <Cell fill="#F3F4F6" /> {/* Left (Gray) */}
            </Pie>
            <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`}
            />
        </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Left</span>
            <span className="text-xl font-extrabold text-gray-800">₹{remaining.toLocaleString('en-IN')}</span>
        </div>
    </div>
  );
};