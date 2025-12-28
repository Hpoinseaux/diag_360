CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.territories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code_siren VARCHAR(32) UNIQUE NOT NULL,
    name TEXT NOT NULL,
    type TEXT,
    population INTEGER,
    department TEXT,
    region TEXT,
    score NUMERIC(5,2) NOT NULL DEFAULT 0,
    score_water NUMERIC(5,2),
    score_food NUMERIC(5,2),
    score_housing NUMERIC(5,2),
    score_healthcare NUMERIC(5,2),
    score_security NUMERIC(5,2),
    score_education NUMERIC(5,2),
    score_social_cohesion NUMERIC(5,2),
    score_nature NUMERIC(5,2),
    score_local_economy NUMERIC(5,2),
    score_energy NUMERIC(5,2),
    score_mobility NUMERIC(5,2),
    data_year INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_territories_code_siren ON public.territories(code_siren);
CREATE INDEX IF NOT EXISTS idx_territories_name ON public.territories USING gin (to_tsvector('french', name));
