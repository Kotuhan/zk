import React from "react";
import type { Project } from "../types";
import { computeAll } from "../calc";

interface ProjectSidebarProps {
  projects: Project[];
  activeProjectId: string | null;
  onSelectProject: (id: string) => void;
  onCreateProject: () => void;
  onDeleteProject: (id: string, name: string) => void;
  loading?: boolean;
}

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

export const ProjectSidebar: React.FC<ProjectSidebarProps> = ({
  projects,
  activeProjectId,
  onSelectProject,
  onCreateProject,
  onDeleteProject,
  loading = false,
}) => {
  return (
    <div className="sidebar">
      <div className="sidebarHeader">
        <h2 className="sidebarTitle">Проекти</h2>
        <button className="btnPrimary" onClick={onCreateProject}>
          + Новий
        </button>
      </div>

      <div className="projectList">
        {loading ? (
          <div className="emptyState">
            <div className="spinner"></div>
            <p className="muted" style={{ marginTop: "12px" }}>
              Завантаження проектів...
            </p>
          </div>
        ) : projects.length === 0 ? (
          <div className="emptyState">
            <p className="muted">Немає проектів</p>
            <p className="muted" style={{ fontSize: "12px", marginTop: "4px" }}>
              Створіть перший проект
            </p>
          </div>
        ) : (
          projects.map((project) => {
            const computed = computeAll(project.state);
            const isActive = project.id === activeProjectId;

            return (
              <div
                key={project.id}
                className={`projectCard ${isActive ? "active" : ""}`}
                onClick={() => onSelectProject(project.id)}
              >
                <div className="projectCardHeader">
                  <h3 className="projectName">{project.name}</h3>
                  <button
                    className="btnDelete"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteProject(project.id, project.name);
                    }}
                  >
                    ×
                  </button>
                </div>
                <div className="projectStats">
                  <div className="projectStat">
                    <span className="projectStatLabel">Дохід:</span>
                    <span className="projectStatValue">
                      {formatUAH(computed.revenue)}
                    </span>
                  </div>
                  <div className="projectStat">
                    <span className="projectStatLabel">Прибуток:</span>
                    <span
                      className={`projectStatValue ${
                        computed.profitAmount < 0 ? "negative" : "positive"
                      }`}
                    >
                      {formatUAH(computed.profitAmount)} (
                      {formatPct(computed.profitPercent)})
                    </span>
                  </div>
                </div>
                <div className="projectDate">
                  Оновлено:{" "}
                  {new Date(project.updatedAt).toLocaleDateString("uk-UA")}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
