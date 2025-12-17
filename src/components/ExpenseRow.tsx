import React from "react";
import { Expense } from "../types/calculator";

interface ExpenseRowProps {
  label: string;
  expense: Expense;
  baseAmount: number;
  onPercentageChange: (percentage: number) => void;
  onAmountChange: (amount: number) => void;
  remaining?: number;
}

export const ExpenseRow: React.FC<ExpenseRowProps> = ({
  label,
  expense,
  baseAmount,
  onPercentageChange,
  onAmountChange,
  remaining,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-3">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-medium text-gray-800">{label}</h3>
        {remaining !== undefined && (
          <span className="text-sm text-gray-600">
            Залишок: {remaining.toLocaleString("uk-UA")} ₴
          </span>
        )}
      </div>

      {/* Повзунок для відсотка */}
      <div className="mb-3">
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm text-gray-600">Відсоток</label>
          <span className="text-sm font-semibold text-blue-600">
            {expense.percentage.toFixed(2)}%
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          step="0.1"
          value={expense.percentage}
          onChange={(e) => onPercentageChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
      </div>

      {/* Поле для номінальної суми */}
      <div>
        <label className="text-sm text-gray-600 block mb-2">Сума (₴)</label>
        <input
          type="number"
          min="0"
          step="100"
          value={expense.amount}
          onChange={(e) => onAmountChange(parseFloat(e.target.value) || 0)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  );
};
