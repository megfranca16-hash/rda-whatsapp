// BotNinja UI Manager
// Gerenciamento de interface e interações do usuário

class UIManager {
  constructor() {
    this.currentSection = 'dashboard';
    this.activeModals = new Set();
    this.notifications = [];
    this.isInitialized = false;
    
    this.initializeUI();
  }

  // Inicializar interface
  async initializeUI() {
    try {
      console.log('🎨 Inicializando UI Manager...');
      
      // Configurar event listeners
      this.setupEventListeners();
      
      // Inicializar componentes
      this.initializeComponents();
      
      // Carregar dados iniciais
      await this.loadInitialData();
      
      // Configurar atualizações automáticas
      this.setupAutoUpdates();
      
      this.isInitialized = true;
      console.log('✅ UI Manager inicializado');
      
    } catch (error) {
      console.error('❌ Erro ao inicializar UI Manager:', error);
    }
  }

  // Configurar event listeners
  setupEventListeners() {
    // Navegação lateral
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const section = e.currentTarget.dataset.section;
        this.switchSection(section);
      });
    });

    // Botões de ação rápida
    this.setupQuickActionButtons();

    // Modals
    this.setupModalHandlers();

    // Formulários
    this.setupFormHandlers();

    // Event listeners customizados
    this.setupCustomEventListeners();
  }

  // Configurar botões de ação rápida
  setupQuickActionButtons() {
    const buttons = {
      'configBotBtn': () => this.showBotConfigModal(),
      'trainAiBtn': () => this.showTrainAIModal(),
      'knowledgeBaseBtn': () => this.showKnowledgeBaseModal(),
      'simulateBtn': () => this.switchSection('ai-chat'),
      'reportsBtn': () => this.showReportsModal(),
      'generateQrBtn': () => window.WhatsAppManager.generateQRCode(),
      'settingsBtn': () => this.showModal('settingsModal'),
      'helpBtn': () => this.showHelpModal()
    };

    Object.entries(buttons).forEach(([buttonId, handler]) => {
      const button = document.getElementById(buttonId);
      if (button) {
        button.addEventListener('click', handler);
      }
    });
  }

  // Configurar handlers de modals
  setupModalHandlers() {
    // Fechar modals
    document.querySelectorAll('.modal-close').forEach(button => {
      button.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal');
        if (modal) {
          this.hideModal(modal.id);
        }
      });
    });

    // Fechar modal clicando no backdrop
    document.querySelectorAll('.modal').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.hideModal(modal.id);
        }
      });
    });
  }

  // Configurar handlers de formulários
  setupFormHandlers() {
    // Formulário de campanha
    const campaignForm = document.getElementById('campaignForm');
    if (campaignForm) {
      campaignForm.addEventListener('submit', (e) => this.handleCampaignSubmit(e));
    }

    // Simulador de chat
    const simulatorBtn = document.getElementById('sendSimulatorBtn');
    const simulatorInput = document.getElementById('simulatorInput');
    
    if (simulatorBtn && simulatorInput) {
      simulatorBtn.addEventListener('click', () => this.handleSimulatorMessage());
      simulatorInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.handleSimulatorMessage();
        }
      });
    }
  }

  // Configurar event listeners customizados
  setupCustomEventListeners() {
    // Atualização de métricas da IA
    window.addEventListener('ai:metrics:updated', (e) => {
      this.updateMetricsDisplay(e.detail);
    });

    // Mudanças de status do WhatsApp
    window.addEventListener('whatsapp:status:changed', (e) => {
      this.updateConnectionStatus(e.detail.status);
    });

    // Mensagens recebidas
    window.addEventListener('whatsapp:message:received', (e) => {
      this.handleIncomingMessage(e.detail);
    });

    // Erros
    window.addEventListener('botninja:error', (e) => {
      this.showError(e.detail.message);
    });

    // Mudanças no storage
    window.addEventListener('botninja:storage:changed', (e) => {
      this.handleStorageChange(e.detail.key, e.detail.data);
    });
  }

  // Inicializar componentes
  initializeComponents() {
    // Inicializar Kanban
    this.initializeKanban();
    
    // Inicializar calendário
    this.initializeCalendar();
    
    // Inicializar feed de atividades
    this.initializeActivityFeed();
  }

  // Carregar dados iniciais
  async loadInitialData() {
    // Carregar métricas
    await this.loadMetrics();
    
    // Atualizar informações do bot
    await this.updateBotInfo();
    
    // Carregar atividades recentes
    await this.loadRecentActivities();
  }

  // Configurar atualizações automáticas
  setupAutoUpdates() {
    // Atualizar métricas a cada 30 segundos
    setInterval(() => {
      this.updateMetricsWithSimulation();
    }, 30000);
    
    // Atualizar atividades a cada 60 segundos
    setInterval(() => {
      this.loadRecentActivities();
    }, 60000);
  }

  // Alternar seção
  switchSection(sectionId) {
    // Remover ativo de todas as seções
    document.querySelectorAll('.content-section').forEach(section => {
      section.classList.remove('active');
    });
    
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
    });

    // Ativar seção selecionada
    const targetSection = document.getElementById(`${sectionId}-section`);
    const targetNavItem = document.querySelector(`[data-section="${sectionId}"]`);
    
    if (targetSection) {
      targetSection.classList.add('active');
    }
    
    if (targetNavItem) {
      targetNavItem.classList.add('active');
    }

    this.currentSection = sectionId;
    
    // Executar ações específicas da seção
    this.handleSectionSwitch(sectionId);
  }

  // Lidar com mudança de seção
  handleSectionSwitch(sectionId) {
    switch (sectionId) {
      case 'dashboard':
        this.loadMetrics();
        break;
      case 'whatsapp':
        // Configurar botão de QR Code
        setTimeout(() => window.WhatsAppManager.setupQRButton(), 100);
        break;
      case 'ai-chat':
        this.initializeChatSimulator();
        break;
      case 'crm-kanban':
        this.loadKanbanData();
        break;
      case 'agenda':
        this.loadCalendarData();
        break;
    }
  }

  // Mostrar modal
  showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      this.activeModals.add(modalId);
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    }
  }

  // Esconder modal
  hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
      this.activeModals.delete(modalId);
      
      // Restore body scroll if no modals are active
      if (this.activeModals.size === 0) {
        document.body.style.overflow = '';
      }
    }
  }

  // Carregar métricas
  async loadMetrics() {
    try {
      const config = await window.BotNinjaStorage.getConfig();
      const metrics = config.aiMetrics || {};
      
      // Simular métricas realistas se não existirem
      if (!metrics.responsesToday) {
        metrics.responsesToday = Math.floor(Math.random() * 150) + 50;
        metrics.leadsQualified = Math.floor(metrics.responsesToday * 0.3);
        metrics.meetingsScheduled = Math.floor(metrics.leadsQualified * 0.4);
        metrics.conversions = Math.floor(metrics.meetingsScheduled * 0.6);
      }
      
      this.updateMetricsDisplay(metrics);
      
    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
    }
  }

  // Atualizar exibição de métricas
  updateMetricsDisplay(metrics) {
    const elements = {
      'aiResponses': metrics.responsesToday || 0,
      'leadsQualified': metrics.leadsQualified || 0,
      'scheduledMeetings': metrics.meetingsScheduled || 0,
      'conversionsToday': metrics.conversions || 0
    };

    Object.entries(elements).forEach(([elementId, value]) => {
      const element = document.getElementById(elementId);
      if (element) {
        // Animate number change
        this.animateNumber(element, parseInt(element.textContent) || 0, value);
      }
    });
  }

  // Animar mudança de número
  animateNumber(element, from, to) {
    const duration = 1000;
    const steps = 30;
    const increment = (to - from) / steps;
    let current = from;
    let step = 0;

    const animation = setInterval(() => {
      current += increment;
      element.textContent = Math.round(current);
      step++;

      if (step >= steps) {
        element.textContent = to;
        clearInterval(animation);
      }
    }, duration / steps);
  }

  // Atualizar informações do bot
  async updateBotInfo() {
    try {
      const config = await window.BotNinjaStorage.getConfig();
      const activeBot = config.bots[config.activeBot];
      
      if (activeBot) {
        const botNameElement = document.getElementById('botName');
        const botStatusElement = document.getElementById('botStatus');
        
        if (botNameElement) {
          botNameElement.textContent = `IA ${activeBot.name}`;
        }
        
        if (botStatusElement) {
          const status = window.WhatsAppManager.isConnected() 
            ? 'Atendimento Automático 24/7' 
            : 'Aguardando conexão WhatsApp';
          botStatusElement.textContent = status;
        }
      }
      
    } catch (error) {
      console.error('Erro ao atualizar info do bot:', error);
    }
  }

  // Carregar atividades recentes
  async loadRecentActivities() {
    const activityFeed = document.getElementById('activityFeed');
    if (!activityFeed) return;

    // Simular atividades recentes
    const activities = this.generateSimulatedActivities();
    
    activityFeed.innerHTML = activities.map(activity => `
      <div class="activity-item">
        <div class="activity-icon">${activity.icon}</div>
        <div class="activity-content">
          <h4>${activity.title}</h4>
          <p>${activity.description}</p>
        </div>
        <div class="activity-time">${activity.time}</div>
      </div>
    `).join('');
  }

  // Gerar atividades simuladas
  generateSimulatedActivities() {
    const activities = [
      {
        icon: '🤖',
        title: 'Resposta Automática Enviada',
        description: 'IA respondeu cliente sobre planos de automação',
        time: '2 min atrás'
      },
      {
        icon: '📅',
        title: 'Reunião Agendada',
        description: 'IA agendou demonstração para amanhã às 14h',
        time: '5 min atrás'
      },
      {
        icon: '🎯',
        title: 'Lead Qualificado',
        description: 'Cliente demonstrou interesse no Plano Empresarial',
        time: '8 min atrás'
      },
      {
        icon: '💬',
        title: 'Nova Conversa Iniciada',
        description: 'Cliente perguntou sobre integração com CRM',
        time: '12 min atrás'
      },
      {
        icon: '🚀',
        title: 'Campanha Enviada',
        description: 'Disparo em massa para 150 contatos concluído',
        time: '25 min atrás'
      }
    ];

    return activities.slice(0, 3); // Mostrar apenas 3 mais recentes
  }

  // Atualizar status de conexão
  updateConnectionStatus(status) {
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');
    
    if (statusDot) {
      statusDot.className = 'status-dot';
      if (status === 'connected') {
        statusDot.classList.add('connected');
      }
    }
    
    // Atualizar info do bot também
    this.updateBotInfo();
  }

  // Lidar com mensagem recebida
  handleIncomingMessage(messageData) {
    // Mostrar notificação de nova mensagem
    this.showNotification(`Nova mensagem de ${messageData.from}`, 'info');
    
    // Atualizar feed de atividades
    this.loadRecentActivities();
  }

  // Inicializar simulador de chat
  initializeChatSimulator() {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;

    // Adicionar mensagem de boas-vindas se vazio
    if (chatMessages.children.length === 0) {
      this.addChatMessage('ai', 'Olá! Sou o simulador da IA. Digite uma mensagem para testar como eu responderia a um cliente real. 🤖');
    }
  }

  // Lidar com mensagem do simulador
  async handleSimulatorMessage() {
    const input = document.getElementById('simulatorInput');
    if (!input || !input.value.trim()) return;

    const userMessage = input.value.trim();
    input.value = '';

    // Adicionar mensagem do usuário
    this.addChatMessage('user', userMessage);

    // Simular IA pensando
    this.addTypingIndicator();

    try {
      // Obter resposta da IA
      const response = await window.AIEngine.simulateConversation(userMessage);
      
      // Remover indicador de digitação
      this.removeTypingIndicator();
      
      // Adicionar resposta da IA
      this.addChatMessage('ai', response);
      
    } catch (error) {
      this.removeTypingIndicator();
      this.addChatMessage('ai', 'Desculpe, houve um erro ao processar sua mensagem. 😔');
      console.error('Erro no simulador:', error);
    }
  }

  // Adicionar mensagem ao chat
  addChatMessage(sender, message) {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    const bubbleDiv = document.createElement('div');
    bubbleDiv.className = 'message-bubble';
    bubbleDiv.textContent = message;
    
    messageDiv.appendChild(bubbleDiv);
    chatMessages.appendChild(messageDiv);
    
    // Scroll para a última mensagem
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Adicionar indicador de digitação
  addTypingIndicator() {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;

    const typingDiv = document.createElement('div');
    typingDiv.className = 'message ai typing-indicator';
    typingDiv.id = 'typingIndicator';
    
    const bubbleDiv = document.createElement('div');
    bubbleDiv.className = 'message-bubble';
    bubbleDiv.innerHTML = '⋯';
    
    typingDiv.appendChild(bubbleDiv);
    chatMessages.appendChild(typingDiv);
    
    // Scroll para o indicador
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Remover indicador de digitação
  removeTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }

  // Lidar com envio de campanha
  async handleCampaignSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const campaignData = {
      name: formData.get('campaignName'),
      message: formData.get('campaignMessage'),
      audience: formData.get('targetAudience')
    };
    
    try {
      // Salvar campanha
      const campaignId = await window.BotNinjaStorage.saveMassCampaign(campaignData);
      
      // Mostrar sucesso
      this.showNotification('Campanha criada com sucesso!', 'success');
      
      // Limpar formulário
      e.target.reset();
      
      // Atualizar métricas
      this.loadMetrics();
      
    } catch (error) {
      console.error('Erro ao criar campanha:', error);
      this.showNotification('Erro ao criar campanha', 'error');
    }
  }

  // Inicializar Kanban
  initializeKanban() {
    this.loadKanbanData();
  }

  // Carregar dados do Kanban
  async loadKanbanData() {
    const kanbanBoard = document.getElementById('kanbanBoard');
    if (!kanbanBoard) return;

    try {
      const config = await window.BotNinjaStorage.getConfig();
      const stages = config.crmConfig?.kanbanStages || [];
      
      kanbanBoard.innerHTML = stages.map(stage => `
        <div class="kanban-column" data-stage="${stage.id}">
          <div class="column-header" style="border-left: 4px solid ${stage.color}">
            <h3>${stage.name}</h3>
            <span class="stage-count">0</span>
          </div>
          <div class="column-content">
            <!-- Cards serão inseridos aqui -->
          </div>
        </div>
      `).join('');
      
    } catch (error) {
      console.error('Erro ao carregar Kanban:', error);
    }
  }

  // Inicializar calendário
  initializeCalendar() {
    this.loadCalendarData();
  }

  // Carregar dados do calendário
  loadCalendarData() {
    const calendarView = document.getElementById('calendarView');
    const upcomingMeetings = document.getElementById('upcomingMeetings');
    
    if (calendarView) {
      calendarView.innerHTML = `
        <div class="calendar-placeholder">
          <div class="calendar-icon">📅</div>
          <h3>Calendário da IA</h3>
          <p>Reuniões agendadas automaticamente pela IA aparecerão aqui</p>
        </div>
      `;
    }
    
    if (upcomingMeetings) {
      upcomingMeetings.innerHTML = `
        <div class="meeting-item">
          <div class="meeting-time">14:00</div>
          <div class="meeting-details">
            <h4>Demo BotNinja</h4>
            <p>Cliente interessado no Plano Empresarial</p>
          </div>
        </div>
        <div class="meeting-item">
          <div class="meeting-time">16:30</div>
          <div class="meeting-details">
            <h4>Apresentação IA</h4>
            <p>Demonstração personalizada de automação</p>
          </div>
        </div>
      `;
    }
  }

  // Inicializar feed de atividades
  initializeActivityFeed() {
    this.loadRecentActivities();
  }

  // Atualizar métricas com simulação
  updateMetricsWithSimulation() {
    if (!window.WhatsAppManager.isConnected()) return;

    // Simular pequenos incrementos nas métricas
    const increments = {
      responsesToday: Math.random() > 0.7 ? 1 : 0,
      leadsQualified: Math.random() > 0.8 ? 1 : 0,
      meetingsScheduled: Math.random() > 0.9 ? 1 : 0,
      conversions: Math.random() > 0.95 ? 1 : 0
    };

    // Atualizar métricas no storage
    window.BotNinjaStorage.getConfig().then(config => {
      const metrics = config.aiMetrics || {};
      
      Object.entries(increments).forEach(([key, increment]) => {
        metrics[key] = (metrics[key] || 0) + increment;
      });
      
      window.BotNinjaStorage.updateAIMetrics(metrics);
    });
  }

  // Mostrar notificação
  showNotification(message, type = 'info') {
    console.log(`${type.toUpperCase()}: ${message}`);
    
    // Implementar toast notifications aqui se necessário
    const event = new CustomEvent('botninja:notification', {
      detail: { message, type }
    });
    window.dispatchEvent(event);
  }

  // Mostrar erro
  showError(message) {
    this.showNotification(message, 'error');
  }

  // Lidar com mudanças no storage
  handleStorageChange(key, data) {
    switch (key) {
      case 'config':
        this.loadMetrics();
        this.updateBotInfo();
        break;
      case 'botChanged':
        this.updateBotInfo();
        break;
      case 'connectionChanged':
        this.updateConnectionStatus(data.status);
        break;
    }
  }

  // Modals específicos
  showBotConfigModal() {
    this.showNotification('Abrindo configurações do bot...', 'info');
    // Implementar modal de configuração
  }

  showTrainAIModal() {
    this.showNotification('Abrindo treinamento da IA...', 'info');
    // Implementar modal de treinamento
  }

  showKnowledgeBaseModal() {
    this.showNotification('Abrindo base de conhecimento...', 'info');
    // Implementar modal de base de conhecimento
  }

  showReportsModal() {
    this.showNotification('Carregando relatórios...', 'info');
    // Implementar modal de relatórios
  }

  showHelpModal() {
    this.showNotification('Abrindo ajuda...', 'info');
    // Implementar modal de ajuda
  }
}

// Instância global do UI Manager
window.UIManager = new UIManager();