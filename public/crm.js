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
      <td><button onclick="editCustomer(${c.id})">✏️ Edit</button></td>
    </tr>`;
  });
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
  await fetch("/customers/add", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify(customer)
  });
  e.target.reset();
  loadCustomers();
});

// Edit customer
async function editCustomer(id) {
  const res = await fetch(`/customers/${id}`);
  const c = await res.json();

  document.getElementById("cust_name").value = c.name;
  document.getElementById("cust_phone").value = c.phone || "";
  document.getElementById("cust_email").value = c.email || "";
  document.getElementById("cust_address").value = c.address || "";
  document.getElementById("cust_notes").value = c.notes || "";

  // Override submit to update
  document.getElementById("customerForm").onsubmit = async (e) => {
    e.preventDefault();
    const updated = {
      name: document.getElementById("cust_name").value,
      phone: document.getElementById("cust_phone").value,
      email: document.getElementById("cust_email").value,
      address: document.getElementById("cust_address").value,
      notes: document.getElementById("cust_notes").value
    };
    await fetch(`/customers/update/${id}`, {
      method: "PUT",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify(updated)
    });
    e.target.reset();
    loadCustomers();
    // Reset form to add mode
    document.getElementById("customerForm").onsubmit = addCustomerDefault;
  };
};

function addCustomerDefault(e) {} // placeholder to reset submit later

// Initial load
loadCustomers();
