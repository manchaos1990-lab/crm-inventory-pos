import { useState, useEffect } from "react";
import Header from "./components/Header";
import ProductCard from "./components/ProductCard";
import Cart from "./components/Cart";
import Checkout from "./components/Checkout";

export default function App() {
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch("/inventory/all")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("Error fetching products:", err));
  }, []);

  const addToCart = (product) => {
    setCart((prev) => [...prev, product]);
  };

  return (
    <div className="min-h-screen bg-cream-50">
      <Header />
      <div className="flex p-6 gap-6">
        <div className="w-2/3 grid grid-cols-2 gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} addToCart={addToCart} />
          ))}
        </div>
        <div className="w-1/3 flex flex-col gap-6">
          <Cart cart={cart} />
          <Checkout cart={cart} />
        </div>
      </div>
    </div>
  );
}
