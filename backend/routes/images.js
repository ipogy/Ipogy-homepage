const express = require('express');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const pool = require('../db'); // db.js から pool を参照
const rateLimit = require('express-rate-limit');

const router = express.Router();
const uploadDir = path.join(__dirname, '../uploads', 'images');

// アップロード制限
const lowstrictRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: 'Too many requests from this IP, please try again after a minute',
  standardHeaders: true,
  legacyHeaders: false,
});

// アップロードディレクトリが存在しない場合は作成
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now().toString();
    const randomLength = 8;
    const randomString = crypto.randomBytes(Math.ceil(randomLength / 2))
      .toString('hex')
      .slice(0, randomLength);
    const fileExtension = path.extname(file.originalname);
    cb(null, `${timestamp}-${randomString}${fileExtension}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml', // 注意: セキュリティリスクあり
      'image/bmp',
      'image/tiff',
      'image/x-icon' // .ico
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  }
});

router.post('/', lowstrictRateLimit, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'ファイルのアップロードに失敗しました。許可されたファイル形式またはサイズであることを確認してください。' });
  }

  const imageUrl = `/images/${req.file.filename}`;
  const filename = req.file.filename;
  const originalname = req.file.originalname;
  const mimetype = req.file.mimetype;
  const size = req.file.size;
  const uploadedAt = new Date(); // 現在のタイムスタンプ

  // 日本語に対応するため
  let decodedOriginalname = originalname;
  try {
    decodedOriginalname = decodeURIComponent(originalname);
  } catch (error) {
    console.warn('decodeURIComponent failed:', error);
    // デコードに失敗した場合は元のファイル名をそのまま使用
  }

  try {
    const client = await pool.connect();
    const query = `
      INSERT INTO images (filename, originalname, mimetype, size, path, uploaded_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id;
    `;
    const values = [filename, originalname, mimetype, size, `/uploads/images/${filename}`, uploadedAt];
    const result = await client.query(query, values);
    client.release();

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.status(200).json({
      success: true,
      url: imageUrl,
      filename: filename,
      originalname: originalname,
      mimetype: mimetype,
      size: size,
      imageId: result.rows[0].id, // 保存された画像のIDを返す
    });
  } catch (error) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    console.error('データベースへの保存エラー:', error);
    res.status(500).json({ error: '画像の情報をデータベースに保存できませんでした。' });
  }
});

module.exports = router;