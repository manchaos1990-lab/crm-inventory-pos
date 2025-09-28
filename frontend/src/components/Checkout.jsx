import { useState, useEffect } from "react";

export default function Checkout({ cart }) {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");

  useEffect(() => {
    fetch("/customers/all")
      .then((res) => res.json())
      .then((data) => setCustomers(data))
      .catch((err) => console.error("Error fetching customers:", err));
  }, []);

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  const handleCheckout = () => {
    cart.forEach((item) => {
      fetch("/sales/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: selectedCustomer,
          product_id: item.id,
          quantity: 1,
        }),
      })
        .then((res) => res.json())
        .then((data) => console.log("Sale added:", data))
        .catch((err) => console.error(err));
    });
    alert("✅ Checkout completed!");
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-gold-500">
      <h2 className="font-serif text-xl mb-4">Checkout</h2>
      <select
        value={selectedCustomer}
        onChange={(e) => setSelectedCustomer(e.target.value)}
        className="w-full border rounded p-2 mb-3"
      >
        <option value="">Select Customer</option>
        {customers.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name} ({c.phone})
          </option>
        ))}
      </select>
      <div className="flex justify-between font-bold mb-3">
        <span>Total</span>
        <span>₹ {total}</span>
      </div>
      <button
        disabled={!selectedCustomer || cart.length === 0}
        onClick={handleCheckout}
        className="w-full bg-green-600 text-white p-3 rounded hover:bg-green-700 disabled:opacity-50"
      >
        Proceed to Payment
      </button>
    </div>
  );
}
