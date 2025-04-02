require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const pool = require('./db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const authenticate = require('./middleware/auth'); // 認証ミドルウェアをインポート
const path = require('path');
const imagesRouter = require('./routes/images'); // 画像インポート用のルーターをインポート
const app = express();
const port = process.env.PORT;
const front_url_http = process.env.FRONT_URL_HTTP;
const front_url_https = process.env.FRONT_URL_HTTPS;
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const otpStorage = {}; // otpを保存する場所、データベースサーバに移行するか判断必要。暫定的にここでいいや
const otp_expiration_time = process.env.OTP_EXPIRATION_TIME || 60 * 1000 * 3;

app.use(express.json());

// CORS Settings
// 特定のオリジンからのリクエストのみ許可する設定
const corsOptions = {
  origin: [front_url_http, front_url_https],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // 許可するHTTPメソッド
  credentials: true, // クッキーなどの資格情報を共有する場合
  optionsSuccessStatus: 204, // preflight request のステータスコード
};

app.use(cors(corsOptions)); // CORS ミドルウェアを適用
app.set('trust proxy', true);


// RateLimit Settings
// 一般ユーザー向け
const generalRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again after a minute',
  standardHeaders: true,
  legacyHeaders: false,
});

// 一般ユーザー&管理者向け
const lowstrictRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: 'Too many requests from this IP, please try again after a minute',
  standardHeaders: true,
  legacyHeaders: false,
});

// お問い合わせ送信, ログイン
const strictRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: 'Too many requests for contact form, please try again after a minute',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(bodyParser.urlencoded({ extended: true }));

// 静的ファイルを提供するための設定
app.use('/api/images', express.static(path.join(__dirname, 'uploads', 'images')));

// API ルーティング
app.use('/api/v1/images', imagesRouter);

// GET /api/articles/all: 全てのブログ記事を取得 (認証が必要 - 管理者向け)
app.get('/api/articles/all', authenticate, generalRateLimit, async (req, res) => {
  const { page = 1, limit = 10, tag, sort = 'created_at', order = 'DESC' } = req.query;
  const currentPage = parseInt(page);
  const itemsPerPage = parseInt(limit);
  const offset = (currentPage - 1) * itemsPerPage;
  const values = [];
  let query = `
      SELECT
        a.id,
        a.title,
        a.slug,
        a.content,
        a.created_at,
        a.updated_at,
        a.is_published,
        ARRAY_AGG(t.name) AS tags
      FROM
        articles a
      LEFT JOIN
        article_tags at ON a.id = at.article_id
      LEFT JOIN
        tags t ON at.tag_id = t.id
    `;

  let countQuery = `
      SELECT
        COUNT(a.id)
      FROM
        articles a
    `;

  if (tag) {
    query += ` WHERE t.name = $${values.length + 1}`;
    countQuery += ` WHERE EXISTS (
        SELECT 1 FROM article_tags at_count
        JOIN tags t_count ON at_count.tag_id = t_count.id
        WHERE at_count.article_id = a.id AND t_count.name = $${values.length + 1}
      )`;
    values.push(tag);
  }


  query += `
      GROUP BY a.id, a.title, a.slug, a.content, a.created_at, a.updated_at, a.is_published
      ORDER BY ${sort} ${order}
      LIMIT $${values.length + 1} OFFSET $${values.length + 2}
    `;
  values.push(itemsPerPage, offset);

  try {
    const articlesResult = await pool.query(query, values);
    const countResult = await pool.query(countQuery, tag ? [tag] : []);
    const totalCount = countResult.rows[0].count;

    // レスポンスヘッダーに全記事数を追加
    res.header('X-Total-Count', totalCount);

    // Access-Control-Expose-Headers に X-Total-Count を追加
    res.header('Access-Control-Expose-Headers', 'X-Total-Count');

    res.json(articlesResult.rows);
  } catch (error) {
    console.error('Error fetching all articles for pagination:', error);
    res.status(500).json({ error: 'Failed to fetch all articles' });
  }
});

// GET /api/articles: 公開済みのブログ記事一覧を取得
app.get('/api/articles', generalRateLimit, async (req, res) => {
  const { page = 1, limit = 10, tag, sort = 'created_at', order = 'DESC' } = req.query;
  const currentPage = parseInt(page);
  const itemsPerPage = parseInt(limit);
  const offset = (currentPage - 1) * itemsPerPage;
  const values = [];
  let query = `
    SELECT
      a.id,
      a.title,
      a.slug,
      a.created_at,
      ARRAY_AGG(t.name) AS tags
    FROM
      articles a
    LEFT JOIN
      article_tags at ON a.id = at.article_id
    LEFT JOIN
      tags t ON at.tag_id = t.id
    WHERE
      a.is_published = TRUE
  `;

  let countQuery = `
    SELECT
      COUNT(a.id)
    FROM
      articles a
    WHERE
      a.is_published = TRUE
  `;

  if (tag) {
    query += ` AND t.name = $${values.length + 1}`;
    countQuery += ` AND EXISTS (
      SELECT 1 FROM article_tags at_count
      JOIN tags t_count ON at_count.tag_id = t_count.id
      WHERE at_count.article_id = a.id AND t_count.name = $${values.length + 1}
    )`;
    values.push(tag);
  }

  query += `
    GROUP BY a.id, a.title, a.slug, a.created_at
    ORDER BY ${sort} ${order}
    LIMIT $${values.length + 1} OFFSET $${values.length + 2}
  `;
  values.push(itemsPerPage, offset);

  try {
    const articlesResult = await pool.query(query, values);
    const countResult = await pool.query(countQuery, tag ? [tag] : []);
    const totalCount = countResult.rows[0].count;

    // レスポンスヘッダーに全記事数を追加
    res.header('X-Total-Count', totalCount);
    // Access-Control-Expose-Headers に X-Total-Count を追加
    res.header('Access-Control-Expose-Headers', 'X-Total-Count');

    res.json(articlesResult.rows);
  } catch (error) {
    console.error('Error fetching articles for pagination:', error);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

// GET /api/articles/:slug: 特定の公開済みブログ記事をslugで取得
app.get('/api/articles/:slug', lowstrictRateLimit, async (req, res) => {
  const { slug } = req.params;
  const query = `
    SELECT
      a.title,
      a.slug,
      a.content,
      a.created_at,
      a.updated_at,
      ARRAY_AGG(t.name) AS tags
    FROM
      articles a
    LEFT JOIN
      article_tags at ON a.id = at.article_id
    LEFT JOIN
      tags t ON at.tag_id = t.id
    WHERE
      a.slug = $1 AND a.is_published = TRUE
    GROUP BY a.id, a.title, a.slug, a.content, a.created_at, a.updated_at
  `;

  try {
    const result = await pool.query(query, [slug]);
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: 'Article not found' });
    }
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({ error: 'Failed to fetch article' });
  }
});

// POST /api/articles: 新規ブログ記事を作成 (認証が必要)
app.post('/api/articles', authenticate, lowstrictRateLimit, async (req, res) => {
  const { title, slug, content, tags } = req.body;
  const authorId = req.user.id; // 認証ミドルウェアで設定されたユーザーID

  if (!title || !slug || !content || !Array.isArray(tags)) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 記事を articles テーブルに挿入
    const articleResult = await client.query(
      'INSERT INTO articles (author_id, title, slug, content) VALUES ($1, $2, $3, $4) RETURNING id, created_at, updated_at',
      [authorId, title, slug, content]
    );
    const articleId = articleResult.rows[0].id;

    // タグが存在しない場合は tags テーブルに挿入し、IDを取得
    const tagIds = [];
    for (const tagName of tags) {
      const tagExistsResult = await client.query('SELECT id FROM tags WHERE name = $1', [tagName]);
      let tagId;
      if (tagExistsResult.rows.length > 0) {
        tagId = tagExistsResult.rows[0].id;
      } else {
        const newTagResult = await client.query('INSERT INTO tags (name) VALUES ($1) RETURNING id', [tagName]);
        tagId = newTagResult.rows[0].id;
      }
      tagIds.push(tagId);
    }

    // article_tags テーブルに記事とタグの関連を挿入
    for (const tagId of tagIds) {
      await client.query('INSERT INTO article_tags (article_id, tag_id) VALUES ($1, $2)', [articleId, tagId]);
    }

    await client.query('COMMIT');

    const newArticle = {
      id: articleId,
      title,
      slug,
      content,
      tags,
      created_at: articleResult.rows[0].created_at,
      updated_at: articleResult.rows[0].updated_at,
    };

    res.status(201).json(newArticle);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating article:', error);
    if (error.code === '23505' && error.constraint === 'articles_slug_key') {
      return res.status(409).json({ error: 'Slug already exists' });
    }
    res.status(500).json({ error: 'Failed to create article' });
  } finally {
    client.release();
  }
});

// PUT /api/articles/:slug: 既存のブログ記事を更新 (認証が必要)
app.put('/api/articles/:slug', authenticate, lowstrictRateLimit, async (req, res) => {
  const { slug } = req.params;
  const { title, content, tags, is_published } = req.body;

  if (!title || !content || !Array.isArray(tags)) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 記事を articles テーブルで更新
    const articleResult = await client.query(
      `
      UPDATE articles
      SET title = $1, content = $2, updated_at = NOW(), is_published = $3
      WHERE slug = $4
      RETURNING id, created_at, updated_at
      `,
      [title, content, is_published, slug]
    );

    if (articleResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Article not found' });
    }

    const articleId = articleResult.rows[0].id;

    // 既存の関連するタグを削除
    await client.query('DELETE FROM article_tags WHERE article_id = $1', [articleId]);

    // 新しいタグが存在しない場合は tags テーブルに挿入し、IDを取得
    const tagIds = [];
    for (const tagName of tags) {
      const tagExistsResult = await client.query('SELECT id FROM tags WHERE name = $1', [tagName]);
      let tagId;
      if (tagExistsResult.rows.length > 0) {
        tagId = tagExistsResult.rows[0].id;
      } else {
        const newTagResult = await client.query('INSERT INTO tags (name) VALUES ($1) RETURNING id', [tagName]);
        tagId = newTagResult.rows[0].id;
      }
      tagIds.push(tagId);
    }

    // article_tags テーブルに新しい記事とタグの関連を挿入
    for (const tagId of tagIds) {
      await client.query('INSERT INTO article_tags (article_id, tag_id) VALUES ($1, $2)', [articleId, tagId]);
    }

    await client.query('COMMIT');

    const updatedArticle = {
      id: articleId,
      title,
      slug,
      content,
      tags,
      is_published,
      created_at: articleResult.rows[0].created_at,
      updated_at: articleResult.rows[0].updated_at,
    };

    res.json(updatedArticle);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating article:', error);
    res.status(500).json({ error: 'Failed to update article' });
  } finally {
    client.release();
  }
});

// GET /api/admin/validate-token: 現在のトークンが有効かどうかを確認 (認証が必要)
app.get('/api/admin/validate-token', authenticate, generalRateLimit, (req, res) => {
  res.sendStatus(200); // authenticateがあるかどうかのみを判断、ページ遷移を自動でするためのもの
});

// DELETE /api/articles/:slug: 特定のブログ記事を削除 (認証が必要)
app.delete('/api/articles/:slug', authenticate, lowstrictRateLimit, async (req, res) => {
  const { slug } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM articles WHERE slug = $1 RETURNING id',
      [slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // 記事が削除された場合、関連する article_tags のレコードも ON DELETE CASCADE で自動的に削除。
    // 明示的に削除不要。

    res.status(204).send(); // 削除成功時は 204
  } catch (error) {
    console.error('Error deleting article:', error);
    res.status(500).json({ error: 'Failed to delete article' });
  }
});

// POST /api/auth/login: 管理者ログイン (OTP送信をトリガー)
app.post('/api/auth/login', strictRateLimit, async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const userResult = await pool.query('SELECT id, email, password FROM users WHERE email = $1', [email]);
    const user = userResult.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 認証成功: OTP を生成して送信
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const now = Date.now();
    const expiresAt = now + otp_expiration_time;

    // OTP を一時的に保存 (メールアドレスをキーとする)
    otpStorage[email] = { otp, expiresAt, userId: user.id }; // userId も紐付けて保存

    // 送信するメールのオプション (既存の mailOptions を再利用)
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: 'ipogy.org - ワンタイムパスワード',
      html: `
              <p>いつもご利用ありがとうございます。</p>
              <p>あなたのワンタイムパスワードは:</p>
              <h2>${otp}</h2>
              <p>このパスワードは ${Math.floor(otp_expiration_time / (60 * 1000))} 分間有効です。</p>
              <p>第三者にこのパスワードを教えないでください。</p>
          `,
    };

    try {
      await transporter.sendMail(mailOptions);
      res.json({ message: `認証コードを ${email} に送信しました。` }); // フロントエンドに OTP 送信を通知
    } catch (error) {
      console.error('OTP メール送信エラー:', error);
      res.status(500).json({ error: '認証コードの送信に失敗しました。' });
    }

  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Nodemailer トランスポートオブジェクトの作成
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST, // 例: 'smtp.example.com'
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === 'true', // TLS/STARTTLS を使用するかどうか (true/false)
  auth: {
    user: process.env.SMTP_USER, // 送信元メールアドレス
    pass: process.env.SMTP_PASSWORD, // 送信元メールアドレスのパスワード
  },
});

// POST /api/send-otp: OTP を生成して指定されたメールアドレスに送信, コード変更後不要になりましたが、一応残している
app.post('/api/send-otp', strictRateLimit, async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'メールアドレスが必須です。' });
  }

  try {
      const userResult = await pool.query('SELECT id, auth_email FROM users WHERE email = $1', [email]);
      const user = userResult.rows[0];

      if (!user || !user.auth_email) {
          return res.status(400).json({ error: '指定されたメールアドレスに紐づく認証用メールアドレスが見つかりません。' });
      }

      const authEmail = user.auth_email;

      // ランダムな OTP を生成 (6桁の数字)
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const now = Date.now();
      const expiresAt = now + otp_expiration_time;

      // OTP を一時的に保存 (認証用メールアドレスをキーとする)
      otpStorage[authEmail] = { otp, expiresAt, userId: user.id };

      // 送信するメールのオプション
      const mailOptions = {
          from: process.env.SMTP_USER,
          to: authEmail, // 受信者のメールアドレス (認証用メールアドレス)
          subject: 'ipogy.org - ワンタイムパスワード',
          html: `
              <p>いつもご利用ありがとうございます。</p>
              <p>あなたのアカウントのワンタイムパスワードは:</p>
              <h2>${otp}</h2>
              <p>このパスワードは ${Math.floor(otp_expiration_time / (60 * 1000))} 分間有効です。</p>
              <p>第三者にこのパスワードを教えないでください。</p>
          `,
      };

      try {
          await transporter.sendMail(mailOptions);
          res.json({ message: `認証コードを ${authEmail} に送信しました。` });
      } catch (error) {
          console.error('OTP メール送信エラー:', error);
          res.status(500).json({ error: '認証コードの送信に失敗しました。' });
      }

  } catch (error) {
      console.error('ユーザー情報取得エラー:', error);
      res.status(500).json({ error: 'ユーザー情報の取得に失敗しました。' });
  }
});

// POST /api/verify-otp: 送信された OTP を検証
app.post('/api/verify-otp', strictRateLimit, async (req, res) => {
  const { email, otp } = req.body; // ログインに使用したメールアドレス

  if (!email || !otp) {
      return res.status(400).json({ error: 'メールアドレスと認証コードが必須です。' });
  }

  try {
      const userResult = await pool.query('SELECT id, auth_email FROM users WHERE email = $1', [email]);
      const user = userResult.rows[0];

      if (!user || !user.auth_email) {
          return res.status(400).json({ error: '指定されたメールアドレスに紐づく認証用メールアドレスが見つかりません。' });
      }

      const authEmail = user.auth_email;
      const storedOTPData = otpStorage[authEmail];

      if (!storedOTPData) {
          return res.status(400).json({ error: '認証コードが送信されていません。' });
      }

      const { otp: storedOTP, expiresAt, userId } = storedOTPData;
      const now = Date.now();

      if (now > expiresAt) {
          delete otpStorage[authEmail];
          return res.status(400).json({ error: '認証コードの有効期限が切れました。再度送信してください。' });
      }

      if (otp === storedOTP) {
          delete otpStorage[authEmail];

          const token = jwt.sign({ userId: userId, email: email }, process.env.JWT_SECRET, {
              expiresIn: '1h',
          });

          res.json({ message: '認証に成功しました。', token });
      } else {
          res.status(400).json({ error: '認証コードが正しくありません。' });
      }

  } catch (error) {
      console.error('ユーザー情報取得エラー:', error);
      res.status(500).json({ error: 'ユーザー情報の取得に失敗しました。' });
  }
});

// POST /api/contact: お問い合わせフォームの内容を受け取り、処理
app.post('/api/contact', strictRateLimit, async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required' });
  }

  try {
    // 送信するメールのオプション
    const mailOptions = {
      from: email, // 送信者のメールアドレス
      to: process.env.CONTACT_EMAIL, // 受信者のメールアドレス (お問い合わせ受付アドレス)
      subject: `New Inquiry from ${name}`, // 日本語なら'お問い合わせ: ${name} 様', 英語なら 'New Inquiry from ${name}'
      html: `
          <p>Name: ${name}</p>
          <p>Email: ${email}</p>
          <p>Message:</p>
          <pre>${message}</pre>
        `,
    };

    // メールを送信
    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);

    // データベースに保存する場合 (オプション)
    try {
      await pool.query(
        'INSERT INTO contacts (name, email, message, created_at) VALUES ($1, $2, $3, NOW())',
        [name, email, message]
      );
      console.log('Contact message saved to database.');
    } catch (dbError) {
      console.error('Error saving contact message to database:', dbError);
      // データベース保存に失敗しても、メール送信は成功しているので、
      // クライアントには成功のレスポンスを返す。
    }

    // お問い合わせ受付完了のレスポンス
    res.status(200).json({ message: 'Your inquiry has been received. We will get back to you as soon as possible.' });

  } catch (error) {
    console.error('Error processing contact form and sending email:', error);
    res.status(500).json({ error: 'Failed to process your inquiry' });
  }
});

// GET /api/admin/articles/:slug: 特定のブログ記事を取得 (公開・非公開問わず、認証が必要 - 管理者向け)
app.get('/api/admin/articles/:slug', authenticate, lowstrictRateLimit, async (req, res) => {
  const { slug } = req.params;
  const query = `
    SELECT
      a.id,
      a.title,
      a.slug,
      a.content,
      a.created_at,
      a.updated_at,
      a.is_published,
      ARRAY_AGG(t.name) AS tags
    FROM
      articles a
    LEFT JOIN
      article_tags at ON a.id = at.article_id
    LEFT JOIN
      tags t ON at.tag_id = t.id
    WHERE
      a.slug = $1
    GROUP BY a.id, a.title, a.slug, a.content, a.created_at, a.updated_at, a.is_published
  `;

  try {
    const result = await pool.query(query, [slug]);
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: 'Article not found' });
    }
  } catch (error) {
    console.error('Error fetching admin article:', error);
    res.status(500).json({ error: 'Failed to fetch article' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});