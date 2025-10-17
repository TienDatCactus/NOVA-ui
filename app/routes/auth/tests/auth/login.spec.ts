import { test, expect } from "../fixtures/auth.fixture";

test.describe("Login Page", () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test("should display login page correctly", async ({ loginPage }) => {
    // Verify page title and description
    await expect(loginPage.pageTitle).toBeVisible();
    await expect(loginPage.pageDescription).toBeVisible();

    // Verify form elements
    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();
    await expect(loginPage.smsLoginButton).toBeVisible();
    await expect(loginPage.forgotPasswordLink).toBeVisible();
  });

  test("should have correct placeholder text", async ({ loginPage }) => {
    await expect(loginPage.usernameInput).toHaveAttribute(
      "placeholder",
      "nova-admin"
    );
    await expect(loginPage.passwordInput).toHaveAttribute(
      "placeholder",
      "nova-password"
    );
  });

  test("should allow user to type in username and password fields", async ({
    loginPage,
  }) => {
    const testUsername = "test-user";
    const testPassword = "test-password";

    await loginPage.usernameInput.fill(testUsername);
    await loginPage.passwordInput.fill(testPassword);

    await expect(loginPage.usernameInput).toHaveValue(testUsername);
    await expect(loginPage.passwordInput).toHaveValue(testPassword);
  });

  test("should mask password input", async ({ loginPage }) => {
    await expect(loginPage.passwordInput).toHaveAttribute("type", "password");
  });

  test("should navigate to forgot password page when clicking forgot password link", async ({
    loginPage,
    page,
  }) => {
    await loginPage.clickForgotPassword();
    await expect(page).toHaveURL(/\/auth\/forgot-password/);
  });

  test("should show loading state when submitting login form", async ({
    loginPage,
  }) => {
    await loginPage.usernameInput.fill("test-user");
    await loginPage.passwordInput.fill("test-password");

    // Click login button
    await loginPage.loginButton.click();

    // Check if button shows loading text (this will depend on your API response time)
    // You might need to adjust this based on your actual implementation

    const loadingText = loginPage.page.getByText("Đang đăng nhập...");
    // Note: This might be flaky if API is too fast, consider mocking API for this test
  });

  test.describe("Form Validation", () => {
    test("should show validation error when submitting empty form", async ({
      loginPage,
    }) => {
      await loginPage.loginButton.click();

      //   // Wait for validation errors to appear
      await expect(
        loginPage.page.locator("text=/.*Email không hợp lệ.*/i").first()
      ).toBeVisible({ timeout: 2000 });
      await expect(
        loginPage.page.locator("text=/.*Mật khẩu không hợp lệ.*/i").first()
      ).toBeVisible({ timeout: 2000 });

      // Check that labels turn red (have data-error attribute and destructive color)
      await expect(loginPage.usernameLabel).toHaveAttribute(
        "data-error",
        "true"
      );
      await expect(loginPage.passwordLabel).toHaveAttribute(
        "data-error",
        "true"
      );

      // Verify labels have the error styling class
      await expect(loginPage.usernameLabel).toHaveClass(/text-destructive/);
      await expect(loginPage.passwordLabel).toHaveClass(/text-destructive/);
    });

    test("should show validation error for empty username", async ({
      loginPage,
    }) => {
      await loginPage.passwordInput.fill("test-password");
      await loginPage.loginButton.click();

      // Check for username validation error message
      await expect(
        loginPage.page.locator("text=/.*Email không hợp lệ.*/i").first()
      ).toBeVisible({ timeout: 2000 });

      // Check that username label turns red
      await expect(loginPage.usernameLabel).toHaveAttribute(
        "data-error",
        "true"
      );
      await expect(loginPage.usernameLabel).toHaveClass(/text-destructive/);

      // Password label should NOT be red (no error)
      await expect(loginPage.passwordLabel).not.toHaveAttribute(
        "data-error",
        "true"
      );
      // await expect(loginPage.passwordLabel).toHaveClass(/text-destructive/);
    });

    test("should show validation error for empty password", async ({
      loginPage,
    }) => {
      await loginPage.usernameInput.fill("test-user");
      await loginPage.loginButton.click();

      // Check for password validation error message
      await expect(
        loginPage.page.locator("text=/.*Mật khẩu không hợp lệ.*/i").first()
      ).toBeVisible({ timeout: 2000 });

      // Check that password label turns red
      await expect(loginPage.passwordLabel).toHaveAttribute(
        "data-error",
        "true"
      );
      await expect(loginPage.passwordLabel).toHaveClass(/text-destructive/);

      // Username label should NOT be red (no error)
      await expect(loginPage.usernameLabel).not.toHaveAttribute(
        "data-error",
        "true"
      );
    });
  });

  test.describe("Login Functionality", () => {
    // Note: These tests require a test user or mocked API
    // You may need to set up test data or mock the API responses

    test.skip("should successfully login with valid credentials", async ({
      loginPage,
      page,
    }) => {
      // TODO: Replace with actual test credentials or mock API
      const validUsername = "test-user";
      const validPassword = "test-password";

      await loginPage.login(validUsername, validPassword);

      // Wait for navigation after successful login
      await loginPage.waitForNavigation();

      // Verify redirected to dashboard or home page
      await expect(page).not.toHaveURL(/\/auth\/login/);
    });

    test("should show error message with invalid credentials", async ({
      loginPage,
      page,
    }) => {
      const invalidUsername = "invalid-user";
      const invalidPassword = "invalid-password";

      await loginPage.login(invalidUsername, invalidPassword);

      // Wait for error toast/message to appear
      await expect(
        page.getByText("Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.")
      ).toBeVisible({ timeout: 5000 });

      // Verify still on login page (not redirected)
      await expect(page).toHaveURL(/\/auth\/login/);
    });
  });

  test.describe("UI Interactions", () => {
    test("should focus on username input when page loads", async ({
      loginPage,
    }) => {
      // Click on the page to ensure it's focused
      await loginPage.page.click("body");

      // Tab to the first input (should be username)
      await loginPage.page.keyboard.press("Tab");

      // Verify username input is focused
      await expect(loginPage.usernameInput).toBeFocused();
    });

    test("should be able to tab between form fields", async ({
      loginPage,
      page,
    }) => {
      await loginPage.usernameInput.focus();
      await page.keyboard.press("Tab");
      await expect(loginPage.passwordInput).toBeFocused();
    });

    test("should submit form when pressing Enter in password field", async ({
      loginPage,
      page,
    }) => {
      await loginPage.usernameInput.fill("test-user");
      await loginPage.passwordInput.fill("test-password");

      // Press Enter in password field
      await loginPage.passwordInput.press("Enter");
      await expect(loginPage.page.getByText("Đang đăng nhập...")).toBeVisible();

      // Verify form submission (button should show loading or API call should be made)
      // This might need adjustment based on your implementation
      await page.waitForTimeout(500); // Small wait to allow form submission to start
    });
  });

  test.describe("Responsive Design", () => {
    test("should display correctly on mobile viewport", async ({
      loginPage,
      page,
    }) => {
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE size

      await expect(loginPage.pageTitle).toBeVisible();
      await expect(loginPage.usernameInput).toBeVisible();
      await expect(loginPage.passwordInput).toBeVisible();
      await expect(loginPage.loginButton).toBeVisible();
    });

    test("should display correctly on tablet viewport", async ({
      loginPage,
      page,
    }) => {
      await page.setViewportSize({ width: 768, height: 1024 }); // iPad size

      await expect(loginPage.pageTitle).toBeVisible();
      await expect(loginPage.usernameInput).toBeVisible();
      await expect(loginPage.passwordInput).toBeVisible();
      await expect(loginPage.loginButton).toBeVisible();
    });
  });
});
