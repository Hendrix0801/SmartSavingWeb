// 消费健康评分

export function healthGrade(score) {
  if (score >= 90) return { grade: 'A+', label: '优秀', color: '#34c759', emoji: '🌟' };
  if (score >= 80) return { grade: 'A', label: '良好', color: '#34c759', emoji: '👍' };
  if (score >= 70) return { grade: 'B', label: '不错', color: '#007aff', emoji: '👌' };
  if (score >= 60) return { grade: 'C', label: '及格', color: '#ff9500', emoji: '💪' };
  if (score >= 40) return { grade: 'D', label: '注意', color: '#ff9500', emoji: '⚠️' };
  return { grade: 'F', label: '改善', color: '#ff3b30', emoji: '🔴' };
}

export const HEALTH_SCALE = [
  { min: 90, grade: 'A+', label: '优秀' },
  { min: 80, grade: 'A', label: '良好' },
  { min: 70, grade: 'B', label: '不错' },
  { min: 60, grade: 'C', label: '及格' },
  { min: 40, grade: 'D', label: '注意' },
  { min: 0, grade: 'F', label: '改善' },
];
