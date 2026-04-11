import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on mount
    const token = localStorage.getItem('cc_token');
    if (token) {
      const baseUrl = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:8000' : 'https://cohortconnect-1.onrender.com');
      fetch(`${baseUrl}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if(data.email) {
          setUser({ ...data, token });
        } else {
          localStorage.removeItem('cc_token');
        }
      })
      .catch(err => {
        console.error("Auth hydration error:", err);
        localStorage.removeItem('cc_token');
      })
      .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const loginUser = (data) => {
    localStorage.setItem('cc_token', data.access_token);
    setUser({
      email: data.email,
      name: data.name,
      role: data.role,
      token: data.access_token
    });
  };

  const logoutUser = () => {
    localStorage.removeItem('cc_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loginUser, logoutUser, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
