// 记账页-金额占比提示语
export const AMOUNT_NAGS = [
  { max: 0.15, emoji: '🦉', text: '小钱小钱～该省省该花花' },
  { max: 0.3, emoji: '🤔', text: '还行，今天还有余额' },
  { max: 0.5, emoji: '👀', text: '嗯…你确定需要花这个？' },
  { max: 0.75, emoji: '😅', text: '这一笔顶你半天预算了哦' },
  { max: 1.0, emoji: '🫣', text: '一天预算要见底了，慎重啊！' },
  { max: 1.5, emoji: '🚨', text: '钱包警报！这一笔超标了！' },
  { max: Infinity, emoji: '🛑', text: '冷静！！这一笔够你花两天了！！' },
];

// 关键词→提醒规则
export const KEYWORD_RULES = [
  {
    match: ['奶茶'], group: '奶茶', msg: '🍵 今天第几杯了～', food: true,
    alerts: [
      { min: 3, msg: '🍵 这个月第{N}杯了，你是行走的奶茶罐吗' },
      { min: 7, msg: '🍵 第{N}杯！你已经超越了全国99%的奶茶党' },
    ],
  },
  {
    match: ['咖啡'], group: '咖啡', msg: '☕ 今天的咖啡配额用了哦～', food: true,
    alerts: [{ min: 10, msg: '☕ 第{N}杯了，咖啡因已经免疫了吧' }],
  },
  {
    match: ['外卖'], group: '外卖', msg: '🍱 外卖虽好，别忘了偶尔也自己做做', food: true,
    alerts: [
      { min: 10, msg: '🍱 这个月第{N}次外卖，外卖小哥都认识你了' },
      { min: 20, msg: '🍱 第{N}次！你的胃是铁打的，钱包不是啊' },
    ],
  },
  {
    match: ['夜宵'], group: '夜宵', msg: '🌙 深夜放毒，钱包和胃都不答应', food: true,
  },
  {
    match: ['零食'], group: '零食', msg: '🍿 零食基金要见底了', food: true,
    alerts: [{ min: 10, msg: '🍿 第{N}次买零食了，你是松鼠吗囤这么多' }],
  },
  {
    match: ['聚餐', '饭局'], group: '聚餐', msg: '🍻 社交可以，别每顿都社交啊', food: true,
    alerts: [
      { min: 5, msg: '🍻 这个月第{N}顿局了，社交达人认证' },
      { min: 10, msg: '🍻 第{N}顿…朋友很多，钱包很空' },
    ],
  },
  {
    match: ['火锅'], group: '火锅', msg: '🍲 吃顿好的可以，别天天过年啊', food: true,
    alerts: [{ min: 5, msg: '🍲 第{N}顿火锅了，你的菊花还好吗' }],
  },
  {
    match: ['烧烤'], group: '烧烤', msg: '🍖 烧烤配啤酒，月底两行泪', food: true,
    alerts: [{ min: 5, msg: '🍖 第{N}顿烧烤了，中国烧烤业没你不行' }],
  },
  {
    match: ['海底捞'], group: '海底捞', msg: '🫕 海底捞服务好，就是钱包受不了', food: true,
    alerts: [{ min: 3, msg: '🫕 第{N}次海底捞了，你是在集金海椒吗' }],
  },
  {
    match: ['日料'], group: '日料', msg: '🍣 日料虽好，可不要贪吃哦', food: true,
    alerts: [{ min: 4, msg: '🍣 第{N}顿日料了，是家里有矿吗' }],
  },
  {
    match: ['酒'], group: '酒', msg: '🍺 酒是粮食精，越喝钱包越空心', food: true,
    alerts: [{ min: 5, msg: '🍺 这个月第{N}次买酒了，酒仙转世？' }],
  },
  {
    match: ['衣服', '上衣', '裤子', '裙子'], group: '买衣服', msg: '👗 衣柜说它真的装不下了',
    alerts: [
      { min: 3, msg: '👗 这个月第{N}件衣服了，你是蜈蚣吗' },
      { min: 6, msg: '👗 第{N}件！打开衣柜看看，吊牌剪了吗' },
    ],
  },
  {
    match: ['鞋子'], group: '买鞋', msg: '👟 蜈蚣精转世？',
    alerts: [
      { min: 2, msg: '👟 这个月第{N}双鞋了，你家是鞋店吧' },
      { min: 4, msg: '👟 第{N}双！你穿得过来吗问问自己' },
    ],
  },
  {
    match: ['包包'], group: '买包', msg: '👜 包可以买，但也要给钱包留口气',
    alerts: [{ min: 2, msg: '👜 这个月第{N}个包了，你是蜈蚣包包版' }],
  },
  {
    match: ['化妆品', '护肤品'], group: '美妆', msg: '💄 爱美是天性，理性消费是智慧',
    alerts: [
      { min: 3, msg: '💄 这个月第{N}次了，化妆台还放得下吗' },
      { min: 6, msg: '💄 第{N}次！你的脸很贵，但也没这么贵' },
    ],
  },
  {
    match: ['理发', '剪头'], group: '理发', msg: '💇 换个发型换个心情，值！', minAmt: 100,
    alerts: [{ min: 2, msg: '💇 一个月理两次发？你是光头吧' }],
  },
  {
    match: ['游戏', '充值', '648'], group: '游戏', msg: '🎮 氪金一时爽，还花呗火葬场',
    alerts: [
      { min: 3, msg: '🎮 这个月第{N}次充值了，你是在养服吧' },
      { min: 6, msg: '🎮 第{N}次！氪佬你好，还缺朋友吗' },
    ],
  },
  {
    match: ['抽烟', '烟'], group: '烟', msg: '🚬 少抽一根是一根，为健康也为钱包',
    alerts: [
      { min: 5, msg: '🚬 这个月第{N}次买烟了，要不试试戒了' },
      { min: 10, msg: '🚬 第{N}次…肺活量还好吗兄弟' },
    ],
  },
  {
    match: ['会员', '续费', '订阅'], group: '会员', msg: '🎵 自动续费记得关哦～',
    alerts: [
      { min: 3, msg: '🎵 第{N}个会员了，你同时追几个剧啊' },
      { min: 5, msg: '🎵 第{N}个会员…要不统计一下每月会员费？' },
    ],
  },
  {
    match: ['淘宝', '京东', '拼多多', '快递'], group: '网购', msg: '📦 买都买了，开心最重要',
    alerts: [
      { min: 5, msg: '📦 这个月第{N}个快递了，楼道垃圾桶的纸箱都是你的吧' },
      { min: 10, msg: '📦 第{N}个！一天不收快递浑身难受是吧' },
      { min: 20, msg: '📦 第{N}个…要不考虑开个快递站？' },
    ],
  },
  {
    match: ['打车'], group: '打车', msg: '🚕 起步价不贵，月底一算吓死人', minAmt: 30,
    alerts: [
      { min: 10, msg: '🚕 这个月第{N}次打车了，滴滴应该给你发VIP' },
      { min: 20, msg: '🚕 第{N}次！你是在滴滴上班吗' },
    ],
  },
  {
    match: ['份子钱', '随礼', '红包'], group: '份子钱', msg: '🧧 人情世故逃不掉，但心在滴血',
    alerts: [
      { min: 2, msg: '🧧 这个月第{N}个红色炸弹了，人缘太好也有烦恼' },
      { min: 4, msg: '🧧 第{N}个…你朋友是不是都赶着今年结婚' },
    ],
  },
  {
    match: ['礼物'], group: '礼物', msg: '🎁 送礼是好事，别把自己送穷了',
    alerts: [{ min: 3, msg: '🎁 这个月第{N}份礼物了，圣诞老人是你吧' }],
  },
  {
    match: ['加油'], group: '加油', msg: '⛽ 油价又涨了？加完这箱再说', minAmt: 200,
    alerts: [
      { min: 3, msg: '⛽ 这个月第{N}箱油了，要不看看雅迪？' },
      { min: 5, msg: '⛽ 第{N}箱…你开车上班还是开滴滴啊' },
    ],
  },
  {
    match: ['健身', '私教', '瑜伽'], group: '健身', msg: '💪 为了更好的自己，这笔投资值',
    alerts: [{ min: 3, msg: '💪 第{N}次了，这次能坚持多久？加油！' }],
  },
  {
    match: ['宠物', '猫', '狗', '猫粮', '狗粮'], group: '宠物', msg: '🐱 为了毛孩子，花就花吧',
    alerts: [{ min: 3, msg: '🐱 这个月第{N}次给毛孩子花钱了，你对自己有这么大方吗' }],
  },
];

export function getNag(ratio) {
  for (const n of AMOUNT_NAGS) {
    if (ratio <= n.max) return n;
  }
  return AMOUNT_NAGS[AMOUNT_NAGS.length - 1];
}

export function getKeywordNag(note, amount, freqMap) {
  for (const rule of KEYWORD_RULES) {
    const matched = rule.match.some(kw => note.includes(kw));
    if (!matched) continue;
    if (rule.minAmt && amount < rule.minAmt) continue;
    if (rule.food && amount > 100) return '对自己好可以，但是你这对自己也太好了';

    if (rule.alerts && freqMap) {
      const count = (freqMap[rule.group] || 0) + 1;
      for (const alert of [...rule.alerts].reverse()) {
        if (count >= alert.min) {
          return alert.msg.replace('{N}', count);
        }
      }
    }
    return rule.msg;
  }
  return null;
}
