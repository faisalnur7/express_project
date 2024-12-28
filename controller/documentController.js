const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const ImageModule = require('docxtemplater-image-module-free');
const Template = require('../models/templateModel');
const Doc = require('../models/Doc');

// Define possible soffice paths
const sofficePaths = [
    "/usr/bin/soffice",
    path.join(__dirname, '..', 'LibreOfficePortable', 'App', 'libreoffice', 'program', 'soffice.exe'),
];

// Find the first valid soffice path
const sofficePath = sofficePaths.find(fs.existsSync);
if (!sofficePath) {
    throw new Error("LibreOffice not found. Ensure soffice is installed or available in one of the configured paths.");
}

async function convertToPDF(buffer) {
    const tempDocxPath = path.join(__dirname, '..', 'temp-output.docx');
    const outputDir = path.join(__dirname, '..', 'output_pdf_dir');
    const outputPdfPath = path.join(outputDir, 'temp-output.pdf');

    await fs.ensureDir(outputDir);
    await fs.writeFile(tempDocxPath, buffer);

    const command = `"${sofficePath}" --headless --convert-to pdf "${tempDocxPath}" --outdir "${outputDir}"`;

    return new Promise((resolve, reject) => {
        exec(command, async (error, stdout, stderr) => {
            if (error) {
                await fs.remove(tempDocxPath);
                await fs.remove(outputDir);
                return reject(new Error(`LibreOffice conversion failed: ${stderr}`));
            }

            try {
                const pdfBuffer = await fs.readFile(outputPdfPath);
                await fs.remove(tempDocxPath);
                await fs.remove(outputDir);
                resolve(pdfBuffer);
            } catch (readError) {
                await fs.remove(tempDocxPath);
                await fs.remove(outputDir);
                reject(new Error("Failed to read the generated PDF file."));
            }
        });
    });
}

async function processTemplate(templateContent, data, outputType) {
    const zip = new PizZip(templateContent);

    const imageOptions = {
        getImage: (tagValue) => {
            if (tagValue.startsWith('data:image/')) {
                const base64Image = tagValue.split(',')[1];
                return Buffer.from(base64Image, 'base64');
            } else {
                throw new Error(`Invalid Base64 data for tag: ${tagValue}`);
            }
        },
        getSize: () => [150, 150],
    };

    const doc = new Docxtemplater(zip, {
        modules: [new ImageModule(imageOptions)],
    });

    Object.keys(data).forEach((key) => {
        if (data[key] === 'true' || data[key] === true) {
            data[key] = '✔';
        } else if (data[key] === 'false' || data[key] === false) {
            data[key] = '☐';
        } else if (Array.isArray(data[key])) {
            data[key] = data[key];
        } else if (typeof data[key] === 'string') {
            try {
                const parsed = JSON.parse(data[key]);
                if (Array.isArray(parsed)) {
                    data[key] = parsed;
                } else {
                    data[key] = parsed;
                }
            } catch (error) {
                // Keep the original string value
            }
        }
    });

    try {
        doc.render(data);
    } catch (error) {
        throw new Error(`Template rendering error: ${error.message}`);
    }

    const buffer = doc.getZip().generate({ type: 'nodebuffer' });

    if (outputType === 'pdf') {
        return await convertToPDF(buffer);
    }
    return buffer;
}

exports.generateDocument = async (req, res) => {
    const { outputType, ...data } = req.body;

    if (!outputType || !['word', 'pdf'].includes(outputType)) {
        return res.status(400).json({ error: "Invalid 'outputType'. Must be 'word' or 'pdf'." });
    }

    const templatePath = path.join(__dirname, '..', 'template.docx');
    if (!fs.existsSync(templatePath)) {
        return res.status(400).json({ error: "Template file 'template.docx' not found." });
    }

    try {
        const templateContent = fs.readFileSync(templatePath, 'binary');
        const documentBuffer = await processTemplate(templateContent, data, outputType);

        const contentType =
            outputType === 'word'
                ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                : 'application/pdf';

        res.set({
            'Content-Type': contentType,
            'Content-Disposition': `attachment; filename="output.${outputType === 'word' ? 'docx' : 'pdf'}"`,
        });

        res.send(documentBuffer);
    } catch (error) {
        console.error('Error generating document:', error);
        res.status(500).json({ error: 'Failed to generate the document.', details: error.message });
    }
};

exports.uploadAndGenerateDocument = async (req, res) => {
    const { outputType, ...data } = req.body;

    if (!outputType || !['word', 'pdf'].includes(outputType)) {
        return res.status(400).json({ error: "Invalid 'outputType'. Must be 'word' or 'pdf'." });
    }

    if (!req.file) {
        return res.status(400).json({ error: "No template file uploaded." });
    }

    try {
        const templateContent = req.file.buffer.toString('binary');
        const documentBuffer = await processTemplate(templateContent, data, outputType);

        const contentType =
            outputType === 'word'
                ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                : 'application/pdf';

        res.set({
            'Content-Type': contentType,
            'Content-Disposition': `attachment; filename="output.${outputType === 'word' ? 'docx' : 'pdf'}"`,
        });

        res.send(documentBuffer);
    } catch (error) {
        console.error('Error generating document:', error);
        res.status(500).json({ error: 'Failed to generate the document.', details: error.message });
    }
};

exports.generateDocumentFromDB = async (req, res) => {
    const { templateId, outputType, ...data } = req.body;

    if (!templateId) {
        return res.status(400).json({ error: "'templateId' is required." });
    }

    if (!outputType || !['word', 'pdf'].includes(outputType)) {
        return res.status(400).json({ error: "Invalid 'outputType'. Must be 'word' or 'pdf'." });
    }

    try {
        const templateDoc = await Doc.findById(templateId);
        // console.log(templateDoc.file_path)
        if (!templateDoc || !templateDoc.file_path) {
            return res.status(404).json({ error: "Template not found or invalid template content." });
        }
        // Read the file from the uploads folder
        const templateContent = await fs.readFile(templateDoc.file_path);
        // const templateContent = Buffer.from(templateDoc.content, 'base64');
        const documentBuffer = await processTemplate(templateContent, data, outputType);

        const contentType =
            outputType === 'word'
                ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                : 'application/pdf';

        res.set({
            'Content-Type': contentType,
            'Content-Disposition': `attachment; filename="output.${outputType === 'word' ? 'docx' : 'pdf'}"`,
        });

        res.send(documentBuffer);
    } catch (error) {
        console.error('Error generating document:', error);
        res.status(500).json({ error: 'Failed to generate the document.', details: error.message });
    }
};