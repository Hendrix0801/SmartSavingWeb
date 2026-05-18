/**
 * Seed script: Create initial users for the SmartSaving app.
 * Run: bun seed.js  or  node seed.js
 */
import { getDb, closeDb } from './src/db.js';
import bcrypt from 'bcryptjs';

const db = getDb();

// Default users: { username, password, displayName }
const defaultUsers = [
  { username: 'admin', password: 'admin123', displayName: '管理员' },
  { username: 'user1', password: 'user123', displayName: '用户一' },
  { username: 'user2', password: 'user123', displayName: '用户二' },
];

const insertUser = db.prepare(
  'INSERT OR IGNORE INTO users (username, password_hash, display_name) VALUES (?, ?, ?)'
);

const insertBudget = db.prepare(
  'INSERT OR IGNORE INTO budget_settings (user_id) VALUES (?)'
);

const tx = db.transaction(() => {
  for (const u of defaultUsers) {
    const hash = bcrypt.hashSync(u.password, 10);
    const result = insertUser.run(u.username, hash, u.displayName);
    if (result.changes > 0) {
      insertBudget.run(result.lastInsertRowid);
      console.log(`✅ 创建用户: ${u.username} (${u.displayName})`);
    } else {
      console.log(`⏭️  用户已存在: ${u.username}`);
    }
  }
});

tx();
closeDb();
console.log('\n🎉 种子数据初始化完成！');
