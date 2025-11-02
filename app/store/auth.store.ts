import { create } from "zustand";
import { z } from "zod";
import { createJSONStorage, persist } from "zustand/middleware";
import { AuthSchema } from "~/services/api/auth/auth.schema";
const { UserSchema } = AuthSchema;
export type User = z.infer<typeof UserSchema>;

interface AuthState {
  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user: User) => set({ user }),
      clearUser: () => set({ user: null }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
