// BotNinja Storage System
// Substitui chrome.storage com localStorage e sessionStorage

class BotNinjaStorage {
  constructor() {
    this.prefix = 'botninja_';
    this.initializeDefaultConfig();
  }

  // Inicializar configuração padrão
  initializeDefaultConfig() {
    const defaultConfig = {
      bots: {},
      activeBot: null,
      globalSettings: {
        aiMode: 'intelligent',
        autoResponse: true,
        notifications: true,
        theme: 'botninja',
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
      massMessageCampaigns: [],
      whatsappConnection: {
        status: 'disconnected',
        qrCode: null,
        lastConnection: null
      },
      aiMetrics: {
        responsesToday: 0,
        leadsQualified: 0,
        meetingsScheduled: 0,
        conversions: 0,
        lastUpdate: new Date().toISOString()
      }
    };

    // Verificar se já existe configuração
    const existingConfig = this.get('config');
    if (!existingConfig) {
      this.set('config', defaultConfig);
    }
  }

  // Salvar dados no localStorage
  set(key, value) {
    try {
      const fullKey = this.prefix + key;
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(fullKey, serializedValue);
      
      // Disparar evento personalizado para notificar mudanças
      this.dispatchStorageEvent(key, value);
      
      return Promise.resolve({ success: true });
    } catch (error) {
      console.error('Erro ao salvar no storage:', error);
      return Promise.reject(error);
    }
  }

  // Recuperar dados do localStorage
  get(key) {
    try {
      const fullKey = this.prefix + key;
      const serializedValue = localStorage.getItem(fullKey);
      
      if (serializedValue === null) {
        return null;
      }
      
      return JSON.parse(serializedValue);
    } catch (error) {
      console.error('Erro ao recuperar do storage:', error);
      return null;
    }
  }

  // Remover dados do localStorage
  remove(key) {
    try {
      const fullKey = this.prefix + key;
      localStorage.removeItem(fullKey);
      
      this.dispatchStorageEvent(key, null);
      
      return Promise.resolve({ success: true });
    } catch (error) {
      console.error('Erro ao remover do storage:', error);
      return Promise.reject(error);
    }
  }

  // Limpar todos os dados do BotNinja
  clear() {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
      
      // Reinicializar configuração padrão
      this.initializeDefaultConfig();
      
      return Promise.resolve({ success: true });
    } catch (error) {
      console.error('Erro ao limpar storage:', error);
      return Promise.reject(error);
    }
  }

  // Obter configuração completa
  async getConfig() {
    return this.get('config') || {};
  }

  // Atualizar configuração
  async updateConfig(newConfig) {
    const currentConfig = await this.getConfig();
    const updatedConfig = { ...currentConfig, ...newConfig };
    return this.set('config', updatedConfig);
  }

  // Criar um novo bot IA
  async createBot(botData) {
    const config = await this.getConfig();
    const botId = `bot_${Date.now()}`;
    
    config.bots[botId] = {
      id: botId,
      name: botData.name,
      description: botData.description || '',
      settings: {
        autoResponder: {
          enabled: true,
          welcomeMessage: 'Olá! Sou a IA do ' + botData.name + '. Como posso ajudar?',
          businessHours: { start: '09:00', end: '18:00' },
          weekdays: [1, 2, 3, 4, 5]
        },
        quickButtons: [
          { text: '🤖 Sobre nossa IA', action: 'send_message', value: 'Nossa IA está sempre pronta para atender você!' },
          { text: '📋 Serviços', action: 'send_message', value: 'Conheça nossos serviços personalizados.' },
          { text: '📅 Agendar', action: 'send_message', value: 'Vamos agendar uma conversa?' },
          { text: '💬 Falar com humano', action: 'transfer_human', value: 'Transferindo para atendente humano...' }
        ],
        knowledgeBase: {
          entries: [],
          lastUpdate: new Date().toISOString()
        },
        personality: {
          tone: 'friendly',
          style: 'professional',
          responseLength: 'medium'
        }
      },
      aiData: {
        conversations: {},
        trainedResponses: {},
        metrics: {
          totalInteractions: 0,
          successfulQualifications: 0,
          scheduledMeetings: 0,
          conversions: 0
        }
      },
      createdAt: new Date().toISOString()
    };

    // Se for o primeiro bot, torná-lo ativo
    if (!config.activeBot) {
      config.activeBot = botId;
    }

    await this.updateConfig(config);
    return botId;
  }

  // Alternar bot ativo
  async switchActiveBot(botId) {
    const config = await this.getConfig();
    config.activeBot = botId;
    await this.updateConfig(config);
    
    // Disparar evento de mudança de bot
    this.dispatchStorageEvent('botChanged', { botId });
  }

  // Atualizar métricas da IA
  async updateAIMetrics(metrics) {
    const config = await this.getConfig();
    config.aiMetrics = {
      ...config.aiMetrics,
      ...metrics,
      lastUpdate: new Date().toISOString()
    };
    
    await this.updateConfig(config);
  }

  // Salvar dados de conversa
  async saveConversationData(conversationId, data) {
    const config = await this.getConfig();
    const activeBot = config.bots[config.activeBot];
    
    if (activeBot) {
      activeBot.aiData.conversations[conversationId] = {
        ...activeBot.aiData.conversations[conversationId],
        ...data,
        lastUpdate: new Date().toISOString()
      };
      
      await this.updateConfig(config);
    }
  }

  // Obter dados de conversas
  async getConversationData(conversationId) {
    const config = await this.getConfig();
    const activeBot = config.bots[config.activeBot];
    
    return activeBot?.aiData.conversations[conversationId] || null;
  }

  // Salvar campanha de disparo em massa
  async saveMassCampaign(campaignData) {
    const config = await this.getConfig();
    const campaignId = `campaign_${Date.now()}`;
    
    const campaign = {
      id: campaignId,
      ...campaignData,
      status: 'created',
      createdAt: new Date().toISOString(),
      stats: {
        sent: 0,
        delivered: 0,
        read: 0,
        responses: 0
      }
    };
    
    config.massMessageCampaigns.push(campaign);
    await this.updateConfig(config);
    
    return campaignId;
  }

  // Agendar mensagem
  async scheduleMessage(messageData) {
    const config = await this.getConfig();
    const messageId = `scheduled_${Date.now()}`;
    
    const scheduledMessage = {
      id: messageId,
      ...messageData,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    config.scheduledMessages.push(scheduledMessage);
    await this.updateConfig(config);
    
    return messageId;
  }

  // Atualizar status de conexão WhatsApp
  async updateWhatsAppConnection(status, qrCode = null) {
    const config = await this.getConfig();
    config.whatsappConnection = {
      status,
      qrCode,
      lastConnection: status === 'connected' ? new Date().toISOString() : config.whatsappConnection.lastConnection
    };
    
    await this.updateConfig(config);
    
    // Disparar evento de mudança de conexão
    this.dispatchStorageEvent('connectionChanged', { status, qrCode });
  }

  // Exportar dados do bot
  async exportBotData(botId) {
    const config = await this.getConfig();
    const bot = config.bots[botId];
    
    if (!bot) {
      throw new Error('Bot não encontrado');
    }

    return {
      botInfo: {
        name: bot.name,
        description: bot.description,
        exportDate: new Date().toISOString()
      },
      settings: bot.settings,
      conversations: bot.aiData.conversations,
      metrics: bot.aiData.metrics
    };
  }

  // Importar dados do bot
  async importBotData(botData) {
    const botId = await this.createBot({
      name: botData.botInfo.name + ' (Importado)',
      description: botData.botInfo.description
    });
    
    const config = await this.getConfig();
    const bot = config.bots[botId];
    
    // Mesclar dados importados
    bot.settings = { ...bot.settings, ...botData.settings };
    bot.aiData.conversations = botData.conversations || {};
    bot.aiData.metrics = botData.metrics || bot.aiData.metrics;
    
    await this.updateConfig(config);
    return botId;
  }

  // Disparar evento personalizado para mudanças no storage
  dispatchStorageEvent(key, data) {
    const event = new CustomEvent('botninja:storage:changed', {
      detail: { key, data }
    });
    window.dispatchEvent(event);
  }

  // Escutar mudanças no storage
  onStorageChange(callback) {
    window.addEventListener('botninja:storage:changed', (event) => {
      callback(event.detail.key, event.detail.data);
    });
  }

  // Método para debug - listar todas as chaves
  debug() {
    const keys = Object.keys(localStorage);
    const botNinjaKeys = keys.filter(key => key.startsWith(this.prefix));
    
    console.log('BotNinja Storage Keys:', botNinjaKeys);
    botNinjaKeys.forEach(key => {
      const value = localStorage.getItem(key);
      console.log(`${key}:`, JSON.parse(value));
    });
  }
}

// Instância global do storage
window.BotNinjaStorage = new BotNinjaStorage();