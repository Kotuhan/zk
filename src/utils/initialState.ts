import type { CalculatorState } from "../types";

export const getInitialState = (): CalculatorState => ({
  unitPrice: 120000,
  quantity: 1,
  expenses: {
    managers: {
      id: "managers",
      label: "Менеджери",
      mode: "percent",
      value: 0.1,
    },
    marketing: {
      id: "marketing",
      label: "Маркетинг",
      mode: "percent",
      value: 0,
    },
    production: {
      id: "production",
      label: "Виробництво",
      mode: "percent",
      value: 0.54,
    },
    hardware: {
      id: "hardware",
      label: "Фурнітура",
      mode: "amount",
      value: 2000,
    },
    logistics: {
      id: "logistics",
      label: "Логістика",
      mode: "amount",
      value: 2000,
    },
    installers: {
      id: "installers",
      label: "Монтажники",
      mode: "percent",
      value: 0.07,
    },
    claims: {
      id: "claims",
      label: "Рекламації",
      mode: "percent",
      value: 0.02,
    },
  },
});
