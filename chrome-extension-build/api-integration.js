// Empresas Web CRM - API Integration Layer
// Integração com o backend da aplicação principal

class EmpresasWebAPI {
  constructor() {
    this.baseURL = 'https://crm-extension-1.preview.emergentagent.com/api'; // Backend URL
    this.authToken = null;
    this.isAuthenticated = false;
    
    this.init();
  }

  async init() {
    console.log('🔗 Inicializando integração com API...');
    
    // Tentar recuperar token salvo
    const storedAuth = await this.getStoredAuth();
    if (storedAuth) {
      this.authToken = storedAuth.token;
      this.isAuthenticated = true;
      console.log('✅ Token de autenticação recuperado');
    } else {
      console.log('ℹ️ Nenhuma autenticação encontrada');
    }
  }

  async getStoredAuth() {
    try {
      const result = await chrome.storage.local.get(['empresasWebAuth']);
      return result.empresasWebAuth || null;
    } catch (error) {
      console.error('❌ Erro ao recuperar autenticação:', error);
      return null;
    }
  }

  async saveAuth(token, userInfo) {
    try {
      await chrome.storage.local.set({
        empresasWebAuth: {
          token,
          userInfo,
          timestamp: Date.now()
        }
      });
      
      this.authToken = token;
      this.isAuthenticated = true;
      
      console.log('✅ Autenticação salva');
    } catch (error) {
      console.error('❌ Erro ao salvar autenticação:', error);
    }
  }

  async clearAuth() {
    try {
      await chrome.storage.local.remove(['empresasWebAuth']);
      this.authToken = null;
      this.isAuthenticated = false;
      console.log('✅ Autenticação removida');
    } catch (error) {
      console.error('❌ Erro ao remover autenticação:', error);
    }
  }

  getAuthHeaders() {
    return {
      'Content-Type': 'application/json',
      ...(this.authToken && { 'Authorization': `Bearer ${this.authToken}` })
    };
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      method: options.method || 'GET',
      headers: this.getAuthHeaders(),
      ...options
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      console.log(`🌐 API Request: ${config.method} ${endpoint}`);
      
      const response = await fetch(url, config);
      
      if (response.status === 401) {
        // Token expirado, limpar autenticação
        await this.clearAuth();
        throw new Error('Token de autenticação inválido');
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`✅ API Response: ${config.method} ${endpoint} - Success`);
      
      return data;
    } catch (error) {
      console.error(`❌ API Error: ${config.method} ${endpoint}`, error);
      throw error;
    }
  }

  // Auth Methods
  async login(username, password) {
    try {
      const response = await this.makeRequest('/auth/login', {
        method: 'POST',
        body: { username, password }
      });

      if (response.access_token) {
        await this.saveAuth(response.access_token, response.user);
        return { success: true, user: response.user };
      }
      
      throw new Error('Token não recebido');
    } catch (error) {
      console.error('❌ Erro no login:', error);
      return { success: false, error: error.message };
    }
  }

  // Chrome Extension Specific Methods
  async getExtensionConfig() {
    if (!this.isAuthenticated) {
      throw new Error('Usuário não autenticado');
    }

    try {
      return await this.makeRequest('/chrome-extension/config');
    } catch (error) {
      console.error('❌ Erro ao obter configuração da extensão:', error);
      throw error;
    }
  }

  async saveCRMData(crmData) {
    if (!this.isAuthenticated) {
      throw new Error('Usuário não autenticado');
    }

    try {
      return await this.makeRequest('/chrome-extension/crm-data', {
        method: 'POST',
        body: crmData
      });
    } catch (error) {
      console.error('❌ Erro ao salvar dados CRM:', error);
      throw error;
    }
  }

  async sendMassMessage(messageData) {
    if (!this.isAuthenticated) {
      throw new Error('Usuário não autenticado');
    }

    try {
      return await this.makeRequest('/chrome-extension/mass-message', {
        method: 'POST',
        body: messageData
      });
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem em massa:', error);
      throw error;
    }
  }

  async getAnalytics(companyId = null) {
    if (!this.isAuthenticated) {
      throw new Error('Usuário não autenticado');
    }

    try {
      const queryParam = companyId ? `?company_id=${companyId}` : '';
      return await this.makeRequest(`/chrome-extension/analytics${queryParam}`);
    } catch (error) {
      console.error('❌ Erro ao obter analytics:', error);
      throw error;
    }
  }

  // Contact Management
  async getContacts() {
    if (!this.isAuthenticated) {
      throw new Error('Usuário não autenticado');
    }

    try {
      return await this.makeRequest('/contacts');
    } catch (error) {
      console.error('❌ Erro ao obter contatos:', error);
      throw error;
    }
  }

  async createContact(contactData) {
    if (!this.isAuthenticated) {
      throw new Error('Usuário não autenticado');
    }

    try {
      return await this.makeRequest('/contacts', {
        method: 'POST',
        body: contactData
      });
    } catch (error) {
      console.error('❌ Erro ao criar contato:', error);
      throw error;
    }
  }

  async updateContact(contactId, contactData) {
    if (!this.isAuthenticated) {
      throw new Error('Usuário não autenticado');
    }

    try {
      return await this.makeRequest(`/contacts/${contactId}`, {
        method: 'PUT',
        body: contactData
      });
    } catch (error) {
      console.error('❌ Erro ao atualizar contato:', error);
      throw error;
    }
  }

  // Department Management
  async getDepartments() {
    if (!this.isAuthenticated) {
      throw new Error('Usuário não autenticado');
    }

    try {
      return await this.makeRequest('/departments');
    } catch (error) {
      console.error('❌ Erro ao obter departamentos:', error);
      throw error;
    }
  }

  // AI Integration
  async getAIResponse(message, context = {}) {
    if (!this.isAuthenticated) {
      throw new Error('Usuário não autenticado');
    }

    try {
      return await this.makeRequest('/ai/response', {
        method: 'POST',
        body: { message, context }
      });
    } catch (error) {
      console.error('❌ Erro ao obter resposta da IA:', error);
      throw error;
    }
  }

  // Appointments
  async getAppointments() {
    if (!this.isAuthenticated) {
      throw new Error('Usuário não autenticado');
    }

    try {
      return await this.makeRequest('/appointments');
    } catch (error) {
      console.error('❌ Erro ao obter agendamentos:', error);
      throw error;
    }
  }

  async createAppointment(appointmentData) {
    if (!this.isAuthenticated) {
      throw new Error('Usuário não autenticado');
    }

    try {
      return await this.makeRequest('/appointments', {
        method: 'POST',
        body: appointmentData
      });
    } catch (error) {
      console.error('❌ Erro ao criar agendamento:', error);
      throw error;
    }
  }

  // Scheduled Messages
  async getScheduledMessages() {
    if (!this.isAuthenticated) {
      throw new Error('Usuário não autenticado');
    }

    try {
      return await this.makeRequest('/scheduled-messages');
    } catch (error) {
      console.error('❌ Erro ao obter mensagens agendadas:', error);
      throw error;
    }
  }

  async createScheduledMessage(messageData) {
    if (!this.isAuthenticated) {
      throw new Error('Usuário não autenticado');
    }

    try {
      return await this.makeRequest('/scheduled-messages', {
        method: 'POST',
        body: messageData
      });
    } catch (error) {
      console.error('❌ Erro ao criar mensagem agendada:', error);
      throw error;
    }
  }

  // Health Check
  async checkConnection() {
    try {
      const response = await fetch(`${this.baseURL}/health`);
      return response.ok;
    } catch (error) {
      console.error('❌ Erro na verificação de conexão:', error);
      return false;
    }
  }

  // Utility Methods
  isConnected() {
    return this.isAuthenticated;
  }

  getAuthStatus() {
    return {
      isAuthenticated: this.isAuthenticated,
      hasToken: !!this.authToken
    };
  }
}

// Disponibilizar globalmente
window.EmpresasWebAPI = EmpresasWebAPI;

// Criar instância global
window.empresasWebAPI = new EmpresasWebAPI();

console.log('✅ EmpresasWeb API Integration carregado');