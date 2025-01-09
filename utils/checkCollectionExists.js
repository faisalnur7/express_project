const { MongoClient } = require('mongodb');

const checkCollection = async function checkCollectionExists(dbName, collectionName) {
  const client = new MongoClient(process.env.MONGO_URI);

  try {
      // Connect to the MongoDB server
      await client.connect();

      // Access the specified database
      const db = client.db(dbName);

      // List collections in the database
      const collections = await db.listCollections({ name: collectionName }).toArray();

      // Check if the collection exists
      return collections.length > 0;
  } catch (error) {
      console.error('Error checking collection existence:', error);
      throw error;
  } finally {
      // Close the MongoDB connection
      await client.close();
  }
}

module.exports = checkCollection;