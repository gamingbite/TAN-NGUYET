import type { Page } from '@playwright/test';

// Keep native keydown and keyup inside one Playwright action: tracing a separate
// keyup can capture its screenshot while the key is still held. Read the real
// HUD after each release instead of assuming a constant world speed or FPS.
export async function moveKeyboardAxis(page: Page, axis: 'px' | 'py', destination: number): Promise<void> {
  const game = page.locator('#game');
  await game.focus();
  let observedSpeed = 160; // Conservative first probe; replaced by measured motion.
  let blockedPulses = 0;
  for (let pulse = 0; pulse < 18; pulse++) {
    const current = Number(await game.getAttribute(`data-${axis}`));
    const distance = destination - current;
    if (Math.abs(distance) < 7) return;
    const positive = distance > 0;
    const key = axis === 'px' ? positive ? 'd' : 'a' : positive ? 's' : 'w';
    const holdMs = Math.max(20, Math.min(pulse === 0 ? 120 : 800,
      (Math.abs(distance) - 3) / observedSpeed * 850));
    await page.keyboard.press(key, { delay: holdMs });
    // Wait for an actual HUD publication after releasing the key. A fixed
    // wall-clock delay can still read stale coordinates while tracing a large
    // canvas; the simulation publishes every .15 simulated seconds.
    const next = await game.evaluate((element, coordinate) => new Promise<number>((resolve, reject) => {
      const timeout = window.setTimeout(() => {
        observer.disconnect(); reject(new Error('No fresh position after releasing movement key'));
      }, 3000);
      const observer = new MutationObserver(() => {
        observer.disconnect(); window.clearTimeout(timeout);
        resolve(Number(element.getAttribute(`data-${coordinate}`)));
      });
      observer.observe(element, { attributes: true, attributeFilter: [`data-${coordinate}`] });
    }), axis);
    const movement = (next - current) * (positive ? 1 : -1);
    blockedPulses = movement < 1 ? blockedPulses + 1 : 0;
    if (blockedPulses >= 3) {
      const coordinates = await game.evaluate(element => ({ x: element.getAttribute('data-px'), y: element.getAttribute('data-py'), zone: element.getAttribute('data-zone') }));
      throw new Error(`Keyboard movement blocked: ${axis}=${next}, target=${destination}, key=${key}, position=${JSON.stringify(coordinates)}`);
    }
    if (movement > 2 && holdMs >= 50) observedSpeed = Math.max(25, Math.min(400, movement / holdMs * 1000));
  }
  const final = Number(await game.getAttribute(`data-${axis}`));
  if (Math.abs(destination - final) < 7) return;
  throw new Error(`Keyboard movement did not converge within 7px: ${axis}=${final}, target=${destination}`);
}
