import { execSync } from 'node:child_process';
import { describe, afterAll, beforeAll, expect, it, beforeEach } from 'vitest';
import request from 'supertest';

import { app } from '../src/app';

interface CreateTransactionBody {
  title: string;
  amount: number;
  type: 'credit' | 'debit';
}

describe('Transactions routes', () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    execSync('npm run knex migrate:rollback --all');
    execSync('npm run knex migrate:latest');
  });

  it('should be able to create a new transaction', async () => {
    const response = await request(app.server).post('/transactions').send({
      title: 'NEW_TRANSACTION',
      amount: 1000,
      type: 'credit',
    });

    expect(response.statusCode).toBe(201);
  });

  it('should be able to list all transactions', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'NEW_TRANSACTION',
        amount: 1000,
        type: 'credit',
      });

    const cookies = createTransactionResponse.get('set-cookie');

    const listTransactionResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies);

    expect(listTransactionResponse.statusCode).toBe(200);
    expect(listTransactionResponse.body.transactions).toEqual([
      expect.objectContaining({ title: 'NEW_TRANSACTION', amount: 1000 }),
    ]);
  });

  it('should be able to get specific transaction', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'NEW_TRANSACTION',
        amount: 1000,
        type: 'credit',
      });

    const cookies = createTransactionResponse.get('set-cookie');

    const listTransactionResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies);

    const transactionId = listTransactionResponse.body.transactions[0].id;

    const getTransactionResponse = await request(app.server)
      .get(`/transactions/${transactionId}`)
      .set('Cookie', cookies);

    expect(getTransactionResponse.statusCode).toBe(200);
    expect(getTransactionResponse.body.transaction).toEqual(
      expect.objectContaining({ title: 'NEW_TRANSACTION', amount: 1000 })
    );
  });

  it('should be able to get the summary', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'NEW_TRANSACTION',
        amount: 1000,
        type: 'credit',
      });

    const cookies = createTransactionResponse.get('set-cookie');

    await request(app.server)
      .post('/transactions')
      .set('Cookie', cookies)
      .send({ title: 'ANOTHER_TRANSACTION', amount: 500, type: 'debit' });

    const summaryResponse = await request(app.server)
      .get(`/transactions/summary`)
      .set('Cookie', cookies);

    expect(summaryResponse.statusCode).toBe(200);
    expect(summaryResponse.body.summary).toEqual({ amount: 500 });
  });
});
