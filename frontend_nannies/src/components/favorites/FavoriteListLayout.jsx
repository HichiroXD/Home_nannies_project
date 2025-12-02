export default function FavoriteListLayout({ children }) {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Mis Niñeras Favoritas</h2>
      <ul className="space-y-3">{children}</ul>
    </div>
  );
}
