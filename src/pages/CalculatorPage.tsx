import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { CalculatorState, ExpenseId } from "../types";
import { computeAll, setExpenseAmount, setExpensePercent } from "../calc";
import { useProjectsWithSupabase } from "../hooks/useProjectsWithSupabase";
import { useAuth } from "../hooks/useAuth";
import { ProjectSidebar } from "../components/ProjectSidebar";
import { useToast } from "../contexts/ToastContext";
import { PromptModal } from "../components/PromptModal";
import { ConfirmModal } from "../components/ConfirmModal";
import { getInitialState } from "../utils/initialState";

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
          onFocus={(e) => setTimeout(() => e.target.select(), 0)}
          onClick={(e) => e.currentTarget.select()}
        />
      </td>
      <td className="right">{formatUAH(remainingAfter)}</td>
    </tr>
  );
};

export const CalculatorPage: React.FC = () => {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId?: string }>();
  const { user, signOut } = useAuth();
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

  // Синхронізуємо activeProjectId з URL
  React.useEffect(() => {
    if (projectId && projectId !== activeProjectId) {
      setActiveProjectId(projectId);
    } else if (!projectId && activeProjectId) {
      // Якщо немає projectId в URL, але є activeProjectId - редірект
      navigate(`/project/${activeProjectId}`, { replace: true });
    }
  }, [projectId, activeProjectId, setActiveProjectId, navigate]);

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
      onConfirm: async (name) => {
        const newProject = await createProject(name, getInitialState());
        if (newProject) {
          showToast("Проект створено!", "success");
          navigate(`/project/${newProject.id}`);
        }
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
        onConfirm: async (name) => {
          const newProject = await createProject(name, state);
          if (newProject) {
            showToast("Проект збережено!", "success");
            navigate(`/project/${newProject.id}`);
          }
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
        // Перенаправляємо на головну якщо видалили поточний проект
        if (id === activeProjectId) {
          navigate("/");
        }
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleSelectProject = (id: string) => {
    navigate(`/project/${id}`);
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      showToast("Помилка виходу", "error");
    } else {
      showToast("Ви вийшли з системи", "info");
      navigate("/auth");
    }
  };

  const handleUpdateExpensePercent = (id: ExpenseId, percent: number) => {
    setState((prev) => setExpensePercent(prev, id, percent));
  };

  const handleUpdateExpenseAmount = (id: ExpenseId, amount: number) => {
    setState((prev) => setExpenseAmount(prev, id, amount));
  };

  return (
    <div className="appLayout">
      <ProjectSidebar
        projects={projects}
        activeProjectId={activeProjectId}
        onSelectProject={handleSelectProject}
        onCreateProject={handleCreateProject}
        onDeleteProject={handleDeleteProject}
        loading={projectsLoading}
      />

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
              <button className="btnSecondary" onClick={handleSignOut}>
                Вийти
              </button>
              <button className="btnPrimary" onClick={handleSaveProject}>
                {activeProjectId ? "Зберегти" : "Зберегти як новий"}
              </button>
            </div>
          </div>

          <div className="section">
            <h2 className="sectionTitle">Початкові дані</h2>
            <table className="table">
              <thead>
                <tr>
                  <th>Параметр</th>
                  <th className="right">Значення</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Ціна за одиницю (₴)</td>
                  <td className="right">
                    <input
                      className="input rightAligned"
                      inputMode="decimal"
                      value={String(state.unitPrice)}
                      onChange={(e) =>
                        setState({
                          ...state,
                          unitPrice: parseNumber(e.target.value),
                        })
                      }
                      onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                      onClick={(e) => e.currentTarget.select()}
                    />
                  </td>
                </tr>
                <tr>
                  <td>Кількість (шт)</td>
                  <td className="right">
                    <input
                      className="input rightAligned"
                      inputMode="decimal"
                      value={String(state.quantity)}
                      onChange={(e) =>
                        setState({
                          ...state,
                          quantity: parseNumber(e.target.value),
                        })
                      }
                      onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                      onClick={(e) => e.currentTarget.select()}
                    />
                  </td>
                </tr>
                <tr className="highlight">
                  <td>
                    <strong>Дохід</strong>
                  </td>
                  <td className="right">
                    <strong>{formatUAH(computed.revenue)}</strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="section">
            <h2 className="sectionTitle">Витрати</h2>
            <table className="table">
              <thead>
                <tr>
                  <th>Витрата</th>
                  <th className="right">База</th>
                  <th>Відсоток</th>
                  <th className="right">Сума (₴)</th>
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
                    onPercent={handleUpdateExpensePercent}
                    onAmount={handleUpdateExpenseAmount}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <div className="section">
            <h2 className="sectionTitle">Підсумок</h2>
            <table className="table">
              <tbody>
                <tr>
                  <td>Загальні витрати</td>
                  <td className="right">
                    {formatUAH(computed.totalExpensesAmount)}
                  </td>
                </tr>
                <tr className="highlight">
                  <td>
                    <strong>Прибуток (₴)</strong>
                  </td>
                  <td className="right">
                    <strong
                      style={{
                        color:
                          computed.profitAmount < 0
                            ? "var(--color-negative)"
                            : "var(--color-positive)",
                      }}
                    >
                      {formatUAH(computed.profitAmount)}
                    </strong>
                  </td>
                </tr>
                <tr className="highlight">
                  <td>
                    <strong>Прибуток (%)</strong>
                  </td>
                  <td className="right">
                    <strong
                      style={{
                        color:
                          computed.profitPercent < 0
                            ? "var(--color-negative)"
                            : "var(--color-positive)",
                      }}
                    >
                      {formatPct(computed.profitPercent)}
                    </strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Модальні вікна */}
      {promptModal.isOpen && (
        <PromptModal
          isOpen={promptModal.isOpen}
          title={promptModal.title}
          defaultValue={promptModal.defaultValue}
          onConfirm={promptModal.onConfirm}
          onCancel={() =>
            setPromptModal((prev) => ({ ...prev, isOpen: false }))
          }
        />
      )}

      {confirmModal.isOpen && (
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          title={confirmModal.title}
          message={confirmModal.message}
          onConfirm={confirmModal.onConfirm}
          onCancel={() =>
            setConfirmModal((prev) => ({ ...prev, isOpen: false }))
          }
        />
      )}
    </div>
  );
};
