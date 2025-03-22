import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';

dotenv.config();

async function checkDatabase() {
    const uri = process.env.MONGODB_URI;
    
    if (!uri) {
        console.error('❌ MONGODB_URI não encontrada no arquivo .env');
        process.exit(1);
    }

    console.log('🔍 Verificando conexão com MongoDB Atlas...');
    
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('✅ Conexão estabelecida com sucesso!');

        const db = client.db('AmandaeCBcoin');
        console.log('\n📊 Informações do banco de dados:');
        
        // Lista todas as coleções
        const collections = await db.listCollections().toArray();
        console.log('\n📁 Coleções encontradas:');
        for (const collection of collections) {
            console.log(`- ${collection.name}`);
            
            // Conta documentos em cada coleção
            const count = await db.collection(collection.name).countDocuments();
            console.log(`  └─ ${count} documentos`);
            
            // Mostra um exemplo de documento
            if (count > 0) {
                const sample = await db.collection(collection.name).findOne();
                console.log('  └─ Exemplo de documento:');
                console.log('     ', JSON.stringify(sample, null, 2).replace(/\n/g, '\n      '));
            }
            console.log();
        }

        // Verifica índices da coleção users
        const usersCollection = db.collection('users');
        const indexes = await usersCollection.indexes();
        console.log('\n🔑 Índices da coleção users:');
        console.log(JSON.stringify(indexes, null, 2));

    } catch (error) {
        console.error('❌ Erro ao conectar ao MongoDB:', error);
    } finally {
        await client.close();
        console.log('\n🔌 Conexão fechada');
    }
}

checkDatabase().catch(console.error); 