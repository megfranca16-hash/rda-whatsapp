// Empresas Web - Mass Sender
// Funcionalidade de envio em massa de mensagens

class MassSender {
  constructor(crmInstance) {
    this.crm = crmInstance;
    this.campaigns = {};
    this.isProcessing = false;
    this.currentCampaign = null;
    
    this.init();
  }

  init() {
    console.log('📢 Inicializando Mass Sender...');
    this.loadCampaigns();
    this.setupMassMessagePanel();
  }

  loadCampaigns() {
    // Carregar campanhas existentes (mock)
    this.campaigns = {
      'campaign1': {
        id: 'campaign1',
        title: 'Promoção Abertura de Empresa',
        message: 'Olá! Está precisando abrir sua empresa? Temos condições especiais neste mês! Entre em contato para saber mais.',
        recipients: ['+5511999999999', '+5511888888888', '+5511777777777'],
        status: 'completed',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        sent_count: 3,
        failed_count: 0
      }
    };
  }

  setupMassMessagePanel() {
    const panel = document.getElementById('mass-message-panel');
    if (!panel) return;

    panel.innerHTML = `
      <div class="mass-message-container">
        <div class="mass-message-header">
          <h3>Envio em Massa</h3>
          <button class="ew-btn-primary" id="newCampaignBtn">
            <span>📢</span> Nova Campanha
          </button>
        </div>

        <div class="campaigns-list" id="campaignsList">
          <div class="campaigns-grid">
            ${Object.values(this.campaigns).map(campaign => this.createCampaignCard(campaign)).join('')}
          </div>
        </div>

        <div class="mass-message-stats">
          <div class="stat-card">
            <h4>Total de Campanhas</h4>
            <span class="stat-number">${Object.keys(this.campaigns).length}</span>
          </div>
          <div class="stat-card">
            <h4>Mensagens Enviadas</h4>
            <span class="stat-number">${this.getTotalSentMessages()}</span>
          </div>
          <div class="stat-card">
            <h4>Taxa de Sucesso</h4>
            <span class="stat-number">${this.getSuccessRate()}%</span>
          </div>
        </div>

        <div class="recent-campaigns">
          <h4>Campanhas Recentes</h4>
          <div class="campaigns-table">
            ${this.createCampaignsTable()}
          </div>
        </div>
      </div>
    `;

    this.setupEventListeners();
  }

  createCampaignCard(campaign) {
    const statusColors = {
      pending: '#EAB308',
      processing: '#3B82F6', 
      completed: '#10B981',
      failed: '#EF4444'
    };

    const statusLabels = {
      pending: 'Pendente',
      processing: 'Processando',
      completed: 'Concluída',
      failed: 'Falhou'
    };

    return `
      <div class="campaign-card" data-campaign-id="${campaign.id}">
        <div class="campaign-header">
          <h4>${campaign.title}</h4>
          <span class="campaign-status" style="background-color: ${statusColors[campaign.status]}20; color: ${statusColors[campaign.status]}">
            ${statusLabels[campaign.status]}
          </span>
        </div>
        <div class="campaign-info">
          <div class="campaign-recipients">
            <span class="icon">👥</span>
            ${campaign.recipients.length} destinatários
          </div>
          <div class="campaign-sent">
            <span class="icon">✅</span>
            ${campaign.sent_count || 0} enviadas
          </div>
          ${campaign.failed_count > 0 ? `
            <div class="campaign-failed">
              <span class="icon">❌</span>
              ${campaign.failed_count} falharam
            </div>
          ` : ''}
        </div>
        <div class="campaign-preview">
          ${campaign.message.substring(0, 80)}...
        </div>
        <div class="campaign-actions">
          <button class="ew-btn-secondary campaign-action" data-action="view">Ver</button>
          <button class="ew-btn-secondary campaign-action" data-action="duplicate">Duplicar</button>
          ${campaign.status === 'pending' ? 
            `<button class="ew-btn-primary campaign-action" data-action="send">Enviar</button>` : 
            `<button class="ew-btn-secondary campaign-action" data-action="report">Relatório</button>`
          }
        </div>
      </div>
    `;
  }

  createCampaignsTable() {
    const campaigns = Object.values(this.campaigns).slice(-5); // Últimas 5
    
    return `
      <table class="campaigns-table">
        <thead>
          <tr>
            <th>Campanha</th>
            <th>Destinatários</th>
            <th>Enviadas</th>
            <th>Status</th>
            <th>Data</th>
          </tr>
        </thead>
        <tbody>
          ${campaigns.map(campaign => `
            <tr>
              <td>${campaign.title}</td>
              <td>${campaign.recipients.length}</td>
              <td>${campaign.sent_count || 0}</td>
              <td>
                <span class="status-badge status-${campaign.status}">
                  ${campaign.status}
                </span>
              </td>
              <td>${new Date(campaign.created_at).toLocaleDateString('pt-BR')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  setupEventListeners() {
    const panel = document.getElementById('mass-message-panel');
    if (!panel) return;

    // Nova campanha
    const newCampaignBtn = document.getElementById('newCampaignBtn');
    if (newCampaignBtn) {
      newCampaignBtn.addEventListener('click', () => {
        this.showNewCampaignModal();
      });
    }

    // Ações das campanhas
    panel.addEventListener('click', (e) => {
      if (e.target.classList.contains('campaign-action')) {
        const action = e.target.dataset.action;
        const campaignCard = e.target.closest('.campaign-card');
        const campaignId = campaignCard.dataset.campaignId;
        
        this.handleCampaignAction(action, campaignId);
      }
    });
  }

  showNewCampaignModal() {
    const modal = document.createElement('div');
    modal.className = 'ew-modal-overlay';
    modal.innerHTML = `
      <div class="ew-modal ew-campaign-modal large">
        <div class="ew-modal-header">
          <h3>Nova Campanha de Envio</h3>
          <button class="ew-modal-close">&times;</button>
        </div>
        <div class="ew-modal-content">
          <div class="campaign-form-container">
            <form id="newCampaignForm">
              <div class="ew-form-group">
                <label>Título da Campanha *</label>
                <input type="text" id="campaignTitle" required placeholder="Ex: Promoção Abertura de Empresa">
              </div>
              
              <div class="ew-form-group">
                <label>Mensagem *</label>
                <textarea id="campaignMessage" required rows="4" placeholder="Digite a mensagem que será enviada para todos os destinatários..."></textarea>
                <div class="message-counter">
                  <span id="messageLength">0</span>/1000 caracteres
                </div>
              </div>

              <div class="ew-form-group">
                <label>Tipo de Campanha</label>
                <select id="campaignType">
                  <option value="promotional">Promocional</option>
                  <option value="informational">Informativa</option>
                  <option value="follow_up">Follow-up</option>
                  <option value="event">Evento</option>
                  <option value="reminder">Lembrete</option>
                </select>
              </div>

              <div class="ew-form-group">
                <label>Destinatários *</label>
                <div class="recipients-input">
                  <textarea id="campaignRecipients" rows="4" placeholder="Digite os números separados por vírgula:
+55 11 99999-9999, +55 11 88888-8888, +55 11 77777-7777"></textarea>
                  <div class="recipients-help">
                    <small>
                      • Um número por linha ou separados por vírgula<br>
                      • Formato: +55 11 99999-9999<br>
                      • Máximo: 100 destinatários por campanha
                    </small>
                  </div>
                </div>
                <div class="recipients-actions">
                  <button type="button" id="importContactsBtn" class="ew-btn-secondary">
                    📥 Importar Contatos
                  </button>
                  <button type="button" id="validateRecipientsBtn" class="ew-btn-secondary">
                    ✅ Validar Números
                  </button>
                </div>
              </div>

              <div class="ew-form-group">
                <label>Agendamento</label>
                <div class="schedule-options">
                  <label class="radio-option">
                    <input type="radio" name="scheduleType" value="now" checked>
                    <span>Enviar agora</span>
                  </label>
                  <label class="radio-option">
                    <input type="radio" name="scheduleType" value="scheduled">
                    <span>Agendar envio</span>
                  </label>
                </div>
                <div class="schedule-datetime" id="scheduleDateTime" style="display: none;">
                  <input type="datetime-local" id="scheduleTime">
                </div>
              </div>

              <div class="ew-form-group">
                <label>Configurações Avançadas</label>
                <div class="advanced-options">
                  <label class="checkbox-option">
                    <input type="checkbox" id="addSignature" checked>
                    <span>Adicionar assinatura da empresa</span>
                  </label>
                  <label class="checkbox-option">
                    <input type="checkbox" id="respectDnd">
                    <span>Respeitar horário comercial</span>
                  </label>
                  <label class="checkbox-option">
                    <input type="checkbox" id="trackDelivery">
                    <span>Rastrear entrega das mensagens</span>
                  </label>
                </div>
              </div>

              <div class="campaign-preview" id="campaignPreview" style="display: none;">
                <h4>Prévia da Mensagem</h4>
                <div class="preview-message" id="previewMessage"></div>
              </div>
            </form>
          </div>
        </div>
        <div class="ew-modal-footer">
          <button type="button" class="ew-btn-secondary" id="previewBtn">
            👁️ Visualizar
          </button>
          <button type="button" class="ew-btn-secondary" id="cancelCampaign">
            Cancelar
          </button>
          <button type="submit" form="newCampaignForm" class="ew-btn-primary">
            📢 Criar Campanha
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    this.setupCampaignModalEvents(modal);
  }

  setupCampaignModalEvents(modal) {
    const form = document.getElementById('newCampaignForm');
    const closeBtn = modal.querySelector('.ew-modal-close');
    const cancelBtn = document.getElementById('cancelCampaign');
    const previewBtn = document.getElementById('previewBtn');
    const messageTextarea = document.getElementById('campaignMessage');
    const messageCounter = document.getElementById('messageLength');
    const scheduleRadios = modal.querySelectorAll('input[name="scheduleType"]');
    const scheduleDateTimeDiv = document.getElementById('scheduleDateTime');

    const closeModal = () => modal.remove();

    // Eventos de fechamento
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);

    // Contador de caracteres
    messageTextarea.addEventListener('input', () => {
      const length = messageTextarea.value.length;
      messageCounter.textContent = length;
      messageCounter.style.color = length > 1000 ? '#EF4444' : '#6B7280';
    });

    // Agendamento
    scheduleRadios.forEach(radio => {
      radio.addEventListener('change', () => {
        scheduleDateTimeDiv.style.display = radio.value === 'scheduled' ? 'block' : 'none';
      });
    });

    // Prévia
    previewBtn.addEventListener('click', () => {
      this.showCampaignPreview();
    });

    // Validar destinatários
    const validateBtn = document.getElementById('validateRecipientsBtn');
    if (validateBtn) {
      validateBtn.addEventListener('click', () => {
        this.validateRecipients();
      });
    }

    // Importar contatos
    const importBtn = document.getElementById('importContactsBtn');
    if (importBtn) {
      importBtn.addEventListener('click', () => {
        this.showContactImporter();
      });
    }

    // Submissão do formulário
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.createCampaign();
      closeModal();
    });
  }

  showCampaignPreview() {
    const messageText = document.getElementById('campaignMessage').value;
    const addSignature = document.getElementById('addSignature').checked;
    const preview = document.getElementById('campaignPreview');
    const previewMessage = document.getElementById('previewMessage');

    let finalMessage = messageText;
    
    if (addSignature && this.crm.activeCompany?.settings?.signatures?.default) {
      finalMessage += this.crm.activeCompany.settings.signatures.default;
    }

    previewMessage.innerHTML = finalMessage.replace(/\n/g, '<br>');
    preview.style.display = 'block';
  }

  validateRecipients() {
    const recipientsText = document.getElementById('campaignRecipients').value;
    const recipients = this.parseRecipients(recipientsText);
    
    const validRecipients = [];
    const invalidRecipients = [];
    
    recipients.forEach(recipient => {
      if (this.isValidPhoneNumber(recipient)) {
        validRecipients.push(recipient);
      } else {
        invalidRecipients.push(recipient);
      }
    });

    let message = `✅ ${validRecipients.length} números válidos`;
    if (invalidRecipients.length > 0) {
      message += `\n❌ ${invalidRecipients.length} números inválidos`;
    }

    alert(message);
  }

  parseRecipients(text) {
    return text
      .split(/[,\n]/)
      .map(phone => phone.trim())
      .filter(phone => phone.length > 0);
  }

  isValidPhoneNumber(phone) {
    // Regex básica para validar número brasileiro
    const phoneRegex = /^\+55\s?\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  createCampaign() {
    const form = document.getElementById('newCampaignForm');
    const formData = new FormData(form);
    
    const campaignData = {
      id: `campaign_${Date.now()}`,
      title: document.getElementById('campaignTitle').value,
      message: document.getElementById('campaignMessage').value,
      recipients: this.parseRecipients(document.getElementById('campaignRecipients').value),
      campaign_type: document.getElementById('campaignType').value,
      schedule_type: document.querySelector('input[name="scheduleType"]:checked').value,
      schedule_time: document.getElementById('scheduleTime').value,
      add_signature: document.getElementById('addSignature').checked,
      respect_dnd: document.getElementById('respectDnd').checked,
      track_delivery: document.getElementById('trackDelivery').checked,
      status: 'pending',
      created_at: new Date().toISOString(),
      sent_count: 0,
      failed_count: 0
    };

    // Adicionar assinatura se solicitado
    if (campaignData.add_signature && this.crm.activeCompany?.settings?.signatures?.default) {
      campaignData.message += this.crm.activeCompany.settings.signatures.default;
    }

    this.campaigns[campaignData.id] = campaignData;
    
    console.log('✅ Nova campanha criada:', campaignData);
    
    // Salvar no backend
    this.saveCampaign(campaignData);
    
    // Recarregar painel
    this.setupMassMessagePanel();
    
    // Se for envio imediato, processar
    if (campaignData.schedule_type === 'now') {
      this.processCampaign(campaignData.id);
    }

    this.showNotification('Campanha criada com sucesso!', 'success');
  }

  async processCampaign(campaignId) {
    const campaign = this.campaigns[campaignId];
    if (!campaign) return;

    this.isProcessing = true;
    this.currentCampaign = campaign;
    campaign.status = 'processing';

    console.log('📢 Processando campanha:', campaign.title);

    // Simular processamento
    try {
      for (let i = 0; i < campaign.recipients.length; i++) {
        const recipient = campaign.recipients[i];
        
        // Simular envio da mensagem
        await this.sendMessage(recipient, campaign.message);
        
        campaign.sent_count++;
        
        // Atualizar UI
        this.updateCampaignProgress(campaignId, i + 1, campaign.recipients.length);
        
        // Delay entre mensagens (evitar spam)
        await this.delay(2000);
      }
      
      campaign.status = 'completed';
      console.log('✅ Campanha concluída:', campaign.title);
      
    } catch (error) {
      console.error('❌ Erro no processamento:', error);
      campaign.status = 'failed';
      campaign.failed_count++;
    }

    this.isProcessing = false;
    this.currentCampaign = null;
    
    // Recarregar painel
    this.setupMassMessagePanel();
  }

  async sendMessage(recipient, message) {
    // Aqui integraria com o WhatsApp Web para envio real
    console.log(`📱 Enviando para ${recipient}:`, message.substring(0, 50) + '...');
    
    // Simular envio
    return new Promise(resolve => setTimeout(resolve, 1000));
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  handleCampaignAction(action, campaignId) {
    const campaign = this.campaigns[campaignId];
    if (!campaign) return;

    switch (action) {
      case 'view':
        this.showCampaignDetails(campaignId);
        break;
      case 'duplicate':
        this.duplicateCampaign(campaignId);
        break;
      case 'send':
        this.processCampaign(campaignId);
        break;
      case 'report':
        this.showCampaignReport(campaignId);
        break;
    }
  }

  async saveCampaign(campaignData) {
    try {
      // Aqui integraria com o backend
      console.log('💾 Salvando campanha no backend:', campaignData);
    } catch (error) {
      console.error('❌ Erro ao salvar campanha:', error);
    }
  }

  getTotalSentMessages() {
    return Object.values(this.campaigns).reduce((total, campaign) => {
      return total + (campaign.sent_count || 0);
    }, 0);
  }

  getSuccessRate() {
    const totalSent = this.getTotalSentMessages();
    const totalFailed = Object.values(this.campaigns).reduce((total, campaign) => {
      return total + (campaign.failed_count || 0);
    }, 0);
    
    const totalMessages = totalSent + totalFailed;
    return totalMessages > 0 ? Math.round((totalSent / totalMessages) * 100) : 100;
  }

  showNotification(message, type) {
    if (this.crm.showNotification) {
      this.crm.showNotification(message, type);
    } else {
      console.log(`${type.toUpperCase()}: ${message}`);
    }
  }

  destroy() {
    this.campaigns = {};
    this.isProcessing = false;
    this.currentCampaign = null;
  }
}

// Disponibilizar globalmente
window.MassSender = MassSender;