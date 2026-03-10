-- Add content and journal_prompts fields to lessons table
-- content: stores the full lesson script/text in markdown format
-- journal_prompts: array of reflection/journal prompts for the student

ALTER TABLE lessons ADD COLUMN content TEXT;
ALTER TABLE lessons ADD COLUMN journal_prompts TEXT[] NOT NULL DEFAULT '{}';
