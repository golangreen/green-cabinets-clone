import { VanityTemplate } from "@/types/vanity";
import { useLocalStorage } from "./useLocalStorage";

const STORAGE_KEY = "vanity-saved-templates";

export interface SavedTemplate extends VanityTemplate {
  createdAt: string;
}

export const useSavedTemplates = () => {
  const [savedTemplates, setSavedTemplates] = useLocalStorage<SavedTemplate[]>(STORAGE_KEY, []);

  const saveTemplate = (template: Omit<SavedTemplate, "createdAt">) => {
    const newTemplate: SavedTemplate = {
      ...template,
      tags: template.tags || [],
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
