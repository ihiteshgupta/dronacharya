import { pgTable, uuid, varchar, text, timestamp, integer, jsonb, unique, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';

export const achievements = pgTable('achievements', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  category: varchar('category', { length: 50 }).notNull(),
  icon: varchar('icon', { length: 50 }),
  xpReward: integer('xp_reward').default(0),
  criteria: jsonb('criteria').$type<AchievementCriteria>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const userAchievements = pgTable('user_achievements', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  achievementId: uuid('achievement_id').notNull().references(() => achievements.id, { onDelete: 'cascade' }),
  earnedAt: timestamp('earned_at').defaultNow().notNull(),
}, (table) => [
  unique().on(table.userId, table.achievementId),
]);

export const xpTransactions = pgTable('xp_transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  amount: integer('amount').notNull(),
  reason: varchar('reason', { length: 100 }).notNull(),
  sourceType: varchar('source_type', { length: 50 }),
  sourceId: uuid('source_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('xp_transactions_user_id_idx').on(table.userId),
  index('xp_transactions_created_at_idx').on(table.createdAt),
]);

export const streakHistory = pgTable('streak_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  date: timestamp('date').notNull(),
  streakCount: integer('streak_count').notNull(),
  freezeUsed: integer('freeze_used').default(0),
}, (table) => [
  index('streak_history_user_id_idx').on(table.userId),
]);

// Relations
export const achievementsRelations = relations(achievements, ({ many }) => ({
  userAchievements: many(userAchievements),
}));

export const userAchievementsRelations = relations(userAchievements, ({ one }) => ({
  user: one(users, {
    fields: [userAchievements.userId],
    references: [users.id],
  }),
  achievement: one(achievements, {
    fields: [userAchievements.achievementId],
    references: [achievements.id],
  }),
}));

export const xpTransactionsRelations = relations(xpTransactions, ({ one }) => ({
  user: one(users, {
    fields: [xpTransactions.userId],
    references: [users.id],
  }),
}));

// Types
export interface AchievementCriteria {
  type: 'count' | 'streak' | 'score' | 'time' | 'custom';
  target: number;
  metric?: string;
  conditions?: Record<string, unknown>;
}
