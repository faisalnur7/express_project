const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const templateController = require("../controller/templateController");
const router = express.Router();

router.get('/', protect,  templateController.getTemplates);
router.post('/create', protect,  templateController.createTemplate);
router.get('/:id', protect,  templateController.getTemplateById);
router.put('/:id/update', protect,  templateController.updateTemplate);
router.delete('/:id/delete', protect,  templateController.deleteTemplate);

module.exports = router;