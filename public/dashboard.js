document.addEventListener("DOMContentLoaded", () => {
  const adminLink = document.getElementById("adminPanelLink");

  // --- Fetch all users to check admin ---
  fetch("/admin/users")
    .then(res => {
      if (res.status === 403) {
        // Not admin
        adminLink.style.display = "none";
      } else {
        adminLink.style.display = "inline";
        adminLink.href = "/admin.html";
      }
    })
    .catch(() => adminLink.style.display = "none");

  // --- Fetch Customers ---
  fetch("/customers/all")
    .then(res => res.json())
    .then(customers => {
      const ul = document.getElementById("customersList");
      ul.innerHTML = "";
      customers.forEach(c => {
        const li = document.createElement("li");
        li.textContent = `${c.name} (${c.phone})`;
        ul.appendChild(li);
      });
    });

  // --- Fetch Inventory ---
  fetch("/inventory/all")
    .then(res => res.json())
    .then(items => {
      const ul = document.getElementById("inventoryList");
      ul.innerHTML = "";
      items.forEach(i => {
        const li = document.createElement("li");
        li.textContent = `${i.name} - ${i.category} - ₹${i.price}`;
        ul.appendChild(li);
      });
    });

  // --- Fetch Sales ---
  fetch("/sales/all")
    .then(res => res.json())
    .then(sales => {
      const ul = document.getElementById("salesList");
      ul.innerHTML = "";
      sales.forEach(s => {
        const li = document.createElement("li");
        li.textContent = `${s.customer_name} bought ${s.product_name} x${s.quantity} = ₹${s.total}`;
        ul.appendChild(li);
      });
    });
});
