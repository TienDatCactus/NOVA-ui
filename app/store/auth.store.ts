import { create } from "zustand";
import { z } from "zod";
import useAuthSchema from "~/services/schema/auth.schema";
const { UserSchema } = useAuthSchema();
export type User = z.infer<typeof UserSchema>;

interface AuthState {
  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));
