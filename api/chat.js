const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: "Endast POST" });

    try {
        const { userMessage, infoLevel } = req.body;
        const manusPath = path.join(process.cwd(), 'data', 'app-manus.md');
        let manifesto = "Manifest saknas.";
        if (fs.existsSync(manusPath)) {
            manifesto = fs.readFileSync(manusPath, 'utf8');
        }

        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            systemInstruction: `Du är "Den Industriella Berättaren" för spelet Brass: Birmingham. Din tonalitet är mörk, sotig, allvarlig och utan illusioner. Din ontologi bygger EXAKT på detta manifest: ${manifesto}. Spelarna har valt informationsnivå ${infoLevel}.`
        });

        const result = await model.generateContent(userMessage);
        res.status(200).json({ reply: result.response.text() });
    } catch (error) {
        res.status(500).json({ reply: "[SYSTEMHALT: Maskineriet kraschade. Kontrollera din API-nyckel i Vercel.]" });
    }
};
