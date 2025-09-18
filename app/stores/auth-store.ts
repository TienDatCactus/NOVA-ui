import { makeObservable, observable } from "mobx";
import type { User } from "~/lib/interfaces";
class AuthStore {
  user: User | null = null;
  constructor() {
    makeObservable(this, {
      user: observable,
    });
  }
  login(user: User) {
    this.user = user;
  }
  logout() {
    this.user = null;
  }
}

export const authStore = new AuthStore();
