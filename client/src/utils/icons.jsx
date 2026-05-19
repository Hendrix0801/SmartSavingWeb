// 品类→图标映射
export const CAT_ICONS = {
  奶茶: '🍵', 咖啡: '☕', 外卖: '🍱', 夜宵: '🌙', 零食: '🍿',
  聚餐: '🍻', 火锅: '🍲', 烧烤: '🍖', 海底捞: '🫕', 日料: '🍣',
  酒: '🍺', 买衣服: '👗', 买鞋: '👟', 买包: '👜', 美妆: '💄',
  理发: '💇', 网购: '📦', 游戏: '🎮', 会员: '🎵', 打车: '🚕',
  加油: '⛽', 地铁: '🚇', 份子钱: '🧧', 礼物: '🎁', 健身: '💪',
  宠物: '🐱', 抽烟: '🚬', 超市: '🛒', 日用品: '🧴', 手机: '📱',
  房租: '🏠', 话费: '📞', 网费: '🌐',
};

export const DEFAULT_ICON = '💸';

// TabBar SVG icons
export const TAB_ICONS = {
  pie: (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83" /><path d="M22 12A10 10 0 0 0 12 2v10z" />
    </svg>
  ),
  plus: (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  ),
  report: (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="16" y2="17" /><polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  down: (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="8 12 12 16 16 12" /><line x1="12" y1="8" x2="12" y2="16" />
    </svg>
  ),
  up: (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="16 12 12 8 8 12" /><line x1="12" y1="16" x2="12" y2="8" />
    </svg>
  ),
  list: (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  ),
};

export const DAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
