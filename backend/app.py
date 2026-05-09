from sklearn.linear_model import LinearRegression 
from flask import Flask, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np

app = Flask(__name__)
CORS(app)

data = pd.read_csv("data/processed.csv")

@app.route("/risk/<country>")
def get_risk(country):
    country = country.lower().replace(" ", "")

    row = data[data["country"] == country]

    if row.empty:
        return jsonify({"error": "Country not found"})

    return jsonify({
    "country": country,
    "earthquake_risk": row.iloc[0]["earthquake_risk"],
    "flood_risk": row.iloc[0]["flood_risk"],
    "hurricane_risk": row.iloc[0]["hurricane_risk"],
    "cyclone_risk": row.iloc[0]["cyclone_risk"]
})

if __name__ == "__main__":
    app.run(debug=True)