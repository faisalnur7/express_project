const nacl = require('tweetnacl');
const naclUtil = require('tweetnacl-util');
const crypto = require('crypto');
const ErrorResponse = require("../utils/errorResponse");
const checkCollectionExists = require("../utils/checkCollectionExists");
const validateAzureCredentialsFromDb = require('../utils/validateAzureCredentialsFromDb');
const asyncHandler = require("../middleware/async");
const microsoft_ad = require("../models/MS_AD");
const { MongoClient } = require('mongodb');

const SECRET_KEY = naclUtil.decodeUTF8('msad');  // Ensure the same secret key used for encryption
const hash = nacl.hash(SECRET_KEY);
const paddedSecretKey = hash.slice(0, 32);

// Encrypt function
function encrypt(data) {
  const nonce = nacl.randomBytes(24);  // Generate a random nonce
  const messageUint8 = naclUtil.decodeUTF8(JSON.stringify(data)); // Convert data to Uint8Array
  const encrypted = nacl.secretbox(messageUint8, nonce, paddedSecretKey);

  // Log encrypted data and nonce
  console.log('Encrypted data:', naclUtil.encodeBase64(encrypted));
  console.log('Nonce:', naclUtil.encodeBase64(nonce));

  return {
    nonce: naclUtil.encodeBase64(nonce), // Convert to Base64
    encrypted: naclUtil.encodeBase64(encrypted), // Convert to Base64
  };
}

// Get MS AD configuration API endpoint
exports.getMS_AD_configuration = asyncHandler(async (req, res, next) => {
  const testExists = await checkCollectionExists('test', 'microsoft_ads', process.env.MONGO_URI);

  let config = {
    isAzureActivated: false,
  };

  if (!testExists) {
    return res.status(200).json({
      success: true,
      msg: "Success!",
      data: encrypt(config), // Send encrypted data
    });
  }

  // Call the Azure credential validation function
  const isValidAzure = await validateAzureCredentialsFromDb(process.env.MONGO_URI,'test','microsoft_ads',{});
  if (!isValidAzure) {
    console.log('Azure credentials are invalid.');
    return res.status(200).json({
      success: true,
      msg: "Invalid Azure credentials!",
      data: encrypt(config),
    });
  }

  // Fetch the configuration from the database
  const getMS_AD_configuration = await microsoft_ad.findOne({});
  if (!getMS_AD_configuration) {
    return res.status(200).json({
      success: true,
      msg: "Success!",
      data: encrypt(config), // Send encrypted data
    });
  }

  config = {
    client_id: getMS_AD_configuration.client_id,
    azure_tenant: getMS_AD_configuration.azure_tenant,
    isAzureActivated: true, // Azure is activated since the credentials are valid
  };

  const encryptedData = encrypt(config);

  return res.status(200).json({
    success: true,
    msg: "Success!",
    data: encryptedData,
  });
});


exports.getMS_AD_settings = asyncHandler(async (req, res, next) => {
  const getMS_AD_settings = await microsoft_ad.find({});
  if (!getMS_AD_settings) {
    return next(new ErrorResponse("No getMS_AD_settings Found!", 404));
  }
  return res.status(200).json({
    success: true,
    msg: "MSADSettings fetched successfully!",
    data: getMS_AD_settings,
  });
});

exports.updateMS_AD_settings = asyncHandler(async (req, res, next) => {
  try {
    const { id, ...updateData } = req.body; // Extract id and other fields from the request body

    let msADSettings = await microsoft_ad.findOne(); // Fetch the single existing object

    if (msADSettings) {
      // Update the existing document
      msADSettings = await microsoft_ad.findByIdAndUpdate(msADSettings._id, updateData, {
        new: true, // Return the updated document
        runValidators: true, // Run schema validations
      });
    } else {
      // Create a new document if one does not exist or no data is provided
      msADSettings = await microsoft_ad.create(updateData && Object.keys(updateData).length > 0 ? updateData : {});
    }

    return res.status(200).json({
      success: true,
      msg: "MS AD settings updated successfully!",
      data: msADSettings,
    });
  } catch (error) {
    next(error); // Pass any errors to the error handler middleware
  }
});