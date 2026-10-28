import os
import shutil
import hashlib
import secrets
from unittest.mock import patch
from django.conf import settings
from django.core import mail
from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from django.utils import timezone
from rest_framework.test import APITestCase
from .email_service import EmailDeliveryError
from .models import (
    Employee, 
    EmployeeProfile, 
    OnboardingDocument, 
    OfferLetter, 
    CompanyPolicy, 
    TrainingModule, 
    QuizQuestion, 
    QuizSubmission,
    FirstDaySession, 
    OnboardingFeedback, 
    OnboardingStage,
    CandidateInvitation,
    EmployeeStageProgress,
    EmployeeTrainingProgress,
    PolicyAcknowledgement,
    FirstDayProgress,
    Notification,
    AdminAuditLog
)


class RBACTestCase(APITestCase):
    """Automated test cases for Phase 3 Step 1 RBAC Foundation."""

    def setUp(self):
        # 1. Setup Rahul (EMPLOYEE)
        self.user_rahul = User.objects.create_user(
            username='rahul.kumar',
            email='rahul.kumar@novatech.io',
            password='NovaTech@2026'
        )
        self.emp_rahul = Employee.objects.create(
            user=self.user_rahul,
            employee_id='EMP-TEST-0001',
            name='Rahul Kumar',
            email='rahul.kumar@novatech.io',
            role='Software Engineer',
            system_role=Employee.ROLE_EMPLOYEE
        )

        # 2. Setup Arjun (HR_MANAGER)
        self.user_arjun = User.objects.create_user(
            username='arjun.mehta',
            email='arjun.mehta@novatech.io',
            password='NovaTech@2026'
        )
        self.emp_arjun = Employee.objects.create(
            user=self.user_arjun,
            employee_id='EMP-TEST-0002',
            name='Arjun Mehta',
            email='arjun.mehta@novatech.io',
            role='Engineering Director',
            system_role=Employee.ROLE_HR_MANAGER
        )

        # 3. Setup Priya (ADMIN)
        self.user_priya = User.objects.create_user(
            username='priya.sharma',
            email='priya.sharma@novatech.io',
            password='NovaTech@2026',
            is_staff=True
        )
        self.emp_priya = Employee.objects.create(
            user=self.user_priya,
            employee_id='EMP-TEST-0003',
            name='Priya Sharma',
            email='priya.sharma@novatech.io',
            role='People & Culture Lead',
            system_role=Employee.ROLE_ADMIN
        )

    def test_rahul_employee_login_and_auth_me(self):
        resp = self.client.post('/api/v1/auth/login/', {'username': 'rahul.kumar', 'password': 'NovaTech@2026'}, format='json')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data['user']['system_role'], 'EMPLOYEE')
        self.assertEqual(resp.data['user']['systemRole'], 'EMPLOYEE')

        token = resp.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        me_resp = self.client.get('/api/v1/auth/me/')
        self.assertEqual(me_resp.status_code, 200)
        self.assertEqual(me_resp.data['system_role'], 'EMPLOYEE')

    def test_arjun_hr_manager_login_and_auth_me(self):
        resp = self.client.post('/api/v1/auth/login/', {'username': 'arjun.mehta', 'password': 'NovaTech@2026'}, format='json')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data['user']['system_role'], 'HR_MANAGER')

        token = resp.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        me_resp = self.client.get('/api/v1/auth/me/')
        self.assertEqual(me_resp.status_code, 200)
        self.assertEqual(me_resp.data['system_role'], 'HR_MANAGER')

    def test_priya_admin_login_and_auth_me(self):
        resp = self.client.post('/api/v1/auth/login/', {'username': 'priya.sharma', 'password': 'NovaTech@2026'}, format='json')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data['user']['system_role'], 'ADMIN')

        token = resp.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        me_resp = self.client.get('/api/v1/auth/me/')
        self.assertEqual(me_resp.status_code, 200)
        self.assertEqual(me_resp.data['system_role'], 'ADMIN')

    def test_unauthorized_role_access(self):
        # 1. Rahul (EMPLOYEE) -> HR endpoint => 403 Forbidden
        self.client.force_authenticate(user=self.user_rahul)
        resp = self.client.get('/api/v1/auth/role-test/hr/')
        self.assertEqual(resp.status_code, 403)

        # 2. Rahul (EMPLOYEE) -> ADMIN endpoint => 403 Forbidden
        resp = self.client.get('/api/v1/auth/role-test/admin/')
        self.assertEqual(resp.status_code, 403)

        # 3. Arjun (HR_MANAGER) -> ADMIN endpoint => 403 Forbidden
        self.client.force_authenticate(user=self.user_arjun)
        resp = self.client.get('/api/v1/auth/role-test/admin/')
        self.assertEqual(resp.status_code, 403)

        # 4. Arjun (HR_MANAGER) -> HR endpoint => 200 OK
        resp = self.client.get('/api/v1/auth/role-test/hr/')
        self.assertEqual(resp.status_code, 200)

        # 5. Priya (ADMIN) -> ADMIN endpoint => 200 OK
        self.client.force_authenticate(user=self.user_priya)
        resp = self.client.get('/api/v1/auth/role-test/admin/')
        self.assertEqual(resp.status_code, 200)

        # 6. Priya (ADMIN) -> HR or Admin endpoint => 200 OK
        resp = self.client.get('/api/v1/auth/role-test/hr-or-admin/')
        self.assertEqual(resp.status_code, 200)

        # 7. Arjun (HR_MANAGER) -> HR or Admin endpoint => 200 OK
        self.client.force_authenticate(user=self.user_arjun)
        resp = self.client.get('/api/v1/auth/role-test/hr-or-admin/')
        self.assertEqual(resp.status_code, 200)


class DocumentUploadTestCase(APITestCase):
    """
    Automated test cases for Phase 3 Step 2: Real Document Upload & Storage.
    Tests file upload, validation, permissions, and security.
    """

    def setUp(self):
        # User 1: Rahul (EMPLOYEE)
        self.user_rahul = User.objects.create_user(
            username='rahul.emp',
            email='rahul.emp@novatech.io',
            password='NovaTech@2026'
        )
        self.emp_rahul = Employee.objects.create(
            user=self.user_rahul,
            employee_id='EMP-TEST-0101',
            name='Rahul Employee',
            email='rahul.emp@novatech.io',
            system_role=Employee.ROLE_EMPLOYEE
        )

        # User 2: Sneha (EMPLOYEE - Another employee)
        self.user_sneha = User.objects.create_user(
            username='sneha.emp',
            email='sneha.emp@novatech.io',
            password='NovaTech@2026'
        )
        self.emp_sneha = Employee.objects.create(
            user=self.user_sneha,
            employee_id='EMP-TEST-0102',
            name='Sneha Employee',
            email='sneha.emp@novatech.io',
            system_role=Employee.ROLE_EMPLOYEE
        )

        # Seed an existing metadata-only record for Rahul
        self.seeded_doc = OnboardingDocument.objects.create(
            employee=self.emp_rahul,
            name='Aadhaar Card',
            document_type='Identification',
            upload_status='Uploaded',
            verification_status='Pending Verification',
            date_str='Sep 25, 2026',
            size_str='1.8 MB',
            remarks='Pre-seeded metadata record',
            is_required=True,
            file=None
        )

        # Valid test dummy file contents
        self.valid_pdf_content = b"%PDF-1.4\n%Nova Tech Test PDF content\n%%EOF"
        self.valid_jpg_content = b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00H\x00H\x00\x00\xff\xdb\x00C\x00NovaTechTest"
        self.valid_png_content = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4"

    def tearDown(self):
        # Clean up any test files uploaded to MEDIA_ROOT during testing
        test_media_dir = os.path.join(settings.MEDIA_ROOT, 'onboarding_documents')
        if os.path.exists(test_media_dir):
            try:
                shutil.rmtree(test_media_dir)
            except Exception:
                pass

    def test_authenticated_document_list(self):
        """Authenticated employee can list their own documents."""
        self.client.force_authenticate(user=self.user_rahul)
        resp = self.client.get('/api/v1/documents/')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.data), 1)
        self.assertEqual(resp.data[0]['name'], 'Aadhaar Card')
        # Pre-seeded record has null file and null file_url
        self.assertIsNone(resp.data[0]['file'])
        self.assertIsNone(resp.data[0]['file_url'])

    def test_multipart_file_upload_pdf(self):
        """Employee can upload a valid PDF document with multipart/form-data."""
        self.client.force_authenticate(user=self.user_rahul)
        pdf_file = SimpleUploadedFile(
            'degree_certificate.pdf',
            self.valid_pdf_content,
            content_type='application/pdf'
        )
        data = {
            'file': pdf_file,
            'name': 'Degree Certificate',
            'document_type': 'Academic',
            'is_required': True
        }
        resp = self.client.post('/api/v1/documents/', data, format='multipart')
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(resp.data['name'], 'Degree Certificate')
        self.assertEqual(resp.data['type'], 'Academic')
        self.assertEqual(resp.data['upload_status'], 'Uploaded')
        self.assertEqual(resp.data['verification_status'], 'Pending Verification')
        self.assertIsNotNone(resp.data['file_url'])
        self.assertIn('.pdf', resp.data['file'])

        # Verify record in database
        doc = OnboardingDocument.objects.get(id=resp.data['id'])
        self.assertEqual(doc.employee, self.emp_rahul)
        self.assertTrue(bool(doc.file))
        self.assertTrue(os.path.exists(doc.file.path))

    def test_multipart_file_upload_png_and_jpg(self):
        """Employee can upload PNG and JPG documents."""
        self.client.force_authenticate(user=self.user_rahul)
        png_file = SimpleUploadedFile('badge.png', self.valid_png_content, content_type='image/png')
        resp_png = self.client.post('/api/v1/documents/', {'file': png_file, 'name': 'Badge Photo'}, format='multipart')
        self.assertEqual(resp_png.status_code, 201)
        self.assertIsNotNone(resp_png.data['file_url'])

        jpg_file = SimpleUploadedFile('id.jpg', self.valid_jpg_content, content_type='image/jpeg')
        resp_jpg = self.client.post('/api/v1/documents/', {'file': jpg_file, 'name': 'Passport Scan'}, format='multipart')
        self.assertEqual(resp_jpg.status_code, 201)
        self.assertIsNotNone(resp_jpg.data['file_url'])

    def test_document_download_endpoint(self):
        """Employee can download/view their uploaded file via the secure download endpoint."""
        self.client.force_authenticate(user=self.user_rahul)
        pdf_file = SimpleUploadedFile('offer_doc.pdf', self.valid_pdf_content, content_type='application/pdf')
        resp = self.client.post('/api/v1/documents/', {'file': pdf_file, 'name': 'Offer Doc'}, format='multipart')
        doc_id = resp.data['id']

        # Download file
        download_resp = self.client.get(f'/api/v1/documents/{doc_id}/download/')
        self.assertEqual(download_resp.status_code, 200)
        self.assertEqual(download_resp['Content-Type'], 'application/pdf')
        self.assertIn('inline;', download_resp['Content-Disposition'])

    def test_reject_unsupported_file_extension(self):
        """Rejects executable and non-allowed file extensions (.exe, .sh, .py, etc.)."""
        self.client.force_authenticate(user=self.user_rahul)

        # .exe file
        exe_file = SimpleUploadedFile('installer.exe', b'MZ\x90\x00test', content_type='application/octet-stream')
        resp = self.client.post('/api/v1/documents/', {'file': exe_file, 'name': 'Malicious App'}, format='multipart')
        self.assertEqual(resp.status_code, 400)
        self.assertIn('Unsupported file type', resp.data['error'])

        # .py script
        py_file = SimpleUploadedFile('script.py', b'print("hello")', content_type='text/x-python')
        resp_py = self.client.post('/api/v1/documents/', {'file': py_file, 'name': 'Python Script'}, format='multipart')
        self.assertEqual(resp_py.status_code, 400)

    def test_reject_disguised_file_with_invalid_magic_bytes(self):
        """Rejects file named .pdf but containing executable content (magic bytes validation)."""
        self.client.force_authenticate(user=self.user_rahul)
        fake_pdf = SimpleUploadedFile('fake_resume.pdf', b'MZ\x90\x00NotAPdfHeader', content_type='application/pdf')
        resp = self.client.post('/api/v1/documents/', {'file': fake_pdf, 'name': 'Fake Resume'}, format='multipart')
        self.assertEqual(resp.status_code, 400)
        self.assertIn('invalid or corrupted', resp.data['error'])

    def test_reject_file_exceeding_10mb(self):
        """Rejects file exceeding 10 MB limit."""
        self.client.force_authenticate(user=self.user_rahul)
        oversized_content = b"%PDF" + b"0" * (10 * 1024 * 1024 + 1024)
        huge_file = SimpleUploadedFile('huge_file.pdf', oversized_content, content_type='application/pdf')
        resp = self.client.post('/api/v1/documents/', {'file': huge_file, 'name': 'Huge Document'}, format='multipart')
        self.assertEqual(resp.status_code, 400)
        self.assertIn('10 MB', resp.data['error'])

    def test_unauthenticated_upload_rejected(self):
        """Unauthenticated POST to /documents/ returns 401 Unauthorized."""
        self.client.logout()
        pdf_file = SimpleUploadedFile('unauth.pdf', self.valid_pdf_content, content_type='application/pdf')
        resp = self.client.post('/api/v1/documents/', {'file': pdf_file, 'name': 'Unauth Doc'}, format='multipart')
        self.assertEqual(resp.status_code, 401)

    def test_employee_cross_tenant_isolation(self):
        """An employee CANNOT access or download another employee's document."""
        # 1. Rahul uploads a private document
        self.client.force_authenticate(user=self.user_rahul)
        pdf_file = SimpleUploadedFile('rahul_confidential.pdf', self.valid_pdf_content, content_type='application/pdf')
        rahul_resp = self.client.post('/api/v1/documents/', {'file': pdf_file, 'name': 'Rahul Confidential'}, format='multipart')
        rahul_doc_id = rahul_resp.data['id']

        # 2. Sneha logs in
        self.client.force_authenticate(user=self.user_sneha)

        # Sneha lists documents -> Rahul's doc must NOT be in the list
        sneha_list = self.client.get('/api/v1/documents/')
        self.assertEqual(sneha_list.status_code, 200)
        sneha_doc_ids = [d['id'] for d in sneha_list.data]
        self.assertNotIn(rahul_doc_id, sneha_doc_ids)

        # Sneha attempts to view Rahul's document directly -> 404 Not Found
        sneha_get = self.client.get(f'/api/v1/documents/{rahul_doc_id}/')
        self.assertEqual(sneha_get.status_code, 404)

        # Sneha attempts to download Rahul's document -> 404 Not Found
        sneha_download = self.client.get(f'/api/v1/documents/{rahul_doc_id}/download/')
        self.assertEqual(sneha_download.status_code, 404)


class Phase2RegressionTestCase(APITestCase):
    """Verifies that all Phase 2 onboarding APIs remain 100% operational."""

    def setUp(self):
        self.user = User.objects.create_user(
            username='test.emp',
            email='test.emp@novatech.io',
            password='NovaTech@2026'
        )
        self.employee = Employee.objects.create(
            user=self.user,
            employee_id='EMP-REG-001',
            name='Test Employee',
            email='test.emp@novatech.io',
            role='QA Engineer',
            system_role=Employee.ROLE_EMPLOYEE
        )
        self.profile = EmployeeProfile.objects.create(
            employee=self.employee,
            phone='+91 98765 43210',
            city='Bangalore'
        )
        self.offer = OfferLetter.objects.create(
            employee=self.employee,
            ref_no="NOVA/TEST/001",
            ctc="₹18,50,000 per annum",
            is_accepted=False
        )
        self.policy = CompanyPolicy.objects.create(
            policy_id="test-pol-01",
            title="Information Security Policy",
            category="Security",
            read_time="5 mins",
            summary="Test summary"
        )
        self.training = TrainingModule.objects.create(
            module_id="test-mod-01",
            title="Security Awareness 101",
            duration="30 mins",
            description="Test description"
        )
        self.client.force_authenticate(user=self.user)

    def test_profile_api(self):
        resp = self.client.get('/api/v1/profile/')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data['name'], 'Test Employee')

        put_resp = self.client.put('/api/v1/profile/', {'phone': '+91 99999 88888', 'city': 'Hyderabad'}, format='json')
        self.assertEqual(put_resp.status_code, 200)
        self.assertTrue(put_resp.data['success'])

    def test_offer_letter_api(self):
        resp = self.client.get('/api/v1/offer-letter/')
        self.assertEqual(resp.status_code, 200)
        self.assertFalse(resp.data['isAccepted'])

        accept_resp = self.client.post('/api/v1/offer-letter/accept/', {'signature': 'Test Employee'}, format='json')
        self.assertEqual(accept_resp.status_code, 200)
        self.assertTrue(accept_resp.data['isAccepted'])

    def test_policies_api(self):
        resp = self.client.get('/api/v1/policies/')
        self.assertEqual(resp.status_code, 200)
        self.assertGreaterEqual(len(resp.data), 1)

        ack_resp = self.client.post(f'/api/v1/policies/{self.policy.id}/acknowledge/')
        self.assertEqual(ack_resp.status_code, 200)
        self.assertTrue(ack_resp.data['acknowledged'])

    def test_training_api(self):
        resp = self.client.get('/api/v1/training/')
        self.assertEqual(resp.status_code, 200)

        prog_resp = self.client.post(f'/api/v1/training/{self.training.id}/progress/', {'progress': 50}, format='json')
        self.assertEqual(prog_resp.status_code, 200)
        self.assertEqual(prog_resp.data['progress'], 50)


class ProfileAndSettingsTestCase(APITestCase):
    """
    Automated test cases for Phase 3 Step 3:
    - Profile View & Edit security and validation
    - Protected field immutability
    - Change Password workflow and session behavior
    """

    def setUp(self):
        self.user = User.objects.create_user(
            username='kavita.nair',
            email='kavita.nair@novatech.io',
            password='CurrentPassword@2026'
        )
        self.employee = Employee.objects.create(
            user=self.user,
            employee_id='EMP-TEST-0301',
            name='Kavita Nair',
            email='kavita.nair@novatech.io',
            role='Product Designer',
            designation='Product Designer',
            department='Product & Design',
            system_role=Employee.ROLE_EMPLOYEE,
            joining_date='Monday, September 28, 2026',
            location='NOVA Tech – Bangalore Office',
            manager_name='Arjun Mehta',
            manager_role='Engineering Director'
        )
        self.profile = EmployeeProfile.objects.create(
            employee=self.employee,
            phone='+91 91234 56789',
            city='Bangalore',
            address='Indiranagar, 100ft Road',
            state='Karnataka',
            pincode='560038',
            blood_group='B+',
            emergency_contact_name='Ramesh Nair',
            emergency_contact_relation='Father',
            emergency_contact_phone='+91 98765 43219'
        )

    def test_authenticated_profile_get(self):
        """Authenticated employee can view their complete profile records."""
        self.client.force_authenticate(user=self.user)
        resp = self.client.get('/api/v1/profile/')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data['name'], 'Kavita Nair')
        self.assertEqual(resp.data['employeeId'], 'EMP-TEST-0301')
        self.assertEqual(resp.data['email'], 'kavita.nair@novatech.io')
        self.assertEqual(resp.data['department'], 'Product & Design')
        self.assertEqual(resp.data['systemRole'], 'EMPLOYEE')
        self.assertEqual(resp.data['phone'], '+91 91234 56789')
        self.assertEqual(resp.data['city'], 'Bangalore')
        self.assertEqual(resp.data['manager']['name'], 'Arjun Mehta')

    def test_authenticated_profile_update(self):
        """Authenticated employee can update allowed personal and contact fields."""
        self.client.force_authenticate(user=self.user)
        payload = {
            'phone': '+91 98888 77777',
            'city': 'Mysore',
            'address': 'Gokulam 3rd Stage',
            'state': 'Karnataka',
            'pincode': '570002',
            'emergencyContact': {
                'name': 'Pooja Nair',
                'relation': 'Sister',
                'phone': '+91 99999 11111'
            }
        }
        resp = self.client.put('/api/v1/profile/', payload, format='json')
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(resp.data['success'])
        self.assertEqual(resp.data['phone'], '+91 98888 77777')
        self.assertEqual(resp.data['city'], 'Mysore')

        # Verify database updated
        self.profile.refresh_from_db()
        self.assertEqual(self.profile.phone, '+91 98888 77777')
        self.assertEqual(self.profile.city, 'Mysore')
        self.assertEqual(self.profile.emergency_contact_name, 'Pooja Nair')

    def test_employee_cannot_modify_protected_authorization_fields(self):
        """Employee cannot modify protected fields like system_role or employee_id."""
        self.client.force_authenticate(user=self.user)

        # Attempt to escalate role to ADMIN
        resp_role = self.client.put('/api/v1/profile/', {'system_role': 'ADMIN'}, format='json')
        self.assertEqual(resp_role.status_code, 400)
        self.assertIn('protected', resp_role.data['error'])

        # Attempt to tamper employee_id
        resp_id = self.client.put('/api/v1/profile/', {'employee_id': 'EMP-HACKED-001'}, format='json')
        self.assertEqual(resp_id.status_code, 400)
        self.assertIn('protected', resp_id.data['error'])

        # Verify DB values were not altered
        self.employee.refresh_from_db()
        self.assertEqual(self.employee.system_role, Employee.ROLE_EMPLOYEE)
        self.assertEqual(self.employee.employee_id, 'EMP-TEST-0301')

    def test_unauthenticated_profile_access(self):
        """Unauthenticated requests to /profile/ return 401 Unauthorized."""
        self.client.logout()
        resp_get = self.client.get('/api/v1/profile/')
        self.assertEqual(resp_get.status_code, 401)

        resp_put = self.client.put('/api/v1/profile/', {'city': 'Delhi'}, format='json')
        self.assertEqual(resp_put.status_code, 401)

    def test_change_password_success(self):
        """Change password with valid credentials succeeds and issues fresh tokens."""
        self.client.force_authenticate(user=self.user)
        resp = self.client.post('/api/v1/auth/change-password/', {
            'current_password': 'CurrentPassword@2026',
            'new_password': 'BrandNewPassword@2026'
        }, format='json')
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(resp.data['success'])
        self.assertIn('access', resp.data)
        self.assertIn('refresh', resp.data)

    def test_change_password_wrong_current_password(self):
        """Change password fails when current password is wrong."""
        self.client.force_authenticate(user=self.user)
        resp = self.client.post('/api/v1/auth/change-password/', {
            'current_password': 'WrongPassword123',
            'new_password': 'BrandNewPassword@2026'
        }, format='json')
        self.assertEqual(resp.status_code, 400)
        self.assertIn('Current password is incorrect', resp.data['error'])

    def test_change_password_weak_password(self):
        """Change password fails when new password is too weak."""
        self.client.force_authenticate(user=self.user)
        resp = self.client.post('/api/v1/auth/change-password/', {
            'current_password': 'CurrentPassword@2026',
            'new_password': '123'
        }, format='json')
        self.assertEqual(resp.status_code, 400)

    def test_change_password_same_as_current_rejected(self):
        """Change password fails if new password equals current password."""
        self.client.force_authenticate(user=self.user)
        resp = self.client.post('/api/v1/auth/change-password/', {
            'current_password': 'CurrentPassword@2026',
            'new_password': 'CurrentPassword@2026'
        }, format='json')
        self.assertEqual(resp.status_code, 400)
        self.assertIn('cannot be the same', resp.data['error'])

    def test_password_lifecycle_login_verification(self):
        """Verifies old password fails and new password succeeds after change."""
        self.client.force_authenticate(user=self.user)
        change_resp = self.client.post('/api/v1/auth/change-password/', {
            'current_password': 'CurrentPassword@2026',
            'new_password': 'BrandNewPassword@2026'
        }, format='json')
        self.assertEqual(change_resp.status_code, 200)

        # 1. Old password MUST fail
        self.client.logout()
        old_login_resp = self.client.post('/api/v1/auth/login/', {
            'username': 'kavita.nair',
            'password': 'CurrentPassword@2026'
        }, format='json')
        self.assertEqual(old_login_resp.status_code, 401)

        # 2. New password MUST succeed
        new_login_resp = self.client.post('/api/v1/auth/login/', {
            'username': 'kavita.nair',
            'password': 'BrandNewPassword@2026'
        }, format='json')
        self.assertEqual(new_login_resp.status_code, 200)
        self.assertIn('access', new_login_resp.data)
        self.assertEqual(new_login_resp.data['user']['email'], 'kavita.nair@novatech.io')


class CandidateInvitationTestCase(APITestCase):
    """Automated test cases for Phase 3 Step 4: Candidate Registration & Invite System."""

    def setUp(self):
        # 1. Setup HR Manager (Arjun Mehta)
        self.user_hr = User.objects.create_user(
            username='arjun.hr',
            email='arjun.hr@novatech.io',
            password='NovaTech@2026'
        )
        self.emp_hr = Employee.objects.create(
            user=self.user_hr,
            employee_id='EMP-HR-001',
            name='Arjun Mehta',
            email='arjun.hr@novatech.io',
            role='Engineering Director',
            system_role=Employee.ROLE_HR_MANAGER
        )

        # 2. Setup Admin (Priya Sharma)
        self.user_admin = User.objects.create_user(
            username='priya.admin',
            email='priya.admin@novatech.io',
            password='NovaTech@2026',
            is_staff=True
        )
        self.emp_admin = Employee.objects.create(
            user=self.user_admin,
            employee_id='EMP-ADM-001',
            name='Priya Sharma',
            email='priya.admin@novatech.io',
            role='People & Culture Lead',
            system_role=Employee.ROLE_ADMIN
        )

        # 3. Setup Employee (Rahul Kumar)
        self.user_employee = User.objects.create_user(
            username='rahul.emp',
            email='rahul.emp@novatech.io',
            password='NovaTech@2026'
        )
        self.emp_employee = Employee.objects.create(
            user=self.user_employee,
            employee_id='EMP-DEV-001',
            name='Rahul Kumar',
            email='rahul.emp@novatech.io',
            role='Software Engineer',
            system_role=Employee.ROLE_EMPLOYEE
        )

    def test_hr_manager_can_create_invitation(self):
        """HR Manager can create candidate invitation."""
        self.client.force_authenticate(user=self.user_hr)
        payload = {
            'email': 'sanya.candidate@example.com',
            'full_name': 'Sanya Malhotra',
            'job_title': 'Frontend Engineer',
            'department': 'Product & Design',
            'joining_date': '2026-11-01',
            'manager': 'Arjun Mehta'
        }
        resp = self.client.post('/api/v1/invitations/', payload, format='json')
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(resp.data['email'], 'sanya.candidate@example.com')
        self.assertEqual(resp.data['status'], 'PENDING')
        self.assertIn('raw_token', resp.data)
        self.assertIn('invitation_url', resp.data)
        self.assertNotIn('token_hash', resp.data)

    def test_admin_can_create_invitation(self):
        """Admin can create candidate invitation."""
        self.client.force_authenticate(user=self.user_admin)
        payload = {
            'email': 'rohit.candidate@example.com',
            'full_name': 'Rohit Verma',
            'job_title': 'DevOps Engineer',
            'department': 'Cloud Platform & DevOps',
            'joining_date': '2026-11-15',
            'manager': 'Arjun Mehta'
        }
        resp = self.client.post('/api/v1/invitations/', payload, format='json')
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(resp.data['email'], 'rohit.candidate@example.com')

    def test_employee_cannot_create_invitation_forbidden_403(self):
        """EMPLOYEE role is forbidden (403) from creating candidate invitations."""
        self.client.force_authenticate(user=self.user_employee)
        payload = {
            'email': 'unauthorized@example.com',
            'full_name': 'Unauthorized Candidate'
        }
        resp = self.client.post('/api/v1/invitations/', payload, format='json')
        self.assertEqual(resp.status_code, 403)

    def test_unauthenticated_cannot_create_invitation_unauthorized_401(self):
        """Unauthenticated user receives 401 Unauthorized."""
        self.client.logout()
        payload = {'email': 'unauthenticated@example.com', 'full_name': 'Anon'}
        resp = self.client.post('/api/v1/invitations/', payload, format='json')
        self.assertEqual(resp.status_code, 401)

    def test_invitation_token_is_securely_hashed_and_not_stored_raw_in_db(self):
        """Verifies raw token is NOT in database, and SHA-256 token hash is stored."""
        self.client.force_authenticate(user=self.user_hr)
        payload = {
            'email': 'hash.test@example.com',
            'full_name': 'Hash Test User'
        }
        resp = self.client.post('/api/v1/invitations/', payload, format='json')
        self.assertEqual(resp.status_code, 201)
        raw_token = resp.data['raw_token']

        # Lookup by token_hash in DB
        expected_hash = hashlib.sha256(raw_token.encode('utf-8')).hexdigest()
        self.assertEqual(len(expected_hash), 64)

        inv = CandidateInvitation.objects.filter(token_hash=expected_hash).first()
        self.assertIsNotNone(inv)
        self.assertEqual(inv.email, 'hash.test@example.com')

        # Check raw_token does NOT equal token_hash and is not stored
        self.assertNotEqual(raw_token, inv.token_hash)
        self.assertFalse(CandidateInvitation.objects.filter(token_hash=raw_token).exists())

    def test_preview_with_valid_token_succeeds(self):
        """GET /api/v1/invitations/preview/?token=... returns safe invitation preview."""
        self.client.force_authenticate(user=self.user_hr)
        create_resp = self.client.post('/api/v1/invitations/', {
            'email': 'preview.test@example.com',
            'full_name': 'Preview Candidate',
            'job_title': 'QA Automation Lead',
            'department': 'Data & Technology'
        }, format='json')
        raw_token = create_resp.data['raw_token']

        # Public preview request
        self.client.logout()
        preview_resp = self.client.get(f'/api/v1/invitations/preview/?token={raw_token}')
        self.assertEqual(preview_resp.status_code, 200)
        self.assertEqual(preview_resp.data['full_name'], 'Preview Candidate')
        self.assertEqual(preview_resp.data['email'], 'preview.test@example.com')
        self.assertEqual(preview_resp.data['job_title'], 'QA Automation Lead')
        self.assertEqual(preview_resp.data['status'], 'PENDING')
        # Security: verify no sensitive hash or password fields exposed
        self.assertNotIn('token_hash', preview_resp.data)
        self.assertNotIn('password', preview_resp.data)

    def test_preview_with_invalid_token_rejected(self):
        """Preview with invalid token returns 400 error."""
        self.client.logout()
        resp = self.client.get('/api/v1/invitations/preview/?token=completely_fake_token_123')
        self.assertEqual(resp.status_code, 400)
        self.assertIn('Invalid', resp.data['error'])

    def test_preview_with_expired_token_rejected(self):
        """Expired invitations are rejected on preview."""
        self.client.force_authenticate(user=self.user_hr)
        create_resp = self.client.post('/api/v1/invitations/', {
            'email': 'expired.test@example.com',
            'full_name': 'Expired Candidate'
        }, format='json')
        raw_token = create_resp.data['raw_token']

        token_hash = hashlib.sha256(raw_token.encode('utf-8')).hexdigest()
        inv = CandidateInvitation.objects.get(token_hash=token_hash)
        inv.expires_at = timezone.now() - timezone.timedelta(hours=1)
        inv.save()

        self.client.logout()
        resp = self.client.get(f'/api/v1/invitations/preview/?token={raw_token}')
        self.assertEqual(resp.status_code, 400)
        self.assertIn('expired', resp.data['error'].lower())

    def test_preview_with_cancelled_token_rejected(self):
        """Cancelled invitations are rejected on preview."""
        self.client.force_authenticate(user=self.user_hr)
        create_resp = self.client.post('/api/v1/invitations/', {
            'email': 'cancelled.test@example.com',
            'full_name': 'Cancelled Candidate'
        }, format='json')
        raw_token = create_resp.data['raw_token']
        inv_id = create_resp.data['id']

        # Cancel the invite
        cancel_resp = self.client.post(f'/api/v1/invitations/{inv_id}/cancel/')
        self.assertEqual(cancel_resp.status_code, 200)

        # Candidate checks preview
        self.client.logout()
        resp = self.client.get(f'/api/v1/invitations/preview/?token={raw_token}')
        self.assertEqual(resp.status_code, 400)
        self.assertIn('cancelled', resp.data['error'].lower())

    def test_duplicate_pending_invitation_rejected(self):
        """Cannot create a second pending invitation for the same candidate email."""
        self.client.force_authenticate(user=self.user_hr)
        self.client.post('/api/v1/invitations/', {
            'email': 'dup.candidate@example.com',
            'full_name': 'Dup Candidate'
        }, format='json')

        resp2 = self.client.post('/api/v1/invitations/', {
            'email': 'dup.candidate@example.com',
            'full_name': 'Dup Candidate Second Attempt'
        }, format='json')
        self.assertEqual(resp2.status_code, 400)
        self.assertIn('active pending invitation', resp2.data['error'])

    def test_existing_registered_email_rejected(self):
        """Cannot create an invitation for an email already belonging to an active user."""
        self.client.force_authenticate(user=self.user_hr)
        resp = self.client.post('/api/v1/invitations/', {
            'email': self.user_employee.email,
            'full_name': 'Rahul Duplicate'
        }, format='json')
        self.assertEqual(resp.status_code, 400)
        self.assertIn('already exists', resp.data['error'].lower())

    def test_candidate_registration_success(self):
        """Valid candidate accepts invitation, creates User + Employee + EmployeeProfile."""
        self.client.force_authenticate(user=self.user_hr)
        create_resp = self.client.post('/api/v1/invitations/', {
            'email': 'meera.nair@example.com',
            'full_name': 'Meera Nair',
            'job_title': 'UX Designer',
            'department': 'Product & Design',
            'joining_date': '2026-11-20',
            'manager': 'Arjun Mehta'
        }, format='json')
        raw_token = create_resp.data['raw_token']

        # Candidate completes registration
        self.client.logout()
        accept_resp = self.client.post('/api/v1/invitations/accept/', {
            'token': raw_token,
            'password': 'SecureMeeraPassword@2026',
            'confirm_password': 'SecureMeeraPassword@2026',
            'phone': '+91 99887 76655'
        }, format='json')

        self.assertEqual(accept_resp.status_code, 201)
        self.assertTrue(accept_resp.data['success'])
        self.assertEqual(accept_resp.data['system_role'], 'EMPLOYEE')

        # Verify Django User created
        user = User.objects.filter(email='meera.nair@example.com').first()
        self.assertIsNotNone(user)
        self.assertTrue(user.check_password('SecureMeeraPassword@2026'))

        # Verify Employee record created with strict ROLE_EMPLOYEE
        emp = Employee.objects.filter(user=user).first()
        self.assertIsNotNone(emp)
        self.assertEqual(emp.name, 'Meera Nair')
        self.assertEqual(emp.system_role, Employee.ROLE_EMPLOYEE)
        self.assertEqual(emp.department, 'Product & Design')
        self.assertEqual(emp.role, 'UX Designer')
        self.assertTrue(emp.employee_id.startswith('EMP-2026-'))

        # Verify EmployeeProfile created
        profile = EmployeeProfile.objects.filter(employee=emp).first()
        self.assertIsNotNone(profile)
        self.assertEqual(profile.phone, '+91 99887 76655')

        # Verify invitation marked ACCEPTED
        token_hash = hashlib.sha256(raw_token.encode('utf-8')).hexdigest()
        inv = CandidateInvitation.objects.get(token_hash=token_hash)
        self.assertEqual(inv.status, CandidateInvitation.STATUS_ACCEPTED)
        self.assertIsNotNone(inv.accepted_at)

    def test_candidate_cannot_choose_role_or_id_or_department(self):
        """Candidate-submitted role, employee_id, or department parameters are strictly ignored."""
        self.client.force_authenticate(user=self.user_hr)
        create_resp = self.client.post('/api/v1/invitations/', {
            'email': 'hacker.candidate@example.com',
            'full_name': 'Hacker Candidate',
            'job_title': 'Junior Dev',
            'department': 'Data & Technology'
        }, format='json')
        raw_token = create_resp.data['raw_token']

        # Attempt tampering
        self.client.logout()
        accept_resp = self.client.post('/api/v1/invitations/accept/', {
            'token': raw_token,
            'password': 'SecureCandidatePassword@2026',
            'confirm_password': 'SecureCandidatePassword@2026',
            'system_role': 'ADMIN',
            'employee_id': 'EMP-HACKED-999',
            'department': 'Board of Directors'
        }, format='json')
        self.assertEqual(accept_resp.status_code, 201)

        emp = Employee.objects.get(email='hacker.candidate@example.com')
        self.assertEqual(emp.system_role, Employee.ROLE_EMPLOYEE)
        self.assertNotEqual(emp.employee_id, 'EMP-HACKED-999')
        self.assertTrue(emp.employee_id.startswith('EMP-2026-'))
        self.assertEqual(emp.department, 'Data & Technology')

    def test_accepted_invitation_cannot_be_reused(self):
        """Accepted invitation cannot be used a second time."""
        self.client.force_authenticate(user=self.user_hr)
        create_resp = self.client.post('/api/v1/invitations/', {
            'email': 'once.candidate@example.com',
            'full_name': 'Once Candidate'
        }, format='json')
        raw_token = create_resp.data['raw_token']

        self.client.logout()
        # First accept succeeds
        self.client.post('/api/v1/invitations/accept/', {
            'token': raw_token,
            'password': 'SecurePassword@2026',
            'confirm_password': 'SecurePassword@2026'
        }, format='json')

        # Second accept fails
        resp2 = self.client.post('/api/v1/invitations/accept/', {
            'token': raw_token,
            'password': 'AnotherPassword@2026',
            'confirm_password': 'AnotherPassword@2026'
        }, format='json')
        self.assertEqual(resp2.status_code, 400)
        self.assertIn('already been accepted', resp2.data['error'])

    def test_weak_password_rejected(self):
        """Candidate registration rejects weak passwords."""
        self.client.force_authenticate(user=self.user_hr)
        create_resp = self.client.post('/api/v1/invitations/', {
            'email': 'weakpass.candidate@example.com',
            'full_name': 'Weak Pass'
        }, format='json')
        raw_token = create_resp.data['raw_token']

        self.client.logout()
        resp = self.client.post('/api/v1/invitations/accept/', {
            'token': raw_token,
            'password': '123',
            'confirm_password': '123'
        }, format='json')
        self.assertEqual(resp.status_code, 400)

    def test_new_candidate_can_login_after_registration(self):
        """Candidate can log into the application with their credentials after registration."""
        self.client.force_authenticate(user=self.user_hr)
        create_resp = self.client.post('/api/v1/invitations/', {
            'email': 'login.candidate@example.com',
            'full_name': 'Login Candidate'
        }, format='json')
        raw_token = create_resp.data['raw_token']

        self.client.logout()
        reg_resp = self.client.post('/api/v1/invitations/accept/', {
            'token': raw_token,
            'password': 'CandidateLogin@2026',
            'confirm_password': 'CandidateLogin@2026'
        }, format='json')
        self.assertEqual(reg_resp.status_code, 201)

        # Login using email
        login_resp = self.client.post('/api/v1/auth/login/', {
            'username': 'login.candidate@example.com',
            'password': 'CandidateLogin@2026'
        }, format='json')
        self.assertEqual(login_resp.status_code, 200)
        self.assertIn('access', login_resp.data)
        self.assertEqual(login_resp.data['user']['system_role'], 'EMPLOYEE')

    def test_hr_can_list_and_cancel_invitation(self):
        """HR Manager can list invitations and cancel pending ones."""
        self.client.force_authenticate(user=self.user_hr)
        create_resp = self.client.post('/api/v1/invitations/', {
            'email': 'cancel.candidate@example.com',
            'full_name': 'To Be Cancelled'
        }, format='json')
        inv_id = create_resp.data['id']

        # List invitations
        list_resp = self.client.get('/api/v1/invitations/')
        self.assertEqual(list_resp.status_code, 200)
        self.assertTrue(len(list_resp.data) >= 1)

        # Cancel invitation
        cancel_resp = self.client.post(f'/api/v1/invitations/{inv_id}/cancel/')
        self.assertEqual(cancel_resp.status_code, 200)
        self.assertEqual(cancel_resp.data['status'], 'CANCELLED')

    def test_invitation_creation_sends_email_to_personal_address(self):
        """Verifies real email dispatch to candidate's personal Gmail/email with welcome message & URL."""
        mail.outbox.clear()
        self.client.force_authenticate(user=self.user_hr)

        candidate_email = 'ananya.sharma.test@gmail.com'
        payload = {
            'email': candidate_email,
            'full_name': 'Ananya Sharma',
            'job_title': 'Senior Frontend Engineer',
            'department': 'Product & Design',
            'joining_date': 'Monday, November 2, 2026',
            'manager': 'Arjun Mehta'
        }
        resp = self.client.post('/api/v1/invitations/', payload, format='json')
        self.assertEqual(resp.status_code, 201)
        self.assertTrue(resp.data.get('email_sent'))
        self.assertEqual(resp.data.get('email_recipient'), candidate_email)

        # Verify email was dispatched via Django email backend
        self.assertEqual(len(mail.outbox), 1)
        sent_email = mail.outbox[0]
        self.assertIn(candidate_email, sent_email.to)
        self.assertIn('NOVA Tech', sent_email.subject)
        self.assertIn('Complete Your Employee Onboarding Registration', sent_email.subject)

        # Check plain text content
        self.assertIn('Ananya Sharma', sent_email.body)
        self.assertIn('Senior Frontend Engineer', sent_email.body)
        self.assertIn('Product & Design', sent_email.body)
        self.assertIn('48 hours', sent_email.body)
        self.assertIn('/register?token=', sent_email.body)

        # Check HTML alternative content
        self.assertTrue(len(sent_email.alternatives) > 0)
        html_content, mimetype = sent_email.alternatives[0]
        self.assertEqual(mimetype, 'text/html')
        self.assertIn('Start Onboarding', html_content)
        self.assertIn(resp.data['invitation_url'], html_content)
        self.assertIn('48 hours', html_content)

    def test_invitation_creation_fails_honestly_when_email_sending_fails(self):
        """Verifies failed email delivery does not falsely report success and rolls back DB transaction."""
        mail.outbox.clear()
        self.client.force_authenticate(user=self.user_hr)

        candidate_email = 'smtp.failure.test@gmail.com'
        payload = {
            'email': candidate_email,
            'full_name': 'SMTP Failure Candidate',
            'job_title': 'Cloud Architect'
        }

        with patch('apps.onboarding.views.send_invitation_email', side_effect=EmailDeliveryError('SMTP connection timeout: host unreachable')):
            resp = self.client.post('/api/v1/invitations/', payload, format='json')

        self.assertEqual(resp.status_code, 502)
        self.assertFalse(resp.data.get('email_sent', True))
        self.assertIn('Failed to deliver invitation email', resp.data.get('error', ''))

        # Verify transaction rolled back: invitation NOT saved in database
        self.assertFalse(CandidateInvitation.objects.filter(email=candidate_email).exists())
        self.assertEqual(len(mail.outbox), 0)

    def test_invitation_resend_generates_new_token_and_sends_email(self):
        """Verifies resending an invitation creates a fresh 48-hour token and delivers new email."""
        self.client.force_authenticate(user=self.user_hr)
        candidate_email = 'resend.candidate@gmail.com'
        create_resp = self.client.post('/api/v1/invitations/', {
            'email': candidate_email,
            'full_name': 'Resend Candidate',
            'job_title': 'Security Engineer'
        }, format='json')
        self.assertEqual(create_resp.status_code, 201)
        initial_token = create_resp.data['raw_token']
        inv_id = create_resp.data['id']

        mail.outbox.clear()

        # HR resends the invitation
        resend_resp = self.client.post(f'/api/v1/invitations/{inv_id}/resend/')
        self.assertEqual(resend_resp.status_code, 200)
        self.assertTrue(resend_resp.data.get('email_sent'))

        fresh_token = resend_resp.data['raw_token']
        self.assertNotEqual(initial_token, fresh_token)

        # Check new email sent
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn(fresh_token, mail.outbox[0].body)

        # Old token is no longer valid
        self.client.logout()
        old_preview = self.client.get(f'/api/v1/invitations/preview/?token={initial_token}')
        self.assertEqual(old_preview.status_code, 400)

        # Fresh token works
        new_preview = self.client.get(f'/api/v1/invitations/preview/?token={fresh_token}')
        self.assertEqual(new_preview.status_code, 200)
        self.assertEqual(new_preview.data['email'], candidate_email)

    def test_invitation_resend_fails_on_already_accepted_or_cancelled_invitation(self):
        """Resending accepted or cancelled invitations is rejected."""
        self.client.force_authenticate(user=self.user_hr)
        create_resp = self.client.post('/api/v1/invitations/', {
            'email': 'status.resend.test@gmail.com',
            'full_name': 'Status Resend Test'
        }, format='json')
        inv_id = create_resp.data['id']
        raw_token = create_resp.data['raw_token']

        # Accept the invitation
        self.client.logout()
        self.client.post('/api/v1/invitations/accept/', {
            'token': raw_token,
            'password': 'SecureCandidatePassword@2026',
            'confirm_password': 'SecureCandidatePassword@2026'
        }, format='json')

        # Try to resend accepted invitation
        self.client.force_authenticate(user=self.user_hr)
        resend_accepted = self.client.post(f'/api/v1/invitations/{inv_id}/resend/')
        self.assertEqual(resend_accepted.status_code, 400)
        self.assertIn('already been accepted', resend_accepted.data['error'])

        # Cancel another invitation and try to resend
        create_resp2 = self.client.post('/api/v1/invitations/', {
            'email': 'cancel.resend.test@gmail.com',
            'full_name': 'Cancel Resend Test'
        }, format='json')
        inv_id2 = create_resp2.data['id']
        self.client.post(f'/api/v1/invitations/{inv_id2}/cancel/')

        resend_cancelled = self.client.post(f'/api/v1/invitations/{inv_id2}/resend/')
        self.assertEqual(resend_cancelled.status_code, 400)
        self.assertIn('cancelled', resend_cancelled.data['error'])

    def test_successful_first_time_activation_and_jwt_tokens(self):
        """Verifies setting password activates user and returns SimpleJWT access and refresh tokens."""
        self.client.force_authenticate(user=self.user_hr)
        candidate_email = 'tanya.activation.test@gmail.com'
        create_resp = self.client.post('/api/v1/invitations/', {
            'email': candidate_email,
            'full_name': 'Tanya Verma',
            'job_title': 'Data Scientist',
            'department': 'Data & Technology'
        }, format='json')
        raw_token = create_resp.data['raw_token']

        self.client.logout()
        accept_resp = self.client.post('/api/v1/invitations/accept/', {
            'token': raw_token,
            'password': 'StrongTanyaPassword@2026',
            'confirm_password': 'StrongTanyaPassword@2026',
            'phone': '+91 98123 45678'
        }, format='json')

        self.assertEqual(accept_resp.status_code, 201)
        self.assertTrue(accept_resp.data['success'])
        self.assertIn('access', accept_resp.data)
        self.assertIn('refresh', accept_resp.data)
        self.assertEqual(accept_resp.data['email'], candidate_email)
        self.assertEqual(accept_resp.data['system_role'], 'EMPLOYEE')

        # Verify password is set and usable
        user = User.objects.get(email=candidate_email)
        self.assertTrue(user.check_password('StrongTanyaPassword@2026'))
        self.assertTrue(user.is_active)

    def test_activation_associates_preexisting_unlinked_employee_without_duplication(self):
        """Verifies account activation associates an unlinked employee record without duplicating or error."""
        candidate_email = 'precreated.emp@gmail.com'
        unlinked_emp = Employee.objects.create(
            user=None,
            employee_id='EMP-2026-7788',
            name='Precreated Candidate',
            email=candidate_email,
            role='Backend Engineer',
            system_role=Employee.ROLE_EMPLOYEE
        )

        self.client.force_authenticate(user=self.user_hr)
        create_resp = self.client.post('/api/v1/invitations/', {
            'email': candidate_email,
            'full_name': 'Precreated Candidate',
            'job_title': 'Backend Engineer'
        }, format='json')
        self.assertEqual(create_resp.status_code, 201)
        raw_token = create_resp.data['raw_token']

        self.client.logout()
        accept_resp = self.client.post('/api/v1/invitations/accept/', {
            'token': raw_token,
            'password': 'StrongPrecreatedPass@2026',
            'confirm_password': 'StrongPrecreatedPass@2026'
        }, format='json')

        self.assertEqual(accept_resp.status_code, 201)
        # Verify no duplicate Employee was created
        self.assertEqual(Employee.objects.filter(email=candidate_email).count(), 1)
        unlinked_emp.refresh_from_db()
        self.assertIsNotNone(unlinked_emp.user)
        self.assertEqual(unlinked_emp.user.email, candidate_email)

    def test_employee_login_and_saved_progress_continuation(self):
        """Verifies activated employee can log in, complete tasks, log out, log back in, and resume progress."""
        self.client.force_authenticate(user=self.user_hr)
        candidate_email = 'progress.resume.test@gmail.com'
        create_resp = self.client.post('/api/v1/invitations/', {
            'email': candidate_email,
            'full_name': 'Progress Candidate',
            'job_title': 'Full Stack Developer'
        }, format='json')
        raw_token = create_resp.data['raw_token']

        # 1. Candidate activates account
        self.client.logout()
        self.client.post('/api/v1/invitations/accept/', {
            'token': raw_token,
            'password': 'ProgressCandidate@2026',
            'confirm_password': 'ProgressCandidate@2026'
        }, format='json')

        # 2. Candidate logs in using personal email and password
        login_resp = self.client.post('/api/v1/auth/login/', {
            'username': candidate_email,
            'password': 'ProgressCandidate@2026'
        }, format='json')
        self.assertEqual(login_resp.status_code, 200)
        access_token = login_resp.data['access']

        # 3. Employee accesses onboarding stages and updates a stage progress
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
        stages_resp = self.client.get('/api/v1/stages/')
        self.assertEqual(stages_resp.status_code, 200)

        # Mark first stage as completed via toggle
        first_stage = OnboardingStage.objects.order_by('stage_number').first()
        toggle_resp = self.client.post(f'/api/v1/stages/{first_stage.stage_id}/toggle/')
        self.assertEqual(toggle_resp.status_code, 200)

        # 4. Employee logs out
        self.client.logout()
        self.client.credentials()

        # 5. Employee logs back in with credentials
        login_again = self.client.post('/api/v1/auth/login/', {
            'username': candidate_email,
            'password': 'ProgressCandidate@2026'
        }, format='json')
        self.assertEqual(login_again.status_code, 200)
        new_token = login_again.data['access']

        # 6. Verify previously saved onboarding progress is maintained
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {new_token}")
        check_stages = self.client.get('/api/v1/stages/')
        self.assertEqual(check_stages.status_code, 200)
        first_stage_progress = next(s for s in check_stages.data if s['id'] == first_stage.stage_id)
        self.assertTrue(first_stage_progress['isCompleted'])
        self.assertEqual(first_stage_progress['status'], 'completed')

    def test_hr_visibility_of_correct_employee_progress(self):
        """Verifies HR dashboard and employee list display accurate real-time data for the activated employee."""
        self.client.force_authenticate(user=self.user_hr)
        candidate_email = 'hr.tracking.test@gmail.com'
        create_resp = self.client.post('/api/v1/invitations/', {
            'email': candidate_email,
            'full_name': 'HR Tracking Employee',
            'job_title': 'Security Analyst'
        }, format='json')
        raw_token = create_resp.data['raw_token']

        # Prior to activation: employee listed under invited / pending
        emp_list_before = self.client.get('/api/v1/hr/employees/?search=HR+Tracking')
        self.assertEqual(emp_list_before.status_code, 200)
        results = emp_list_before.data.get('results', emp_list_before.data)
        self.assertTrue(any(r['email'] == candidate_email and r['status'] == 'INVITED' for r in results))

        # Candidate activates account
        self.client.logout()
        accept_resp = self.client.post('/api/v1/invitations/accept/', {
            'token': raw_token,
            'password': 'StrongPassword@2026',
            'confirm_password': 'StrongPassword@2026'
        }, format='json')
        self.assertEqual(accept_resp.status_code, 201)

        # HR checks dashboard and employee directory
        self.client.force_authenticate(user=self.user_hr)
        emp_list_after = self.client.get('/api/v1/hr/employees/?search=HR+Tracking')
        self.assertEqual(emp_list_after.status_code, 200)
        results_after = emp_list_after.data.get('results', emp_list_after.data)
        matching = [r for r in results_after if r['email'] == candidate_email]
        self.assertEqual(len(matching), 1)
        self.assertEqual(matching[0]['status'], 'ONBOARDING')
        self.assertEqual(matching[0]['invitation_status'], 'ACCEPTED')

        # HR checks single employee detail endpoint
        emp_id = matching[0]['id']
        detail_resp = self.client.get(f'/api/v1/hr/employees/{emp_id}/')
        self.assertEqual(detail_resp.status_code, 200)
        self.assertEqual(detail_resp.data['identity']['email'], candidate_email)

    def test_unauthorized_employee_cannot_access_another_employee_data(self):
        """Verifies an employee cannot view or alter another employee's private documents or stages."""
        # 1. Setup Employee A
        user_a = User.objects.create_user(username='emp.a', email='emp.a@novatech.io', password='PasswordA@2026')
        emp_a = Employee.objects.create(
            user=user_a,
            employee_id='EMP-2026-000A',
            name='Employee Alpha',
            email='emp.a@novatech.io',
            system_role=Employee.ROLE_EMPLOYEE
        )

        # 2. Setup Employee B with a document
        user_b = User.objects.create_user(username='emp.b', email='emp.b@novatech.io', password='PasswordB@2026')
        emp_b = Employee.objects.create(
            user=user_b,
            employee_id='EMP-2026-000B',
            name='Employee Beta',
            email='emp.b@novatech.io',
            system_role=Employee.ROLE_EMPLOYEE
        )
        doc_b = OnboardingDocument.objects.create(
            employee=emp_b,
            document_type='pan_card',
            name='PAN Card - Employee Beta',
            upload_status='Submitted'
        )

        # 3. Employee A attempts to view documents list
        self.client.force_authenticate(user=user_a)
        docs_resp = self.client.get('/api/v1/documents/')
        self.assertEqual(docs_resp.status_code, 200)
        # Employee A must not see Employee B's document in their list
        doc_ids = [d['id'] for d in docs_resp.data]
        self.assertNotIn(doc_b.id, doc_ids)

        # 4. Employee A attempts to access HR employee detail endpoint
        hr_detail_resp = self.client.get(f'/api/v1/hr/employees/{emp_b.id}/')
        self.assertEqual(hr_detail_resp.status_code, 403)



class HRPortalTestCase(APITestCase):
    """Automated test cases for Phase 3 Step 5: HR Portal & Candidate Tracking Dashboard."""

    def setUp(self):
        # 1. Setup HR Manager (Arjun Mehta)
        self.user_hr = User.objects.create_user(
            username='arjun.hr.portal',
            email='arjun.hr.portal@novatech.io',
            password='NovaTech@2026'
        )
        self.emp_hr = Employee.objects.create(
            user=self.user_hr,
            employee_id='EMP-HR-005',
            name='Arjun Mehta',
            email='arjun.hr.portal@novatech.io',
            role='Engineering Director',
            department='Data & Technology',
            system_role=Employee.ROLE_HR_MANAGER
        )

        # 2. Setup Admin (Priya Sharma)
        self.user_admin = User.objects.create_user(
            username='priya.admin.portal',
            email='priya.admin.portal@novatech.io',
            password='NovaTech@2026',
            is_staff=True
        )
        self.emp_admin = Employee.objects.create(
            user=self.user_admin,
            employee_id='EMP-ADM-005',
            name='Priya Sharma',
            email='priya.admin.portal@novatech.io',
            role='People & Culture Lead',
            department='Human Resources',
            system_role=Employee.ROLE_ADMIN
        )

        # 3. Setup Employee 1 (Rahul Kumar)
        self.user_rahul = User.objects.create_user(
            username='rahul.emp.portal',
            email='rahul.emp.portal@novatech.io',
            password='NovaTech@2026'
        )
        self.emp_rahul = Employee.objects.create(
            user=self.user_rahul,
            employee_id='EMP-DEV-005',
            name='Rahul Kumar',
            email='rahul.emp.portal@novatech.io',
            role='Software Engineer',
            department='Data & Technology',
            system_role=Employee.ROLE_EMPLOYEE
        )

        # 4. Setup Employee 2 (Meera Nair) with uploaded document
        self.user_meera = User.objects.create_user(
            username='meera.emp.portal',
            email='meera.emp.portal@novatech.io',
            password='NovaTech@2026'
        )
        self.emp_meera = Employee.objects.create(
            user=self.user_meera,
            employee_id='EMP-DES-005',
            name='Meera Nair',
            email='meera.emp.portal@novatech.io',
            role='UX Designer',
            department='Product & Design',
            system_role=Employee.ROLE_EMPLOYEE
        )
        valid_pdf_content = b"%PDF-1.4\n%mock valid pdf content for testing\n%%EOF"
        uploaded_doc = SimpleUploadedFile(
            "meera_degree.pdf",
            valid_pdf_content,
            content_type="application/pdf"
        )
        self.meera_doc = OnboardingDocument.objects.create(
            employee=self.emp_meera,
            name="University Degree Certificate",
            document_type="Academic",
            file=uploaded_doc,
            upload_status="Uploaded",
            verification_status="Pending Verification"
        )

        # 4b. Setup Employee 3 (Kavita Rao)
        self.user_kavita = User.objects.create_user(
            username='kavita.emp.portal',
            email='kavita.emp.portal@novatech.io',
            password='NovaTech@2026'
        )
        self.emp_kavita = Employee.objects.create(
            user=self.user_kavita,
            employee_id='EMP-QA-005',
            name='Kavita Rao',
            email='kavita.emp.portal@novatech.io',
            role='QA Engineer',
            department='Data & Technology',
            system_role=Employee.ROLE_EMPLOYEE
        )

        # 5. Candidate Invitations
        raw_tok_1 = secrets.token_urlsafe(32)
        hash_1 = hashlib.sha256(raw_tok_1.encode('utf-8')).hexdigest()
        self.inv_pending = CandidateInvitation.objects.create(
            email='sanya.invite@example.com',
            full_name='Sanya Malhotra',
            employee_id='EMP-2026-9001',
            job_title='Frontend Lead',
            department='Product & Design',
            invited_by=self.user_hr,
            token_hash=hash_1,
            expires_at=timezone.now() + timezone.timedelta(hours=48),
            status=CandidateInvitation.STATUS_PENDING
        )

    def test_hr_manager_can_access_hr_dashboard(self):
        """HR Manager can access GET /api/v1/hr/dashboard/."""
        self.client.force_authenticate(user=self.user_hr)
        resp = self.client.get('/api/v1/hr/dashboard/')
        self.assertEqual(resp.status_code, 200)
        self.assertIn('totalEmployees', resp.data)
        self.assertGreaterEqual(resp.data['totalEmployees'], 4)

    def test_admin_can_access_hr_dashboard(self):
        """Admin can access GET /api/v1/hr/dashboard/."""
        self.client.force_authenticate(user=self.user_admin)
        resp = self.client.get('/api/v1/hr/dashboard/')
        self.assertEqual(resp.status_code, 200)

    def test_employee_cannot_access_hr_dashboard_403(self):
        """EMPLOYEE role is forbidden (403) from accessing HR dashboard."""
        self.client.force_authenticate(user=self.user_rahul)
        resp = self.client.get('/api/v1/hr/dashboard/')
        self.assertEqual(resp.status_code, 403)

    def test_unauthenticated_hr_dashboard_returns_401(self):
        """Unauthenticated user receives 401 Unauthorized for HR dashboard."""
        self.client.logout()
        resp = self.client.get('/api/v1/hr/dashboard/')
        self.assertEqual(resp.status_code, 401)

    def test_hr_employee_list_works(self):
        """HR Manager can query the candidate & employee list."""
        self.client.force_authenticate(user=self.user_hr)
        resp = self.client.get('/api/v1/hr/employees/')
        self.assertEqual(resp.status_code, 200)
        self.assertIn('results', resp.data)
        self.assertGreaterEqual(resp.data['count'], 4)

        # Check fields on returned items
        first_item = resp.data['results'][0]
        self.assertIn('name', first_item)
        self.assertIn('email', first_item)
        self.assertIn('employeeId', first_item)
        self.assertIn('department', first_item)
        self.assertIn('onboardingProgress', first_item)
        self.assertIn('status', first_item)

    def test_hr_search_works(self):
        """HR directory search filters results by name, email, employee_id, role, or department."""
        self.client.force_authenticate(user=self.user_hr)
        resp = self.client.get('/api/v1/hr/employees/?search=rahul')
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(len(resp.data['results']) >= 1)
        for item in resp.data['results']:
            self.assertTrue(
                'rahul' in item['name'].lower() or
                'rahul' in item['email'].lower() or
                'rahul' in item['employeeId'].lower()
            )

    def test_hr_filters_work(self):
        """HR directory filters by role, status, and department."""
        self.client.force_authenticate(user=self.user_hr)

        # Filter by role
        resp_role = self.client.get('/api/v1/hr/employees/?role=HR_MANAGER')
        self.assertEqual(resp_role.status_code, 200)
        for item in resp_role.data['results']:
            self.assertEqual(item['systemRole'], 'HR_MANAGER')

        # Filter by department
        resp_dept = self.client.get('/api/v1/hr/employees/?department=Human%20Resources')
        self.assertEqual(resp_dept.status_code, 200)
        for item in resp_dept.data['results']:
            self.assertIn('human resources', item['department'].lower())

        # Filter by status: INVITED
        resp_inv = self.client.get('/api/v1/hr/employees/?status=INVITED')
        self.assertEqual(resp_inv.status_code, 200)
        self.assertTrue(any(item['email'] == 'sanya.invite@example.com' for item in resp_inv.data['results']))

    def test_hr_employee_detail_works(self):
        """HR Manager can fetch full aggregated details for an employee."""
        self.client.force_authenticate(user=self.user_hr)
        resp = self.client.get(f'/api/v1/hr/employees/{self.emp_rahul.id}/')
        self.assertEqual(resp.status_code, 200)
        self.assertIn('identity', resp.data)
        self.assertIn('onboarding_progress', resp.data)
        self.assertIn('documents', resp.data)
        self.assertIn('training', resp.data)
        self.assertIn('offer_letter', resp.data)
        self.assertIn('policies', resp.data)
        self.assertIn('first_day', resp.data)
        self.assertIn('feedback', resp.data)
        self.assertEqual(resp.data['identity']['email'], 'rahul.emp.portal@novatech.io')

    def test_hr_dashboard_counts_calculated_from_db(self):
        """Operational dashboard counts match actual database counts."""
        self.client.force_authenticate(user=self.user_hr)
        resp = self.client.get('/api/v1/hr/dashboard/')
        self.assertEqual(resp.status_code, 200)

        db_employees = Employee.objects.count()
        db_pending_inv = CandidateInvitation.objects.filter(
            status=CandidateInvitation.STATUS_PENDING,
            expires_at__gt=timezone.now()
        ).count()
        db_pending_docs = OnboardingDocument.objects.filter(
            verification_status__in=['Pending Verification', 'Not Uploaded']
        ).count()

        self.assertEqual(resp.data['totalEmployees'], db_employees)
        self.assertEqual(resp.data['pendingInvitations'], db_pending_inv)
        self.assertEqual(resp.data['pendingDocuments'], db_pending_docs)

    def test_invitation_statuses_represented_correctly(self):
        """Pending candidate invitation appears in candidate/employee list."""
        self.client.force_authenticate(user=self.user_hr)
        resp = self.client.get('/api/v1/hr/employees/?status=INVITED')
        self.assertEqual(resp.status_code, 200)
        emails = [item['email'] for item in resp.data['results']]
        self.assertIn('sanya.invite@example.com', emails)

    def test_hr_can_access_employee_document_metadata(self):
        """HR Manager can inspect document metadata for another employee."""
        self.client.force_authenticate(user=self.user_hr)
        resp = self.client.get(f'/api/v1/hr/employees/{self.emp_meera.id}/')
        self.assertEqual(resp.status_code, 200)
        docs = resp.data['documents']
        self.assertTrue(any(d['name'] == "University Degree Certificate" for d in docs))

    def test_hr_can_download_authorized_employee_document(self):
        """HR Manager can download another employee's uploaded document."""
        self.client.force_authenticate(user=self.user_hr)
        resp = self.client.get(f'/api/v1/documents/{self.meera_doc.id}/download/')
        self.assertEqual(resp.status_code, 200)
        self.assertIn('inline', resp.get('Content-Disposition', ''))

    def test_hr_manager_can_approve_employee_document(self):
        """HR Manager can approve an uploaded document and persist remarks."""
        self.client.force_authenticate(user=self.user_hr)
        resp = self.client.patch(f'/api/v1/documents/{self.meera_doc.id}/verify/', {
            'verificationStatus': 'Verified',
            'remarks': 'Verified & approved by HR Operations.'
        })
        self.assertEqual(resp.status_code, 200)
        self.meera_doc.refresh_from_db()
        self.assertEqual(self.meera_doc.verification_status, 'Verified')
        self.assertEqual(self.meera_doc.remarks, 'Verified & approved by HR Operations.')

    def test_hr_manager_can_reject_employee_document(self):
        """HR Manager can reject an uploaded document with actionable feedback."""
        self.client.force_authenticate(user=self.user_hr)
        resp = self.client.patch(f'/api/v1/documents/{self.meera_doc.id}/verify/', {
            'verificationStatus': 'Rejected',
            'remarks': 'Document scan was blurry. Please re-upload a clear copy.'
        })
        self.assertEqual(resp.status_code, 200)
        self.meera_doc.refresh_from_db()
        self.assertEqual(self.meera_doc.verification_status, 'Rejected')
        self.assertEqual(self.meera_doc.remarks, 'Document scan was blurry. Please re-upload a clear copy.')

    def test_regular_employee_cannot_verify_documents_403(self):
        """Regular employee cannot verify or approve their own or others' documents."""
        self.client.force_authenticate(user=self.user_rahul)
        resp = self.client.patch(f'/api/v1/documents/{self.meera_doc.id}/verify/', {
            'verificationStatus': 'Verified',
            'remarks': 'Self approval attempt.'
        })
        self.assertEqual(resp.status_code, 403)

    def test_verify_document_rejects_invalid_status_400(self):
        """Document verification endpoint rejects unsupported status values with HTTP 400."""
        self.client.force_authenticate(user=self.user_hr)
        resp = self.client.patch(f'/api/v1/documents/{self.meera_doc.id}/verify/', {
            'verificationStatus': 'InvalidCustomStatus',
            'remarks': 'Testing invalid.'
        })
        self.assertEqual(resp.status_code, 400)

    def test_employee_cannot_use_hr_detail_endpoint_to_access_another_employee(self):
        """Regular employee cannot use HR endpoints or access another employee's detail."""
        self.client.force_authenticate(user=self.user_rahul)

        # Rahul tries to access Meera via HR detail endpoint -> 403 Forbidden
        resp_detail = self.client.get(f'/api/v1/hr/employees/{self.emp_meera.id}/')
        self.assertEqual(resp_detail.status_code, 403)

        # Rahul tries to access HR employee directory -> 403 Forbidden
        resp_list = self.client.get('/api/v1/hr/employees/')
        self.assertEqual(resp_list.status_code, 403)

        # Rahul tries to download Meera's document via documents endpoint -> 404 or 403
        resp_doc = self.client.get(f'/api/v1/documents/{self.meera_doc.id}/download/')
        self.assertIn(resp_doc.status_code, [403, 404])

    def test_no_sensitive_authentication_fields_appear_in_hr_responses(self):
        """HR API responses never expose passwords, hashes, JWT tokens, or token hashes."""
        self.client.force_authenticate(user=self.user_hr)

        # 1. Dashboard
        resp_dash = self.client.get('/api/v1/hr/dashboard/')
        dash_str = str(resp_dash.data).lower()
        self.assertNotIn('password', dash_str)
        self.assertNotIn('token_hash', dash_str)

        # 2. Employee list
        resp_list = self.client.get('/api/v1/hr/employees/')
        list_str = str(resp_list.data).lower()
        self.assertNotIn('password', list_str)
        self.assertNotIn('token_hash', list_str)

        # 3. Employee detail
        resp_detail = self.client.get(f'/api/v1/hr/employees/{self.emp_meera.id}/')
        detail_str = str(resp_detail.data).lower()
        self.assertNotIn('password', detail_str)
        self.assertNotIn('token_hash', detail_str)

    def test_hr_and_admin_do_not_appear_in_candidate_employee_list(self):
        """HR Manager and Admin accounts never appear in the candidate & employee directory or dashboard recent employees."""
        self.client.force_authenticate(user=self.user_hr)

        # 1. Directory list should only contain EMPLOYEE accounts
        resp_list = self.client.get('/api/v1/hr/employees/')
        self.assertEqual(resp_list.status_code, 200)
        emails = [item['email'] for item in resp_list.data['results']]
        roles = [item['systemRole'] for item in resp_list.data['results']]

        self.assertNotIn('arjun.hr.portal@novatech.io', emails)
        self.assertNotIn('priya.admin.portal@novatech.io', emails)
        for role in roles:
            self.assertEqual(role, Employee.ROLE_EMPLOYEE)

        # 2. Dashboard recent onboarding activity should exclude staff
        resp_dash = self.client.get('/api/v1/hr/dashboard/')
        self.assertEqual(resp_dash.status_code, 200)
        recent_emails = [item['email'] for item in resp_dash.data['recentEmployees']]
        self.assertNotIn('arjun.hr.portal@novatech.io', recent_emails)
        self.assertNotIn('priya.admin.portal@novatech.io', recent_emails)

    def test_view_progress_detail_for_employee_and_missing_id(self):
        """HR Manager can inspect real employee progress, and invalid IDs return 404."""
        self.client.force_authenticate(user=self.user_hr)

        # Real employee progress view
        resp_valid = self.client.get(f'/api/v1/hr/employees/{self.emp_rahul.id}/')
        self.assertEqual(resp_valid.status_code, 200)
        self.assertEqual(resp_valid.data['identity']['email'], 'rahul.emp.portal@novatech.io')
        self.assertIn('onboarding_progress', resp_valid.data)

        # Missing / invalid ID returns 404
        resp_invalid = self.client.get('/api/v1/hr/employees/999999/')
        self.assertEqual(resp_invalid.status_code, 404)

        resp_nonexistent = self.client.get('/api/v1/hr/employees/non-existent-emp/')
        self.assertEqual(resp_nonexistent.status_code, 404)


class HRAnalyticsTestCase(APITestCase):
    """
    Automated backend tests for Phase 3 Step 6A: HR Analytics & Reporting.
    Covers:
    1. HR analytics endpoint requires authentication.
    2. EMPLOYEE receives 403.
    3. HR_MANAGER receives 200.
    4. ADMIN receives 200.
    5. Response contains expected top-level sections.
    6. Employee counts are calculated from database records.
    7. Candidate invitation counts are calculated from real invitation records.
    8. Document statistics are calculated from real document records.
    9. Training statistics are calculated from real training records.
    10. Policy statistics are calculated from real acknowledgement records.
    11. Feedback analytics handle empty feedback safely and compute metrics.
    12. Monthly onboarding data contains no fake records.
    13. Sensitive authentication fields are not present.
    """

    def setUp(self):
        super().setUp()

        # 1. Users & Roles
        self.user_employee = User.objects.create_user(
            username='analytics.emp',
            email='analytics.emp@novatech.io',
            password='Password@123'
        )
        self.emp_user = Employee.objects.create(
            user=self.user_employee,
            name='Test Employee',
            email='analytics.emp@novatech.io',
            employee_id='EMP-AN-001',
            system_role=Employee.ROLE_EMPLOYEE,
            department='Engineering'
        )

        self.user_hr = User.objects.create_user(
            username='analytics.hr',
            email='analytics.hr@novatech.io',
            password='Password@123'
        )
        self.emp_hr = Employee.objects.create(
            user=self.user_hr,
            name='Test HR',
            email='analytics.hr@novatech.io',
            employee_id='EMP-AN-002',
            system_role=Employee.ROLE_HR_MANAGER,
            department='People & Culture'
        )

        self.user_admin = User.objects.create_user(
            username='analytics.admin',
            email='analytics.admin@novatech.io',
            password='Password@123'
        )
        self.emp_admin = Employee.objects.create(
            user=self.user_admin,
            name='Test Admin',
            email='analytics.admin@novatech.io',
            employee_id='EMP-AN-003',
            system_role=Employee.ROLE_ADMIN,
            department='Executive'
        )

        # 2. Onboarding Stages
        from .views import ensure_default_stages
        ensure_default_stages()
        self.stages = list(OnboardingStage.objects.order_by('stage_number'))

        # Mark all 10 stages completed for emp_admin (Completed Onboarding)
        for stg in self.stages:
            EmployeeStageProgress.objects.create(
                employee=self.emp_admin,
                stage=stg,
                is_completed=True,
                status='completed'
            )

        # Mark 5 stages completed for emp_user (In Progress Onboarding)
        for i, stg in enumerate(self.stages):
            EmployeeStageProgress.objects.create(
                employee=self.emp_user,
                stage=stg,
                is_completed=(i < 5),
                status='completed' if i < 5 else 'pending'
            )

        # 3. Documents
        OnboardingDocument.objects.create(
            employee=self.emp_user,
            name="PAN Card",
            document_type="Identification",
            verification_status="Verified",
            upload_status="Uploaded"
        )
        OnboardingDocument.objects.create(
            employee=self.emp_user,
            name="Aadhaar Card",
            document_type="Identification",
            verification_status="Pending Verification",
            upload_status="Uploaded"
        )
        OnboardingDocument.objects.create(
            employee=self.emp_user,
            name="Degree Certificate",
            document_type="Academic",
            verification_status="Rejected",
            upload_status="Uploaded"
        )
        OnboardingDocument.objects.create(
            employee=self.emp_user,
            name="Relieving Letter",
            document_type="Employment",
            verification_status="Not Uploaded",
            upload_status="Not Uploaded"
        )

        # 4. Training
        self.module_1 = TrainingModule.objects.create(
            module_id="mod_an_1",
            title="Security Architecture",
            description="Security standards",
            duration="45 mins",
            category="Security"
        )
        self.module_2 = TrainingModule.objects.create(
            module_id="mod_an_2",
            title="Engineering Standards",
            description="Engineering standards",
            duration="30 mins",
            category="Engineering"
        )
        EmployeeTrainingProgress.objects.create(
            employee=self.emp_user,
            module=self.module_1,
            progress=100,
            status="Completed"
        )
        EmployeeTrainingProgress.objects.create(
            employee=self.emp_user,
            module=self.module_2,
            progress=50,
            status="In Progress"
        )

        # 5. Policies
        self.policy_1 = CompanyPolicy.objects.create(
            policy_id="pol_an_1",
            title="Code of Conduct",
            category="Governance",
            summary="Code of conduct policy"
        )
        self.policy_2 = CompanyPolicy.objects.create(
            policy_id="pol_an_2",
            title="Data Protection Policy",
            category="Security",
            summary="Data protection policy"
        )
        PolicyAcknowledgement.objects.create(
            employee=self.emp_user,
            policy=self.policy_1,
            acknowledged=True
        )
        PolicyAcknowledgement.objects.create(
            employee=self.emp_user,
            policy=self.policy_2,
            acknowledged=False
        )

        # 6. Candidate Invitations
        raw_tok_1 = secrets.token_urlsafe(32)
        hash_1 = hashlib.sha256(raw_tok_1.encode('utf-8')).hexdigest()
        CandidateInvitation.objects.create(
            email='invite1@example.com',
            full_name='Candidate One',
            token_hash=hash_1,
            expires_at=timezone.now() + timezone.timedelta(hours=48),
            status=CandidateInvitation.STATUS_PENDING
        )
        raw_tok_2 = secrets.token_urlsafe(32)
        hash_2 = hashlib.sha256(raw_tok_2.encode('utf-8')).hexdigest()
        CandidateInvitation.objects.create(
            email='invite2@example.com',
            full_name='Candidate Two',
            token_hash=hash_2,
            expires_at=timezone.now() + timezone.timedelta(hours=48),
            status=CandidateInvitation.STATUS_ACCEPTED
        )

    def test_hr_analytics_endpoint_requires_authentication(self):
        """Unauthenticated GET /api/v1/hr/analytics/ returns 401 Unauthorized."""
        self.client.logout()
        resp = self.client.get('/api/v1/hr/analytics/')
        self.assertEqual(resp.status_code, 401)

    def test_employee_cannot_access_hr_analytics_403(self):
        """EMPLOYEE role receives 403 Forbidden on HR analytics."""
        self.client.force_authenticate(user=self.user_employee)
        resp = self.client.get('/api/v1/hr/analytics/')
        self.assertEqual(resp.status_code, 403)

    def test_hr_manager_can_access_hr_analytics_200(self):
        """HR_MANAGER receives 200 OK on HR analytics."""
        self.client.force_authenticate(user=self.user_hr)
        resp = self.client.get('/api/v1/hr/analytics/')
        self.assertEqual(resp.status_code, 200)

    def test_admin_can_access_hr_analytics_200(self):
        """ADMIN receives 200 OK on HR analytics."""
        self.client.force_authenticate(user=self.user_admin)
        resp = self.client.get('/api/v1/hr/analytics/')
        self.assertEqual(resp.status_code, 200)

    def test_response_contains_expected_top_level_sections(self):
        """Response structure contains all specified sections."""
        self.client.force_authenticate(user=self.user_hr)
        resp = self.client.get('/api/v1/hr/analytics/')
        self.assertEqual(resp.status_code, 200)
        expected_sections = [
            'overview', 'onboarding', 'documents', 'training',
            'policies', 'firstDay', 'feedback', 'candidates',
            'monthlyOnboarding', 'stageDistribution'
        ]
        for sec in expected_sections:
            self.assertIn(sec, resp.data, f"Missing expected section: {sec}")

    def test_employee_counts_are_calculated_from_database(self):
        """Overview employee counts reflect actual database counts."""
        self.client.force_authenticate(user=self.user_hr)
        resp = self.client.get('/api/v1/hr/analytics/')
        self.assertEqual(resp.status_code, 200)
        ov = resp.data['overview']
        self.assertEqual(ov['totalEmployees'], Employee.objects.count())
        self.assertEqual(ov['completedOnboarding'], 1)
        self.assertEqual(ov['onboardingInProgress'], Employee.objects.count() - 1)

    def test_candidate_invitation_counts_calculated_from_db(self):
        """Candidate pipeline metrics reflect real invitation database counts."""
        self.client.force_authenticate(user=self.user_hr)
        resp = self.client.get('/api/v1/hr/analytics/')
        self.assertEqual(resp.status_code, 200)
        cd = resp.data['candidates']
        self.assertEqual(cd['totalInvitations'], 2)
        self.assertEqual(cd['pendingInvitations'], 1)
        self.assertEqual(cd['acceptedInvitations'], 1)

    def test_document_statistics_calculated_from_db(self):
        """Document counts accurately reflect real OnboardingDocument records."""
        self.client.force_authenticate(user=self.user_hr)
        resp = self.client.get('/api/v1/hr/analytics/')
        self.assertEqual(resp.status_code, 200)
        docs = resp.data['documents']
        self.assertEqual(docs['totalDocuments'], 4)
        self.assertEqual(docs['verifiedDocuments'], 1)
        self.assertEqual(docs['pendingDocuments'], 1)
        self.assertEqual(docs['rejectedDocuments'], 1)
        self.assertEqual(docs['notUploadedDocuments'], 1)
        self.assertEqual(docs['uploadedDocuments'], 3)

    def test_training_statistics_calculated_from_db(self):
        """Training metrics reflect real EmployeeTrainingProgress records."""
        self.client.force_authenticate(user=self.user_hr)
        resp = self.client.get('/api/v1/hr/analytics/')
        self.assertEqual(resp.status_code, 200)
        tr = resp.data['training']
        self.assertEqual(tr['totalAssigned'], 2)
        self.assertEqual(tr['completed'], 1)
        self.assertEqual(tr['inProgress'], 1)
        self.assertEqual(tr['averageCompletion'], 75.0)

    def test_policy_statistics_calculated_from_db(self):
        """Policy metrics reflect real PolicyAcknowledgement records."""
        self.client.force_authenticate(user=self.user_hr)
        resp = self.client.get('/api/v1/hr/analytics/')
        self.assertEqual(resp.status_code, 200)
        pol = resp.data['policies']
        self.assertEqual(pol['totalPolicies'], 2)
        self.assertEqual(pol['acknowledged'], 1)
        self.assertEqual(pol['pending'], 1)

    def test_feedback_analytics_handle_empty_and_submitted_safely(self):
        """Feedback section handles 0 submissions gracefully, then calculates averages when present."""
        self.client.force_authenticate(user=self.user_hr)

        # 1. When 0 feedbacks exist
        resp = self.client.get('/api/v1/hr/analytics/')
        fb = resp.data['feedback']
        self.assertEqual(fb['totalSubmissions'], 0)
        self.assertEqual(fb['averageNps'], 0.0)
        self.assertEqual(fb['averageRating'], 0.0)

        # 2. Add submitted feedback
        OnboardingFeedback.objects.create(
            employee=self.emp_user,
            rating_journey=5,
            rating_documentation=5,
            rating_support=4,
            rating_training=4,
            nps_score=10,
            is_submitted=True
        )
        resp2 = self.client.get('/api/v1/hr/analytics/')
        fb2 = resp2.data['feedback']
        self.assertEqual(fb2['totalSubmissions'], 1)
        self.assertEqual(fb2['averageNps'], 10.0)
        self.assertEqual(fb2['averageRating'], 4.5)

    def test_monthly_onboarding_data_contains_no_fake_records(self):
        """Monthly onboarding numbers correspond strictly to database records."""
        self.client.force_authenticate(user=self.user_hr)
        resp = self.client.get('/api/v1/hr/analytics/')
        self.assertEqual(resp.status_code, 200)
        monthly = resp.data['monthlyOnboarding']
        self.assertIsInstance(monthly, list)
        self.assertGreaterEqual(len(monthly), 1)
        total_in_months = sum(m['joined'] for m in monthly)
        self.assertGreaterEqual(total_in_months, 3)

    def test_sensitive_authentication_fields_not_present(self):
        """No password hashes, JWTs, or invitation token hashes are present in the response."""
        self.client.force_authenticate(user=self.user_hr)
        resp = self.client.get('/api/v1/hr/analytics/')
        self.assertEqual(resp.status_code, 200)
        resp_str = str(resp.data).lower()
        self.assertNotIn('password', resp_str)
        self.assertNotIn('token_hash', resp_str)
        self.assertNotIn('jwt', resp_str)
        self.assertNotIn('refresh', resp_str)


class NotificationTestCase(APITestCase):
    """
    Automated backend tests for Phase 3 Step 6B: Real In-App Notifications.
    Covers:
    1. Unauthenticated notification list -> 401.
    2. Authenticated user can list own notifications.
    3. User cannot see another user's notifications.
    4. User can mark own notification as read.
    5. User cannot mark another user's notification as read.
    6. Mark all read affects only current user.
    7. Unread count is correct.
    8. Pagination works.
    9. Unread filter works.
    10. Document upload creates expected notification.
    11. Document verification creates employee notification.
    12. Document rejection creates employee notification.
    13. Training notification does not duplicate.
    14. Policy notification does not duplicate.
    15. Offer letter notification works.
    16. First-day notification works.
    17. Feedback notification works.
    18. Candidate invitation does not expose invitation token.
    19. GET endpoints never create notifications.
    20. Sensitive fields are not exposed.
    """

    def setUp(self):
        super().setUp()
        # 1. Employees & Users
        self.user_emp1 = User.objects.create_user(
            username='notif.emp1',
            email='notif.emp1@novatech.io',
            password='Password@123'
        )
        self.emp1 = Employee.objects.create(
            user=self.user_emp1,
            employee_id='EMP-NT-001',
            name='Aarav Mehta',
            email='notif.emp1@novatech.io',
            system_role=Employee.ROLE_EMPLOYEE,
            department='Engineering'
        )

        self.user_emp2 = User.objects.create_user(
            username='notif.emp2',
            email='notif.emp2@novatech.io',
            password='Password@123'
        )
        self.emp2 = Employee.objects.create(
            user=self.user_emp2,
            employee_id='EMP-NT-002',
            name='Kavita Sen',
            email='notif.emp2@novatech.io',
            system_role=Employee.ROLE_EMPLOYEE,
            department='Product'
        )

        self.user_hr = User.objects.create_user(
            username='notif.hr',
            email='notif.hr@novatech.io',
            password='Password@123'
        )
        self.emp_hr = Employee.objects.create(
            user=self.user_hr,
            employee_id='EMP-NT-003',
            name='Arjun HR',
            email='notif.hr@novatech.io',
            system_role=Employee.ROLE_HR_MANAGER,
            department='People & Culture'
        )

        self.user_admin = User.objects.create_user(
            username='notif.admin',
            email='notif.admin@novatech.io',
            password='Password@123'
        )
        self.emp_admin = Employee.objects.create(
            user=self.user_admin,
            employee_id='EMP-NT-004',
            name='Priya Admin',
            email='notif.admin@novatech.io',
            system_role=Employee.ROLE_ADMIN,
            department='Executive'
        )

        # 2. Seed notifications
        self.notif_emp1_1 = Notification.objects.create(
            recipient=self.user_emp1,
            notification_type=Notification.TYPE_DOCUMENT_VERIFIED,
            title='Identity Verified',
            message='Your PAN card has been verified.',
            action_url='/documents',
            is_read=False
        )
        self.notif_emp1_2 = Notification.objects.create(
            recipient=self.user_emp1,
            notification_type=Notification.TYPE_TRAINING_ASSIGNED,
            title='Training Assigned',
            message='Security Architecture module assigned.',
            action_url='/training',
            is_read=True
        )
        self.notif_emp2_1 = Notification.objects.create(
            recipient=self.user_emp2,
            notification_type=Notification.TYPE_POLICY_PENDING,
            title='Policy Acknowledgment Required',
            message='Please review the Code of Conduct.',
            action_url='/policies',
            is_read=False
        )

    def test_unauthenticated_notification_list_returns_401(self):
        """Unauthenticated user cannot access notifications list."""
        self.client.logout()
        resp = self.client.get('/api/v1/notifications/')
        self.assertEqual(resp.status_code, 401)

    def test_authenticated_user_can_list_own_notifications(self):
        """Authenticated user can list only their own notifications."""
        self.client.force_authenticate(user=self.user_emp1)
        resp = self.client.get('/api/v1/notifications/')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data['count'], 2)
        results = resp.data['results']
        titles = [r['title'] for r in results]
        self.assertIn('Identity Verified', titles)
        self.assertIn('Training Assigned', titles)

    def test_user_cannot_see_another_users_notifications(self):
        """User emp1 cannot see user emp2's notifications."""
        self.client.force_authenticate(user=self.user_emp1)
        resp = self.client.get('/api/v1/notifications/')
        self.assertEqual(resp.status_code, 200)
        titles = [r['title'] for r in resp.data['results']]
        self.assertNotIn('Policy Acknowledgment Required', titles)

    def test_user_can_mark_own_notification_as_read(self):
        """User can mark their own notification as read."""
        self.client.force_authenticate(user=self.user_emp1)
        resp = self.client.patch(f'/api/v1/notifications/{self.notif_emp1_1.id}/read/')
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(resp.data['isRead'])
        self.notif_emp1_1.refresh_from_db()
        self.assertTrue(self.notif_emp1_1.is_read)
        self.assertIsNotNone(self.notif_emp1_1.read_at)

    def test_user_cannot_mark_another_users_notification_as_read(self):
        """User emp1 cannot mark user emp2's notification as read (returns 404)."""
        self.client.force_authenticate(user=self.user_emp1)
        resp = self.client.patch(f'/api/v1/notifications/{self.notif_emp2_1.id}/read/')
        self.assertEqual(resp.status_code, 404)
        self.notif_emp2_1.refresh_from_db()
        self.assertFalse(self.notif_emp2_1.is_read)

    def test_mark_all_read_affects_only_current_user(self):
        """PATCH /api/v1/notifications/read-all/ marks only current user's unread notifications."""
        self.client.force_authenticate(user=self.user_emp1)
        resp = self.client.patch('/api/v1/notifications/read-all/')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data['updated'], 1)  # Only notif_emp1_1 was unread

        # notif_emp1_1 is now read
        self.notif_emp1_1.refresh_from_db()
        self.assertTrue(self.notif_emp1_1.is_read)

        # notif_emp2_1 is still unread
        self.notif_emp2_1.refresh_from_db()
        self.assertFalse(self.notif_emp2_1.is_read)

    def test_unread_count_is_correct(self):
        """GET /api/v1/notifications/unread-count/ returns accurate unread count."""
        self.client.force_authenticate(user=self.user_emp1)
        resp = self.client.get('/api/v1/notifications/unread-count/')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data['count'], 1)

    def test_pagination_works(self):
        """Pagination returns correct page size and total pages."""
        # Create 5 additional notifications for emp1
        for i in range(5):
            Notification.objects.create(
                recipient=self.user_emp1,
                title=f'Extra Notif {i}',
                message=f'Msg {i}'
            )
        self.client.force_authenticate(user=self.user_emp1)
        resp = self.client.get('/api/v1/notifications/?page=1&page_size=2')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data['pageSize'], 2)
        self.assertEqual(len(resp.data['results']), 2)
        self.assertEqual(resp.data['count'], 7)
        self.assertEqual(resp.data['totalPages'], 4)

    def test_unread_filter_works(self):
        """Querying ?unread=true returns only unread notifications."""
        self.client.force_authenticate(user=self.user_emp1)
        resp = self.client.get('/api/v1/notifications/?unread=true')
        self.assertEqual(resp.status_code, 200)
        for notif in resp.data['results']:
            self.assertFalse(notif['isRead'])

    def test_document_upload_creates_expected_notification(self):
        """When an employee uploads a document, HR/Admin receive a notification."""
        self.client.force_authenticate(user=self.user_emp1)
        pdf_content = b"%PDF-1.4\n%test upload content\n%%EOF"
        upload_file = SimpleUploadedFile("passport.pdf", pdf_content, content_type="application/pdf")

        resp = self.client.post('/api/v1/documents/', {
            'name': 'Passport Document',
            'type': 'Identification',
            'file': upload_file
        }, format='multipart')
        self.assertEqual(resp.status_code, 201)

        # HR and Admin should have received a notification
        hr_notif = Notification.objects.filter(
            recipient=self.user_hr,
            notification_type=Notification.TYPE_DOCUMENT_UPLOADED
        ).first()
        self.assertIsNotNone(hr_notif)
        self.assertIn('Passport Document', hr_notif.message)
        self.assertIn('Aarav Mehta', hr_notif.message)

    def test_document_verification_creates_employee_notification(self):
        """When HR verifies a document, the employee receives a notification."""
        doc = OnboardingDocument.objects.create(
            employee=self.emp1,
            name='Offer Acceptance Copy',
            document_type='Legal',
            upload_status='Uploaded',
            verification_status='Pending Verification'
        )
        self.client.force_authenticate(user=self.user_hr)
        resp = self.client.patch(f'/api/v1/documents/{doc.id}/verify/', {
            'verificationStatus': 'Verified',
            'remarks': 'Approved by HR Lead.'
        })
        self.assertEqual(resp.status_code, 200)

        emp_notif = Notification.objects.filter(
            recipient=self.user_emp1,
            notification_type=Notification.TYPE_DOCUMENT_VERIFIED,
            related_object_id=str(doc.id)
        ).first()
        self.assertIsNotNone(emp_notif)
        self.assertEqual(emp_notif.title, "Document verified")
        self.assertIn("verified", emp_notif.message)

    def test_document_rejection_creates_employee_notification(self):
        """When HR rejects a document, the employee receives an attention notification."""
        doc = OnboardingDocument.objects.create(
            employee=self.emp1,
            name='Utility Bill',
            document_type='Identification',
            upload_status='Uploaded',
            verification_status='Pending Verification'
        )
        self.client.force_authenticate(user=self.user_hr)
        resp = self.client.patch(f'/api/v1/documents/{doc.id}/verify/', {
            'verificationStatus': 'Rejected',
            'remarks': 'Document blurry.'
        })
        self.assertEqual(resp.status_code, 200)

        emp_notif = Notification.objects.filter(
            recipient=self.user_emp1,
            notification_type=Notification.TYPE_DOCUMENT_REJECTED,
            related_object_id=str(doc.id)
        ).first()
        self.assertIsNotNone(emp_notif)
        self.assertEqual(emp_notif.title, "Document needs attention")

    def test_training_notification_does_not_duplicate(self):
        """Completing a training module multiple times does not produce duplicate unread notifications."""
        module = TrainingModule.objects.create(
            module_id='mod_test_notif',
            title='Secure Coding Practices',
            description='Test training',
            duration='30m',
            category='Tech'
        )
        self.client.force_authenticate(user=self.user_emp1)

        # 1. Complete training
        resp1 = self.client.post(f'/api/v1/training/{module.module_id}/progress/', {'progress': 100})
        self.assertEqual(resp1.status_code, 200)
        count_after_first = Notification.objects.filter(
            recipient=self.user_hr,
            notification_type=Notification.TYPE_TRAINING_COMPLETED,
            related_object_id=str(module.id)
        ).count()
        self.assertEqual(count_after_first, 1)

        # 2. Call again with 100% -> should not duplicate unread notification
        resp2 = self.client.post(f'/api/v1/training/{module.module_id}/progress/', {'progress': 100})
        self.assertEqual(resp2.status_code, 200)
        count_after_second = Notification.objects.filter(
            recipient=self.user_hr,
            notification_type=Notification.TYPE_TRAINING_COMPLETED,
            related_object_id=str(module.id)
        ).count()
        self.assertEqual(count_after_second, 1)

    def test_policy_notification_does_not_duplicate(self):
        """Acknowledging a policy multiple times does not produce duplicate unread notifications."""
        policy = CompanyPolicy.objects.create(
            policy_id='pol_test_notif',
            title='Remote Work Standards',
            category='HR',
            summary='Guidelines for remote workers'
        )
        self.client.force_authenticate(user=self.user_emp1)

        # 1. Acknowledge
        resp1 = self.client.post(f'/api/v1/policies/{policy.policy_id}/acknowledge/')
        self.assertEqual(resp1.status_code, 200)
        count_after_first = Notification.objects.filter(
            recipient=self.user_hr,
            notification_type=Notification.TYPE_POLICY_ACKNOWLEDGED,
            related_object_id=str(policy.id)
        ).count()
        self.assertEqual(count_after_first, 1)

        # 2. Re-acknowledge -> no duplicate
        resp2 = self.client.post(f'/api/v1/policies/{policy.policy_id}/acknowledge/')
        self.assertEqual(resp2.status_code, 200)
        count_after_second = Notification.objects.filter(
            recipient=self.user_hr,
            notification_type=Notification.TYPE_POLICY_ACKNOWLEDGED,
            related_object_id=str(policy.id)
        ).count()
        self.assertEqual(count_after_second, 1)

    def test_offer_letter_notification_works(self):
        """Accepting an offer letter creates notification for HR."""
        self.client.force_authenticate(user=self.user_emp1)
        resp = self.client.post('/api/v1/offer-letter/accept/', {
            'signature': 'Aarav Mehta'
        })
        self.assertEqual(resp.status_code, 200)

        notif = Notification.objects.filter(
            recipient=self.user_hr,
            notification_type=Notification.TYPE_OFFER_LETTER
        ).first()
        self.assertIsNotNone(notif)
        self.assertIn('Aarav Mehta', notif.message)
        self.assertEqual(notif.title, "Offer letter accepted")

    def test_first_day_notification_works(self):
        """Confirming first-day plan creates notification for HR."""
        self.client.force_authenticate(user=self.user_emp1)
        resp = self.client.post('/api/v1/first-day/confirm/')
        self.assertEqual(resp.status_code, 200)

        notif = Notification.objects.filter(
            recipient=self.user_hr,
            notification_type=Notification.TYPE_FIRST_DAY_CONFIRMED
        ).first()
        self.assertIsNotNone(notif)
        self.assertIn('Aarav Mehta', notif.message)
        self.assertEqual(notif.title, "First-day schedule confirmed")

    def test_feedback_notification_works(self):
        """Submitting onboarding feedback creates notification for HR."""
        self.client.force_authenticate(user=self.user_emp1)
        resp = self.client.post('/api/v1/feedback/', {
            'ratings': {'journey': 5, 'documentation': 5, 'support': 5, 'training': 5},
            'npsScore': 10,
            'comments': 'Great platform!'
        }, format='json')
        self.assertEqual(resp.status_code, 201)

        notif = Notification.objects.filter(
            recipient=self.user_hr,
            notification_type=Notification.TYPE_FEEDBACK_REQUEST
        ).first()
        self.assertIsNotNone(notif)
        self.assertIn('Aarav Mehta', notif.message)
        self.assertIn('10/10', notif.message)

    def test_candidate_invitation_does_not_expose_token(self):
        """Candidate invitation notification never contains raw tokens or token hashes."""
        self.client.force_authenticate(user=self.user_hr)
        resp = self.client.post('/api/v1/invitations/', {
            'email': 'new.candidate@example.com',
            'full_name': 'New Candidate',
            'job_title': 'Backend Developer',
            'department': 'Engineering'
        })
        self.assertEqual(resp.status_code, 201)
        raw_token = resp.data.get('raw_token')

        # Check all notifications
        for notif in Notification.objects.filter(notification_type=Notification.TYPE_CANDIDATE_INVITATION):
            self.assertNotIn(raw_token, notif.message)
            self.assertNotIn(raw_token, notif.title)
            self.assertNotIn('token_hash', notif.message.lower())

    def test_get_endpoints_never_create_notifications(self):
        """GET endpoints must be strictly idempotent and never create notifications."""
        self.client.force_authenticate(user=self.user_emp1)
        initial_count = Notification.objects.count()

        # Call various GET endpoints
        self.client.get('/api/v1/notifications/')
        self.client.get('/api/v1/notifications/unread-count/')
        self.client.get('/api/v1/documents/')
        self.client.get('/api/v1/training/')
        self.client.get('/api/v1/policies/')
        self.client.get('/api/v1/first-day/')

        self.assertEqual(Notification.objects.count(), initial_count)

    def test_sensitive_fields_not_exposed_in_notifications(self):
        """Notification payload contains no passwords, token hashes, or JWTs."""
        self.client.force_authenticate(user=self.user_emp1)
        resp = self.client.get('/api/v1/notifications/')
        self.assertEqual(resp.status_code, 200)
        resp_str = str(resp.data).lower()
        self.assertNotIn('password', resp_str)
        self.assertNotIn('token_hash', resp_str)
        self.assertNotIn('jwt', resp_str)
        self.assertNotIn('refresh', resp_str)


class AdminPortalTestCase(APITestCase):
    """
    Automated test cases for Phase 3 Step 6C: Admin Portal & System Administration.
    Tests authentication, RBAC authorization, live dashboard calculations,
    user/role management, last-admin guardrails, account activation/deactivation,
    safe configuration, audit logs, and credential isolation.
    """

    def setUp(self):
        # 1. Primary Admin User
        self.user_admin = User.objects.create_user(
            username='admin.alpha',
            email='admin.alpha@novatech.io',
            password='NovaTech@2026',
            first_name='Alpha',
            last_name='Admin',
            is_staff=True
        )
        self.emp_admin = Employee.objects.create(
            user=self.user_admin,
            employee_id='EMP-ADM-0001',
            name='Alpha Admin',
            email='admin.alpha@novatech.io',
            role='Director of Systems',
            designation='Director of Systems',
            department='Platform Engineering',
            system_role=Employee.ROLE_ADMIN
        )

        # 2. Secondary Admin User (needed for safe demotion testing)
        self.user_admin2 = User.objects.create_user(
            username='admin.beta',
            email='admin.beta@novatech.io',
            password='NovaTech@2026',
            first_name='Beta',
            last_name='Admin',
            is_staff=True
        )
        self.emp_admin2 = Employee.objects.create(
            user=self.user_admin2,
            employee_id='EMP-ADM-0002',
            name='Beta Admin',
            email='admin.beta@novatech.io',
            role='Infrastructure Lead',
            designation='Infrastructure Lead',
            department='Platform Engineering',
            system_role=Employee.ROLE_ADMIN
        )

        # 3. HR Manager User
        self.user_hr = User.objects.create_user(
            username='hr.charlie',
            email='hr.charlie@novatech.io',
            password='NovaTech@2026',
            first_name='Charlie',
            last_name='HR'
        )
        self.emp_hr = Employee.objects.create(
            user=self.user_hr,
            employee_id='EMP-HR-0001',
            name='Charlie HR',
            email='hr.charlie@novatech.io',
            role='People Lead',
            designation='People Lead',
            department='People & Culture',
            system_role=Employee.ROLE_HR_MANAGER
        )

        # 4. Standard Employee User
        self.user_emp = User.objects.create_user(
            username='emp.delta',
            email='emp.delta@novatech.io',
            password='NovaTech@2026',
            first_name='Delta',
            last_name='Employee'
        )
        self.emp_delta = Employee.objects.create(
            user=self.user_emp,
            employee_id='EMP-DEV-0001',
            name='Delta Employee',
            email='emp.delta@novatech.io',
            role='Frontend Engineer',
            designation='Frontend Engineer',
            department='Engineering',
            system_role=Employee.ROLE_EMPLOYEE
        )

        # Ensure default stages are populated
        from .views import ensure_default_stages
        ensure_default_stages()

    def test_admin_endpoints_unauthenticated_return_401(self):
        """Unauthenticated requests to admin endpoints must return 401."""
        endpoints = [
            '/api/v1/admin/dashboard/',
            '/api/v1/admin/users/',
            f'/api/v1/admin/users/{self.user_emp.id}/',
            '/api/v1/admin/audit-logs/',
            '/api/v1/admin/configuration/',
        ]
        for url in endpoints:
            resp = self.client.get(url)
            self.assertEqual(resp.status_code, 401, f"Expected 401 for unauthenticated GET {url}, got {resp.status_code}")

        # Test PATCH without auth
        patch_resp = self.client.patch(f'/api/v1/admin/users/{self.user_emp.id}/role/', {'system_role': 'HR_MANAGER'})
        self.assertEqual(patch_resp.status_code, 401)

    def test_admin_endpoints_employee_forbidden_403(self):
        """EMPLOYEE role must receive 403 on all admin endpoints."""
        self.client.force_authenticate(user=self.user_emp)
        endpoints = [
            '/api/v1/admin/dashboard/',
            '/api/v1/admin/users/',
            f'/api/v1/admin/users/{self.user_emp.id}/',
            '/api/v1/admin/audit-logs/',
            '/api/v1/admin/configuration/',
        ]
        for url in endpoints:
            resp = self.client.get(url)
            self.assertEqual(resp.status_code, 403, f"Expected 403 for EMPLOYEE on {url}, got {resp.status_code}")

        patch_role = self.client.patch(f'/api/v1/admin/users/{self.user_emp.id}/role/', {'system_role': 'ADMIN'})
        self.assertEqual(patch_role.status_code, 403)

        patch_status = self.client.patch(f'/api/v1/admin/users/{self.user_emp.id}/status/', {'is_active': False})
        self.assertEqual(patch_status.status_code, 403)

    def test_admin_endpoints_hr_manager_forbidden_403(self):
        """HR_MANAGER role must receive 403 on all admin endpoints."""
        self.client.force_authenticate(user=self.user_hr)
        endpoints = [
            '/api/v1/admin/dashboard/',
            '/api/v1/admin/users/',
            f'/api/v1/admin/users/{self.user_emp.id}/',
            '/api/v1/admin/audit-logs/',
            '/api/v1/admin/configuration/',
        ]
        for url in endpoints:
            resp = self.client.get(url)
            self.assertEqual(resp.status_code, 403, f"Expected 403 for HR_MANAGER on {url}, got {resp.status_code}")

        patch_role = self.client.patch(f'/api/v1/admin/users/{self.user_emp.id}/role/', {'system_role': 'ADMIN'})
        self.assertEqual(patch_role.status_code, 403)

        patch_status = self.client.patch(f'/api/v1/admin/users/{self.user_emp.id}/status/', {'is_active': False})
        self.assertEqual(patch_status.status_code, 403)

    def test_admin_endpoints_admin_allowed_200(self):
        """ADMIN role must be allowed 200 OK on admin endpoints."""
        self.client.force_authenticate(user=self.user_admin)
        resp_dash = self.client.get('/api/v1/admin/dashboard/')
        self.assertEqual(resp_dash.status_code, 200)

        resp_users = self.client.get('/api/v1/admin/users/')
        self.assertEqual(resp_users.status_code, 200)

        resp_audit = self.client.get('/api/v1/admin/audit-logs/')
        self.assertEqual(resp_audit.status_code, 200)

        resp_config = self.client.get('/api/v1/admin/configuration/')
        self.assertEqual(resp_config.status_code, 200)

    def test_admin_dashboard_metrics_live_from_db(self):
        """Dashboard counts must reflect actual live records in the database."""
        self.client.force_authenticate(user=self.user_admin)
        resp = self.client.get('/api/v1/admin/dashboard/')
        self.assertEqual(resp.status_code, 200)

        data = resp.data
        self.assertGreaterEqual(data['total_users'], 4)
        self.assertGreaterEqual(data['total_employees'], 4)
        self.assertGreaterEqual(data['hr_managers'], 1)
        self.assertGreaterEqual(data['admins'], 2)
        self.assertGreaterEqual(data['active_users'], 4)
        self.assertEqual(data['inactive_users'], 0)
        self.assertIn('recent_activity', data)

    def test_admin_user_listing_search_and_filters(self):
        """User management API supports search, role filtering, status filtering, and pagination."""
        self.client.force_authenticate(user=self.user_admin)

        # 1. Basic list
        resp = self.client.get('/api/v1/admin/users/')
        self.assertEqual(resp.status_code, 200)
        self.assertGreaterEqual(resp.data['count'], 4)
        self.assertIn('results', resp.data)

        # 2. Filter by role: HR_MANAGER
        hr_resp = self.client.get('/api/v1/admin/users/?role=HR_MANAGER')
        self.assertEqual(hr_resp.status_code, 200)
        for u in hr_resp.data['results']:
            self.assertEqual(u['system_role'], 'HR_MANAGER')

        # 3. Filter by role: ADMIN
        admin_resp = self.client.get('/api/v1/admin/users/?role=ADMIN')
        self.assertEqual(admin_resp.status_code, 200)
        for u in admin_resp.data['results']:
            self.assertEqual(u['system_role'], 'ADMIN')

        # 4. Search by username / name
        search_resp = self.client.get('/api/v1/admin/users/?search=delta')
        self.assertEqual(search_resp.status_code, 200)
        self.assertEqual(len(search_resp.data['results']), 1)
        self.assertEqual(search_resp.data['results'][0]['username'], 'emp.delta')

        # 5. Search by employee ID
        search_id = self.client.get('/api/v1/admin/users/?search=EMP-DEV-0001')
        self.assertEqual(search_id.status_code, 200)
        self.assertEqual(len(search_id.data['results']), 1)

    def test_admin_user_detail_returns_safe_data(self):
        """User detail endpoint provides employee details without exposing credentials."""
        self.client.force_authenticate(user=self.user_admin)
        resp = self.client.get(f'/api/v1/admin/users/{self.user_emp.id}/')
        self.assertEqual(resp.status_code, 200)

        data = resp.data
        self.assertEqual(data['username'], 'emp.delta')
        self.assertEqual(data['email'], 'emp.delta@novatech.io')
        self.assertEqual(data['system_role'], 'EMPLOYEE')
        self.assertIsNotNone(data['employee'])
        self.assertEqual(data['employee']['job_title'], 'Frontend Engineer')
        self.assertEqual(data['employee']['department'], 'Engineering')

        # Security check: absolutely no sensitive authentication credentials
        self.assertNotIn('password', data)
        self.assertNotIn('token_hash', data)
        self.assertNotIn('jwt', data)

    def test_admin_change_employee_role_success_and_audit(self):
        """Admin can change an employee's role and an audit log is created."""
        self.client.force_authenticate(user=self.user_admin)
        resp = self.client.patch(
            f'/api/v1/admin/users/{self.user_emp.id}/role/',
            {'system_role': 'HR_MANAGER'},
            format='json'
        )
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(resp.data['success'])

        self.emp_delta.refresh_from_db()
        self.assertEqual(self.emp_delta.system_role, 'HR_MANAGER')

        # Verify audit log
        audit = AdminAuditLog.objects.filter(
            target_id=str(self.user_emp.id),
            action=AdminAuditLog.ACTION_ROLE_CHANGE
        ).first()
        self.assertIsNotNone(audit)
        self.assertEqual(audit.admin, self.user_admin)
        self.assertIn('HR_MANAGER', audit.description)

    def test_admin_change_hr_role_to_employee(self):
        """Admin can change HR manager role to Employee."""
        self.client.force_authenticate(user=self.user_admin)
        resp = self.client.patch(
            f'/api/v1/admin/users/{self.user_hr.id}/role/',
            {'system_role': 'EMPLOYEE'},
            format='json'
        )
        self.assertEqual(resp.status_code, 200)
        self.emp_hr.refresh_from_db()
        self.assertEqual(self.emp_hr.system_role, 'EMPLOYEE')

    def test_employee_and_hr_cannot_modify_system_role_via_profile(self):
        """Profile update endpoint strictly rejects modification of system_role or employee_id."""
        self.client.force_authenticate(user=self.user_emp)
        resp1 = self.client.put('/api/v1/profile/', {'system_role': 'ADMIN'}, format='json')
        self.assertEqual(resp1.status_code, 400)
        self.assertIn("protected", resp1.data.get('error', '').lower())

        resp2 = self.client.put('/api/v1/profile/', {'employee_id': 'EMP-FAKE-9999'}, format='json')
        self.assertEqual(resp2.status_code, 400)
        self.assertIn("protected", resp2.data.get('error', '').lower())

    def test_last_admin_demotion_is_strictly_rejected(self):
        """System must prevent demoting the last active administrator."""
        # Deactivate admin2 so admin.alpha is the ONLY active admin
        self.user_admin2.is_active = False
        self.user_admin2.save()

        self.client.force_authenticate(user=self.user_admin)
        resp = self.client.patch(
            f'/api/v1/admin/users/{self.user_admin.id}/role/',
            {'system_role': 'EMPLOYEE'},
            format='json'
        )
        self.assertEqual(resp.status_code, 400)
        self.assertIn('last remaining active administrator', resp.data['error'])

        # Verify role was NOT changed
        self.emp_admin.refresh_from_db()
        self.assertEqual(self.emp_admin.system_role, Employee.ROLE_ADMIN)

    def test_last_admin_deactivation_is_strictly_rejected(self):
        """System must prevent deactivating the last active administrator."""
        self.user_admin2.is_active = False
        self.user_admin2.save()

        self.client.force_authenticate(user=self.user_admin)
        resp = self.client.patch(
            f'/api/v1/admin/users/{self.user_admin.id}/status/',
            {'is_active': False},
            format='json'
        )
        self.assertEqual(resp.status_code, 400)
        self.assertIn('last remaining active administrator', resp.data['error'])

        # Verify status remained active
        self.user_admin.refresh_from_db()
        self.assertTrue(self.user_admin.is_active)

    def test_admin_can_activate_and_deactivate_permitted_user(self):
        """Admin can safely deactivate and reactivate standard users, with audit logging."""
        self.client.force_authenticate(user=self.user_admin)

        # Deactivate employee
        resp_deact = self.client.patch(
            f'/api/v1/admin/users/{self.user_emp.id}/status/',
            {'is_active': False},
            format='json'
        )
        self.assertEqual(resp_deact.status_code, 200)
        self.user_emp.refresh_from_db()
        self.assertFalse(self.user_emp.is_active)

        # Check deactivation audit log
        audit_deact = AdminAuditLog.objects.filter(
            target_id=str(self.user_emp.id),
            action=AdminAuditLog.ACTION_ACCOUNT_DEACTIVATED
        ).first()
        self.assertIsNotNone(audit_deact)

        # Reactivate employee
        resp_act = self.client.patch(
            f'/api/v1/admin/users/{self.user_emp.id}/status/',
            {'is_active': True},
            format='json'
        )
        self.assertEqual(resp_act.status_code, 200)
        self.user_emp.refresh_from_db()
        self.assertTrue(self.user_emp.is_active)

        # Check activation audit log
        audit_act = AdminAuditLog.objects.filter(
            target_id=str(self.user_emp.id),
            action=AdminAuditLog.ACTION_ACCOUNT_ACTIVATED
        ).first()
        self.assertIsNotNone(audit_act)

    def test_admin_configuration_view_and_stage_update(self):
        """Admin can view configuration and safely update an onboarding stage without corruption."""
        self.client.force_authenticate(user=self.user_admin)

        # View configuration
        resp = self.client.get('/api/v1/admin/configuration/')
        self.assertEqual(resp.status_code, 200)
        self.assertIn('system_info', resp.data)
        self.assertIn('stages', resp.data)

        # Update stage configuration
        stage = OnboardingStage.objects.filter(stage_id='profile').first()
        self.assertIsNotNone(stage)

        resp_update = self.client.patch(
            f'/api/v1/admin/stages/{stage.stage_id}/',
            {'estimated_time': '20 mins', 'is_active': True},
            format='json'
        )
        self.assertEqual(resp_update.status_code, 200)
        stage.refresh_from_db()
        self.assertEqual(stage.estimated_time, '20 mins')

        # Check audit log for config change
        config_audit = AdminAuditLog.objects.filter(
            action=AdminAuditLog.ACTION_CONFIG_CHANGE,
            target_id=stage.stage_id
        ).first()
        self.assertIsNotNone(config_audit)

    def test_sensitive_credentials_never_exposed_in_admin_apis(self):
        """Ensure passwords, hashes, JWTs, or invitation token hashes never appear in admin API responses."""
        self.client.force_authenticate(user=self.user_admin)

        endpoints = [
            '/api/v1/admin/dashboard/',
            '/api/v1/admin/users/',
            f'/api/v1/admin/users/{self.user_emp.id}/',
            '/api/v1/admin/audit-logs/',
            '/api/v1/admin/configuration/',
        ]
        for url in endpoints:
            resp = self.client.get(url)
            self.assertEqual(resp.status_code, 200)
            resp_str = str(resp.data).lower()
            self.assertNotIn('password_hash', resp_str)
            self.assertNotIn('token_hash', resp_str)
            self.assertNotIn('pbkdf2', resp_str)
            self.assertNotIn('bcrypt', resp_str)


class DjangoAdminRegistrationTestCase(APITestCase):
    """
    Automated test cases for Phase 4 Priority 1: Django Admin Model Registration.
    Verifies that application models are registered with safe list displays,
    filters, search fields, sensitive field protections, and read-only audit logs.
    """

    def setUp(self):
        from django.contrib import admin
        self.admin_site = admin.site

    def test_core_models_registered_in_django_admin(self):
        """Verify that all core onboarding domain models are registered in django.contrib.admin."""
        expected_models = [
            Employee,
            EmployeeProfile,
            OnboardingDocument,
            OfferLetter,
            CompanyPolicy,
            PolicyAcknowledgement,
            TrainingModule,
            EmployeeTrainingProgress,
            QuizQuestion,
            QuizSubmission,
            FirstDaySession,
            FirstDayProgress,
            OnboardingFeedback,
            OnboardingStage,
            EmployeeStageProgress,
            CandidateInvitation,
            Notification,
            AdminAuditLog,
        ]
        for model in expected_models:
            self.assertIn(
                model,
                self.admin_site._registry,
                f"Model {model.__name__} should be registered in Django admin site."
            )

    def test_admin_audit_log_strictly_read_only(self):
        """Verify that AdminAuditLog in Django admin strictly forbids add, change, and delete operations."""
        model_admin = self.admin_site._registry.get(AdminAuditLog)
        self.assertIsNotNone(model_admin, "AdminAuditLog must be registered in admin.")

        # Permissions must all return False
        self.assertFalse(model_admin.has_add_permission(None))
        self.assertFalse(model_admin.has_change_permission(None))
        self.assertFalse(model_admin.has_delete_permission(None))

        # Sensitive and audit fields must be read-only
        required_readonly = {'admin', 'action', 'target_type', 'target_id', 'description', 'created_at'}
        self.assertTrue(required_readonly.issubset(set(model_admin.readonly_fields)))

    def test_sensitive_security_tokens_protected_in_admin(self):
        """Verify that sensitive hashes and security tokens are marked read-only in admin."""
        # CandidateInvitation token_hash protection
        invitation_admin = self.admin_site._registry.get(CandidateInvitation)
        self.assertIsNotNone(invitation_admin)
        self.assertIn('token_hash', invitation_admin.readonly_fields)

        # OfferLetter signature_hash protection
        offer_admin = self.admin_site._registry.get(OfferLetter)
        self.assertIsNotNone(offer_admin)
        self.assertIn('signature_hash', offer_admin.readonly_fields)

    def test_django_admin_url_resolves(self):
        """Verify that the built-in Django /admin/ URL resolves cleanly without error."""
        resp = self.client.get('/admin/')
        # Should redirect to /admin/login/?next=/admin/ for unauthenticated users
        self.assertIn(resp.status_code, [200, 302])


class InactiveOnboardingStageTestCase(APITestCase):
    """
    Automated test cases for Phase 4 Priority 2: Inactive Onboarding Stage Handling.
    Verifies that:
      - Active stages are returned to candidates in correct order.
      - Inactive stages are excluded from candidate-facing stage lists.
      - Candidates cannot toggle or complete inactive stages.
      - Candidate progress calculations adapt dynamically to active stages.
      - Existing employee progress records are never deleted or reset.
      - HR and Admin management endpoints retain full visibility of all stages.
    """

    def setUp(self):
        from .views import ensure_default_stages
        ensure_default_stages()

        # 1. Standard Employee User
        self.user_emp = User.objects.create_user(
            username='candidate.leo',
            email='candidate.leo@novatech.io',
            password='NovaTech@2026',
            first_name='Leo',
            last_name='Candidate'
        )
        self.emp_user = Employee.objects.create(
            user=self.user_emp,
            employee_id='EMP-CAND-001',
            name='Leo Candidate',
            email='candidate.leo@novatech.io',
            role='Frontend Engineer',
            system_role=Employee.ROLE_EMPLOYEE
        )

        # 2. Admin User
        self.user_admin = User.objects.create_user(
            username='admin.rachel',
            email='admin.rachel@novatech.io',
            password='NovaTech@2026',
            is_staff=True
        )
        self.emp_admin = Employee.objects.create(
            user=self.user_admin,
            employee_id='EMP-ADM-0099',
            name='Rachel Admin',
            email='admin.rachel@novatech.io',
            role='Director of People Systems',
            system_role=Employee.ROLE_ADMIN
        )

        # 3. HR Manager User
        self.user_hr = User.objects.create_user(
            username='hr.marcus',
            email='hr.marcus@novatech.io',
            password='NovaTech@2026'
        )
        self.emp_hr = Employee.objects.create(
            user=self.user_hr,
            employee_id='EMP-HR-0099',
            name='Marcus HR',
            email='hr.marcus@novatech.io',
            role='People Partner',
            system_role=Employee.ROLE_HR_MANAGER
        )

    def test_active_stages_returned_to_candidates_in_correct_order(self):
        """Active stages are returned to candidate sorted in ascending stage_number."""
        self.client.force_authenticate(user=self.user_emp)
        resp = self.client.get('/api/v1/stages/')
        self.assertEqual(resp.status_code, 200)

        stages = resp.data
        self.assertEqual(len(stages), 10)

        # Verify ascending stage_number order
        stage_numbers = [s['stageNumber'] for s in stages]
        self.assertEqual(stage_numbers, sorted(stage_numbers))
        self.assertEqual(stage_numbers, list(range(1, 11)))

    def test_inactive_stage_excluded_from_candidate_api(self):
        """When a stage is set is_active=False, it is excluded from candidate API while order is preserved."""
        # Deactivate quiz stage (stage 6)
        quiz_stage = OnboardingStage.objects.get(stage_id='quiz')
        quiz_stage.is_active = False
        quiz_stage.save()

        self.client.force_authenticate(user=self.user_emp)
        resp = self.client.get('/api/v1/stages/')
        self.assertEqual(resp.status_code, 200)

        stages = resp.data
        self.assertEqual(len(stages), 9)

        # Confirm 'quiz' is NOT present
        stage_ids = [s['id'] for s in stages]
        self.assertNotIn('quiz', stage_ids)

        # Confirm remaining stages retain ascending order [1, 2, 3, 4, 5, 7, 8, 9, 10]
        stage_numbers = [s['stageNumber'] for s in stages]
        self.assertEqual(stage_numbers, [1, 2, 3, 4, 5, 7, 8, 9, 10])

    def test_candidate_cannot_toggle_inactive_stage(self):
        """Candidates cannot toggle an inactive stage; returns 404."""
        quiz_stage = OnboardingStage.objects.get(stage_id='quiz')
        quiz_stage.is_active = False
        quiz_stage.save()

        self.client.force_authenticate(user=self.user_emp)
        resp = self.client.post('/api/v1/stages/quiz/toggle/')
        self.assertEqual(resp.status_code, 404)

    def test_candidate_progress_calculation_adapts_to_active_stages(self):
        """Overall progress percentage calculates against active stages rather than all stages."""
        self.client.force_authenticate(user=self.user_emp)

        # Complete 3 stages
        for s_id in ['profile', 'documents', 'offerLetter']:
            stg = OnboardingStage.objects.get(stage_id=s_id)
            EmployeeStageProgress.objects.create(
                employee=self.emp_user,
                stage=stg,
                status='completed',
                is_completed=True
            )

        # With 10 active stages: 3 / 10 = 30%
        resp1 = self.client.get('/api/v1/stages/')
        self.assertEqual(resp1.status_code, 200)
        self.assertEqual(resp1['X-Total-Stages'], '10')
        self.assertEqual(resp1['X-Completed-Stages'], '3')
        self.assertEqual(resp1['X-Overall-Progress'], '30')

        # Deactivate 1 stage (quiz): now 9 active stages total, 3 completed = 3 / 9 = 33%
        quiz_stage = OnboardingStage.objects.get(stage_id='quiz')
        quiz_stage.is_active = False
        quiz_stage.save()

        resp2 = self.client.get('/api/v1/stages/')
        self.assertEqual(resp2.status_code, 200)
        self.assertEqual(resp2['X-Total-Stages'], '9')
        self.assertEqual(resp2['X-Completed-Stages'], '3')
        self.assertEqual(resp2['X-Overall-Progress'], '33')

        # Also verify summary query parameter format
        resp_summary = self.client.get('/api/v1/stages/?summary=true')
        self.assertEqual(resp_summary.status_code, 200)
        self.assertEqual(resp_summary.data['totalStages'], 9)
        self.assertEqual(resp_summary.data['completedStages'], 3)
        self.assertEqual(resp_summary.data['overallProgress'], 33)

    def test_existing_employee_stage_progress_not_deleted_or_reset(self):
        """Deactivating a stage never deletes or resets existing employee progress records."""
        quiz_stage = OnboardingStage.objects.get(stage_id='quiz')
        prog = EmployeeStageProgress.objects.create(
            employee=self.emp_user,
            stage=quiz_stage,
            status='completed',
            is_completed=True
        )

        # Deactivate quiz stage
        quiz_stage.is_active = False
        quiz_stage.save()

        # Verify progress record STILL exists in database unmodified
        prog.refresh_from_db()
        self.assertTrue(prog.is_completed)
        self.assertEqual(prog.status, 'completed')

        # Re-activate quiz stage
        quiz_stage.is_active = True
        quiz_stage.save()

        self.client.force_authenticate(user=self.user_emp)
        resp = self.client.get('/api/v1/stages/')
        self.assertEqual(resp.status_code, 200)

        # Find quiz stage in response and verify it reflects the preserved completed status
        quiz_in_resp = next((s for s in resp.data if s['id'] == 'quiz'), None)
        self.assertIsNotNone(quiz_in_resp)
        self.assertTrue(quiz_in_resp['isCompleted'])
        self.assertEqual(quiz_in_resp['status'], 'completed')

    def test_hr_and_admin_endpoints_retain_full_visibility_of_inactive_stages(self):
        """HR and Admin management endpoints retain visibility of all stages including inactive ones."""
        quiz_stage = OnboardingStage.objects.get(stage_id='quiz')
        quiz_stage.is_active = False
        quiz_stage.save()

        # 1. Admin Configuration View retains all 10 stages
        self.client.force_authenticate(user=self.user_admin)
        cfg_resp = self.client.get('/api/v1/admin/configuration/')
        self.assertEqual(cfg_resp.status_code, 200)
        self.assertEqual(len(cfg_resp.data['stages']), 10)
        quiz_cfg = next((s for s in cfg_resp.data['stages'] if s['stage_id'] == 'quiz'), None)
        self.assertIsNotNone(quiz_cfg)
        self.assertFalse(quiz_cfg['is_active'])

        # 2. Admin User Detail View retains all historical stages
        user_detail_resp = self.client.get(f'/api/v1/admin/users/{self.user_emp.id}/')
        self.assertEqual(user_detail_resp.status_code, 200)
        all_emp_stages = user_detail_resp.data['employee']['stages_progress']
        self.assertEqual(len(all_emp_stages), 10)
        quiz_sp = next((s for s in all_emp_stages if s['stage_number'] == 6), None)
        self.assertIsNotNone(quiz_sp)
        self.assertFalse(quiz_sp['is_active'])

        # 3. HR Employee Detail View retains all stages in all_stages and computes active progress
        self.client.force_authenticate(user=self.user_hr)
        hr_detail_resp = self.client.get(f'/api/v1/hr/employees/{self.emp_user.id}/')
        self.assertEqual(hr_detail_resp.status_code, 200)
        hr_stages = hr_detail_resp.data['stages']
        self.assertEqual(len(hr_stages), 10)
        quiz_hr = next((s for s in hr_stages if s['stage_id'] == 'quiz'), None)
        self.assertIsNotNone(quiz_hr)
        self.assertFalse(quiz_hr['is_active'])


class AdminQuickInvitationTestCase(APITestCase):
    """
    Automated test cases for Phase 4 Priority 3: Admin Quick Invitation.
    Validates:
      1. Administrator can issue quick candidate invitation with required fields.
      2. Validates email format and required full name.
      3. Rejects duplicate active invitations and invites for existing registered users.
      4. Never exposes raw tokens or sensitive hashes in administrative lists or audit logs.
      5. Creates in-app notifications without leaking tokens.
      6. Invited candidate can preview and complete registration as Employee.
      7. Non-admin / non-HR users receive 403 Forbidden.
    """

    def setUp(self):
        from .views import ensure_default_stages
        ensure_default_stages()

        # 1. Administrator
        self.user_admin = User.objects.create_user(
            username='admin.vikram',
            email='admin.vikram@novatech.io',
            password='NovaTech@2026',
            first_name='Vikram',
            last_name='Admin',
            is_staff=True
        )
        self.emp_admin = Employee.objects.create(
            user=self.user_admin,
            employee_id='EMP-ADM-0044',
            name='Vikram Admin',
            email='admin.vikram@novatech.io',
            role='Head of Systems & Security',
            department='Platform Operations',
            system_role=Employee.ROLE_ADMIN
        )

        # 2. HR Manager (to receive notification)
        self.user_hr = User.objects.create_user(
            username='hr.ananya',
            email='hr.ananya@novatech.io',
            password='NovaTech@2026',
            first_name='Ananya',
            last_name='HR'
        )
        self.emp_hr = Employee.objects.create(
            user=self.user_hr,
            employee_id='EMP-HR-0044',
            name='Ananya HR',
            email='hr.ananya@novatech.io',
            role='Talent Partner',
            department='People & Culture',
            system_role=Employee.ROLE_HR_MANAGER
        )

        # 3. Standard Employee
        self.user_emp = User.objects.create_user(
            username='emp.kiran',
            email='emp.kiran@novatech.io',
            password='NovaTech@2026',
            first_name='Kiran',
            last_name='Employee'
        )
        self.emp_kiran = Employee.objects.create(
            user=self.user_emp,
            employee_id='EMP-DEV-0044',
            name='Kiran Employee',
            email='emp.kiran@novatech.io',
            role='Backend Engineer',
            department='Engineering',
            system_role=Employee.ROLE_EMPLOYEE
        )

    def test_admin_quick_invitation_creates_pending_invite_with_tokens(self):
        """Admin can issue a quick candidate invitation returning single-use raw token and registration URL."""
        self.client.force_authenticate(user=self.user_admin)
        payload = {
            'email': 'neha.candidate@example.com',
            'full_name': 'Neha Sharma',
            'job_title': 'Staff Data Scientist',
            'department': 'Artificial Intelligence',
            'joining_date': '2026-11-01',
            'manager': 'Arjun Mehta'
        }
        resp = self.client.post('/api/v1/invitations/', payload, format='json')
        self.assertEqual(resp.status_code, 201)

        data = resp.data
        self.assertEqual(data['email'], 'neha.candidate@example.com')
        self.assertEqual(data['fullName'], 'Neha Sharma')
        self.assertEqual(data['jobTitle'], 'Staff Data Scientist')
        self.assertEqual(data['department'], 'Artificial Intelligence')
        self.assertEqual(data['status'], 'PENDING')
        self.assertIn('raw_token', data)
        self.assertIn('invitation_url', data)
        self.assertIn('register?token=', data['invitation_url'])
        # Verify token_hash is NOT exposed in API response
        self.assertNotIn('token_hash', data)

        # Verify DB integrity: token_hash is stored, raw_token is NOT stored in plain text
        raw_token = data['raw_token']
        expected_hash = hashlib.sha256(raw_token.encode('utf-8')).hexdigest()
        inv_db = CandidateInvitation.objects.get(email='neha.candidate@example.com')
        self.assertEqual(inv_db.token_hash, expected_hash)
        self.assertEqual(inv_db.invited_by, self.user_admin)
        self.assertFalse(CandidateInvitation.objects.filter(token_hash=raw_token).exists())

    def test_admin_quick_invitation_validates_required_fields_and_email(self):
        """Validates that candidate full name and valid email format are mandatory."""
        self.client.force_authenticate(user=self.user_admin)

        # Missing email
        resp1 = self.client.post('/api/v1/invitations/', {'full_name': 'No Email'}, format='json')
        self.assertEqual(resp1.status_code, 400)
        self.assertIn('email', str(resp1.data).lower())

        # Invalid email format
        resp2 = self.client.post('/api/v1/invitations/', {'email': 'invalid-email-format', 'full_name': 'Invalid Email'}, format='json')
        self.assertEqual(resp2.status_code, 400)
        self.assertIn('valid email', str(resp2.data).lower())

        # Missing full name
        resp3 = self.client.post('/api/v1/invitations/', {'email': 'noname@example.com'}, format='json')
        self.assertEqual(resp3.status_code, 400)
        self.assertIn('full name', str(resp3.data).lower())

    def test_admin_quick_invitation_rejects_duplicate_active_invite_and_existing_user(self):
        """System strictly rejects creating duplicate pending invites or invites for existing registered users."""
        self.client.force_authenticate(user=self.user_admin)

        # 1. Create first invitation
        payload = {'email': 'duplicate.check@example.com', 'full_name': 'Original Candidate'}
        resp1 = self.client.post('/api/v1/invitations/', payload, format='json')
        self.assertEqual(resp1.status_code, 201)

        # 2. Duplicate active invitation for same email must be rejected
        resp2 = self.client.post('/api/v1/invitations/', payload, format='json')
        self.assertEqual(resp2.status_code, 400)
        self.assertIn('already exists', str(resp2.data).lower())

        # 3. Invitation for already registered User email must be rejected
        resp3 = self.client.post('/api/v1/invitations/', {
            'email': self.user_emp.email,
            'full_name': 'Already A User'
        }, format='json')
        self.assertEqual(resp3.status_code, 400)
        self.assertIn('already exists', str(resp3.data).lower())

    def test_admin_invitation_creates_notification_without_leaking_tokens(self):
        """Creating an invitation notifies HR and Admins without exposing sensitive token hashes."""
        self.client.force_authenticate(user=self.user_admin)
        payload = {'email': 'notify.test@example.com', 'full_name': 'Notify Test'}
        resp = self.client.post('/api/v1/invitations/', payload, format='json')
        self.assertEqual(resp.status_code, 201)
        raw_token = resp.data['raw_token']

        # Check notification received by HR user
        hr_notif = Notification.objects.filter(
            recipient=self.user_hr,
            notification_type=Notification.TYPE_CANDIDATE_INVITATION
        ).first()
        self.assertIsNotNone(hr_notif)
        self.assertIn('Notify Test', hr_notif.message)
        # Ensure raw token and token hash are NEVER leaked in notifications
        self.assertNotIn(raw_token, hr_notif.message)
        self.assertNotIn(raw_token, hr_notif.title)

    def test_invited_candidate_can_preview_and_accept_invitation_as_employee(self):
        """Candidate invited by Admin can preview token and complete account registration with strict ROLE_EMPLOYEE."""
        self.client.force_authenticate(user=self.user_admin)
        payload = {
            'email': 'deepak.candidate@example.com',
            'full_name': 'Deepak Verma',
            'job_title': 'Solutions Architect',
            'department': 'Cloud Platform',
            'joining_date': '2026-11-10',
            'manager': 'Arjun Mehta'
        }
        resp = self.client.post('/api/v1/invitations/', payload, format='json')
        self.assertEqual(resp.status_code, 201)
        raw_token = resp.data['raw_token']

        # 1. Unauthenticated preview
        self.client.logout()
        preview_resp = self.client.get(f'/api/v1/invitations/preview/?token={raw_token}')
        self.assertEqual(preview_resp.status_code, 200)
        self.assertEqual(preview_resp.data['email'], 'deepak.candidate@example.com')
        self.assertEqual(preview_resp.data['fullName'], 'Deepak Verma')
        self.assertNotIn('token_hash', preview_resp.data)

        # 2. Unauthenticated accept
        accept_resp = self.client.post('/api/v1/invitations/accept/', {
            'token': raw_token,
            'password': 'NovaCandidate@2026',
            'confirm_password': 'NovaCandidate@2026',
            'system_role': 'ADMIN'  # Attempt privilege escalation
        }, format='json')
        self.assertEqual(accept_resp.status_code, 201)
        self.assertTrue(accept_resp.data['success'])

        # Verify created employee has strictly ROLE_EMPLOYEE
        new_emp = Employee.objects.get(email='deepak.candidate@example.com')
        self.assertEqual(new_emp.system_role, Employee.ROLE_EMPLOYEE)
        self.assertEqual(new_emp.department, 'Cloud Platform')

        # 3. New candidate can authenticate successfully
        login_resp = self.client.post('/api/v1/auth/login/', {
            'username': 'deepak.candidate@example.com',
            'password': 'NovaCandidate@2026'
        }, format='json')
        self.assertEqual(login_resp.status_code, 200)
        self.assertIn('access', login_resp.data)

    def test_non_admin_non_hr_employee_cannot_issue_invitation(self):
        """Standard employees are forbidden (403) and unauthenticated users receive 401."""
        # Authenticated as standard Employee
        self.client.force_authenticate(user=self.user_emp)
        resp_emp = self.client.post('/api/v1/invitations/', {'email': 'hack@example.com', 'full_name': 'Hacker'}, format='json')
        self.assertEqual(resp_emp.status_code, 403)

        # Unauthenticated
        self.client.logout()
        resp_anon = self.client.post('/api/v1/invitations/', {'email': 'anon@example.com', 'full_name': 'Anon'}, format='json')
        self.assertEqual(resp_anon.status_code, 401)


class LoginAuthenticationAndBootstrapTestCase(APITestCase):
    """Automated tests for LoginView lookups and setup_demo_user command."""

    def setUp(self):
        self.password = 'StrongSecretPass@2026'
        self.user = User.objects.create_user(
            username='auth.tester',
            email='auth.tester@novatech.io',
            password=self.password,
            first_name='Auth',
            last_name='Tester'
        )
        self.employee = Employee.objects.create(
            user=self.user,
            employee_id='EMP-AUTH-9999',
            name='Auth Tester',
            email='auth.tester@novatech.io',
            role='Test Engineer',
            system_role=Employee.ROLE_EMPLOYEE
        )

    def test_login_exact_username(self):
        resp = self.client.post('/api/v1/auth/login/', {
            'username': 'auth.tester',
            'password': self.password
        }, format='json')
        self.assertEqual(resp.status_code, 200)
        self.assertIn('access', resp.data)
        self.assertEqual(resp.data['user']['username'], 'auth.tester')
        self.assertEqual(resp.data['user']['system_role'], 'EMPLOYEE')

    def test_login_case_insensitive_username(self):
        resp = self.client.post('/api/v1/auth/login/', {
            'username': 'AUTH.TESTER',
            'password': self.password
        }, format='json')
        self.assertEqual(resp.status_code, 200)
        self.assertIn('access', resp.data)
        self.assertEqual(resp.data['user']['username'], 'auth.tester')

    def test_login_with_email_case_insensitive(self):
        resp = self.client.post('/api/v1/auth/login/', {
            'username': 'Auth.Tester@NovaTech.io',
            'password': self.password
        }, format='json')
        self.assertEqual(resp.status_code, 200)
        self.assertIn('access', resp.data)

    def test_login_with_employee_id(self):
        # Uppercase
        resp1 = self.client.post('/api/v1/auth/login/', {
            'username': 'EMP-AUTH-9999',
            'password': self.password
        }, format='json')
        self.assertEqual(resp1.status_code, 200)

        # Lowercase
        resp2 = self.client.post('/api/v1/auth/login/', {
            'username': 'emp-auth-9999',
            'password': self.password
        }, format='json')
        self.assertEqual(resp2.status_code, 200)

    def test_login_invalid_password_returns_401(self):
        resp = self.client.post('/api/v1/auth/login/', {
            'username': 'auth.tester',
            'password': 'WrongPassword123'
        }, format='json')
        self.assertEqual(resp.status_code, 401)
        self.assertIn('detail', resp.data)

    def test_login_inactive_account_returns_403(self):
        self.user.is_active = False
        self.user.save()
        resp = self.client.post('/api/v1/auth/login/', {
            'username': 'auth.tester',
            'password': self.password
        }, format='json')
        self.assertEqual(resp.status_code, 403)

    def test_login_missing_fields_returns_400(self):
        resp = self.client.post('/api/v1/auth/login/', {
            'username': '',
            'password': ''
        }, format='json')
        self.assertEqual(resp.status_code, 400)

    def test_setup_demo_user_command_execution(self):
        from django.core.management import call_command
        from io import StringIO
        out = StringIO()

        # Run command with --username and --password
        call_command(
            'setup_demo_user',
            username='rahul.kumar',
            password='TestBootstrapPass@2026',
            stdout=out
        )
        self.assertIn('completed successfully', out.getvalue())
        rahul = User.objects.get(username='rahul.kumar')
        self.assertTrue(rahul.check_password('TestBootstrapPass@2026'))
        emp = Employee.objects.get(user=rahul)
        self.assertEqual(emp.employee_id, 'EMP-2026-8941')
        self.assertEqual(emp.system_role, Employee.ROLE_EMPLOYEE)

    def test_setup_demo_user_with_env_var(self):
        import os
        from django.core.management import call_command
        from io import StringIO

        out = StringIO()
        os.environ['ENABLE_DEMO_BOOTSTRAP'] = 'true'
        os.environ['DEMO_USER_PASSWORD'] = 'EnvVarPass@2026'
        try:
            call_command('setup_demo_user', username='rahul.kumar', stdout=out)
            self.assertIn('completed successfully', out.getvalue())
            rahul = User.objects.get(username='rahul.kumar')
            self.assertTrue(rahul.check_password('EnvVarPass@2026'))
        finally:
            os.environ.pop('ENABLE_DEMO_BOOTSTRAP', None)
            os.environ.pop('DEMO_USER_PASSWORD', None)

    def test_post_migrate_signal_handler(self):
        import os
        from apps.onboarding.signals import handle_demo_bootstrap_post_migrate

        # When ENABLE_DEMO_BOOTSTRAP is not set, signal handler returns silently without error
        handle_demo_bootstrap_post_migrate(sender=None)

        # When ENABLE_DEMO_BOOTSTRAP is set, signal handler calls command
        os.environ['ENABLE_DEMO_BOOTSTRAP'] = 'true'
        os.environ['DEMO_USER_PASSWORD'] = 'SignalPass@2026'
        try:
            handle_demo_bootstrap_post_migrate(sender=None)
            rahul = User.objects.get(username='rahul.kumar')
            self.assertTrue(rahul.check_password('SignalPass@2026'))
        finally:
            os.environ.pop('ENABLE_DEMO_BOOTSTRAP', None)
            os.environ.pop('DEMO_USER_PASSWORD', None)









