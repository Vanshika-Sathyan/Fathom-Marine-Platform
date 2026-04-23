const express = require("express");
const router = express.Router();
const multer = require("multer");
const AWS = require("aws-sdk");
require("dotenv").config();

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || "us-east-1"
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ["application/pdf", "video/mp4", "image/jpeg", "image/png", "application/json"];
    cb(null, allowed.includes(file.mimetype));
  }
});

router.post("/training-material", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const key = "training-materials/" + Date.now() + "-" + req.file.originalname;
    const params = {
      Bucket: process.env.S3_BUCKET_NAME || "fathom-training-materials",
      Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype
    };
    const result = await s3.upload(params).promise();
    res.json({ success: true, s3Url: result.Location, key: result.Key });
  } catch (e) {
    console.error("S3 upload error:", e);
    res.status(500).json({ error: "Upload failed", details: e.message });
  }
});

router.get("/signed-url", async (req, res) => {
  try {
    const key = req.query.key;
    if (!key) return res.status(400).json({ error: "key query param required" });
    const url = s3.getSignedUrl("getObject", {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Expires: 3600
    });
    res.json({ url });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
