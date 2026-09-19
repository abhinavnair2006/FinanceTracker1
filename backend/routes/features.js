const express = require('express');
const Transaction = require('../models/Transaction');
const Challenge = require('../models/Challenge');
const auth = require('../middleware/auth');

const router = express.Router();

const getSummary = (transactions) => {
  const income = transactions.filter((transaction) => transaction.type === 'income')
    .reduce((total, transaction) => total + transaction.amount, 0);
  const expenses = transactions.filter((transaction) => transaction.type === 'expense');
  const expenseTotal = expenses.reduce((total, transaction) => total + transaction.amount, 0);
  const savingsRate = income > 0 ? Math.max(0, ((income - expenseTotal) / income) * 100) : 0;
  const expenseRatio = income > 0 ? Math.min(100, (expenseTotal / income) * 100) : 100;
  const recentTransactions = transactions.filter((transaction) => (
    Date.now() - new Date(transaction.date).getTime() <= 30 * 24 * 60 * 60 * 1000
  ));
  const activityScore = Math.min(20, recentTransactions.length * 2);
  const score = Math.round(Math.min(100, (savingsRate * 0.6) + ((100 - expenseRatio) * 0.2) + activityScore));

  const grouped = expenses.reduce((groups, transaction) => {
    const key = `${transaction.category.toLowerCase().trim()}::${(transaction.description || transaction.category).toLowerCase().trim()}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(transaction);
    return groups;
  }, {});
  const subscriptions = Object.values(grouped)
    .filter((items) => items.length >= 2)
    .map((items) => ({
      name: items[0].description || items[0].category,
      category: items[0].category,
      amount: Number((items.reduce((total, item) => total + item.amount, 0) / items.length).toFixed(2)),
      occurrences: items.length,
      lastCharged: items.sort((a, b) => new Date(b.date) - new Date(a.date))[0].date
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 8);

  return {
    income: Number(income.toFixed(2)),
    expenses: Number(expenseTotal.toFixed(2)),
    savings: Number((income - expenseTotal).toFixed(2)),
    savingsRate: Number(savingsRate.toFixed(1)),
    score,
    scoreLabel: score >= 80 ? 'Excellent' : score >= 60 ? 'Building momentum' : score >= 40 ? 'Room to improve' : 'Fresh start',
    subscriptions
  };
};

router.get('/summary', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.userId }).sort({ date: -1 });
    res.json(getSummary(transactions));
  } catch (error) {
    res.status(500).json({ message: 'Unable to calculate financial summary' });
  }
});

router.get('/challenges', auth, async (req, res) => {
  try {
    const challenges = await Challenge.find({ user: req.user.userId }).sort({ createdAt: -1 });
    res.json(challenges);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load challenges' });
  }
});

router.post('/challenges', auth, async (req, res) => {
  try {
    const { title, target, deadline } = req.body;
    const challenge = await Challenge.create({ user: req.user.userId, title, target, deadline });
    res.status(201).json(challenge);
  } catch (error) {
    res.status(400).json({ message: 'Please provide a title, target, and deadline' });
  }
});

router.patch('/challenges/:id', auth, async (req, res) => {
  try {
    const challenge = await Challenge.findOne({ _id: req.params.id, user: req.user.userId });
    if (!challenge) return res.status(404).json({ message: 'Challenge not found' });
    const saved = Math.max(0, Number(req.body.saved));
    challenge.saved = saved;
    challenge.status = saved >= challenge.target ? 'completed' : 'active';
    await challenge.save();
    res.json(challenge);
  } catch (error) {
    res.status(400).json({ message: 'Unable to update challenge' });
  }
});

module.exports = router;
