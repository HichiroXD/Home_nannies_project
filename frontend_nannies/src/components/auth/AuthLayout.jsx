export default function AuthLayout({ title, children }) {
  return (
    <div className="flex justify-center items-center min-h-screen bg-pink-50">
      <div className="bg-white p-8 rounded-2xl shadow-md w-96">
        <h1 className="text-3xl font-bold text-center text-pink-600 mb-6">{title}</h1>
        {children}
      </div>
    </div>
  );
}
