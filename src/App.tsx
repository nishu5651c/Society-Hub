import { Building2, Filter, Heart, MapPin } from "lucide-react";
import { useState, useMemo } from "react";

export default function App() {
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>({ name: "Aarav Nair", email: "admin@societyhub.app", role: "ADMIN" });

  return (
    <div>
      {user ? (
        <MainApp user={user} onLogout={() => setUser(null)} />
      ) : (
        <AuthScreen onDemoLogin={(role) => setUser(demoUserForRole(role))} />
      )}
    </div>
  );
}

function AuthScreen({ onDemoLogin }: { onDemoLogin: (role: string) => void }) {
  const [role, setRole] = useState<string>("ADMIN");
  const roleOptions = ["ADMIN", "MANAGER", "OWNER", "STAFF", "RESIDENT"];

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <div className="auth-card glass-panel">
          <div className="brand-row">
            <div className="brand-mark">S</div>
            <div>
              <div className="brand-name">SocietyHub</div>
              <div className="brand-sub">Residential Command Center</div>
            </div>
          </div>

          <div className="hero-badge">Premium estate operations</div>

          <h1>One platform for every resident, payment, and property.</h1>
          <p className="muted">Run maintenance, rent collection, applications, and resident communication from a single workspace.</p>

          <div className="auth-form">
            <label>
              <span>Select demo role</span>
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                {roleOptions.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </label>

            <div style={{ display: "flex", gap: 12 }}>
              <button className="primary-button" onClick={() => onDemoLogin(role)}>Use demo {role.toLowerCase()} account</button>
              <button className="secondary-button" onClick={() => onDemoLogin("RESIDENT")}>Quick resident</button>
            </div>

            <div style={{ marginTop: 6 }} className="muted">Or enter your credentials to login in a real deployment (register creates a RESIDENT by default).</div>
          </div>
        </div>

        <div className="auth-visual glass-panel">
          <div className="mini-stat top-left">
            <label>Portfolio value</label>
            <strong>₹4.8 Cr</strong>
          </div>
          <div className="mini-stat top-right">
            <label>Occupancy</label>
            <strong>94.2%</strong>
          </div>
          <div className="building-visual">
            <div className="tower tower-a" />
            <div className="tower tower-b" />
            <div className="tower tower-c" />
          </div>
          <div className="insight-row">
            <div>
              <small>Collections</small>
              <strong>₹42.8L</strong>
            </div>
            <div>
              <small>Open issues</small>
              <strong>19</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MainApp({ user, onLogout }: { user: { name: string; email: string; role: string }; onLogout: () => void }) {
  return (
    <div className="property-page-shell">
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div>
          <strong>Signed in as</strong>
          <div>{user.name} · {user.role}</div>
        </div>
        <div>
          <button className="secondary-pill-button" onClick={onLogout}>Log out</button>
        </div>
      </header>

      <div className="action-row">
        <button className="primary-pill-button">+ Add property</button>
        <button className="secondary-pill-button">Filters</button>
      </div>

      <div className="society-card-panel">
        <div className="society-topbar">
          <span className="society-tag">SOCIAL LIVING / 01</span>
          <button className="favorite-button" aria-label="Save property">
            <HeartIcon />
          </button>
        </div>

        <div className="society-hero">
          <div className="orb orb-one" />
          <div className="orb orb-two" />
          <div className="hero-icon-wrap"><Building2 size={42} /></div>
          <div className="hero-title">The</div>
          <div className="ring ring-one" />
          <div className="ring ring-two" />
        </div>

        <div className="society-content-card">
          <div className="society-header-row">
            <div>
              <h2>The Ferns</h2>
              <div className="location-row"><MapPinIcon /> <span>Bandra West, Mumbai</span></div>
            </div>
            <span className="status-pill">Active</span>
          </div>

          <div className="stats-grid">
            <div className="stat-item"><span className="label">Units</span><strong>128</strong></div>
            <div className="stat-item"><span className="label">Occupancy</span><strong>94%</strong></div>
            <div className="stat-item"><span className="label">Collection</span><strong>97%</strong></div>
          </div>

          <div className="progress-line"><span style={{ width: "94%" }} /></div>

          <button className="view-property-button">View property <span>↗</span></button>
        </div>
      </div>

      <div className="bottom-action-row">
        <button className="outline-button">Filter</button>
        <button className="outline-button danger-outline">Export CSV</button>
      </div>
    </div>
  );
}

function demoUserForRole(role: string) {
  const map: Record<string, { name: string; email: string; role: string }> = {
    ADMIN: { name: "Super Admin", email: "superadmin@example.com", role: "ADMIN" },
    MANAGER: { name: "Society Admin", email: "admin@example.com", role: "MANAGER" },
    OWNER: { name: "Property Owner", email: "owner@example.com", role: "OWNER" },
    STAFF: { name: "Maintenance Staff", email: "staff@example.com", role: "STAFF" },
    RESIDENT: { name: "Tenant User", email: "tenant@example.com", role: "RESIDENT" },
  };
  return map[role] ?? map.RESIDENT;
}

function HeartIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20.8 7.4c0 5.6-8 10.6-8 10.6s-8-5-8-10.6a4.5 4.5 0 018-3.2 4.5 4.5 0 018 3.2z" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>; }
function MapPinIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 11.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" stroke="#6b6b6b" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M19.2 11.5c0 5.6-7.2 9-7.2 9s-7.2-3.4-7.2-9a7.2 7.2 0 1114.4 0z" stroke="#6b6b6b" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>; }
