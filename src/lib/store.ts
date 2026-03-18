import { create } from "zustand";
import type { ObjectiveFilters, Toast, User } from "@/types";

interface AppState {
  activePeriodId: string | null;
  setActivePeriodId: (id: string) => void;

  filters: ObjectiveFilters;
  setFilters: (filters: Partial<ObjectiveFilters>) => void;
  resetFilters: () => void;

  sidebarOpen: boolean;
  toggleSidebar: () => void;

  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;

  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
}

const defaultFilters: ObjectiveFilters = {
  level: "all",
  status: "all",
  confidence: "all",
  teamId: "all",
  periodId: "",
  search: "",
};

export const useStore = create<AppState>((set) => ({
  activePeriodId: null,
  setActivePeriodId: (id) => set({ activePeriodId: id }),

  filters: defaultFilters,
  setFilters: (partial) =>
    set((state) => ({ filters: { ...state.filters, ...partial } })),
  resetFilters: () => set({ filters: defaultFilters }),

  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  toasts: [],
  addToast: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id: crypto.randomUUID() }],
    })),
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

  currentUser: null,
  setCurrentUser: (user) => set({ currentUser: user }),
}));
