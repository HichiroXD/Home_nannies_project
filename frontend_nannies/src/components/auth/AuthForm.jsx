export default function AuthForm({ fields, onSubmit, buttonText, disabled = false }) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {fields.map((field) =>
        field.type === "select" ? (
          <select
            key={field.name}
            name={field.name}
            value={field.value}
            onChange={field.onChange}
            disabled={disabled}
            className="border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-pink-400"
          >
            {field.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            key={field.name}
            type={field.type}
            name={field.name}
            placeholder={field.placeholder}
            value={field.value}
            onChange={field.onChange}
            disabled={disabled}
            required
            className="border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-pink-400"
          />
        )
      )}
      <button
        type="submit"
        disabled={disabled}
        className="bg-pink-500 text-white py-2 rounded-lg font-semibold hover:bg-pink-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {buttonText}
      </button>
    </form>
  );
}
