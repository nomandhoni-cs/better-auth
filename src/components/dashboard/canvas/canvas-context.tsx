"use client";

import type React from "react";
import { createContext, useContext, useReducer, type Dispatch } from "react";

export type CanvasComponent = {
  id: string;
  type: "button" | "text" | "input" | "image";
  x: number;
  y: number;
  width: number;
  height: number;
  properties: Record<string, string | number | boolean>;
};

export type Template = {
  id: string;
  name: string;
  description: string;
  deviceType: string;
  resolution: { width: number; height: number };
  components: CanvasComponent[];
};

type CanvasState = {
  components: CanvasComponent[];
  selectedComponent: string | null;
  canvasWidth: number;
  canvasHeight: number;
  viewportWidth: number;
  viewportHeight: number;
  zoom: number;
  panX: number;
  panY: number;
  canvasBackgroundColor: string;
  history: CanvasComponent[][];
  historyIndex: number;
};

type CanvasAction =
  | { type: "ADD_COMPONENT"; component: CanvasComponent }
  | { type: "UPDATE_COMPONENT"; id: string; updates: Partial<CanvasComponent> }
  | { type: "DELETE_COMPONENT"; id: string }
  | { type: "SELECT_COMPONENT"; id: string | null }
  | { type: "SET_CANVAS_SIZE"; width: number; height: number }
  | { type: "SET_VIEWPORT_SIZE"; width: number; height: number }
  | { type: "SET_ZOOM"; zoom: number }
  | { type: "SET_PAN"; panX: number; panY: number }
  | { type: "SET_CANVAS_BACKGROUND"; color: string }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "LOAD_LAYOUT"; components: CanvasComponent[] }
  | { type: "LOAD_TEMPLATE"; template: Template }
  | { type: "CENTER_CANVAS" };

const initialCanvasState: CanvasState = {
  components: [],
  selectedComponent: null,
  canvasWidth: 800,
  canvasHeight: 600,
  viewportWidth: 0,
  viewportHeight: 0,
  zoom: 1,
  panX: 0,
  panY: 0,
  canvasBackgroundColor: "#ffffff",
  history: [],
  historyIndex: -1,
};

const canvasReducer = (
  state: CanvasState,
  action: CanvasAction
): CanvasState => {
  switch (action.type) {
    case "ADD_COMPONENT":
      const newComponentsAdd = [...state.components, action.component];
      return {
        ...state,
        components: newComponentsAdd,
        history: [
          ...state.history.slice(0, state.historyIndex + 1),
          newComponentsAdd,
        ],
        historyIndex: state.historyIndex + 1,
      };
    case "UPDATE_COMPONENT":
      const newComponentsUpdate = state.components.map((component) =>
        component.id === action.id
          ? { ...component, ...action.updates }
          : component
      );
      return {
        ...state,
        components: newComponentsUpdate,
        history: [
          ...state.history.slice(0, state.historyIndex + 1),
          newComponentsUpdate,
        ],
        historyIndex: state.historyIndex + 1,
      };
    case "DELETE_COMPONENT":
      const newComponentsDelete = state.components.filter(
        (component) => component.id !== action.id
      );
      return {
        ...state,
        components: newComponentsDelete,
        selectedComponent: null,
        history: [
          ...state.history.slice(0, state.historyIndex + 1),
          newComponentsDelete,
        ],
        historyIndex: state.historyIndex + 1,
      };
    case "SELECT_COMPONENT":
      return { ...state, selectedComponent: action.id };
    case "SET_CANVAS_SIZE":
      return {
        ...state,
        canvasWidth: action.width,
        canvasHeight: action.height,
      };
    case "SET_VIEWPORT_SIZE":
      return {
        ...state,
        viewportWidth: action.width,
        viewportHeight: action.height,
      };
    case "SET_ZOOM":
      return { ...state, zoom: Math.max(0.1, Math.min(3, action.zoom)) };
    case "SET_PAN":
      return { ...state, panX: action.panX, panY: action.panY };
    case "SET_CANVAS_BACKGROUND":
      return { ...state, canvasBackgroundColor: action.color };
    case "UNDO":
      if (state.historyIndex > 0) {
        return {
          ...state,
          components: state.history[state.historyIndex - 1],
          historyIndex: state.historyIndex - 1,
          selectedComponent: null,
        };
      }
      return state;
    case "REDO":
      if (state.historyIndex < state.history.length - 1) {
        return {
          ...state,
          components: state.history[state.historyIndex + 1],
          historyIndex: state.historyIndex + 1,
          selectedComponent: null,
        };
      }
      return state;
    case "LOAD_LAYOUT":
      return {
        ...state,
        components: action.components,
        history: [
          ...state.history.slice(0, state.historyIndex + 1),
          action.components,
        ],
        historyIndex: state.historyIndex + 1,
      };
    case "LOAD_TEMPLATE":
      return {
        ...state,
        components: action.template.components,
        canvasWidth: action.template.resolution.width,
        canvasHeight: action.template.resolution.height,
        history: [
          ...state.history.slice(0, state.historyIndex + 1),
          action.template.components,
        ],
        historyIndex: state.historyIndex + 1,
      };
    case "CENTER_CANVAS": {
      const panX =
        state.viewportWidth / 2 - (state.canvasWidth * state.zoom) / 2;
      const panY =
        state.viewportHeight / 2 - (state.canvasHeight * state.zoom) / 2;
      return { ...state, panX, panY };
    }
    default:
      return state;
  }
};

const CanvasContext = createContext<{
  state: CanvasState;
  dispatch: Dispatch<CanvasAction>;
}>({
  state: initialCanvasState,
  dispatch: () => null,
});

export const CanvasProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(canvasReducer, initialCanvasState);

  return (
    <CanvasContext.Provider value={{ state, dispatch }}>
      {children}
    </CanvasContext.Provider>
  );
};

export const useCanvas = () => useContext(CanvasContext);

export const DEVICE_TEMPLATES: Template[] = [
  {
    id: "blank-tablet",
    name: "Blank Tablet",
    description: "A blank canvas for tablet layouts.",
    deviceType: "Tablet",
    resolution: { width: 1024, height: 768 },
    components: [],
  },
  {
    id: "tablet-dashboard",
    name: "Tablet Dashboard",
    description: "A simple dashboard layout for tablets.",
    deviceType: "Tablet",
    resolution: { width: 1024, height: 768 },
    components: [
      {
        id: "button-1",
        type: "button",
        x: 50,
        y: 50,
        width: 150,
        height: 50,
        properties: {
          text: "Button 1",
          backgroundColor: "#4CAF50",
          textColor: "#fff",
        },
      },
      {
        id: "text-1",
        type: "text",
        x: 50,
        y: 150,
        width: 200,
        height: 30,
        properties: { text: "Some Text", textColor: "#333" },
      },
    ],
  },
  {
    id: "phone-app",
    name: "Phone App Layout",
    description: "Basic layout for a phone application.",
    deviceType: "Phone",
    resolution: { width: 375, height: 667 },
    components: [
      {
        id: "text-phone",
        type: "text",
        x: 20,
        y: 20,
        width: 100,
        height: 20,
        properties: { text: "Phone App", textColor: "#000" },
      },
    ],
  },
  {
    id: "kiosk-info",
    name: "Kiosk Information Panel",
    description: "A template for a kiosk information display.",
    deviceType: "Kiosk",
    resolution: { width: 1920, height: 1080 },
    components: [
      {
        id: "text-kiosk",
        type: "text",
        x: 100,
        y: 100,
        width: 400,
        height: 50,
        properties: {
          text: "Welcome to our Kiosk",
          fontSize: 32,
          textColor: "#000",
        },
      },
    ],
  },
];
