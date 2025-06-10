document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', (event) => {
            event.preventDefault(); // Evita el envío del formulario tradicional

            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            // En un entorno real, aquí se enviaría esta información a un backend para autenticación.
            // Por ahora, simularemos un inicio de sesión exitoso y redirigiremos.
            if (username === 'empleado' && password === 'lumo123') {
                alert('Inicio de sesión exitoso. ¡Bienvenido a Lumo Chat!');
                // Redirige a la página principal del chat
                window.location.href = 'index.html'; 
            } else {
                alert('Usuario o contraseña incorrectos.');
            }
        });
    }
});