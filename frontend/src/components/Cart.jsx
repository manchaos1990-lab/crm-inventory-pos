export default function Cart({ cart, setCart }) {
  const total = cart.reduce((sum, item) => sum + item.price, 0);

  const removeItem = (index) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-indigo-700">
      <h2 className="font-serif text-xl mb-4">Cart</h2>
      {cart.length === 0 ? (
        <p className="text-gray-500">No items yet.</p>
      ) : (
        <div className="space-y-3">
          {cart.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center">
              <span>{item.name}</span>
              <span>₹ {item.price}</span>
              <button
                onClick={() => removeItem(idx)}
                className="text-red-500 text-sm"
              >
                ✕
              </button>
            </div>
          ))}
          <hr className="my-2" />
          <div className="flex justify-between font-bold text-indigo-900">
            <span>Total</span>
            <span>₹ {total}</span>
          </div>
        </div>
      )}
    </div>
  );
}
