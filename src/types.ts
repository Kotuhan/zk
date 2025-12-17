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
