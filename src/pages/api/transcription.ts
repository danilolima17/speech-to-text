import { NextApiRequest, NextApiResponse } from 'next';
import { transcribeAudio } from "./speechToText";
import { connectDatabase } from "./db";

export default async (req: NextApiRequest, res: NextApiResponse) => {
    try {

        const transcription = await transcribeAudio(req.body.audioBuffer);

        const db = await connectDatabase();
        const collection = db.collection('speech');

        await collection.insertOne({ text: transcription });

        res.status(200).json({ success: true, transcription });
    } catch (error) {
        console.error("Erro na API:", error); 

        res.status(500).json({ success: false, message: "Ocorreu um erro desconhecido." });
    }
}
