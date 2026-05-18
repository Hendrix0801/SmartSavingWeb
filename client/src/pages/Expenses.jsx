import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Expenses() {
  const { apiFetch } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadExpenses(); }, []);

  async function loadExpenses() {
    try {
      const data = await apiFetch('/transactions?type=expense');
      setTransactions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    try {
      await apiFetch(`/transactions/${id}`, { method: 'DELETE' });
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error(err);
    }
  }

  function formatDate(dateStr) {
    const d = new Date(dateStr);
    const y = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    const ss = String(d.getSeconds()).padStart(2, '0');
    return `${y}-${mo}-${dd} ${hh}:${mm}:${ss}`;
  }

  if (loading) {
    return <div className="page-loading"><div className="spinner" /></div>;
  }

  return (
    <div className="page">
      <div className="section">
        <div className="section-header">支出记录</div>
        {transactions.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#c7c7cc" strokeWidth="1.5">
              <rect x="2" y="3" width="20" height="18" rx="2" />
              <line x1="9" y1="12" x2="15" y2="12" />
            </svg>
            <p>暂无支出记录</p>
            <span className="empty-hint">添加支出后，记录会显示在这里</span>
          </div>
        ) : (
          <div className="transaction-list">
            {transactions.map(t => (
              <div key={t.id} className="transaction-item" onClick={() => handleDelete(t.id)}>
                <div className="txn-left">
                  <span className="txn-note">{t.note || '支出'}</span>
                  <span className="txn-date">{formatDate(t.date)}</span>
                </div>
                <div className="txn-right">
                  <span className="txn-amount expense">-¥{t.amount.toFixed(2)}</span>
                  <span className="txn-delete">删除</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
