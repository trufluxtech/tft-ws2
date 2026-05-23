import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Brain, Building2, CheckCircle2, Cloud, Compass, Database, Download, Eye, Flag, HeartHandshake, Lock, LogOut, Menu, RefreshCw, Save, Settings, Shield, Sparkles, Target, Upload, X } from 'lucide-react';
import { adminLogin, clearAdminToken, fetchAdminConfig, fetchConfig, fetchAdminLeads, getAdminToken, saveConfig, submitContact, submitLead, uploadLogo } from './services/api';
import './styles.css';

const iconMap = [Brain, Cloud, Database, Building2, Shield, Sparkles];
const valueIconMap = [HeartHandshake, Target, Shield, Sparkles, Compass, CheckCircle2];
const sectionControls = [
  { key: 'hero', label: 'Hero / Landing Banner', href: '#home' },
  { key: 'visionMission', label: 'Vision & Mission', href: '#vision-mission' },
  { key: 'values', label: 'Values', href: '#values' },
  { key: 'services', label: 'Services Offered', href: '#services' },
  { key: 'whitepapers', label: 'Whitepaper Section', href: '#whitepapers' },
  { key: 'contact', label: 'Contact Section', href: '#contact' }
];

const sectionKeys = sectionControls.map((section) => section.key);

function isEnabled(config, key) {
  return config.sections?.[key]?.enabled !== false;
}

function applyTheme(config) {
  const theme = config.theme || {};
  const root = document.documentElement;
  root.style.setProperty('--navy-950', theme.primary || '#041225');
  root.style.setProperty('--navy-900', theme.secondary || '#071f44');
  root.style.setProperty('--navy-800', theme.surface || '#0b2d61');
  root.style.setProperty('--blue-400', theme.accent || '#38bdf8');
  root.style.setProperty('--blue-300', theme.accentSoft || theme.accent || '#7dd3fc');
  root.style.setProperty('--slate-100', theme.text || '#f8fafc');
}

function setDeepValue(obj, path, value) {
  const copy = structuredClone(obj);
  let cursor = copy;
  for (let i = 0; i < path.length - 1; i++) {
    cursor[path[i]] = cursor[path[i]] || {};
    cursor = cursor[path[i]];
  }
  cursor[path[path.length - 1]] = value;
  return copy;
}

function Loading() {
  return <div className="loading">Loading Truflux website...</div>;
}

function Header({ config }) {
  const [open, setOpen] = useState(false);
  const enabledHrefs = new Set(sectionControls.filter((section) => isEnabled(config, section.key)).map((section) => section.href));
  const nav = (config.navigation || []).filter((item) => !item.href || item.href === '#home' || enabledHrefs.has(item.href));
  return (
    <header className="header">
      <a className="brand" href="#home" aria-label="Truflux Technologies home">
        {config.brand?.logoUrl ? (
          <img className="brand-logo" src={config.brand.logoUrl} alt={`${config.brand?.companyName || 'Truflux'} logo`} />
        ) : (
          <><span className="brand-mark">T</span><span>{config.brand?.logoText || config.brand?.companyName}</span></>
        )}
      </a>
      <button className="menu-button" onClick={() => setOpen(!open)} aria-label="Toggle navigation">
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>
      <nav className={open ? 'nav nav-open' : 'nav'}>
        {nav.map((item) => <a key={item.href} href={item.href} onClick={() => setOpen(false)}>{item.label}</a>)}
      </nav>
    </header>
  );
}

function Hero({ config }) {
  const hero = config.hero || {};
  return (
    <section id="home" className="hero section-pad">
      <div className="hero-copy">
        <div className="eyebrow">{hero.eyebrow}</div>
        <h1>{hero.title}</h1>
        <p>{hero.subtitle}</p>
        <div className="hero-actions">
          <a className="btn primary" href="#services">{hero.primaryCta || 'Explore'}</a>
          <a className="btn secondary" href="#whitepapers">{hero.secondaryCta || 'Contact'}</a>
        </div>
      </div>
      <div className="hero-card">
        <div className="orb" />
        <h3>Enterprise digital platform</h3>
        <p>Update services, whitepapers, contact details, logo, colors and homepage messaging from the protected settings screen.</p>
        <div className="stats">
          {(hero.stats || []).map((stat) => (
            <div key={stat.label} className="stat"><strong>{stat.value}</strong><span>{stat.label}</span></div>
          ))}
        </div>
      </div>
    </section>
  );
}

function VisionMission({ content = {} }) {
  return (
    <section id="vision-mission" className="section section-pad vision-mission">
      <div className="section-head"><span className="eyebrow">Direction</span><h2>Vision & Mission</h2><p>Clear business intent, practical technology transformation and measurable outcomes.</p></div>
      <div className="grid cards-2">
        <article className="card highlight-card"><div className="icon"><Eye size={24} /></div><h3>{content.vision?.title || 'Vision'}</h3><p>{content.vision?.text}</p></article>
        <article className="card highlight-card"><div className="icon"><Flag size={24} /></div><h3>{content.mission?.title || 'Mission'}</h3><p>{content.mission?.text}</p></article>
      </div>
    </section>
  );
}

function Values({ values = [] }) {
  return (
    <section id="values" className="section muted section-pad">
      <div className="section-head"><span className="eyebrow">Values</span><h2>Values that guide delivery</h2><p>Truflux is designed around trust, execution discipline, innovation and measurable client value.</p></div>
      <div className="grid cards-3">
        {values.map((value, index) => {
          const Icon = valueIconMap[index % valueIconMap.length];
          return <article className="card" key={value.title}><div className="icon"><Icon size={24} /></div><h3>{value.title}</h3><p>{value.description}</p></article>;
        })}
      </div>
    </section>
  );
}

function Services({ services = [], intro = {} }) {
  return (
    <section id="services" className="section section-pad">
      <div className="section-head"><span className="eyebrow">{intro.eyebrow || 'Services Offered'}</span><h2>{intro.title || 'Services designed for CIO-grade execution'}</h2><p>{intro.description}</p></div>
      <div className="grid cards-3">
        {services.map((service, index) => {
          const Icon = iconMap[index % iconMap.length];
          return <article className="card" key={service.title}><div className="icon"><Icon size={24} /></div><h3>{service.title}</h3><p>{service.summary}</p><ul>{(service.points || []).map((point) => <li key={point}><CheckCircle2 size={16} />{point}</li>)}</ul></article>;
        })}
      </div>
    </section>
  );
}

function Whitepapers({ whitepapers = [], intro = {} }) {
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', linkedin: '', phone: '', industry: '', job_title: '' });
  const [status, setStatus] = useState('');
  const featured = useMemo(() => whitepapers.find((w) => w.featured) || whitepapers[0], [whitepapers]);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('Submitting...');
    try {
      const data = await submitLead({ ...form, whitepaper_id: selected.id });
      setStatus(`Access granted. Download URL: ${data.download_url}`);
    } catch (err) { setStatus(err.message); }
  }

  return (
    <section id="whitepapers" className="section section-pad">
      <div className="section-head"><span className="eyebrow">{intro.eyebrow || 'Whitepaper Section'}</span><h2>{intro.title || 'Whitepapers and executive briefings'}</h2><p>{intro.description}</p></div>
      {featured && <div className="featured"><div><span className="pill">Featured</span><h3>{featured.title}</h3><p>{featured.description}</p></div><button className="btn primary" onClick={() => setSelected(featured)}><Download size={18} /> Download</button></div>}
      <div className="grid cards-3 compact">{whitepapers.map((paper) => <article className="card" key={paper.id}><h3>{paper.title}</h3><p>{paper.description}</p><button className="text-button" onClick={() => setSelected(paper)}>Download</button></article>)}</div>
      {selected && <div className="modal-backdrop" onClick={() => setSelected(null)}><div className="modal" onClick={(e) => e.stopPropagation()}><button className="close" onClick={() => setSelected(null)}><X size={20} /></button><h3>Access: {selected.title}</h3><form onSubmit={handleSubmit} className="form"><input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /><input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /><input placeholder="LinkedIn" value={form.linkedin} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} /><input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /><input placeholder="Industry" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} /><input placeholder="Job Title" value={form.job_title} onChange={(e) => setForm({ ...form, job_title: e.target.value })} /><button className="btn primary" type="submit">Submit & Get Access</button>{status && <p className="status">{status}</p>}</form></div></div>}
    </section>
  );
}

function Contact({ config }) {
  const [form, setForm] = useState({ name: '', email: '', company: '', subject: '', message: '' });
  const [status, setStatus] = useState('');
  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('Submitting...');
    try { await submitContact(form); setStatus('Thank you. Your message has been captured.'); setForm({ name: '', email: '', company: '', subject: '', message: '' }); }
    catch (err) { setStatus(err.message); }
  }
  return (
    <section id="contact" className="section muted section-pad contact-grid">
      <div><span className="eyebrow">Contact</span><h2>{config.contact?.heading}</h2><p>{config.contact?.subheading}</p><div className="contact-card"><strong>{config.brand?.legalName}</strong><span>{config.brand?.address}</span><span>{config.brand?.email}</span><span>{config.brand?.phone}</span></div></div>
      <form onSubmit={handleSubmit} className="form panel"><input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /><input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /><input placeholder="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /><input placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /><textarea required placeholder="Message" rows="5" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /><button className="btn primary" type="submit">Send Message</button>{status && <p className="status">{status}</p>}</form>
    </section>
  );
}

function AdminLogin({ onLogin }) {
  const [form, setForm] = useState({ username: '', password: '' });
  const [status, setStatus] = useState('');
  async function submit(e) {
    e.preventDefault();
    setStatus('Checking credentials...');
    try {
      await adminLogin(form.username, form.password);
      setStatus('Login successful. Loading settings...');
      onLogin();
    } catch (err) { setStatus(err.message); }
  }
  return (
    <main className="admin-login-page">
      <form className="admin-login-card" onSubmit={submit}>
        <div className="lock-icon"><Lock size={26} /></div>
        <span className="eyebrow">Protected Admin</span>
        <h1><Settings size={34} /> Website Settings</h1>
        <p>Enter the admin username and password to manage website sections, colors, logo and content.</p>
        <input required placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
        <input required type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <button className="btn primary" type="submit"><Lock size={18} /> Login</button>
        {status && <p className="status">{status}</p>}
      </form>
    </main>
  );
}

function AdminConfig({ config, onConfigSaved, onLogout }) {
  const [draft, setDraft] = useState(() => structuredClone(config));
  const [status, setStatus] = useState('');

  useEffect(() => { applyTheme(draft); }, [draft.theme]);

  function update(path, value) { setDraft((current) => setDeepValue(current, path, value)); }

  function updateListItem(listKey, index, field, value) {
    setDraft((current) => {
      const copy = structuredClone(current);
      copy[listKey] = copy[listKey] || [];
      copy[listKey][index] = { ...(copy[listKey][index] || {}), [field]: value };
      return copy;
    });
  }

  function updateServicePoint(serviceIndex, pointIndex, value) {
    setDraft((current) => {
      const copy = structuredClone(current);
      copy.services = copy.services || [];
      copy.services[serviceIndex].points = copy.services[serviceIndex].points || [];
      copy.services[serviceIndex].points[pointIndex] = value;
      return copy;
    });
  }

  function addListItem(listKey, item) {
    setDraft((current) => ({ ...structuredClone(current), [listKey]: [...(current[listKey] || []), item] }));
  }

  function removeListItem(listKey, index) {
    setDraft((current) => {
      const copy = structuredClone(current);
      copy[listKey] = (copy[listKey] || []).filter((_, i) => i !== index);
      return copy;
    });
  }

  async function save() {
    setStatus('Saving...');
    try {
      const result = await saveConfig(draft);
      setStatus('Settings saved. Refreshing site...');
      onConfigSaved(result.config);
    } catch (err) { setStatus(err.message); }
  }

  async function handleLogo(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatus('Uploading logo...');
    try {
      const result = await uploadLogo(file);
      const updated = setDeepValue(draft, ['brand', 'logoUrl'], `${result.logoUrl}?v=${Date.now()}`);
      setDraft(updated);
      onConfigSaved(updated);
      setStatus('Logo uploaded. Click Save Settings after any other changes.');
    } catch (err) { setStatus(err.message); }
  }

  return (
    <section id="admin" className="section section-pad admin-page">
      <div className="section-head admin-title-row">
        <div>
          <span className="eyebrow"><Settings size={14} /> Website Settings</span>
          <h2>Manage Website Settings</h2>
          <p>Switch sections on or off, change colors, upload logo and edit text without touching JSON.</p>
        </div>
        <button className="btn secondary" onClick={onLogout}><LogOut size={18} /> Logout</button>
      </div>
      <div className="admin-grid">
        <div className="admin-panel section-selector-panel">
          <h3><Settings size={18} /> Website Section Visibility</h3>
          <p className="admin-help">Select the sections that should appear on the public website. Unchecked sections are hidden from the page and removed from the top navigation after you save.</p>
          <div className="toggle-list">
            {sectionControls.map((section) => {
              const checked = draft.sections?.[section.key]?.enabled !== false;
              return (
                <label className={checked ? 'toggle-row section-toggle is-on' : 'toggle-row section-toggle is-off'} key={section.key}>
                  <input type="checkbox" checked={checked} onChange={(e) => update(['sections', section.key, 'enabled'], e.target.checked)} />
                  <span>{draft.sections?.[section.key]?.label || section.label}</span>
                  <em>{checked ? 'Visible' : 'Hidden'}</em>
                </label>
              );
            })}
          </div>
        </div>
        <LeadReport />
        <div className="admin-panel">
          <h3>Theme Colors</h3>
          {['primary', 'secondary', 'surface', 'accent', 'text'].map((key) => <label className="field-row" key={key}><span>{key}</span><input type="color" value={draft.theme?.[key] || '#071f44'} onChange={(e) => update(['theme', key], e.target.value)} /><input value={draft.theme?.[key] || ''} onChange={(e) => update(['theme', key], e.target.value)} /></label>)}
        </div>
        <div className="admin-panel">
          <h3>Logo</h3>
          {draft.brand?.logoUrl && <img className="admin-logo-preview" src={draft.brand.logoUrl} alt="Current logo" />}
          <label className="upload-box"><Upload size={18} /> Upload logo<input type="file" accept=".svg,.png,.jpg,.jpeg,.webp" onChange={handleLogo} /></label>
          <label>Logo URL<input value={draft.brand?.logoUrl || ''} onChange={(e) => update(['brand', 'logoUrl'], e.target.value)} /></label>
        </div>
        <div className="admin-panel span-2">
          <h3>Brand & Contact Text</h3>
          <div className="form two-col"><input placeholder="Company Name" value={draft.brand?.companyName || ''} onChange={(e) => update(['brand', 'companyName'], e.target.value)} /><input placeholder="Legal Name" value={draft.brand?.legalName || ''} onChange={(e) => update(['brand', 'legalName'], e.target.value)} /><input placeholder="Email" value={draft.brand?.email || ''} onChange={(e) => update(['brand', 'email'], e.target.value)} /><input placeholder="Phone" value={draft.brand?.phone || ''} onChange={(e) => update(['brand', 'phone'], e.target.value)} /><textarea placeholder="Address" value={draft.brand?.address || ''} onChange={(e) => update(['brand', 'address'], e.target.value)} /><textarea placeholder="Tagline" value={draft.brand?.tagline || ''} onChange={(e) => update(['brand', 'tagline'], e.target.value)} /></div>
        </div>
        <div className="admin-panel span-2">
          <h3>Hero Text</h3>
          <div className="form"><input placeholder="Eyebrow" value={draft.hero?.eyebrow || ''} onChange={(e) => update(['hero', 'eyebrow'], e.target.value)} /><textarea rows="2" placeholder="Hero Title" value={draft.hero?.title || ''} onChange={(e) => update(['hero', 'title'], e.target.value)} /><textarea rows="3" placeholder="Hero Subtitle" value={draft.hero?.subtitle || ''} onChange={(e) => update(['hero', 'subtitle'], e.target.value)} /><input placeholder="Primary CTA" value={draft.hero?.primaryCta || ''} onChange={(e) => update(['hero', 'primaryCta'], e.target.value)} /><input placeholder="Secondary CTA" value={draft.hero?.secondaryCta || ''} onChange={(e) => update(['hero', 'secondaryCta'], e.target.value)} /></div>
        </div>
        <div className="admin-panel span-2">
          <h3>Vision & Mission</h3>
          <div className="form"><input placeholder="Vision title" value={draft.visionMission?.vision?.title || ''} onChange={(e) => update(['visionMission', 'vision', 'title'], e.target.value)} /><textarea rows="3" placeholder="Vision text" value={draft.visionMission?.vision?.text || ''} onChange={(e) => update(['visionMission', 'vision', 'text'], e.target.value)} /><input placeholder="Mission title" value={draft.visionMission?.mission?.title || ''} onChange={(e) => update(['visionMission', 'mission', 'title'], e.target.value)} /><textarea rows="3" placeholder="Mission text" value={draft.visionMission?.mission?.text || ''} onChange={(e) => update(['visionMission', 'mission', 'text'], e.target.value)} /></div>
        </div>
        <div className="admin-panel span-2">
          <h3>Services Offered</h3>
          <div className="form"><input placeholder="Section eyebrow" value={draft.servicesIntro?.eyebrow || ''} onChange={(e) => update(['servicesIntro', 'eyebrow'], e.target.value)} /><input placeholder="Section title" value={draft.servicesIntro?.title || ''} onChange={(e) => update(['servicesIntro', 'title'], e.target.value)} /><textarea placeholder="Section description" value={draft.servicesIntro?.description || ''} onChange={(e) => update(['servicesIntro', 'description'], e.target.value)} /></div>
          {(draft.services || []).map((service, index) => <div className="edit-card" key={index}><div className="edit-card-head"><strong>Service {index + 1}</strong><button className="text-button danger" onClick={() => removeListItem('services', index)}>Remove</button></div><input placeholder="Title" value={service.title || ''} onChange={(e) => updateListItem('services', index, 'title', e.target.value)} /><textarea rows="2" placeholder="Summary" value={service.summary || ''} onChange={(e) => updateListItem('services', index, 'summary', e.target.value)} />{(service.points || []).map((point, pointIndex) => <input key={pointIndex} placeholder={`Point ${pointIndex + 1}`} value={point} onChange={(e) => updateServicePoint(index, pointIndex, e.target.value)} />)}</div>)}
          <button className="btn secondary" onClick={() => addListItem('services', { title: 'New Service', summary: 'Service summary', points: ['Key point one', 'Key point two'] })}>Add Service</button>
        </div>
        <div className="admin-panel span-2">
          <h3>Values</h3>
          {(draft.values || []).map((value, index) => <div className="edit-card" key={index}><div className="edit-card-head"><strong>Value {index + 1}</strong><button className="text-button danger" onClick={() => removeListItem('values', index)}>Remove</button></div><input placeholder="Title" value={value.title || ''} onChange={(e) => updateListItem('values', index, 'title', e.target.value)} /><textarea rows="2" placeholder="Description" value={value.description || ''} onChange={(e) => updateListItem('values', index, 'description', e.target.value)} /></div>)}
          <button className="btn secondary" onClick={() => addListItem('values', { title: 'New Value', description: 'Value description' })}>Add Value</button>
        </div>
        <div className="admin-panel span-2">
          <h3>Whitepaper Section</h3>
          <div className="form"><input placeholder="Section eyebrow" value={draft.whitepaperIntro?.eyebrow || ''} onChange={(e) => update(['whitepaperIntro', 'eyebrow'], e.target.value)} /><input placeholder="Section title" value={draft.whitepaperIntro?.title || ''} onChange={(e) => update(['whitepaperIntro', 'title'], e.target.value)} /><textarea placeholder="Section description" value={draft.whitepaperIntro?.description || ''} onChange={(e) => update(['whitepaperIntro', 'description'], e.target.value)} /></div>
          {(draft.whitepapers || []).map((paper, index) => <div className="edit-card" key={index}><div className="edit-card-head"><strong>Whitepaper {index + 1}</strong><button className="text-button danger" onClick={() => removeListItem('whitepapers', index)}>Remove</button></div><input placeholder="ID" value={paper.id || ''} onChange={(e) => updateListItem('whitepapers', index, 'id', e.target.value)} /><input placeholder="Title" value={paper.title || ''} onChange={(e) => updateListItem('whitepapers', index, 'title', e.target.value)} /><textarea rows="2" placeholder="Description" value={paper.description || ''} onChange={(e) => updateListItem('whitepapers', index, 'description', e.target.value)} /><input placeholder="Download URL" value={paper.downloadUrl || ''} onChange={(e) => updateListItem('whitepapers', index, 'downloadUrl', e.target.value)} /><label className="toggle-row small"><input type="checkbox" checked={!!paper.featured} onChange={(e) => updateListItem('whitepapers', index, 'featured', e.target.checked)} /> Featured</label></div>)}
          <button className="btn secondary" onClick={() => addListItem('whitepapers', { id: `whitepaper-${Date.now()}`, title: 'New Whitepaper', description: 'Whitepaper description', downloadUrl: '#', featured: false })}>Add Whitepaper</button>
        </div>
        <div className="admin-panel span-2">
          <h3>Contact Section</h3>
          <div className="form"><input placeholder="Heading" value={draft.contact?.heading || ''} onChange={(e) => update(['contact', 'heading'], e.target.value)} /><textarea rows="2" placeholder="Subheading" value={draft.contact?.subheading || ''} onChange={(e) => update(['contact', 'subheading'], e.target.value)} /></div>
        </div>
      </div>
      <div className="sticky-save"><button className="btn primary" onClick={save}><Save size={18} /> Save Settings</button>{status && <span className="status">{status}</span>}</div>
    </section>
  );
}


function LeadReport() {
  const [leads, setLeads] = useState([]);
  const [status, setStatus] = useState('Loading captured lead report...');

  async function loadLeads() {
    setStatus('Loading captured lead report...');
    try {
      const data = await fetchAdminLeads();
      setLeads(data);
      setStatus(data.length ? `${data.length} captured lead${data.length === 1 ? '' : 's'} found.` : 'No whitepaper download leads captured yet.');
    } catch (err) {
      setStatus(err.message);
    }
  }

  useEffect(() => { loadLeads(); }, []);

  function downloadCsv() {
    const headers = ['ID', 'Name', 'Email', 'LinkedIn', 'Phone', 'Industry', 'Job Title', 'Whitepaper ID', 'Download URL', 'Created At'];
    const escapeCell = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
    const rows = leads.map((lead) => [lead.id, lead.name, lead.email, lead.linkedin, lead.phone, lead.industry, lead.job_title, lead.whitepaper_id, lead.download_url, lead.created_at].map(escapeCell).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `truflux-whitepaper-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="admin-panel span-2 leads-report-panel">
      <div className="report-head">
        <div>
          <h3><Database size={18} /> Captured Whitepaper Leads Report</h3>
          <p className="admin-help">These are the details collected before users press the whitepaper Download button.</p>
        </div>
        <div className="report-actions">
          <button className="btn secondary" onClick={loadLeads}><RefreshCw size={18} /> Refresh</button>
          <button className="btn primary" onClick={downloadCsv} disabled={!leads.length}><Download size={18} /> Export CSV</button>
        </div>
      </div>
      <div className="report-summary">
        <div><strong>{leads.length}</strong><span>Total Leads</span></div>
        <div><strong>{new Set(leads.map((lead) => lead.whitepaper_id)).size}</strong><span>Whitepapers</span></div>
        <div><strong>{leads[0]?.created_at ? new Date(leads[0].created_at).toLocaleDateString() : '-'}</strong><span>Latest Lead</span></div>
      </div>
      <p className="status">{status}</p>
      <div className="table-wrap">
        <table className="report-table">
          <thead>
            <tr>
              <th>Date</th><th>Name</th><th>Email</th><th>Phone</th><th>LinkedIn</th><th>Industry</th><th>Job Title</th><th>Whitepaper</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id}>
                <td>{lead.created_at ? new Date(lead.created_at).toLocaleString() : '-'}</td>
                <td>{lead.name}</td>
                <td>{lead.email}</td>
                <td>{lead.phone || '-'}</td>
                <td>{lead.linkedin ? <a href={lead.linkedin} target="_blank" rel="noreferrer">Open</a> : '-'}</td>
                <td>{lead.industry || '-'}</td>
                <td>{lead.job_title || '-'}</td>
                <td>{lead.whitepaper_id}</td>
              </tr>
            ))}
            {!leads.length && <tr><td colSpan="8" className="empty-cell">No captured leads yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Footer({ config }) {
  return <footer className="footer"><div className="footer-brand">{config.brand?.logoUrl && <img className="footer-logo" src={config.brand.logoUrl} alt={config.brand?.companyName || "Logo"} />}<strong>{config.brand?.companyName}</strong></div><span>{config.footer?.copyright}</span><span>Version {config.runtimeVersion || config.version}</span></footer>;
}

function App() {
  const [config, setConfig] = useState(null);
  const [error, setError] = useState('');
  const [route, setRoute] = useState(window.location.pathname || '/');
  const isAdminRoute = route === '/config';

  useEffect(() => {
    const onRoute = () => setRoute(window.location.pathname || '/');
    window.addEventListener('popstate', onRoute);
    return () => window.removeEventListener('popstate', onRoute);
  }, []);

  async function loadPublicConfig() {
    const data = await fetchConfig();
    setConfig(data);
    applyTheme(data);
  }

  async function loadAdminConfig() {
    const data = await fetchAdminConfig();
    setConfig(data);
    applyTheme(data);
  }

  useEffect(() => {
    setError('');
    const loader = isAdminRoute && getAdminToken() ? loadAdminConfig : loadPublicConfig;
    loader().catch((err) => {
      if (isAdminRoute) { clearAdminToken(); setConfig(null); }
      setError(err.message);
    });
  }, [isAdminRoute]);

  if (isAdminRoute && !getAdminToken()) {
    return <AdminLogin onLogin={() => { window.history.pushState({}, '', '/config'); setRoute('/config'); loadAdminConfig().catch((err) => setError(err.message)); }} />;
  }

  if (error && !isAdminRoute) return <div className="loading error">{error}. Make sure backend is running on http://localhost:8000.</div>;
  if (error && isAdminRoute) return <AdminLogin onLogin={() => loadAdminConfig().catch((err) => setError(err.message))} />;
  if (!config) return <Loading />;

  if (isAdminRoute) {
    return <AdminConfig config={config} onConfigSaved={(next) => { setConfig({ ...next, runtimeVersion: config.runtimeVersion }); applyTheme(next); }} onLogout={() => { clearAdminToken(); window.history.pushState({}, '', '/'); setRoute('/'); }} />;
  }

  return (
    <>
      <Header config={config} />
      <main>
        {isEnabled(config, 'hero') && <Hero config={config} />}
        {isEnabled(config, 'visionMission') && <VisionMission content={config.visionMission} />}
        {isEnabled(config, 'values') && <Values values={config.values} />}
        {isEnabled(config, 'services') && <Services services={config.services} intro={config.servicesIntro} />}
        {isEnabled(config, 'whitepapers') && <Whitepapers whitepapers={config.whitepapers} intro={config.whitepaperIntro} />}
        {isEnabled(config, 'contact') && <Contact config={config} />}
      </main>
      <Footer config={config} />
    </>
  );
}

createRoot(document.getElementById('root')).render(<App />);
