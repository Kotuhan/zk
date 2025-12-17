import {
  CalculatorState,
  CalculationResult,
  Expense,
} from "./types/calculator";

export const calculateResults = (state: CalculatorState): CalculationResult => {
  const totalRevenue = state.price * state.quantity;

  // 1. Менеджери - від загальної суми
  const managersAmount = state.expenses.managers.isPercentageBased
    ? (totalRevenue * state.expenses.managers.percentage) / 100
    : state.expenses.managers.amount;

  const remainingAfterManagers = totalRevenue - managersAmount;

  // 2. Маркетинг - від суми після менеджерів
  const marketingAmount = state.expenses.marketing.isPercentageBased
    ? (remainingAfterManagers * state.expenses.marketing.percentage) / 100
    : state.expenses.marketing.amount;

  // 3. Решта витрат - від загальної суми
  const productionAmount = state.expenses.production.isPercentageBased
    ? (totalRevenue * state.expenses.production.percentage) / 100
    : state.expenses.production.amount;

  const hardwareAmount = state.expenses.hardware.isPercentageBased
    ? (totalRevenue * state.expenses.hardware.percentage) / 100
    : state.expenses.hardware.amount;

  const logisticsAmount = state.expenses.logistics.isPercentageBased
    ? (totalRevenue * state.expenses.logistics.percentage) / 100
    : state.expenses.logistics.amount;

  const complaintsAmount = state.expenses.complaints.isPercentageBased
    ? (totalRevenue * state.expenses.complaints.percentage) / 100
    : state.expenses.complaints.amount;

  // Загальні витрати
  const totalExpenses =
    managersAmount +
    marketingAmount +
    productionAmount +
    hardwareAmount +
    logisticsAmount +
    complaintsAmount;

  const profit = totalRevenue - totalExpenses;
  const totalExpensesPercentage =
    totalRevenue > 0 ? (totalExpenses / totalRevenue) * 100 : 0;
  const profitPercentage = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

  return {
    totalRevenue,
    totalExpenses,
    totalExpensesPercentage,
    profit,
    profitPercentage,
    remainingAfterManagers,
  };
};

export const updateExpenseByPercentage = (
  expense: Expense,
  percentage: number,
  baseAmount: number
): Expense => {
  return {
    ...expense,
    percentage,
    amount: (baseAmount * percentage) / 100,
    isPercentageBased: true,
  };
};

export const updateExpenseByAmount = (
  expense: Expense,
  amount: number,
  baseAmount: number
): Expense => {
  return {
    ...expense,
    percentage: baseAmount > 0 ? (amount / baseAmount) * 100 : 0,
    amount,
    isPercentageBased: false,
  };
};
