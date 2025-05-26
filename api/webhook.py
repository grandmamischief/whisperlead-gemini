import os
import tempfile
import requests
from flask import Flask, request, jsonify
import google.generativeai as genai
import speech_recognition as sr

app = Flask(__name__)
genai.configure(api_key=os.environ["GEMINI_API_KEY"])

@app.route("/api/webhook", methods=["POST"])
def transcribe_and_reply():
    file = request.files["file"]
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
        file.save(tmp.name)
        recognizer = sr.Recognizer()
        with sr.AudioFile(tmp.name) as source:
            audio = recognizer.record(source)
            transcript = recognizer.recognize_google(audio)

    prompt_url = "https://www.focus.ceo/prompt"
    base_prompt = requests.get(prompt_url).text
    full_prompt = f"{base_prompt}\n\nUser: {transcript}"


    model = genai.GenerativeModel("gemini-pro")
    reply = model.generate_content(full_prompt).text.strip()

    return jsonify({"transcript": transcript, "reply": reply})


if __name__ == "__main__":
    app.run(debug=True)
