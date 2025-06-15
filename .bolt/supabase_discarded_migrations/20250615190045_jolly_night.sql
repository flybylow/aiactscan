/*
  # Minimal EU AI Act Enum Fix

  1. Changes
    - Update default risk level to 'low' (maps to MINIMAL risk in EU AI Act)
    - Add simple comment for EU AI Act mapping

  Note: Existing enum values (low, medium, high, critical) are already correct
  and map to EU AI Act categories in the application layer.
*/

-- Update default value to 'low' (MINIMAL risk in EU AI Act)
ALTER TABLE risk_assessments 
ALTER COLUMN risk_level SET DEFAULT 'low'::risk_level_enum;

-- Add comment explaining EU AI Act mapping
COMMENT ON COLUMN risk_assessments.risk_level IS 'Maps to EU AI Act: low=MINIMAL, medium=LIMITED, high=HIGH-RISK, critical=PROHIBITED';