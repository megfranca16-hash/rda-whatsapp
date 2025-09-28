// BotNinja WhatsApp Integration
// Sistema de conexão e QR Code para WhatsApp Web

class WhatsAppManager {
  constructor() {
    this.connectionStatus = 'disconnected';
    this.qrCode = null;
    this.connectionTimeout = null;
    this.heartbeatInterval = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    
    this.initializeConnection();
  }

  // Inicializar sistema de conexão
  async initializeConnection() {
    // Verificar se há dados de conexão salvos
    const config = await window.BotNinjaStorage.getConfig();
    const whatsappConnection = config.whatsappConnection || {};
    
    this.connectionStatus = whatsappConnection.status || 'disconnected';
    this.updateConnectionUI();
    
    // Se estava conectado, tentar reconectar
    if (this.connectionStatus === 'connected') {
      this.attemptReconnection();
    }
  }

  // Gerar QR Code para conexão
  async generateQRCode() {
    try {
      // Simular geração de QR Code (em produção, seria obtido do WhatsApp Web API)
      const qrData = this.generateQRData();
      
      // Criar QR Code usando a biblioteca qrcode.js
      const canvas = document.getElementById('qrCode');
      const ctx = canvas.getContext('2d');
      
      // Configurar canvas
      canvas.width = 256;
      canvas.height = 256;
      
      // Gerar QR Code
      QRCode.toCanvas(canvas, qrData, {
        width: 256,
        margin: 2,
        color: {
          dark: '#1F2937',
          light: '#FFFFFF'
        }
      }, (error) => {
        if (error) {
          console.error('Erro ao gerar QR Code:', error);
          this.showError('Erro ao gerar QR Code');
          return;
        }
        
        console.log('QR Code gerado com sucesso');
        this.showQRCode(qrData);
      });
      
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
      this.showError('Erro ao gerar QR Code');
    }
  }

  // Gerar dados do QR Code (simulado)
  generateQRData() {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    
    // Simular formato de QR Code do WhatsApp Web
    return `1@${randomId},${timestamp},2,BotNinja3.0`;
  }

  // Mostrar QR Code na interface
  showQRCode(qrData) {
    const qrPlaceholder = document.getElementById('qrPlaceholder');
    const qrCodeCanvas = document.getElementById('qrCode');
    
    if (qrPlaceholder && qrCodeCanvas) {
      qrPlaceholder.classList.add('hidden');
      qrCodeCanvas.classList.remove('hidden');
      
      // Atualizar status
      this.updateConnectionStatus('waiting_scan');
      
      // Salvar QR Code
      this.qrCode = qrData;
      window.BotNinjaStorage.updateWhatsAppConnection('waiting_scan', qrData);
      
      // Simular timeout do QR Code (60 segundos)
      this.connectionTimeout = setTimeout(() => {
        this.expireQRCode();
      }, 60000);
      
      // Simular conexão após alguns segundos (para demonstração)
      setTimeout(() => {
        this.simulateConnection();
      }, 10000);
    }
  }

  // Simular conexão bem-sucedida (para demonstração)
  simulateConnection() {
    if (this.connectionStatus === 'waiting_scan') {
      this.updateConnectionStatus('connected');
      this.startHeartbeat();
      
      // Esconder QR Code e mostrar status conectado
      this.hideQRCode();
      this.showConnectionSuccess();
      
      // Salvar estado conectado
      window.BotNinjaStorage.updateWhatsAppConnection('connected');
      
      console.log('WhatsApp conectado com sucesso!');
    }
  }

  // Expirar QR Code
  expireQRCode() {
    if (this.connectionStatus === 'waiting_scan') {
      this.updateConnectionStatus('qr_expired');
      this.hideQRCode();
      this.showQRExpired();
      
      window.BotNinjaStorage.updateWhatsAppConnection('disconnected');
    }
  }

  // Esconder QR Code
  hideQRCode() {
    const qrPlaceholder = document.getElementById('qrPlaceholder');
    const qrCodeCanvas = document.getElementById('qrCode');
    
    if (qrPlaceholder && qrCodeCanvas) {
      qrCodeCanvas.classList.add('hidden');
      qrPlaceholder.classList.remove('hidden');
    }
    
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }
  }

  // Mostrar sucesso da conexão
  showConnectionSuccess() {
    const qrContainer = document.getElementById('qrContainer');
    if (qrContainer) {
      qrContainer.innerHTML = `
        <div class="connection-success">
          <div class="success-icon">✅</div>
          <h3>WhatsApp Conectado!</h3>
          <p>Sua IA está pronta para atender automaticamente</p>
          <div class="connection-info">
            <div class="info-item">
              <span class="info-label">Status:</span>
              <span class="info-value connected">Ativo</span>
            </div>
            <div class="info-item">
              <span class="info-label">Conectado em:</span>
              <span class="info-value">${new Date().toLocaleString('pt-BR')}</span>
            </div>
          </div>
          <button class="btn-secondary" id="disconnectBtn">
            <span>📱</span>
            Desconectar
          </button>
        </div>
      `;
      
      // Adicionar evento para desconectar
      const disconnectBtn = document.getElementById('disconnectBtn');
      if (disconnectBtn) {
        disconnectBtn.addEventListener('click', () => this.disconnect());
      }
    }
  }

  // Mostrar QR Code expirado
  showQRExpired() {
    const qrContainer = document.getElementById('qrContainer');
    if (qrContainer) {
      qrContainer.innerHTML = `
        <div class="qr-expired">
          <div class="expired-icon">⏱️</div>
          <h3>QR Code Expirado</h3>
          <p>O código QR expirou. Gere um novo para conectar.</p>
          <button class="btn-primary" id="retryQrBtn">
            <span>🔄</span>
            Gerar Novo QR Code
          </button>
        </div>
      `;
      
      // Adicionar evento para tentar novamente
      const retryBtn = document.getElementById('retryQrBtn');
      if (retryBtn) {
        retryBtn.addEventListener('click', () => this.generateQRCode());
      }
    }
  }

  // Desconectar WhatsApp
  async disconnect() {
    this.updateConnectionStatus('disconnected');
    this.stopHeartbeat();
    
    // Resetar interface
    this.resetQRInterface();
    
    // Salvar estado desconectado
    await window.BotNinjaStorage.updateWhatsAppConnection('disconnected');
    
    console.log('WhatsApp desconectado');
  }

  // Resetar interface do QR Code
  resetQRInterface() {
    const qrContainer = document.getElementById('qrContainer');
    if (qrContainer) {
      qrContainer.innerHTML = `
        <div class="qr-placeholder" id="qrPlaceholder">
          <div class="qr-icon">📱</div>
          <h3>Conectar WhatsApp</h3>
          <p>Clique no botão abaixo para gerar o QR Code</p>
          <button class="btn-primary" id="generateQrBtn">
            <span>📲</span>
            Gerar QR Code
          </button>
        </div>
        <canvas id="qrCode" class="qr-code hidden"></canvas>
      `;
      
      // Reativar evento do botão
      this.setupQRButton();
    }
  }

  // Configurar botão de gerar QR Code
  setupQRButton() {
    const generateBtn = document.getElementById('generateQrBtn');
    if (generateBtn) {
      generateBtn.addEventListener('click', () => this.generateQRCode());
    }
  }

  // Atualizar status de conexão
  updateConnectionStatus(status) {
    this.connectionStatus = status;
    this.updateConnectionUI();
    
    // Disparar evento de mudança de status
    const event = new CustomEvent('whatsapp:status:changed', {
      detail: { status }
    });
    window.dispatchEvent(event);
  }

  // Atualizar interface do status de conexão
  updateConnectionUI() {
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');
    
    if (!statusDot || !statusText) return;
    
    // Remover classes existentes
    statusDot.className = 'status-dot';
    
    switch (this.connectionStatus) {
      case 'connected':
        statusDot.classList.add('connected');
        statusText.textContent = 'IA Ativa - WhatsApp Conectado';
        break;
      case 'waiting_scan':
        statusText.textContent = 'Aguardando leitura do QR Code...';
        break;
      case 'connecting':
        statusText.textContent = 'Conectando...';
        break;
      case 'qr_expired':
        statusText.textContent = 'QR Code expirado';
        break;
      case 'disconnected':
      default:
        statusText.textContent = 'WhatsApp Desconectado';
        break;
    }
  }

  // Iniciar heartbeat para manter conexão
  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.checkConnection();
    }, 30000); // Verificar a cada 30 segundos
  }

  // Parar heartbeat
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // Verificar conexão
  checkConnection() {
    // Simular verificação de conexão
    const isConnected = Math.random() > 0.1; // 90% de chance de estar conectado
    
    if (!isConnected && this.connectionStatus === 'connected') {
      console.log('Conexão perdida, tentando reconectar...');
      this.handleConnectionLoss();
    }
  }

  // Lidar com perda de conexão
  handleConnectionLoss() {
    this.updateConnectionStatus('disconnected');
    this.stopHeartbeat();
    
    // Tentar reconectar
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        this.attemptReconnection();
      }, 5000 * this.reconnectAttempts); // Delay progressivo
    } else {
      console.log('Máximo de tentativas de reconexão excedido');
      this.showConnectionError();
    }
  }

  // Tentar reconexão
  attemptReconnection() {
    console.log(`Tentando reconectar... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    this.updateConnectionStatus('connecting');
    
    // Simular tentativa de reconexão
    setTimeout(() => {
      const reconnected = Math.random() > 0.3; // 70% de chance de reconectar
      
      if (reconnected) {
        console.log('Reconectado com sucesso!');
        this.updateConnectionStatus('connected');
        this.startHeartbeat();
        this.reconnectAttempts = 0;
      } else {
        this.handleConnectionLoss();
      }
    }, 3000);
  }

  // Mostrar erro de conexão
  showConnectionError() {
    this.showError('Não foi possível manter a conexão com o WhatsApp. Tente reconectar manualmente.');
  }

  // Mostrar erro genérico
  showError(message) {
    // Implementar sistema de notificações de erro
    console.error('WhatsApp Error:', message);
    
    // Mostrar toast ou modal de erro
    const event = new CustomEvent('botninja:error', {
      detail: { message, type: 'whatsapp' }
    });
    window.dispatchEvent(event);
  }

  // Obter status atual
  getStatus() {
    return this.connectionStatus;
  }

  // Verificar se está conectado
  isConnected() {
    return this.connectionStatus === 'connected';
  }

  // Simular envio de mensagem (para testing)
  async sendMessage(phoneNumber, message) {
    if (!this.isConnected()) {
      throw new Error('WhatsApp não está conectado');
    }
    
    // Simular envio de mensagem
    console.log(`Enviando mensagem para ${phoneNumber}: ${message}`);
    
    // Simular delay de envio
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simular sucesso/falha
    const success = Math.random() > 0.1; // 90% de sucesso
    
    if (success) {
      console.log('Mensagem enviada com sucesso');
      return { success: true, messageId: `msg_${Date.now()}` };
    } else {
      throw new Error('Falha ao enviar mensagem');
    }
  }

  // Simular recebimento de mensagem
  simulateIncomingMessage(phoneNumber, message) {
    if (!this.isConnected()) return;
    
    const messageData = {
      id: `msg_${Date.now()}`,
      from: phoneNumber,
      message: message,
      timestamp: new Date().toISOString(),
      type: 'text'
    };
    
    // Disparar evento de mensagem recebida
    const event = new CustomEvent('whatsapp:message:received', {
      detail: messageData
    });
    window.dispatchEvent(event);
    
    console.log('Mensagem recebida:', messageData);
  }
}

// Instância global do WhatsApp Manager
window.WhatsAppManager = new WhatsAppManager();