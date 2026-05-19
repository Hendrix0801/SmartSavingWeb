import { useState, useEffect, useCallback } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useAuth } from '../context/AuthContext';
import HealthScoreCard from '../components/HealthScoreCard';

const PIE_COLORS = ['#ff3b30', '#e5e5ea'];

function getBudgetStatus(stats) {
  const { monthlySalary, totalIncome, savingTarget, totalExpense, totalDays, isCurrentMonth } = stats || {};
  if (!monthlySalary && !savingTarget && !totalExpense) return null;

  const totalBudget = (monthlySalary || 0) + (totalIncome || 0) - (savingTarget || 0);
  if (totalBudget <= 0) return null;

  const dailyBudget = totalBudget / (totalDays || 30);
  const today = new Date();
  const dayOfMonth = today.getDate();
  const daysPassed = isCurrentMonth ? dayOfMonth : totalDays;
  const expectedSpend = dailyBudget * daysPassed;
  const actualSpend = totalExpense || 0;
  const diff = expectedSpend - actualSpend; // positive = under budget
  const usedPercent = totalBudget > 0 ? Math.min(100, (actualSpend / totalBudget) * 100) : 0;

  return { diff, usedPercent, totalBudget, dailyBudget, daysPassed, expectedSpend, actualSpend, isCurrentMonth };
}

function BudgetMessage({ status }) {
  if (!status || !status.isCurrentMonth) return null;

  const { diff, usedPercent } = status;
  const isUnder = diff > 0;

  let emoji, title, detail;
  if (usedPercent < 1) {
    emoji = '💪';
    title = '还没开始花钱，加油！';
    detail = '';
  } else if (isUnder) {
    const saved = (status.totalBudget - status.actualSpend).toFixed(2);
    if (diff > 500) { emoji = '🌟'; title = '省钱达人！'; detail = `预算还剩 ¥${saved}`; }
    else if (diff > 100) { emoji = '👏'; title = '干得不错！'; detail = `预算还剩 ¥${saved}`; }
    else { emoji = '👍'; title = '继续保持！'; detail = `预算还剩 ¥${saved}`; }
  } else {
    const over = Math.abs(diff).toFixed(2);
    if (Math.abs(diff) > 500) { emoji = '⚠️'; title = '超支较多'; detail = `本月已超预算 ¥${over}`; }
    else { emoji = '💡'; title = '有点超支了'; detail = `本月已超预算 ¥${over}`; }
  }

  return (
    <div className={`budget-msg ${isUnder ? 'positive' : 'negative'}`}>
      <div className="budget-msg-icon">{emoji}</div>
      <div className="budget-msg-body">
        <div className="budget-msg-title">{title}</div>
        {detail && <div className="budget-msg-detail">{detail}</div>}
      </div>
    </div>
  );
}

export default function Budget() {
  const { apiFetch } = useAuth();
  const [salary, setSalary] = useState('');
  const [savingTarget, setSavingTarget] = useState('');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [budget, s, ins] = await Promise.all([
        apiFetch('/budget'),
        apiFetch('/transactions/stats'),
        apiFetch('/transactions/insights'),
      ]);
      setSalary(budget.monthlySalary > 0 ? String(Math.round(budget.monthlySalary)) : '');
      setSavingTarget(budget.savingTarget > 0 ? String(Math.round(budget.savingTarget)) : '');
      setStats(s);
      setInsights(ins);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const updateSalary = useCallback(
    debounce(async (val) => {
      if (val !== '' && isNaN(Number(val))) return;
      try {
        const data = await apiFetch('/budget', {
          method: 'PUT',
          body: { monthlySalary: Number(val) || 0, savingTarget: Number(savingTarget) || 0 },
        });
        setSalary(data.monthlySalary > 0 ? String(Math.round(data.monthlySalary)) : '');
      } catch (err) {
        console.error(err);
      }
    }, 500),
    [savingTarget]
  );

  const updateTarget = useCallback(
    debounce(async (val) => {
      if (val !== '' && isNaN(Number(val))) return;
      try {
        const data = await apiFetch('/budget', {
          method: 'PUT',
          body: { monthlySalary: Number(salary) || 0, savingTarget: Number(val) || 0 },
        });
        setSavingTarget(data.savingTarget > 0 ? String(Math.round(data.savingTarget)) : '');
      } catch (err) {
        console.error(err);
      }
    }, 500),
    [salary]
  );

  async function handleClearMonth() {
    try {
      await apiFetch('/transactions', { method: 'DELETE' });
      setShowClearConfirm(false);
      loadData();
    } catch (err) {
      console.error(err);
    }
  }

  const budgetStatus = getBudgetStatus(stats);

  if (loading) {
    return <div className="page-loading"><div className="spinner" /></div>;
  }

  return (
    <div className="page">
      <div className="section">
        <div className="section-header">本月设置</div>
        <div className="list-item">
          <span className="list-item-label">月薪</span>
          <div className="input-wrapper">
            <span className="input-prefix">¥</span>
            <input
              type="number"
              className="list-item-input"
              placeholder="0"
              value={salary}
              onChange={e => {
                setSalary(e.target.value);
                updateSalary(e.target.value);
              }}
            />
          </div>
        </div>
        <div className="list-item">
          <span className="list-item-label">存钱目标</span>
          <div className="input-wrapper">
            <span className="input-prefix">¥</span>
            <input
              type="number"
              className="list-item-input"
              placeholder="0"
              value={savingTarget}
              onChange={e => {
                setSavingTarget(e.target.value);
                updateTarget(e.target.value);
              }}
            />
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section-header">本月概览</div>
        <div className="overview-cards">
          <div className="overview-card">
            <span className="overview-label">已花（本月）</span>
            <span className="overview-value red">¥{(stats?.totalExpense || 0).toFixed(2)}</span>
          </div>
          <div className="overview-card">
            <span className="overview-label">日均预算</span>
            <span className="overview-value blue">¥{(stats?.dailyAvailable || 0).toFixed(2)}</span>
          </div>
        </div>
        {budgetStatus && (
          <div className="chart-ring">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={[
                    { name: '已花', value: Math.max(budgetStatus.actualSpend, 0.01) },
                    { name: '剩余', value: Math.max(budgetStatus.totalBudget - budgetStatus.actualSpend, 0) },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                  stroke="none"
                >
                  <Cell fill={PIE_COLORS[0]} />
                  <Cell fill={PIE_COLORS[1]} />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="chart-ring-center">
              <span className="chart-ring-pct">{budgetStatus.usedPercent.toFixed(0)}%</span>
              <span className="chart-ring-label">已使用</span>
            </div>
          </div>
        )}
      </div>

      {budgetStatus && (
        <div className="section">
          <div className="section-header">预算进度</div>
          <div className="budget-progress-section">
            <div className="budget-progress-bar">
              <div
                className={`budget-progress-fill ${budgetStatus.usedPercent > 90 ? 'over' : budgetStatus.usedPercent > 70 ? 'warn' : 'ok'}`}
                style={{ width: `${Math.min(100, budgetStatus.usedPercent)}%` }}
              />
            </div>
            <div className="budget-progress-labels">
              <span>已用 {budgetStatus.usedPercent.toFixed(1)}%</span>
              <span>¥{budgetStatus.actualSpend.toFixed(0)} / ¥{budgetStatus.totalBudget.toFixed(0)}</span>
            </div>
          </div>
          <BudgetMessage status={budgetStatus} />
        </div>
      )}

      {insights && (
        <div className="section">
          <div className="section-header">消费健康</div>
          <HealthScoreCard
            score={insights.healthScore}
            savingsRate={insights.monthlyOverview ? (insights.monthlyOverview.netAmount / insights.monthlyOverview.totalIncome * 100).toFixed(0) : 0}
            flexRatio={insights.fixedVsFlex ? (insights.fixedVsFlex.flexRatio * 100).toFixed(0) : 0}
            avgAmount={insights.txnSizeAnalysis?.avg.toFixed(0) || 0}
          />
          {insights.fixedVsFlex && (
            <div className="flex-breakdown">
              <div className="flex-bar-track">
                <div className="flex-bar-fixed" style={{ width: (1 - insights.fixedVsFlex.flexRatio) * 100 + '%' }}>
                  <span>固定 ¥{insights.fixedVsFlex.fixed.total.toFixed(0)}</span>
                </div>
                <div className="flex-bar-flex" style={{ width: insights.fixedVsFlex.flexRatio * 100 + '%' }}>
                  <span>弹性 ¥{insights.fixedVsFlex.flex.total.toFixed(0)}</span>
                </div>
              </div>
            </div>
          )}
          {insights.reminders.map((r, i) => (
            <div key={i} className="reminder-row">{r.emoji} {r.msg}</div>
          ))}
        </div>
      )}

      <div className="section">
        <button
          className="btn btn-danger btn-full"
          onClick={() => setShowClearConfirm(true)}
        >
          清空本月记录
        </button>
      </div>

      {showClearConfirm && (
        <div className="modal-overlay" onClick={() => setShowClearConfirm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">确认清空</div>
            <div className="modal-body">确定要清空所有交易记录吗？此操作无法撤销。</div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowClearConfirm(false)}>
                取消
              </button>
              <button className="btn btn-danger" onClick={handleClearMonth}>
                清空
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}
