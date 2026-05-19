import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import TabBar from './TabBar';
import pkg from '../../package.json';

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="header-left">
          <span className="header-title">SmartSaving</span>
          <span className="header-version">v{pkg.version}</span>
        </div>
        <div className="header-right">
          <span className="header-user">{user?.displayName || user?.username}</span>
          <button onClick={logout} className="logout-btn">退出</button>
        </div>
      </header>
      <main className="app-content">
        <Outlet />
      </main>
      <TabBar />
    </div>
  );
}
