import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('https://soroban-testnet.stellar.org/**', async route => {
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
              xdr: 'AAAAAQ=='
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
        result: {}
      }),
    });
  });
});

test('smoke test static site export routes', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  await page.goto('/dashboard');
  await expect(page.getByRole('heading')).toBeVisible();

  await page.goto('/send');
  await expect(page.getByRole('heading')).toBeVisible();

  await page.goto('/history');
  await expect(page.getByRole('heading')).toBeVisible();

  expect(errors).toHaveLength(0);
});
