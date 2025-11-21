export default function AuthForm({ fields, onSubmit, buttonText }) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      {fields.map((field) =>
        field.type === "select" ? (
          <div key={field.name}>
            <select
              name={field.name}
              value={field.value}
              onChange={field.onChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all outline-none bg-white"
            >
              {field.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <input
            key={field.name}
            type={field.type}
            name={field.name}
            placeholder={field.placeholder}
            value={field.value}
            onChange={field.onChange}
            required
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all outline-none placeholder:text-gray-400"
          />
        )
      )}
      <button
        type="submit"
        className="mt-2 w-full py-3 px-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-semibold hover:from-pink-600 hover:to-rose-600 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
      >
        {buttonText}
      </button>
    </form>
  );
}
