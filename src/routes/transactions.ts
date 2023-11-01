import { FastifyInstance } from 'fastify';
import { knex } from '../database';
import { z } from 'zod';
import { randomUUID } from 'crypto';

export enum TransactionType {
  CREDIT = 'credit',
  DEBIT = 'debit',
}

export const transactionsRoutes = async (app: FastifyInstance) => {
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
      amount: body.type === TransactionType.CREDIT ? body.amount : -body.amount,
    });

    return reply.status(201).send();
  });
};
