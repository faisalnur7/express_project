const express = require('express');
const multer = require('multer');
const documentController = require('../controller/documentController');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/generate-doc', documentController.generateDocument);
router.post('/upload-generateDoc', upload.single('template'), documentController.uploadAndGenerateDocument);
router.post('/generate-doc-from-db', documentController.generateDocumentFromDB);

module.exports = router;