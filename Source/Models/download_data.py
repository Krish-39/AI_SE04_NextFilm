"""Download the MovieLens 1M dataset into Data/Raw.

MovieLens data may not be redistributed, so it is not committed to this
repository. Run this once before the other scripts:

    python Source/Models/download_data.py
"""

import io
import urllib.request
import zipfile

from paths import RAW_DIR

URL = "https://files.grouplens.org/datasets/movielens/ml-1m.zip"
FILES = ("movies.dat", "ratings.dat", "users.dat")


def main():
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    if all((RAW_DIR / name).exists() for name in FILES):
        print(f"MovieLens 1M already present in {RAW_DIR}")
        return

    print(f"Downloading {URL} ...")
    with urllib.request.urlopen(URL, timeout=120) as response:
        archive = zipfile.ZipFile(io.BytesIO(response.read()))

    for name in FILES:
        (RAW_DIR / name).write_bytes(archive.read(f"ml-1m/{name}"))
        print(f"Saved {RAW_DIR / name}")


if __name__ == "__main__":
    main()
