import React from "react";

export default function ActivityItem({ timestamp, title, description, icon: Icon, color }) {
  return (
    <div className="flex gap-4 pb-4 border-b border-gray-200 last:border-b-0">
      <div className="flex-shrink-0 mt-1">
        <div className="p-2 rounded-full" style={{ backgroundColor: `${color}20` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
        <p className="text-xs text-gray-500 mt-2">{timestamp}</p>
      </div>
    </div>
  );
}
