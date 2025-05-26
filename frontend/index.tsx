import React, { useState } from "react";
import ReactDOM from "react-dom/client";

function App() {
  const [response, setResponse] = useState("");
  const [transcript, setTranscript] = useState("");

  const handleTalk = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    const audioChunks: Blob[] = [];

    mediaRecorder.ondataavailable = event => {
      audioChunks.push(event.data);
    };

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
      const formData = new FormData();
      formData.append("file", audioBlob, "recording.wav");

      const res = await fetch("/api/webhook", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setTranscript(data.transcript);
      setResponse(data.reply);
    };

    mediaRecorder.start();

    setTimeout(() => {
      mediaRecorder.stop();
    }, 3000); // record for 3 seconds
  };

  return (
    <div style={{ fontFamily: "sans-serif", padding: 40 }}>
      <h1>🎤 WhisperLead with Gemini</h1>
      <button onClick={handleTalk}>🎙️ Talk</button>
      <p><strong>You said:</strong> {transcript}</p>
      <p><strong>AI replied:</strong> {response}</p>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);