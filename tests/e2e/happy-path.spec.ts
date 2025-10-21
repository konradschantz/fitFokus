import { test, expect } from '@playwright/test';

test.describe('Fit Fokus happy path', () => {
  test.skip(true, 'Requires running Next.js dev server to execute end-to-end flow.');

  test('log workout and verify history', async ({ page }) => {
    await page.goto('/workout/today');
    await page.getByRole('button', { name: 'Log sæt' }).click();
    await expect(page.getByText('Gemt')).toBeVisible();
    await page.goto('/history');
    await expect(page.getByText('Seneste træninger')).toBeVisible();
  });
});
