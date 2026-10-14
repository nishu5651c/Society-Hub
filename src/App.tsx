import { Component, type ErrorInfo, type ReactNode, useEffect, useMemo, useState } from "react";
import {
  ArrowDownRight, ArrowUpRight, Bell, Building2, CalendarDays, ChevronDown, CircleHelp, CreditCard,
  FileText, Home, LayoutDashboard, LogOut, Menu, MoreHorizontal, Plus, Search, Settings, ShieldCheck,
  SlidersHorizontal, Sparkles, Users, Wrench, X, Zap, MessageCircle, FileCheck, Heart, MapPin
} from "lucide-react";
import { maintenance, payments, societies } from "./services/mockData";
import { api, authStorage, type AuthUser } from "./services/api";
import type { View } from "./types";

const nav: { id: View; label: string; icon: typeof Home; badge?: string }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "properties", label: "Properties", icon: Building2 },
  { id: "rentals", label: "Rentals", icon: Home },
  { id: "payments", label: "Rent collection", icon: CreditCard, badge: "3" },
  { id: "maintenance", label: "Maintenance", icon: Wrench, badge: "4" },
  { id: "members", label: "Members & tenants", icon: Users },
  { id: "applications", label: "Applications", icon: FileCheck },
  { id: "messages", label: "Messages", icon: MessageCircle },
  { id: "analytics", label: "Analytics", icon: SlidersHorizontal },
];

const money = (value: number) => `₹${value.toLocaleString("en-IN")}`;
const statusClass = (status: string) => status.toLowerCase().replace(" ", "-");

export class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error("SocietyHub render error", error, info); }
  render() {
    if (this.state.hasError) return <div className="error-screen"><div className="error-orbit" /><div><span className="eyebrow">Workspace recovery</span><h1>We hit a small orbit.</h1><p>Refresh the app or sign in again to continue.</p></div></div>;
    return this.props.children;
  }
}

function App() {
  const [user, setUser] = useState<AuthUser | null>(() => authStorage.getUser());
  const [checking, setChecking] = useState(() => Boolean(authStorage.getToken()));
  useEffect(() => {
    const expired = () => { setUser(null); setChecking(false); };
    window.addEventListener("societyhub:auth-expired", expired);
    if (authStorage.getToken()) api.me().then(setUser).catch(expired).finally(() => setChecking(false));
    return () => window.removeEventListener("societyhub:auth-expired", expired);
  }, []);
  if (checking) return <div className="auth-shell"><div className="auth-card"><div className="loading-state">Loading your workspace…</div></div></div>;
  return user ? <Dashboard user={user} onLogout={() => { void api.logout().finally(() => setUser(null)); }} /> : <AuthScreen onAuthenticated={(session) => { authStorage.set(session); setUser(session.user); }} />;
}

function AuthScreen({ onAuthenticated }: { onAuthenticated: (session: { user: AuthUser; token: string }) => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ email: "", name: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoRole, setDemoRole] = useState<"ADMIN" | "MANAGER" | "OWNER" | "STAFF" | "RESIDENT">("ADMIN");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setError(""); setLoading(true);
    try {
      onAuthenticated(mode === "login" ? await api.login({ email: form.email, password: form.password }) : await api.register(form));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    const demoAccounts: Record<string, { email: string; password: string }> = {
      ADMIN: { email: "superadmin@example.com", password: "SuperAdmin123!" },
      MANAGER: { email: "admin@example.com", password: "SocietyAdmin123!" },
      OWNER: { email: "owner@example.com", password: "Owner123!" },
      STAFF: { email: "staff@example.com", password: "Staff123!" },
      RESIDENT: { email: "resident@example.com", password: "Resident123!" },
    };

    setError("");
    setLoading(true);
    try {
      const account = demoAccounts[demoRole];
      const session = await api.login(account);
      onAuthenticated(session);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Demo login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="apple-auth-shell">
      <div className="apple-auth-card">
        <header className="apple-topbar">
          <div className="brand apple-brand">
            <div className="brand-mark"><Sparkles size={16} /></div>
            <span>society<span>hub</span></span>
          </div>
          <nav className="apple-nav">
            <span>Platform</span>
            <span>Properties</span>
            <span>Payments</span>
            <span>Support</span>
          </nav>
          <button className="apple-cta">Sign in</button>
        </header>

        <div className="apple-hero">
          <div className="apple-hero-copy">
            <span className="eyebrow soft">Smart property operations</span>
            <h1>One complete home for every resident, payment, and property.</h1>
            <p>
              Run your society with clarity, automate maintenance, collect rent, and keep every resident informed on one premium platform.
            </p>

            <div className="apple-hero-actions">
              <button className="primary-button" onClick={handleDemoLogin} disabled={loading}>
                {loading ? "Signing in…" : `Use demo ${demoRole.toLowerCase()} account`}
              </button>
              <button className="secondary-button" onClick={() => setMode((current) => current === "login" ? "register" : "login")}>
                {mode === "login" ? "Create account" : "Already have an account?"}
              </button>
            </div>

            <div className="demo-role-row">
              {(["ADMIN", "MANAGER", "OWNER", "STAFF", "RESIDENT"] as const).map((role) => (
                <button
                  key={role}
                  className={demoRole === role ? "role-pill active" : "role-pill"}
                  onClick={() => setDemoRole(role)}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <div className="apple-hero-visual">
            <div className="glass-window">
              <div className="window-header">
                <span className="dot red" />
                <span className="dot yellow" />
                <span className="dot green" />
              </div>
              <div className="window-body">
                <div className="mini-metric metric-large">
                  <small>Collection</small>
                  <strong>₹12.8L</strong>
                </div>
                <div className="mini-grid">
                  <div className="mini-metric"><small>Occupancy</small><strong>94%</strong></div>
                  <div className="mini-metric"><small>Maintenance</small><strong>12</strong></div>
                </div>
                <div className="mini-chart">
                  <span style={{ height: "55%" }} />
                  <span style={{ height: "72%" }} />
                  <span style={{ height: "84%" }} />
                  <span style={{ height: "68%" }} />
                  <span style={{ height: "92%" }} />
                  <span style={{ height: "100%" }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="apple-feature-band">
          <article>
            <div className="icon-wrap"><Building2 size={18} /></div>
            <h3>Portfolio control</h3>
            <p>Track every building and resident across your entire portfolio.</p>
          </article>
          <article>
            <div className="icon-wrap"><CreditCard size={18} /></div>
            <h3>Smart collections</h3>
            <p>Capture rent, track due dates, and keep payment health predictable.</p>
          </article>
          <article>
            <div className="icon-wrap"><Wrench size={18} /></div>
            <h3>Maintenance ops</h3>
            <p>Turn service requests into resolved tasks without operational chaos.</p>
          </article>
        </section>

        <section className="apple-form-panel">
          <div className="panel-copy">
            <span className="eyebrow soft">Member access</span>
            <h2>Built for every kind of resident, owner, and manager.</h2>
          </div>

          <form onSubmit={submit} className="apple-login-form">
            <div className="form-toggle">
              <button type="button" className={mode === "login" ? "toggle active" : "toggle"} onClick={() => setMode("login")}>Log in</button>
              <button type="button" className={mode === "register" ? "toggle active" : "toggle"} onClick={() => setMode("register")}>Register</button>
            </div>

            {mode === "register" && (
              <label>
                <span>Full name</span>
                <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Your name" />
              </label>
            )}

            <label>
              <span>Email</span>
              <input value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} placeholder="you@example.com" />
            </label>

            <label>
              <span>Password</span>
              <input type="password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} placeholder="••••••••" />
            </label>

            {error && <div className="form-error">{error}</div>}

            <button type="submit" className="primary-button wide" disabled={loading}>
              {loading ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

function Dashboard({ user, onLogout }: { user: AuthUser; onLogout: () => void }) {
  const [view, setView] = useState<View>("overview");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [modal, setModal] = useState<"payment" | "property" | "lease" | "maintenance" | "member" | null>(null);
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<import("./services/api").ApiNotification[]>([]);
  useEffect(() => { api.listNotifications().then(setNotifications).catch(() => setNotifications([])); }, []);

  const pageTitle = nav.find((item) => item.id === view)?.label ?? "Settings";
  const go = (next: View) => { setView(next); setMobileOpen(false); };
  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(""), 2600); };

  return <div className="app-shell">
    <aside className={`sidebar ${mobileOpen ? "is-open" : ""}`}>
      <div className="brand"><div className="brand-mark"><Sparkles size={17} /></div><span>society<span>hub</span></span></div>
      <div className="workspace"><div className="workspace-avatar">{user.name.slice(0, 2).toUpperCase()}</div><div><strong>{user.name}</strong><small>{user.role}</small></div><ChevronDown size={15} /></div>
      <p className="nav-label">Workspace</p>
      <nav>{nav.filter(({ id }) => user.role === "ADMIN" || user.role === "MANAGER" || !["properties", "members"].includes(id)).map(({ id, label, icon: Icon, badge }) => <button key={id} className={view === id ? "active" : ""} onClick={() => go(id)}><Icon size={18} /><span>{label}</span>{badge && <em>{badge}</em>}</button>)}</nav>
      <div className="sidebar-bottom">
        <button className={view === "settings" ? "active" : ""} onClick={() => go("settings")}><Settings size={18} /><span>Settings</span></button>
        <button onClick={() => notify("Help centre is coming soon")}><CircleHelp size={18} /><span>Help centre</span></button>
        <div className="upgrade"><div className="upgrade-icon"><Zap size={16} /></div><strong>Unlock more with Pro</strong><p>Automate your society operations.</p><button onClick={() => notify("Pro is available in the next release.")}>Explore</button></div>
        <div className="user-row"><div className="avatar purple">{user.name.slice(0, 2).toUpperCase()}</div><div><strong>{user.name}</strong><small>{user.role}</small></div><button className="table-button" onClick={onLogout}><LogOut size={16} /></button></div>
      </div>
    </aside>
    {mobileOpen && <div className="backdrop" onClick={() => setMobileOpen(false)} />}
    <main className="main">
      <header className="topbar"><button className="mobile-menu" onClick={() => setMobileOpen(true)}><Menu size={21} /></button><div className="breadcrumb">Workspace <span>/</span> <b>{pageTitle}</b></div><div className="top-actions"><div className="globalsearch"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search residents, payments…" /></div><button className="icon-button" onClick={() => setNotificationsOpen((state) => !state)}><Bell size={18} /></button><button className="icon-button" onClick={() => setModal("property")}><Plus size={18} /></button></div></header>
      <div className="content">
        {view === "overview" && <Overview go={go} openModal={setModal} notify={notify} />}
        {view === "properties" && <Properties openModal={setModal} notify={notify} />}
        {view === "rentals" && <Rentals notify={notify} openModal={setModal} />}
        {view === "payments" && <Payments openModal={setModal} query={query} notify={notify} />}
        {view === "maintenance" && <MaintenancePage notify={notify} openModal={setModal} />}
        {view === "members" && <Members notify={notify} openModal={setModal} />}
        {view === "applications" && <Applications />}
        {view === "messages" && <Messages />}
        {view === "analytics" && <Analytics />}
        {view === "settings" && <SettingsPage notify={notify} />}
      </div>
    </main>
    {modal && <ActionModal type={modal} close={() => setModal(null)} notify={notify} />}
    {toast && <div className="toast"><ShieldCheck size={18} /> {toast}</div>}
  </div>;
}

function PageHeader({ eyebrow, title, description, action, onAction }: { eyebrow?: string; title: string; description: string; action?: string; onAction?: () => void }) {
  return <div className="page-header"><div><div className="eyebrow">{eyebrow ?? "Good morning, Ananya"} <span className="sun">✦</span></div><h1>{title}</h1><p>{description}</p></div>{action && <button className="primary-button" onClick={onAction}>{action}</button>}</div>;
}
function Overview({ go, openModal, notify }: { go: (v: View) => void; openModal: (v: "payment" | "property" | "lease" | "maintenance" | "member") => void; notify: (s: string) => void }) {
  return <><PageHeader title="Your community, in sync." description="Here's what is happening across your properties today." action="Add property" onAction={() => openModal("property")} />
    <section className="immersive-hero" aria-label="Portfolio pulse">
      <div className="hero-glow hero-glow-one" /><div className="hero-glow hero-glow-two" />
      <div className="hero-cloud cloud-one" /><div className="hero-cloud cloud-two" />
      <div className="hero-copy"><span className="hero-kicker"><Sparkles size={13} /> Portfolio pulse · live</span><h2>Spaces that feel <em>alive.</em></h2><p>One calm layer for the homes, people, and payments behind your community.</p></div>
      <div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" /><div className="hero-arch"><span>428</span><small>homes in rhythm</small><i /><b /><strong>93.2%</strong></div>
      <div className="hero-float-card float-card-one"><small>COLLECTED THIS MONTH</small><strong>₹12.84L</strong><span>↑ 12.8%</span></div>
      <div className="hero-float-card float-card-two"><small>OPEN REQUESTS</small><strong>12</strong><span>Across 3 properties</span></div>
      <div className="hero-float-card float-card-three"><small>ACTIVE HOMES</small><strong>397</strong><span>93.2% occupied</span></div>
      <div className="hero-ticker"><span>COLLECTION</span><strong>+12.8%</strong><small>this month</small></div>
    </section>
    <div className="stats-grid">
      <Stat title="Total collected" value="₹12.84L" change="+12.8%" positive icon={<CreditCard />} tint="blue" note="vs. last month" />
      <Stat title="Occupancy rate" value="93.2%" change="+2.4%" positive icon={<Building2 />} tint="green" note="across 428 units" />
      <Stat title="Open requests" value="12" change="-18.5%" positive icon={<Wrench />} tint="orange" note="vs. last month" />
      <Stat title="Active tenants" value="397" change="+8.1%" positive icon={<Users />} tint="purple" note="this quarter" />
    </div>
    <div className="dashboard-grid"><section className="panel chart-panel"><div className="panel-head"><div><h2>Collection overview</h2><p>Monthly rent collected across all properties</p></div><button className="link-button" onClick={() => go("payments")}>View details</button></div><div className="chart-bars"><span style={{ height: "30%" }} /><span style={{ height: "42%" }} /><span style={{ height: "52%" }} /><span style={{ height: "70%" }} /><span style={{ height: "66%" }} /><span style={{ height: "88%" }} /><span style={{ height: "100%" }} /></div></section>
      <section className="panel"><div className="panel-head"><div><h2>Properties</h2><p>Performance at a glance</p></div><button className="link-button" onClick={() => go("properties")}>View all</button></div><div className="mini-list">{societies.slice(0, 3).map((item) => <div className="mini-row" key={item.id}><div><strong>{item.name}</strong><small>{item.address}</small></div><span>{item.units} units</span></div>)}</div></section>
    </div>
    <div className="lower-grid"><section className="panel"><div className="panel-head"><div><h2>Recent payments</h2><p>The latest rent activity</p></div><button className="link-button" onClick={() => go("payments")}>Open ledger</button></div><PaymentTable compact rows={payments.slice(0, 4)} /></section>
      <section className="panel"><div className="panel-head"><div><h2>Operations</h2><p>What needs attention</p></div><button className="link-button" onClick={() => go("maintenance")}>Review</button></div><div className="mini-list">{maintenance.slice(0, 4).map((item) => <div className="mini-row" key={item.id}><div><strong>{item.title}</strong><small>{item.location}</small></div><span className={`status-badge ${statusClass(item.status)}`}>{item.status}</span></div>)}</div></section>
    </div>
    <div className="tip"><Sparkles size={19} /><div><strong>Make your next move count</strong><span>Collection is up 12.8% this month. Keep the momentum going by sending reminders to the 3 upcoming due payments.</span></div></div>
  </>;
}
function Stat({ title, value, change, positive, icon, tint, note }: { title: string; value: string; change: string; positive: boolean; icon: React.ReactNode; tint: string; note: string }) { return <div className="stat-card"><div className="stat-icon" style={{ background: tint === "blue" ? "#eaf3ff" : tint === "green" ? "#eafaf3" : tint === "orange" ? "#fff2ea" : "#f3ebff" }}>{icon}</div><div><small>{title}</small><strong>{value}</strong></div><span className={positive ? "change up" : "change down"}>{change}</span><p>{note}</p></div>; }
function PaymentTable({ compact = false, rows = payments }: { compact?: boolean; rows?: typeof payments }) { return <div className="table-wrap"><table><thead><tr><th>Tenant</th><th>Unit</th><th>Amount</th><th>Status</th>{!compact && <th>Due</th>}</tr></thead><tbody>{rows.map((row) => <tr key={row.id}><td>{row.tenant}</td><td>{row.unit}</td><td>{money(row.amount)}</td><td><span className={`status-badge ${statusClass(row.status)}`}>{row.status}</span></td>{!compact && <td>{row.dueDate}</td>}</tr>)}</tbody></table></div>; }
function Properties({ openModal, notify }: { openModal: (v: "property") => void; notify: (s: string) => void }) {
  const [items, setItems] = useState(societies);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showActive, setShowActive] = useState(true);
  useEffect(() => {
    let active = true;
    api.listSocieties().then((data) => { if (active) setItems(data); }).catch(() => { if (active) setError("Properties could not be loaded. Showing saved workspace data."); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  const visibleItems = showActive ? items.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()) || item.address.toLowerCase().includes(search.toLowerCase())) : [];
  return <><PageHeader eyebrow="Portfolio" title="Properties" description="A visual home for every community you care for." action="Add property" onAction={() => openModal("property")} />
    <div className="property-toolbar"><div className="tabs"><button className={showActive ? "selected" : ""} onClick={() => setShowActive(true)}>All properties <span>{items.length}</span></button></div><div className="toolbar-actions"><div className="search-box"><Search size={15} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search properties" /></div><button className="secondary-button" onClick={() => notify("Filters are available in the next release.")}>Filters</button></div></div>
    {error && <div className="inline-alert">{error}</div>}
    {loading ? <div className="panel loading-state">Loading properties...</div> : visibleItems.length ? <div className="property-cards">{visibleItems.map((s, index) => <article className="property-card" key={s.id}><div className="property-card-hero"><span>Social living / 0{index + 1}</span><button className="icon-button small"><Heart size={15} /></button></div><div className="property-card-art"><div className="art-surface"><Building2 size={38} /></div><div className="property-card-name">{s.name}</div></div><div className="property-card-meta"><div><h3>{s.name}</h3><p><MapPin size={14} /> {s.address}</p></div><span className="status-badge active">Active</span></div><div className="property-stats"><div><small>Units</small><strong>{s.units}</strong></div><div><small>Occupancy</small><strong>94%</strong></div><div><small>Collection</small><strong>97%</strong></div></div><div className="meter"><span style={{ width: "94%" }} /></div><button className="property-card-button"><span>View property</span><ArrowUpRight size={15} /></button></article>)}</div> : <div className="panel empty-state">No properties matched your filters.</div>}</>;
}
function Rentals({ notify, openModal }: { notify: (s: string) => void; openModal: (v: "lease") => void }) { const [leases, setLeases] = useState<import("./services/api").Lease[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(""); useEffect(() => { api.listLeases().then(setLeases).catch((cause) => setError(cause instanceof Error ? cause.message : "Leases could not be loaded")).finally(() => setLoading(false)); }, []); return <><PageHeader eyebrow="Portfolio" title="Rentals" description="Unit-level lease activity, rent movement and renewal health." action="Create lease" onAction={() => openModal("lease")} />{error && <div className="inline-alert">{error}</div>}{loading ? <div className="panel loading-state">Loading lease data…</div> : <div className="panel"><PaymentTable rows={leases.map((lease) => ({ id: lease.id, tenant: lease.tenant.name, unit: lease.unit, amount: lease.monthlyRent, status: lease.status, dueDate: new Date(lease.endsAt).toLocaleDateString("en-IN") }))} /></div>}</>;
}
function Payments({ openModal, query, notify }: { openModal: (v: "payment") => void; query: string; notify: (s: string) => void }) { const [items, setItems] = useState(payments); const [loading, setLoading] = useState(true); const [error, setError] = useState(""); useEffect(() => { api.listPayments().then((rows) => setItems(rows as typeof payments)).catch(() => setError("Payments could not be loaded. Showing saved data.")).finally(() => setLoading(false)); }, []); const visible = items.filter((item) => item.tenant.toLowerCase().includes(query.toLowerCase()) || item.status.toLowerCase().includes(query.toLowerCase())); return <><PageHeader eyebrow="Cash flow" title="Payments" description="Track every rent payment, due date and collection outcome." action="Record payment" onAction={() => openModal("payment")} />{error && <div className="inline-alert">{error}</div>}{loading ? <div className="panel loading-state">Loading payment ledger…</div> : <div className="panel"><PaymentTable rows={visible} /></div>}</>;
}
function MaintenancePage({ notify, openModal }: { notify: (s: string) => void; openModal: (v: "maintenance") => void }) {
  const [items, setItems] = useState(maintenance); const [filter, setFilter] = useState("ALL"); const [loading, setLoading] = useState(true); const [error, setError] = useState(""); useEffect(() => { api.listMaintenance().then((rows) => setItems(rows as typeof maintenance)).catch((cause) => setError(cause instanceof Error ? cause.message : "Showing saved maintenance data")).finally(() => setLoading(false)); }, []); const visible = filter === "ALL" ? items : items.filter((item) => item.status.toUpperCase().replace(" ", "_") === filter); return <><PageHeader eyebrow="Operations" title="Maintenance" description="Resolve issues quickly and keep residents happy." action="Log a request" onAction={() => openModal("maintenance")} /><div className="property-toolbar"><div className="tabs"><button className={filter === "ALL" ? "selected" : ""} onClick={() => setFilter("ALL")}>All</button><button className={filter === "OPEN" ? "selected" : ""} onClick={() => setFilter("OPEN")}>Open</button><button className={filter === "IN_PROGRESS" ? "selected" : ""} onClick={() => setFilter("IN_PROGRESS")}>In progress</button><button className={filter === "RESOLVED" ? "selected" : ""} onClick={() => setFilter("RESOLVED")}>Resolved</button></div></div>{error && <div className="inline-alert">{error}</div>}{loading ? <div className="panel loading-state">Loading maintenance tickets…</div> : <div className="stacked-panel">{visible.map((item) => <div className="maintenance-card" key={item.id}><div><div className="maintenance-kicker">{item.location}</div><h3>{item.title}</h3><small>{item.priority} priority</small></div><span className={`status-badge ${statusClass(item.status)}`}>{item.status}</span></div>)}</div>}</>;
}
function Members({ notify, openModal }: { notify: (s: string) => void; openModal: (v: "member") => void }) { const [members, setMembers] = useState(payments); useEffect(() => { api.listMembers().then((rows) => setMembers(rows as typeof payments)).catch(() => undefined); }, []); return <><PageHeader eyebrow="Resident base" title="Members & tenants" description="Everyone who belongs in your communities." action="Invite member" onAction={() => openModal("member")} /><div className="panel"><div className="member-grid">{members.map((member) => <div key={member.id} className="member-card"><div className="member-avatar">{member.tenant.slice(0, 2).toUpperCase()}</div><div><strong>{member.tenant}</strong><small>{member.unit}</small></div><button className="secondary-button small">View</button></div>)}</div></div></>;
}
function SettingsPage({ notify }: { notify: (s: string) => void }) { return <><PageHeader eyebrow="Workspace" title="Settings" description="Shape SocietyHub around how your team works." /><div className="settings-panel"><div className="settings-option active">Workspace profile</div><div className="settings-option">Team & permissions</div><div className="settings-option">Notifications</div><div className="settings-option">Billing & plan</div><div className="settings-option">Integrations</div></div></>;
}
function Applications() {
  const [items, setItems] = useState<import("./services/api").Application[]>([]);
  const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  useEffect(() => { api.listApplications().then(setItems).catch((e) => setError(e instanceof Error ? e.message : "Applications could not be loaded")).finally(() => setLoading(false)); }, []);
  const review = async (item: import("./services/api").Application, status: "UNDER_REVIEW" | "APPROVED" | "REJECTED") => { try { const updated = await api.reviewApplication(item.id, { status }); setItems((current) => current.map((row) => row.id === item.id ? { ...row, status: updated.status } : row)); } catch (error) { setError(error instanceof Error ? error.message : "Review failed"); } };
  return <><PageHeader eyebrow="Verification" title="Applications" description="Review resident applications and verification status." />{error && <div className="inline-alert">{error}</div>}{loading ? <div className="panel loading-state">Loading applications…</div> : <div className="panel"><div className="stacked-panel">{items.map((item) => <div className="application-row" key={item.id}><div><strong>{item.applicant?.name ?? "Applicant"}</strong><small>{item.unit}</small></div><div className="application-actions"><button className="secondary-button small" onClick={() => void review(item, "APPROVED")}>Approve</button><button className="secondary-button small" onClick={() => void review(item, "REJECTED")}>Reject</button></div></div>)}</div></div>}</>;
}
function Analytics() {
  const [summary, setSummary] = useState<import("./services/api").AnalyticsSummary | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { api.listAnalytics().then(setSummary).catch((cause) => setError(cause instanceof Error ? cause.message : "Analytics could not be loaded")); }, []);
  return <><PageHeader eyebrow="Insights" title="Analytics" description="A clear pulse on occupancy, collection and operations." />{error && <div className="inline-alert">{error}</div>}{summary ? <div className="stats-grid analytics-grid"><Stat title="Properties" value={String(summary.properties)} change="+2" positive icon={<Building2 />} tint="blue" note="active communities" /><Stat title="Units" value={String(summary.units)} change="+8" positive icon={<Home />} tint="green" note="total units" /><Stat title="Collected" value={money(summary.collected)} change="+11.7%" positive icon={<CreditCard />} tint="purple" note="this month" /><Stat title="Open maintenance" value={String(summary.openMaintenance)} change="-4" positive={false} icon={<Wrench />} tint="orange" note="needs attention" /></div> : <div className="panel loading-state">Loading analytics…</div>}</>;
}
function Messages() {
  const [items, setItems] = useState<import("./services/api").Conversation[]>([]); const [selected, setSelected] = useState<string | null>(null);
  const [messages, setMessages] = useState<import("./services/api").Message[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const [draft, setDraft] = useState(""); const [sending, setSending] = useState(false);
  useEffect(() => { api.listConversations().then(setItems).catch((e) => setError(e instanceof Error ? e.message : "Messages could not be loaded")).finally(() => setLoading(false)); }, []);
  useEffect(() => { if (selected) api.listMessages(selected).then(setMessages).catch((e) => setError(e instanceof Error ? e.message : "Conversation could not be loaded")); }, [selected]);
  useEffect(() => { if (!selected) return; return api.subscribeToConversation(selected, () => { void api.listMessages(selected).then(setMessages).catch(() => undefined); }); }, [selected]);
  const send = async (event: React.FormEvent) => { event.preventDefault(); if (!selected || !draft.trim()) return; setSending(true); try { const message = await api.sendMessage(selected, draft.trim()); setMessages((current) => [...current, message]); setDraft(""); } catch (error) { setError(error instanceof Error ? error.message : "Message failed"); } finally { setSending(false); } };
  return <><PageHeader eyebrow="Communication" title="Messages" description="Private, persisted conversations with your community." />{error && <div className="inline-alert">{error}</div>}<div className="messages-shell">{loading ? <div className="panel loading-state">Loading conversations…</div> : <><aside className="messages-list">{items.map((item) => <button key={item.id} className={selected === item.id ? "message-item active" : "message-item"} onClick={() => setSelected(item.id)}><strong>{item.subject ?? "Conversation"}</strong><small>{item.messages?.[0]?.body ?? "No messages yet"}</small></button>)}</aside><section className="messages-panel">{selected ? <><div className="messages-thread">{messages.map((message) => <div key={message.id} className={message.sender.name === "You" ? "bubble me" : "bubble"}><strong>{message.sender.name}</strong><p>{message.body}</p></div>)}</div><form className="composer" onSubmit={send}><input value={draft} placeholder="Write a message…" onChange={(event) => setDraft(event.target.value)} /><button className="primary-button" type="submit" disabled={sending}>{sending ? "Sending…" : "Send"}</button></form></> : <div className="empty-state panel">Select a conversation to continue.</div>}</section></>}</div></>;
}
function ActionModal({ type, close, notify }: { type: "payment" | "property" | "lease" | "maintenance" | "member"; close: () => void; notify: (s: string) => void }) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const configs = {
    payment: { title: "Record a payment", description: "Keep your collection ledger up to date.", icon: <CreditCard size={20} />, submit: "Record payment", fields: [{ key: "tenant", label: "Tenant", placeholder: "Who paid?" }, { key: "unit", label: "Unit", placeholder: "A-204" }, { key: "amount", label: "Amount", placeholder: "₹25000" }, { key: "date", label: "Date", placeholder: "2026-10-15", type: "date" }] },
    property: { title: "Add a property", description: "Bring a new community into your workspace.", icon: <Building2 size={20} />, submit: "Add property", fields: [{ key: "name", label: "Property name", placeholder: "Terra Heights" }, { key: "address", label: "Address", placeholder: "Bandra West, Mumbai" }, { key: "units", label: "Units", placeholder: "120", type: "number" }] },
    lease: { title: "Create a lease", description: "Capture the essentials for a new rental agreement.", icon: <FileText size={20} />, submit: "Create lease", fields: [{ key: "tenant", label: "Tenant", placeholder: "Full name" }, { key: "unit", label: "Unit", placeholder: "B-301" }, { key: "rent", label: "Monthly rent", placeholder: "₹42000" }] },
    maintenance: { title: "Log a maintenance request", description: "Give your team enough context to resolve it quickly.", icon: <Wrench size={20} />, submit: "Log request", fields: [{ key: "title", label: "Title", placeholder: "Water seepage in bathroom" }, { key: "location", label: "Location", placeholder: "Tower A / 304" }, { key: "priority", label: "Priority", placeholder: "Medium" }] },
    member: { title: "Invite a member", description: "Send a secure invitation to a resident or teammate.", icon: <Users size={20} />, submit: "Create invite", fields: [{ key: "name", label: "Full name", placeholder: "Aditi Sharma" }, { key: "email", label: "Email", placeholder: "aditi@example.com", type: "email" }, { key: "role", label: "Role", placeholder: "Resident" }] },
  }[type];
  const set = (key: string, value: string) => { setValues((current) => ({ ...current, [key]: value })); setErrors((current) => ({ ...current, [key]: "" })); };
  const submit = (event: React.FormEvent) => {
    event.preventDefault(); const nextErrors: Record<string, string> = {};
    configs.fields.forEach((field) => { const value = values[field.key]?.trim(); if (!value) nextErrors[field.key] = `${field.label} is required`; if (field.type === "email" && value && !/^\S+@\S+\.\S+$/.test(value)) nextErrors[field.key] = "Please use a valid email"; });
    setErrors(nextErrors); if (Object.keys(nextErrors).length) return; close(); notify(type === "payment" ? "Payment draft saved. Connect a payment provider to collect funds." : `${configs.title} saved successfully.`);
  };
  return <div className="modal-backdrop" onClick={close}><div className="modal" role="dialog" aria-modal="true" aria-labelledby="action-modal-title" onClick={(event) => event.stopPropagation()}><div className="modal-head"><div className="modal-icon">{configs.icon}</div><div><h2 id="action-modal-title">{configs.title}</h2><p>{configs.description}</p></div><button className="icon-button" onClick={close}><X size={16} /></button></div><form onSubmit={submit} className="modal-form">{configs.fields.map((field) => <label key={field.key}><span>{field.label}</span><input type={field.type ?? "text"} value={values[field.key] ?? ""} onChange={(event) => set(field.key, event.target.value)} placeholder={field.placeholder} />{errors[field.key] && <small>{errors[field.key]}</small>}</label>)}<div className="modal-actions"><button type="button" className="secondary-button" onClick={close}>Cancel</button><button type="submit" className="primary-button">{configs.submit}</button></div></form></div></div>;
}
export default App;
