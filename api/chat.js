const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Endast POST' });

    try {
        const { userMessage, infoLevel } = req.body;

        // 1. Lokalisera manuset
        const manusPath = path.join(process.cwd(), 'data', 'app-manus.md');
        let manifesto = "Kunde inte läsa källmaterialet.";
        
        if (fs.existsSync(manusPath)) {
            manifesto = fs.readFileSync(manusPath, 'utf8');
        } else {
            console.error("FILSAKNAD: Letade efter " + manusPath);
        }

        // 2. Kontrollera API-nyckel
        if (!process.env.GOOGLE_API_KEY) {
            return res.status(500).json({ reply: "[FEIL: API-nyckel saknas i Vercel Settings]" });
        }

        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            systemInstruction: `Du är Den Industriella Berättaren i Brass Birmingham. Din tonalitet är mörk, sotig och allvarlig. Använd uteslutande detta källmaterial: ${manifesto}. Aktuell informationsnivå vald av spelarna: ${infoLevel}.`
        });

        const result = await model.generateContent(userMessage);
        const response = await result.response;
        
        res.status(200).json({ reply: response.text() });

    } catch (error) {
        console.error("MÖRKRETS FEL:", error);
        res.status(500).json({ reply: "[SYSTEMHALT: Maskineriet kraschade under databearbetning. Kontrollera Vercel Logs.]" });
    }
};
