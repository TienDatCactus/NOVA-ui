// app/tests/pages/forgot-password.page.ts

import { type Page, type Locator } from "@playwright/test";

export class ForgotPasswordPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly alertIcon: Locator;
  readonly alertTitle: Locator;
  readonly alertDescription: Locator;
  readonly managementCodeLabel: Locator;
  readonly managementCodeInput: Locator;
  readonly formDescription: Locator;
  readonly submitButton: Locator;
  readonly backToLoginButton: Locator;
  readonly loadingText: Locator;
  readonly formErrorMessage: Locator;
  readonly usernameLabel: Locator;

  constructor(page: Page) {
    this.page = page;

    // Page elements
    this.pageTitle = page.getByText("Thay đổi mật khẩu", { exact: true });

    // Alert section
    this.alertIcon = page.locator('[data-testid="alert-icon"]');
    this.alertTitle = page.getByText("Lưu ý!");
    this.alertDescription = page.getByText(
      "Gửi yêu cầu thay đổi mật khẩu bằng mã quản lý"
    );

    // Form elements
    this.managementCodeLabel = page.getByText("Mã quản lý", { exact: true });
    this.managementCodeInput = page.getByPlaceholder("nova-admin");
    this.formDescription = page.getByText(
      "Vui lòng nhập mã quản lý để nhận email thay đổi mật khẩu.",
      { exact: true }
    );

    // Buttons
    this.submitButton = page.getByRole("button", { name: "Gửi yêu cầu" });
    this.backToLoginButton = page.getByRole("link", {
      name: "Quay lại đăng nhập",
    });

    this.usernameLabel = page.getByText("Mã quản lý", { exact: true });

    // Loading and error states
    this.loadingText = page.getByText("Đang gửi yêu cầu...");
    this.formErrorMessage = page.locator('[class*="text-destructive"]');
  }

  /**
   * Navigate to forgot password page
   */
  async goto() {
    await this.page.goto("/auth/forgot-password");
  }

  /**
   * Fill management code and submit
   */
  async submitForgotPassword(managementCode: string) {
    await this.managementCodeInput.fill(managementCode);
    await this.submitButton.click();
  }

  /**
   * Go back to login page
   */
  async goBackToLogin() {
    await this.backToLoginButton.click();
  }

  /**
   * Wait for form submission to complete
   */
  async waitForSubmission() {
    // Wait for loading state to disappear
    await this.loadingText.waitFor({ state: "visible" });
    await this.loadingText.waitFor({ state: "hidden" });
  }

  /**
   * Check if form is in loading state
   */
  async isLoading(): Promise<boolean> {
    return await this.loadingText.isVisible();
  }
}
