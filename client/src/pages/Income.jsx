import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Income() {
  const { apiFetch } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadIncome(); }, []);

  async function loadIncome() {
    try {
      const data = await apiFetch('/transactions?type=income');
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
        <div className="section-header">收入记录</div>
        {transactions.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#c7c7cc" strokeWidth="1.5">
              <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            <p>暂无收入记录</p>
            <span className="empty-hint">添加收入后，记录会显示在这里</span>
          </div>
        ) : (
          <div className="transaction-list">
            {transactions.map(t => (
              <div key={t.id} className="transaction-item" onClick={() => handleDelete(t.id)}>
                <div className="txn-left">
                  <span className="txn-note">{t.note || '收入'}</span>
                  <span className="txn-date">{formatDate(t.date)}</span>
                </div>
                <div className="txn-right">
                  <span className="txn-amount income">+¥{t.amount.toFixed(2)}</span>
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
