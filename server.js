const express = require('express');
const fetch = require('node-fetch'); // for Node <18, else built-in fetch works
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable JSON body parsing
app.use(express.json());

// Enable CORS for all origins (so your website can call the API)
app.use(cors());

// Load Groq API key from environment variable
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || "llama3-8b-8192";

// Health check endpoint
app.get('/', (req, res) => {
    res.send("Groq chatbot backend is running!");
});

// Chat endpoint
app.post('/chat', async (req, res) => {
    const userMessage = req.body.message;
    if (!userMessage) return res.json({ reply: "Please send a message!" });

    if (!GROQ_API_KEY) {
        return res.json({ reply: "Groq API Key is not configured on Render." });
    }

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${GROQ_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: GROQ_MODEL,
                messages: [
                    { role: "system", content: "You are 'BCSIT AI', the official virtual assistant for BCSIT Notes portal." },
                    { role: "user", content: userMessage }
                ],
                temperature: 0.7,
                max_tokens: 1024
            })
        });

        const result = await response.json();

        if (response.ok && result.choices && result.choices[0]?.message?.content) {
            return res.json({ reply: result.choices[0].message.content });
        } else {
            console.error("Groq API error:", result);
            return res.json({ reply: "Sorry, I couldn't process that." });
        }
    } catch (err) {
        console.error("Server error:", err);
        return res.json({ reply: "Sorry, there was a server error. Try again later." });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
