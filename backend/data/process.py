import pandas as pd

# load dataset
df = pd.read_csv("data/earthquake.csv")

# extract country
def extract_country(place):
    if "," in place:
        return place.split(",")[-1].strip().lower()
    return "unknown"

df["country"] = df["place"].apply(extract_country)

# group data
country_data = df.groupby("country").agg({
    "mag": ["count", "mean"]
}).reset_index()

country_data.columns = ["country", "quake_count", "avg_magnitude"]

# assign risk
def risk_level(count):
    if count > 100:
        return "HIGH"
    elif count > 50:
        return "MEDIUM"
    else:
        return "LOW"

country_data["risk"] = country_data["quake_count"].apply(risk_level)

# save
country_data.to_csv("data/processed.csv", index=False)

print("✅ processed.csv created")