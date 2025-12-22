import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface SavedAccount {
  id: string;
  userName: string;
  fullName?: string;
  roles: string[];
  addedAt: string; // ISO timestamp
  lastUsed: string; // ISO timestamp
}

interface AccountManagerState {
  accounts: SavedAccount[];
  addAccount: (account: Omit<SavedAccount, "addedAt" | "lastUsed">) => void;
  removeAccount: (userId: string) => void;
  updateLastUsed: (userId: string) => void;
  getAccounts: () => SavedAccount[];
  clearAll: () => void;
}

const MAX_ACCOUNTS = 5;

export const useAccountManager = create<AccountManagerState>()(
  persist(
    (set, get) => ({
      accounts: [],

      addAccount: (account) => {
        const now = new Date().toISOString();
        const exists = get().accounts.find((acc) => acc.id === account.id);

        if (exists) {
          // Update existing account's lastUsed
          set((state) => ({
            accounts: state.accounts.map((acc) =>
              acc.id === account.id
                ? {
                    ...acc,
                    lastUsed: now,
                    fullName: account.fullName,
                    roles: account.roles,
                  }
                : acc
            ),
          }));
          return;
        }

        // Add new account
        set((state) => {
          let newAccounts = [
            ...state.accounts,
            { ...account, addedAt: now, lastUsed: now },
          ];

          // Limit to MAX_ACCOUNTS, remove oldest by lastUsed
          if (newAccounts.length > MAX_ACCOUNTS) {
            newAccounts.sort(
              (a, b) =>
                new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime()
            );
            newAccounts = newAccounts.slice(0, MAX_ACCOUNTS);
          }

          return { accounts: newAccounts };
        });
      },

      removeAccount: (userId) => {
        set((state) => ({
          accounts: state.accounts.filter((acc) => acc.id !== userId),
        }));
      },

      updateLastUsed: (userId) => {
        const now = new Date().toISOString();
        set((state) => ({
          accounts: state.accounts.map((acc) =>
            acc.id === userId ? { ...acc, lastUsed: now } : acc
          ),
        }));
      },

      getAccounts: () => {
        // Return sorted by lastUsed desc
        return get().accounts.sort(
          (a, b) =>
            new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime()
        );
      },

      clearAll: () => set({ accounts: [] }),
    }),
    {
      name: "nova-account-manager",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
