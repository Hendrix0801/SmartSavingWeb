import { healthGrade, HEALTH_SCALE } from '../utils/health';

export default function HealthScoreCard({ score, savingsRate, flexRatio, avgAmount }) {
  const g = healthGrade(score);

  return (
    <>
      <div className="health-score-row">
        <div className="health-score-circle" style={{ background: `linear-gradient(135deg, ${g.color}, ${g.color}dd)` }}>
          <span className="health-score-num">{score}</span>
          <span className="health-score-label">{g.grade}</span>
        </div>
        <div className="health-score-info">
          <div className="health-grade-label">{g.emoji} {g.label}</div>
          <div className="health-score-bar-track">
            <div className="health-score-bar-fill" style={{ width: score + '%' }} />
          </div>
          <div className="health-score-tags">
            <span>储蓄率{savingsRate}%</span>
            <span>弹性{flexRatio}%</span>
            <span>笔均 ¥{avgAmount}</span>
          </div>
        </div>
      </div>
      <div className="health-scale">
        {HEALTH_SCALE.map(s => (
          <span key={s.grade} className={`health-scale-item ${score >= s.min ? 'active' : ''}`}>
            {s.grade} {s.label}
          </span>
        ))}
      </div>
    </>
  );
}
