import { useState, useEffect } from 'react';
import type { Project } from '../types';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

const STORAGE_KEY = 'zk-projects';

export const useProjectsWithSupabase = (user: User | null) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Завантаження проектів
  useEffect(() => {
    if (user) {
      loadProjects();
    } else {
      // Якщо користувач не авторизований, використовуємо localStorage
      loadFromLocalStorage();
    }
  }, [user]);

  const loadProjects = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (fetchError) throw fetchError;

      const mappedProjects: Project[] = (data || []).map((row) => ({
        id: row.id,
        name: row.name,
        state: row.state,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));

      setProjects(mappedProjects);

      // Відновлюємо активний проект
      const storedActiveId = localStorage.getItem('zk-active-project');
      if (storedActiveId && mappedProjects.some((p) => p.id === storedActiveId)) {
        setActiveProjectId(storedActiveId);
      }
    } catch (err: any) {
      console.error('Error loading projects:', err);
      setError(err.message);
      // Фолбек на localStorage
      loadFromLocalStorage();
    } finally {
      setLoading(false);
    }
  };

  const loadFromLocalStorage = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setProjects(JSON.parse(stored));
    }
    const storedActiveId = localStorage.getItem('zk-active-project');
    if (storedActiveId) {
      setActiveProjectId(storedActiveId);
    }
  };

  const saveToLocalStorage = (projectsList: Project[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projectsList));
  };

  const createProject = async (
    name: string,
    initialState: any
  ): Promise<Project | null> => {
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
      if (user) {
        // Зберігаємо в Supabase
        const { error: insertError } = await supabase.from('projects').insert({
          id: newProject.id,
          user_id: user.id,
          name: newProject.name,
          state: newProject.state,
        });

        if (insertError) throw insertError;
      } else {
        // Зберігаємо локально
        const updated = [...projects, newProject];
        setProjects(updated);
        saveToLocalStorage(updated);
      }

      setProjects((prev) => [...prev, newProject]);
      setActiveProjectId(newProject.id);
      localStorage.setItem('zk-active-project', newProject.id);

      return newProject;
    } catch (err: any) {
      console.error('Error creating project:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    setLoading(true);
    setError(null);

    try {
      const updatedData = {
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      if (user) {
        // Оновлюємо в Supabase
        const { error: updateError } = await supabase
          .from('projects')
          .update({
            name: updatedData.name,
            state: updatedData.state,
            updated_at: updatedData.updatedAt,
          })
          .eq('id', id)
          .eq('user_id', user.id);

        if (updateError) throw updateError;
      }

      // Оновлюємо локальний стан
      setProjects((prev) => {
        const updated = prev.map((p) =>
          p.id === id ? { ...p, ...updatedData } : p
        );
        if (!user) {
          saveToLocalStorage(updated);
        }
        return updated;
      });
    } catch (err: any) {
      console.error('Error updating project:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      if (user) {
        // Видаляємо з Supabase
        const { error: deleteError } = await supabase
          .from('projects')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);

        if (deleteError) throw deleteError;
      }

      // Оновлюємо локальний стан
      setProjects((prev) => {
        const updated = prev.filter((p) => p.id !== id);
        if (!user) {
          saveToLocalStorage(updated);
        }
        return updated;
      });

      if (activeProjectId === id) {
        setActiveProjectId(null);
        localStorage.removeItem('zk-active-project');
      }
    } catch (err: any) {
      console.error('Error deleting project:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getActiveProject = () => {
    return projects.find((p) => p.id === activeProjectId) || null;
  };

  // Оновлюємо активний проект в localStorage
  useEffect(() => {
    if (activeProjectId) {
      localStorage.setItem('zk-active-project', activeProjectId);
    }
  }, [activeProjectId]);

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
