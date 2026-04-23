from flask import Flask, jsonify
import pandas as pd

app = Flask(__name__)
data = pd.read_csv("data/processed.csv")

@app.route("/risk/<country>")
def get_risk(country):
    country = country.lower()
    row = data[data["country"] == country]

    if row.empty:
        return jsonify({"error": "Country not found"})

    return jsonify({
        "country": country,
        "risk": row.iloc[0]["risk"]
    })

if __name__ == "__main__":
    app.run(debug=True)