// Empresas Web - Auto Responder
// Funcionalidade de resposta automática

class AutoResponder {
  constructor(crmInstance) {
    this.crm = crmInstance;
    this.isActive = false;
    this.respondedContacts = new Set();
    this.messageObserver = null;
    
    this.init();
  }

  init() {
    console.log('🤖 Inicializando Auto Responder...');
    this.loadSettings();
    this.setupMessageObserver();
    this.setupAutomationPanel();
  }

  loadSettings() {
    if (this.crm.activeCompany?.settings?.autoResponder) {
      const settings = this.crm.activeCompany.settings.autoResponder;
      this.isActive = settings.enabled || false;
      
      console.log('⚙️ Configurações do Auto Responder carregadas:', {
        enabled: this.isActive,
        welcomeMessage: settings.welcomeMessage?.substring(0, 50) + '...'
      });
    }
  }

  setupAutomationPanel() {
    const panel = document.getElementById('automation-panel');
    if (!panel) return;

    const settings = this.crm.activeCompany?.settings?.autoResponder || {};
    
    panel.innerHTML = `
      <div class="automation-container">
        <div class="automation-header">
          <h3>Configurações de Automação</h3>
          <div class="automation-toggle">
            <label class="toggle-switch">
              <input type="checkbox" id="autoResponderEnabled" ${this.isActive ? 'checked' : ''}>
              <span class="toggle-slider"></span>
            </label>
            <span class="toggle-label">${this.isActive ? 'Ativado' : 'Desativado'}</span>
          </div>
        </div>

        <div class="automation-content ${!this.isActive ? 'disabled' : ''}">
          <!-- Mensagem de Boas-vindas -->
          <div class="automation-section">
            <h4>Mensagem de Boas-vindas</h4>
            <div class="ew-form-group">
              <label>Mensagem automática para novos contatos</label>
              <textarea id="welcomeMessage" rows="4" placeholder="Olá! Obrigado por entrar em contato conosco. Como posso ajudá-lo?">${settings.welcomeMessage || ''}</textarea>
              <div class="message-variables">
                <small>Variáveis disponíveis: {nome}, {empresa}, {data}, {hora}</small>
              </div>
            </div>
          </div>

          <!-- Horário de Funcionamento -->
          <div class="automation-section">
            <h4>Horário de Funcionamento</h4>
            <div class="business-hours">
              <div class="ew-form-group">
                <label>Horário</label>
                <div class="time-range">
                  <input type="time" id="businessStart" value="${settings.businessHours?.start || '09:00'}">
                  <span>até</span>
                  <input type="time" id="businessEnd" value="${settings.businessHours?.end || '18:00'}">
                </div>
              </div>
              <div class="ew-form-group">
                <label>Dias da semana</label>
                <div class="weekdays">
                  ${['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day, index) => `
                    <label class="weekday-option">
                      <input type="checkbox" value="${index}" ${(settings.businessHours?.weekdays || [1,2,3,4,5]).includes(index) ? 'checked' : ''}>
                      <span>${day}</span>
                    </label>
                  `).join('')}
                </div>
              </div>
            </div>
          </div>

          <!-- Mensagem Fora do Horário -->
          <div class="automation-section">
            <h4>Mensagem Fora do Horário</h4>
            <div class="ew-form-group">
              <textarea id="afterHoursMessage" rows="3" placeholder="Obrigado pelo contato! Nosso horário de atendimento é das 9h às 18h. Retornaremos em breve!">${settings.afterHoursMessage || ''}</textarea>
            </div>
          </div>

          <!-- Regras de Automação -->
          <div class="automation-section">
            <h4>Regras de Automação</h4>
            <div class="automation-rules" id="automationRules">
              ${this.createAutomationRulesHTML()}
            </div>
            <button class="ew-btn-secondary" id="addAutomationRule">
              <span>➕</span> Adicionar Regra
            </button>
          </div>

          <!-- Palavras-chave -->
          <div class="automation-section">
            <h4>Respostas por Palavra-chave</h4>
            <div class="keyword-responses" id="keywordResponses">
              ${this.createKeywordResponsesHTML()}
            </div>
            <button class="ew-btn-secondary" id="addKeywordResponse">
              <span>➕</span> Adicionar Palavra-chave
            </button>
          </div>

          <!-- Estatísticas -->
          <div class="automation-section">
            <h4>Estatísticas de Automação</h4>
            <div class="automation-stats">
              <div class="stat-card">
                <h5>Mensagens Automatizadas Hoje</h5>
                <span class="stat-number" id="automatedToday">0</span>
              </div>
              <div class="stat-card">
                <h5>Taxa de Resposta</h5>
                <span class="stat-number" id="responseRate">0%</span>
              </div>
              <div class="stat-card">
                <h5>Contatos Atendidos</h5>
                <span class="stat-number" id="contactsServed">0</span>
              </div>
            </div>
          </div>
        </div>

        <div class="automation-actions">
          <button class="ew-btn-secondary" id="testAutomation">
            🧪 Testar Automação
          </button>
          <button class="ew-btn-secondary" id="exportRules">
            📤 Exportar Regras
          </button>
          <button class="ew-btn-primary" id="saveAutomation">
            💾 Salvar Configurações
          </button>
        </div>
      </div>
    `;

    this.setupAutomationEvents();
  }

  createAutomationRulesHTML() {
    const rules = this.crm.config?.automationRules || [];
    
    return rules.map((rule, index) => `
      <div class="automation-rule" data-rule-index="${index}">
        <div class="rule-header">
          <h5>Regra ${index + 1}</h5>
          <button class="rule-delete" data-index="${index}">🗑️</button>
        </div>
        <div class="rule-config">
          <div class="ew-form-group">
            <label>Condição</label>
            <select class="rule-condition">
              <option value="contains" ${rule.condition === 'contains' ? 'selected' : ''}>Contém texto</option>
              <option value="starts_with" ${rule.condition === 'starts_with' ? 'selected' : ''}>Inicia com</option>
              <option value="ends_with" ${rule.condition === 'ends_with' ? 'selected' : ''}>Termina com</option>
              <option value="equals" ${rule.condition === 'equals' ? 'selected' : ''}>Igual a</option>
            </select>
          </div>
          <div class="ew-form-group">
            <label>Texto gatilho</label>
            <input type="text" class="rule-trigger" value="${rule.trigger || ''}" placeholder="Ex: orçamento, preço, atendimento">
          </div>
          <div class="ew-form-group">
            <label>Resposta</label>
            <textarea class="rule-response" rows="2" placeholder="Resposta automática...">${rule.response || ''}</textarea>
          </div>
        </div>
      </div>
    `).join('');
  }

  createKeywordResponsesHTML() {
    const keywords = [
      { keyword: 'preço', response: 'Nossos preços variam conforme o serviço. Pode me passar mais detalhes sobre o que precisa?' },
      { keyword: 'orçamento', response: 'Claro! Para fazer um orçamento preciso, me conte sobre seu projeto.' },
      { keyword: 'abertura', response: 'Ajudamos com abertura de empresa! Quer saber mais sobre nossos serviços?' }
    ];

    return keywords.map((item, index) => `
      <div class="keyword-response" data-keyword-index="${index}">
        <div class="keyword-config">
          <div class="ew-form-group">
            <label>Palavra-chave</label>
            <input type="text" class="keyword-text" value="${item.keyword}" placeholder="Ex: preço, orçamento">
          </div>
          <div class="ew-form-group">
            <label>Resposta automática</label>
            <textarea class="keyword-response-text" rows="2">${item.response}</textarea>
          </div>
          <button class="keyword-delete" data-index="${index}">🗑️</button>
        </div>
      </div>
    `).join('');
  }

  setupAutomationEvents() {
    const panel = document.getElementById('automation-panel');
    if (!panel) return;

    // Toggle principal
    const toggle = document.getElementById('autoResponderEnabled');
    if (toggle) {
      toggle.addEventListener('change', (e) => {
        this.isActive = e.target.checked;
        this.updateAutomationStatus();
      });
    }

    // Salvar configurações
    const saveBtn = document.getElementById('saveAutomation');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        this.saveAutomationSettings();
      });
    }

    // Testar automação
    const testBtn = document.getElementById('testAutomation');
    if (testBtn) {
      testBtn.addEventListener('click', () => {
        this.testAutomation();
      });
    }

    // Adicionar regra
    const addRuleBtn = document.getElementById('addAutomationRule');
    if (addRuleBtn) {
      addRuleBtn.addEventListener('click', () => {
        this.addAutomationRule();
      });
    }

    // Adicionar palavra-chave
    const addKeywordBtn = document.getElementById('addKeywordResponse');
    if (addKeywordBtn) {
      addKeywordBtn.addEventListener('click', () => {
        this.addKeywordResponse();
      });
    }
  }

  setupMessageObserver() {
    // Observer para detectar novas mensagens
    this.messageObserver = new MutationObserver((mutations) => {
      if (!this.isActive) return;

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

    // Começar observação
    const messagesContainer = document.querySelector('[data-testid="conversation-panel-messages"]');
    if (messagesContainer) {
      this.messageObserver.observe(messagesContainer, { 
        childList: true, 
        subtree: true 
      });
    }
  }

  processNewMessage(messageElement) {
    // Verificar se é uma mensagem recebida (não enviada por nós)
    if (messageElement.matches('[data-testid="msg-container"]')) {
      const isIncoming = !messageElement.querySelector('.message-out');
      
      if (isIncoming) {
        setTimeout(() => {
          this.handleIncomingMessage(messageElement);
        }, 1000); // Delay para garantir que a mensagem foi processada
      }
    }
  }

  handleIncomingMessage(messageElement) {
    if (!this.isActive) return;

    const messageText = this.extractMessageText(messageElement);
    const contactInfo = this.getCurrentContact();
    
    if (!messageText || !contactInfo) return;

    console.log('📨 Nova mensagem recebida:', messageText.substring(0, 50) + '...');

    // Verificar se já respondemos a este contato
    if (this.respondedContacts.has(contactInfo.phone)) {
      console.log('⏭️ Já respondido para este contato');
      return;
    }

    // Verificar horário de funcionamento
    if (!this.isBusinessHours()) {
      this.sendAfterHoursResponse();
      return;
    }

    // Verificar regras de automação
    const response = this.findAutomaticResponse(messageText);
    
    if (response) {
      setTimeout(() => {
        this.sendAutomaticResponse(response);
        this.respondedContacts.add(contactInfo.phone);
      }, 2000); // Delay para parecer mais natural
    } else if (this.isNewContact(contactInfo)) {
      // Enviar mensagem de boas-vindas para novo contato
      setTimeout(() => {
        this.sendWelcomeMessage();
        this.respondedContacts.add(contactInfo.phone);
      }, 1500);
    }
  }

  extractMessageText(messageElement) {
    const textElement = messageElement.querySelector('span[data-testid="conversation-text"]');
    return textElement ? textElement.textContent.trim().toLowerCase() : '';
  }

  getCurrentContact() {
    const conversationHeader = document.querySelector('[data-testid="conversation-header"]');
    if (conversationHeader) {
      const nameElement = conversationHeader.querySelector('[data-testid="conversation-info-header-chat-title"]');
      const phoneElement = conversationHeader.querySelector('[data-testid="conversation-info-header-subtitle"]');
      
      if (nameElement) {
        return {
          name: nameElement.textContent.trim(),
          phone: phoneElement ? phoneElement.textContent.trim() : ''
        };
      }
    }
    return null;
  }

  isBusinessHours() {
    const now = new Date();
    const settings = this.crm.activeCompany?.settings?.autoResponder || {};
    
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentDay = now.getDay();
    
    const businessHours = settings.businessHours || { start: '09:00', end: '18:00', weekdays: [1,2,3,4,5] };
    
    // Verificar dia da semana
    if (!businessHours.weekdays.includes(currentDay)) {
      return false;
    }
    
    // Verificar horário
    const [startHour, startMinute] = businessHours.start.split(':').map(Number);
    const [endHour, endMinute] = businessHours.end.split(':').map(Number);
    
    const currentTime = currentHour * 60 + currentMinute;
    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;
    
    return currentTime >= startTime && currentTime <= endTime;
  }

  findAutomaticResponse(messageText) {
    // Verificar palavras-chave primeiro
    const keywords = [
      { keyword: 'preço', response: 'Nossos preços variam conforme o serviço. Pode me passar mais detalhes sobre o que precisa?' },
      { keyword: 'orçamento', response: 'Claro! Para fazer um orçamento preciso, me conte sobre seu projeto.' },
      { keyword: 'abertura', response: 'Ajudamos com abertura de empresa! Quer saber mais sobre nossos serviços?' },
      { keyword: 'contabil', response: 'Oferecemos serviços contábeis completos. Em que posso ajudá-lo?' },
      { keyword: 'imposto', response: 'Cuidamos de toda parte tributária. Tem alguma dúvida específica sobre impostos?' }
    ];

    for (const item of keywords) {
      if (messageText.includes(item.keyword.toLowerCase())) {
        return item.response;
      }
    }

    // Verificar regras personalizadas
    const rules = this.crm.config?.automationRules || [];
    
    for (const rule of rules) {
      if (this.matchesRule(messageText, rule)) {
        return rule.response;
      }
    }

    return null;
  }

  matchesRule(messageText, rule) {
    const trigger = rule.trigger.toLowerCase();
    
    switch (rule.condition) {
      case 'contains':
        return messageText.includes(trigger);
      case 'starts_with':
        return messageText.startsWith(trigger);
      case 'ends_with':
        return messageText.endsWith(trigger);
      case 'equals':
        return messageText === trigger;
      default:
        return false;
    }
  }

  sendWelcomeMessage() {
    const settings = this.crm.activeCompany?.settings?.autoResponder || {};
    const welcomeMessage = settings.welcomeMessage || 'Olá! Obrigado por entrar em contato. Como posso ajudá-lo?';
    
    this.sendMessage(welcomeMessage);
    console.log('👋 Mensagem de boas-vindas enviada');
  }

  sendAfterHoursResponse() {
    const settings = this.crm.activeCompany?.settings?.autoResponder || {};
    const afterHoursMessage = settings.afterHoursMessage || 'Obrigado pelo contato! Nosso horário de atendimento é das 9h às 18h. Retornaremos em breve!';
    
    this.sendMessage(afterHoursMessage);
    console.log('🌙 Mensagem fora do horário enviada');
  }

  sendAutomaticResponse(message) {
    this.sendMessage(message);
    console.log('🤖 Resposta automática enviada:', message.substring(0, 50) + '...');
  }

  sendMessage(message) {
    const messageInput = document.querySelector('[data-testid="conversation-compose-box-input"]');
    if (messageInput) {
      // Adicionar assinatura se configurado
      let finalMessage = message;
      if (this.crm.activeCompany?.settings?.signatures?.default) {
        finalMessage += this.crm.activeCompany.settings.signatures.default;
      }

      // Inserir texto
      messageInput.textContent = finalMessage;
      
      // Disparar eventos
      const inputEvent = new Event('input', { bubbles: true });
      messageInput.dispatchEvent(inputEvent);
      
      // Enviar mensagem
      setTimeout(() => {
        const sendButton = document.querySelector('[data-testid="compose-btn-send"]');
        if (sendButton) {
          sendButton.click();
        }
      }, 500);
    }
  }

  isNewContact(contactInfo) {
    // Verificar se é um contato novo (primeira mensagem)
    // Esta é uma implementação simplificada
    return !this.respondedContacts.has(contactInfo.phone);
  }

  updateAutomationStatus() {
    const content = document.querySelector('.automation-content');
    const toggleLabel = document.querySelector('.toggle-label');
    
    if (content) {
      content.classList.toggle('disabled', !this.isActive);
    }
    
    if (toggleLabel) {
      toggleLabel.textContent = this.isActive ? 'Ativado' : 'Desativado';
    }

    console.log(`🤖 Auto Responder ${this.isActive ? 'ATIVADO' : 'DESATIVADO'}`);
  }

  saveAutomationSettings() {
    const settings = {
      enabled: this.isActive,
      welcomeMessage: document.getElementById('welcomeMessage')?.value || '',
      afterHoursMessage: document.getElementById('afterHoursMessage')?.value || '',
      businessHours: {
        start: document.getElementById('businessStart')?.value || '09:00',
        end: document.getElementById('businessEnd')?.value || '18:00',
        weekdays: Array.from(document.querySelectorAll('.weekday-option input:checked')).map(cb => parseInt(cb.value))
      }
    };

    console.log('💾 Salvando configurações de automação:', settings);
    
    // Salvar no backend
    this.saveSettingsToBackend(settings);
    
    this.showNotification('Configurações salvas com sucesso!', 'success');
  }

  testAutomation() {
    const testMessage = 'Olá! Gostaria de saber sobre preços.';
    const response = this.findAutomaticResponse(testMessage);
    
    if (response) {
      alert(`Teste de Automação:\n\nMensagem: "${testMessage}"\nResposta: "${response}"`);
    } else {
      alert('Nenhuma resposta automática encontrada para esta mensagem.');
    }
  }

  async saveSettingsToBackend(settings) {
    try {
      // Aqui integraria com o backend
      console.log('🔄 Enviando configurações para o backend:', settings);
    } catch (error) {
      console.error('❌ Erro ao salvar configurações:', error);
    }
  }

  showNotification(message, type) {
    if (this.crm.showNotification) {
      this.crm.showNotification(message, type);
    } else {
      console.log(`${type.toUpperCase()}: ${message}`);
    }
  }

  destroy() {
    if (this.messageObserver) {
      this.messageObserver.disconnect();
      this.messageObserver = null;
    }
    
    this.respondedContacts.clear();
    this.isActive = false;
  }
}

// Disponibilizar globalmente
window.AutoResponder = AutoResponder;