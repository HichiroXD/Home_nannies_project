export default function AuthLayout({ title, children }) {
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <h1 className="text-2xl font-bold text-center text-pink-600 mb-4">{title}</h1>
        {children}
      </div>
    </div>
  );
}
