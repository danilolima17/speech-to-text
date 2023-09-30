import { MongoClient } from "mongodb";


const uri = "mongodb://https://aic-db-cosmos-mongodb.documents.azure.com:443/"

const client = new MongoClient(uri);

export const connectDatabase = async () => {
    try {
        if (!client.connect()) {
            await client.connect();
        }
        const db = client.db('search-db');
        return db;
    } catch (error) {
        console.error("Erro ao conectar ao banco de dados:", error);
        throw error;
    }
};
