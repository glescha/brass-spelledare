const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: "Endast POST" });
    try {
        const { userMessage, infoLevel } = req.body;
        // Vi söker efter båda möjliga filnamnen för att vara säkra
        let manifesto = "Manifest saknas.";
        const paths = [
            path.join(process.cwd(), 'data', 'app-manus.md'),
            path.join(process.cwd(), 'data', 'App-manus_ Brass Birmingham - Komplett.md')
        ];
        for (const p of paths) {
            if (fs.existsSync(p)) {
                manifesto = fs.readFileSync(p, 'utf8');
                break;
            }
        }
        if (!process.env.GOOGLE_API_KEY) return res.status(500).json({ reply: "[FEIL: API-nyckel saknas i Vercel Settings]" });
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            systemInstruction: `Du är Den Industriella Berättaren i Brass Birmingham. Mörk och allvarlig tonalitet. Använd EXAKT detta källmaterial: ${manifesto}. Nivå: ${infoLevel}`
        });
        const result = await model.generateContent(userMessage);
        res.status(200).json({ reply: result.response.text() });
    } catch (error) { res.status(500).json({ reply: "[SYSTEMHALT: Maskineriet kraschade.]" }); }
};
