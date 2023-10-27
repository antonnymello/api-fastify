import { knex as Knex, Knex as KnexConfig } from 'knex';
import { env } from './env';

export const config: KnexConfig.Config = {
  client: 'sqlite',
  connection: { filename: env.DATABASE_URL },
  useNullAsDefault: true,
  migrations: {
    extension: 'ts',
    directory: './database/migrations',
  },
};

export const knex = Knex(config);
