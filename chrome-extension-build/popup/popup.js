// BotNinja 3.0 - Popup Script
// Interface principal da IA para WhatsApp

class BotNinjaPopup {
  constructor() {
    this.currentConfig = null;
    this.activeCompany = null;
    this.init();
  }

  async init() {
    await this.loadConfig();
    this.setupEventListeners();
    this.updateUI();
    this.checkWhatsAppStatus();
  }

  async loadConfig() {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'getConfig' });
      if (response.success) {
        this.currentConfig = response.data;
        this.activeCompany = this.currentConfig.companies[this.currentConfig.activeCompany];
      }
    } catch (error) {
      console.error('Erro ao carregar configuração:', error);
    }
  }

  setupEventListeners() {
    // Botões principais
    document.getElementById('configBotBtn').addEventListener('click', () => this.showBotConfig());
    document.getElementById('trainAiBtn').addEventListener('click', () => this.showTrainAI());
    document.getElementById('knowledgeBaseBtn').addEventListener('click', () => this.showKnowledgeBase());
    document.getElementById('simulateBtn').addEventListener('click', () => this.showSimulate());
    document.getElementById('reportsBtn').addEventListener('click', () => this.showReports());

    // Navegação rápida
    document.getElementById('aiChatBtn').addEventListener('click', () => this.openAIChat());
    document.getElementById('massDispatchBtn').addEventListener('click', () => this.openMassDispatch());
    document.getElementById('crmKanbanBtn').addEventListener('click', () => this.openCRMKanban());
    document.getElementById('agendaBtn').addEventListener('click', () => this.openAgenda());

    // Modal Nova Empresa
    document.getElementById('newCompanyForm').addEventListener('submit', (e) => this.handleNewCompany(e));
    document.getElementById('closeNewCompanyModal').addEventListener('click', () => this.hideModal('newCompanyModal'));
    document.getElementById('cancelNewCompany').addEventListener('click', () => this.hideModal('newCompanyModal'));

    // Modal Seleção de Empresa
    document.getElementById('closeSwitchModal').addEventListener('click', () => this.hideModal('switchCompanyModal'));

    // Modal Configurações
    document.getElementById('closeSettingsModal').addEventListener('click', () => this.hideModal('settingsModal'));

    // Tabs de configurações
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
    });

    // Footer links
    document.getElementById('helpBtn').addEventListener('click', () => this.openHelp());
    document.getElementById('feedbackBtn').addEventListener('click', () => this.openFeedback());
    document.getElementById('versionBtn').addEventListener('click', () => this.showVersionInfo());
  }

  updateUI() {
    if (this.activeCompany) {
      document.getElementById('companyName').textContent = this.activeCompany.name;
      document.getElementById('companyPhone').textContent = this.activeCompany.phone;
      this.updateStats();
      this.updateScheduledMessages();
    } else {
      document.getElementById('companyName').textContent = 'Nenhuma empresa selecionada';
      document.getElementById('companyPhone').textContent = 'Clique para criar uma empresa';
    }
  }

  updateStats() {
    if (!this.activeCompany) return;

    const crmData = this.activeCompany.crmData;
    
    // Contatos
    const totalContacts = Object.keys(crmData.contacts || {}).length;
    document.getElementById('totalContacts').textContent = totalContacts;

    // Negócios ativos
    const activeDeals = Object.values(crmData.deals || {}).filter(deal => 
      deal.stage !== 'closed' && deal.stage !== 'lost'
    ).length;
    document.getElementById('activeDeals').textContent = activeDeals;

    // Mensagens hoje (mock)
    document.getElementById('todayMessages').textContent = Math.floor(Math.random() * 50);

    // Taxa de conversão (mock)
    const conversionRate = activeDeals > 0 ? Math.floor((activeDeals / totalContacts) * 100) : 0;
    document.getElementById('conversionRate').textContent = `${conversionRate}%`;
  }

  updateScheduledMessages() {
    const scheduledMessages = this.currentConfig.scheduledMessages?.filter(msg => 
      msg.status === 'pending' && msg.companyId === this.currentConfig.activeCompany
    ) || [];

    const scheduledSection = document.getElementById('scheduledSection');
    const scheduledList = document.getElementById('scheduledList');

    if (scheduledMessages.length > 0) {
      scheduledSection.style.display = 'block';
      scheduledList.innerHTML = '';

      scheduledMessages.forEach(msg => {
        const scheduleDate = new Date(msg.scheduleTime);
        const item = document.createElement('div');
        item.className = 'scheduled-item';
        item.innerHTML = `
          <div class="scheduled-info">
            <div class="scheduled-time">${scheduleDate.toLocaleString('pt-BR')}</div>
            <div class="scheduled-preview">${msg.message.substring(0, 30)}...</div>
          </div>
        `;
        scheduledList.appendChild(item);
      });
    } else {
      scheduledSection.style.display = 'none';
    }
  }

  async checkWhatsAppStatus() {
    try {
      const tabs = await chrome.tabs.query({ url: 'https://web.whatsapp.com/*' });
      const statusIndicator = document.getElementById('statusIndicator');
      const statusDot = statusIndicator.querySelector('.status-dot');
      const statusText = statusIndicator.querySelector('.status-text');

      if (tabs.length > 0) {
        statusDot.classList.remove('disconnected');
        statusText.textContent = 'WhatsApp Conectado';
      } else {
        statusDot.classList.add('disconnected');
        statusText.textContent = 'WhatsApp Desconectado';
      }
    } catch (error) {
      console.error('Erro ao verificar status do WhatsApp:', error);
    }
  }

  showCompanySelector() {
    const modal = document.getElementById('switchCompanyModal');
    const companiesList = document.getElementById('companiesList');
    
    companiesList.innerHTML = '';

    Object.values(this.currentConfig.companies || {}).forEach(company => {
      const item = document.createElement('div');
      item.className = `company-item ${company.id === this.currentConfig.activeCompany ? 'active' : ''}`;
      item.innerHTML = `
        <div class="company-item-info">
          <h4>${company.name}</h4>
          <p>${company.phone}</p>
        </div>
        <div class="company-item-status ${company.id === this.currentConfig.activeCompany ? 'active' : ''}">
          ${company.id === this.currentConfig.activeCompany ? 'Ativa' : 'Inativa'}
        </div>
      `;
      
      item.addEventListener('click', () => this.switchCompany(company.id));
      companiesList.appendChild(item);
    });

    this.showModal('switchCompanyModal');
  }

  async switchCompany(companyId) {
    try {
      await chrome.runtime.sendMessage({ 
        action: 'switchCompany', 
        companyId 
      });
      
      this.currentConfig.activeCompany = companyId;
      this.activeCompany = this.currentConfig.companies[companyId];
      
      this.updateUI();
      this.hideModal('switchCompanyModal');
      
      this.showNotification('Empresa alternada com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao alternar empresa:', error);
      this.showNotification('Erro ao alternar empresa', 'error');
    }
  }

  showNewCompanyModal() {
    document.getElementById('newCompanyForm').reset();
    this.showModal('newCompanyModal');
  }

  async handleNewCompany(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const companyData = {
      name: document.getElementById('companyNameInput').value,
      phone: document.getElementById('companyPhoneInput').value,
      segment: document.getElementById('companySegmentInput').value
    };

    try {
      const response = await chrome.runtime.sendMessage({ 
        action: 'createCompany', 
        companyData 
      });
      
      if (response.success) {
        await this.loadConfig();
        this.updateUI();
        this.hideModal('newCompanyModal');
        this.showNotification('Empresa criada com sucesso!', 'success');
      }
    } catch (error) {
      console.error('Erro ao criar empresa:', error);
      this.showNotification('Erro ao criar empresa', 'error');
    }
  }

  showSettingsModal() {
    this.showModal('settingsModal');
    this.loadSettingsTab('general');
  }

  switchTab(tabName) {
    // Atualizar botões das tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Carregar conteúdo da tab
    this.loadSettingsTab(tabName);
  }

  loadSettingsTab(tabName) {
    const content = document.getElementById('settingsContent');
    
    switch (tabName) {
      case 'general':
        content.innerHTML = this.getGeneralSettingsHTML();
        break;
      case 'automation':
        content.innerHTML = this.getAutomationSettingsHTML();
        break;
      case 'buttons':
        content.innerHTML = this.getButtonsSettingsHTML();
        break;
      case 'labels':
        content.innerHTML = this.getLabelsSettingsHTML();
        break;
    }
  }

  getGeneralSettingsHTML() {
    return `
      <div class="settings-section">
        <h4>Configurações Gerais</h4>
        <div class="form-group">
          <label>
            <input type="checkbox" id="autoSaveEnabled" ${this.currentConfig.globalSettings?.autoSave ? 'checked' : ''}>
            Salvamento automático
          </label>
        </div>
        <div class="form-group">
          <label>
            <input type="checkbox" id="notificationsEnabled" ${this.currentConfig.globalSettings?.notifications ? 'checked' : ''}>
            Notificações
          </label>
        </div>
        <div class="form-group">
          <label for="themeSelect">Tema</label>
          <select id="themeSelect">
            <option value="light" ${this.currentConfig.globalSettings?.theme === 'light' ? 'selected' : ''}>Claro</option>
            <option value="dark" ${this.currentConfig.globalSettings?.theme === 'dark' ? 'selected' : ''}>Escuro</option>
            <option value="auto" ${this.currentConfig.globalSettings?.theme === 'auto' ? 'selected' : ''}>Automático</option>
          </select>
        </div>
      </div>
    `;
  }

  getAutomationSettingsHTML() {
    const autoResponder = this.activeCompany?.settings?.autoResponder || {};
    
    return `
      <div class="settings-section">
        <h4>Autorresposta</h4>
        <div class="form-group">
          <label>
            <input type="checkbox" id="autoResponderEnabled" ${autoResponder.enabled ? 'checked' : ''}>
            Ativar autorresposta
          </label>
        </div>
        <div class="form-group">
          <label for="welcomeMessage">Mensagem de boas-vindas</label>
          <textarea id="welcomeMessage" rows="3" placeholder="Olá! Obrigado por entrar em contato...">${autoResponder.welcomeMessage || ''}</textarea>
        </div>
        <div class="form-group">
          <label>Horário de funcionamento</label>
          <div style="display: flex; gap: 10px;">
            <input type="time" id="businessStart" value="${autoResponder.businessHours?.start || '09:00'}">
            <span>até</span>
            <input type="time" id="businessEnd" value="${autoResponder.businessHours?.end || '18:00'}">
          </div>
        </div>
      </div>
    `;
  }

  getButtonsSettingsHTML() {
    const quickButtons = this.activeCompany?.settings?.quickButtons || [];
    
    let buttonsHTML = quickButtons.map((button, index) => `
      <div class="button-item">
        <input type="text" placeholder="Texto do botão" value="${button.text}" data-index="${index}" data-field="text">
        <input type="text" placeholder="Mensagem" value="${button.value}" data-index="${index}" data-field="value">
        <button type="button" onclick="removeButton(${index})">🗑️</button>
      </div>
    `).join('');

    return `
      <div class="settings-section">
        <h4>Botões Rápidos</h4>
        <div id="buttonsContainer">
          ${buttonsHTML}
        </div>
        <button type="button" id="addButtonBtn" class="btn-secondary">+ Adicionar Botão</button>
      </div>
    `;
  }

  getLabelsSettingsHTML() {
    const labels = this.activeCompany?.settings?.labels || [];
    
    let labelsHTML = labels.map((label, index) => `
      <div class="label-item">
        <input type="text" placeholder="Nome da etiqueta" value="${label.name}" data-index="${index}" data-field="name">
        <input type="color" value="${label.color}" data-index="${index}" data-field="color">
        <button type="button" onclick="removeLabel(${index})">🗑️</button>
      </div>
    `).join('');

    return `
      <div class="settings-section">
        <h4>Etiquetas</h4>
        <div id="labelsContainer">
          ${labelsHTML}
        </div>
        <button type="button" id="addLabelBtn" class="btn-secondary">+ Adicionar Etiqueta</button>
      </div>
    `;
  }

  // Navegação rápida
  async openCRM() {
    await this.openWhatsAppAndNotify('showCRM');
  }

  async openAutomation() {
    await this.openWhatsAppAndNotify('showAutomation');
  }

  async openMassMessage() {
    await this.openWhatsAppAndNotify('showMassMessage');
  }

  async openSchedule() {
    await this.openWhatsAppAndNotify('showSchedule');
  }

  async openWhatsAppAndNotify(action) {
    try {
      let tabs = await chrome.tabs.query({ url: 'https://web.whatsapp.com/*' });
      
      if (tabs.length === 0) {
        // Abrir nova aba do WhatsApp
        const tab = await chrome.tabs.create({ url: 'https://web.whatsapp.com' });
        
        // Aguardar carregamento
        setTimeout(() => {
          chrome.tabs.sendMessage(tab.id, { action });
        }, 3000);
      } else {
        // Focar na aba existente e enviar comando
        await chrome.tabs.update(tabs[0].id, { active: true });
        chrome.tabs.sendMessage(tabs[0].id, { action });
      }
      
      window.close();
    } catch (error) {
      console.error('Erro ao abrir WhatsApp:', error);
    }
  }

  async exportData() {
    if (!this.activeCompany) {
      this.showNotification('Selecione uma empresa primeiro', 'error');
      return;
    }

    try {
      const response = await chrome.runtime.sendMessage({ 
        action: 'exportData', 
        companyId: this.activeCompany.id 
      });
      
      if (response.success) {
        const dataStr = JSON.stringify(response.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `empresas-web-${this.activeCompany.name}-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        this.showNotification('Dados exportados com sucesso!', 'success');
      }
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      this.showNotification('Erro ao exportar dados', 'error');
    }
  }

  importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        const text = await file.text();
        const data = JSON.parse(text);
        
        // Validar estrutura dos dados
        if (data.companyInfo && data.contacts) {
          // Processar importação
          this.showNotification('Dados importados com sucesso!', 'success');
        } else {
          throw new Error('Formato de arquivo inválido');
        }
      } catch (error) {
        console.error('Erro ao importar dados:', error);
        this.showNotification('Erro ao importar dados', 'error');
      }
    };
    
    input.click();
  }

  // Utilitários
  showModal(modalId) {
    document.getElementById(modalId).classList.add('active');
  }

  hideModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
  }

  showNotification(message, type = 'info') {
    // Implementar sistema de notificações
    console.log(`${type.toUpperCase()}: ${message}`);
  }

  openHelp() {
    chrome.tabs.create({ url: 'https://empresasweb.com.br/help' });
  }

  openFeedback() {
    chrome.tabs.create({ url: 'https://empresasweb.com.br/feedback' });
  }

  showVersionInfo() {
    this.showNotification('Empresas Web CRM v2.0.0', 'info');
  }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  new EmpresasWebPopup();
});