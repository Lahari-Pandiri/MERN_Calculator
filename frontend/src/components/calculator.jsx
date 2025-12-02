import React, { useEffect, useState, useRef } from 'react';
import { evaluateExpression, fetchHistory } from '../services/api';

const buttons = [
  '7','8','9','/',
  '4','5','6','*',
  '1','2','3','-',
  '0','.','%','+'
];

export default function Calculator() {
  const [expr, setExpr] = useState('');
  const [result, setResult] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => { loadHistory(); }, []);

  useEffect(() => {
    // focus handler so keyboard works right away
    inputRef.current?.focus();
  }, []);

  async function loadHistory() {
    try {
      const h = await fetchHistory();
      setHistory(h);
    } catch (err) {
      console.error(err);
    }
  }

  function append(val) {
    // prevent extremely long expressions
    if (expr.length > 200) return;
    setExpr(prev => prev + val);
    inputRef.current?.focus();
  }

  function clearAll() { setExpr(''); setResult(''); inputRef.current?.focus(); }
  function backspace() { setExpr(e => e.slice(0, -1)); inputRef.current?.focus(); }

  // handle keyboard keys
  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      calculate();
    } else if (e.key === 'Backspace') {
      // allow normal backspace behavior on focused input
    } else {
      // optionally block weird keys (allow digits, operators, parentheses, ., ^, %)
      const allowed = /[0-9+\-*/().%^ ]/;
      if (e.key.length === 1 && !allowed.test(e.key)) {
        e.preventDefault();
      }
    }
  }

  async function calculate() {
    if (!expr.trim()) return;
    setLoading(true);
    try {
      // small client-side normalization before sending
      // - convert multiple spaces to single
      // - optional: convert '×' or '÷' if you allow those symbols
      const normalized = expr.replace(/\s+/g, ' ').trim();

      const data = await evaluateExpression(normalized);
      setResult(data.result);
      // show result in expression so user can chain operations
      setExpr(data.result.toString());
      await loadHistory();
    } catch (err) {
      console.error(err);
      // read possible message from error response
      const msg = err?.response?.data?.error || 'Error';
      setResult(msg);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  return (
    <div className="container">
      <div className="row">
        <div className="left card">
          {/* hidden input to capture keyboard */}
          <input
            ref={inputRef}
            value={expr}
            onChange={(e) => setExpr(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type expression here or use buttons"
            style={{ width: '100%', padding: 8, marginBottom: 8, fontSize: 16 }}
          />

          <div className="display" aria-live="polite">{expr || '0'}</div>

          <div style={{marginTop:12}} className="grid">
            <button className="btn" onClick={clearAll}>C</button>
            <button className="btn" onClick={backspace}>DEL</button>
            <button className="btn" onClick={() => append('(')}>(</button>
            <button className="btn" onClick={() => append(')')}>)</button>

            {buttons.map(b => (
              <button
                key={b}
                className={['+','-','*','/','%'].includes(b) ? 'btn op' : 'btn'}
                onClick={() => append(b)}
              >
                {b}
              </button>
            ))}

            <button className="btn" onClick={() => append('^')}>^</button>
            <button className="btn" onClick={() => append('sqrt(')}>√</button>
            <button className="btn equal" onClick={calculate} disabled={loading}>
              {loading ? '...' : '='}
            </button>
          </div>

          <div style={{marginTop:12}}>
            <div className="small">Result: {result || '-'}</div>
          </div>
        </div>

        <div className="right card">
          <h3>History</h3>
          <div className="history">
            {history.length === 0 && <div className="small">No history yet.</div>}
            {history.map(h => (
              <div key={h._id} className="history-item">
                <div style={{display:'flex', justifyContent:'space-between'}}>
                  <div className="small">{new Date(h.createdAt).toLocaleString()}</div>
                  <div className="small">{h.result}</div>
                </div>
                <div style={{fontWeight:600}}>{h.expression}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
