import { expect, test } from '@playwright/test';

test('loads the climate map workspace', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /acknowledge data license notice/i }).click();

  await expect(page.getByRole('region', { name: /koppen climate raster map/i })).toBeVisible();
  await expect(page.getByRole('complementary', { name: /layer controls/i })).toBeVisible();
  await expect(page.getByRole('group', { name: /koppen climate classes/i })).toBeVisible();
  await expect(page.getByRole('slider', { name: /map opacity/i })).toHaveValue('100');
  await expect(page.getByRole('slider', { name: /koppen opacity/i })).toHaveValue('75');
  await expect(page.getByRole('link', { name: /openstreetmap contributors/i })).toHaveAttribute(
    'href',
    'https://www.openstreetmap.org/copyright',
  );
  await expect(page.getByRole('checkbox')).toHaveCount(30);

  await page.getByRole('slider', { name: /map opacity/i }).fill('45');
  await expect(page.getByRole('slider', { name: /map opacity/i })).toHaveValue('45');
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

test('keeps desktop layer controls expanded in the upper-left with attribution bottom-right', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');
  await page.getByRole('button', { name: /acknowledge data license notice/i }).click();

  const controls = page.getByRole('complementary', { name: /layer controls/i });
  const attribution = page.getByRole('link', { name: /openstreetmap contributors/i });
  const collapseButton = page.getByRole('button', { name: /collapse layer controls/i });

  await expect(controls).toBeVisible();
  await expect(page.getByRole('group', { name: /koppen climate classes/i })).toBeVisible();
  await expect(attribution).toHaveAttribute('href', 'https://www.openstreetmap.org/copyright');
  await expect(collapseButton).toHaveText('⌃');

  const controlsBox = await controls.boundingBox();
  const attributionBox = await attribution.boundingBox();
  expect(controlsBox?.x).toBeLessThan(40);
  expect(controlsBox?.y).toBeLessThan(40);
  expect(attributionBox?.x).toBeGreaterThan(1000);
  expect(attributionBox?.y).toBeGreaterThan(740);

  await collapseButton.click();
  await expect(page.getByRole('button', { name: /expand layer controls/i })).toHaveText('⌄');
  await expect(attribution).toBeVisible();
});

test('uses compact lower-half mobile layer controls', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: /acknowledge data license notice/i }).click();

  const controls = page.getByRole('complementary', { name: /layer controls/i });
  const attribution = page.getByRole('link', { name: /openstreetmap contributors/i });
  const tropicalRainforestDescription = page.getByText('Tropical rainforest');
  const classList = page.getByTestId('koppen-class-list');
  const firstRowControls = classList.getByRole('checkbox');
  const showAllButton = page.getByRole('button', { name: /show all/i });
  const hideAllButton = page.getByRole('button', { name: /hide all/i });

  await expect(controls).toBeVisible();
  await expect(attribution).toBeVisible();
  await expect(tropicalRainforestDescription).toBeHidden();

  const controlsBox = await controls.boundingBox();
  const attributionBox = await attribution.boundingBox();
  expect(controlsBox?.y).toBeGreaterThanOrEqual(844 / 2 - 24);
  expect(attributionBox?.x).toBeGreaterThan(220);

  const classListBox = await classList.boundingBox();
  const showAllButtonBox = await showAllButton.boundingBox();
  const hideAllButtonBox = await hideAllButton.boundingBox();
  expect(classListBox?.height).toBeGreaterThan(220);
  expect(showAllButtonBox?.height).toBeLessThan(38);
  expect(hideAllButtonBox?.height).toBeLessThan(38);

  const firstBox = await firstRowControls.nth(0).boundingBox();
  const secondBox = await firstRowControls.nth(1).boundingBox();
  expect(firstBox?.y).toBe(secondBox?.y);
});

test('collapses and reopens mobile layer controls from the bottom handle', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: /acknowledge data license notice/i }).click();

  const controls = page.getByRole('complementary', { name: /layer controls/i });
  const collapseButton = page.getByRole('button', { name: /collapse layer controls/i });
  const attribution = page.getByRole('link', { name: /openstreetmap contributors/i });
  const buttonBox = await collapseButton.boundingBox();
  const attributionBox = await attribution.boundingBox();
  const controlsBox = await controls.boundingBox();

  expect(buttonBox?.y).toBeGreaterThan((controlsBox?.y ?? 0) + (controlsBox?.height ?? 0) - 8);
  expect(attributionBox?.x).toBeGreaterThan((buttonBox?.x ?? 0) + (buttonBox?.width ?? 0));

  await collapseButton.click();
  await expect(page.getByRole('group', { name: /koppen climate classes/i })).toBeHidden();
  await expect(attribution).toBeVisible();

  await page.getByRole('button', { name: /expand layer controls/i }).click();
  await expect(page.getByRole('group', { name: /koppen climate classes/i })).toBeVisible();
});

test('does not show a mobile class tooltip after long press', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: /acknowledge data license notice/i }).click();

  const label = page.getByTestId('koppen-class-1-control');
  await label.dispatchEvent('pointerdown', { pointerType: 'touch' });

  await expect(page.getByRole('tooltip', { name: /tropical rainforest/i })).toHaveCount(0);
});
