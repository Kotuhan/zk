export interface Expense {
  id: string;
  name: string;
  percentage: number; // 0-100
  amount: number; // номінальна сума в грн
  isPercentageBased: boolean; // чи це відсоток чи фіксована сума
}

export interface CalculatorState {
  price: number; // ціна однієї перегородки
  quantity: number; // кількість перегородок
  expenses: {
    managers: Expense;
    marketing: Expense;
    production: Expense;
    hardware: Expense; // фурнітура
    logistics: Expense;
    complaints: Expense; // рекламації
  };
}

export interface CalculationResult {
  totalRevenue: number; // загальна виручка
  totalExpenses: number; // загальні витрати
  totalExpensesPercentage: number; // % витрат
  profit: number; // прибуток
  profitPercentage: number; // % прибутку
  remainingAfterManagers: number; // залишок після менеджерів (для маркетингу)
}
