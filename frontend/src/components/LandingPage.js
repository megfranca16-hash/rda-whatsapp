import React, { useState } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { 
  MessageCircle, 
  Bot, 
  Zap, 
  ArrowRight, 
  CheckCircle,
  Smartphone,
  Star,
  Users,
  BarChart3,
  X,
  Mail,
  Lock,
  User
} from 'lucide-react';

const LandingPage = ({ onLoginSuccess }) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [authData, setAuthData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const API_BASE = process.env.REACT_APP_BACKEND_URL;

      if (authMode === 'register') {
        if (authData.password !== authData.confirmPassword) {
          alert('Senhas não coincidem!');
          setLoading(false);
          return;
        }
        
        // Call register API
        const response = await fetch(`${API_BASE}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: authData.email, // Use email as username
            email: authData.email,
            password: authData.password,
            name: authData.name
          })
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.detail || 'Erro no cadastro');
        }

        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onLoginSuccess();
      } else {
        // Call login API
        console.log('Attempting login with:', { username: authData.email, API_BASE });
        
        try {
          const response = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              username: authData.email, // Use email as username
              password: authData.password
            })
          });

          console.log('Login response received:', response.status, response.statusText);

          if (!response.ok) {
            let errorData;
            try {
              errorData = await response.json();
            } catch (parseError) {
              console.error('Error parsing response JSON:', parseError);
              throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`);
            }
            
            console.error('Login error response:', errorData);
            
            // More specific error messages
            if (response.status === 401) {
              throw new Error('Credenciais inválidas. Use: admin@admin.com / admin123');
            } else if (response.status === 500) {
              throw new Error('Erro interno do servidor. Tente novamente em alguns segundos.');
            } else {
              throw new Error(errorData.detail || `Erro HTTP ${response.status}`);
            }
          }

          let data;
          try {
            data = await response.json();
            console.log('Login successful:', data);
          } catch (parseError) {
            console.error('Error parsing success response JSON:', parseError);
            throw new Error('Erro ao processar resposta do servidor');
          }

          if (!data.token || !data.user) {
            throw new Error('Resposta inválida do servidor - token ou dados do usuário ausentes');
          }

          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          onLoginSuccess();
          
        } catch (fetchError) {
          console.error('Fetch error:', fetchError);
          if (fetchError.name === 'TypeError' && fetchError.message.includes('fetch')) {
            throw new Error('Erro de conexão. Verifique sua internet e tente novamente.');
          } else {
            throw fetchError;
          }
        }
      }
    } catch (error) {
      console.error('Authentication error:', error);
      
      // Handle network errors specifically
      if (error.name === 'TypeError' || error.message.includes('fetch')) {
        alert('Erro de conexão. Verifique sua internet e tente novamente.');
      } else {
        alert(error.message || 'Erro ao autenticar. Tente novamente.');
      }
    }
    
    setLoading(false);
  };

  const handleDemo = () => {
    window.location.href = '/demo';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-700 to-green-600 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-green-500/20 backdrop-blur-3xl"></div>
      <div className="absolute top-20 left-20 w-96 h-96 bg-blue-400/30 rounded-full filter blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-purple-400/30 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-green-400/20 rounded-full filter blur-3xl animate-pulse delay-2000"></div>

      {/* Navigation */}
      <nav className="relative z-10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">Empresas Web</span>
          </div>
          
          <Button 
            onClick={() => setShowAuthModal(true)}
            className="bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 transition-all duration-300 px-6 py-2 rounded-full"
          >
            Entrar no Sistema
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Column - Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-white/90 text-sm font-medium">SISTEMA ONLINE</span>
              </div>
              
              <div className="space-y-6">
                <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight">
                  CRM + WHATSAPP
                  <br />
                  <span className="bg-gradient-to-r from-cyan-400 via-blue-300 to-purple-300 bg-clip-text text-transparent">
                    COM IA AVANÇADA
                  </span>
                </h1>
                
                <p className="text-xl text-white/80 leading-relaxed max-w-xl">
                  Revolucione seu atendimento com 7 assistentes de IA especializados, 
                  integração WhatsApp completa e CRM inteligente para empresas modernas.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={() => setShowAuthModal(true)}
                  className="bg-white text-slate-900 hover:bg-white/90 px-8 py-4 rounded-full text-lg font-semibold shadow-2xl hover:shadow-white/20 transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <span>Começar Agora</span>
                  <ArrowRight className="w-5 h-5" />
                </Button>
                
                <Button 
                  onClick={handleDemo}
                  variant="outline"
                  className="border-2 border-white/30 text-white hover:bg-white/10 px-8 py-4 rounded-full text-lg font-semibold backdrop-blur-sm"
                >
                  Ver Demonstração
                </Button>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 pt-8">
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 text-center">
                  <Bot className="w-8 h-8 text-cyan-300 mx-auto mb-2" />
                  <p className="text-white text-sm font-medium">7 IAs Especializadas</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 text-center">
                  <MessageCircle className="w-8 h-8 text-green-300 mx-auto mb-2" />
                  <p className="text-white text-sm font-medium">WhatsApp Integrado</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 text-center">
                  <BarChart3 className="w-8 h-8 text-purple-300 mx-auto mb-2" />
                  <p className="text-white text-sm font-medium">CRM Completo</p>
                </div>
              </div>
            </div>

            {/* Right Column - Visual */}
            <div className="relative flex justify-center items-center">
              {/* Neon Lights */}
              <div className="absolute -left-20 top-0 w-2 h-full bg-gradient-to-b from-cyan-400 via-blue-500 to-transparent rounded-full opacity-60 animate-pulse"></div>
              <div className="absolute -right-20 top-20 w-2 h-3/4 bg-gradient-to-b from-purple-400 via-pink-500 to-transparent rounded-full opacity-60 animate-pulse delay-1000"></div>
              
              {/* Phone Mockup */}
              <div className="relative">
                <div className="w-80 h-[600px] bg-white/10 backdrop-blur-xl border border-white/20 rounded-[3rem] p-4 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-700">
                  <div className="w-full h-full bg-gradient-to-b from-slate-900 to-slate-800 rounded-[2.5rem] p-6 relative overflow-hidden">
                    {/* Phone Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg"></div>
                        <span className="text-white font-semibold">Empresas Web</span>
                      </div>
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-200"></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-400"></div>
                      </div>
                    </div>

                    {/* Chat Interface */}
                    <div className="space-y-4">
                      <div className="bg-blue-500 text-white p-3 rounded-2xl rounded-bl-sm max-w-[80%] ml-auto">
                        <p className="text-sm">Preciso de ajuda com contabilidade</p>
                      </div>
                      <div className="bg-white/10 text-white p-3 rounded-2xl rounded-br-sm max-w-[80%]">
                        <p className="text-sm">Olá! Sou especialista em contabilidade. Como posso ajudá-lo?</p>
                      </div>
                      <div className="bg-blue-500 text-white p-3 rounded-2xl rounded-bl-sm max-w-[80%] ml-auto">
                        <p className="text-sm">Quero abrir uma empresa</p>
                      </div>
                      <div className="bg-white/10 text-white p-3 rounded-2xl rounded-br-sm max-w-[80%] animate-pulse">
                        <p className="text-sm">Transferindo para especialista em abertura de empresas...</p>
                      </div>
                    </div>

                    {/* Floating Elements */}
                    <div className="absolute top-20 right-4 bg-green-400/20 backdrop-blur-sm border border-green-400/30 rounded-full p-2 animate-bounce">
                      <CheckCircle className="w-4 h-4 text-green-300" />
                    </div>
                    <div className="absolute bottom-20 left-4 bg-purple-400/20 backdrop-blur-sm border border-purple-400/30 rounded-full p-2 animate-bounce delay-1000">
                      <Bot className="w-4 h-4 text-purple-300" />
                    </div>
                  </div>
                </div>

                {/* Glow Effect */}
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-green-500/20 rounded-[4rem] filter blur-xl opacity-70"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Stats */}
      <div className="relative z-10 px-6 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-white mb-2">7</div>
                <div className="text-white/70">Assistentes IA Especializados</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-2">24/7</div>
                <div className="text-white/70">Atendimento Automatizado</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-2">100%</div>
                <div className="text-white/70">Integração WhatsApp</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-white/95 backdrop-blur-xl border border-white/30 shadow-2xl">
            <CardHeader className="text-center relative">
              <Button
                variant="ghost"
                className="absolute right-0 top-0 p-2"
                onClick={() => setShowAuthModal(false)}
              >
                <X className="w-4 h-4" />
              </Button>
              
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              
              <CardTitle className="text-2xl text-slate-900 mb-2">
                {authMode === 'login' ? 'Entrar no Sistema' : 'Criar Conta'}
              </CardTitle>
              <p className="text-slate-600">
                {authMode === 'login' ? 'Acesse sua conta' : 'Crie sua conta gratuita'}
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {authMode === 'login' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                  <p className="text-sm text-blue-800 font-medium mb-1">Credenciais de Demonstração:</p>
                  <p className="text-xs text-blue-600">Email: <span className="font-mono">admin@admin.com</span></p>
                  <p className="text-xs text-blue-600">Senha: <span className="font-mono">admin123</span></p>
                </div>
              )}
              <form onSubmit={handleAuth} className="space-y-4">
                {authMode === 'register' && (
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="Seu nome"
                      value={authData.name}
                      onChange={(e) => setAuthData({...authData, name: e.target.value})}
                      className="pl-10"
                      required
                    />
                  </div>
                )}
                
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type="email"
                    placeholder="Seu email"
                    value={authData.email}
                    onChange={(e) => setAuthData({...authData, email: e.target.value})}
                    className="pl-10"
                    required
                  />
                </div>
                
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type="password"
                    placeholder="Sua senha"
                    value={authData.password}
                    onChange={(e) => setAuthData({...authData, password: e.target.value})}
                    className="pl-10"
                    required
                  />
                </div>
                
                {authMode === 'register' && (
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      type="password"
                      placeholder="Confirme sua senha"
                      value={authData.confirmPassword}
                      onChange={(e) => setAuthData({...authData, confirmPassword: e.target.value})}
                      className="pl-10"
                      required
                    />
                  </div>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  disabled={loading}
                >
                  {loading ? 'Processando...' : (authMode === 'login' ? 'Entrar' : 'Criar Conta')}
                </Button>
              </form>
              
              <div className="text-center">
                <Button 
                  variant="ghost" 
                  onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                  className="text-slate-600 hover:text-slate-900"
                >
                  {authMode === 'login' ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Faça login'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default LandingPage;