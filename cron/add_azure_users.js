const { format } = require("date-fns");
const User = require("../models/User");
const { ConfidentialClientApplication } = require("@azure/msal-node");
const { Client } = require("@microsoft/microsoft-graph-client");
require("isomorphic-fetch");
const cron = require("node-cron");
const microsoft_ad = require("../models/MS_AD");
const checkCollection = require("../utils/checkCollectionExists");

let cca;
let start_hour = 0;
let start_minute = 0;

const fetchMS_ADData = async () => {
  try {
    const testExists = await checkCollection('test','microsoft_ads', process.env.MONGO_URI);
    if(!testExists){
      return false;
    }
    const getMS_AD_settings = await microsoft_ad.findOne({ isActive: true });
    if (!getMS_AD_settings) {
      return false;
    }

    return {
      auth: {
        clientId: getMS_AD_settings.client_id,
        authority: `https://login.microsoftonline.com/${getMS_AD_settings.azure_tenant}`,
        clientSecret: getMS_AD_settings.app_secret,
      },
      data: getMS_AD_settings,
    };
  } catch (error) {
    console.error("Error fetching MS AD data:", error);
    throw error;
  }
};

const initializeAzureConfig = async () => {
  try {
    const azure_config = await fetchMS_ADData(); // Fetch MS AD settings
    if (!azure_config || !azure_config.data) {
      return false;
    }

    start_hour = parseInt(azure_config.data.start_hour_24h, 10);
    start_minute = parseInt(azure_config.data.start_minute, 10);

    console.log(`Start hour: ${start_hour}, Start minute: ${start_minute}`);
    cca = new ConfidentialClientApplication(azure_config);
  } catch (error) {
    console.error("Error initializing Azure config:", error);
  }
};

// Call the function to initialize the Azure configuration
const azureInitPromise = initializeAzureConfig();

// Function to initialize Client with Access token
async function getGraphClient() {
  const accessToken = await getAccessToken();
  return Client.init({
    authProvider: (done) => {
      done(null, accessToken);
    },
  });
}

// Function to get an access token
async function getAccessToken() {
  const tokenRequest = {
    scopes: ["https://graph.microsoft.com/.default"],
  };

  try {
    const response = await cca.acquireTokenByClientCredential(tokenRequest);
    return response.accessToken;
  } catch (error) {
    console.error("Error acquiring token:", error);
    throw error;
  }
}

// Core function for syncing Azure users
async function syncAzureUsers() {
  try {
    const isActivated = await fetchMS_ADData();
    if(!isActivated){
      console.error("Not activated");
    }
    const client = await getGraphClient();
    const { value: azureUsers } = await client.api("/users").get(); // Fetch users from Azure

    const newUsers = [];
    for (const azureUser of azureUsers) {
      // Check if user exists in MongoDB by Azure user ID
      const existingUser = await User.findOne({ uuid: azureUser.id });
      const existingUserByEmail = await User.findOne({ email: azureUser.mail || azureUser.userPrincipalName });
      if (existingUserByEmail) {
        continue;
      }

      if (!existingUser) {
        // If user doesn't exist, insert into MongoDB
        const newUser = await User.create({
          uuid: azureUser.id,
          name: azureUser.displayName,
          email: azureUser.mail || azureUser.userPrincipalName,
          password: "password",
          isActive: true,
          isMsadUser: true,
        });
        newUsers.push(newUser);
      }
    }

    const getMS_AD_settings = await microsoft_ad.findOne({ isActivate: true });

    if (!getMS_AD_settings) {
      return;
    }

    // Ensure the timestamp is valid
    const timestamp = Date.now();
    const formatted = format(timestamp, "yyyy-MM-dd HH:mm:ss");

    // Update the last_synchronization field
    await microsoft_ad.updateOne(
      { _id: getMS_AD_settings._id },  // Filter by document ID
      { $set: { last_synchronization: formatted } }  // Set the new value for last_synchronization
    );
    console.log(`User sync completed. New users added: ${newUsers.length}`);
  } catch (error) {
    console.error("Error syncing users:", error);
  }
}

// Schedule the cron job
azureInitPromise
  .then(() => {
    let schedule = "* * * * *";
    if (start_hour > 0 && start_minute > 0) {
      schedule = `*/${start_minute} */${start_hour} * * *`;
    } else if (start_minute > 0) {
      schedule = `*/${start_minute} * * * *`;
    } else if (start_hour > 0) {
      schedule = `* */${start_hour} * * *`;
    }
    
    cron.schedule(schedule, async () => {
      console.log("Cron job triggered");
      const isActivated = await fetchMS_ADData();
      if(isActivated){
        await syncAzureUsers();
      }
    });
  })
  .catch((error) => {
    console.error("Error scheduling cron job:", error);
  });

// Express route handler (optional, for manual syncing)
const syncAllAzureUsers = async (req, res) => {
  try {
    const isActivated = await fetchMS_ADData();
      if(isActivated){
        await syncAzureUsers();
        const allUsers = await User.find({});
        res.json({
          message: "User sync completed",
          allUsers: allUsers,
        });
      }else{
        res.json({
          message: "Azure sync is not activated",
        });
      }
  } catch (error) {
    res.status(500).json({ error: "Error fetching or syncing users" });
  }
};

module.exports = { syncAllAzureUsers };
