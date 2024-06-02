document.getElementById('roleSelect').addEventListener('change', function () {
    var specialityInput = document.getElementById('specialityInput');
    if (this.value == 'doctor') {
        specialityInput.style.display = 'block';
    } else {
        specialityInput.style.display = 'none';
    }
});

document.getElementById('registerForm').addEventListener('submit', function (event) {
    event.preventDefault();

    var formData = new FormData(this);
    var jsonData = {};
    formData.forEach((value, key) => jsonData[key] = value);

    var passwordRequirements = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRequirements.test(jsonData['password'])) {
        alert('Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.');
        return;
    }

    fetch(`${backend_url}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jsonData)
    })
        .then(response => response.json())
        .then(data => {
            document.getElementById('message').innerText = data.message;
            if (data.message === "User registered successfully") {
                window.location.href = 'login.html';
            }
        });
});