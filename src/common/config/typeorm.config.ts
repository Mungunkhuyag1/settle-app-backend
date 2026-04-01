import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Client } from 'pg';

export const getTypeOrmConfig = (
  configService: ConfigService,
): Promise<TypeOrmModuleOptions> => {
  const databaseUrl = configService.get<string>('DATABASE_URL');
  const host = configService.get<string>('DB_HOST');
  const port = configService.get<number>('DB_PORT');
  const username = configService.get<string>('DB_USER');
  const password = configService.get<string>('DB_PASSWORD');
  const database = configService.get<string>('DB_NAME');
  const useSsl = configService.get<string>('DB_SSL') === 'true';
  const shouldUseSsl = useSsl || Boolean(databaseUrl);
  const ssl = shouldUseSsl
    ? {
        rejectUnauthorized: false,
      }
    : false;

  const ensureSchemas = async () => {
    const client = new Client({
      connectionString: databaseUrl,
      host,
      port,
      user: username,
      password,
      database,
      ssl,
    });

    await client.connect();
    try {
      await client.query('CREATE SCHEMA IF NOT EXISTS auth');
      await client.query('CREATE SCHEMA IF NOT EXISTS billing');
    } finally {
      await client.end();
    }
  };

  return ensureSchemas().then(() => ({
    type: 'postgres',
    url: databaseUrl,
    host,
    port,
    username,
    password,
    database,
    ssl,
    autoLoadEntities: true,
    synchronize: configService.get<string>('NODE_ENV') !== 'production', // Auto-sync in dev only
    // logging: configService.get<string>('NODE_ENV') === 'development',
    logging: false,
    // extra: {
    //   max: 10, // Maximum number of clients in the pool
    //   idleTimeoutMillis: 30000, // How long a client is allowed to remain idle
    // },
  }));
};
