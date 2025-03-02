// script.js
document.addEventListener('DOMContentLoaded', () => {
    // Registration Handler (only on register.html)
    const regButton = document.getElementById('reg-button');
    if (regButton) {
        regButton.addEventListener('click', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('reg-email').value;
            const password = document.getElementById('reg-password').value;
            const role = document.getElementById('selection').value;

            try {
                const response = await fetch('/api/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password, role })
                });
                
                const data = await response.json();
                if (response.ok) {
                    alert('Registration successful!');
                    window.location.href = '/index.html';
                } else {
                    alert(data.error || 'Registration failed');
                }
            } catch (error) {
                alert('Network error');
            }
        });
    }

    // Login Handler (only on index.html)
    const loginButton = document.getElementById('submit-btn');
    if (loginButton) {
        loginButton.addEventListener('click', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();
                if (response.ok) {
                    window.location.href = `/${data.role.toLowerCase()}.html`;
                } else {
                    alert(data.error || 'Login failed');
                }
            } catch (error) {
                alert('Network error');
            }
        });
    }
});
