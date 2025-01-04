// Import necessary modules
const Template = require('../models/Template');
const asyncHandler = require("../middleware/async");

// Create a new template
exports.createTemplate = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    if (!name || name.length < 5) {
        return res.status(400).json({ message: 'Name is required and must be at least 5 characters long.' });
    }

    const isTemplatesExists = await Template.find({name: name});

    if (isTemplatesExists.length) {
        return res.status(400).json({ message: 'Template with this name already exists.' });
    }
    
    const template = await Template.create({ name, description });

    res.status(201).json({
        success: true,
        message: 'Template created successfully!',
        data: template
    });
});

// Get all templates (with optional active filter)
exports.getTemplates = asyncHandler(async (req, res) => {
    const { isActive } = req.query;
    const query = isActive ? { isActive: isActive === 'true' } : {};

    const templates = await Template.find(query);

    res.status(200).json({
        success: true,
        data: templates
    });
});

// Get a single template by ID
exports.getTemplateById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const template = await Template.findById(id);

    if (!template) {
        return res.status(404).json({ message: 'Template not found' });
    }

    res.status(200).json({
        success: true,
        data: template
    });
});

// Update a template by ID
exports.updateTemplate = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, description, isActive } = req.body;

    const template = await Template.findById(id);

    if (!template) {
        return res.status(404).json({ message: 'Template not found' });
    }

    const isTemplatesExists = await Template.find({name: name});

    if (isTemplatesExists.length) {
        return res.status(400).json({ message: 'Template with this name already exists.' });
    }

    template.name = name || template.name;
    template.description = description || template.description;
    if (typeof isActive !== 'undefined') template.isActive = isActive;

    await template.save();

    res.status(200).json({
        success: true,
        message: 'Template updated successfully!',
        data: template
    });
});

// "Delete" a template by updating isActive property
exports.deleteTemplate = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const template = await Template.findById(id);

    if (!template) {
        return res.status(404).json({ message: 'Template not found' });
    }

    template.isActive = !template.isActive;
    await template.save();

    res.status(200).json({
        success: true,
        message: `Template ${template.isActive ? 'activated' : 'deactivated'} successfully!`,
        data: template
    });
});