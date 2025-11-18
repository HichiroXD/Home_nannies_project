import React from "react";
import { Link } from "react-router-dom";

export default function QuickLinkButton({ title, description, icon: Icon, to, color }) {
  return (
    <Link
      to={to}
      className="block bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-lg" style={{ backgroundColor: `${color}20` }}>
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="text-gray-600 text-sm mt-1">{description}</p>
        </div>
      </div>
    </Link>
  );
}
