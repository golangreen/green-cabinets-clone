import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export interface RoomTemplate {
  id: string;
  name: string;
  description?: string;
  walls: any[];
  openings: any[];
  cabinets: any[];
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "room_templates";

export const useRoomTemplates = () => {
  const [templates, setTemplates] = useLocalStorage<RoomTemplate[]>(STORAGE_KEY, []);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading for better UX
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  const saveTemplate = (
    name: string,
    walls: any[],
    openings: any[],
    cabinets: any[],
    description?: string
  ): RoomTemplate => {
    const newTemplate: RoomTemplate = {
      id: `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      walls: JSON.parse(JSON.stringify(walls)), // Deep clone
      openings: JSON.parse(JSON.stringify(openings)),
      cabinets: JSON.parse(JSON.stringify(cabinets)),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTemplates((prev) => [newTemplate, ...prev]);
    toast.success(`Template "${name}" saved successfully`);
    return newTemplate;
  };

  const updateTemplate = (
    id: string,
    updates: Partial<Omit<RoomTemplate, "id" | "createdAt">>
  ) => {
    setTemplates((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, ...updates, updatedAt: new Date().toISOString() }
          : t
      )
    );
    toast.success("Template updated");
  };

  const deleteTemplate = (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    toast.success("Template deleted");
  };

  const loadTemplate = (id: string): RoomTemplate | null => {
    const template = templates.find((t) => t.id === id);
    if (template) {
      toast.success(`Template "${template.name}" loaded`);
      return JSON.parse(JSON.stringify(template)); // Deep clone
    }
    toast.error("Template not found");
    return null;
  };

  const duplicateTemplate = (id: string) => {
    const template = templates.find((t) => t.id === id);
    if (!template) {
      toast.error("Template not found");
      return;
    }

    const newTemplate: RoomTemplate = {
      ...JSON.parse(JSON.stringify(template)),
      id: `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: `${template.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTemplates((prev) => [newTemplate, ...prev]);
    toast.success(`Template duplicated as "${newTemplate.name}"`);
  };

  return {
    templates,
    isLoading,
    saveTemplate,
    updateTemplate,
    deleteTemplate,
    loadTemplate,
    duplicateTemplate,
  };
};
