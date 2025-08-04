"use client";

import type React from "react";

import { useCanvas, type CanvasComponent } from "./canvas-context";
import { useRef, useEffect, useState, useCallback } from "react";
import { useTheme } from "next-themes";

export function CanvasArea() {
  const { state, dispatch } = useCanvas();
  const { resolvedTheme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragComponent, setDragComponent] = useState<string | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [resizeStart, setResizeStart] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  // Alt key state for duplication
  const [isAltPressed, setIsAltPressed] = useState(false);

  // Store loaded images to avoid reloading
  const [loadedImages, setLoadedImages] = useState<
    Map<string, HTMLImageElement>
  >(new Map());

  const drawComponent = useCallback(
    (ctx: CanvasRenderingContext2D, component: CanvasComponent) => {
      const { x, y, width, height, type, properties } = component;
      const isSelected = state.selectedComponent === component.id;

      // Draw selection highlight
      if (isSelected) {
        ctx.strokeStyle = "#3b82f6";
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(x - 2, y - 2, width + 4, height + 4);
        ctx.setLineDash([]);
      }

      // Draw component based on type
      switch (type) {
        case "button":
          // Background
          ctx.fillStyle = (properties.backgroundColor as string) || "#3b82f6";
          ctx.beginPath();
          const buttonRadius = (properties.borderRadius as number) ?? 6;
          if (buttonRadius > 0) {
            ctx.roundRect(x, y, width, height, buttonRadius);
          } else {
            ctx.rect(x, y, width, height);
          }
          ctx.fill();

          // Text
          ctx.fillStyle = (properties.textColor as string) || "#ffffff";
          ctx.font = `${(properties.fontSize as number) || 14}px Arial`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(
            (properties.text as string) || "Button",
            x + width / 2,
            y + height / 2
          );
          break;

        case "text":
          ctx.fillStyle =
            (properties.textColor as string) ||
            (resolvedTheme === "dark" ? "#ffffff" : "#000000");
          ctx.font = `${(properties.fontSize as number) || 16}px Arial`;
          ctx.textAlign = "left";
          ctx.textBaseline = "top";
          ctx.fillText((properties.text as string) || "Text", x, y);
          break;

        case "input":
          // Background
          ctx.fillStyle =
            (properties.backgroundColor as string) ||
            (resolvedTheme === "dark" ? "#374151" : "#ffffff");
          ctx.strokeStyle = resolvedTheme === "dark" ? "#6b7280" : "#d1d5db";
          ctx.lineWidth = 1;
          ctx.beginPath();
          const inputRadius = (properties.borderRadius as number) ?? 4;
          if (inputRadius > 0) {
            ctx.roundRect(x, y, width, height, inputRadius);
          } else {
            ctx.rect(x, y, width, height);
          }
          ctx.fill();
          ctx.stroke();

          // Placeholder text
          ctx.fillStyle = resolvedTheme === "dark" ? "#d1d5db" : "#9ca3af";
          ctx.font = `${(properties.fontSize as number) || 14}px Arial`;
          ctx.textAlign = "left";
          ctx.textBaseline = "middle";
          ctx.fillText(
            (properties.placeholder as string) || "Input",
            x + 8,
            y + height / 2
          );
          break;

        case "image":
          // Draw image background/border first
          ctx.fillStyle = resolvedTheme === "dark" ? "#374151" : "#f3f4f6";
          ctx.strokeStyle = resolvedTheme === "dark" ? "#6b7280" : "#d1d5db";
          ctx.lineWidth = 1;
          ctx.beginPath();
          const imageRadius = (properties.borderRadius as number) ?? 4;
          if (imageRadius > 0) {
            ctx.roundRect(x, y, width, height, imageRadius);
          } else {
            ctx.rect(x, y, width, height);
          }
          ctx.fill();
          ctx.stroke();

          // Draw image if available
          if (properties.src) {
            const img = loadedImages.get(properties.src as string);
            if (img && img.complete && img.naturalWidth > 0) {
              // Save context for clipping
              ctx.save();

              // Create clipping path with border radius
              ctx.beginPath();
              if (imageRadius > 0) {
                ctx.roundRect(x, y, width, height, imageRadius);
              } else {
                ctx.rect(x, y, width, height);
              }
              ctx.clip();

              // Draw the image to fit within the component bounds
              ctx.drawImage(img, x, y, width, height);

              // Restore context
              ctx.restore();
            } else if (!loadedImages.has(properties.src as string)) {
              // Load the image if not already loading/loaded
              const newImg = new Image();
              newImg.crossOrigin = "anonymous";
              newImg.onload = () => {
                setLoadedImages((prev) => {
                  const newMap = new Map(prev);
                  newMap.set(properties.src as string, newImg);
                  return newMap;
                });
                // Force a redraw when image loads
                requestAnimationFrame(() => {
                  draw();
                });
              };
              newImg.onerror = (e) => {
                console.error("Failed to load image:", properties.src, e);
                setLoadedImages((prev) => {
                  const newMap = new Map(prev);
                  newMap.delete(properties.src as string);
                  return newMap;
                });
              };
              newImg.src = properties.src as string;
              setLoadedImages((prev) => {
                const newMap = new Map(prev);
                newMap.set(properties.src as string, newImg);
                return newMap;
              });

              // Show loading indicator
              ctx.fillStyle = resolvedTheme === "dark" ? "#d1d5db" : "#9ca3af";
              ctx.font = "12px Arial";
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.fillText("Loading...", x + width / 2, y + height / 2);
            } else {
              // Image is loading
              ctx.fillStyle = resolvedTheme === "dark" ? "#d1d5db" : "#9ca3af";
              ctx.font = "12px Arial";
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.fillText("Loading...", x + width / 2, y + height / 2);
            }
          } else {
            // Default placeholder when no image
            ctx.fillStyle = resolvedTheme === "dark" ? "#d1d5db" : "#9ca3af";
            ctx.font = "24px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("🖼️", x + width / 2, y + height / 2);
          }
          break;
      }

      // Draw resize handles for selected component
      if (isSelected) {
        const handleSize = 8;
        ctx.fillStyle = "#3b82f6";
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1;

        // Corner handles
        const handles = [
          { id: "nw", x: x - handleSize / 2, y: y - handleSize / 2 }, // top-left
          { id: "ne", x: x + width - handleSize / 2, y: y - handleSize / 2 }, // top-right
          { id: "sw", x: x - handleSize / 2, y: y + height - handleSize / 2 }, // bottom-left
          {
            id: "se",
            x: x + width - handleSize / 2,
            y: y + height - handleSize / 2,
          }, // bottom-right
          // Edge handles
          { id: "n", x: x + width / 2 - handleSize / 2, y: y - handleSize / 2 }, // top
          {
            id: "s",
            x: x + width / 2 - handleSize / 2,
            y: y + height - handleSize / 2,
          }, // bottom
          {
            id: "w",
            x: x - handleSize / 2,
            y: y + height / 2 - handleSize / 2,
          }, // left
          {
            id: "e",
            x: x + width - handleSize / 2,
            y: y + height / 2 - handleSize / 2,
          }, // right
        ];

        handles.forEach((handle) => {
          ctx.fillRect(handle.x, handle.y, handleSize, handleSize);
          ctx.strokeRect(handle.x, handle.y, handleSize, handleSize);
        });
      }
    },
    [state.selectedComponent, loadedImages, resolvedTheme]
  );

  const getResizeHandle = (
    x: number,
    y: number,
    component: CanvasComponent
  ) => {
    const handleSize = 8;
    const tolerance = 4; // Add some tolerance for easier clicking
    const { x: cx, y: cy, width, height } = component;

    const handles = [
      {
        id: "nw",
        x: cx - handleSize / 2,
        y: cy - handleSize / 2,
        cursor: "nw-resize",
      },
      {
        id: "ne",
        x: cx + width - handleSize / 2,
        y: cy - handleSize / 2,
        cursor: "ne-resize",
      },
      {
        id: "sw",
        x: cx - handleSize / 2,
        y: cy + height - handleSize / 2,
        cursor: "sw-resize",
      },
      {
        id: "se",
        x: cx + width - handleSize / 2,
        y: cy + height - handleSize / 2,
        cursor: "se-resize",
      },
      {
        id: "n",
        x: cx + width / 2 - handleSize / 2,
        y: cy - handleSize / 2,
        cursor: "n-resize",
      },
      {
        id: "s",
        x: cx + width / 2 - handleSize / 2,
        y: cy + height - handleSize / 2,
        cursor: "s-resize",
      },
      {
        id: "w",
        x: cx - handleSize / 2,
        y: cy + height / 2 - handleSize / 2,
        cursor: "w-resize",
      },
      {
        id: "e",
        x: cx + width - handleSize / 2,
        y: cy + height / 2 - handleSize / 2,
        cursor: "e-resize",
      },
    ];

    for (const handle of handles) {
      if (
        x >= handle.x - tolerance &&
        x <= handle.x + handleSize + tolerance &&
        y >= handle.y - tolerance &&
        y <= handle.y + handleSize + tolerance
      ) {
        return handle;
      }
    }
    return null;
  };

  const duplicateComponent = (
    originalComponent: CanvasComponent,
    offsetX = 20,
    offsetY = 20
  ): CanvasComponent => {
    const newId = `${originalComponent.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    return {
      ...originalComponent,
      id: newId,
      x: Math.max(
        0,
        Math.min(
          state.canvasWidth - originalComponent.width,
          originalComponent.x + offsetX
        )
      ),
      y: Math.max(
        0,
        Math.min(
          state.canvasHeight - originalComponent.height,
          originalComponent.y + offsetY
        )
      ),
    };
  };

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply zoom and pan transformations
    ctx.save();
    ctx.scale(state.zoom, state.zoom);
    ctx.translate(state.panX, state.panY);

    // Draw canvas background
    ctx.fillStyle = state.canvasBackgroundColor;
    ctx.fillRect(0, 0, state.canvasWidth, state.canvasHeight);

    // Draw grid
    ctx.strokeStyle =
      resolvedTheme === "dark" ? "rgba(255,255,255,0.1)" : "#f3f4f6";
    ctx.lineWidth = 1;
    const gridSize = 20;
    for (let x = 0; x < state.canvasWidth; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, state.canvasHeight);
      ctx.stroke();
    }
    for (let y = 0; y < state.canvasHeight; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(state.canvasWidth, y);
      ctx.stroke();
    }

    // Draw canvas boundary
    ctx.strokeStyle = resolvedTheme === "dark" ? "#374151" : "#e5e7eb";
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, state.canvasWidth, state.canvasHeight);

    // Draw components
    state.components.forEach((component) => {
      drawComponent(ctx, component);
    });

    // Show Alt key indicator when pressed
    if (isAltPressed && state.selectedComponent) {
      ctx.fillStyle = "rgba(59, 130, 246, 0.1)";
      ctx.strokeStyle = "#3b82f6";
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 5]);
      ctx.fillRect(10, 10, 200, 30);
      ctx.strokeRect(10, 10, 200, 30);
      ctx.setLineDash([]);

      ctx.fillStyle = "#3b82f6";
      ctx.font = "14px Arial";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText("Alt + Drag to duplicate", 20, 25);
    }

    ctx.restore();
  }, [state, drawComponent, isAltPressed, resolvedTheme]);

  useEffect(() => {
    draw();
  }, [draw]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resizeCanvas = () => {
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;

      canvas.width = newWidth;
      canvas.height = newHeight;

      // Update viewport size in state only if it actually changed
      if (
        state.viewportWidth !== newWidth ||
        state.viewportHeight !== newHeight
      ) {
        dispatch({
          type: "SET_VIEWPORT_SIZE",
          width: newWidth,
          height: newHeight,
        });
      }

      draw();
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [draw, dispatch, state.viewportWidth, state.viewportHeight]);

  // Add this useEffect after the existing ones, before the keyboard event handlers:

  // Center canvas when viewport size is properly detected
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      const width = container.clientWidth;
      const height = container.clientHeight;

      // Only update and center if we have valid dimensions and they've changed
      if (
        width > 0 &&
        height > 0 &&
        (width !== state.viewportWidth || height !== state.viewportHeight)
      ) {
        dispatch({ type: "SET_VIEWPORT_SIZE", width, height });

        // Center the canvas after a brief delay to ensure state is updated
        setTimeout(() => {
          dispatch({ type: "CENTER_CANVAS" });
        }, 100);
      }
    }
  }, [state.viewportWidth, state.viewportHeight, dispatch]);

  // Also add an initial centering effect
  useEffect(() => {
    // Center canvas on initial load
    const timer = setTimeout(() => {
      dispatch({ type: "CENTER_CANVAS" });
    }, 500);

    return () => clearTimeout(timer);
  }, [dispatch]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Alt") {
        setIsAltPressed(true);
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        if (state.selectedComponent) {
          e.preventDefault();
          dispatch({ type: "DELETE_COMPONENT", id: state.selectedComponent });
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Alt") {
        setIsAltPressed(false);
      }
    };

    // Add event listeners to window
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // Cleanup
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [state.selectedComponent, dispatch]);

  const getMousePos = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - state.panX * state.zoom) / state.zoom;
    const y = (e.clientY - rect.top - state.panY * state.zoom) / state.zoom;
    return { x, y };
  };

  const getComponentAt = (x: number, y: number) => {
    for (let i = state.components.length - 1; i >= 0; i--) {
      const comp = state.components[i];
      if (
        x >= comp.x &&
        x <= comp.x + comp.width &&
        y >= comp.y &&
        y <= comp.y + comp.height
      ) {
        return comp;
      }
    }
    return null;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const pos = getMousePos(e);
    const component = getComponentAt(pos.x, pos.y);

    if (component && state.selectedComponent === component.id) {
      // Check if clicking on a resize handle first
      const handle = getResizeHandle(pos.x, pos.y, component);
      if (handle) {
        e.preventDefault();
        setIsResizing(true);
        setResizeHandle(handle.id);
        setDragComponent(component.id);
        setResizeStart({
          x: pos.x,
          y: pos.y,
          width: component.width,
          height: component.height,
        });
        return;
      }
    }

    if (component) {
      // Check if Alt is pressed for duplication
      if (isAltPressed) {
        const duplicated = duplicateComponent(component);
        dispatch({ type: "ADD_COMPONENT", component: duplicated });
        dispatch({ type: "SELECT_COMPONENT", id: duplicated.id });
        setIsDragging(true);
        setDragStart({ x: pos.x - duplicated.x, y: pos.y - duplicated.y });
        setDragComponent(duplicated.id);
      } else {
        dispatch({ type: "SELECT_COMPONENT", id: component.id });
        setIsDragging(true);
        setDragStart({ x: pos.x - component.x, y: pos.y - component.y });
        setDragComponent(component.id);
      }
    } else {
      dispatch({ type: "SELECT_COMPONENT", id: null });
      if (e.button === 0) {
        setIsPanning(true);
        setPanStart({ x: e.clientX - state.panX, y: e.clientY - state.panY });
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const pos = getMousePos(e);

    // Update cursor based on hover state
    const canvas = canvasRef.current;
    if (
      canvas &&
      state.selectedComponent &&
      !isResizing &&
      !isDragging &&
      !isPanning
    ) {
      const selectedComp = state.components.find(
        (c) => c.id === state.selectedComponent
      );
      if (selectedComp) {
        const handle = getResizeHandle(pos.x, pos.y, selectedComp);
        if (handle) {
          canvas.style.cursor = handle.cursor;
        } else if (isAltPressed) {
          canvas.style.cursor = "copy";
        } else {
          canvas.style.cursor = "move";
        }
      }
    } else if (
      canvas &&
      isAltPressed &&
      !isDragging &&
      !isPanning &&
      !isResizing
    ) {
      const component = getComponentAt(pos.x, pos.y);
      canvas.style.cursor = component ? "copy" : "crosshair";
    }

    if (isResizing && dragComponent && resizeHandle) {
      const selectedComp = state.components.find((c) => c.id === dragComponent);
      if (selectedComp) {
        const deltaX = pos.x - resizeStart.x;
        const deltaY = pos.y - resizeStart.y;

        let newX = selectedComp.x;
        let newY = selectedComp.y;
        let newWidth = resizeStart.width;
        let newHeight = resizeStart.height;

        // Handle different resize directions with canvas boundary constraints
        switch (resizeHandle) {
          case "se": // bottom-right
            newWidth = Math.max(
              20,
              Math.min(
                state.canvasWidth - selectedComp.x,
                resizeStart.width + deltaX
              )
            );
            newHeight = Math.max(
              20,
              Math.min(
                state.canvasHeight - selectedComp.y,
                resizeStart.height + deltaY
              )
            );
            break;
          case "sw": // bottom-left
            const maxWidthSW = Math.min(
              resizeStart.width + selectedComp.x,
              resizeStart.width - deltaX
            );
            newWidth = Math.max(20, maxWidthSW);
            newHeight = Math.max(
              20,
              Math.min(
                state.canvasHeight - selectedComp.y,
                resizeStart.height + deltaY
              )
            );
            if (newWidth !== selectedComp.width) {
              newX = selectedComp.x + (selectedComp.width - newWidth);
            }
            break;
          case "ne": // top-right
            newWidth = Math.max(
              20,
              Math.min(
                state.canvasWidth - selectedComp.x,
                resizeStart.width + deltaX
              )
            );
            const maxHeightNE = Math.min(
              resizeStart.height + selectedComp.y,
              resizeStart.height - deltaY
            );
            newHeight = Math.max(20, maxHeightNE);
            if (newHeight !== selectedComp.height) {
              newY = selectedComp.y + (selectedComp.height - newHeight);
            }
            break;
          case "nw": // top-left
            const maxWidthNW = Math.min(
              resizeStart.width + selectedComp.x,
              resizeStart.width - deltaX
            );
            newWidth = Math.max(20, maxWidthNW);
            const maxHeightNW = Math.min(
              resizeStart.height + selectedComp.y,
              resizeStart.height - deltaY
            );
            newHeight = Math.max(20, maxHeightNW);
            if (newWidth !== selectedComp.width) {
              newX = selectedComp.x + (selectedComp.width - newWidth);
            }
            if (newHeight !== selectedComp.height) {
              newY = selectedComp.y + (selectedComp.height - newHeight);
            }
            break;
          case "n": // top
            const maxHeightN = Math.min(
              resizeStart.height + selectedComp.y,
              resizeStart.height - deltaY
            );
            newHeight = Math.max(20, maxHeightN);
            if (newHeight !== selectedComp.height) {
              newY = selectedComp.y + (selectedComp.height - newHeight);
            }
            break;
          case "s": // bottom
            newHeight = Math.max(
              20,
              Math.min(
                state.canvasHeight - selectedComp.y,
                resizeStart.height + deltaY
              )
            );
            break;
          case "w": // left
            const maxWidthW = Math.min(
              resizeStart.width + selectedComp.x,
              resizeStart.width - deltaX
            );
            newWidth = Math.max(20, maxWidthW);
            if (newWidth !== selectedComp.width) {
              newX = selectedComp.x + (selectedComp.width - newWidth);
            }
            break;
          case "e": // right
            newWidth = Math.max(
              20,
              Math.min(
                state.canvasWidth - selectedComp.x,
                resizeStart.width + deltaX
              )
            );
            break;
        }

        // Ensure the component stays within canvas bounds
        newX = Math.max(0, Math.min(state.canvasWidth - newWidth, newX));
        newY = Math.max(0, Math.min(state.canvasHeight - newHeight, newY));

        dispatch({
          type: "UPDATE_COMPONENT",
          id: dragComponent,
          updates: { x: newX, y: newY, width: newWidth, height: newHeight },
        });
      }
    } else if (isDragging && dragComponent && !isResizing) {
      const selectedComp = state.components.find((c) => c.id === dragComponent);
      if (selectedComp) {
        const newX = Math.max(
          0,
          Math.min(state.canvasWidth - selectedComp.width, pos.x - dragStart.x)
        );
        const newY = Math.max(
          0,
          Math.min(
            state.canvasHeight - selectedComp.height,
            pos.y - dragStart.y
          )
        );

        dispatch({
          type: "UPDATE_COMPONENT",
          id: dragComponent,
          updates: { x: newX, y: newY },
        });
      }
    } else if (isPanning) {
      dispatch({
        type: "SET_PAN",
        panX: e.clientX - panStart.x,
        panY: e.clientY - panStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragComponent(null);
    setIsPanning(false);
    setIsResizing(false);
    setResizeHandle(null);

    // Reset cursor
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.style.cursor = "crosshair";
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    dispatch({ type: "SET_ZOOM", zoom: state.zoom + delta });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const componentType = e.dataTransfer.getData("componentType");
    if (componentType) {
      const pos = getMousePos(e as React.MouseEvent);
      const component: CanvasComponent = {
        id: `${componentType}-${Date.now()}`,
        type: componentType as CanvasComponent["type"],
        x: pos.x,
        y: pos.y,
        width: 120,
        height: 40,
        properties:
          componentType === "button"
            ? {
                text: "Button",
                backgroundColor: "#3b82f6",
                textColor: "#ffffff",
                fontSize: 14,
                borderRadius: 6,
              }
            : componentType === "text"
              ? {
                  text: "Text Label",
                  textColor: resolvedTheme === "dark" ? "#ffffff" : "#000000",
                  fontSize: 16,
                }
              : componentType === "image"
                ? {
                    src: "",
                    borderRadius: 4,
                  }
                : {},
      };
      dispatch({ type: "ADD_COMPONENT", component });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  useEffect(() => {
    draw();
  }, [draw, loadedImages]);

  // Update canvas background color when theme changes
  useEffect(() => {
    if (resolvedTheme) {
      const newBackgroundColor =
        resolvedTheme === "dark" ? "#171717" : "#ffffff";
      if (state.canvasBackgroundColor !== newBackgroundColor) {
        dispatch({ type: "SET_CANVAS_BACKGROUND", color: newBackgroundColor });
      }
    }
  }, [resolvedTheme, state.canvasBackgroundColor, dispatch]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-hidden"
      tabIndex={0}
      style={{
        outline: "none",
        backgroundColor: resolvedTheme === "dark" ? "#171717" : "#f3f4f6",
      }}
    >
      <canvas
        ref={canvasRef}
        className="cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      />
    </div>
  );
}
