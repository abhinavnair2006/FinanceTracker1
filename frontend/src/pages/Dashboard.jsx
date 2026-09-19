import { useEffect, useState } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Activity, Bot, CircleDollarSign, Plus, Repeat2, Sparkles, Target, TrendingUp } from 'lucide-react';

const API = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`;
const COLORS = ['#35c48d', '#ffb454', '#ff6b6b', '#6ea8fe', '#c084fc'];
const headers = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
const formatMoney = (amount) => `₹${Number(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function Dashboard({ view = 'overview', privacyMode = false }) {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [aiInsight, setAiInsight] = useState('');
  const [coachQuestion, setCoachQuestion] = useState('');
  const [coachAnswer, setCoachAnswer] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [loadingCoach, setLoadingCoach] = useState(false);
  const [loading, setLoading] = useState(true);
  const [scenario, setScenario] = useState('100');
  const [months, setMonths] = useState('6');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [challengeTitle, setChallengeTitle] = useState('');
  const [challengeTarget, setChallengeTarget] = useState('');
  const [challengeDeadline, setChallengeDeadline] = useState('');
  const [editingChallengeId, setEditingChallengeId] = useState(null);
  const [savedAmount, setSavedAmount] = useState('');

  const fetchData = async () => {
    try {
      const [transactionResponse, summaryResponse, challengeResponse] = await Promise.all([
        axios.get(`${API}/transactions`, headers()),
        axios.get(`${API}/features/summary`, headers()),
        axios.get(`${API}/features/challenges`, headers())
      ]);
      setTransactions(transactionResponse.data);
      setSummary(summaryResponse.data);
      setChallenges(challengeResponse.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // This effect synchronizes the dashboard with the authenticated API.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchData(); }, []);

  const getAiInsight = async () => {
    setLoadingAi(true);
    try {
      const response = await axios.get(`${API}/ai/insights`, headers());
      setAiInsight(response.data.insight);
    } catch {
      setAiInsight('The AI insight service is unavailable right now.');
    } finally {
      setLoadingAi(false);
    }
  };

  const askCoach = async (event) => {
    event.preventDefault();
    if (!coachQuestion.trim()) return;
    setLoadingCoach(true);
    try {
      const response = await axios.post(`${API}/ai/coach`, { question: coachQuestion, summary }, headers());
      setCoachAnswer(response.data.answer);
    } catch {
      setCoachAnswer('The coach could not answer right now. Try again in a moment.');
    } finally {
      setLoadingCoach(false);
    }
  };

  const handleAddTransaction = async (event) => {
    event.preventDefault();
    try {
      await axios.post(`${API}/transactions`, { amount, type, category, description }, headers());
      setAmount(''); setCategory(''); setDescription('');
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const addChallenge = async (event) => {
    event.preventDefault();
    try {
      await axios.post(`${API}/features/challenges`, { title: challengeTitle, target: challengeTarget, deadline: challengeDeadline }, headers());
      setChallengeTitle(''); setChallengeTarget(''); setChallengeDeadline('');
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const beginChallengeUpdate = (challenge) => {
    setEditingChallengeId(challenge._id);
    setSavedAmount(challenge.saved);
  };

  const updateChallenge = async (event, challenge) => {
    event.preventDefault();
    try {
      await axios.patch(`${API}/features/challenges/${challenge._id}`, { saved: savedAmount }, headers());
      setEditingChallengeId(null);
      setSavedAmount('');
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const income = transactions.filter((transaction) => transaction.type === 'income').reduce((total, transaction) => total + transaction.amount, 0);
  const expense = transactions.filter((transaction) => transaction.type === 'expense').reduce((total, transaction) => total + transaction.amount, 0);
  const balance = income - expense;
  const chartData = Object.entries(transactions.filter((transaction) => transaction.type === 'expense').reduce((groups, transaction) => {
    groups[transaction.category] = (groups[transaction.category] || 0) + transaction.amount;
    return groups;
  }, {})).map(([name, value]) => ({ name, value }));
  const projectedSavings = (summary?.savings || balance) + (Number(scenario) * Number(months || 0));
  const money = (amount) => privacyMode ? '₹••••' : formatMoney(amount);

  if (loading) return <div className="loading-state">Loading your financial cockpit...</div>;

  return (
    <div className="dashboard animate-fade-in">
      <header className="dashboard-header">
        <div><span className="eyebrow">YOUR MONEY, AT A GLANCE</span><h1>{view === 'overview' ? 'Financial cockpit' : view === 'insights' ? 'Financial insights' : view === 'tools' ? 'AI financial tools' : view === 'goals' ? 'Savings goals' : 'Transactions'}</h1><p className="muted">{view === 'overview' ? 'A clearer next move starts with knowing your patterns.' : 'Keep each money decision focused and easy to follow.'}</p></div>
        {(view === 'overview' || view === 'insights') && <button onClick={getAiInsight} className="btn btn-primary compact" disabled={loadingAi}><Sparkles size={17} />{loadingAi ? 'Analyzing' : 'Analyze my month'}</button>}
      </header>

      {view === 'overview' && <section className="feature-grid top-features">
        <div className="glass-panel score-panel"><div className="panel-heading"><span><Activity size={19} /> Financial health</span><span className="score-dot" /></div><div className="score-row"><strong>{summary?.score || 0}</strong><div><b>{summary?.scoreLabel}</b><p className="muted">Your score blends savings, spending control, and consistency.</p></div></div><div className="progress-track"><span style={{ width: `${summary?.score || 0}%` }} /></div><small className="muted">{summary?.savingsRate || 0}% savings rate</small></div>
        <div className="glass-panel stat-panel"><div className="panel-heading"><span><TrendingUp size={19} /> This month</span></div><h2>{money(summary?.savings)}</h2><p className="muted">Net savings</p><div className="mini-stats"><span>Income <b className="positive">{money(summary?.income)}</b></span><span>Spent <b className="negative">{money(summary?.expenses)}</b></span></div></div>
        <div className="glass-panel stat-panel accent-panel"><div className="panel-heading"><span><Target size={19} /> Active goals</span></div><h2>{challenges.filter((challenge) => challenge.status === 'active').length}</h2><p className="muted">Keep the streak alive.</p><div className="mini-stats"><span>Completed <b>{challenges.filter((challenge) => challenge.status === 'completed').length}</b></span><span>Score <b>{summary?.score || 0}/100</b></span></div></div>
      </section>}

      {view === 'insights' && aiInsight && (
        <div className="glass-panel insight-panel">
          <div className="insight-header">
            <Sparkles size={21} />
            <b>Monthly readout</b>
          </div>
          <p>{aiInsight.replace(/\*\*/g, '').replace(/\n{3,}/g, '\n\n')}</p>
        </div>
      )}

      {view === 'tools' && <section className="feature-grid two-columns">
        <div className="glass-panel"><div className="panel-heading"><span><Bot size={19} /> AI financial coach</span><span className="live-label">LIVE</span></div><p className="muted coach-copy">Ask a practical question about your spending, goals, or next decision.</p><form onSubmit={askCoach} className="coach-form"><input className="form-control" value={coachQuestion} onChange={(event) => setCoachQuestion(event.target.value)} placeholder="Can I spend ₹20,000 this weekend?" /><button className="icon-button" aria-label="Ask coach" disabled={loadingCoach}><Sparkles size={18} /></button></form>{coachAnswer && <div className="coach-answer">{coachAnswer}</div>}</div>
        <div className="glass-panel"><div className="panel-heading"><span><CircleDollarSign size={19} /> What-if simulator</span></div><p className="muted coach-copy">See how a small monthly change compounds over time.</p><div className="simulator-inputs"><label>Extra monthly saving<input className="form-control" type="number" value={scenario} onChange={(event) => setScenario(event.target.value)} min="0" /></label><label>For months<input className="form-control" type="number" value={months} onChange={(event) => setMonths(event.target.value)} min="1" /></label></div><div className="projection"><span>Projected savings</span><strong>{money(projectedSavings)}</strong><small className="muted">That is {money(Number(scenario) * Number(months || 0))} more than today.</small></div></div>
      </section>}

      {view === 'goals' && <section className="feature-grid two-columns">
        <div className="glass-panel"><div className="panel-heading"><span><Repeat2 size={19} /> Subscription detector</span><span className="muted">Based on repeated transactions</span></div>{summary?.subscriptions?.length ? <div className="subscription-list">{summary.subscriptions.map((subscription) => <div className="subscription-row" key={`${subscription.name}-${subscription.category}`}><div className="subscription-icon"><Repeat2 size={17} /></div><div><b>{subscription.name}</b><small className="muted">{subscription.category} · {subscription.occurrences} charges</small></div><strong>{money(subscription.amount)}<small className="muted"> / charge</small></strong></div>)}</div> : <div className="empty-state">Add repeated transactions with the same description to spot subscriptions automatically.</div>}</div>
        <div className="glass-panel"><div className="panel-heading"><span><Target size={19} /> Savings challenges</span></div><form onSubmit={addChallenge} className="challenge-form"><input className="form-control" value={challengeTitle} onChange={(event) => setChallengeTitle(event.target.value)} placeholder="e.g. Emergency fund" required /><input className="form-control" type="number" value={challengeTarget} onChange={(event) => setChallengeTarget(event.target.value)} placeholder="Target ₹" min="1" required /><input className="form-control" type="date" value={challengeDeadline} onChange={(event) => setChallengeDeadline(event.target.value)} required /><button className="btn btn-secondary" type="submit"><Plus size={16} /> Add goal</button></form><div className="challenge-list">{challenges.map((challenge) => <div className="challenge-row" key={challenge._id}><div className="challenge-copy"><b>{challenge.title}</b><small className="muted">{money(challenge.saved)} of {money(challenge.target)} · due {new Date(challenge.deadline).toLocaleDateString()}</small>{editingChallengeId === challenge._id && <form className="challenge-update-form" onSubmit={(event) => updateChallenge(event, challenge)}><input className="form-control" type="number" value={savedAmount} onChange={(event) => setSavedAmount(event.target.value)} min="0" max={challenge.target} step="0.01" aria-label={`Saved amount for ${challenge.title}`} /><button className="btn btn-secondary" type="submit">Save</button></form>}</div><button className={challenge.status === 'completed' ? 'completed-button' : 'icon-button'} onClick={() => beginChallengeUpdate(challenge)} aria-label="Update challenge">{challenge.status === 'completed' ? '✓' : <Plus size={16} />}</button></div>)}</div></div>
      </section>}

      {view === 'transactions' && <><section className="dashboard-grid"><div className="glass-panel"><h3>Add transaction</h3><form onSubmit={handleAddTransaction}><div className="form-row"><label>Type<select className="form-control" value={type} onChange={(event) => setType(event.target.value)}><option value="expense">Expense</option><option value="income">Income</option></select></label><label>Amount<input type="number" className="form-control" value={amount} onChange={(event) => setAmount(event.target.value)} required min="0.01" step="0.01" /></label></div><label>Category<input type="text" className="form-control" value={category} onChange={(event) => setCategory(event.target.value)} required placeholder="e.g. Groceries, Rent" /></label><label>Description<input type="text" className="form-control" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Netflix, salary, coffee..." /></label><button type="submit" className="btn btn-primary"><Plus size={18} /> Add transaction</button></form></div><div className="glass-panel chart-panel"><h3>Expenses by category</h3><div className="chart-wrap">{chartData.length ? <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={chartData} cx="50%" cy="50%" innerRadius={58} outerRadius={83} paddingAngle={5} dataKey="value">{chartData.map((entry, index) => <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip contentStyle={{ background: '#14231f', border: '1px solid #2d5044', borderRadius: '8px' }} /></PieChart></ResponsiveContainer> : <div className="empty-state">No expenses yet.</div>}</div></div></section><div className="glass-panel transactions-panel"><div className="panel-heading"><span>Recent transactions</span><span className="muted">{transactions.length} total</span></div><div className="table-wrap"><table><thead><tr><th>Date</th><th>Category</th><th>Description</th><th>Amount</th></tr></thead><tbody>{transactions.slice(0, 10).map((transaction) => <tr key={transaction._id}><td>{new Date(transaction.date).toLocaleDateString()}</td><td>{transaction.category}</td><td className="muted">{transaction.description || '—'}</td><td className={transaction.type === 'income' ? 'positive' : 'negative'}>{transaction.type === 'income' ? '+' : '-'}{money(transaction.amount)}</td></tr>)}{!transactions.length && <tr><td colSpan="4" className="empty-state">No transactions found.</td></tr>}</tbody></table></div></div></>}
    </div>
  );
}
