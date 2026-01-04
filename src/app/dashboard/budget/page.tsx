'use client';

import { useState } from 'react';
import { Wallet, TrendingUp, TrendingDown, Plus, PieChart, DollarSign } from 'lucide-react';
import { BackButton } from '@/components/BackButton';

const mockExpenses = [
  { id: 1, category: 'transport', amount: 12500, description: 'Bus rental for Day 1-3', date: '2026-01-01' },
  { id: 2, category: 'accommodation', amount: 45000, description: 'Hotel stay (45 participants)', date: '2026-01-02' },
  { id: 3, category: 'food', amount: 8500, description: 'Lunch at Bangalore Highway', date: '2026-01-03' },
  { id: 4, category: 'miscellaneous', amount: 2000, description: 'Entry fees for Park', date: '2026-01-03' },
];

export default function BudgetPage() {
  return (
    <div className="space-y-6">
      <BackButton />
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Budget & Funds</h2>
          <p className="text-slate-500">Track tour expenses and fund utilization.</p>
        </div>
        <button className="btn-primary flex items-center bg-blue-600">
          <Plus className="mr-2 h-4 w-4" /> Add Expense
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="card space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Total Budget</p>
            <Wallet className="h-4 w-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">₹ 2,50,000</p>
          <div className="flex items-center text-xs text-slate-500">
            <span className="text-green-600 font-medium flex items-center mr-1">
              <TrendingUp className="h-3 w-3 mr-0.5" /> 100%
            </span>
            funded from student fees
          </div>
        </div>
        <div className="card space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Spent Amount</p>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">₹ 68,000</p>
          <div className="flex items-center text-xs text-slate-500">
            <span className="text-red-600 font-medium flex items-center mr-1">
              27.2%
            </span>
            of total budget used
          </div>
        </div>
        <div className="card space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Remaining Buffer</p>
            <PieChart className="h-4 w-4 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">₹ 1,82,000</p>
          <div className="flex items-center text-xs text-slate-500">
            On track for remaining 3 days
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card space-y-4">
          <h3 className="text-lg font-semibold">Expense Categorization</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Accommodation</span>
                <span className="font-medium">₹ 45,000 (66%)</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 w-[66%]"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Transport</span>
                <span className="font-medium">₹ 12,500 (18%)</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-600 w-[18%]"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Food & Drinks</span>
                <span className="font-medium">₹ 8,500 (12%)</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-orange-600 w-[12%]"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="card space-y-4">
          <h3 className="text-lg font-semibold">Recent Transactions</h3>
          <div className="space-y-4">
            {mockExpenses.map((expense) => (
              <div key={expense.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                <div className="flex items-center space-x-3">
                  <div className="rounded-md bg-slate-100 p-2">
                    <DollarSign className="h-4 w-4 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{expense.description}</p>
                    <p className="text-xs text-slate-500 uppercase">{expense.category} • {expense.date}</p>
                  </div>
                </div>
                <p className="font-bold text-slate-900">₹ {expense.amount.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
