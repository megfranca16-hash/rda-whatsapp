# BotNinja 3.0 - Web App

## 🤖 Sobre o Projeto

O BotNinja 3.0 é um aplicativo web completo para automação de WhatsApp com Inteligência Artificial. Convertido da extensão Chrome original, agora funciona diretamente no navegador com todas as funcionalidades preservadas.

## ✨ Principais Funcionalidades

### 🧠 IA Avançada
- **Conversas Inteligentes**: IA treinável que responde como humano
- **Qualificação Automática**: Identifica leads qualificados automaticamente
- **Aprendizado Contínuo**: Melhora as respostas baseado nas interações
- **Base de Conhecimento**: Sistema personalizável de perguntas/respostas

### 📱 Integração WhatsApp
- **QR Code Dinâmico**: Geração automática para conexão
- **Conexão Segura**: Sistema de heartbeat para manter conexão ativa
- **Reconexão Automática**: Recuperação inteligente de conexões perdidas
- **Simulação Completa**: Ambiente de teste para mensagens

### 🚀 Automação Completa
- **Disparo em Massa**: Campanhas segmentadas e personalizadas
- **Agendamento**: Mensagens programadas automaticamente
- **Auto-Resposta**: Respostas instantâneas 24/7
- **CRM Kanban**: Organização visual de leads e oportunidades

### 📊 Dashboard Inteligente
- **Métricas em Tempo Real**: Acompanhe performance da IA
- **Feed de Atividades**: Histórico completo de interações
- **Relatórios**: Análises detalhadas de conversões
- **Configurações Avançadas**: Personalização completa do comportamento

## 🛠️ Tecnologias Utilizadas

### Frontend
- **HTML5/CSS3**: Interface moderna e responsiva
- **JavaScript ES6+**: Programação orientada a módulos
- **Canvas API**: Geração de QR Codes
- **Local Storage**: Persistência de dados local
- **PWA**: Aplicativo web progressivo instalável

### Arquitetura
- **Modular**: Sistema baseado em módulos independentes
- **Event-Driven**: Comunicação via eventos customizados
- **Storage Local**: Substitui chrome.storage com localStorage
- **Service Worker**: Cache inteligente e funcionamento offline

## 📂 Estrutura do Projeto

```
botninja-webapp/
├── index.html              # Página principal
├── manifest.webmanifest    # Configuração PWA
├── sw.js                   # Service Worker
├── css/
│   └── styles.css          # Estilos principais
├── js/
│   ├── app.js              # Aplicação principal
│   ├── storage.js          # Sistema de armazenamento
│   ├── whatsapp.js         # Gerenciador WhatsApp
│   ├── ai-engine.js        # Motor de IA
│   ├── ui-manager.js       # Gerenciador de interface
│   └── qrcode.min.js       # Gerador de QR Code
└── assets/
    └── (imagens e ícones)
```

## 🚀 Como Usar

### 1. Configuração Inicial
1. Abra o `index.html` em um servidor web local
2. A aplicação inicializará automaticamente
3. Aguarde o carregamento completo dos módulos

### 2. Conectar WhatsApp
1. Vá para a seção "WhatsApp"
2. Clique em "Gerar QR Code"
3. Escaneie com seu WhatsApp
4. Aguarde confirmação de conexão

### 3. Configurar IA
1. Acesse "Configurar IA" na barra lateral
2. Personalize as respostas automáticas
3. Adicione conhecimento específico do seu negócio
4. Teste no simulador de conversas

### 4. Criar Campanhas
1. Vá para "Disparo em Massa"
2. Crie sua campanha personalizada
3. Selecione o público-alvo
4. Agende ou envie imediatamente

## 🔧 Desenvolvimento

### Requisitos
- Servidor web local (Python, Node.js, ou similar)
- Navegador moderno com suporte a ES6+
- Conexão com internet para recursos externos

### Executar Localmente
```bash
# Usando Python
python -m http.server 8000

# Usando Node.js
npx serve .

# Usando PHP
php -S localhost:8000
```

### Personalização

#### Adicionar Novos Conhecimentos da IA
```javascript
// Em ai-engine.js
await window.AIEngine.trainResponse(
  'categoria',
  ['palavra1', 'palavra2'],
  ['Resposta 1', 'Resposta 2']
);
```

#### Modificar Interface
```css
/* Em styles.css */
:root {
  --primary-gradient: linear-gradient(135deg, #sua-cor 0%, #sua-cor2 100%);
}
```

#### Adicionar Novos Módulos
```javascript
// Criar novo arquivo js/seu-modulo.js
class SeuModulo {
  constructor() {
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    window.addEventListener('botninja:evento', this.handler.bind(this));
  }
}

window.SeuModulo = new SeuModulo();
```

## 📊 Funcionalidades Técnicas

### Sistema de Storage
- **Local Storage**: Substitui chrome.storage.local
- **Event System**: Notificações de mudanças via eventos
- **Auto Backup**: Configurações salvas automaticamente
- **Import/Export**: Backup e restauração de dados

### Simulador de WhatsApp
- **QR Code Generator**: Geração dinâmica de códigos
- **Connection Manager**: Gerenciamento de estado de conexão
- **Message Simulation**: Ambiente completo de testes
- **Heartbeat System**: Monitoramento contínuo da conexão

### Motor de IA
- **Pattern Recognition**: Análise inteligente de mensagens
- **Context Awareness**: Memória de conversas anteriores
- **Response Generation**: Geração dinâmica de respostas
- **Learning System**: Melhoria contínua baseada em feedback

## 🎯 Recursos Avançados

### PWA (Progressive Web App)
- **Instalável**: Pode ser instalado como app nativo
- **Offline**: Funciona sem conexão com internet
- **Notificações**: Push notifications nativas
- **Shortcuts**: Atalhos rápidos no sistema

### Responsividade
- **Mobile First**: Otimizado para dispositivos móveis
- **Desktop**: Interface completa para computadores
- **Tablet**: Layout adaptativo para tablets
- **Accessibility**: Suporte a leitores de tela

### Performance
- **Lazy Loading**: Carregamento sob demanda
- **Caching**: Cache inteligente via Service Worker
- **Optimization**: Código otimizado para performance
- **Bundle Size**: Tamanho mínimo de arquivos

## 🔒 Segurança e Privacidade

### Dados Locais
- **Local Storage**: Todos os dados ficam no dispositivo
- **No Server**: Nenhum dado é enviado para servidores externos
- **Encryption**: Dados sensíveis podem ser criptografados
- **Privacy First**: Privacidade por design

### Conexões
- **HTTPS Only**: Apenas conexões seguras
- **CSP**: Content Security Policy implementado
- **XSS Protection**: Proteção contra ataques XSS
- **Secure Headers**: Headers de segurança configurados

## 📱 Instalação como PWA

### Chrome/Edge
1. Clique no ícone de instalação na barra de endereços
2. Confirme a instalação
3. O app aparecerá como aplicativo nativo

### Firefox
1. Vá no menu > "Instalar site como app"
2. Confirme a instalação
3. Acesse via menu de aplicativos

### Mobile (Android/iOS)
1. Abra no navegador
2. Menu > "Adicionar à tela inicial"
3. Confirme para instalar

## 🐛 Solução de Problemas

### QR Code não aparece
- Verifique se JavaScript está habilitado
- Certifique-se de que canvas é suportado
- Recarregue a página

### IA não responde
- Verifique se AIEngine foi inicializado
- Veja o console para erros
- Reinicie a aplicação

### Dados perdidos
- Verifique localStorage do navegador
- Use ferramentas de desenvolvedor
- Importe backup se disponível

## 🔄 Atualizações

### Como Atualizar
1. Substitua os arquivos pelos novos
2. Limpe o cache do navegador
3. Recarregue a aplicação
4. Service Worker atualizará automaticamente

### Changelog
- **v1.0.0**: Versão inicial com todas as funcionalidades
- Conversão completa da extensão Chrome
- Sistema PWA implementado
- Módulos independentes criados

## 🤝 Contribuição

O BotNinja Web App foi desenvolvido como uma solução completa e independente. Para personalizar ou estender:

1. Fork o projeto
2. Modifique conforme necessário
3. Teste todas as funcionalidades
4. Documente as mudanças

## 📄 Licença

Este projeto é uma conversão do sistema de extensão Chrome para aplicativo web independente, mantendo todas as funcionalidades originais.

---

**BotNinja 3.0** - Venda no piloto automático com Inteligência Artificial! 🤖🚀