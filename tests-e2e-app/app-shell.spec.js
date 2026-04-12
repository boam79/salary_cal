import { test, expect } from '@playwright/test';

test.describe('react app shell', () => {
  test('home shows scenario hub', async ({ page }) => {
    await page.goto('/app/');
    await expect(page.getByRole('heading', { name: '시나리오로 바로 가기' })).toBeVisible();
  });

  test('legacy iframe loads for tool route', async ({ page }) => {
    await page.goto('/app/tool/salary');
    await expect(page.locator('iframe[title="계산기"]')).toBeVisible({ timeout: 30000 });
  });
});
