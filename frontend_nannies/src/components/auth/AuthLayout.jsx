export default function AuthLayout({ title, children }) {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-rose-200 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
      </div>
      
      <div className="relative z-10 bg-white/90 backdrop-blur-sm p-8 md:p-10 rounded-3xl shadow-2xl border border-pink-100 w-full max-w-md mx-4">
        <h1 className="text-4xl font-extrabold text-center bg-gradient-to-r from-pink-600 to-rose-500 bg-clip-text text-transparent mb-8">
          {title}
        </h1>
        {children}
      </div>
    </div>
  );
}
