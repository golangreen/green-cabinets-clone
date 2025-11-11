import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { VanityTemplate } from "@/types/vanity";
import { vanityTemplates } from "@/lib/vanityTemplates";
import { Sparkles, Check, Trash2, Clock } from "lucide-react";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import { SavedTemplate } from "@/features/vanity-designer";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { useState } from "react";

interface TemplateGalleryProps {
  onSelectTemplate: (template: VanityTemplate | SavedTemplate) => void;
  selectedTemplateId?: string;
  savedTemplates?: SavedTemplate[];
  onDeleteTemplate?: (id: string) => void;
}

export const TemplateGallery = ({ 
  onSelectTemplate, 
  selectedTemplateId,
  savedTemplates = [],
  onDeleteTemplate,
}: TemplateGalleryProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);

  const handleDeleteClick = (e: React.MouseEvent, templateId: string) => {
    e.stopPropagation();
    setTemplateToDelete(templateId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (templateToDelete && onDeleteTemplate) {
      onDeleteTemplate(templateToDelete);
    }
    setDeleteDialogOpen(false);
    setTemplateToDelete(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const renderTemplateCard = (template: VanityTemplate | SavedTemplate, isSaved = false) => {
    const isSelected = selectedTemplateId === template.id;
    
    return (
      <Card
        key={template.id}
        className={`min-w-[280px] cursor-pointer transition-all hover:shadow-lg ${
          isSelected ? "ring-2 ring-primary shadow-lg" : ""
        }`}
        onClick={() => onSelectTemplate(template)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <CardTitle className="text-base flex items-center gap-2">
                {template.name}
                {isSelected && (
                  <Check className="w-4 h-4 text-primary" />
                )}
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                {template.description}
              </CardDescription>
              {isSaved && 'createdAt' in template && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <Clock className="w-3 h-3" />
                  {formatDate(template.createdAt)}
                </div>
              )}
            </div>
            {isSaved && onDeleteTemplate && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                onClick={(e) => handleDeleteClick(e, template.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Brand:</span>
              <span className="font-medium">{template.config.brand}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Finish:</span>
              <span className="font-medium">{template.config.finish}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Size:</span>
              <span className="font-medium">
                {template.config.width}×{template.config.height}×{template.config.depth}"
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Style:</span>
              <span className="font-medium capitalize">
                {template.config.doorStyle.replace("-", " ")}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-1">
            {(template.tags || []).map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-xs px-2 py-0"
              >
                {tag}
              </Badge>
            ))}
          </div>
          <Button
            size="sm"
            className="w-full"
            variant={isSelected ? "default" : "outline"}
          >
            {isSelected ? "Selected" : "Use Template"}
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <>
      {savedTemplates.length > 0 && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              My Saved Templates
            </CardTitle>
            <CardDescription>
              Your custom saved configurations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="w-full">
              <div className="flex gap-4 pb-4">
                {savedTemplates.map((template) => renderTemplateCard(template, true))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Popular Templates
          </CardTitle>
          <CardDescription>
            Start with a pre-configured design and customize it to your needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="w-full">
            <div className="flex gap-4 pb-4">
              {vanityTemplates.map((template) => renderTemplateCard(template, false))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this saved template? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
