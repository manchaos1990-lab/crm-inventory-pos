// Fetch and show all products
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
    </tr>`;
  });

  // Populate POS product dropdown
  const productSelect = document.getElementById("sale_product_id");
  productSelect.innerHTML = '<option value="">-- Select Product --</option>';
  data.forEach(p => productSelect.innerHTML += `<option value="${p.id}">${p.name}</option>`);
}

// Fetch and show all customers
async function loadCustomers() {
  const res = await fetch("/customers/all");
  const data = await res.json();
  const tableBody = document.querySelector("#customerTable tbody");
  tableBody.innerHTML = "";
  data.forEach(c => {
    tableBody.innerHTML += `<tr>
      <td>${c.id}</td><td>${c.name}</td><td>${c.phone||""}</td><td>${c.email||""}</td>
      <td>${c.address||""}</td><td>${c.notes||""}</td>
    </tr>`;
  });

  // Populate POS customer dropdown
  const custSelect = document.getElementById("sale_customer_id");
  custSelect.innerHTML = '<option value="">-- Select Customer --</option>';
  data.forEach(c => custSelect.innerHTML += `<option value="${c.id}">${c.name}</option>`);
}

// Add customer
document.getElementById("customerForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const customer = {
    name: document.getElementById("cust_name").value,
    phone: document.getElementById("cust_phone").value,
    email: document.getElementById("cust_email").value,
    address: document.getElementById("cust_address").value,
    notes: document.getElementById("cust_notes").value
  };
  await fetch("/customers/add", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(customer) });
  e.target.reset();
  loadCustomers();
});

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
  await fetch("/inventory/add", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(product) });
  e.target.reset();
  loadProducts();
});

// Record sale
document.getElementById("saleForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const sale = {
    customer_id: document.getElementById("sale_customer_id").value,
    product_id: document.getElementById("sale_product_id").value,
    quantity: document.getElementById("sale_quantity").value
  };
  const res = await fetch("/sales/add", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(sale)});
  const data = await res.json();
  loadSales();
});

// Load sales
async function loadSales() {
  const res = await fetch("/sales/all");
  const data = await res.json();
  const tableBody = document.querySelector("#salesTable tbody");
  tableBody.innerHTML = "";
  data.forEach(s => {
    tableBody.innerHTML += `<tr>
      <td>${s.id}</td><td>${s.customer_name}</td><td>${s.product_name}</td>
      <td>${s.quantity}</td><td>₹${s.total}</td><td>${s.date}</td>
    </tr>`;
  });

  // Update receipt
  const lastSale = data[data.length-1];
  if(lastSale) {
    document.getElementById("receipt").innerText =
      `শুভলক্ষ্মী ক্রিয়েশন\nSubhalakshmi Creation\n\nReceipt ID: ${lastSale.id}\nCustomer: ${lastSale.customer_name}\nProduct: ${lastSale.product_name}\nQuantity: ${lastSale.quantity}\nTotal: ₹${lastSale.total}\nDate: ${lastSale.date}`;
  }
}

// PDF download
function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const receiptText = document.getElementById("receipt").innerText;
  doc.setFontSize(18);
  doc.text("শুভলক্ষ্মী ক্রিয়েশন", 10, 15);
  doc.setFontSize(12);
  doc.text("Subhalakshmi Creation", 10, 25);
  doc.setFontSize(11);
  doc.text(receiptText.split("\n").slice(2).join("\n"), 10, 35);
  doc.save("receipt.pdf");
}

// Initial load
loadProducts();
loadCustomers();
loadSales();
