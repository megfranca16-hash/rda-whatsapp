// BotNinja 3.0 - Chrome Extension Background Script
// IA para WhatsApp com automação completa

class BotNinjaBackground {
  constructor() {
    this.setupEventListeners();
    this.initializeStorage();
  }

  setupEventListeners() {
    // Instalação da extensão
    chrome.runtime.onInstalled.addListener((details) => {
      if (details.reason === 'install') {
        this.handleFirstInstall();
      }
    });

    // Comunicação com content scripts
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.handleMessage(request, sender, sendResponse);
      return true; // Keep message channel open for async response
    });

    // Alarmes para agendamento de mensagens
    chrome.alarms.onAlarm.addListener((alarm) => {
      this.handleScheduledMessage(alarm);
    });

    // Atualização de tabs
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status === 'complete' && tab.url?.includes('web.whatsapp.com')) {
        this.injectCRMInterface(tabId);
      }
    });
  }

  async initializeStorage() {
    const defaultConfig = {
      companies: {},
      activeCompany: null,
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
      },
      automationRules: [],
      quickButtons: [],
      scheduledMessages: [],
      massMessageCampaigns: []
    };

    try {
      const stored = await chrome.storage.local.get(['empresasWebConfig']);
      if (!stored.empresasWebConfig) {
        await chrome.storage.local.set({ empresasWebConfig: defaultConfig });
      }
    } catch (error) {
      console.error('Erro ao inicializar storage:', error);
    }
  }

  async handleFirstInstall() {
    // Criar notificação de boas-vindas
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: 'BotNinja 3.0 Instalado!',
      message: 'Abra o WhatsApp Web para começar a vender no piloto automático com IA!'
    });

    // Abrir página do BotNinja
    chrome.tabs.create({
      url: 'https://botninja.com.br/'
    });
  }

  async handleMessage(request, sender, sendResponse) {
    try {
      switch (request.action) {
        case 'getConfig':
          const config = await this.getStoredConfig();
          sendResponse({ success: true, data: config });
          break;

        case 'updateConfig':
          await this.updateConfig(request.config);
          sendResponse({ success: true });
          break;

        case 'scheduleMessage':
          await this.scheduleMessage(request.data);
          sendResponse({ success: true });
          break;

        case 'createCompany':
          await this.createCompany(request.companyData);
          sendResponse({ success: true });
          break;

        case 'switchCompany':
          await this.switchActiveCompany(request.companyId);
          sendResponse({ success: true });
          break;

        case 'saveCRMData':
          await this.saveCRMData(request.data);
          sendResponse({ success: true });
          break;

        case 'exportData':
          const exportData = await this.exportCompanyData(request.companyId);
          sendResponse({ success: true, data: exportData });
          break;

        default:
          sendResponse({ success: false, error: 'Ação não reconhecida' });
      }
    } catch (error) {
      console.error('Erro no background script:', error);
      sendResponse({ success: false, error: error.message });
    }
  }

  async scheduleMessage(messageData) {
    const { scheduleTime, message, contacts, companyId } = messageData;
    
    // Criar alarme
    const alarmName = `scheduled_${Date.now()}_${companyId}`;
    chrome.alarms.create(alarmName, { when: scheduleTime });

    // Salvar dados da mensagem
    const config = await this.getStoredConfig();
    config.scheduledMessages.push({
      id: alarmName,
      message,
      contacts,
      companyId,
      scheduleTime,
      status: 'pending'
    });

    await this.updateConfig(config);
  }

  async handleScheduledMessage(alarm) {
    if (!alarm.name.startsWith('scheduled_')) return;

    try {
      const config = await this.getStoredConfig();
      const messageData = config.scheduledMessages.find(m => m.id === alarm.name);
      
      if (messageData) {
        // Notificar content script para enviar mensagem
        const tabs = await chrome.tabs.query({ url: 'https://web.whatsapp.com/*' });
        
        if (tabs.length > 0) {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: 'sendScheduledMessage',
            data: messageData
          });
        }

        // Atualizar status
        messageData.status = 'sent';
        await this.updateConfig(config);
      }
    } catch (error) {
      console.error('Erro ao processar mensagem agendada:', error);
    }
  }

  async createCompany(companyData) {
    const config = await this.getStoredConfig();
    const companyId = `company_${Date.now()}`;
    
    config.companies[companyId] = {
      id: companyId,
      name: companyData.name,
      phone: companyData.phone,
      settings: {
        autoResponder: {
          enabled: false,
          welcomeMessage: '',
          businessHours: { start: '09:00', end: '18:00' },
          weekdays: [1, 2, 3, 4, 5]
        },
        quickButtons: [
          { text: '📋 Abertura de Empresa', action: 'send_message', value: 'Olá! Vou te ajudar com a abertura da sua empresa.' },
          { text: '💰 Dúvidas Contábeis', action: 'send_message', value: 'Posso esclarecer suas dúvidas contábeis!' },
          { text: '👥 RH e Folha', action: 'send_message', value: 'Vamos resolver suas questões de RH e folha de pagamento.' },
          { text: '📊 Impostos', action: 'send_message', value: 'Te ajudo com questões tributárias e impostos.' }
        ],
        labels: [
          { id: 'hot_lead', name: 'Lead Quente', color: '#EF4444' },
          { id: 'warm_lead', name: 'Lead Morno', color: '#F97316' },
          { id: 'cold_lead', name: 'Lead Frio', color: '#3B82F6' },
          { id: 'client', name: 'Cliente', color: '#10B981' },
          { id: 'prospect', name: 'Prospect', color: '#8B5CF6' }
        ],
        signatures: {
          default: '\n\n---\n📞 Empresas Web\n🌐 www.empresasweb.com.br\n📧 contato@empresasweb.com.br'
        }
      },
      crmData: {
        contacts: {},
        conversations: {},
        deals: {},
        campaigns: []
      },
      createdAt: new Date().toISOString()
    };

    // Se for a primeira empresa, torná-la ativa
    if (!config.activeCompany) {
      config.activeCompany = companyId;
    }

    await this.updateConfig(config);
    return companyId;
  }

  async switchActiveCompany(companyId) {
    const config = await this.getStoredConfig();
    config.activeCompany = companyId;
    await this.updateConfig(config);

    // Notificar todas as abas do WhatsApp sobre a mudança
    const tabs = await chrome.tabs.query({ url: 'https://web.whatsapp.com/*' });
    tabs.forEach(tab => {
      chrome.tabs.sendMessage(tab.id, {
        action: 'companyChanged',
        companyId: companyId
      });
    });
  }

  async saveCRMData(data) {
    const config = await this.getStoredConfig();
    const companyId = config.activeCompany;
    
    if (companyId && config.companies[companyId]) {
      Object.assign(config.companies[companyId].crmData, data);
      await this.updateConfig(config);
    }
  }

  async exportCompanyData(companyId) {
    const config = await this.getStoredConfig();
    const company = config.companies[companyId];
    
    if (!company) {
      throw new Error('Empresa não encontrada');
    }

    return {
      companyInfo: {
        name: company.name,
        phone: company.phone,
        exportDate: new Date().toISOString()
      },
      contacts: company.crmData.contacts,
      conversations: company.crmData.conversations,
      deals: company.crmData.deals,
      campaigns: company.crmData.campaigns
    };
  }

  async injectCRMInterface(tabId) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId },
        function: () => {
          // Verificar se a interface já foi injetada
          if (!window.empresasWebCRM) {
            window.empresasWebCRM = { initialized: true };
            
            // Disparar evento de inicialização
            window.dispatchEvent(new CustomEvent('empresasWebCRMInit'));
          }
        }
      });
    } catch (error) {
      console.error('Erro ao injetar interface CRM:', error);
    }
  }

  async getStoredConfig() {
    const result = await chrome.storage.local.get(['empresasWebConfig']);
    return result.empresasWebConfig || {};
  }

  async updateConfig(config) {
    await chrome.storage.local.set({ empresasWebConfig: config });
  }
}

// Inicializar background script
new EmpresasWebBackground();