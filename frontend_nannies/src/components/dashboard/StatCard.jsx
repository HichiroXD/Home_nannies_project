import React from "react";

export default function StatCard({ title, value, icon: Icon, color, trend }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4" style={{ borderColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {trend && (
            <p className={`text-sm mt-2 ${trend > 0 ? "text-green-500" : "text-red-500"}`}>
              {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}% vs último periodo
            </p>
          )}
        </div>
        {Icon && (
          <div className="p-3 rounded-full" style={{ backgroundColor: `${color}20` }}>
            <Icon className="w-8 h-8" style={{ color }} />
          </div>
        )}
      </div>
    </div>
  );
}
