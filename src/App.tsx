import React from "react";
import type { CalculatorState, ExpenseId } from "./types";
import { computeAll, setExpenseAmount, setExpensePercent } from "./calc";
import { useProjectsWithSupabase } from "./hooks/useProjectsWithSupabase";
import { useAuth } from "./hooks/useAuth";
import { ProjectSidebar } from "./components/ProjectSidebar";
import { useToast } from "./contexts/ToastContext";
import { PromptModal } from "./components/PromptModal";
import { ConfirmModal } from "./components/ConfirmModal";
import { Auth } from "./components/Auth";
import { Loader } from "./components/Loader";

const formatUAH = (value: number) =>
  new Intl.NumberFormat("uk-UA", {
    style: "currency",
    currency: "UAH",
    maximumFractionDigits: 0,
  }).format(value);

const formatPct = (value01: number) => {
  const percent = value01 * 100;
  const absPercent = Math.abs(percent);
  const decimals = absPercent >= 10 ? 1 : 2;
  return `${percent.toFixed(decimals)}%`;
};

const parseNumber = (raw: string) => {
  const normalized = raw.replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};

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

const ExpenseRow = ({
  id,
  label,
  base,
  percent,
  amount,
  remainingAfter,
  onPercent,
  onAmount,
}: {
  id: ExpenseId;
  label: string;
  base: number;
  percent: number;
  amount: number;
  remainingAfter: number;
  onPercent: (id: ExpenseId, percent01: number) => void;
  onAmount: (id: ExpenseId, amount: number) => void;
}) => {
  return (
    <tr>
      <td>{label}</td>
      <td className="right muted">{formatUAH(base)}</td>
      <td>
        <div className="rowControls">
          <input
            className="range"
            type="range"
            min={0}
            max={100}
            step={0.1}
            value={Math.max(0, Math.min(100, percent * 100))}
            onChange={(e) => onPercent(id, Number(e.target.value) / 100)}
          />
          <div className="percentValue">{formatPct(percent)}</div>
        </div>
      </td>
      <td className="right">
        <input
          className="input rightAligned"
          inputMode="decimal"
          value={Number.isFinite(amount) ? String(Math.round(amount)) : "0"}
          onChange={(e) => onAmount(id, parseNumber(e.target.value))}
        />
      </td>
      <td className="right">{formatUAH(remainingAfter)}</td>
    </tr>
  );
};

export default function App() {
  const { user, loading: authLoading, signOut } = useAuth();
  const {
    projects,
    activeProjectId,
    setActiveProjectId,
    createProject,
    updateProject,
    deleteProject,
    getActiveProject,
    loading: projectsLoading,
  } = useProjectsWithSupabase(user);

  const { showToast } = useToast();

  const activeProject = getActiveProject();
  const [state, setState] = React.useState<CalculatorState>(
    activeProject?.state || getInitialState()
  );
  const [projectName, setProjectName] = React.useState(
    activeProject?.name || ""
  );

  // Модальні вікна
  const [promptModal, setPromptModal] = React.useState<{
    isOpen: boolean;
    title: string;
    defaultValue: string;
    onConfirm: (value: string) => void;
  }>({
    isOpen: false,
    title: "",
    defaultValue: "",
    onConfirm: () => {},
  });

  const [confirmModal, setConfirmModal] = React.useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  // Синхронізація стану з активним проектом
  React.useEffect(() => {
    if (activeProject) {
      setState(activeProject.state);
      setProjectName(activeProject.name);
    }
  }, [activeProject]);

  const computed = React.useMemo(() => computeAll(state), [state]);

  const handleCreateProject = () => {
    setPromptModal({
      isOpen: true,
      title: "Створити новий проект",
      defaultValue: "Перегородки",
      onConfirm: (name) => {
        createProject(name, getInitialState());
        showToast("Проект створено!", "success");
        setPromptModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleSaveProject = () => {
    if (!activeProjectId) {
      // Створити новий проект
      setPromptModal({
        isOpen: true,
        title: "Зберегти як новий проект",
        defaultValue: "Перегородки",
        onConfirm: (name) => {
          createProject(name, state);
          showToast("Проект збережено!", "success");
          setPromptModal((prev) => ({ ...prev, isOpen: false }));
        },
      });
    } else {
      // Оновити існуючий
      updateProject(activeProjectId, { state, name: projectName });
      showToast("Проект оновлено!", "success");
    }
  };

  const handleRenameProject = () => {
    if (activeProjectId) {
      setPromptModal({
        isOpen: true,
        title: "Перейменувати проект",
        defaultValue: projectName,
        onConfirm: (newName) => {
          if (newName !== projectName) {
            setProjectName(newName);
            updateProject(activeProjectId, { name: newName });
            showToast("Проект перейменовано!", "success");
          }
          setPromptModal((prev) => ({ ...prev, isOpen: false }));
        },
      });
    }
  };

  const handleDeleteProject = (id: string, name: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Видалити проект",
      message: `Ви впевнені, що хочете видалити проект "${name}"? Цю дію не можна скасувати.`,
      onConfirm: () => {
        deleteProject(id);
        showToast("Проект видалено!", "success");
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      showToast("Помилка виходу", "error");
    } else {
      showToast("Ви вийшли з системи", "info");
    }
  };

  // Показуємо loader під час завантаження auth
  if (authLoading) {
    return <Loader fullScreen message="Завантаження..." />;
  }

  // Якщо користувач не авторизований, показуємо Auth
  if (!user) {
    return <Auth />;
  }

  return (
    <div className="appLayout">
      <ProjectSidebar
        projects={projects}
        activeProjectId={activeProjectId}
        onSelectProject={setActiveProjectId}
        onCreateProject={handleCreateProject}
        onDeleteProject={handleDeleteProject}
      />

      {projectsLoading && (
        <div style={{ 
          position: 'fixed', 
          top: '80px', 
          right: '20px', 
          zIndex: 9999 
        }}>
          <div className="pill" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px' 
          }}>
            <div className="spinner spinner-small">
              <div className="spinner-circle"></div>
            </div>
            Синхронізація...
          </div>
        </div>
      )}

      <div className="mainContent">
        <div className="container">
          <div className="header">
            <div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <h1 className="title">
                  {activeProject ? projectName : "Калькулятор прибутковості"}
                </h1>
                {activeProject && (
                  <button
                    className="btnSecondary"
                    onClick={handleRenameProject}
                  >
                    ✎
                  </button>
                )}
              </div>
              <p className="subtitle">
                Кожну витрату можна вводити у % або в грн: повзунок міняє %,
                поле суми — грн (поля зв'язані).
              </p>
            </div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              {user && (
                <div className="pill" style={{ cursor: "default" }}>
                  {user.email}
                </div>
              )}
              <div className="pill">
                Маркетинг рахується від залишку після менеджерів
              </div>
              <button className="btnPrimary" onClick={handleSaveProject}>
                💾 Зберегти
              </button>
              <button className="btnSecondary" onClick={handleSignOut}>
                Вийти
              </button>
            </div>
          </div>

          <div className="grid">
            <div className="card">
              <div className="cardHeader">
                <h2>Вхідні дані</h2>
                <div className="pill">Дохід: {formatUAH(computed.revenue)}</div>
              </div>
              <div className="content">
                <div className="inputsRow">
                  <div className="field">
                    <label>Ціна однієї перегородки (грн)</label>
                    <input
                      className="input rightAligned"
                      inputMode="decimal"
                      value={String(state.unitPrice)}
                      onChange={(e) =>
                        setState((prev) => ({
                          ...prev,
                          unitPrice: parseNumber(e.target.value),
                        }))
                      }
                    />
                  </div>
                  <div className="field">
                    <label>Кількість</label>
                    <input
                      className="input rightAligned"
                      inputMode="numeric"
                      value={String(state.quantity)}
                      onChange={(e) =>
                        setState((prev) => ({
                          ...prev,
                          quantity: Math.max(
                            0,
                            Math.floor(parseNumber(e.target.value))
                          ),
                        }))
                      }
                    />
                  </div>
                  <div className="field">
                    <label>Середня ціна (контроль)</label>
                    <input
                      className="input"
                      value={formatUAH(state.unitPrice)}
                      readOnly
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="cardHeader">
                <h2>Витрати (зверху вниз)</h2>
                <div className="pill">
                  Залишок: {formatUAH(computed.profitAmount)}
                </div>
              </div>
              <div className="content" style={{ padding: 0 }}>
                <table>
                  <thead>
                    <tr>
                      <th>Стаття</th>
                      <th className="right">База</th>
                      <th>Відсоток</th>
                      <th className="right">Витрата (грн)</th>
                      <th className="right">Залишок</th>
                    </tr>
                  </thead>
                  <tbody>
                    {computed.rows.map((row) => (
                      <ExpenseRow
                        key={row.id}
                        id={row.id}
                        label={row.label}
                        base={row.base}
                        percent={row.percent}
                        amount={row.amount}
                        remainingAfter={row.remainingAfter}
                        onPercent={(id, p) =>
                          setState((prev) => setExpensePercent(prev, id, p))
                        }
                        onAmount={(id, a) =>
                          setState((prev) => setExpenseAmount(prev, id, a))
                        }
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card">
              <div className="cardHeader">
                <h2>Підсумок</h2>
                <div className="pill">
                  Витрати: {formatPct(computed.totalExpensesPercent)} ·
                  Прибуток: {formatPct(computed.profitPercent)}
                </div>
              </div>
              <div className="content">
                <div className="summary">
                  <div className="metric">
                    <div className="metricLabel">Загальні витрати</div>
                    <div className="metricValue">
                      {formatUAH(computed.totalExpensesAmount)}
                    </div>
                  </div>
                  <div className="metric">
                    <div className="metricLabel">Залишок після всіх витрат</div>
                    <div
                      className={[
                        "metricValue",
                        computed.profitAmount < 0 ? "negative" : "positive",
                      ].join(" ")}
                    >
                      {formatUAH(computed.profitAmount)}
                    </div>
                  </div>
                  <div className="metric">
                    <div className="metricLabel">Залишок у відсотках</div>
                    <div
                      className={[
                        "metricValue",
                        computed.profitPercent < 0 ? "negative" : "positive",
                      ].join(" ")}
                    >
                      {formatPct(computed.profitPercent)}
                    </div>
                  </div>
                </div>
                <div className="warningMessage">
                  {computed.profitAmount < 0 ? (
                    <p
                      className="muted"
                      style={{ marginTop: 12, marginBottom: 0 }}
                    >
                      Увага: витрати перевищують дохід (відʼємний прибуток).
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PromptModal
        isOpen={promptModal.isOpen}
        title={promptModal.title}
        defaultValue={promptModal.defaultValue}
        placeholder="Введіть назву..."
        onConfirm={promptModal.onConfirm}
        onCancel={() => setPromptModal((prev) => ({ ...prev, isOpen: false }))}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        type="danger"
        confirmText="Видалити"
        cancelText="Скасувати"
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
