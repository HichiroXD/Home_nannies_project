import React, { useState } from "react";
import { registerUser } from "./userApi";

function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await registerUser(form);
      console.log("Usuario registrado:", data);
      alert("Registro exitoso, ahora inicia sesión");
    } catch (err) {
      console.error(err);
      alert("Error al registrar usuario");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 flex justify-center">
      <div className="max-w-screen-xl m-0 sm:m-10 bg-white shadow sm:rounded-lg flex justify-center flex-1">
        <div className="lg:w-1/2 xl:w-5/12 p-6 sm:p-12">
          <h1 className="text-2xl xl:text-3xl font-extrabold text-center">Regístrate</h1>
          <form className="mt-8 mx-auto max-w-xs" onSubmit={handleSubmit}>
            <input
              className="w-full px-8 py-4 rounded-lg bg-gray-100 border border-gray-200 mt-5"
              type="text"
              name="username"
              placeholder="Usuario"
              value={form.username}
              onChange={handleChange}
              required
            />
            <input
              className="w-full px-8 py-4 rounded-lg bg-gray-100 border border-gray-200 mt-5"
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
            />
            <input
              className="w-full px-8 py-4 rounded-lg bg-gray-100 border border-gray-200 mt-5"
              type="password"
              name="password"
              placeholder="Contraseña"
              value={form.password}
              onChange={handleChange}
              required
            />
            <button
              type="submit"
              className="mt-5 tracking-wide font-semibold bg-indigo-500 text-white w-full py-4 rounded-lg hover:bg-indigo-700"
            >
              Registro
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;
