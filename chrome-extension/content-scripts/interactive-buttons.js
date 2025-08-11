// Empresas Web - Interactive Buttons
// Sistema de botões interativos para clientes e agentes

class InteractiveButtons {
  constructor(crmInstance) {
    this.crm = crmInstance;
    this.buttonTemplates = {};
    this.activeButtons = new Map();
    
    this.init();
  }

  init() {
    console.log('🎛️ Inicializando Interactive Buttons...');
    this.loadButtonTemplates();
    this.setupButtonSystem();
    this.injectButtonInterface();
  }

  loadButtonTemplates() {
    // Templates de botões predefinidos para diferentes cenários
    this.buttonTemplates = {
      'initial_contact': {
        title: 'Primeiro Contato',
        buttons: [
          { id: 'services', text: '📋 Nossos Serviços', type: 'info' },
          { id: 'quote', text: '💰 Solicitar Orçamento', type: 'action' },
          { id: 'schedule', text: '📅 Agendar Reunião', type: 'action' },
          { id: 'faq', text: '❓ Dúvidas Frequentes', type: 'info' }
        ]
      },
      'quote_request': {
        title: 'Solicitação de Orçamento',
        buttons: [
          { id: 'company_opening', text: '🏢 Abertura de Empresa', type: 'service' },
          { id: 'accounting', text: '📊 Serviços Contábeis', type: 'service' },
          { id: 'tax_planning', text: '📈 Planejamento Tributário', type: 'service' },
          { id: 'payroll', text: '👥 Folha de Pagamento', type: 'service' },
          { id: 'other', text: '📝 Outro Serviço', type: 'input' }
        ]
      },
      'scheduling': {
        title: 'Agendamento',
        buttons: [
          { id: 'morning', text: '🌅 Manhã (9h-12h)', type: 'time' },
          { id: 'afternoon', text: '☀️ Tarde (13h-17h)', type: 'time' },
          { id: 'next_week', text: '📅 Próxima Semana', type: 'time' },
          { id: 'custom_time', text: '⏰ Outro Horário', type: 'input' }
        ]
      },
      'feedback': {
        title: 'Avaliação do Atendimento',
        buttons: [
          { id: 'excellent', text: '😍 Excelente', type: 'rating' },
          { id: 'good', text: '😊 Bom', type: 'rating' },
          { id: 'average', text: '😐 Regular', type: 'rating' },
          { id: 'poor', text: '😞 Ruim', type: 'rating' },
          { id: 'comment', text: '💬 Deixar Comentário', type: 'input' }
        ]
      },
      'support': {
        title: 'Suporte Técnico',
        buttons: [
          { id: 'urgent', text: '🚨 Urgente', type: 'priority' },
          { id: 'normal', text: '⏱️ Normal', type: 'priority' },
          { id: 'question', text: '❓ Dúvida', type: 'category' },
          { id: 'problem', text: '⚠️ Problema', type: 'category' }
        ]
      }
    };

    console.log('✅ Templates de botões carregados:', Object.keys(this.buttonTemplates).length);
  }

  setupButtonSystem() {
    // Configurar sistema de botões interativos no painel de agendamento
    const schedulePanel = document.getElementById('schedule-panel');
    if (!schedulePanel) return;

    schedulePanel.innerHTML = `
      <div class="interactive-buttons-container">
        <div class="buttons-header">
          <h3>Sistema de Botões Interativos</h3>
          <div class="buttons-controls">
            <button class="ew-btn-primary" id="createButtonSet">
              <span>➕</span> Criar Conjunto de Botões
            </button>
            <button class="ew-btn-secondary" id="testButtons">
              <span>🧪</span> Testar Botões
            </button>
          </div>
        </div>

        <div class="button-templates">
          <h4>Templates Disponíveis</h4>
          <div class="templates-grid">
            ${Object.entries(this.buttonTemplates).map(([key, template]) => `
              <div class="template-card" data-template="${key}">
                <h5>${template.title}</h5>
                <div class="template-buttons">
                  ${template.buttons.slice(0, 3).map(btn => `
                    <span class="template-button-preview">${btn.text}</span>
                  `).join('')}
                  ${template.buttons.length > 3 ? '<span class="more-buttons">+' + (template.buttons.length - 3) + '</span>' : ''}
                </div>
                <div class="template-actions">
                  <button class="use-template-btn" data-template="${key}">
                    Usar Template
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="active-button-sets">
          <h4>Conjuntos Ativos</h4>
          <div class="active-sets-list" id="activeSetsList">
            <!-- Conjuntos ativos serão inseridos aqui -->
          </div>
        </div>

        <div class="button-analytics">
          <h4>Analytics dos Botões</h4>
          <div class="analytics-grid">
            <div class="analytics-card">
              <h5>Cliques Hoje</h5>
              <span class="analytics-number" id="clicksToday">0</span>
            </div>
            <div class="analytics-card">
              <h5>Taxa de Interação</h5>
              <span class="analytics-number" id="interactionRate">0%</span>
            </div>
            <div class="analytics-card">
              <h5>Botão Mais Clicado</h5>
              <span class="analytics-text" id="topButton">-</span>
            </div>
            <div class="analytics-card">
              <h5>Conversões</h5>
              <span class="analytics-number" id="conversions">0</span>
            </div>
          </div>
        </div>

        <div class="button-customizer" id="buttonCustomizer" style="display: none;">
          <h4>Personalizar Botões</h4>
          <form id="buttonCustomizerForm">
            <div class="ew-form-group">
              <label>Nome do Conjunto</label>
              <input type="text" id="buttonSetName" placeholder="Ex: Atendimento Inicial">
            </div>
            
            <div class="ew-form-group">
              <label>Descrição</label>
              <textarea id="buttonSetDescription" rows="2" placeholder="Descreva quando usar este conjunto de botões"></textarea>
            </div>

            <div class="buttons-builder" id="buttonsBuilder">
              <div class="buttons-builder-header">
                <h5>Botões</h5>
                <button type="button" class="ew-btn-secondary" id="addButton">
                  <span>➕</span> Adicionar Botão
                </button>
              </div>
              <div class="buttons-list" id="buttonsList">
                <!-- Botões serão inseridos aqui -->
              </div>
            </div>

            <div class="customizer-actions">
              <button type="button" class="ew-btn-secondary" id="cancelCustomizer">
                Cancelar
              </button>
              <button type="submit" class="ew-btn-primary">
                Salvar Conjunto
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    this.setupButtonEvents();
  }

  setupButtonEvents() {
    const container = document.querySelector('.interactive-buttons-container');
    if (!container) return;

    // Criar conjunto de botões
    const createBtn = document.getElementById('createButtonSet');
    if (createBtn) {
      createBtn.addEventListener('click', () => {
        this.showButtonCustomizer();
      });
    }

    // Testar botões
    const testBtn = document.getElementById('testButtons');
    if (testBtn) {
      testBtn.addEventListener('click', () => {
        this.testButtonSystem();
      });
    }

    // Usar template
    container.addEventListener('click', (e) => {
      if (e.target.classList.contains('use-template-btn')) {
        const templateKey = e.target.dataset.template;
        this.useTemplate(templateKey);
      }
    });

    // Eventos do customizador
    this.setupCustomizerEvents();
  }

  setupCustomizerEvents() {
    const form = document.getElementById('buttonCustomizerForm');
    if (!form) return;

    // Adicionar botão
    const addBtn = document.getElementById('addButton');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        this.addButtonToBuilder();
      });
    }

    // Cancelar
    const cancelBtn = document.getElementById('cancelCustomizer');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        this.hideButtonCustomizer();
      });
    }

    // Salvar
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveCustomButtonSet();
    });
  }

  showButtonCustomizer() {
    const customizer = document.getElementById('buttonCustomizer');
    if (customizer) {
      customizer.style.display = 'block';
      this.addButtonToBuilder(); // Adicionar primeiro botão automaticamente
    }
  }

  hideButtonCustomizer() {
    const customizer = document.getElementById('buttonCustomizer');
    if (customizer) {
      customizer.style.display = 'none';
      
      // Limpar formulário
      document.getElementById('buttonCustomizerForm').reset();
      document.getElementById('buttonsList').innerHTML = '';
    }
  }

  addButtonToBuilder() {
    const buttonsList = document.getElementById('buttonsList');
    if (!buttonsList) return;

    const buttonIndex = buttonsList.children.length;
    const buttonItem = document.createElement('div');
    buttonItem.className = 'button-builder-item';
    buttonItem.innerHTML = `
      <div class="button-config">
        <div class="ew-form-group">
          <label>Texto do Botão</label>
          <input type="text" class="button-text" placeholder="Ex: 📋 Nossos Serviços">
        </div>
        <div class="ew-form-group">
          <label>Tipo</label>
          <select class="button-type">
            <option value="info">Informativo</option>
            <option value="action">Ação</option>
            <option value="service">Serviço</option>
            <option value="input">Entrada de Dados</option>
            <option value="rating">Avaliação</option>
            <option value="priority">Prioridade</option>
          </select>
        </div>
        <div class="ew-form-group">
          <label>Resposta Automática</label>
          <textarea class="button-response" rows="2" placeholder="Mensagem enviada quando o botão for clicado"></textarea>
        </div>
        <div class="ew-form-group">
          <label>Ação Adicional</label>
          <select class="button-action">
            <option value="none">Nenhuma</option>
            <option value="schedule">Agendar Reunião</option>
            <option value="transfer">Transferir Atendimento</option>
            <option value="form">Abrir Formulário</option>
            <option value="link">Abrir Link</option>
          </select>
        </div>
        <button type="button" class="remove-button-btn" onclick="this.parentElement.parentElement.remove()">
          🗑️ Remover
        </button>
      </div>
    `;

    buttonsList.appendChild(buttonItem);
  }

  useTemplate(templateKey) {
    const template = this.buttonTemplates[templateKey];
    if (!template) return;

    this.showButtonCustomizer();
    
    // Preencher dados do template
    document.getElementById('buttonSetName').value = template.title;
    document.getElementById('buttonSetDescription').value = `Conjunto baseado no template: ${template.title}`;
    
    // Limpar lista atual
    document.getElementById('buttonsList').innerHTML = '';
    
    // Adicionar botões do template
    template.buttons.forEach(button => {
      this.addButtonToBuilder();
      const lastItem = document.getElementById('buttonsList').lastElementChild;
      lastItem.querySelector('.button-text').value = button.text;
      lastItem.querySelector('.button-type').value = button.type;
      
      // Definir resposta baseada no tipo de botão
      const responses = {
        'services': 'Oferecemos diversos serviços contábeis. Em que posso ajudá-lo?',
        'quote': 'Para fazer um orçamento preciso, preciso de algumas informações sobre seu projeto.',
        'schedule': 'Vou verificar nossa agenda. Qual seria o melhor horário para você?',
        'faq': 'Aqui estão algumas dúvidas frequentes que podem ajudar.',
        'company_opening': 'Abertura de empresa é nossa especialidade! Vamos começar?',
        'accounting': 'Nossos serviços contábeis são completos. Quer saber mais?',
        'excellent': 'Muito obrigado pela avaliação! Ficamos felizes em atendê-lo.',
        'urgent': 'Entendi que é urgente. Vou priorizar seu atendimento.'
      };
      
      const response = responses[button.id] || `Obrigado por clicar em "${button.text}". Como posso ajudá-lo?`;
      lastItem.querySelector('.button-response').value = response;
    });
  }

  saveCustomButtonSet() {
    const formData = this.collectButtonSetData();
    if (!formData) return;

    // Salvar conjunto
    const setId = `custom_${Date.now()}`;
    this.activeButtons.set(setId, formData);
    
    console.log('✅ Conjunto de botões salvo:', formData);
    
    // Atualizar lista de conjuntos ativos
    this.updateActiveSetsList();
    
    // Ocultar customizador
    this.hideButtonCustomizer();
    
    this.showNotification('Conjunto de botões criado com sucesso!', 'success');
  }

  collectButtonSetData() {
    const name = document.getElementById('buttonSetName').value;
    const description = document.getElementById('buttonSetDescription').value;
    
    if (!name.trim()) {
      alert('Por favor, digite um nome para o conjunto de botões.');
      return null;
    }

    const buttonItems = document.querySelectorAll('.button-builder-item');
    const buttons = Array.from(buttonItems).map((item, index) => {
      const text = item.querySelector('.button-text').value;
      const type = item.querySelector('.button-type').value;
      const response = item.querySelector('.button-response').value;
      const action = item.querySelector('.button-action').value;
      
      if (!text.trim()) {
        alert(`Por favor, digite o texto para o botão ${index + 1}.`);
        return null;
      }
      
      return {
        id: `btn_${index}`,
        text: text.trim(),
        type,
        response: response.trim(),
        action: action === 'none' ? null : action
      };
    }).filter(btn => btn !== null);

    if (buttons.length === 0) {
      alert('Adicione pelo menos um botão ao conjunto.');
      return null;
    }

    return {
      name: name.trim(),
      description: description.trim(),
      buttons,
      created_at: new Date().toISOString(),
      active: true
    };
  }

  updateActiveSetsList() {
    const list = document.getElementById('activeSetsList');
    if (!list) return;

    if (this.activeButtons.size === 0) {
      list.innerHTML = '<p class="no-sets">Nenhum conjunto de botões ativo.</p>';
      return;
    }

    list.innerHTML = Array.from(this.activeButtons.entries()).map(([setId, setData]) => `
      <div class="active-set-card" data-set-id="${setId}">
        <div class="set-header">
          <h5>${setData.name}</h5>
          <div class="set-status ${setData.active ? 'active' : 'inactive'}">
            ${setData.active ? 'Ativo' : 'Inativo'}
          </div>
        </div>
        <p class="set-description">${setData.description || 'Sem descrição'}</p>
        <div class="set-buttons-preview">
          ${setData.buttons.slice(0, 3).map(btn => `
            <span class="button-preview">${btn.text}</span>
          `).join('')}
          ${setData.buttons.length > 3 ? '<span class="more-preview">+' + (setData.buttons.length - 3) + '</span>' : ''}
        </div>
        <div class="set-actions">
          <button class="set-action-btn" data-action="send" data-set-id="${setId}">
            📤 Enviar para Cliente
          </button>
          <button class="set-action-btn" data-action="edit" data-set-id="${setId}">
            ✏️ Editar
          </button>
          <button class="set-action-btn" data-action="toggle" data-set-id="${setId}">
            ${setData.active ? '⏸️ Desativar' : '▶️ Ativar'}
          </button>
          <button class="set-action-btn" data-action="delete" data-set-id="${setId}">
            🗑️ Excluir
          </button>
        </div>
      </div>
    `).join('');

    // Configurar eventos das ações
    list.addEventListener('click', (e) => {
      if (e.target.classList.contains('set-action-btn')) {
        const action = e.target.dataset.action;
        const setId = e.target.dataset.setId;
        this.handleSetAction(action, setId);
      }
    });
  }

  handleSetAction(action, setId) {
    const setData = this.activeButtons.get(setId);
    if (!setData) return;

    switch (action) {
      case 'send':
        this.sendButtonSetToClient(setId);
        break;
      case 'edit':
        this.editButtonSet(setId);
        break;
      case 'toggle':
        setData.active = !setData.active;
        this.updateActiveSetsList();
        break;
      case 'delete':
        if (confirm(`Tem certeza que deseja excluir o conjunto "${setData.name}"?`)) {
          this.activeButtons.delete(setId);
          this.updateActiveSetsList();
        }
        break;
    }
  }

  sendButtonSetToClient(setId) {
    const setData = this.activeButtons.get(setId);
    if (!setData) return;

    // Criar mensagem com botões interativos
    const buttonMessage = this.createButtonMessage(setData);
    
    // Inserir na conversa
    this.insertButtonMessage(buttonMessage);
    
    console.log('📤 Conjunto de botões enviado para cliente:', setData.name);
    this.showNotification(`Botões "${setData.name}" enviados para o cliente!`, 'success');
  }

  createButtonMessage(setData) {
    let message = `${setData.name}\n\n`;
    if (setData.description) {
      message += `${setData.description}\n\n`;
    }
    
    message += 'Escolha uma opção:\n\n';
    
    setData.buttons.forEach((button, index) => {
      message += `${index + 1}️⃣ ${button.text}\n`;
    });
    
    message += '\nDigite o número da opção desejada.';
    
    return message;
  }

  insertButtonMessage(message) {
    const messageInput = document.querySelector('[data-testid="conversation-compose-box-input"]');
    if (messageInput) {
      messageInput.textContent = message;
      
      const inputEvent = new Event('input', { bubbles: true });
      messageInput.dispatchEvent(inputEvent);
      
      setTimeout(() => {
        const sendButton = document.querySelector('[data-testid="compose-btn-send"]');
        if (sendButton) {
          sendButton.click();
        }
      }, 500);
    }
  }

  testButtonSystem() {
    // Simular teste do sistema de botões
    const testData = {
      name: 'Teste do Sistema',
      description: 'Conjunto de teste para validar funcionalidades',
      buttons: [
        { id: 'test1', text: '🧪 Teste 1', type: 'info', response: 'Resposta de teste 1' },
        { id: 'test2', text: '🔬 Teste 2', type: 'action', response: 'Resposta de teste 2' }
      ]
    };

    const testMessage = this.createButtonMessage(testData);
    
    alert(`Prévia do Sistema de Botões:\n\n${testMessage}`);
  }

  injectButtonInterface() {
    // Injetar interface de botões interativos no WhatsApp (lado direito)
    if (document.getElementById('ew-interactive-buttons-panel')) return;

    const panel = document.createElement('div');
    panel.id = 'ew-interactive-buttons-panel';
    panel.className = 'ew-buttons-panel';
    panel.innerHTML = `
      <div class="buttons-panel-header">
        <h4>Botões Interativos</h4>
        <button class="panel-toggle" id="toggleButtonsPanel">−</button>
      </div>
      <div class="buttons-panel-content" id="buttonsPanelContent">
        <div class="quick-buttons-section">
          <h5>Ações Rápidas</h5>
          <div class="quick-buttons-grid">
            <button class="quick-button" data-action="initial_contact">
              👋 Primeiro Contato
            </button>
            <button class="quick-button" data-action="quote_request">
              💰 Solicitar Orçamento
            </button>
            <button class="quick-button" data-action="scheduling">
              📅 Agendamento
            </button>
            <button class="quick-button" data-action="feedback">
              ⭐ Feedback
            </button>
          </div>
        </div>
      </div>
    `;

    // Inserir painel
    document.body.appendChild(panel);
    
    // Configurar eventos do painel
    this.setupPanelEvents(panel);
    
    console.log('✅ Interface de botões interativos injetada');
  }

  setupPanelEvents(panel) {
    // Toggle do painel
    const toggleBtn = panel.querySelector('#toggleButtonsPanel');
    const content = panel.querySelector('#buttonsPanelContent');
    
    if (toggleBtn && content) {
      toggleBtn.addEventListener('click', () => {
        const isVisible = content.style.display !== 'none';
        content.style.display = isVisible ? 'none' : 'block';
        toggleBtn.textContent = isVisible ? '+' : '−';
      });
    }

    // Botões rápidos
    panel.addEventListener('click', (e) => {
      if (e.target.classList.contains('quick-button')) {
        const templateKey = e.target.dataset.action;
        this.sendQuickButtonSet(templateKey);
      }
    });
  }

  sendQuickButtonSet(templateKey) {
    const template = this.buttonTemplates[templateKey];
    if (!template) return;

    const message = this.createButtonMessage(template);
    this.insertButtonMessage(message);
    
    console.log('⚡ Botões rápidos enviados:', template.title);
  }

  showNotification(message, type) {
    if (this.crm.showNotification) {
      this.crm.showNotification(message, type);
    } else {
      console.log(`${type.toUpperCase()}: ${message}`);
    }
  }

  destroy() {
    // Limpar recursos
    this.activeButtons.clear();
    
    // Remover painel injetado
    const panel = document.getElementById('ew-interactive-buttons-panel');
    if (panel) {
      panel.remove();
    }
  }
}

// Disponibilizar globalmente
window.InteractiveButtons = InteractiveButtons;