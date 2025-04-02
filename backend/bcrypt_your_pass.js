// ここでパスワードを暗合化できます。
const bcrypt = require('bcrypt');

async function generateHash(password) {
  const saltRounds = 10;
  const hash = await bcrypt.hash(password, saltRounds);
  console.log("Hash:", hash);
}

generateHash('your_admin_password'); // 実際のパスワードに置き換えてください