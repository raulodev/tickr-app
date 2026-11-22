"use client";

import { create } from "zustand";

import type { Role } from "@/generated/api/model";

/**
 * Datos del usuario autenticado que se comparten entre componentes.
 * `id` y `tenantId` vienen de `/api/auth/me`; el resto de la sesión de GitHub.
 */
export interface CurrentUser {
  id: string;
  tenantId: string | null;
  role: Role | null;
  name: string | null;
  email: string | null;
  image: string | null;
}

interface AppState {
  currentUser: CurrentUser | null;
  setCurrentUser: (user: CurrentUser | null) => void;
  /** Actualiza solo los campos indicados (por ejemplo tras cambiar de rol). */
  updateCurrentUser: (patch: Partial<CurrentUser>) => void;
  clearCurrentUser: () => void;
}

export const useAppStore = create<AppState>()((set) => ({
  currentUser: null,
  setCurrentUser: (currentUser) => set({ currentUser }),
  updateCurrentUser: (patch) =>
    set((state) =>
      state.currentUser
        ? { currentUser: { ...state.currentUser, ...patch } }
        : {},
    ),
  clearCurrentUser: () => set({ currentUser: null }),
}));

export const selectCurrentUser = (state: AppState) => state.currentUser;
