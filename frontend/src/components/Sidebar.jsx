import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, WalletCards, LogOut } from 'lucide-react';

export default function Sidebar() {
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
        <NavLink to="/" style={navLinkStyle}>
          <LayoutDashboard size={20} style={{ marginRight: '1rem' }} />
          Dashboard
        </NavLink>
      </nav>

      <button onClick={logout} className="btn" style={{ background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', marginTop: 'auto' }}>
        <LogOut size={20} style={{ marginRight: '0.5rem' }} />
        Logout
      </button>
    </aside>
  );
}
