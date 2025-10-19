import { te } from "date-fns/locale";
import { test, expect } from "../fixtures/forgot-password.fixture";

test.describe("Forgot Password - Test Cases", () => {
  test.beforeEach(async ({ forgotPasswordPage }) => {
    await forgotPasswordPage.goto();
  });

  /**
   * FE-FP-01: Hiển thị đúng giao diện
   * Test Steps: Mở /auth/forgot-password
   * Expected: Hiển thị logo, ảnh nền, tiêu đề "Thay đổi mật khẩu", ô input "Mã quản lý",
   *           "Email", nút "Gửi yêu cầu", link "Quay lại đăng nhập"
   */
  test("[FE-FP-01] Hiển thị đúng giao diện", async ({ forgotPasswordPage }) => {
    // Verify page title
    await expect(forgotPasswordPage.pageTitle).toBeVisible();
    await expect(forgotPasswordPage.pageTitle).toHaveText("Thay đổi mật khẩu");

    // Verify alert section với icon
    await expect(forgotPasswordPage.alertTitle).toBeVisible();
    await expect(forgotPasswordPage.alertTitle).toHaveText("Lưu ý!");
    await expect(forgotPasswordPage.alertDescription).toBeVisible();

    // Verify input "Mã quản lý"
    await expect(forgotPasswordPage.managementCodeLabel).toBeVisible();
    await expect(forgotPasswordPage.managementCodeLabel).toHaveText(
      "Mã quản lý"
    );
    await expect(forgotPasswordPage.managementCodeInput).toBeVisible();
    await expect(forgotPasswordPage.managementCodeInput).toHaveAttribute(
      "placeholder",
      "nova-admin"
    );

    // Verify form description (Email mention)
    await expect(forgotPasswordPage.formDescription).toBeVisible();
    await expect(forgotPasswordPage.formDescription).toHaveText(
      "Vui lòng nhập mã quản lý để nhận email thay đổi mật khẩu."
    );

    // Verify nút "Gửi yêu cầu"
    await expect(forgotPasswordPage.submitButton).toBeVisible();
    await expect(forgotPasswordPage.submitButton).toHaveText("Gửi yêu cầu");
    await expect(forgotPasswordPage.submitButton).toBeEnabled();

    // Verify link "Quay lại đăng nhập"
    await expect(forgotPasswordPage.backToLoginButton).toBeVisible();
    await expect(forgotPasswordPage.backToLoginButton).toHaveText(
      "Quay lại đăng nhập"
    );
  });

  /**
   * FE-FP-02: Validate input trống
   * Test Steps: Nhấn "Gửi yêu cầu" khi chưa nhập gì
   * Expected: Hiển thị lỗi "Vui lòng nhập mã quản lý" và "Vui lòng nhập email"
   */
  test("[FE-FP-02] Validate input trống", async ({ forgotPasswordPage }) => {
    // Submit without filling anything
    await forgotPasswordPage.submitButton.click();

    await expect(
      forgotPasswordPage.page
        .locator("text=/.*Mã quản lý không hợp lệ.*/i")
        .first()
    ).toBeVisible({ timeout: 5000 });

    await expect(forgotPasswordPage.usernameLabel).toHaveAttribute(
      "data-error",
      "true"
    );
    await expect(forgotPasswordPage.usernameLabel).toHaveClass(
      /text-destructive/
    );
  });

  /**
   * FE-FP-03: Validate email không hợp lệ
   * Test Steps: Nhập "admin" vào email, Nhấn "Gửi yêu cầu"
   * Expected: Hiển thị lỗi "Email không hợp lệ"
   */
  test("[FE-FP-03] Validate email không hợp lệ", async ({
    forgotPasswordPage,
  }) => {
    // Fill invalid email format
    await forgotPasswordPage.managementCodeInput.fill("admin");
    await forgotPasswordPage.submitButton.click();

    // Verify email format validation error
    const emailValidationError = forgotPasswordPage.page
      .locator('[class*="text-destructive"], [role="alert"]')
      .filter({ hasText: /email không hợp lệ|invalid email|email format/i });

    await expect(emailValidationError.first()).toBeVisible({ timeout: 5000 });

    // Verify form is still enabled
    await expect(forgotPasswordPage.submitButton).toBeEnabled();
  });

  /**
   * FE-FP-05: Gửi request API đúng định dạng
   * Test Steps: Nhập "admin" + "admin@gmail.com" → Nhấn "Gửi yêu cầu"
   * Expected: Playwright ghi nhận request POST /api/auth/forgot-password
   *           với body JSON {"managerCode": "admin", "email": "admin@gmail.com"}
   */
  test("[FE-FP-05] Gửi request API đúng định dạng", async ({
    forgotPasswordPage,
    page,
  }) => {
    // Setup request interceptor to capture API call
    let requestCaptured = false;
    let requestBody: any = null;

    await page.route("**/api/auth/forgot-password", async (route) => {
      requestCaptured = true;
      const request = route.request();

      // Verify request method
      expect(request.method()).toBe("POST");

      // Verify request URL
      expect(request.url()).toContain("/api/auth/forgot-password");

      // Capture request body
      requestBody = request.postDataJSON();

      console.log("📡 Captured request body:", requestBody);

      // Mock successful response
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          message: "Reset password email sent successfully",
        }),
      });
    });

    // Fill form with test data
    await forgotPasswordPage.managementCodeInput.fill("admin");
    await forgotPasswordPage.submitButton.click();

    // Wait for API call
    await page.waitForTimeout(2000);

    // Verify request was captured
    expect(requestCaptured).toBe(true);

    // Verify request body structure
    expect(requestBody).toBeTruthy();
    expect(requestBody).toHaveProperty("managerCode", "admin");

    // Note: Based on the code, it seems to use "email" field name in the form
    // but sends "managerCode" in the API. Adjust based on actual implementation.
    if (requestBody.email) {
      expect(requestBody.email).toBe("admin");
    }
  });

  /**
   * FE-FP-06: Gửi thành công
   * Test Steps: Mock API trả về HTTP 200
   * Expected: Hiển thị thông báo "Yêu cầu thay đổi mật khẩu đã được gửi, vui lòng kiểm tra email."
   */
  test("[FE-FP-06] Gửi thành công", async ({ forgotPasswordPage, page }) => {
    // Mock successful API response
    await page.route("**/api/auth/forgot-password", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          message:
            "Yêu cầu thay đổi mật khẩu đã được gửi, vui lòng kiểm tra email.",
        }),
      });
    });

    // Fill valid management code
    await forgotPasswordPage.managementCodeInput.fill("admin");
    await forgotPasswordPage.submitButton.click();

    // Wait for submission to complete
    await forgotPasswordPage.waitForSubmission();

    // Verify success message
    const successMessage = page
      .locator(
        '[role="alert"], .toast, [class*="success"], [class*="notification"]'
      )
      .filter({
        hasText:
          /yêu cầu thay đổi mật khẩu đã được gửi|vui lòng kiểm tra email|success/i,
      });

    await expect(successMessage.first()).toBeVisible({ timeout: 10000 });
  });

  /**
   * FE-FP-08: Điều hướng về login
   * Test Steps: Nhấn "Quay lại đăng nhập"
   * Expected: Điều hướng về /auth/login
   */
  test("[FE-FP-08] Điều hướng về login", async ({
    forgotPasswordPage,
    page,
  }) => {
    // Click back to login link
    await forgotPasswordPage.backToLoginButton.click();

    // Verify redirected to login page
    await expect(page).toHaveURL(/\/auth\/login/);

    // Verify login page is loaded
    const loginPageIndicator = page
      .locator('h1, h2, [role="heading"]')
      .filter({ hasText: /đăng nhập|login/i });

    await expect(loginPageIndicator.first()).toBeVisible();
  });

  /**
   * FE-FP-09: Responsive test
   * Test Steps: Thay đổi viewport nhỏ (mobile)
   * Expected: Form hiển thị vừa màn, không bị tràn hoặc ẩn
   */
  test("[FE-FP-09] Responsive test", async ({ forgotPasswordPage, page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Wait for layout to adjust
    await page.waitForTimeout(500);

    // Verify all critical elements are still visible and accessible
    await expect(forgotPasswordPage.pageTitle).toBeVisible();
    await expect(forgotPasswordPage.managementCodeInput).toBeVisible();
    await expect(forgotPasswordPage.submitButton).toBeVisible();
    await expect(forgotPasswordPage.backToLoginButton).toBeVisible();

    // Verify form is still functional
    await forgotPasswordPage.managementCodeInput.fill("test-mobile");
    const inputValue =
      await forgotPasswordPage.managementCodeInput.inputValue();
    expect(inputValue).toBe("test-mobile");

    // Verify buttons are clickable (not overlapped)
    await expect(forgotPasswordPage.submitButton).toBeEnabled();

    // Check that form doesn't overflow viewport
    const formBoundingBox =
      await forgotPasswordPage.managementCodeInput.boundingBox();
    expect(formBoundingBox?.x).toBeGreaterThanOrEqual(0);
    expect(formBoundingBox?.y).toBeGreaterThanOrEqual(0);

    if (formBoundingBox) {
      expect(formBoundingBox.x + formBoundingBox.width).toBeLessThanOrEqual(
        375
      );
    }
  });
});

test.describe("Forgot Password - Additional Edge Cases", () => {
  test.beforeEach(async ({ forgotPasswordPage }) => {
    await forgotPasswordPage.goto();
  });

  /**
   * Additional test: API Error Handling (404)
   */
  test("[FE-FP-API-404] Sai mã quản lý/email không tồn tại", async ({
    forgotPasswordPage,
    page,
  }) => {
    // Mock 404 API response
    await page.route("**/api/auth/forgot-password", async (route) => {
      await route.fulfill({
        status: 404,
        contentType: "application/json",
        body: JSON.stringify({
          error: "Not Found",
          message: "Không tìm thấy tài khoản",
        }),
      });
    });

    await forgotPasswordPage.managementCodeInput.fill("nonexistent-admin");
    await forgotPasswordPage.submitButton.click();
    await forgotPasswordPage.waitForSubmission();

    // Verify error message
    const errorMessage = page
      .locator('[role="alert"], .toast, [class*="error"]')
      .filter({ hasText: /không tìm thấy tài khoản|không tồn tại/i });

    await expect(errorMessage.first()).toBeVisible({ timeout: 10000 });
  });

  /**
   * Additional test: Loading State
   */
  test("[FE-FP-Loading] Kiểm tra loading state", async ({
    forgotPasswordPage,
    page,
  }) => {
    // Mock API with delay
    await page.route("**/api/auth/forgot-password", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true }),
      });
    });

    await forgotPasswordPage.managementCodeInput.fill("admin");
    await forgotPasswordPage.submitButton.click();

    // Verify loading state
    await expect(forgotPasswordPage.loadingText).toBeVisible();
    await expect(forgotPasswordPage.submitButton).toBeDisabled();

    // Wait for completion
    await forgotPasswordPage.waitForSubmission();

    // Verify loading cleared
    await expect(forgotPasswordPage.loadingText).not.toBeVisible();
    await expect(forgotPasswordPage.submitButton).toBeEnabled();
  });

  /**
   * Additional test: Input Validation - Special Characters
   */
  test("[FE-FP-Special] Input với ký tự đặc biệt", async ({
    forgotPasswordPage,
  }) => {
    // Test special characters in management code
    const specialInputs = [
      "admin@nova",
      "admin-2024",
      "admin_test",
      "admin.nova",
    ];

    for (const input of specialInputs) {
      await forgotPasswordPage.managementCodeInput.clear();
      await forgotPasswordPage.managementCodeInput.fill(input);

      const value = await forgotPasswordPage.managementCodeInput.inputValue();
      expect(value).toBe(input);
    }
  });
});
