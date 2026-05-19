import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { healthGrade } from '../utils/health';
import { CAT_ICONS, DEFAULT_ICON } from '../utils/icons';

function Highlight({ icon, text, type }) {
  return (
    <div className={`rpt-highlight rpt-${type}`}>
      <span className="rpt-h-icon">{icon}</span>
      <span className="rpt-h-text">{text}</span>
    </div>
  );
}

function SummaryCard({ label, value, color }) {
  return (
    <div className="rpt-summary-item">
      <div className="rpt-summary-label">{label}</div>
      <div className={`rpt-summary-value ${color}`}>{value}</div>
    </div>
  );
}

export default function MonthlyReport({ insights, stats, month }) {
  if (!insights || !stats) return <div className="rpt-empty">暂无本月数据</div>;

  const totalIncome = stats.totalIncome || 0;
  const totalExpense = stats.totalExpense || 0;
  const saveRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome * 100) : 0;
  const g = healthGrade(insights.healthScore);
  const weeklyData = insights.weeklyTrend || [];
  const cats = (insights.categoryFreq || []).slice(0, 5);
  const anomalies = (insights.anomalies || []).slice(0, 3);

  return (
    <div>
      <div className="rpt-header">
        <div className="rpt-title">📈 月报</div>
        <div className="rpt-range">{month || `${new Date().getFullYear()}年${new Date().getMonth() + 1}月`}</div>
      </div>

      <div className="rpt-highlights">
        <Highlight icon={saveRate > 60 ? '🌟' : '💪'}
          text={`储蓄率 ${saveRate.toFixed(0)}%${saveRate > 60 ? '，非常优秀！' : saveRate > 30 ? '，还不错继续加油' : '，需要提高'}`}
          type={saveRate > 40 ? 'good' : 'warn'} />
        {anomalies.length > 0 && (
          <Highlight icon="📌" text={`${anomalies[0].day}日异常消费¥${anomalies[0].amount.toFixed(0)}，是日均的${anomalies[0].ratio.toFixed(1)}倍`} type="warn" />
        )}
        {cats.length > 0 && cats[0].total > 2000 && (
          <Highlight icon="💡" text={`${cats[0].group}支出¥${cats[0].total.toFixed(0)}，占比偏高`} type="info" />
        )}
      </div>

      <div className="rpt-summary">
        <SummaryCard label="收入" value={`¥${totalIncome.toFixed(0)}`} color="green" />
        <SummaryCard label="支出" value={`¥${totalExpense.toFixed(0)}`} color="red" />
        <SummaryCard label="储蓄率" value={`${saveRate.toFixed(0)}%`} color="blue" />
      </div>

      <div className="rpt-section-label">健康评分</div>
      <div className="rpt-health-row">
        <div className="rpt-health-circle" style={{ background: `linear-gradient(135deg, ${g.color}, ${g.color}dd)` }}>
          <span className="rpt-health-num">{insights.healthScore}</span>
          <span className="rpt-health-grade">{g.grade}</span>
        </div>
        <div className="rpt-health-info">
          <div className="rpt-health-label">{g.emoji} {g.label}</div>
          <div className="rpt-health-bar"><div className="rpt-health-fill" style={{ width: insights.healthScore + '%' }} /></div>
          <div className="rpt-health-tags">
            <span>储蓄率{saveRate.toFixed(0)}%</span>
            <span>弹性{(insights.fixedVsFlex?.flexRatio * 100 || 0).toFixed(0)}%</span>
            <span>笔均¥{insights.txnSizeAnalysis?.avg.toFixed(0) || 0}</span>
          </div>
        </div>
      </div>

      {weeklyData.length > 1 && (
        <>
          <div className="rpt-section-label">每周趋势</div>
          <div className="rpt-chart">
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={weeklyData} margin={{ top: 4, right: 4, left: -12, bottom: 0 }}>
                <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#8e8e93' }} axisLine={false} tickLine={false} />
                <YAxis hide domain={[0, 'dataMax']} />
                <Tooltip formatter={v => [`¥${v.toFixed(0)}`, '支出']} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Line type="monotone" dataKey="amount" stroke="#ff9500" strokeWidth={2} dot={{ r: 3, fill: '#ff9500' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      <div className="rpt-section-label">品类排行</div>
      {cats.map((c, i) => (
        <div key={i} className="rpt-cat-row">
          <span className="rpt-cat-icon">{CAT_ICONS[c.group] || DEFAULT_ICON}</span>
          <div className="rpt-cat-info">
            <span className="rpt-cat-name">{c.group}</span>
            <span className="rpt-cat-count">{c.count}次 · {stats.totalExpense > 0 ? (c.total / stats.totalExpense * 100).toFixed(0) : 0}%</span>
          </div>
          <span className="rpt-cat-amt">¥{c.total.toFixed(0)}</span>
        </div>
      ))}

      <div className="rpt-section-label">预算执行</div>
      {insights.monthOverMonth && insights.monthOverMonth.length > 1 && (
        <div className="rpt-budget-row">
          <span>对比上月</span>
          <span className="rpt-budget-val" style={{ color: (insights.monthOverMonth[0]?.totalExpense || 0) > (insights.monthOverMonth[1]?.totalExpense || 0) ? '#ff3b30' : '#34c759' }}>
            {((insights.monthOverMonth[0]?.totalExpense || 0) - (insights.monthOverMonth[1]?.totalExpense || 0) > 0 ? '▲' : '▼')} ¥{Math.abs((insights.monthOverMonth[0]?.totalExpense || 0) - (insights.monthOverMonth[1]?.totalExpense || 0)).toFixed(0)}
          </span>
        </div>
      )}
      <div className="rpt-budget-row"><span>日均预算</span><span className="rpt-budget-val">¥{stats.dailyAvailable?.toFixed(2) || 0}</span></div>
    </div>
  );
}
