const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Endast POST');
    const { userMessage, infoLevel } = req.body;

    const manusPath = path.join(process.cwd(), 'data', 'app-manus.md');
    let manifesto = fs.existsSync(manusPath) ? fs.readFileSync(manusPath, 'utf8') : "Information saknas.";

    const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: `Du är Den Industriella Berättaren. Din tonalitet är mörk och allvarlig. Använd uteslutande källmaterialet: ${manifesto}. Aktuell nivå: ${infoLevel}`
    });

    try {
        const result = await model.generateContent(userMessage);
        const response = await result.response;
        res.status(200).json({ reply: response.text() });
    } catch (error) {
        res.status(500).json({ reply: "[SYSTEMHALT: Maskineriet har fastnat.]" });
    }
};
