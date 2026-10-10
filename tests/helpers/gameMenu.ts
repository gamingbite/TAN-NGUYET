import { expect, type Page } from '@playwright/test';

// Menu controls are intentionally absent from the play field until the icon
// is opened. Tests follow the same two real clicks as the player.
export async function clickGameMenu(page: Page, selector: string): Promise<void> {
  const menu = page.getByRole('button', { name: 'Menu trò chơi', exact: true });
  if (await menu.getAttribute('aria-expanded') !== 'true') await menu.click();
  await expect(page.locator('#panel-title')).toHaveText('Menu trò chơi');
  await page.locator(selector).click();
}
