import { NavLink } from 'react-router-dom';
import { TAB_ICONS } from '../utils/icons';

const tabs = [
  { to: '/', label: '预算', icon: 'pie' },
  { to: '/add', label: '记账', icon: 'plus' },
  { to: '/reports', label: '报告', icon: 'report' },
  { to: '/expenses', label: '支出', icon: 'down' },
  { to: '/income', label: '收入', icon: 'up' },
  { to: '/stats', label: '统计', icon: 'list' },
];

export default function TabBar() {
  return (
    <nav className="tab-bar">
      {tabs.map(tab => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.to === '/'}
          className={({ isActive }) => `tab-item ${isActive ? 'active' : ''}`}
        >
          <span className="tab-icon">{TAB_ICONS[tab.icon]}</span>
          <span className="tab-label">{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
