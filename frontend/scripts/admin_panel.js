fetch(`${backend_url}/api/users`, {
    headers: {
        'Authorization': "Bearer " + localStorage.getItem('token'),
        'Content-Type': 'application/json'
    }
})
    .then(response => response.json())
    .then(data => {
        var usersTableBody = document.querySelector('#usersTable tbody');
        data.forEach(user => {
            if (user.role != "admin") {
                var tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${user.id}</td>
                    <td>${user.username}</td>
                    <td>${user.email}</td>
                    <td>${user.full_name}</td>
                    <td>${user.phone}</td>
                    <td>${user.dob}</td>
                    <td>${user.role}</td>
                    <td>
                        <button class="editBtn" data-user-id="${user.id}">Edit</button>
                        <button class="deleteBtn" data-user-id="${user.id}">Delete</button>
                    </td>
                `;
                usersTableBody.appendChild(tr);
            }
        });

        // Edit button click event
        document.querySelectorAll('.editBtn').forEach(btn => {
            btn.addEventListener('click', function () {
                var userId = this.getAttribute('data-user-id');
                window.location.href = `edit_user.html?user_id=${userId}`;
            });
        });

        // Delete button click event
        document.querySelectorAll('.deleteBtn').forEach(btn => {
            btn.addEventListener('click', function () {
                var userId = this.getAttribute('data-user-id');
                alert(userId);
                fetch(`${backend_url}/api/user/${userId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': "Bearer " + localStorage.getItem('token'),
                        'Content-Type': 'application/json'
                    }
                })
                    .then(response => response.json())
                    .then(data => {
                        alert(data.message);
                        window.location.reload();
                    });
            });
        });

        document.getElementById('logoutBtn').addEventListener('click', function () {
            fetch(`${backend_url}/api/logout`, {
                method: 'POST'
            })
                .then(response => response.json())
                .then(data => {
                    alert(data.message);
                    localStorage.removeItem('userId');
                    localStorage.removeItem('role');
                    window.location.href = 'index.html';
                });
        });
    });