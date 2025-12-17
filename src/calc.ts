import type {
  CalculatorState,
  ComputationResult,
  ExpenseId,
  ExpenseState,
} from "./types";

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const safeNumber = (value: number) => (Number.isFinite(value) ? value : 0);

const computeExpense = (base: number, expense: ExpenseState) => {
  const safeBase = Math.max(0, safeNumber(base));

  if (expense.mode === "percent") {
    const percent = clamp(safeNumber(expense.value), 0, 1);
    return {
      percent,
      amount: safeBase * percent,
    };
  }

  const amount = Math.max(0, safeNumber(expense.value));
  return {
    amount,
    percent: safeBase === 0 ? 0 : amount / safeBase,
  };
};

export const computeAll = (state: CalculatorState): ComputationResult => {
  const revenue =
    Math.max(0, safeNumber(state.unitPrice)) *
    Math.max(0, safeNumber(state.quantity));

  // Логістика - перша, від загальної суми
  const logistics = computeExpense(revenue, state.expenses.logistics);
  const afterLogistics = revenue - logistics.amount;

  // Менеджери - від залишку після логістики
  const managers = computeExpense(afterLogistics, state.expenses.managers);
  const afterManagers = afterLogistics - managers.amount;

  // Маркетинг - від залишку після менеджерів
  const marketing = computeExpense(afterManagers, state.expenses.marketing);
  const afterMarketing = afterManagers - marketing.amount;

  // Решта витрат - від загальної суми (revenue)
  const production = computeExpense(revenue, state.expenses.production);
  const afterProduction = afterMarketing - production.amount;

  const hardware = computeExpense(revenue, state.expenses.hardware);
  const afterHardware = afterProduction - hardware.amount;

  const installers = computeExpense(revenue, state.expenses.installers);
  const afterInstallers = afterHardware - installers.amount;

  const claims = computeExpense(revenue, state.expenses.claims);
  const afterClaims = afterInstallers - claims.amount;

  const rows = [
    {
      id: "managers" as const,
      label: state.expenses.managers.label,
      base: revenue,
      ...managers,
      remainingAfter: afterManagers,
    },
    {
      id: "marketing" as const,
      label: state.expenses.marketing.label,
      base: afterManagers,
      ...marketing,
      remainingAfter: afterMarketing,
    },
    {
      id: "production" as const,
      label: state.expenses.production.label,
      base: revenue,
      ...production,
      remainingAfter: afterProduction,
    },
    {
      id: "hardware" as const,
      label: state.expenses.hardware.label,
      base: revenue,
      ...hardware,
      remainingAfter: afterHardware,
    },
    {
      id: "logistics" as const,
      label: state.expenses.logistics.label,
      base: revenue,
      ...logistics,
      remainingAfter: afterLogistics,
    },
    {
      id: "installers" as const,
      label: state.expenses.installers.label,
      base: revenue,
      ...installers,
      remainingAfter: afterInstallers,
    },
    {
      id: "claims" as const,
      label: state.expenses.claims.label,
      base: revenue,
      ...claims,
      remainingAfter: afterClaims,
    },
  ];

  const totalExpensesAmount = rows.reduce((sum, row) => sum + row.amount, 0);
  const totalExpensesPercent =
    revenue === 0 ? 0 : totalExpensesAmount / revenue;
  const profitAmount = revenue - totalExpensesAmount;
  const profitPercent = revenue === 0 ? 0 : profitAmount / revenue;

  return {
    revenue,
    rows,
    totalExpensesAmount,
    totalExpensesPercent,
    profitAmount,
    profitPercent,
  };
};

export const setExpensePercent = (
  prev: CalculatorState,
  id: ExpenseId,
  percent01: number
): CalculatorState => ({
  ...prev,
  expenses: {
    ...prev.expenses,
    [id]: {
      ...prev.expenses[id],
      mode: "percent",
      value: clamp(safeNumber(percent01), 0, 1),
    },
  },
});

export const setExpenseAmount = (
  prev: CalculatorState,
  id: ExpenseId,
  amount: number
): CalculatorState => ({
  ...prev,
  expenses: {
    ...prev.expenses,
    [id]: {
      ...prev.expenses[id],
      mode: "amount",
      value: Math.max(0, safeNumber(amount)),
    },
  },
});
