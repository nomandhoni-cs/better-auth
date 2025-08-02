"use client";

import type React from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCanvas } from "./canvas-context";
import { useTheme } from "next-themes";
import {
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  Download,
  Upload,
  Trash2,
  Layout,
  MoreHorizontal,
} from "lucide-react";
import { useRef, useState } from "react";
import { TemplateSelector } from "./template-selector";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Toolbar() {
  const { state, dispatch } = useCanvas();
  const { resolvedTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);

  const handleUndo = () => {
    dispatch({ type: "UNDO" });
  };

  const handleRedo = () => {
    dispatch({ type: "REDO" });
  };

  const handleZoomIn = () => {
    dispatch({ type: "SET_ZOOM", zoom: state.zoom + 0.1 });
  };

  const handleZoomOut = () => {
    dispatch({ type: "SET_ZOOM", zoom: state.zoom - 0.1 });
  };

  const handleDelete = () => {
    if (state.selectedComponent) {
      dispatch({ type: "DELETE_COMPONENT", id: state.selectedComponent });
    }
  };

  const handleExport = () => {
    const layout = {
      components: state.components,
      canvasWidth: state.canvasWidth,
      canvasHeight: state.canvasHeight,
    };
    const blob = new Blob([JSON.stringify(layout, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "layout.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const layout = JSON.parse(e.target?.result as string);
          dispatch({
            type: "LOAD_LAYOUT",
            components: layout.components || [],
          });
        } catch (error) {
          console.error("Failed to import layout:", error);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleCenter = () => {
    dispatch({ type: "CENTER_CANVAS" });
  };

  return (
    <div
      className="h-16 flex items-center px-4 gap-2 overflow-x-auto border-b"
      style={{
        backgroundColor: resolvedTheme === "dark" ? "#171717" : "#ffffff",
        borderBottomColor: resolvedTheme === "dark" ? "#292929" : "#e5e7eb",
      }}
    >
      <div className="flex items-center gap-1 flex-shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleUndo}
          disabled={state.historyIndex <= 0}
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRedo}
          disabled={state.historyIndex >= state.history.length - 1}
        >
          <Redo className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowTemplateSelector(true)}
          className="hidden sm:flex"
        >
          <Layout className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      <div className="flex items-center gap-1 flex-shrink-0">
        <Button variant="ghost" size="sm" onClick={handleZoomOut}>
          <ZoomOut className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium min-w-[60px] text-center">
          {Math.round(state.zoom * 100)}%
        </span>
        <Button variant="ghost" size="sm" onClick={handleZoomIn}>
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCenter}
          title="Center Canvas"
        >
          <Layout className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      <Button
        variant="ghost"
        size="sm"
        onClick={handleDelete}
        disabled={!state.selectedComponent}
        className="flex-shrink-0"
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <div className="flex-1" />

      <div className="hidden md:flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-4 w-4 mr-2" />
          Import
        </Button>
      </div>

      {/* Mobile dropdown menu */}
      <div className="md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setShowTemplateSelector(true)}>
              <Layout className="h-4 w-4 mr-2" />
              New Template
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4 mr-2" />
              Import
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleImport}
        className="hidden"
      />
      <TemplateSelector
        open={showTemplateSelector}
        onOpenChange={setShowTemplateSelector}
      />
    </div>
  );
}
