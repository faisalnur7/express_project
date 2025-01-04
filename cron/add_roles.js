const Role = require("../models/Role");
const { ConfidentialClientApplication } = require("@azure/msal-node");
const { Client } = require("@microsoft/microsoft-graph-client");
require("isomorphic-fetch");
const cron = require("node-cron");
const microsoft_ad = require("../models/MS_AD");

let cca;
let start_hour = 0;
let start_minute = 0;

const fetchMS_ADData = async () => {
  try {
    const getMS_AD_settings = await microsoft_ad.findOne({ isActive: true });
    if (!getMS_AD_settings) {
      throw new Error("MS_AD settings not found");
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
    const azure_config = await fetchMS_ADData();
    if (!azure_config || !azure_config.data) {
      console.error("Fetched MS AD data is empty or invalid. Please add settings.");
      return;
    }

    start_hour = parseInt(azure_config.data.start_hour_24h, 10);
    start_minute = parseInt(azure_config.data.start_minute, 10);

    console.log(`Start hour: ${start_hour}, Start minute: ${start_minute}`);
    cca = new ConfidentialClientApplication(azure_config);
  } catch (error) {
    console.error("Error initializing Azure config:", error);
  }
};

const azureInitPromise = initializeAzureConfig();

async function getGraphClient() {
  const accessToken = await getAccessToken();
  return Client.init({
    authProvider: (done) => {
      done(null, accessToken);
    },
  });
}

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

async function syncAzureRoles() {
  try {
    const client = await getGraphClient();
    const { value: azureRoles } = await client.api("/directoryRoles").get(); // Fetch roles from Azure

    const newRoles = [];
    for (const azureRole of azureRoles) {
      // Check if role exists in MongoDB by Azure role ID
      const existingRole = await Role.findOne({ uuid: azureRole.id });

      if (!existingRole) {
        // If role doesn't exist, insert into MongoDB
        const newRole = await Role.create({
          uuid: azureRole.id,
          name: azureRole.displayName,
          description: azureRole.description || "No description available",
          isActive: true,
          isAzureRole: true,
        });
        newRoles.push(newRole);
      }
    }

    console.log(`Role sync completed. New roles added: ${newRoles.length}`);
  } catch (error) {
    console.error("Error syncing roles:", error);
  }
}

// Schedule the cron job for roles
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

    console.log(`Cron schedule for roles: ${schedule}`);
    cron.schedule(schedule, async () => {
      console.log("Cron job for roles triggered");
      await syncAzureRoles();
    });
  })
  .catch((error) => {
    console.error("Error scheduling cron job for roles:", error);
  });

// Express route handler (optional, for manual syncing)
const syncAllAzureRoles = async (req, res) => {
  try {
    await syncAzureRoles();
    const allRoles = await Role.find({});
    res.json({
      message: "Role sync completed",
      allRoles: allRoles,
    });
  } catch (error) {
    res.status(500).json({ error: "Error fetching or syncing roles" });
  }
};

module.exports = { syncAllAzureRoles };
