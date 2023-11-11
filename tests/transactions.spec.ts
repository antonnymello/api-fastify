import { afterAll, beforeAll, expect, test } from 'vitest';
import request from 'supertest';

import { app } from '../src/app';

beforeAll(async () => {
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

test('user can create a new transaction', async () => {
  const response = await request(app.server).post('/transactions').send({
    title: 'NEW_TRANSACTION',
    amount: 1000,
    type: 'credit',
  });

  expect(response.statusCode).toBe(201);
});
