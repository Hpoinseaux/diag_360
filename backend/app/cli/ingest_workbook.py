import argparse
import logging
from decimal import Decimal, InvalidOperation
from pathlib import Path
from typing import Iterable, List, Optional

import pandas as pd
from sqlalchemy import select

from app.db import Base, SessionLocal, engine
from app.models import (
    Epci,
    Indicator,
    IndicatorNeedLink,
    IndicatorObjectiveLink,
    IndicatorScore,
    IndicatorType,
    IndicatorTypeLink,
    IndicatorValue,
    Need,
    Objective,
    ScoreMean,
    TransformationRule,
)

logger = logging.getLogger("diag360.ingest_workbook")


def normalise_str(value) -> Optional[str]:
    if pd.isna(value):
        return None
    text = str(value).strip()
    if not text or text.lower() in {"nan", "none"}:
        return None
    return text


def normalise_code(value) -> Optional[str]:
    text = normalise_str(value)
    if text is None:
        return None
    try:
        if "e" in text.lower():
            number = int(Decimal(text))
        elif text.endswith(".0"):
            number = int(float(text))
        else:
            number = int(text)
        return f"{number}"
    except (ValueError, InvalidOperation):
        return text


def to_int(value) -> Optional[int]:
    if pd.isna(value):
        return None
    try:
        return int(float(value))
    except (TypeError, ValueError):
        return None


def to_float(value) -> Optional[float]:
    if pd.isna(value):
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def iter_rows(df: pd.DataFrame):
    df = df.rename(columns=lambda c: str(c).strip())
    columns = list(df.columns)
    for values in df.itertuples(index=False, name=None):
        yield dict(zip(columns, values))


def ingest_needs(session, df: pd.DataFrame):
    for row in iter_rows(df):
        need_id = normalise_str(row.get("ID_besoins"))
        if not need_id:
            continue
        need = Need(
            id=need_id,
            label=normalise_str(row.get("Libellé")) or "",
            url=normalise_str(row.get("URL")),
            occurrence_count=to_int(row.get("Nombre_occurences")),
        )
        session.merge(need)


def ingest_objectives(session, df: pd.DataFrame):
    for row in iter_rows(df):
        obj_id = normalise_str(row.get("ID_Objectifs"))
        if not obj_id:
            continue
        obj = Objective(
            id=obj_id,
            label=normalise_str(row.get("Libellé")) or "",
            url=normalise_str(row.get("URL")),
        )
        session.merge(obj)


def ingest_indicator_types(session, df: pd.DataFrame):
    for row in iter_rows(df):
        type_id = normalise_str(row.get("ID_"))
        if not type_id:
            continue
        indicator_type = IndicatorType(
            id=type_id,
            label=normalise_str(row.get("Libellé")) or "",
            url=normalise_str(row.get("URL")),
        )
        session.merge(indicator_type)


def ingest_indicators(session, df: pd.DataFrame):
    for row in iter_rows(df):
        indicator_id = normalise_str(row.get("ID_indicateurs"))
        if not indicator_id:
            continue
        indicator = Indicator(
            id=indicator_id,
            label=normalise_str(row.get("Libellé_indicateurs")) or "",
            primary_domain=normalise_str(row.get("Domaine_Source_principale")),
            primary_url=normalise_str(row.get("URL Source_Principale")),
            primary_api_available=bool(normalise_str(row.get("API disponible"))),
            secondary_domain=normalise_str(row.get("Domaine_Source_secondaire")),
            secondary_url=normalise_str(row.get("URL_Source_Secondaire")),
            value_type=normalise_str(row.get("TYPE DE VALEUR")),
        )
        session.merge(indicator)


def ingest_indicator_need_links(session, df: pd.DataFrame):
    need_ids = {need.id for need in session.execute(select(Need)).scalars()}
    for row in iter_rows(df):
        indicator_id = normalise_str(row.get("ID_Indicateurs"))
        if not indicator_id:
            continue
        base_need = normalise_str(row.get("ID_Besoin")) or normalise_str(row.get("Besoin 1"))
        category = normalise_str(row.get("Type_de_besoins")) or normalise_str(row.get("Type de besoins"))
        need_label = normalise_str(row.get("Besoins"))
        extra_needs = []
        for col in ["Besoin 1", "Besoin 2", "Besoin 3", "Besoin 4", "Besoin 5"]:
            val = normalise_str(row.get(col))
            if val:
                extra_needs.append(val)
        entries = []
        if base_need:
            entries.append(("primary", base_need))
        for idx, need in enumerate(extra_needs, start=1):
            entries.append((f"extra_{idx}", need))
        if not entries:
            continue
        stored_extra = [need for _, need in entries[1:]]
        for role, need_id in entries:
            if need_id not in need_ids:
                continue
            link = IndicatorNeedLink(
                indicator_id=indicator_id,
                need_id=need_id,
                role=role,
                need_category=category,
                need_label=need_label,
                extra_needs=stored_extra or None,
            )
            session.merge(link)


def _flag(value) -> bool:
    text = normalise_str(value)
    if not text:
        return False
    return text.lower() in {"x", "1", "true", "oui"}


def ingest_indicator_objective_links(session, df: pd.DataFrame):
    for row in iter_rows(df):
        indicator_id = normalise_str(row.get("ID_Indicateurs"))
        if not indicator_id:
            continue
        label_cols = {
            "covers_subsistence": row.get("o1_Subsistance"),
            "covers_crisis": row.get("o2_Gestion-de-crise"),
            "covers_sustainability": row.get("o3_Soutenabilité"),
        }
        for objective_code, col_name in zip(["o1", "o2", "o3"], label_cols.values()):
            if _flag(col_name):
                link = IndicatorObjectiveLink(
                    indicator_id=indicator_id,
                    objective_id=objective_code,
                    covers_subsistence=objective_code == "o1",
                    covers_crisis=objective_code == "o2",
                    covers_sustainability=objective_code == "o3",
                )
                session.merge(link)


def ingest_indicator_type_links(session, df: pd.DataFrame):
    for row in iter_rows(df):
        indicator_id = normalise_str(row.get("ID_indicateurs"))
        if not indicator_id:
            continue
        entries = [
            ("Typ1", _flag(row.get("Typ1_Etat")), {"is_state": True, "is_action": False}),
            ("Typ2", _flag(row.get("Typ2_Action")), {"is_state": False, "is_action": True}),
        ]
        for type_id, flag, meta in entries:
            if not flag:
                continue
            link = IndicatorTypeLink(
                indicator_id=indicator_id,
                indicator_type_id=type_id,
                **meta,
            )
            session.merge(link)


def ingest_epcis(session, df: pd.DataFrame):
    df = df.rename(columns=lambda c: str(c).strip().lower())
    for row in iter_rows(df):
        siren = normalise_code(row.get("siren"))
        if not siren:
            continue
        epci = Epci(
            code_siren=siren,
            department_code=normalise_code(row.get("dept")),
            label=normalise_str(row.get("epci_libellé")) or "",
            legal_form=normalise_str(row.get("nature_juridique")),
            population_communal=to_int(row.get("total_pop_mun")),
            population_total=to_int(row.get("total_pop_tot")),
            area_hectares=to_float(row.get("superficie_hectare")),
            area_km2=to_float(row.get("superficie_km2")),
            urbanised_area_km2=to_float(row.get("superficie_urbanisee_km2")),
            density_per_km2=to_float(row.get("densite_par_km2")),
            department_count=to_int(row.get("nb_departements")),
            region_count=to_int(row.get("nb_regions")),
            member_count=to_int(row.get("nb_membres")),
            delegate_count=to_int(row.get("nb_delegues")),
            competence_count=to_int(row.get("nb_competences")),
            fiscal_potential=to_float(row.get("potentiel_fiscal")),
            grant_global=to_float(row.get("dotation_globale")),
            grant_compensation=to_float(row.get("dotation_compensation")),
            grant_intercommunality=to_float(row.get("dotation_intercommunalite")),
            seat_city=normalise_str(row.get("ville_siege")),
        )
        session.merge(epci)


def _melt_indicator_values(
    df: pd.DataFrame,
    value_columns: Iterable[str],
    id_column: str,
    value_column_name: str,
):
    melted = df.melt(id_vars=[id_column], value_vars=value_columns, var_name="indicator_id", value_name=value_column_name)
    melted = melted.dropna(subset=[value_column_name, id_column], how="any")
    return melted


def ingest_indicator_values(session, df: pd.DataFrame):
    indicator_cols = [c for c in df.columns if str(c).lower().startswith("i")]
    long_df = _melt_indicator_values(df, indicator_cols, "ID_EPCI", "value")
    for row in iter_rows(long_df):
        epci = normalise_code(row.get("ID_EPCI"))
        indicator_id = normalise_str(row.get("indicator_id"))
        if not epci or not indicator_id:
            continue
        value = to_float(row.get("value"))
        record = IndicatorValue(
            epci_siren=epci,
            indicator_id=indicator_id,
            data_year="0",
            value=value,
        )
        session.merge(record)


def ingest_indicator_scores(session, df: pd.DataFrame):
    indicator_cols = [c for c in df.columns if str(c).lower().startswith("i")]
    long_df = _melt_indicator_values(df, indicator_cols, "ID_EPCI", "score")
    for row in iter_rows(long_df):
        epci = normalise_code(row.get("ID_EPCI"))
        indicator_id = normalise_str(row.get("indicator_id"))
        if not epci or not indicator_id:
            continue
        score = to_float(row.get("score"))
        record = IndicatorScore(
            epci_siren=epci,
            indicator_id=indicator_id,
            data_year="0",
            score=score,
        )
        session.merge(record)


def ingest_score_means(session, df: pd.DataFrame):
    metric_cols = [c for c in df.columns if c not in {"ID_EPCI", "Libellé_EPCI"}]
    long_df = df.melt(id_vars=["ID_EPCI"], value_vars=metric_cols, var_name="metric_code", value_name="value")
    long_df = long_df.dropna(subset=["value", "ID_EPCI"], how="any")
    for row in iter_rows(long_df):
        epci = normalise_code(row.get("ID_EPCI"))
        metric_code = normalise_str(row.get("metric_code"))
        if not epci or not metric_code:
            continue
        record = ScoreMean(
            epci_siren=epci,
            metric_code=metric_code,
            data_year="0",
            value=to_float(row.get("value")),
        )
        session.merge(record)


def ingest_transformation_rules(session, df: pd.DataFrame):
    for row in iter_rows(df):
        indicator_id = normalise_str(row.get("ID_indicateurs"))
        if not indicator_id:
            continue
        record = TransformationRule(
            indicator_id=indicator_id,
            value_type=normalise_str(row.get("TYPE DE VALEUR")) or "default",
            unit=normalise_str(row.get("Unité")),
            min_value=to_float(row.get("ValeurMin")),
            max_value=to_float(row.get("ValeurMax")),
            bound_type=normalise_str(row.get("Type de bornes")),
            regression_type=normalise_str(row.get("Type de régression")),
            notes=None,
        )
        session.merge(record)


SHEETS_MAPPING = {
    "Table Besoins": ingest_needs,
    "Table Objectifs": ingest_objectives,
    "Table Type indicateurs": ingest_indicator_types,
    "Table Indicateurs-Sources": ingest_indicators,
    "Correspondance Indicateurs-Beso": ingest_indicator_need_links,
    "Correspondance Indicateurs-Obje": ingest_indicator_objective_links,
    "Correspondance Indicateurs-Type": ingest_indicator_type_links,
    "Table EPCI": ingest_epcis,
    "Table Valeurs": ingest_indicator_values,
    "Table Scores indicateurs": ingest_indicator_scores,
    "Table Scores moyens": ingest_score_means,
    "Table Transfo Valeurs-Scores": ingest_transformation_rules,
}


def ingest_workbook(path: Path):
    logging.info("Lecture du classeur %s", path)
    xl = pd.read_excel(path, sheet_name=list(SHEETS_MAPPING.keys()), dtype=object)
    session = SessionLocal()
    try:
        for sheet_name, func in SHEETS_MAPPING.items():
            df = xl.get(sheet_name)
            if df is None:
                logger.warning("Onglet %s introuvable, ignore.", sheet_name)
                continue
            logger.info("Ingestion de l’onglet %s (%s lignes)", sheet_name, len(df))
            func(session, df)
        session.commit()
        logger.info("Import terminé.")
    except Exception:
        session.rollback()
        logger.exception("Échec de l’import.")
        raise
    finally:
        session.close()


def main():
    logging.basicConfig(level=logging.INFO, format="%(levelname)s - %(message)s")
    parser = argparse.ArgumentParser(description="Ingestion complète Diag360_EvolV2.xlsx")
    parser.add_argument("--file", required=True, help="Chemin vers le fichier XLSX")
    args = parser.parse_args()

    path = Path(args.file)
    if not path.exists():
        raise FileNotFoundError(path)

    Base.metadata.create_all(bind=engine)
    ingest_workbook(path)


if __name__ == "__main__":
    main()
