import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/client';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('cc_token');
    if (token) {
      api.get('/api/auth/me')
        .then(res => {
          if (res.data.email) {
            setUser({ ...res.data, id: res.data.id || res.data._id, token });
          } else {
            localStorage.removeItem('cc_token');
          }
        })
        .catch(() => localStorage.removeItem('cc_token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const loginUser = (data) => {
    localStorage.setItem('cc_token', data.access_token);
    setUser({
      id: data.id || data._id,
      email: data.email,
      name: data.name,
      role: data.role,
      token: data.access_token,
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