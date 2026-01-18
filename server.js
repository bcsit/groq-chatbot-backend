import express from "express";
import cors from "cors";
import fetch from "node-fetch"; // only if Node <18

const app = express();
app.use(cors()); // Allow frontend to talk to backend
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Groq chatbot backend is running!");
});

app.post("/chat", async (req, res) => {
  const { message, chat_history } = req.body;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [
          { role: "system", content: "You are a helpful BCSIT Notes assistant." },
          ...(chat_history || []),
          { role: "user", content: message }
        ]
      })
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "Sorry, I couldn't process that.";

    return res.json({ reply });

  } catch (err) {
    console.error("Error in /chat:", err);
    res.status(500).json({ reply: "Backend error." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
