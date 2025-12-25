import { useState, useEffect } from "react";
import type { Project } from "../types";
import { supabase } from "../lib/supabase";
import type { User } from "@supabase/supabase-js";

export const useProjectsWithSupabase = (user: User | null) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Завантаження проектів
  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user]);

  const loadProjects = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (fetchError) throw fetchError;

      const mappedProjects: Project[] = (data || []).map((row) => ({
        id: row.id,
        name: row.name,
        state: row.state,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));

      setProjects(mappedProjects);
    } catch (err: any) {
      console.error("Error loading projects:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (
    name: string,
    initialState: any
  ): Promise<Project | null> => {
    if (!user) return null;

    setLoading(true);
    setError(null);

    const newProject: Project = {
      id: crypto.randomUUID(),
      name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      state: initialState,
    };

    try {
      const { error: insertError } = await supabase.from("projects").insert({
        id: newProject.id,
        user_id: user.id,
        name: newProject.name,
        state: newProject.state,
      });

      if (insertError) throw insertError;

      setProjects((prev) => [...prev, newProject]);
      setActiveProjectId(newProject.id);

      return newProject;
    } catch (err: any) {
      console.error("Error creating project:", err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const updatedData = {
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      const { error: updateError } = await supabase
        .from("projects")
        .update({
          name: updatedData.name,
          state: updatedData.state,
          updated_at: updatedData.updatedAt,
        })
        .eq("id", id)
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      setProjects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updatedData } : p))
      );
    } catch (err: any) {
      console.error("Error updating project:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (id: string) => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const { error: deleteError } = await supabase
        .from("projects")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (deleteError) throw deleteError;

      setProjects((prev) => prev.filter((p) => p.id !== id));

      if (activeProjectId === id) {
        setActiveProjectId(null);
      }
    } catch (err: any) {
      console.error("Error deleting project:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getActiveProject = () => {
    return projects.find((p) => p.id === activeProjectId) || null;
  };

  return {
    projects,
    activeProjectId,
    setActiveProjectId,
    createProject,
    updateProject,
    deleteProject,
    getActiveProject,
    loading,
    error,
  };
};
