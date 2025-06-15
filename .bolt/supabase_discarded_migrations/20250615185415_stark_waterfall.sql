/*
  # Simple EU AI Act Enum Migration

  1. Add missing enum values for EU AI Act compliance
  2. Update existing data to use new categories
  3. Set appropriate defaults

  This migration uses the simplest possible approach to avoid 503 errors.
*/

-- Add new enum values (simple approach)
ALTER TYPE risk_level_enum ADD VALUE IF NOT EXISTS 'prohibited';
ALTER TYPE risk_level_enum ADD VALUE IF NOT EXISTS 'limited'; 
ALTER TYPE risk_level_enum ADD VALUE IF NOT EXISTS 'minimal';

-- Update existing data (simple batch updates)
UPDATE risk_assessments SET risk_level = 'minimal' WHERE risk_level = 'low';
UPDATE risk_assessments SET risk_level = 'limited' WHERE risk_level = 'medium';  
UPDATE risk_assessments SET risk_level = 'prohibited' WHERE risk_level = 'critical';

-- Set new default
ALTER TABLE risk_assessments ALTER COLUMN risk_level SET DEFAULT 'minimal';