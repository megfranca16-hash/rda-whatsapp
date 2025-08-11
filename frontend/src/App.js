import React, { useState, useEffect } from 'react';
import './App.css';
import { Card, CardHeader, CardTitle, CardContent } from './components/ui/card';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Badge } from './components/ui/badge';
import { Avatar, AvatarFallback } from './components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/tabs';
import { Alert, AlertDescription } from './components/ui/alert';
import LandingPage from './components/LandingPage';
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
  Briefcase,
  X
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
  const [assistants, setAssistants] = useState([]);
  const [editingAssistant, setEditingAssistant] = useState(null);
  const [assistantForm, setAssistantForm] = useState({
    name: '',
    avatar_url: '',
    manual_instructions: '',
    signature_template: '',
    phone_number: '',
    department_id: '',
    enabled: true,
    supports_pdf: true,
    supports_image: true,
    supports_audio: true,
    message_limit: 100
  });
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [newDepartment, setNewDepartment] = useState({
    name: '',
    description: '',
    whatsapp_number: '',
    integration_mode: 'qr'
  });
  const [creatingDepartment, setCreatingDepartment] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);
  
  // Debug: Force show modal for testing
  // console.log('showAddContact state:', showAddContact);
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [newContact, setNewContact] = useState({
    name: '',
    phone: '',
    email: '',
    company: '',
    notes: ''
  });
  const [newAppointment, setNewAppointment] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    client: '',
    type: 'meeting'
  });
  const [newScheduledMessage, setNewScheduledMessage] = useState({
    title: '',
    message: '',
    recipients: '',
    schedule_date: '',
    schedule_time: '',
    campaign_type: 'individual'
  });

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
      fetchAssistants();
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

  const updateDepartmentSignature = async (departmentId, signature, additionalData = {}) => {
    try {
      const token = localStorage.getItem('token');
      const updateData = { signature, ...additionalData };
      
      const response = await fetch(`${API_BASE}/api/departments/${departmentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(updateData),
      });
      
      if (response.ok) {
        // Refresh departments
        await fetchDepartments();
        setEditingDepartment(null);
        setNewSignature('');
        setNewDepartment({ name: '', description: '', whatsapp_number: '', integration_mode: 'qr' });
        alert('Departamento atualizado com sucesso!');
      } else {
        const error = await response.json();
        alert(error.detail || 'Erro ao atualizar departamento');
      }
    } catch (error) {
      console.error('Error updating department:', error);
      alert('Erro ao atualizar departamento');
    }
  };

  const fetchAssistants = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/assistants`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAssistants(data);
      }
    } catch (error) {
      console.error('Error fetching assistants:', error);
    }
  };

  const updateAssistant = async (assistantId, updateData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/assistants/${assistantId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(updateData),
      });
      
      if (response.ok) {
        await fetchAssistants();
        setEditingAssistant(null);
        alert('Assistente atualizado com sucesso!');
      } else {
        alert('Erro ao atualizar assistente');
      }
    } catch (error) {
      console.error('Error updating assistant:', error);
      alert('Erro ao atualizar assistente');
    }
  };

  const duplicateAssistant = async (assistantId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/assistants/${assistantId}/duplicate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        await fetchAssistants();
        alert('Assistente duplicado com sucesso!');
      } else {
        alert('Erro ao duplicar assistente');
      }
    } catch (error) {
      console.error('Error duplicating assistant:', error);
      alert('Erro ao duplicar assistente');
    }
  };

  const handleAvatarUpload = async (file, assistantId = null) => {
    if (!file) return null;
    
    // Validate file
    if (file.size > 1024 * 1024) { // 1MB limit
      alert('Arquivo muito grande. Limite: 1MB');
      return null;
    }
    
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      alert('Formato não suportado. Use PNG, JPG ou WebP');
      return null;
    }
    
    setUploadingAvatar(true);
    try {
      // Convert to base64 for simple storage (in production, use proper file upload)
      const reader = new FileReader();
      return new Promise((resolve) => {
        reader.onload = () => {
          const base64 = reader.result;
          setUploadingAvatar(false);
          resolve(base64);
        };
        reader.readAsDataURL(file);
      });
    } catch (error) {
      setUploadingAvatar(false);
      alert('Erro ao fazer upload do avatar');
      return null;
    }
  };

  const createDepartment = async () => {
    if (!newDepartment.name.trim() || !newDepartment.whatsapp_number.trim()) {
      alert('Nome e número do WhatsApp são obrigatórios');
      return;
    }
    
    setCreatingDepartment(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/departments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newDepartment.name,
          description: newDepartment.description,
          whatsapp_number: newDepartment.whatsapp_number,
          integration_mode: newDepartment.integration_mode
        })
      });
      
      if (response.ok) {
        await fetchDepartments();
        setNewDepartment({
          name: '',
          description: '',
          whatsapp_number: '',
          integration_mode: 'qr'
        });
        alert('Departamento criado com sucesso!');
      } else {
        const error = await response.json();
        alert(error.detail || 'Erro ao criar departamento');
      }
    } catch (error) {
      console.error('Error creating department:', error);
      alert('Erro ao criar departamento');
    }
    setCreatingDepartment(false);
  };

  const createContact = async () => {
    if (!newContact.name.trim() || !newContact.phone.trim()) {
      alert('Nome e telefone são obrigatórios');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/contacts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newContact.name,
          phone: newContact.phone,
          email: newContact.email,
          company: newContact.company,
          notes: newContact.notes
        })
      });
      
      if (response.ok) {
        await fetchContacts();
        setNewContact({
          name: '',
          phone: '',
          email: '',
          company: '',
          notes: ''
        });
        setShowAddContact(false);
        alert('Contato adicionado com sucesso!');
      } else {
        const error = await response.json();
        alert(error.detail || 'Erro ao criar contato');
      }
    } catch (error) {
      console.error('Error creating contact:', error);
      alert('Erro ao criar contato');
    }
  };

  const createAppointment = async () => {
    if (!newAppointment.title.trim() || !newAppointment.date || !newAppointment.time) {
      alert('Título, data e horário são obrigatórios');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/appointments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: newAppointment.title,
          description: newAppointment.description,
          scheduled_date: `${newAppointment.date}T${newAppointment.time}:00`,
          client_name: newAppointment.client,
          appointment_type: newAppointment.type
        })
      });
      
      if (response.ok) {
        setNewAppointment({
          title: '',
          description: '',
          date: '',
          time: '',
          client: '',
          type: 'meeting'
        });
        setShowNewAppointment(false);
        alert('Agendamento criado com sucesso!');
      } else {
        const error = await response.json();
        alert(error.detail || 'Erro ao criar agendamento');
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
      alert('Erro ao criar agendamento');
    }
  };

  const createScheduledMessage = async () => {
    if (!newScheduledMessage.title.trim() || !newScheduledMessage.message.trim() || !newScheduledMessage.schedule_date) {
      alert('Título, mensagem e data são obrigatórios');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/scheduled-messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: newScheduledMessage.title,
          message: newScheduledMessage.message,
          recipients: newScheduledMessage.recipients.split(',').map(r => r.trim()),
          scheduled_date: `${newScheduledMessage.schedule_date}T${newScheduledMessage.schedule_time || '09:00'}:00`,
          campaign_type: newScheduledMessage.campaign_type
        })
      });
      
      if (response.ok) {
        setNewScheduledMessage({
          title: '',
          message: '',
          recipients: '',
          schedule_date: '',
          schedule_time: '',
          campaign_type: 'individual'
        });
        setShowNewMessage(false);
        alert('Mensagem programada criada com sucesso!');
      } else {
        const error = await response.json();
        alert(error.detail || 'Erro ao criar mensagem programada');
      }
    } catch (error) {
      console.error('Error creating scheduled message:', error);
      alert('Erro ao criar mensagem programada');
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

  // Show demo page if requested
  if (window.location.pathname === '/demo') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-3xl text-white mb-2">Demonstração - Empresas Web</CardTitle>
              <p className="text-slate-300">Veja como funciona nosso sistema CRM + WhatsApp + IA</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white">Recursos Principais</h3>
                <ul className="space-y-2 text-slate-300">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span>7 Assistentes IA Especializados</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span>Integração Completa WhatsApp</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span>CRM Avançado para Contabilidade</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span>Atendimento 24/7 Automatizado</span>
                  </li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white">Departamentos Especializados</h3>
                <ul className="space-y-2 text-slate-300 text-sm">
                  <li>• Abertura de Empresa</li>
                  <li>• Dúvidas Contábeis</li>
                  <li>• RH e Folha de Pagamento</li>
                  <li>• Tributos e Impostos</li>
                  <li>• Emissão de Notas Fiscais</li>
                  <li>• Consultoria Geral</li>
                  <li>• Financeiro</li>
                </ul>
              </div>
            </div>
            
            <div className="text-center space-y-4">
              <p className="text-slate-300">Pronto para começar? Crie sua conta gratuita!</p>
              <div className="space-x-4">
                <Button 
                  onClick={() => window.location.href = '/'}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2"
                >
                  Criar Conta Gratuita
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = '/'}
                  className="border-white/20 text-white hover:bg-white/10 px-6 py-2"
                >
                  Voltar ao Início
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show landing page if not authenticated
  if (!isAuthenticated) {
    return <LandingPage onLoginSuccess={() => {
      setIsAuthenticated(true);
      setCurrentTab('dashboard');
    }} />;
  }

  // Show login screen
  if (currentTab === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl text-white mb-2">Empresas Web</CardTitle>
              <p className="text-slate-300">CRM + WhatsApp + IA</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="Username"
                  value={loginData.username}
                  onChange={(e) => setLoginData({...loginData, username: e.target.value})}
                  className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:bg-white/20"
                  required
                />
              </div>
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                  className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:bg-white/20"
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg"
                disabled={loading}
              >
                {loading ? 'Entrando...' : 'Entrar no Sistema'}
              </Button>
            </form>
            
            <div className="text-center">
              <Button 
                variant="ghost" 
                onClick={() => setCurrentTab('dashboard')}
                className="text-slate-300 hover:text-white hover:bg-white/10"
              >
                ← Voltar
              </Button>
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
            <nav className="flex-1 space-y-1">
              <Button
                variant="ghost"
                className={`w-full transition-all duration-200 text-sm ${
                  currentTab === 'dashboard' 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                } ${sidebarCollapsed ? 'justify-center p-2' : 'justify-start px-3 py-2'}`}
                onClick={() => setCurrentTab('dashboard')}
              >
                <Home className="w-4 h-4" />
                {!sidebarCollapsed && <span className="ml-2">Dashboard</span>}
              </Button>
              
              <Button
                variant="ghost"
                className={`w-full transition-all duration-200 text-sm ${
                  currentTab === 'whatsapp' 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg hover:shadow-xl' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                } ${sidebarCollapsed ? 'justify-center p-2' : 'justify-start px-3 py-2'}`}
                onClick={() => setCurrentTab('whatsapp')}
              >
                <MessageSquare className="w-4 h-4" />
                {!sidebarCollapsed && <span className="ml-2">Atendimentos</span>}
              </Button>
              
              <Button
                variant="ghost"
                className={`w-full transition-all duration-200 text-sm ${
                  currentTab === 'contacts' 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg hover:shadow-xl' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                } ${sidebarCollapsed ? 'justify-center p-2' : 'justify-start px-3 py-2'}`}
                onClick={() => setCurrentTab('contacts')}
              >
                <Users className="w-4 h-4" />
                {!sidebarCollapsed && <span className="ml-2">Contatos</span>}
              </Button>

              <Button
                variant="ghost"
                className={`w-full transition-all duration-200 text-sm ${
                  currentTab === 'crm' 
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg hover:shadow-xl' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                } ${sidebarCollapsed ? 'justify-center p-2' : 'justify-start px-3 py-2'}`}
                onClick={() => setCurrentTab('crm')}
              >
                <BarChart3 className="w-4 h-4" />
                {!sidebarCollapsed && <span className="ml-2">CRM</span>}
              </Button>

              <Button
                variant="ghost"
                className={`w-full transition-all duration-200 text-sm ${
                  currentTab === 'agenda' 
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg hover:shadow-xl' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                } ${sidebarCollapsed ? 'justify-center p-2' : 'justify-start px-3 py-2'}`}
                onClick={() => setCurrentTab('agenda')}
              >
                <Clock className="w-4 h-4" />
                {!sidebarCollapsed && <span className="ml-2">Agenda</span>}
              </Button>

              <Button
                variant="ghost"
                className={`w-full transition-all duration-200 text-sm ${
                  currentTab === 'mensagens' 
                    ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg hover:shadow-xl' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                } ${sidebarCollapsed ? 'justify-center p-2' : 'justify-start px-3 py-2'}`}
                onClick={() => setCurrentTab('mensagens')}
              >
                <Send className="w-4 h-4" />
                {!sidebarCollapsed && <span className="ml-2">Mensagens Programadas</span>}
              </Button>
              
              <Button
                variant="ghost"
                className={`w-full transition-all duration-200 text-sm ${
                  currentTab === 'ai' 
                    ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg hover:shadow-xl' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                } ${sidebarCollapsed ? 'justify-center p-2' : 'justify-start px-3 py-2'}`}
                onClick={() => setCurrentTab('ai')}
              >
                <Bot className="w-4 h-4" />
                {!sidebarCollapsed && <span className="ml-2">Assistentes IA</span>}
              </Button>
              
              <Button
                variant="ghost"
                className={`w-full transition-all duration-200 text-sm ${
                  currentTab === 'assistants' 
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg hover:shadow-xl' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                } ${sidebarCollapsed ? 'justify-center p-2' : 'justify-start px-3 py-2'}`}
                onClick={() => setCurrentTab('assistants')}
              >
                <UserCog className="w-4 h-4" />
                {!sidebarCollapsed && <span className="ml-2">Gestão de IAs</span>}
              </Button>
              
              <Button
                variant="ghost"
                className={`w-full transition-all duration-200 text-sm ${
                  currentTab === 'departments' 
                    ? 'bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-lg hover:shadow-xl' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                } ${sidebarCollapsed ? 'justify-center p-2' : 'justify-start px-3 py-2'}`}
                onClick={() => setCurrentTab('departments')}
              >
                <Briefcase className="w-4 h-4" />
                {!sidebarCollapsed && <span className="ml-2">Departamentos</span>}
              </Button>
              
              <Button
                variant="ghost"
                className={`w-full transition-all duration-200 text-sm ${
                  currentTab === 'admin' 
                    ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg hover:shadow-xl' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                } ${sidebarCollapsed ? 'justify-center p-2' : 'justify-start px-3 py-2'}`}
                onClick={() => setCurrentTab('admin')}
              >
                <Settings className="w-4 h-4" />
                {!sidebarCollapsed && <span className="ml-2">Administração</span>}
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
              {/* Left Column - Conversation List */}
              <div className="w-80 bg-white border-r border-slate-200 flex flex-col">
                {/* Search Header */}
                <div className="p-4 border-b border-slate-200">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="Buscar conversas..."
                      className="pl-10 bg-slate-50 border-slate-200"
                    />
                  </div>
                  
                  {/* Filters */}
                  <div className="flex items-center space-x-2 mt-3">
                    <Badge variant="secondary" className="text-xs cursor-pointer hover:bg-slate-200">
                      Todas
                    </Badge>
                    <Badge variant="outline" className="text-xs cursor-pointer hover:bg-slate-50">
                      Não lidas (3)
                    </Badge>
                    <Badge variant="outline" className="text-xs cursor-pointer hover:bg-slate-50">
                      Grupos
                    </Badge>
                  </div>
                </div>

                {/* Conversations List */}
                <div className="flex-1 overflow-y-auto">
                  {contacts.slice(0, 10).map((contact, index) => {
                    const isActive = selectedContact?.id === contact.id;
                    const unreadCount = Math.floor(Math.random() * 3);
                    const lastMessage = "Olá, preciso de ajuda com contabilidade...";
                    const timestamp = "14:35";
                    
                    return (
                      <div
                        key={contact.id}
                        onClick={() => setSelectedContact(contact)}
                        className={`p-4 border-b border-slate-100 cursor-pointer transition-colors hover:bg-slate-50 ${
                          isActive ? 'bg-blue-50 border-r-2 border-r-blue-500' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="relative">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                              {contact.name.charAt(0).toUpperCase()}
                            </div>
                            {Math.random() > 0.5 && (
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className={`font-medium truncate ${isActive ? 'text-blue-900' : 'text-slate-900'}`}>
                                {contact.name}
                              </h3>
                              <span className="text-xs text-slate-500">{timestamp}</span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <p className="text-sm text-slate-600 truncate pr-2">
                                {lastMessage}
                              </p>
                              {unreadCount > 0 && (
                                <Badge variant="default" className="bg-blue-500 text-white rounded-full w-5 h-5 p-0 flex items-center justify-center text-xs">
                                  {unreadCount}
                                </Badge>
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                Contabilidade
                              </Badge>
                              {Math.random() > 0.7 && (
                                <div className="w-4 h-4 text-slate-400">
                                  <MessageCircle className="w-3 h-3" />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Center Column - Chat Thread */}
              <div className="flex-1 flex flex-col bg-slate-50">
                {selectedContact ? (
                  <>
                    {/* Chat Header */}
                    <div className="bg-white border-b border-slate-200 p-4 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {selectedContact.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">{selectedContact.name}</h3>
                          <p className="text-sm text-slate-500">{selectedContact.phone_number}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <ArrowRight className="w-4 h-4 mr-1" />
                          Transferir
                        </Button>
                        <Button variant="outline" size="sm">
                          Etiquetas
                        </Button>
                        <Button variant="outline" size="sm">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 p-4 overflow-y-auto space-y-4">
                      {/* Incoming Message */}
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                          {selectedContact.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="bg-white rounded-2xl rounded-bl-sm p-3 shadow-sm max-w-xs">
                            <p className="text-slate-800">Olá, preciso de ajuda com questões contábeis da minha empresa</p>
                          </div>
                          <p className="text-xs text-slate-500 mt-1 ml-1">14:30</p>
                        </div>
                      </div>

                      {/* AI Response */}
                      <div className="flex items-start space-x-3 justify-end">
                        <div className="flex-1 flex justify-end">
                          <div className="bg-blue-500 text-white rounded-2xl rounded-br-sm p-3 shadow-sm max-w-xs">
                            <p>Olá! Sou especialista em contabilidade. Como posso ajudá-lo com suas questões contábeis?</p>
                          </div>
                        </div>
                        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm">
                          <Bot className="w-4 h-4" />
                        </div>
                      </div>

                      {/* Internal Note */}
                      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mx-8">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
                            Nota Interna
                          </Badge>
                          <span className="text-xs text-slate-500">Admin • 14:35</span>
                        </div>
                        <p className="text-sm text-slate-700">Cliente parece interessado em serviços contábeis completos</p>
                      </div>

                      {/* Typing Indicator */}
                      <div className="flex items-center space-x-2 text-slate-500 text-sm">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></div>
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></div>
                        </div>
                        <span>IA digitando...</span>
                      </div>
                    </div>

                    {/* Reply Bar */}
                    <div className="bg-white border-t border-slate-200 p-4">
                      <div className="flex items-end space-x-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Button variant="outline" size="sm" className="text-xs">
                              😀
                            </Button>
                            <Button variant="outline" size="sm" className="text-xs">
                              📎
                            </Button>
                            <Button variant="outline" size="sm" className="text-xs">
                              🎤
                            </Button>
                            <Button variant="outline" size="sm" className="text-xs">
                              🤖 IA
                            </Button>
                          </div>
                          <div className="relative">
                            <textarea
                              value={message}
                              onChange={(e) => setMessage(e.target.value)}
                              placeholder="Digite sua mensagem... (Ctrl+Enter para enviar)"
                              className="w-full p-3 border border-slate-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                              rows={2}
                              maxLength={5000}
                            />
                            <div className="absolute bottom-2 right-2 text-xs text-slate-400">
                              {message.length}/5000
                            </div>
                          </div>
                        </div>
                        <Button
                          onClick={() => {
                            if (message.trim()) {
                              // Send message logic here
                              setMessage('');
                            }
                          }}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl"
                          disabled={!message.trim()}
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center text-slate-500">
                      <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-medium mb-2">Selecione uma conversa</h3>
                      <p>Escolha uma conversa na lista para começar</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Contact Info */}
              {selectedContact && (
                <div className="w-80 bg-white border-l border-slate-200 p-4 overflow-y-auto">
                  <div className="space-y-6">
                    {/* Contact Header */}
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-3">
                        {selectedContact.name.charAt(0).toUpperCase()}
                      </div>
                      <h3 className="font-semibold text-slate-900">{selectedContact.name}</h3>
                      <p className="text-sm text-slate-500">{selectedContact.phone_number}</p>
                      <div className="flex items-center justify-center space-x-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          Contato Salvo
                        </Badge>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div>
                      <h4 className="font-medium text-slate-900 mb-3">Informações</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Email:</span>
                          <span className="text-slate-900">{selectedContact.email || 'Não informado'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Empresa:</span>
                          <span className="text-slate-900">{selectedContact.company || 'Não informado'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Departamento:</span>
                          <Badge variant="secondary" className="text-xs">
                            Contabilidade
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Tags */}
                    <div>
                      <h4 className="font-medium text-slate-900 mb-3">Etiquetas</h4>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-xs">
                          Cliente
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Interessado
                        </Badge>
                        <Button variant="outline" size="sm" className="h-6 text-xs">
                          + Adicionar
                        </Button>
                      </div>
                    </div>

                    {/* Internal Notes */}
                    <div>
                      <h4 className="font-medium text-slate-900 mb-3">Anotações</h4>
                      <div className="space-y-2">
                        <div className="bg-slate-50 rounded-lg p-3">
                          <p className="text-sm text-slate-700">Cliente interessado em serviços contábeis</p>
                          <p className="text-xs text-slate-500 mt-1">Admin • Hoje 14:35</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="w-full mt-2 text-xs">
                        + Nova Anotação
                      </Button>
                    </div>

                    {/* CRM Actions */}
                    <div>
                      <h4 className="font-medium text-slate-900 mb-3">Ações CRM</h4>
                      <div className="space-y-2">
                        <Button variant="outline" className="w-full justify-start text-sm">
                          <BarChart3 className="w-4 h-4 mr-2" />
                          Criar Oportunidade
                        </Button>
                        <Button variant="outline" className="w-full justify-start text-sm">
                          <Users className="w-4 h-4 mr-2" />
                          Ver Histórico
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentTab === 'crm' && (
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">CRM</h2>
                  <p className="text-slate-600">Gestão completa de relacionamento com clientes</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="shadow-lg border-slate-200">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-slate-200">
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="w-5 h-5 text-blue-500" />
                      <span className="text-slate-900">Pipeline de Vendas</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Leads</span>
                        <Badge variant="secondary">25</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Propostas</span>
                        <Badge variant="secondary">12</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Fechamentos</span>
                        <Badge variant="default">8</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg border-slate-200">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 border-b border-slate-200">
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="w-5 h-5 text-green-500" />
                      <span className="text-slate-900">Métricas</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Taxa de Conversão</span>
                        <span className="text-sm font-semibold text-green-600">32%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Ticket Médio</span>
                        <span className="text-sm font-semibold text-blue-600">R$ 2.450</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Tempo Médio</span>
                        <span className="text-sm font-semibold text-purple-600">18 dias</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg border-slate-200">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-slate-200">
                    <CardTitle className="flex items-center space-x-2">
                      <Zap className="w-5 h-5 text-purple-500" />
                      <span className="text-slate-900">Automações</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Follow-ups</span>
                        <Badge variant="default" className="bg-green-500">Ativo</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Nutrição</span>
                        <Badge variant="default" className="bg-blue-500">Ativo</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Remarketing</span>
                        <Badge variant="outline">Pausado</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="shadow-lg border-slate-200">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200">
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-slate-600" />
                    <span className="text-slate-900">Kanban - Pipeline de Vendas</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-slate-50 rounded-lg p-4">
                      <h4 className="font-semibold text-slate-700 mb-3">Leads (25)</h4>
                      <div className="space-y-2">
                        <div className="bg-white p-3 rounded border-l-4 border-l-blue-500 shadow-sm">
                          <p className="text-sm font-medium">João Silva</p>
                          <p className="text-xs text-slate-500">Contabilidade</p>
                        </div>
                        <div className="bg-white p-3 rounded border-l-4 border-l-blue-500 shadow-sm">
                          <p className="text-sm font-medium">Maria Santos</p>
                          <p className="text-xs text-slate-500">Abertura de Empresa</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <h4 className="font-semibold text-yellow-700 mb-3">Propostas (12)</h4>
                      <div className="space-y-2">
                        <div className="bg-white p-3 rounded border-l-4 border-l-yellow-500 shadow-sm">
                          <p className="text-sm font-medium">Pedro Costa</p>
                          <p className="text-xs text-slate-500">R$ 2.500/mês</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-orange-50 rounded-lg p-4">
                      <h4 className="font-semibold text-orange-700 mb-3">Negociação (8)</h4>
                      <div className="space-y-2">
                        <div className="bg-white p-3 rounded border-l-4 border-l-orange-500 shadow-sm">
                          <p className="text-sm font-medium">Ana Lima</p>
                          <p className="text-xs text-slate-500">Aguardando assinatura</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="font-semibold text-green-700 mb-3">Fechados (8)</h4>
                      <div className="space-y-2">
                        <div className="bg-white p-3 rounded border-l-4 border-l-green-500 shadow-sm">
                          <p className="text-sm font-medium">Carlos Mendes</p>
                          <p className="text-xs text-slate-500">Cliente ativo</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {currentTab === 'agenda' && (
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">Agenda</h2>
                  <p className="text-slate-600">Agendamentos e compromissos</p>
                </div>
                <Button onClick={() => setShowNewAppointment(true)} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  Novo Agendamento
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card className="shadow-lg border-slate-200">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-slate-200">
                      <CardTitle>Calendário - Janeiro 2025</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-7 gap-2 text-center text-sm">
                        <div className="font-semibold text-slate-600 p-2">Dom</div>
                        <div className="font-semibold text-slate-600 p-2">Seg</div>
                        <div className="font-semibold text-slate-600 p-2">Ter</div>
                        <div className="font-semibold text-slate-600 p-2">Qua</div>
                        <div className="font-semibold text-slate-600 p-2">Qui</div>
                        <div className="font-semibold text-slate-600 p-2">Sex</div>
                        <div className="font-semibold text-slate-600 p-2">Sáb</div>
                        
                        {Array.from({length: 31}, (_, i) => (
                          <div key={i} className={`p-2 rounded cursor-pointer hover:bg-blue-50 ${
                            i === 9 ? 'bg-blue-500 text-white' : 
                            i === 15 || i === 22 ? 'bg-green-100 text-green-700' : ''
                          }`}>
                            {i + 1}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <Card className="shadow-lg border-slate-200">
                    <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 border-b border-slate-200">
                      <CardTitle>Próximos Compromissos</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                          <div>
                            <p className="font-medium text-slate-900">Reunião João Silva</p>
                            <p className="text-sm text-slate-600">Hoje, 14:00</p>
                            <p className="text-xs text-slate-500">Revisão contábil</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                          <div>
                            <p className="font-medium text-slate-900">Apresentação Proposta</p>
                            <p className="text-sm text-slate-600">Amanhã, 10:00</p>
                            <p className="text-xs text-slate-500">Maria Santos - Abertura empresa</p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                          <div>
                            <p className="font-medium text-slate-900">Follow-up Pedro</p>
                            <p className="text-sm text-slate-600">Seg, 15:30</p>
                            <p className="text-xs text-slate-500">Status da proposta</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-lg border-slate-200 mt-6">
                    <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-slate-200">
                      <CardTitle>Estatísticas</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-600">Agendamentos hoje</span>
                          <Badge variant="default" className="bg-blue-500">3</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-600">Esta semana</span>
                          <Badge variant="default" className="bg-green-500">12</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-600">Taxa de comparecimento</span>
                          <span className="text-sm font-semibold text-green-600">94%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* New Appointment Modal */}
              {showNewAppointment && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <Card className="w-full max-w-2xl bg-white shadow-2xl">
                    <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 border-b border-slate-200">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center space-x-2">
                          <Clock className="w-5 h-5 text-green-500" />
                          <span>Novo Agendamento</span>
                        </CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowNewAppointment(false)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Título do Agendamento *
                          </label>
                          <Input
                            value={newAppointment.title}
                            onChange={(e) => setNewAppointment({...newAppointment, title: e.target.value})}
                            placeholder="Reunião com cliente"
                            className="bg-slate-50 border-slate-200"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Cliente/Participante
                          </label>
                          <Input
                            value={newAppointment.client}
                            onChange={(e) => setNewAppointment({...newAppointment, client: e.target.value})}
                            placeholder="Nome do cliente"
                            className="bg-slate-50 border-slate-200"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Data *
                          </label>
                          <Input
                            type="date"
                            value={newAppointment.date}
                            onChange={(e) => setNewAppointment({...newAppointment, date: e.target.value})}
                            className="bg-slate-50 border-slate-200"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Horário *
                          </label>
                          <Input
                            type="time"
                            value={newAppointment.time}
                            onChange={(e) => setNewAppointment({...newAppointment, time: e.target.value})}
                            className="bg-slate-50 border-slate-200"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Tipo
                          </label>
                          <select
                            value={newAppointment.type}
                            onChange={(e) => setNewAppointment({...newAppointment, type: e.target.value})}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md bg-slate-50"
                          >
                            <option value="meeting">Reunião</option>
                            <option value="consultation">Consultoria</option>
                            <option value="presentation">Apresentação</option>
                            <option value="follow-up">Follow-up</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Descrição
                        </label>
                        <textarea
                          value={newAppointment.description}
                          onChange={(e) => setNewAppointment({...newAppointment, description: e.target.value})}
                          placeholder="Detalhes do agendamento..."
                          className="w-full h-24 px-3 py-2 border border-slate-300 rounded-md bg-slate-50 resize-none"
                        />
                      </div>

                      <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
                        <Button
                          variant="outline"
                          onClick={() => setShowNewAppointment(false)}
                        >
                          Cancelar
                        </Button>
                        <Button
                          onClick={createAppointment}
                          className="bg-gradient-to-r from-green-600 to-blue-600 text-white"
                        >
                          <Clock className="w-4 h-4 mr-2" />
                          Criar Agendamento
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}

          {currentTab === 'mensagens' && (
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">Mensagens Programadas</h2>
                  <p className="text-slate-600">Gerencie envios agendados e campanhas</p>
                </div>
                <Button onClick={() => setShowNewMessage(true)} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  Nova Mensagem Programada
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-2xl font-bold text-blue-900 mb-1">8</p>
                    <p className="text-sm text-blue-700">Programadas</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Send className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-2xl font-bold text-green-900 mb-1">15</p>
                    <p className="text-sm text-green-700">Enviadas Hoje</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-2xl font-bold text-purple-900 mb-1">142</p>
                    <p className="text-sm text-purple-700">Destinatários</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-2xl font-bold text-orange-900 mb-1">89%</p>
                    <p className="text-sm text-orange-700">Taxa Entrega</p>
                  </CardContent>
                </Card>
              </div>

              <Card className="shadow-lg border-slate-200">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200">
                  <CardTitle className="flex items-center space-x-2">
                    <Send className="w-5 h-5 text-blue-500" />
                    <span className="text-slate-900">Campanhas Programadas</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-start space-x-4">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mt-2"></div>
                        <div>
                          <h4 className="font-semibold text-slate-900">Follow-up Leads</h4>
                          <p className="text-sm text-slate-600">Enviada para 45 contatos</p>
                          <p className="text-xs text-slate-500">Programada para: Hoje, 16:00</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="default" className="bg-blue-500">Aguardando</Badge>
                        <Button variant="ghost" size="sm">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-start space-x-4">
                        <div className="w-3 h-3 bg-green-500 rounded-full mt-2"></div>
                        <div>
                          <h4 className="font-semibold text-slate-900">Newsletter Semanal</h4>
                          <p className="text-sm text-slate-600">Enviada para 128 clientes</p>
                          <p className="text-xs text-slate-500">Enviada: Ontem, 09:00</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="default" className="bg-green-500">Enviada</Badge>
                        <Button variant="ghost" size="sm">
                          <BarChart3 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="flex items-start space-x-4">
                        <div className="w-3 h-3 bg-purple-500 rounded-full mt-2"></div>
                        <div>
                          <h4 className="font-semibold text-slate-900">Promoção Fim de Ano</h4>
                          <p className="text-sm text-slate-600">Será enviada para 89 leads</p>
                          <p className="text-xs text-slate-500">Programada para: Amanhã, 10:00</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">Rascunho</Badge>
                        <Button variant="ghost" size="sm">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* New Scheduled Message Modal */}
              {showNewMessage && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <Card className="w-full max-w-3xl bg-white shadow-2xl max-h-[90vh] overflow-y-auto">
                    <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-slate-200">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center space-x-2">
                          <Send className="w-5 h-5 text-purple-500" />
                          <span>Nova Mensagem Programada</span>
                        </CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowNewMessage(false)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Título da Campanha *
                          </label>
                          <Input
                            value={newScheduledMessage.title}
                            onChange={(e) => setNewScheduledMessage({...newScheduledMessage, title: e.target.value})}
                            placeholder="Nome da campanha"
                            className="bg-slate-50 border-slate-200"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Tipo de Campanha
                          </label>
                          <select
                            value={newScheduledMessage.campaign_type}
                            onChange={(e) => setNewScheduledMessage({...newScheduledMessage, campaign_type: e.target.value})}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md bg-slate-50"
                          >
                            <option value="individual">Mensagem Individual</option>
                            <option value="broadcast">Broadcast</option>
                            <option value="follow-up">Follow-up</option>
                            <option value="newsletter">Newsletter</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Mensagem *
                        </label>
                        <textarea
                          value={newScheduledMessage.message}
                          onChange={(e) => setNewScheduledMessage({...newScheduledMessage, message: e.target.value})}
                          placeholder="Digite a mensagem que será enviada..."
                          className="w-full h-32 px-3 py-2 border border-slate-300 rounded-md bg-slate-50 resize-none"
                          required
                        />
                        <p className="text-xs text-slate-500 mt-1">
                          Caracteres: {newScheduledMessage.message.length}/1000
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Destinatários (números separados por vírgula)
                        </label>
                        <textarea
                          value={newScheduledMessage.recipients}
                          onChange={(e) => setNewScheduledMessage({...newScheduledMessage, recipients: e.target.value})}
                          placeholder="+5511999999999, +5511888888888, +5511777777777"
                          className="w-full h-20 px-3 py-2 border border-slate-300 rounded-md bg-slate-50 resize-none"
                        />
                        <p className="text-xs text-slate-500 mt-1">
                          Quantidade de números: {newScheduledMessage.recipients.split(',').filter(r => r.trim()).length}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Data de Envio *
                          </label>
                          <Input
                            type="date"
                            value={newScheduledMessage.schedule_date}
                            onChange={(e) => setNewScheduledMessage({...newScheduledMessage, schedule_date: e.target.value})}
                            className="bg-slate-50 border-slate-200"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Horário de Envio
                          </label>
                          <Input
                            type="time"
                            value={newScheduledMessage.schedule_time}
                            onChange={(e) => setNewScheduledMessage({...newScheduledMessage, schedule_time: e.target.value})}
                            className="bg-slate-50 border-slate-200"
                          />
                        </div>
                      </div>

                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-white text-xs font-bold">!</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-yellow-800 mb-1">Informações Importantes</h4>
                            <ul className="text-sm text-yellow-700 space-y-1">
                              <li>• As mensagens serão enviadas automaticamente na data/hora programada</li>
                              <li>• Certifique-se de que todos os números estão no formato correto</li>
                              <li>• Respeite as políticas do WhatsApp para evitar bloqueios</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
                        <Button
                          variant="outline"
                          onClick={() => setShowNewMessage(false)}
                        >
                          Cancelar
                        </Button>
                        <Button
                          onClick={createScheduledMessage}
                          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Programar Mensagem
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}

          {currentTab === 'contacts' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Contatos</h2>
                  <p className="text-gray-600">Gerencie seus contatos do WhatsApp</p>
                </div>
                <Button onClick={() => {
                  console.log('Adicionar Contato button clicked!');
                  setShowAddContact(true);
                }}>
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
                <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
                  7 Assistentes de IA Especializados
                </h2>
                <p className="text-slate-600">Assistentes inteligentes para cada área do seu negócio</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {departments.map((department, index) => {
                  const gradients = [
                    'from-blue-500 to-cyan-500',
                    'from-green-500 to-emerald-500', 
                    'from-purple-500 to-violet-500',
                    'from-orange-500 to-red-500',
                    'from-pink-500 to-rose-500',
                    'from-indigo-500 to-blue-500',
                    'from-yellow-500 to-orange-500'
                  ];
                  
                  return (
                    <Card key={department.id} className="shadow-lg border-slate-200 hover:shadow-xl transition-shadow duration-300">
                      <CardHeader className={`bg-gradient-to-br ${gradients[index % 7]} text-white rounded-t-lg`}>
                        <CardTitle className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                            <Bot className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold">{department.name}</h3>
                            <p className="text-sm opacity-90">{department.description}</p>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Badge variant={department.active ? "default" : "secondary"} 
                                   className={department.active ? "bg-green-500" : ""}>
                              {department.active ? "✅ Ativo" : "⏸️ Inativo"}
                            </Badge>
                            <div className="text-xs text-slate-500">
                              IA Emergent LLM
                            </div>
                          </div>

                          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                            <h4 className="text-sm font-semibold text-slate-700 mb-2">
                              🧠 Especialidades da IA:
                            </h4>
                            <p className="text-sm text-slate-600 leading-relaxed">
                              {department.manual_instructions || 
                               "Assistente especializado em fornecer informações e suporte para este departamento."}
                            </p>
                          </div>

                          <div className="bg-white rounded-lg p-4 border border-slate-200">
                            <h4 className="text-sm font-semibold text-slate-700 mb-2">
                              📝 Assinatura Automática:
                            </h4>
                            <pre className="text-xs text-slate-600 whitespace-pre-wrap font-mono">
                              {department.signature || "Assinatura não configurada"}
                            </pre>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                              <span className="text-xs text-slate-600">Online 24/7</span>
                            </div>
                            <Button size="sm" variant="outline" 
                                    className="text-xs px-3 py-1">
                              <MessageCircle className="w-3 h-3 mr-1" />
                              Testar IA
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* AI System Overview */}
              <Card className="shadow-lg border-slate-200">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200">
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    <span className="text-slate-900">Sistema de IA Avançado</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <Bot className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-slate-900 mb-1">Multi-Model AI</h3>
                      <p className="text-sm text-slate-600">ChatGPT, Gemini & Claude</p>
                    </div>

                    <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
                      <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <Shield className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-slate-900 mb-1">Instruções Customizáveis</h3>
                      <p className="text-sm text-slate-600">Personalize cada assistente</p>
                    </div>

                    <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-200">
                      <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <Globe className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-slate-900 mb-1">Contexto Empresarial</h3>
                      <p className="text-sm text-slate-600">Integrado com perfil da empresa</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Add Contact Modal */}
              {showAddContact && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <Card className="w-full max-w-2xl bg-white shadow-2xl">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-slate-200">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center space-x-2">
                          <User className="w-5 h-5 text-blue-500" />
                          <span>Adicionar Novo Contato</span>
                        </CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowAddContact(false)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Nome Completo *
                          </label>
                          <Input
                            value={newContact.name}
                            onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                            placeholder="João Silva"
                            className="bg-slate-50 border-slate-200"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Telefone/WhatsApp *
                          </label>
                          <Input
                            value={newContact.phone}
                            onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                            placeholder="+55 11 99999-9999"
                            className="bg-slate-50 border-slate-200"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Email
                          </label>
                          <Input
                            type="email"
                            value={newContact.email}
                            onChange={(e) => setNewContact({...newContact, email: e.target.value})}
                            placeholder="joao@empresa.com"
                            className="bg-slate-50 border-slate-200"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Empresa
                          </label>
                          <Input
                            value={newContact.company}
                            onChange={(e) => setNewContact({...newContact, company: e.target.value})}
                            placeholder="Nome da Empresa"
                            className="bg-slate-50 border-slate-200"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Observações
                        </label>
                        <textarea
                          value={newContact.notes}
                          onChange={(e) => setNewContact({...newContact, notes: e.target.value})}
                          placeholder="Informações adicionais sobre o contato..."
                          className="w-full h-24 px-3 py-2 border border-slate-300 rounded-md bg-slate-50 resize-none"
                        />
                      </div>

                      <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
                        <Button
                          variant="outline"
                          onClick={() => setShowAddContact(false)}
                        >
                          Cancelar
                        </Button>
                        <Button
                          onClick={createContact}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                        >
                          <User className="w-4 h-4 mr-2" />
                          Adicionar Contato
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}

          {currentTab === 'departments' && (
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Departamentos</h2>
                  <p className="text-gray-600">Gerencie departamentos e transferências de chamadas</p>
                </div>
                <Button onClick={() => setCreatingDepartment(true)} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
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
                          <div className="flex-1">
                            {editingDepartment === department.id ? (
                              <div className="space-y-2">
                                <Input
                                  value={newDepartment.name || department.name}
                                  onChange={(e) => setNewDepartment({...newDepartment, name: e.target.value})}
                                  placeholder="Nome do departamento"
                                  className="bg-white border-slate-300 text-slate-900 font-medium"
                                />
                                <Input
                                  value={newDepartment.description || department.description}
                                  onChange={(e) => setNewDepartment({...newDepartment, description: e.target.value})}
                                  placeholder="Descrição do departamento"
                                  className="bg-white border-slate-300 text-sm"
                                />
                              </div>
                            ) : (
                              <div>
                                <p className="font-medium text-slate-900">{department.name}</p>
                                <p className="text-sm text-slate-600">{department.description}</p>
                                {department.whatsapp_number && (
                                  <p className="text-xs text-slate-500 mt-1">
                                    WhatsApp: {department.whatsapp_number} 
                                    {department.integration_mode && (
                                      <span className="ml-2 text-blue-600">
                                        ({department.integration_mode === 'qr' ? 'QR Code' : 'API Oficial'})
                                      </span>
                                    )}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={department.active ? "default" : "secondary"}>
                              {department.active ? "Ativo" : "Inativo"}
                            </Badge>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                if (editingDepartment === department.id) {
                                  // Save changes
                                  const updateData = {};
                                  if (newDepartment.name && newDepartment.name !== department.name) {
                                    updateData.name = newDepartment.name;
                                  }
                                  if (newDepartment.description !== undefined && newDepartment.description !== department.description) {
                                    updateData.description = newDepartment.description;
                                  }
                                  if (newSignature !== department.signature) {
                                    updateData.signature = newSignature;
                                  }
                                  
                                  if (Object.keys(updateData).length > 0) {
                                    updateDepartmentSignature(department.id, newSignature, updateData);
                                  }
                                  
                                  setEditingDepartment(null);
                                  setNewDepartment({ name: '', description: '', whatsapp_number: '', integration_mode: 'qr' });
                                  setNewSignature('');
                                } else {
                                  // Start editing
                                  setEditingDepartment(department.id);
                                  setNewSignature(department.signature || '');
                                  setNewDepartment({
                                    name: department.name,
                                    description: department.description,
                                    whatsapp_number: department.whatsapp_number || '',
                                    integration_mode: department.integration_mode || 'qr'
                                  });
                                }
                              }}
                            >
                              {editingDepartment === department.id ? 'Salvar' : 'Editar'}
                            </Button>
                            {editingDepartment === department.id && (
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => {
                                  setEditingDepartment(null);
                                  setNewDepartment({ name: '', description: '', whatsapp_number: '', integration_mode: 'qr' });
                                  setNewSignature('');
                                }}
                              >
                                Cancelar
                              </Button>
                            )}
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

              {/* Create Department Modal */}
              {creatingDepartment && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <Card className="w-full max-w-2xl bg-white shadow-2xl">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-slate-200">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center space-x-2">
                          <Building className="w-5 h-5 text-blue-500" />
                          <span>Novo Departamento</span>
                        </CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setCreatingDepartment(false);
                            setNewDepartment({
                              name: '',
                              description: '',
                              whatsapp_number: '',
                              integration_mode: 'qr'
                            });
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Nome do Departamento *
                          </label>
                          <Input
                            value={newDepartment.name}
                            onChange={(e) => setNewDepartment({...newDepartment, name: e.target.value})}
                            placeholder="Ex: Suporte Técnico"
                            className="bg-slate-50 border-slate-200"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Número WhatsApp *
                          </label>
                          <Input
                            value={newDepartment.whatsapp_number}
                            onChange={(e) => setNewDepartment({...newDepartment, whatsapp_number: e.target.value})}
                            placeholder="+55 11 99999-9999"
                            className="bg-slate-50 border-slate-200"
                            required
                          />
                          <p className="text-xs text-slate-500 mt-1">Número único para este departamento</p>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Descrição
                        </label>
                        <Input
                          value={newDepartment.description}
                          onChange={(e) => setNewDepartment({...newDepartment, description: e.target.value})}
                          placeholder="Descrição do departamento"
                          className="bg-slate-50 border-slate-200"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Modo de Integração WhatsApp
                        </label>
                        <select
                          value={newDepartment.integration_mode}
                          onChange={(e) => setNewDepartment({...newDepartment, integration_mode: e.target.value})}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md bg-slate-50"
                        >
                          <option value="qr">QR Code (Não oficial)</option>
                          <option value="official">API Cloud (Oficial)</option>
                        </select>
                        <p className="text-xs text-slate-500 mt-1">
                          {newDepartment.integration_mode === 'qr' 
                            ? 'Conexão via QR Code do WhatsApp Web'
                            : 'Conexão via API oficial do WhatsApp Business'
                          }
                        </p>
                      </div>

                      <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setCreatingDepartment(false);
                            setNewDepartment({
                              name: '',
                              description: '',
                              whatsapp_number: '',
                              integration_mode: 'qr'
                            });
                          }}
                        >
                          Cancelar
                        </Button>
                        <Button
                          onClick={createDepartment}
                          disabled={!newDepartment.name.trim() || !newDepartment.whatsapp_number.trim()}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                        >
                          <Building className="w-4 h-4 mr-2" />
                          Criar Departamento
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}

          {currentTab === 'assistants' && (
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">Gestão de IAs</h2>
                  <p className="text-slate-600">Configure e gerencie os assistentes de IA especializados</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {assistants.map((assistant) => (
                  <Card key={assistant.id} className="shadow-lg border-slate-200 hover:shadow-xl transition-shadow duration-200">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-slate-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center overflow-hidden">
                            {assistant.avatar_url ? (
                              <img src={assistant.avatar_url} alt={assistant.name} className="w-14 h-14 rounded-xl object-cover" />
                            ) : (
                              <Bot className="w-7 h-7 text-white" />
                            )}
                          </div>
                          <div>
                            <CardTitle className="text-lg">{assistant.name}</CardTitle>
                            <p className="text-sm text-slate-600">{assistant.department_name}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <Badge variant={assistant.enabled ? "default" : "secondary"} 
                                 className={assistant.enabled ? "bg-green-500 hover:bg-green-600" : ""}>
                            {assistant.enabled ? 'Ativo' : 'Inativo'}
                          </Badge>
                          <button
                            onClick={() => updateAssistant(assistant.id, { enabled: !assistant.enabled })}
                            className="text-xs text-slate-500 hover:text-slate-700"
                          >
                            {assistant.enabled ? 'Desativar' : 'Ativar'}
                          </button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Especialização</label>
                          <p className="text-sm text-slate-700">{assistant.specialization}</p>
                        </div>
                        
                        <div>
                          <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Instruções</label>
                          <p className="text-sm text-slate-700 line-clamp-2">
                            {assistant.manual_instructions || 'Instruções padrão do sistema'}
                          </p>
                        </div>

                        <div>
                          <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Capacidades</label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            <Badge variant="outline" className="text-xs">PDF</Badge>
                            <Badge variant="outline" className="text-xs">Imagem</Badge>
                            <Badge variant="outline" className="text-xs">Áudio</Badge>
                          </div>
                        </div>

                        <div className="flex space-x-2 pt-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setEditingAssistant(assistant.id);
                              setAssistantForm({
                                name: assistant.name,
                                avatar_url: assistant.avatar_url || '',
                                manual_instructions: assistant.manual_instructions || '',
                                signature_template: assistant.signature_template || '',
                                phone_number: assistant.phone_number || '',
                                department_id: assistant.department_id || '',
                                enabled: assistant.enabled,
                                supports_pdf: true,
                                supports_image: true,
                                supports_audio: true,
                                message_limit: 100
                              });
                            }}
                            className="flex-1"
                          >
                            <Settings className="w-3 h-3 mr-1" />
                            Editar
                          </Button>
                          
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => duplicateAssistant(assistant.id)}
                            className="flex-1"
                          >
                            <User className="w-3 h-3 mr-1" />
                            Duplicar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Edit Assistant Modal */}
              {editingAssistant && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <Card className="w-full max-w-4xl bg-white shadow-2xl max-h-[90vh] overflow-y-auto">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-slate-200">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center space-x-2">
                          <Bot className="w-5 h-5 text-blue-500" />
                          <span>Editar Assistente de IA</span>
                        </CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingAssistant(null);
                            setAssistantForm({
                              name: '',
                              avatar_url: '',
                              manual_instructions: '',
                              signature_template: '',
                              phone_number: '',
                              department_id: '',
                              enabled: true,
                              supports_pdf: true,
                              supports_image: true,
                              supports_audio: true,
                              message_limit: 100
                            });
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      {/* Basic Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Nome do Assistente
                          </label>
                          <Input
                            value={assistantForm.name}
                            onChange={(e) => setAssistantForm({...assistantForm, name: e.target.value})}
                            placeholder="Nome do assistente"
                            className="bg-slate-50 border-slate-200"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Departamento
                          </label>
                          <select
                            value={assistantForm.department_id}
                            onChange={(e) => setAssistantForm({...assistantForm, department_id: e.target.value})}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md bg-slate-50"
                          >
                            <option value="">Selecionar Departamento</option>
                            {departments.map((dept) => (
                              <option key={dept.id} value={dept.id}>{dept.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Avatar Upload */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Avatar do Assistente
                        </label>
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center overflow-hidden">
                            {assistantForm.avatar_url ? (
                              <img src={assistantForm.avatar_url} alt="Avatar" className="w-16 h-16 rounded-xl object-cover" />
                            ) : (
                              <Bot className="w-8 h-8 text-white" />
                            )}
                          </div>
                          <div className="flex-1">
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/webp"
                              onChange={async (e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  const base64 = await handleAvatarUpload(file);
                                  if (base64) {
                                    setAssistantForm({...assistantForm, avatar_url: base64});
                                  }
                                }
                              }}
                              className="hidden"
                              id="avatar-upload"
                            />
                            <label htmlFor="avatar-upload" className="cursor-pointer">
                              <Button type="button" variant="outline" disabled={uploadingAvatar}>
                                {uploadingAvatar ? 'Enviando...' : 'Escolher Avatar'}
                              </Button>
                            </label>
                            <p className="text-xs text-slate-500 mt-1">PNG, JPG ou WebP até 1MB</p>
                          </div>
                        </div>
                      </div>

                      {/* Instructions */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Comandos/Instruções Manuais
                        </label>
                        <textarea
                          value={assistantForm.manual_instructions}
                          onChange={(e) => setAssistantForm({...assistantForm, manual_instructions: e.target.value})}
                          placeholder="Instruções específicas para este assistente..."
                          className="w-full h-32 px-3 py-2 border border-slate-300 rounded-md bg-slate-50 resize-none"
                        />
                      </div>

                      {/* Signature */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Assinatura
                        </label>
                        <textarea
                          value={assistantForm.signature_template}
                          onChange={(e) => setAssistantForm({...assistantForm, signature_template: e.target.value})}
                          placeholder="Assinatura que aparecerá nas mensagens..."
                          className="w-full h-24 px-3 py-2 border border-slate-300 rounded-md bg-slate-50 resize-none"
                        />
                      </div>

                      {/* Capabilities and Settings */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-3">
                            Capacidades de Mídia
                          </label>
                          <div className="space-y-2">
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={assistantForm.supports_pdf}
                                onChange={(e) => setAssistantForm({...assistantForm, supports_pdf: e.target.checked})}
                                className="rounded border-slate-300"
                              />
                              <span className="text-sm text-slate-700">Suporte a PDF</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={assistantForm.supports_image}
                                onChange={(e) => setAssistantForm({...assistantForm, supports_image: e.target.checked})}
                                className="rounded border-slate-300"
                              />
                              <span className="text-sm text-slate-700">Suporte a Imagens</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={assistantForm.supports_audio}
                                onChange={(e) => setAssistantForm({...assistantForm, supports_audio: e.target.checked})}
                                className="rounded border-slate-300"
                              />
                              <span className="text-sm text-slate-700">Suporte a Áudio</span>
                            </label>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Limite de Mensagens/Hora
                          </label>
                          <Input
                            type="number"
                            value={assistantForm.message_limit}
                            onChange={(e) => setAssistantForm({...assistantForm, message_limit: parseInt(e.target.value) || 100})}
                            placeholder="100"
                            className="bg-slate-50 border-slate-200"
                          />
                          
                          <div className="mt-4">
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={assistantForm.enabled}
                                onChange={(e) => setAssistantForm({...assistantForm, enabled: e.target.checked})}
                                className="rounded border-slate-300"
                              />
                              <span className="text-sm font-medium text-slate-700">Assistente Ativo</span>
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end space-x-3 pt-6 border-t border-slate-200">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setEditingAssistant(null);
                            setAssistantForm({
                              name: '',
                              avatar_url: '',
                              manual_instructions: '',
                              signature_template: '',
                              phone_number: '',
                              department_id: '',
                              enabled: true,
                              supports_pdf: true,
                              supports_image: true,
                              supports_audio: true,
                              message_limit: 100
                            });
                          }}
                        >
                          Cancelar
                        </Button>
                        <Button
                          onClick={() => updateAssistant(editingAssistant, assistantForm)}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          Salvar Alterações
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}
          {currentTab === 'admin' && (
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    Área do Administrador
                  </h2>
                  <p className="text-slate-600">Configurações avançadas e gestão do sistema</p>
                </div>
                <Badge className="bg-violet-100 text-violet-700 px-3 py-1">
                  <Crown className="w-4 h-4 mr-1" />
                  Admin Only
                </Badge>
              </div>

              {/* Company Profile Section */}
              <Card className="shadow-lg border-slate-200">
                <CardHeader className="bg-gradient-to-r from-violet-50 to-purple-50 border-b border-slate-200">
                  <CardTitle className="flex items-center space-x-2">
                    <Building className="w-5 h-5 text-violet-500" />
                    <span className="text-slate-900">Perfil da Empresa</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Nome da Empresa
                        </label>
                        <Input
                          value={companyProfile.name}
                          onChange={(e) => setCompanyProfile({...companyProfile, name: e.target.value})}
                          className="bg-slate-50 border-slate-200"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Sobre a Empresa
                        </label>
                        <textarea
                          value={companyProfile.about}
                          onChange={(e) => setCompanyProfile({...companyProfile, about: e.target.value})}
                          className="w-full p-3 border border-slate-200 rounded-lg bg-slate-50 resize-none"
                          rows={4}
                          placeholder="Descreva sua empresa, serviços e diferenciais..."
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Website (Opcional)
                        </label>
                        <Input
                          value={companyProfile.website_url}
                          onChange={(e) => setCompanyProfile({...companyProfile, website_url: e.target.value})}
                          placeholder="https://www.empresasweb.com"
                          className="bg-slate-50 border-slate-200"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Facebook (Opcional)
                        </label>
                        <Input
                          value={companyProfile.facebook_url}
                          onChange={(e) => setCompanyProfile({...companyProfile, facebook_url: e.target.value})}
                          placeholder="https://facebook.com/empresasweb"
                          className="bg-slate-50 border-slate-200"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          LinkedIn (Opcional)
                        </label>
                        <Input
                          value={companyProfile.linkedin_url}
                          onChange={(e) => setCompanyProfile({...companyProfile, linkedin_url: e.target.value})}
                          placeholder="https://linkedin.com/company/empresasweb"
                          className="bg-slate-50 border-slate-200"
                        />
                      </div>
                      
                      <Button className="w-full bg-violet-600 hover:bg-violet-700">
                        <Settings className="w-4 h-4 mr-2" />
                        Salvar Perfil da Empresa
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Assistants Management */}
              <Card className="shadow-lg border-slate-200">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200">
                  <CardTitle className="flex items-center space-x-2">
                    <Bot className="w-5 h-5 text-blue-500" />
                    <span className="text-slate-900">Gestão dos 7 Assistentes de IA</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {departments.map((department) => (
                      <div key={department.id} className="border border-slate-200 rounded-xl p-4 bg-gradient-to-br from-slate-50 to-blue-50">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                              <Bot className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-slate-900">{department.name}</h3>
                              <p className="text-sm text-slate-600">{department.description}</p>
                            </div>
                          </div>
                          <Badge variant={department.active ? "default" : "secondary"} className="shrink-0">
                            {department.active ? "Ativo" : "Inativo"}
                          </Badge>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">
                              Instruções Manuais da IA:
                            </label>
                            {editingInstructions === department.id ? (
                              <div className="space-y-2">
                                <textarea
                                  value={newInstructions}
                                  onChange={(e) => setNewInstructions(e.target.value)}
                                  placeholder="Digite as instruções específicas para este assistente de IA..."
                                  className="w-full p-2 border border-slate-300 rounded-lg text-sm resize-none bg-white"
                                  rows={6}
                                />
                                <div className="flex items-center space-x-2">
                                  <Button size="sm" onClick={() => updateDepartmentInstructions(department.id, newInstructions)}>
                                    Salvar IA
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => {
                                      setEditingInstructions(null);
                                      setNewInstructions('');
                                    }}
                                  >
                                    Cancelar
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div>
                                <div className="bg-white rounded-lg p-3 border border-slate-200 min-h-[80px]">
                                  <p className="text-sm text-slate-700 whitespace-pre-wrap">
                                    {department.manual_instructions || "Nenhuma instrução manual definida"}
                                  </p>
                                </div>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="mt-2"
                                  onClick={() => {
                                    setEditingInstructions(department.id);
                                    setNewInstructions(department.manual_instructions || '');
                                  }}
                                >
                                  <Bot className="w-3 h-3 mr-1" />
                                  Editar IA
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* System Health */}
              <Card className="shadow-lg border-slate-200">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-slate-200">
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="w-5 h-5 text-green-500" />
                    <span className="text-slate-900">Saúde do Sistema</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-green-800">Backend API</p>
                          <p className="text-xs text-green-600">Funcionando</p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-green-500" />
                      </div>
                    </div>
                    
                    <div className={`rounded-xl p-4 border ${
                      whatsappStatus === 'connected' 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`text-sm font-medium ${
                            whatsappStatus === 'connected' ? 'text-green-800' : 'text-red-800'
                          }`}>WhatsApp</p>
                          <p className={`text-xs ${
                            whatsappStatus === 'connected' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {whatsappStatus === 'connected' ? 'Conectado' : 'Desconectado'}
                          </p>
                        </div>
                        {whatsappStatus === 'connected' ? 
                          <CheckCircle className="w-8 h-8 text-green-500" /> :
                          <AlertCircle className="w-8 h-8 text-red-500" />
                        }
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-800">IA Assistants</p>
                          <p className="text-xs text-blue-600">7 Ativos</p>
                        </div>
                        <Bot className="w-8 h-8 text-blue-500" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;