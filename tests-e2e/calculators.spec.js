import { test, expect } from '@playwright/test';

test.describe('calculators smoke', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#home-screen', { state: 'visible' });
  });

  test('salary annual calculates and renders result', async ({ page }) => {
    await page.click('[data-screen="salary-screen"]');
    await page.waitForSelector('#salary-screen.screen.active');

    await page.fill('#annual-salary', '5000');
    await page.click('#calculate-salary');

    await expect(page.locator('#salary-result')).toBeVisible();
    await expect(page.locator('#monthly-net')).not.toHaveText('');
    await expect(page.locator('#annual-net')).not.toHaveText('');
  });

  test('inheritance tax calculates and renders result', async ({ page }) => {
    await page.click('[data-screen="tax-screen"]');
    await page.waitForSelector('#tax-screen.screen.active');

    await page.fill('#inheritance-amount', '10');
    await page.click('#calculate-inheritance');

    await expect(page.locator('#inheritance-result')).toBeVisible();
    await expect(page.locator('#inheritance-summary')).toContainText('상속세액');
  });

  test('loan calculates and renders result', async ({ page }) => {
    await page.click('[data-screen="loan-screen"]');
    await page.waitForSelector('#loan-screen.screen.active');

    await page.fill('#loan-amount', '1');
    await page.fill('#interest-rate', '5');
    await page.fill('#loan-period', '20');
    await page.click('#calculate-loan');

    await expect(page.locator('#loan-result')).toBeVisible();
    await expect(page.locator('#loan-summary')).toContainText('월 상환액');
  });
});

