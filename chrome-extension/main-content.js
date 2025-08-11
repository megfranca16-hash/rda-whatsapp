// Empresas Web CRM - Main Content Script
// Script principal que injeta a interface CRM no WhatsApp Web

class EmpresasWebCRM {
  constructor() {
    this.config = null;
    this.activeCompany = null;
    this.observers = [];
    this.isInitialized = false;
    this.ui = null;
    
    this.init();
  }

  async init() {
    // Aguardar carregamento completo do WhatsApp
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initialize());
    } else {
      await this.initialize();
    }
  }

  async initialize() {
    console.log('🚀 Inicializando Empresas Web CRM...');
    
    // Aguardar elementos do WhatsApp carregarem
    await this.waitForWhatsApp();
    
    // Carregar configurações
    await this.loadConfig();
    
    // Criar interface
    this.createUI();
    
    // Configurar observadores
    this.setupObservers();
    
    // Configurar listeners
    this.setupMessageListeners();
    
    // Inicializar componentes
    this.initializeComponents();
    
    this.isInitialized = true;
    console.log('✅ Empresas Web CRM inicializado com sucesso!');
    
    // Disparar evento personalizado
    window.dispatchEvent(new CustomEvent('empresasWebCRMReady'));
  }

  async waitForWhatsApp() {
    const maxAttempts = 30;
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      // Procurar por elementos característicos do WhatsApp Web
      const chatList = document.querySelector('[data-testid="chat-list"]');
      const mainPanel = document.querySelector('[data-testid="conversation-panel-wrapper"]');
      
      if (chatList || mainPanel) {
        console.log('✅ WhatsApp Web detectado');
        await new Promise(resolve => setTimeout(resolve, 2000)); // Aguardar estabilização
        return;
      }
      
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    throw new Error('WhatsApp Web não foi detectado');
  }

  async loadConfig() {
    try {
      // Primeiro tentar carregar do backend se autenticado
      if (window.empresasWebAPI && window.empresasWebAPI.isConnected()) {
        console.log('🔗 Carregando configuração do backend...');
        
        try {
          const backendConfig = await window.empresasWebAPI.getExtensionConfig();
          this.config = backendConfig;
          this.activeCompany = backendConfig.companies[backendConfig.activeCompany];
          console.log('✅ Configurações carregadas do backend:', this.activeCompany?.name || 'Nenhuma empresa ativa');
          return;
        } catch (error) {
          console.log('⚠️ Erro ao carregar do backend, usando configuração local:', error.message);
        }
      }
      
      // Fallback para configuração local via background script
      if (this.isChromeExtension()) {
        const response = await this.sendChromeMessage({ action: 'getConfig' });
        
        if (response && response.success) {
          this.config = response.data;
          this.activeCompany = this.config.companies[this.config.activeCompany];
          console.log('✅ Configurações locais carregadas:', this.activeCompany?.name || 'Nenhuma empresa ativa');
          return;
        }
      }
      
      // Configuração de fallback para desenvolvimento
      this.loadFallbackConfig();
      
    } catch (error) {
      console.error('❌ Erro ao carregar configurações:', error);
      this.loadFallbackConfig();
    }
  }

  isChromeExtension() {
    return typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage;
  }

  async sendChromeMessage(message) {
    if (!this.isChromeExtension()) return null;
    
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(message, resolve);
    });
  }

  loadFallbackConfig() {
    this.config = {
      companies: {
        'demo_company': {
          id: 'demo_company',
          name: 'Empresa Demonstração',
          phone: '+55 11 99999-9999',
          settings: {
            autoResponder: {
              enabled: false,
              welcomeMessage: 'Olá! Obrigado por entrar em contato. Como posso ajudá-lo?',
              businessHours: { start: '09:00', end: '18:00' },
              weekdays: [1, 2, 3, 4, 5]
            },
            quickButtons: [
              { text: '📋 Abertura de Empresa', action: 'send_message', value: 'Olá! Vou te ajudar com a abertura da sua empresa.' },
              { text: '💰 Dúvidas Contábeis', action: 'send_message', value: 'Posso esclarecer suas dúvidas contábeis!' }
            ],
            labels: [
              { id: 'hot_lead', name: 'Lead Quente', color: '#EF4444' },
              { id: 'client', name: 'Cliente', color: '#10B981' }
            ]
          }
        }
      },
      activeCompany: 'demo_company',
      globalSettings: {
        autoSave: true,
        notifications: true,
        theme: 'light',
        language: 'pt-BR'
      },
      crmConfig: {
        kanbanStages: [
          { id: 'lead', name: 'Leads', color: '#3B82F6' },
          { id: 'contact', name: 'Primeiro Contato', color: '#EAB308' },
          { id: 'proposal', name: 'Proposta', color: '#F97316' },
          { id: 'negotiation', name: 'Negociação', color: '#8B5CF6' },
          { id: 'closed', name: 'Fechado', color: '#10B981' },
          { id: 'lost', name: 'Perdido', color: '#EF4444' }
        ]
      }
    };
    
    this.activeCompany = this.config.companies[this.config.activeCompany];
    console.log('✅ Configuração de demonstração carregada');
  }

  createUI() {
    // Remover UI anterior se existir
    const existingUI = document.getElementById('empresas-web-crm-container');
    if (existingUI) {
      existingUI.remove();
    }

    // Criar container principal
    this.ui = document.createElement('div');
    this.ui.id = 'empresas-web-crm-container';
    this.ui.innerHTML = this.getUIHTML();
    
    // Inserir no DOM
    document.body.appendChild(this.ui);
    
    // Configurar eventos da UI
    this.setupUIEvents();
    
    console.log('✅ Interface CRM criada');
  }

  getUIHTML() {
    return `
      <!-- Empresas Web CRM Interface -->
      <div class="ew-crm-overlay" style="display: none;">
        <div class="ew-crm-sidebar">
          <div class="ew-crm-header">
            <div class="ew-crm-logo">
              <img src="${chrome.runtime.getURL('icons/icon32.png')}" alt="Empresas Web">
              <h3>CRM Pro</h3>
            </div>
            <div class="ew-crm-company-info">
              <span class="company-name">${this.activeCompany?.name || 'Empresa não selecionada'}</span>
              <span class="company-status">●</span>
            </div>
          </div>
          
          <div class="ew-crm-nav">
            <button class="ew-nav-btn active" data-panel="kanban">
              <span class="icon">📊</span>
              <span class="label">Kanban CRM</span>
            </button>
            <button class="ew-nav-btn" data-panel="automation">
              <span class="icon">🤖</span>
              <span class="label">Automação</span>
            </button>
            <button class="ew-nav-btn" data-panel="mass-message">
              <span class="icon">📢</span>
              <span class="label">Envio em Massa</span>
            </button>
            <button class="ew-nav-btn" data-panel="schedule">
              <span class="icon">⏰</span>
              <span class="label">Agendamento</span>
            </button>
            <button class="ew-nav-btn" data-panel="analytics">
              <span class="icon">📈</span>
              <span class="label">Análises</span>
            </button>
          </div>
          
          <div class="ew-crm-quick-stats">
            <div class="stat-item">
              <span class="stat-number" id="total-contacts">0</span>
              <span class="stat-label">Contatos</span>
            </div>
            <div class="stat-item">
              <span class="stat-number" id="active-deals">0</span>
              <span class="stat-label">Negócios</span>
            </div>
            <div class="stat-item">
              <span class="stat-number" id="conversion-rate">0%</span>
              <span class="stat-label">Conversão</span>
            </div>
          </div>
        </div>
        
        <div class="ew-crm-main">
          <div class="ew-crm-toolbar">
            <div class="toolbar-left">
              <h2 id="panel-title">Kanban CRM</h2>
            </div>
            <div class="toolbar-right">
              <button class="ew-btn ew-btn-secondary" id="minimize-crm">
                <span>_</span>
              </button>
              <button class="ew-btn ew-btn-danger" id="close-crm">
                <span>×</span>
              </button>
            </div>
          </div>
          
          <div class="ew-crm-content">
            <!-- Kanban CRM Panel -->
            <div class="ew-panel active" id="kanban-panel">
              <div class="kanban-board" id="kanban-board">
                <!-- Colunas do Kanban serão inseridas aqui -->
              </div>
            </div>
            
            <!-- Automation Panel -->
            <div class="ew-panel" id="automation-panel">
              <div class="automation-content">
                <h3>Configuração de Automação</h3>
                <!-- Conteúdo da automação será inserido aqui -->
              </div>
            </div>
            
            <!-- Mass Message Panel -->
            <div class="ew-panel" id="mass-message-panel">
              <div class="mass-message-content">
                <h3>Envio em Massa</h3>
                <!-- Conteúdo do envio em massa será inserido aqui -->
              </div>
            </div>
            
            <!-- Schedule Panel -->
            <div class="ew-panel" id="schedule-panel">
              <div class="schedule-content">
                <h3>Agendamento de Mensagens</h3>
                <!-- Conteúdo do agendamento será inserido aqui -->
              </div>
            </div>
            
            <!-- Analytics Panel -->
            <div class="ew-panel" id="analytics-panel">
              <div class="analytics-content">
                <h3>Análises e Relatórios</h3>
                <!-- Conteúdo das análises será inserido aqui -->
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Botão flutuante para abrir CRM -->
      <div class="ew-crm-fab" id="crm-fab">
        <img src="${chrome.runtime.getURL('icons/icon32.png')}" alt="CRM">
        <span class="fab-tooltip">Abrir CRM</span>
      </div>
      
      <!-- Quick Actions Overlay -->
      <div class="ew-quick-actions" id="quick-actions">
        <!-- Botões rápidos serão inseridos aqui -->
      </div>
      
      <!-- Contact Info Panel -->
      <div class="ew-contact-panel" id="contact-panel" style="display: none;">
        <div class="contact-header">
          <h3>Informações do Contato</h3>
          <button class="close-btn" id="close-contact-panel">×</button>
        </div>
        <div class="contact-content">
          <!-- Informações do contato serão inseridas aqui -->
        </div>
      </div>
    `;
  }

  setupUIEvents() {
    // Botão flutuante
    const fab = document.getElementById('crm-fab');
    if (fab) {
      fab.addEventListener('click', () => this.toggleCRM());
    }

    // Navegação
    document.querySelectorAll('.ew-nav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const panel = e.currentTarget.dataset.panel;
        this.switchPanel(panel);
      });
    });

    // Controles da toolbar
    const minimizeBtn = document.getElementById('minimize-crm');
    const closeBtn = document.getElementById('close-crm');
    
    if (minimizeBtn) {
      minimizeBtn.addEventListener('click', () => this.minimizeCRM());
    }
    
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeCRM());
    }

    // Fechar painel de contato
    const closeContactBtn = document.getElementById('close-contact-panel');
    if (closeContactBtn) {
      closeContactBtn.addEventListener('click', () => this.closeContactPanel());
    }
  }

  setupObservers() {
    // Observer para novas conversas
    const chatListObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              this.processNewChatElement(node);
            }
          });
        }
      });
    });

    // Observer para mensagens
    const messageObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              this.processNewMessage(node);
            }
          });
        }
      });
    });

    // Iniciar observação
    const chatList = document.querySelector('[data-testid="chat-list"]');
    if (chatList) {
      chatListObserver.observe(chatList, { childList: true, subtree: true });
      this.observers.push(chatListObserver);
    }

    const messagesContainer = document.querySelector('[data-testid="conversation-panel-messages"]');
    if (messagesContainer) {
      messageObserver.observe(messagesContainer, { childList: true, subtree: true });
      this.observers.push(messageObserver);
    }
  }

  setupMessageListeners() {
    // Chrome runtime message listener
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
      chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        this.handleRuntimeMessage(request, sender, sendResponse);
        return true;
      });
    }

    // Listener para eventos personalizados
    window.addEventListener('empresasWebCRMInit', () => {
      console.log('📡 Evento de inicialização recebido');
    });

    window.addEventListener('companyChanged', (e) => {
      console.log('🔄 Empresa alterada:', e.detail);
      this.handleCompanyChange(e.detail);
    });
  }

  handleRuntimeMessage(request, sender, sendResponse) {
    console.log('📨 Mensagem recebida:', request);

    switch (request.action) {
      case 'showCRM':
        this.showCRM();
        sendResponse({ success: true });
        break;

      case 'showAutomation':
        this.showCRM();
        this.switchPanel('automation');
        sendResponse({ success: true });
        break;

      case 'showMassMessage':
        this.showCRM();
        this.switchPanel('mass-message');
        sendResponse({ success: true });
        break;

      case 'showSchedule':
        this.showCRM();
        this.switchPanel('schedule');
        sendResponse({ success: true });
        break;

      case 'companyChanged':
        this.handleCompanyChange(request.companyId);
        sendResponse({ success: true });
        break;

      case 'sendScheduledMessage':
        this.sendScheduledMessage(request.data);
        sendResponse({ success: true });
        break;

      default:
        sendResponse({ success: false, error: 'Ação não reconhecida' });
    }
  }

  initializeComponents() {
    // Inicializar componentes específicos
    if (typeof CRMKanban !== 'undefined') {
      this.kanban = new CRMKanban(this);
    }

    if (typeof MassSender !== 'undefined') {
      this.massSender = new MassSender(this);
    }

    if (typeof AutoResponder !== 'undefined') {
      this.autoResponder = new AutoResponder(this);
    }

    if (typeof InteractiveButtons !== 'undefined') {
      this.interactiveButtons = new InteractiveButtons(this);
    }

    if (typeof ContactManager !== 'undefined') {
      this.contactManager = new ContactManager(this);
    }

    // Inserir botões rápidos
    this.insertQuickButtons();
    
    // Inicializar Kanban
    this.initializeKanban();
  }

  insertQuickButtons() {
    if (!this.activeCompany?.settings?.quickButtons) return;

    const quickActions = document.getElementById('quick-actions');
    if (!quickActions) return;

    const buttonsHTML = this.activeCompany.settings.quickButtons.map(button => `
      <button class="ew-quick-btn" data-action="${button.action}" data-value="${button.value}">
        ${button.text}
      </button>
    `).join('');

    quickActions.innerHTML = buttonsHTML;

    // Configurar eventos dos botões
    quickActions.querySelectorAll('.ew-quick-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        const value = e.target.dataset.value;
        this.executeQuickAction(action, value);
      });
    });
  }

  executeQuickAction(action, value) {
    switch (action) {
      case 'send_message':
        this.sendMessage(value);
        break;
      case 'add_label':
        this.addLabel(value);
        break;
      case 'transfer_department':
        this.transferToDepartment(value);
        break;
      default:
        console.log('Ação não reconhecida:', action);
    }
  }

  sendMessage(message) {
    // Encontrar campo de input de mensagem
    const messageInput = document.querySelector('[data-testid="conversation-compose-box-input"]');
    if (messageInput) {
      // Inserir texto
      messageInput.textContent = message;
      
      // Disparar eventos para atualizar o WhatsApp
      messageInput.dispatchEvent(new Event('input', { bubbles: true }));
      
      // Aguardar um pouco e enviar
      setTimeout(() => {
        const sendButton = document.querySelector('[data-testid="compose-btn-send"]');
        if (sendButton) {
          sendButton.click();
        }
      }, 100);
    }
  }

  // Métodos de controle da UI
  toggleCRM() {
    const overlay = document.querySelector('.ew-crm-overlay');
    if (overlay) {
      const isVisible = overlay.style.display !== 'none';
      overlay.style.display = isVisible ? 'none' : 'flex';
      
      if (!isVisible) {
        this.updateStats();
      }
    }
  }

  showCRM() {
    const overlay = document.querySelector('.ew-crm-overlay');
    if (overlay) {
      overlay.style.display = 'flex';
      this.updateStats();
    }
  }

  minimizeCRM() {
    const overlay = document.querySelector('.ew-crm-overlay');
    if (overlay) {
      overlay.classList.toggle('minimized');
    }
  }

  closeCRM() {
    const overlay = document.querySelector('.ew-crm-overlay');
    if (overlay) {
      overlay.style.display = 'none';
    }
  }

  switchPanel(panelName) {
    // Atualizar navegação
    document.querySelectorAll('.ew-nav-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`[data-panel="${panelName}"]`).classList.add('active');

    // Atualizar painéis
    document.querySelectorAll('.ew-panel').forEach(panel => {
      panel.classList.remove('active');
    });
    document.getElementById(`${panelName}-panel`).classList.add('active');

    // Atualizar título
    const titles = {
      'kanban': 'Kanban CRM',
      'automation': 'Automação',
      'mass-message': 'Envio em Massa',
      'schedule': 'Agendamento',
      'analytics': 'Análises'
    };
    
    document.getElementById('panel-title').textContent = titles[panelName] || panelName;
  }

  initializeKanban() {
    const kanbanBoard = document.getElementById('kanban-board');
    if (!kanbanBoard) return;

    const stages = this.config.crmConfig?.kanbanStages || [];
    
    kanbanBoard.innerHTML = stages.map(stage => `
      <div class="kanban-column" data-stage="${stage.id}">
        <div class="column-header" style="border-color: ${stage.color}">
          <h3>${stage.name}</h3>
          <span class="stage-count">0</span>
        </div>
        <div class="column-content">
          <!-- Cards serão inseridos aqui -->
        </div>
      </div>
    `).join('');
  }

  updateStats() {
    if (!this.activeCompany) return;

    const crmData = this.activeCompany.crmData || {};
    
    // Atualizar contadores
    const totalContacts = Object.keys(crmData.contacts || {}).length;
    const activeDeals = Object.values(crmData.deals || {}).filter(deal => 
      deal.stage !== 'closed' && deal.stage !== 'lost'
    ).length;
    const conversionRate = totalContacts > 0 ? Math.round((activeDeals / totalContacts) * 100) : 0;

    document.getElementById('total-contacts').textContent = totalContacts;
    document.getElementById('active-deals').textContent = activeDeals;
    document.getElementById('conversion-rate').textContent = `${conversionRate}%`;
  }

  // Processamento de elementos do WhatsApp
  processNewChatElement(element) {
    // Processar novos elementos de conversa
    if (element.matches && element.matches('[data-testid="conversation"]')) {
      this.enhanceChatElement(element);
    }
  }

  processNewMessage(element) {
    // Processar novas mensagens
    if (element.matches && element.matches('[data-testid="msg"]')) {
      this.processMessage(element);
    }
  }

  enhanceChatElement(chatElement) {
    // Adicionar elementos de CRM ao chat
    if (chatElement.querySelector('.ew-chat-enhancement')) return; // Já processado

    const enhancement = document.createElement('div');
    enhancement.className = 'ew-chat-enhancement';
    enhancement.innerHTML = `
      <button class="ew-contact-btn" title="Ver informações do contato">
        👤
      </button>
      <button class="ew-label-btn" title="Adicionar etiqueta">
        🏷️
      </button>
    `;

    chatElement.appendChild(enhancement);

    // Configurar eventos
    enhancement.querySelector('.ew-contact-btn').addEventListener('click', () => {
      this.showContactInfo(chatElement);
    });

    enhancement.querySelector('.ew-label-btn').addEventListener('click', () => {
      this.showLabelSelector(chatElement);
    });
  }

  processMessage(messageElement) {
    // Processar mensagem para automação e análise
    const messageText = messageElement.textContent;
    
    // Verificar regras de automação
    if (this.activeCompany?.settings?.autoResponder?.enabled) {
      this.processAutoResponse(messageText, messageElement);
    }

    // Salvar mensagem para análise
    this.saveMessageData(messageText, messageElement);
  }

  showContactInfo(chatElement) {
    const contactPanel = document.getElementById('contact-panel');
    if (contactPanel) {
      contactPanel.style.display = 'block';
      // Carregar informações do contato
    }
  }

  closeContactPanel() {
    const contactPanel = document.getElementById('contact-panel');
    if (contactPanel) {
      contactPanel.style.display = 'none';
    }
  }

  handleCompanyChange(companyId) {
    this.loadConfig().then(() => {
      this.activeCompany = this.config.companies[companyId];
      this.updateUI();
      this.insertQuickButtons();
    });
  }

  updateUI() {
    // Atualizar informações da empresa na UI
    const companyName = document.querySelector('.company-name');
    if (companyName) {
      companyName.textContent = this.activeCompany?.name || 'Empresa não selecionada';
    }

    this.updateStats();
  }

  // Cleanup
  destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];

    if (this.ui) {
      this.ui.remove();
    }

    this.isInitialized = false;
  }
}

// Inicialização
if (!window.empresasWebCRM) {
  window.empresasWebCRM = new EmpresasWebCRM();
}