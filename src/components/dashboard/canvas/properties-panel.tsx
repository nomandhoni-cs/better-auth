"use client";
import { Input } from "@/components/ui/input";
import type React from "react";

import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useCanvas } from "./canvas-context";
import { Settings, Palette, Move, Paintbrush, Upload, X } from "lucide-react";
import { useRef } from "react";
import { useTheme } from "next-themes";

export function PropertiesPanel() {
  const { state, dispatch } = useCanvas();
  const { resolvedTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedComponent = state.components.find(
    (comp) => comp.id === state.selectedComponent
  );

  const updateProperty = (key: string, value: string | number) => {
    if (!selectedComponent) return;

    dispatch({
      type: "UPDATE_COMPONENT",
      id: selectedComponent.id,
      updates: {
        properties: {
          ...selectedComponent.properties,
          [key]: value,
        },
      },
    });
  };

  const updatePosition = (key: "x" | "y", value: number) => {
    if (!selectedComponent) return;

    dispatch({
      type: "UPDATE_COMPONENT",
      id: selectedComponent.id,
      updates: { [key]: value },
    });
  };

  const updateSize = (key: "width" | "height", value: number) => {
    if (!selectedComponent) return;

    dispatch({
      type: "UPDATE_COMPONENT",
      id: selectedComponent.id,
      updates: { [key]: Math.max(10, value) },
    });
  };

  const updateCanvasBackground = (color: string) => {
    dispatch({ type: "SET_CANVAS_BACKGROUND", color });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && selectedComponent) {
      // Check if file is an image
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }

      // Create a FileReader to convert the image to base64
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageDataUrl = e.target?.result as string;
        updateProperty("src", imageDataUrl);
        updateProperty("fileName", file.name);
      };
      reader.onerror = (e) => {
        console.error("FileReader error:", e);
        alert("Failed to read the image file");
      };
      reader.readAsDataURL(file);
    }
    // Reset the input so the same file can be selected again
    event.target.value = "";
  };

  const removeImage = () => {
    if (selectedComponent) {
      updateProperty("src", "");
      updateProperty("fileName", "");
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 ">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Properties
        </h2>
        {selectedComponent ? (
          <p
            className={`text-sm mt-1 ${resolvedTheme === "dark" ? "text-gray-400" : "text-gray-600"}`}
          >
            {selectedComponent.type.charAt(0).toUpperCase() +
              selectedComponent.type.slice(1)}{" "}
            Component
          </p>
        ) : (
          <p
            className={`text-sm mt-1 ${resolvedTheme === "dark" ? "text-gray-400" : "text-gray-600"}`}
          >
            Canvas Settings
          </p>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Canvas Background Color - Always visible when no component is selected */}
          {!selectedComponent && (
            <>
              <div>
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Paintbrush className="h-4 w-4" />
                  Canvas Background
                </h3>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="canvas-background">Background Color</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        id="canvas-background"
                        type="color"
                        value={state.canvasBackgroundColor}
                        onChange={(e) => updateCanvasBackground(e.target.value)}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        type="text"
                        value={state.canvasBackgroundColor}
                        onChange={(e) => {
                          if (e.target.value.match(/^#[0-9A-F]{6}$/i)) {
                            updateCanvasBackground(e.target.value);
                          }
                        }}
                        className="flex-1"
                      />
                    </div>
                    <p
                      className={`text-xs mt-1 ${resolvedTheme === "dark" ? "text-gray-400" : "text-gray-500"}`}
                    >
                      Click on empty canvas area to access canvas settings
                    </p>
                  </div>
                </div>
              </div>
              <Separator />
              <div
                className={`text-center py-8 ${resolvedTheme === "dark" ? "text-gray-400" : "text-gray-500"}`}
              >
                <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a component to edit its properties</p>
              </div>
            </>
          )}

          {selectedComponent && (
            <>
              {/* Position & Size */}
              <div>
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Move className="h-4 w-4" />
                  Position & Size
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="x">X Position</Label>
                    <Input
                      id="x"
                      type="number"
                      value={selectedComponent.x}
                      onChange={(e) =>
                        updatePosition(
                          "x",
                          Number.parseInt(e.target.value) || 0
                        )
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="y">Y Position</Label>
                    <Input
                      id="y"
                      type="number"
                      value={selectedComponent.y}
                      onChange={(e) =>
                        updatePosition(
                          "y",
                          Number.parseInt(e.target.value) || 0
                        )
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="width">Width</Label>
                    <Input
                      id="width"
                      type="number"
                      value={selectedComponent.width}
                      onChange={(e) =>
                        updateSize(
                          "width",
                          Number.parseInt(e.target.value) || 10
                        )
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="height">Height</Label>
                    <Input
                      id="height"
                      type="number"
                      value={selectedComponent.height}
                      onChange={(e) =>
                        updateSize(
                          "height",
                          Number.parseInt(e.target.value) || 10
                        )
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Component-specific properties */}
              {selectedComponent.type === "button" && (
                <div>
                  <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Button Properties
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="text">Button Text</Label>
                      <Input
                        id="text"
                        value={
                          (selectedComponent.properties.text as string) || ""
                        }
                        onChange={(e) => updateProperty("text", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="backgroundColor">Background Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="backgroundColor"
                          type="color"
                          value={
                            (selectedComponent.properties
                              .backgroundColor as string) || "#3b82f6"
                          }
                          onChange={(e) =>
                            updateProperty("backgroundColor", e.target.value)
                          }
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          value={
                            (selectedComponent.properties
                              .backgroundColor as string) || "#3b82f6"
                          }
                          onChange={(e) =>
                            updateProperty("backgroundColor", e.target.value)
                          }
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="textColor">Text Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="textColor"
                          type="color"
                          value={
                            (selectedComponent.properties
                              .textColor as string) || "#ffffff"
                          }
                          onChange={(e) =>
                            updateProperty("textColor", e.target.value)
                          }
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          value={
                            (selectedComponent.properties
                              .textColor as string) || "#ffffff"
                          }
                          onChange={(e) =>
                            updateProperty("textColor", e.target.value)
                          }
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>
                        Font Size:{" "}
                        {(selectedComponent.properties.fontSize as number) ||
                          14}
                        px
                      </Label>
                      <Slider
                        value={[
                          (selectedComponent.properties.fontSize as number) ||
                            14,
                        ]}
                        onValueChange={(value) =>
                          updateProperty("fontSize", value[0])
                        }
                        max={32}
                        min={8}
                        step={1}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>
                        Border Radius:{" "}
                        {(selectedComponent.properties
                          .borderRadius as number) || 6}
                        px
                      </Label>
                      <div className="flex gap-2 mt-2">
                        <Slider
                          value={[
                            (selectedComponent.properties
                              .borderRadius as number) ?? 6,
                          ]}
                          onValueChange={(value) =>
                            updateProperty("borderRadius", value[0])
                          }
                          max={20}
                          min={0}
                          step={1}
                          className="flex-1"
                        />
                        <Input
                          type="number"
                          value={
                            (selectedComponent.properties
                              .borderRadius as number) ?? 6
                          }
                          onChange={(e) =>
                            updateProperty(
                              "borderRadius",
                              Math.max(
                                0,
                                Math.min(20, Number(e.target.value) || 0)
                              )
                            )
                          }
                          className="w-16"
                          min={0}
                          max={20}
                        />
                      </div>
                      <div
                        className={`flex justify-between text-xs mt-1 ${resolvedTheme === "dark" ? "text-gray-400" : "text-gray-500"}`}
                      >
                        <span>0px (Square)</span>
                        <span>20px (Rounded)</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedComponent.type === "text" && (
                <div>
                  <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Text Properties
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="text">Text Content</Label>
                      <Input
                        id="text"
                        value={
                          (selectedComponent.properties.text as string) || ""
                        }
                        onChange={(e) => updateProperty("text", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="textColor">Text Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="textColor"
                          type="color"
                          value={
                            (selectedComponent.properties
                              .textColor as string) || "#000000"
                          }
                          onChange={(e) =>
                            updateProperty("textColor", e.target.value)
                          }
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          value={
                            (selectedComponent.properties
                              .textColor as string) || "#000000"
                          }
                          onChange={(e) =>
                            updateProperty("textColor", e.target.value)
                          }
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>
                        Font Size:{" "}
                        {(selectedComponent.properties.fontSize as number) ||
                          16}
                        px
                      </Label>
                      <Slider
                        value={[
                          (selectedComponent.properties.fontSize as number) ||
                            16,
                        ]}
                        onValueChange={(value) =>
                          updateProperty("fontSize", value[0])
                        }
                        max={48}
                        min={8}
                        step={1}
                        className="mt-2"
                      />
                    </div>
                  </div>
                </div>
              )}

              {selectedComponent.type === "input" && (
                <div>
                  <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Input Properties
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="placeholder">Placeholder Text</Label>
                      <Input
                        id="placeholder"
                        value={
                          (selectedComponent.properties
                            .placeholder as string) || ""
                        }
                        onChange={(e) =>
                          updateProperty("placeholder", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="backgroundColor">Background Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="backgroundColor"
                          type="color"
                          value={
                            (selectedComponent.properties
                              .backgroundColor as string) || "#ffffff"
                          }
                          onChange={(e) =>
                            updateProperty("backgroundColor", e.target.value)
                          }
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          value={
                            (selectedComponent.properties
                              .backgroundColor as string) || "#ffffff"
                          }
                          onChange={(e) =>
                            updateProperty("backgroundColor", e.target.value)
                          }
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>
                        Font Size:{" "}
                        {(selectedComponent.properties.fontSize as number) ||
                          14}
                        px
                      </Label>
                      <Slider
                        value={[
                          (selectedComponent.properties.fontSize as number) ||
                            14,
                        ]}
                        onValueChange={(value) =>
                          updateProperty("fontSize", value[0])
                        }
                        max={24}
                        min={8}
                        step={1}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>
                        Border Radius:{" "}
                        {(selectedComponent.properties
                          .borderRadius as number) || 4}
                        px
                      </Label>
                      <div className="flex gap-2 mt-2">
                        <Slider
                          value={[
                            (selectedComponent.properties
                              .borderRadius as number) ?? 4,
                          ]}
                          onValueChange={(value) =>
                            updateProperty("borderRadius", value[0])
                          }
                          max={20}
                          min={0}
                          step={1}
                          className="flex-1"
                        />
                        <Input
                          type="number"
                          value={
                            (selectedComponent.properties
                              .borderRadius as number) ?? 4
                          }
                          onChange={(e) =>
                            updateProperty(
                              "borderRadius",
                              Math.max(
                                0,
                                Math.min(20, Number(e.target.value) || 0)
                              )
                            )
                          }
                          className="w-16"
                          min={0}
                          max={20}
                        />
                      </div>
                      <div
                        className={`flex justify-between text-xs mt-1 ${resolvedTheme === "dark" ? "text-gray-400" : "text-gray-500"}`}
                      >
                        <span>0px (Square)</span>
                        <span>20px (Rounded)</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedComponent.type === "image" && (
                <div>
                  <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Image Properties
                  </h3>
                  <div className="space-y-3">
                    {/* Debug Info */}
                    {selectedComponent.properties.src && (
                      <div
                        className={`p-2 rounded text-xs ${resolvedTheme === "dark" ? "bg-gray-800" : "bg-gray-100"}`}
                      >
                        <div>
                          Image Source:{" "}
                          {(
                            selectedComponent.properties.src as string
                          ).substring(0, 50)}
                          ...
                        </div>
                        <div>
                          Type:{" "}
                          {(
                            selectedComponent.properties.src as string
                          ).startsWith("data:")
                            ? "Uploaded File"
                            : "URL"}
                        </div>
                      </div>
                    )}

                    {/* Image Upload Section */}
                    <div>
                      <Label>Upload Image</Label>
                      <div className="mt-2 space-y-2">
                        <Button
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Choose Image from PC
                        </Button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        {selectedComponent.properties.fileName && (
                          <div
                            className={`flex items-center justify-between p-2 rounded text-sm ${resolvedTheme === "dark" ? "bg-gray-800" : "bg-gray-50"}`}
                          >
                            <span className="truncate">
                              {selectedComponent.properties.fileName}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={removeImage}
                              className="h-6 w-6 p-0"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    <Separator />

                    {/* Manual URL Input */}
                    <div>
                      <Label htmlFor="src">Or Enter Image URL</Label>
                      <Input
                        id="src"
                        value={
                          (
                            selectedComponent.properties.src as string
                          )?.startsWith("data:")
                            ? ""
                            : (selectedComponent.properties.src as string) || ""
                        }
                        onChange={(e) => {
                          updateProperty("src", e.target.value);
                          updateProperty("fileName", "");
                        }}
                        placeholder="https://example.com/image.jpg"
                      />
                      <p
                        className={`text-xs mt-1 ${resolvedTheme === "dark" ? "text-gray-400" : "text-gray-500"}`}
                      >
                        You can upload from PC or paste an image URL
                      </p>
                    </div>

                    <div>
                      <Label>
                        Border Radius:{" "}
                        {selectedComponent.properties.borderRadius ?? 4}px
                      </Label>
                      <div className="flex gap-2 mt-2">
                        <Slider
                          value={[
                            (selectedComponent.properties
                              .borderRadius as number) ?? 4,
                          ]}
                          onValueChange={(value) =>
                            updateProperty("borderRadius", value[0])
                          }
                          max={20}
                          min={0}
                          step={1}
                          className="flex-1"
                        />
                        <Input
                          type="number"
                          value={
                            (selectedComponent.properties
                              .borderRadius as number) ?? 4
                          }
                          onChange={(e) =>
                            updateProperty(
                              "borderRadius",
                              Math.max(
                                0,
                                Math.min(20, Number(e.target.value) || 0)
                              )
                            )
                          }
                          className="w-16"
                          min={0}
                          max={20}
                        />
                      </div>
                      <div
                        className={`flex justify-between text-xs mt-1 ${resolvedTheme === "dark" ? "text-gray-400" : "text-gray-500"}`}
                      >
                        <span>0px (Square)</span>
                        <span>20px (Rounded)</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
