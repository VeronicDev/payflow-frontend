import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // Intercept Soroban RPC calls to simulate contract responses without live network
  await page.route('**/soroban-testnet.stellar.org/**', async (route) => {
    const postData = route.request().postDataJSON();
    if (postData && postData.method === 'getLedgerEntries') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: postData.id || 1,
          result: {
            entries: [],
            latestLedger: 123456
          }
        }),
      });
      return;
    }
    if (postData && postData.method === 'simulateTransaction') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: postData.id || 1,
          result: {
            results: [{
              xdr: 'AAAA==',
              auth: []
            }],
            latestLedger: 123456
          }
        }),
      });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: postData?.id || 1,
        result: {}
      }),
    });
  });
});

test('smoke test static export routes, headings and no console errors', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  // Test home route
  await page.goto('/payflow-frontend/');
  await expect(page.locator('h1').first()).toBeVisible();

  // Test dashboard route
  await page.goto('/payflow-frontend/dashboard');
  await expect(page.locator('h1').first()).toBeVisible();

  // Test merchant route
  await page.goto('/payflow-frontend/merchant');
  await expect(page.locator('h1').first()).toBeVisible();

  // Ensure no unhandled console error messages occurred
  expect(consoleErrors).toEqual([]);
});
