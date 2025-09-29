import React, { useContext } from "react";
import { AuthContext } from "../auth/AuthContext";

function Dashboard() {
  const { user, logout } = useContext(AuthContext);

  return (
    <div>
      <h1>Bienvenido, {user?.username}</h1>
      <p>Email: {user?.email}</p>
      <p>Rol: {user?.role}</p>
      <button onClick={logout}>Cerrar sesión</button>
    </div>
  );
}

export default Dashboard;
