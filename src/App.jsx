import React, { useEffect, useMemo, useState } from "react";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
  PieChart, Pie, Cell
} from "recharts";
import {
  LayoutDashboard, ArrowLeftRight, Wallet, Target, Settings, Search,
  Bell, Plus, Download, TrendingUp, TrendingDown, IndianRupee,
  Utensils, Car, ShoppingBag, HeartPulse, GraduationCap, Home,
  MoreHorizontal, Trash2, X, Menu, Sun, Moon, ChevronDown
} from "lucide-react";

const initialTransactions = [
  { id: 1, title: "Monthly Salary", category: "Income", date: "2026-11-01", amount: 52000, type: "income" },
  { id: 2, title: "Grocery Shopping", category: "Food", date: "2026-11-03", amount: 2450, type: "expense" },
  { id: 3, title: "Apartment Rent", category: "Housing", date: "2026-11-05", amount: 12000, type: "expense" },
  { id: 4, title: "Freelance Project", category: "Income", date: "2026-11-08", amount: 8500, type: "income" },
  { id: 5, title: "Bus & Metro", category: "Transport", date: "2026-11-10", amount: 850, type: "expense" },
  { id: 6, title: "Online Course", category: "Education", date: "2026-11-12", amount: 1999, type: "expense" },
  { id: 7, title: "Dinner", category: "Food", date: "2026-11-15", amount: 780, type: "expense" },
  { id: 8, title: "Medicine", category: "Health", date: "2026-11-17", amount: 620, type: "expense" }
];

const categories = ["Food", "Transport", "Shopping", "Health", "Education", "Housing", "Entertainment", "Other"];
const categoryColors = ["#8b7cf6", "#42b7a5", "#f4b860", "#ed7d9a", "#5b9cf5", "#a78bfa", "#e58b4a", "#8b98a9"];
const money = (n) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
const readSaved = (key, fallback) => {
  try { const value = localStorage.getItem(key); return value ? JSON.parse(value) : fallback; }
  catch { return fallback; }
};

function App() {
  const [user, setUser] = useState(() => readSaved("inexsa_user", null));
  const [transactions, setTransactions] = useState(() => readSaved("inexsa_transactions", initialTransactions));
  const [budget, setBudget] = useState(() => readSaved("inexsa_budget", 20000));
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [dark, setDark] = useState(() => readSaved("inexsa_dark", false));
  const [mobileNav, setMobileNav] = useState(false);
  const [activePage, setActivePage] = useState("Overview");
  const [form, setForm] = useState({ title: "", amount: "", category: "Food", date: new Date().toISOString().slice(0, 10), type: "expense" });

  useEffect(() => localStorage.setItem("inexsa_transactions", JSON.stringify(transactions)), [transactions]);
  useEffect(() => localStorage.setItem("inexsa_budget", JSON.stringify(budget)), [budget]);
  useEffect(() => localStorage.setItem("inexsa_dark", JSON.stringify(dark)), [dark]);

  const income = transactions.filter(t => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
  const expenses = transactions.filter(t => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);
  const balance = income - expenses;
  const expenseProgress = Math.min((expenses / Math.max(budget, 1)) * 100, 100);

  const filteredTransactions = useMemo(() => transactions
    .filter(t => filter === "All" || (filter === "Income" ? t.type === "income" : t.type === "expense"))
    .filter(t => `${t.title} ${t.category}`.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => new Date(b.date) - new Date(a.date)), [transactions, filter, query]);

  const chartData = useMemo(() => {
    const months = ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov"];
    return months.map((month, i) => {
      const monthNumber = String(i + 6).padStart(2, "0");
      const monthItems = transactions.filter(t => t.date.slice(0, 7) === `2026-${monthNumber}`);
      return {
        month,
        income: monthItems.filter(t => t.type === "income").reduce((s, t) => s + Number(t.amount), 0),
        expenses: monthItems.filter(t => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0)
      };
    });
  }, [transactions]);

  const categoryData = categories.map((category, i) => ({
    name: category,
    value: transactions.filter(t => t.type === "expense" && t.category === category).reduce((s, t) => s + Number(t.amount), 0),
    color: categoryColors[i]
  })).filter(item => item.value > 0);

  function addTransaction(e) {
    e.preventDefault();
    const amount = Number(form.amount);
    if (!form.title.trim() || !Number.isFinite(amount) || amount <= 0) return;
    setTransactions(current => [{ ...form, id: Date.now(), amount }, ...current]);
    setForm({ title: "", amount: "", category: "Food", date: new Date().toISOString().slice(0, 10), type: "expense" });
    setModalOpen(false);
  }

  function exportCSV() {
    const rows = [["Title", "Category", "Date", "Type", "Amount"], ...transactions.map(t => [t.title, t.category, t.date, t.type, t.amount])];
    const csv = rows.map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a");
    link.href = url; link.download = "inexsa-transactions.csv"; link.click();
    URL.revokeObjectURL(url);
  }

  const navItems = [
    { label: "Overview", icon: LayoutDashboard },
    { label: "Transactions", icon: ArrowLeftRight },
    { label: "Budgets", icon: Target },
    { label: "Wallet", icon: Wallet }
  ];

  if (!user) {
    return <AuthScreen onLogin={(name, email) => {
      const account = { name, email };
      localStorage.setItem("inexsa_user", JSON.stringify(account));
      setUser(account);
    }} />;
  }

  return (
    <div className={`app-shell ${dark ? "dark" : ""}`}>
      <aside className={`sidebar ${mobileNav ? "open" : ""}`}>
        <div className="brand"><div className="brand-mark">I</div><span>INEXSA</span></div>
        <div className="workspace-label">WORKSPACE</div>
        <nav>
          {navItems.map(({ label, icon: Icon }) => (
            <button key={label} className={`nav-link ${activePage === label ? "active" : ""}`} onClick={() => { setActivePage(label); setMobileNav(false); }}>
              <Icon size={18} /> <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card"><div className="help-icon">✦</div><strong>Make money mindful.</strong><p>Small steps today create a stronger financial future.</p></div>
          <button className="nav-link"><Settings size={18} /><span>Settings</span></button>
          <div className="profile"><div className="avatar">{(user.name || "U").slice(0,1).toUpperCase()}</div><div><strong>{user.name || "User"}</strong><small>Personal account</small></div><button className="logout-mini" onClick={() => { localStorage.removeItem("inexsa_user"); setUser(null); }}>Log out</button></div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <button className="mobile-menu icon-button" onClick={() => setMobileNav(!mobileNav)}><Menu size={20} /></button>
          <div><p className="eyebrow">MONDAY, NOVEMBER 23, 2026</p><h1>{activePage === "Overview" ? "Financial overview" : activePage}</h1></div>
          <div className="top-actions">
            <label className="search-box"><Search size={17} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search transactions..." /></label>
            <button className="icon-button" title="Toggle theme" onClick={() => setDark(!dark)}>{dark ? <Sun size={18} /> : <Moon size={18} />}</button>
            <button className="icon-button notification" title="Notifications"><Bell size={18} /><i /></button>
            <button className="add-button" onClick={() => setModalOpen(true)}><Plus size={17} /> Add transaction</button>
          </div>
        </header>

        {activePage === "Overview" || activePage === "Wallet" ? (
          <>
            <section className="welcome-row"><div><h2>Your money, in focus.</h2><p>Here’s what’s happening with your finances this month.</p></div><button className="outline-button" onClick={exportCSV}><Download size={16} /> Export report</button></section>

            <section className="stats-grid">
              <StatCard title="Total balance" amount={money(balance)} note="Income minus expenses" icon={Wallet} trend="+8.2%" positive />
              <StatCard title="Total income" amount={money(income)} note="Money coming in" icon={TrendingUp} trend="+12.5%" positive />
              <StatCard title="Total expenses" amount={money(expenses)} note="Money going out" icon={TrendingDown} trend="This month" />
              <StatCard title="Monthly budget" amount={money(budget)} note={`${Math.round(expenseProgress)}% of budget used`} icon={Target} trend={`${money(Math.max(budget - expenses, 0))} left`} />
            </section>

            <section className="content-grid">
              <div className="panel chart-panel">
                <div className="panel-heading"><div><h3>Cash flow</h3><p>Income vs. expenses</p></div><button className="select-button">Last 6 months <ChevronDown size={15} /></button></div>
                <div className="chart-legend"><span><i className="legend-income" /> Income</span><span><i className="legend-expense" /> Expenses</span></div>
                <div className="area-chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
                  <defs><linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6bcbad" stopOpacity={0.22} /><stop offset="100%" stopColor="#6bcbad" stopOpacity={0} /></linearGradient><linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#9a8cf5" stopOpacity={0.2} /><stop offset="100%" stopColor="#9a8cf5" stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 5" vertical={false} stroke="var(--grid)" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "var(--muted)", fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--muted)", fontSize: 11 }} tickFormatter={v => `${v / 1000}k`} />
                  <Tooltip formatter={v => money(v)} contentStyle={{ background: "var(--panel)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--text)" }} />
                  <Area type="monotone" dataKey="income" stroke="#55b99b" strokeWidth={2.5} fill="url(#incomeFill)" />
                  <Area type="monotone" dataKey="expenses" stroke="#9384ed" strokeWidth={2.5} fill="url(#expenseFill)" />
                </AreaChart></ResponsiveContainer></div>
              </div>

              <div className="panel budget-panel">
                <div className="panel-heading"><div><h3>Monthly budget</h3><p>Keep your spending on track</p></div><Target size={19} className="muted-icon" /></div>
                <div className="budget-total"><strong>{money(expenses)}</strong><span>of {money(budget)}</span></div>
                <div className="progress-track"><div style={{ width: `${expenseProgress}%` }} /></div>
                <div className="budget-foot"><span>{Math.round(expenseProgress)}% used</span><span>{money(Math.max(budget - expenses, 0))} remaining</span></div>
                <div className="budget-edit"><label htmlFor="budgetInput">Set monthly limit</label><div><span>₹</span><input id="budgetInput" type="number" min="1" value={budget} onChange={e => setBudget(Math.max(1, Number(e.target.value)))} /></div></div>
                {expenses > budget && <p className="budget-warning">You have exceeded your monthly budget.</p>}
              </div>
            </section>

            <section className="content-grid lower-grid">
              <div className="panel transactions-panel">
                <div className="panel-heading"><div><h3>Recent transactions</h3><p>Your latest money activity</p></div><button className="text-button" onClick={() => setActivePage("Transactions")}>View all <span>→</span></button></div>
                <div className="filter-row">{["All", "Income", "Expenses"].map(item => <button key={item} className={filter === item ? "filter-active" : ""} onClick={() => setFilter(item)}>{item}</button>)}</div>
                <TransactionList items={filteredTransactions.slice(0, 6)} onDelete={id => setTransactions(t => t.filter(x => x.id !== id))} />
              </div>
              <div className="panel spending-panel">
                <div className="panel-heading"><div><h3>Spending breakdown</h3><p>Expenses by category</p></div><MoreHorizontal size={19} className="muted-icon" /></div>
                {categoryData.length ? <><div className="donut-wrap"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={57} outerRadius={78} paddingAngle={3} stroke="none">{categoryData.map((entry, i) => <Cell key={i} fill={entry.color} />)}</Pie><Tooltip formatter={v => money(v)} contentStyle={{ background: "var(--panel)", border: "1px solid var(--border)", borderRadius: 10 }} /></PieChart></ResponsiveContainer><div className="donut-center"><strong>{money(expenses)}</strong><span>Total spent</span></div></div>
                <div className="category-legend">{categoryData.map(item => <div key={item.name}><span><i style={{ background: item.color }} />{item.name}</span><strong>{money(item.value)}</strong></div>)}</div></> : <div className="empty-state">Add an expense to see your spending breakdown.</div>}
              </div>
            </section>
          </>
        ) : activePage === "Transactions" ? (
          <section className="panel full-transactions"><div className="panel-heading"><div><h3>All transactions</h3><p>Search, filter, export or remove your records.</p></div><button className="add-button" onClick={() => setModalOpen(true)}><Plus size={17} /> Add transaction</button></div><div className="filter-row">{["All", "Income", "Expenses"].map(item => <button key={item} className={filter === item ? "filter-active" : ""} onClick={() => setFilter(item)}>{item}</button>)}</div><TransactionList items={filteredTransactions} onDelete={id => setTransactions(t => t.filter(x => x.id !== id))} /></section>
        ) : activePage === "Budgets" ? (
          <section className="panel budget-page"><div className="panel-heading"><div><h3>Monthly spending plan</h3><p>Adjust your budget and monitor your spending.</p></div><Target className="muted-icon" /></div><div className="budget-total"><strong>{money(expenses)}</strong><span>spent of {money(budget)}</span></div><div className="progress-track"><div style={{ width: `${expenseProgress}%` }} /></div><div className="budget-foot"><span>{Math.round(expenseProgress)}% used</span><span>{money(Math.max(budget - expenses, 0))} remaining</span></div><div className="budget-edit"><label htmlFor="budgetPageInput">Monthly budget limit (₹)</label><input id="budgetPageInput" type="number" min="1" value={budget} onChange={e => setBudget(Math.max(1, Number(e.target.value)))} /></div></section>
        ) : null}
        <footer>© 2026 INEXSA. Manage your money with clarity.</footer>
      </main>

      {modalOpen && <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && setModalOpen(false)}><form className="transaction-modal" onSubmit={addTransaction}>
        <div className="modal-heading"><div><h2>Add transaction</h2><p>Record income or an expense.</p></div><button type="button" className="icon-button" onClick={() => setModalOpen(false)}><X size={19} /></button></div>
        <label>Transaction type</label><div className="type-toggle"><button type="button" className={form.type === "expense" ? "chosen" : ""} onClick={() => setForm({ ...form, type: "expense" })}>Expense</button><button type="button" className={form.type === "income" ? "chosen" : ""} onClick={() => setForm({ ...form, type: "income", category: "Income" })}>Income</button></div>
        <label htmlFor="title">Description</label><input id="title" required maxLength="60" placeholder="e.g. Grocery shopping" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
        <div className="form-two"><div><label htmlFor="amount">Amount (₹)</label><input id="amount" required type="number" min="1" step="1" placeholder="0" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} /></div><div><label htmlFor="date">Date</label><input id="date" required type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div></div>
        {form.type === "expense" && <><label htmlFor="category">Category</label><select id="category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>{categories.map(c => <option key={c}>{c}</option>)}</select></>}
        <button className="add-button submit-button" type="submit">Save transaction</button>
      </form></div>}
    </div>
  );
}


function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  
function submit(e) {
  e.preventDefault();
  setMessage("");

  const cleanEmail = email.trim().toLowerCase();

  if (mode === "register" && name.trim().length < 2) {
    return setMessage("Please enter your name (at least 2 characters).");
  }

  // Validate email address
  const emailPattern = /^[^@]+@[^@]+\.[^@]+$/;

  if (!emailPattern.test(cleanEmail)) {
    return setMessage("Enter a valid email address.");
  }

  if (password.length < 6) {
    return setMessage("Password must contain at least 6 characters.");
  }

  onLogin(
    name.trim() || cleanEmail.split("@")[0],
    cleanEmail
  );
}

  return <div className="auth-page">
    <section className="auth-left">
      <div className="auth-brand"><div className="brand-mark">I</div><span>INEXSA</span></div>
      <div className="auth-pitch"><span className="auth-kicker">YOUR MONEY. YOUR MOMENTUM.</span>
        <h1>Make every<br/><em>rupee count.</em></h1>
        <p>A clearer view of your money starts here. Track spending, plan ahead and build better financial habits.</p>
        <div className="auth-benefits"><div><span>✓</span> One place for your financial overview</div><div><span>✓</span> Simple budgets and spending insights</div><div><span>✓</span> Your dashboard, your way</div></div>
      </div><div className="auth-left-foot">INEXSA · PERSONAL FINANCE DASHBOARD</div>
    </section>
    <section className="auth-right"><form className="auth-card" onSubmit={submit}>
      <div className="auth-mobile-brand"><div className="brand-mark">I</div><span>INEXSA</span></div>
      <div className="auth-card-top"><span className="auth-kicker">{mode === "login" ? "WELCOME BACK" : "GET STARTED"}</span><h2>{mode === "login" ? "Sign in to INEXSA" : "Create your account"}</h2><p>{mode === "login" ? "Enter your details to access your finance dashboard." : "A few details and your dashboard is ready."}</p></div>
      {mode === "register" && <label className="auth-field">Full name<input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" autoComplete="name" required /></label>}
      <label className="auth-field">Email address<input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" autoComplete="email" required /></label>
      <label className="auth-field">Password<div className="password-wrap"><input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters" autoComplete={mode === "login" ? "current-password" : "new-password"} required minLength={6}/><button type="button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? "Hide" : "Show"}</button></div></label>
      {mode === "login" && <button type="button" className="forgot-link" onClick={() => setMessage("Password reset is not connected in this frontend demo.")}>Forgot password?</button>}
      {message && <div className="auth-message" role="alert">{message}</div>}
      <button className="auth-submit" type="submit">{mode === "login" ? "Sign in" : "Create account"} <span>→</span></button>
      <div className="auth-switch">{mode === "login" ? "New to INEXSA?" : "Already have an account?"}<button type="button" onClick={() => { setMode(mode === "login" ? "register" : "login"); setMessage(""); }}>{mode === "login" ? " Create an account" : " Sign in"}</button></div>
      <div className="auth-demo-note">Demo authentication · Use any valid email and a password of 6+ characters.</div>
    </form></section>
  </div>;
}

function StatCard({ title, amount, note, icon: Icon, trend, positive }) {
  return <div className="stat-card"><div className="stat-top"><span>{title}</span><div className="stat-icon"><Icon size={18} /></div></div><strong className="stat-amount">{amount}</strong><div className="stat-bottom"><span>{note}</span><em className={positive ? "positive" : ""}>{trend}</em></div></div>;
}

function TransactionList({ items, onDelete }) {
  const iconFor = category => ({ Food: Utensils, Transport: Car, Shopping: ShoppingBag, Health: HeartPulse, Education: GraduationCap, Housing: Home })[category] || Wallet;
  if (!items.length) return <div className="empty-state">No transactions found. Try another search or add a transaction.</div>;
  return <div className="transaction-list">{items.map(item => {
    const Icon = iconFor(item.category);
    return <div className="transaction-row" key={item.id}><div className={`transaction-icon ${item.type}`}><Icon size={17} /></div><div className="transaction-info"><strong>{item.title}</strong><span>{item.category} · {new Date(`${item.date}T00:00:00`).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span></div><strong className={`transaction-amount ${item.type}`}>{item.type === "income" ? "+" : "−"}{money(item.amount)}</strong><button className="delete-button" title="Delete transaction" onClick={() => onDelete(item.id)}><Trash2 size={15} /></button></div>;
  })}</div>;
}

export default App;
