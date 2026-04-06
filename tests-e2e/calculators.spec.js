import { test, expect } from '@playwright/test';

test.describe('calculators smoke', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await page.goto('/');
    await page.evaluate(() => window.localStorage.clear());
    await page.evaluate(() => window.sessionStorage.clear());
    await page.reload();
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
    await expect(page.locator('#salary-summary-text')).not.toHaveText('');
  });

  test('salary deep link restores screen and input', async ({ page }) => {
    await page.goto('/?screen=salary-screen&salaryType=annual&annualSalary=7000');
    await page.waitForSelector('#salary-screen.screen.active');
    await expect(page.locator('#annual-salary')).toHaveValue('7000');
  });

  test('inheritance tax calculates and renders result', async ({ page }) => {
    await page.click('[data-screen="tax-screen"]');
    await page.waitForSelector('#tax-screen.screen.active');

    await page.fill('#inheritance-amount', '10');
    await page.click('#calculate-inheritance');

    await expect(page.locator('#inheritance-result')).toBeVisible();
    await expect(page.locator('#inheritance-summary')).toContainText('상속세액');
    await expect(page.locator('#tax-summary-text')).not.toHaveText('');
  });

  test('tax deep link restores screen and input', async ({ page }) => {
    await page.goto('/?screen=tax-screen&tab=inheritance&inheritanceAmount=15');
    await page.waitForSelector('#tax-screen.screen.active');
    await expect(page.locator('#inheritance-amount')).toHaveValue('15');
  });

  test.skip('tax recents save and load works', async ({ page }) => {
    await page.click('[data-screen="tax-screen"]');
    await page.waitForSelector('#tax-screen.screen.active');

    await page.fill('#inheritance-amount', '12');
    await page.click('#calculate-inheritance');
    await expect(page.locator('#tax-recent-section')).toBeVisible();
    await expect(page.locator('#tax-recent-list .tax-recent-load').first()).toBeVisible();

    await page.fill('#inheritance-amount', '20');
    await page.click('#calculate-inheritance');
    await expect(page.locator('#tax-recent-list .tax-recent-load').first()).toBeVisible();

    await page.locator('#tax-recent-list .tax-recent-load').last().click();
    await expect(page.locator('#inheritance-amount')).toHaveValue('12');
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
    await expect(page.locator('#loan-summary-text')).not.toHaveText('');
  });

  test('loan deep link restores screen and input', async ({ page }) => {
    await page.goto('/?screen=loan-screen&tab=financial-loan&loanAmount=3&interestRate=4.2&loanPeriod=25');
    await page.waitForSelector('#loan-screen.screen.active');
    await expect(page.locator('#loan-amount')).toHaveValue('3');
    await expect(page.locator('#interest-rate')).toHaveValue('4.2');
    await expect(page.locator('#loan-period')).toHaveValue('25');
  });

  test.skip('financial loan recents save and load works', async ({ page }) => {
    await page.click('[data-screen="loan-screen"]');
    await page.waitForSelector('#loan-screen.screen.active');

    await page.fill('#loan-amount', '1');
    await page.fill('#interest-rate', '4');
    await page.fill('#loan-period', '20');
    await page.click('#calculate-loan');
    await expect(page.locator('#financial-loan-recent-section')).toBeVisible();
    await expect(page.locator('#financial-loan-recent-list .financial-loan-recent-load').first()).toBeVisible();

    await page.fill('#loan-amount', '2');
    await page.click('#calculate-loan');
    await expect(page.locator('#financial-loan-recent-list .financial-loan-recent-load').first()).toBeVisible();

    await page.locator('#financial-loan-recent-list .financial-loan-recent-load').last().click();
    await expect(page.locator('#loan-amount')).toHaveValue('1');
  });
});

