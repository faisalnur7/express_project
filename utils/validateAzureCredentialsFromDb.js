const { MongoClient } = require('mongodb');
const { ClientSecretCredential } = require('@azure/identity');

/**
 * Validate Azure credentials stored in a MongoDB collection.
 * 
 * @param {string} dbUri - MongoDB connection string
 * @param {string} dbName - Name of the database
 * @param {string} collectionName - Name of the collection (e.g., microsoft_ads)
 * @param {string} filter - MongoDB query to filter the document
 * @returns {Promise<boolean>} Whether the Azure credentials are valid
 */
const validateAzureCredentialsFromDb = async function validateAzureCredentialsFromDb(dbUri, dbName, collectionName, filter) {
    const client = new MongoClient(dbUri);

    try {
        // Connect to MongoDB
        await client.connect();

        // Access the specified collection
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        // Retrieve credentials from the collection
        const credentials = await collection.findOne(filter);

        if (!credentials) {
            console.error('No matching credentials found in the collection.');
            return false;
        }

        const { azure_tenant, client_id, app_secret } = credentials;

        // Validate the credentials using Azure
        const credential = new ClientSecretCredential(azure_tenant, client_id, app_secret);
        const token = await credential.getToken('https://management.azure.com/.default');

        // If a token is acquired, the credentials are valid
        return !!token;
    } catch (error) {
        console.error('Error during Azure credentials validation:', error.message);
        return false;
    } finally {
        // Close MongoDB connection
        await client.close();
    }
}

module.exports = validateAzureCredentialsFromDb;
