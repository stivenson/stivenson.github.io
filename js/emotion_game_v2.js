/**
 * Emotion Game - Phaser.js based interactive emotion selector
 * Integrado con n8n webhook para soporte en crisis TOC
 * 
 * Features:
 * - Selector interactivo de emociones relacionadas con TOC
 * - Chat integrado para comunicacion con asistente IA
 * - Conexion directa con workflow n8n de soporte en crisis
 */

// ============================================
// GESTIÓN DE PRIVACIDAD Y CONSENTIMIENTO
// ============================================
const PRIVACY_KEY = 'ocd_support_privacy_accepted';

// Mostrar banner de privacidad si no ha aceptado
window.addEventListener('DOMContentLoaded', () => {
    const privacyAccepted = localStorage.getItem(PRIVACY_KEY);
    if (!privacyAccepted) {
        showPrivacyBanner();
    }
});

function showPrivacyBanner() {
    const overlay = document.getElementById('privacy-overlay');
    const banner = document.getElementById('privacy-banner');
    if (overlay && banner) {
        overlay.style.display = 'block';
        banner.style.display = 'block';
    }
}

function acceptPrivacy() {
    localStorage.setItem(PRIVACY_KEY, 'true');
    const overlay = document.getElementById('privacy-overlay');
    const banner = document.getElementById('privacy-banner');
    if (overlay && banner) {
        overlay.style.display = 'none';
        banner.style.display = 'none';
    }
}

// Hacer funciones globales para el HTML
window.acceptPrivacy = acceptPrivacy;

function toggleChat() {
    const chatPanel = document.getElementById('chat-panel');
    if (chatPanel) {
        chatPanel.classList.toggle('minimized');
    }
}
window.toggleChat = toggleChat;

// ============================================
// CONFIGURACION API
// ============================================
const API_CONFIG = {
    // Base URL del webhook n8n - LLM-TOC-help-N8N
    // URL de producción: https://stivensonunisimon.app.n8n.cloud
    BASE_URL: 'https://stivensonunisimon.app.n8n.cloud',
    
    // Endpoint del webhook - Workflow principal de soporte en crisis TOC
    // POST: https://stivensonunisimon.app.n8n.cloud/webhook/webhook-test
    // OPTIONS: https://stivensonunisimon.app.n8n.cloud/webhook/webhook-test (CORS preflight)
    WEBHOOK_PATH: '/webhook/webhook-test'
};

// ============================================
// EMOTION DEFINITIONS (TOC-specific)
// ============================================
const EMOTIONS = [
    { key: 'ansioso', label: 'Ansioso', color: 0xf39c12, description: 'Nerviosismo, preocupacion' },
    { key: 'obsesivo', label: 'Obsesivo', color: 0x9b59b6, description: 'Pensamientos repetitivos' },
    { key: 'compulsivo', label: 'Compulsivo', color: 0xe74c3c, description: 'Urgencia de actuar' },
    { key: 'calmado', label: 'Calmado', color: 0x3498db, description: 'Tranquilidad, paz' },
    { key: 'abrumado', label: 'Abrumado', color: 0xe67e22, description: 'Sobrecarga, confusion' },
    { key: 'controlado', label: 'Controlado', color: 0x27ae60, description: 'Estabilidad, dominio' }
];

// Variable global para guardar el último mensaje completo del bot
let lastBotMessage = null;

// ============================================
// SESSION MANAGEMENT
// ============================================
function getSessionId() {
    let sessionId = localStorage.getItem('toc_support_session_id');
    if (!sessionId) {
        sessionId = 'web_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('toc_support_session_id', sessionId);
    }
    return sessionId;
}

// ============================================
// API COMMUNICATION (Sincrono)
// ============================================

/**
 * Envia mensaje al webhook n8n y espera la respuesta
 * @param {Object} payload - { message, emotion }
 * @returns {Promise<Object>} - Respuesta del bot
 */
async function sendToN8n(payload) {
    const sessionId = getSessionId();
    
    const requestBody = {
        sessionId: sessionId,
        message: payload.message || '',
        emotion: payload.emotion || null,
        timestamp: new Date().toISOString()
    };

    updateConnectionStatus('processing');
    
    try {
        const response = await fetch(API_CONFIG.BASE_URL + API_CONFIG.WEBHOOK_PATH, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Client': 'web'
            },
            body: JSON.stringify(requestBody)
        });

        // Logging mejorado para debugging
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response body:', errorText);
            throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 100)}`);
        }

        // Leer respuesta como texto primero para debugging
        const responseText = await response.text();
        console.log('Response body (raw):', responseText);
        
        // Intentar parsear JSON
        let data;
        try {
            data = JSON.parse(responseText);
            console.log('Response body (parsed):', data);
        } catch (parseError) {
            console.error('Error parsing JSON:', parseError);
            console.error('Response was not valid JSON. Raw text:', responseText);
            throw new Error(`Respuesta no es JSON válido: ${responseText.substring(0, 200)}`);
        }
        
        updateConnectionStatus('connected');
        
        // Respuesta directa del workflow
        if (data.success && data.reply) {
            return {
                success: true,
                reply: data.reply,
                crisisLevel: data.crisisLevel,
                sessionId: data.sessionId,
                timestamp: data.timestamp
            };
        }
        
        // Error del workflow
        if (data.error || data.message) {
            return {
                success: false,
                message: data.message || data.response || 'Error al procesar el mensaje.'
            };
        }
        
        throw new Error('Respuesta inesperada del servidor');
        
    } catch (error) {
        console.error('Error en comunicacion con n8n:', error);
        updateConnectionStatus('error');
        return {
            success: false,
            message: 'No se pudo conectar con el servicio. Verifica tu conexion e intenta de nuevo.'
        };
    }
}

// ============================================
// UI HELPERS
// ============================================

function updateConnectionStatus(status) {
    const el = document.getElementById('connection-status');
    if (!el) return;
    
    el.className = '';
    switch(status) {
        case 'connected':
            el.textContent = 'Listo';
            el.classList.add('connected');
            break;
        case 'processing':
            el.textContent = 'Procesando...';
            break;
        case 'error':
            el.textContent = 'Error';
            el.classList.add('error');
            break;
        default:
            el.textContent = 'Listo';
    }
}

function displayBotResponse(message, crisisLevel) {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;

    // --- INTEGRACIÓN CON PHASER ---
    if (window.phaserGame && window.phaserGame.scene.keys.EmotionGameScene) {
        const scene = window.phaserGame.scene.keys.EmotionGameScene;
        scene.reactToCrisis(crisisLevel);

        // Activar respiración si se detecta alta angustia o emergencia
        if (crisisLevel === 'emergency' || crisisLevel === 'high_distress') {
            scene.startBreathingExercise();
            // Detener después de 20 segundos (5 ciclos)
            setTimeout(() => scene.stopBreathingExercise(), 20000);
        } else {
            scene.stopBreathingExercise();
        }
    }
    // ------------------------------

    // Guardar el mensaje completo antes de procesar (para contexto futuro)
    lastBotMessage = message;

    // Eliminar pregunta final del mensaje anterior del bot en la UI (si existe)
    const previousBotMessages = chatMessages.querySelectorAll('.bot-message');
    if (previousBotMessages.length > 0) {
        const lastBotMessageElement = previousBotMessages[previousBotMessages.length - 1];
        const lastBotContent = lastBotMessageElement.querySelector('.message-content');
        
        if (lastBotContent) {
            // Buscar y eliminar la última pregunta entre ¿? al final del texto en la UI
            let currentHTML = lastBotContent.innerHTML;
            // Eliminar pregunta que esté al final (antes de posibles <br> finales)
            currentHTML = currentHTML.replace(/¿[^¿]*?\?(<br>)*\s*$/i, '');
            lastBotContent.innerHTML = currentHTML;
        }
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message bot-message';
    
    if (crisisLevel === 'emergency' || crisisLevel === 'high_distress') {
        messageDiv.classList.add('crisis-' + crisisLevel);
    }
    
    // Convertir markdown basico
    let formattedMessage = message
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>');
    
    // Convertir URLs en links clicables (mejora para links curados del Orchestrator)
    // Regex para detectar URLs (http/https)
    const urlRegex = /(https?:\/\/[^\s<]+)/g;
    formattedMessage = formattedMessage.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer" style="color: #6c5ce7; text-decoration: underline;">$1</a>');
    
    messageDiv.innerHTML = `
        <div class="message-content">${formattedMessage}</div>
        <div class="message-time">${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function displayUserMessage(message) {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message user-message';
    messageDiv.innerHTML = `
        <div class="message-content">${message}</div>
        <div class="message-time">${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showLoading(show = true) {
    const loadingEl = document.getElementById('chat-loading');
    const sendBtn = document.getElementById('chat-send-btn');
    const chatInput = document.getElementById('chat-input');
    
    if (loadingEl) {
        loadingEl.style.display = show ? 'block' : 'none';
    }
    if (sendBtn) {
        sendBtn.disabled = show;
    }
    if (chatInput) {
        chatInput.disabled = show;
    }
}

// ============================================
// PHASER GAME SCENE
// ============================================

class EmotionGameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'EmotionGameScene' });
        this.character = null;
        this.clouds = [];
        this.currentEmotion = null;
        this.characterParts = {};
        this.ambientParticles = [];
        this.backgroundGraphics = null;
        this.breathingCircle = null;
        this.isBreathingExerciseActive = false;
        this.currentCrisisLevel = 'none';
    }

    create() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        this.createBackground();
        this.createCharacter(centerX, centerY);
        this.createEmotionClouds(centerX, centerY);
        this.createAmbientParticles();
        this.createBreathingOverlay(centerX, centerY);
    }

    createBackground() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        this.backgroundGraphics = this.add.graphics();
        this.updateEnvironment('none'); // Initial state

        for (let i = 0; i < 30; i++) {
            const x = Phaser.Math.Between(0, width);
            const y = Phaser.Math.Between(0, height);
            const star = this.add.circle(x, y, Phaser.Math.Between(1, 2), 0xffffff, 0.3);
            
            this.tweens.add({
                targets: star,
                alpha: { from: 0.1, to: 0.5 },
                duration: Phaser.Math.Between(1000, 3000),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
    }

    updateEnvironment(level) {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        this.currentCrisisLevel = level;

        let bgColor;
        let particleSpeed;
        let particleAlpha;

        switch(level) {
            case 'emergency':
                bgColor = 0x4a1212; // Rojo oscuro
                particleSpeed = 2000;
                particleAlpha = 0.4;
                break;
            case 'high_distress':
                bgColor = 0x3d1a4a; // Púrpura oscuro
                particleSpeed = 4000;
                particleAlpha = 0.3;
                break;
            case 'ocd_spike':
                bgColor = 0x1a2e4a; // Azul intenso
                particleSpeed = 6000;
                particleAlpha = 0.2;
                break;
            default:
                bgColor = 0x4a69bd; // Azul suave original
                particleSpeed = 10000;
                particleAlpha = 0.15;
        }

        // Animación suave del color de fondo
        this.backgroundGraphics.clear();
        for (let i = 0; i < 50; i++) {
            const alpha = 0.02;
            const radius = (50 - i) * 15;
            this.backgroundGraphics.fillStyle(bgColor, alpha);
            this.backgroundGraphics.fillCircle(width / 2, height / 2, radius);
        }

        // Actualizar partículas
        this.ambientParticles.forEach(p => {
            const tween = this.tweens.getTweensOf(p)[0];
            if (tween) {
                tween.updateTo('duration', Phaser.Math.Between(particleSpeed, particleSpeed * 2), true);
                p.setAlpha(particleAlpha);
            }
        });
    }

    createCharacter(x, y) {
        this.character = this.add.container(x, y);

        const bodyGradient = this.add.graphics();
        bodyGradient.fillStyle(0x6c5ce7, 1);
        bodyGradient.fillRoundedRect(-40, -30, 80, 100, 20);
        this.characterParts.body = bodyGradient;

        const head = this.add.circle(0, -60, 45, 0xffeaa7);
        head.setStrokeStyle(3, 0xfdcb6e);
        this.characterParts.head = head;

        const hair = this.add.graphics();
        hair.fillStyle(0x2d3436, 1);
        hair.fillEllipse(0, -95, 70, 30);
        hair.fillEllipse(-25, -85, 25, 20);
        hair.fillEllipse(25, -85, 25, 20);
        this.characterParts.hair = hair;

        const leftEye = this.add.container(-15, -65);
        const leftEyeWhite = this.add.circle(0, 0, 12, 0xffffff);
        const leftPupil = this.add.circle(0, 0, 6, 0x2d3436);
        leftEye.add([leftEyeWhite, leftPupil]);
        this.characterParts.leftEye = leftEye;
        this.characterParts.leftPupil = leftPupil;

        const rightEye = this.add.container(15, -65);
        const rightEyeWhite = this.add.circle(0, 0, 12, 0xffffff);
        const rightPupil = this.add.circle(0, 0, 6, 0x2d3436);
        rightEye.add([rightEyeWhite, rightPupil]);
        this.characterParts.rightEye = rightEye;
        this.characterParts.rightPupil = rightPupil;

        const leftBrow = this.add.rectangle(-15, -82, 18, 4, 0x2d3436);
        leftBrow.setAngle(-5);
        this.characterParts.leftBrow = leftBrow;

        const rightBrow = this.add.rectangle(15, -82, 18, 4, 0x2d3436);
        rightBrow.setAngle(5);
        this.characterParts.rightBrow = rightBrow;

        const mouth = this.add.graphics();
        mouth.lineStyle(3, 0x2d3436);
        mouth.beginPath();
        mouth.arc(0, -45, 12, 0, Math.PI, false);
        mouth.strokePath();
        this.characterParts.mouth = mouth;

        const leftArm = this.add.rectangle(-55, 10, 15, 50, 0x6c5ce7);
        leftArm.setAngle(10);
        this.characterParts.leftArm = leftArm;

        const rightArm = this.add.rectangle(55, 10, 15, 50, 0x6c5ce7);
        rightArm.setAngle(-10);
        this.characterParts.rightArm = rightArm;

        const leftHand = this.add.circle(-58, 35, 10, 0xffeaa7);
        this.characterParts.leftHand = leftHand;

        const rightHand = this.add.circle(58, 35, 10, 0xffeaa7);
        this.characterParts.rightHand = rightHand;

        this.character.add([
            bodyGradient,
            leftArm, rightArm,
            leftHand, rightHand,
            head, hair,
            leftEye, rightEye,
            leftBrow, rightBrow,
            mouth
        ]);

        this.addIdleAnimation();
    }

    addIdleAnimation() {
        this.tweens.add({
            targets: this.character,
            scaleY: 1.02,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        this.time.addEvent({
            delay: 3000,
            callback: () => this.blink(),
            loop: true
        });
    }

    blink() {
        const leftEyeWhite = this.characterParts.leftEye.list[0];
        const rightEyeWhite = this.characterParts.rightEye.list[0];
        
        this.tweens.add({
            targets: [leftEyeWhite, rightEyeWhite],
            scaleY: 0.1,
            duration: 100,
            yoyo: true,
            ease: 'Quad.easeInOut'
        });
    }

    createEmotionClouds(centerX, centerY) {
        const radius = 170;
        const angleOffset = -Math.PI / 2;

        EMOTIONS.forEach((emotion, index) => {
            const angle = angleOffset + (index * (2 * Math.PI / EMOTIONS.length));
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;

            const cloud = this.createCloud(x, y, emotion);
            this.clouds.push(cloud);
        });
    }

    createCloud(x, y, emotion) {
        const container = this.add.container(x, y);

        const cloudGraphics = this.add.graphics();
        cloudGraphics.fillStyle(0xffffff, 0.9);
        
        cloudGraphics.fillCircle(0, 0, 40);
        cloudGraphics.fillCircle(-25, 5, 25);
        cloudGraphics.fillCircle(25, 5, 25);
        cloudGraphics.fillCircle(-15, -15, 20);
        cloudGraphics.fillCircle(15, -15, 20);

        const accent = this.add.graphics();
        accent.fillStyle(emotion.color, 0.3);
        accent.fillCircle(0, 0, 35);

        const label = this.add.text(0, 0, emotion.label, {
            fontSize: '14px',
            fontFamily: 'Segoe UI, system-ui, sans-serif',
            color: '#2d3436',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        container.add([cloudGraphics, accent, label]);
        container.setData('emotion', emotion);
        container.setSize(90, 70);
        container.setInteractive({ useHandCursor: true });

        container.on('pointerover', () => {
            this.tweens.add({
                targets: container,
                scale: 1.15,
                duration: 200,
                ease: 'Back.easeOut'
            });
            accent.clear();
            accent.fillStyle(emotion.color, 0.6);
            accent.fillCircle(0, 0, 35);
            
            this.previewEmotion(emotion);
        });

        container.on('pointerout', () => {
            if (this.currentEmotion !== emotion) {
                this.tweens.add({
                    targets: container,
                    scale: 1,
                    duration: 200,
                    ease: 'Quad.easeOut'
                });
                accent.clear();
                accent.fillStyle(emotion.color, 0.3);
                accent.fillCircle(0, 0, 35);
                
                if (this.currentEmotion) {
                    this.setCharacterEmotion(this.currentEmotion);
                } else {
                    this.setCharacterNeutral();
                }
            }
        });

        container.on('pointerdown', () => {
            this.selectEmotion(emotion, container);
        });

        this.tweens.add({
            targets: container,
            y: y + Phaser.Math.Between(-8, 8),
            duration: Phaser.Math.Between(2000, 3000),
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
            delay: Phaser.Math.Between(0, 1000)
        });

        return container;
    }

    previewEmotion(emotion) {
        this.setCharacterEmotion(emotion);
    }

    async selectEmotion(emotion, cloudContainer) {
        this.currentEmotion = emotion;
        window.currentSelectedEmotion = emotion;

        this.tweens.add({
            targets: cloudContainer,
            scale: 1.3,
            duration: 150,
            yoyo: true,
            ease: 'Quad.easeOut',
            onComplete: () => {
                cloudContainer.scale = 1.15;
            }
        });

        const indicator = document.getElementById('selected-emotion');
        if (indicator) {
            indicator.textContent = `Te sientes: ${emotion.label}`;
            indicator.style.display = 'block';
        }

        this.setCharacterEmotion(emotion);

        // Desactivar todas las nubes mientras se procesa
        this.disableEmotionClouds();

        // Enviar emoción a n8n inmediatamente
        const message = `Me siento ${emotion.label} (${emotion.description})`;
        displayUserMessage(message);
        showLoading(true);
        
        try {
            const response = await sendToN8n({
                message: message,
                emotion: emotion
            });
            
            showLoading(false);
            
            if (response.success && response.reply) {
                displayBotResponse(response.reply, response.crisisLevel);
            } else {
                displayBotResponse(response.message || 'Error al procesar tu mensaje. Por favor, intenta de nuevo.', 'none');
            }
        } catch (error) {
            console.error('Error al enviar emoción:', error);
            showLoading(false);
            displayBotResponse('Ocurrió un error al procesar tu mensaje. Por favor, intenta de nuevo.', 'none');
        } finally {
            // Reactivar las nubes después de recibir respuesta
            this.enableEmotionClouds();
            
            // Restaurar apariencia de todas las nubes
            this.clouds.forEach(cloud => {
                this.tweens.add({
                    targets: cloud,
                    scale: 1,
                    alpha: 1,
                    duration: 300
                });
            });
            
            // Limpiar indicador de emoción seleccionada
            if (indicator) {
                indicator.style.display = 'none';
            }
        }
    }

    disableEmotionClouds() {
        this.clouds.forEach(cloud => {
            cloud.disableInteractive();
            this.tweens.add({
                targets: cloud,
                alpha: 0.5,
                duration: 200
            });
        });
    }

    enableEmotionClouds() {
        this.clouds.forEach(cloud => {
            cloud.setInteractive({ useHandCursor: true });
            this.tweens.add({
                targets: cloud,
                alpha: 1,
                duration: 200
            });
        });
    }

    setCharacterEmotion(emotion) {
        this.tweens.killTweensOf([
            this.characterParts.leftBrow,
            this.characterParts.rightBrow,
            this.characterParts.leftPupil,
            this.characterParts.rightPupil,
            this.characterParts.leftArm,
            this.characterParts.rightArm,
            this.character
        ]);

        this.characterParts.leftBrow.setAngle(-5);
        this.characterParts.rightBrow.setAngle(5);
        this.character.setAngle(0);

        switch(emotion.key) {
            case 'ansioso':
                this.setAnxiousExpression();
                break;
            case 'obsesivo':
                this.setObsessiveExpression();
                break;
            case 'compulsivo':
                this.setCompulsiveExpression();
                break;
            case 'calmado':
                this.setCalmExpression();
                break;
            case 'abrumado':
                this.setOverwhelmedExpression();
                break;
            case 'controlado':
                this.setControlledExpression();
                break;
        }
    }

    setCharacterNeutral() {
        this.tweens.killTweensOf([
            this.characterParts.leftBrow,
            this.characterParts.rightBrow,
            this.character
        ]);
        
        this.characterParts.leftBrow.setAngle(-5);
        this.characterParts.rightBrow.setAngle(5);
        this.character.setAngle(0);
        
        this.characterParts.mouth.clear();
        this.characterParts.mouth.lineStyle(3, 0x2d3436);
        this.characterParts.mouth.beginPath();
        this.characterParts.mouth.arc(0, -45, 12, 0, Math.PI, false);
        this.characterParts.mouth.strokePath();
    }

    setAnxiousExpression() {
        this.characterParts.leftBrow.setAngle(15);
        this.characterParts.rightBrow.setAngle(-15);

        this.tweens.add({
            targets: this.character,
            angle: { from: -2, to: 2 },
            duration: 100,
            yoyo: true,
            repeat: -1
        });

        this.tweens.add({
            targets: [this.characterParts.leftPupil, this.characterParts.rightPupil],
            x: { from: -3, to: 3 },
            duration: 200,
            yoyo: true,
            repeat: -1
        });

        this.characterParts.mouth.clear();
        this.characterParts.mouth.lineStyle(3, 0x2d3436);
        this.characterParts.mouth.beginPath();
        this.characterParts.mouth.arc(0, -40, 8, Math.PI, 0, false);
        this.characterParts.mouth.strokePath();
    }

    setObsessiveExpression() {
        this.characterParts.leftBrow.setAngle(-15);
        this.characterParts.rightBrow.setAngle(15);

        this.tweens.add({
            targets: [this.characterParts.leftPupil, this.characterParts.rightPupil],
            y: -3,
            duration: 500,
            yoyo: true,
            repeat: -1,
            ease: 'Stepped',
            easeParams: [2]
        });

        this.tweens.add({
            targets: this.character,
            angle: { from: -5, to: 5 },
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        this.characterParts.mouth.clear();
        this.characterParts.mouth.lineStyle(3, 0x2d3436);
        this.characterParts.mouth.strokeRect(-8, -48, 16, 3);
    }

    setCompulsiveExpression() {
        this.characterParts.leftBrow.setAngle(-10);
        this.characterParts.rightBrow.setAngle(10);

        this.tweens.add({
            targets: this.characterParts.leftArm,
            angle: { from: 10, to: 30 },
            duration: 300,
            yoyo: true,
            repeat: -1
        });

        this.tweens.add({
            targets: this.characterParts.rightArm,
            angle: { from: -10, to: -30 },
            duration: 300,
            yoyo: true,
            repeat: -1,
            delay: 150
        });

        this.characterParts.mouth.clear();
        this.characterParts.mouth.lineStyle(3, 0x2d3436);
        this.characterParts.mouth.fillStyle(0x2d3436, 0.5);
        this.characterParts.mouth.fillCircle(0, -45, 8);
    }

    setCalmExpression() {
        this.characterParts.leftBrow.setAngle(0);
        this.characterParts.rightBrow.setAngle(0);

        this.tweens.add({
            targets: this.character,
            y: this.character.y - 5,
            duration: 3000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        this.tweens.add({
            targets: [this.characterParts.leftPupil, this.characterParts.rightPupil],
            scaleY: 0.5,
            duration: 1000,
            ease: 'Sine.easeInOut'
        });

        this.characterParts.mouth.clear();
        this.characterParts.mouth.lineStyle(3, 0x2d3436);
        this.characterParts.mouth.beginPath();
        this.characterParts.mouth.arc(0, -50, 15, 0.2, Math.PI - 0.2, false);
        this.characterParts.mouth.strokePath();
    }

    setOverwhelmedExpression() {
        this.characterParts.leftBrow.setAngle(20);
        this.characterParts.rightBrow.setAngle(-20);
        this.characterParts.leftBrow.y = -85;
        this.characterParts.rightBrow.y = -85;

        this.tweens.add({
            targets: this.character,
            angle: { from: -8, to: 8 },
            duration: 200,
            yoyo: true,
            repeat: -1,
            ease: 'Bounce.easeInOut'
        });

        this.tweens.add({
            targets: this.characterParts.leftPupil,
            x: { from: -4, to: 4 },
            y: { from: -3, to: 3 },
            duration: 300,
            yoyo: true,
            repeat: -1
        });

        this.tweens.add({
            targets: this.characterParts.rightPupil,
            x: { from: 4, to: -4 },
            y: { from: 3, to: -3 },
            duration: 250,
            yoyo: true,
            repeat: -1
        });

        this.characterParts.mouth.clear();
        this.characterParts.mouth.lineStyle(3, 0x2d3436);
        this.characterParts.mouth.fillStyle(0x2d3436, 0.3);
        this.characterParts.mouth.fillEllipse(0, -43, 15, 10);
    }

    setControlledExpression() {
        this.characterParts.leftBrow.setAngle(-3);
        this.characterParts.rightBrow.setAngle(3);

        this.tweens.add({
            targets: this.character,
            scaleX: 1.02,
            scaleY: 1.02,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        this.characterParts.leftPupil.x = 0;
        this.characterParts.leftPupil.y = 0;
        this.characterParts.rightPupil.x = 0;
        this.characterParts.rightPupil.y = 0;

        this.characterParts.mouth.clear();
        this.characterParts.mouth.lineStyle(3, 0x2d3436);
        this.characterParts.mouth.beginPath();
        this.characterParts.mouth.arc(0, -48, 12, 0.1, Math.PI - 0.1, false);
        this.characterParts.mouth.strokePath();
        this.characterParts.mouth.lineTo(15, -50);
    }

    createAmbientParticles() {
        this.ambientParticles = [];
        for (let i = 0; i < 20; i++) {
            const x = Phaser.Math.Between(0, this.cameras.main.width);
            const y = Phaser.Math.Between(0, this.cameras.main.height);
            const particle = this.add.circle(x, y, Phaser.Math.Between(2, 5), 0xffffff, 0.15);
            this.ambientParticles.push(particle);

            this.tweens.add({
                targets: particle,
                y: y - 100,
                alpha: 0,
                duration: Phaser.Math.Between(5000, 10000),
                repeat: -1,
                onRepeat: () => {
                    particle.x = Phaser.Math.Between(0, this.cameras.main.width);
                    particle.y = this.cameras.main.height + 20;
                    particle.alpha = 0.15;
                }
            });
        }
    }

    createBreathingOverlay(x, y) {
        this.breathingCircle = this.add.container(x, y);
        this.breathingCircle.setAlpha(0);

        const outer = this.add.circle(0, 0, 100, 0x6c5ce7, 0.2);
        outer.setStrokeStyle(4, 0x6c5ce7, 0.5);
        
        const inner = this.add.circle(0, 0, 40, 0x6c5ce7, 0.5);
        
        const text = this.add.text(0, 120, 'Inhala...', {
            fontSize: '20px',
            fontFamily: 'Segoe UI',
            color: '#ffffff',
            backgroundColor: 'rgba(0,0,0,0.5)',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5);

        this.breathingCircle.add([outer, inner, text]);
        this.breathingCircle.setData('inner', inner);
        this.breathingCircle.setData('text', text);
    }

    startBreathingExercise() {
        if (this.isBreathingExerciseActive) return;
        this.isBreathingExerciseActive = true;

        this.tweens.add({
            targets: this.breathingCircle,
            alpha: 1,
            duration: 500
        });

        const inner = this.breathingCircle.getData('inner');
        const text = this.breathingCircle.getData('text');

        const breatheTimeline = this.tweens.createTimeline({
            loop: -1
        });

        // Inhala (4s)
        breatheTimeline.add({
            targets: inner,
            scale: 2.5,
            duration: 4000,
            ease: 'Sine.easeInOut',
            onStart: () => text.setText('Inhala...')
        });

        // Sostén (4s)
        breatheTimeline.add({
            targets: inner,
            scale: 2.5,
            duration: 4000,
            onStart: () => text.setText('Sostén...')
        });

        // Exhala (4s)
        breatheTimeline.add({
            targets: inner,
            scale: 1,
            duration: 4000,
            ease: 'Sine.easeInOut',
            onStart: () => text.setText('Exhala...')
        });

        // Sostén vacío (4s)
        breatheTimeline.add({
            targets: inner,
            scale: 1,
            duration: 4000,
            onStart: () => text.setText('Pausa...')
        });

        breatheTimeline.play();
        this.breathingCircle.setData('timeline', breatheTimeline);
        
        // El personaje adopta postura de guía
        this.setGuidingExpression();
    }

    stopBreathingExercise() {
        if (!this.isBreathingExerciseActive) return;
        this.isBreathingExerciseActive = false;

        const timeline = this.breathingCircle.getData('timeline');
        if (timeline) timeline.stop();

        this.tweens.add({
            targets: this.breathingCircle,
            alpha: 0,
            duration: 500
        });

        this.setCharacterNeutral();
    }

    reactToCrisis(level) {
        this.updateEnvironment(level);
        
        if (level === 'emergency' || level === 'high_distress') {
            this.setListeningExpression();
        } else if (level === 'none') {
            this.setCalmExpression();
        }
    }

    setListeningExpression() {
        this.tweens.killTweensOf(this.character);
        this.tweens.add({
            targets: this.character,
            y: this.character.y + 10,
            scaleX: 1.05,
            duration: 1000,
            ease: 'Sine.easeOut'
        });

        this.characterParts.leftBrow.setAngle(10);
        this.characterParts.rightBrow.setAngle(-10);
    }

    setGuidingExpression() {
        this.tweens.killTweensOf([this.characterParts.leftArm, this.characterParts.rightArm]);
        
        this.tweens.add({
            targets: [this.characterParts.leftArm, this.characterParts.rightArm],
            angle: { from: 10, to: -20 },
            duration: 4000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
}

// ============================================
// GAME INITIALIZATION
// ============================================

function initEmotionGame(containerId = 'game-container', width = 500, height = 500) {
    const config = {
        type: Phaser.AUTO,
        width: width,
        height: height,
        parent: containerId,
        backgroundColor: '#1a1a2e',
        scene: EmotionGameScene,
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH
        }
    };

    return new Phaser.Game(config);
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    window.phaserGame = initEmotionGame();
    
    // Setup chat functionality
    const chatInput = document.getElementById('chat-input');
    const chatSendBtn = document.getElementById('chat-send-btn');
    
    async function sendChatMessage() {
        const message = chatInput.value.trim();
        
        // Si no hay mensaje, no enviar
        if (!message) return;
        
        displayUserMessage(message);
        chatInput.value = '';
        showLoading(true);
        
        // Construir mensaje con contexto del último mensaje del bot si existe
        let messageWithContext = message;
        if (lastBotMessage) {
            messageWithContext = `[Último mensaje del asistente: "${lastBotMessage}"]\n\nRespuesta del usuario: ${message}`;
            // Resetear después de usar
            lastBotMessage = null;
        }
        
        try {
            const response = await sendToN8n({
                message: messageWithContext,
                emotion: null // Las emociones se envían directamente desde las nubes
            });
            
            if (response.success && response.reply) {
                displayBotResponse(response.reply, response.crisisLevel);
            } else {
                displayBotResponse(response.message || 'Error al procesar tu mensaje.', 'none');
            }
        } catch (error) {
            console.error('Error inesperado al enviar mensaje:', error);
            displayBotResponse('Ocurrió un error inesperado. Por favor, intenta de nuevo.', 'none');
        } finally {
            // Siempre re-habilitar UI, incluso si hay error
            showLoading(false);
        }
    }
    
    if (chatSendBtn) {
        chatSendBtn.addEventListener('click', sendChatMessage);
    }
    
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendChatMessage();
            }
        });
    }
});

// Store current emotion globally for chat context
window.currentSelectedEmotion = null;
