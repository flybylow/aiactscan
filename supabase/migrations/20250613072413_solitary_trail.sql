/*
  # Risk Assessment Storage Schema

  1. New Tables
    - `risk_assessments`
      - `id` (uuid, primary key)
      - `conversation_id` (text, unique identifier from ElevenLabs)
      - `agent_id` (text, ElevenLabs agent identifier)
      - `user_id` (uuid, foreign key to auth.users)
      - `risk_level` (text, enum: low, medium, high, critical)
      - `risk_score` (integer, 0-100 scale)
      - `risk_factors` (jsonb, detailed risk analysis)
      - `conversation_summary` (text, summary of the conversation)
      - `detected_at` (timestamptz, when risk was detected)
      - `created_at` (timestamptz, record creation time)
      - `updated_at` (timestamptz, last update time)

  2. Security
    - Enable RLS on `risk_assessments` table
    - Add policies for authenticated users to read their own data
    - Add policy for service role to insert webhook data

  3. Indexes
    - Index on conversation_id for fast lookups
    - Index on user_id for user-specific queries
    - Index on risk_level for filtering
    - Index on detected_at for time-based queries
*/

-- Create risk level enum type
CREATE TYPE risk_level_enum AS ENUM ('low', 'medium', 'high', 'critical');

-- Create risk assessments table
CREATE TABLE IF NOT EXISTS risk_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id text UNIQUE NOT NULL,
  agent_id text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  risk_level risk_level_enum NOT NULL DEFAULT 'low',
  risk_score integer CHECK (risk_score >= 0 AND risk_score <= 100) DEFAULT 0,
  risk_factors jsonb DEFAULT '{}',
  conversation_summary text,
  detected_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE risk_assessments ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_risk_assessments_conversation_id ON risk_assessments(conversation_id);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_user_id ON risk_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_risk_level ON risk_assessments(risk_level);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_detected_at ON risk_assessments(detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_agent_id ON risk_assessments(agent_id);

-- RLS Policies
CREATE POLICY "Users can read own risk assessments"
  ON risk_assessments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

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

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_risk_assessments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_risk_assessments_updated_at
  BEFORE UPDATE ON risk_assessments
  FOR EACH ROW
  EXECUTE FUNCTION update_risk_assessments_updated_at();