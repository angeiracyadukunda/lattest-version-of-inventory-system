const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const FileModel = require("../models/FileModel");

cloudinary.config({
  cloud_name: "dhf1qfoas",
  api_key: "922356736975868",
  api_secret: "WE0CVvg6LOjUHRa4xbXjZHcVpzA",
});

const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type. Only JPEG, PNG, and PDF files are allowed.")
    );
  }
};
const upload = multer({ storage: storage, fileFilter: fileFilter });

const uploadFile = (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  const fileBuffer = req.file.buffer;
  cloudinary.uploader
    .upload_stream({ resource_type: "raw" }, (error, result) => {
      if (error) {
        console.error(error);
        return res.status(500).send("Error uploading file to Cloudinary.");
      }
      const publicUrl = result.secure_url;
      res.status(200).json({ url: publicUrl });
    })
    .end(fileBuffer);
};

const addFileUploaded = (req, res) => {
  
  const fileData = {
    filename: req.body.filename,
    originalname: req.body.originalname,
    path: req.body.path,
  };

  FileModel.create(fileData)
    .then((response) => {
      console.log("File information added to the database.");
      res.status(200).json({ url: fileData.path, fileId: response });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).send("Error saving file to the database.");
    });

};

module.exports = { uploadFile, addFileUploaded,upload };
