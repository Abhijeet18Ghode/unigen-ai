import { pgTable, serial, varchar, text, timestamp } from "drizzle-orm/pg-core"; // Ensure 'text' and 'timestamp' are imported

export const MockInterview = pgTable('MockInterview', {
    id: serial('id').primaryKey(),
    jsonMockResp: text('jsonMockResp').notNull(),
    jobPosition: varchar('jobPosition').notNull(),
    jobDesc: varchar('jobDesc').notNull(),
    jobExperience: varchar('jobExperience').notNull(),
    createdBy: varchar('createdBy').notNull(), // Ensure this is consistent
    createdAt: timestamp('createdAt').notNull(), // Use timestamp instead of varchar
    mockId: varchar('mockId').notNull(),
});
