import { expect, test } from '@playwright/test';

test('loads the climate map workspace', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: /koppen climate map/i })).toBeVisible();
  await page.getByRole('button', { name: /hide climate layers/i }).click();
  await expect(page.getByRole('button', { name: /show climate layers/i })).toBeVisible();
});
