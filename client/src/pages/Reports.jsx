import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import WeeklyReport from '../components/WeeklyReport';
import MonthlyReport from '../components/MonthlyReport';

export default function Reports() {
  const { apiFetch } = useAuth();
  const [tab, setTab] = useState('weekly');
  const [insights, setInsights] = useState(null);
  const [stats, setStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch('/transactions/insights'),
      apiFetch('/transactions/stats'),
      apiFetch('/transactions'),
    ]).then(([ins, st, txns]) => {
      setInsights(ins);
      setStats(st);
      setTransactions(txns || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const month = stats?.month
    ? `${stats.month.split('-')[0]}年${parseInt(stats.month.split('-')[1])}月`
    : '';

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="rpt-tabs">
        <button className={`rpt-tab ${tab === 'weekly' ? 'active' : ''}`} onClick={() => setTab('weekly')}>📋 周报</button>
        <button className={`rpt-tab ${tab === 'monthly' ? 'active' : ''}`} onClick={() => setTab('monthly')}>📊 月报</button>
      </div>
      <div className="rpt-content">
        {tab === 'weekly'
          ? <WeeklyReport transactions={transactions} insights={insights} />
          : <MonthlyReport insights={insights} stats={stats} month={month} />}
      </div>
    </div>
  );
}
