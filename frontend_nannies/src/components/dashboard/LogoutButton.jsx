export default function LogoutButton({ onLogout }) {
  return (
    <button
      onClick={onLogout}
      className="mt-8 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
    >
      Cerrar sesión
    </button>
  );
}
