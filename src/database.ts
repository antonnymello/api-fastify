import { knex as Knex, Knex as KnexConfig } from 'knex';

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not defined');

export const config: KnexConfig.Config = {
  client: 'sqlite',
  connection: { filename: process.env.DATABASE_URL },
  useNullAsDefault: true,
  migrations: {
    extension: 'ts',
    directory: './database/migrations',
  },
};

export const knex = Knex(config);
