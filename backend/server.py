from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional, List
import os
from datetime import datetime, timedelta
import jwt
import httpx
import uuid
import motor.motor_asyncio
from contextlib import asynccontextmanager
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database connection
client = None
database = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    global client, database
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017/')
    client = motor.motor_asyncio.AsyncIOMotorClient(mongo_url)
    database = client.empresas_web
    
    # Initialize default departments
    await initialize_default_departments(database)
    
    yield
    # Shutdown
    client.close()

async def initialize_default_departments(db):
    """Initialize 7 specialized departments for business services"""
    try:
        departments_collection = db.departments
        existing_count = await departments_collection.count_documents({})
        
        if existing_count == 0:
            specialized_departments = [
                {
                    "id": str(uuid.uuid4()),
                    "name": "Abertura de Empresa",
                    "description": "Abertura de empresa, MEI, CNPJ e documentação legal",
                    "signature": "---\n🏢 Abertura de Empresa - Empresas Web\n📧 abertura@empresasweb.com\n📞 (11) 99999-1001\n\nEspecialistas em abertura de empresas e MEI!",
                    "avatar_url": "/avatars/abertura-empresa.png",
                    "manual_instructions": "Você é especialista em abertura de empresas, MEI, CNPJ e documentação legal. Ajude com: constituição de empresas, escolha de regime tributário, documentação necessária, prazos e custos.",
                    "active": True,
                    "created_at": datetime.utcnow().isoformat()
                },
                {
                    "id": str(uuid.uuid4()),
                    "name": "Dúvidas Contábeis",
                    "description": "Contabilidade geral, balanços e demonstrações",
                    "signature": "---\n📊 Contabilidade - Empresas Web\n📧 contabil@empresasweb.com\n📞 (11) 99999-1002\n\nContabilidade precisa para seu negócio!",
                    "avatar_url": "/avatars/contabilidade.png",
                    "manual_instructions": "Você é especialista em contabilidade. Ajude com: escrituração contábil, balanços, demonstrações financeiras, análise de custos, orientações sobre registros contábeis.",
                    "active": True,
                    "created_at": datetime.utcnow().isoformat()
                },
                {
                    "id": str(uuid.uuid4()),
                    "name": "RH e Folha",
                    "description": "Recursos humanos, folha de pagamento e trabalhista",
                    "signature": "---\n👥 RH e Folha - Empresas Web\n📧 rh@empresasweb.com\n📞 (11) 99999-1003\n\nGestão completa de pessoas!",
                    "avatar_url": "/avatars/rh-folha.png",
                    "manual_instructions": "Você é especialista em RH e folha de pagamento. Ajude com: admissão e demissão, cálculos trabalhistas, férias, 13º salário, eSocial, obrigações trabalhistas.",
                    "active": True,  
                    "created_at": datetime.utcnow().isoformat()
                },
                {
                    "id": str(uuid.uuid4()),
                    "name": "Tributos e Impostos",
                    "description": "Impostos, tributos, Simples Nacional e planejamento tributário",
                    "signature": "---\n🧾 Tributos - Empresas Web\n📧 tributos@empresasweb.com\n📞 (11) 99999-1004\n\nPlanejamento tributário inteligente!",
                    "avatar_url": "/avatars/tributos.png",
                    "manual_instructions": "Você é especialista em tributos e impostos. Ajude com: Simples Nacional, Lucro Presumido, Lucro Real, planejamento tributário, apuração de impostos, obrigações acessórias.",
                    "active": True,
                    "created_at": datetime.utcnow().isoformat()
                },
                {
                    "id": str(uuid.uuid4()),
                    "name": "Emissão de Notas Fiscais",
                    "description": "Notas fiscais, NFe, NFSe e certificados digitais",
                    "signature": "---\n📋 Notas Fiscais - Empresas Web\n📧 nfe@empresasweb.com\n📞 (11) 99999-1005\n\nEmissão rápida e segura!",
                    "avatar_url": "/avatars/notas-fiscais.png",
                    "manual_instructions": "Você é especialista em emissão de notas fiscais. Ajude com: NFe, NFSe, certificados digitais, SPED, configuração de emissores, correção de notas.",
                    "active": True,
                    "created_at": datetime.utcnow().isoformat()
                },
                {
                    "id": str(uuid.uuid4()),
                    "name": "Outros Assuntos",
                    "description": "Consultoria geral e outros assuntos empresariais",
                    "signature": "---\n💼 Consultoria Geral - Empresas Web\n📧 consultoria@empresasweb.com\n📞 (11) 99999-1006\n\nSoluções empresariais completas!",
                    "avatar_url": "/avatars/consultoria.png",
                    "manual_instructions": "Você é consultor empresarial geral. Ajude com: orientações gerais, consultoria estratégica, processos empresariais, questões diversas não cobertas pelos outros departamentos.",
                    "active": True,
                    "created_at": datetime.utcnow().isoformat()
                },
                {
                    "id": str(uuid.uuid4()),
                    "name": "Financeiro",
                    "description": "Questões financeiras, pagamentos e cobrança",
                    "signature": "---\n💰 Financeiro - Empresas Web\n📧 financeiro@empresasweb.com\n📞 (11) 99999-1007\n\nGestão financeira eficiente!",
                    "avatar_url": "/avatars/financeiro.png",
                    "manual_instructions": "Você é especialista financeiro. Ajude com: contas a pagar/receber, fluxo de caixa, cobrança, negociações, questões de pagamento e faturamento.",
                    "active": True,
                    "created_at": datetime.utcnow().isoformat()
                }
            ]
            
            await departments_collection.insert_many(specialized_departments)
            logging.info("7 specialized business departments initialized with AI assistants")
            
    except Exception as e:
        logging.error(f"Error initializing specialized departments: {str(e)}")

app = FastAPI(title="Empresas Web CRM API", lifespan=lifespan)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()
SECRET_KEY = "empresas-web-secret-key-2025"

# Models
class LoginRequest(BaseModel):
    username: str
    password: str

class RegisterRequest(BaseModel):
    username: str
    password: str
    email: Optional[str] = None
    name: Optional[str] = None

class WhatsAppMessage(BaseModel):
    phone_number: str
    message: str
    message_id: str
    timestamp: int

class MessageResponse(BaseModel):
    reply: Optional[str] = None
    success: bool = True

class ContactCreate(BaseModel):
    name: str
    phone_number: str
    email: Optional[str] = None
    company: Optional[str] = None

class Contact(BaseModel):
    id: str
    name: str
    phone_number: str
    email: Optional[str] = None
    company: Optional[str] = None
    created_at: datetime
    last_message: Optional[datetime] = None

class Department(BaseModel):
    id: str
    name: str
    description: str
    active: bool = True
    created_at: datetime
    signature: Optional[str] = None  # Assinatura automática do departamento
    avatar_url: Optional[str] = None  # Avatar do assistente
    manual_instructions: Optional[str] = None  # Instruções manuais editáveis

class DepartmentTransfer(BaseModel):
    id: str
    from_contact: str  # phone_number
    to_department: str  # department_id
    message: str
    status: str  # "pending", "accepted", "completed"
    created_at: datetime
    handled_by: Optional[str] = None
    notes: Optional[str] = None

class DepartmentCreate(BaseModel):
    name: str
    description: str
    signature: Optional[str] = None
    avatar_url: Optional[str] = None
    manual_instructions: Optional[str] = None
    whatsapp_number: Optional[str] = None
    integration_mode: Optional[str] = "qr"  # "qr" or "official"

# Utility functions
def create_token(user_id: str):
    payload = {
        "user_id": user_id,
        "exp": datetime.utcnow() + timedelta(days=7)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")

def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload.get("user_id")
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    user_id = verify_token(credentials.credentials)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")
    return user_id

def convert_mongo_document(doc):
    """Convert MongoDB document to JSON-serializable format"""
    if doc is None:
        return None
    if isinstance(doc, list):
        return [convert_mongo_document(item) for item in doc]
    if isinstance(doc, dict):
        result = {}
        for key, value in doc.items():
            if key == '_id':
                continue  # Skip MongoDB _id field
            elif isinstance(value, datetime):
                result[key] = value.isoformat()
            elif hasattr(value, '__dict__'):
                result[key] = str(value)
            else:
                result[key] = value
        return result
    return doc

def get_database():
    return database

# Routes
@app.get("/")
async def root():
    return {"message": "Empresas Web CRM API", "status": "running"}

@app.post("/api/auth/login")
async def login(request: LoginRequest, db=Depends(get_database)):
    # Check admin credentials first
    if request.username == "admin" and request.password == "admin123":
        token = create_token("admin")
        return {
            "token": token,
            "user": {
                "id": "admin",
                "username": "admin",
                "role": "admin"
            }
        }
    
    # Check database for regular users
    users_collection = db.users
    user = await users_collection.find_one({"username": request.username})
    
    if user and user.get("password") == request.password:
        token = create_token(user["id"])
        return {
            "token": token,
            "user": {
                "id": user["id"],
                "username": user["username"],
                "role": user.get("role", "user"),
                "name": user.get("name"),
                "email": user.get("email")
            }
        }
    else:
        raise HTTPException(status_code=401, detail="Invalid credentials")

@app.post("/api/auth/register")
async def register(request: RegisterRequest, db=Depends(get_database)):
    """Register new user"""
    try:
        users_collection = db.users
        
        # Check if username already exists
        existing_user = await users_collection.find_one({"username": request.username})
        if existing_user:
            raise HTTPException(status_code=400, detail="Username already exists")
        
        # Check if email already exists (if provided)
        if request.email:
            existing_email = await users_collection.find_one({"email": request.email})
            if existing_email:
                raise HTTPException(status_code=400, detail="Email already registered")
        
        # Create new user
        user_data = {
            "id": str(uuid.uuid4()),
            "username": request.username,
            "password": request.password,  # In production, hash this password
            "email": request.email,
            "name": request.name or request.username,
            "role": "user",
            "created_at": datetime.utcnow().isoformat(),
            "active": True
        }
        
        await users_collection.insert_one(user_data)
        
        # Create token for immediate login
        token = create_token(user_data["id"])
        
        return {
            "token": token,
            "user": {
                "id": user_data["id"],
                "username": user_data["username"],
                "role": user_data["role"],
                "name": user_data["name"],
                "email": user_data["email"]
            },
            "message": "User registered successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error registering user: {str(e)}")
        raise HTTPException(status_code=500, detail="Error creating user account")

@app.get("/api/auth/verify")
async def verify_auth(current_user: str = Depends(get_current_user)):
    return {"valid": True, "user_id": current_user}

# WhatsApp Routes
WHATSAPP_SERVICE_URL = "http://localhost:3001"

@app.post("/api/whatsapp/message", response_model=MessageResponse)
async def handle_whatsapp_message(message_data: WhatsAppMessage, db=Depends(get_database)):
    """Process incoming WhatsApp messages and generate AI responses"""
    try:
        # Get or create contact
        contacts_collection = db.contacts
        contact = await contacts_collection.find_one({"phone_number": message_data.phone_number})
        
        if not contact:
            # Create new contact
            contact_data = {
                "id": str(uuid.uuid4()),
                "name": f"Contact {message_data.phone_number}",
                "phone_number": message_data.phone_number,
                "email": None,
                "company": None,
                "created_at": datetime.utcnow().isoformat(),
                "last_message": datetime.utcnow().isoformat()
            }
            await contacts_collection.insert_one(contact_data)
            contact = contact_data
        else:
            # Update last message time
            await contacts_collection.update_one(
                {"phone_number": message_data.phone_number},
                {"$set": {"last_message": datetime.utcnow().isoformat()}}
            )

        # Store message in conversation history
        conversations_collection = db.conversations
        conversation_data = {
            "id": str(uuid.uuid4()),
            "contact_phone": message_data.phone_number,
            "message": message_data.message,
            "direction": "incoming",
            "timestamp": datetime.utcnow().isoformat(),
            "ai_processed": False
        }
        await conversations_collection.insert_one(conversation_data)

        # Generate AI response
        ai_response = await generate_ai_response(message_data.message, message_data.phone_number)
        
        # Check if AI response indicates a department transfer
        await check_and_handle_department_transfer(ai_response, message_data.phone_number, db)
        
        if ai_response:
            # Store AI response
            response_data = {
                "id": str(uuid.uuid4()),
                "contact_phone": message_data.phone_number,
                "message": ai_response,
                "direction": "outgoing",
                "timestamp": datetime.utcnow().isoformat(),
                "ai_generated": True
            }
            await conversations_collection.insert_one(response_data)

        return MessageResponse(reply=ai_response)

    except Exception as e:
        logging.error(f"Error processing WhatsApp message: {str(e)}")
        return MessageResponse(
            reply="Olá! Sou o assistente virtual da Empresas Web. Como posso ajudá-lo hoje?",
            success=False
        )

async def check_and_handle_department_transfer(ai_response: str, phone_number: str, db):
    """Check if AI response indicates a department transfer and handle it"""
    try:
        transfer_indicators = [
            "transferir você para",
            "vou transferir",
            "encaminhar para",
            "direcionando para",
            "departamento de"
        ]
        
        if any(indicator in ai_response.lower() for indicator in transfer_indicators):
            # Extract department from response
            departments = ["vendas", "suporte", "financeiro", "gerencial"]
            detected_department = None
            
            for dept in departments:
                if dept in ai_response.lower():
                    detected_department = dept
                    break
            
            if detected_department:
                # Get or create department
                department = await db.departments.find_one({"name": {"$regex": detected_department, "$options": "i"}})
                
                if not department:
                    # Create department if it doesn't exist
                    department_data = {
                        "id": str(uuid.uuid4()),
                        "name": detected_department.title(),
                        "description": f"Departamento de {detected_department}",
                        "active": True,
                        "created_at": datetime.utcnow().isoformat()
                    }
                    await db.departments.insert_one(department_data)
                    department = department_data
                
                # Create transfer record
                transfer_data = {
                    "id": str(uuid.uuid4()),
                    "from_contact": phone_number,
                    "to_department": department["id"],
                    "message": ai_response,
                    "status": "pending",
                    "created_at": datetime.utcnow().isoformat(),
                    "handled_by": None,
                    "notes": f"Transfer automático detectado pela IA para {detected_department}"
                }
                await db.transfers.insert_one(transfer_data)
                
    except Exception as e:
        logging.error(f"Error handling department transfer: {str(e)}")

async def generate_ai_response(message: str, phone_number: str, department_id: Optional[str] = None) -> str:
    """Generate AI response using Emergent LLM with specialized department context"""
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        import os
        
        # Get API key from environment
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        logging.info(f"AI Response - API key found: {api_key is not None}")
        
        if not api_key:
            logging.warning("No EMERGENT_LLM_KEY found, using fallback response")
            base_response = "Olá! Sou o assistente virtual da Empresas Web. Como posso ajudá-lo hoje?"
            return await add_department_signature(base_response, department_id)
        
        # Get department info for specialized context
        department_context = ""
        department_instructions = ""
        if department_id:
            try:
                db = database
                department = await db.departments.find_one({"id": department_id})
                if department:
                    department_context = f"Departamento: {department['name']} - {department['description']}"
                    department_instructions = department.get('manual_instructions', '')
            except:
                pass
        
        # Build specialized system message
        system_message = f"""Você é o assistente de IA especializado da Empresas Web, uma empresa líder em serviços contábeis e empresariais.

{department_context}

INSTRUÇÕES MANUAIS DO DEPARTAMENTO:
{department_instructions}

IMPORTANTE: Priorize sempre as instruções manuais acima em caso de conflito com outras orientações.

Serviços da Empresas Web:
- Abertura de empresa e MEI
- Contabilidade completa
- RH e folha de pagamento  
- Tributos e impostos
- Emissão de notas fiscais
- Consultoria empresarial
- Gestão financeira

Departamentos disponíveis:
- Abertura de Empresa: Constituição, MEI, CNPJ, documentação
- Dúvidas Contábeis: Balanços, demonstrações, escrituração
- RH e Folha: Admissões, cálculos trabalhistas, eSocial
- Tributos e Impostos: Simples Nacional, planejamento tributário
- Emissão de Notas Fiscais: NFe, NFSe, certificados digitais
- Outros Assuntos: Consultoria geral empresarial
- Financeiro: Contas, fluxo de caixa, cobrança

Seu papel:
- Responder de forma especializada conforme seu departamento
- Transferir para departamento correto quando necessário: "Vou transferir você para [DEPARTAMENTO]"
- Nunca inventar links ou informações
- Responder sempre em português brasileiro
- Ser cordial, profissional e direto
- Manter respostas concisas e práticas

NÃO inclua assinatura na resposta - ela será adicionada automaticamente."""
        
        # Try different models if one fails
        models_to_try = [
            ("gemini", "gemini-1.5-flash"),
            ("openai", "gpt-4o-mini"),
            ("openai", "gpt-3.5-turbo")
        ]
        
        for provider, model in models_to_try:
            try:
                # Initialize chat with session per phone number and department
                session_id = f"whatsapp_{phone_number}_{department_id or 'general'}"
                chat = LlmChat(
                    api_key=api_key,
                    session_id=session_id,
                    system_message=system_message
                ).with_model(provider, model)
                
                # Create user message
                user_message = UserMessage(text=message)
                
                # Get AI response
                logging.info(f"Sending message to AI using {provider}/{model} for dept {department_id}: {message}")
                response = await chat.send_message(user_message)
                logging.info(f"AI Response received from {provider}/{model}: {response}")
                
                if response:
                    # Add department signature
                    return await add_department_signature(response, department_id)
                    
            except Exception as model_error:
                logging.warning(f"Failed with {provider}/{model}: {str(model_error)}")
                continue
        
        # If all models fail, return specialized fallback
        fallback_responses = {
            "Abertura de Empresa": "Olá! Sou especialista em abertura de empresas. Posso ajudar com MEI, CNPJ e toda documentação necessária!",
            "Dúvidas Contábeis": "Olá! Sou especialista em contabilidade. Posso ajudar com balanços, demonstrações e escrituração contábil!",
            "RH e Folha": "Olá! Sou especialista em RH e folha de pagamento. Posso ajudar com admissões, cálculos trabalhistas e eSocial!",
            "Tributos e Impostos": "Olá! Sou especialista em tributos. Posso ajudar com Simples Nacional e planejamento tributário!",
            "Emissão de Notas Fiscais": "Olá! Sou especialista em notas fiscais. Posso ajudar com NFe, NFSe e certificados digitais!",
            "Outros Assuntos": "Olá! Sou consultor empresarial. Posso ajudar com orientações gerais e estratégicas!",
            "Financeiro": "Olá! Sou especialista financeiro. Posso ajudar com contas, fluxo de caixa e cobrança!"
        }
        
        # Get department name for fallback
        dept_name = None
        if department_id:
            try:
                department = await database.departments.find_one({"id": department_id})
                dept_name = department.get('name') if department else None
            except:
                pass
        
        base_response = fallback_responses.get(dept_name, "Olá! Sou o assistente virtual da Empresas Web. Como posso ajudá-lo hoje? 🤖")
        return await add_department_signature(base_response, department_id)
        
    except Exception as e:
        logging.error(f"Error generating AI response: {str(e)}", exc_info=True)
        base_response = "Olá! Sou o assistente virtual da Empresas Web. Como posso ajudá-lo hoje?"
        return await add_department_signature(base_response, department_id)

async def add_department_signature(message: str, department_id: Optional[str] = None) -> str:
    """Add department signature to message"""
    try:
        if not department_id:
            return message
            
        db = database
        department = await db.departments.find_one({"id": department_id})
        
        if department and department.get('signature'):
            return f"{message}\n\n{department['signature']}"
        elif department:
            return f"{message}\n\n---\n{department['name']} - Empresas Web\n📞 Entre em contato conosco!"
            
        return message
        
    except Exception as e:
        logging.error(f"Error adding signature: {str(e)}")
        return message


# WhatsApp QR Routes (Simplified for MVP)
@app.get("/api/whatsapp/qr")
async def get_whatsapp_qr(current_user: str = Depends(get_current_user)):
    """Get QR code for WhatsApp connection (Mock for MVP)"""
    import base64
    import qrcode
    from io import BytesIO
    
    try:
        # For MVP, generate a mock QR code
        qr_data = "https://web.whatsapp.com/qr/mock-empresas-web-connection"
        
        # Generate QR code
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(qr_data)
        qr.make(fit=True)
        
        # Create QR code image
        img = qr.make_image(fill_color="black", back_color="white")
        buffer = BytesIO()
        img.save(buffer, format='PNG')
        buffer.seek(0)
        
        # Convert to base64
        qr_base64 = base64.b64encode(buffer.getvalue()).decode()
        
        return {
            "qr_code": f"data:image/png;base64,{qr_base64}",
            "status": "waiting_for_scan",
            "message": "Escaneie o QR Code com seu WhatsApp para conectar"
        }
        
    except Exception as e:
        logging.error(f"Error generating QR code: {str(e)}")
        return {"error": "Erro ao gerar QR Code", "qr_code": None}

@app.get("/api/whatsapp/status")
async def get_whatsapp_connection_status(current_user: str = Depends(get_current_user)):
    """Get WhatsApp connection status"""
    # For MVP, simulate connection status
    return {
        "connected": True,  # Mock as connected for demo
        "phone_number": "+55 11 99999-9999",
        "name": "Empresas Web",
        "status": "connected",
        "last_seen": datetime.utcnow().isoformat()
    }

@app.post("/api/whatsapp/send")
async def send_whatsapp_message(
    phone_number: str,
    message: str,
    current_user: str = Depends(get_current_user),
    db=Depends(get_database)
):
    """Send WhatsApp message (Mock for MVP)"""
    try:
        # For MVP, just store the message as sent
        conversation_data = {
            "id": str(uuid.uuid4()),
            "contact_phone": phone_number,
            "message": message,
            "direction": "outgoing",
            "timestamp": datetime.utcnow().isoformat(),
            "sent_by": current_user,
            "mock_sent": True
        }
        
        await db.conversations.insert_one(conversation_data)
        
        return {
            "success": True,
            "message_id": conversation_data["id"],
            "status": "sent",
            "timestamp": conversation_data["timestamp"]
        }
        
    except Exception as e:
        logging.error(f"Error sending message: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro ao enviar mensagem")

# Contacts Routes
@app.get("/api/contacts", response_model=List[Contact])
async def get_contacts(current_user: str = Depends(get_current_user), db=Depends(get_database)):
    contacts = await db.contacts.find().to_list(length=100)
    return convert_mongo_document(contacts)

@app.post("/api/contacts")
async def create_contact(contact: ContactCreate, current_user: str = Depends(get_current_user), db=Depends(get_database)):
    contact_data = {
        "id": str(uuid.uuid4()),
        **contact.dict(),
        "created_at": datetime.utcnow().isoformat()
    }
    await db.contacts.insert_one(contact_data)
    return convert_mongo_document(contact_data)

@app.get("/api/conversations/{phone_number}")
async def get_conversations(phone_number: str, current_user: str = Depends(get_current_user), db=Depends(get_database)):
    conversations = await db.conversations.find(
        {"contact_phone": phone_number}
    ).sort("timestamp", 1).to_list(length=100)
    return convert_mongo_document(conversations)

@app.get("/api/dashboard/stats")
async def get_dashboard_stats(current_user: str = Depends(get_current_user), db=Depends(get_database)):
    contacts_count = await db.contacts.count_documents({})
    conversations_count = await db.conversations.count_documents({})
    today_messages = await db.conversations.count_documents({
        "timestamp": {"$gte": datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)}
    })
    
    return {
        "total_contacts": contacts_count,
        "total_conversations": conversations_count,
        "today_messages": today_messages,
        "whatsapp_connected": True  # Will be dynamic when WhatsApp service is integrated
    }

# Assistants Management Routes
@app.get("/api/assistants")
async def get_assistants(current_user: str = Depends(get_current_user), db=Depends(get_database)):
    """Get all AI assistants with department info"""
    assistants = []
    departments = await db.departments.find().to_list(length=100)
    
    for dept in departments:
        assistant_data = {
            "id": dept["id"],
            "name": dept.get("assistant_name", dept["name"]),
            "type": "ia",
            "department_id": dept["id"],
            "department_name": dept["name"],
            "avatar_url": dept.get("avatar_url"),
            "manual_instructions": dept.get("manual_instructions", ""),
            "signature_template": dept.get("signature", ""),
            "enabled": dept.get("active", True),
            "created_at": dept.get("created_at"),
            "phone_number": dept.get("phone_number", ""),
            "specialization": dept.get("description", "")
        }
        assistants.append(assistant_data)
    
    return convert_mongo_document(assistants)

@app.put("/api/assistants/{assistant_id}")
async def update_assistant(
    assistant_id: str,
    name: Optional[str] = None,
    avatar_url: Optional[str] = None,
    manual_instructions: Optional[str] = None,
    signature_template: Optional[str] = None,
    enabled: Optional[bool] = None,
    phone_number: Optional[str] = None,
    current_user: str = Depends(get_current_user),
    db=Depends(get_database)
):
    """Update AI assistant information"""
    update_data = {}
    
    if name is not None:
        update_data["assistant_name"] = name
    if avatar_url is not None:
        update_data["avatar_url"] = avatar_url
    if manual_instructions is not None:
        update_data["manual_instructions"] = manual_instructions
    if signature_template is not None:
        update_data["signature"] = signature_template
    if enabled is not None:
        update_data["active"] = enabled
    if phone_number is not None:
        update_data["phone_number"] = phone_number
    
    if update_data:
        update_data["updated_at"] = datetime.utcnow().isoformat()
        result = await db.departments.update_one(
            {"id": assistant_id},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Assistant not found")
    
    return {"success": True, "updated_fields": list(update_data.keys())}

@app.post("/api/assistants/{assistant_id}/duplicate")
async def duplicate_assistant(
    assistant_id: str,
    current_user: str = Depends(get_current_user),
    db=Depends(get_database)
):
    """Duplicate an existing assistant"""
    original = await db.departments.find_one({"id": assistant_id})
    if not original:
        raise HTTPException(status_code=404, detail="Assistant not found")
    
    # Create duplicate with modified name
    duplicate_data = {
        "id": str(uuid.uuid4()),
        "name": f"{original['name']} - Cópia",
        "assistant_name": f"{original.get('assistant_name', original['name'])} - Cópia",
        "description": original["description"],
        "avatar_url": original.get("avatar_url"),
        "manual_instructions": original.get("manual_instructions", ""),
        "signature": original.get("signature", ""),
        "active": False,  # Start duplicates as inactive
        "created_at": datetime.utcnow().isoformat(),
        "phone_number": ""  # Clear phone number for duplicate
    }
    
    await db.departments.insert_one(duplicate_data)
    return convert_mongo_document(duplicate_data)
@app.get("/api/departments")
async def get_departments(current_user: str = Depends(get_current_user), db=Depends(get_database)):
    departments = await db.departments.find().to_list(length=100)
    return convert_mongo_document(departments)

@app.post("/api/departments")
async def create_department(
    department: DepartmentCreate,
    current_user: str = Depends(get_current_user),
    db=Depends(get_database)
):
    # Check if WhatsApp number is unique (if provided)
    if department.whatsapp_number:
        existing_dept = await db.departments.find_one({"whatsapp_number": department.whatsapp_number})
        if existing_dept:
            raise HTTPException(status_code=400, detail="WhatsApp number already in use")

    department_data = {
        "id": str(uuid.uuid4()),
        "name": department.name,
        "description": department.description,
        "signature": department.signature,
        "avatar_url": department.avatar_url,
        "manual_instructions": department.manual_instructions,
        "whatsapp_number": department.whatsapp_number,
        "integration_mode": department.integration_mode,
        "active": True,
        "created_at": datetime.utcnow().isoformat()
    }
    await db.departments.insert_one(department_data)
    return convert_mongo_document(department_data)

@app.put("/api/departments/{department_id}")
async def update_department(
    department_id: str,
    name: Optional[str] = None,
    description: Optional[str] = None,
    signature: Optional[str] = None,
    avatar_url: Optional[str] = None,
    manual_instructions: Optional[str] = None,
    whatsapp_number: Optional[str] = None,
    integration_mode: Optional[str] = None,
    active: Optional[bool] = None,
    current_user: str = Depends(get_current_user),
    db=Depends(get_database)
):
    """Update department information including signature, avatar and manual instructions"""
    # Check if WhatsApp number is unique (if provided and different from current)
    if whatsapp_number is not None:
        existing_dept = await db.departments.find_one({
            "whatsapp_number": whatsapp_number,
            "id": {"$ne": department_id}
        })
        if existing_dept:
            raise HTTPException(status_code=400, detail="WhatsApp number already in use")
    
    update_data = {}
    if name is not None:
        update_data["name"] = name
    if description is not None:
        update_data["description"] = description
    if signature is not None:
        update_data["signature"] = signature
    if avatar_url is not None:
        update_data["avatar_url"] = avatar_url
    if manual_instructions is not None:
        update_data["manual_instructions"] = manual_instructions
    if whatsapp_number is not None:
        update_data["whatsapp_number"] = whatsapp_number
    if integration_mode is not None:
        update_data["integration_mode"] = integration_mode
    if active is not None:
        update_data["active"] = active
    
    if update_data:
        update_data["updated_at"] = datetime.utcnow().isoformat()
        result = await db.departments.update_one(
            {"id": department_id},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Department not found")
    
    return {"success": True, "updated_fields": list(update_data.keys())}

@app.get("/api/transfers")
async def get_transfers(current_user: str = Depends(get_current_user), db=Depends(get_database)):
    transfers = await db.transfers.find().sort("created_at", -1).to_list(length=100)
    return convert_mongo_document(transfers)

@app.post("/api/transfers")
async def create_transfer(
    contact_phone: str,
    department_id: str,
    message: str,
    current_user: str = Depends(get_current_user),
    db=Depends(get_database)
):
    transfer_data = {
        "id": str(uuid.uuid4()),
        "from_contact": contact_phone,
        "to_department": department_id,
        "message": message,
        "status": "pending",
        "created_at": datetime.utcnow().isoformat(),
        "handled_by": None,
        "notes": None
    }
    await db.transfers.insert_one(transfer_data)
    return convert_mongo_document(transfer_data)

@app.put("/api/transfers/{transfer_id}")
async def update_transfer(
    transfer_id: str,
    status: str,
    notes: Optional[str] = None,
    current_user: str = Depends(get_current_user),
    db=Depends(get_database)
):
    update_data = {
        "status": status,
        "handled_by": current_user,
        "notes": notes
    }
    
    result = await db.transfers.update_one(
        {"id": transfer_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Transfer not found")
    
    return {"success": True}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)