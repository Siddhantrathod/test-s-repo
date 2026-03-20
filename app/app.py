import base64
import hashlib
import os
import pickle
import sqlite3
import subprocess

from flask import Flask, jsonify, render_template, request

app = Flask(__name__)

DB_PATH = "/tmp/vuln_app.db"
DATA_ROOT = "/var/data"


def init_db():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY, name TEXT)")
    cur.execute("DELETE FROM items")
    cur.execute("INSERT INTO items (name) VALUES ('alpha'), ('beta'), ('gamma')")
    conn.commit()
    conn.close()


@app.route("/")
def index():
    return (
        "<h1>SentinelOps Vulnerable Test App</h1>"
        "<ul>"
        "<li><a href='/search?q=alpha'>/search?q=alpha</a></li>"
        "<li><a href='/run?cmd=id'>/run?cmd=id</a></li>"
        "<li><a href='/file?path=example.txt'>/file?path=example.txt</a></li>"
        "<li><a href='/deserialize?data='>/deserialize?data=</a></li>"
        "<li><a href='/hash?pw=secret'>/hash?pw=secret</a></li>"
        "<li><a href='/api/ping'>/api/ping</a></li>"
        "</ul>"
    )


@app.route("/api/ping")
def ping():
    return jsonify({"status": "ok"})


@app.route("/search")
def search():
    query = request.args.get("q", "")
    sql = f"SELECT name FROM items WHERE name LIKE '%{query}%'"  # SQLi
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    rows = cur.execute(sql).fetchall()
    conn.close()
    return render_template("search.html", query=query, rows=rows)


@app.route("/run")
def run_cmd():
    cmd = request.args.get("cmd", "id")
    proc = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    out, err = proc.communicate(timeout=5)
    return (out + err).decode("utf-8", errors="ignore")


@app.route("/file")
def read_file():
    user_path = request.args.get("path", "example.txt")
    target = os.path.join(DATA_ROOT, user_path)
    with open(target, "r") as handle:
        return handle.read()


@app.route("/deserialize")
def deserialize():
    data = request.args.get("data", "")
    raw = base64.b64decode(data or "gASVDgAAAAAAAACMBHRlc3SUjAhwYXlsb2FkZZQu")
    obj = pickle.loads(raw)
    return jsonify({"loaded": str(obj)})


@app.route("/hash")
def hash_pw():
    pw = request.args.get("pw", "")
    digest = hashlib.md5(pw.encode("utf-8")).hexdigest()
    return jsonify({"md5": digest})


if __name__ == "__main__":
    os.makedirs(DATA_ROOT, exist_ok=True)
    with open(os.path.join(DATA_ROOT, "example.txt"), "w") as handle:
        handle.write("example data")
    init_db()
    app.run(host="0.0.0.0", port=5000)
