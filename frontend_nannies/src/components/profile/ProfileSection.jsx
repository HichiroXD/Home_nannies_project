import React, { useState } from "react";
import { Save, X } from "lucide-react";

export default function ProfileSection({ title, children, isEditing, onEdit, onSave, isSaving }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        {!isEditing && (
          <button
            onClick={onEdit}
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Editar
          </button>
        )}
        {isEditing && (
          <div className="flex gap-2">
            <button
              onClick={onSave}
              disabled={isSaving}
              className="px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50"
            >
              <Save className="w-4 h-4 inline mr-2" />
              {isSaving ? "Guardando..." : "Guardar"}
            </button>
            <button
              onClick={() => onEdit(false)}
              className="px-4 py-2 text-sm bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
            >
              <X className="w-4 h-4 inline mr-2" />
              Cancelar
            </button>
          </div>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}
