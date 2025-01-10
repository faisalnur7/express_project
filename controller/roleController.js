const Role = require("../models/Role");
const ErrorResponse = require("../utils/errorResponse");
const checkCollection = require("../utils/checkCollectionExists");
const asyncHandler = require("../middleware/async");
const { ConfidentialClientApplication } = require("@azure/msal-node");
const { Client } = require("@microsoft/microsoft-graph-client");
require("isomorphic-fetch");
const microsoft_ad = require("../models/MS_AD");
let cca;
const validateAzureCredentialsFromDb = require('../utils/validateAzureCredentialsFromDb');

const checkCredentials = async () =>{
  const isValidAzure = await validateAzureCredentialsFromDb(process.env.MONGO_URI,'test','microsoft_ads',{});
  if (!isValidAzure) {
    return false;
  }
  return true;
}
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

    if(!getMS_AD_settings.client_id || !getMS_AD_settings.app_secret){
      return false;
    }
    return {
      auth: {
        clientId: getMS_AD_settings.client_id,
        authority: `https://login.microsoftonline.com/${getMS_AD_settings.azure_tenant}`,
        clientSecret: getMS_AD_settings.app_secret,
      },
    };
  } catch (error) {
    console.error("Error fetching MS AD data:", error);
    throw error;
  }
};

// Function to initialize Client with Access token
async function getGraphClient() {
  const accessToken = await getAccessToken();
  return Client.init({
    authProvider: (done) => {
      done(null, accessToken);
    },
  });
}

const initializeAzureConfig = async () => {
    try {
      const azure_config = await fetchMS_ADData(); // Fetch MS AD settings
      if (!azure_config) {
        return;
      }
      cca = new ConfidentialClientApplication(azure_config);
    } catch (error) {
      console.error("Error initializing Azure config:", error);
    }
};

// Faisal Nur : Function to get an access token
async function getAccessToken() {
    const tokenRequest = {
      scopes: ["https://graph.microsoft.com/.default"],
    };
  
    try {
      const testExists = await checkCollection('test','microsoft_ads', process.env.MONGO_URI);

      if(!testExists){
        return false;
      }

      const response = await cca.acquireTokenByClientCredential(tokenRequest);
      return response.accessToken;
    } catch (error) {
      console.error("Error acquiring token:", error);
      throw error;
    }
}

initializeAzureConfig();
// @desc    sync microsoft active directory roles and insert to roles collection
// @route   GET /api/roles/azure_roles
// @access  public
exports.syncAllAzureRoles = asyncHandler(async (req, res) => {
  try {
    const testExists = await checkCollection('test','microsoft_ads', process.env.MONGO_URI);

    if(!testExists){
      return false;
    }
    // Call the Azure credential validation function
    if (!await checkCredentials()) {
      console.log('Azure credentials mismatched.');
      return res.status(401).json({ error: 'Azure credentials mismatched' });
    }
    const client = await getGraphClient();
    const { value: azureRoles }  = await client.api("/directoryRoles").get(); // Fetch roles from Azure

    const newRoles = [];
    for (const azureRole of azureRoles) {
      // Check if role exists in MongoDB by Azure role ID
      const existingRole = await Role.findOne({ uuid: azureRole.id });

      if (!existingRole) {
        // If role doesn't exist, insert into MongoDB
        const newRole = await Role.create({
          uuid: azureRole.id,
          name: azureRole.displayName,
          description: azureRole.description || "No description provided",
          isActive: true,
        });
        newRoles.push(newRole);
      }
    }

    const allRoles = await Role.find({});

    res.json({
      message: "Role sync completed",
      newRolesCount: newRoles.length,
      allRoles: allRoles,
    });
  } catch (error) {
    res.status(500).json({ error: "Error fetching or syncing roles" });
  }
});


exports.getAllAzureRoles = asyncHandler(async (req, res) => {
  try {
    // Call the Azure credential validation function
    if (!await checkCredentials()) {
      console.log('Azure credentials mismatched.');
      return res.status(401).json({ error: 'Azure credentials mismatched' });
    }
    const client = await getGraphClient();
    const azureRoles  = await client.api("/directoryRoles").get(); // Fetch roles from Azure

    res.json({
      message: "All roles retrieved",
      rolesCount: azureRoles.length,
      allRoles: azureRoles,
    });
  } catch (error) {
    res.status(500).json({ error: "Error fetching or syncing roles" });
  }
});

exports.getRoles = asyncHandler(async (req, res, next) => {
  const Roles = await Role.find({}).sort({ timestamp: -1 });
  if (!Roles) {
    return next(new ErrorResponse("No Roles Found!", 404));
  }
  return res.status(200).json({
    success: true,
    msg: "Roles fetched successfully!",
    data: Roles,
  });
});

exports.createRole = asyncHandler(async (req, res, next) => {
  const { name } = req.body;

  // Check if the title already exists in the collection (trimmed and case-insensitive)
  const isRoleAlreadyExist = await Role.findOne({
    name: { $regex: `^${name}$`, $options: "i" },
  });
  if (isRoleAlreadyExist) {
    return next(new ErrorResponse("Role with this name already exists", 400));
  }

  // Create a new role
  const newRole = await Role.create(req.body);

  return res.status(201).json({
    success: true,
    msg: "Role created successfully!",
    data: newRole,
  });
});

exports.updateRole = asyncHandler(async (req, res, next) => {
  const { roleId } = req.params;

  // Check if role exists
  const role = await Role.findById(roleId);
  if (!role) {
    return next(new ErrorResponse("Role not found", 404));
  }

  const { name, description, isActive } = req.body;

  try {
    // Update the role with the provided data
    const updatedRole = await Role.findByIdAndUpdate(
      roleId,
      {
        name,
        description,
        isActive,
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      msg: "Role updated successfully!",
      data: updatedRole,
    });
  } catch (error) {
    return next(new ErrorResponse(error.message, 500));
  }
});

exports.deactivateRoleById = asyncHandler(async (req, res, next) => {
  const { roleId } = req.params;

  // Check if role exists
  const role = await Role.findById(roleId);
  if (!role || !role.isActive) {
    return next(new ErrorResponse("Role not found", 404));
  }

  // Set role as inactive
  role.isActive = false;
  await role.save();

  res.status(200).json({
    success: true,
    message: "Role deactivated successfully",
    data: role,
  });
});

exports.reactivateRoleById = asyncHandler(async (req, res, next) => {
  const { roleId } = req.params;

  // Check if role exists
  const role = await Role.findById(roleId);
  if (!role || role.isActive) {
    return next(new ErrorResponse("Role not found", 404));
  }

  // Set role as inactive
  role.isActive = true;
  await role.save();

  res.status(200).json({
    success: true,
    message: "Role reactivated successfully",
    data: role,
  });
});

exports.deleteRole = asyncHandler(async (req, res, next) => {
  const { id } = req.body;

  // Find the role by id and delete it
  const deletedRole = await Role.findByIdAndDelete(id);

  if (!deletedRole) {
    return next(new ErrorResponse("Role not found", 404));
  }

  return res.status(200).json({
    success: true,
    msg: "Role deleted successfully!",
    data: deletedRole,
  });
});
