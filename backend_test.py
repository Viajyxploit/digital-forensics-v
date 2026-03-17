import requests
import sys
import json
from datetime import datetime

class ForensicsAPITester:
    def __init__(self, base_url="https://forensics-ai-hub.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.session_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, files=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                if files:
                    # Remove content-type for file uploads
                    headers.pop('Content-Type', None)
                    response = requests.post(url, files=files, headers=headers)
                else:
                    response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return True, response.json()
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_signup(self, name, email, password):
        """Test user signup"""
        success, response = self.run_test(
            "User Signup",
            "POST",
            "api/auth/signup",
            200,
            data={"name": name, "email": email, "password": password}
        )
        if success and 'token' in response:
            self.token = response['token']
            return True, response.get('user', {})
        return False, {}

    def test_login(self, email, password):
        """Test user login"""
        success, response = self.run_test(
            "User Login",
            "POST",
            "api/auth/login",
            200,
            data={"email": email, "password": password}
        )
        if success and 'token' in response:
            self.token = response['token']
            return True, response.get('user', {})
        return False, {}

    def test_get_profile(self):
        """Test getting user profile"""
        success, response = self.run_test(
            "Get User Profile",
            "GET",
            "api/auth/me",
            200
        )
        return success, response

    def test_get_stats(self):
        """Test dashboard stats"""
        success, response = self.run_test(
            "Get Dashboard Stats",
            "GET",
            "api/stats",
            200
        )
        return success, response

    def test_get_courses(self):
        """Test getting courses"""
        success, response = self.run_test(
            "Get Courses",
            "GET",
            "api/courses",
            200
        )
        return success, response

    def test_get_course_modules(self, course_id):
        """Test getting course modules"""
        success, response = self.run_test(
            "Get Course Modules",
            "GET",
            f"api/courses/{course_id}/modules",
            200
        )
        return success, response

    def test_update_progress(self, module_id):
        """Test updating learning progress"""
        success, response = self.run_test(
            "Update Progress",
            "POST",
            "api/progress",
            200,
            data={"module_id": module_id, "completed": True}
        )
        return success, response

    def test_get_threats(self):
        """Test getting threats"""
        success, response = self.run_test(
            "Get Threats",
            "GET",
            "api/threats",
            200
        )
        return success, response

    def test_file_upload(self):
        """Test forensic file upload"""
        # Create a test file
        test_content = b"This is a test file for forensic analysis"
        files = {'file': ('test_file.txt', test_content, 'text/plain')}
        
        success, response = self.run_test(
            "Upload Forensic File",
            "POST",
            "api/forensics/upload",
            200,
            files=files
        )
        return success, response

    def test_get_forensic_files(self):
        """Test getting user's forensic files"""
        success, response = self.run_test(
            "Get Forensic Files",
            "GET",
            "api/forensics/files",
            200
        )
        return success, response

    def test_ai_chat(self, message):
        """Test AI chat functionality"""
        success, response = self.run_test(
            "AI Chat",
            "POST",
            "api/ai/chat",
            200,
            data={"message": message, "session_id": self.session_id}
        )
        if success and 'session_id' in response:
            self.session_id = response['session_id']
        return success, response

def main():
    print("🚀 Starting CyberSentinels Digital Forensics Platform API Tests")
    print("=" * 60)
    
    tester = ForensicsAPITester()
    
    # Use provided test credentials
    test_email = "test@forensics.com"
    test_password = "testpass123"
    
    print(f"\n📧 Using test credentials: {test_email}")
    
    # Test 1: Login with existing credentials
    login_success, user = tester.test_login(test_email, test_password)
    if not login_success:
        print("❌ Login failed, stopping tests")
        return 1

    print(f"✅ Logged in as: {user.get('name', 'Unknown')}")

    # Test 2: Get user profile
    profile_success, profile = tester.test_get_profile()
    if profile_success:
        print(f"✅ Profile loaded: {profile.get('email', 'N/A')}")

    # Test 3: Get dashboard stats
    stats_success, stats = tester.test_get_stats()
    if stats_success:
        print(f"✅ Stats: {stats.get('completed_modules', 0)} modules completed")

    # Test 4: Get courses
    courses_success, courses = tester.test_get_courses()
    if courses_success and len(courses) > 0:
        print(f"✅ Found {len(courses)} courses")
        
        # Test 5: Get modules for first course
        first_course = courses[0]
        modules_success, modules = tester.test_get_course_modules(first_course['id'])
        if modules_success and len(modules) > 0:
            print(f"✅ Found {len(modules)} modules in course")
            
            # Test 6: Update progress for first module
            first_module = modules[0]
            progress_success, _ = tester.test_update_progress(first_module['id'])
            if progress_success:
                print("✅ Progress updated successfully")
        else:
            print("❌ Failed to get course modules")
    else:
        print("❌ Failed to get courses")

    # Test 7: Get threats
    threats_success, threats = tester.test_get_threats()
    if threats_success:
        print(f"✅ Found {len(threats)} threats")

    # Test 8: File upload
    upload_success, upload_result = tester.test_file_upload()
    if upload_success:
        print(f"✅ File uploaded and analyzed: {upload_result.get('filename', 'N/A')}")
        
        # Test 9: Get forensic files
        files_success, files = tester.test_get_forensic_files()
        if files_success:
            print(f"✅ Retrieved {len(files)} forensic files")
    
    # Test 10: AI Chat
    ai_success, ai_response = tester.test_ai_chat("What is digital forensics?")
    if ai_success and ai_response.get('response'):
        print(f"✅ AI responded: {ai_response['response'][:100]}...")
    else:
        print("❌ AI chat failed")

    # Print final results
    print("\n" + "=" * 60)
    print(f"📊 Tests completed: {tester.tests_passed}/{tester.tests_run}")
    
    success_rate = (tester.tests_passed / tester.tests_run) * 100 if tester.tests_run > 0 else 0
    print(f"✅ Success rate: {success_rate:.1f}%")
    
    if success_rate >= 80:
        print("🎉 Backend APIs are working well!")
        return 0
    else:
        print("⚠️  Some backend issues detected")
        return 1

if __name__ == "__main__":
    sys.exit(main())