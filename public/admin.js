// admin.js
document.addEventListener("DOMContentLoaded", () => {
  const usersTableBody = document.querySelector("#usersTable tbody");

  // Fetch all users
  function loadUsers() {
    fetch("/admin/users")
      .then((res) => res.json())
      .then((users) => {
        usersTableBody.innerHTML = "";
        users.forEach((user) => {
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${user.id}</td>
            <td>${user.username}</td>
            <td>${user.role}</td>
            <td>${user.approved ? "✅" : "⏳"}</td>
            <td>
              ${!user.approved ? `<button class="approveBtn" data-id="${user.id}">Approve</button>` : ""}
              ${user.role !== "admin" ? `<button class="makeAdminBtn" data-id="${user.id}">Make Admin</button>` : ""}
            </td>
          `;
          usersTableBody.appendChild(tr);
        });

        // Add button listeners
        document.querySelectorAll(".approveBtn").forEach((btn) => {
          btn.addEventListener("click", () => {
            const userId = btn.dataset.id;
            fetch("/admin/approve", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId }),
            }).then(() => loadUsers());
          });
        });

        document.querySelectorAll(".makeAdminBtn").forEach((btn) => {
          btn.addEventListener("click", () => {
            const userId = btn.dataset.id;
            fetch("/admin/make-admin", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId }),
            }).then(() => loadUsers());
          });
        });
      });
  }

  loadUsers();
});
