// app/tests/fixtures/forgot-password.fixture.ts

import { test as base } from "@playwright/test";
import { ForgotPasswordPage } from "../pages/forgot-password.page";

type ForgotPasswordFixtures = {
  forgotPasswordPage: ForgotPasswordPage;
};

export const test = base.extend<ForgotPasswordFixtures>({
  forgotPasswordPage: async ({ page }, use) => {
    const forgotPasswordPage = new ForgotPasswordPage(page);
    await use(forgotPasswordPage);
  },
});

export { expect } from "@playwright/test";
