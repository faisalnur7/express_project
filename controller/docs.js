const Docxtemplater = require("docxtemplater");
const PizZip = require("pizzip");
const fs = require("fs");
const libre = require("libreoffice-convert");
// const Template = require("../models/Template");
const path = require("path");
const officegen = require("officegen");
const docx = require("docx");
const mammoth = require("mammoth");
const Doc = require("../models/Doc");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const sendEmail = require("../utils/sendMail");
const multer = require("multer");

// exports.extractDataFromTemplate = asyncHandler(async (req, res, next) => {
//   const { users, first_name, last_name, fb_username, fileType } = req.body;
//   const files = req.files;
//   const saveToDb = req.query.save;

//   if (!files.template) {
//     return res.status(400).json({ error: "Template file is required." });
//   }

//   const templatePath = files.template[0].path;
//   const imagePath = files.image && files.image[0].path;

//   try {
//     // Step 1: Read DOCX template
//     const content = fs.readFileSync(templatePath, "binary");
//     const zip = new PizZip(content);

//     // Step 2: Initialize Docxtemplater
//     const doc = new Docxtemplater(zip, {
//       paragraphLoop: true,
//       linebreaks: true,
//     });

//     // Step 3: Replace placeholders with data
//     doc.render({
//       users: JSON.parse(users),
//       first_name,
//       last_name,
//       fb_username,
//     });

//     // Step 4: Embed Image
//     if (imagePath) {
//       const imageBase64 = fs.readFileSync(imagePath, "base64");
//       const imageXML = `
//                 <w:p>
//                     <w:r>
//                         <w:drawing>
//                             <wp:inline>
//                                 <a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
//                                     <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
//                                         <pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
//                                             <pic:blipFill>
//                                                 <a:blip r:embed="rId1" cstate="print"/>
//                                             </pic:blipFill>
//                                         </pic:pic>
//                                     </a:graphicData>
//                                 </a:graphic>
//                             </wp:inline>
//                         </w:drawing>
//                     </w:r>
//                 </w:p>
//             `;

//       // Inject the XML content into the DOCX
//       const documentXML = zip.file("word/document.xml").asText();
//       const updatedXML = documentXML.replace(
//         "</w:body>",
//         `${imageXML}</w:body>`
//       );
//       zip.file("word/document.xml", updatedXML);

//       // Add the image to the `word/media` folder
//       zip.file("word/media/image1.jpeg", fs.readFileSync(imagePath));

//       // Add relationships for the image
//       const relsXML = zip.file("word/_rels/document.xml.rels").asText();
//       const updatedRelsXML = relsXML.replace(
//         "</Relationships>",
//         `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/image1.jpeg"/> </Relationships>`
//       );
//       zip.file("word/_rels/document.xml.rels", updatedRelsXML);
//     }

//     // Step 5: Generate the updated DOCX
//     const docxBuf = zip.generate({
//       type: "nodebuffer",
//       compression: "DEFLATE",
//     });

//     // Step 6: Handle Output
//     if (fileType === "pdf") {
//       const pdfBuf = await convertToPdf(docxBuf);

//       if (saveToDb === "true") {
//         const savedDoc = await saveFileToDb(pdfBuf, "pdf", "./saved-files");
//         return res
//           .status(201)
//           .json({ message: "PDF file saved to database", doc: savedDoc });
//       }

//       res.set({
//         "Content-Type": "application/pdf",
//         "Content-Disposition": "inline; filename=preview.pdf",
//       });
//       return res.send(pdfBuf);
//     } else {
//       if (saveToDb === "true") {
//         const savedDoc = await saveFileToDb(docxBuf, "docx", "./saved-files");
//         return res
//           .status(201)
//           .json({ message: "DOCX file saved to database", doc: savedDoc });
//       }

//       res.set({
//         "Content-Type":
//           "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//         "Content-Disposition": "inline; filename=preview.docx",
//       });
//       return res.send(docxBuf);
//     }
//   } catch (error) {
//     console.error("Error processing the template:", error);
//     next(error);
//   }
// });

// exports.getAllSavedFiles = asyncHandler(async (req, res, next) => {
//   const files = await Doc.find({});
//   if (!files) {
//     return next(new ErrorResponse("No File Found!", 404));
//   }
//   return res.status(200).json({
//     success: true,
//     msg: "Files fetched successfully!",
//     data: files,
//   });
// });



// exports.uploadTemplates = asyncHandler(async (req, res, next) => {
//   const files = req.files;
//   if (!files.template_file) {
//     return res.status(400).json({ error: "Template file is required." });
//   }
//   const templatePath = files.template_file[0].path;
//   const originalname = files.template_file[0].originalname;

//   //save to db
//   const template = new Template();
//   template.name = originalname;
//   template.file_path = templatePath;
//   const savedtemp = await template.save();

//   if (savedtemp) {
//     return res.status(200).json({
//       success: true,
//       msg: "Templated uploaded successfully!",
//     });
//   } else {
//     return next(new ErrorResponse("Template Uploading Error!", 404));
//   }
// });

// exports.getAllTemplates = asyncHandler(async (req, res, next) => {
//   const docs = await Template.find({});
//   if (!docs) {
//     return next(new ErrorResponse("No Template Found!", 404));
//   }
//   return res.status(200).json({
//     success: true,
//     msg: "Template fetched successfully!",
//     data: docs,
//   });
// });

// exports.getSingleTemplate = asyncHandler(async (req, res, next) => {
//   const doc = await Template.findById(req.params.id);
//   if (!doc) {
//     return next(new ErrorResponse("No Template Found!", 404));
//   }
//   return res.status(200).json({
//     success: true,
//     msg: "Template fetched successfully!",
//     data: doc,
//   });
// });

// exports.sendSingleTemplate = asyncHandler(async (req, res, next) => {
//   const doc = await Template.findById(req.params.id);
//   if (!doc) {
//     return next(new ErrorResponse("No Template Found!", 404));
//   }

//   // Read the file as a buffer
//   const fileBuffer = fs.readFileSync(doc.file_path); // Replace doc.file_path with the correct path field
//   const fileName = path.basename(doc.file_path); // Extract the file name

//   // Compose the email message
//   const message = `Dear User,\n\nPlease find the attached document.\n\nBest regards,`;

//   await sendEmail({
//     email: "jh409780@gmail.com",
//     subject: "Document Message",
//     message,
//     attachments: [
//       {
//         filename: fileName,
//         content: fileBuffer,
//       },
//     ],
//   });

//   return res.status(200).json({
//     success: true,
//     msg: "Template sent successfully!",
//     data: doc,
//   });
// });

// // Helper function to convert .docx to PDF using LibreOffice
// async function convertToPdf(docxBuffer) {
//   return new Promise((resolve, reject) => {
//     libre.convert(docxBuffer, "pdf", undefined, (err, pdfBuffer) => {
//       if (err) {
//         return reject(err);
//       }
//       resolve(pdfBuffer);
//     });
//   });
// }

// async function saveFileToDb(fileBuffer, fileType, directory) {
//   const timestamp = Date.now();
//   const fileName = `output_${timestamp}.${fileType}`;
//   const filePath = path.join(directory, fileName);

//   // Ensure the directory exists
//   if (!fs.existsSync(directory)) {
//     fs.mkdirSync(directory, { recursive: true });
//   }

//   // Save the file locally
//   fs.writeFileSync(filePath, fileBuffer);

//   // Save metadata to the database
//   const newDoc = new Doc({
//     name: `Generated ${fileType.toUpperCase()}`,
//     description: `This is a generated ${fileType.toUpperCase()} file.`,
//     file_path: filePath,
//   });

//   await newDoc.save();
//   return newDoc;
// }
// by Banna

exports.getAllDocs = asyncHandler(async (req, res, next) => {
  const docs = await Doc.find({});
  if (!docs) {
    return next(new ErrorResponse("No Documents Found!", 404));
  }
  return res.status(200).json({
    success: true,
    msg: "Documents fetched successfully!",
    data: docs,
  });
});

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Save to 'uploads' folder
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// File Filter (optional, to accept only specific file types)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|docx|txt|jpg|jpeg|png/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  if (extname) {
    cb(null, true);
  } else {
    cb(new ErrorResponse("Only documents and images are allowed!", 400), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

// POST Route to Upload Document
// exports.uploadDoc = asyncHandler(async (req, res, next) => {
//   upload.single("file")(req, res, async (err) => {
//     if (err) {
//       return next(new ErrorResponse(err.message, 400));
//     }

//     if (!req.file) {
//       return next(new ErrorResponse("Please upload a file", 400));
//     }

//     const { name, description } = req.body;

//     // Save document to DB
//     const doc = await Doc.create({
//       name,
//       description,
//       file_path: req.file.path,
//     });

//     return res.status(201).json({
//       success: true,
//       msg: "Document uploaded successfully!",
//       data: doc,
//     });
//   });
// });
// POST Route to Upload or Update Document
exports.uploadDoc = asyncHandler(async (req, res, next) => {
  upload.single("file")(req, res, async (err) => {
    if (err) {
      return next(new ErrorResponse(err.message, 400));
    }

    if (!req.file && !req.body.id) {
      return next(
        new ErrorResponse("Please upload a file or provide an ID", 400)
      );
    }

    const { id, name, description } = req.body;

    try {
      let doc;

      if (id) {
        // Find and update the document
        doc = await Doc.findById(id);
        if (!doc) {
          return next(new ErrorResponse("Document not found", 404));
        }

        // Update fields only if new values are provided
        doc.name = name || doc.name;
        doc.description = description || doc.description;
        if (req.file) {
          doc.file_path = req.file.path;
        }

        await doc.save();

        return res.status(200).json({
          success: true,
          msg: "Document updated successfully!",
          data: doc,
        });
      } else {
        // Create a new document
        if (!req.file) {
          return next(new ErrorResponse("Please upload a file", 400));
        }

        doc = await Doc.create({
          name,
          description,
          file_path: req.file.path,
        });

        return res.status(201).json({
          success: true,
          msg: "Document uploaded successfully!",
          data: doc,
        });
      }
    } catch (error) {
      return next(new ErrorResponse(error.message, 500));
    }
  });
});

// DELETE Document by ID
exports.deleteDoc = asyncHandler(async (req, res, next) => {
  const { id } = req.body;

  // Validate if id is provided
  if (!id) {
    return next(new ErrorResponse("Document ID is required", 400));
  }

  // Find and delete the document by ID
  const deletedDoc = await Doc.findByIdAndDelete(id);

  if (!deletedDoc) {
    return next(new ErrorResponse(`No document found with ID: ${id}`, 404));
  }

  return res.status(200).json({
    success: true,
    msg: "Document deleted successfully!",
    data: deletedDoc,
  });
});
