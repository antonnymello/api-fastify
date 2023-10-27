import { knex as Knex, Knex as KnexConfig } from 'knex';

export const config: KnexConfig.Config = {
  client: 'sqlite',
  connection: { filename: './database/app.db' },
  useNullAsDefault: true,
  migrations: {
    extension: 'ts',
    directory: './database/migrations',
  },
};

export const knex = Knex(config);
