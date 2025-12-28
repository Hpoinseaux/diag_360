-- Normalised schema derived from Diag360_EvolV2.xlsx (everything except the first "Evol V2" sheet)
-- The goal is to stabilise relationships ahead of dbt models & NocoDB usage.

CREATE SCHEMA IF NOT EXISTS diag360_ref;
CREATE SCHEMA IF NOT EXISTS diag360_raw;

-----------------------------------------------------------------------
-- Reference tables (dimensions & controlled vocabularies)
-----------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS diag360_ref.needs (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    url TEXT,
    occurrence_count INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS diag360_ref.objectives (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS diag360_ref.indicator_types (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS diag360_ref.indicators (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    primary_domain TEXT,
    primary_url TEXT,
    primary_api_available BOOLEAN DEFAULT FALSE,
    secondary_domain TEXT,
    secondary_url TEXT,
    value_type TEXT, -- e.g. "Enquête territoire", "Donnée ouverte", "Calcul dérivé"
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS diag360_ref.indicator_need_links (
    indicator_id TEXT NOT NULL REFERENCES diag360_ref.indicators(id) ON DELETE CASCADE,
    need_id TEXT NOT NULL REFERENCES diag360_ref.needs(id) ON DELETE CASCADE,
    need_category TEXT, -- e.g. Vitaux / Essentiels / Induits
    need_label TEXT,
    role TEXT DEFAULT 'primary', -- primary, secondary, derived...
    extra_needs TEXT[], -- captures Besoin 1..5 for traceability
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (indicator_id, need_id, role)
);

CREATE TABLE IF NOT EXISTS diag360_ref.indicator_objective_links (
    indicator_id TEXT NOT NULL REFERENCES diag360_ref.indicators(id) ON DELETE CASCADE,
    objective_id TEXT NOT NULL REFERENCES diag360_ref.objectives(id) ON DELETE CASCADE,
    covers_subsistence BOOLEAN DEFAULT FALSE,
    covers_crisis BOOLEAN DEFAULT FALSE,
    covers_sustainability BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (indicator_id, objective_id)
);

CREATE TABLE IF NOT EXISTS diag360_ref.indicator_type_links (
    indicator_id TEXT NOT NULL REFERENCES diag360_ref.indicators(id) ON DELETE CASCADE,
    indicator_type_id TEXT NOT NULL REFERENCES diag360_ref.indicator_types(id) ON DELETE CASCADE,
    is_state BOOLEAN DEFAULT FALSE,
    is_action BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (indicator_id, indicator_type_id)
);

-----------------------------------------------------------------------
-- Raw tables mirroring Excel content (after unpivot)
-----------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS diag360_raw.epcis (
    code_siren TEXT PRIMARY KEY,
    department_code TEXT,
    label TEXT NOT NULL,
    legal_form TEXT,
    population_communal INTEGER,
    population_total INTEGER,
    area_hectares NUMERIC,
    area_km2 NUMERIC,
    urbanised_area_km2 NUMERIC,
    density_per_km2 NUMERIC,
    department_count INTEGER,
    region_count INTEGER,
    member_count INTEGER,
    delegate_count INTEGER,
    competence_count INTEGER,
    fiscal_potential NUMERIC,
    grant_global NUMERIC,
    grant_compensation NUMERIC,
    grant_intercommunality NUMERIC,
    seat_city TEXT,
    source_row INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS diag360_raw.indicator_values (
    epci_siren TEXT NOT NULL REFERENCES diag360_raw.epcis(code_siren) ON DELETE CASCADE,
    indicator_id TEXT NOT NULL REFERENCES diag360_ref.indicators(id) ON DELETE CASCADE,
    value NUMERIC,
    unit TEXT,
    data_year INTEGER NOT NULL DEFAULT 0,
    source_sheet TEXT DEFAULT 'Table Valeurs',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (epci_siren, indicator_id, data_year)
);

CREATE INDEX IF NOT EXISTS idx_indicator_values_indicator ON diag360_raw.indicator_values (indicator_id);

CREATE TABLE IF NOT EXISTS diag360_raw.indicator_scores (
    epci_siren TEXT NOT NULL REFERENCES diag360_raw.epcis(code_siren) ON DELETE CASCADE,
    indicator_id TEXT NOT NULL REFERENCES diag360_ref.indicators(id) ON DELETE CASCADE,
    score NUMERIC(5,2),
    data_year INTEGER NOT NULL DEFAULT 0,
    source_sheet TEXT DEFAULT 'Table Scores indicateurs',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (epci_siren, indicator_id, data_year)
);

CREATE TABLE IF NOT EXISTS diag360_raw.score_means (
    epci_siren TEXT NOT NULL REFERENCES diag360_raw.epcis(code_siren) ON DELETE CASCADE,
    metric_code TEXT NOT NULL, -- e.g. score_moyen_global, score_moyen_b01...
    value NUMERIC(5,2),
    data_year INTEGER NOT NULL DEFAULT 0,
    source_sheet TEXT DEFAULT 'Table Scores moyens',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (epci_siren, metric_code, data_year)
);

CREATE TABLE IF NOT EXISTS diag360_raw.transformation_rules (
    indicator_id TEXT NOT NULL REFERENCES diag360_ref.indicators(id) ON DELETE CASCADE,
    value_type TEXT,
    unit TEXT,
    min_value NUMERIC,
    max_value NUMERIC,
    bound_type TEXT,
    regression_type TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (indicator_id, value_type)
);

CREATE TABLE IF NOT EXISTS diag360_raw.need_scores (
    epci_siren TEXT NOT NULL REFERENCES diag360_raw.epcis(code_siren) ON DELETE CASCADE,
    need_id TEXT NOT NULL REFERENCES diag360_ref.needs(id) ON DELETE CASCADE,
    need_label TEXT,
    data_year INTEGER NOT NULL DEFAULT 0,
    need_score NUMERIC(5,2),
    indicators_count INTEGER,
    computed_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (epci_siren, need_id, data_year)
);

-----------------------------------------------------------------------
-- Helper indexes for analytics tooling
-----------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_indicator_scores_indicator ON diag360_raw.indicator_scores (indicator_id);
CREATE INDEX IF NOT EXISTS idx_score_means_metric ON diag360_raw.score_means (metric_code);
CREATE INDEX IF NOT EXISTS idx_need_scores_need ON diag360_raw.need_scores (need_id);

-----------------------------------------------------------------------
-- Views to ease consumption from FastAPI / NocoDB
-----------------------------------------------------------------------

CREATE OR REPLACE VIEW diag360_ref.v_indicator_metadata AS
SELECT
    i.id,
    i.label,
    i.primary_domain,
    i.primary_url,
    i.primary_api_available,
    i.secondary_domain,
    i.secondary_url,
    i.value_type,
    ARRAY_AGG(DISTINCT n.label) FILTER (WHERE inl.need_id IS NOT NULL) AS needs,
    ARRAY_AGG(DISTINCT o.label) FILTER (WHERE iol.objective_id IS NOT NULL) AS objectives,
    ARRAY_AGG(DISTINCT it.label) FILTER (WHERE itl.indicator_type_id IS NOT NULL) AS indicator_types
FROM diag360_ref.indicators i
LEFT JOIN diag360_ref.indicator_need_links inl ON inl.indicator_id = i.id
LEFT JOIN diag360_ref.needs n ON n.id = inl.need_id
LEFT JOIN diag360_ref.indicator_objective_links iol ON iol.indicator_id = i.id
LEFT JOIN diag360_ref.objectives o ON o.id = iol.objective_id
LEFT JOIN diag360_ref.indicator_type_links itl ON itl.indicator_id = i.id
LEFT JOIN diag360_ref.indicator_types it ON it.id = itl.indicator_type_id
GROUP BY i.id;
