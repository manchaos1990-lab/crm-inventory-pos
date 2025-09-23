import React from 'react';

export default function CartPanel({
  cart,
  customers,
  selectedCustomer,
  setSelectedCustomer,
  notes,
  setNotes,
  paymentMethod,
  setPaymentMethod,
  updateQty,
  removeItem,
  subtotal,
  tax,
  grandTotal,
  onCheckout,
  onClear,
  message
}) {
  return (
    <aside className="col-span-5 bg-white rounded-lg shadow p-4">
      <h3 className="text-xl font-semibold mb-3">Cart</h3>

      <div className="space-y-3 max-h-72 overflow-auto">
        {cart.length === 0 && <div className="text-gray-500">Cart is empty</div>}
        {cart.map(item => (
          <div key={item.id} className="flex items-center justify-between border rounded p-2">
            <div className="flex-1">
              <div className="font-medium">{item.name}</div>
              <div className="text-sm text-gray-500">₹{item.price} each</div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={item.qty}
                min="1"
                onChange={(e) => updateQty(item.id, parseInt(e.target.value) || 1)}
                className="w-16 p-1 border rounded text-center"
              />
              <div className="w-20 text-right">₹{item.price * item.qty}</div>
              <button onClick={() => removeItem(item.id)} className="ml-2 text-red-500">✕</button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 border-t pt-3">
        <div className="flex justify-between"><div>Subtotal</div><div>₹{subtotal}</div></div>
        <div className="flex justify-between"><div>Tax (5%)</div><div>₹{tax}</div></div>
        <div className="flex justify-between font-bold text-lg mt-2"><div>Total</div><div>₹{grandTotal}</div></div>
      </div>

      <div className="mt-4 space-y-3">
        <label className="block text-sm">Customer</label>
        <select value={selectedCustomer} onChange={e => setSelectedCustomer(e.target.value)} className="w-full p-2 border rounded">
          <option value="">Walk-in / Select Customer</option>
          {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        <label className="block text-sm mt-2">Notes</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full p-2 border rounded" placeholder="Add order notes or gift message"></textarea>

        <div>
          <label className="block text-sm">Payment</label>
          <div className="flex gap-2 mt-1">
            <button onClick={() => setPaymentMethod('cash')} className={`px-3 py-1 border rounded ${paymentMethod === 'cash' ? 'bg-gray-200' : ''}`}>Cash</button>
            <button onClick={() => setPaymentMethod('card')} className={`px-3 py-1 border rounded ${paymentMethod === 'card' ? 'bg-gray-200' : ''}`}>Card</button>
            <button onClick={() => setPaymentMethod('upi')} className={`px-3 py-1 border rounded ${paymentMethod === 'upi' ? 'bg-gray-200' : ''}`}>UPI</button>
          </div>
        </div>

        <div className="flex gap-2 mt-3">
          <button onClick={onCheckout} className="flex-1 px-4 py-2 bg-green-600 text-white rounded">Checkout</button>
          <button onClick={onClear} className="px-4 py-2 border rounded">Clear</button>
        </div>

        {message && <div className="mt-3 text-sm text-rose-600">{message}</div>}
      </div>
    </aside>
  );
}
