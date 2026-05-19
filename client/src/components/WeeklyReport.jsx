import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { DAYS, CAT_ICONS, DEFAULT_ICON } from '../utils/icons';

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

export default function WeeklyReport({ transactions }) {
  const report = useMemo(() => {
    if (!transactions.length) return null;
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() + 1);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const weekTxns = transactions.filter(t =>
      t.type === 'expense' && (d => d >= weekStart && d <= weekEnd)(new Date(t.date)));
    const prevStart = new Date(weekStart);
    prevStart.setDate(prevStart.getDate() - 7);
    const prevEnd = new Date(weekStart);
    prevEnd.setDate(prevEnd.getDate() - 1);
    const prevTxns = transactions.filter(t =>
      t.type === 'expense' && (d => d >= prevStart && d <= prevEnd)(new Date(t.date)));

    const total = weekTxns.reduce((s, t) => s + t.amount, 0);
    const prevTotal = prevTxns.reduce((s, t) => s + t.amount, 0);
    const change = prevTotal > 0 ? ((total - prevTotal) / prevTotal * 100) : 0;
    const dailyAvg = weekTxns.length ? total / 7 : 0;

    const dailyMap = {};
    for (let i = 0; i < 7; i++) {
      dailyMap[new Date(weekStart.getTime() + i * 86400000).getDay()] = 0;
    }
    for (const t of weekTxns) dailyMap[new Date(t.date).getDay()] += t.amount;

    const dailyData = Object.entries(dailyMap).sort((a, b) => a[0] - b[0])
      .map(([day, amount]) => ({ day, amount, label: DAYS[day] }));

    const catMap = {};
    for (const t of weekTxns) {
      const n = t.note || '其他';
      if (!catMap[n]) catMap[n] = { count: 0, total: 0 };
      catMap[n].count++;
      catMap[n].total += t.amount;
    }
    const topCats = Object.entries(catMap).map(([k, v]) => ({ note: k, ...v }))
      .sort((a, b) => b.total - a.total).slice(0, 5);

    const highlights = [];
    if (change < -5) highlights.push({ icon: '✅', text: `本周支出¥${total.toFixed(0)}，比上周少花¥${(prevTotal - total).toFixed(0)} (${Math.abs(change).toFixed(0)}%)`, type: 'good' });
    else if (change > 5) highlights.push({ icon: '⚠️', text: `本周支出¥${total.toFixed(0)}，比上周多花¥${(total - prevTotal).toFixed(0)} (${change.toFixed(0)}%)`, type: 'warn' });
    else highlights.push({ icon: '👌', text: `本周支出¥${total.toFixed(0)}，和上周基本持平`, type: 'info' });

    const anomaly = dailyData.filter(d => d.amount > dailyAvg * 2 && d.amount > 100).sort((a, b) => b.amount - a.amount)[0];
    if (anomaly) {
      const items = weekTxns.filter(t => new Date(t.date).getDay() === anomaly.day).sort((a, b) => b.amount - a.amount);
      highlights.push({ icon: '📌', text: `${anomaly.label}支出¥${anomaly.amount.toFixed(0)}，是日均${(anomaly.amount / Math.max(dailyAvg, 1)).toFixed(1)}倍，主要是${items[0]?.note || ''}¥${items[0]?.amount.toFixed(0) || 0}`, type: 'warn' });
    }
    if (topCats.length && topCats[0].total > 100) {
      highlights.push({ icon: '💡', text: `本周${topCats[0].note}花了¥${topCats[0].total.toFixed(0)}，共${topCats[0].count}次`, type: 'info' });
    }
    if (change < -10) highlights.push({ icon: '🌟', text: `比上周省了¥${(prevTotal - total).toFixed(0)}！按这个节奏一个月能多存¥${((prevTotal - total) * 4).toFixed(0)}`, type: 'good' });

    return { weekStart: weekStart.toISOString(), total, prevTotal, change, dailyAvg, dailyData, topCats, highlights, count: weekTxns.length };
  }, [transactions]);

  if (!report) return <div className="rpt-empty">暂无本周数据</div>;

  const fmt = d => `${d.getMonth() + 1}月${d.getDate()}日`;
  const s = new Date(report.weekStart);
  const e = new Date(s); e.setDate(s.getDate() + 6);

  return (
    <div>
      <div className="rpt-header">
        <div className="rpt-title">📊 周报</div>
        <div className="rpt-range">{fmt(s)} - {fmt(e)}</div>
      </div>
      <div className="rpt-highlights">{report.highlights.slice(0, 3).map((h, i) => <Highlight key={i} {...h} />)}</div>
      <div className="rpt-summary">
        <SummaryCard label="本周支出" value={`¥${report.total.toFixed(0)}`} color="red" change={report.change < 0 ? { dir: 'down', text: `▼ ${Math.abs(report.change).toFixed(0)}%` } : { dir: 'up', text: `▲ ${Math.abs(report.change).toFixed(0)}%` }} />
        <SummaryCard label="日均" value={`¥${report.dailyAvg.toFixed(0)}`} color="blue" />
        <SummaryCard label="笔数" value={`${report.count}`} change={{ dir: '', text: `笔均¥${report.count ? (report.total / report.count).toFixed(0) : 0}` }} />
      </div>
      <div className="rpt-section-label">每日趋势</div>
      <div className="rpt-chart">
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={report.dailyData} margin={{ top: 4, right: 4, left: -12, bottom: 0 }}>
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#8e8e93' }} axisLine={false} tickLine={false} />
            <YAxis hide domain={[0, 'dataMax']} />
            <Tooltip formatter={v => [`¥${v.toFixed(0)}`, '支出']} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            <Bar dataKey="amount" radius={[3, 3, 0, 0]} maxBarSize={24}>
              {report.dailyData.map((d, i) => <rect key={i} fill={d.amount > report.dailyAvg * 1.5 ? '#ff3b30' : '#007aff'} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
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
