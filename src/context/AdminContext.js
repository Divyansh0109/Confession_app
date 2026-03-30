/**
 * AdminContext.js
 *
 * Global admin-auth state.
 * Components consume this via useAdmin().
 *
 * isAdmin  → true after correct PIN is entered
 * login()  → called by AdminLoginScreen on success
 * logout() → resets state (call from AdminPanel if needed)
 */

import React, { createContext, useContext, useState } from 'react';

const AdminContext = createContext(null);

export const AdminProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);

  const login  = () => setIsAdmin(true);
  const logout = () => setIsAdmin(false);

  return (
    <AdminContext.Provider value={{ isAdmin, login, logout }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => useContext(AdminContext);
