import React, { useState, useEffect, useMemo, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, NavLink, Link, useNavigate, useParams } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, PieChart, Sun, Moon, ArrowDownLeft, ArrowUpRight, Tag, Wallet, Trash2, Edit2, ArrowLeft, Eye, EyeOff, ChevronDown } from 'lucide-react';

const ThemeContext = createContext();

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('budgetly_theme') || 'light');

  useEffect(() => {
    localStorage.setItem('budgetly_theme', theme);
    document.body.className = theme;
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

const useTheme = () => useContext(ThemeContext);

function useTransactions() {
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('budgetly_transactions');
    return saved ? JSON.parse(saved) : [
      { id: '1', title: 'Internet Bill', amount: 999, type: 'expense', category: 'Bills', date: '2026-09-03' },
      { id: '2', title: 'Groceries', amount: 1250, type: 'expense', category: 'Food', date: '2026-09-02' },
      { id: '3', title: 'Allowance', amount: 5000, type: 'income', category: 'Allowance', date: '2026-09-01' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('budgetly_transactions', JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = (tx) => setTransactions(prev => [tx, ...prev]);
  const updateTransaction = (updated) => setTransactions(prev => prev.map(t => t.id === updated.id ? updated : t));
  const deleteTransaction = (id) => setTransactions(prev => prev.filter(t => t.id !== id));

  return { transactions, addTransaction, updateTransaction, deleteTransaction };
}

function Sidebar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <aside className="sidebar">
      <Link to="/" className="brand-link">
        <div className="brand-logo">B</div>
        <div>
          <div className="brand-title">Budgetly</div>
          <div className="brand-subtitle">Personal Tracker</div>
        </div>
      </Link>
      
      <div className="nav-menu">
        <NavLink to="/" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <LayoutDashboard size={18} /> Dashboard
        </NavLink>
        <NavLink to="/add" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <PlusCircle size={18} /> Add Transaction
        </NavLink>
        <NavLink to="/summary" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <PieChart size={18} /> Summary
        </NavLink>
      </div>

      <div style={{ marginTop: 'auto' }}>
        <button onClick={toggleTheme} className="nav-item">
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
        </button>
      </div>
    </aside>
  );
}

function Dashboard({ transactions }) {
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [hideBalance, setHideBalance] = useState(false);
  const [hideIncome, setHideIncome] = useState(false);
  const [hideExpense, setHideExpense] = useState(false);

  const { filteredTransactions, income, expense, balance, incomeCount, expenseCount } = useMemo(() => {
    let inc = 0, exp = 0, incCnt = 0, expCnt = 0;
    transactions.forEach(t => {
      const amt = Number(t.amount);
      if (t.type === 'income') {
        inc += amt;
        incCnt++;
      } else {
        exp += amt;
        expCnt++;
      }
    });

    const filtered = transactions.filter(t => {
      const matchesType = typeFilter === 'all' || t.type === typeFilter;
      const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
      return matchesType && matchesCategory;
    });

    return {
      filteredTransactions: filtered,
      income: inc,
      expense: exp,
      balance: inc - exp,
      incomeCount: incCnt,
      expenseCount: expCnt
    };
  }, [transactions, typeFilter, categoryFilter]);

  const categories = ['all', 'Bills', 'Food', 'Allowance', 'Entertainment', 'Transport', 'Other'];

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="overview-label">Overview</div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Track where your money comes from and where it goes.</p>
        </div>
        <Link to="/add" className="btn-primary"><PlusCircle size={18} /> Add transaction</Link>
      </div>

      <div className="stats-grid">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h4 style={{ margin: 0 }}>Current balance</h4>
            <button 
              onClick={() => setHideBalance(!hideBalance)} 
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', display: 'flex', alignItems: 'center', padding: '0' }}
              title={hideBalance ? "Show balance" : "Hide balance"}
            >
              {hideBalance ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
          </div>
          <p className="amount-large">
            {hideBalance ? '••••••••' : `₱${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          </p>
          <p className="card-footer-text">Total income – total expenses</p>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h4 style={{ margin: 0 }}>Total income</h4>
            <button 
              onClick={() => setHideIncome(!hideIncome)} 
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', display: 'flex', alignItems: 'center', padding: '0' }}
              title={hideIncome ? "Show income" : "Hide income"}
            >
              {hideIncome ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
          </div>
          <p className="amount-large text-income">
            {hideIncome ? '+••••••••' : `+₱${income.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          </p>
          <p className="card-footer-text">{incomeCount} income {incomeCount === 1 ? 'entry' : 'entries'}</p>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h4 style={{ margin: 0 }}>Total expenses</h4>
            <button 
              onClick={() => setHideExpense(!hideExpense)} 
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', display: 'flex', alignItems: 'center', padding: '0' }}
              title={hideExpense ? "Show expenses" : "Hide expenses"}
            >
              {hideExpense ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
          </div>
          <p className="amount-large text-expense">
            {hideExpense ? '-••••••••' : `-₱${expense.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          </p>
          <p className="card-footer-text">{expenseCount} expense {expenseCount === 1 ? 'entry' : 'entries'}</p>
        </div>
      </div>

      <div className="card">
        <div className="section-header">
          <div className="section-title-group">
            <h3>Transactions</h3>
            <p className="card-footer-text">{filteredTransactions.length} shown</p>
          </div>
          <div className="filter-bar">
            <div style={{ position: 'relative' }}>
              <select 
                className="filter-select" 
                style={{ appearance: 'none', WebkitAppearance: 'none', paddingRight: '2.5rem' }} 
                value={typeFilter} 
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">All types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
              <ChevronDown size={16} style={{ position: 'absolute', right: '0.8rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--muted)' }} />
            </div>

            <div style={{ position: 'relative' }}>
              <select 
                className="filter-select" 
                style={{ appearance: 'none', WebkitAppearance: 'none', paddingRight: '2.5rem' }} 
                value={categoryFilter} 
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All categories</option>
                {categories.filter(c => c !== 'all').map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown size={16} style={{ position: 'absolute', right: '0.8rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--muted)' }} />
            </div>
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <p className="card-footer-text" style={{ textAlign: 'center', padding: '2.5rem 0' }}>No transactions found.</p>
        ) : (
          filteredTransactions.map(t => (
            <Link to={`/transaction/${t.id}`} key={t.id} className="tx-item">
              <div className="tx-left">
                <div className={`tx-icon ${t.type}`}>
                  {t.type === 'income' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                </div>
                <div className="tx-info">
                  <strong>{t.title}</strong>
                  <span className="tx-meta"><Tag size={12} /> {t.category} • {t.date}</span>
                </div>
              </div>
              <div className={`tx-amount ${t.type === 'income' ? 'text-income' : 'text-expense'}`}>
                {t.type === 'income' ? '+' : '-'}₱{Number(t.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

function AddTransaction({ onAdd }) {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('Food');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !amount || Number(amount) <= 0) {
      setError('Please provide a valid title and a positive amount.');
      return;
    }

    onAdd({
      id: Date.now().toString(),
      title: title.trim(),
      amount: parseFloat(amount),
      type,
      category,
      date: new Date().toISOString().split('T')[0]
    });

    navigate('/');
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Add Transaction</h1>
          <p className="page-subtitle">Log a new income or expense entry.</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: '600px' }}>
        {error && <p className="text-expense" style={{ marginBottom: '1rem', fontWeight: 600 }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input type="text" className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Grocery shopping" required />
          </div>
          <div className="form-group">
            <label>Amount (₱)</label>
            <input 
              type="number" 
              step="0.01" 
              className="form-input" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)} 
              onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()}
              placeholder="0.00" 
              required 
            />
          </div>
          <div className="form-group">
            <label>Type</label>
            <div style={{ position: 'relative' }}>
              <select 
                className="form-select" 
                style={{ appearance: 'none', WebkitAppearance: 'none', paddingRight: '2.5rem', width: '100%' }} 
                value={type} 
                onChange={(e) => setType(e.target.value)}
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
              <ChevronDown size={16} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--muted)' }} />
            </div>
          </div>
          <div className="form-group">
            <label>Category</label>
            <div style={{ position: 'relative' }}>
              <select 
                className="form-select" 
                style={{ appearance: 'none', WebkitAppearance: 'none', paddingRight: '2.5rem', width: '100%' }} 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Food">Food</option>
                <option value="Bills">Bills</option>
                <option value="Allowance">Allowance</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Transport">Transport</option>
                <option value="Other">Other</option>
              </select>
              <ChevronDown size={16} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--muted)' }} />
            </div>
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}><PlusCircle size={18} /> Save Transaction</button>
        </form>
      </div>
    </div>
  );
}

function TransactionDetail({ transactions, onUpdate, onDelete }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const transaction = transactions.find(t => t.id === id);

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    if (transaction) {
      setTitle(transaction.title);
      setAmount(transaction.amount);
    }
  }, [transaction]);

  if (!transaction) {
    return (
      <div className="card">
        <h2>Transaction not found</h2>
        <button onClick={() => navigate('/')} className="btn-primary" style={{ marginTop: '1rem' }}>Back to Dashboard</button>
      </div>
    );
  }

  const handleSave = (e) => {
    e.preventDefault();
    onUpdate({ ...transaction, title, amount: parseFloat(amount) });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      onDelete(transaction.id);
      navigate('/');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Transaction Details</h1>
          <p className="page-subtitle">View, edit, or remove transaction record.</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: '600px' }}>
        {!isEditing ? (
          <div>
            <p><strong>Title:</strong> {transaction.title}</p>
            <p><strong>Amount:</strong> ₱{Number(transaction.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p><strong>Type:</strong> <span style={{ textTransform: 'capitalize' }}>{transaction.type}</span></p>
            <p><strong>Category:</strong> {transaction.category}</p>
            <p><strong>Date:</strong> {transaction.date}</p>
            <div className="actions-group">
              <button onClick={() => setIsEditing(true)} className="btn-secondary"><Edit2 size={16} /> Edit Details</button>
              <button onClick={handleDelete} className="btn-danger"><Trash2 size={16} /> Delete</button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label>Title</label>
              <input className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Amount (₱)</label>
              <input 
                type="number" 
                step="0.01" 
                className="form-input" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
                onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()}
                required 
              />
            </div>
            <div className="actions-group">
              <button type="submit" className="btn-primary">Update</button>
              <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        )}
        <div style={{ marginTop: '2rem' }}>
          <Link to="/" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

function Summary({ transactions }) {
  const { categoryBreakdown, totalExpenses } = useMemo(() => {
    const breakdown = {};
    let totalExp = 0;
    transactions.forEach(t => {
      if (t.type === 'expense') {
        const amt = Number(t.amount);
        breakdown[t.category] = (breakdown[t.category] || 0) + amt;
        totalExp += amt;
      }
    });
    return { categoryBreakdown: breakdown, totalExpenses: totalExp };
  }, [transactions]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Summary</h1>
          <p className="page-subtitle">Visual spending breakdown by category.</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: '650px' }}>
        <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Expense Breakdown</h3>
        {Object.keys(categoryBreakdown).length === 0 ? (
          <p className="card-footer-text">No expenses recorded yet.</p>
        ) : (
          Object.entries(categoryBreakdown).map(([cat, total]) => {
            const percentage = totalExpenses > 0 ? Math.round((total / totalExpenses) * 100) : 0;
            return (
              <div key={cat} className="progress-row">
                <div className="progress-info">
                  <span><span>{cat}</span> ({percentage}%)</span>
                  <span>₱{total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${percentage}%` }}></div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function App() {
  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useTransactions();

  return (
    <ThemeProvider>
      <HashRouter>
        <div className="app-layout">
          <Sidebar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard transactions={transactions} />} />
              <Route path="/add" element={<AddTransaction onAdd={addTransaction} />} />
              <Route path="/summary" element={<Summary transactions={transactions} />} />
              <Route path="/transaction/:id" element={<TransactionDetail transactions={transactions} onUpdate={updateTransaction} onDelete={deleteTransaction} />} />
            </Routes>
          </main>
        </div>
      </HashRouter>
    </ThemeProvider>
  );
}