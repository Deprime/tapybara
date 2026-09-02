import { int, mysqlTable, boolean, varchar, timestamp } from 'drizzle-orm/mysql-core';

export const items = mysqlTable('items', {
  id: int('id').autoincrement().primaryKey(),
  title: varchar('title', { length: 200 }).notNull(),
  done: boolean('done').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
