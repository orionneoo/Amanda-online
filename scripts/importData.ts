import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

async function importData() {
    const sourceUri = process.env.SOURCE_MONGODB_URI; // URI do banco de origem
    const targetUri = process.env.MONGODB_URI; // URI do banco de destino

    if (!sourceUri || !targetUri) {
        console.error('❌ URIs do MongoDB não configuradas no arquivo .env');
        process.exit(1);
    }

    const sourceClient = new MongoClient(sourceUri);
    const targetClient = new MongoClient(targetUri);

    try {
        // Conecta aos bancos
        await sourceClient.connect();
        await targetClient.connect();
        console.log('✅ Conectado aos bancos de dados');

        const sourceDb = sourceClient.db('AmandaeCBcoin');
        const targetDb = targetClient.db('AmandaeCBcoin');

        // Lista todas as coleções disponíveis usando comando direto
        console.log('\n🔍 Buscando coleções disponíveis...');
        
        const admin = sourceDb.admin();
        const listDatabases = await admin.listDatabases();
        console.log('\n📚 Bancos de dados disponíveis:');
        listDatabases.databases.forEach(db => console.log(`- ${db.name}`));

        const collections = await sourceDb.command({ listCollections: 1 });
        
        if (!collections || !collections.cursor || !collections.cursor.firstBatch || collections.cursor.firstBatch.length === 0) {
            console.log('\n🔍 Tentando método alternativo...');
            // Tenta listar usando método alternativo
            const collNames = await sourceDb.command({ dbStats: 1 });
            console.log('\n📊 Estatísticas do banco:', collNames);

            // Tenta listar todas as coleções existentes
            console.log('\n🔍 Listando todas as coleções existentes...');
            const allCollections = await sourceDb.collections();
            console.log('Coleções encontradas:', allCollections.map(c => c.collectionName));

            // Se encontrou coleções, tenta importar
            if (allCollections.length > 0) {
                for (const collection of allCollections) {
                    const collectionName = collection.collectionName;
                    console.log(`\n🔄 Importando coleção: ${collectionName}`);
                    
                    // Importa os dados
                    const documents = await collection.find({}).toArray();
                    if (documents.length > 0) {
                        const targetCollection = targetDb.collection(collectionName);
                        await targetCollection.insertMany(documents);
                        console.log(`✅ ${documents.length} documentos importados para ${collectionName}`);
                        
                        // Mostra uma amostra dos dados importados
                        console.log('\n📝 Amostra dos dados importados:');
                        console.log(JSON.stringify(documents[0], null, 2));
                    } else {
                        console.log(`ℹ️ Nenhum documento encontrado em ${collectionName}`);
                    }
                }
            }
        } else {
            console.log(`\n✨ Encontradas ${collections.cursor.firstBatch.length} coleções:`);
            for (const col of collections.cursor.firstBatch) {
                console.log(`- ${col.name} (${col.type})`);
            }

            // Importa cada coleção
            for (const collection of collections.cursor.firstBatch) {
                const collectionName = collection.name;
                console.log(`\n🔄 Importando coleção: ${collectionName}`);
                
                // Cria backup da coleção atual se existir
                const targetCollection = targetDb.collection(collectionName);
                const existingDocs = await targetCollection.find({}).toArray();
                
                if (existingDocs.length > 0) {
                    const backupDir = path.join(process.cwd(), 'backups');
                    if (!fs.existsSync(backupDir)) {
                        fs.mkdirSync(backupDir);
                    }
                    
                    const backupFile = path.join(backupDir, `${collectionName}_${Date.now()}.json`);
                    fs.writeFileSync(backupFile, JSON.stringify(existingDocs, null, 2));
                    console.log(`📦 Backup criado em: ${backupFile}`);
                    
                    // Limpa a coleção atual
                    await targetCollection.deleteMany({});
                    console.log('🗑️ Dados antigos removidos');
                }

                // Importa os dados
                const sourceCollection = sourceDb.collection(collectionName);
                const documents = await sourceCollection.find({}).toArray();
                
                if (documents.length > 0) {
                    await targetCollection.insertMany(documents);
                    console.log(`✅ ${documents.length} documentos importados para ${collectionName}`);
                    
                    // Mostra uma amostra dos dados importados
                    console.log('\n📝 Amostra dos dados importados:');
                    console.log(JSON.stringify(documents[0], null, 2));
                } else {
                    console.log(`ℹ️ Nenhum documento encontrado em ${collectionName}`);
                }
            }
        }

        console.log('\n✅ Importação concluída com sucesso!');

    } catch (error) {
        console.error('❌ Erro durante a importação:', error);
        if (error.codeName) {
            console.error('Código do erro:', error.codeName);
        }
        if (error.errmsg) {
            console.error('Mensagem de erro:', error.errmsg);
        }
    } finally {
        await sourceClient.close();
        await targetClient.close();
        console.log('🔌 Conexões fechadas');
    }
}

// Executa a importação
importData().catch(console.error); 