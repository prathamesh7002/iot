from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

BACKEND_URL = "https://iot-96vc.onrender.com/sensor"

@app.get("/sensor")
def sensor():
    params = {
        "temp": request.args.get("temp"),
        "current": request.args.get("current"),
        "vib": request.args.get("vib"),
    }

    try:
        response = requests.get(BACKEND_URL, params=params, timeout=10)
        return (
            response.text,
            response.status_code,
            {"Content-Type": response.headers.get("Content-Type", "text/plain")},
        )
    except Exception as exc:
        return jsonify({"success": False, "error": str(exc)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
