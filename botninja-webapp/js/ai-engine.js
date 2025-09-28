// BotNinja AI Engine
// Sistema de Inteligência Artificial para conversas automatizadas

class AIEngine {
  constructor() {
    this.isInitialized = false;
    this.activeBot = null;
    this.conversationContext = new Map();
    this.knowledgeBase = new Map();
    this.responsePatterns = new Map();
    this.metrics = {
      totalResponses: 0,
      successfulQualifications: 0,
      scheduledMeetings: 0,
      conversions: 0
    };
    
    this.initializeAI();
  }

  // Inicializar sistema de IA
  async initializeAI() {
    try {
      console.log('🧠 Inicializando BotNinja AI Engine...');
      
      // Carregar configuração e bot ativo
      await this.loadActiveBot();
      
      // Inicializar base de conhecimento padrão
      this.initializeKnowledgeBase();
      
      // Inicializar padrões de resposta
      this.initializeResponsePatterns();
      
      // Configurar event listeners
      this.setupEventListeners();
      
      this.isInitialized = true;
      console.log('✅ AI Engine inicializado com sucesso');
      
    } catch (error) {
      console.error('❌ Erro ao inicializar AI Engine:', error);
    }
  }

  // Carregar bot ativo
  async loadActiveBot() {
    const config = await window.BotNinjaStorage.getConfig();
    
    if (config.activeBot && config.bots[config.activeBot]) {
      this.activeBot = config.bots[config.activeBot];
      console.log(`🤖 Bot ativo carregado: ${this.activeBot.name}`);
    } else {
      // Criar bot padrão se não existir
      const botId = await this.createDefaultBot();
      await window.BotNinjaStorage.switchActiveBot(botId);
      await this.loadActiveBot();
    }
  }

  // Criar bot padrão
  async createDefaultBot() {
    return await window.BotNinjaStorage.createBot({
      name: 'IA Personalizada',
      description: 'Assistente inteligente para WhatsApp'
    });
  }

  // Inicializar base de conhecimento
  initializeKnowledgeBase() {
    const defaultKnowledge = [
      {
        category: 'saudacao',
        keywords: ['oi', 'olá', 'ola', 'bom dia', 'boa tarde', 'boa noite', 'hey', 'e aí'],
        responses: [
          'Olá! 👋 Sou a IA do BotNinja. Como posso ajudar você hoje?',
          'Oi! 😊 É um prazer falar com você. Em que posso ser útil?',
          'Olá! Bem-vindo(a)! Estou aqui para ajudar. O que você precisa?'
        ]
      },
      {
        category: 'servicos',
        keywords: ['serviço', 'serviços', 'produto', 'produtos', 'oferece', 'fazem', 'trabalham'],
        responses: [
          'Oferecemos soluções de automação com IA para WhatsApp! 🤖\n\n• Atendimento automático 24/7\n• Qualificação de leads\n• Agendamento automático\n• Disparo em massa\n\nGostaria de saber mais sobre algum desses serviços?',
          'Nossa especialidade é transformar seu WhatsApp em uma máquina de vendas! 🚀\n\nCom nossa IA você pode:\n✅ Atender clientes automaticamente\n✅ Qualificar leads inteligentemente\n✅ Agendar reuniões sem intervenção\n✅ Fazer campanhas segmentadas\n\nQual te interessa mais?'
        ]
      },
      {
        category: 'preco',
        keywords: ['preço', 'preco', 'valor', 'custa', 'investimento', 'plano', 'planos'],
        responses: [
          'Nossos planos são super acessíveis! 💰\n\n📋 **Plano Starter**: R$ 197/mês\n🚀 **Plano Profissional**: R$ 297/mês\n⭐ **Plano Empresarial**: R$ 497/mês\n\nTodos incluem:\n• IA treinada para seu negócio\n• Suporte completo\n• Resultados garantidos\n\nQual plano faz mais sentido para você?',
          'Temos opções para todos os tamanhos de negócio! 📊\n\nDesde R$ 197/mês você já pode:\n✅ Automatizar seu atendimento\n✅ Qualificar leads 24/7\n✅ Aumentar suas vendas\n\nQuer que eu te ajude a escolher o plano ideal?'
        ]
      },
      {
        category: 'agendamento',
        keywords: ['agendar', 'reunião', 'reuniao', 'conversar', 'demonstração', 'demo', 'apresentação'],
        responses: [
          'Perfeito! Vou agendar uma demonstração personalizada para você! 📅\n\nPreciso de algumas informações:\n\n1️⃣ Qual o melhor dia da semana?\n2️⃣ Prefere manhã ou tarde?\n3️⃣ Qual seu WhatsApp para confirmar?\n\nEm 30 minutos você vai ver como nossa IA pode revolucionar seu negócio!',
          'Ótima escolha! 🎯\n\nVamos agendar uma conversa exclusiva onde você vai ver:\n• Como funciona na prática\n• Resultados de outros clientes\n• Configuração personalizada\n\nMe fala qual o melhor horário para você esta semana?'
        ]
      },
      {
        category: 'despedida',
        keywords: ['tchau', 'obrigado', 'obrigada', 'valeu', 'até logo', 'bye', 'falou'],
        responses: [
          'Foi um prazer ajudar! 😊 Estou sempre aqui quando precisar. Tenha um ótimo dia! 🌟',
          'Obrigado pelo contato! 🙏 Qualquer dúvida, é só chamar. Sucesso sempre! 🚀',
          'Até breve! 👋 Lembre-se: nossa IA está sempre pronta para ajudar seus clientes 24/7! 🤖'
        ]
      },
      {
        category: 'duvida',
        keywords: ['não entendi', 'nao entendi', 'como assim', 'explica', 'dúvida', 'duvida'],
        responses: [
          'Claro! Deixe-me explicar melhor... 💡\n\nO BotNinja é uma IA que:\n• Responde seus clientes automaticamente\n• Qualifica quem realmente tem interesse\n• Agenda reuniões sozinha\n• Funciona 24 horas por dia\n\nÉ como ter um vendedor que nunca dorme! 😴\n\nFicou mais claro? Quer que eu detalhe alguma parte?',
          'Sem problemas! Vou ser mais específico... 🎯\n\nImagine que você está dormindo e um cliente manda mensagem às 2h da manhã. Nossa IA:\n\n1️⃣ Responde na hora\n2️⃣ Descobre o que ele quer\n3️⃣ Agenda uma reunião\n4️⃣ Te entrega o lead qualificado\n\nTudo automático! Entendeu a mágica? ✨'
        ]
      }
    ];

    defaultKnowledge.forEach(knowledge => {
      this.knowledgeBase.set(knowledge.category, knowledge);
    });
  }

  // Inicializar padrões de resposta
  initializeResponsePatterns() {
    const patterns = [
      {
        pattern: /\b(oi|olá|ola|hey|e aí)\b/i,
        category: 'saudacao',
        confidence: 0.9
      },
      {
        pattern: /\b(preço|preco|valor|custa|investimento|plano)\b/i,
        category: 'preco',
        confidence: 0.8
      },
      {
        pattern: /\b(agendar|reunião|reuniao|demo|demonstração)\b/i,
        category: 'agendamento',
        confidence: 0.85
      },
      {
        pattern: /\b(serviço|serviços|produto|produtos|oferece)\b/i,
        category: 'servicos',
        confidence: 0.8
      },
      {
        pattern: /\b(tchau|obrigado|obrigada|valeu|até logo)\b/i,
        category: 'despedida',
        confidence: 0.9
      },
      {
        pattern: /\b(não entendi|nao entendi|como assim|explica|dúvida|duvida)\b/i,
        category: 'duvida',
        confidence: 0.7
      }
    ];

    patterns.forEach((pattern, index) => {
      this.responsePatterns.set(`pattern_${index}`, pattern);
    });
  }

  // Configurar event listeners
  setupEventListeners() {
    // Escutar mensagens do WhatsApp
    window.addEventListener('whatsapp:message:received', (event) => {
      this.handleIncomingMessage(event.detail);
    });

    // Escutar mudanças de bot
    window.addEventListener('botninja:storage:changed', (event) => {
      if (event.detail.key === 'botChanged') {
        this.loadActiveBot();
      }
    });
  }

  // Processar mensagem recebida
  async handleIncomingMessage(messageData) {
    if (!this.isInitialized || !this.activeBot) {
      console.log('IA não está pronta para processar mensagens');
      return;
    }

    try {
      console.log('🧠 Processando mensagem:', messageData);

      // Gerar resposta da IA
      const response = await this.generateResponse(messageData);

      // Simular delay humano
      await this.simulateTyping(1000 + Math.random() * 2000);

      // Enviar resposta
      if (response) {
        await this.sendResponse(messageData.from, response);
        
        // Atualizar métricas
        this.updateMetrics('response_sent');
        
        // Salvar contexto da conversa
        await this.saveConversationContext(messageData.from, messageData, response);
      }

    } catch (error) {
      console.error('Erro ao processar mensagem:', error);
    }
  }

  // Gerar resposta inteligente
  async generateResponse(messageData) {
    const message = messageData.message.toLowerCase();
    const phoneNumber = messageData.from;

    // Obter contexto da conversa
    const context = this.getConversationContext(phoneNumber);
    
    // Analisar intent da mensagem
    const intent = this.analyzeIntent(message);
    
    // Gerar resposta baseada no intent
    let response = this.generateResponseFromIntent(intent, context);
    
    // Personalizar resposta se necessário
    response = this.personalizeResponse(response, context);
    
    // Log da IA
    console.log(`🎯 Intent detectado: ${intent.category} (${intent.confidence})`);
    console.log(`💬 Resposta gerada: ${response.substring(0, 50)}...`);
    
    return response;
  }

  // Analisar intenção da mensagem
  analyzeIntent(message) {
    let bestMatch = { category: 'default', confidence: 0 };
    
    // Verificar padrões conhecidos
    for (const [key, pattern] of this.responsePatterns) {
      if (pattern.pattern.test(message)) {
        if (pattern.confidence > bestMatch.confidence) {
          bestMatch = {
            category: pattern.category,
            confidence: pattern.confidence
          };
        }
      }
    }
    
    // Se não encontrou padrão específico, usar análise de palavras-chave
    if (bestMatch.confidence < 0.5) {
      bestMatch = this.analyzeKeywords(message);
    }
    
    return bestMatch;
  }

  // Analisar palavras-chave
  analyzeKeywords(message) {
    let bestMatch = { category: 'default', confidence: 0 };
    
    for (const [category, knowledge] of this.knowledgeBase) {
      let matchCount = 0;
      
      knowledge.keywords.forEach(keyword => {
        if (message.includes(keyword)) {
          matchCount++;
        }
      });
      
      const confidence = matchCount / knowledge.keywords.length;
      
      if (confidence > bestMatch.confidence) {
        bestMatch = { category, confidence };
      }
    }
    
    return bestMatch;
  }

  // Gerar resposta baseada no intent
  generateResponseFromIntent(intent, context) {
    const knowledge = this.knowledgeBase.get(intent.category);
    
    if (knowledge && knowledge.responses.length > 0) {
      // Escolher resposta aleatória da categoria
      const randomIndex = Math.floor(Math.random() * knowledge.responses.length);
      return knowledge.responses[randomIndex];
    }
    
    // Resposta padrão se não encontrou categoria específica
    return this.getDefaultResponse(context);
  }

  // Obter resposta padrão
  getDefaultResponse(context) {
    const defaultResponses = [
      'Interessante! 🤔 Me conta mais sobre isso. Como posso ajudar você especificamente?',
      'Entendi! 👍 Vou ajudar você da melhor forma. Pode me dar mais detalhes sobre o que precisa?',
      'Perfeito! 🎯 Para te ajudar melhor, me fala qual é sua principal necessidade no momento?',
      'Que legal! 😊 Estou aqui para resolver sua demanda. O que você gostaria de saber sobre nossos serviços?'
    ];
    
    const randomIndex = Math.floor(Math.random() * defaultResponses.length);
    return defaultResponses[randomIndex];
  }

  // Personalizar resposta
  personalizeResponse(response, context) {
    // Adicionar nome se disponível
    if (context && context.name) {
      response = response.replace(/você/g, context.name);
    }
    
    // Adicionar contexto de conversa anterior se relevante
    if (context && context.lastCategory) {
      // Lógica para personalizar baseado no histórico
    }
    
    return response;
  }

  // Obter contexto da conversa
  getConversationContext(phoneNumber) {
    return this.conversationContext.get(phoneNumber) || {
      messages: [],
      name: null,
      lastCategory: null,
      stage: 'initial',
      interests: []
    };
  }

  // Salvar contexto da conversa
  async saveConversationContext(phoneNumber, incomingMessage, response) {
    let context = this.getConversationContext(phoneNumber);
    
    // Atualizar contexto
    context.messages.push({
      timestamp: new Date().toISOString(),
      incoming: incomingMessage.message,
      response: response,
      intent: this.analyzeIntent(incomingMessage.message.toLowerCase())
    });
    
    // Manter apenas últimas 10 mensagens
    if (context.messages.length > 10) {
      context.messages = context.messages.slice(-10);
    }
    
    // Salvar contexto
    this.conversationContext.set(phoneNumber, context);
    
    // Salvar no storage permanente
    await window.BotNinjaStorage.saveConversationData(phoneNumber, context);
  }

  // Simular digitação
  async simulateTyping(duration) {
    return new Promise(resolve => {
      setTimeout(resolve, duration);
    });
  }

  // Enviar resposta
  async sendResponse(phoneNumber, message) {
    try {
      // Usar WhatsApp Manager para enviar
      const result = await window.WhatsAppManager.sendMessage(phoneNumber, message);
      console.log('✅ Resposta enviada:', result);
      return result;
    } catch (error) {
      console.error('❌ Erro ao enviar resposta:', error);
      throw error;
    }
  }

  // Atualizar métricas
  async updateMetrics(action) {
    switch (action) {
      case 'response_sent':
        this.metrics.totalResponses++;
        break;
      case 'lead_qualified':
        this.metrics.successfulQualifications++;
        break;
      case 'meeting_scheduled':
        this.metrics.scheduledMeetings++;
        break;
      case 'conversion':
        this.metrics.conversions++;
        break;
    }
    
    // Salvar métricas
    await window.BotNinjaStorage.updateAIMetrics(this.metrics);
    
    // Disparar evento de atualização de métricas
    const event = new CustomEvent('ai:metrics:updated', {
      detail: this.metrics
    });
    window.dispatchEvent(event);
  }

  // Simular conversa (para demonstração)
  async simulateConversation(userMessage) {
    if (!this.isInitialized) {
      return 'IA não está inicializada';
    }

    const simulatedMessage = {
      id: `sim_${Date.now()}`,
      from: 'simulator',
      message: userMessage,
      timestamp: new Date().toISOString(),
      type: 'text'
    };

    // Processar mensagem
    const response = await this.generateResponse(simulatedMessage);
    
    // Atualizar métricas
    this.updateMetrics('response_sent');
    
    return response;
  }

  // Treinar IA com nova resposta
  async trainResponse(category, keywords, responses) {
    const knowledge = {
      category,
      keywords: Array.isArray(keywords) ? keywords : [keywords],
      responses: Array.isArray(responses) ? responses : [responses]
    };
    
    this.knowledgeBase.set(category, knowledge);
    
    // Salvar no storage
    const config = await window.BotNinjaStorage.getConfig();
    if (!config.bots[config.activeBot].settings.knowledgeBase.entries) {
      config.bots[config.activeBot].settings.knowledgeBase.entries = [];
    }
    
    config.bots[config.activeBot].settings.knowledgeBase.entries.push(knowledge);
    config.bots[config.activeBot].settings.knowledgeBase.lastUpdate = new Date().toISOString();
    
    await window.BotNinjaStorage.updateConfig(config);
    
    console.log(`✅ IA treinada para categoria: ${category}`);
  }

  // Obter métricas atuais
  getMetrics() {
    return { ...this.metrics };
  }

  // Verificar se IA está ativa
  isActive() {
    return this.isInitialized && this.activeBot && window.WhatsAppManager.isConnected();
  }
}

// Instância global do AI Engine
window.AIEngine = new AIEngine();