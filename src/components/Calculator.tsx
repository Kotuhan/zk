import React, { useState, useMemo } from "react";
import { CalculatorState } from "../types/calculator";
import {
  calculateResults,
  updateExpenseByPercentage,
  updateExpenseByAmount,
} from "../utils/calculations";
import { ExpenseRow } from "./ExpenseRow";

const initialState: CalculatorState = {
  price: 120000,
  quantity: 1,
  expenses: {
    managers: {
      id: "managers",
      name: "Менеджери",
      percentage: 10,
      amount: 12000,
      isPercentageBased: true,
    },
    marketing: {
      id: "marketing",
      name: "Маркетинг",
      percentage: 0,
      amount: 0,
      isPercentageBased: true,
    },
    production: {
      id: "production",
      name: "Виробництво",
      percentage: 54,
      amount: 55200,
      isPercentageBased: true,
    },
    hardware: {
      id: "hardware",
      name: "Фурнітура",
      percentage: 1.67,
      amount: 2000,
      isPercentageBased: true,
    },
    logistics: {
      id: "logistics",
      name: "Логістика",
      percentage: 1.67,
      amount: 2000,
      isPercentageBased: true,
    },
    complaints: {
      id: "complaints",
      name: "Рекламації",
      percentage: 2,
      amount: 2400,
      isPercentageBased: true,
    },
  },
};

export const Calculator: React.FC = () => {
  const [state, setState] = useState<CalculatorState>(initialState);

  const totalRevenue = state.price * state.quantity;
  const results = useMemo(() => calculateResults(state), [state]);

  const handlePriceChange = (price: number) => {
    setState((prev) => {
      const newState = { ...prev, price };
      const newTotalRevenue = price * prev.quantity;

      // Перераховуємо всі витрати на основі нового totalRevenue
      return {
        ...newState,
        expenses: {
          managers: updateExpenseByPercentage(
            prev.expenses.managers,
            prev.expenses.managers.percentage,
            newTotalRevenue
          ),
          marketing: updateExpenseByPercentage(
            prev.expenses.marketing,
            prev.expenses.marketing.percentage,
            newTotalRevenue -
              (newTotalRevenue * prev.expenses.managers.percentage) / 100
          ),
          production: updateExpenseByPercentage(
            prev.expenses.production,
            prev.expenses.production.percentage,
            newTotalRevenue
          ),
          hardware: updateExpenseByPercentage(
            prev.expenses.hardware,
            prev.expenses.hardware.percentage,
            newTotalRevenue
          ),
          logistics: updateExpenseByPercentage(
            prev.expenses.logistics,
            prev.expenses.logistics.percentage,
            newTotalRevenue
          ),
          complaints: updateExpenseByPercentage(
            prev.expenses.complaints,
            prev.expenses.complaints.percentage,
            newTotalRevenue
          ),
        },
      };
    });
  };

  const handleQuantityChange = (quantity: number) => {
    setState((prev) => {
      const newState = { ...prev, quantity };
      const newTotalRevenue = prev.price * quantity;

      return {
        ...newState,
        expenses: {
          managers: updateExpenseByPercentage(
            prev.expenses.managers,
            prev.expenses.managers.percentage,
            newTotalRevenue
          ),
          marketing: updateExpenseByPercentage(
            prev.expenses.marketing,
            prev.expenses.marketing.percentage,
            newTotalRevenue -
              (newTotalRevenue * prev.expenses.managers.percentage) / 100
          ),
          production: updateExpenseByPercentage(
            prev.expenses.production,
            prev.expenses.production.percentage,
            newTotalRevenue
          ),
          hardware: updateExpenseByPercentage(
            prev.expenses.hardware,
            prev.expenses.hardware.percentage,
            newTotalRevenue
          ),
          logistics: updateExpenseByPercentage(
            prev.expenses.logistics,
            prev.expenses.logistics.percentage,
            newTotalRevenue
          ),
          complaints: updateExpenseByPercentage(
            prev.expenses.complaints,
            prev.expenses.complaints.percentage,
            newTotalRevenue
          ),
        },
      };
    });
  };

  const handleManagersPercentageChange = (percentage: number) => {
    setState((prev) => ({
      ...prev,
      expenses: {
        ...prev.expenses,
        managers: updateExpenseByPercentage(
          prev.expenses.managers,
          percentage,
          totalRevenue
        ),
      },
    }));
  };

  const handleManagersAmountChange = (amount: number) => {
    setState((prev) => ({
      ...prev,
      expenses: {
        ...prev.expenses,
        managers: updateExpenseByAmount(
          prev.expenses.managers,
          amount,
          totalRevenue
        ),
      },
    }));
  };

  const handleMarketingPercentageChange = (percentage: number) => {
    setState((prev) => ({
      ...prev,
      expenses: {
        ...prev.expenses,
        marketing: updateExpenseByPercentage(
          prev.expenses.marketing,
          percentage,
          results.remainingAfterManagers
        ),
      },
    }));
  };

  const handleMarketingAmountChange = (amount: number) => {
    setState((prev) => ({
      ...prev,
      expenses: {
        ...prev.expenses,
        marketing: updateExpenseByAmount(
          prev.expenses.marketing,
          amount,
          results.remainingAfterManagers
        ),
      },
    }));
  };

  const handleProductionPercentageChange = (percentage: number) => {
    setState((prev) => ({
      ...prev,
      expenses: {
        ...prev.expenses,
        production: updateExpenseByPercentage(
          prev.expenses.production,
          percentage,
          totalRevenue
        ),
      },
    }));
  };

  const handleProductionAmountChange = (amount: number) => {
    setState((prev) => ({
      ...prev,
      expenses: {
        ...prev.expenses,
        production: updateExpenseByAmount(
          prev.expenses.production,
          amount,
          totalRevenue
        ),
      },
    }));
  };

  const handleHardwarePercentageChange = (percentage: number) => {
    setState((prev) => ({
      ...prev,
      expenses: {
        ...prev.expenses,
        hardware: updateExpenseByPercentage(
          prev.expenses.hardware,
          percentage,
          totalRevenue
        ),
      },
    }));
  };

  const handleHardwareAmountChange = (amount: number) => {
    setState((prev) => ({
      ...prev,
      expenses: {
        ...prev.expenses,
        hardware: updateExpenseByAmount(
          prev.expenses.hardware,
          amount,
          totalRevenue
        ),
      },
    }));
  };

  const handleLogisticsPercentageChange = (percentage: number) => {
    setState((prev) => ({
      ...prev,
      expenses: {
        ...prev.expenses,
        logistics: updateExpenseByPercentage(
          prev.expenses.logistics,
          percentage,
          totalRevenue
        ),
      },
    }));
  };

  const handleLogisticsAmountChange = (amount: number) => {
    setState((prev) => ({
      ...prev,
      expenses: {
        ...prev.expenses,
        logistics: updateExpenseByAmount(
          prev.expenses.logistics,
          amount,
          totalRevenue
        ),
      },
    }));
  };

  const handleComplaintsPercentageChange = (percentage: number) => {
    setState((prev) => ({
      ...prev,
      expenses: {
        ...prev.expenses,
        complaints: updateExpenseByPercentage(
          prev.expenses.complaints,
          percentage,
          totalRevenue
        ),
      },
    }));
  };

  const handleComplaintsAmountChange = (amount: number) => {
    setState((prev) => ({
      ...prev,
      expenses: {
        ...prev.expenses,
        complaints: updateExpenseByAmount(
          prev.expenses.complaints,
          amount,
          totalRevenue
        ),
      },
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
          Калькулятор прибутковості перегородок
        </h1>

        {/* Вхідні параметри */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Базові параметри
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ціна однієї перегородки (₴)
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                value={state.price}
                onChange={(e) =>
                  handlePriceChange(parseFloat(e.target.value) || 0)
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Кількість перегородок
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={state.quantity}
                onChange={(e) =>
                  handleQuantityChange(parseInt(e.target.value) || 0)
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-lg font-semibold text-gray-800">
              Загальна виручка: {totalRevenue.toLocaleString("uk-UA")} ₴
            </p>
          </div>
        </div>

        {/* Витрати */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Витрати</h2>

          <ExpenseRow
            label="Менеджери"
            expense={state.expenses.managers}
            baseAmount={totalRevenue}
            onPercentageChange={handleManagersPercentageChange}
            onAmountChange={handleManagersAmountChange}
            remaining={results.remainingAfterManagers}
          />

          <ExpenseRow
            label="Маркетинг (від залишку після менеджерів)"
            expense={state.expenses.marketing}
            baseAmount={results.remainingAfterManagers}
            onPercentageChange={handleMarketingPercentageChange}
            onAmountChange={handleMarketingAmountChange}
          />

          <ExpenseRow
            label="Виробництво"
            expense={state.expenses.production}
            baseAmount={totalRevenue}
            onPercentageChange={handleProductionPercentageChange}
            onAmountChange={handleProductionAmountChange}
          />

          <ExpenseRow
            label="Фурнітура"
            expense={state.expenses.hardware}
            baseAmount={totalRevenue}
            onPercentageChange={handleHardwarePercentageChange}
            onAmountChange={handleHardwareAmountChange}
          />

          <ExpenseRow
            label="Логістика"
            expense={state.expenses.logistics}
            baseAmount={totalRevenue}
            onPercentageChange={handleLogisticsPercentageChange}
            onAmountChange={handleLogisticsAmountChange}
          />

          <ExpenseRow
            label="Рекламації"
            expense={state.expenses.complaints}
            baseAmount={totalRevenue}
            onPercentageChange={handleComplaintsPercentageChange}
            onAmountChange={handleComplaintsAmountChange}
          />
        </div>

        {/* Підсумки */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Підсумки
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <span className="text-lg font-medium text-gray-700">
                Всього витрат:
              </span>
              <div className="text-right">
                <span className="text-xl font-bold text-red-600">
                  {results.totalExpenses.toLocaleString("uk-UA")} ₴
                </span>
                <span className="text-sm text-gray-600 ml-2">
                  ({results.totalExpensesPercentage.toFixed(2)}%)
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-lg font-medium text-gray-700">
                Прибуток:
              </span>
              <div className="text-right">
                <span className="text-xl font-bold text-green-600">
                  {results.profit.toLocaleString("uk-UA")} ₴
                </span>
                <span className="text-sm text-gray-600 ml-2">
                  ({results.profitPercentage.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
