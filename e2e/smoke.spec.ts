import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('**/soroban-testnet.stellar.org/**', async (route) => {
    const postData = route.request().postDataJSON();
    if (postData && postData.method === 'getLedgerEntries') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: postData.id,
          result: {
            entries: [],
            latestLedger: 100
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
          id: postData.id,
          result: {
            results: [{
              xdr: 'AAAAAQAAAAAAAAAA',
            }],
            latestLedger: 100
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
        result: { latestLedger: 100 }
      }),
    });
  });
});

test('smoke test: home page loads and displays heading', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  await page.goto('/');
  await expect(page.locator('h1').first()).toBeVisible();
  expect(errors).toEqual([]);
});

test('smoke test: dashboard route loads', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  await page.goto('/dashboard');
  await expect(page.locator('h1').first()).toBeVisible();
  expect(errors).toEqual([]);
});

test('smoke test: merchant route loads', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  await page.goto('/merchant');
  await expect(page.locator('h1').first()).toBeVisible();
  expect(errors).toEqual([]);
});

test('smoke test: streaming route loads', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  await page.goto('/streaming');
  await expect(page.locator('h1').first()).toBeVisible();
  expect(errors).toEqual([]);
});
