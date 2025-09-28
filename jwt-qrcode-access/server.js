const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const accessRoutes = require('./routes/access');
const collaboratorRoutes = require('./routes/collaborators');

const app = express();
const PORT = process.env.PORT || 3000;

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "blob:"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"]
    }
  }
}));

// CORS Configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN === '*' ? true : process.env.CORS_ORIGIN,
  credentials: true
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    error: 'Muitas tentativas. Tente novamente em alguns minutos.',
    retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000) / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use(limiter);

// Body Parser Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static Files
app.use('/public', express.static('public'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/access', accessRoutes);
app.use('/api/collaborators', collaboratorRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: require('./package.json').version,
    environment: process.env.NODE_ENV
  });
});

// Main Access Route (QR Code endpoint)
app.get('/acesso', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token não fornecido',
        timestamp: new Date().toISOString()
      });
    }

    const accessService = require('./services/accessService');
    const result = await accessService.validateAccess(token);

    if (result.success) {
      // Log successful access
      console.log(`✅ Acesso autorizado para: ${result.collaborator.name} (${result.collaborator.email}) em ${new Date().toISOString()}`);
      
      res.status(200).json({
        success: true,
        message: 'Acesso autorizado',
        collaborator: {
          name: result.collaborator.name,
          email: result.collaborator.email,
          department: result.collaborator.department,
          accessTime: new Date().toISOString()
        },
        tokenInfo: {
          issuedAt: new Date(result.decoded.iat * 1000).toISOString(),
          expiresAt: new Date(result.decoded.exp * 1000).toISOString()
        }
      });
    } else {
      // Log failed access attempt
      console.log(`❌ Tentativa de acesso negada: ${result.message} em ${new Date().toISOString()}`);
      
      res.status(401).json({
        success: false,
        message: result.message,
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('Erro no endpoint de acesso:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      timestamp: new Date().toISOString()
    });
  }
});

// Frontend Route - Dashboard
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Sistema de Acesso JWT + QR Code</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                max-width: 1200px;
                margin: 0 auto;
                padding: 20px;
                background: #f5f7fa;
                color: #2d3748;
            }
            .header {
                text-align: center;
                margin-bottom: 40px;
                padding: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border-radius: 12px;
            }
            .card {
                background: white;
                border-radius: 12px;
                padding: 24px;
                margin-bottom: 20px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .btn {
                background: #4299e1;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 600;
                margin-right: 10px;
                margin-bottom: 10px;
                transition: all 0.3s;
            }
            .btn:hover {
                background: #3182ce;
                transform: translateY(-2px);
            }
            .btn-success { background: #48bb78; }
            .btn-success:hover { background: #38a169; }
            .btn-warning { background: #ed8936; }
            .btn-warning:hover { background: #dd6b20; }
            .input-group {
                margin-bottom: 16px;
            }
            .input-group label {
                display: block;
                margin-bottom: 4px;
                font-weight: 600;
                color: #4a5568;
            }
            .input-group input, .input-group select {
                width: 100%;
                padding: 12px;
                border: 2px solid #e2e8f0;
                border-radius: 8px;
                font-size: 14px;
                transition: border-color 0.3s;
            }
            .input-group input:focus, .input-group select:focus {
                outline: none;
                border-color: #4299e1;
            }
            .result {
                margin-top: 20px;
                padding: 16px;
                border-radius: 8px;
                font-family: monospace;
                font-size: 14px;
            }
            .result.success {
                background: #f0fff4;
                border: 1px solid #68d391;
                color: #22543d;
            }
            .result.error {
                background: #fed7d7;
                border: 1px solid #fc8181;
                color: #742a2a;
            }
            .qr-container {
                text-align: center;
                margin: 20px 0;
            }
            .qr-container img {
                max-width: 300px;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 10px;
                background: white;
            }
            .collaborators-list {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                gap: 16px;
                margin-top: 20px;
            }
            .collaborator-card {
                background: #f7fafc;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 16px;
            }
            .collaborator-card h4 {
                margin: 0 0 8px 0;
                color: #2d3748;
            }
            .collaborator-card p {
                margin: 4px 0;
                color: #718096;
                font-size: 14px;
            }
            .status-active {
                color: #38a169;
                font-weight: 600;
            }
            .status-expired {
                color: #e53e3e;
                font-weight: 600;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🔐 Sistema de Acesso JWT + QR Code</h1>
            <p>Geração e validação de tokens de acesso para colaboradores</p>
        </div>

        <!-- Geração de Token -->
        <div class="card">
            <h2>👤 Gerar Token de Acesso</h2>
            <div class="input-group">
                <label for="name">Nome do Colaborador:</label>
                <input type="text" id="name" placeholder="Ex: João Silva">
            </div>
            <div class="input-group">
                <label for="email">E-mail:</label>
                <input type="email" id="email" placeholder="Ex: joao@empresa.com">
            </div>
            <div class="input-group">
                <label for="department">Departamento:</label>
                <select id="department">
                    <option value="TI">TI</option>
                    <option value="RH">RH</option>
                    <option value="Financeiro">Financeiro</option>
                    <option value="Vendas">Vendas</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Operações">Operações</option>
                </select>
            </div>
            <div class="input-group">
                <label for="validity">Validade do Token:</label>
                <select id="validity">
                    <option value="1h">1 hora</option>
                    <option value="8h">8 horas</option>
                    <option value="24h" selected>24 horas</option>
                    <option value="48h">48 horas</option>
                    <option value="7d">7 dias</option>
                </select>
            </div>
            <button class="btn btn-success" onclick="generateToken()">🔑 Gerar Token e QR Code</button>
            <div id="tokenResult" class="result" style="display: none;"></div>
            <div id="qrContainer" class="qr-container" style="display: none;"></div>
        </div>

        <!-- Validação de Token -->
        <div class="card">
            <h2>✅ Validar Token</h2>
            <div class="input-group">
                <label for="tokenToValidate">Token para Validar:</label>
                <input type="text" id="tokenToValidate" placeholder="Cole o token aqui...">
            </div>
            <button class="btn" onclick="validateToken()">🔍 Validar Token</button>
            <div id="validationResult" class="result" style="display: none;"></div>
        </div>

        <!-- Lista de Colaboradores -->
        <div class="card">
            <h2>📋 Colaboradores com Acesso</h2>
            <button class="btn btn-warning" onclick="loadCollaborators()">🔄 Atualizar Lista</button>
            <div id="collaboratorsList" class="collaborators-list"></div>
        </div>

        <script>
            async function generateToken() {
                const name = document.getElementById('name').value;
                const email = document.getElementById('email').value;
                const department = document.getElementById('department').value;
                const validity = document.getElementById('validity').value;

                if (!name || !email) {
                    showResult('tokenResult', '❌ Preencha nome e email', 'error');
                    return;
                }

                try {
                    const response = await fetch('/api/auth/generate-token', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            name,
                            email,
                            department,
                            validity
                        })
                    });

                    const data = await response.json();

                    if (data.success) {
                        const result = \`✅ Token gerado com sucesso!

🔑 Token: \${data.token}

📱 Link de Acesso: \${data.accessUrl}

⏰ Válido até: \${new Date(data.expiresAt).toLocaleString('pt-BR')}

👤 Colaborador: \${data.collaborator.name}
📧 E-mail: \${data.collaborator.email}
🏢 Departamento: \${data.collaborator.department}\`;

                        showResult('tokenResult', result, 'success');
                        
                        // Mostrar QR Code
                        document.getElementById('qrContainer').style.display = 'block';
                        document.getElementById('qrContainer').innerHTML = \`
                            <h3>📱 QR Code de Acesso</h3>
                            <img src="\${data.qrCode}" alt="QR Code de Acesso">
                            <p>Escaneie este QR Code para acessar o sistema</p>
                            <p><strong>Link:</strong> <a href="\${data.accessUrl}" target="_blank">\${data.accessUrl}</a></p>
                        \`;

                        // Limpar campos
                        document.getElementById('name').value = '';
                        document.getElementById('email').value = '';
                        
                    } else {
                        showResult('tokenResult', \`❌ Erro: \${data.message}\`, 'error');
                    }

                } catch (error) {
                    showResult('tokenResult', \`❌ Erro de conexão: \${error.message}\`, 'error');
                }
            }

            async function validateToken() {
                const token = document.getElementById('tokenToValidate').value.trim();

                if (!token) {
                    showResult('validationResult', '❌ Informe um token', 'error');
                    return;
                }

                try {
                    const response = await fetch(\`/acesso?token=\${encodeURIComponent(token)}\`);
                    const data = await response.json();

                    if (data.success) {
                        const result = \`✅ Token válido!

👤 Colaborador: \${data.collaborator.name}
📧 E-mail: \${data.collaborator.email}
🏢 Departamento: \${data.collaborator.department}

⏰ Emitido em: \${new Date(data.tokenInfo.issuedAt).toLocaleString('pt-BR')}
⏰ Expira em: \${new Date(data.tokenInfo.expiresAt).toLocaleString('pt-BR')}
🕐 Acesso em: \${new Date(data.collaborator.accessTime).toLocaleString('pt-BR')}\`;

                        showResult('validationResult', result, 'success');
                    } else {
                        showResult('validationResult', \`❌ \${data.message}\`, 'error');
                    }

                } catch (error) {
                    showResult('validationResult', \`❌ Erro de conexão: \${error.message}\`, 'error');
                }
            }

            async function loadCollaborators() {
                try {
                    const response = await fetch('/api/collaborators/list');
                    const data = await response.json();

                    const container = document.getElementById('collaboratorsList');
                    
                    if (data.success && data.collaborators.length > 0) {
                        container.innerHTML = data.collaborators.map(collab => \`
                            <div class="collaborator-card">
                                <h4>\${collab.name}</h4>
                                <p><strong>Email:</strong> \${collab.email}</p>
                                <p><strong>Departamento:</strong> \${collab.department}</p>
                                <p><strong>Token criado:</strong> \${new Date(collab.issuedAt).toLocaleString('pt-BR')}</p>
                                <p><strong>Expira:</strong> \${new Date(collab.expiresAt).toLocaleString('pt-BR')}</p>
                                <p><strong>Status:</strong> <span class="\${collab.isValid ? 'status-active' : 'status-expired'}">\${collab.isValid ? 'Ativo' : 'Expirado'}</span></p>
                            </div>
                        \`).join('');
                    } else {
                        container.innerHTML = '<p>Nenhum colaborador encontrado.</p>';
                    }

                } catch (error) {
                    document.getElementById('collaboratorsList').innerHTML = \`<p>Erro ao carregar: \${error.message}</p>\`;
                }
            }

            function showResult(elementId, message, type) {
                const element = document.getElementById(elementId);
                element.style.display = 'block';
                element.textContent = message;
                element.className = \`result \${type}\`;
            }

            // Carregar colaboradores ao iniciar
            loadCollaborators();
        </script>
    </body>
    </html>
  `);
});

// 404 Not Found
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint não encontrado',
    requestedUrl: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

// Global Error Handler
app.use((error, req, res, next) => {
  console.error('Erro não tratado:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Erro interno do servidor' 
      : error.message,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📱 Dashboard: http://localhost:${PORT}`);
  console.log(`✅ Health Check: http://localhost:${PORT}/health`);
  console.log(`🔐 Endpoint de Acesso: http://localhost:${PORT}/acesso?token=SEU_TOKEN`);
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV}`);
});

module.exports = app;