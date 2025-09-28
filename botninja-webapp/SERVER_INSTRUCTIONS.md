# 🚀 BotNinja 3.0 Web App - Instruções de Servidor

## ⚡ Como Executar

### Opção 1: Python (Recomendado)
```bash
cd botninja-webapp
python -m http.server 8000
# Acesse: http://localhost:8000
```

### Opção 2: Node.js
```bash
cd botninja-webapp
npx serve .
# ou
npx http-server
```

### Opção 3: PHP
```bash
cd botninja-webapp
php -S localhost:8000
```

### Opção 4: Usando Apache/Nginx
Copie os arquivos para o diretório do servidor web.

## 📋 Pré-requisitos

### Navegador
- Chrome 80+ (recomendado)
- Firefox 75+
- Safari 13+
- Edge 80+

### Recursos Necessários
- JavaScript habilitado
- LocalStorage disponível
- Canvas API suportado
- Service Workers (para PWA)

## 🧪 Testando a Instalação

1. **Abra o arquivo principal**
   ```
   http://localhost:8000/
   ```

2. **Teste funcionalidades**
   ```
   http://localhost:8000/demo.html
   ```

3. **Verifique console**
   - Abra DevTools (F12)
   - Procure por "BotNinja inicializado"
   - Não deve haver erros críticos

## 🔧 Configuração

### HTTPS (Recomendado)
Para funcionalidades PWA completas, use HTTPS:

```bash
# Com certificado local
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes
```

### Headers Necessários
Se usar servidor próprio, configure:

```
Content-Security-Policy: default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
```

## 📱 Teste PWA

1. **Instalação**
   - Ícone de instalação deve aparecer na barra de endereços
   - Menu > "Instalar BotNinja"

2. **Service Worker**
   - DevTools > Application > Service Workers
   - Deve mostrar "botninja" ativo

3. **Cache**
   - DevTools > Application > Storage
   - LocalStorage deve conter dados "botninja_"

## 🐛 Troubleshooting

### Erro: "Module not found"
- Certifique-se de que todos os arquivos JS estão no lugar
- Verifique paths relativos

### Erro: "Storage not available"
- LocalStorage pode estar desabilitado
- Modo privado pode bloquear storage

### QR Code não aparece
- Canvas API não suportado
- JavaScript bloqueado

### PWA não instala
- HTTPS necessário para PWA completo
- Manifest.json deve estar acessível

## 📊 Monitoramento

### Console Debug
```javascript
// No console do navegador
window.BotNinja.debug();
```

### Storage Info
```javascript
// Ver dados salvos
Object.keys(localStorage).filter(k => k.includes('botninja'))
```

### Performance
```javascript
// Teste de performance
performance.mark('botninja-start');
// ... operações ...
performance.mark('botninja-end');
performance.measure('botninja', 'botninja-start', 'botninja-end');
```

## 🔄 Atualizações

### Manual
1. Substitua arquivos modificados
2. Ctrl+F5 para limpar cache
3. Service Worker se atualizará automaticamente

### Automática
O Service Worker verifica atualizações automaticamente.

## 📈 Produção

### Otimizações
- Minificar CSS/JS
- Comprimir imagens
- Configurar cache headers
- Implementar CDN se necessário

### Monitoramento
- Google Analytics (opcional)
- Error tracking
- Performance monitoring

## 🔐 Segurança

### Recomendações
- Use HTTPS em produção
- Configure CSP adequadamente
- Valide inputs do usuário
- Mantenha dependências atualizadas

### Dados
- Todos os dados ficam no dispositivo
- Nenhuma informação é enviada para servidores
- LocalStorage é privado por domínio

---

**🤖 BotNinja 3.0 está pronto para uso!**

Para suporte ou dúvidas, consulte o README.md principal.