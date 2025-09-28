import React, { useEffect, useState } from 'react';
import ProductCard from './ProductCard';
import CartPanel from './CartPanel';

// fallback mock data (used if backend is unreachable)
const MOCK_PRODUCTS = [
  { id: 1, name: 'Banarasi Handloom Saree', price: 12500, stock: 5, fabric: 'Banarasi Silk', artisan: 'Varanasi Weavers', img: 'https://via.placeholder.com/300x300?text=Banarasi', story: 'Handwoven in Varanasi with traditional zari motifs.' },
  { id: 2, name: 'Kanchipuram Silk Saree', price: 15000, stock: 3, fabric: 'Kanchipuram Silk', artisan: 'Kanchi Loomworks', img: 'https://via.placeholder.com/300x300?text=Kanchipuram', story: 'Temple border, family looms.' },
  { id: 3, name: 'Ikat Dupatta', price: 2200, stock: 12, fabric: 'Cotton Ikat', artisan: 'Ikat Collective', img: 'https://via.placeholder.com/300x300?text=Ikat', story: 'Classic ikat pattern.' }
];

const MOCK_CUSTOMERS = [
  { id: 1, name: 'Riya Sen', phone: '9876543210' },
  { id: 2, name: 'Test Customer', phone: '9999999999' }
];

export default function HeritagePOS() {
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [customers, setCustomers] = useState(MOCK_CUSTOMERS);
  const [query, setQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // try to load real inventory & customers; keep mock if unavailable
    (async () => {
      try {
        const invRes = await fetch('/inventory/all');
        if (invRes.ok) {
          const inv = await invRes.json();
          setProducts(inv);
        }
      } catch (e) { /* keep mock */ }

      try {
        const custRes = await fetch('/customers/all');
        if (custRes.ok) {
          const cust = await custRes.json();
          setCustomers(cust);
        }
      } catch (e) { /* keep mock */ }
    })();
  }, []);

  function addToCart(product, qty = 1) {
    setCart(prev => {
      const idx = prev.findIndex(p => p.id === product.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], qty: copy[idx].qty + qty };
        return copy;
      }
      return [...prev, { id: product.id, name: product.name, price: product.price, qty }];
    });
    setMessage('');
  }

  function updateQty(itemId, qty) {
    setCart(prev => prev.map(it => it.id === itemId ? { ...it, qty } : it));
  }

  function removeItem(itemId) {
    setCart(prev => prev.filter(it => it.id !== itemId));
  }

  const subtotal = cart.reduce((s, it) => s + it.price * it.qty, 0);
  const tax = +(subtotal * 0.05).toFixed(2);
  const grandTotal = +(subtotal + tax).toFixed(2);

  async function handleCheckout() {
    if (!selectedCustomer) { setMessage('Select a customer before checkout'); return; }
    if (cart.length === 0) { setMessage('Cart is empty'); return; }

    setMessage('Processing checkout...');
    try {
      // post each cart item to backend sales endpoint; backend deducts stock
      for (const item of cart) {
        const payload = { customer_id: selectedCustomer, product_id: item.id, quantity: item.qty };
        const res = await fetch('/sales/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || 'Sale failed');
        }
      }

      // successful — print receipt & refresh products list
      setMessage('Checkout successful — printing receipt...');
      const receiptHtml = buildReceipt(cart, customers, selectedCustomer, subtotal, tax, grandTotal, notes);
      const win = window.open('', '_blank');
      win.document.write(receiptHtml);
      win.document.close();
      win.print();

      // clear cart and reload inventory from server
      setCart([]);
      setNotes('');
      setSelectedCustomer('');
      try {
        const invRes = await fetch('/inventory/all');
        if (invRes.ok) setProducts(await invRes.json());
      } catch(e){}
      setMessage('Done');
    } catch (e) {
      console.error(e);
      setMessage('Checkout failed or server unreachable. Sale not recorded on server.');
      // optionally store the cart locally (IndexedDB) for later sync — TODO
    }
  }

  function buildReceipt(cart, customers, selectedCustomer, subtotal, tax, grandTotal, notes) {
    const cust = customers.find(c => c.id == selectedCustomer) || { name: 'Walk-in' };
    const lines = cart.map(it => `<tr><td>${it.name}</td><td>${it.qty}</td><td>₹${it.price}</td><td>₹${it.price * it.qty}</td></tr>`).join('');
    return `
      <html><head><title>Receipt</title><style>body{font-family:Arial;padding:20px}h1{font-family:serif}</style></head><body>
      <div style="text-align:center">
        <h1>শুভলক্ষ্মী ক্রিয়েশন</h1>
        <div style="font-size:12px">Subhalakshmi Creation</div>
        <hr/>
      </div>
      <div><strong>Customer:</strong> ${cust.name}<br/><strong>Date:</strong> ${new Date().toLocaleString()}<br/><strong>Note:</strong> ${notes || '-'}</div>
      <br/>
      <table style="width:100%; border-collapse:collapse" border="1">
        <thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
        <tbody>${lines}</tbody>
      </table>
      <div style="text-align:right; margin-top:10px">
        <div>Subtotal: ₹${subtotal}</div>
        <div>Tax: ₹${tax}</div>
        <div style="font-weight:bold">Grand Total: ₹${grandTotal}</div>
      </div>
      <hr/>
      <div style="text-align:center; font-size:12px">Thank you for supporting artisans — Visit again!</div>
      </body></html>
    `;
  }

  const filtered = products.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="flex items-center justify-between mb-6">
        <div>
          <div className="text-4xl font-serif">শুভলক্ষ্মী ক্রিয়েশন</div>
          <div className="text-sm text-gray-600">Subhalakshmi Creation — Handloom & Heritage</div>
        </div>
        <div className="text-right">
          <div className="text-sm">Cashier: <strong>Admin</strong></div>
          <div className="text-sm text-gray-500">Shift: Morning</div>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-6">
        {/* Left: products */}
        <div className="col-span-7">
          <div className="flex items-center gap-3 mb-4">
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search products, fabric, artisan..." className="flex-1 p-2 rounded border" />
            <button onClick={() => setQuery('')} className="px-4 py-2 bg-gray-200 rounded">Clear</button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {filtered.map(p => (
              <ProductCard key={p.id} product={p} onAdd={addToCart} />
            ))}
          </div>
        </div>

        {/* Right: cart */}
        <CartPanel
          cart={cart}
          customers={customers}
          selectedCustomer={selectedCustomer}
          setSelectedCustomer={setSelectedCustomer}
          notes={notes}
          setNotes={setNotes}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          updateQty={updateQty}
          removeItem={removeItem}
          subtotal={subtotal}
          tax={tax}
          grandTotal={grandTotal}
          onCheckout={handleCheckout}
          onClear={() => { setCart([]); setMessage(''); }}
          message={message}
        />
      </div>
    </div>
  );
}
