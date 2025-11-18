import { useState, useEffect } from "react";
import { VanityTemplate } from "@/lib/vanityTemplates";

const STORAGE_KEY = "vanity-saved-templates";

export interface SavedTemplate extends VanityTemplate {
  createdAt: string;
}

export const useSavedTemplates = () => {
  const [savedTemplates, setSavedTemplates] = useState<SavedTemplate[]>([]);

  // Load templates from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSavedTemplates(parsed);
      }
    } catch (error) {
      console.error("Error loading saved templates:", error);
    }
  }, []);

  // Save templates to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedTemplates));
    } catch (error) {
      console.error("Error saving templates:", error);
    }
  }, [savedTemplates]);

  const saveTemplate = (template: Omit<SavedTemplate, "createdAt">) => {
    const newTemplate: SavedTemplate = {
      ...template,
      createdAt: new Date().toISOString(),
    };
    setSavedTemplates((prev) => [newTemplate, ...prev]);
    return newTemplate;
  };

  const deleteTemplate = (id: string) => {
    setSavedTemplates((prev) => prev.filter((t) => t.id !== id));
  };

  const updateTemplate = (id: string, updates: Partial<SavedTemplate>) => {
    setSavedTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  };

  return {
    savedTemplates,
    saveTemplate,
    deleteTemplate,
    updateTemplate,
  };
};
