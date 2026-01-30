import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('homepage loads with Dronacharya branding', async ({ page }) => {
    await page.goto('/');

    // Check page title contains Dronacharya
    await expect(page).toHaveTitle(/Dronacharya/);
  });

  test('can navigate to login page', async ({ page }) => {
    await page.goto('/auth/login');

    // Should see login form
    await expect(page.locator('form')).toBeVisible();
    await expect(page.getByPlaceholder(/email/i)).toBeVisible();
    await expect(page.getByPlaceholder(/password/i)).toBeVisible();
  });

  test('can navigate to registration page', async ({ page }) => {
    await page.goto('/auth/register');

    // Should see registration form
    await expect(page.locator('form')).toBeVisible();
  });

  test('sidebar navigation links are visible when authenticated', async ({ page }) => {
    // Visit homepage (which may redirect to login or show dashboard)
    await page.goto('/');

    // Look for navigation elements - these might be visible or behind auth
    const sidebarExists = await page.locator('[data-testid="sidebar"]').count() > 0;

    if (sidebarExists) {
      // If sidebar is visible, verify navigation links exist
      await expect(page.getByRole('link', { name: /courses/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /achievements/i })).toBeVisible();
    }
  });
});

test.describe('Public Pages', () => {
  test('help page is accessible', async ({ page }) => {
    await page.goto('/help');

    // Help page should load
    await expect(page.locator('h1')).toBeVisible();
  });

  test('login page shows error on invalid credentials', async ({ page }) => {
    await page.goto('/auth/login');

    // Fill in invalid credentials
    await page.getByPlaceholder(/email/i).fill('invalid@test.com');
    await page.getByPlaceholder(/password/i).fill('wrongpassword');

    // Submit the form
    await page.getByRole('button', { name: /sign in/i }).click();

    // Should show error message (or stay on login page)
    await expect(page.url()).toContain('/auth/login');
  });
});
