import { expect, test, type Page } from '@playwright/test';

async function openScene(page: Page): Promise<void> {
  await page.goto('/foundation.html');
  await page.getByRole('button', { name: 'Mở cảnh thử' }).click();
  await expect(page.locator('#game')).toHaveAttribute('data-ready', 'true');
  await expect(page.locator('canvas')).toBeVisible();
}

async function position(page: Page): Promise<[number, number]> {
  const text = await page.locator('#scene-status').innerText();
  const match = text.match(/Vị trí (\d+), (\d+)/);
  if (!match) throw new Error(`Unexpected scene status: ${text}`);
  return [Number(match[1]), Number(match[2])];
}

test('production build starts, moves, pauses, resets and stays inside the map', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await openScene(page);
  const [startX] = await position(page);
  await page.keyboard.down('d');
  await expect.poll(async () => (await position(page))[0]).toBeGreaterThan(startX + 25);
  await page.keyboard.up('d');

  await page.keyboard.press('Escape');
  await expect(page.locator('#pause-overlay')).toBeVisible();
  await page.keyboard.down('d');
  await page.waitForTimeout(250);
  await page.keyboard.up('d');
  await expect(page.locator('#scene-status')).toHaveText('Đã tạm dừng');
  await page.locator('#pause-overlay').getByRole('button', { name: 'Tiếp tục', exact: true }).click();
  await page.getByRole('button', { name: 'Về điểm bắt đầu' }).click();
  await expect(page.locator('#scene-status')).toContainText('Vị trí 320, 270');

  await page.keyboard.down('w');
  await expect.poll(async () => (await position(page))[1], { timeout: 5000 }).toBeLessThanOrEqual(36);
  await page.waitForTimeout(200);
  expect((await position(page))[1]).toBeGreaterThanOrEqual(34);
  await page.keyboard.up('w');
  expect(errors).toEqual([]);
});

test('static buildings block movement', async ({ page }) => {
  await openScene(page);
  await page.keyboard.down('a');
  // Check frequently so the character stops below the house instead of overshooting into a tree.
  await expect.poll(async () => (await position(page))[0], { intervals: [25] }).toBeLessThanOrEqual(175);
  await page.keyboard.up('a');
  await page.keyboard.down('w');
  await expect.poll(async () => (await position(page))[1]).toBeLessThanOrEqual(150);
  await page.waitForTimeout(350);
  const [, y] = await position(page);
  expect(y).toBeGreaterThanOrEqual(147);
  expect(y).toBeLessThanOrEqual(150);
  await page.keyboard.up('w');
});

test('start screen stays usable on a narrow window', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/foundation.html');
  await expect(page.getByRole('button', { name: 'Mở cảnh thử' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await openScene(page);
});
