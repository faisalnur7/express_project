const express = require('express');
const multer = require('multer');
const { protect, authorize } = require("../middleware/auth");
const documentController = require('../controller/documentController');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/generate-doc', protect, documentController.generateDocument);
router.post('/upload-generateDoc', protect, upload.single('template'), documentController.uploadAndGenerateDocument);
router.post('/generate-doc-from-db', protect, documentController.generateDocumentFromDB);

module.exports = router;