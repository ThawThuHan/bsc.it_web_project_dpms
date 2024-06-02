function getParameterByName(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

document.addEventListener('DOMContentLoaded', function () {
    var userId = getParameterByName('user_id');
    var logged_user_id = localStorage.getItem('userId')
    if (!logged_user_id) {
        window.location.href = 'login.html';
    }

    fetch(`${backend_url}/api/user/${userId}`, {
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
            <p>Address: ${data.address}</p>
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

    document.getElementById('editBtn').addEventListener('click', function () {
        document.getElementById('editProfileForm').style.display = 'block';
    });

    document.getElementById('editProfileForm').addEventListener('submit', function (event) {
        event.preventDefault();
        var formData = new FormData(this);
        var jsonData = {};
        formData.forEach((value, key) => jsonData[key] = value);

        fetch(`${backend_url}/api/user/${userId}`, {
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
});