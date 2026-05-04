import React, {
  createContext, useContext, useState, useEffect, forwardRef, useImperativeHandle
} from "react";

const AuthContext = createContext();

export const AuthProvider = forwardRef(({ children }, ref) => {
  const [token, setToken] = useState(localStorage.getItem("token"));

  useImperativeHandle(ref, () => ({
    get token() { return token; },
    login: (tk) => setToken(tk || null),
    logout: () => setToken(null),
  }));

  // sincroniza con localStorage
  useEffect(() => {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
  }, [token]);

  return (
    <AuthContext.Provider value={{ token, setToken }}>
      {children}
    </AuthContext.Provider>
  );
});

export const useAuth = () => useContext(AuthContext);
