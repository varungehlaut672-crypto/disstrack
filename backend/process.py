import pandas as pd
import random

df = pd.read_csv("data/earthquake.csv")

def extract_country(place):
    if "," in place:
        return place.split(",")[-1].strip()
    return "unknown"

def normalize_country(name):
    return name.lower().replace(" ", "")

df["country"] = df["place"].apply(extract_country)
df["country"] = df["country"].apply(normalize_country)

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

# FAKE flood risk (for demo)
country_data["flood_risk"] = country_data["quake_count"].apply(
    lambda x: random.choice(["LOW", "MEDIUM", "HIGH"])
)

country_data.to_csv("data/processed.csv", index=False)

print("✅ processed.csv created")