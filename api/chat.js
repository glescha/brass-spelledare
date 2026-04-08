const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: "Endast POST" });

    try {
        const { userMessage, infoLevel } = req.body;
        
        // DEBUG: Kontrollera om nyckeln finns överhuvudtaget
        if (!process.env.GOOGLE_API_KEY) {
            return res.status(500).json({ reply: "[DEBUG-FEL: API-nyckeln saknas helt i Vercel Settings]" });
        }

        // Lokalisera manuset
        const manusPath = path.join(process.cwd(), 'data', 'app-manus.md');
        let manifesto = "Manifest saknas.";
        if (fs.existsSync(manusPath)) {
            manifesto = fs.readFileSync(manusPath, 'utf8');
        } else {
            return res.status(500).json({ reply: "[DEBUG-FEL: Kan inte hitta filen data/app-manus.md på servern]" });
        }

        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            systemInstruction: `Du är Den Industriella Berättaren. Nivå: ${infoLevel}. Källa: ${manifesto}`
        });

        // Gör anropet
        const result = await model.generateContent(userMessage);
        const text = result.response.text();
        
        res.status(200).json({ reply: text });

    } catch (error) {
        // Skicka ut det riktiga felet till frontend så vi ser vad som händer
        res.status(500).json({ reply: `[DEBUG-KRASCH: ${error.message}]` });
    }
};
