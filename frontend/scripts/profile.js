document.addEventListener('DOMContentLoaded', function () {
    var userId = localStorage.getItem('userId');
    if (!userId) {
        window.location.href = 'login.html';
    }

    fetch(`${backend_url}/api/profile/${userId}`, {
        headers: {
            'Authorization': "Bearer " + localStorage.getItem('token'),
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            var profileDetails = document.getElementById('profileDetails');
            profileDetails.innerHTML = `
            <p>Username: ${data.username}</p>
            <p>Email: ${data.email}</p>
            <p>Full Name: ${data.full_name}</p>
            <p>Phone: ${data.phone}</p>
            <p>Date of Birth: ${data.dob}</p>
            <p>Address: ${data.address} </p>
        `;
            if (data.role === 'doctor') {
                profileDetails.innerHTML += `<p>Speciality: ${data.speciality}</p>`;
                document.getElementById('specialityInput').style.display = 'block';
            }

            document.getElementById('editProfileForm').elements['username'].value = data.username;
            document.getElementById('editProfileForm').elements['email'].value = data.email;
            document.getElementById('editProfileForm').elements['full_name'].value = data.full_name;
            document.getElementById('editProfileForm').elements['phone'].value = data.phone;
            document.getElementById('editProfileForm').elements['dob'].value = data.dob;
            document.getElementById('editProfileForm').elements['address'].value = data.address;
            if (data.role === 'doctor') {
                document.getElementById('editProfileForm').elements['speciality'].value = data.speciality;
            }
        });

    document.getElementById('editProfileBtn').addEventListener('click', function () {
        document.getElementById('editProfileForm').style.display = 'block';
    });

    document.getElementById('editProfileForm').addEventListener('submit', function (event) {
        event.preventDefault();
        var formData = new FormData(this);
        var jsonData = {};
        formData.forEach((value, key) => jsonData[key] = value);

        fetch(`${backend_url}/api/profile/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', "Authorization": "Bearer " + localStorage.getItem('token') },
            body: JSON.stringify(jsonData)
        })
            .then(response => response.json())
            .then(data => {
                alert(data.message);
                window.location.reload();
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