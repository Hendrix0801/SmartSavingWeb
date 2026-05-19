import { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useAuth } from '../context/AuthContext';

const DAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
const CAT_ICONS = {
  '奶茶': '🍵', '咖啡': '☕', '外卖': '🍱', '夜宵': '🌙', '零食': '🍿',
  '聚餐': '🍻', '火锅': '🍲', '烧烤': '🍖', '海底捞': '🫕', '日料': '🍣',
  '酒': '🍺', '买衣服': '👗', '买鞋': '👟', '买包': '👜', '美妆': '💄',
  '理发': '💇', '网购': '📦', '游戏': '🎮', '会员': '🎵', '打车': '🚕',
  '加油': '⛽', '地铁': '🚇', '份子钱': '🧧', '礼物': '🎁', '健身': '💪',
  '宠物': '🐱', '抽烟': '🚬', '超市': '🛒', '日用品': '🧴', '手机': '📱',
  '房租': '🏠', '话费': '📞', '网费': '🌐',
};
const DEFAULT_ICON = '💸';

function getWeekId(date) {
  const d = new Date(date);
  const start = new Date(d);
  start.setDate(d.getDate() - d.getDay() + 1);
  return start.toISOString().split('T')[0];
}

function formatWeekRange(weekStart) {
  const start = new Date(weekStart);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const fmt = d => `${d.getMonth() + 1}月${d.getDate()}日`;
  return `${fmt(start)} - ${fmt(end)}`;
}

function healthGrade(score) {
  if (score >= 90) return { grade: 'A+', label: '优秀', color: '#34c759', emoji: '🌟' };
  if (score >= 80) return { grade: 'A', label: '良好', color: '#34c759', emoji: '👍' };
  if (score >= 70) return { grade: 'B', label: '不错', color: '#007aff', emoji: '👌' };
  if (score >= 60) return { grade: 'C', label: '及格', color: '#ff9500', emoji: '💪' };
  if (score >= 40) return { grade: 'D', label: '注意', color: '#ff9500', emoji: '⚠️' };
  return { grade: 'F', label: '改善', color: '#ff3b30', emoji: '🔴' };
}

function Highlight({ icon, text, type }) {
  return (
    <div className={`rpt-highlight rpt-${type}`}>
      <span className="rpt-h-icon">{icon}</span>
      <span className="rpt-h-text">{text}</span>
    </div>
  );
}

function SummaryCard({ label, value, color, change }) {
  return (
    <div className="rpt-summary-item">
      <div className="rpt-summary-label">{label}</div>
      <div className={`rpt-summary-value ${color}`}>{value}</div>
      {change && <div className={`rpt-summary-change ${change.dir}`}>{change.text}</div>}
    </div>
  );
}

// ── Weekly Report ──
function WeeklyReport({ transactions, insights }) {
  const report = useMemo(() => {
    if (!transactions.length) return null;

    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() + 1);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    // Current week expenses
    const weekTxns = transactions.filter(t => {
      if (t.type !== 'expense') return false;
      const d = new Date(t.date);
      return d >= weekStart && d <= weekEnd;
    });

    // Previous week expenses
    const prevStart = new Date(weekStart);
    prevStart.setDate(prevStart.getDate() - 7);
    const prevEnd = new Date(weekStart);
    prevEnd.setDate(prevEnd.getDate() - 1);
    const prevTxns = transactions.filter(t => {
      if (t.type !== 'expense') return false;
      const d = new Date(t.date);
      return d >= prevStart && d <= prevEnd;
    });

    const total = weekTxns.reduce((s, t) => s + t.amount, 0);
    const prevTotal = prevTxns.reduce((s, t) => s + t.amount, 0);
    const change = prevTotal > 0 ? ((total - prevTotal) / prevTotal * 100) : 0;
    const dailyAvg = weekTxns.length > 0 ? total / 7 : 0;

    // Daily breakdown
    const dailyMap = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      dailyMap[d.getDay()] = 0;
    }
    for (const t of weekTxns) {
      const d = new Date(t.date).getDay();
      dailyMap[d] = (dailyMap[d] || 0) + t.amount;
    }
    const dailyData = Object.entries(dailyMap)
      .sort((a, b) => a[0] - b[0])
      .map(([day, amount]) => ({ day: parseInt(day), amount, label: DAYS[day] }));

    const maxDaily = Math.max(...dailyData.map(d => d.amount), 1);

    // Category breakdown
    const catMap = {};
    for (const t of weekTxns) {
      const note = t.note || '其他';
      if (!catMap[note]) catMap[note] = { count: 0, total: 0 };
      catMap[note].count++;
      catMap[note].total += t.amount;
    }
    const topCats = Object.entries(catMap)
      .map(([note, data]) => ({ note, ...data }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    // Highlights
    const highlights = [];

    // Spending vs previous week
    if (change < -5) highlights.push({ icon: '✅', text: `本周支出¥${total.toFixed(0)}，比上周少花了¥${(prevTotal - total).toFixed(0)} (${Math.abs(change).toFixed(0)}%)，控制得不错`, type: 'good' });
    else if (change > 5) highlights.push({ icon: '⚠️', text: `本周支出¥${total.toFixed(0)}，比上周多了¥${(total - prevTotal).toFixed(0)} (${change.toFixed(0)}%)`, type: 'warn' });
    else highlights.push({ icon: '👌', text: `本周支出¥${total.toFixed(0)}，和上周基本持平`, type: 'info' });

    // Anomaly day
    const avg = weekTxns.length > 0 ? total / weekTxns.length : 0;
    const anomalyDays = dailyData.filter(d => d.amount > avg * 2 && d.amount > 100);
    if (anomalyDays.length > 0) {
      const bad = anomalyDays.sort((a, b) => b.amount - a.amount)[0];
      const dayTxns = weekTxns.filter(t => new Date(t.date).getDay() === bad.day);
      const topItem = dayTxns.sort((a, b) => b.amount - a.amount)[0];
      highlights.push({ icon: '📌', text: `${bad.label}支出¥${bad.amount.toFixed(0)}，是日均的${(bad.amount / Math.max(dailyAvg, 1)).toFixed(1)}倍，主要是一笔${topItem?.note || ''}¥${topItem?.amount.toFixed(0) || 0}`, type: 'warn' });
    }

    // Top category insight
    if (topCats.length > 0 && topCats[0].total > 100) {
      highlights.push({ icon: '💡', text: `本周${topCats[0].note}花了¥${topCats[0].total.toFixed(0)}，共${topCats[0].count}次`, type: 'info' });
    }

    // Good news: saving more than last week
    if (change < -10) highlights.push({ icon: '🌟', text: `比上周省了¥${(prevTotal - total).toFixed(0)}！继续保持这个节奏，一个月能多存¥${((prevTotal - total) * 4).toFixed(0)}`, type: 'good' });

    return { weekStart: weekStart.toISOString(), total, prevTotal, change, dailyAvg, dailyData, maxDaily, topCats, highlights, count: weekTxns.length };
  }, [transactions]);

  if (!report) return <div className="rpt-empty">暂无本周数据</div>;

  return (
    <div>
      <div className="rpt-header">
        <div className="rpt-title">📊 周报</div>
        <div className="rpt-range">{formatWeekRange(report.weekStart)}</div>
      </div>

      {/* Highlights */}
      <div className="rpt-highlights">
        {report.highlights.slice(0, 3).map((h, i) => (
          <Highlight key={i} {...h} />
        ))}
      </div>

      {/* Summary */}
      <div className="rpt-summary">
        <SummaryCard label="本周支出" value={`¥${report.total.toFixed(0)}`} color="red" change={report.change < 0 ? { dir: 'down', text: `▼ ${Math.abs(report.change).toFixed(0)}%` } : { dir: 'up', text: `▲ ${Math.abs(report.change).toFixed(0)}%` }} />
        <SummaryCard label="日均" value={`¥${report.dailyAvg.toFixed(0)}`} color="blue" />
        <SummaryCard label="笔数" value={`${report.count}`} color="" change={{ dir: '', text: `笔均¥${report.count > 0 ? (report.total / report.count).toFixed(0) : 0}` }} />
      </div>

      {/* Daily trend */}
      <div className="rpt-section-label">每日趋势</div>
      <div className="rpt-chart">
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={report.dailyData} margin={{ top: 4, right: 4, left: -12, bottom: 0 }}>
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#8e8e93' }} axisLine={false} tickLine={false} />
            <YAxis hide domain={[0, 'dataMax']} />
            <Tooltip formatter={v => [`¥${v.toFixed(0)}`, '支出']} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            <Bar dataKey="amount" radius={[3, 3, 0, 0]} maxBarSize={24}>
              {report.dailyData.map((d, i) => (
                <rect key={i} fill={d.amount > report.dailyAvg * 1.5 ? '#ff3b30' : '#007aff'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Categories */}
      <div className="rpt-section-label">品类 TOP5</div>
      {report.topCats.map((c, i) => (
        <div key={i} className="rpt-cat-row">
          <span className="rpt-cat-icon">{CAT_ICONS[c.note] || DEFAULT_ICON}</span>
          <div className="rpt-cat-info">
            <span className="rpt-cat-name">{c.note}</span>
            <span className="rpt-cat-count">{c.count}次</span>
          </div>
          <span className="rpt-cat-amt">¥{c.total.toFixed(0)}</span>
        </div>
      ))}
    </div>
  );
}

// ── Monthly Report ──
function MonthlyReport({ insights, stats, transactions, month }) {
  const report = useMemo(() => {
    if (!insights || !stats) return null;

    const totalIncome = stats.totalIncome || 0;
    const totalExpense = stats.totalExpense || 0;
    const saveRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome * 100) : 0;
    const g = healthGrade(insights.healthScore);

    // Weekly trend from insights
    const weeklyData = (insights.weeklyTrend || []);

    // Categories from insights
    const cats = (insights.categoryFreq || []).slice(0, 5);

    // Anomalies
    const anomalies = (insights.anomalies || []).slice(0, 3);

    return { totalIncome, totalExpense, saveRate, g, weeklyData, cats, anomalies };
  }, [insights, stats]);

  if (!report) return <div className="rpt-empty">暂无本月数据</div>;

  return (
    <div>
      <div className="rpt-header">
        <div className="rpt-title">📈 月报</div>
        <div className="rpt-range">{month || `${new Date().getFullYear()}年${new Date().getMonth() + 1}月`}</div>
      </div>

      {/* Highlights */}
      <div className="rpt-highlights">
        <Highlight icon={report.saveRate > 60 ? '🌟' : '💪'} text={`储蓄率 ${report.saveRate.toFixed(0)}%${report.saveRate > 60 ? '，非常优秀！' : report.saveRate > 30 ? '，还不错继续加油' : '，需要提高'}`} type={report.saveRate > 40 ? 'good' : 'warn'} />
        {report.anomalies.length > 0 && (
          <Highlight icon="📌" text={`${report.anomalies[0].day}日异常消费¥${report.anomalies[0].amount.toFixed(0)}，是日均的${report.anomalies[0].ratio.toFixed(1)}倍`} type="warn" />
        )}
        {report.cats.length > 0 && report.cats[0].total > 2000 && (
          <Highlight icon="💡" text={`${report.cats[0].group}支出¥${report.cats[0].total.toFixed(0)}，占比偏高，建议关注`} type="info" />
        )}
      </div>

      {/* Summary */}
      <div className="rpt-summary">
        <SummaryCard label="收入" value={`¥${report.totalIncome.toFixed(0)}`} color="green" />
        <SummaryCard label="支出" value={`¥${report.totalExpense.toFixed(0)}`} color="red" />
        <SummaryCard label="储蓄率" value={`${report.saveRate.toFixed(0)}%`} color="blue" />
      </div>

      {/* Health Score */}
      <div className="rpt-section-label">健康评分</div>
      <div className="rpt-health-row">
        <div className="rpt-health-circle" style={{ background: `linear-gradient(135deg, ${report.g.color}, ${report.g.color}dd)` }}>
          <span className="rpt-health-num">{insights.healthScore}</span>
          <span className="rpt-health-grade">{report.g.grade}</span>
        </div>
        <div className="rpt-health-info">
          <div className="rpt-health-label">{report.g.emoji} {report.g.label}</div>
          <div className="rpt-health-bar">
            <div className="rpt-health-fill" style={{ width: insights.healthScore + '%' }} />
          </div>
          <div className="rpt-health-tags">
            <span>储蓄率{report.saveRate.toFixed(0)}%</span>
            <span>弹性{(insights.fixedVsFlex?.flexRatio * 100 || 0).toFixed(0)}%</span>
            <span>笔均¥{insights.txnSizeAnalysis?.avg.toFixed(0) || 0}</span>
          </div>
        </div>
      </div>

      {/* Weekly Trend */}
      {report.weeklyData.length > 1 && (
        <>
          <div className="rpt-section-label">每周趋势</div>
          <div className="rpt-chart">
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={report.weeklyData} margin={{ top: 4, right: 4, left: -12, bottom: 0 }}>
                <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#8e8e93' }} axisLine={false} tickLine={false} />
                <YAxis hide domain={[0, 'dataMax']} />
                <Tooltip formatter={v => [`¥${v.toFixed(0)}`, '支出']} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Line type="monotone" dataKey="amount" stroke="#ff9500" strokeWidth={2} dot={{ r: 3, fill: '#ff9500' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {/* Categories */}
      <div className="rpt-section-label">品类排行</div>
      {report.cats.map((c, i) => (
        <div key={i} className="rpt-cat-row">
          <span className="rpt-cat-icon">{CAT_ICONS[c.group] || DEFAULT_ICON}</span>
          <div className="rpt-cat-info">
            <span className="rpt-cat-name">{c.group}</span>
            <span className="rpt-cat-count">{c.count}次 · {(c.total / (stats?.totalExpense || 1) * 100).toFixed(0)}%</span>
          </div>
          <span className="rpt-cat-amt">¥{c.total.toFixed(0)}</span>
        </div>
      ))}

      {/* Budget Execution */}
      {stats && (
        <>
          <div className="rpt-section-label">预算执行</div>
          {insights.monthOverMonth && insights.monthOverMonth.length > 1 && (
            <>
              <div className="rpt-budget-row"><span>对比上月</span>
                <span className="rpt-budget-val" style={{ color: (insights.monthOverMonth[0]?.totalExpense || 0) > (insights.monthOverMonth[1]?.totalExpense || 0) ? '#ff3b30' : '#34c759' }}>
                  {insights.monthOverMonth.length > 1 ? ((insights.monthOverMonth[0]?.totalExpense || 0) - (insights.monthOverMonth[1]?.totalExpense || 0) > 0 ? '▲' : '▼') : ''} ¥{Math.abs((insights.monthOverMonth[0]?.totalExpense || 0) - (insights.monthOverMonth[1]?.totalExpense || 0)).toFixed(0)}
                </span>
              </div>
            </>
          )}
          <div className="rpt-budget-row"><span>日均预算</span><span className="rpt-budget-val">¥{stats.dailyAvailable?.toFixed(2) || 0}</span></div>
        </>
      )}
    </div>
  );
}

// ── Main Reports Page ──
export default function Reports() {
  const { apiFetch } = useAuth();
  const [tab, setTab] = useState('weekly');
  const [insights, setInsights] = useState(null);
  const [stats, setStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch('/transactions/insights'),
      apiFetch('/transactions/stats'),
      apiFetch('/transactions'),
    ]).then(([ins, st, txns]) => {
      setInsights(ins);
      setStats(st);
      setTransactions(txns || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const month = stats?.month
    ? `${stats.month.split('-')[0]}年${parseInt(stats.month.split('-')[1])}月`
    : '';

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="rpt-tabs">
        <button className={`rpt-tab ${tab === 'weekly' ? 'active' : ''}`} onClick={() => setTab('weekly')}>📋 周报</button>
        <button className={`rpt-tab ${tab === 'monthly' ? 'active' : ''}`} onClick={() => setTab('monthly')}>📊 月报</button>
      </div>

      <div className="rpt-content">
        {tab === 'weekly' ? (
          <WeeklyReport transactions={transactions} insights={insights} />
        ) : (
          <MonthlyReport insights={insights} stats={stats} transactions={transactions} month={month} />
        )}
      </div>
    </div>
  );
}
