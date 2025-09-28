// Empresas Web - WhatsApp Injector
// Injeta elementos CRM no WhatsApp Web

class WhatsAppInjector {
  constructor(crmInstance) {
    this.crm = crmInstance;
    this.observers = [];
    this.injectedElements = new Set();
    
    this.init();
  }

  init() {
    console.log('🔧 Inicializando WhatsApp Injector...');
    this.injectCRMElements();
    this.setupObservers();
    this.enhanceExistingChats();
  }

  injectCRMElements() {
    // Injetar barra de ferramentas CRM no cabeçalho do WhatsApp
    this.injectCRMToolbar();
    
    // Injetar botões rápidos na área de composição
    this.injectQuickButtons();
    
    // Injetar indicadores de CRM nas conversas
    this.injectCRMIndicators();
  }

  injectCRMToolbar() {
    const header = document.querySelector('header[data-testid="conversation-header"]');
    if (header && !document.getElementById('ew-crm-toolbar')) {
      const toolbar = document.createElement('div');
      toolbar.id = 'ew-crm-toolbar';
      toolbar.className = 'ew-crm-toolbar-header';
      toolbar.innerHTML = `
        <div class="ew-toolbar-buttons">
          <button class="ew-toolbar-btn" id="ew-contact-info-btn" title="Informações do Contato">
            <span>👤</span>
          </button>
          <button class="ew-toolbar-btn" id="ew-add-label-btn" title="Adicionar Etiqueta">
            <span>🏷️</span>
          </button>
          <button class="ew-toolbar-btn" id="ew-move-deal-btn" title="Mover no Pipeline">
            <span>📊</span>
          </button>
          <button class="ew-toolbar-btn" id="ew-schedule-msg-btn" title="Agendar Mensagem">
            <span>⏰</span>
          </button>
        </div>
      `;

      // Inserir após o cabeçalho
      header.parentNode.insertBefore(toolbar, header.nextSibling);
      
      // Configurar eventos
      this.setupToolbarEvents(toolbar);
    }
  }

  injectQuickButtons() {
    const composeBox = document.querySelector('[data-testid="conversation-compose-box-input"]');
    if (composeBox && !document.getElementById('ew-quick-buttons-panel')) {
      const quickPanel = document.createElement('div');
      quickPanel.id = 'ew-quick-buttons-panel';
      quickPanel.className = 'ew-quick-panel';
      
      if (this.crm.activeCompany?.settings?.quickButtons) {
        quickPanel.innerHTML = `
          <div class="ew-quick-buttons-container">
            ${this.crm.activeCompany.settings.quickButtons.map(btn => `
              <button class="ew-quick-response-btn" data-value="${btn.value}">
                ${btn.text}
              </button>
            `).join('')}
          </div>
        `;

        // Inserir antes da caixa de composição
        composeBox.parentNode.insertBefore(quickPanel, composeBox);
        
        // Configurar eventos dos botões rápidos
        this.setupQuickButtonEvents(quickPanel);
      }
    }
  }

  injectCRMIndicators() {
    // Injetar indicadores nas conversas da lista
    const chatItems = document.querySelectorAll('[data-testid="conversation"]');
    
    chatItems.forEach((chatItem, index) => {
      if (!this.injectedElements.has(chatItem)) {
        this.enhanceChatItem(chatItem);
        this.injectedElements.add(chatItem);
      }
    });
  }

  enhanceChatItem(chatItem) {
    if (chatItem.querySelector('.ew-chat-crm-indicator')) return;

    const indicator = document.createElement('div');
    indicator.className = 'ew-chat-crm-indicator';
    
    // Simular dados de CRM para demonstração
    const mockCRMData = {
      stage: ['lead', 'contact', 'proposal', 'negotiation', 'closed'][Math.floor(Math.random() * 5)],
      labels: ['hot_lead', 'client', 'prospect'][Math.floor(Math.random() * 3)],
      hasDeals: Math.random() > 0.5
    };

    const stageColors = {
      lead: '#3B82F6',
      contact: '#EAB308', 
      proposal: '#F97316',
      negotiation: '#8B5CF6',
      closed: '#10B981'
    };

    indicator.innerHTML = `
      <div class="ew-crm-stage-indicator" style="background-color: ${stageColors[mockCRMData.stage]}">
        ${mockCRMData.stage.charAt(0).toUpperCase()}
      </div>
      ${mockCRMData.hasDeals ? '<div class="ew-deal-indicator">💰</div>' : ''}
    `;

    // Inserir o indicador
    const chatInfo = chatItem.querySelector('[data-testid="cell-frame-container"]');
    if (chatInfo) {
      chatInfo.style.position = 'relative';
      chatInfo.appendChild(indicator);
    }
  }

  setupObservers() {
    // Observer para novos elementos de conversa
    const chatListObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              if (node.matches('[data-testid="conversation"]')) {
                this.enhanceChatItem(node);
                this.injectedElements.add(node);
              }
            }
          });
        }
      });
    });

    // Observer para mudanças na conversa ativa
    const conversationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' || mutation.type === 'attributes') {
          // Re-injetar elementos quando necessário
          setTimeout(() => {
            this.injectCRMToolbar();
            this.injectQuickButtons();
          }, 500);
        }
      });
    });

    // Iniciar observação
    const chatList = document.querySelector('[data-testid="chat-list"]');
    if (chatList) {
      chatListObserver.observe(chatList, { childList: true, subtree: true });
      this.observers.push(chatListObserver);
    }

    const mainPanel = document.querySelector('#main');
    if (mainPanel) {
      conversationObserver.observe(mainPanel, { 
        childList: true, 
        subtree: true, 
        attributes: true,
        attributeFilter: ['class', 'style']
      });
      this.observers.push(conversationObserver);
    }
  }

  setupToolbarEvents(toolbar) {
    // Botão informações do contato
    const contactBtn = toolbar.querySelector('#ew-contact-info-btn');
    if (contactBtn) {
      contactBtn.addEventListener('click', () => {
        this.crm.showContactInfo();
      });
    }

    // Botão adicionar etiqueta
    const labelBtn = toolbar.querySelector('#ew-add-label-btn');
    if (labelBtn) {
      labelBtn.addEventListener('click', () => {
        this.showLabelSelector();
      });
    }

    // Botão mover deal
    const dealBtn = toolbar.querySelector('#ew-move-deal-btn');
    if (dealBtn) {
      dealBtn.addEventListener('click', () => {
        this.showDealMover();
      });
    }

    // Botão agendar mensagem
    const scheduleBtn = toolbar.querySelector('#ew-schedule-msg-btn');
    if (scheduleBtn) {
      scheduleBtn.addEventListener('click', () => {
        this.showMessageScheduler();
      });
    }
  }

  setupQuickButtonEvents(quickPanel) {
    const quickButtons = quickPanel.querySelectorAll('.ew-quick-response-btn');
    
    quickButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const message = btn.dataset.value;
        this.insertMessage(message);
      });
    });
  }

  insertMessage(message) {
    const messageInput = document.querySelector('[data-testid="conversation-compose-box-input"]');
    if (messageInput) {
      // Focar no campo de input
      messageInput.focus();
      
      // Inserir texto
      messageInput.textContent = message;
      
      // Disparar eventos para que o WhatsApp reconheça a mudança
      const inputEvent = new Event('input', { bubbles: true });
      const changeEvent = new Event('change', { bubbles: true });
      
      messageInput.dispatchEvent(inputEvent);
      messageInput.dispatchEvent(changeEvent);
      
      // Focar novamente para mostrar cursor
      setTimeout(() => {
        messageInput.focus();
        
        // Posicionar cursor no final
        const range = document.createRange();
        const selection = window.getSelection();
        range.selectNodeContents(messageInput);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      }, 100);
    }
  }

  enhanceExistingChats() {
    // Melhorar chats existentes na primeira carga
    setTimeout(() => {
      this.injectCRMIndicators();
    }, 1000);
  }

  showLabelSelector() {
    if (!this.crm.activeCompany?.settings?.labels) return;

    const modal = document.createElement('div');
    modal.className = 'ew-modal-overlay';
    modal.innerHTML = `
      <div class="ew-modal ew-label-selector">
        <div class="ew-modal-header">
          <h3>Adicionar Etiqueta</h3>
          <button class="ew-modal-close">&times;</button>
        </div>
        <div class="ew-modal-content">
          <div class="ew-labels-grid">
            ${this.crm.activeCompany.settings.labels.map(label => `
              <button class="ew-label-option" data-label="${label.id}" style="background-color: ${label.color}20; border-color: ${label.color}">
                <span style="color: ${label.color}">●</span>
                ${label.name}
              </button>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Eventos
    modal.querySelector('.ew-modal-close').addEventListener('click', () => {
      modal.remove();
    });

    modal.querySelectorAll('.ew-label-option').forEach(btn => {
      btn.addEventListener('click', () => {
        const labelId = btn.dataset.label;
        this.applyLabel(labelId);
        modal.remove();
      });
    });
  }

  applyLabel(labelId) {
    // Obter contato atual
    const currentContact = this.getCurrentContact();
    if (currentContact) {
      console.log(`Aplicando etiqueta ${labelId} ao contato ${currentContact.name}`);
      // Aqui integraria com o backend para salvar a etiqueta
    }
  }

  getCurrentContact() {
    // Extrair informações do contato da conversa ativa
    const conversationHeader = document.querySelector('[data-testid="conversation-header"]');
    if (conversationHeader) {
      const nameElement = conversationHeader.querySelector('[data-testid="conversation-info-header-chat-title"]');
      const phoneElement = conversationHeader.querySelector('[data-testid="conversation-info-header-subtitle"]');
      
      if (nameElement) {
        return {
          name: nameElement.textContent.trim(),
          phone: phoneElement ? phoneElement.textContent.trim() : '',
          whatsappId: this.extractWhatsAppId()
        };
      }
    }
    return null;
  }

  extractWhatsAppId() {
    // Extrair ID do WhatsApp da URL ou outro método
    const url = window.location.href;
    const match = url.match(/whatsapp\.com\/([^\/]+)/);
    return match ? match[1] : null;
  }

  destroy() {
    // Limpar observers e elementos injetados
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    
    // Remover elementos injetados
    document.querySelectorAll('.ew-crm-toolbar-header, .ew-quick-panel, .ew-chat-crm-indicator').forEach(el => {
      el.remove();
    });
    
    this.injectedElements.clear();
  }
}

// Disponibilizar globalmente
window.WhatsAppInjector = WhatsAppInjector;