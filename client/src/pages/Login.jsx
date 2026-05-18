import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!username || !password) {
      setError('请输入用户名和密码');
      return;
    }
    if (isRegister && password.length < 4) {
      setError('密码至少4位');
      return;
    }
    setLoading(true);
    try {
      if (isRegister) {
        await register(username, password);
      } else {
        await login(username, password);
      }
    } catch (err) {
      setError(err.message || '操作失败');
    } finally {
      setLoading(false);
    }
  }

  function switchMode() {
    setIsRegister(!isRegister);
    setError('');
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-logo">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#007aff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <line x1="2" y1="10" x2="22" y2="10" />
            <line x1="7" y1="15" x2="10" y2="15" />
          </svg>
        </div>
        <h1 className="login-title">SmartSaving</h1>
        <p className="login-subtitle">智能储蓄管理</p>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="form-error">{error}</div>}
          <div className="input-group">
            <input
              type="text"
              placeholder="用户名"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoFocus
              autoComplete="username"
              disabled={loading}
            />
          </div>
          <div className="input-group">
            <input
              type="password"
              placeholder="密码"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              disabled={loading}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? '处理中...' : (isRegister ? '注册' : '登录')}
          </button>
        </form>

        <div className="login-switch">
          <span>{isRegister ? '已有账号？' : '没有账号？'}</span>
          <button className="switch-btn" onClick={switchMode}>
            {isRegister ? '去登录' : '注册'}
          </button>
        </div>
      </div>
    </div>
  );
}
