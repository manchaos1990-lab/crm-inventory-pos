from flask import Flask, send_from_directory, jsonify
import os

app = Flask(__name__, static_folder="../frontend/dist", static_url_path="/")

# Serve React frontend
@app.route("/")
def serve_frontend():
    return send_from_directory(app.static_folder, "index.html")

# Example API endpoint
@app.route("/api/hello")
def hello():
    return jsonify({"message": "Hello from Flask backend!"})

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
