import { CanvasProvider } from "@/components/dashboard/canvas/canvas-context";
import { CanvasDesigner } from "@/components/dashboard/canvas/canvas-designer";
import React from "react";

export default function SurfaceEditorPage() {
  return (
    <div className="h-full w-full overflow-hidden">
      <CanvasProvider>
        <CanvasDesigner />
      </CanvasProvider>
    </div>
  );
}
