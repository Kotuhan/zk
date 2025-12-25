export type ExpenseId =
  | "managers"
  | "marketing"
  | "production"
  | "hardware"
  | "logistics"
  | "installers"
  | "claims";

export type ExpenseMode = "percent" | "amount";

export type ExpenseState = {
  id: ExpenseId;
  label: string;
  mode: ExpenseMode;
  value: number;
};

export type CalculatorState = {
  unitPrice: number;
  quantity: number;
  expenses: Record<ExpenseId, ExpenseState>;
};

export type ComputedExpense = {
  id: ExpenseId;
  label: string;
  base: number;
  percent: number;
  amount: number;
  remainingAfter: number;
};

export type ComputationResult = {
  revenue: number;
  rows: ComputedExpense[];
  totalExpensesAmount: number;
  totalExpensesPercent: number;
  profitAmount: number;
  profitPercent: number;
};

export type Project = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  state: CalculatorState;
};

export type ProjectListItem = {
  id: string;
  name: string;
  revenue: number;
  profit: number;
  profitPercent: number;
  updatedAt: string;
};
