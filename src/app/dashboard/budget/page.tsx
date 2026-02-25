"use client";

import { useState, useEffect } from "react";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Plus,
  PieChart,
  DollarSign,
  Receipt,
  Loader2,
  Filter,
  Search,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { BackButton } from "@/components/BackButton";
import { tourApi, api } from "@/lib/api";
import type { TourData } from "@/lib/api";
import type { Tour } from "@/types";
import { useAuth } from "@/context/AuthContext";

interface BudgetExpense {
  id: number;
  tour_id: number;
  category: string;
  description: string;
  amount: string;
  created_at: string;
}

export default function BudgetPage() {
  const { user } = useAuth();
  const [tours, setTours] = useState<TourData[]>([]);
  const [selectedTourId, setSelectedTourId] = useState<number>(0);
  const [selectedTour, setSelectedTour] = useState<TourData | null>(null);
  const [expenses, setExpenses] = useState<BudgetExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [newExpense, setNewExpense] = useState({
    amount: "",
    category: "MISC",
    description: "",
  });

  // Check if user can manage expenses (admin or guide only)
  const canManageExpenses = user?.role === "admin" || user?.role === "guide";

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const result = await tourApi.getAll();
        if (result.success && result.data) {
          setTours(result.data);
          if (result.data.length > 0) {
            setSelectedTourId(result.data[0].id);
          }
        }
      } catch (error) {
        console.error("Error fetching tours:", error);
      }
    };
    fetchTours();
  }, []);

  useEffect(() => {
    if (!selectedTourId) return;

    const fetchTourBudgetData = async () => {
      setLoading(true);

      // Fetch selected tour details
      const tour = tours.find((t) => t.id === selectedTourId) ?? null;
      setSelectedTour(tour);

      try {
        // Fetch expenses
        const result = await api.get<BudgetExpense[]>(`/expenses?tour_id=${selectedTourId}`);
        if (result.success && result.data) {
          setExpenses(result.data);
        }
      } catch (error) {
        console.error("Error fetching expenses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTourBudgetData();
  }, [selectedTourId, tours]);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const result = await api.post<BudgetExpense>("/expenses", {
        tour_id: selectedTourId,
        amount: parseFloat(newExpense.amount),
        category: newExpense.category,
        description: newExpense.description,
      });

      if (result.success && result.data) {
        setExpenses([result.data, ...expenses]);
        setIsAddingExpense(false);
        setNewExpense({ amount: "", category: "MISC", description: "" });
      }
    } catch (error) {
      console.error("Error adding expense:", error);
    }
  };

  const totalFunds = selectedTour
    ? parseFloat(String(selectedTour.price) || "0") * (selectedTour.participant_count || 1)
    : 0;
  const totalSpent = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
  const remaining = totalFunds - totalSpent;
  const spentPercentage = totalFunds > 0 ? (totalSpent / totalFunds) * 100 : 0;

  const categoryTotals = expenses.reduce((acc: Record<string, number>, e) => {
    acc[e.category] = (acc[e.category] || 0) + parseFloat(e.amount);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Budget Management</h2>
          <p className="text-slate-500">Track real-time spending and remaining buffers.</p>
        </div>
        <div className="flex gap-2">
          <select
            value={selectedTourId}
            onChange={(e) => setSelectedTourId(parseInt(e.target.value))}
            className="input"
          >
            {tours.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          {canManageExpenses && (
            <button onClick={() => setIsAddingExpense(true)} className="btn-primary">
              <Plus className="mr-2 h-4 w-4" /> Add Expense
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-400 uppercase">Total Budget</p>
                <div className="p-2 bg-primary-50 rounded-lg">
                  <Wallet className="h-4 w-4 text-primary" />
                </div>
              </div>
              <p className="text-3xl font-black text-slate-800">₹{totalFunds.toLocaleString()}</p>
              <p className="text-xs text-slate-500 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                Base: ₹
                {(
                  parseFloat(String(selectedTour?.price) || "0") *
                  (selectedTour?.participant_count || 1)
                ).toLocaleString()}
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-400 uppercase">Spent Amount</p>
                <div className="p-2 bg-red-50 rounded-lg">
                  <ArrowUpRight className="h-4 w-4 text-red-600" />
                </div>
              </div>
              <p className="text-3xl font-black text-slate-800">₹{totalSpent.toLocaleString()}</p>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
                <div
                  className="bg-red-500 h-full transition-all"
                  style={{ width: `${Math.min(spentPercentage, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-slate-500">{spentPercentage.toFixed(1)}% utilization</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-400 uppercase">Remaining</p>
                <div className="p-2 bg-green-50 rounded-lg">
                  <PieChart className="h-4 w-4 text-green-600" />
                </div>
              </div>
              <p className="text-3xl font-black text-slate-800">₹{remaining.toLocaleString()}</p>
              <p
                className={`text-xs font-bold ${remaining < 0 ? "text-red-500" : "text-green-500"}`}
              >
                {remaining < 0 ? "Budget Overrun!" : "Under Budget"}
              </p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-4">By Category</h3>
                <div className="space-y-4">
                  {["TRANSPORT", "ACCOMMODATION", "FOOD", "MISC"].map((cat) => {
                    const amount = categoryTotals[cat] || 0;
                    const pct = totalSpent > 0 ? (amount / totalSpent) * 100 : 0;
                    return (
                      <div key={cat} className="space-y-1">
                        <div className="flex justify-between text-xs font-bold text-slate-500 uppercase">
                          <span>{cat}</span>
                          <span>
                            ₹{amount.toLocaleString()} ({pct.toFixed(0)}%)
                          </span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              cat === "TRANSPORT"
                                ? "bg-primary"
                                : cat === "ACCOMMODATION"
                                  ? "bg-purple-500"
                                  : cat === "FOOD"
                                    ? "bg-orange-500"
                                    : "bg-slate-500"
                            }`}
                            style={{ width: `${pct}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-bold text-slate-800">Expense History</h3>
                </div>
                <div className="divide-y divide-slate-100">
                  {expenses.length === 0 ? (
                    <div className="p-10 text-center text-slate-400">
                      <Receipt className="h-10 w-10 mx-auto mb-2 opacity-20" />
                      <p>No expenses logged for this tour yet.</p>
                    </div>
                  ) : (
                    expenses.map((expense) => (
                      <div
                        key={expense.id}
                        className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div
                            className={`p-2 rounded-xl ${
                              expense.category === "TRANSPORT"
                                ? "bg-primary-50 text-primary-600"
                                : expense.category === "ACCOMMODATION"
                                  ? "bg-purple-50 text-purple-600"
                                  : expense.category === "FOOD"
                                    ? "bg-orange-50 text-orange-600"
                                    : "bg-slate-50 text-slate-600"
                            }`}
                          >
                            <DollarSign className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{expense.description}</p>
                            <p className="text-xs text-slate-500 uppercase font-semibold">
                              {expense.category} •{" "}
                              {new Date(expense.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <p className="text-lg font-black text-slate-800">
                          ₹{parseFloat(expense.amount).toLocaleString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal for adding expense - only show for admin/guide */}
      {canManageExpenses && isAddingExpense && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b bg-slate-50">
              <h3 className="text-xl font-bold text-slate-800">Add New Expense</h3>
              <p className="text-sm text-slate-500">Log a new spending for {selectedTour?.name}</p>
            </div>
            <form onSubmit={handleAddExpense} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  className="input"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Category</label>
                <select
                  className="input"
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                >
                  <option value="TRANSPORT">Transport</option>
                  <option value="ACCOMMODATION">Accommodation</option>
                  <option value="FOOD">Food</option>
                  <option value="MISC">Miscellaneous</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  required
                  className="input min-h-[100px]"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                  placeholder="What was this expense for?"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingExpense(false)}
                  className="flex-1 px-4 py-2 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-all"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
