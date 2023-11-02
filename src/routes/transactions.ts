import { FastifyInstance } from 'fastify';
import { knex } from '../database';
import { z } from 'zod';
import { randomUUID } from 'crypto';

export enum TransactionType {
  CREDIT = 'credit',
  DEBIT = 'debit',
}

export const transactionsRoutes = async (app: FastifyInstance) => {
  app.get('/', async () => {
    const transactions = await knex('transactions').select('*');

    return { transactions };
  });

  app.get('/:id', async (request) => {
    const getTransactionParamsSchema = z.object({
      id: z.string(),
    });

    const { id } = getTransactionParamsSchema.parse(request.params);

    const transaction = await knex('transactions')
      .select('*')
      .where('id', id)
      .first();

    return { transaction };
  });

  app.get('/summary', async () => {
    const summary = await knex('transactions')
      .sum('amount', { as: 'amount' })
      .first();

    return { summary };
  });

  app.post('/', async (request, reply) => {
    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum([TransactionType.CREDIT, TransactionType.DEBIT]),
    });

    const body = createTransactionBodySchema.parse(request.body);

    await knex('transactions').insert({
      id: randomUUID(),
      title: body.title,
      amount:
        body.type === TransactionType.CREDIT ? body.amount : body.amount * -1,
    });

    return reply.status(201).send();
  });
};
