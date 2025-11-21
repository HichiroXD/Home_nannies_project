export default function Footer() {
  return (
    <footer className="mt-auto bg-gradient-to-r from-pink-50 to-rose-50 border-t border-pink-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center">
          <p className="text-gray-600 font-medium mb-2">
            © {new Date().getFullYear()} <span className="font-bold bg-gradient-to-r from-pink-600 to-rose-500 bg-clip-text text-transparent">Home Nannies</span>
          </p>
          <p className="text-sm text-gray-500">
            Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
