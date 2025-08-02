"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useCanvas, DEVICE_TEMPLATES, type Template } from "./canvas-context";
import { Monitor, Smartphone, Tablet, Layout } from "lucide-react";

interface TemplateSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TemplateSelector({
  open,
  onOpenChange,
}: TemplateSelectorProps) {
  const { dispatch } = useCanvas();
  const { resolvedTheme } = useTheme();
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  );

  const getDeviceIcon = (deviceType: string) => {
    if (deviceType.toLowerCase().includes("tablet")) return Tablet;
    if (deviceType.toLowerCase().includes("phone")) return Smartphone;
    if (deviceType.toLowerCase().includes("kiosk")) return Monitor;
    return Layout;
  };

  const handleSelectTemplate = (template: Template) => {
    dispatch({ type: "LOAD_TEMPLATE", template });
    onOpenChange(false);
    setSelectedTemplate(null);
  };

  const handleCreateBlank = () => {
    const blankTemplate = DEVICE_TEMPLATES.find((t) => t.id === "blank-tablet");
    if (blankTemplate) {
      dispatch({ type: "LOAD_TEMPLATE", template: blankTemplate });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Select Template
          </DialogTitle>
          <p
            className={`text-sm ${resolvedTheme === "dark" ? "text-gray-400" : "text-gray-600"}`}
          >
            Choose a template to start your touchscreen layout design
          </p>
        </DialogHeader>

        <ScrollArea className="h-[500px] pr-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DEVICE_TEMPLATES.map((template) => {
              const DeviceIcon = getDeviceIcon(template.deviceType);
              return (
                <div
                  key={template.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                    selectedTemplate?.id === template.id
                      ? "border-blue-500 bg-blue-50"
                      : resolvedTheme === "dark"
                        ? "border-gray-600 hover:border-gray-500"
                        : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setSelectedTemplate(template)}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <DeviceIcon
                        className={`h-6 w-6 ${resolvedTheme === "dark" ? "text-gray-400" : "text-gray-600"}`}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {template.name}
                      </h3>
                      <p
                        className={`text-sm mt-1 ${resolvedTheme === "dark" ? "text-gray-400" : "text-gray-600"}`}
                      >
                        {template.description}
                      </p>

                      <div className="flex items-center gap-2 mt-3">
                        <Badge variant="secondary" className="text-xs">
                          {template.deviceType}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {template.resolution.width} ×{" "}
                          {template.resolution.height}
                        </Badge>
                      </div>

                      {template.components.length > 0 && (
                        <p
                          className={`text-xs mt-2 ${resolvedTheme === "dark" ? "text-gray-400" : "text-gray-500"}`}
                        >
                          {template.components.length} pre-built component
                          {template.components.length !== 1 ? "s" : ""}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Template Preview */}
                  <div className="mt-4 bg-gray-50 rounded-md p-3">
                    <div
                      className={`text-xs mb-2 ${resolvedTheme === "dark" ? "text-gray-400" : "text-gray-500"}`}
                    >
                      Preview:
                    </div>
                    <div
                      className={`border rounded shadow-sm relative ${resolvedTheme === "dark" ? "bg-gray-800 border-gray-600" : "bg-white border-gray-200"}`}
                      style={{
                        width: "100%",
                        height: "80px",
                        aspectRatio: `${template.resolution.width} / ${template.resolution.height}`,
                      }}
                    >
                      {template.components.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-xs text-gray-400">
                          Blank Canvas
                        </div>
                      ) : (
                        <div className="relative w-full h-full overflow-hidden">
                          {template.components
                            .slice(0, 3)
                            .map((comp, index) => (
                              <div
                                key={comp.id}
                                className="absolute bg-blue-200 border border-blue-300 rounded-sm"
                                style={{
                                  left: `${(comp.x / template.resolution.width) * 100}%`,
                                  top: `${(comp.y / template.resolution.height) * 100}%`,
                                  width: `${(comp.width / template.resolution.width) * 100}%`,
                                  height: `${(comp.height / template.resolution.height) * 100}%`,
                                  zIndex: index,
                                }}
                              />
                            ))}
                          {template.components.length > 3 && (
                            <div
                              className={`absolute bottom-1 right-1 text-xs px-1 rounded ${resolvedTheme === "dark" ? "text-gray-400 bg-gray-800" : "text-gray-500 bg-white"}`}
                            >
                              +{template.components.length - 3} more
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={handleCreateBlank}>
            Create Blank Canvas
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={() =>
                selectedTemplate && handleSelectTemplate(selectedTemplate)
              }
              disabled={!selectedTemplate}
            >
              Use Template
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
