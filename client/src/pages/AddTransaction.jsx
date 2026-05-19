import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { getNag, getKeywordNag, KEYWORD_RULES } from '../utils/nags';

export default function AddTransaction() {
  const { apiFetch } = useAuth();
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [dailyBudget, setDailyBudget] = useState(null);
  const [todayCount, setTodayCount] = useState(0);
  const [freqMap, setFreqMap] = useState(null);

  useEffect(() => {
    apiFetch('/transactions/stats').then(s => {
      setDailyBudget(s.dailyAvailable || 0);
    }).catch(() => {});

    const today = new Date();
    const ym = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    apiFetch(`/transactions?month=${ym}`).then(txns => {
      const todayStr = today.toISOString().split('T')[0];
      const count = txns.filter(t => t.date.startsWith(todayStr) && t.type === 'expense').length;
      setTodayCount(count);

      const map = {};
      for (const t of txns) {
        if (t.type !== 'expense') continue;
        const n = (t.note || '').toLowerCase();
        for (const rule of KEYWORD_RULES) {
          if (rule.match.some(kw => n.includes(kw))) {
            map[rule.group] = (map[rule.group] || 0) + 1;
          }
        }
      }
      setFreqMap(map);
    }).catch(() => {});
  }, []);

  const isValid = amount && !isNaN(Number(amount)) && Number(amount) > 0;
  const amtNum = Number(amount) || 0;

  const ratio = useMemo(() => {
    if (type !== 'expense' || !dailyBudget || dailyBudget <= 0 || !amtNum) return 0;
    return amtNum / dailyBudget;
  }, [amtNum, dailyBudget, type]);

  const nag = useMemo(() => {
    if (ratio <= 0) return null;
    return getNag(ratio);
  }, [ratio]);

  const keywordNag = useMemo(() => {
    if (type !== 'expense' || !note.trim() || !amtNum) return null;
    return getKeywordNag(note, amtNum, freqMap);
  }, [note, type, amtNum, freqMap]);

  const timeNag = useMemo(() => {
    if (type !== 'expense') return null;
    const h = new Date().getHours();
    if (h >= 23 || h < 6) return '🌙 深夜花钱容易冲动哦～先睡一觉明天再说？';
    return null;
  }, [type]);

  const countNag = useMemo(() => {
    if (type !== 'expense') return null;
    if (todayCount >= 5) return `🛑 今天第${todayCount + 1}笔了！钱包在哭`;
    if (todayCount >= 3) return `👋 今天第${todayCount + 1}笔了哦，悠着点～`;
    return null;
  }, [type, todayCount]);

  const activeNag = keywordNag || timeNag || countNag || nag?.text || null;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!isValid) return;
    setLoading(true);
    try {
      await apiFetch('/transactions', {
        method: 'POST',
        body: { amount: amtNum, note: note.trim(), type, date: new Date().toISOString() },
      });
      setAmount('');
      setNote('');
      setSuccess(true);
      setTodayCount(c => c + 1);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <div className="section">
        <div className="section-header">新增动帐</div>
        <div className="type-toggle">
          <button className={`type-btn income ${type === 'income' ? 'active' : ''}`} onClick={() => setType('income')}>收入</button>
          <button className={`type-btn expense ${type === 'expense' ? 'active' : ''}`} onClick={() => setType('expense')}>支出</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="list-item">
            <span className="list-item-label">金额</span>
            <div className="input-wrapper">
              <span className="input-prefix">¥</span>
              <input type="number" step="0.01" className="list-item-input" placeholder="0.00" value={amount}
                onChange={e => setAmount(e.target.value)} autoFocus />
            </div>
          </div>
          {type === 'expense' && amtNum > 0 && dailyBudget > 0 && (
            <div className="add-nag">
              <div className="nag-bar-track">
                <div className={`nag-bar-fill ${ratio > 1 ? 'over' : ratio > 0.5 ? 'warn' : 'ok'}`}
                  style={{ width: `${Math.min(100, ratio * 100)}%` }} />
              </div>
              <div className="nag-info">
                <span className="nag-pct">占日均预算 {Math.round(ratio * 100)}%</span>
                <span className="nag-remain">还剩 ¥{Math.max(0, (dailyBudget - amtNum)).toFixed(2)}</span>
              </div>
              {activeNag && <div className="nag-text">{activeNag}</div>}
            </div>
          )}
          <div className="list-item">
            <span className="list-item-label">备注</span>
            <input type="text" className="list-item-input" placeholder="备注（可选）" value={note}
              onChange={e => setNote(e.target.value)} maxLength={50} />
          </div>
          <button type="submit"
            className={`btn btn-full add-btn ${type === 'income' ? 'btn-green' : 'btn-red'}`}
            disabled={!isValid || loading}>
            {loading ? '添加中...' : type === 'income' ? '添加收入' : '添加支出'}
          </button>
        </form>
        {success && <div className="success-toast">✅ 添加成功</div>}
      </div>
    </div>
  );
}
