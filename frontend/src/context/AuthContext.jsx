import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);      // {name, email, role}
  const [token, setToken] = useState(null);    // JWT

  useEffect(() => {
    const savedUser = localStorage.getItem("ts_user");
    const savedToken = localStorage.getItem("ts_token");

    if (savedUser && savedToken) {
      try {
        const parsed = JSON.parse(savedUser);
        // Normalize role aliases for backward compatibility
        const roleMap = { agent: "travel_partner", user: "traveler", traveler: "traveler", travel_partner: "travel_partner", admin: "admin" };
        if (parsed && parsed.role) parsed.role = roleMap[parsed.role] || parsed.role;
        setUser(parsed);
      } catch (e) {
        setUser(JSON.parse(savedUser));
      }
      setToken(savedToken);
    }
  }, []);

  const login = (userData, jwt) => {
    // Normalize role aliases before storing
    const roleMap = { agent: "travel_partner", user: "traveler", traveler: "traveler", travel_partner: "travel_partner", admin: "admin" };
    if (userData && userData.role) userData.role = roleMap[userData.role] || userData.role;
    setUser(userData);
    setToken(jwt);

    localStorage.setItem("ts_user", JSON.stringify(userData));
    localStorage.setItem("ts_token", jwt);
  };

  const logout = () => {
    setUser(null);
    setToken(null);

    localStorage.removeItem("ts_user");
    localStorage.removeItem("ts_token");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
