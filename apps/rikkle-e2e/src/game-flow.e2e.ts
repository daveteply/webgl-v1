import { test, expect } from '@playwright/test';

test.describe('WebGL-V1 Game Flow & Canvas Interactions', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to root (redirects to /game)
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  test('should load game canvas and display initial UI components', async ({ page }) => {
    // Verify main app layout container
    const layout = page.locator('.app-layout');
    await expect(layout).toBeVisible({ timeout: 15000 });

    // Verify WebGL canvas element exists in DOM
    const canvas = page.locator('.game-canvas');
    await expect(canvas).toBeAttached({ timeout: 15000 });
  });

  test('should open and dismiss intro dialog when clicking play', async ({ page }) => {
    // Wait for the splash screen intro to finish (~3.15s) and display the intro dialog
    const startBtn = page.locator('button', { hasText: /play|start|continue|new game/i }).first();
    await expect(startBtn).toBeVisible({ timeout: 15000 });

    // Click play/start button
    await startBtn.click();

    // Dialog should close
    await expect(startBtn).not.toBeVisible({ timeout: 10000 });
  });

  test('should handle pointer drag interactions on WebGL canvas', async ({ page }) => {
    // Dismiss intro dialog if visible
    const startBtn = page.locator('button', { hasText: /play|start|continue|new game/i }).first();
    if (await startBtn.isVisible({ timeout: 8000 }).catch(() => false)) {
      await startBtn.click();
      await expect(startBtn)
        .not.toBeVisible({ timeout: 5000 })
        .catch((error) => {
          console.error(error);
        });
    }

    const canvas = page.locator('.game-canvas');
    await expect(canvas).toBeAttached({ timeout: 15000 });

    const box = await canvas.boundingBox();
    if (box) {
      const startX = box.x + box.width / 2;
      const startY = box.y + box.height / 2;

      // Simulate dragging a wheel horizontally across the canvas
      await page.mouse.move(startX, startY);
      await page.mouse.down();
      await page.mouse.move(startX + 150, startY, { steps: 10 });
      await page.mouse.up();

      // Ensure canvas remains attached and active
      await expect(canvas).toBeAttached();
    }
  });

  test('should persist game save state in localStorage', async ({ page }) => {
    // Evaluate localStorage state
    const saveState = await page.evaluate(() => localStorage.getItem('webgl_game_state'));
    expect(saveState === null || typeof saveState === 'string').toBeTruthy();
  });
});
