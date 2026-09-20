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
    if (this.state.hasError) return <div className="error-screen"><div className="error-orbit" /><div><span className="eyebrow">Workspace recovery</span><h1>We hit a small orbit.</h1><p>Refresh the page to return to your community workspace.</p><button className="primary" onClick={() => window.location.reload()}>Reload workspace</button></div></div>;
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
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setError(""); setLoading(true);
    try { onAuthenticated(mode === "login" ? await api.login({ email: form.email, password: form.password }) : await api.register(form)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to sign in"); }
    finally { setLoading(false); }
  };
  return <div className="auth-shell"><div className="auth-card"><div className="brand auth-brand"><div className="brand-mark"><Sparkles size={17} /></div><span>society<span>hub</span></span></div><h1>{mode === "login" ? "Welcome back" : "Create your workspace"}</h1><p>{mode === "login" ? "Sign in to continue to your community." : "Start managing your community in one calm place."}</p><form onSubmit={submit}>{mode === "register" && <label>Full name<input required minLength={2} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>}<label>Email address<input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label><label>Password<input required minLength={mode === "register" ? 8 : 1} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>{error && <div className="inline-alert">{error}</div>}<button className="primary auth-submit" disabled={loading}>{loading ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}</button></form><button className="auth-switch" onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}>{mode === "login" ? "Need an account? Register" : "Already have an account? Sign in"}</button></div></div>;
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
        <div className="upgrade"><div className="upgrade-icon"><Zap size={16} /></div><strong>Unlock more with Pro</strong><p>Automate your society operations.</p><button onClick={() => notify("Thanks! We will be in touch.")}>Explore Pro <ArrowUpRight size={13} /></button></div>
        <div className="user-row"><div className="avatar purple">{user.name.slice(0, 2).toUpperCase()}</div><div><strong>{user.name}</strong><small>{user.role}</small></div><button className="table-more" aria-label="Sign out" onClick={onLogout}><LogOut size={17} /></button></div>
      </div>
    </aside>
    {mobileOpen && <div className="backdrop" onClick={() => setMobileOpen(false)} />}
    <main className="main">
      <header className="topbar"><button className="mobile-menu" onClick={() => setMobileOpen(true)}><Menu size={21} /></button><div className="breadcrumb">Workspace <span>/</span> <b>{pageTitle}</b></div><div className="top-actions"><div className="search"><Search size={17} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search anything..." /></div><div className="notification-wrap"><button className="icon-button" aria-label="Notifications" onClick={() => setNotificationsOpen((open) => !open)}><Bell size={18} />{notifications.some((item) => !item.readAt) && <i />}</button>{notificationsOpen && <div className="notification-popover"><strong>Notifications</strong>{notifications.length ? notifications.slice(0, 5).map((item) => <button key={item.id} onClick={() => { void api.markNotificationRead(item.id).then(() => setNotifications((current) => current.map((entry) => entry.id === item.id ? { ...entry, readAt: new Date().toISOString() } : entry))); setNotificationsOpen(false); }}><span className={`notification-dot ${item.readAt ? "pale-dot" : "blue-dot"}`} />{item.title}<small>{item.body}</small></button>) : <div className="empty-state">You're all caught up.</div>}<button className="notification-clear" onClick={() => { void Promise.all(notifications.filter((item) => !item.readAt).map((item) => api.markNotificationRead(item.id))); setNotifications((current) => current.map((item) => ({ ...item, readAt: item.readAt ?? new Date().toISOString() }))); notify("Notifications marked as read"); }}>Mark all as read</button></div>}</div><div className="top-avatar">{user.name.slice(0, 2).toUpperCase()}</div></div></header>
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
  return <div className="page-header"><div><div className="eyebrow">{eyebrow ?? "Good morning, Ananya"} <span className="sun">✦</span></div><h1>{title}</h1><p>{description}</p></div>{action && <button className="primary" onClick={onAction}><Plus size={17} /> {action}</button>}</div>;
}
function Overview({ go, openModal, notify }: { go: (v: View) => void; openModal: (v: "payment" | "property" | "lease" | "maintenance" | "member") => void; notify: (s: string) => void }) {
  return <><PageHeader title="Your community, in sync." description="Here's what is happening across your properties today." action="Add property" onAction={() => openModal("property")} />
    <section className="immersive-hero" aria-label="Portfolio pulse">
      <div className="hero-glow hero-glow-one" /><div className="hero-glow hero-glow-two" />
      <div className="hero-cloud cloud-one" /><div className="hero-cloud cloud-two" />
      <div className="hero-copy"><span className="hero-kicker"><Sparkles size={13} /> Portfolio pulse · live</span><h2>Spaces that feel <em>alive.</em></h2><p>One calm layer for the homes, people and moments that make your communities yours.</p><button className="hero-link" onClick={() => go("properties")}>Explore your portfolio <ArrowUpRight size={15} /></button></div>
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
    <div className="dashboard-grid"><section className="panel chart-panel"><div className="panel-head"><div><h2>Collection overview</h2><p>Monthly rent collected across all properties</p></div><button className="select">Last 6 months <ChevronDown size={14} /></button></div><div className="chart-legend"><span><i className="dot blue-dot" /> Collected</span><span><i className="dot pale-dot" /> Expected</span></div><div className="chart"><div className="y-axis"><span>₹5L</span><span>₹4L</span><span>₹3L</span><span>₹2L</span><span>₹1L</span><span>₹0</span></div><div className="bars">{[["Apr", 61, 78], ["May", 72, 84], ["Jun", 65, 77], ["Jul", 78, 89], ["Aug", 76, 93], ["Sep", 86, 98]].map(([month, value, expected]) => <div className="bar-group" key={month as string}><div className="bar-wrap"><div className="bar expected" style={{ height: `${expected}%` }} /><div className="bar collected" style={{ height: `${value}%` }} /></div><span>{month}</span></div>)}</div></div></section>
      <section className="panel"><div className="panel-head"><div><h2>Properties</h2><p>Performance at a glance</p></div><button className="link-button" onClick={() => go("properties")}>View all <ArrowUpRight size={14} /></button></div><div className="property-list">{societies.map((s) => <div className="property-item" key={s.id}><div className="property-icon" style={{ background: `${s.accent}18`, color: s.accent }}><Building2 size={18} /></div><div className="property-meta"><strong>{s.name}</strong><span>{s.units} units · {s.occupancy}% occupied</span></div><div className="mini-progress"><div style={{ width: `${s.collection}%`, background: s.accent }} /><small>{s.collection}%</small></div></div>)}</div><button className="outline full" onClick={() => openModal("property")}><Plus size={15} /> Add a property</button></section>
    </div>
    <div className="lower-grid"><section className="panel"><div className="panel-head"><div><h2>Recent payments</h2><p>The latest rent activity</p></div><button className="link-button" onClick={() => go("payments")}>View all <ArrowUpRight size={14} /></button></div><PaymentTable compact /></section><section className="panel activity-panel"><div className="panel-head"><div><h2>Needs attention</h2><p>A few things need your eyes</p></div></div><div className="attention"><div className="attention-icon red"><Wrench size={17} /></div><div><strong>4 maintenance requests</strong><span>2 high priority requests are open</span></div><button onClick={() => go("maintenance")}><ArrowUpRight size={16} /></button></div><div className="attention"><div className="attention-icon yellow"><CalendarDays size={17} /></div><div><strong>3 rents due this week</strong><span>Send a friendly reminder</span></div><button onClick={() => go("payments")}><ArrowUpRight size={16} /></button></div><button className="outline full" onClick={() => openModal("payment")}><Plus size={15} /> Record a payment</button></section></div>
    <div className="tip"><Sparkles size={19} /><div><strong>Make your next move count</strong><span>Collection is up 12.8% this month. Keep the momentum going by sending reminders to the 3 upcoming rents.</span></div><button onClick={() => notify("Reminders queued for 3 tenants")}>Send reminders <ArrowUpRight size={14} /></button></div>
  </>;
}
function Stat({ title, value, change, positive, icon, tint, note }: { title: string; value: string; change: string; positive: boolean; icon: React.ReactNode; tint: string; note: string }) { return <div className="stat-card"><div className={`stat-icon ${tint}`}>{icon}</div><div className="stat-title">{title}<span className={positive ? "change positive" : "change"}>{positive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}{change}</span></div><strong className="stat-value">{value}</strong><small>{note}</small></div>; }
function PaymentTable({ compact = false, rows = payments }: { compact?: boolean; rows?: typeof payments }) { return <div className="table-wrap"><table><thead><tr><th>Tenant</th><th>Unit</th><th>Amount</th><th>Date</th><th>Status</th></tr></thead><tbody>{rows.slice(0, compact ? 4 : 10).map((p) => <tr key={p.id}><td><div className="person"><span className="avatar">{p.initials}</span><strong>{p.tenant}</strong></div></td><td>{p.unit}</td><td><b>{money(p.amount)}</b></td><td>{p.date}</td><td><span className={`status ${statusClass(p.status)}`}>{p.status}</span></td></tr>)}</tbody></table></div>; }
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
    <div className="property-toolbar"><div className="tabs"><button className={showActive ? "selected" : ""} onClick={() => setShowActive(true)}>All properties <span>{items.length}</span></button><button className={!showActive ? "selected" : ""} onClick={() => setShowActive(false)}>Archived <span>0</span></button></div><div className="property-tools"><label className="property-search"><Search size={15} /><input aria-label="Search properties" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search properties" /></label><button className="filter-btn"><SlidersHorizontal size={15} /> Filters</button></div></div>
    {error && <div className="inline-alert">{error}</div>}
    {loading ? <div className="panel loading-state">Loading properties...</div> : visibleItems.length ? <div className="property-cards">{visibleItems.map((s, index) => <article className={`property-card property-card-${index % 3}`} key={s.id}><div className="cover" style={{ "--accent": s.accent } as React.CSSProperties} role="img" aria-label={`${s.name} property view`}><span className="cover-kicker">SOCIAL LIVING / {String(index + 1).padStart(2, "0")}</span><div className="cover-architecture"><Building2 size={34} strokeWidth={1.25} /><span>{s.name.split(" ")[0]}</span></div><button aria-label={`Save ${s.name}`} onClick={() => notify(`${s.name} saved to favourites`)}><Heart size={17} /></button></div><div className="property-card-body"><div className="card-title"><div><h2>{s.name}</h2><p><MapPin size={11} /> {s.address}</p></div><span className="status paid">Active</span></div><div className="property-numbers"><div><small>Units</small><strong>{s.units}</strong></div><div><small>Occupancy</small><strong>{s.occupancy}%</strong></div><div><small>Collection</small><strong>{s.collection}%</strong></div></div><div className="progress-line"><span style={{ width: `${s.collection}%`, background: s.accent }} /></div><button className="outline full" onClick={() => notify(`Opening ${s.name}`)}>View property <ArrowUpRight size={14} /></button></div></article>)}</div> : <div className="panel empty-state"><Building2 size={22} /><strong>{showActive ? "No properties match that search" : "No archived properties"}</strong><span>Try another search or add a new community to your portfolio.</span></div>}
  </>;
}
function Rentals({ notify, openModal }: { notify: (s: string) => void; openModal: (v: "lease") => void }) { const [leases, setLeases] = useState<import("./services/api").Lease[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(""); useEffect(() => { api.listLeases().then(setLeases).catch((cause) => setError(cause instanceof Error ? cause.message : "Leases could not be loaded")).finally(() => setLoading(false)); }, []); return <><PageHeader eyebrow="Leasing" title="Rentals" description="Stay ahead of renewals and keep occupancy healthy." action="New lease" onAction={() => openModal("lease")} /><div className="stats-grid rental-stats"><Stat title="Active leases" value={String(leases.filter((l) => l.status === "ACTIVE").length)} change="" positive icon={<FileText />} tint="blue" note="from your portfolio" /><Stat title="Renewals this month" value="—" change="" positive={false} icon={<CalendarDays />} tint="orange" note="requires lease dates" /><Stat title="Avg. lease value" value={leases.length ? money(Math.round(leases.reduce((sum, lease) => sum + lease.monthlyRent, 0) / leases.length)) : "—"} change="" positive icon={<CreditCard />} tint="green" note="across loaded leases" /></div><section className="panel"><div className="panel-head"><div><h2>Lease directory</h2><p>Active and upcoming rental agreements</p></div><button className="filter-btn"><SlidersHorizontal size={15} /> Filter</button></div>{error && <div className="inline-alert">{error}</div>}{loading ? <div className="loading-state">Loading leases…</div> : <div className="table-wrap"><table><thead><tr><th>Tenant</th><th>Property / unit</th><th>Monthly rent</th><th>Lease ends</th><th>Status</th><th></th></tr></thead><tbody>{leases.map((lease) => { const name = lease.tenant?.name ?? "Resident"; return <tr key={lease.id}><td><div className="person"><span className="avatar">{name.split(" ").map((x) => x[0]).join("")}</span><strong>{name}</strong></div></td><td>{lease.property?.name ?? "Property"} · {lease.unit}</td><td><b>{money(lease.monthlyRent)}</b></td><td>{new Date(lease.endsAt).toLocaleDateString()}</td><td><span className={`status ${lease.status.toLowerCase()}`}>{lease.status}</span></td><td><button className="table-more" onClick={() => notify(`Lease details opened for ${name}`)}><MoreHorizontal size={17} /></button></td></tr>; })}</tbody></table></div>}</section></>; }
function Payments({ openModal, query, notify }: { openModal: (v: "payment") => void; query: string; notify: (s: string) => void }) { const [items, setItems] = useState(payments); const [loading, setLoading] = useState(true); const [error, setError] = useState(""); useEffect(() => { api.listPayments().then(setItems).catch((cause) => setError(cause instanceof Error ? cause.message : "Payments could not be loaded")).finally(() => setLoading(false)); }, []); const filtered = useMemo(() => items.filter((p) => `${p.tenant} ${p.unit} ${p.society}`.toLowerCase().includes(query.toLowerCase())), [query, items]); return <><PageHeader eyebrow="Finance" title="Rent collection" description="Every payment accounted for. Every tenant in the loop." action="Record payment" onAction={() => openModal("payment")} /><div className="stats-grid"><Stat title="Collected this month" value={money(items.filter((p) => p.status === "Paid").reduce((sum, p) => sum + p.amount, 0))} change="" positive icon={<CreditCard />} tint="blue" note="from loaded activity" /><Stat title="Collection rate" value="—" change="" positive icon={<Sparkles />} tint="green" note="requires expected totals" /><Stat title="Pending collection" value={money(items.filter((p) => p.status !== "Paid").reduce((sum, p) => sum + p.amount, 0))} change="" positive={false} icon={<CalendarDays />} tint="orange" note="follow up required" /></div><section className="panel"><div className="panel-head"><div><h2>Payment activity</h2><p>Search, review and reconcile rent payments</p></div><div className="head-actions"><button className="filter-btn"><SlidersHorizontal size={15} /> Filter</button><button className="outline" onClick={() => notify("Export prepared")}>Export CSV</button></div></div>{error && <div className="inline-alert" role="alert">{error}</div>}{loading ? <div className="loading-state" aria-live="polite">Loading payments…</div> : <PaymentTable rows={filtered} />}</section></>; }
function MaintenancePage({ notify, openModal }: { notify: (s: string) => void; openModal: (v: "maintenance") => void }) {
  const [items, setItems] = useState(maintenance); const [filter, setFilter] = useState("ALL"); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  useEffect(() => { api.listMaintenance().then((rows) => setItems(rows as typeof maintenance)).catch((cause) => setError(cause instanceof Error ? cause.message : "Showing saved maintenance data")).finally(() => setLoading(false)); }, []);
  const visible = filter === "ALL" ? items : items.filter((item) => item.status.toUpperCase().replace(" ", "_") === filter);
  return <><PageHeader eyebrow="Operations" title="Maintenance" description="Resolve issues quickly and keep residents happy." action="Log a request" onAction={() => openModal("maintenance")} /><div className="filter-row"><div className="tabs">{[["ALL","All requests"],["OPEN","Open"],["IN_PROGRESS","In progress"],["RESOLVED","Resolved"]].map(([value, label]) => <button key={value} className={filter === value ? "selected" : ""} onClick={() => setFilter(value)}>{label} <span>{value === "ALL" ? items.length : items.filter((item) => item.status.toUpperCase().replace(" ", "_") === value).length}</span></button>)}</div><button className="filter-btn"><SlidersHorizontal size={15} /> Filters</button></div><section className="panel"><div className="panel-head"><div><h2>Request queue</h2><p>Track every issue from report to resolution</p></div><button className="select">Newest first <ChevronDown size={14} /></button></div>{error && <div className="inline-alert">{error}</div>}{loading ? <div className="loading-state">Loading requests…</div> : visible.length ? <div className="request-list">{visible.map((m) => <div className="request" key={m.id}><div className={`request-icon ${m.priority.toLowerCase()}`}><Wrench size={18} /></div><div className="request-main"><strong>{m.title}</strong><span>{m.location} · Reported by {m.reporter}</span></div><span className={`priority ${m.priority.toLowerCase()}`}>{m.priority} priority</span><span className={`status ${statusClass(m.status)}`}>{m.status}</span><small>{m.created}</small><button className="table-more" onClick={() => notify(`Opened "${m.title}"`)}><MoreHorizontal size={17} /></button></div>)}</div> : <div className="empty-state">No requests in this lane.</div>}</section></>;
}
function Members({ notify, openModal }: { notify: (s: string) => void; openModal: (v: "member") => void }) { const [members, setMembers] = useState(payments); useEffect(() => { api.listMembers().then((items) => setMembers(items.map((member) => ({ id: member.id, tenant: member.user.name, unit: member.unit ?? "—", society: member.property.name, amount: 0, date: member.joinedAt.slice(0, 10), status: "Paid" as const, initials: member.user.name.split(" ").map((part) => part[0]).join("").slice(0, 2) })))).catch(() => undefined); }, []); return <><PageHeader eyebrow="Community" title="Members & tenants" description="The people who make your communities feel like home." action="Invite member" onAction={() => openModal("member")} /><div className="member-banner"><div className="banner-icon"><Users size={22} /></div><div><strong>{members.length} active members</strong><span>Members loaded from your directory</span></div><div className="member-avatars">{members.slice(0, 3).map((member) => <span key={member.id}>{member.initials}</span>)}</div><button className="outline" onClick={() => notify("Invite residents from the member workflow")}>Invite residents</button></div><section className="panel"><div className="panel-head"><div><h2>Resident directory</h2><p>Members across all properties</p></div><button className="filter-btn"><Search size={15} /> Search members</button></div><div className="table-wrap"><table><thead><tr><th>Member</th><th>Home</th><th>Role</th><th>Joined</th><th>Payment standing</th></tr></thead><tbody>{members.map((p, i) => <tr key={p.id}><td><div className="person"><span className="avatar">{p.initials}</span><div><strong>{p.tenant}</strong><small>Resident</small></div></div></td><td>{p.society} · {p.unit}</td><td><span className="role">Resident</span></td><td>{p.date}</td><td><span className={`status ${statusClass(p.status)}`}>Up to date</span></td></tr>)}</tbody></table></div></section></>; }
function SettingsPage({ notify }: { notify: (s: string) => void }) { return <><PageHeader eyebrow="Workspace" title="Settings" description="Shape SocietyHub around how your team works." /><div className="settings-layout"><div className="settings-nav"><button className="active">Workspace profile</button><button>Team & permissions</button><button>Notifications</button><button>Billing & plan</button><button>Integrations</button></div><section className="panel settings-panel"><h2>Workspace profile</h2><p className="section-copy">This information is visible to your team and residents.</p><label>Workspace name<input defaultValue="SocietyHub Admin" /></label><label>Primary contact email<input defaultValue="ananya@societyhub.in" /></label><label>Timezone<select defaultValue="Asia/Kolkata"><option value="Asia/Kolkata">India Standard Time (IST)</option></select></label><div className="settings-footer"><span>Last saved a few seconds ago</span><button className="primary" onClick={() => notify("Settings saved")}>Save changes</button></div></section></div></>; }
function Applications() {
  const [items, setItems] = useState<import("./services/api").Application[]>([]);
  const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  useEffect(() => { api.listApplications().then(setItems).catch((e) => setError(e instanceof Error ? e.message : "Applications could not be loaded")).finally(() => setLoading(false)); }, []);
  const review = async (item: import("./services/api").Application, status: "UNDER_REVIEW" | "APPROVED" | "REJECTED") => { try { const updated = await api.reviewApplication(item.id, { status }); setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, ...updated } : entry)); } catch (cause) { setError(cause instanceof Error ? cause.message : "Application could not be updated"); } };
  return <><PageHeader eyebrow="Verification" title="Applications" description="Review resident applications and verification status." />{error && <div className="inline-alert">{error}</div>}<section className="panel">{loading ? <div className="loading-state">Loading applications…</div> : items.length === 0 ? <div className="empty-state">No applications yet.</div> : <div className="table-wrap"><table><thead><tr><th>Property</th><th>Unit</th><th>Status</th><th>Verification</th><th>Review</th></tr></thead><tbody>{items.map((item) => <tr key={item.id}><td>{item.property?.name ?? "Property"}</td><td>{item.unit}</td><td><span className={`status ${statusClass(item.status)}`}>{item.status.replace("_", " ")}</span></td><td><span className={`status ${statusClass(item.verification?.status ?? "PENDING")}`}>{item.verification?.status ?? "PENDING"}</span></td><td><div className="head-actions"><button className="outline" onClick={() => void review(item, "UNDER_REVIEW")}>Review</button><button className="outline" onClick={() => void review(item, "APPROVED")}>Approve</button><button className="table-more" aria-label="Reject application" onClick={() => void review(item, "REJECTED")}><X size={15} /></button></div></td></tr>)}</tbody></table></div>}</section></>;
}

function Analytics() {
  const [summary, setSummary] = useState<import("./services/api").AnalyticsSummary | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { api.listAnalytics().then(setSummary).catch((cause) => setError(cause instanceof Error ? cause.message : "Analytics could not be loaded")); }, []);
  return <><PageHeader eyebrow="Insights" title="Analytics" description="A clear pulse on occupancy, collection and operations." />{error && <div className="inline-alert">{error}</div>}{summary ? <><div className="stats-grid"><Stat title="Properties" value={String(summary.properties)} change="" positive icon={<Building2 />} tint="blue" note={`${summary.units} total units`} /><Stat title="Collected" value={money(summary.collected)} change="" positive icon={<CreditCard />} tint="green" note="paid payments" /><Stat title="Open maintenance" value={String(summary.openMaintenance)} change="" positive={false} icon={<Wrench />} tint="orange" note="needs attention" /><Stat title="Active leases" value={String(summary.activeLeases)} change="" positive icon={<FileText />} tint="purple" note="currently running" /></div><section className="panel"><div className="panel-head"><div><h2>Operational pulse</h2><p>Live totals from your persisted workspace data</p></div></div><div className="chart analytics-chart"><div style={{ height: `${Math.min(100, summary.properties * 15 + 10)}%` }} /><div style={{ height: `${Math.min(100, summary.activeLeases * 12 + 10)}%` }} /><div style={{ height: `${Math.min(100, summary.collected ? 75 : 10)}%` }} /><div style={{ height: `${Math.min(100, summary.openMaintenance * 10 + 10)}%` }} /></div><div className="chart-legend"><span>Properties</span><span>Leases</span><span>Collection</span><span>Maintenance</span></div></section></> : <div className="panel loading-state">Loading analytics…</div>}</>;
}
function Messages() {
  const [items, setItems] = useState<import("./services/api").Conversation[]>([]); const [selected, setSelected] = useState<string | null>(null);
  const [messages, setMessages] = useState<import("./services/api").Message[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const [draft, setDraft] = useState(""); const [sending, setSending] = useState(false);
  useEffect(() => { api.listConversations().then(setItems).catch((e) => setError(e instanceof Error ? e.message : "Messages could not be loaded")).finally(() => setLoading(false)); }, []);
  useEffect(() => { if (selected) api.listMessages(selected).then(setMessages).catch((e) => setError(e instanceof Error ? e.message : "Conversation could not be loaded")); }, [selected]);
  useEffect(() => {
    if (!selected) return;
    return api.subscribeToConversation(selected, () => { void api.listMessages(selected).then(setMessages).catch(() => undefined); });
  }, [selected]);
  const send = async (event: React.FormEvent) => { event.preventDefault(); if (!selected || !draft.trim()) return; setSending(true); try { const message = await api.sendMessage(selected, draft.trim()); setMessages((current) => [...current, message]); setDraft(""); } catch (cause) { setError(cause instanceof Error ? cause.message : "Message could not be sent"); } finally { setSending(false); } };
  return <><PageHeader eyebrow="Communication" title="Messages" description="Private, persisted conversations with your community." />{error && <div className="inline-alert">{error}</div>}<div className="dashboard-grid"><section className="panel">{loading ? <div className="loading-state">Loading conversations…</div> : items.length === 0 ? <div className="empty-state">No conversations yet.</div> : items.map((item) => <button className="list-row" key={item.id} onClick={() => setSelected(item.id)}>{item.subject ?? "Conversation"}</button>)}</section>{selected && <section className="panel"><h2>Conversation</h2>{messages.length === 0 ? <div className="empty-state">No messages yet.</div> : messages.map((message) => <p key={message.id}><strong>{message.sender.name}:</strong> {message.body}</p>)}<form className="message-compose" onSubmit={send}><input aria-label="Message" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Write a message…" /><button className="primary" disabled={sending || !draft.trim()}>{sending ? "Sending…" : "Send"}</button></form></section>}</div></>;
}
function ActionModal({ type, close, notify }: { type: "payment" | "property" | "lease" | "maintenance" | "member"; close: () => void; notify: (s: string) => void }) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const configs = {
    payment: { title: "Record a payment", description: "Keep your collection ledger up to date.", icon: <CreditCard size={20} />, submit: "Record payment", fields: [{ key: "tenant", label: "Tenant name", placeholder: "e.g. Aarav Mehta" }, { key: "amount", label: "Amount", placeholder: "e.g. 38500", type: "number" }, { key: "unit", label: "Property / unit", placeholder: "e.g. The Ferns - B-1204" }, { key: "date", label: "Payment date", type: "date" }] },
    property: { title: "Add a property", description: "Bring a new community into your workspace.", icon: <Building2 size={20} />, submit: "Add property", fields: [{ key: "name", label: "Property name", placeholder: "e.g. The Ferns" }, { key: "location", label: "Location", placeholder: "City or neighbourhood" }, { key: "units", label: "Number of units", placeholder: "e.g. 120", type: "number" }, { key: "email", label: "Management email", placeholder: "manager@example.com", type: "email" }] },
    lease: { title: "Create a lease", description: "Capture the essentials for a new rental agreement.", icon: <FileText size={20} />, submit: "Create lease", fields: [{ key: "tenant", label: "Tenant name", placeholder: "e.g. Aarav Mehta" }, { key: "rent", label: "Monthly rent", placeholder: "e.g. 38500", type: "number" }, { key: "unit", label: "Property / unit", placeholder: "e.g. The Ferns - B-1204" }, { key: "end", label: "Lease end date", type: "date" }] },
    maintenance: { title: "Log a maintenance request", description: "Give your team enough context to resolve it quickly.", icon: <Wrench size={20} />, submit: "Log request", fields: [{ key: "title", label: "Issue title", placeholder: "e.g. Water pressure low" }, { key: "location", label: "Location", placeholder: "Tower, floor or unit" }, { key: "reporter", label: "Reported by", placeholder: "Resident or team member" }, { key: "priority", label: "Priority", type: "select" }] },
    member: { title: "Invite a member", description: "Send a secure invitation to a resident or teammate.", icon: <Users size={20} />, submit: "Create invite", fields: [{ key: "name", label: "Full name", placeholder: "e.g. Aarav Mehta" }, { key: "email", label: "Email address", placeholder: "name@example.com", type: "email" }, { key: "unit", label: "Property / unit", placeholder: "e.g. The Ferns - B-1204" }, { key: "role", label: "Role", type: "select" }] },
  }[type];
  const set = (key: string, value: string) => { setValues((current) => ({ ...current, [key]: value })); setErrors((current) => ({ ...current, [key]: "" })); };
  const submit = (event: React.FormEvent) => {
    event.preventDefault(); const nextErrors: Record<string, string> = {};
    configs.fields.forEach((field) => { const value = values[field.key]?.trim(); if (!value) nextErrors[field.key] = `${field.label} is required`; if (field.type === "email" && value && !/^\S+@\S+\.\S+$/.test(value)) nextErrors[field.key] = "Enter a valid email address"; if (field.type === "number" && value && Number(value) <= 0) nextErrors[field.key] = "Enter a value greater than 0"; });
    setErrors(nextErrors); if (Object.keys(nextErrors).length) return; close(); notify(type === "payment" ? "Payment draft saved. Connect a payment provider to collect funds." : `${configs.title} saved successfully`);
  };
  return <div className="modal-backdrop" onClick={close}><div className="modal" role="dialog" aria-modal="true" aria-labelledby="action-modal-title" onClick={(event) => event.stopPropagation()}><div className="modal-head"><div><div className="modal-icon">{configs.icon}</div><h2 id="action-modal-title">{configs.title}</h2><p>{configs.description}</p></div><button className="close" aria-label="Close dialog" onClick={close}><X size={18} /></button></div><form onSubmit={submit}><div className="form-grid">{configs.fields.map((field) => <label key={field.key}>{field.label}{field.type === "select" ? <select value={values[field.key] ?? ""} onChange={(event) => set(field.key, event.target.value)}><option value="">Select {field.label.toLowerCase()}</option><option>Low</option><option>Medium</option><option>High</option><option>Resident</option><option>Owner</option></select> : <input value={values[field.key] ?? ""} onChange={(event) => set(field.key, event.target.value)} placeholder={field.placeholder} type={field.type ?? "text"} min={field.type === "number" ? "1" : undefined} />} {errors[field.key] && <small className="field-error">{errors[field.key]}</small>}</label>)}</div><div className="modal-actions"><button type="button" className="outline" onClick={close}>Cancel</button><button type="submit" className="primary">{configs.submit} <ArrowUpRight size={14} /></button></div></form></div></div>;
}
export default App;
