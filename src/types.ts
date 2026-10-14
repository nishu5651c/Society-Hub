:root {
  --bg: #0b1020;
  --bg-soft: #101a2d;
  --panel: rgba(18, 26, 43, 0.72);
  --panel-strong: rgba(24, 34, 54, 0.9);
  --line: rgba(148, 163, 184, 0.16);
  --text: #edf2ff;
  --muted: #99a5c0;
  --primary: #7c9cff;
  --primary-strong: #5e7dff;
  --success: #43d39e;
  --warning: #f6b55b;
  --danger: #ff7d82;
  --shadow: 0 20px 50px rgba(15, 23, 42, 0.45);
}

* {
  box-sizing: border-box;
}

html, body, #root {
  margin: 0;
  min-height: 100%;
  background:
    radial-gradient(circle at top left, rgba(124, 156, 255, 0.18), transparent 25%),
    linear-gradient(180deg, #09111d 0%, #101a2d 100%);
  font-family: Inter, "Segoe UI", sans-serif;
  color: var(--text);
}

body {
  min-height: 100vh;
}

button, input {
  font: inherit;
}

button {
  cursor: pointer;
}

a {
  color: inherit;
  text-decoration: none;
}

.auth-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 32px;
}

.auth-shell {
  width: min(1220px, 100%);
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 28px;
}

.glass-panel {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 24px;
  box-shadow: var(--shadow);
  backdrop-filter: blur(20px);
}

.auth-card,
.auth-visual,
.sidebar,
.dashboard {
  padding: 26px;
}

.auth-card {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.brand-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-mark {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: 14px;
  background: linear-gradient(135deg, var(--primary), #8ed6ff);
  color: white;
  font-weight: 800;
}

.brand-name {
  font-size: 1.2rem;
  font-weight: 700;
}

.brand-sub {
  color: var(--muted);
  font-size: 0.78rem;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: fit-content;
  padding: 8px 12px;
  background: rgba(124, 156, 255, 0.12);
  border: 1px solid rgba(124, 156, 255, 0.3);
  border-radius: 999px;
  color: #dfe9ff;
  font-size: 0.8rem;
}

.auth-card h1 {
  margin: 0;
  font-size: clamp(2.3rem, 4vw, 4rem);
  line-height: 1.05;
  letter-spacing: -0.06em;
}

.muted {
  color: var(--muted);
  margin: 0;
  line-height: 1.6;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 8px;
}

.auth-form label {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: var(--muted);
  font-size: 0.9rem;
}

.auth-form input,
.search-box input,
.chat-input-row input {
  width: 100%;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid var(--line);
  color: var(--text);
  border-radius: 14px;
  padding: 0.9rem 1rem;
  outline: none;
}

.primary-button,
.secondary-button {
  border: none;
  border-radius: 14px;
  padding: 0.9rem 1.1rem;
  font-weight: 700;
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.primary-button {
  background: linear-gradient(135deg, var(--primary), var(--primary-strong));
  color: white;
}

.secondary-button {
  background: rgba(124, 156, 255, 0.08);
  color: var(--text);
  border: 1px solid rgba(124, 156, 255, 0.18);
}

.primary-button.small,
.secondary-button.small {
  padding: 0.7rem 0.9rem;
  font-size: 0.86rem;
}

.primary-button:hover,
.secondary-button:hover {
  transform: translateY(-1px);
}

.auth-visual {
  position: relative;
  min-height: 620px;
  overflow: hidden;
  background:
    radial-gradient(circle at center, rgba(124, 156, 255, 0.18), transparent 35%),
    linear-gradient(180deg, rgba(9, 17, 29, 0.85), rgba(16, 26, 45, 0.96));
}

.mini-stat {
  position: absolute;
  z-index: 2;
  padding: 12px 14px;
  border-radius: 16px;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid var(--line);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.mini-stat label {
  color: var(--muted);
  font-size: 0.72rem;
}

.mini-stat strong {
  font-size: 1.2rem;
}

.top-left { top: 20px; left: 22px; }
.top-right { top: 20px; right: 22px; }

.building-visual {
  position: absolute;
  inset: 100px 28px 90px 28px;
  display: flex;
  align-items: end;
  justify-content: center;
  gap: 18px;
}

.tower {
  border-radius: 20px 20px 0 0;
  width: 120px;
  background: linear-gradient(180deg, rgba(124, 156, 255, 0.9), rgba(17, 25, 37, 0.9));
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
}

.tower-a { height: 52%; }
.tower-b { height: 76%; }
.tower-c { height: 64%; }

.insight-row {
  position: absolute;
  left: 24px;
  right: 24px;
  bottom: 24px;
  display: grid;
  grid-template-columns: repeat(2, minmax(120px, 1fr));
  gap: 14px;
}

.insight-row > div {
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid var(--line);
  border-radius: 18px;
  padding: 18px;
}

.insight-row small {
  display: block;
  color: var(--muted);
  margin-bottom: 8px;
}

.app-shell {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 24px;
  min-height: 100vh;
  padding: 24px;
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.profile-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 12px;
  border-radius: 16px;
  background: rgba(15, 23, 42, 0.75);
  border: 1px solid var(--line);
}

.profile-card > div {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #8d7bff, #5ad3db);
  font-weight: 700;
  color: white;
}

.avatar.small {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  font-size: 0.75rem;
}

.profile-card strong,
.chat-thread strong,
.property-head strong,
.setting-row span,
.panel-header h3,
.maintenance-card h3,
.property-detail h3 {
  display: block;
}

.profile-card small {
  color: var(--muted);
  display: block;
}

.nav-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-item {
  width: 100%;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 12px;
  color: var(--text);
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-align: left;
  padding: 0.9rem 0.9rem;
}

.nav-item.active {
  background: rgba(124, 156, 255, 0.12);
  border-color: rgba(124, 156, 255, 0.25);
}

.sidebar-footer {
  margin-top: auto;
  display: grid;
  gap: 12px;
}

.mini-panel {
  padding: 14px;
  border-radius: 14px;
  background: rgba(20, 30, 50, 0.8);
  border: 1px solid var(--line);
}

.mini-label {
  color: var(--muted);
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.dashboard {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.eyebrow {
  color: #bfd0ff;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  margin-bottom: 10px;
}

.eyebrow.accent { color: #9ec8ff; }

.topbar h2,
.panel-header h3,
.maintenance-card h3,
.property-detail h3,
.settings-card h3 {
  margin: 0;
  font-size: clamp(1.3rem, 2vw, 2rem);
  letter-spacing: -0.04em;
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: min(350px, 50vw);
  padding: 0.4rem 0.8rem;
  border-radius: 12px;
  border: 1px solid var(--line);
  background: rgba(12, 18, 30, 0.7);
}

.search-box input {
  background: transparent;
  border: none;
  padding: 0.7rem 0.2rem;
  color: var(--text);
}

.hero-panel {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 22px;
  padding: 28px;
}

.hero-copy h1 {
  margin: 0;
  font-size: clamp(2.2rem, 3vw, 3.4rem);
  letter-spacing: -0.06em;
  line-height: 1.02;
}

.hero-copy p {
  color: var(--muted);
  line-height: 1.7;
  max-width: 700px;
}

.hero-actions {
  margin-top: 20px;
  display: flex;
  gap: 12px;
}

.hero-stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(160px, 1fr));
  gap: 16px;
  align-content: center;
}

.stat-box {
  border-radius: 18px;
  border: 1px solid var(--line);
  background: rgba(15, 23, 42, 0.78);
  padding: 18px 16px;
}

.stat-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  color: var(--muted);
  font-size: 0.8rem;
}

.trend-tag {
  background: rgba(67, 211, 158, 0.12);
  color: var(--success);
  border-radius: 999px;
  padding: 6px 8px;
  font-size: 0.72rem;
}

.stat-box strong {
  display: block;
  font-size: clamp(1.6rem, 2vw, 2.4rem);
  letter-spacing: -0.05em;
}

.stat-box small {
  color: var(--muted);
}

.grid-two {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 22px;
}

.panel-block,
.table-panel,
.maintenance-card,
.settings-card,
.chat-box,
.messages-list,
.property-detail {
  padding: 22px;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
}

.bars-chart {
  height: 180px;
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 10px;
  padding-top: 20px;
}

.bar-col {
  height: 100%;
  width: 100%;
  display: flex;
  align-items: end;
  justify-content: center;
}

.bar {
  width: 100%;
  border-radius: 12px 12px 0 0;
  background: linear-gradient(180deg, #8cb3ff 0%, #6d81ff 100%);
  box-shadow: 0 12px 30px rgba(111, 138, 255, 0.2);
}

.legend-row {
  margin-top: 12px;
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  font-size: 0.72rem;
  color: var(--muted);
}

.task-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 12px;
}

.task-list li {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--muted);
  padding: 12px 0;
  border-bottom: 1px solid var(--line);
}

.properties-layout {
  display: grid;
  grid-template-columns: 1.3fr 0.7fr;
  gap: 20px;
}

.property-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(220px, 1fr));
  gap: 18px;
}

.property-card {
  padding: 0;
  border: 1px solid var(--line);
  border-radius: 20px;
  background: rgba(13, 20, 34, 0.78);
  overflow: hidden;
  text-align: left;
  color: var(--text);
}

.property-card.selected {
  border-color: rgba(124, 156, 255, 0.55);
  box-shadow: 0 18px 40px rgba(88, 111, 255, 0.18);
}

.property-image {
  min-height: 170px;
  display: grid;
  place-items: end start;
  padding: 18px;
  background: linear-gradient(135deg, #5b7cff, #67d0ff);
}

.property-image span {
  background: rgba(8, 12, 20, 0.42);
  border-radius: 999px;
  padding: 7px 10px;
  border: 1px solid rgba(255,255,255,0.15);
}

.property-body {
  padding: 16px;
}

.property-head,
.card-topline,
.setting-row,
.detail-actions,
.property-price,
.card-meta,
.panel-header,
.topbar-actions,
.chat-input-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.property-body small,
.property-body p,
.panel-header p,
.maintenance-card p,
.property-detail p,
.chat-thread p {
  color: var(--muted);
}

.property-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 14px 0;
  font-size: 0.74rem;
  color: var(--muted);
}

.property-price strong {
  font-size: 1.2rem;
}

.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 28px;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 0.72rem;
  border: 1px solid transparent;
}

.badge.success {
  background: rgba(67, 211, 158, 0.12);
  color: var(--success);
  border-color: rgba(67, 211, 158, 0.26);
}

.badge.warning {
  background: rgba(246, 181, 91, 0.12);
  color: var(--warning);
  border-color: rgba(246, 181, 91, 0.26);
}

.badge.muted {
  background: rgba(148, 163, 184, 0.1);
  color: var(--muted);
}

.property-detail {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(120px, 1fr));
  gap: 12px;
}

.detail-grid > div {
  background: rgba(15, 23, 42, 0.72);
  border: 1px solid var(--line);
  border-radius: 14px;
  padding: 12px 14px;
}

.detail-grid label {
  display: block;
  color: var(--muted);
  font-size: 0.72rem;
  margin-bottom: 6px;
}

.amenities-list {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 0;
  margin: 12px 0 0;
}

.amenities-list li {
  padding: 8px 10px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: rgba(14, 24, 38, 0.7);
  color: var(--muted);
  font-size: 0.76rem;
}

.link-button {
  background: transparent;
  color: #bfd0ff;
  border: none;
  padding: 0;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 0.9rem 0.8rem;
  border-bottom: 1px solid var(--line);
  text-align: left;
}

th {
  color: var(--muted);
  font-weight: 600;
  font-size: 0.76rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

tbody tr:hover {
  background: rgba(124, 156, 255, 0.04);
}

.maintenance-grid,
.settings-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(260px, 1fr));
  gap: 18px;
}

.maintenance-card,
.settings-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card-meta {
  color: var(--muted);
  font-size: 0.75rem;
}

.messages-layout {
  display: grid;
  grid-template-columns: 0.8fr 1.2fr;
  gap: 18px;
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chat-thread {
  display: grid;
  grid-template-columns: 42px 1fr auto;
  gap: 12px;
  align-items: center;
  padding: 10px 8px;
  border-radius: 12px;
  border: 1px solid transparent;
}

.chat-thread:hover {
  background: rgba(124, 156, 255, 0.04);
  border-color: var(--line);
}

.chat-thread p,
.chat-thread span {
  margin: 0;
  color: var(--muted);
  font-size: 0.75rem;
}

.chat-box {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.chat-feed {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 260px;
  padding: 12px 0;
}

.bubble {
  max-width: 75%;
  padding: 12px 14px;
  border-radius: 16px;
  line-height: 1.5;
}

.bubble.incoming {
  background: rgba(124, 156, 255, 0.08);
  border: 1px solid rgba(124, 156, 255, 0.3);
  align-self: flex-start;
}

.bubble.outgoing {
  background: rgba(67, 211, 158, 0.1);
  border: 1px solid rgba(67, 211, 158, 0.3);
  align-self: flex-end;
}

.chat-input-row {
  gap: 12px;
}

.chat-input-row input {
  flex: 1;
}

.online-dot {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  background: rgba(67, 211, 158, 0.12);
  color: var(--success);
  border-radius: 999px;
  font-size: 0.72rem;
}

.online-dot::before {
  content: "";
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--success);
  display: inline-block;
}

.setting-row {
  border-bottom: 1px solid var(--line);
  padding: 12px 0;
  color: var(--muted);
}

@media (max-width: 980px) {
  .auth-shell,
  .hero-panel,
  .properties-layout,
  .messages-layout,
  .grid-two {
    grid-template-columns: 1fr;
  }

  .app-shell {
    grid-template-columns: 1fr;
  }

  .sidebar {
    order: 2;
  }
}

@media (max-width: 720px) {
  .auth-page,
  .app-shell {
    padding: 16px;
  }

  .topbar,
  .topbar-actions,
  .hero-actions,
  .chat-input-row {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box {
    min-width: 100%;
  }

  .property-grid,
  .maintenance-grid,
  .settings-grid {
    grid-template-columns: 1fr;
  }
}
