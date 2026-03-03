import { useMemo, useState } from 'react';

type Tab = 'dashboard' | 'citizens' | 'records' | 'reports' | 'evidence' | 'investigations' | 'admin';

type CitizenPayload = {
  fullname: string;
  discordId: string;
  username: string;
  photo: string;
  notes: string;
};

type Intervention = {
  time: string;
  place: string;
  type: string;
  persons: string;
  description: string;
  result: string;
};

const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:4000';
const logos = {
  mdt: 'https://i.imgur.com/6sv298m.png',
  lapd: 'https://i.imgur.com/eW47qCV.png',
  daytona: 'https://i.imgur.com/8k7Elrd.png',
};

const navItems: Array<{ id: Tab; label: string; hint: string }> = [
  { id: 'dashboard', label: 'Dashboard', hint: 'Vue générale' },
  { id: 'citizens', label: 'Citoyens', hint: 'Recherche / création' },
  { id: 'records', label: 'Casier', hint: 'Infractions & historique' },
  { id: 'reports', label: 'Rapports', hint: 'Service LAPD' },
  { id: 'evidence', label: 'Preuves', hint: 'Upload image' },
  { id: 'investigations', label: 'Enquêtes', hint: 'Suivi dossiers' },
  { id: 'admin', label: 'Recrutement', hint: 'Comptes officiers' },
];

const emptyIntervention = (): Intervention => ({
  time: '',
  place: '',
  type: '',
  persons: '',
  description: '',
  result: '',
});

export default function App() {
  const [token, setToken] = useState('');
  const [tab, setTab] = useState<Tab>('dashboard');
  const [matricule, setMatricule] = useState('LAPD-001');
  const [password, setPassword] = useState('changeme123');
  const [status, setStatus] = useState('');

  const [citizen, setCitizen] = useState<CitizenPayload>({ fullname: '', discordId: '', username: '', photo: '', notes: '' });
  const [recordData, setRecordData] = useState({ citizenName: '', discordId: '', title: '', description: '' });
  const [reportForm, setReportForm] = useState({
    department: 'Los Santos Police Department',
    officer: '',
    badgeNumber: '',
    unit: 'Patrol',
    date: '',
    startTime: '',
    endTime: '',
    sector: '',
    summary: '',
    finesCount: 0,
    arrestsCount: 0,
    seizedItems: '',
  });
  const [interventions, setInterventions] = useState<Intervention[]>([emptyIntervention()]);
  const [investigation, setInvestigation] = useState({ title: '', description: '', status: 'Open' });
  const [officerForm, setOfficerForm] = useState({ matricule: '', password: '', grade: 'Officer', discordId: '', isAdmin: false });
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);

  const stats = useMemo(
    () => [
      { label: 'Citoyens actifs', value: '128', color: 'blue' },
      { label: 'Casiers', value: '74', color: 'cyan' },
      { label: 'Rapports 24h', value: '19', color: 'indigo' },
      { label: 'Enquêtes ouvertes', value: '11', color: 'orange' },
    ],
    [],
  );

  async function api(path: string, options: RequestInit = {}) {
    const headers: Record<string, string> = {
      Authorization: token ? `Bearer ${token}` : '',
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(options.headers as Record<string, string> || {}),
    };

    const response = await fetch(`${apiBase}${path}`, { ...options, headers });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'Erreur API');
    }

    const contentType = response.headers.get('content-type') || '';
    return contentType.includes('application/json') ? response.json() : response.text();
  }

  async function login() {
    try {
      const data = await api('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ matricule, password }),
      });
      setToken(data.token);
      setStatus('Connexion réussie.');
    } catch (error) {
      setStatus(`Connexion refusée: ${(error as Error).message}`);
    }
  }

  async function discordLogin() {
    try {
      const data = await api('/api/auth/discord/url');
      if (data?.url) window.location.href = data.url;
    } catch {
      setStatus('Impossible de générer le lien Discord OAuth2.');
    }
  }

  if (!token) {
    return (
      <div className="login-shell">
        <div className="login-card">
          <div className="logo-row">
            <img src={logos.mdt} alt="MDT" />
            <img src={logos.lapd} alt="LAPD" />
            <img src={logos.daytona} alt="Daytona" />
          </div>
          <h1>LAPD MDT · DAYTONA RP</h1>
          <p>Terminal sécurisé police — accès réservé aux officiers autorisés.</p>
          <div className="input-stack">
            <input value={matricule} onChange={(e) => setMatricule(e.target.value)} placeholder="Matricule" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mot de passe" />
          </div>
          <div className="action-row">
            <button onClick={login} className="btn btn-main">Connexion</button>
            <button onClick={discordLogin} className="btn btn-ghost">Discord OAuth2</button>
          </div>
          <small>{status}</small>
        </div>
      </div>
    );
  }

  return (
    <div className="mdt-layout">
      <aside className="sidebar">
        <img src={logos.mdt} alt="MDT Logo" className="sidebar-logo" />
        <div className="sidebar-title">Los Angeles Police Department</div>
        {navItems.map((item) => (
          <button key={item.id} className={`nav-btn ${tab === item.id ? 'active' : ''}`} onClick={() => setTab(item.id)}>
            <span>{item.label}</span>
            <small>{item.hint}</small>
          </button>
        ))}
      </aside>

      <main className="content">
        <header className="topbar">
          <div>
            <h2>{navItems.find((n) => n.id === tab)?.label}</h2>
            <p>LAPD MDT — ERLC Operations Center</p>
          </div>
          <div className="top-status">
            <span>Officiers en service: 10</span>
            <span>Mode sombre: Activé</span>
          </div>
        </header>

        {tab === 'dashboard' && (
          <section className="panel-stack">
            <div className="cards-grid">
              {stats.map((item) => (
                <article key={item.label} className={`stat-card ${item.color}`}>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </article>
              ))}
            </div>

            <div className="split-grid">
              <article className="panel">
                <h3>Carte interactive ERLC</h3>
                <p>Intégration rapide de la map publique.</p>
                <iframe src="https://erlc-hub.pages.dev/" title="ERLC Map" loading="lazy" />
              </article>
              <article className="panel">
                <h3>Alertes terrain</h3>
                <ul className="alert-list">
                  <li><b>#1</b> Vol à main armée · Unit Adam-10</li>
                  <li><b>#2</b> Course poursuite · Unit Adam-20</li>
                  <li><b>#3</b> Accident majeur · EMS + Patrol</li>
                  <li><b>#4</b> Contrôle renforcé · Bridge Sector</li>
                </ul>
              </article>
            </div>
          </section>
        )}

        {tab === 'citizens' && (
          <section className="panel form-panel">
            <h3>Créer un citoyen</h3>
            <div className="form-grid two">
              <input placeholder="Nom complet" value={citizen.fullname} onChange={(e) => setCitizen((o) => ({ ...o, fullname: e.target.value }))} />
              <input placeholder="Discord ID" value={citizen.discordId} onChange={(e) => setCitizen((o) => ({ ...o, discordId: e.target.value }))} />
              <input placeholder="Username Discord" value={citizen.username} onChange={(e) => setCitizen((o) => ({ ...o, username: e.target.value }))} />
              <input placeholder="URL photo" value={citizen.photo} onChange={(e) => setCitizen((o) => ({ ...o, photo: e.target.value }))} />
            </div>
            <textarea placeholder="Notes" value={citizen.notes} onChange={(e) => setCitizen((o) => ({ ...o, notes: e.target.value }))} />
            <button className="btn btn-main" onClick={async () => {
              try {
                await api('/api/citizens', { method: 'POST', body: JSON.stringify(citizen) });
                setStatus('Citoyen créé.');
              } catch (error) {
                setStatus((error as Error).message);
              }
            }}>Enregistrer citoyen</button>
          </section>
        )}

        {tab === 'records' && (
          <section className="panel form-panel">
            <h3>Casier judiciaire</h3>
            <div className="form-grid two">
              <input placeholder="Nom citoyen" value={recordData.citizenName} onChange={(e) => setRecordData((o) => ({ ...o, citizenName: e.target.value }))} />
              <input placeholder="Discord ID" value={recordData.discordId} onChange={(e) => setRecordData((o) => ({ ...o, discordId: e.target.value }))} />
              <input placeholder="Titre infraction" value={recordData.title} onChange={(e) => setRecordData((o) => ({ ...o, title: e.target.value }))} />
            </div>
            <textarea placeholder="Description complète" value={recordData.description} onChange={(e) => setRecordData((o) => ({ ...o, description: e.target.value }))} />
            <button className="btn btn-main" onClick={async () => {
              try {
                await api('/api/casiers', {
                  method: 'POST',
                  body: JSON.stringify({
                    citizen: { fullname: recordData.citizenName, discordId: recordData.discordId, username: '', photo: '', notes: '' },
                    offense: { title: recordData.title, description: recordData.description },
                  }),
                });
                setStatus('Infraction ajoutée au casier.');
              } catch (error) {
                setStatus((error as Error).message);
              }
            }}>Ajouter infraction</button>
          </section>
        )}

        {tab === 'reports' && (
          <section className="panel form-panel">
            <h3>Rapport de service — LAPD</h3>
            <div className="form-grid three">
              {Object.entries(reportForm).map(([key, value]) => (
                <input key={key} placeholder={key} value={String(value)} onChange={(e) => setReportForm((old) => ({ ...old, [key]: e.target.value }))} />
              ))}
            </div>
            <div className="intervention-stack">
              {interventions.map((it, index) => (
                <div key={index} className="intervention-card">
                  <h4>Intervention #{index + 1}</h4>
                  <div className="form-grid two">
                    {Object.entries(it).map(([key, value]) => (
                      <input
                        key={key}
                        placeholder={key}
                        value={value}
                        onChange={(e) => setInterventions((old) => old.map((entry, i) => (i === index ? { ...entry, [key]: e.target.value } : entry)))}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="action-row">
              <button className="btn btn-ghost" onClick={() => interventions.length < 7 && setInterventions((old) => [...old, emptyIntervention()])}>+ Ajouter une intervention</button>
              <button className="btn btn-main" onClick={async () => {
                try {
                  await api('/api/reports', {
                    method: 'POST',
                    body: JSON.stringify({ ...reportForm, interventions }),
                  });
                  setStatus('Rapport enregistré.');
                } catch (error) {
                  setStatus((error as Error).message);
                }
              }}>Envoyer rapport</button>
            </div>
          </section>
        )}

        {tab === 'evidence' && (
          <section className="panel form-panel">
            <h3>Preuves · Upload image</h3>
            <p>Formats: jpg / png / webp · taille max: 5MB.</p>
            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => setEvidenceFile(e.target.files?.[0] || null)} />
            <button className="btn btn-main" onClick={async () => {
              if (!evidenceFile) return setStatus('Choisis une image avant upload.');
              try {
                const fd = new FormData();
                fd.append('image', evidenceFile);
                fd.append('linkedTo', 'manual');
                await api('/api/evidence/upload', { method: 'POST', body: fd });
                setStatus('Preuve uploadée avec succès.');
              } catch (error) {
                setStatus((error as Error).message);
              }
            }}>Uploader</button>
          </section>
        )}

        {tab === 'investigations' && (
          <section className="panel form-panel">
            <h3>Créer une enquête</h3>
            <input placeholder="Titre" value={investigation.title} onChange={(e) => setInvestigation((o) => ({ ...o, title: e.target.value }))} />
            <textarea placeholder="Description" value={investigation.description} onChange={(e) => setInvestigation((o) => ({ ...o, description: e.target.value }))} />
            <select value={investigation.status} onChange={(e) => setInvestigation((o) => ({ ...o, status: e.target.value }))}>
              <option>Open</option>
              <option>In Progress</option>
              <option>Closed</option>
            </select>
            <button className="btn btn-main" onClick={async () => {
              try {
                await api('/api/enquetes', { method: 'POST', body: JSON.stringify(investigation) });
                setStatus('Enquête créée.');
              } catch (error) {
                setStatus((error as Error).message);
              }
            }}>Créer enquête</button>
          </section>
        )}

        {tab === 'admin' && (
          <section className="panel form-panel">
            <h3>Recrutement / comptes policiers</h3>
            <div className="form-grid two">
              <input placeholder="Matricule" value={officerForm.matricule} onChange={(e) => setOfficerForm((o) => ({ ...o, matricule: e.target.value }))} />
              <input placeholder="Mot de passe" value={officerForm.password} onChange={(e) => setOfficerForm((o) => ({ ...o, password: e.target.value }))} />
              <input placeholder="Grade" value={officerForm.grade} onChange={(e) => setOfficerForm((o) => ({ ...o, grade: e.target.value }))} />
              <input placeholder="Discord ID" value={officerForm.discordId} onChange={(e) => setOfficerForm((o) => ({ ...o, discordId: e.target.value }))} />
            </div>
            <label className="checkbox-line">
              <input type="checkbox" checked={officerForm.isAdmin} onChange={(e) => setOfficerForm((o) => ({ ...o, isAdmin: e.target.checked }))} />
              Compte administrateur
            </label>
            <button className="btn btn-main" onClick={async () => {
              try {
                await api('/api/admin/create-officer', { method: 'POST', body: JSON.stringify(officerForm) });
                setStatus('Compte policier créé.');
              } catch (error) {
                setStatus((error as Error).message);
              }
            }}>Créer compte</button>
          </section>
        )}

        <footer className="status-bar">{status || 'Terminal prêt.'}</footer>
      </main>
    </div>
  );
}
