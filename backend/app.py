import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import fitz
from groq import Groq
import uuid
import bcrypt
import jwt
import datetime
from functools import wraps
from database import get_db, init_db

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# ---- CONFIG ----
SECRET_KEY = "change-this-to-a-random-secret-key-12345"

GROQ_API_KEY = os.environ.get(
    "GROQ_API_KEY", "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")

client = Groq(api_key=GROQ_API_KEY)

init_db()
# ---- JWT HELPERS ----


def generate_token(user_id, email):
    payload = {
        "user_id": user_id,
        "email": email,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(days=7)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get("Authorization")
        if not token:
            return jsonify({"error": "Token is missing"}), 401
        try:
            token = token.replace("Bearer ", "")
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            request.user_id = data["user_id"]
            request.user_email = data["email"]
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expired, please login again"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401
        return f(*args, **kwargs)
    return decorated


# ---- AUTH ROUTES ----
@app.route("/register", methods=["POST"])
def register():
    data = request.json
    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not name or not email or not password:
        return jsonify({"error": "All fields are required"}), 400
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400

    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT id FROM users WHERE email = ?", (email,))
    if cur.fetchone():
        conn.close()
        return jsonify({"error": "Email already registered. Please login."}), 400

    password_hash = bcrypt.hashpw(password.encode(
        "utf-8"), bcrypt.gensalt()).decode("utf-8")
    cur.execute(
        "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
        (name, email, password_hash)
    )
    conn.commit()
    user_id = cur.lastrowid
    conn.close()

    token = generate_token(user_id, email)
    return jsonify({
        "token": token,
        "user": {"id": user_id, "name": name, "email": email}
    })


@app.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT * FROM users WHERE email = ?", (email,))
    user = cur.fetchone()
    conn.close()

    if not user:
        return jsonify({"error": "No account found with this email"}), 401

    if not bcrypt.checkpw(password.encode("utf-8"), user["password_hash"].encode("utf-8")):
        return jsonify({"error": "Incorrect password"}), 401

    token = generate_token(user["id"], user["email"])
    return jsonify({
        "token": token,
        "user": {
            "id": user["id"], "name": user["name"], "email": user["email"],
            "phone": user["phone"], "bio": user["bio"]
        }
    })


@app.route("/me", methods=["GET"])
@token_required
def get_me():
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        "SELECT id, name, email, phone, bio FROM users WHERE id = ?", (request.user_id,))
    user = cur.fetchone()
    conn.close()
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify({"user": dict(user)})


@app.route("/profile", methods=["PUT"])
@token_required
def update_profile():
    data = request.json
    name = data.get("name")
    phone = data.get("phone")
    bio = data.get("bio")

    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        "UPDATE users SET name = ?, phone = ?, bio = ? WHERE id = ?",
        (name, phone, bio, request.user_id)
    )
    conn.commit()
    conn.close()
    return jsonify({"status": "updated"})


# ---- DOCUMENT ROUTES ----
@app.route("/upload", methods=["POST"])
@token_required
def upload_pdf():
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400
    file = request.files["file"]
    if not file.filename.endswith(".pdf"):
        return jsonify({"error": "Only PDF files are supported"}), 400

    pdf_bytes = file.read()
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    full_text = ""
    for page in doc:
        full_text += page.get_text()
    page_count = len(doc)
    doc.close()

    if not full_text.strip():
        return jsonify({"error": "Could not extract text from PDF"}), 400

    doc_id = str(uuid.uuid4())
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO documents (id, user_id, filename, full_text, page_count) VALUES (?, ?, ?, ?, ?)",
        (doc_id, request.user_id, file.filename, full_text, page_count)
    )
    conn.commit()
    conn.close()

    return jsonify({
        "session_id": doc_id,
        "filename": file.filename,
        "page_count": page_count,
        "preview": full_text[:300] + "..." if len(full_text) > 300 else full_text
    })


@app.route("/documents", methods=["GET"])
@token_required
def list_documents():
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        "SELECT id, filename, page_count, uploaded_at FROM documents WHERE user_id = ? ORDER BY uploaded_at DESC",
        (request.user_id,)
    )
    docs = [dict(row) for row in cur.fetchall()]
    conn.close()
    return jsonify({"documents": docs})


@app.route("/documents/<doc_id>", methods=["DELETE"])
@token_required
def delete_document(doc_id):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("DELETE FROM chats WHERE document_id = ? AND user_id = ?",
                (doc_id, request.user_id))
    cur.execute("DELETE FROM documents WHERE id = ? AND user_id = ?",
                (doc_id, request.user_id))
    conn.commit()
    conn.close()
    return jsonify({"status": "deleted"})


# ---- CHAT / ASK ROUTES ----
@app.route("/ask", methods=["POST"])
@token_required
def ask():
    data = request.json
    session_id = data.get("session_id")
    question = data.get("question", "").strip()

    if not session_id or not question:
        return jsonify({"error": "session_id and question are required"}), 400

    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        "SELECT * FROM documents WHERE id = ? AND user_id = ?",
        (session_id, request.user_id)
    )
    document = cur.fetchone()
    if not document:
        conn.close()
        return jsonify({"error": "Document not found. Please re-upload."}), 404

    cur.execute(
        "SELECT question, answer FROM chats WHERE document_id = ? AND user_id = ? ORDER BY created_at DESC LIMIT 10",
        (session_id, request.user_id)
    )
    history = [dict(row) for row in reversed(cur.fetchall())]

    pdf_text = document["full_text"]
    history_text = ""
    for h in history:
        history_text += f"User: {h['question']}\nAssistant: {h['answer']}\n\n"

    prompt = f"""You are an AI Document Assistant that helps users find information inside a PDF document.

PDF DOCUMENT CONTENT:
\"\"\"
{pdf_text[:20000]}
\"\"\"

Previous conversation:
{history_text}

Instructions:

You are an AI Document Assistant that helps users understand and interact with uploaded documents.

GENERAL INSTRUCTIONS

1. Answer only using the information found in the uploaded document.

2. Never make up information or include facts that are not present in the document.

3. If the requested information is not available in the document, respond with:
"I couldn't find that information in the uploaded document."

4. Use clear, simple, and professional English.

5. Keep answers short and concise unless the user requests a detailed explanation.

6. Always mention the exact page number(s) where the information was found.

7. If the answer comes from multiple pages, mention all relevant page numbers.

8. Be polite, professional, and helpful.

--------------------------------------------------

SUMMARIZE

When the user clicks "Summarize" or asks for a summary:

• Write a concise summary in approximately 10 to 15 lines.
• Use 1 to 2 normal paragraphs.
• Do NOT use bullet points.
• Do NOT use numbered lists.
• Include the document's main purpose, important ideas, and conclusion.
• End with:
Source: Page X

--------------------------------------------------

KEY POINTS

When the user clicks "Key Points":

• Extract only the most important points.
• Use a numbered list (1, 2, 3...).
• Do NOT use bullet points.
• Keep each point short and meaningful.
• Mention the page number(s) for each point.

--------------------------------------------------

EXPLAIN

When the user clicks "Explain":

• Explain the content in simple English.
• Assume the reader is a beginner.
• Break complex ideas into easy-to-understand paragraphs.
• Use examples from the document if available.
• Mention the page number(s).

--------------------------------------------------

MCQs

When the user clicks "MCQs":

• Generate 10 multiple-choice questions based only on the uploaded document.
• Each question must include four options (A, B, C, D).
• Clearly identify the correct answer.
• Mention the page number for each question.

--------------------------------------------------

FIND TOPICS

When the user clicks "Find Topics":

• List all major topics and subtopics covered in the document.
• Do not explain them.
• Organize them in a clean list.
• Mention the page number(s) beside each topic.

--------------------------------------------------

NORMAL CHAT

For normal user questions:

• Answer directly using only the uploaded document.
• Use bullet points only when they improve readability.
• Keep answers concise.
• Always include page references.

--------------------------------------------------

ERROR HANDLING

If the uploaded document is empty, unreadable, or does not contain the requested information, politely inform the user instead of guessing.

Never generate information that is not supported by the uploaded document.
User question: {question}"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=2000
    )
    answer = response.choices[0].message.content

    cur.execute(
        "INSERT INTO chats (document_id, user_id, question, answer) VALUES (?, ?, ?, ?)",
        (session_id, request.user_id, question, answer)
    )
    conn.commit()
    conn.close()

    return jsonify({"answer": answer, "session_id": session_id})


@app.route("/chats/<doc_id>", methods=["GET"])
@token_required
def get_chat_history(doc_id):
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        "SELECT question, answer, created_at FROM chats WHERE document_id = ? AND user_id = ? ORDER BY created_at ASC",
        (doc_id, request.user_id)
    )
    chats = [dict(row) for row in cur.fetchall()]
    conn.close()
    return jsonify({"chats": chats})


@app.route("/chats/recent", methods=["GET"])
@token_required
def recent_chats():
    conn = get_db()
    cur = conn.cursor()
    cur.execute("""
        SELECT chats.question, chats.answer, chats.created_at,
               documents.filename, documents.id as document_id
        FROM chats
        JOIN documents ON chats.document_id = documents.id
        WHERE chats.user_id = ?
        ORDER BY chats.created_at DESC
        LIMIT 50
    """, (request.user_id,))
    chats = [dict(row) for row in cur.fetchall()]
    conn.close()
    return jsonify({"chats": chats})


@app.route("/clear/<doc_id>", methods=["POST"])
@token_required
def clear_history(doc_id):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("DELETE FROM chats WHERE document_id = ? AND user_id = ?",
                (doc_id, request.user_id))
    conn.commit()
    conn.close()
    return jsonify({"status": "cleared"})


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
