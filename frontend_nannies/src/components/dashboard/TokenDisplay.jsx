export default function TokenDisplay({ token }) {
  if (!token) {
    return (
      <p className="text-red-500 font-semibold mt-4">
        ⚠️ No se encontró ningún token en localStorage
      </p>
    );
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-600 text-left overflow-auto">
      <p className="font-semibold text-gray-800 mb-2">Tu token:</p>
      <code className="break-words">{token}</code>
    </div>
  );
}
