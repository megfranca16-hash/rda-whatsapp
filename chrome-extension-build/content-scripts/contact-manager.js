// Empresas Web - Contact Manager
// Sistema de gerenciamento de contatos integrado

class ContactManager {
  constructor(crmInstance) {
    this.crm = crmInstance;
    this.contacts = new Map();
    this.activeContact = null;
    this.contactsCache = {};
    
    this.init();
  }

  init() {
    console.log('👥 Inicializando Contact Manager...');
    this.loadContacts();
    this.setupContactTracking();
    this.injectContactInterface();
  }

  async loadContacts() {
    try {
      // Simular carregamento de contatos existentes
      const mockContacts = [
        {
          id: 'contact_1',
          name: 'João Silva',
          phone: '+55 11 99999-9999',
          email: 'joao@empresa.com',
          company: 'Silva & Associados',
          stage: 'lead',
          labels: ['hot_lead'],
          notes: 'Interessado em abrir empresa de consultoria',
          last_contact: new Date(Date.now() - 86400000).toISOString(),
          created_at: new Date(Date.now() - 259200000).toISOString(),
          whatsapp_id: '5511999999999@c.us'
        },
        {
          id: 'contact_2',
          name: 'Maria Santos',
          phone: '+55 11 88888-8888', 
          email: 'maria@comercio.com',
          company: 'Comércio Santos Ltda',
          stage: 'client',
          labels: ['client'],
          notes: 'Cliente ativo - serviços contábeis mensais',
          last_contact: new Date(Date.now() - 43200000).toISOString(),
          created_at: new Date(Date.now() - 2592000000).toISOString(),
          whatsapp_id: '5511888888888@c.us'
        }
      ];

      mockContacts.forEach(contact => {
        this.contacts.set(contact.id, contact);
        this.contactsCache[contact.whatsapp_id] = contact;
      });

      console.log('✅ Contatos carregados:', this.contacts.size);
    } catch (error) {
      console.error('❌ Erro ao carregar contatos:', error);
    }
  }

  setupContactTracking() {
    // Monitorar mudanças de conversa ativa
    this.trackActiveConversation();
    
    // Observer para novas mensagens
    this.setupMessageTracking();
    
    // Detectar novos contatos automaticamente
    this.detectNewContacts();
  }

  trackActiveConversation() {
    // Observer para mudanças no cabeçalho da conversa
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' || mutation.type === 'attributes') {
          this.updateActiveContact();
        }
      });
    });

    const header = document.querySelector('[data-testid="conversation-header"]');
    if (header) {
      observer.observe(header, { 
        childList: true, 
        subtree: true, 
        attributes: true,
        attributeFilter: ['title']
      });
    }
  }

  setupMessageTracking() {
    // Track mensagens para atualizar última interação
    const messagesObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              this.processMessageForContact(node);
            }
          });
        }
      });
    });

    const messagesContainer = document.querySelector('[data-testid="conversation-panel-messages"]');
    if (messagesContainer) {
      messagesObserver.observe(messagesContainer, { childList: true, subtree: true });
    }
  }

  detectNewContacts() {
    // Detectar novos contatos automaticamente
    setInterval(() => {
      this.scanForNewContacts();
    }, 10000); // A cada 10 segundos
  }

  updateActiveContact() {
    const contactInfo = this.extractCurrentContactInfo();
    if (!contactInfo) return;

    // Buscar contato existente
    let contact = this.findContactByPhone(contactInfo.phone) || 
                  this.findContactByName(contactInfo.name);

    if (!contact) {
      // Criar novo contato automaticamente
      contact = this.createNewContact(contactInfo);
    } else {
      // Atualizar dados existentes se necessário
      this.updateContactData(contact, contactInfo);
    }

    this.activeContact = contact;
    this.updateContactInterface();
    
    console.log('👤 Contato ativo:', contact.name);
  }

  extractCurrentContactInfo() {
    const conversationHeader = document.querySelector('[data-testid="conversation-header"]');
    if (!conversationHeader) return null;

    const nameElement = conversationHeader.querySelector('[data-testid="conversation-info-header-chat-title"]');
    const subtitleElement = conversationHeader.querySelector('[data-testid="conversation-info-header-subtitle"]');
    
    if (!nameElement) return null;

    const name = nameElement.textContent.trim();
    const subtitle = subtitleElement ? subtitleElement.textContent.trim() : '';
    
    // Extrair telefone se disponível
    let phone = '';
    if (subtitle.includes('+')) {
      phone = subtitle;
    }

    return {
      name,
      phone,
      subtitle,
      whatsapp_id: this.extractWhatsAppId()
    };
  }

  extractWhatsAppId() {
    // Tentar extrair ID do WhatsApp da URL ou outros métodos
    const url = window.location.href;
    const match = url.match(/\/([0-9]+@[cg]\.us)/);
    return match ? match[1] : null;
  }

  findContactByPhone(phone) {
    if (!phone) return null;
    
    const cleanPhone = phone.replace(/\D/g, '');
    return Array.from(this.contacts.values()).find(contact => {
      const contactPhone = contact.phone.replace(/\D/g, '');
      return contactPhone === cleanPhone;
    });
  }

  findContactByName(name) {
    if (!name) return null;
    
    return Array.from(this.contacts.values()).find(contact => 
      contact.name.toLowerCase().includes(name.toLowerCase()) ||
      name.toLowerCase().includes(contact.name.toLowerCase())
    );
  }

  createNewContact(contactInfo) {
    const contact = {
      id: `contact_${Date.now()}`,
      name: contactInfo.name,
      phone: contactInfo.phone || '',
      email: '',
      company: '',
      stage: 'lead',
      labels: ['new_contact'],
      notes: 'Contato criado automaticamente pelo sistema',
      last_contact: new Date().toISOString(),
      created_at: new Date().toISOString(),
      whatsapp_id: contactInfo.whatsapp_id || ''
    };

    this.contacts.set(contact.id, contact);
    if (contact.whatsapp_id) {
      this.contactsCache[contact.whatsapp_id] = contact;
    }

    console.log('➕ Novo contato criado:', contact.name);
    
    // Salvar no backend
    this.saveContactToBackend(contact);
    
    return contact;
  }

  updateContactData(contact, newInfo) {
    let updated = false;

    if (newInfo.phone && !contact.phone) {
      contact.phone = newInfo.phone;
      updated = true;
    }

    if (newInfo.whatsapp_id && !contact.whatsapp_id) {
      contact.whatsapp_id = newInfo.whatsapp_id;
      this.contactsCache[newInfo.whatsapp_id] = contact;
      updated = true;
    }

    if (updated) {
      contact.updated_at = new Date().toISOString();
      this.saveContactToBackend(contact);
    }
  }

  processMessageForContact(messageElement) {
    if (this.activeContact && messageElement.matches('[data-testid="msg-container"]')) {
      // Atualizar último contato
      this.activeContact.last_contact = new Date().toISOString();
      
      // Analisar conteúdo da mensagem para insights
      this.analyzeMessage(messageElement);
    }
  }

  analyzeMessage(messageElement) {
    const messageText = this.extractMessageText(messageElement);
    if (!messageText || !this.activeContact) return;

    // Detectar palavras-chave interessantes
    const keywords = {
      'email': /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/,
      'phone': /(\+?55\s?\(?\d{2}\)?\s?\d{4,5}-?\d{4})/,
      'company': /(empresa|CNPJ|razão social)/i,
      'service_interest': /(contabil|abertura|imposto|folha|tributário)/i
    };

    Object.entries(keywords).forEach(([type, regex]) => {
      const match = messageText.match(regex);
      if (match) {
        this.updateContactInsight(type, match[0]);
      }
    });
  }

  extractMessageText(messageElement) {
    const textElement = messageElement.querySelector('[data-testid="conversation-text"]');
    return textElement ? textElement.textContent.trim() : '';
  }

  updateContactInsight(type, value) {
    if (!this.activeContact) return;

    switch (type) {
      case 'email':
        if (!this.activeContact.email) {
          this.activeContact.email = value;
          console.log('📧 Email detectado:', value);
        }
        break;
      case 'phone':
        if (!this.activeContact.phone) {
          this.activeContact.phone = value;
          console.log('📱 Telefone detectado:', value);
        }
        break;
      case 'service_interest':
        if (!this.activeContact.notes.includes('Interesse:')) {
          this.activeContact.notes += `\nInteresse: ${value}`;
          console.log('🎯 Interesse detectado:', value);
        }
        break;
    }

    this.activeContact.updated_at = new Date().toISOString();
    this.updateContactInterface();
  }

  injectContactInterface() {
    // Verificar se já existe
    if (document.getElementById('ew-contact-manager-panel')) return;

    const panel = document.createElement('div');
    panel.id = 'ew-contact-manager-panel';
    panel.className = 'ew-contact-panel-side';
    panel.innerHTML = `
      <div class="contact-panel-header">
        <h4>Informações do Contato</h4>
        <button class="panel-toggle" id="toggleContactPanel">−</button>
      </div>
      <div class="contact-panel-content" id="contactPanelContent">
        <div class="contact-info" id="contactInfo">
          <div class="no-contact">
            <p>Selecione uma conversa para ver informações do contato</p>
          </div>
        </div>
      </div>
    `;

    // Inserir painel
    document.body.appendChild(panel);
    
    // Configurar eventos
    this.setupContactPanelEvents(panel);
    
    console.log('✅ Interface de contatos injetada');
  }

  setupContactPanelEvents(panel) {
    // Toggle do painel
    const toggleBtn = panel.querySelector('#toggleContactPanel');
    const content = panel.querySelector('#contactPanelContent');
    
    if (toggleBtn && content) {
      toggleBtn.addEventListener('click', () => {
        const isVisible = content.style.display !== 'none';
        content.style.display = isVisible ? 'none' : 'block';
        toggleBtn.textContent = isVisible ? '+' : '−';
      });
    }

    // Eventos de edição
    panel.addEventListener('click', (e) => {
      if (e.target.classList.contains('edit-contact-btn')) {
        this.showEditContactModal();
      } else if (e.target.classList.contains('add-note-btn')) {
        this.showAddNoteModal();
      } else if (e.target.classList.contains('change-stage-btn')) {
        this.showStageSelector();
      }
    });
  }

  updateContactInterface() {
    const contactInfo = document.getElementById('contactInfo');
    if (!contactInfo) return;

    if (!this.activeContact) {
      contactInfo.innerHTML = `
        <div class="no-contact">
          <p>Selecione uma conversa para ver informações do contato</p>
        </div>
      `;
      return;
    }

    const contact = this.activeContact;
    const stageColors = {
      lead: '#3B82F6',
      contact: '#EAB308',
      proposal: '#F97316', 
      negotiation: '#8B5CF6',
      client: '#10B981',
      lost: '#EF4444'
    };

    contactInfo.innerHTML = `
      <div class="active-contact">
        <div class="contact-header">
          <div class="contact-avatar">
            ${contact.name.charAt(0).toUpperCase()}
          </div>
          <div class="contact-basic">
            <h5>${contact.name}</h5>
            <div class="contact-stage" style="background-color: ${stageColors[contact.stage]}20; color: ${stageColors[contact.stage]}">
              ${contact.stage.toUpperCase()}
            </div>
          </div>
        </div>

        <div class="contact-details">
          <div class="detail-item">
            <label>📱 Telefone:</label>
            <span>${contact.phone || 'Não informado'}</span>
          </div>
          
          <div class="detail-item">
            <label>📧 Email:</label>
            <span>${contact.email || 'Não informado'}</span>
          </div>
          
          <div class="detail-item">
            <label>🏢 Empresa:</label>
            <span>${contact.company || 'Não informado'}</span>
          </div>

          <div class="detail-item">
            <label>🏷️ Etiquetas:</label>
            <div class="contact-labels">
              ${contact.labels.map(label => `
                <span class="contact-label">${label}</span>
              `).join('')}
            </div>
          </div>

          <div class="detail-item">
            <label>📅 Último Contato:</label>
            <span>${new Date(contact.last_contact).toLocaleString('pt-BR')}</span>
          </div>

          <div class="detail-item">
            <label>📝 Observações:</label>
            <div class="contact-notes">${contact.notes || 'Nenhuma observação'}</div>
          </div>
        </div>

        <div class="contact-actions">
          <button class="contact-action-btn edit-contact-btn">
            ✏️ Editar
          </button>
          <button class="contact-action-btn add-note-btn">
            📝 Adicionar Nota
          </button>
          <button class="contact-action-btn change-stage-btn">
            🔄 Alterar Estágio
          </button>
        </div>

        <div class="contact-stats">
          <div class="stat-item">
            <label>Mensagens Trocadas</label>
            <span>${Math.floor(Math.random() * 50) + 10}</span>
          </div>
          <div class="stat-item">
            <label>Dias de Relacionamento</label>
            <span>${Math.floor((Date.now() - new Date(contact.created_at)) / (1000 * 60 * 60 * 24))}</span>
          </div>
        </div>
      </div>
    `;
  }

  showEditContactModal() {
    if (!this.activeContact) return;

    const modal = document.createElement('div');
    modal.className = 'ew-modal-overlay';
    modal.innerHTML = `
      <div class="ew-modal ew-contact-modal">
        <div class="ew-modal-header">
          <h3>Editar Contato</h3>
          <button class="ew-modal-close">&times;</button>
        </div>
        <form class="ew-modal-content" id="editContactForm">
          <div class="ew-form-group">
            <label>Nome *</label>
            <input type="text" id="contactName" value="${this.activeContact.name}" required>
          </div>
          <div class="ew-form-group">
            <label>Telefone</label>
            <input type="tel" id="contactPhone" value="${this.activeContact.phone}">
          </div>
          <div class="ew-form-group">
            <label>Email</label>
            <input type="email" id="contactEmail" value="${this.activeContact.email}">
          </div>
          <div class="ew-form-group">
            <label>Empresa</label>
            <input type="text" id="contactCompany" value="${this.activeContact.company}">
          </div>
          <div class="ew-form-group">
            <label>Observações</label>
            <textarea id="contactNotes" rows="4">${this.activeContact.notes}</textarea>
          </div>
          <div class="ew-form-actions">
            <button type="button" class="ew-btn-secondary" id="cancelEdit">Cancelar</button>
            <button type="submit" class="ew-btn-primary">Salvar</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);
    
    // Eventos
    const form = modal.querySelector('#editContactForm');
    const closeBtn = modal.querySelector('.ew-modal-close');
    const cancelBtn = modal.querySelector('#cancelEdit');

    const closeModal = () => modal.remove();

    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveContactEdits();
      closeModal();
    });
  }

  saveContactEdits() {
    if (!this.activeContact) return;

    this.activeContact.name = document.getElementById('contactName').value;
    this.activeContact.phone = document.getElementById('contactPhone').value;
    this.activeContact.email = document.getElementById('contactEmail').value;
    this.activeContact.company = document.getElementById('contactCompany').value;
    this.activeContact.notes = document.getElementById('contactNotes').value;
    this.activeContact.updated_at = new Date().toISOString();

    this.saveContactToBackend(this.activeContact);
    this.updateContactInterface();
    
    this.showNotification('Contato atualizado com sucesso!', 'success');
  }

  scanForNewContacts() {
    // Escanear lista de conversas para detectar novos contatos
    const chatItems = document.querySelectorAll('[data-testid="conversation"]');
    
    chatItems.forEach(chatItem => {
      const nameElement = chatItem.querySelector('[title]');
      if (nameElement && !this.findContactByName(nameElement.title)) {
        console.log('🔍 Novo contato detectado na lista:', nameElement.title);
      }
    });
  }

  async saveContactToBackend(contact) {
    try {
      console.log('💾 Salvando contato no backend:', contact.name);
      // Aqui integraria com a API do backend
    } catch (error) {
      console.error('❌ Erro ao salvar contato:', error);
    }
  }

  // Métodos públicos para integração
  getActiveContact() {
    return this.activeContact;
  }

  getAllContacts() {
    return Array.from(this.contacts.values());
  }

  getContactsCount() {
    return this.contacts.size;
  }

  getContactsByStage(stage) {
    return Array.from(this.contacts.values()).filter(contact => contact.stage === stage);
  }

  showNotification(message, type) {
    if (this.crm.showNotification) {
      this.crm.showNotification(message, type);
    } else {
      console.log(`${type.toUpperCase()}: ${message}`);
    }
  }

  destroy() {
    this.contacts.clear();
    this.contactsCache = {};
    this.activeContact = null;
    
    // Remover interface
    const panel = document.getElementById('ew-contact-manager-panel');
    if (panel) {
      panel.remove();
    }
  }
}

// Disponibilizar globalmente
window.ContactManager = ContactManager;