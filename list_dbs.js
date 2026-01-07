import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

async function listDbs() {
    const uri = process.env.DATABASE_URL;
    const client = new MongoClient(uri);

    try {
        console.log("Connecting to MongoDB...");
        await client.connect();
        console.log("✅ Connection Success!");

        const dbs = await client.db().admin().listDatabases();
        console.log("Databases:");
        dbs.databases.forEach(db => console.log(` - ${db.name}`));
    } catch (err) {
        console.error("❌ MongoDB Connection Error:");
        console.error(err.message);
    } finally {
        await client.close();
    }
}

listDbs();
