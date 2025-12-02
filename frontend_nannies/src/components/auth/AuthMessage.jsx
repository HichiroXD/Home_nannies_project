export default function AuthMessage({ type, message }) {
  if (!message) return null;

  const styles = {
    info: "bg-blue-100 border-blue-400 text-blue-700",
    error: "bg-red-100 border-red-400 text-red-700",
    success: "bg-green-100 border-green-400 text-green-700",
  };

  return (
    <div className={`border px-4 py-3 rounded mb-4 text-sm ${styles[type]}`}>
      {message}
    </div>
  );
}
