import { useContext, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AuthContext } from './context/AuthContextValue';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Sidebar from './components/Sidebar';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

function AppContent() {
  const { user } = useContext(AuthContext);
  const [privacyMode, setPrivacyMode] = useState(false);

  return (
    <Router>
      <div className={user ? 'app-container' : ''}>
        {user && <Sidebar privacyMode={privacyMode} setPrivacyMode={setPrivacyMode} />}
        <main className={user ? 'main-content' : ''}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/" 
              element={
                <PrivateRoute>
                  <Dashboard view="overview" privacyMode={privacyMode} />
                </PrivateRoute>
              } 
            />
            <Route path="/ai-tools" element={<PrivateRoute><Dashboard view="tools" privacyMode={privacyMode} /></PrivateRoute>} />
            <Route path="/goals" element={<PrivateRoute><Dashboard view="goals" privacyMode={privacyMode} /></PrivateRoute>} />
            <Route path="/transactions" element={<PrivateRoute><Dashboard view="transactions" privacyMode={privacyMode} /></PrivateRoute>} />
            <Route path="/insights" element={<PrivateRoute><Dashboard view="insights" privacyMode={privacyMode} /></PrivateRoute>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
