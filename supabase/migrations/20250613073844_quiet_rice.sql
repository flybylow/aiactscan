/*
  # Fix Policy Conflict Migration

  This migration safely creates the risk_assessments table and policies,
  handling cases where some elements may already exist.

  1. New Tables
    - `risk_assessments` - stores conversation risk analysis data
      - `id` (uuid, primary key)
      - `conversation_id` (text, unique)
      - `agent_id` (text)
      - `user_id` (text, nullable)
      - `risk_level` (enum: low, medium, high, critical)
      - `risk_score` (integer, 0-100)
      - `risk_factors` (jsonb)
      - `conversation_summary` (text)
      - `detected_at` (timestamp)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `risk_assessments` table
    - Add policies for authenticated and anonymous users to read
    - Add policies for service role to insert/update
    - Handle existing policies gracefully

  3. Performance
    - Add indexes for common query patterns
*/

-- Create the risk_assessments table if it doesn't exist
CREATE TABLE IF NOT EXISTS risk_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id text NOT NULL,
  agent_id text NOT NULL,
  user_id text,
  risk_level text NOT NULL DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  risk_score integer NOT NULL DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
  risk_factors jsonb DEFAULT '{}',
  conversation_summary text DEFAULT '',
  detected_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create unique index on conversation_id to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_risk_assessments_conversation_id 
ON risk_assessments(conversation_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_risk_assessments_detected_at 
ON risk_assessments(detected_at DESC);

CREATE INDEX IF NOT EXISTS idx_risk_assessments_risk_level 
ON risk_assessments(risk_level);

CREATE INDEX IF NOT EXISTS idx_risk_assessments_agent_id 
ON risk_assessments(agent_id);

-- Enable Row Level Security
ALTER TABLE risk_assessments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DO $$
BEGIN
  -- Drop policies if they exist
  DROP POLICY IF EXISTS "Users can read all risk assessments" ON risk_assessments;
  DROP POLICY IF EXISTS "Anonymous users can read all risk assessments" ON risk_assessments;
  DROP POLICY IF EXISTS "Service role can insert risk assessments" ON risk_assessments;
  DROP POLICY IF EXISTS "Service role can update risk assessments" ON risk_assessments;
  
  -- Create new policies
  CREATE POLICY "Users can read all risk assessments"
    ON risk_assessments
    FOR SELECT
    TO authenticated
    USING (true);

  CREATE POLICY "Anonymous users can read all risk assessments"
    ON risk_assessments
    FOR SELECT
    TO anon
    USING (true);

  CREATE POLICY "Service role can insert risk assessments"
    ON risk_assessments
    FOR INSERT
    TO service_role
    WITH CHECK (true);

  CREATE POLICY "Service role can update risk assessments"
    ON risk_assessments
    FOR UPDATE
    TO service_role
    USING (true);
    
END $$;