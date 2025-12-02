import React from "react";
import NannyFilters from "./NannyFilters";
import NannyCard from "./NannyCard";
import { Loader } from "@components/layout";

export default function NannyCatalog({
  nannies,
  loading,
  error,
  filters,
  onFilterChange,
  onSearch,
  onFavorite,
  onBook
}) {

  return (
    <div className="container mx-auto px-4">
      <NannyFilters
        filters={filters}
        onChange={onFilterChange}
        onSubmit={onSearch}
      />

      {loading ? (
        <Loader />
      ) : error ? (
        <p className="text-center mt-10 text-red-600">{error}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {nannies.length > 0 ? (
            nannies.map((nanny) => (
              <NannyCard
                key={nanny.id}
                nanny={nanny}
                onFavorite={onFavorite}
                onBook={onBook}
              />
            ))
          ) : (
            <p className="text-gray-600 text-center col-span-3">No se encontraron niñeras.</p>
          )}
        </div>
      )}
    </div>
  );
}
