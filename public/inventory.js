// Fetch products
async function loadProducts() {
  const res = await fetch("/inventory/all");
  const data = await res.json();
  const tableBody = document.querySelector("#productTable tbody");
  tableBody.innerHTML = "";
  data.forEach(p => {
    tableBody.innerHTML += `<tr>
      <td>${p.id}</td><td>${p.name}</td><td>${p.category}</td><td>${p.sub_category||""}</td>
      <td>${p.sub_sub_category||""}</td><td>${p.more_category||""}</td>
      <td>₹${p.price}</td><td>${p.stock}</td><td>${p.popularity||""}</td>
      <td>${p.notes||""}</td><td>${p.media_url ? `<a href="${p.media_url}" target="_blank">View</a>` : ""}</td>
      <td><button onclick="editProduct(${p.id})">✏️ Edit</button></td>
    </tr>`;
  });
}

// Add product
document.getElementById("productForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const product = {
    name: document.getElementById("name").value,
    category: document.getElementById("category").value,
    sub_category: document.getElementById("sub_category").value,
    sub_sub_category: document.getElementById("sub_sub_category").value,
    more_category: document.getElementById("more_category").value,
    price: document.getElementById("price").value,
    stock: document.getElementById("stock").value,
    popularity: document.getElementById("popularity").value,
    notes: document.getElementById("notes").value,
    media_url: document.getElementById("media_url").value
  };
  await fetch("/inventory/add", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify(product)
  });
  e.target.reset();
  loadProducts();
});

// Edit product
async function editProduct(id) {
  const res = await fetch(`/inventory/${id}`);
  const p = await res.json();

  document.getElementById("name").value = p.name;
  document.getElementById("category").value = p.category;
  document.getElementById("sub_category").value = p.sub_category || "";
  document.getElementById("sub_sub_category").value = p.sub_sub_category || "";
  document.getElementById("more_category").value = p.more_category || "";
  document.getElementById("price").value = p.price;
  document.getElementById("stock").value = p.stock;
  document.getElementById("popularity").value = p.popularity || "";
  document.getElementById("notes").value = p.notes || "";
  document.getElementById("media_url").value = p.media_url || "";

  document.getElementById("productForm").onsubmit = async (e) => {
    e.preventDefault();
    const updated = {
      name: document.getElementById("name").value,
      category: document.getElementById("category").value,
      sub_category: document.getElementById("sub_category").value,
      sub_sub_category: document.getElementById("sub_sub_category").value,
      more_category: document.getElementById("more_category").value,
      price: document.getElementById("price").value,
      stock: document.getElementById("stock").value,
      popularity: document.getElementById("popularity").value,
      notes: document.getElementById("notes").value,
      media_url: document.getElementById("media_url").value
    };
    await fetch(`/inventory/update/${id}`, {
      method: "PUT",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify(updated)
    });
    e.target.reset();
    loadProducts();
    document.getElementById("productForm").onsubmit = addProductDefault;
  };
}

function addProductDefault(e) {} // placeholder

// Initial load
loadProducts();
