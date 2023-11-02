import { FastifyInstance } from 'fastify';
import { knex } from '../database';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { checkSessionIdExists } from '../middlewares/check-session-id-exists';

export enum TransactionType {
  CREDIT = 'credit',
  DEBIT = 'debit',
}

export const transactionsRoutes = async (app: FastifyInstance) => {
  app.get('/', { preHandler: [checkSessionIdExists] }, async (request) => {
    const { sessionId } = request.cookies;

    const transactions = await knex('transactions')
      .where('session_id', sessionId)
      .select('*');

    return { transactions };
  });

  app.get('/:id', { preHandler: [checkSessionIdExists] }, async (request) => {
    const getTransactionParamsSchema = z.object({
      id: z.string(),
    });

    const { id } = getTransactionParamsSchema.parse(request.params);

    const { sessionId } = request.cookies;

    const transaction = await knex('transactions')
      .select('*')
      .where({ session_id: sessionId, id })
      .first();

    return { transaction };
  });

  app.get(
    '/summary',
    { preHandler: [checkSessionIdExists] },
    async (request) => {
      const { sessionId } = request.cookies;

      const summary = await knex('transactions')
        .where('session_id', sessionId)
        .sum('amount', { as: 'amount' })
        .first();

      return { summary };
    }
  );

  app.post('/', async (request, reply) => {
    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum([TransactionType.CREDIT, TransactionType.DEBIT]),
    });

    const body = createTransactionBodySchema.parse(request.body);

    let { sessionId } = request.cookies;

    if (!sessionId) {
      sessionId = randomUUID();

      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      });
    }

    await knex('transactions').insert({
      id: randomUUID(),
      title: body.title,
      amount:
        body.type === TransactionType.CREDIT ? body.amount : body.amount * -1,
      session_id: sessionId,
    });

    return reply.status(201).send();
  });
};
