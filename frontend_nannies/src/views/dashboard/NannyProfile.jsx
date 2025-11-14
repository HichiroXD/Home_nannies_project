import { useEffect, useState } from "react";
import DashboardLayout from "@components/dashboard/DashboardLayout";
import Loader from "@components/layout/Loader";
import { getProfile } from "@api/userApi";
import AlertToast from "@components/layout/AlertToast";

export default function NannyProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await getProfile();
        setProfile(data);
      } catch (err) {
        setAlert({ type: "error", message: "No se pudo cargar el perfil" });
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Loader />;

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
        <p className="text-gray-600">Detalles de tu cuenta y perfil público</p>
      </div>

      {alert && (
        <AlertToast isVisible={true} type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
      )}

      <div className="bg-white rounded-lg shadow-md p-6 max-w-3xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Nombre de usuario</p>
            <p className="font-medium text-gray-900">{profile?.username || "-"}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium text-gray-900">{profile?.email || "-"}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Rol</p>
            <p className="font-medium text-gray-900">{profile?.role || "-"}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Teléfono</p>
            <p className="font-medium text-gray-900">{profile?.phone || "-"}</p>
          </div>
        </div>

        <div className="mt-6 text-right">
          <button className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600">
            Editar perfil
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
