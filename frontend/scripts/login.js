document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault();
    var formData = new FormData(this);
    var jsonData = {};
    formData.forEach((value, key) => jsonData[key] = value);

    fetch(`${backend_url}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jsonData)
    })
        .then(response => response.json())
        .then(data => {
            document.getElementById('message').innerText = data.message;
            if (data.message === "Logged in successfully") {
                localStorage.setItem('userId', data.user_id);
                localStorage.setItem('role', data.role);
                localStorage.setItem('token', data.token);
                if (data.role == 'admin') {
                    window.location.href = 'admin_panel.html';
                } else window.location.href = "profile.html";
            }
        });
});