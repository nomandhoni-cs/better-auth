"use client";

import { ComponentLibrary } from "./component-library";
import { CanvasArea } from "./canvas-area";
import { PropertiesPanel } from "./properties-panel";
import { Toolbar } from "./toolbar";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Settings } from "lucide-react";
import { useTheme } from "next-themes";

export function CanvasDesigner() {
  const { resolvedTheme } = useTheme();
  const [showSidebar, setShowSidebar] = useState(false);
  const [showProperties, setShowProperties] = useState(false);

  return (
    <div
      className="flex h-full overflow-hidden"
      style={{
        backgroundColor: resolvedTheme === "dark" ? "#171717" : "#f9fafb",
      }}
    >
      {/* Mobile Menu Buttons */}
      <div className="lg:hidden fixed top-4 left-4 z-50 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSidebar(!showSidebar)}
          className="shadow-md"
          style={{
            backgroundColor: resolvedTheme === "dark" ? "#171717" : "#ffffff",
            borderColor: resolvedTheme === "dark" ? "#292929" : "#e5e7eb",
          }}
        >
          <Menu className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowProperties(!showProperties)}
          className="shadow-md"
          style={{
            backgroundColor: resolvedTheme === "dark" ? "#171717" : "#ffffff",
            borderColor: resolvedTheme === "dark" ? "#292929" : "#e5e7eb",
          }}
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      {/* Component Library Sidebar */}
      <div
        className={`
        w-80 min-w-80 flex flex-col flex-shrink-0
        lg:relative lg:translate-x-0
        ${showSidebar ? "fixed inset-y-0 left-0 z-40 translate-x-0" : "fixed inset-y-0 left-0 z-40 -translate-x-full"}
        lg:block transition-transform duration-300 ease-in-out
        border-r
      `}
        style={{
          backgroundColor: resolvedTheme === "dark" ? "#171717" : "#ffffff",
          borderRightColor: resolvedTheme === "dark" ? "#292929" : "#e5e7eb",
        }}
      >
        <div
          className="lg:hidden flex justify-between items-center p-4 border-b"
          style={{
            borderBottomColor: resolvedTheme === "dark" ? "#292929" : "#e5e7eb",
          }}
        >
          <h2 className="font-semibold">Components</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSidebar(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <ComponentLibrary />
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Toolbar />
        <div className="flex-1 relative overflow-hidden">
          <CanvasArea />
        </div>
      </div>

      {/* Properties Panel */}
      <div
        className={`
        w-80 min-w-80 flex-shrink-0
        lg:relative lg:translate-x-0
        ${showProperties ? "fixed inset-y-0 right-0 z-40 translate-x-0" : "fixed inset-y-0 right-0 z-40 translate-x-full"}
        lg:block transition-transform duration-300 ease-in-out
        border-l
      `}
        style={{
          backgroundColor: resolvedTheme === "dark" ? "#171717" : "#ffffff",
          borderLeftColor: resolvedTheme === "dark" ? "#292929" : "#e5e7eb",
        }}
      >
        <div
          className="lg:hidden flex justify-between items-center p-4 border-b"
          style={{
            borderBottomColor: resolvedTheme === "dark" ? "#292929" : "#e5e7eb",
          }}
        >
          <h2 className="font-semibold">Properties</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowProperties(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <PropertiesPanel />
      </div>

      {/* Mobile Overlay */}
      {(showSidebar || showProperties) && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => {
            setShowSidebar(false);
            setShowProperties(false);
          }}
        />
      )}
    </div>
  );
}
