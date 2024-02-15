const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const FileModel = require("../models/FileModel");

// Configure Cloudinary
cloudinary.config({
  cloud_name: "dhf1qfoas",
  api_key: "922356736975868",
  api_secret: "WE0CVvg6LOjUHRa4xbXjZHcVpzA",
});

// Configure Multer storage and file filter
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "application/pdf",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type. Only JPEG, PNG, and PDF files are allowed.")
    );
  }
};

// Configure Multer upload
const upload = multer({ storage: storage, fileFilter: fileFilter });

// Handle file upload and save to Cloudinary and database
const uploadAndSaveFile = (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  const fileBuffer = req.file.buffer;

  cloudinary.uploader
    .upload_stream({ resource_type: "auto" }, (error, result) => {
      if (error) {
        console.error("Error uploading file to Cloudinary:", error);
        return res.status(500).send("Error uploading file to Cloudinary.");
      }

      const publicUrl = result.secure_url;
      const originalFileName = req.file.originalname;
      const fileNameWithExtension = originalFileName.substring(
        0,
        originalFileName.lastIndexOf(".")
      );

      const fileData = {
        filename: fileNameWithExtension,
        originalname: originalFileName,
        path: publicUrl,
      };

      FileModel.create(fileData)
        .then((response) => {
          console.log("File information added to the database.");
          res.status(200).json({ url: publicUrl, fileId: response });
        })
        .catch((err) => {
          console.error("Error saving file to the database:", err);
          return res.status(500).send("Error saving file to the database.");
        });
    })
    .end(fileBuffer);
};

module.exports = { uploadAndSaveFile, upload };
