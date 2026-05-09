import pandas as pd
import random
import os

# Load dataset
df = pd.read_csv("data/earthquake.csv")

# Convert time
df["time"] = pd.to_datetime(df["time"])
df["year"] = df["time"].dt.year

# Extract country
def extract_country(place):
    try:
        return place.split(",")[-1].strip()
    except:
        return "unknown"

# Normalize country
def normalize_country(name):
    return name.lower().replace(" ", "")

df["country"] = df["place"].apply(extract_country)
df["country"] = df["country"].apply(normalize_country)

# -------------------------------
# MAIN AGGREGATION
# -------------------------------
country_data = df.groupby("country").agg({
    "mag": ["count", "mean"]
}).reset_index()

country_data.columns = ["country", "quake_count", "avg_magnitude"]

# Risk logic
def risk_level(count):
    if count > 100:
        return "HIGH"
    elif count > 50:
        return "MEDIUM"
    else:
        return "LOW"

country_data["earthquake_risk"] = country_data["quake_count"].apply(risk_level)

# Additional disasters (demo)
country_data["flood_risk"] = country_data["quake_count"].apply(
    lambda x: random.choice(["LOW", "MEDIUM", "HIGH"])
)

country_data["hurricane_risk"] = country_data["quake_count"].apply(
    lambda x: random.choice(["LOW", "MEDIUM", "HIGH"])
)

country_data["cyclone_risk"] = country_data["quake_count"].apply(
    lambda x: random.choice(["LOW", "MEDIUM", "HIGH"])
)

# Save processed data
country_data.to_csv("data/processed.csv", index=False)

# -------------------------------
# HISTORICAL DATA
# -------------------------------
history = df.groupby(["country", "year"]).size().reset_index(name="count")

history.to_csv("data/history.csv", index=False)

print("✅ Data processing complete (processed.csv + history.csv created)")