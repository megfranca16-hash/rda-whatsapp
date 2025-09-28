// BotNinja 3.0 - Main Application
// Aplicação principal que coordena todos os módulos

class BotNinjaApp {
  constructor() {
    this.isLoading = true;
    this.modules = {
      storage: null,
      whatsapp: null,
      ai: null,
      ui: null
    };
    
    this.initializeApp();
  }

  // Inicializar aplicação
  async initializeApp() {
    try {
      console.log('🚀 Iniciando BotNinja 3.0...');
      
      // Mostrar tela de loading
      this.showLoadingScreen();
      
      // Inicializar módulos em ordem
      await this.initializeModules();
      
      // Configurar event listeners globais
      this.setupGlobalEventListeners();
      
      // Configurar PWA
      this.setupPWA();
      
      // Finalizar inicialização
      await this.finishInitialization();
      
      console.log('✅ BotNinja inicializado com sucesso!');
      
    } catch (error) {
      console.error('❌ Erro ao inicializar BotNinja:', error);
      this.showInitializationError(error);
    }
  }

  // Mostrar tela de loading
  showLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    const appContainer = document.getElementById('app-container');
    
    if (loadingScreen) {
      loadingScreen.classList.remove('hidden');
    }
    
    if (appContainer) {
      appContainer.classList.add('hidden');
    }
  }

  // Inicializar módulos
  async initializeModules() {
    const steps = [
      { name: 'Storage', init: () => this.initializeStorage() },
      { name: 'WhatsApp', init: () => this.initializeWhatsApp() },
      { name: 'IA Engine', init: () => this.initializeAI() },
      { name: 'Interface', init: () => this.initializeUI() }
    ];

    for (const step of steps) {
      try {
        this.updateLoadingText(`Inicializando ${step.name}...`);
        await step.init();
        await this.delay(500); // Delay visual para melhor UX
      } catch (error) {
        console.error(`Erro ao inicializar ${step.name}:`, error);
        throw new Error(`Falha na inicialização do ${step.name}`);
      }
    }
  }

  // Inicializar storage
  async initializeStorage() {
    if (window.BotNinjaStorage) {
      this.modules.storage = window.BotNinjaStorage;
      console.log('📦 Storage inicializado');
    } else {
      throw new Error('BotNinjaStorage não encontrado');
    }
  }

  // Inicializar WhatsApp
  async initializeWhatsApp() {
    if (window.WhatsAppManager) {
      this.modules.whatsapp = window.WhatsAppManager;
      console.log('📱 WhatsApp Manager inicializado');
    } else {
      throw new Error('WhatsAppManager não encontrado');
    }
  }

  // Inicializar IA
  async initializeAI() {
    if (window.AIEngine) {
      this.modules.ai = window.AIEngine;
      
      // Aguardar inicialização completa da IA
      let attempts = 0;
      while (!this.modules.ai.isInitialized && attempts < 10) {
        await this.delay(500);
        attempts++;
      }
      
      if (!this.modules.ai.isInitialized) {
        throw new Error('IA Engine não inicializou a tempo');
      }
      
      console.log('🧠 AI Engine inicializado');
    } else {
      throw new Error('AIEngine não encontrado');
    }
  }

  // Inicializar UI
  async initializeUI() {
    if (window.UIManager) {
      this.modules.ui = window.UIManager;
      
      // Aguardar inicialização completa da UI
      let attempts = 0;
      while (!this.modules.ui.isInitialized && attempts < 10) {
        await this.delay(500);
        attempts++;
      }
      
      console.log('🎨 UI Manager inicializado');
    } else {
      throw new Error('UIManager não encontrado');
    }
  }

  // Configurar event listeners globais
  setupGlobalEventListeners() {
    // Erro global
    window.addEventListener('error', (e) => {
      console.error('Erro global capturado:', e.error);
      this.handleGlobalError(e.error);
    });

    // Promessa rejeitada não tratada
    window.addEventListener('unhandledrejection', (e) => {
      console.error('Promise rejeitada não tratada:', e.reason);
      this.handleGlobalError(e.reason);
    });

    // Mudança de visibilidade da página
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.handlePageHidden();
      } else {
        this.handlePageVisible();
      }
    });

    // Mudança de conectividade
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());

    // Notificações customizadas
    window.addEventListener('botninja:notification', (e) => {
      this.handleNotification(e.detail);
    });

    // Atalhos de teclado
    document.addEventListener('keydown', (e) => {
      this.handleKeyboardShortcuts(e);
    });
  }

  // Configurar PWA
  setupPWA() {
    // Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('Service Worker registrado:', registration);
        })
        .catch(error => {
          console.log('Erro ao registrar Service Worker:', error);
        });
    }

    // Install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallPrompt();
    });

    // App instalado
    window.addEventListener('appinstalled', () => {
      console.log('BotNinja instalado como PWA');
      this.deferredPrompt = null;
    });
  }

  // Finalizar inicialização
  async finishInitialization() {
    // Simular carregamento final
    this.updateLoadingText('Finalizando...');
    await this.delay(1000);

    // Esconder loading e mostrar app
    this.hideLoadingScreen();
    
    // Marcar como não carregando
    this.isLoading = false;

    // Executar ações pós-inicialização
    this.postInitializationActions();
  }

  // Ações pós-inicialização
  postInitializationActions() {
    // Verificar se há atualizações
    this.checkForUpdates();
    
    // Iniciar heartbeat da aplicação
    this.startApplicationHeartbeat();
    
    // Mostrar welcome message se for primeira vez
    this.checkFirstTime();
    
    // Configurar analytics (se necessário)
    this.setupAnalytics();
  }

  // Esconder tela de loading
  hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    const appContainer = document.getElementById('app-container');
    
    if (loadingScreen) {
      loadingScreen.style.opacity = '0';
      setTimeout(() => {
        loadingScreen.classList.add('hidden');
      }, 500);
    }
    
    if (appContainer) {
      appContainer.classList.remove('hidden');
    }
  }

  // Atualizar texto de loading
  updateLoadingText(text) {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      const textElement = loadingScreen.querySelector('p');
      if (textElement) {
        textElement.textContent = text;
      }
    }
  }

  // Mostrar erro de inicialização
  showInitializationError(error) {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.innerHTML = `
        <div class="loading-content">
          <div class="error-icon">❌</div>
          <h2>Erro de Inicialização</h2>
          <p>Não foi possível inicializar o BotNinja.</p>
          <p class="error-details">${error.message}</p>
          <button class="btn-primary" onclick="location.reload()">
            <span>🔄</span>
            Tentar Novamente
          </button>
        </div>
      `;
    }
  }

  // Lidar com erro global
  handleGlobalError(error) {
    if (!this.isLoading) {
      console.error('Erro na aplicação:', error);
      
      // Mostrar notificação de erro
      const event = new CustomEvent('botninja:notification', {
        detail: { 
          message: 'Ocorreu um erro inesperado. A aplicação pode não funcionar corretamente.',
          type: 'error'
        }
      });
      window.dispatchEvent(event);
    }
  }

  // Lidar com página escondida
  handlePageHidden() {
    console.log('Página escondida - pausando operações não essenciais');
    
    // Pausar atualizações automáticas
    if (this.modules.ui) {
      // Implementar pausa de atualizações
    }
  }

  // Lidar com página visível
  handlePageVisible() {
    console.log('Página visível - retomando operações');
    
    // Retomar atualizações
    if (this.modules.ui) {
      // Implementar retomada de atualizações
      this.modules.ui.loadMetrics();
    }
  }

  // Lidar com online
  handleOnline() {
    console.log('Conectividade restaurada');
    
    // Tentar reconectar WhatsApp se necessário
    if (this.modules.whatsapp && this.modules.whatsapp.getStatus() === 'disconnected') {
      this.modules.whatsapp.attemptReconnection();
    }
  }

  // Lidar com offline
  handleOffline() {
    console.log('Conectividade perdida');
    
    // Mostrar notificação de offline
    const event = new CustomEvent('botninja:notification', {
      detail: { 
        message: 'Você está offline. Algumas funcionalidades podem estar limitadas.',
        type: 'warning'
      }
    });
    window.dispatchEvent(event);
  }

  // Lidar com notificações
  handleNotification(detail) {
    // Implementar sistema de toast notifications
    console.log(`Notificação [${detail.type}]:`, detail.message);
    
    // Criar elemento de notificação se não existir
    this.showToastNotification(detail.message, detail.type);
  }

  // Mostrar notificação toast
  showToastNotification(message, type = 'info') {
    // Criar container de notificações se não existir
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toast-container';
      toastContainer.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        gap: 10px;
      `;
      document.body.appendChild(toastContainer);
    }

    // Criar toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.cssText = `
      background: ${this.getToastColor(type)};
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      max-width: 350px;
      font-size: 14px;
      font-weight: 500;
      animation: slideIn 0.3s ease-out;
      cursor: pointer;
    `;
    
    toast.textContent = message;
    
    // Adicionar ao container
    toastContainer.appendChild(toast);
    
    // Remover após 5 segundos
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 5000);
    
    // Remover ao clicar
    toast.addEventListener('click', () => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    });
  }

  // Obter cor do toast
  getToastColor(type) {
    const colors = {
      'info': '#3B82F6',
      'success': '#10B981',
      'warning': '#F59E0B',
      'error': '#EF4444'
    };
    return colors[type] || colors.info;
  }

  // Lidar com atalhos de teclado
  handleKeyboardShortcuts(e) {
    // Ctrl/Cmd + K - Busca rápida
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      // Implementar busca rápida
    }
    
    // Ctrl/Cmd + / - Mostrar ajuda
    if ((e.ctrlKey || e.metaKey) && e.key === '/') {
      e.preventDefault();
      if (this.modules.ui) {
        this.modules.ui.showHelpModal();
      }
    }
  }

  // Mostrar prompt de instalação
  showInstallPrompt() {
    // Implementar prompt customizado de instalação PWA
    console.log('App pode ser instalado');
  }

  // Verificar primeira vez
  checkFirstTime() {
    const isFirstTime = !localStorage.getItem('botninja_first_visit');
    
    if (isFirstTime) {
      localStorage.setItem('botninja_first_visit', 'false');
      
      // Mostrar tour ou welcome message
      setTimeout(() => {
        const event = new CustomEvent('botninja:notification', {
          detail: { 
            message: 'Bem-vindo ao BotNinja 3.0! 🤖 Sua IA para WhatsApp está pronta!',
            type: 'success'
          }
        });
        window.dispatchEvent(event);
      }, 2000);
    }
  }

  // Verificar atualizações
  checkForUpdates() {
    // Implementar verificação de atualizações
    console.log('Verificando atualizações...');
  }

  // Iniciar heartbeat da aplicação
  startApplicationHeartbeat() {
    setInterval(() => {
      this.performHealthCheck();
    }, 60000); // A cada minuto
  }

  // Verificar saúde da aplicação
  performHealthCheck() {
    const health = {
      storage: !!this.modules.storage,
      whatsapp: !!this.modules.whatsapp,
      ai: this.modules.ai?.isInitialized || false,
      ui: this.modules.ui?.isInitialized || false
    };
    
    const allHealthy = Object.values(health).every(status => status);
    
    if (!allHealthy) {
      console.warn('Health check falhou:', health);
    }
  }

  // Configurar analytics
  setupAnalytics() {
    // Implementar analytics se necessário
    console.log('Analytics configurado');
  }

  // Utility: Delay
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Obter status da aplicação
  getStatus() {
    return {
      isLoading: this.isLoading,
      modules: {
        storage: !!this.modules.storage,
        whatsapp: this.modules.whatsapp?.getStatus() || 'unknown',
        ai: this.modules.ai?.isActive() || false,
        ui: this.modules.ui?.isInitialized || false
      }
    };
  }

  // Reinicializar aplicação
  async restart() {
    console.log('Reiniciando BotNinja...');
    location.reload();
  }
}

// Adicionar estilos CSS para animações de toast
const toastStyles = document.createElement('style');
toastStyles.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
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
document.head.appendChild(toastStyles);

// Inicializar aplicação quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  window.BotNinjaApp = new BotNinjaApp();
});

// Debug: Expor aplicação globalmente
window.BotNinja = {
  app: null,
  storage: null,
  whatsapp: null,
  ai: null,
  ui: null,
  
  // Função de debug
  debug() {
    console.log('=== BotNinja Debug Info ===');
    console.log('App Status:', window.BotNinjaApp?.getStatus());
    console.log('Storage:', window.BotNinjaStorage);
    console.log('WhatsApp:', window.WhatsAppManager?.getStatus());
    console.log('AI Active:', window.AIEngine?.isActive());
    console.log('UI Initialized:', window.UIManager?.isInitialized);
    
    if (window.BotNinjaStorage) {
      window.BotNinjaStorage.debug();
    }
  }
};