import { pgTable, uuid, varchar, timestamp, integer, jsonb, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';
import { tracks, lessons } from './content';

export const enrollments = pgTable('enrollments', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  trackId: uuid('track_id').notNull(),
  status: varchar('status', { length: 20 }).notNull().default('active'),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  targetDate: timestamp('target_date'),
  completedAt: timestamp('completed_at'),
}, (table) => ({
  userTrackUnique: unique().on(table.userId, table.trackId),
}));

export const progress = pgTable('progress', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  lessonId: uuid('lesson_id').notNull(),
  status: varchar('status', { length: 20 }).notNull().default('not_started'),
  score: integer('score'),
  attempts: integer('attempts').default(0),
  timeSpentSeconds: integer('time_spent_seconds').default(0),
  completedAt: timestamp('completed_at'),
  metadata: jsonb('metadata').$type<ProgressMetadata>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userLessonUnique: unique().on(table.userId, table.lessonId),
}));

// Relations
export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  user: one(users, {
    fields: [enrollments.userId],
    references: [users.id],
  }),
  track: one(tracks, {
    fields: [enrollments.trackId],
    references: [tracks.id],
  }),
}));

export const progressRelations = relations(progress, ({ one }) => ({
  user: one(users, {
    fields: [progress.userId],
    references: [users.id],
  }),
  lesson: one(lessons, {
    fields: [progress.lessonId],
    references: [lessons.id],
  }),
}));

// Types
export interface ProgressMetadata {
  hintsUsed?: number;
  codeSubmissions?: number;
  lastPosition?: number;
}
