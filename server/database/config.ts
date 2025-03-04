import { Options, PostgreSqlDriver } from '@mikro-orm/postgresql';
import config from '../config';
import { Migrator } from '@mikro-orm/migrations';

const driverOptions = config.IS_DATABASE_SSL_ENABLED
  ? {
    connection: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  }
  : {};

const dbConfig: Options = {
  driver: PostgreSqlDriver,
  driverOptions,
  host: config.DATABASE_HOST,
  port: config.DATABASE_PORT,
  dbName: config.DATABASE_NAME,
  user: config.DATABASE_USER,
  password: config.DATABASE_PASSWORD,
  entities: ['**/*.entity.js'],
  entitiesTs: ['**/*.entity.ts'],
  extensions: [Migrator],
  migrations: {
    path: 'dist/database/migrations',
    pathTs: 'server/database/migrations'
  }
};

export default dbConfig;
