document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chatMessages');
    const messageInput = document.getElementById('messageInput');
    const sendMessageBtn = document.getElementById('sendMessageBtn');
    const newChatBtn = document.querySelector('.new-chat-btn'); // Still needed for sidebar button
    const openNewChatModalBtn = document.getElementById('openNewChatModalBtn'); // New: button to open modal
    const conversationsList = document.querySelector('.conversations-list');
    const sidebar = document.querySelector('.sidebar');
    const logoutBtn = document.querySelector('.logout-btn');
    const themeToggleBtn = document.querySelector('.theme-toggle-btn');
    const feedbackBtn = document.querySelector('.feedback-btn');
    
    // New: Header Action Menu elements
    const headerMenuBtn = document.getElementById('headerMenuBtn');
    const headerActionMenu = document.getElementById('headerActionMenu');
    const attachFileBtn = document.getElementById('attachFileBtn');
    const fileInput = document.getElementById('fileInput');
    const voiceInputBtn = document.getElementById('voiceInputBtn');
    
    // New: Notification Panel elements
    const notificationBell = document.getElementById('notificationBell');
    const notificationBadge = document.getElementById('notificationBadge');
    const notificationPanel = document.getElementById('notificationPanel');
    const closeNotificationPanelBtn = document.getElementById('closeNotificationPanelBtn');
    const notificationList = document.getElementById('notificationList');
    const clearAllNotificationsBtn = document.getElementById('clearAllNotificationsBtn');

    // New: New Chat Modal elements
    const newChatModal = document.getElementById('newChatModal');
    const newChatNameInput = document.getElementById('newChatNameInput');
    const createChatBtn = document.getElementById('createChatBtn');
    const cancelNewChatBtn = document.getElementById('cancelNewChatBtn');

    let notificationCount = 0; // Para el badge de notificaciones

    // --- Funcionalidad General ---

    // Función para añadir un mensaje al chat
    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${sender}-message`);
        messageDiv.innerHTML = `<p>${text}</p>`;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll al final
        
        // Incrementar notificaciones si el mensaje no es del usuario activo y la pestaña no está visible
        if (sender === 'bot' && document.visibilityState === 'hidden') {
            incrementNotificationCount();
        }
    }

    // --- Funcionalidad del Chat Input ---

    // Manejar el envío de mensajes
    sendMessageBtn.addEventListener('click', () => {
        const messageText = messageInput.value.trim();
        if (messageText) {
            addMessage(messageText, 'user');
            messageInput.value = ''; // Limpiar input
            messageInput.style.height = 'auto'; // Resetear altura del textarea

            // Simulación de respuesta del bot
            setTimeout(() => {
                const botResponse = `Has dicho: "${messageText}". Estoy trabajando en ello. (Esta es una respuesta simulada)`;
                addMessage(botResponse, 'bot');
                // Simular una nueva notificación en el panel
                addNotification(botResponse, 'reply');
            }, 1000); 
        }
    });

    // Permitir enviar con Enter, Shift+Enter para nueva línea
    messageInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) { 
            event.preventDefault(); 
            sendMessageBtn.click();
        }
    });

    // Ajustar altura del textarea dinámicamente
    messageInput.addEventListener('input', () => {
        messageInput.style.height = 'auto'; 
        messageInput.style.height = (messageInput.scrollHeight) + 'px';
    });

    // --- Funcionalidad de la Barra Lateral (Conversaciones) ---

    // Función para crear un nuevo item de conversación
    function createConversationItem(title, isActive = false) {
        const item = document.createElement('div');
        item.classList.add('conversation-item');
        if (isActive) item.classList.add('active');
        
        item.innerHTML = `
            <i class="fas fa-comment-alt"></i>
            <span>${title}</span>
            <div class="conversation-actions">
                <i class="fas fa-pen edit-icon"></i>
                <i class="fas fa-trash-alt delete-icon"></i>
            </div>
        `;
        conversationsList.prepend(item); 

        item.addEventListener('click', () => {
            document.querySelectorAll('.conversation-item').forEach(conv => conv.classList.remove('active'));
            item.classList.add('active');
            document.getElementById('currentChatTitle').textContent = title;
            chatMessages.innerHTML = ''; 
            addMessage(`Has cambiado a la conversación: "${title}".`, 'bot');
            resetNotificationCount(); // Resetear notificaciones al cambiar de chat
            // Aquí se cargaría la historia real de la conversación desde el backend
        });

        // Eventos para editar/eliminar
        item.querySelector('.edit-icon').addEventListener('click', (e) => {
            e.stopPropagation();
            const newTitle = prompt('Renombrar conversación:', title);
            if (newTitle) {
                item.querySelector('span').textContent = newTitle;
                if (item.classList.contains('active')) {
                    document.getElementById('currentChatTitle').textContent = newTitle;
                }
            }
        });

        item.querySelector('.delete-icon').addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm(`¿Estás seguro de que quieres eliminar la conversación "${title}"?`)) {
                item.remove();
                if (document.querySelectorAll('.conversation-item').length === 0) {
                    document.getElementById('currentChatTitle').textContent = 'Nuevo Chat';
                    chatMessages.innerHTML = '<div class="message bot-message"><p>¡Inicia una nueva conversación!</p></div>';
                } else if (item.classList.contains('active')) {
                     document.querySelector('.conversation-item').click();
                }
            }
        });
    }

    // Cargar conversaciones iniciales (ejemplo)
    createConversationItem('Soporte Técnico', false);
    createConversationItem('Políticas de Empresa', false);
    document.querySelector('.conversation-item.active').click(); // Simular que el chat inicial está activo


    // --- Funcionalidad Responsive Sidebar (mantener para móvil) ---
    // Este botón ahora solo abrirá/cerrará la barra lateral de conversaciones en móvil
    // En desktop, la barra lateral siempre estará visible.
    headerMenuBtn.addEventListener('click', (event) => {
        event.stopPropagation(); // Evita que el clic se propague al documento y cierre el menú inmediatamente
        if (window.innerWidth <= 768) { // Si es móvil, abre/cierra la sidebar
            sidebar.classList.toggle('open');
            headerActionMenu.classList.remove('show'); // Asegurarse de que el menú de acciones esté cerrado
        } else { // Si es desktop, abre/cierra el menú de acciones rápidas
            headerActionMenu.classList.toggle('show');
            sidebar.classList.remove('open'); // Asegurarse de que la sidebar esté cerrada
        }
    });

    // Cerrar sidebar Y/O menú de acciones rápidas al hacer clic fuera
    document.addEventListener('click', (event) => {
        if (window.innerWidth <= 768) { // Lógica para sidebar en móvil
            if (sidebar.classList.contains('open') && !sidebar.contains(event.target) && !headerMenuBtn.contains(event.target)) {
                sidebar.classList.remove('open');
            }
        }
        // Lógica para menú de acciones rápidas (siempre, pero su botón es headerMenuBtn)
        if (headerActionMenu.classList.contains('show') && !headerActionMenu.contains(event.target) && !headerMenuBtn.contains(event.target)) {
            headerActionMenu.classList.remove('show');
        }
        // Cerrar modal de nuevo chat si está abierto
        if (newChatModal.classList.contains('show') && !newChatModal.contains(event.target) && event.target !== openNewChatModalBtn) {
            newChatModal.classList.remove('show');
        }
        // Cerrar panel de notificaciones si está abierto
        if (notificationPanel.classList.contains('show') && !notificationPanel.contains(event.target) && event.target !== notificationBell) {
            notificationPanel.classList.remove('show');
        }
    });


    // --- Funcionalidad de Cerrar Sesión ---
    logoutBtn.addEventListener('click', () => {
        if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
            window.location.href = 'login.html'; 
        }
    });

    // --- Funcionalidad Modo Oscuro ---
    themeToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        if (document.body.classList.contains('dark-mode')) {
            localStorage.setItem('lumoTheme', 'dark');
            themeToggleBtn.querySelector('i').classList.replace('fa-moon', 'fa-sun');
        } else {
            localStorage.setItem('lumoTheme', 'light');
            themeToggleBtn.querySelector('i').classList.replace('fa-sun', 'fa-moon');
        }
    });

    // Cargar preferencia de tema al inicio
    const savedTheme = localStorage.getItem('lumoTheme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggleBtn.querySelector('i').classList.replace('fa-moon', 'fa-sun');
    } else {
        themeToggleBtn.querySelector('i').classList.replace('fa-sun', 'fa-moon');
    }

    // --- Funcionalidad Feedback ---
    feedbackBtn.addEventListener('click', () => {
        alert('¡Gracias por tu feedback! Tus comentarios nos ayudan a mejorar Lumo Chat. (Aquí se abriría un formulario o modal real)');
    });

    // --- Funcionalidad Header Action Menu (antes Floating Menu) ---
    // Los clics en headerMenuBtn ahora manejan esto (ver arriba)

    // Manejar clics en los ítems del menú (simulación)
    headerActionMenu.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', (event) => {
            event.stopPropagation();
            const action = item.textContent.trim();
            if (action === 'Adjuntar Archivo') {
                fileInput.click();
            } else {
                alert(`Haz clickeado en: "${action}". (Esta funcionalidad se desarrollará en el backend)`);
            }
            headerActionMenu.classList.remove('show'); // Cerrar menú después de la selección
        });
    });

    // --- Funcionalidad Adjuntar Archivo ---
    fileInput.addEventListener('change', (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile) {
            addMessage(`Archivo adjunto: ${selectedFile.name} (${(selectedFile.size / 1024).toFixed(2)} KB).`, 'user');
            setTimeout(() => {
                addMessage(`He recibido el archivo "${selectedFile.name}". ¿Cómo te gustaría que lo procese?`, 'bot');
            }, 1000);
            fileInput.value = '';
        }
    });

    // --- Funcionalidad Entrada de Voz (Speech Recognition API) ---
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition;
    let isListening = false;

    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'es-ES';

        recognition.onstart = () => {
            isListening = true;
            voiceInputBtn.style.backgroundColor = '#dc3545';
            voiceInputBtn.style.transform = 'scale(1.1)';
            messageInput.placeholder = 'Escuchando...';
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            messageInput.value = transcript;
            messageInput.focus();
            // Optionally, trigger send automatically if transcript is meaningful
            // if (transcript.length > 0) sendMessageBtn.click();
        };

        recognition.onend = () => {
            isListening = false;
            voiceInputBtn.style.backgroundColor = '#6c757d';
            voiceInputBtn.style.transform = 'scale(1)';
            messageInput.placeholder = 'Escribe tu mensaje aquí...';
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            // alert('Error en el reconocimiento de voz: ' + event.error); // Demasiado intrusivo
            isListening = false;
            voiceInputBtn.style.backgroundColor = '#6c757d';
            voiceInputBtn.style.transform = 'scale(1)';
            messageInput.placeholder = 'Escribe tu mensaje aquí...';
        };

        voiceInputBtn.addEventListener('click', () => {
            if (isListening) {
                recognition.stop();
            } else {
                recognition.start();
            }
        });
    } else {
        voiceInputBtn.style.display = 'none';
        console.warn('Speech Recognition API no soportada en este navegador.');
    }

    // --- Sistema de Notificaciones ---
    function incrementNotificationCount() {
        notificationCount++;
        notificationBadge.textContent = notificationCount;
        if (notificationCount > 0) {
            notificationBadge.classList.add('has-notifications');
            document.title = `(${notificationCount}) Lumo Chat`;
        }
    }

    function resetNotificationCount() {
        notificationCount = 0;
        notificationBadge.textContent = notificationCount;
        notificationBadge.classList.remove('has-notifications');
        document.title = `Lumo Chat`;
    }

    function addNotification(message, iconClass = 'info-circle') {
        const item = document.createElement('div');
        item.classList.add('notification-item');
        item.innerHTML = `
            <i class="fas fa-${iconClass}"></i>
            <span>${message}</span>
            <span class="notification-time">${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
        `;
        notificationList.prepend(item); // Añadir al principio

        if (!notificationPanel.classList.contains('show')) { // Solo incrementar si el panel no está abierto
            incrementNotificationCount();
        }
    }

    notificationBell.addEventListener('click', (event) => {
        event.stopPropagation(); // Evitar que el clic en la campana cierre el panel inmediatamente
        notificationPanel.classList.toggle('show');
        resetNotificationCount(); // Al abrir el panel, se consideran leídas
    });

    closeNotificationPanelBtn.addEventListener('click', () => {
        notificationPanel.classList.remove('show');
    });

    clearAllNotificationsBtn.addEventListener('click', () => {
        if (confirm('¿Estás seguro de que quieres borrar todas las notificaciones?')) {
            notificationList.innerHTML = ''; // Limpiar el contenido del panel
            resetNotificationCount(); // Asegurarse de que el badge también se resetea
        }
    });

    // --- Modal para Nuevo Chat ---
    openNewChatModalBtn.addEventListener('click', () => {
        newChatModal.classList.add('show');
        newChatNameInput.focus(); // Enfocar el input al abrir
    });

    cancelNewChatBtn.addEventListener('click', () => {
        newChatModal.classList.remove('show');
        newChatNameInput.value = ''; // Limpiar input
    });

    createChatBtn.addEventListener('click', () => {
        const chatName = newChatNameInput.value.trim();
        if (chatName) {
            createConversationItem(chatName, true); // Crear y activar la nueva conversación
            newChatModal.classList.remove('show');
            newChatNameInput.value = ''; // Limpiar input
            addMessage(`¡Bienvenido al nuevo chat: "${chatName}"!`, 'bot');
        } else {
            alert('Por favor, ingresa un nombre para el nuevo chat.');
        }
    });

    // Cerrar modal al hacer clic fuera (ya cubierto por el event listener global en document)
    // No necesitamos más event listeners específicos para cerrar el modal

    // Simular algunas notificaciones iniciales para demostración
    setTimeout(() => {
        addNotification('Tu saldo de vacaciones ha sido actualizado.', 'calendar-alt');
    }, 2000);
    setTimeout(() => {
        addNotification('Recordatorio: reunión de equipo a las 10 AM.', 'calendar');
    }, 4000);

    // Simular una nueva notificación cada X segundos si el panel no está abierto (para demo)
    // setInterval(() => {
    //     if (!notificationPanel.classList.contains('show')) { 
    //         addNotification('Nueva actualización de política de la empresa.', 'file-alt');
    //     }
    // }, 15000); 
});