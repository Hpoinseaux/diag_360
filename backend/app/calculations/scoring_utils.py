"""
Utility helpers imported from the external Guillaume-BR/diag360 repo.

These functions orchestrate downloads of public datasets, unzip archives,
load CSV files with DuckDB, and normalize postal/insee codes. They are kept
here to let scoring scripts reuse them without depending on the original repo.
"""

from __future__ import annotations

import os
import zipfile
from pathlib import Path
from typing import Optional

import duckdb
import pandas as pd
import requests


def download_file(url: str, extract_to: Path | str, filename: str) -> Path:
    """
    Download a file only if it is missing on disk.
    """

    target_dir = Path(extract_to)
    target_dir.mkdir(parents=True, exist_ok=True)
    file_path = target_dir / filename

    if not file_path.exists():
        response = requests.get(url, timeout=60)
        response.raise_for_status()
        file_path.write_bytes(response.content)
    return file_path


def extract_zip(zip_filename: Path | str, extract_to: Path | str) -> None:
    """
    Extract a ZIP archive into the destination directory.
    """

    with zipfile.ZipFile(zip_filename, "r") as archive:
        archive.extractall(Path(extract_to))


def load_csv_to_duckdb(file_path: Path | str, table_name: str, con: duckdb.DuckDBPyConnection) -> None:
    """
    Load a CSV file into DuckDB (create or replace table).
    """

    con.execute(
        f"""
        CREATE OR REPLACE TABLE {table_name} AS
        SELECT * FROM read_csv_auto('{file_path}', header=True)
        """
    )


def float_to_codepostal(df: pd.DataFrame, col: str) -> pd.DataFrame:
    """
    Convert numeric postal codes to left-padded 5-digit strings.
    """

    df[col] = df[col].astype(str).str.replace(".0", "", regex=False).str.zfill(5)
    return df


def homogene_nan(df: pd.DataFrame) -> pd.DataFrame:
    """
    Standardize invalid postal / insee placeholders to NA.
    """

    cols = ["adrs_codeinsee", "adrs_codepostal"]
    invalid_values = {"nan", "<NA>", "NaN", "Nan", "0", "0.0", "", "INSEE", "commune"}
    for col in cols:
        df[col] = df[col].astype(str).str.strip()
        df[col] = df[col].where(~df[col].isin(invalid_values))
        df = float_to_codepostal(df, col)
    return df


def create_dataframe_communes(dir_path: Path) -> pd.DataFrame:
    """
    Download and cache the communes catalog, then return a dataframe.
    """

    com_url = "https://www.data.gouv.fr/api/1/datasets/r/f5df602b-3800-44d7-b2df-fa40a0350325"
    local = download_file(com_url, extract_to=dir_path, filename="communes_france_2025.csv")
    df_com = pd.read_csv(local)
    df_com = float_to_codepostal(df_com, "code_postal")
    return df_com


def create_dataframe_epci(extract_dir: Path) -> pd.DataFrame:
    """
    Download and return the EPCI dataset.
    """

    epci_url = "https://www.data.gouv.fr/api/1/datasets/r/6e05c448-62cc-4470-aa0f-4f31adea0bc4"
    local = download_file(epci_url, extract_to=extract_dir, filename="data_epci.csv")
    return duckdb.read_csv(str(local), ignore_errors=True, sep=";")
