const { test, expect } = require('@playwright/test');

test('home page loads with correct title and heading', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('EXPOSurE.ART — Digital Portfolio of Mikol Anthony');
  await expect(page.locator('h1')).toHaveText('EXPOSurE.ART');
});

test('gallery page loads with correct title and cards', async ({ page }) => {
  await page.goto('/gallery.html');
  await expect(page).toHaveTitle('EXPOSurE.ART — Gallery');
  await expect(page.locator('.gallery-card')).toHaveCount(2);
});

test('nav: home page has links to home and gallery', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('nav a[href="index.html"]')).toBeVisible();
  await expect(page.locator('nav a[href="gallery.html"]')).toBeVisible();
});

test('nav: clicking Gallery navigates to gallery page', async ({ page }) => {
  await page.goto('/');
  await page.click('nav a[href="gallery.html"]');
  await expect(page).toHaveURL(/gallery(\.html)?$/);
  await expect(page.locator('h1')).toHaveText('Gallery');
});

test('nav: clicking Home from gallery returns to home', async ({ page }) => {
  await page.goto('/gallery.html');
  await page.click('nav a[href="index.html"]');
  await expect(page.locator('h1')).toHaveText('EXPOSurE.ART');
});

test('featured cards on home page link to correct collections', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.feat-card').nth(0)).toHaveAttribute('href', 'collections/drop-01/');
  await expect(page.locator('.feat-card').nth(1)).toHaveAttribute('href', 'collections/drop-02/');
});

test('gallery cards link to correct collections', async ({ page }) => {
  await page.goto('/gallery.html');
  await expect(page.locator('.gallery-card').nth(0)).toHaveAttribute('href', 'collections/drop-01/');
  await expect(page.locator('.gallery-card').nth(1)).toHaveAttribute('href', 'collections/drop-02/');
});

test('collection images have non-empty alt text', async ({ page }) => {
  await page.goto('/gallery.html');
  const imgs = page.locator('.gallery-card img');
  const count = await imgs.count();
  for (let i = 0; i < count; i++) {
    const alt = await imgs.nth(i).getAttribute('alt');
    expect(alt).toBeTruthy();
  }
});
