// 消费画像分析引擎
// 每次交易写入后同步计算，~25ms

const CATEGORY_RULES = [
  { kw: ['奶茶'], group: '奶茶', food: true },
  { kw: ['咖啡'], group: '咖啡', food: true },
  { kw: ['外卖'], group: '外卖', food: true },
  { kw: ['夜宵'], group: '夜宵', food: true },
  { kw: ['零食'], group: '零食', food: true },
  { kw: ['聚餐','饭局'], group: '聚餐', food: true },
  { kw: ['火锅'], group: '火锅', food: true },
  { kw: ['烧烤'], group: '烧烤', food: true },
  { kw: ['海底捞'], group: '海底捞', food: true },
  { kw: ['日料'], group: '日料', food: true },
  { kw: ['酒'], group: '酒', food: true },
  { kw: ['衣服','上衣','裤子','裙子'], group: '买衣服' },
  { kw: ['鞋子'], group: '买鞋' },
  { kw: ['包包'], group: '买包' },
  { kw: ['化妆品','护肤品'], group: '美妆' },
  { kw: ['理发','剪头'], group: '理发' },
  { kw: ['淘宝','京东','拼多多','快递'], group: '网购' },
  { kw: ['游戏','充值','648'], group: '游戏' },
  { kw: ['抽烟','烟'], group: '烟' },
  { kw: ['会员','续费','订阅'], group: '会员' },
  { kw: ['打车'], group: '打车' },
  { kw: ['加油'], group: '加油' },
  { kw: ['份子钱','随礼','红包'], group: '份子钱' },
  { kw: ['礼物'], group: '礼物' },
  { kw: ['健身','私教','瑜伽'], group: '健身' },
  { kw: ['手机'], group: '手机' },
  { kw: ['宠物','猫','狗','猫粮','狗粮'], group: '宠物' },
];

const FIXED_KW = ['房租','话费','地铁','水电','网费','保险','物业','房贷','车贷'];

function matchCategory(note) {
  const n = (note || '').toLowerCase();
  for (const r of CATEGORY_RULES) {
    if (r.kw.some(k => n.includes(k))) return r.group;
  }
  return null;
}

function isFixed(note) {
  return FIXED_KW.some(k => (note||'').toLowerCase().includes(k));
}

function formatMonth(m) {
  return m.substring(0, 7);
}

export function computeInsights(db, userId) {
  const now = new Date();
  const current = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
  const lastMonth = now.getMonth() === 0
    ? (now.getFullYear() - 1) + '-12'
    : now.getFullYear() + '-' + String(now.getMonth()).padStart(2, '0');

  // Get all months with data
  const allMonths = db.prepare(
    "SELECT DISTINCT strftime('%Y-%m', date) as ym FROM transactions WHERE user_id = ? ORDER BY ym"
  ).all(userId).map(r => r.ym);

  const months = allMonths.slice(-3); // last 3 months

  // Helper: get expense summary for a month
  function monthData(m) {
    const ex = db.prepare(
      "SELECT * FROM transactions WHERE user_id = ? AND strftime('%Y-%m', date) = ? AND type = 'expense'"
    ).all(userId, m);
    const inc = db.prepare(
      "SELECT SUM(amount) as t FROM transactions WHERE user_id = ? AND strftime('%Y-%m', date) = ? AND type = 'income'"
    ).get(userId, m);
    return { ex, totalInc: inc?.t || 0, totalEx: ex.reduce((s, t) => s + t.amount, 0) };
  }

  const currentData = monthData(current);
  const prevMonths = months.filter(m => m !== current).slice(-2).map(m => ({ month: m, ...monthData(m) }));

  // ─── 1. Monthly Overview ───
  const monthlyOverview = {
    month: current,
    totalIncome: currentData.totalInc,
    totalExpense: currentData.totalEx,
    netAmount: currentData.totalInc - currentData.totalEx,
    count: currentData.ex.length,
  };

  // ─── 2/3. Category Frequency & Amount ───
  const categoryMap = {};
  for (const t of currentData.ex) {
    const g = matchCategory(t.note);
    if (g) {
      if (!categoryMap[g]) categoryMap[g] = { count: 0, total: 0 };
      categoryMap[g].count++;
      categoryMap[g].total += t.amount;
    }
  }
  const categoryFreq = Object.entries(categoryMap)
    .map(([group, data]) => ({ group, ...data }))
    .sort((a, b) => b.count - a.count);

  // ─── 4. Weekly Trend ───
  const weekMap = {};
  for (const t of currentData.ex) {
    const d = new Date(t.date);
    const mon = new Date(d);
    mon.setDate(d.getDate() - d.getDay() + 1);
    const label = (mon.getMonth() + 1) + '/' + mon.getDate();
    weekMap[label] = (weekMap[label] || 0) + t.amount;
  }
  const weeklyTrend = Object.entries(weekMap)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([week, amount], i, arr) => {
      const prev = i > 0 ? arr[i-1][1] : null;
      return { week, amount, change: prev ? ((amount - prev) / prev * 100) : null };
    });

  // ─── 5. Weekday Distribution ───
  const weekdayMap = {};
  for (const t of currentData.ex) {
    const d = new Date(t.date).getDay();
    weekdayMap[d] = (weekdayMap[d] || 0) + t.amount;
  }
  const weekdayDistribution = Object.entries(weekdayMap)
    .map(([day, amount]) => ({ day: parseInt(day), amount }))
    .sort((a, b) => a.day - b.day);

  // ─── 6. Hour Distribution ───
  const hourMap = {};
  for (const t of currentData.ex) {
    const h = new Date(t.date).getHours();
    hourMap[h] = (hourMap[h] || 0) + 1;
  }
  const hourDistribution = Object.entries(hourMap)
    .map(([hour, count]) => ({ hour: parseInt(hour), count }))
    .sort((a, b) => a.hour - b.hour);

  // ─── 7. Fixed vs Flex ───
  let fixed = 0, flex = 0, fixedCount = 0, flexCount = 0;
  for (const t of currentData.ex) {
    if (isFixed(t.note)) { fixed += t.amount; fixedCount++; }
    else { flex += t.amount; flexCount++; }
  }
  const fixedVsFlex = {
    fixed: { total: fixed, count: fixedCount },
    flex: { total: flex, count: flexCount },
    flexRatio: currentData.totalEx > 0 ? flex / currentData.totalEx : 0,
    status: flex > fixed ? 'flex_heavy' : 'balanced',
  };

  // ─── 8. Transaction Size ───
  const amounts = currentData.ex.map(t => t.amount);
  const avg = amounts.length > 0 ? amounts.reduce((s, v) => s + v, 0) / amounts.length : 0;
  const txnSizeAnalysis = {
    avg,
    bigCount: amounts.filter(v => v > avg * 2).length,
    midCount: amounts.filter(v => v >= avg * 0.5 && v <= avg * 2).length,
    smallCount: amounts.filter(v => v < avg * 0.5).length,
    smallTotal: amounts.filter(v => v < avg * 0.5).reduce((s, v) => s + v, 0),
  };

  // ─── 9. Anomaly Detection ───
  const dayMap = {};
  for (const t of currentData.ex) {
    const day = parseInt(t.date.substring(8, 10));
    dayMap[day] = (dayMap[day] || 0) + t.amount;
  }
  const dayVals = Object.values(dayMap);
  const dayAvg = dayVals.reduce((s, v) => s + v, 0) / dayVals.length;
  const dayStd = Math.sqrt(dayVals.reduce((s, v) => s + (v - dayAvg)**2, 0) / dayVals.length);
  const anomalies = Object.entries(dayMap)
    .filter(([, v]) => v > dayAvg + dayStd * 2)
    .map(([day, amount]) => ({
      day: parseInt(day),
      amount,
      ratio: dayAvg > 0 ? amount / dayAvg : 1,
      items: currentData.ex.filter(t => parseInt(t.date.substring(8, 10)) === parseInt(day)),
    }))
    .sort((a, b) => b.ratio - a.ratio);

  // ─── 10. Month-over-Month ───
  const mom = [{ month: current, ...currentData }, ...prevMonths].map(d => ({
    month: d.month,
    totalExpense: d.totalEx,
    totalIncome: d.totalInc,
    count: d.ex?.length || 0,
  }));

  // ─── 11. Category Concentration ───
  const catAmtMap = {};
  for (const t of currentData.ex) {
    const g = matchCategory(t.note) || '生活必需';
    catAmtMap[g] = (catAmtMap[g] || 0) + t.amount;
  }
  const sortedCats = Object.entries(catAmtMap)
    .map(([group, amount]) => ({ group, amount, ratio: currentData.totalEx > 0 ? amount / currentData.totalEx : 0 }))
    .sort((a, b) => b.amount - a.amount);
  const top3 = sortedCats.slice(0, 3);
  const top3Ratio = top3.reduce((s, c) => s + c.ratio, 0);

  // ─── 12. Health Score ───
  const saveRate = currentData.totalInc > 0
    ? (currentData.totalInc - currentData.totalEx) / currentData.totalInc
    : 0;
  const savingsScore = Math.min(100, saveRate * 200);
  const flexRatio = currentData.totalEx > 0 ? flex / currentData.totalEx : 0;
  const flexScore = Math.max(0, 100 - flexRatio * 150);
  const avgScoreVal = avg < 200 ? 80 : avg < 500 ? 60 : 40;
  const healthScore = Math.round((savingsScore + flexScore + avgScoreVal) / 3);

  // ─── 14. Time Reminders ───
  const reminders = [];
  const day = now.getDate();
  const month = now.getMonth() + 1;

  // Payday reminder (around 1st)
  if (day <= 3) {
    reminders.push({ type: 'payday', msg: '发工资了! 记得先把存钱目标转走', emoji: '💰' });
  }

  // Shopping festivals
  if (month === 5 && day >= 20) {
    reminders.push({ type: 'shopping', msg: '618快到了，现在省着点到时候再冲', emoji: '🎉' });
  }
  if (month === 10 && day >= 20) {
    reminders.push({ type: 'shopping', msg: '双11要来了，提前列好购物清单别冲动', emoji: '🎉' });
  }
  if (month === 11 && day >= 20) {
    reminders.push({ type: 'shopping', msg: '双12也要来了，双11剁够了吗', emoji: '🎉' });
  }

  // Late night check
  const h = now.getHours();
  if (h >= 23 || h < 6) {
    reminders.push({ type: 'latenight', msg: '这么晚了还在花钱? 早点睡明天再想', emoji: '🌙' });
  }

  return {
    monthlyOverview,
    categoryFreq,
    weeklyTrend,
    weekdayDistribution,
    hourDistribution,
    fixedVsFlex,
    txnSizeAnalysis,
    anomalies,
    monthOverMonth: mom,
    categoryConcentration: { top3, top3Ratio, total: currentData.totalEx },
    healthScore,
    reminders,
  };
}
