// Empresas Web - CRM Kanban
// Funcionalidade de Kanban/Pipeline CRM

class CRMKanban {
  constructor(crmInstance) {
    this.crm = crmInstance;
    this.deals = {};
    this.contacts = {};
    this.draggedElement = null;
    
    this.init();
  }

  init() {
    console.log('📊 Inicializando CRM Kanban...');
    this.loadKanbanData();
    this.setupKanbanBoard();
    this.setupEventListeners();
  }

  async loadKanbanData() {
    try {
      // Simular carregamento de dados por enquanto
      this.deals = {
        'deal1': {
          id: 'deal1',
          title: 'Abertura Empresa XYZ',
          value: 'R$ 2.500',
          contact: 'João Silva',
          phone: '+55 11 99999-9999',
          stage: 'lead',
          created_at: new Date().toISOString(),
          notes: 'Cliente interessado em abrir empresa de consultoria'
        },
        'deal2': {
          id: 'deal2', 
          title: 'Contabilidade Mensal - ABC Ltda',
          value: 'R$ 800/mês',
          contact: 'Maria Santos',
          phone: '+55 11 88888-8888',
          stage: 'contact',
          created_at: new Date().toISOString(),
          notes: 'Empresa já constituída, precisa de serviços contábeis'
        },
        'deal3': {
          id: 'deal3',
          title: 'Regularização Fiscal',
          value: 'R$ 1.200',
          contact: 'Pedro Costa',
          phone: '+55 11 77777-7777', 
          stage: 'proposal',
          created_at: new Date().toISOString(),
          notes: 'Problemas com FGTS e folha de pagamento'
        },
        'deal4': {
          id: 'deal4',
          title: 'Planejamento Tributário',
          value: 'R$ 5.000',
          contact: 'Ana Oliveira',
          phone: '+55 11 66666-6666',
          stage: 'negotiation', 
          created_at: new Date().toISOString(),
          notes: 'Grande empresa, potencial para outros serviços'
        }
      };

      console.log('✅ Dados do Kanban carregados:', Object.keys(this.deals).length, 'deals');
    } catch (error) {
      console.error('❌ Erro ao carregar dados do Kanban:', error);
    }
  }

  setupKanbanBoard() {
    const kanbanBoard = document.getElementById('kanban-board');
    if (!kanbanBoard) return;

    // Obter configuração de estágios
    const stages = this.crm.config?.crmConfig?.kanbanStages || [
      { id: 'lead', name: 'Leads', color: '#3B82F6' },
      { id: 'contact', name: 'Primeiro Contato', color: '#EAB308' },
      { id: 'proposal', name: 'Proposta', color: '#F97316' },
      { id: 'negotiation', name: 'Negociação', color: '#8B5CF6' },
      { id: 'closed', name: 'Fechado', color: '#10B981' },
      { id: 'lost', name: 'Perdido', color: '#EF4444' }
    ];

    // Construir HTML do Kanban
    kanbanBoard.innerHTML = stages.map(stage => {
      const stageDeals = Object.values(this.deals).filter(deal => deal.stage === stage.id);
      
      return `
        <div class="kanban-column" data-stage="${stage.id}">
          <div class="column-header" style="border-top-color: ${stage.color}">
            <h3>${stage.name}</h3>
            <span class="stage-count">${stageDeals.length}</span>
          </div>
          <div class="column-content" data-stage="${stage.id}">
            ${stageDeals.map(deal => this.createDealCard(deal)).join('')}
            <button class="add-deal-btn" data-stage="${stage.id}">
              <span>+</span> Adicionar Deal
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Configurar drag and drop
    this.setupDragAndDrop();
    
    console.log('✅ Kanban Board configurado');
  }

  createDealCard(deal) {
    const createdDate = new Date(deal.created_at).toLocaleDateString('pt-BR');
    
    return `
      <div class="kanban-card" data-deal-id="${deal.id}" draggable="true">
        <div class="card-header">
          <h4 class="card-title">${deal.title}</h4>
          <div class="card-value">${deal.value}</div>
        </div>
        <div class="card-info">
          <strong>${deal.contact}</strong><br>
          ${deal.phone}<br>
          ${deal.notes ? deal.notes.substring(0, 50) + '...' : ''}
        </div>
        <div class="card-footer">
          <div class="card-date">${createdDate}</div>
          <div class="card-actions">
            <button class="card-action-btn" data-action="edit" title="Editar">✏️</button>
            <button class="card-action-btn" data-action="whatsapp" title="WhatsApp">💬</button>
            <button class="card-action-btn" data-action="delete" title="Excluir">🗑️</button>
          </div>
        </div>
      </div>
    `;
  }

  setupDragAndDrop() {
    const kanbanBoard = document.getElementById('kanban-board');
    if (!kanbanBoard) return;

    // Eventos de drag para cards
    kanbanBoard.addEventListener('dragstart', (e) => {
      if (e.target.classList.contains('kanban-card')) {
        this.draggedElement = e.target;
        e.target.style.opacity = '0.5';
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', e.target.outerHTML);
      }
    });

    kanbanBoard.addEventListener('dragend', (e) => {
      if (e.target.classList.contains('kanban-card')) {
        e.target.style.opacity = '1';
        this.draggedElement = null;
      }
    });

    // Eventos de drop para colunas
    kanbanBoard.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      
      const column = e.target.closest('.column-content');
      if (column) {
        column.style.backgroundColor = '#f0f9ff';
        column.style.border = '2px dashed #3b82f6';
      }
    });

    kanbanBoard.addEventListener('dragleave', (e) => {
      const column = e.target.closest('.column-content');
      if (column) {
        column.style.backgroundColor = '';
        column.style.border = '';
      }
    });

    kanbanBoard.addEventListener('drop', (e) => {
      e.preventDefault();
      
      const column = e.target.closest('.column-content');
      if (column && this.draggedElement) {
        const newStage = column.dataset.stage;
        const dealId = this.draggedElement.dataset.dealId;
        
        // Remover estilos de destaque
        column.style.backgroundColor = '';
        column.style.border = '';
        
        // Mover o card
        this.moveDeal(dealId, newStage);
        
        // Recarregar o board
        this.setupKanbanBoard();
      }
    });
  }

  moveDeal(dealId, newStage) {
    if (this.deals[dealId]) {
      const oldStage = this.deals[dealId].stage;
      this.deals[dealId].stage = newStage;
      this.deals[dealId].updated_at = new Date().toISOString();
      
      console.log(`📊 Deal ${dealId} movido de ${oldStage} para ${newStage}`);
      
      // Salvar mudança no backend
      this.saveDealUpdate(dealId, { stage: newStage });
      
      // Mostrar notificação
      this.showNotification(`Deal movido para ${newStage}`, 'success');
    }
  }

  setupEventListeners() {
    const kanbanBoard = document.getElementById('kanban-board');
    if (!kanbanBoard) return;

    // Eventos dos botões de ação nos cards
    kanbanBoard.addEventListener('click', (e) => {
      if (e.target.classList.contains('card-action-btn')) {
        const action = e.target.dataset.action;
        const dealCard = e.target.closest('.kanban-card');
        const dealId = dealCard.dataset.dealId;
        
        this.handleCardAction(action, dealId);
      }
      
      // Botão adicionar deal
      if (e.target.closest('.add-deal-btn')) {
        const stage = e.target.closest('.add-deal-btn').dataset.stage;
        this.showAddDealModal(stage);
      }
    });

    // Clique duplo no card para editar
    kanbanBoard.addEventListener('dblclick', (e) => {
      const dealCard = e.target.closest('.kanban-card');
      if (dealCard) {
        const dealId = dealCard.dataset.dealId;
        this.showEditDealModal(dealId);
      }
    });
  }

  handleCardAction(action, dealId) {
    const deal = this.deals[dealId];
    if (!deal) return;

    switch (action) {
      case 'edit':
        this.showEditDealModal(dealId);
        break;
        
      case 'whatsapp':
        this.openWhatsAppChat(deal.phone, deal.contact);
        break;
        
      case 'delete':
        this.confirmDeleteDeal(dealId);
        break;
    }
  }

  openWhatsAppChat(phone, contactName) {
    // Limpar número de telefone
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Tentar encontrar conversa existente
    const chatItems = document.querySelectorAll('[data-testid="conversation"]');
    let foundChat = false;
    
    chatItems.forEach(chat => {
      const titleElement = chat.querySelector('[title]');
      if (titleElement && titleElement.title.includes(contactName)) {
        chat.click();
        foundChat = true;
      }
    });
    
    if (!foundChat) {
      console.log(`📱 Abrindo WhatsApp para ${contactName} (${phone})`);
      this.showNotification(`Procurando conversa com ${contactName}`, 'info');
    }
  }

  showAddDealModal(stage) {
    const modal = document.createElement('div');
    modal.className = 'ew-modal-overlay';
    modal.innerHTML = `
      <div class="ew-modal ew-add-deal-modal">
        <div class="ew-modal-header">
          <h3>Novo Deal</h3>
          <button class="ew-modal-close">&times;</button>
        </div>
        <form class="ew-modal-content" id="addDealForm">
          <div class="ew-form-group">
            <label>Título do Deal *</label>
            <input type="text" id="dealTitle" required placeholder="Ex: Abertura de Empresa">
          </div>
          <div class="ew-form-group">
            <label>Valor</label>
            <input type="text" id="dealValue" placeholder="Ex: R$ 2.500">
          </div>
          <div class="ew-form-group">
            <label>Nome do Contato *</label>
            <input type="text" id="dealContact" required placeholder="Ex: João Silva">
          </div>
          <div class="ew-form-group">
            <label>Telefone *</label>
            <input type="tel" id="dealPhone" required placeholder="Ex: +55 11 99999-9999">
          </div>
          <div class="ew-form-group">
            <label>Observações</label>
            <textarea id="dealNotes" rows="3" placeholder="Notas sobre o deal..."></textarea>
          </div>
          <div class="ew-form-actions">
            <button type="button" class="ew-btn-secondary" id="cancelDeal">Cancelar</button>
            <button type="submit" class="ew-btn-primary">Criar Deal</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    // Eventos
    const form = document.getElementById('addDealForm');
    const closeBtn = modal.querySelector('.ew-modal-close');
    const cancelBtn = document.getElementById('cancelDeal');

    const closeModal = () => modal.remove();

    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const dealData = {
        id: `deal_${Date.now()}`,
        title: document.getElementById('dealTitle').value,
        value: document.getElementById('dealValue').value || 'A negociar',
        contact: document.getElementById('dealContact').value,
        phone: document.getElementById('dealPhone').value,
        notes: document.getElementById('dealNotes').value,
        stage: stage,
        created_at: new Date().toISOString()
      };

      this.createDeal(dealData);
      closeModal();
    });
  }

  createDeal(dealData) {
    this.deals[dealData.id] = dealData;
    
    console.log('✅ Novo deal criado:', dealData);
    
    // Salvar no backend
    this.saveDeal(dealData);
    
    // Recarregar board
    this.setupKanbanBoard();
    
    this.showNotification('Deal criado com sucesso!', 'success');
  }

  async saveDeal(dealData) {
    try {
      // Aqui integraria com o backend API
      console.log('💾 Salvando deal no backend:', dealData);
    } catch (error) {
      console.error('❌ Erro ao salvar deal:', error);
    }
  }

  async saveDealUpdate(dealId, updates) {
    try {
      // Aqui integraria com o backend API
      console.log('💾 Atualizando deal no backend:', dealId, updates);
    } catch (error) {
      console.error('❌ Erro ao atualizar deal:', error);
    }
  }

  confirmDeleteDeal(dealId) {
    const deal = this.deals[dealId];
    if (!deal) return;

    if (confirm(`Tem certeza que deseja excluir o deal "${deal.title}"?`)) {
      delete this.deals[dealId];
      this.setupKanbanBoard();
      this.showNotification('Deal excluído', 'info');
      
      console.log('🗑️ Deal excluído:', dealId);
    }
  }

  showNotification(message, type) {
    // Usar sistema de notificação do CRM principal
    if (this.crm.showNotification) {
      this.crm.showNotification(message, type);
    } else {
      console.log(`${type.toUpperCase()}: ${message}`);
    }
  }

  // Métodos públicos para integração
  getDealsCount() {
    return Object.keys(this.deals).length;
  }

  getDealsCountByStage(stage) {
    return Object.values(this.deals).filter(deal => deal.stage === stage).length;
  }

  getActiveDealsCount() {
    return Object.values(this.deals).filter(deal => 
      !['closed', 'lost'].includes(deal.stage)
    ).length;
  }

  destroy() {
    // Limpar recursos
    this.deals = {};
    this.contacts = {};
    this.draggedElement = null;
  }
}

// Disponibilizar globalmente
window.CRMKanban = CRMKanban;