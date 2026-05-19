const express = require('express');
const { GoogleGenAI } = require('@google/genai');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');
const router = express.Router();

// Get AI financial insights
router.get('/insights', auth, async (req, res) => {
  try {
    // 1. Fetch user's transactions
    const transactions = await Transaction.find({ user: req.user.userId }).sort({ date: -1 }).limit(50);
    
    if (transactions.length === 0) {
      return res.json({ insight: "You don't have any transactions yet. Add some to get personalized AI insights!" });
    }

    // 2. Format data for the AI
    const summary = transactions.map(t => `${t.date.toISOString().split('T')[0]} - ${t.type.toUpperCase()}: $${t.amount} (${t.category}) - ${t.description || 'No description'}`).join('\n');
    
    const prompt = `
      You are an expert financial advisor. Analyze the following recent transactions for a user and provide concise, actionable financial advice. 
      Focus on spending habits, potential savings, and overall financial health. 
      Format your response with clear headings and bullet points.
      Keep the tone encouraging but professional. Do not use markdown backticks in your response.

      Transactions:
      ${summary}
    `;

    // 3. Query Gemini
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
       return res.json({ insight: "Please set your GEMINI_API_KEY in the backend .env file to enable AI insights." });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });

    res.json({ insight: response.text });
  } catch (error) {
    console.error('AI Insight error:', error);
    res.status(500).json({ message: 'Error generating AI insights', error: error.message });
  }
});

module.exports = router;
