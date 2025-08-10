import React, { useState, useEffect } from 'react';
import './App.css';
import { Card, CardHeader, CardTitle, CardContent } from './components/ui/card';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Badge } from './components/ui/badge';
import { Avatar, AvatarFallback } from './components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/tabs';
import { Alert, AlertDescription } from './components/ui/alert';
import { 
  MessageCircle, 
  Users, 
  BarChart3, 
  Settings, 
  Phone, 
  Mail, 
  Building, 
  QrCode,
  CheckCircle,
  AlertCircle,
  Send,
  Bot,
  Zap,
  Shield,
  Globe,
  Crown
} from 'lucide-react';

function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [contacts, setContacts] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [whatsappStatus, setWhatsappStatus] = useState('disconnected');
  const [stats, setStats] = useState({
    total_contacts: 0,
    total_conversations: 0,
    today_messages: 0,
    whatsapp_connected: false
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [transfers, setTransfers] = useState([]);

  const API_BASE = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      verifyToken(token);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
      fetchContacts();
      fetchDepartments();
      fetchTransfers();
      checkWhatsAppStatus();
    }
  }, [isAuthenticated]);

  const verifyToken = async (token) => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/verify`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Token verification failed:', error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });
      
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        setIsAuthenticated(true);
      } else {
        alert('Credenciais inválidas');
      }
    } catch (error) {
      alert('Erro no login');
    }
    setLoading(false);
  };

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/dashboard/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const fetchContacts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/contacts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setContacts(data);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  const checkWhatsAppStatus = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/whatsapp/status`);
      if (response.ok) {
        const data = await response.json();
        setWhatsappStatus(data.connected ? 'connected' : 'disconnected');
      }
    } catch (error) {
      setWhatsappStatus('error');
    }
  };

  const fetchQRCode = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/whatsapp/qr`);
      if (response.ok) {
        const data = await response.json();
        setQrCode(data.qr);
      }
    } catch (error) {
      console.error('Error fetching QR code:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setCurrentTab('dashboard');
  };

  const selectContact = async (contact) => {
    setSelectedContact(contact);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/conversations/${contact.phone_number}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !selectedContact) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/whatsapp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone_number: selectedContact.phone_number,
          message: message
        })
      });
      
      if (response.ok) {
        setMessage('');
        selectContact(selectedContact); // Refresh conversation
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
    setLoading(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <MessageCircle className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <Crown className="w-3 h-3 text-white" />
                </div>
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-white mb-2">Empresas Web</CardTitle>
              <p className="text-blue-200">Sistema CRM com WhatsApp e IA</p>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Input
                  type="text"
                  placeholder="Usuário"
                  value={loginData.username}
                  onChange={(e) => setLoginData({...loginData, username: e.target.value})}
                  className="bg-white/10 border-white/20 text-white placeholder:text-blue-200"
                />
              </div>
              <div>
                <Input
                  type="password"
                  placeholder="Senha"
                  value={loginData.password}
                  onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                  className="bg-white/10 border-white/20 text-white placeholder:text-blue-200"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                disabled={loading}
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
            <div className="mt-6 text-center">
              <p className="text-xs text-blue-200">Usuário padrão: admin / Senha: admin123</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Empresas Web</h1>
                <p className="text-sm text-gray-500">CRM + WhatsApp + IA</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge variant={whatsappStatus === 'connected' ? 'default' : 'destructive'} className="flex items-center space-x-1">
                {whatsappStatus === 'connected' ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                <span>WhatsApp {whatsappStatus === 'connected' ? 'Conectado' : 'Desconectado'}</span>
              </Badge>
              
              <Button variant="outline" onClick={handleLogout}>
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-sm border-r">
          <nav className="p-4 space-y-2">
            <Button
              variant={currentTab === 'dashboard' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setCurrentTab('dashboard')}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            
            <Button
              variant={currentTab === 'whatsapp' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setCurrentTab('whatsapp')}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              WhatsApp
            </Button>
            
            <Button
              variant={currentTab === 'contacts' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setCurrentTab('contacts')}
            >
              <Users className="w-4 h-4 mr-2" />
              Contatos
            </Button>
            
            <Button
              variant={currentTab === 'ai' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setCurrentTab('ai')}
            >
              <Bot className="w-4 h-4 mr-2" />
              IA Assistant
            </Button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          {currentTab === 'dashboard' && (
            <div className="p-6 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h2>
                <p className="text-gray-600">Visão geral do sistema CRM</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total de Contatos</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.total_contacts}</p>
                      </div>
                      <Users className="w-8 h-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Conversas</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.total_conversations}</p>
                      </div>
                      <MessageCircle className="w-8 h-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Mensagens Hoje</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.today_messages}</p>
                      </div>
                      <Send className="w-8 h-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">IA Status</p>
                        <p className="text-2xl font-bold text-gray-900">Ativo</p>
                      </div>
                      <Bot className="w-8 h-8 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Zap className="w-5 h-5 text-yellow-500" />
                      <span>Recursos Principais</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                      <MessageCircle className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="font-medium text-gray-900">WhatsApp Web</p>
                        <p className="text-sm text-gray-600">Integração completa com QR Code</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                      <Bot className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="font-medium text-gray-900">IA Assistant</p>
                        <p className="text-sm text-gray-600">ChatGPT + Gemini integrados</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                      <Users className="w-5 h-5 text-purple-500" />
                      <div>
                        <p className="font-medium text-gray-900">CRM Completo</p>
                        <p className="text-sm text-gray-600">Gestão avançada de clientes</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Globe className="w-5 h-5 text-blue-500" />
                      <span>Status do Sistema</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">API Backend</span>
                      </div>
                      <Badge variant="default">Online</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        {whatsappStatus === 'connected' ? 
                          <CheckCircle className="w-4 h-4 text-green-500" /> : 
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        }
                        <span className="text-sm">WhatsApp</span>
                      </div>
                      <Badge variant={whatsappStatus === 'connected' ? 'default' : 'destructive'}>
                        {whatsappStatus === 'connected' ? 'Conectado' : 'Desconectado'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">IA Assistant</span>
                      </div>
                      <Badge variant="default">Pronto</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {currentTab === 'whatsapp' && (
            <div className="h-full flex">
              {/* Contacts List */}
              <div className="w-80 bg-white border-r">
                <div className="p-4 border-b">
                  <h3 className="text-lg font-semibold">Contatos WhatsApp</h3>
                  {whatsappStatus !== 'connected' && (
                    <Button 
                      onClick={fetchQRCode} 
                      className="w-full mt-2"
                      variant="outline"
                    >
                      <QrCode className="w-4 h-4 mr-2" />
                      Conectar WhatsApp
                    </Button>
                  )}
                </div>
                
                {qrCode && (
                  <div className="p-4 border-b bg-blue-50">
                    <p className="text-sm text-center mb-2">Escaneie o QR Code:</p>
                    <div className="flex justify-center">
                      <img src={`data:image/png;base64,${qrCode}`} alt="QR Code" className="w-32 h-32" />
                    </div>
                  </div>
                )}
                
                <div className="overflow-y-auto">
                  {contacts.map((contact) => (
                    <div 
                      key={contact.id}
                      className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${selectedContact?.id === contact.id ? 'bg-blue-50' : ''}`}
                      onClick={() => selectContact(contact)}
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{contact.name}</p>
                          <p className="text-sm text-gray-500">{contact.phone_number}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat Area */}
              <div className="flex-1 flex flex-col">
                {selectedContact ? (
                  <>
                    <div className="p-4 border-b bg-white">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback>{selectedContact.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{selectedContact.name}</p>
                          <p className="text-sm text-gray-500">{selectedContact.phone_number}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
                      {conversations.map((conv) => (
                        <div key={conv.id} className={`flex ${conv.direction === 'outgoing' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-xs px-4 py-2 rounded-lg ${
                            conv.direction === 'outgoing' 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-white text-gray-800'
                          }`}>
                            <p>{conv.message}</p>
                            <p className="text-xs mt-1 opacity-70">
                              {new Date(conv.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="p-4 bg-white border-t">
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Digite sua mensagem..."
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                          className="flex-1"
                        />
                        <Button onClick={sendMessage} disabled={loading}>
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                      <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-xl font-medium text-gray-500">Selecione um contato</p>
                      <p className="text-gray-400">para iniciar uma conversa</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {currentTab === 'contacts' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Contatos</h2>
                  <p className="text-gray-600">Gerencie seus contatos do WhatsApp</p>
                </div>
                <Button>
                  <Users className="w-4 h-4 mr-2" />
                  Adicionar Contato
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {contacts.map((contact) => (
                  <Card key={contact.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="text-lg">{contact.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{contact.name}</h3>
                          <div className="space-y-1">
                            <div className="flex items-center text-sm text-gray-600">
                              <Phone className="w-3 h-3 mr-1" />
                              {contact.phone_number}
                            </div>
                            {contact.email && (
                              <div className="flex items-center text-sm text-gray-600">
                                <Mail className="w-3 h-3 mr-1" />
                                {contact.email}
                              </div>
                            )}
                            {contact.company && (
                              <div className="flex items-center text-sm text-gray-600">
                                <Building className="w-3 h-3 mr-1" />
                                {contact.company}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {currentTab === 'ai' && (
            <div className="p-6 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">IA Assistant</h2>
                <p className="text-gray-600">Assistente virtual com ChatGPT e Gemini</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Bot className="w-5 h-5 text-blue-500" />
                      <span>ChatGPT Integration</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Alert>
                      <CheckCircle className="w-4 h-4" />
                      <AlertDescription>
                        ChatGPT está integrado e funcionando com Emergent LLM Key
                      </AlertDescription>
                    </Alert>
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-medium">Funcionalidades:</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Respostas automáticas no WhatsApp</li>
                        <li>• Assistente virtual para clientes</li>
                        <li>• Processamento de linguagem natural</li>
                        <li>• Análise de sentimentos</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Zap className="w-5 h-5 text-purple-500" />
                      <span>Gemini AI</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Alert>
                      <CheckCircle className="w-4 h-4" />
                      <AlertDescription>
                        Gemini AI está pronto para funcionalidades avançadas
                      </AlertDescription>
                    </Alert>
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-medium">Recursos Avançados:</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Análise multimodal</li>
                        <li>• Processamento de imagens</li>
                        <li>• Geração de conteúdo</li>
                        <li>• Insights inteligentes</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Configurações da IA</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Status da Emergent LLM Key</p>
                      <p className="text-sm text-gray-600">Chave universal ativa e funcionando</p>
                    </div>
                    <Badge variant="default" className="bg-green-500">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Ativo
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">OpenAI GPT</h4>
                      <Badge variant="default">Conectado</Badge>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Anthropic Claude</h4>
                      <Badge variant="default">Conectado</Badge>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Google Gemini</h4>
                      <Badge variant="default">Conectado</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;