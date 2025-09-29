import React, { useState } from "react";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí deberías llamar a tu API para enviar el email de recuperación
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-pink-200 text-gray-900 flex justify-center">
      <div className="max-w-screen-xl m-0 sm:m-40 bg-white shadow sm:rounded-lg flex justify-center flex-1">
        <div className="lg:w-1/2 xl:w-5/12 p-6 sm:p-12">
          <h1 className="text-2xl xl:text-3xl font-extrabold text-center">
            Recuperar contraseña
          </h1>
          <form className="mt-8 mx-auto max-w-xs" onSubmit={handleSubmit}>
            <input
              className="w-full px-8 py-4 rounded-lg bg-gray-100 border border-gray-200 mt-5"
              type="email"
              placeholder="Ingresa tu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button
              type="submit"
              className="mt-5 tracking-wide font-semibold bg-indigo-500 text-white w-full py-4 rounded-lg hover:bg-indigo-700"
            >
              Enviar enlace de recuperación
            </button>
          </form>
          {submitted && (
            <div className="text-green-600 text-center mt-4">
              Si el correo existe, recibirás un enlace para restablecer tu contraseña.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;