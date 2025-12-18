import React from "react";
import PropTypes from 'prop-types';
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

NannyCatalog.propTypes = {
  nannies: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string,
    photo: PropTypes.string,
    rating: PropTypes.number,
    experience: PropTypes.string,
    hourly_rate: PropTypes.number,
    is_favorite: PropTypes.bool
  })).isRequired,
  loading: PropTypes.bool.isRequired,
  error: PropTypes.string,
  filters: PropTypes.shape({
    search: PropTypes.string,
    experience: PropTypes.string,
    minRate: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    maxRate: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    rating: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  }).isRequired,
  onFilterChange: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired,
  onFavorite: PropTypes.func.isRequired,
  onBook: PropTypes.func.isRequired
};
