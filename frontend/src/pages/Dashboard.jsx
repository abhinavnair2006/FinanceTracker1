import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Plus, ArrowUpRight, ArrowDownRight, Sparkles } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'];

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [aiInsight, setAiInsight] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);
  
  // Form State
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');

  const fetchTransactions = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/transactions', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setTransactions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const getAiInsight = async () => {
    setLoadingAi(true);
    try {
      const res = await axios.get('http://localhost:5000/api/ai/insights', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAiInsight(res.data.insight);
    } catch (err) {
      setAiInsight('Failed to load AI insights. Please check your API key.');
    } finally {
      setLoadingAi(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/transactions', 
        { amount, type, category, description },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      fetchTransactions();
      setAmount(''); setCategory(''); setDescription('');
    } catch (err) {
      console.error(err);
    }
  };

  // Calculations
  const income = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const balance = income - expense;

  // Chart Data
  const expensesByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {});
  
  const chartData = Object.keys(expensesByCategory).map(key => ({
    name: key,
    value: expensesByCategory[key]
  }));

  return (
    <div className="animate-fade-in">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Dashboard</h1>
        <button onClick={getAiInsight} className="btn btn-primary" disabled={loadingAi} style={{ width: 'auto' }}>
          <Sparkles size={18} style={{ marginRight: '0.5rem' }} />
          {loadingAi ? 'Analyzing...' : 'Get AI Insights'}
        </button>
      </header>

      {aiInsight && (
        <div className="glass-panel" style={{ marginBottom: '2rem', borderLeft: '4px solid var(--accent-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', color: 'var(--accent-secondary)' }}>
            <Sparkles size={24} style={{ marginRight: '0.5rem' }} />
            <h3>AI Financial Assistant</h3>
          </div>
          <div style={{ whiteSpace: 'pre-line', color: 'var(--text-secondary)' }}>
            {aiInsight}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Total Balance</p>
          <h2 style={{ fontSize: '2rem' }}>${balance.toFixed(2)}</h2>
        </div>
        <div className="glass-panel" style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ArrowUpRight size={18} color="var(--success)" style={{ marginRight: '0.25rem' }}/> Income
          </p>
          <h2 style={{ fontSize: '2rem', color: 'var(--success)' }}>${income.toFixed(2)}</h2>
        </div>
        <div className="glass-panel" style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <ArrowDownRight size={18} color="var(--danger)" style={{ marginRight: '0.25rem' }}/> Expenses
          </p>
          <h2 style={{ fontSize: '2rem', color: 'var(--danger)' }}>${expense.toFixed(2)}</h2>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Form */}
        <div className="glass-panel">
          <h3>Add Transaction</h3>
          <form onSubmit={handleAddTransaction}>
            <div className="form-group" style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label>Type</label>
                <select className="form-control" value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label>Amount</label>
                <input type="number" className="form-control" value={amount} onChange={(e) => setAmount(e.target.value)} required min="0.01" step="0.01"/>
              </div>
            </div>
            <div className="form-group">
              <label>Category</label>
              <input type="text" className="form-control" value={category} onChange={(e) => setCategory(e.target.value)} required placeholder="e.g. Groceries, Rent, Salary"/>
            </div>
            <div className="form-group">
              <label>Description (Optional)</label>
              <input type="text" className="form-control" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              <Plus size={18} style={{ marginRight: '0.5rem' }}/> Add
            </button>
          </form>
        </div>

        {/* Chart */}
        <div className="glass-panel" style={{ minHeight: '300px', display: 'flex', flexDirection: 'column' }}>
          <h3>Expenses by Category</h3>
          <div style={{ flex: 1, position: 'relative' }}>
            {chartData.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                     {chartData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                     ))}
                   </Pie>
                   <Tooltip contentStyle={{ background: 'rgba(15, 23, 42, 0.9)', border: 'none', borderRadius: '8px' }} />
                 </PieChart>
               </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
                No expenses yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions List */}
      <div className="glass-panel" style={{ marginTop: '2rem' }}>
        <h3>Recent Transactions</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', textAlign: 'left' }}>
                <th style={{ padding: '1rem' }}>Date</th>
                <th style={{ padding: '1rem' }}>Category</th>
                <th style={{ padding: '1rem' }}>Description</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.slice(0, 10).map((t) => (
                <tr key={t._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                  <td style={{ padding: '1rem' }}>{new Date(t.date).toLocaleDateString()}</td>
                  <td style={{ padding: '1rem' }}>{t.category}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{t.description}</td>
                  <td style={{ padding: '1rem', textAlign: 'right', color: t.type === 'income' ? 'var(--success)' : 'var(--danger)' }}>
                    {t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
