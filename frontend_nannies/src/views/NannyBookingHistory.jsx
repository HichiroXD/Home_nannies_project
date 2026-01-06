import { useState } from "react";
import { getBookingsByNanny } from "@api/bookingApi";
import { useApiData } from "@/hooks";
import { AlertToast } from "@components/common";
import { Loader, PageHeader, EmptyState, FilterTabs } from "@components/layout";
import { NannyBookingCard } from "@components/bookings";

export default function NannyBookingHistory() {
  const [alert, setAlert] = useState(null);
  const [filter, setFilter] = useState("all");

  // Cargar historial con useApiData
  const { 
    data: allBookings, 
    loading 
  } = useApiData(
    getBookingsByNanny,
    [],
    {
      onError: () => {
        setAlert({
          type: "error",
          message: "Error al cargar historial",
        });
      },
    }
  );

  // Filtrar solo reservas completadas o en progreso
  const bookings = (allBookings || []).filter(
    (b) =>
      b.status !== "pending" &&
      b.status !== "rejected"
  );

  const getFilteredBookings = () => {
    if (filter === "all") return bookings;
    return bookings.filter((b) => b.status === filter);
  };

  const filteredBookings = getFilteredBookings();

  if (loading) return <Loader />;

  const filterOptions = [
    { value: "all", label: "Todas" },
    { value: "accepted", label: "Aceptadas" },
    { value: "completed", label: "Completadas" },
    { value: "cancelled", label: "Canceladas" },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <PageHeader
        title="Historial de Reservas"
        description="Consulta todas tus reservas pasadas y actuales"
      />

      {alert && (
        <AlertToast
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      <div className="mb-6">
        <FilterTabs
          options={filterOptions}
          activeFilter={filter}
          onFilterChange={setFilter}
        />
      </div>

      {filteredBookings.length === 0 ? (
        <EmptyState message="No hay reservas en este filtro" />
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <NannyBookingCard key={booking.id} booking={booking} />
          ))}
        </div>
      )}
    </div>
  );
}
