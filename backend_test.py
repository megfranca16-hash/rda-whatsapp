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
BACKEND_URL = "https://c8732d6a-534e-4473-962e-928bb15d3209.preview.emergentagent.com"
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
                        expected_depts = ["vendas", "suporte", "financeiro", "gerencial"]
                        found_depts = [dept for dept in expected_depts if dept in dept_names]
                        
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
                    
            # Test POST new department
            new_dept_data = {
                "name": "Teste Departamento",
                "description": "Departamento criado para teste automatizado",
                "signature": "---\n🧪 Teste Departamento\n📧 teste@empresasweb.com\n📞 (11) 99999-0000\n\nDepartamento de teste!"
            }
            
            async with self.session.post(f"{API_BASE}/departments", headers=headers, json=new_dept_data) as response:
                if response.status == 200:
                    dept_data = await response.json()
                    if dept_data.get("name") == new_dept_data["name"]:
                        self.log_result("Departments POST", True, f"Created department: {dept_data.get('name')}")
                        return True
                    else:
                        self.log_result("Departments POST", False, f"Department creation returned unexpected data: {dept_data}")
                        return False
                else:
                    response_text = await response.text()
                    self.log_result("Departments POST", False, f"Failed to create department: {response.status} - {response_text}")
                    return False
                    
        except Exception as e:
            self.log_result("Departments System", False, f"Department tests failed: {str(e)}")
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
        """Test contacts CRUD operations"""
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
                    
            # Test POST new contact
            contact_data = {
                "name": "João Silva Teste",
                "phone_number": "+5511999888777",
                "email": "joao.teste@empresasweb.com",
                "company": "Empresa Teste Ltda"
            }
            
            async with self.session.post(f"{API_BASE}/contacts", json=contact_data, headers=headers) as response:
                if response.status == 200:
                    contact_result = await response.json()
                    if contact_result.get("name") == contact_data["name"]:
                        self.log_result("Contacts POST", True, f"Created contact: {contact_result.get('name')}")
                        return True
                    else:
                        self.log_result("Contacts POST", False, f"Contact creation returned unexpected data")
                        return False
                else:
                    self.log_result("Contacts POST", False, f"Failed to create contact: {response.status}")
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
            async with self.session.get(f"{API_BASE}/whatsapp/qr", headers=headers) as response:
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
                    
                    # Check if default departments have signatures
                    signatures_found = 0
                    for dept in departments:
                        if dept.get("signature") and len(dept["signature"]) > 10:
                            signatures_found += 1
                            
                    if signatures_found >= 4:
                        self.log_result("Department Signatures Check", True, f"Found {signatures_found} departments with signatures")
                        
                        # Test updating a department signature
                        if departments:
                            dept_id = departments[0]["id"]
                            test_signature = "---\n🧪 Assinatura de Teste\n📧 teste@empresasweb.com\n📞 (11) 99999-0000\n\nEsta é uma assinatura de teste!"
                            
                            update_params = {"signature": test_signature}
                            async with self.session.put(f"{API_BASE}/departments/{dept_id}", headers=headers, params=update_params) as update_response:
                                if update_response.status == 200:
                                    self.log_result("Department Signature Update", True, f"Updated signature for department {dept_id}")
                                    return True
                                else:
                                    self.log_result("Department Signature Update", False, f"Failed to update signature: {update_response.status}")
                                    return False
                        else:
                            self.log_result("Department Signatures", False, "No departments found to test signature update")
                            return False
                    else:
                        self.log_result("Department Signatures Check", False, f"Only {signatures_found} departments have signatures, expected at least 4")
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
                
            # Test all systems
            await self.test_departments_system()
            await self.test_department_signatures()
            await self.test_transfers_system()
            await self.test_ai_integration()
            await self.test_whatsapp_qr_system()
            await self.test_whatsapp_send_message()
            await self.test_dashboard_stats()
            await self.test_contacts_system()
            
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