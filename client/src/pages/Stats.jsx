import { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useAuth } from '../context/AuthContext';

function DailyChart({ transactions }) {
  const dailyData = useMemo(() => {
    const map = {};
    for (const t of transactions) {
      const day = String(new Date(t.date).getDate()).padStart(2, '0');
      if (!map[day]) map[day] = { day, income: 0, expense: 0 };
      if (t.type === 'income') map[day].income += t.amount;
      else map[day].expense += t.amount;
    }
    return Object.values(map).sort((a, b) => a.day.localeCompare(b.day));
  }, [transactions]);

  if (dailyData.length === 0) return null;

  return (
    <div className="chart-daily">
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={dailyData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5ea" />
          <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#8e8e93' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#8e8e93' }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ fontSize: 13, borderRadius: 8, border: '0.5px solid #c6c6c8' }}
            formatter={(value, name) => [name === 'expense' ? '支出' : '收入', `¥${value.toFixed(2)}`]}
            labelFormatter={day => `${day}日`}
          />
          <Legend
            formatter={value => <span style={{ color: '#8e8e93', fontSize: 12 }}>{value === 'expense' ? '支出' : '收入'}</span>}
          />
          <Line type="monotone" dataKey="expense" stroke="#ff3b30" strokeWidth={2} dot={{ r: 3, fill: '#ff3b30' }} activeDot={{ r: 5 }} connectNulls />
          <Line type="monotone" dataKey="income" stroke="#34c759" strokeWidth={2} dot={{ r: 3, fill: '#34c759' }} activeDot={{ r: 5 }} connectNulls />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function Stats() {
  const { apiFetch } = useAuth();
  const [months, setMonths] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [stats, setStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInitial();
  }, []);

  useEffect(() => {
    if (selectedMonth) {
      loadMonthData(selectedMonth);
    }
  }, [selectedMonth]);

  async function loadInitial() {
    try {
      const [s, ins] = await Promise.all([
        apiFetch('/transactions/stats'),
        apiFetch('/transactions/insights'),
      ]);
      setStats(s);
      setInsights(ins);
      setTransactions(s.transactions || []);
      if (s.availableMonths && s.availableMonths.length > 0) {
        setMonths(s.availableMonths);
        setSelectedMonth(s.availableMonths[0]);
      } else {
        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        setSelectedMonth(currentMonth);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function loadMonthData(month) {
    try {
      const [s, txns] = await Promise.all([
        apiFetch(`/transactions/stats?month=${month}`),
        apiFetch(`/transactions?month=${month}`),
      ]);
      setStats(s);
      setTransactions(txns);
    } catch (err) {
      console.error(err);
    }
  }

  function formatMonth(ym) {
    const [y, m] = ym.split('-');
    return `${y}年${parseInt(m)}月`;
  }

  function formatDate(dateStr) {
    const d = new Date(dateStr);
    const y = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    const ss = String(d.getSeconds()).padStart(2, '0');
    return `${y}-${mo}-${dd} ${hh}:${mm}:${ss}`;
  }

  if (loading) {
    return <div className="page-loading"><div className="spinner" /></div>;
  }

  const isCurrentMonth = stats?.isCurrentMonth;
  const monthLabel = isCurrentMonth ? '本月概览' : `${formatMonth(selectedMonth)}概览`;

  return (
    <div className="page">
      <div className="section">
        <div className="section-header">选择月份</div>
        <div className="list-item">
          {months.length > 0 ? (
            <select
              className="month-picker"
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
            >
              {months.map(m => (
                <option key={m} value={m}>{formatMonth(m)}</option>
              ))}
            </select>
          ) : (
            <span className="muted">暂无数据</span>
          )}
        </div>
      </div>

      {stats && (
        <div className="section">
          <div className="section-header">{monthLabel}</div>
          <div className="stats-list">
            {isCurrentMonth && (
              <>
                <div className="stat-row">
                  <span>月薪</span>
                  <span className="stat-value orange">¥{stats.monthlySalary.toFixed(2)}</span>
                </div>
                <div className="stat-row">
                  <span>已设定存钱目标</span>
                  <span className="stat-value blue">¥{stats.savingTarget.toFixed(2)}</span>
                </div>
              </>
            )}
            <div className="stat-row">
              <span>{isCurrentMonth ? '本月额外收入' : '收入'}</span>
              <span className="stat-value green">¥{stats.totalIncome.toFixed(2)}</span>
            </div>
            <div className="stat-row">
              <span>{isCurrentMonth ? '本月已花' : '支出'}</span>
              <span className="stat-value red">¥{stats.totalExpense.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Weekly Trend */}
      {insights?.weeklyTrend?.length > 0 && (
        <div className="section">
          <div className="section-header">周环比趋势</div>
          <div className="insight-list">
            {insights.weeklyTrend.map((w, i) => (
              <div key={i} className="insight-row">
                <span className="insight-label">{w.week}周</span>
                <span className="insight-bar-track">
                  <span className="insight-bar" style={{ width: Math.min(100, (w.amount / Math.max(...insights.weeklyTrend.map(x => x.amount)) * 100)) + '%' }} />
                </span>
                <span className="insight-value">¥{w.amount.toFixed(0)}</span>
                {w.change !== null && (
                  <span className={`insight-change ${w.change > 0 ? 'red' : 'green'}`}>
                    {w.change > 0 ? '▲' : '▼'} {Math.abs(w.change).toFixed(0)}%
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Anomaly Detection */}
      {insights?.anomalies?.length > 0 && (
        <div className="section">
          <div className="section-header">异常消费日</div>
          {insights.anomalies.map((a, i) => (
            <div key={i} className="anomaly-card">
              <div className="anomaly-header">
                <span className="anomaly-day">{a.day}日</span>
                <span className="anomaly-amount">¥{a.amount.toFixed(0)}</span>
                <span className="anomaly-ratio">是日均的 {a.ratio.toFixed(1)}倍</span>
              </div>
              <div className="anomaly-items">
                {a.items.slice(0, 3).map(t => (
                  <span key={t.id} className="anomaly-item">{t.note} ¥{t.amount.toFixed(0)}</span>
                ))}
                {a.items.length > 3 && <span className="anomaly-item">还有{a.items.length - 3}笔...</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Category Concentration */}
      {insights?.categoryConcentration?.top3?.length > 0 && (
        <div className="section">
          <div className="section-header">品类集中度</div>
          <div className="insight-list">
            {insights.categoryConcentration.top3.map((c, i) => (
              <div key={i} className="insight-row">
                <span className="insight-label">{c.group}</span>
                <span className="insight-bar-track">
                  <span className="insight-bar bar-blue" style={{ width: (c.ratio * 100) + '%' }} />
                </span>
                <span className="insight-value">¥{c.amount.toFixed(0)}</span>
                <span className="insight-pct">{(c.ratio * 100).toFixed(0)}%</span>
              </div>
            ))}
            <div className="insight-summary">
              TOP3 合计占 {insights.categoryConcentration ? (insights.categoryConcentration.top3Ratio * 100).toFixed(0) : 0}%
            </div>
          </div>
        </div>
      )}

      {/* Transaction Size */}
      {insights?.txnSizeAnalysis && (
        <div className="section">
          <div className="section-header">交易大小分析</div>
          <div className="size-cards">
            <div className="size-card">
              <span className="size-num">{insights.txnSizeAnalysis.bigCount}</span>
              <span className="size-label">大额</span>
            </div>
            <div className="size-card">
              <span className="size-num">{insights.txnSizeAnalysis.midCount}</span>
              <span className="size-label">中等</span>
            </div>
            <div className="size-card">
              <span className="size-num">{insights.txnSizeAnalysis.smallCount}</span>
              <span className="size-label">小额</span>
            </div>
            <div className="size-card">
              <span className="size-num">¥{insights.txnSizeAnalysis.avg.toFixed(0)}</span>
              <span className="size-label">笔均</span>
            </div>
          </div>
          {insights.txnSizeAnalysis.smallCount > 0 && (
            <div className="insight-note">小额合计 ¥{insights.txnSizeAnalysis.smallTotal.toFixed(0)}，看着不多加起来也不少</div>
          )}
        </div>
      )}

      {transactions.length > 0 && (
        <div className="section">
          <div className="section-header">每日收支</div>
          <DailyChart transactions={transactions} />
        </div>
      )}

      <div className="section">
        <div className="section-header">
          {isCurrentMonth ? '最近动帐' : `${formatMonth(selectedMonth)}动帐`}
        </div>
        {transactions.length === 0 ? (
          <div className="empty-state">
            <p>暂无动帐记录</p>
          </div>
        ) : (
          <div className="transaction-list">
            {transactions.map(t => (
              <div key={t.id} className="transaction-item">
                <div className="txn-left">
                  <span className="txn-note">{t.note || (t.type === 'income' ? '收入' : '支出')}</span>
                  <span className="txn-date">{formatDate(t.date)}</span>
                </div>
                <div className="txn-right">
                  <span className={`txn-amount ${t.type === 'income' ? 'income' : 'expense'}`}>
                    {t.type === 'income' ? '+' : '-'}¥{t.amount.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
