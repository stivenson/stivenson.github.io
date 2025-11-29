// ═══════════════════════════════════════════════════════════════════════════
// CÓDIGO DE PROTECCIÓN - Directorio de Chats LLM
// Copyright © 2025 Stivenson. Todos los derechos reservados.
// ═══════════════════════════════════════════════════════════════════════════

(function () {
    'use strict';

    // ═══════════════════════════════════════════════════════════════════════
    // 1. MARCA DE AGUA EN CONSOLA
    // ═══════════════════════════════════════════════════════════════════════
    const styles = [
        'color: #667eea',
        'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'font-size: 16px',
        'font-weight: bold',
        'padding: 10px 20px',
        'border-radius: 5px'
    ].join(';');

    console.log('%c⚠️ ADVERTENCIA DE COPYRIGHT ⚠️', styles);
    console.log('%c\n╔══════════════════════════════════════════════════════════════╗', 'color: #667eea; font-weight: bold;');
    console.log('%c║  Este código está protegido por derechos de autor.          ║', 'color: #667eea;');
    console.log('%c║  © 2025 Stivenson. Todos los derechos reservados.           ║', 'color: #667eea;');
    console.log('%c║                                                              ║', 'color: #667eea;');
    console.log('%c║  Queda prohibida su reproducción, distribución o            ║', 'color: #667eea;');
    console.log('%c║  modificación sin autorización expresa del autor.           ║', 'color: #667eea;');
    console.log('%c╚══════════════════════════════════════════════════════════════╝\n', 'color: #667eea; font-weight: bold;');

    // ═══════════════════════════════════════════════════════════════════════
    // 2. DESHABILITAR CLIC DERECHO
    // ═══════════════════════════════════════════════════════════════════════
    document.addEventListener('contextmenu', function (e) {
        e.preventDefault();
        showProtectionMessage('Clic derecho deshabilitado');
        return false;
    });

    // ═══════════════════════════════════════════════════════════════════════
    // 3. DESHABILITAR ATAJOS DE TECLADO
    // ═══════════════════════════════════════════════════════════════════════
    document.addEventListener('keydown', function (e) {
        // F12 - DevTools
        if (e.key === 'F12' || e.keyCode === 123) {
            e.preventDefault();
            showProtectionMessage('Herramientas de desarrollador deshabilitadas');
            return false;
        }

        // Ctrl+Shift+I - Inspector
        if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.keyCode === 73)) {
            e.preventDefault();
            showProtectionMessage('Inspector deshabilitado');
            return false;
        }

        // Ctrl+Shift+J - Consola
        if (e.ctrlKey && e.shiftKey && (e.key === 'J' || e.keyCode === 74)) {
            e.preventDefault();
            showProtectionMessage('Consola deshabilitada');
            return false;
        }

        // Ctrl+Shift+C - Selector de elementos
        if (e.ctrlKey && e.shiftKey && (e.key === 'C' || e.keyCode === 67)) {
            e.preventDefault();
            showProtectionMessage('Selector de elementos deshabilitado');
            return false;
        }

        // Ctrl+U - Ver código fuente
        if (e.ctrlKey && (e.key === 'U' || e.keyCode === 85)) {
            e.preventDefault();
            showProtectionMessage('Ver código fuente deshabilitado');
            return false;
        }

        // Ctrl+S - Guardar página
        if (e.ctrlKey && (e.key === 'S' || e.keyCode === 83)) {
            e.preventDefault();
            showProtectionMessage('Guardar página deshabilitado');
            return false;
        }
    });

    // ═══════════════════════════════════════════════════════════════════════
    // 4. DETECCIÓN DE DEVTOOLS
    // ═══════════════════════════════════════════════════════════════════════
    let devtoolsOpen = false;
    const threshold = 160;

    const detectDevTools = () => {
        const widthThreshold = window.outerWidth - window.innerWidth > threshold;
        const heightThreshold = window.outerHeight - window.innerHeight > threshold;
        const orientation = widthThreshold ? 'vertical' : 'horizontal';

        if (!(heightThreshold && widthThreshold) &&
            ((window.Firebug && window.Firebug.chrome && window.Firebug.chrome.isInitialized) || widthThreshold || heightThreshold)) {
            if (!devtoolsOpen) {
                devtoolsOpen = true;
                showDevToolsWarning();
            }
        } else {
            devtoolsOpen = false;
        }
    };

    // Verificar cada segundo
    setInterval(detectDevTools, 1000);

    // ═══════════════════════════════════════════════════════════════════════
    // 5. FUNCIONES DE MENSAJES
    // ═══════════════════════════════════════════════════════════════════════
    function showProtectionMessage(message) {
        // Crear notificación temporal
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            z-index: 999999;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            font-weight: 600;
            animation: slideInRight 0.3s ease;
        `;
        notification.textContent = '🔒 ' + message;
        document.body.appendChild(notification);

        // Remover después de 3 segundos
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    function showDevToolsWarning() {
        const warning = document.createElement('div');
        warning.id = 'devtools-warning';
        warning.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            background: #ff6b6b;
            color: white;
            padding: 15px;
            text-align: center;
            z-index: 999999;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            font-weight: 600;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        `;
        warning.innerHTML = `
            ⚠️ ADVERTENCIA: Herramientas de desarrollador detectadas<br>
            <small style="font-size: 12px; opacity: 0.9;">Este sitio está protegido por derechos de autor © 2025 Stivenson</small>
        `;

        // Remover advertencia anterior si existe
        const existing = document.getElementById('devtools-warning');
        if (existing) existing.remove();

        document.body.insertBefore(warning, document.body.firstChild);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 6. DESHABILITAR SELECCIÓN DE TEXTO (OPCIONAL - COMENTADO)
    // ═══════════════════════════════════════════════════════════════════════
    // Descomenta si quieres deshabilitar la selección de texto
    /*
    document.addEventListener('selectstart', function(e) {
        e.preventDefault();
        return false;
    });
    
    document.addEventListener('copy', function(e) {
        e.preventDefault();
        showProtectionMessage('Copiar texto deshabilitado');
        return false;
    });
    */

    // ═══════════════════════════════════════════════════════════════════════
    // 7. ANIMACIONES CSS
    // ═══════════════════════════════════════════════════════════════════════
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    // ═══════════════════════════════════════════════════════════════════════
    // 8. MENSAJE INICIAL
    // ═══════════════════════════════════════════════════════════════════════
    console.log('%c💡 Tip: Si necesitas usar este código, contacta al autor para obtener permiso.', 'color: #4CAF50; font-size: 12px;');

})();
