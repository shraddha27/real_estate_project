import { Sequelize, Transaction } from 'sequelize';
import { environment } from '../config';
import { initializeModels } from './models';

export const sequelize = new Sequelize(environment.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  pool: { max: 10, idle: 30_000 },
});

initializeModels(sequelize);

export const withTransaction = <T>(operation: (transaction: Transaction) => Promise<T>): Promise<T> =>
  sequelize.transaction(operation);

export const closeDatabase = async (): Promise<void> => {
  await sequelize.close();
};
