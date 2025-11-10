import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { VanityTemplate, vanityTemplates } from "@/lib/vanityTemplates";
import { Sparkles, Check } from "lucide-react";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";

interface TemplateGalleryProps {
  onSelectTemplate: (template: VanityTemplate) => void;
  selectedTemplateId?: string;
}

export const TemplateGallery = ({ onSelectTemplate, selectedTemplateId }: TemplateGalleryProps) => {
  return (
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
            {vanityTemplates.map((template) => {
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
                    <div className="flex items-start justify-between">
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
                      </div>
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
                      {template.tags.map((tag) => (
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
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
