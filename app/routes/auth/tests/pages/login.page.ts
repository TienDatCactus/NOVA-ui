import { type Page, type Locator } from "@playwright/test";

export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly forgotPasswordLink: Locator;
  readonly smsLoginButton: Locator;
  readonly pageTitle: Locator;
  readonly pageDescription: Locator;
  readonly usernameLabel: Locator;
  readonly passwordLabel: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.getByPlaceholder("nova-admin");
    this.passwordInput = page.getByPlaceholder("nova-password");
    this.loginButton = page.getByRole("button", {
      name: "Đăng nhập",
      exact: true,
    });
    this.forgotPasswordLink = page.getByRole("link", {
      name: "Quên mật khẩu?",
    });
    this.smsLoginButton = page.getByRole("button", {
      name: "Đăng nhập với SMS",
      exact: true,
    });
    this.pageTitle = page.getByText("Chào mừng trở lại với NOVA", {
      exact: true,
    });
    this.pageDescription = page.getByText(
      "Quản lý hệ thống Eco Palm dễ dàng và hiệu quả",
      { exact: true }
    );
    this.usernameLabel = page.getByText("Mã quản lý", { exact: true });
    this.passwordLabel = page.getByText("Mật khẩu", { exact: true });
  }

  async goto() {
    await this.page.goto("/auth/login");
  }

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async isLoginButtonDisabled() {
    return await this.loginButton.isDisabled();
  }

  async getValidationError(fieldName: "userNameOrEmail" | "password") {
    // Form validation messages appear near the input fields
    const field =
      fieldName === "userNameOrEmail" ? this.usernameInput : this.passwordInput;
    const errorMessage = this.page
      .locator(`[name="${fieldName}"]`)
      .locator("..")
      .locator("..")
      .getByRole("alert");
    return errorMessage;
  }

  async clickForgotPassword() {
    await this.forgotPasswordLink.click();
  }

  async clickSmsLogin() {
    await this.smsLoginButton.click();
  }

  async waitForNavigation() {
    await this.page.waitForURL((url) => !url.pathname.includes("/auth/login"));
  }
}
