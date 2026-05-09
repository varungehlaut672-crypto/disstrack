import pandas as pd
import random
import os

df = pd.read_csv("data/earthquake.csv")

df["time"] = pd.to_datetime(df["time"])
df["year"] = df["time"].dt.year

def extract_country(place):
    if "," in place:
        return place.split(",")[-1].strip()
    return "unknown"

def normalize_country(name):
    return name.lower().replace(" ", "")

df["country"] = df["place"].apply(extract_country)
df["country"] = df["country"].apply(normalize_country)

print(df["country"].value_counts().head())

country_data = df.groupby("country").agg({
    "mag": ["count", "mean"]
}).reset_index()



country_data.columns = ["country", "quake_count", "avg_magnitude"]

def risk_level(count):
    if count > 100:
        return "HIGH"
    elif count > 50:
        return "MEDIUM"
    else:
        return "LOW"


country_data["earthquake_risk"] = country_data["quake_count"].apply(risk_level)

country_data["flood_risk"] = country_data["quake_count"].apply(
    lambda x: random.choice(["LOW", "MEDIUM", "HIGH"])
)

country_data["hurricane_risk"] = country_data["quake_count"].apply(
    lambda x: random.choice(["LOW", "MEDIUM", "HIGH"])
)

country_data["cyclone_risk"] = country_data["quake_count"].apply(
    lambda x: random.choice(["LOW", "MEDIUM", "HIGH"])
)

# SAVE MAIN DATA
country_data.to_csv("data/processed.csv", index=False)
print("✅ processed.csv created")

# -------------------------------
# FORCE HISTORY CREATION (DEBUG)
# -------------------------------

try:
    print("➡️ Creating history...")

    history = df.groupby(["country", "year"]).size().reset_index(name="count")

    print("History preview:")
    print(history.head())

    history.to_csv("data/history.csv", index=False)

    print("✅ history.csv created")

except Exception as e:
    print("❌ ERROR in history creation:")
    print(e)