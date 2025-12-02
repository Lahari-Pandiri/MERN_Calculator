const express = require('express');
const router = express.Router();
const math = require('mathjs');
const Calculation = require('../models/Calculation');

// Evaluate expression safely using mathjs
router.post('/calc', async (req, res) => {
  try {
    const { expression } = req.body;
    if (typeof expression !== 'string' || expression.trim() === '') {
      return res.status(400).json({ error: 'expression required' });
    }

    // Use math.evaluate - it's robust; we restrict by parsing first
    // parse then evaluate to catch invalid tokens
    const node = math.parse(expression);
    const result = node.evaluate(); // may throw on invalid expressions

    const calc = new Calculation({
      expression,
      result: result.toString()
    });
    await calc.save();

    res.json({ expression, result: result.toString(), id: calc._id });
  } catch (err) {
    console.error('Calc error:', err.message || err);
    res.status(400).json({ error: 'Invalid expression or evaluation error' });
  }
});

router.get('/history', async (req, res) => {
  try {
    const items = await Calculation.find().sort({ createdAt: -1 }).limit(50);
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
