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
    yield
    # Shutdown
    client.close()

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

class DepartmentTransfer(BaseModel):
    id: str
    from_contact: str  # phone_number
    to_department: str  # department_id
    message: str
    status: str  # "pending", "accepted", "completed"
    created_at: datetime
    handled_by: Optional[str] = None
    notes: Optional[str] = None

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

def get_database():
    return database

# Routes
@app.get("/")
async def root():
    return {"message": "Empresas Web CRM API", "status": "running"}

@app.post("/api/auth/login")
async def login(request: LoginRequest):
    # Simple admin authentication for MVP
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
    else:
        raise HTTPException(status_code=401, detail="Invalid credentials")

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
                "created_at": datetime.utcnow(),
                "last_message": datetime.utcnow()
            }
            await contacts_collection.insert_one(contact_data)
            contact = contact_data
        else:
            # Update last message time
            await contacts_collection.update_one(
                {"phone_number": message_data.phone_number},
                {"$set": {"last_message": datetime.utcnow()}}
            )

        # Store message in conversation history
        conversations_collection = db.conversations
        conversation_data = {
            "id": str(uuid.uuid4()),
            "contact_phone": message_data.phone_number,
            "message": message_data.message,
            "direction": "incoming",
            "timestamp": datetime.utcnow(),
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
                "timestamp": datetime.utcnow(),
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
                        "created_at": datetime.utcnow()
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
                    "created_at": datetime.utcnow(),
                    "handled_by": None,
                    "notes": f"Transfer automático detectado pela IA para {detected_department}"
                }
                await db.transfers.insert_one(transfer_data)
                
    except Exception as e:
        logging.error(f"Error handling department transfer: {str(e)}")

async def generate_ai_response(message: str, phone_number: str) -> str:
    """Generate AI response using Emergent LLM"""
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        import os
        
        # Get API key from environment
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        if not api_key:
            return "Olá! Sou o assistente virtual da Empresas Web. Como posso ajudá-lo hoje?"
        
        # Initialize chat with session per phone number
        chat = LlmChat(
            api_key=api_key,
            session_id=f"whatsapp_{phone_number}",
            system_message="""Você é o assistente virtual da Empresas Web, uma empresa de CRM e automação.

Seu papel:
- Atender clientes via WhatsApp de forma profissional e amigável
- Fornecer informações sobre serviços CRM
- Ajudar com transferências para departamentos
- Responder em português brasileiro

Serviços da Empresas Web:
- Sistema CRM completo
- Integração WhatsApp Business
- Assistente virtual com IA
- Automação de atendimento
- Gestão de clientes e vendas

Departamentos disponíveis:
- Vendas: Para novos clientes e orçamentos
- Suporte: Para problemas técnicos e dúvidas
- Financeiro: Para questões de pagamento e cobrança
- Gerencial: Para questões administrativas

Para transferir, use comandos como:
- "Vou transferir você para o departamento de [DEPARTAMENTO]"

Seja sempre cordial, útil e direto."""
        ).with_model("openai", "gpt-4o-mini")
        
        # Create user message
        user_message = UserMessage(text=message)
        
        # Get AI response
        response = await chat.send_message(user_message)
        
        return response if response else "Desculpe, não consegui processar sua mensagem. Tente novamente."
        
    except Exception as e:
        logging.error(f"Error generating AI response: {str(e)}")
        return "Olá! Sou o assistente virtual da Empresas Web. Como posso ajudá-lo hoje?"

@app.post("/api/whatsapp/send")
async def send_whatsapp_message(phone_number: str, message: str):
    """Send message via WhatsApp service"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{WHATSAPP_SERVICE_URL}/send",
                json={"phone_number": phone_number, "message": message}
            )
            return response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/whatsapp/qr")
async def get_qr_code():
    """Get current QR code for WhatsApp authentication"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{WHATSAPP_SERVICE_URL}/qr")
            return response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/whatsapp/status")
async def get_whatsapp_status():
    """Get WhatsApp connection status"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{WHATSAPP_SERVICE_URL}/status")
            return response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Contacts Routes
@app.get("/api/contacts", response_model=List[Contact])
async def get_contacts(current_user: str = Depends(get_current_user), db=Depends(get_database)):
    contacts = await db.contacts.find().to_list(length=100)
    return [Contact(**contact) for contact in contacts]

@app.post("/api/contacts")
async def create_contact(contact: ContactCreate, current_user: str = Depends(get_current_user), db=Depends(get_database)):
    contact_data = {
        "id": str(uuid.uuid4()),
        **contact.dict(),
        "created_at": datetime.utcnow()
    }
    await db.contacts.insert_one(contact_data)
    return Contact(**contact_data)

@app.get("/api/conversations/{phone_number}")
async def get_conversations(phone_number: str, current_user: str = Depends(get_current_user), db=Depends(get_database)):
    conversations = await db.conversations.find(
        {"contact_phone": phone_number}
    ).sort("timestamp", 1).to_list(length=100)
    return conversations

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

# Department Routes
@app.get("/api/departments")
async def get_departments(current_user: str = Depends(get_current_user), db=Depends(get_database)):
    departments = await db.departments.find().to_list(length=100)
    return departments

@app.post("/api/departments")
async def create_department(
    name: str,
    description: str,
    current_user: str = Depends(get_current_user),
    db=Depends(get_database)
):
    department_data = {
        "id": str(uuid.uuid4()),
        "name": name,
        "description": description,
        "active": True,
        "created_at": datetime.utcnow()
    }
    await db.departments.insert_one(department_data)
    return department_data

@app.get("/api/transfers")
async def get_transfers(current_user: str = Depends(get_current_user), db=Depends(get_database)):
    transfers = await db.transfers.find().sort("created_at", -1).to_list(length=100)
    return transfers

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
        "created_at": datetime.utcnow(),
        "handled_by": None,
        "notes": None
    }
    await db.transfers.insert_one(transfer_data)
    return transfer_data

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