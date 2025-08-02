"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCanvas, type CanvasComponent } from "./canvas-context";
import { Square, Type, ImageIcon, MousePointer, Search } from "lucide-react";
import { useState } from "react";
import { useTheme } from "next-themes";

const componentTypes = [
  {
    category: "Basic Components",
    items: [
      { type: "button", icon: Square, label: "Button" },
      { type: "text", icon: Type, label: "Text" },
      { type: "input", icon: MousePointer, label: "Input Field" },
      { type: "image", icon: ImageIcon, label: "Image" },
    ],
  },
];

export function ComponentLibrary() {
  const { dispatch } = useCanvas();
  const { resolvedTheme } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");

  const createComponent = (type: string): CanvasComponent => {
    const id = `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const baseComponent = {
      id,
      type: type as CanvasComponent["type"],
      x: 100,
      y: 100,
      width: 120,
      height: 40,
      properties: {},
    };

    switch (type) {
      case "button":
        return {
          ...baseComponent,
          properties: {
            text: "Button",
            backgroundColor: "#3b82f6",
            textColor: "#ffffff",
            fontSize: 14,
            borderRadius: 6,
          },
        };
      case "text":
        return {
          ...baseComponent,
          height: 24,
          properties: {
            text: "Text Label",
            textColor: resolvedTheme === "dark" ? "#ffffff" : "#000000",
            fontSize: 16,
          },
        };
      case "input":
        return {
          ...baseComponent,
          properties: {
            placeholder: "Enter text...",
            backgroundColor: resolvedTheme === "dark" ? "#374151" : "#ffffff",
            textColor: resolvedTheme === "dark" ? "#ffffff" : "#000000",
            fontSize: 14,
            borderRadius: 4,
          },
        };
      case "image":
        return {
          ...baseComponent,
          width: 150,
          height: 100,
          properties: {
            src: "/placeholder.svg?height=100&width=150&text=Image",
            borderRadius: 4,
          },
        };
      default:
        return baseComponent;
    }
  };

  const handleDragStart = (e: React.DragEvent, type: string) => {
    e.dataTransfer.setData("componentType", type);
  };

  const handleAddComponent = (type: string) => {
    const component = createComponent(type);
    dispatch({ type: "ADD_COMPONENT", component });
  };

  const filteredComponents = componentTypes
    .map((category) => ({
      ...category,
      items: category.items.filter((item) =>
        item.label.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    }))
    .filter((category) => category.items.length > 0);

  return (
    <div className="flex flex-col h-full">
      <div
        className={`p-4 border-b ${resolvedTheme === "dark" ? "border-gray-700" : "border-gray-200"}`}
      >
        <h2 className="text-lg font-semibold mb-3">Component Library</h2>
        <div className="relative">
          <Search
            className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${resolvedTheme === "dark" ? "text-gray-500" : "text-gray-400"}`}
          />
          <Input
            placeholder="Search components..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {filteredComponents.map((category) => (
            <div key={category.category}>
              <h3
                className={`text-sm font-medium mb-3 ${resolvedTheme === "dark" ? "text-gray-300" : "text-gray-700"}`}
              >
                {category.category}
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {category.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Button
                      key={item.type}
                      variant="outline"
                      className="h-20 flex flex-col gap-2 cursor-grab active:cursor-grabbing bg-transparent"
                      draggable
                      onDragStart={(e) => handleDragStart(e, item.type)}
                      onClick={() => handleAddComponent(item.type)}
                    >
                      <Icon className="h-6 w-6" />
                      <span className="text-xs">{item.label}</span>
                    </Button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div
        className={`p-4 border-t ${resolvedTheme === "dark" ? "border-gray-700" : "border-gray-200"}`}
      >
        <div
          className={`text-xs ${resolvedTheme === "dark" ? "text-gray-400" : "text-gray-500"}`}
        >
          <p className="mb-1">💡 Tip: Drag components to canvas</p>
          <p>or click to add at default position</p>
        </div>
      </div>
    </div>
  );
}
