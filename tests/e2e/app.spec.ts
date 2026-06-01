import { expect, test } from '@playwright/test';

test('loads the climate map workspace', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /acknowledge data license notice/i }).click();

  await expect(page.getByRole('region', { name: /koppen climate raster map/i })).toBeVisible();
  await expect(page.getByRole('group', { name: /koppen climate classes/i })).toBeVisible();
  await expect(page.getByRole('slider', { name: /openstreetmap opacity/i })).toHaveValue('100');
  await expect(page.getByRole('slider', { name: /koppen opacity/i })).toHaveValue('75');
  await expect(page.getByRole('link', { name: /openstreetmap contributors/i })).toHaveAttribute(
    'href',
    'https://www.openstreetmap.org/copyright',
  );
  await expect(page.getByRole('checkbox')).toHaveCount(30);

  await page.getByRole('slider', { name: /openstreetmap opacity/i }).fill('45');
  await expect(page.getByRole('slider', { name: /openstreetmap opacity/i })).toHaveValue('45');
  await page.getByRole('slider', { name: /koppen opacity/i }).fill('55');
  await expect(page.getByRole('slider', { name: /koppen opacity/i })).toHaveValue('55');

  await page.getByRole('button', { name: /hide all/i }).click();
  await expect(page.getByRole('checkbox', { name: /Af tropical rainforest/i })).not.toBeChecked();

  await page.getByRole('button', { name: /show all/i }).click();
  await expect(page.getByRole('checkbox', { name: /Af tropical rainforest/i })).toBeChecked();

  await page.getByRole('checkbox', { name: /Af tropical rainforest/i }).click();
  await expect(page.getByRole('checkbox', { name: /Af tropical rainforest/i })).not.toBeChecked();

  await page.getByRole('checkbox', { name: /Af tropical rainforest/i }).click();
  await expect(page.getByRole('checkbox', { name: /Af tropical rainforest/i })).toBeChecked();

  await page.mouse.wheel(0, -800);
  await expect(page.locator('canvas')).toBeVisible();
});
