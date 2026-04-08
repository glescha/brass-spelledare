const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: "Endast POST" });

    try {
        const { userMessage, infoLevel } = req.body;

        // 1. DEFINIERA BERATTARENS_HJARTA (Denna saknades!)
        const BERATTARENS_HJARTA = `SYSTEMPROMPT: DEN INDUSTRIELLA BERÄTTAREN
        Du är spelledaren för Brass: Birmingham. Din tonalitet är mörk, allvarlig och helt befriad från illusioner. 
        Du talar som en manifestation av den obarmhärtiga industriella revolutionen (West Midlands, 1770–1870).
        Du följer EXAKT källmaterialet. Om information saknas, svara: "Information saknas i det industriella manifestet."`;

        // 2. Ladda in källmaterialet
        const manusPath = path.join(process.cwd(), 'data', 'app-manus.md');
        let manifesto = "Systemvarning: Manifestet saknas på servern.";
        if (fs.existsSync(manusPath)) {
            manifesto = fs.readFileSync(manusPath, 'utf8');
        }

        // 3. Konfigurera Agenten med Gemini 2.5 Flash
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash",
            systemInstruction: BERATTARENS_HJARTA + `\n\nSPELARSTATUS: Nivå ${infoLevel}.\n\nKÄLLMATERIAL:\n${manifesto}`
        });

        const result = await model.generateContent(userMessage);
        const response = await result.response;
        
        res.status(200).json({ reply: response.text() });

    } catch (error) {
        // Skickar ut det specifika felet så vi kan se det i chatten
        res.status(500).json({ reply: `[DEBUG-KRASCH: ${error.message}]` });
    }
};
