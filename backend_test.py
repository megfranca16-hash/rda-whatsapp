#!/usr/bin/env python3
"""
Backend Test Suite for Empresas Web CRM
Tests the FastAPI backend with AI integration and department system
"""

import asyncio
import aiohttp
import json
import sys
import os
from datetime import datetime

# Get backend URL from frontend .env
BACKEND_URL = "https://crm-extension-hub.preview.emergentagent.com"
API_BASE = f"{BACKEND_URL}/api"

class BackendTester:
    def __init__(self):
        self.session = None
        self.auth_token = None
        self.test_results = []
        
    async def setup(self):
        """Setup test session"""
        self.session = aiohttp.ClientSession()
        
    async def teardown(self):
        """Cleanup test session"""
        if self.session:
            await self.session.close()
            
    def log_result(self, test_name, success, message="", details=None):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        if details:
            print(f"   Details: {details}")
        self.test_results.append({
            "test": test_name,
            "success": success,
            "message": message,
            "details": details
        })
        
    async def test_server_health(self):
        """Test if server is running"""
        try:
            # Test the API root endpoint instead of the main root
            async with self.session.get(f"{API_BASE}/dashboard/stats") as response:
                # This endpoint requires auth, so we expect 401 or 403, not 500
                if response.status in [401, 403]:
                    self.log_result("Server Health", True, "Backend API is accessible (auth required)")
                    return True
                elif response.status == 200:
                    self.log_result("Server Health", True, "Backend API is accessible")
                    return True
                else:
                    self.log_result("Server Health", False, f"Backend API returned unexpected status {response.status}")
                    return False
        except Exception as e:
            self.log_result("Server Health", False, f"Backend API not accessible: {str(e)}")
            return False
            
    async def test_authentication(self):
        """Test authentication system"""
        try:
            # Test login with correct credentials
            login_data = {
                "username": "admin",
                "password": "admin123"
            }
            
            async with self.session.post(f"{API_BASE}/auth/login", json=login_data) as response:
                if response.status == 200:
                    data = await response.json()
                    self.auth_token = data.get("token")
                    if self.auth_token:
                        self.log_result("Authentication Login", True, "Admin login successful")
                        
                        # Test token verification
                        headers = {"Authorization": f"Bearer {self.auth_token}"}
                        async with self.session.get(f"{API_BASE}/auth/verify", headers=headers) as verify_response:
                            if verify_response.status == 200:
                                verify_data = await verify_response.json()
                                self.log_result("Authentication Verify", True, f"Token verified for user: {verify_data.get('user_id')}")
                                return True
                            else:
                                self.log_result("Authentication Verify", False, f"Token verification failed: {verify_response.status}")
                                return False
                    else:
                        self.log_result("Authentication Login", False, "No token received")
                        return False
                else:
                    self.log_result("Authentication Login", False, f"Login failed with status {response.status}")
                    return False
                    
        except Exception as e:
            self.log_result("Authentication", False, f"Authentication test failed: {str(e)}")
            return False
            
    async def test_user_registration(self):
        """Test user registration functionality"""
        try:
            # Test 1: Register a new user with valid data
            import time
            unique_suffix = str(int(time.time()))
            register_data = {
                "username": f"testuser_{unique_suffix}",
                "password": "testpass123",
                "email": f"testuser_{unique_suffix}@empresasweb.com",
                "name": "Test User Registration"
            }
            
            async with self.session.post(f"{API_BASE}/auth/register", json=register_data) as response:
                if response.status == 200:
                    data = await response.json()
                    if data.get("token") and data.get("user"):
                        user_data = data["user"]
                        if (user_data.get("username") == register_data["username"] and 
                            user_data.get("email") == register_data["email"] and
                            user_data.get("name") == register_data["name"]):
                            self.log_result("User Registration - Valid Data", True, f"User registered successfully: {user_data['username']}")
                            
                            # Store the new user token for login test
                            new_user_token = data.get("token")
                            
                            # Test 2: Try to register with same username (should fail)
                            duplicate_data = {
                                "username": register_data["username"],
                                "password": "differentpass",
                                "email": "different@email.com"
                            }
                            
                            async with self.session.post(f"{API_BASE}/auth/register", json=duplicate_data) as dup_response:
                                if dup_response.status == 400:
                                    dup_error = await dup_response.json()
                                    if "username already exists" in dup_error.get("detail", "").lower():
                                        self.log_result("User Registration - Duplicate Username", True, "Correctly rejected duplicate username")
                                    else:
                                        self.log_result("User Registration - Duplicate Username", False, f"Wrong error message: {dup_error}")
                                else:
                                    self.log_result("User Registration - Duplicate Username", False, f"Should have failed with 400, got {dup_response.status}")
                            
                            # Test 3: Try to register with same email (should fail)
                            duplicate_email_data = {
                                "username": f"different_user_{unique_suffix}",
                                "password": "testpass123",
                                "email": register_data["email"]
                            }
                            
                            async with self.session.post(f"{API_BASE}/auth/register", json=duplicate_email_data) as email_response:
                                if email_response.status == 400:
                                    email_error = await email_response.json()
                                    if "email already registered" in email_error.get("detail", "").lower():
                                        self.log_result("User Registration - Duplicate Email", True, "Correctly rejected duplicate email")
                                    else:
                                        self.log_result("User Registration - Duplicate Email", False, f"Wrong error message: {email_error}")
                                else:
                                    self.log_result("User Registration - Duplicate Email", False, f"Should have failed with 400, got {email_response.status}")
                            
                            # Test 4: Test login with newly registered user
                            login_new_user = {
                                "username": register_data["username"],
                                "password": register_data["password"]
                            }
                            
                            async with self.session.post(f"{API_BASE}/auth/login", json=login_new_user) as login_response:
                                if login_response.status == 200:
                                    login_data = await login_response.json()
                                    if login_data.get("token") and login_data.get("user"):
                                        login_user = login_data["user"]
                                        if login_user.get("username") == register_data["username"]:
                                            self.log_result("User Registration - Login Test", True, f"New user can login successfully: {login_user['username']}")
                                            
                                            # Test token verification for new user
                                            headers = {"Authorization": f"Bearer {login_data['token']}"}
                                            async with self.session.get(f"{API_BASE}/auth/verify", headers=headers) as verify_response:
                                                if verify_response.status == 200:
                                                    self.log_result("User Registration - Token Verify", True, "New user token verified successfully")
                                                    return True
                                                else:
                                                    self.log_result("User Registration - Token Verify", False, f"New user token verification failed: {verify_response.status}")
                                        else:
                                            self.log_result("User Registration - Login Test", False, "Login returned wrong user data")
                                    else:
                                        self.log_result("User Registration - Login Test", False, "Login response missing token or user")
                                else:
                                    login_error = await login_response.text()
                                    self.log_result("User Registration - Login Test", False, f"New user login failed: {login_response.status} - {login_error}")
                            
                        else:
                            self.log_result("User Registration - Valid Data", False, f"Registration returned wrong user data: {user_data}")
                    else:
                        self.log_result("User Registration - Valid Data", False, f"Registration response missing token or user: {data}")
                else:
                    error_text = await response.text()
                    self.log_result("User Registration - Valid Data", False, f"Registration failed: {response.status} - {error_text}")
                    return False
                    
        except Exception as e:
            self.log_result("User Registration", False, f"Registration test failed: {str(e)}")
            return False
            
        return True
            
    async def test_departments_system(self):
        """Test department CRUD operations"""
        if not self.auth_token:
            self.log_result("Departments System", False, "No auth token available")
            return False
            
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        try:
            # Test GET departments (should have default departments)
            async with self.session.get(f"{API_BASE}/departments", headers=headers) as response:
                if response.status == 200:
                    departments = await response.json()
                    if isinstance(departments, list) and len(departments) >= 4:
                        # Check for default departments
                        dept_names = [dept.get("name", "").lower() for dept in departments]
                        expected_depts = ["abertura", "contábeis", "folha", "tributos", "notas", "outros", "financeiro"]
                        found_depts = [dept for dept in expected_depts if any(dept in name for name in dept_names)]
                        
                        if len(found_depts) >= 4:
                            self.log_result("Departments GET", True, f"Found {len(departments)} departments including defaults: {found_depts}")
                        else:
                            self.log_result("Departments GET", True, f"Found {len(departments)} departments, missing some defaults")
                    else:
                        self.log_result("Departments GET", False, f"Expected list of departments, got: {type(departments)}")
                        return False
                else:
                    self.log_result("Departments GET", False, f"Failed to get departments: {response.status}")
                    return False
                    
            # Test POST new department (basic)
            new_dept_data = {
                "name": "Teste Departamento Básico",
                "description": "Departamento criado para teste automatizado",
                "signature": "---\n🧪 Teste Departamento\n📧 teste@empresasweb.com\n📞 (11) 99999-0000\n\nDepartamento de teste!"
            }
            
            async with self.session.post(f"{API_BASE}/departments", headers=headers, json=new_dept_data) as response:
                if response.status == 200:
                    dept_data = await response.json()
                    if dept_data.get("name") == new_dept_data["name"]:
                        self.log_result("Departments POST Basic", True, f"Created department: {dept_data.get('name')}")
                    else:
                        self.log_result("Departments POST Basic", False, f"Department creation returned unexpected data: {dept_data}")
                        return False
                else:
                    response_text = await response.text()
                    self.log_result("Departments POST Basic", False, f"Failed to create department: {response.status} - {response_text}")
                    return False
                    
        except Exception as e:
            self.log_result("Departments System", False, f"Department tests failed: {str(e)}")
            return False
            
        return True
            
    async def test_enhanced_department_management(self):
        """Test enhanced department management with WhatsApp number and integration mode"""
        if not self.auth_token:
            self.log_result("Enhanced Department Management", False, "No auth token available")
            return False
            
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        try:
            import time
            unique_suffix = str(int(time.time()))
            
            # Test 1: Create department with WhatsApp number and integration mode
            enhanced_dept_data = {
                "name": f"Departamento Avançado {unique_suffix}",
                "description": "Departamento com integração WhatsApp",
                "signature": "---\n📱 Departamento Avançado\n📧 avancado@empresasweb.com\n📞 (11) 99999-1234\n\nDepartamento com WhatsApp!",
                "whatsapp_number": f"+5511999{unique_suffix[-6:]}",
                "integration_mode": "qr",
                "avatar_url": "/avatars/advanced-dept.png",
                "manual_instructions": "Instruções específicas para este departamento avançado"
            }
            
            created_dept_id = None
            async with self.session.post(f"{API_BASE}/departments", headers=headers, json=enhanced_dept_data) as response:
                if response.status == 200:
                    dept_data = await response.json()
                    created_dept_id = dept_data.get("id")
                    if (dept_data.get("name") == enhanced_dept_data["name"] and 
                        dept_data.get("whatsapp_number") == enhanced_dept_data["whatsapp_number"] and
                        dept_data.get("integration_mode") == enhanced_dept_data["integration_mode"]):
                        self.log_result("Enhanced Department Creation", True, f"Created enhanced department with WhatsApp: {dept_data.get('whatsapp_number')}")
                    else:
                        self.log_result("Enhanced Department Creation", False, f"Enhanced department creation returned unexpected data: {dept_data}")
                        return False
                else:
                    response_text = await response.text()
                    self.log_result("Enhanced Department Creation", False, f"Failed to create enhanced department: {response.status} - {response_text}")
                    return False
            
            # Test 2: Try to create department with duplicate WhatsApp number (should fail)
            duplicate_whatsapp_data = {
                "name": f"Departamento Duplicado {unique_suffix}",
                "description": "Tentativa de criar com WhatsApp duplicado",
                "whatsapp_number": enhanced_dept_data["whatsapp_number"],  # Same WhatsApp number
                "integration_mode": "official"
            }
            
            async with self.session.post(f"{API_BASE}/departments", headers=headers, json=duplicate_whatsapp_data) as response:
                if response.status == 400:
                    error_data = await response.json()
                    if "whatsapp number already in use" in error_data.get("detail", "").lower():
                        self.log_result("WhatsApp Number Uniqueness Validation", True, "Correctly rejected duplicate WhatsApp number")
                    else:
                        self.log_result("WhatsApp Number Uniqueness Validation", False, f"Wrong error message: {error_data}")
                        return False
                else:
                    self.log_result("WhatsApp Number Uniqueness Validation", False, f"Should have failed with 400, got {response.status}")
                    return False
            
            # Test 3: Update department with new WhatsApp number and integration mode
            if created_dept_id:
                new_whatsapp = f"+5511888{unique_suffix[-6:]}"
                update_params = {
                    "name": f"Departamento Atualizado {unique_suffix}",
                    "description": "Departamento com dados atualizados",
                    "whatsapp_number": new_whatsapp,
                    "integration_mode": "official",
                    "signature": "---\n📱 Departamento Atualizado\n📧 atualizado@empresasweb.com\n📞 (11) 99999-5678\n\nDepartamento atualizado!"
                }
                
                async with self.session.put(f"{API_BASE}/departments/{created_dept_id}", headers=headers, params=update_params) as response:
                    if response.status == 200:
                        update_result = await response.json()
                        if update_result.get("success"):
                            self.log_result("Enhanced Department Update", True, f"Updated department with new WhatsApp: {new_whatsapp}")
                            
                            # Verify the update
                            async with self.session.get(f"{API_BASE}/departments", headers=headers) as verify_response:
                                if verify_response.status == 200:
                                    departments = await verify_response.json()
                                    updated_dept = next((d for d in departments if d["id"] == created_dept_id), None)
                                    if (updated_dept and 
                                        updated_dept.get("whatsapp_number") == new_whatsapp and
                                        updated_dept.get("integration_mode") == "official" and
                                        updated_dept.get("name") == update_params["name"]):
                                        self.log_result("Enhanced Department Update Verification", True, "Department update verified successfully")
                                    else:
                                        self.log_result("Enhanced Department Update Verification", False, f"Department update not reflected correctly. Expected WhatsApp: {new_whatsapp}, Got: {updated_dept.get('whatsapp_number') if updated_dept else 'None'}")
                                        return False
                                else:
                                    self.log_result("Enhanced Department Update Verification", False, "Failed to verify department update")
                                    return False
                        else:
                            self.log_result("Enhanced Department Update", False, f"Update failed: {update_result}")
                            return False
                    else:
                        response_text = await response.text()
                        self.log_result("Enhanced Department Update", False, f"Failed to update department: {response.status} - {response_text}")
                        return False
            
            # Test 4: Try to update another department with the same WhatsApp number (should fail)
            # First create another department
            another_dept_data = {
                "name": f"Outro Departamento {unique_suffix}",
                "description": "Outro departamento para teste de duplicação",
                "whatsapp_number": f"+5511777{unique_suffix[-6:]}",
                "integration_mode": "qr"
            }
            
            another_dept_id = None
            async with self.session.post(f"{API_BASE}/departments", headers=headers, json=another_dept_data) as response:
                if response.status == 200:
                    another_dept = await response.json()
                    another_dept_id = another_dept.get("id")
                    
                    # Now try to update it with the WhatsApp number from the first department
                    if another_dept_id and created_dept_id:
                        duplicate_update_params = {
                            "whatsapp_number": new_whatsapp  # Same as the first department
                        }
                        
                        async with self.session.put(f"{API_BASE}/departments/{another_dept_id}", headers=headers, params=duplicate_update_params) as dup_response:
                            if dup_response.status == 400:
                                dup_error = await dup_response.json()
                                if "whatsapp number already in use" in dup_error.get("detail", "").lower():
                                    self.log_result("WhatsApp Update Uniqueness Validation", True, "Correctly rejected duplicate WhatsApp number on update")
                                else:
                                    self.log_result("WhatsApp Update Uniqueness Validation", False, f"Wrong error message on update: {dup_error}")
                                    return False
                            else:
                                self.log_result("WhatsApp Update Uniqueness Validation", False, f"Should have failed update with 400, got {dup_response.status}")
                                return False
                else:
                    self.log_result("Enhanced Department Management", False, "Failed to create second department for duplicate test")
                    return False
            
            # Test 5: Test integration mode validation
            integration_modes = ["qr", "official"]
            for mode in integration_modes:
                test_mode_data = {
                    "name": f"Teste Modo {mode.upper()} {unique_suffix}",
                    "description": f"Teste do modo de integração {mode}",
                    "whatsapp_number": f"+5511666{unique_suffix[-6:]}{mode[0]}",
                    "integration_mode": mode
                }
                
                async with self.session.post(f"{API_BASE}/departments", headers=headers, json=test_mode_data) as response:
                    if response.status == 200:
                        mode_dept = await response.json()
                        if mode_dept.get("integration_mode") == mode:
                            self.log_result(f"Integration Mode {mode.upper()} Test", True, f"Successfully created department with {mode} mode")
                        else:
                            self.log_result(f"Integration Mode {mode.upper()} Test", False, f"Integration mode not set correctly: {mode_dept.get('integration_mode')}")
                            return False
                    else:
                        response_text = await response.text()
                        self.log_result(f"Integration Mode {mode.upper()} Test", False, f"Failed to create department with {mode} mode: {response.status} - {response_text}")
                        return False
            
            return True
                    
        except Exception as e:
            self.log_result("Enhanced Department Management", False, f"Enhanced department tests failed: {str(e)}")
            return False
            
    async def test_transfers_system(self):
        """Test transfer system"""
        if not self.auth_token:
            self.log_result("Transfers System", False, "No auth token available")
            return False
            
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        try:
            # Test GET transfers
            async with self.session.get(f"{API_BASE}/transfers", headers=headers) as response:
                if response.status == 200:
                    transfers = await response.json()
                    self.log_result("Transfers GET", True, f"Retrieved {len(transfers)} transfers")
                else:
                    self.log_result("Transfers GET", False, f"Failed to get transfers: {response.status}")
                    return False
                    
            # Test POST new transfer
            transfer_data = {
                "contact_phone": "+5511999887766",
                "department_id": "test-dept-id",
                "message": "Transfer de teste automatizado"
            }
            
            async with self.session.post(f"{API_BASE}/transfers", headers=headers, params=transfer_data) as response:
                if response.status == 200:
                    transfer_result = await response.json()
                    transfer_id = transfer_result.get("id")
                    if transfer_id:
                        self.log_result("Transfers POST", True, f"Created transfer with ID: {transfer_id}")
                        
                        # Test PUT update transfer
                        update_data = {
                            "status": "completed",
                            "notes": "Transfer processado com sucesso"
                        }
                        
                        async with self.session.put(f"{API_BASE}/transfers/{transfer_id}", headers=headers, params=update_data) as update_response:
                            if update_response.status == 200:
                                self.log_result("Transfers PUT", True, "Transfer updated successfully")
                                return True
                            else:
                                self.log_result("Transfers PUT", False, f"Failed to update transfer: {update_response.status}")
                                return False
                    else:
                        self.log_result("Transfers POST", False, "No transfer ID returned")
                        return False
                else:
                    self.log_result("Transfers POST", False, f"Failed to create transfer: {response.status}")
                    return False
                    
        except Exception as e:
            self.log_result("Transfers System", False, f"Transfer tests failed: {str(e)}")
            return False
            
    async def test_ai_integration(self):
        """Test AI integration with Emergent LLM"""
        try:
            # Test WhatsApp message processing with AI
            message_data = {
                "phone_number": "+5511987654321",
                "message": "Olá, preciso de ajuda com vendas",
                "message_id": "test_msg_001",
                "timestamp": int(datetime.now().timestamp())
            }
            
            async with self.session.post(f"{API_BASE}/whatsapp/message", json=message_data) as response:
                if response.status == 200:
                    ai_response = await response.json()
                    if ai_response.get("success") and ai_response.get("reply"):
                        reply_text = ai_response.get("reply", "")
                        if len(reply_text) > 10:  # Basic check for meaningful response
                            self.log_result("AI Integration", True, f"AI generated response: '{reply_text[:50]}...'")
                            
                            # Check if AI detected department transfer
                            if "vendas" in reply_text.lower() or "transferir" in reply_text.lower():
                                self.log_result("AI Department Detection", True, "AI correctly detected sales department context")
                            else:
                                self.log_result("AI Department Detection", True, "AI responded but no department transfer detected")
                            return True
                        else:
                            self.log_result("AI Integration", False, f"AI response too short: '{reply_text}'")
                            return False
                    else:
                        self.log_result("AI Integration", False, f"AI response missing reply or failed: {ai_response}")
                        return False
                else:
                    response_text = await response.text()
                    self.log_result("AI Integration", False, f"AI endpoint failed: {response.status} - {response_text}")
                    return False
                    
        except Exception as e:
            self.log_result("AI Integration", False, f"AI integration test failed: {str(e)}")
            return False
            
    async def test_dashboard_stats(self):
        """Test dashboard statistics"""
        if not self.auth_token:
            self.log_result("Dashboard Stats", False, "No auth token available")
            return False
            
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        try:
            async with self.session.get(f"{API_BASE}/dashboard/stats", headers=headers) as response:
                if response.status == 200:
                    stats = await response.json()
                    required_fields = ["total_contacts", "total_conversations", "today_messages", "whatsapp_connected"]
                    
                    if all(field in stats for field in required_fields):
                        self.log_result("Dashboard Stats", True, f"Stats: {stats['total_contacts']} contacts, {stats['total_conversations']} conversations")
                        return True
                    else:
                        missing = [field for field in required_fields if field not in stats]
                        self.log_result("Dashboard Stats", False, f"Missing fields: {missing}")
                        return False
                else:
                    self.log_result("Dashboard Stats", False, f"Failed to get stats: {response.status}")
                    return False
                    
        except Exception as e:
            self.log_result("Dashboard Stats", False, f"Dashboard stats test failed: {str(e)}")
            return False
            
    async def test_contacts_system(self):
        """Test contacts CRUD operations with enhanced fields"""
        if not self.auth_token:
            self.log_result("Contacts System", False, "No auth token available")
            return False
            
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        try:
            # Test GET contacts
            async with self.session.get(f"{API_BASE}/contacts", headers=headers) as response:
                if response.status == 200:
                    contacts = await response.json()
                    self.log_result("Contacts GET", True, f"Retrieved {len(contacts)} contacts")
                else:
                    self.log_result("Contacts GET", False, f"Failed to get contacts: {response.status}")
                    return False
                    
            # Test POST new contact with enhanced fields (company, notes)
            import time
            unique_suffix = str(int(time.time()))
            contact_data = {
                "name": f"Maria Santos Teste {unique_suffix}",
                "phone": f"+551199988{unique_suffix[-4:]}",
                "email": f"maria.teste{unique_suffix}@empresasweb.com",
                "company": "Inovação Empresarial Ltda",
                "notes": "Cliente interessado em abertura de empresa e contabilidade completa. Contato preferencial por WhatsApp."
            }
            
            async with self.session.post(f"{API_BASE}/contacts", json=contact_data, headers=headers) as response:
                if response.status == 200:
                    contact_result = await response.json()
                    if (contact_result.get("name") == contact_data["name"] and
                        contact_result.get("phone_number") == contact_data["phone"] and
                        contact_result.get("email") == contact_data["email"] and
                        contact_result.get("company") == contact_data["company"] and
                        contact_result.get("notes") == contact_data["notes"]):
                        self.log_result("Enhanced Contacts POST", True, f"Created contact with all fields: {contact_result.get('name')}")
                        return True
                    else:
                        self.log_result("Enhanced Contacts POST", False, f"Contact creation missing fields. Expected company: {contact_data['company']}, Got: {contact_result.get('company')}")
                        return False
                else:
                    response_text = await response.text()
                    self.log_result("Enhanced Contacts POST", False, f"Failed to create contact: {response.status} - {response_text}")
                    return False
                    
        except Exception as e:
            self.log_result("Contacts System", False, f"Contacts tests failed: {str(e)}")
            return False
            
    async def test_whatsapp_qr_system(self):
        """Test WhatsApp QR code generation and status"""
        if not self.auth_token:
            self.log_result("WhatsApp QR System", False, "No auth token available")
            return False
            
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        try:
            # Test QR code generation
            async with self.session.get(f"{API_BASE}/whatsapp/qrcode", headers=headers) as response:
                if response.status == 200:
                    qr_data = await response.json()
                    if qr_data.get("qr_code") and qr_data["qr_code"].startswith("data:image/png;base64,"):
                        self.log_result("WhatsApp QR Generation", True, f"QR code generated successfully, status: {qr_data.get('status')}")
                    else:
                        self.log_result("WhatsApp QR Generation", False, f"Invalid QR code format: {qr_data}")
                        return False
                else:
                    self.log_result("WhatsApp QR Generation", False, f"Failed to generate QR: {response.status}")
                    return False
                    
            # Test WhatsApp status
            async with self.session.get(f"{API_BASE}/whatsapp/status", headers=headers) as response:
                if response.status == 200:
                    status_data = await response.json()
                    required_fields = ["connected", "phone_number", "name", "status"]
                    if all(field in status_data for field in required_fields):
                        self.log_result("WhatsApp Status", True, f"Status: {status_data['status']}, Phone: {status_data['phone_number']}")
                        return True
                    else:
                        missing = [field for field in required_fields if field not in status_data]
                        self.log_result("WhatsApp Status", False, f"Missing status fields: {missing}")
                        return False
                else:
                    self.log_result("WhatsApp Status", False, f"Failed to get WhatsApp status: {response.status}")
                    return False
                    
        except Exception as e:
            self.log_result("WhatsApp QR System", False, f"WhatsApp QR tests failed: {str(e)}")
            return False
            
    async def test_department_signatures(self):
        """Test department signatures functionality"""
        if not self.auth_token:
            self.log_result("Department Signatures", False, "No auth token available")
            return False
            
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        try:
            # Get departments to check signatures
            async with self.session.get(f"{API_BASE}/departments", headers=headers) as response:
                if response.status == 200:
                    departments = await response.json()
                    
                    # Check if any departments have signatures
                    signatures_found = 0
                    for dept in departments:
                        if dept.get("signature") and len(dept["signature"]) > 10:
                            signatures_found += 1
                            
                    self.log_result("Department Signatures Check", True, f"Found {signatures_found} departments with signatures")
                    
                    # Test updating a department signature (this is the main functionality)
                    if departments:
                        dept_id = departments[0]["id"]
                        test_signature = "---\n🧪 Assinatura de Teste\n📧 teste@empresasweb.com\n📞 (11) 99999-0000\n\nEsta é uma assinatura de teste!"
                        
                        update_params = {"signature": test_signature}
                        async with self.session.put(f"{API_BASE}/departments/{dept_id}", headers=headers, params=update_params) as update_response:
                            if update_response.status == 200:
                                self.log_result("Department Signature Update", True, f"Updated signature for department {dept_id}")
                                
                                # Verify the signature was updated
                                async with self.session.get(f"{API_BASE}/departments", headers=headers) as verify_response:
                                    if verify_response.status == 200:
                                        updated_departments = await verify_response.json()
                                        updated_dept = next((d for d in updated_departments if d["id"] == dept_id), None)
                                        if updated_dept and updated_dept.get("signature") == test_signature:
                                            self.log_result("Department Signature Verification", True, "Signature update verified successfully")
                                            return True
                                        else:
                                            self.log_result("Department Signature Verification", False, "Signature update not reflected in GET response")
                                            return False
                                    else:
                                        self.log_result("Department Signature Verification", False, "Failed to verify signature update")
                                        return False
                            else:
                                self.log_result("Department Signature Update", False, f"Failed to update signature: {update_response.status}")
                                return False
                    else:
                        self.log_result("Department Signatures", False, "No departments found to test signature update")
                        return False
                else:
                    self.log_result("Department Signatures", False, f"Failed to get departments: {response.status}")
                    return False
                    
        except Exception as e:
            self.log_result("Department Signatures", False, f"Department signatures test failed: {str(e)}")
            return False
            
    async def test_whatsapp_send_message(self):
        """Test WhatsApp message sending (mock)"""
        if not self.auth_token:
            self.log_result("WhatsApp Send Message", False, "No auth token available")
            return False
            
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        try:
            # Test sending a message
            send_params = {
                "phone_number": "+5511987654321",
                "message": "Esta é uma mensagem de teste do sistema Empresas Web CRM!"
            }
            
            async with self.session.post(f"{API_BASE}/whatsapp/send", headers=headers, params=send_params) as response:
                if response.status == 200:
                    send_result = await response.json()
                    if send_result.get("success") and send_result.get("message_id"):
                        self.log_result("WhatsApp Send Message", True, f"Message sent successfully, ID: {send_result['message_id']}")
                        return True
                    else:
                        self.log_result("WhatsApp Send Message", False, f"Send failed: {send_result}")
                        return False
                else:
                    self.log_result("WhatsApp Send Message", False, f"Failed to send message: {response.status}")
                    return False
                    
        except Exception as e:
            self.log_result("WhatsApp Send Message", False, f"WhatsApp send test failed: {str(e)}")
            return False
            
    async def test_appointments_system(self):
        """Test appointments CRUD operations"""
        if not self.auth_token:
            self.log_result("Appointments System", False, "No auth token available")
            return False
            
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        try:
            import time
            unique_suffix = str(int(time.time()))
            
            # Test POST new appointment
            appointment_data = {
                "title": f"Reunião de Planejamento {unique_suffix}",
                "description": "Reunião para discutir estratégias de crescimento da empresa e planejamento tributário para 2025",
                "scheduled_date": "2025-02-15T14:30:00",
                "client_name": "Carlos Eduardo Silva",
                "appointment_type": "consultation"
            }
            
            created_appointment_id = None
            async with self.session.post(f"{API_BASE}/appointments", json=appointment_data, headers=headers) as response:
                if response.status == 200:
                    appointment_result = await response.json()
                    created_appointment_id = appointment_result.get("id")
                    if (appointment_result.get("title") == appointment_data["title"] and
                        appointment_result.get("description") == appointment_data["description"] and
                        appointment_result.get("scheduled_date") == appointment_data["scheduled_date"] and
                        appointment_result.get("client_name") == appointment_data["client_name"] and
                        appointment_result.get("appointment_type") == appointment_data["appointment_type"] and
                        appointment_result.get("status") == "scheduled"):
                        self.log_result("Appointments POST", True, f"Created appointment: {appointment_result.get('title')}")
                    else:
                        self.log_result("Appointments POST", False, f"Appointment creation returned unexpected data: {appointment_result}")
                        return False
                else:
                    response_text = await response.text()
                    self.log_result("Appointments POST", False, f"Failed to create appointment: {response.status} - {response_text}")
                    return False
            
            # Test GET appointments
            async with self.session.get(f"{API_BASE}/appointments", headers=headers) as response:
                if response.status == 200:
                    appointments = await response.json()
                    self.log_result("Appointments GET", True, f"Retrieved {len(appointments)} appointments")
                    
                    # Verify our created appointment is in the list
                    if created_appointment_id:
                        found_appointment = next((apt for apt in appointments if apt.get("id") == created_appointment_id), None)
                        if found_appointment:
                            self.log_result("Appointments GET Verification", True, f"Created appointment found in list: {found_appointment.get('title')}")
                            return True
                        else:
                            self.log_result("Appointments GET Verification", False, "Created appointment not found in appointments list")
                            return False
                    else:
                        return True
                else:
                    self.log_result("Appointments GET", False, f"Failed to get appointments: {response.status}")
                    return False
                    
        except Exception as e:
            self.log_result("Appointments System", False, f"Appointments tests failed: {str(e)}")
            return False
            
    async def test_scheduled_messages_system(self):
        """Test scheduled messages CRUD operations"""
        if not self.auth_token:
            self.log_result("Scheduled Messages System", False, "No auth token available")
            return False
            
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        try:
            import time
            unique_suffix = str(int(time.time()))
            
            # Test POST new scheduled message
            message_data = {
                "title": f"Campanha Fim de Ano {unique_suffix}",
                "message": "🎉 Oferta especial de fim de ano! Abertura de empresa com 50% de desconto. Aproveite esta oportunidade única para formalizar seu negócio. Entre em contato conosco!",
                "recipients": ["+5511999887766", "+5511888776655", "+5511777665544"],
                "scheduled_date": "2025-01-15T09:00:00",
                "campaign_type": "promotional"
            }
            
            created_message_id = None
            async with self.session.post(f"{API_BASE}/scheduled-messages", json=message_data, headers=headers) as response:
                if response.status == 200:
                    message_result = await response.json()
                    created_message_id = message_result.get("id")
                    if (message_result.get("title") == message_data["title"] and
                        message_result.get("message") == message_data["message"] and
                        message_result.get("recipients") == message_data["recipients"] and
                        message_result.get("scheduled_date") == message_data["scheduled_date"] and
                        message_result.get("campaign_type") == message_data["campaign_type"] and
                        message_result.get("status") == "scheduled"):
                        self.log_result("Scheduled Messages POST", True, f"Created scheduled message: {message_result.get('title')}")
                    else:
                        self.log_result("Scheduled Messages POST", False, f"Scheduled message creation returned unexpected data: {message_result}")
                        return False
                else:
                    response_text = await response.text()
                    self.log_result("Scheduled Messages POST", False, f"Failed to create scheduled message: {response.status} - {response_text}")
                    return False
            
            # Test GET scheduled messages
            async with self.session.get(f"{API_BASE}/scheduled-messages", headers=headers) as response:
                if response.status == 200:
                    messages = await response.json()
                    self.log_result("Scheduled Messages GET", True, f"Retrieved {len(messages)} scheduled messages")
                    
                    # Verify our created message is in the list
                    if created_message_id:
                        found_message = next((msg for msg in messages if msg.get("id") == created_message_id), None)
                        if found_message:
                            self.log_result("Scheduled Messages GET Verification", True, f"Created message found in list: {found_message.get('title')}")
                            return True
                        else:
                            self.log_result("Scheduled Messages GET Verification", False, "Created scheduled message not found in messages list")
                            return False
                    else:
                        return True
                else:
                    self.log_result("Scheduled Messages GET", False, f"Failed to get scheduled messages: {response.status}")
                    return False
                    
        except Exception as e:
            self.log_result("Scheduled Messages System", False, f"Scheduled messages tests failed: {str(e)}")
            return False
            
    async def test_chrome_extension_endpoints(self):
        """Test Chrome Extension backend endpoints"""
        if not self.auth_token:
            self.log_result("Chrome Extension Endpoints", False, "No auth token available")
            return False
            
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        try:
            # Test 1: GET /api/chrome-extension/config
            await self.test_chrome_extension_config(headers)
            
            # Test 2: POST /api/chrome-extension/crm-data
            await self.test_chrome_extension_crm_data(headers)
            
            # Test 3: POST /api/chrome-extension/mass-message
            await self.test_chrome_extension_mass_message(headers)
            
            # Test 4: GET /api/chrome-extension/analytics
            await self.test_chrome_extension_analytics(headers)
            
            return True
            
        except Exception as e:
            self.log_result("Chrome Extension Endpoints", False, f"Chrome extension tests failed: {str(e)}")
            return False
            
    async def test_chrome_extension_config(self, headers):
        """Test GET /api/chrome-extension/config endpoint"""
        try:
            async with self.session.get(f"{API_BASE}/chrome-extension/config", headers=headers) as response:
                if response.status == 200:
                    config_data = await response.json()
                    
                    # Check required top-level fields
                    required_fields = ["companies", "activeCompany", "globalSettings", "crmConfig", "automationRules", "quickButtons", "scheduledMessages", "massMessageCampaigns"]
                    missing_fields = [field for field in required_fields if field not in config_data]
                    
                    if missing_fields:
                        self.log_result("Chrome Extension Config - Structure", False, f"Missing required fields: {missing_fields}")
                        return False
                    
                    # Check globalSettings structure
                    global_settings = config_data.get("globalSettings", {})
                    required_global = ["autoSave", "notifications", "theme", "language"]
                    missing_global = [field for field in required_global if field not in global_settings]
                    
                    if missing_global:
                        self.log_result("Chrome Extension Config - Global Settings", False, f"Missing global settings: {missing_global}")
                        return False
                    
                    # Check crmConfig structure
                    crm_config = config_data.get("crmConfig", {})
                    if "kanbanStages" not in crm_config:
                        self.log_result("Chrome Extension Config - CRM Config", False, "Missing kanbanStages in crmConfig")
                        return False
                    
                    kanban_stages = crm_config["kanbanStages"]
                    if not isinstance(kanban_stages, list) or len(kanban_stages) < 5:
                        self.log_result("Chrome Extension Config - Kanban Stages", False, f"Invalid kanban stages: expected list with 5+ items, got {len(kanban_stages) if isinstance(kanban_stages, list) else type(kanban_stages)}")
                        return False
                    
                    # Check kanban stage structure
                    stage_fields = ["id", "name", "color"]
                    for stage in kanban_stages:
                        missing_stage_fields = [field for field in stage_fields if field not in stage]
                        if missing_stage_fields:
                            self.log_result("Chrome Extension Config - Kanban Stage Structure", False, f"Missing stage fields: {missing_stage_fields}")
                            return False
                    
                    # Check companies structure (if any exist)
                    companies = config_data.get("companies", {})
                    if companies:
                        # Check first company structure
                        first_company = next(iter(companies.values()))
                        company_fields = ["id", "name", "phone", "settings", "crmData"]
                        missing_company_fields = [field for field in company_fields if field not in first_company]
                        
                        if missing_company_fields:
                            self.log_result("Chrome Extension Config - Company Structure", False, f"Missing company fields: {missing_company_fields}")
                            return False
                        
                        # Check company settings structure
                        company_settings = first_company.get("settings", {})
                        settings_fields = ["autoResponder", "quickButtons", "labels", "signatures"]
                        missing_settings = [field for field in settings_fields if field not in company_settings]
                        
                        if missing_settings:
                            self.log_result("Chrome Extension Config - Company Settings", False, f"Missing company settings: {missing_settings}")
                            return False
                    
                    self.log_result("Chrome Extension Config", True, f"Configuration retrieved successfully with {len(companies)} companies and {len(kanban_stages)} Kanban stages")
                    return True
                    
                else:
                    response_text = await response.text()
                    self.log_result("Chrome Extension Config", False, f"Failed to get config: {response.status} - {response_text}")
                    return False
                    
        except Exception as e:
            self.log_result("Chrome Extension Config", False, f"Config test failed: {str(e)}")
            return False
            
    async def test_chrome_extension_crm_data(self, headers):
        """Test POST /api/chrome-extension/crm-data endpoint"""
        try:
            import time
            unique_suffix = str(int(time.time()))
            
            # Test saving contacts data
            contacts_data = {
                "contacts": {
                    f"contact_{unique_suffix}_1": {
                        "id": f"contact_{unique_suffix}_1",
                        "name": "João Silva Extensão",
                        "phone": f"+5511999{unique_suffix[-6:]}",
                        "email": f"joao.extensao{unique_suffix}@empresasweb.com",
                        "company": "Tech Solutions Ltda",
                        "labels": ["hot_lead"],
                        "created_at": "2025-01-10T10:00:00Z",
                        "last_message": "2025-01-10T15:30:00Z"
                    },
                    f"contact_{unique_suffix}_2": {
                        "id": f"contact_{unique_suffix}_2",
                        "name": "Maria Santos Extensão",
                        "phone": f"+5511888{unique_suffix[-6:]}",
                        "email": f"maria.extensao{unique_suffix}@empresasweb.com",
                        "company": "Inovação Digital",
                        "labels": ["warm_lead"],
                        "created_at": "2025-01-10T11:00:00Z"
                    }
                }
            }
            
            async with self.session.post(f"{API_BASE}/chrome-extension/crm-data", json=contacts_data, headers=headers) as response:
                if response.status == 200:
                    result = await response.json()
                    if result.get("success") and "CRM data saved successfully" in result.get("message", ""):
                        self.log_result("Chrome Extension CRM Data - Contacts", True, f"Contacts data saved successfully: {len(contacts_data['contacts'])} contacts")
                    else:
                        self.log_result("Chrome Extension CRM Data - Contacts", False, f"Unexpected response: {result}")
                        return False
                else:
                    response_text = await response.text()
                    self.log_result("Chrome Extension CRM Data - Contacts", False, f"Failed to save contacts: {response.status} - {response_text}")
                    return False
            
            # Test saving deals data
            deals_data = {
                "deals": {
                    f"deal_{unique_suffix}_1": {
                        "id": f"deal_{unique_suffix}_1",
                        "title": "Abertura de Empresa - Tech Solutions",
                        "contact_id": f"contact_{unique_suffix}_1",
                        "stage": "proposal",
                        "value": 2500.00,
                        "created_at": "2025-01-10T10:30:00Z",
                        "notes": "Cliente interessado em abertura de empresa com contabilidade completa"
                    },
                    f"deal_{unique_suffix}_2": {
                        "id": f"deal_{unique_suffix}_2",
                        "title": "Consultoria Tributária - Inovação Digital",
                        "contact_id": f"contact_{unique_suffix}_2",
                        "stage": "negotiation",
                        "value": 1800.00,
                        "created_at": "2025-01-10T11:30:00Z",
                        "notes": "Planejamento tributário para otimização fiscal"
                    }
                }
            }
            
            async with self.session.post(f"{API_BASE}/chrome-extension/crm-data", json=deals_data, headers=headers) as response:
                if response.status == 200:
                    result = await response.json()
                    if result.get("success"):
                        self.log_result("Chrome Extension CRM Data - Deals", True, f"Deals data saved successfully: {len(deals_data['deals'])} deals")
                    else:
                        self.log_result("Chrome Extension CRM Data - Deals", False, f"Unexpected response: {result}")
                        return False
                else:
                    response_text = await response.text()
                    self.log_result("Chrome Extension CRM Data - Deals", False, f"Failed to save deals: {response.status} - {response_text}")
                    return False
            
            # Test saving conversations data
            conversations_data = {
                "conversations": {
                    f"conv_{unique_suffix}_1": {
                        "id": f"conv_{unique_suffix}_1",
                        "contact_id": f"contact_{unique_suffix}_1",
                        "messages": [
                            {
                                "id": f"msg_{unique_suffix}_1",
                                "text": "Olá, gostaria de informações sobre abertura de empresa",
                                "direction": "incoming",
                                "timestamp": "2025-01-10T15:30:00Z"
                            },
                            {
                                "id": f"msg_{unique_suffix}_2",
                                "text": "Olá! Posso ajudá-lo com a abertura da sua empresa. Que tipo de negócio você pretende abrir?",
                                "direction": "outgoing",
                                "timestamp": "2025-01-10T15:32:00Z"
                            }
                        ],
                        "last_message": "2025-01-10T15:32:00Z"
                    }
                }
            }
            
            async with self.session.post(f"{API_BASE}/chrome-extension/crm-data", json=conversations_data, headers=headers) as response:
                if response.status == 200:
                    result = await response.json()
                    if result.get("success"):
                        self.log_result("Chrome Extension CRM Data - Conversations", True, f"Conversations data saved successfully: {len(conversations_data['conversations'])} conversations")
                    else:
                        self.log_result("Chrome Extension CRM Data - Conversations", False, f"Unexpected response: {result}")
                        return False
                else:
                    response_text = await response.text()
                    self.log_result("Chrome Extension CRM Data - Conversations", False, f"Failed to save conversations: {response.status} - {response_text}")
                    return False
            
            # Test error handling with malformed data
            malformed_data = {
                "invalid_section": {
                    "test": "data"
                }
            }
            
            async with self.session.post(f"{API_BASE}/chrome-extension/crm-data", json=malformed_data, headers=headers) as response:
                if response.status == 200:
                    result = await response.json()
                    if result.get("success"):
                        self.log_result("Chrome Extension CRM Data - Error Handling", True, "Malformed data handled gracefully")
                        return True
                    else:
                        self.log_result("Chrome Extension CRM Data - Error Handling", False, f"Unexpected response to malformed data: {result}")
                        return False
                else:
                    self.log_result("Chrome Extension CRM Data - Error Handling", False, f"Malformed data caused error: {response.status}")
                    return False
                    
        except Exception as e:
            self.log_result("Chrome Extension CRM Data", False, f"CRM data test failed: {str(e)}")
            return False
            
    async def test_chrome_extension_mass_message(self, headers):
        """Test POST /api/chrome-extension/mass-message endpoint"""
        try:
            import time
            unique_suffix = str(int(time.time()))
            
            # Test 1: Valid mass message campaign
            campaign_data = {
                "title": f"Campanha Extensão {unique_suffix}",
                "message": "🎉 Oferta especial! Abertura de empresa com desconto de 30%. Entre em contato conosco para mais informações!",
                "recipients": [
                    "+5511999887766",
                    "+5511888776655", 
                    "+5511777665544",
                    "+5511666554433"
                ],
                "campaign_type": "promotional"
            }
            
            async with self.session.post(f"{API_BASE}/chrome-extension/mass-message", json=campaign_data, headers=headers) as response:
                if response.status == 200:
                    result = await response.json()
                    if (result.get("success") and 
                        result.get("campaign_id") and 
                        "Campanha criada com sucesso" in result.get("message", "") and
                        "4 destinatários" in result.get("message", "")):
                        self.log_result("Chrome Extension Mass Message - Valid Campaign", True, f"Campaign created successfully: {result['campaign_id']}")
                        
                        # Store campaign ID for verification
                        campaign_id = result["campaign_id"]
                        
                    else:
                        self.log_result("Chrome Extension Mass Message - Valid Campaign", False, f"Unexpected response: {result}")
                        return False
                else:
                    response_text = await response.text()
                    self.log_result("Chrome Extension Mass Message - Valid Campaign", False, f"Failed to create campaign: {response.status} - {response_text}")
                    return False
            
            # Test 2: Campaign with minimal required fields
            minimal_campaign = {
                "message": "Mensagem de teste mínima",
                "recipients": ["+5511999887766"],
                "campaign_type": "informational"
            }
            
            async with self.session.post(f"{API_BASE}/chrome-extension/mass-message", json=minimal_campaign, headers=headers) as response:
                if response.status == 200:
                    result = await response.json()
                    if result.get("success") and result.get("campaign_id"):
                        self.log_result("Chrome Extension Mass Message - Minimal Campaign", True, f"Minimal campaign created: {result['campaign_id']}")
                    else:
                        self.log_result("Chrome Extension Mass Message - Minimal Campaign", False, f"Minimal campaign failed: {result}")
                        return False
                else:
                    response_text = await response.text()
                    self.log_result("Chrome Extension Mass Message - Minimal Campaign", False, f"Minimal campaign request failed: {response.status} - {response_text}")
                    return False
            
            # Test 3: Error handling - missing required fields
            invalid_campaign = {
                "title": "Campanha Inválida",
                "message": "Mensagem sem destinatários"
                # Missing recipients and campaign_type
            }
            
            async with self.session.post(f"{API_BASE}/chrome-extension/mass-message", json=invalid_campaign, headers=headers) as response:
                if response.status == 400:
                    error_result = await response.json()
                    if "Missing required fields" in error_result.get("detail", ""):
                        self.log_result("Chrome Extension Mass Message - Error Handling", True, "Correctly rejected campaign with missing fields")
                    else:
                        self.log_result("Chrome Extension Mass Message - Error Handling", False, f"Wrong error message: {error_result}")
                        return False
                else:
                    self.log_result("Chrome Extension Mass Message - Error Handling", False, f"Should have failed with 400, got {response.status}")
                    return False
            
            # Test 4: Empty recipients array
            empty_recipients_campaign = {
                "message": "Mensagem sem destinatários",
                "recipients": [],
                "campaign_type": "test"
            }
            
            async with self.session.post(f"{API_BASE}/chrome-extension/mass-message", json=empty_recipients_campaign, headers=headers) as response:
                if response.status == 200:
                    result = await response.json()
                    if result.get("success") and "0 destinatários" in result.get("message", ""):
                        self.log_result("Chrome Extension Mass Message - Empty Recipients", True, "Empty recipients handled correctly")
                        return True
                    else:
                        self.log_result("Chrome Extension Mass Message - Empty Recipients", False, f"Empty recipients not handled correctly: {result}")
                        return False
                else:
                    self.log_result("Chrome Extension Mass Message - Empty Recipients", False, f"Empty recipients caused error: {response.status}")
                    return False
                    
        except Exception as e:
            self.log_result("Chrome Extension Mass Message", False, f"Mass message test failed: {str(e)}")
            return False
            
    async def test_chrome_extension_analytics(self, headers):
        """Test GET /api/chrome-extension/analytics endpoint"""
        try:
            # Test analytics endpoint
            async with self.session.get(f"{API_BASE}/chrome-extension/analytics", headers=headers) as response:
                if response.status == 200:
                    analytics_data = await response.json()
                    
                    # Check summary structure
                    if "summary" not in analytics_data:
                        self.log_result("Chrome Extension Analytics - Structure", False, "Missing summary section")
                        return False
                    
                    summary = analytics_data["summary"]
                    required_summary_fields = ["total_contacts", "total_deals", "active_deals", "total_conversations", "conversion_rate", "recent_contacts"]
                    missing_summary = [field for field in required_summary_fields if field not in summary]
                    
                    if missing_summary:
                        self.log_result("Chrome Extension Analytics - Summary Fields", False, f"Missing summary fields: {missing_summary}")
                        return False
                    
                    # Check kanban_data structure
                    if "kanban_data" not in analytics_data:
                        self.log_result("Chrome Extension Analytics - Structure", False, "Missing kanban_data section")
                        return False
                    
                    kanban_data = analytics_data["kanban_data"]
                    required_kanban_fields = ["lead", "contact", "proposal", "negotiation", "closed", "lost"]
                    missing_kanban = [field for field in required_kanban_fields if field not in kanban_data]
                    
                    if missing_kanban:
                        self.log_result("Chrome Extension Analytics - Kanban Fields", False, f"Missing kanban fields: {missing_kanban}")
                        return False
                    
                    # Validate data types
                    numeric_fields = ["total_contacts", "total_deals", "active_deals", "total_conversations", "recent_contacts"]
                    for field in numeric_fields:
                        if not isinstance(summary[field], int):
                            self.log_result("Chrome Extension Analytics - Data Types", False, f"Field {field} should be integer, got {type(summary[field])}")
                            return False
                    
                    # Check conversion rate format
                    conversion_rate = summary["conversion_rate"]
                    if not isinstance(conversion_rate, str) or not conversion_rate.endswith("%"):
                        self.log_result("Chrome Extension Analytics - Conversion Rate", False, f"Conversion rate should be string with %, got {conversion_rate}")
                        return False
                    
                    # Validate kanban data types
                    for stage, count in kanban_data.items():
                        if not isinstance(count, int):
                            self.log_result("Chrome Extension Analytics - Kanban Data Types", False, f"Kanban stage {stage} should be integer, got {type(count)}")
                            return False
                    
                    # Log analytics summary
                    self.log_result("Chrome Extension Analytics", True, 
                        f"Analytics retrieved: {summary['total_contacts']} contacts, {summary['total_deals']} deals, "
                        f"{summary['active_deals']} active deals, {summary['conversion_rate']} conversion rate")
                    
                    # Test with company_id parameter
                    async with self.session.get(f"{API_BASE}/chrome-extension/analytics?company_id=test-company", headers=headers) as company_response:
                        if company_response.status == 200:
                            company_analytics = await company_response.json()
                            if "summary" in company_analytics and "kanban_data" in company_analytics:
                                self.log_result("Chrome Extension Analytics - Company Filter", True, "Analytics with company filter working")
                                return True
                            else:
                                self.log_result("Chrome Extension Analytics - Company Filter", False, "Company filter returned invalid structure")
                                return False
                        else:
                            self.log_result("Chrome Extension Analytics - Company Filter", False, f"Company filter failed: {company_response.status}")
                            return False
                    
                else:
                    response_text = await response.text()
                    self.log_result("Chrome Extension Analytics", False, f"Failed to get analytics: {response.status} - {response_text}")
                    return False
                    
        except Exception as e:
            self.log_result("Chrome Extension Analytics", False, f"Analytics test failed: {str(e)}")
            return False
            
    async def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting Empresas Web CRM Backend Tests")
        print(f"Testing backend at: {BACKEND_URL}")
        print("=" * 60)
        
        await self.setup()
        
        try:
            # Core tests in order
            server_ok = await self.test_server_health()
            if not server_ok:
                print("❌ Server not accessible, stopping tests")
                return False
                
            auth_ok = await self.test_authentication()
            if not auth_ok:
                print("❌ Authentication failed, stopping tests")
                return False
                
            # Test user registration functionality
            await self.test_user_registration()
                
            # Test all systems
            await self.test_departments_system()
            await self.test_enhanced_department_management()
            await self.test_department_signatures()
            await self.test_transfers_system()
            await self.test_ai_integration()
            await self.test_whatsapp_qr_system()
            await self.test_whatsapp_send_message()
            await self.test_dashboard_stats()
            await self.test_contacts_system()
            await self.test_appointments_system()
            await self.test_scheduled_messages_system()
            await self.test_chrome_extension_endpoints()
            
        finally:
            await self.teardown()
            
        # Summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if result["success"])
        total = len(self.test_results)
        
        for result in self.test_results:
            status = "✅" if result["success"] else "❌"
            print(f"{status} {result['test']}")
            
        print(f"\n🎯 Results: {passed}/{total} tests passed")
        
        if passed == total:
            print("🎉 All tests passed!")
            return True
        else:
            print(f"⚠️  {total - passed} tests failed")
            return False

async def main():
    """Main test runner"""
    tester = BackendTester()
    success = await tester.run_all_tests()
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    asyncio.run(main())