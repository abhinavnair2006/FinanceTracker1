import { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContextValue';
import { Bot, ChartNoAxesCombined, Eye, EyeOff, Goal, LayoutDashboard, List, LogOut } from 'lucide-react';

export default function Sidebar({ privacyMode, setPrivacyMode }) {
  const { logout, user } = useContext(AuthContext);

  const sidebarStyle = {
    width: '250px',
    background: 'rgba(30, 41, 59, 0.7)',
    backdropFilter: 'blur(10px)',
    borderRight: '1px solid var(--border-color)',
    padding: '2rem 1.5rem',
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    position: 'sticky',
    top: 0
  };

  const navLinkStyle = ({ isActive }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: '0.75rem 1rem',
    marginBottom: '0.5rem',
    borderRadius: '0.5rem',
    color: isActive ? 'white' : 'var(--text-secondary)',
    background: isActive ? 'var(--accent-gradient)' : 'transparent',
    transition: 'all 0.3s ease',
    fontWeight: '500'
  });

  return (
    <aside style={sidebarStyle}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '2.5rem', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        FinAI
      </h2>
      
      <div style={{ marginBottom: '2rem' }}>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Welcome,</p>
        <p style={{ fontWeight: '600' }}>{user?.name}</p>
      </div>

      <nav style={{ flex: 1 }}>
        <NavLink to="/" end style={navLinkStyle}>
          <LayoutDashboard size={20} style={{ marginRight: '1rem' }} />
          Overview
        </NavLink>
        <NavLink to="/insights" style={navLinkStyle}>
          <ChartNoAxesCombined size={20} style={{ marginRight: '1rem' }} />
          Insights
        </NavLink>
        <NavLink to="/ai-tools" style={navLinkStyle}>
          <Bot size={20} style={{ marginRight: '1rem' }} />
          AI tools
        </NavLink>
        <NavLink to="/goals" style={navLinkStyle}>
          <Goal size={20} style={{ marginRight: '1rem' }} />
          Goals
        </NavLink>
        <NavLink to="/transactions" style={navLinkStyle}>
          <List size={20} style={{ marginRight: '1rem' }} />
          Transactions
        </NavLink>
      </nav>

      <button onClick={() => setPrivacyMode((enabled) => !enabled)} className="privacy-toggle" aria-pressed={privacyMode}>
        {privacyMode ? <EyeOff size={18} /> : <Eye size={18} />}
        {privacyMode ? 'Privacy mode on' : 'Privacy mode'}
      </button>
      <button onClick={logout} className="btn" style={{ background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', marginTop: 'auto' }}>
        <LogOut size={20} style={{ marginRight: '0.5rem' }} />
        Logout
      </button>
    </aside>
  );
}
