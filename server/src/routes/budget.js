import { Router } from 'express';
import { getDb } from '../db.js';

const router = Router();

// GET /api/budget
router.get('/', (req, res) => {
  const db = getDb();
  const settings = db.prepare(
    'SELECT monthly_salary, saving_target FROM budget_settings WHERE user_id = ?'
  ).get(req.user.id);

  if (!settings) {
    return res.json({ monthlySalary: 0, savingTarget: 0 });
  }

  res.json({
    monthlySalary: settings.monthly_salary || 0,
    savingTarget: settings.saving_target || 0,
  });
});

// PUT /api/budget
router.put('/', (req, res) => {
  const { monthlySalary, savingTarget } = req.body;
  const db = getDb();

  db.prepare(`
    INSERT INTO budget_settings (user_id, monthly_salary, saving_target)
    VALUES (?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET
      monthly_salary = excluded.monthly_salary,
      saving_target = excluded.saving_target
  `).run(req.user.id, monthlySalary || 0, savingTarget || 0);

  res.json({ monthlySalary: monthlySalary || 0, savingTarget: savingTarget || 0 });
});

export default router;
