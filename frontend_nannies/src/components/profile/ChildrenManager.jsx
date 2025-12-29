import { useState } from "react";
import { Users, Plus, Edit2, Trash2, X, Save, Baby } from "lucide-react";

/**
 * ChildrenManager - Componente para gestionar los hijos del padre
 * Permite agregar, editar y eliminar información de los niños
 */
export default function ChildrenManager({ children, onAddChild, onUpdateChild, onDeleteChild, isEditing }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingChild, setEditingChild] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    date_of_birth: "",
    gender: "",
    allergies: "",
    medical_conditions: "",
    special_needs: "",
    medications: "",
    emergency_contact: "",
    notes: "",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      age: "",
      date_of_birth: "",
      gender: "",
      allergies: "",
      medical_conditions: "",
      special_needs: "",
      medications: "",
      emergency_contact: "",
      notes: "",
    });
    setShowAddForm(false);
    setEditingChild(null);
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return "";
    
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let years = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    // Ajustar si aún no ha cumplido años este año
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      years--;
    }
    
    // Si tiene menos de 1 año, calcular meses
    if (years < 1) {
      let months = monthDiff;
      if (monthDiff < 0) {
        months = 12 + monthDiff;
      }
      if (today.getDate() < birthDate.getDate()) {
        months--;
      }
      if (months < 0) months = 0;
      return `${months} meses`;
    }
    
    return years;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Si se cambia la fecha de nacimiento, calcular la edad automáticamente
    if (name === "date_of_birth" && value) {
      const calculatedAge = calculateAge(value);
      setFormData((prev) => ({ 
        ...prev, 
        [name]: value,
        age: calculatedAge
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!formData.name || !formData.age) {
      alert("Por favor completa al menos el nombre y la edad del niño");
      return;
    }

    try {
      if (editingChild) {
        await onUpdateChild(editingChild.id, formData);
      } else {
        await onAddChild(formData);
      }
      resetForm();
    } catch (error) {
      console.error("Error al guardar hijo:", error);
      alert("Error al guardar la información del hijo");
    }
  };

  const handleEdit = (child) => {
    setFormData({
      name: child.name || "",
      age: child.age || "",
      date_of_birth: child.date_of_birth || "",
      gender: child.gender || "",
      allergies: child.allergies || "",
      medical_conditions: child.medical_conditions || "",
      special_needs: child.special_needs || "",
      medications: child.medications || "",
      emergency_contact: child.emergency_contact || "",
      notes: child.notes || "",
    });
    setEditingChild(child);
    setShowAddForm(true);
  };

  const handleDelete = async (childId, childName) => {
    if (window.confirm(`¿Estás seguro que deseas eliminar a ${childName}?`)) {
      try {
        await onDeleteChild(childId);
      } catch (error) {
        console.error("Error al eliminar hijo:", error);
        alert("Error al eliminar el hijo");
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Header con botón para agregar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">Mis Hijos</h3>
          <span className="text-sm text-gray-500">({children?.length || 0})</span>
        </div>
        {isEditing && !showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Agregar Hijo
          </button>
        )}
      </div>

      {/* Formulario para agregar/editar */}
      {showAddForm && isEditing && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-800">
              {editingChild ? "Editar Información" : "Agregar Nuevo Hijo"}
            </h4>
            <button
              onClick={resetForm}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Información Básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre Completo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: María González"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Nacimiento <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleInputChange}
                  required
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">La edad se calculará automáticamente</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Edad
                </label>
                <input
                  type="text"
                  name="age"
                  value={formData.age}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                  placeholder="Se calcula automáticamente"
                />
                <p className="text-xs text-gray-500 mt-1">Incluye infantes (menores de 1 año)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Género
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Seleccionar...</option>
                  <option value="male">Masculino</option>
                  <option value="female">Femenino</option>
                  <option value="other">Otro</option>
                </select>
              </div>
            </div>

            {/* Información Médica */}
            <div className="pt-4 border-t border-blue-300">
              <h5 className="text-md font-semibold text-gray-800 mb-3">Información Médica</h5>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alergias
                  </label>
                  <textarea
                    name="allergies"
                    value={formData.allergies}
                    onChange={handleInputChange}
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ej: Lactosa, maní, polen..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Condiciones Médicas
                  </label>
                  <textarea
                    name="medical_conditions"
                    value={formData.medical_conditions}
                    onChange={handleInputChange}
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ej: Asma, diabetes..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Necesidades Especiales
                  </label>
                  <textarea
                    name="special_needs"
                    value={formData.special_needs}
                    onChange={handleInputChange}
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ej: Autismo, TDAH, dieta especial..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Medicamentos
                  </label>
                  <textarea
                    name="medications"
                    value={formData.medications}
                    onChange={handleInputChange}
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Medicamentos que toma regularmente..."
                  />
                </div>
              </div>
            </div>

            {/* Contacto de Emergencia */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contacto de Emergencia
              </label>
              <input
                type="text"
                name="emergency_contact"
                value={formData.emergency_contact}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nombre y teléfono de contacto adicional"
              />
            </div>

            {/* Notas Adicionales */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas Adicionales
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Información adicional importante para la niñera..."
              />
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                {editingChild ? "Guardar Cambios" : "Agregar Hijo"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de hijos */}
      {children && children.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {children.map((child) => (
            <div
              key={child.id}
              className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                    <Baby className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">{child.name}</h4>
                    <p className="text-sm text-gray-500">
                      {child.age} {child.age === 1 ? "año" : "años"}
                      {child.gender && (
                        <span className="ml-2">
                          • {child.gender === "male" ? "Niño" : child.gender === "female" ? "Niña" : ""}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(child)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(child.id, child.name)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Información adicional */}
              <div className="space-y-2 text-sm">
                {child.date_of_birth && (
                  <div>
                    <span className="font-medium text-gray-700">Nacimiento:</span>
                    <span className="ml-2 text-gray-600">
                      {new Date(child.date_of_birth).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                )}
                
                {child.allergies && (
                  <div>
                    <span className="font-medium text-gray-700">Alergias:</span>
                    <span className="ml-2 text-gray-600">{child.allergies}</span>
                  </div>
                )}
                
                {child.medical_conditions && (
                  <div>
                    <span className="font-medium text-gray-700">Condiciones:</span>
                    <span className="ml-2 text-gray-600">{child.medical_conditions}</span>
                  </div>
                )}
                
                {child.special_needs && (
                  <div>
                    <span className="font-medium text-gray-700">Necesidades:</span>
                    <span className="ml-2 text-gray-600">{child.special_needs}</span>
                  </div>
                )}

                {child.notes && (
                  <div className="pt-2 mt-2 border-t border-gray-200">
                    <span className="font-medium text-gray-700">Notas:</span>
                    <p className="mt-1 text-gray-600">{child.notes}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Baby className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">No has agregado información de tus hijos</p>
          <p className="text-sm text-gray-500 mb-4">
            Agrega los datos de tus hijos para que las niñeras conozcan sus necesidades
          </p>
          {isEditing && !showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Agregar Primer Hijo
            </button>
          )}
        </div>
      )}
    </div>
  );
}
