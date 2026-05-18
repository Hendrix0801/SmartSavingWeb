import { Router } from 'express';
import { getDb } from '../db.js';
import { computeInsights } from '../insights.js';

const router = Router();

// GET /api/transactions
// Query params: type=income|expense, month=YYYY-MM
router.get('/', (req, res) => {
  const db = getDb();
  const { type, month } = req.query;

  let sql = 'SELECT * FROM transactions WHERE user_id = ?';
  const params = [req.user.id];

  if (type && ['income', 'expense'].includes(type)) {
    sql += ' AND type = ?';
    params.push(type);
  }

  if (month) {
    sql += " AND strftime('%Y-%m', date) = ?";
    params.push(month);
  }

  sql += ' ORDER BY date DESC, created_at DESC';

  const transactions = db.prepare(sql).all(...params);
  res.json(transactions);
});

// GET /api/transactions/stats
// Query: month=YYYY-MM (default: current month)
router.get('/stats', (req, res) => {
  const db = getDb();
  const now = new Date();
  const month = req.query.month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const transactions = db.prepare(
    "SELECT * FROM transactions WHERE user_id = ? AND strftime('%Y-%m', date) = ?"
  ).all(req.user.id, month);

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // Get available months
  const months = db.prepare(
    "SELECT DISTINCT strftime('%Y-%m', date) as ym FROM transactions WHERE user_id = ? ORDER BY ym DESC"
  ).all(req.user.id).map(r => r.ym);

  // Get budget settings
  const settings = db.prepare(
    'SELECT monthly_salary, saving_target FROM budget_settings WHERE user_id = ?'
  ).get(req.user.id);

  // Calculate total days in month for daily budget
  const year = parseInt(month.split('-')[0]);
  const mon = parseInt(month.split('-')[1]);
  const totalDays = new Date(year, mon, 0).getDate();
  const today = new Date();
  const isCurrentMonth = year === today.getFullYear() && mon === today.getMonth() + 1;
  const monthlySalary = settings?.monthly_salary || 0;
  const savingTarget = settings?.saving_target || 0;
  const availablePool = monthlySalary + totalIncome - savingTarget - totalExpense;
  const dailyAvailable = totalDays > 0 ? Math.max(0, availablePool / totalDays) : 0;

  res.json({
    month,
    totalIncome,
    totalExpense,
    netAmount: totalIncome - totalExpense,
    monthlySalary,
    savingTarget,
    dailyAvailable,
    totalDays,
    isCurrentMonth,
    availableMonths: months,
    count: transactions.length,
  });
});

// GET /api/transactions/available-months
router.get('/available-months', (req, res) => {
  const db = getDb();
  const months = db.prepare(
    "SELECT DISTINCT strftime('%Y-%m', date) as ym FROM transactions WHERE user_id = ? ORDER BY ym DESC"
  ).all(req.user.id).map(r => r.ym);
  res.json(months);
});

// POST /api/transactions
router.post('/', (req, res) => {
  const { amount, note, type, date } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: '请输入有效金额' });
  }

  if (!type || !['income', 'expense'].includes(type)) {
    return res.status(400).json({ error: '类型必须为 income 或 expense' });
  }

  const db = getDb();

  // Generate a simple UUID-like ID
  const id = crypto.randomUUID();
  const txnDate = date ? new Date(date).toISOString() : new Date().toISOString();
  const txnNote = (note || '').trim() || (type === 'income' ? '收入' : '支出');

  db.prepare(`
    INSERT INTO transactions (id, user_id, date, amount, note, type)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, req.user.id, txnDate, amount, txnNote, type);

  const txn = db.prepare('SELECT * FROM transactions WHERE id = ?').get(id);
  res.status(201).json(txn);
});

// DELETE /api/transactions/:id
router.delete('/:id', (req, res) => {
  const db = getDb();
  const result = db.prepare(
    'DELETE FROM transactions WHERE id = ? AND user_id = ?'
  ).run(req.params.id, req.user.id);

  if (result.changes === 0) {
    return res.status(404).json({ error: '记录不存在' });
  }

  res.json({ message: '删除成功' });
});

// DELETE /api/transactions (clear all for current month)
router.delete('/', (req, res) => {
  const db = getDb();
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  db.prepare(
    "DELETE FROM transactions WHERE user_id = ? AND strftime('%Y-%m', date) = ?"
  ).run(req.user.id, month);

  res.json({ message: '已清空本月记录' });
});

// GET /api/transactions/insights
router.get('/insights', (req, res) => {
  const db = getDb();
  const insights = computeInsights(db, req.user.id);
  res.json(insights);
});

export default router;
