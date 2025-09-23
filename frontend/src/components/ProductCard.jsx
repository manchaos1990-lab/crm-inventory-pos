export default function ProductCard({ product, addToCart }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-4 flex flex-col items-center border-2 border-gray-200 hover:shadow-2xl transition duration-300">
      <img
        src={product.image}
        alt={product.name}
        className="w-40 h-40 object-cover rounded-lg mb-2"
      />
      <h2 className="mt-2 font-serif text-xl text-indigo-900">{product.name}</h2>
      <p className="text-sm text-gray-600">{product.fabric}</p>
      <p className="mt-1 font-bold text-indigo-700">₹ {product.price}</p>
      <p className="mt-1 text-xs text-gray-400 italic">{product.story}</p>
      <button
        onClick={() => addToCart(product)}
        className="mt-3 bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 transition"
      >
        + Add
      </button>
    </div>
  );
}
