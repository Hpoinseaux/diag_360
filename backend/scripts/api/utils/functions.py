import requests
import zipfile
import os
import pandas as pd
import duckdb
from pathlib import Path


def download_file(url: str, extract_to: str = ".", filename: str = None) -> None:
    """
    Télécharge un fichier depuis une URL et l'enregistre localement.

    Le fichier est téléchargé uniquement s'il n'existe pas déjà
    dans le répertoire de destination.

    Parameters
    ----------
    url : str
        URL du fichier à télécharger.
    extract_to : str, optional
        Répertoire de destination du fichier (par défaut : répertoire courant).
    filename : str
        Nom du fichier local (avec extension).
    """

    if not os.path.exists(extract_to):
        os.makedirs(extract_to, exist_ok=True)
        print(f"Dossier créé : {extract_to}")

    filename = os.path.join(extract_to, filename)

    if not os.path.exists(filename):
        response = requests.get(url)
        response.raise_for_status()
        print(f"Téléchargement du fichier : {filename}")

        with open(filename, "wb") as f:
            f.write(response.content)
        print(f"Fichier téléchargé avec succès : {filename}")


def extract_zip(zip_filename: str, extract_to: str = ".") -> None:
    """
    Extrait le contenu d'une archive ZIP dans un répertoire cible.

    Parameters
    ----------
    zip_filename : str
        Chemin vers le fichier ZIP à extraire.
    extract_to : str, optional
        Répertoire de destination des fichiers extraits
        (par défaut : répertoire courant).

    Raises
    ------
    FileNotFoundError
        Si le fichier ZIP n'existe pas.
    zipfile.BadZipFile
        Si le fichier fourni n'est pas une archive ZIP valide.
    """

    with zipfile.ZipFile(zip_filename, "r") as z:
        z.extractall(extract_to)
    print(f"Extraction terminée dans le dossier : {extract_to}")


def load_csv_to_duckdb(file_path, table_name, con):
    """
    Charge un fichier CSV dans DuckDB sous forme de table.

    Le fichier CSV est lu automatiquement par DuckDB à l'aide de
    `read_csv_auto`, qui infère les types de colonnes.

    Parameters
    ----------
    file_path : str
        Chemin vers le fichier CSV à importer.
    table_name : str
        Nom de la table DuckDB à créer.
    con : duckdb.DuckDBPyConnection
        Connexion DuckDB active.

    Notes
    -----
    - La table est créée à partir du contenu du CSV.
    - Si une table du même nom existe déjà, une erreur sera levée.
    """

    con.execute(
        f"""
        CREATE OR REPLACE TABLE {table_name} AS 
        SELECT * FROM read_csv_auto('{file_path}',header=True,delim=',)
        """
    )


def float_to_codepostal(df: pd.DataFrame, col: str) -> pd.DataFrame:
    """
    Convertit une colonne contenant des codes postaux numériques en format chaîne à 5 caractères.

    Cette fonction est destinée aux cas où les codes postaux ont été lus comme
    des nombres flottants (ex. `1400.0`) et doivent être restaurés en chaînes
    avec zéros initiaux (ex. `01400`).

    Parameters
    ----------
    df : pandas.DataFrame
        DataFrame contenant la colonne à transformer.
    col : str
        Nom de la colonne contenant les codes postaux.

    Returns
    -------
    pandas.DataFrame
        DataFrame avec la colonne des codes postaux convertie en chaînes
        de longueur 5.

    Notes
    -----
    - La fonction modifie le DataFrame en place et le retourne.
    - Les valeurs manquantes sont converties en chaînes `'nan'`
      si elles ne sont pas nettoyées en amont.
    """

    df[col] = df[col].astype(str).str.replace(".0", "", regex=False).str.zfill(5)
    return df


def homogene_nan(df):
    cols = ["adrs_codeinsee", "adrs_codepostal"]
    invalid_values = ["nan", "<NA>", "NaN", "Nan", "0", "0.0", "", "INSEE", "commune"]
    for col in cols:
        df[col] = df[col].astype(str).str.strip()
        df[col] = df[col].replace(invalid_values, pd.NA)
        df = float_to_codepostal(df, col)
    return df


def create_dataframe_communes(dir_path):
    com_url = (
        "https://www.data.gouv.fr/api/1/datasets/r/f5df602b-3800-44d7-b2df-fa40a0350325"
    )
    download_file(com_url, extract_to=dir_path, filename="communes_france_2025.csv")
    df_com = pd.read_csv(dir_path / "communes_france_2025.csv")
    df_com = float_to_codepostal(df_com, "code_postal")
    return df_com


def create_dataframe_epci(extract_dir):
    epci_url = (
        "https://www.data.gouv.fr/api/1/datasets/r/6e05c448-62cc-4470-aa0f-4f31adea0bc4"
    )
    download_file(epci_url, extract_to=extract_dir, filename="data_epci.csv")
    src = extract_dir / "data_epci.csv"
    dst = extract_dir / "data_epci_utf8.csv"

    with open(src, "r", encoding="latin1") as f:
        content = f.read()

    with open(dst, "w", encoding="utf-8") as f:
        f.write(content)

    df_epci = duckdb.read_csv(str(dst), header=True, sep=";")
    return df_epci
