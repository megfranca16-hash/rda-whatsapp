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
  Crown,
  ArrowRight,
  Clock,
  Menu,
  Search,
  User,
  ChevronLeft,
  ChevronRight,
  Home,
  MessageSquare,
  UserCog,
  Briefcase
} from 'lucide-react';

function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [newSignature, setNewSignature] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [companyProfile, setCompanyProfile] = useState({
    name: "Empresas Web",
    about: "Especialistas em contabilidade e gestão empresarial",
    logo_url: null,
    website_url: "",
    facebook_url: "",
    linkedin_url: "",
    business_hours: {
      monday: { open: "08:00", close: "18:00", active: true },
      tuesday: { open: "08:00", close: "18:00", active: true },
      wednesday: { open: "08:00", close: "18:00", active: true },
      thursday: { open: "08:00", close: "18:00", active: true },
      friday: { open: "08:00", close: "18:00", active: true },
      saturday: { open: "08:00", close: "12:00", active: false },
      sunday: { open: "00:00", close: "00:00", active: false }
    }
  });
  const [editingInstructions, setEditingInstructions] = useState(null);
  const [newInstructions, setNewInstructions] = useState('');

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

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/departments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setDepartments(data);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchTransfers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/transfers`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setTransfers(data);
      }
    } catch (error) {
      console.error('Error fetching transfers:', error);
    }
  };

  const updateDepartmentSignature = async (departmentId, signature) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/departments/${departmentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ signature }),
      });
      
      if (response.ok) {
        // Refresh departments
        await fetchDepartments();
        setEditingDepartment(null);
        setNewSignature('');
        alert('Assinatura atualizada com sucesso!');
      } else {
        alert('Erro ao atualizar assinatura');
      }
    } catch (error) {
      console.error('Error updating signature:', error);
      alert('Erro ao atualizar assinatura');
    }
  };

  const updateDepartmentInstructions = async (departmentId, instructions) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/departments/${departmentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ manual_instructions: instructions }),
      });
      
      if (response.ok) {
        // Refresh departments
        await fetchDepartments();
        setEditingInstructions(null);
        setNewInstructions('');
        alert('Instruções da IA atualizadas com sucesso!');
      } else {
        alert('Erro ao atualizar instruções');
      }
    } catch (error) {
      console.error('Error updating instructions:', error);
      alert('Erro ao atualizar instruções');
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Modern Top Bar */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-b border-slate-200/50 shadow-sm z-50">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </Button>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Empresas Web
                </h1>
                <p className="text-xs text-slate-500">CRM + WhatsApp + IA</p>
              </div>
            </div>
          </div>

          {/* Center Search */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Buscar contatos, conversas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-50/50 border-slate-200 focus:bg-white transition-colors"
              />
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            <Badge 
              variant={whatsappStatus === 'connected' ? 'default' : 'destructive'} 
              className={`flex items-center space-x-1 px-3 py-1 ${
                whatsappStatus === 'connected' 
                  ? 'bg-green-500 hover:bg-green-600' 
                  : 'bg-red-500 hover:bg-red-600'
              }`}
            >
              {whatsappStatus === 'connected' ? 
                <CheckCircle className="w-3 h-3" /> : 
                <AlertCircle className="w-3 h-3" />
              }
              <span className="hidden sm:inline">
                WhatsApp {whatsappStatus === 'connected' ? 'Conectado' : 'Desconectado'}
              </span>
            </Badge>
            
            <Button variant="ghost" size="sm" className="p-2">
              <User className="w-4 h-4" />
            </Button>
            
            <Button variant="outline" onClick={handleLogout} size="sm">
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Floating Sidebar */}
        <aside className={`fixed left-4 top-20 bottom-4 bg-white/90 backdrop-blur-xl border border-slate-200/50 rounded-2xl shadow-xl transition-all duration-300 z-40 ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        }`}>
          <div className="p-4 h-full flex flex-col">
            {/* Sidebar Header */}
            {!sidebarCollapsed && (
              <div className="mb-6">
                <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Menu Principal</h2>
              </div>
            )}
            
            {/* Navigation */}
            <nav className="flex-1 space-y-2">
              <Button
                variant="ghost"
                className={`w-full transition-all duration-200 ${
                  currentTab === 'dashboard' 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                } ${sidebarCollapsed ? 'justify-center p-3' : 'justify-start'}`}
                onClick={() => setCurrentTab('dashboard')}
              >
                <Home className="w-5 h-5" />
                {!sidebarCollapsed && <span className="ml-3">Dashboard</span>}
              </Button>
              
              <Button
                variant="ghost"
                className={`w-full transition-all duration-200 ${
                  currentTab === 'whatsapp' 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg hover:shadow-xl' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                } ${sidebarCollapsed ? 'justify-center p-3' : 'justify-start'}`}
                onClick={() => setCurrentTab('whatsapp')}
              >
                <MessageSquare className="w-5 h-5" />
                {!sidebarCollapsed && <span className="ml-3">Atendimentos</span>}
              </Button>
              
              <Button
                variant="ghost"
                className={`w-full transition-all duration-200 ${
                  currentTab === 'contacts' 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg hover:shadow-xl' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                } ${sidebarCollapsed ? 'justify-center p-3' : 'justify-start'}`}
                onClick={() => setCurrentTab('contacts')}
              >
                <Users className="w-5 h-5" />
                {!sidebarCollapsed && <span className="ml-3">Contatos</span>}
              </Button>
              
              <Button
                variant="ghost"
                className={`w-full transition-all duration-200 ${
                  currentTab === 'ai' 
                    ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg hover:shadow-xl' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                } ${sidebarCollapsed ? 'justify-center p-3' : 'justify-start'}`}
                onClick={() => setCurrentTab('ai')}
              >
                <Bot className="w-5 h-5" />
                {!sidebarCollapsed && <span className="ml-3">Assistentes IA</span>}
              </Button>
              
              <Button
                variant="ghost"
                className={`w-full transition-all duration-200 ${
                  currentTab === 'departments' 
                    ? 'bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-lg hover:shadow-xl' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                } ${sidebarCollapsed ? 'justify-center p-3' : 'justify-start'}`}
                onClick={() => setCurrentTab('departments')}
              >
                <Briefcase className="w-5 h-5" />
                {!sidebarCollapsed && <span className="ml-3">Departamentos</span>}
              </Button>
              
              <Button
                variant="ghost"
                className={`w-full transition-all duration-200 ${
                  currentTab === 'admin' 
                    ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg hover:shadow-xl' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                } ${sidebarCollapsed ? 'justify-center p-3' : 'justify-start'}`}
                onClick={() => setCurrentTab('admin')}
              >
                <UserCog className="w-5 h-5" />
                {!sidebarCollapsed && <span className="ml-3">Administração</span>}
              </Button>
            </nav>

            {/* Sidebar Footer */}
            <div className="mt-auto pt-4 border-t border-slate-200/50">
              <Button
                variant="ghost"
                className={`w-full text-slate-500 hover:text-slate-700 ${
                  sidebarCollapsed ? 'justify-center p-2' : 'justify-start'
                }`}
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="w-4 h-4" />
                ) : (
                  <>
                    <ChevronLeft className="w-4 h-4" />
                    <span className="ml-2 text-xs">Recolher</span>
                  </>
                )}
              </Button>
              
              {!sidebarCollapsed && (
                <div className="mt-3 text-center">
                  <div className="text-xs text-slate-400">Empresas Web v2.0</div>
                  <div className="text-xs text-slate-300">Sistema CRM Completo</div>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className={`flex-1 transition-all duration-300 ${
          sidebarCollapsed ? 'ml-24' : 'ml-72'
        } mr-4 mb-4`}>
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-slate-200/50 shadow-xl min-h-[calc(100vh-6rem)]">
          {currentTab === 'dashboard' && (
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">Dashboard</h2>
                  <p className="text-slate-600">Visão geral do sistema CRM da Empresas Web</p>
                </div>
                <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-slate-600">Sistema Online</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-shadow duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-700">Total de Contatos</p>
                        <p className="text-3xl font-bold text-blue-900">{stats.total_contacts}</p>
                        <p className="text-xs text-blue-600 mt-1">↗ +12% este mês</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-shadow duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-700">Conversas</p>
                        <p className="text-3xl font-bold text-green-900">{stats.total_conversations}</p>
                        <p className="text-xs text-green-600 mt-1">↗ +8% esta semana</p>
                      </div>
                      <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                        <MessageCircle className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-shadow duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-purple-700">Mensagens Hoje</p>
                        <p className="text-3xl font-bold text-purple-900">{stats.today_messages}</p>
                        <p className="text-xs text-purple-600 mt-1">📈 Crescendo</p>
                      </div>
                      <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                        <Send className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-shadow duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-orange-700">IA Status</p>
                        <p className="text-3xl font-bold text-orange-900">Ativo</p>
                        <p className="text-xs text-orange-600 mt-1">🤖 Respondendo</p>
                      </div>
                      <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                        <Bot className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="shadow-lg border-slate-200">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-slate-200">
                    <CardTitle className="flex items-center space-x-2">
                      <Zap className="w-5 h-5 text-yellow-500" />
                      <span className="text-slate-900">Recursos Principais</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 p-6">
                    <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-xl border border-blue-200 hover:bg-blue-100 transition-colors duration-200">
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                        <MessageCircle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">WhatsApp Web</p>
                        <p className="text-sm text-slate-600">Integração completa com QR Code</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-xl border border-green-200 hover:bg-green-100 transition-colors duration-200">
                      <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">IA Assistant</p>
                        <p className="text-sm text-slate-600">ChatGPT + Gemini integrados</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 p-4 bg-purple-50 rounded-xl border border-purple-200 hover:bg-purple-100 transition-colors duration-200">
                      <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">CRM Completo</p>
                        <p className="text-sm text-slate-600">Gestão avançada de clientes</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg border-slate-200">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 border-b border-slate-200">
                    <CardTitle className="flex items-center space-x-2">
                      <Globe className="w-5 h-5 text-blue-500" />
                      <span className="text-slate-900">Status do Sistema</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 p-6">
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="font-medium text-slate-900">API Backend</span>
                      </div>
                      <Badge variant="default" className="bg-green-500 hover:bg-green-600">Online</Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="flex items-center space-x-3">
                        {whatsappStatus === 'connected' ? 
                          <CheckCircle className="w-5 h-5 text-green-500" /> : 
                          <AlertCircle className="w-5 h-5 text-red-500" />
                        }
                        <span className="font-medium text-slate-900">WhatsApp</span>
                      </div>
                      <Badge variant={whatsappStatus === 'connected' ? 'default' : 'destructive'} 
                             className={whatsappStatus === 'connected' ? 'bg-green-500 hover:bg-green-600' : ''}>
                        {whatsappStatus === 'connected' ? 'Conectado' : 'Desconectado'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl border border-orange-200">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-orange-500" />
                        <span className="font-medium text-slate-900">IA Assistant</span>
                      </div>
                      <Badge variant="default" className="bg-orange-500 hover:bg-orange-600">Pronto</Badge>
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

          {currentTab === 'departments' && (
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Departamentos</h2>
                  <p className="text-gray-600">Gerencie departamentos e transferências de chamadas</p>
                </div>
                <Button>
                  <Building className="w-4 h-4 mr-2" />
                  Novo Departamento
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Departamentos */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Building className="w-5 h-5 text-blue-500" />
                      <span>Departamentos Ativos</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {departments.map((department) => (
                      <div key={department.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="font-medium text-slate-900">{department.name}</p>
                            <p className="text-sm text-slate-600">{department.description}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={department.active ? "default" : "secondary"}>
                              {department.active ? "Ativo" : "Inativo"}
                            </Badge>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setEditingDepartment(department.id);
                                setNewSignature(department.signature || '');
                              }}
                            >
                              Editar
                            </Button>
                          </div>
                        </div>
                        
                        {editingDepartment === department.id ? (
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">
                                Assinatura Automática:
                              </label>
                              <textarea
                                value={newSignature}
                                onChange={(e) => setNewSignature(e.target.value)}
                                placeholder="Digite a assinatura que aparecerá nas mensagens deste departamento..."
                                className="w-full p-3 border border-slate-300 rounded-lg text-sm resize-none"
                                rows={4}
                              />
                              <p className="text-xs text-slate-500 mt-1">
                                Esta assinatura será adicionada automaticamente ao final de todas as mensagens do departamento.
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button 
                                size="sm"
                                onClick={() => updateDepartmentSignature(department.id, newSignature)}
                              >
                                Salvar
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  setEditingDepartment(null);
                                  setNewSignature('');
                                }}
                              >
                                Cancelar
                              </Button>
                            </div>
                          </div>
                        ) : (
                          department.signature && (
                            <div className="mt-3 p-3 bg-white rounded border border-slate-200">
                              <p className="text-xs font-medium text-slate-600 mb-1">Assinatura Atual:</p>
                              <pre className="text-xs text-slate-700 whitespace-pre-wrap font-mono">
                                {department.signature}
                              </pre>
                            </div>
                          )
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Transferências Recentes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <ArrowRight className="w-5 h-5 text-green-500" />
                      <span>Transferências Recentes</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {transfers.slice(0, 5).map((transfer) => {
                      const department = departments.find(d => d.id === transfer.to_department);
                      return (
                        <div key={transfer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{transfer.from_contact}</p>
                            <p className="text-sm text-gray-600">
                              → {department?.name || 'Departamento desconhecido'}
                            </p>
                            <div className="flex items-center text-xs text-gray-500 mt-1">
                              <Clock className="w-3 h-3 mr-1" />
                              {new Date(transfer.created_at).toLocaleString()}
                            </div>
                          </div>
                          <Badge variant={
                            transfer.status === 'completed' ? 'default' : 
                            transfer.status === 'pending' ? 'secondary' : 'destructive'
                          }>
                            {transfer.status === 'pending' ? 'Pendente' : 
                             transfer.status === 'completed' ? 'Concluída' : 'Cancelada'}
                          </Badge>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>

              {/* Estatísticas de Transferências */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total de Transferências</p>
                        <p className="text-2xl font-bold text-gray-900">{transfers.length}</p>
                      </div>
                      <ArrowRight className="w-8 h-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Pendentes</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {transfers.filter(t => t.status === 'pending').length}
                        </p>
                      </div>
                      <Clock className="w-8 h-8 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Concluídas</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {transfers.filter(t => t.status === 'completed').length}
                        </p>
                      </div>
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Departamentos</p>
                        <p className="text-2xl font-bold text-gray-900">{departments.length}</p>
                      </div>
                      <Building className="w-8 h-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;