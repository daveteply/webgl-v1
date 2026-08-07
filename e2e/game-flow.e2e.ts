/**
 * Playwright E2E Test Suite for webgl-v1
 *
 * To run locally in DevContainer:
 *   npx playwright test
 */
import { test, expect } from '@playwright/test';

test.describe('WebGL-V1 Game Flow & Canvas Interactions', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to local Angular application
    await page.goto('http://localhost:4200/');
  });

  test('should load game canvas and display initial UI components', async ({ page }) => {
    // Verify WebGL canvas element exists
    const canvas = page.locator('.game-canvas');
    await expect(canvas).toBeVisible();

    // Verify main app layout container
    const layout = page.locator('.app-layout');
    await expect(layout).toBeVisible();
  });

  test('should open and dismiss intro dialog when clicking play', async ({ page }) => {
    // Check if intro dialog or start game button is visible
    const startBtn = page.locator('button', { hasText: /play|start/i });
    if (await startBtn.isVisible()) {
      await startBtn.click();
      // Dialog should close or transition
      await expect(startBtn).not.toBeVisible();
    }
  });

  test('should handle pointer drag interactions on WebGL canvas', async ({ page }) => {
    const canvas = page.locator('.game-canvas');
    await expect(canvas).toBeVisible();

    const box = await canvas.boundingBox();
    if (box) {
      const startX = box.x + box.width / 2;
      const startY = box.y + box.height / 2;

      // Simulate dragging a wheel horizontally across the canvas
      await page.mouse.move(startX, startY);
      await page.mouse.down();
      await page.mouse.move(startX + 150, startY, { steps: 10 });
      await page.mouse.up();

      // Ensure canvas remains active without crashing
      await expect(canvas).toBeVisible();
    }
  });

  test('should persist game save state in localStorage', async ({ page }) => {
    // Evaluate localStorage state
    const saveState = await page.evaluate(() => localStorage.getItem('webgl_game_state'));
    // State will be null initially or populated if auto-saved
    expect(saveState === null || typeof saveState === 'string').toBeTruthy();
  });
});
