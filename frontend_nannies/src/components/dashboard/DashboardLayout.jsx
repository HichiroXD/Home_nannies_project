export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-8">
      <div className="bg-white shadow-lg rounded-2xl p-10 w-full max-w-3xl text-center">
        {children}
      </div>
    </div>
  );
}
