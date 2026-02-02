import { BaseModel } from "./BaseModel";

export class BudgetModel extends BaseModel {
  constructor() {
    super("budgets");
  }

  async getByTourId(tourId: number) {
    return this.findOne({ tour_id: tourId });
  }

  async createBudget(data: {
    tour_id: number;
    total_amount: number;
    per_participant_fee?: number;
    currency?: string;
    description?: string;
  }) {
    return this.create(data);
  }

  async updateSpentAmount(tourId: number, amount: number) {
    const budget = await this.getByTourId(tourId);
    if (!budget) return null;

    const newSpent = (budget.spent_amount || 0) + amount;
    return this.updateById(budget.id, { spent_amount: newSpent });
  }
}

export const Budget = new BudgetModel();

export class ExpenseModel extends BaseModel {
  constructor() {
    super("expenses");
  }

  async getByTourId(tourId: number) {
    return this.findAll({ tour_id: tourId }, "created_at DESC");
  }

  async createExpense(data: {
    tour_id: number;
    amount: number;
    category: string;
    description?: string;
  }) {
    return this.create(data);
  }
}

export const Expense = new ExpenseModel();
