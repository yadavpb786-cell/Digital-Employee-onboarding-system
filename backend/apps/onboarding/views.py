import os
import re
import secrets
import mimetypes
import hashlib
from django.http import Http404, FileResponse
from django.utils import timezone
from django.db import transaction
from django.conf import settings
from django.db.models import Q, Avg, Count, Sum
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import viewsets, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken
from rest_framework_simplejwt.views import TokenRefreshView
from .email_service import (
    send_invitation_email,
    send_activation_confirmation_email,
    EmailDeliveryError
)

from .models import (
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
    AdminAuditLog
)
from .serializers import (
    EmployeeSerializer,
    EmployeeProfileSerializer,
    OnboardingDocumentSerializer,
    OfferLetterSerializer,
    CompanyPolicySerializer,
    PolicyAcknowledgementSerializer,
    TrainingModuleSerializer,
    EmployeeTrainingProgressSerializer,
    QuizQuestionSerializer,
    QuizSubmissionSerializer,
    FirstDaySessionSerializer,
    FirstDayProgressSerializer,
    OnboardingFeedbackSerializer,
    OnboardingStageSerializer,
    EmployeeStageProgressSerializer,
    CandidateInvitationSerializer,
    CandidateInvitationPreviewSerializer,
    NotificationSerializer,
    AdminAuditLogSerializer,
    AdminUserListSerializer,
    AdminUserDetailSerializer,
    AdminStageConfigSerializer
)
from .notification_service import (
    create_notification,
    notify_hr_and_admins,
    mark_notification_read,
    mark_all_notifications_read,
    get_unread_count
)
from .permissions import (
    IsEmployee,
    IsHRManager,
    IsAdmin,
    IsHROrAdmin
)


DEFAULT_STAGES_METADATA = [
    {
        "stage_id": "profile",
        "stage_number": 1,
        "title": "Employee Profile",
        "description": "Personal details, emergency contacts, address, and designation.",
        "path": "/profile",
        "icon": "UserCheck",
        "category": "Personal Data",
        "estimated_time": "5 mins"
    },
    {
        "stage_id": "documents",
        "stage_number": 2,
        "title": "Document Submission",
        "description": "Submit government ID, educational records, and bank details.",
        "path": "/documents",
        "icon": "FileUp",
        "category": "Compliance",
        "estimated_time": "15 mins"
    },
    {
        "stage_id": "offerLetter",
        "stage_number": 3,
        "title": "Offer Letter Acceptance",
        "description": "Review terms of employment, CTC compensation, and digitally sign.",
        "path": "/offer-letter",
        "icon": "FileSignature",
        "category": "Legal",
        "estimated_time": "5 mins"
    },
    {
        "stage_id": "policies",
        "stage_number": 4,
        "title": "Company Policies",
        "description": "Acknowledge Code of Conduct, Information Security, and WFH guidelines.",
        "path": "/policies",
        "icon": "BookOpen",
        "category": "Governance",
        "estimated_time": "20 mins"
    },
    {
        "stage_id": "training",
        "stage_number": 5,
        "title": "Mandatory Training",
        "description": "Complete security awareness, culture, and technical modules.",
        "path": "/training",
        "icon": "GraduationCap",
        "category": "Learning",
        "estimated_time": "30 mins"
    },
    {
        "stage_id": "quiz",
        "stage_number": 6,
        "title": "Onboarding Quiz",
        "description": "Knowledge check on company culture, guidelines, and security protocols.",
        "path": "/quiz",
        "icon": "HelpCircle",
        "category": "Assessment",
        "estimated_time": "10 mins"
    },
    {
        "stage_id": "manager",
        "stage_number": 7,
        "title": "Department & Manager",
        "description": "Meet your reporting manager Arjun Mehta and align on 30-day goals.",
        "path": "/team",
        "icon": "Users",
        "category": "Team Alignment",
        "estimated_time": "15 mins"
    },
    {
        "stage_id": "firstDay",
        "stage_number": 8,
        "title": "First Day Action Plan",
        "description": "Review detailed schedule for orientation day, reception, and lunch.",
        "path": "/first-day",
        "icon": "Calendar",
        "category": "Orientation",
        "estimated_time": "10 mins"
    },
    {
        "stage_id": "feedback",
        "stage_number": 9,
        "title": "Onboarding Feedback",
        "description": "Share your onboarding ratings and comments to help us improve.",
        "path": "/feedback",
        "icon": "MessageSquare",
        "category": "Feedback",
        "estimated_time": "5 mins"
    },
    {
        "stage_id": "completed",
        "stage_number": 10,
        "title": "Onboarding Complete",
        "description": "All milestones completed. Download your Graduation Certificate!",
        "path": "/onboarding",
        "icon": "Award",
        "category": "Graduation",
        "estimated_time": "Done"
    }
]


def ensure_default_stages():
    """Ensures all 10 core milestones are created in the database."""
    for item in DEFAULT_STAGES_METADATA:
        OnboardingStage.objects.get_or_create(
            stage_id=item["stage_id"],
            defaults=item
        )


def get_current_employee(request=None):
    """
    Strictly authenticated employee lookup mechanism.
    Resolves the employee linked to the authenticated Django user.
    """
    if request and hasattr(request, 'user') and request.user.is_authenticated:
        # 1. Direct one-to-one relationship
        if hasattr(request.user, 'employee') and request.user.employee:
            return request.user.employee
        # 2. Reverse foreign key lookup
        emp = Employee.objects.filter(user=request.user).first()
        if emp:
            return emp
        # 3. Email matching
        if request.user.email:
            emp = Employee.objects.filter(email=request.user.email).first()
            if emp:
                return emp
        # 4. Username / employee_id matching
        emp = Employee.objects.filter(employee_id=request.user.username).first()
        if emp:
            return emp

    # Safe fallback ONLY for internal CLI scripts / management commands when request is None
    if request is None:
        return Employee.objects.first()

    return None


# ==============================================================================
# AUTHENTICATION: LOGIN, LOGOUT, ME
# ==============================================================================

class LoginView(APIView):
    """
    POST /api/v1/auth/login/
    Public authentication endpoint. Returns access & refresh JWTs and employee data.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        username_input = request.data.get('username', '').strip()
        password = request.data.get('password', '')

        if not username_input or not password:
            return Response(
                {'detail': 'Username or email and password are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Allow authentication by username, email, or employee ID (case-insensitive)
        user = None
        candidate_user = None

        # 1. Email lookup
        if '@' in username_input:
            candidate_user = User.objects.filter(email__iexact=username_input).first()
            if not candidate_user:
                emp_match = Employee.objects.filter(email__iexact=username_input).select_related('user').first()
                if emp_match and emp_match.user:
                    candidate_user = emp_match.user

        # 2. Employee ID lookup (case-insensitive for 'EMP-' or 'emp-' or hyphenated ID)
        if not candidate_user and (username_input.upper().startswith('EMP-') or '-' in username_input):
            emp_match = Employee.objects.filter(employee_id__iexact=username_input).select_related('user').first()
            if emp_match and emp_match.user:
                candidate_user = emp_match.user

        # 3. Direct or case-insensitive username lookup
        if not candidate_user:
            candidate_user = User.objects.filter(username__iexact=username_input).first()

        # If a user was matched by identifier, authenticate with their exact username
        if candidate_user:
            user = authenticate(request, username=candidate_user.username, password=password)
            if not user and not candidate_user.is_active and candidate_user.check_password(password):
                return Response(
                    {'detail': 'This account is inactive. Please contact HR Operations.'},
                    status=status.HTTP_403_FORBIDDEN
                )
        else:
            user = authenticate(request, username=username_input, password=password)

        if not user:
            return Response(
                {'detail': 'Invalid username or password.'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if not user.is_active:
            return Response(
                {'detail': 'This account is inactive. Please contact HR Operations.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Generate JWT Tokens
        refresh = RefreshToken.for_user(user)
        access = refresh.access_token

        # Resolve linked employee
        emp = getattr(user, 'employee', None) or Employee.objects.filter(user=user).first() or Employee.objects.filter(email=user.email).first()
        system_role = emp.system_role if emp else ('ADMIN' if user.is_superuser else Employee.ROLE_EMPLOYEE)

        return Response({
            'access': str(access),
            'refresh': str(refresh),
            'user': {
                'id': user.id,
                'username': user.username,
                'employee_id': emp.employee_id if emp else '',
                'name': emp.name if emp else (user.get_full_name() or user.username),
                'email': user.email,
                'role': emp.role if emp else 'Employee',
                'system_role': system_role,
                'systemRole': system_role,
                'avatar': emp.avatar if emp else ''
            }
        }, status=status.HTTP_200_OK)


class LogoutView(APIView):
    """
    POST /api/v1/auth/logout/
    Blacklists the refresh token to terminate session.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response({'detail': 'Successfully logged out.'}, status=status.HTTP_200_OK)
        except Exception:
            return Response({'detail': 'Invalid or expired refresh token.'}, status=status.HTTP_400_BAD_REQUEST)


class AuthMeView(APIView):
    """GET /api/v1/auth/me/ - Returns current active authenticated employee record."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        employee = get_current_employee(request)
        if not employee:
            if request.user.is_superuser:
                return Response({
                    'id': request.user.id,
                    'username': request.user.username,
                    'name': request.user.get_full_name() or request.user.username,
                    'email': request.user.email,
                    'role': 'System Administrator',
                    'system_role': Employee.ROLE_ADMIN,
                    'systemRole': Employee.ROLE_ADMIN,
                    'avatar': ''
                })
            return Response(
                {'detail': 'Employee profile not found for this authenticated user.'},
                status=status.HTTP_404_NOT_FOUND
            )
        request.employee = employee
        serializer = EmployeeSerializer(employee, context={'request': request})
        return Response(serializer.data)


class ChangePasswordView(APIView):
    """
    POST /api/v1/auth/change-password/
    Secure authenticated endpoint for users to change their password.
    Requires: current_password, new_password.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        current_password = request.data.get('current_password', '')
        new_password = request.data.get('new_password', '')

        if not current_password:
            return Response(
                {'error': 'Current password is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not new_password:
            return Response(
                {'error': 'New password is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 1. Verify current password
        if not request.user.check_password(current_password):
            return Response(
                {'error': 'Current password is incorrect.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 2. Reject if new password equals current password
        if current_password == new_password:
            return Response(
                {'error': 'New password cannot be the same as the current password.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 3. Validate new password strength using Django validators
        try:
            validate_password(new_password, user=request.user)
        except DjangoValidationError as exc:
            return Response(
                {'error': ' '.join(exc.messages)},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 4. Set new password securely and save user
        request.user.set_password(new_password)
        request.user.save()

        # 5. Invalidate existing refresh tokens via SimpleJWT token_blacklist
        try:
            for token in OutstandingToken.objects.filter(user=request.user):
                BlacklistedToken.objects.get_or_create(token=token)
        except Exception:
            pass

        # 6. Issue fresh tokens for the active user session
        new_refresh = RefreshToken.for_user(request.user)

        return Response({
            'success': True,
            'message': 'Password has been changed successfully.',
            'access': str(new_refresh.access_token),
            'refresh': str(new_refresh)
        }, status=status.HTTP_200_OK)


# ==============================================================================
# RBAC VERIFICATION / TEST-ONLY ENDPOINTS (PHASE 3 STEP 1)
# ==============================================================================

class RoleVerificationEmployeeView(APIView):
    """Minimal RBAC verification endpoint for EMPLOYEE role."""
    permission_classes = [IsAuthenticated, IsEmployee]

    def get(self, request):
        emp = get_current_employee(request)
        role = emp.system_role if emp else 'EMPLOYEE'
        return Response({
            'status': 'authorized',
            'role': role,
            'system_role': role,
            'message': 'Employee access verified.'
        })


class RoleVerificationHRView(APIView):
    """Minimal RBAC verification endpoint for HR_MANAGER role."""
    permission_classes = [IsAuthenticated, IsHRManager]

    def get(self, request):
        emp = get_current_employee(request)
        role = emp.system_role if emp else 'HR_MANAGER'
        return Response({
            'status': 'authorized',
            'role': role,
            'system_role': role,
            'message': 'HR Manager access verified.'
        })


class RoleVerificationAdminView(APIView):
    """Minimal RBAC verification endpoint for ADMIN role."""
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        emp = get_current_employee(request)
        role = emp.system_role if emp else ('ADMIN' if request.user.is_superuser else 'EMPLOYEE')
        return Response({
            'status': 'authorized',
            'role': role,
            'system_role': role,
            'message': 'System Administrator access verified.'
        })


class RoleVerificationHROrAdminView(APIView):
    """Minimal RBAC verification endpoint for HR or ADMIN roles."""
    permission_classes = [IsAuthenticated, IsHROrAdmin]

    def get(self, request):
        emp = get_current_employee(request)
        role = emp.system_role if emp else ('ADMIN' if request.user.is_superuser else 'EMPLOYEE')
        return Response({
            'status': 'authorized',
            'role': role,
            'system_role': role,
            'message': 'HR or Admin access verified.'
        })


# ==============================================================================
# 2. EMPLOYEE PROFILE
# ==============================================================================

class EmployeeProfileView(APIView):
    """GET, PUT /api/v1/profile/ - Retrieve or update employee profile & emergency contacts."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        employee = get_current_employee(request)
        if not employee:
            return Response(
                {'detail': 'Employee profile not found for this authenticated user.'},
                status=status.HTTP_404_NOT_FOUND
            )
        profile, _ = EmployeeProfile.objects.get_or_create(employee=employee)
        data = {
            'name': employee.name,
            'employeeId': employee.employee_id,
            'employee_id': employee.employee_id,
            'email': employee.email,
            'role': employee.role,
            'designation': employee.designation,
            'department': employee.department,
            'system_role': employee.system_role,
            'systemRole': employee.system_role,
            'joiningDate': employee.joining_date,
            'joining_date': employee.joining_date,
            'joiningTime': employee.joining_time,
            'location': employee.location,
            'workMode': employee.work_mode,
            'avatar': employee.avatar,
            'manager': {
                'name': employee.manager_name,
                'role': employee.manager_role,
                'email': employee.manager_email,
                'avatar': employee.manager_avatar
            },
            'managerName': employee.manager_name,
            'hrSupport': {
                'name': employee.hr_name,
                'role': employee.hr_role,
                'email': employee.hr_email,
                'avatar': employee.hr_avatar,
                'availability': employee.hr_availability
            },
            'phone': profile.phone,
            'dateOfBirth': str(profile.date_of_birth),
            'bloodGroup': profile.blood_group,
            'address': profile.address,
            'city': profile.city,
            'state': profile.state,
            'pincode': profile.pincode,
            'emergencyContact': {
                'name': profile.emergency_contact_name,
                'relation': profile.emergency_contact_relation,
                'phone': profile.emergency_contact_phone,
            },
            'emergencyContactName': profile.emergency_contact_name,
            'emergencyContactPhone': profile.emergency_contact_phone,
            'emergencyContactRelation': profile.emergency_contact_relation,
            'isCompleted': profile.is_completed,
        }
        return Response(data)

    def put(self, request):
        employee = get_current_employee(request)
        if not employee:
            return Response(
                {'detail': 'Employee profile not found for this authenticated user.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # 1. Reject modification of protected authorization and corporate identity fields
        protected_fields = {'system_role', 'systemRole', 'employee_id', 'employeeId'}
        for field in protected_fields:
            if field in request.data:
                return Response(
                    {'error': f"Field '{field}' is protected and cannot be modified by the employee."},
                    status=status.HTTP_400_BAD_REQUEST
                )

        profile, _ = EmployeeProfile.objects.get_or_create(employee=employee)

        # 2. Phone validation
        phone = request.data.get('phone')
        if phone is not None:
            phone_str = str(phone).strip()
            digits = re.sub(r'\D', '', phone_str)
            if len(digits) < 7 or len(digits) > 15:
                return Response(
                    {'error': 'Please provide a valid phone number (between 7 and 15 digits).'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            profile.phone = phone_str

        # 3. City/location validation
        if 'city' in request.data:
            city_val = str(request.data['city']).strip()
            if not city_val:
                return Response(
                    {'error': 'City/location cannot be blank.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            profile.city = city_val

        # 4. Optional residential and personal fields
        if 'address' in request.data:
            profile.address = str(request.data['address']).strip()
        if 'state' in request.data:
            profile.state = str(request.data['state']).strip()
        if 'pincode' in request.data:
            profile.pincode = str(request.data['pincode']).strip()
        if 'bloodGroup' in request.data:
            profile.blood_group = str(request.data['bloodGroup']).strip()
        if 'dateOfBirth' in request.data and request.data['dateOfBirth']:
            profile.date_of_birth = request.data['dateOfBirth']

        # 5. Emergency Contact
        if 'emergencyContact' in request.data and isinstance(request.data['emergencyContact'], dict):
            ec = request.data['emergencyContact']
            if 'name' in ec:
                profile.emergency_contact_name = str(ec['name']).strip()
            if 'relation' in ec:
                profile.emergency_contact_relation = str(ec['relation']).strip()
            if 'phone' in ec:
                ec_phone = str(ec['phone']).strip()
                ec_digits = re.sub(r'\D', '', ec_phone)
                if ec_digits and len(ec_digits) < 7:
                    return Response(
                        {'error': 'Emergency contact phone number must contain at least 7 digits.'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                profile.emergency_contact_phone = ec_phone
        else:
            if 'emergencyContactName' in request.data:
                profile.emergency_contact_name = str(request.data['emergencyContactName']).strip()
            if 'emergencyContactRelation' in request.data:
                profile.emergency_contact_relation = str(request.data['emergencyContactRelation']).strip()
            if 'emergencyContactPhone' in request.data:
                ec_phone = str(request.data['emergencyContactPhone']).strip()
                ec_digits = re.sub(r'\D', '', ec_phone)
                if ec_digits and len(ec_digits) < 7:
                    return Response(
                        {'error': 'Emergency contact phone number must contain at least 7 digits.'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                profile.emergency_contact_phone = ec_phone

        profile.is_completed = True
        profile.save()

        # Update stage progress for 'profile'
        stage = OnboardingStage.objects.filter(stage_id='profile').first()
        if stage:
            EmployeeStageProgress.objects.update_or_create(
                employee=employee,
                stage=stage,
                defaults={'status': 'completed', 'is_completed': True}
            )

        return Response({
            'success': True,
            'message': 'Profile updated successfully',
            'isCompleted': True,
            'name': employee.name,
            'employeeId': employee.employee_id,
            'phone': profile.phone,
            'city': profile.city,
            'address': profile.address,
            'state': profile.state,
            'pincode': profile.pincode,
            'bloodGroup': profile.blood_group,
            'dateOfBirth': str(profile.date_of_birth),
            'emergencyContact': {
                'name': profile.emergency_contact_name,
                'relation': profile.emergency_contact_relation,
                'phone': profile.emergency_contact_phone,
            }
        })


# ==============================================================================
# 3. ONBOARDING DOCUMENTS (PHASE 3 STEP 2 - REAL FILE UPLOAD & STORAGE)
# ==============================================================================

MAX_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB
ALLOWED_DOCUMENT_EXTENSIONS = {'.pdf', '.jpg', '.jpeg', '.png'}
DISALLOWED_DOCUMENT_EXTENSIONS = {
    '.exe', '.bat', '.sh', '.js', '.py', '.cmd', '.msi', '.vbs',
    '.scr', '.bin', '.php', '.phtml', '.dll', '.com', '.jar'
}
ALLOWED_DOCUMENT_MIME_TYPES = {
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/pjpeg',
    'application/octet-stream',
}

def format_document_size(num_bytes):
    """Formats file size into human-readable string (e.g. 2.4 MB)."""
    if num_bytes < 1024:
        return f"{num_bytes} B"
    elif num_bytes < 1024 * 1024:
        return f"{num_bytes / 1024:.1f} KB"
    else:
        return f"{num_bytes / (1024 * 1024):.1f} MB"

def validate_document_magic_bytes(file_obj):
    """Validates real file magic header bytes to block disguised executables."""
    try:
        pos = file_obj.tell()
        header = file_obj.read(16)
        file_obj.seek(pos)
        if len(header) == 0:
            return False
        # PDF: %PDF
        if header.startswith(b'%PDF'):
            return True
        # JPEG: \xff\xd8\xff
        if header.startswith(b'\xff\xd8\xff'):
            return True
        # PNG: \x89PNG\r\n\x1a\n
        if header.startswith(b'\x89PNG\r\n\x1a\n'):
            return True
        return False
    except Exception:
        return False


class OnboardingDocumentViewSet(viewsets.ModelViewSet):
    """
    GET, POST /api/v1/documents/
    GET /api/v1/documents/{id}/download/
    PATCH /api/v1/documents/{id}/verify/
    """
    serializer_class = OnboardingDocumentSerializer

    def get_queryset(self):
        employee = get_current_employee(self.request)
        if not employee:
            if self.request.user.is_superuser:
                return OnboardingDocument.objects.all().order_by('id')
            return OnboardingDocument.objects.none()
        if employee.system_role in [Employee.ROLE_HR_MANAGER, Employee.ROLE_ADMIN] or self.request.user.is_superuser:
            return OnboardingDocument.objects.all().order_by('id')
        return OnboardingDocument.objects.filter(employee=employee).order_by('id')

    def get_object(self):
        lookup = self.kwargs.get('pk')
        employee = get_current_employee(self.request)
        is_hr_or_admin = bool(
            self.request.user.is_superuser or
            (employee and employee.system_role in [Employee.ROLE_HR_MANAGER, Employee.ROLE_ADMIN])
        )
        if not employee and not self.request.user.is_superuser:
            raise Http404("Employee profile not found.")

        base_qs = OnboardingDocument.objects.all() if is_hr_or_admin else OnboardingDocument.objects.filter(employee=employee)

        if str(lookup).isdigit():
            obj = base_qs.filter(pk=int(lookup)).first()
            if obj:
                return obj
        obj = base_qs.filter(name__iexact=lookup).first()
        if not obj:
            if str(lookup).startswith('doc-') and str(lookup)[4:].isdigit():
                idx = int(str(lookup)[4:])
                docs = list(base_qs.order_by('id'))
                if 1 <= idx <= len(docs):
                    return docs[idx - 1]
            raise Http404(f"No OnboardingDocument found for '{lookup}'.")
        return obj

    def create(self, request, *args, **kwargs):
        employee = get_current_employee(request)
        if not employee:
            return Response({'detail': 'Employee profile not found for this authenticated user.'}, status=status.HTTP_404_NOT_FOUND)

        uploaded_file = request.FILES.get('file') or request.data.get('file')
        size_str = "1.5 MB"

        if uploaded_file and hasattr(uploaded_file, 'size'):
            # 1. Size Validation (Max 10 MB)
            if uploaded_file.size > MAX_DOCUMENT_SIZE_BYTES:
                return Response(
                    {'error': 'File size exceeds the 10 MB maximum limit. Please upload a smaller file.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            if uploaded_file.size == 0:
                return Response(
                    {'error': 'Uploaded file is empty.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # 2. Extension Validation
            fname = getattr(uploaded_file, 'name', '')
            ext = os.path.splitext(fname)[1].lower()
            if ext in DISALLOWED_DOCUMENT_EXTENSIONS or ext not in ALLOWED_DOCUMENT_EXTENSIONS:
                return Response(
                    {'error': f"Unsupported file type '{ext}'. Allowed file formats are PDF, JPG, and PNG."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # 3. MIME Validation
            content_type = getattr(uploaded_file, 'content_type', '').lower()
            if content_type and content_type not in ALLOWED_DOCUMENT_MIME_TYPES:
                return Response(
                    {'error': f"Unsupported content type '{content_type}'. Allowed types are PDF, JPG, and PNG."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # 4. Real Magic Bytes Content Validation
            if not validate_document_magic_bytes(uploaded_file):
                return Response(
                    {'error': 'File content is invalid or corrupted. It does not match a valid PDF, JPG, or PNG document.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            size_str = format_document_size(uploaded_file.size)
        else:
            uploaded_file = None

        name = request.data.get('name', '').strip()
        if not name and uploaded_file:
            raw_base = os.path.splitext(uploaded_file.name)[0]
            name = raw_base.replace('_', ' ').replace('-', ' ').title()

        if not name:
            return Response({'error': 'Document name is required.'}, status=status.HTTP_400_BAD_REQUEST)

        doc_type = request.data.get('type') or request.data.get('document_type') or 'Identification'
        valid_types = [t[0] for t in OnboardingDocument.DOCUMENT_TYPES]
        if doc_type not in valid_types:
            doc_type = 'Identification'

        now_str = timezone.now().strftime("%b %d, %Y")
        is_req = request.data.get('is_required', request.data.get('required', True))
        if isinstance(is_req, str):
            is_req = is_req.lower() in ('true', '1')

        doc = OnboardingDocument.objects.create(
            employee=employee,
            name=name,
            document_type=doc_type,
            file=uploaded_file,
            upload_status='Uploaded',
            verification_status='Pending Verification',
            date_str=now_str,
            size_str=size_str,
            remarks='Submitted by employee. Awaiting verification by HR Operations.',
            is_required=is_req
        )

        # Trigger notification to HR and Admins
        notify_hr_and_admins(
            notification_type=Notification.TYPE_DOCUMENT_UPLOADED,
            title="New document uploaded",
            message=f"{employee.name} uploaded {doc.name} ({doc.document_type}).",
            action_url=f"/hr/employees/{employee.id}",
            related_object_type="OnboardingDocument",
            related_object_id=doc.id,
            exclude_user=request.user,
            prevent_duplicates=True
        )

        serializer = self.get_serializer(doc)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        doc = self.get_object()
        if not doc.file:
            return Response({'detail': 'No physical file associated with this document record.'}, status=status.HTTP_404_NOT_FOUND)

        employee = get_current_employee(request)
        is_owner = (doc.employee == employee)
        is_hr_or_admin = request.user.is_superuser or (employee and employee.system_role in ['HR_MANAGER', 'ADMIN'])
        if not (is_owner or is_hr_or_admin):
            return Response({'detail': 'You do not have permission to access this document.'}, status=status.HTTP_403_FORBIDDEN)

        guessed_type, _ = mimetypes.guess_type(doc.file.name)
        content_type = guessed_type or 'application/octet-stream'

        response = FileResponse(doc.file.open('rb'), content_type=content_type)
        response['Content-Disposition'] = f'inline; filename="{os.path.basename(doc.file.name)}"'
        return response

    @action(detail=True, methods=['patch'])
    def verify(self, request, pk=None):
        employee = get_current_employee(request)
        is_hr_or_admin = bool(
            request.user.is_superuser or
            (employee and employee.system_role in [Employee.ROLE_HR_MANAGER, Employee.ROLE_ADMIN])
        )
        if not is_hr_or_admin:
            return Response(
                {'detail': 'Only HR Managers and Administrators can verify documents.'},
                status=status.HTTP_403_FORBIDDEN
            )

        doc = self.get_object()
        new_status = request.data.get('verificationStatus', request.data.get('verification_status', 'Verified'))
        valid_statuses = ['Not Uploaded', 'Pending Verification', 'Verified', 'Rejected']
        if new_status not in valid_statuses:
            return Response(
                {'error': f"Invalid status '{new_status}'. Allowed: {', '.join(valid_statuses)}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        remarks = request.data.get('remarks', 'Verified by HR Operations.')
        doc.verification_status = new_status
        doc.remarks = remarks
        doc.save()

        # Trigger notification to document owner
        if doc.employee and doc.employee.user:
            if new_status == 'Verified':
                create_notification(
                    recipient=doc.employee.user,
                    notification_type=Notification.TYPE_DOCUMENT_VERIFIED,
                    title="Document verified",
                    message="Your document has been verified.",
                    action_url="/documents",
                    related_object_type="OnboardingDocument",
                    related_object_id=doc.id,
                    prevent_duplicates=True
                )
            elif new_status == 'Rejected':
                create_notification(
                    recipient=doc.employee.user,
                    notification_type=Notification.TYPE_DOCUMENT_REJECTED,
                    title="Document needs attention",
                    message="Your document needs attention.",
                    action_url="/documents",
                    related_object_type="OnboardingDocument",
                    related_object_id=doc.id,
                    prevent_duplicates=True
                )

        # Check if all required documents verified -> complete documents stage for target employee
        target_employee = doc.employee
        if target_employee:
            required_docs = OnboardingDocument.objects.filter(employee=target_employee, is_required=True)
            if required_docs.exists() and not required_docs.exclude(verification_status='Verified').exists():
                stage = OnboardingStage.objects.filter(stage_id='documents').first()
                if stage:
                    EmployeeStageProgress.objects.update_or_create(
                        employee=target_employee,
                        stage=stage,
                        defaults={'status': 'completed', 'is_completed': True}
                    )

        return Response(self.get_serializer(doc).data)


# ==============================================================================
# 4. OFFER LETTER
# ==============================================================================

def generate_offer_signature_hash(offer, employee, signature_name, timestamp_str):
    """Generate a tamper-evident SHA-256 digital signature hash."""
    salt = "NOVATECH_OFFER_VERIFICATION_2026"
    raw_payload = f"{salt}:{offer.ref_no}:{employee.employee_id}:{signature_name}:{offer.ctc}:{timestamp_str}"
    return f"SHA256:{hashlib.sha256(raw_payload.encode('utf-8')).hexdigest()}"


def execute_offer_acceptance(request):
    """Shared acceptance logic for /offer-letter/ and /offer-letter/accept/."""
    employee = get_current_employee(request)
    offer, _ = OfferLetter.objects.get_or_create(
        employee=employee,
        defaults={
            'ref_no': f"NOVA/OFFER/2026/{employee.employee_id.split('-')[-1]}",
            'employee': employee,
            'ctc': '₹14,50,000 per annum'
        }
    )
    sig = request.data.get('signature', '').strip() or employee.name
    now_str = timezone.now().strftime("%B %d, %Y at %I:%M %p IST")

    offer.is_accepted = True
    offer.accepted_at = now_str
    offer.signature = sig
    offer.signature_hash = generate_offer_signature_hash(offer, employee, sig, now_str)
    offer.save()

    # Trigger notification to HR and Admins
    notify_hr_and_admins(
        notification_type=Notification.TYPE_OFFER_LETTER,
        title="Offer letter accepted",
        message=f"{employee.name} digitally signed and accepted the offer letter ({offer.ref_no}).",
        action_url=f"/hr/employees/{employee.id}",
        related_object_type="OfferLetter",
        related_object_id=offer.id,
        exclude_user=request.user,
        prevent_duplicates=True
    )

    # Mark stage completed
    stage = OnboardingStage.objects.filter(stage_id='offerLetter').first()
    if stage:
        EmployeeStageProgress.objects.update_or_create(
            employee=employee,
            stage=stage,
            defaults={'status': 'completed', 'is_completed': True}
        )

    serializer = OfferLetterSerializer(offer)
    return Response(serializer.data)


class OfferLetterView(APIView):
    """GET /api/v1/offer-letter/ and POST /api/v1/offer-letter/"""
    def get(self, request):
        employee = get_current_employee(request)
        offer, _ = OfferLetter.objects.get_or_create(
            employee=employee,
            defaults={
                'ref_no': f"NOVA/OFFER/2026/{employee.employee_id.split('-')[-1]}",
                'employee': employee,
                'ctc': '₹14,50,000 per annum'
            }
        )
        serializer = OfferLetterSerializer(offer)
        return Response(serializer.data)

    def post(self, request):
        return execute_offer_acceptance(request)


class OfferLetterAcceptView(APIView):
    """POST /api/v1/offer-letter/accept/ - Explicit acceptance endpoint."""
    def post(self, request):
        return execute_offer_acceptance(request)


# ==============================================================================
# 5. COMPANY POLICIES
# ==============================================================================

class CompanyPolicyViewSet(viewsets.ReadOnlyModelViewSet):
    """
    GET /api/v1/policies/
    POST /api/v1/policies/{id}/acknowledge/
    """
    serializer_class = CompanyPolicySerializer
    queryset = CompanyPolicy.objects.all().order_by('id')

    def get_object(self):
        lookup = self.kwargs.get('pk')
        policy = CompanyPolicy.objects.filter(policy_id=lookup).first()
        if not policy and str(lookup).isdigit():
            policy = CompanyPolicy.objects.filter(pk=int(lookup)).first()
        if not policy:
            raise Http404(f"No CompanyPolicy found for '{lookup}'.")
        return policy

    @action(detail=True, methods=['post'])
    def acknowledge(self, request, pk=None):
        policy = self.get_object()
        employee = get_current_employee(request)
        now_str = timezone.now().strftime("%b %d, %Y")

        ack, _ = PolicyAcknowledgement.objects.update_or_create(
            employee=employee,
            policy=policy,
            defaults={'acknowledged': True, 'acknowledged_at': now_str}
        )

        # Trigger notification to HR and Admins
        notify_hr_and_admins(
            notification_type=Notification.TYPE_POLICY_ACKNOWLEDGED,
            title="Policy acknowledged",
            message=f"{employee.name} acknowledged '{policy.title}'.",
            action_url=f"/hr/employees/{employee.id}",
            related_object_type="CompanyPolicy",
            related_object_id=policy.id,
            exclude_user=request.user,
            prevent_duplicates=True
        )

        # Check if all policies acknowledged
        total_policies = CompanyPolicy.objects.count()
        acked_count = PolicyAcknowledgement.objects.filter(employee=employee, acknowledged=True).count()
        if total_policies > 0 and acked_count >= total_policies:
            stage = OnboardingStage.objects.filter(stage_id='policies').first()
            if stage:
                EmployeeStageProgress.objects.update_or_create(
                    employee=employee,
                    stage=stage,
                    defaults={'status': 'completed', 'is_completed': True}
                )

        return Response({
            'success': True,
            'policyId': policy.policy_id,
            'acknowledged': True,
            'acknowledgedAt': now_str
        })


# ==============================================================================
# 6. TRAINING MODULES
# ==============================================================================

class TrainingModuleViewSet(viewsets.ReadOnlyModelViewSet):
    """
    GET /api/v1/training/
    POST /api/v1/training/{id}/progress/
    """
    serializer_class = TrainingModuleSerializer
    queryset = TrainingModule.objects.all().order_by('id')

    def get_object(self):
        lookup = self.kwargs.get('pk')
        module = TrainingModule.objects.filter(module_id=lookup).first()
        if not module and str(lookup).isdigit():
            module = TrainingModule.objects.filter(pk=int(lookup)).first()
        if not module:
            raise Http404(f"No TrainingModule found for '{lookup}'.")
        return module

    @action(detail=True, methods=['post'])
    def progress(self, request, pk=None):
        module = self.get_object()
        employee = get_current_employee(request)

        raw_prog = request.data.get('progress')
        if raw_prog is None:
            return Response({'error': 'Field "progress" is required.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            prog_val = int(raw_prog)
        except (ValueError, TypeError):
            return Response({'error': 'Progress must be an integer between 0 and 100.'}, status=status.HTTP_400_BAD_REQUEST)

        if not (0 <= prog_val <= 100):
            return Response({'error': 'Progress must be between 0 and 100.'}, status=status.HTTP_400_BAD_REQUEST)

        # Automatically determine status
        if prog_val == 100:
            status_val = 'Completed'
            completed_count = module.modules_count
        elif prog_val > 0:
            status_val = 'In Progress'
            completed_count = max(1, int(round((prog_val / 100.0) * module.modules_count)))
        else:
            status_val = 'Not Started'
            completed_count = 0

        tp, _ = EmployeeTrainingProgress.objects.update_or_create(
            employee=employee,
            module=module,
            defaults={
                'progress': prog_val,
                'status': status_val,
                'completed_modules': completed_count
            }
        )

        # Trigger notification to HR and Admins on completion
        if status_val == 'Completed':
            notify_hr_and_admins(
                notification_type=Notification.TYPE_TRAINING_COMPLETED,
                title="Training module completed",
                message=f"{employee.name} completed the training module '{module.title}'.",
                action_url=f"/hr/employees/{employee.id}",
                related_object_type="TrainingModule",
                related_object_id=module.id,
                exclude_user=request.user,
                prevent_duplicates=True
            )

        # Check if all modules completed
        total_modules = TrainingModule.objects.count()
        finished_count = EmployeeTrainingProgress.objects.filter(employee=employee, progress=100).count()
        if total_modules > 0 and finished_count >= total_modules:
            stage = OnboardingStage.objects.filter(stage_id='training').first()
            if stage:
                EmployeeStageProgress.objects.update_or_create(
                    employee=employee,
                    stage=stage,
                    defaults={'status': 'completed', 'is_completed': True}
                )

        return Response({
            'success': True,
            'moduleId': module.module_id,
            'progress': prog_val,
            'status': status_val,
            'completedModules': completed_count,
            'completedAt': timezone.now().isoformat() if prog_val == 100 else None
        })


# ==============================================================================
# 7. ONBOARDING QUIZ
# ==============================================================================

class QuizViewSet(viewsets.ReadOnlyModelViewSet):
    """
    GET /api/v1/quiz/
    POST /api/v1/quiz/submit/
    """
    serializer_class = QuizQuestionSerializer
    queryset = QuizQuestion.objects.all().order_by('id')

    @action(detail=False, methods=['post'])
    def submit(self, request):
        employee = get_current_employee(request)
        answers = request.data.get('answers', {})
        if not isinstance(answers, dict):
            return Response({'error': 'Field "answers" must be a dictionary/object.'}, status=status.HTTP_400_BAD_REQUEST)

        questions = QuizQuestion.objects.all()
        total = questions.count()

        # Server-side calculation ONLY - client-provided scores are never trusted
        correct_count = 0
        for q in questions:
            user_choice = answers.get(q.question_id)
            if user_choice is None and str(q.pk) in answers:
                user_choice = answers.get(str(q.pk))
            if user_choice == q.correct_answer:
                correct_count += 1

        if total == 0:
            total = len(answers) or 5

        percentage = round((correct_count / total) * 100) if total > 0 else 0
        is_passed = percentage >= 70
        attempt_count = QuizSubmission.objects.filter(employee=employee).count() + 1

        sub = QuizSubmission.objects.create(
            employee=employee,
            score=correct_count,
            total_questions=total,
            percentage=percentage,
            is_passed=is_passed,
            user_answers=answers,
            attempts=attempt_count
        )

        if is_passed:
            stage = OnboardingStage.objects.filter(stage_id='quiz').first()
            if stage:
                EmployeeStageProgress.objects.update_or_create(
                    employee=employee,
                    stage=stage,
                    defaults={'status': 'completed', 'is_completed': True}
                )

        return Response({
            'score': correct_count,
            'totalQuestions': total,
            'percentage': percentage,
            'isPassed': is_passed,
            'userAnswers': answers,
            'attempts': attempt_count,
            'isSubmitted': True
        })


# ==============================================================================
# 8. FIRST DAY PLAN
# ==============================================================================

class FirstDaySessionViewSet(viewsets.ModelViewSet):
    """
    GET /api/v1/first-day/
    PATCH /api/v1/first-day/{id}/
    POST /api/v1/first-day/confirm/
    """
    serializer_class = FirstDaySessionSerializer
    queryset = FirstDaySession.objects.all().order_by('order')

    def get_object(self):
        lookup = self.kwargs.get('pk')
        obj = FirstDaySession.objects.filter(session_id=lookup).first()
        if not obj and str(lookup).isdigit():
            obj = FirstDaySession.objects.filter(pk=int(lookup)).first()
        if not obj:
            raise Http404(f"No FirstDaySession found for '{lookup}'.")
        return obj

    def partial_update(self, request, *args, **kwargs):
        session = self.get_object()
        employee = get_current_employee(request)
        new_status = request.data.get('status', 'completed')
        valid_statuses = ['upcoming', 'in-progress', 'completed']
        if new_status not in valid_statuses:
            return Response(
                {'error': f"Invalid status '{new_status}'. Allowed values: {', '.join(valid_statuses)}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        fdp, _ = FirstDayProgress.objects.update_or_create(
            employee=employee,
            session=session,
            defaults={'status': new_status}
        )
        return Response({
            'success': True,
            'sessionId': session.session_id,
            'status': new_status
        })

    @action(detail=True, methods=['patch'])
    def toggle(self, request, pk=None):
        return self.partial_update(request, pk=pk)

    @action(detail=False, methods=['post'])
    def confirm(self, request):
        employee = get_current_employee(request)
        stage = OnboardingStage.objects.filter(stage_id='firstDay').first()
        if stage:
            EmployeeStageProgress.objects.update_or_create(
                employee=employee,
                stage=stage,
                defaults={'status': 'completed', 'is_completed': True}
            )

        # Trigger notification to HR and Admins
        notify_hr_and_admins(
            notification_type=Notification.TYPE_FIRST_DAY_CONFIRMED,
            title="First-day schedule confirmed",
            message=f"{employee.name} confirmed their first-day orientation schedule.",
            action_url=f"/hr/employees/{employee.id}",
            related_object_type="FirstDayPlan",
            exclude_user=request.user,
            prevent_duplicates=True
        )

        return Response({'success': True, 'confirmed': True})


# ==============================================================================
# 9. FEEDBACK
# ==============================================================================

class OnboardingFeedbackView(APIView):
    """
    GET, POST /api/v1/feedback/
    """
    def get(self, request):
        employee = get_current_employee(request)
        feedback = OnboardingFeedback.objects.filter(employee=employee).last()
        if feedback:
            serializer = OnboardingFeedbackSerializer(feedback)
            return Response(serializer.data)
        return Response({
            'ratings': {'journey': 5, 'documentation': 5, 'support': 5, 'training': 5},
            'npsScore': 10,
            'comments': '',
            'isSubmitted': False,
            'submittedAt': None
        })

    def post(self, request):
        employee = get_current_employee(request)
        ratings = request.data.get('ratings', {'journey': 5, 'documentation': 5, 'support': 5, 'training': 5})
        nps = request.data.get('npsScore', request.data.get('nps_score', 10))
        comments = request.data.get('comments', '')
        now_str = timezone.now().strftime("%b %d, %Y")

        try:
            nps = int(nps)
            if not (0 <= nps <= 10):
                return Response({'error': 'NPS score must be between 0 and 10.'}, status=status.HTTP_400_BAD_REQUEST)
        except (ValueError, TypeError):
            return Response({'error': 'NPS score must be an integer.'}, status=status.HTTP_400_BAD_REQUEST)

        feedback = OnboardingFeedback.objects.create(
            employee=employee,
            rating_journey=ratings.get('journey', 5),
            rating_documentation=ratings.get('documentation', 5),
            rating_support=ratings.get('support', 5),
            rating_training=ratings.get('training', 5),
            nps_score=nps,
            comments=comments,
            is_submitted=True,
            submitted_at=now_str
        )

        # Mark feedback and completed stages
        stage = OnboardingStage.objects.filter(stage_id='feedback').first()
        if stage:
            EmployeeStageProgress.objects.update_or_create(
                employee=employee,
                stage=stage,
                defaults={'status': 'completed', 'is_completed': True}
            )

        comp_stage = OnboardingStage.objects.filter(stage_id='completed').first()
        if comp_stage:
            EmployeeStageProgress.objects.update_or_create(
                employee=employee,
                stage=comp_stage,
                defaults={'status': 'completed', 'is_completed': True}
            )

        # Trigger notification to HR and Admins
        notify_hr_and_admins(
            notification_type=Notification.TYPE_FEEDBACK_REQUEST,
            title="Onboarding feedback submitted",
            message=f"{employee.name} submitted onboarding feedback (NPS: {nps}/10).",
            action_url=f"/hr/employees/{employee.id}",
            related_object_type="OnboardingFeedback",
            related_object_id=feedback.id,
            exclude_user=request.user,
            prevent_duplicates=True
        )

        serializer = OnboardingFeedbackSerializer(feedback)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


# ==============================================================================
# 10. ONBOARDING STAGES
# ==============================================================================

class OnboardingStageViewSet(viewsets.ReadOnlyModelViewSet):
    """
    GET /api/v1/stages/
    POST /api/v1/stages/{key}/toggle/
    """
    serializer_class = OnboardingStageSerializer
    lookup_field = 'stage_id'
    lookup_url_kwarg = 'key'
    lookup_value_regex = '[^/]+'

    def get_queryset(self):
        if OnboardingStage.objects.count() < 10:
            ensure_default_stages()
        return OnboardingStage.objects.filter(is_active=True).order_by('stage_number')

    def get_object(self):
        key = self.kwargs.get(self.lookup_url_kwarg or self.lookup_field)
        queryset = self.get_queryset()
        obj = queryset.filter(stage_id=key).first()
        if not obj and str(key).isdigit():
            obj = queryset.filter(pk=int(key)).first()
        if not obj and str(key).isdigit():
            obj = queryset.filter(stage_number=int(key)).first()
        if not obj:
            raise Http404(f"No OnboardingStage matches key '{key}'.")
        return obj

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        stages_data = serializer.data
        total_count = len(stages_data)
        completed_count = sum(1 for s in stages_data if s.get('isCompleted') or s.get('status') == 'completed')
        overall_progress = round((completed_count / total_count) * 100) if total_count > 0 else 0

        # If summary/dict format requested
        if request.query_params.get('format') == 'summary' or request.query_params.get('summary') == 'true':
            return Response({
                'stages': stages_data,
                'overallProgress': overall_progress,
                'overall_progress': overall_progress,
                'completedStages': completed_count,
                'totalStages': total_count
            })

        # By default, return list with overallProgress in headers
        response = Response(stages_data)
        response['X-Overall-Progress'] = str(overall_progress)
        response['X-Completed-Stages'] = str(completed_count)
        response['X-Total-Stages'] = str(total_count)
        return response

    @action(detail=True, methods=['post'])
    def toggle(self, request, key=None):
        stage = self.get_object()
        employee = get_current_employee(request)
        sp, _ = EmployeeStageProgress.objects.get_or_create(employee=employee, stage=stage)

        sp.is_completed = not sp.is_completed
        sp.status = 'completed' if sp.is_completed else 'pending'
        sp.save()

        # Recalculate overall progress
        total_stages = OnboardingStage.objects.filter(is_active=True).count()
        completed_count = EmployeeStageProgress.objects.filter(
            employee=employee, stage__is_active=True, is_completed=True
        ).count()
        overall_progress = round((completed_count / total_stages) * 100) if total_stages > 0 else 0

        return Response({
            'success': True,
            'stageId': stage.stage_id,
            'status': sp.status,
            'isCompleted': sp.is_completed,
            'overallProgress': overall_progress
        })


# ==============================================================================
# 10. CANDIDATE INVITATIONS & SECURE REGISTRATION (PHASE 3 STEP 4)
# ==============================================================================

def generate_unique_employee_id():
    """Generates a guaranteed unique employee ID server-side in the format EMP-2026-XXXX."""
    import random
    while True:
        suffix = f"{random.randint(1000, 9999)}"
        candidate_id = f"EMP-2026-{suffix}"
        if not Employee.objects.filter(employee_id=candidate_id).exists() and not CandidateInvitation.objects.filter(employee_id=candidate_id).exists():
            return candidate_id


class CandidateInvitationViewSet(viewsets.ModelViewSet):
    """
    Candidate invitation management:
    GET /api/v1/invitations/ -> List all invitations (HR_MANAGER / ADMIN)
    POST /api/v1/invitations/ -> Issue a new invitation (HR_MANAGER / ADMIN)
    POST /api/v1/invitations/{id}/cancel/ -> Cancel an unexpired pending invitation (HR_MANAGER / ADMIN)
    """
    serializer_class = CandidateInvitationSerializer
    permission_classes = [IsAuthenticated, IsHROrAdmin]
    http_method_names = ['get', 'post', 'head', 'options']

    def get_queryset(self):
        return CandidateInvitation.objects.all().order_by('-created_at')

    def create(self, request, *args, **kwargs):
        email = request.data.get('email', '').strip().lower()
        full_name = request.data.get('full_name', request.data.get('fullName', '')).strip()

        if not email:
            return Response({'error': 'Email address is required.'}, status=status.HTTP_400_BAD_REQUEST)

        if '@' not in email or '.' not in email.split('@')[-1]:
            return Response({'error': 'Please provide a valid email address.'}, status=status.HTTP_400_BAD_REQUEST)

        if not full_name:
            return Response({'error': 'Candidate full name is required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Check whether email already belongs to an existing User
        if User.objects.filter(email__iexact=email).exists():
            return Response(
                {'error': 'A user account with this email address already exists in the system.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check whether an active pending invitation already exists for this email
        active_pending = CandidateInvitation.objects.filter(
            email__iexact=email,
            status=CandidateInvitation.STATUS_PENDING,
            expires_at__gt=timezone.now()
        ).first()
        if active_pending:
            return Response(
                {'error': 'An active pending invitation for this email address already exists.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        job_title = request.data.get('job_title', request.data.get('jobTitle', 'Software Engineer')).strip() or 'Software Engineer'
        department = request.data.get('department', 'Data & Technology').strip() or 'Data & Technology'
        joining_date = request.data.get('joining_date', request.data.get('joiningDate', 'Monday, October 19, 2026')).strip() or 'Monday, October 19, 2026'
        manager = request.data.get('manager', 'Arjun Mehta').strip() or 'Arjun Mehta'

        # Generate unique employee ID for candidate
        emp_id = generate_unique_employee_id()

        # Cryptographically secure random token (32 bytes url-safe)
        raw_token = secrets.token_urlsafe(32)
        token_hash = hashlib.sha256(raw_token.encode('utf-8')).hexdigest()

        # 48-hour expiration
        expires_at = timezone.now() + timezone.timedelta(hours=48)

        # Configurable frontend base URL (supports local dev and deployed Vercel URL)
        frontend_base = getattr(settings, 'FRONTEND_URL', None) or request.headers.get('Origin') or 'https://digital-employee-onboarding-system.vercel.app'
        invitation_url = f"{frontend_base.rstrip('/')}/register?token={raw_token}"

        # Transactional execution: do not report success or save invitation if email delivery fails
        try:
            with transaction.atomic():
                invitation = CandidateInvitation.objects.create(
                    email=email,
                    full_name=full_name,
                    employee_id=emp_id,
                    job_title=job_title,
                    department=department,
                    joining_date=joining_date,
                    manager=manager,
                    invited_by=request.user,
                    token_hash=token_hash,
                    expires_at=expires_at,
                    status=CandidateInvitation.STATUS_PENDING
                )

                # Send real email to candidate personal email address
                send_invitation_email(invitation, raw_token, invitation_url)

                # Trigger in-app notification without exposing invitation token or token_hash
                notify_hr_and_admins(
                    notification_type=Notification.TYPE_CANDIDATE_INVITATION,
                    title="Candidate invitation issued",
                    message=f"Candidate invitation sent to {email} for {full_name} ({job_title}, {department}).",
                    action_url="/invitations",
                    related_object_type="CandidateInvitation",
                    related_object_id=invitation.id,
                    exclude_user=request.user,
                    prevent_duplicates=True
                )

                AdminAuditLog.objects.create(
                    admin=request.user if request.user.is_authenticated else None,
                    action=AdminAuditLog.ACTION_CONFIG_CHANGE,
                    target_type='CandidateInvitation',
                    target_id=str(invitation.id),
                    description=f"Candidate onboarding invitation issued and email sent to {email}."
                )

        except EmailDeliveryError as exc:
            return Response(
                {
                    'error': f"Failed to deliver invitation email to {email}: {str(exc)}",
                    'detail': str(exc),
                    'email_sent': False
                },
                status=status.HTTP_502_BAD_GATEWAY
            )
        except Exception as exc:
            return Response(
                {
                    'error': f"Failed to process candidate invitation: {str(exc)}",
                    'email_sent': False
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        serializer = self.get_serializer(invitation)
        data = serializer.data
        data['invitation_url'] = invitation_url
        data['invitationUrl'] = invitation_url
        data['raw_token'] = raw_token
        data['email_sent'] = True
        data['email_recipient'] = email

        return Response(data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def resend(self, request, pk=None):
        """
        POST /api/v1/invitations/{id}/resend/
        Resends the onboarding invitation email with a freshly generated 48-hour secure token.
        """
        invitation = self.get_object()
        if invitation.status == CandidateInvitation.STATUS_ACCEPTED:
            return Response(
                {'error': 'Cannot resend an invitation that has already been accepted.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        if invitation.status == CandidateInvitation.STATUS_CANCELLED:
            return Response(
                {'error': 'Cannot resend a cancelled invitation. Please create a new invitation instead.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        raw_token = secrets.token_urlsafe(32)
        token_hash = hashlib.sha256(raw_token.encode('utf-8')).hexdigest()
        expires_at = timezone.now() + timezone.timedelta(hours=48)

        frontend_base = getattr(settings, 'FRONTEND_URL', None) or request.headers.get('Origin') or 'https://digital-employee-onboarding-system.vercel.app'
        invitation_url = f"{frontend_base.rstrip('/')}/register?token={raw_token}"

        try:
            with transaction.atomic():
                invitation.token_hash = token_hash
                invitation.expires_at = expires_at
                invitation.status = CandidateInvitation.STATUS_PENDING
                invitation.save()

                # Deliver fresh email
                send_invitation_email(invitation, raw_token, invitation_url)

                AdminAuditLog.objects.create(
                    admin=request.user if request.user.is_authenticated else None,
                    action=AdminAuditLog.ACTION_CONFIG_CHANGE,
                    target_type='CandidateInvitation',
                    target_id=str(invitation.id),
                    description=f"Candidate onboarding invitation resent to {invitation.email}."
                )
        except EmailDeliveryError as exc:
            return Response(
                {
                    'error': f"Failed to resend invitation email to {invitation.email}: {str(exc)}",
                    'detail': str(exc),
                    'email_sent': False
                },
                status=status.HTTP_502_BAD_GATEWAY
            )
        except Exception as exc:
            return Response(
                {
                    'error': f"Failed to resend invitation: {str(exc)}",
                    'email_sent': False
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        data = self.get_serializer(invitation).data
        data['invitation_url'] = invitation_url
        data['invitationUrl'] = invitation_url
        data['raw_token'] = raw_token
        data['email_sent'] = True
        data['email_recipient'] = invitation.email
        return Response(data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        invitation = self.get_object()
        if invitation.status == CandidateInvitation.STATUS_ACCEPTED:
            return Response(
                {'error': 'Cannot cancel an already accepted invitation.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        if invitation.is_expired:
            return Response(
                {'error': 'Cannot cancel an expired invitation.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        if invitation.status == CandidateInvitation.STATUS_CANCELLED:
            return Response(
                {'error': 'This invitation is already cancelled.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        invitation.status = CandidateInvitation.STATUS_CANCELLED
        invitation.save()
        return Response(self.get_serializer(invitation).data, status=status.HTTP_200_OK)


class CandidateInvitationPreviewView(APIView):
    """
    GET /api/v1/invitations/preview/?token=...
    Public preview endpoint for candidates opening the /register page.
    Validates token without consuming it.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        token = request.query_params.get('token', '').strip()
        if not token:
            return Response(
                {'error': 'Invitation token parameter is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        token_hash = hashlib.sha256(token.encode('utf-8')).hexdigest()
        invitation = CandidateInvitation.objects.filter(token_hash=token_hash).first()

        if not invitation:
            return Response(
                {'error': 'Invalid or unrecognized invitation token. Please check the invitation URL.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if invitation.status == CandidateInvitation.STATUS_ACCEPTED:
            return Response(
                {'error': 'This invitation has already been accepted. Please proceed to the login page.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if invitation.status == CandidateInvitation.STATUS_CANCELLED:
            return Response(
                {'error': 'This invitation has been cancelled by HR Operations.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if invitation.is_expired:
            invitation.status = CandidateInvitation.STATUS_EXPIRED
            invitation.save()
            return Response(
                {'error': 'This invitation has expired (valid for 48 hours). Please contact HR Operations for a fresh invite.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = CandidateInvitationPreviewSerializer(invitation)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CandidateInvitationAcceptView(APIView):
    """
    POST /api/v1/invitations/accept/
    Public registration endpoint: candidate sets password and completes account registration.
    Creates Django User, Employee (strictly ROLE_EMPLOYEE), EmployeeProfile, and stages progress.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get('token', '').strip()
        password = request.data.get('password', '')
        confirm_password = request.data.get('confirm_password', request.data.get('confirmPassword', ''))

        if not token:
            return Response({'error': 'Invitation token is required.'}, status=status.HTTP_400_BAD_REQUEST)

        if not password:
            return Response({'error': 'Password is required.'}, status=status.HTTP_400_BAD_REQUEST)

        if password != confirm_password:
            return Response({'error': 'Password and confirm password do not match.'}, status=status.HTTP_400_BAD_REQUEST)

        token_hash = hashlib.sha256(token.encode('utf-8')).hexdigest()
        invitation = CandidateInvitation.objects.filter(token_hash=token_hash).first()

        if not invitation:
            return Response(
                {'error': 'Invalid or unrecognized invitation token.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if invitation.status == CandidateInvitation.STATUS_ACCEPTED:
            return Response(
                {'error': 'This invitation has already been accepted.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if invitation.status == CandidateInvitation.STATUS_CANCELLED:
            return Response(
                {'error': 'This invitation has been cancelled.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if invitation.is_expired:
            invitation.status = CandidateInvitation.STATUS_EXPIRED
            invitation.save()
            return Response(
                {'error': 'This invitation has expired.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate password strength via Django
        try:
            validate_password(password)
        except DjangoValidationError as exc:
            return Response({'error': ' '.join(exc.messages)}, status=status.HTTP_400_BAD_REQUEST)

        # Atomic transaction: User, Employee, Profile, Progress, and Invitation update
        with transaction.atomic():
            # Check user account existence
            existing_user = User.objects.filter(email__iexact=invitation.email).first()
            if existing_user:
                if existing_user.is_active and existing_user.has_usable_password():
                    return Response(
                        {'error': 'A registered user account with this email address already exists. Please sign in directly.'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                # Activate preexisting inactive user
                user = existing_user
                user.set_password(password)
                user.is_active = True
                user.save()
            else:
                # Determine unique username
                email_prefix = invitation.email.split('@')[0].lower().replace('.', '_').replace('-', '_')
                username = email_prefix
                counter = 1
                while User.objects.filter(username__iexact=username).exists():
                    username = f"{email_prefix}_{counter}"
                    counter += 1

                first_name = invitation.full_name.split()[0] if invitation.full_name else ''
                last_name = " ".join(invitation.full_name.split()[1:]) if len(invitation.full_name.split()) > 1 else ''
                user = User.objects.create_user(
                    username=username,
                    email=invitation.email,
                    password=password,
                    first_name=first_name,
                    last_name=last_name
                )

            # Determine employee ID
            emp_id = invitation.employee_id or generate_unique_employee_id()

            # Associate with existing unlinked employee or create new Employee
            # Strictly enforces ROLE_EMPLOYEE (never trust client)
            phone = request.data.get('phone', '+91 98765 43210')
            existing_emp = Employee.objects.filter(
                Q(email__iexact=invitation.email) | Q(employee_id__iexact=emp_id)
            ).first()

            if existing_emp:
                employee = existing_emp
                employee.user = user
                employee.name = invitation.full_name
                employee.role = invitation.job_title
                employee.designation = invitation.job_title
                employee.department = invitation.department
                employee.system_role = Employee.ROLE_EMPLOYEE
                employee.joining_date = invitation.joining_date
                employee.manager_name = invitation.manager
                employee.save()
            else:
                employee = Employee.objects.create(
                    user=user,
                    employee_id=emp_id,
                    name=invitation.full_name,
                    email=invitation.email,
                    role=invitation.job_title,
                    designation=invitation.job_title,
                    department=invitation.department,
                    system_role=Employee.ROLE_EMPLOYEE,
                    joining_date=invitation.joining_date,
                    location="NOVA Tech – Chandigarh Office",
                    work_mode="Hybrid (3 Days Office / 2 Days Remote)",
                    manager_name=invitation.manager,
                    manager_role="Engineering Director",
                    manager_email="arjun.mehta@novatech.io"
                )

            # Create or update EmployeeProfile
            EmployeeProfile.objects.get_or_create(
                employee=employee,
                defaults={
                    'phone': phone,
                    'city': "Chandigarh",
                    'is_completed': False
                }
            )

            # Ensure core stages exist and initialize progress
            ensure_default_stages()
            for stage in OnboardingStage.objects.all():
                EmployeeStageProgress.objects.get_or_create(
                    employee=employee,
                    stage=stage,
                    defaults={'status': 'pending', 'is_completed': False}
                )

            # Mark invitation as accepted
            invitation.status = CandidateInvitation.STATUS_ACCEPTED
            invitation.accepted_at = timezone.now()
            invitation.employee_id = employee.employee_id
            invitation.save()

            # Generate SimpleJWT authentication tokens
            refresh = RefreshToken.for_user(user)
            access = refresh.access_token

            # Log audit event
            AdminAuditLog.objects.create(
                admin=user if (user.is_staff or getattr(getattr(user, 'employee', None), 'is_admin_role', False)) else None,
                action=AdminAuditLog.ACTION_ACCOUNT_ACTIVATED,
                target_type='User',
                target_id=str(user.id),
                description=f"Candidate invitation accepted and employee account activated ({employee.employee_id})."
            )

        # Send activation confirmation email
        send_activation_confirmation_email(employee)

        return Response({
            'success': True,
            'message': 'Registration successful. Your account has been created.',
            'access': str(access),
            'refresh': str(refresh),
            'username': user.username,
            'email': user.email,
            'employee_id': employee.employee_id,
            'employeeId': employee.employee_id,
            'name': employee.name,
            'system_role': employee.system_role,
            'systemRole': employee.system_role,
            'user': {
                'id': user.id,
                'username': user.username,
                'employee_id': employee.employee_id,
                'employeeId': employee.employee_id,
                'name': employee.name,
                'email': user.email,
                'role': employee.role,
                'system_role': employee.system_role,
                'systemRole': employee.system_role,
                'avatar': employee.avatar
            }
        }, status=status.HTTP_201_CREATED)


# ==============================================================================
# 11. HR PORTAL & CANDIDATE TRACKING DASHBOARD (PHASE 3 STEP 5)
# ==============================================================================

class HRDashboardView(APIView):
    """
    GET /api/v1/hr/dashboard/
    Operational dashboard metrics calculated live from DB for HR Managers and Admins.
    """
    permission_classes = [IsAuthenticated, IsHROrAdmin]

    def get(self, request):
        ensure_default_stages()
        total_employees = Employee.objects.count()

        # Total active stages per employee
        total_stages = OnboardingStage.objects.filter(is_active=True).count() or 10

        # Calculate employees onboarding vs completed
        completed_onboarding = 0
        onboarding_in_progress = 0

        for emp in Employee.objects.prefetch_related('stages_progress__stage').all():
            comp_count = emp.stages_progress.filter(stage__is_active=True, is_completed=True).count()
            if comp_count >= total_stages and total_stages > 0:
                completed_onboarding += 1
            else:
                onboarding_in_progress += 1

        # Pending documents: verification_status in ('Pending Verification', 'Not Uploaded')
        pending_documents = OnboardingDocument.objects.filter(
            verification_status__in=['Pending Verification', 'Not Uploaded']
        ).count()

        # Pending invitations: active, non-expired pending candidate invitations
        pending_invitations = CandidateInvitation.objects.filter(
            status=CandidateInvitation.STATUS_PENDING,
            expires_at__gt=timezone.now()
        ).count()

        # Accepted candidate invitations
        accepted_invitations = CandidateInvitation.objects.filter(
            status=CandidateInvitation.STATUS_ACCEPTED
        ).count()

        # Upcoming joiners: pending invites + accepted invites
        upcoming_joiners = CandidateInvitation.objects.filter(
            status__in=[CandidateInvitation.STATUS_PENDING, CandidateInvitation.STATUS_ACCEPTED]
        ).count()

        recent_employees = []
        for emp in Employee.objects.filter(system_role=Employee.ROLE_EMPLOYEE).order_by('-created_at')[:5]:
            comp_count = emp.stages_progress.filter(stage__is_active=True, is_completed=True).count()
            pct = round((comp_count / total_stages) * 100) if total_stages > 0 else 0
            recent_employees.append({
                'id': emp.id,
                'employee_id': emp.employee_id,
                'employeeId': emp.employee_id,
                'name': emp.name,
                'email': emp.email,
                'role': emp.role,
                'job_title': emp.role,
                'jobTitle': emp.role,
                'department': emp.department,
                'system_role': emp.system_role,
                'systemRole': emp.system_role,
                'joining_date': emp.joining_date,
                'joiningDate': emp.joining_date,
                'onboarding_progress': pct,
                'onboardingProgress': pct,
                'status': 'COMPLETED' if pct >= 100 else 'ONBOARDING',
                'avatar': emp.avatar
            })

        # Recent 5 invitations
        recent_invitations = []
        for inv in CandidateInvitation.objects.order_by('-created_at')[:5]:
            recent_invitations.append({
                'id': inv.id,
                'full_name': inv.full_name,
                'fullName': inv.full_name,
                'email': inv.email,
                'job_title': inv.job_title,
                'jobTitle': inv.job_title,
                'department': inv.department,
                'joining_date': inv.joining_date,
                'joiningDate': inv.joining_date,
                'status': inv.status,
                'created_at': inv.created_at,
                'createdAt': inv.created_at,
                'expires_at': inv.expires_at,
                'expiresAt': inv.expires_at,
                'is_expired': inv.is_expired,
                'isExpired': inv.is_expired
            })

        data = {
            'totalEmployees': total_employees,
            'total_employees': total_employees,
            'onboardingInProgress': onboarding_in_progress,
            'onboarding_in_progress': onboarding_in_progress,
            'completedOnboarding': completed_onboarding,
            'completed_onboarding': completed_onboarding,
            'pendingDocuments': pending_documents,
            'pending_documents': pending_documents,
            'pendingInvitations': pending_invitations,
            'pending_invitations': pending_invitations,
            'acceptedInvitations': accepted_invitations,
            'accepted_invitations': accepted_invitations,
            'upcomingJoiners': upcoming_joiners,
            'upcoming_joiners': upcoming_joiners,
            'recentEmployees': recent_employees,
            'recent_employees': recent_employees,
            'recentInvitations': recent_invitations,
            'recent_invitations': recent_invitations,
        }
        return Response(data, status=status.HTTP_200_OK)


class HREmployeeListView(APIView):
    """
    GET /api/v1/hr/employees/
    Searchable, filterable, and paginated list of employees & candidates for HR/Admin.
    Supports query parameters:
      - search: string (matches name, email, employee_id, role, department)
      - status: ALL | INVITED | ONBOARDING | COMPLETED
      - role: ALL | EMPLOYEE | HR_MANAGER | ADMIN
      - department: string
      - page: int (default 1)
      - page_size: int (default 20, max 100)
    """
    permission_classes = [IsAuthenticated, IsHROrAdmin]

    def get(self, request):
        ensure_default_stages()
        total_stages = OnboardingStage.objects.filter(is_active=True).count() or 10

        search_query = request.query_params.get('search', '').strip()
        status_filter = request.query_params.get('status', 'ALL').strip().upper()
        role_filter = request.query_params.get('role', 'ALL').strip().upper()
        dept_filter = request.query_params.get('department', '').strip()

        try:
            page = max(1, int(request.query_params.get('page', 1)))
        except (ValueError, TypeError):
            page = 1

        try:
            page_size = min(100, max(1, int(request.query_params.get('page_size', 20))))
        except (ValueError, TypeError):
            page_size = 20

        items = []

        # 1. Fetch & Filter Active Employees (unless filter is strictly INVITED)
        if status_filter != 'INVITED':
            emp_qs = Employee.objects.select_related('user').prefetch_related('stages_progress__stage').all()

            if role_filter in (Employee.ROLE_HR_MANAGER, Employee.ROLE_ADMIN):
                emp_qs = emp_qs.filter(system_role=role_filter)
            else:
                # The Candidates / Employees list and employee progress view strictly include only users whose actual role is EMPLOYEE
                emp_qs = emp_qs.filter(system_role=Employee.ROLE_EMPLOYEE)

            if dept_filter and dept_filter != 'ALL':
                emp_qs = emp_qs.filter(department__icontains=dept_filter)

            if search_query:
                emp_qs = emp_qs.filter(
                    Q(name__icontains=search_query) |
                    Q(email__icontains=search_query) |
                    Q(employee_id__icontains=search_query) |
                    Q(role__icontains=search_query) |
                    Q(designation__icontains=search_query) |
                    Q(department__icontains=search_query)
                )

            # Map invitations to employees for accurate status tracking
            emp_emails = [e.email.lower() for e in emp_qs if e.email]
            emp_ids = [e.employee_id for e in emp_qs if e.employee_id]
            inv_map = {}
            for inv in CandidateInvitation.objects.filter(Q(email__in=emp_emails) | Q(employee_id__in=emp_ids)):
                if inv.email:
                    inv_map[inv.email.lower()] = inv
                if inv.employee_id:
                    inv_map[inv.employee_id] = inv

            for emp in emp_qs.order_by('-created_at'):
                comp_count = emp.stages_progress.filter(stage__is_active=True, is_completed=True).count()
                pct = round((comp_count / total_stages) * 100) if total_stages > 0 else 0
                emp_status = 'COMPLETED' if (comp_count >= total_stages and total_stages > 0) else 'ONBOARDING'

                # Apply status filter
                if status_filter not in ('ALL', '', emp_status):
                    continue

                curr_incomplete = emp.stages_progress.filter(stage__is_active=True, is_completed=False).order_by('stage__stage_number').first()
                curr_stage_name = curr_incomplete.stage.title if curr_incomplete else ('Completed' if emp_status == 'COMPLETED' else 'Offer Letter')

                matched_inv = inv_map.get(emp.email.lower()) or inv_map.get(emp.employee_id)
                inv_status = matched_inv.status if matched_inv else ('ACCEPTED' if emp.user else 'ACTIVE')

                items.append({
                    'id': emp.id,
                    'employee_id': emp.employee_id,
                    'employeeId': emp.employee_id,
                    'name': emp.name,
                    'email': emp.email,
                    'job_title': emp.role or emp.designation,
                    'jobTitle': emp.role or emp.designation,
                    'department': emp.department,
                    'system_role': emp.system_role,
                    'systemRole': emp.system_role,
                    'joining_date': emp.joining_date,
                    'joiningDate': emp.joining_date,
                    'manager': emp.manager_name,
                    'onboarding_progress': pct,
                    'onboardingProgress': pct,
                    'current_stage': curr_stage_name,
                    'currentStage': curr_stage_name,
                    'status': emp_status,
                    'invitation_status': inv_status,
                    'invitationStatus': inv_status,
                    'avatar': emp.avatar,
                    'is_candidate': False,
                    'isCandidate': False
                })

        # 2. Fetch & Filter Candidate Invitations (if status is ALL or INVITED, and role is ALL or EMPLOYEE)
        if status_filter in ('ALL', 'INVITED', '') and role_filter in ('ALL', 'EMPLOYEE', ''):
            inv_qs = CandidateInvitation.objects.filter(status=CandidateInvitation.STATUS_PENDING)

            if dept_filter and dept_filter != 'ALL':
                inv_qs = inv_qs.filter(department__icontains=dept_filter)

            if search_query:
                inv_qs = inv_qs.filter(
                    Q(full_name__icontains=search_query) |
                    Q(email__icontains=search_query) |
                    Q(employee_id__icontains=search_query) |
                    Q(job_title__icontains=search_query) |
                    Q(department__icontains=search_query)
                )

            for inv in inv_qs.order_by('-created_at'):
                items.append({
                    'id': f"inv-{inv.id}",
                    'raw_id': inv.id,
                    'employee_id': inv.employee_id,
                    'employeeId': inv.employee_id,
                    'name': inv.full_name,
                    'email': inv.email,
                    'job_title': inv.job_title,
                    'jobTitle': inv.job_title,
                    'department': inv.department,
                    'system_role': Employee.ROLE_EMPLOYEE,
                    'systemRole': Employee.ROLE_EMPLOYEE,
                    'joining_date': inv.joining_date,
                    'joiningDate': inv.joining_date,
                    'manager': inv.manager,
                    'onboarding_progress': 0,
                    'onboardingProgress': 0,
                    'current_stage': 'Invitation Pending',
                    'currentStage': 'Invitation Pending',
                    'status': 'INVITED',
                    'invitation_status': inv.status,
                    'invitationStatus': inv.status,
                    'avatar': 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
                    'is_candidate': True,
                    'isCandidate': True,
                    'expires_at': inv.expires_at,
                    'expiresAt': inv.expires_at
                })

        total_count = len(items)
        total_pages = (total_count + page_size - 1) // page_size if total_count > 0 else 1
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size
        paginated_items = items[start_idx:end_idx]

        return Response({
            'count': total_count,
            'total_pages': total_pages,
            'totalPages': total_pages,
            'current_page': page,
            'currentPage': page,
            'page_size': page_size,
            'pageSize': page_size,
            'results': paginated_items
        }, status=status.HTTP_200_OK)


class HREmployeeDetailView(APIView):
    """
    GET /api/v1/hr/employees/{id}/
    Returns comprehensive, aggregated onboarding record for a specific employee.
    Strictly role-protected to HR Managers and Admins.
    """
    permission_classes = [IsAuthenticated, IsHROrAdmin]

    def get(self, request, pk=None):
        ensure_default_stages()
        emp = None

        if str(pk).startswith('inv-'):
            inv_id = str(pk).replace('inv-', '')
            inv = CandidateInvitation.objects.filter(pk=inv_id).first()
            if not inv:
                raise Http404("Candidate invitation not found.")
            return self._build_candidate_response(inv)

        if str(pk).isdigit():
            emp = Employee.objects.filter(pk=int(pk)).first()
        if not emp:
            emp = Employee.objects.filter(employee_id__iexact=pk).first()
        if not emp:
            # Check if it corresponds to an invitation
            inv = CandidateInvitation.objects.filter(employee_id__iexact=pk).first()
            if inv:
                return self._build_candidate_response(inv)
            raise Http404(f"No employee found with identifier '{pk}'.")

        return self._build_employee_response(emp, request)

    def _build_candidate_response(self, inv):
        return Response({
            'is_candidate': True,
            'isCandidate': True,
            'identity': {
                'id': f"inv-{inv.id}",
                'employee_id': inv.employee_id,
                'employeeId': inv.employee_id,
                'name': inv.full_name,
                'full_name': inv.full_name,
                'email': inv.email,
                'job_title': inv.job_title,
                'jobTitle': inv.job_title,
                'department': inv.department,
                'manager': {
                    'name': inv.manager,
                    'role': 'Reporting Manager',
                    'email': 'arjun.mehta@novatech.io'
                },
                'joining_date': inv.joining_date,
                'joiningDate': inv.joining_date,
                'system_role': Employee.ROLE_EMPLOYEE,
                'systemRole': Employee.ROLE_EMPLOYEE,
                'status': inv.status,
                'expires_at': inv.expires_at,
                'created_at': inv.created_at,
                'avatar': 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'
            },
            'onboarding_progress': {
                'overall_percentage': 0,
                'overallPercentage': 0,
                'current_stage': 'Registration & Invitation Pending',
                'currentStage': 'Registration & Invitation Pending',
                'status': 'INVITED',
                'completed_stages_count': 0,
                'completedStagesCount': 0,
                'total_stages_count': 10,
                'totalStagesCount': 10,
                'completed_stages': [],
                'completedStages': [],
                'pending_stages': [],
                'pendingStages': [],
                'stages': []
            },
            'documents': [],
            'training': [],
            'offer_letter': {'is_accepted': False, 'status': 'Pending Account Registration'},
            'offerLetter': {'is_accepted': False, 'status': 'Pending Account Registration'},
            'policies': [],
            'first_day': [],
            'firstDay': [],
            'feedback': {'is_submitted': False, 'isSubmitted': False}
        })

    def _build_employee_response(self, emp, request):
        total_stages = OnboardingStage.objects.filter(is_active=True).count() or 10

        # Stages & Progress (HR/Admin can view all stages with isActive flag)
        stages_qs = OnboardingStage.objects.order_by('stage_number').all()
        emp_progress_map = {p.stage_id: p for p in emp.stages_progress.all()}

        completed_stages = []
        pending_stages = []
        all_stages = []
        completed_active_count = 0

        for st in stages_qs:
            prog = emp_progress_map.get(st.id)
            is_comp = prog.is_completed if prog else False
            stage_status = prog.status if prog else 'pending'
            stage_data = {
                'id': st.id,
                'stage_id': st.stage_id,
                'stageId': st.stage_id,
                'stage_number': st.stage_number,
                'stageNumber': st.stage_number,
                'title': st.title,
                'description': st.description,
                'path': st.path,
                'icon': st.icon,
                'category': st.category,
                'estimated_time': st.estimated_time,
                'estimatedTime': st.estimated_time,
                'is_active': st.is_active,
                'isActive': st.is_active,
                'is_completed': is_comp,
                'isCompleted': is_comp,
                'status': stage_status
            }
            all_stages.append(stage_data)
            if is_comp:
                completed_stages.append(stage_data)
                if st.is_active:
                    completed_active_count += 1
            else:
                pending_stages.append(stage_data)

        pct = round((completed_active_count / total_stages) * 100) if total_stages > 0 else 0
        emp_status = 'COMPLETED' if completed_active_count >= total_stages and total_stages > 0 else 'ONBOARDING'
        pending_active_stages = [s for s in pending_stages if s.get('is_active', True)]
        curr_stage_name = pending_active_stages[0]['title'] if pending_active_stages else 'Onboarding Completed'

        # Documents
        docs_list = []
        for doc in emp.documents.order_by('id'):
            docs_list.append({
                'id': doc.id,
                'name': doc.name,
                'document_type': doc.document_type,
                'documentType': doc.document_type,
                'upload_status': doc.upload_status,
                'uploadStatus': doc.upload_status,
                'verification_status': doc.verification_status,
                'verificationStatus': doc.verification_status,
                'date_str': doc.date_str,
                'dateStr': doc.date_str,
                'size_str': doc.size_str,
                'sizeStr': doc.size_str,
                'remarks': doc.remarks,
                'is_required': doc.is_required,
                'isRequired': doc.is_required,
                'file_url': doc.file_url,
                'fileUrl': doc.file_url,
                'download_url': request.build_absolute_uri(f"/api/v1/documents/{doc.id}/download/") if doc.file else None,
                'downloadUrl': request.build_absolute_uri(f"/api/v1/documents/{doc.id}/download/") if doc.file else None
            })

        # Training
        training_list = []
        emp_tp_map = {tp.module_id: tp for tp in emp.training_progresses.all()}
        for tm in TrainingModule.objects.order_by('id'):
            tp = emp_tp_map.get(tm.id)
            training_list.append({
                'id': tm.id,
                'module_id': tm.module_id,
                'moduleId': tm.module_id,
                'title': tm.title,
                'description': tm.description,
                'duration': tm.duration,
                'category': tm.category,
                'icon': tm.icon,
                'modules_count': tm.modules_count,
                'modulesCount': tm.modules_count,
                'progress': tp.progress if tp else 0,
                'status': tp.status if tp else 'Not Started',
                'completed_modules': tp.completed_modules if tp else 0,
                'completedModules': tp.completed_modules if tp else 0
            })

        # Offer Letter
        ol = getattr(emp, 'offer_letter', None)
        offer_data = {
            'is_accepted': ol.is_accepted if ol else False,
            'isAccepted': ol.is_accepted if ol else False,
            'accepted_at': ol.accepted_at if ol else None,
            'acceptedAt': ol.accepted_at if ol else None,
            'signature': ol.signature if ol else '',
            'ref_no': ol.ref_no if ol else '',
            'refNo': ol.ref_no if ol else '',
            'issue_date': ol.issue_date if ol else '',
            'ctc': ol.ctc if ol else '',
            'probation': ol.probation if ol else '',
            'notice_period': ol.notice_period if ol else ''
        }

        # Policies
        policies_list = []
        ack_map = {pa.policy_id: pa for pa in emp.policy_acknowledgements.all()}
        for pol in CompanyPolicy.objects.order_by('id'):
            ack = ack_map.get(pol.id)
            policies_list.append({
                'id': pol.id,
                'policy_id': pol.policy_id,
                'policyId': pol.policy_id,
                'title': pol.title,
                'category': pol.category,
                'read_time': pol.read_time,
                'readTime': pol.read_time,
                'acknowledged': ack.acknowledged if ack else False,
                'acknowledged_at': ack.acknowledged_at if ack else None,
                'acknowledgedAt': ack.acknowledged_at if ack else None
            })

        # First Day
        first_day_list = []
        fd_map = {fp.session_id: fp for fp in emp.first_day_progress.all()}
        for fds in FirstDaySession.objects.order_by('order', 'id'):
            fdp = fd_map.get(fds.id)
            first_day_list.append({
                'id': fds.id,
                'session_id': fds.session_id,
                'sessionId': fds.session_id,
                'order': fds.order,
                'time_slot': fds.time_slot,
                'timeSlot': fds.time_slot,
                'title': fds.title,
                'host': fds.host,
                'location': fds.location,
                'session_type': fds.session_type,
                'sessionType': fds.session_type,
                'status': fdp.status if fdp else 'upcoming'
            })

        # Feedback
        fb = emp.feedbacks.first()
        feedback_data = {
            'is_submitted': fb.is_submitted if fb else False,
            'isSubmitted': fb.is_submitted if fb else False,
            'submitted_at': fb.submitted_at if fb else None,
            'submittedAt': fb.submitted_at if fb else None,
            'nps_score': fb.nps_score if fb else None,
            'npsScore': fb.nps_score if fb else None,
            'ratings': fb.ratings if fb else {},
            'comments': fb.comments if fb else ''
        }

        # Profile
        prof = getattr(emp, 'profile', None)
        profile_data = {
            'phone': prof.phone if prof else '',
            'date_of_birth': str(prof.date_of_birth) if prof else '',
            'dateOfBirth': str(prof.date_of_birth) if prof else '',
            'blood_group': prof.blood_group if prof else '',
            'bloodGroup': prof.blood_group if prof else '',
            'address': prof.address if prof else '',
            'city': prof.city if prof else '',
            'state': prof.state if prof else '',
            'pincode': prof.pincode if prof else '',
            'emergency_contact': {
                'name': prof.emergency_contact_name if prof else '',
                'relation': prof.emergency_contact_relation if prof else '',
                'phone': prof.emergency_contact_phone if prof else ''
            } if prof else {},
            'emergencyContact': {
                'name': prof.emergency_contact_name if prof else '',
                'relation': prof.emergency_contact_relation if prof else '',
                'phone': prof.emergency_contact_phone if prof else ''
            } if prof else {},
            'is_completed': prof.is_completed if prof else False,
            'isCompleted': prof.is_completed if prof else False
        }

        return Response({
            'is_candidate': False,
            'isCandidate': False,
            'stages': all_stages,
            'identity': {
                'id': emp.id,
                'employee_id': emp.employee_id,
                'employeeId': emp.employee_id,
                'name': emp.name,
                'full_name': emp.name,
                'email': emp.email,
                'job_title': emp.role,
                'jobTitle': emp.role,
                'designation': emp.designation,
                'department': emp.department,
                'system_role': emp.system_role,
                'systemRole': emp.system_role,
                'joining_date': emp.joining_date,
                'joiningDate': emp.joining_date,
                'joining_time': emp.joining_time,
                'joiningTime': emp.joining_time,
                'location': emp.location,
                'work_mode': emp.work_mode,
                'workMode': emp.work_mode,
                'avatar': emp.avatar,
                'manager': {
                    'name': emp.manager_name,
                    'role': emp.manager_role,
                    'email': emp.manager_email
                },
                'hr_support': {
                    'name': emp.hr_name,
                    'role': emp.hr_role,
                    'email': emp.hr_email,
                    'availability': emp.hr_availability
                },
                'profile': profile_data
            },
            'onboarding_progress': {
                'overall_percentage': pct,
                'overallPercentage': pct,
                'current_stage': curr_stage_name,
                'currentStage': curr_stage_name,
                'status': emp_status,
                'completed_stages_count': len(completed_stages),
                'completedStagesCount': len(completed_stages),
                'total_stages_count': total_stages,
                'totalStagesCount': total_stages,
                'completed_stages': completed_stages,
                'completedStages': completed_stages,
                'pending_stages': pending_stages,
                'pendingStages': pending_stages,
                'stages': all_stages
            },
            'documents': docs_list,
            'training': training_list,
            'offer_letter': offer_data,
            'offerLetter': offer_data,
            'policies': policies_list,
            'first_day': first_day_list,
            'firstDay': first_day_list,
            'feedback': feedback_data
        }, status=status.HTTP_200_OK)


class HRAnalyticsView(APIView):
    """
    GET /api/v1/hr/analytics/
    HR Analytics & Reporting endpoint for HR Managers and Admins.
    Calculates operational onboarding metrics, stage distribution, and monthly activity
    from real database records without exposing authentication secrets.
    """
    permission_classes = [IsAuthenticated, IsHROrAdmin]

    def get(self, request):
        ensure_default_stages()
        total_stages = OnboardingStage.objects.filter(is_active=True).count() or 10

        # --- A. Overview ---
        total_employees = Employee.objects.count()
        active_employees = Employee.objects.filter(Q(user__isnull=True) | Q(user__is_active=True)).count()

        completed_onboarding = 0
        onboarding_in_progress = 0
        total_progress_sum = 0

        for emp in Employee.objects.prefetch_related('stages_progress__stage').all():
            comp_count = emp.stages_progress.filter(stage__is_active=True, is_completed=True).count()
            pct = round((comp_count / total_stages) * 100) if total_stages > 0 else 0
            total_progress_sum += pct
            if comp_count >= total_stages and total_stages > 0:
                completed_onboarding += 1
            else:
                onboarding_in_progress += 1

        avg_onboarding_completion = round(total_progress_sum / total_employees, 1) if total_employees > 0 else 0.0

        # Upcoming joiners: pending invites + accepted invites
        upcoming_joiners = CandidateInvitation.objects.filter(
            status__in=[CandidateInvitation.STATUS_PENDING, CandidateInvitation.STATUS_ACCEPTED]
        ).count()

        overview_data = {
            'totalEmployees': total_employees,
            'activeEmployees': active_employees,
            'onboardingInProgress': onboarding_in_progress,
            'completedOnboarding': completed_onboarding,
            'upcomingJoiners': upcoming_joiners,
            'averageOnboardingProgress': avg_onboarding_completion
        }

        # --- B. Onboarding Progress ---
        completed_stages = EmployeeStageProgress.objects.filter(is_completed=True).count()
        pending_stages = EmployeeStageProgress.objects.filter(is_completed=False).count()
        total_stage_records = EmployeeStageProgress.objects.count()

        onboarding_data = {
            'averageCompletion': avg_onboarding_completion,
            'completedStages': completed_stages,
            'pendingStages': pending_stages,
            'totalStageRecords': total_stage_records
        }

        # --- C. Documents ---
        total_docs = OnboardingDocument.objects.count()
        verified_docs = OnboardingDocument.objects.filter(verification_status='Verified').count()
        pending_docs = OnboardingDocument.objects.filter(verification_status='Pending Verification').count()
        rejected_docs = OnboardingDocument.objects.filter(verification_status='Rejected').count()
        not_uploaded_docs = OnboardingDocument.objects.filter(verification_status='Not Uploaded').count()
        uploaded_docs = total_docs - not_uploaded_docs

        documents_data = {
            'totalDocuments': total_docs,
            'uploadedDocuments': uploaded_docs,
            'verifiedDocuments': verified_docs,
            'pendingDocuments': pending_docs,
            'rejectedDocuments': rejected_docs,
            'notUploadedDocuments': not_uploaded_docs
        }

        # --- D. Training ---
        total_training_assigned = EmployeeTrainingProgress.objects.count()
        completed_training = EmployeeTrainingProgress.objects.filter(status='Completed').count()
        in_progress_training = EmployeeTrainingProgress.objects.filter(status='In Progress').count()
        pending_training = EmployeeTrainingProgress.objects.filter(status='Not Started').count()
        avg_train = EmployeeTrainingProgress.objects.aggregate(avg=Avg('progress'))['avg']
        avg_training_completion = round(avg_train, 1) if avg_train is not None else 0.0

        training_data = {
            'totalAssigned': total_training_assigned,
            'completed': completed_training,
            'inProgress': in_progress_training,
            'pending': pending_training,
            'averageCompletion': avg_training_completion
        }

        # --- E. Policies ---
        total_policies = PolicyAcknowledgement.objects.count()
        acknowledged_policies = PolicyAcknowledgement.objects.filter(acknowledged=True).count()
        pending_policies = PolicyAcknowledgement.objects.filter(acknowledged=False).count()

        policies_data = {
            'totalPolicies': total_policies,
            'acknowledged': acknowledged_policies,
            'pending': pending_policies
        }

        # --- F. First Day ---
        total_first_day = FirstDayProgress.objects.count()
        confirmed_first_day = FirstDayProgress.objects.filter(status='completed').count()
        pending_first_day = FirstDayProgress.objects.filter(status__in=['upcoming', 'in-progress']).count()

        first_day_data = {
            'totalSessions': total_first_day,
            'confirmedSessions': confirmed_first_day,
            'pendingSessions': pending_first_day
        }

        # --- G. Feedback ---
        submitted_feedbacks = OnboardingFeedback.objects.filter(is_submitted=True)
        total_feedbacks = submitted_feedbacks.count()
        if total_feedbacks > 0:
            avg_nps_raw = submitted_feedbacks.aggregate(avg=Avg('nps_score'))['avg']
            avg_nps = round(avg_nps_raw, 1) if avg_nps_raw is not None else 0.0

            rating_sums = 0
            for fb in submitted_feedbacks:
                rating_sums += (fb.rating_journey + fb.rating_documentation + fb.rating_support + fb.rating_training) / 4.0
            avg_rating = round(rating_sums / total_feedbacks, 1)
        else:
            avg_nps = 0.0
            avg_rating = 0.0

        feedback_data = {
            'totalSubmissions': total_feedbacks,
            'averageNps': avg_nps,
            'averageRating': avg_rating
        }

        # --- H. Candidate Pipeline ---
        total_invitations = CandidateInvitation.objects.count()
        pending_invitations = CandidateInvitation.objects.filter(status=CandidateInvitation.STATUS_PENDING).count()
        accepted_invitations = CandidateInvitation.objects.filter(status=CandidateInvitation.STATUS_ACCEPTED).count()
        expired_invitations = CandidateInvitation.objects.filter(status=CandidateInvitation.STATUS_EXPIRED).count()
        cancelled_invitations = CandidateInvitation.objects.filter(status=CandidateInvitation.STATUS_CANCELLED).count()

        candidates_data = {
            'totalInvitations': total_invitations,
            'pendingInvitations': pending_invitations,
            'acceptedInvitations': accepted_invitations,
            'expiredInvitations': expired_invitations,
            'cancelledInvitations': cancelled_invitations
        }

        # --- I. Monthly Onboarding Activity ---
        now = timezone.now()
        months_list = []
        for i in range(5, -1, -1):
            m = now.month - i
            y = now.year
            while m <= 0:
                m += 12
                y -= 1
            month_str = f"{y:04d}-{m:02d}"
            months_list.append((y, m, month_str))

        monthly_onboarding = []
        for y, m, m_str in months_list:
            joined_count = Employee.objects.filter(
                created_at__year=y,
                created_at__month=m
            ).count()

            comp_in_month = 0
            for emp in Employee.objects.filter(created_at__year=y, created_at__month=m).prefetch_related('stages_progress'):
                c_count = emp.stages_progress.filter(is_completed=True).count()
                if c_count >= total_stages and total_stages > 0:
                    comp_in_month += 1

            monthly_onboarding.append({
                'month': m_str,
                'joined': joined_count,
                'completed': comp_in_month
            })

        # --- J. Stage Distribution ---
        stage_distribution = []
        for stage in OnboardingStage.objects.order_by('stage_number'):
            s_comp = EmployeeStageProgress.objects.filter(stage=stage, is_completed=True).count()
            s_pend = EmployeeStageProgress.objects.filter(stage=stage, is_completed=False).count()
            stage_distribution.append({
                'stage': stage.title,
                'stageNumber': stage.stage_number,
                'category': stage.category,
                'is_active': stage.is_active,
                'isActive': stage.is_active,
                'completed': s_comp,
                'pending': s_pend
            })

        return Response({
            'overview': overview_data,
            'onboarding': onboarding_data,
            'documents': documents_data,
            'training': training_data,
            'policies': policies_data,
            'firstDay': first_day_data,
            'feedback': feedback_data,
            'candidates': candidates_data,
            'monthlyOnboarding': monthly_onboarding,
            'stageDistribution': stage_distribution
        }, status=status.HTTP_200_OK)


# ==============================================================================
# 11. IN-APP NOTIFICATIONS (Phase 3 Step 6B)
# ==============================================================================

class NotificationListView(APIView):
    """
    GET /api/v1/notifications/
    Returns user-scoped notifications with pagination and unread filtering.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = Notification.objects.filter(recipient=request.user).order_by('-created_at')

        # Filter unread if specified
        unread_param = request.query_params.get('unread')
        if unread_param is not None:
            if unread_param.lower() in ('true', '1'):
                qs = qs.filter(is_read=False)
            elif unread_param.lower() in ('false', '0'):
                qs = qs.filter(is_read=True)

        # Pagination
        try:
            page = max(1, int(request.query_params.get('page', 1)))
        except (ValueError, TypeError):
            page = 1

        try:
            page_size = min(100, max(1, int(request.query_params.get('page_size', request.query_params.get('pageSize', 20)))))
        except (ValueError, TypeError):
            page_size = 20

        total_count = qs.count()
        total_pages = max(1, (total_count + page_size - 1) // page_size)
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size

        page_records = qs[start_idx:end_idx]
        serializer = NotificationSerializer(page_records, many=True)

        return Response({
            'count': total_count,
            'totalPages': total_pages,
            'currentPage': page,
            'pageSize': page_size,
            'results': serializer.data
        }, status=status.HTTP_200_OK)


class NotificationUnreadCountView(APIView):
    """
    GET /api/v1/notifications/unread-count/
    Returns count of unread notifications for authenticated user.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        count = Notification.objects.filter(recipient=request.user, is_read=False).count()
        return Response({'count': count}, status=status.HTTP_200_OK)


class NotificationMarkReadView(APIView):
    """
    PATCH /api/v1/notifications/{id}/read/
    Marks a single notification belonging to the authenticated user as read.
    """
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk=None):
        try:
            notif = Notification.objects.get(id=pk, recipient=request.user)
        except Notification.DoesNotExist:
            return Response(
                {'error': 'Notification not found or access denied.'},
                status=status.HTTP_404_NOT_FOUND
            )

        notif.mark_as_read()
        serializer = NotificationSerializer(notif)
        return Response(serializer.data, status=status.HTTP_200_OK)


class NotificationMarkAllReadView(APIView):
    """
    PATCH /api/v1/notifications/read-all/
    Marks all unread notifications for authenticated user as read.
    """
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        updated_count = mark_all_notifications_read(request.user)
        return Response({'updated': updated_count}, status=status.HTTP_200_OK)


# ==============================================================================
# 13. ADMIN PORTAL & SYSTEM MANAGEMENT (PHASE 3 STEP 6C)
# ==============================================================================

class AdminDashboardView(APIView):
    """
    GET /api/v1/admin/dashboard/
    System-wide overview metrics calculated live from the database for System Administrators.
    Strictly protected by IsAuthenticated + IsAdmin permissions.
    """
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        ensure_default_stages()
        total_users = User.objects.count()
        total_employees = Employee.objects.count()
        hr_managers = Employee.objects.filter(system_role=Employee.ROLE_HR_MANAGER).count()

        # Count admins (superuser or system_role == ADMIN)
        admins_count = User.objects.filter(
            Q(is_superuser=True) | Q(employee__system_role=Employee.ROLE_ADMIN)
        ).distinct().count()

        active_users = User.objects.filter(is_active=True).count()
        inactive_users = User.objects.filter(is_active=False).count()

        total_stages = OnboardingStage.objects.filter(is_active=True).count() or 10
        completed_onboarding = 0
        active_onboarding = 0

        for emp in Employee.objects.prefetch_related('stages_progress__stage').all():
            comp = emp.stages_progress.filter(stage__is_active=True, is_completed=True).count()
            if comp >= total_stages and total_stages > 0:
                completed_onboarding += 1
            else:
                active_onboarding += 1

        pending_invitations = CandidateInvitation.objects.filter(
            status=CandidateInvitation.STATUS_PENDING,
            expires_at__gt=timezone.now()
        ).count()

        unread_notifications = Notification.objects.filter(is_read=False).count()

        # Recent 10 admin audit logs
        recent_logs = AdminAuditLog.objects.select_related('admin', 'admin__employee')[:10]
        recent_activity_data = AdminAuditLogSerializer(recent_logs, many=True).data

        data = {
            'totalUsers': total_users,
            'total_users': total_users,
            'totalEmployees': total_employees,
            'total_employees': total_employees,
            'hrManagers': hr_managers,
            'hr_managers': hr_managers,
            'admins': admins_count,
            'adminsCount': admins_count,
            'admins_count': admins_count,
            'activeUsers': active_users,
            'active_users': active_users,
            'inactiveUsers': inactive_users,
            'inactive_users': inactive_users,
            'activeOnboarding': active_onboarding,
            'active_onboarding': active_onboarding,
            'completedOnboarding': completed_onboarding,
            'completed_onboarding': completed_onboarding,
            'pendingInvitations': pending_invitations,
            'pending_invitations': pending_invitations,
            'unreadNotifications': unread_notifications,
            'unread_notifications': unread_notifications,
            'recentActivity': recent_activity_data,
            'recent_activity': recent_activity_data,
        }
        return Response(data, status=status.HTTP_200_OK)


class AdminUserListView(APIView):
    """
    GET /api/v1/admin/users/
    Searchable, filterable, and paginated list of all users and employee details for Administrators.
    Strictly protected by IsAuthenticated + IsAdmin permissions.
    """
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        search_query = request.query_params.get('search', '').strip()
        role_filter = request.query_params.get('role', 'ALL').strip().upper()
        status_filter = request.query_params.get('status', request.query_params.get('is_active', 'ALL')).strip().upper()

        try:
            page = max(1, int(request.query_params.get('page', 1)))
        except (ValueError, TypeError):
            page = 1

        try:
            page_size = min(100, max(1, int(request.query_params.get('page_size', 20))))
        except (ValueError, TypeError):
            page_size = 20

        qs = User.objects.select_related('employee').all().order_by('-date_joined')

        # 1. Filter by role
        if role_filter and role_filter != 'ALL':
            if role_filter == 'ADMIN':
                qs = qs.filter(Q(is_superuser=True) | Q(employee__system_role=Employee.ROLE_ADMIN))
            elif role_filter == 'HR_MANAGER':
                qs = qs.filter(employee__system_role=Employee.ROLE_HR_MANAGER)
            elif role_filter == 'EMPLOYEE':
                qs = qs.filter(Q(employee__system_role=Employee.ROLE_EMPLOYEE) | Q(employee__isnull=True, is_superuser=False))

        # 2. Filter by active / inactive status
        if status_filter in ('ACTIVE', 'TRUE', '1'):
            qs = qs.filter(is_active=True)
        elif status_filter in ('INACTIVE', 'FALSE', '0'):
            qs = qs.filter(is_active=False)

        # 3. Filter by search query
        if search_query:
            qs = qs.filter(
                Q(username__icontains=search_query) |
                Q(email__icontains=search_query) |
                Q(first_name__icontains=search_query) |
                Q(last_name__icontains=search_query) |
                Q(employee__employee_id__icontains=search_query) |
                Q(employee__name__icontains=search_query) |
                Q(employee__role__icontains=search_query) |
                Q(employee__designation__icontains=search_query) |
                Q(employee__department__icontains=search_query)
            )

        total_count = qs.count()
        total_pages = max(1, (total_count + page_size - 1) // page_size) if total_count > 0 else 1

        start = (page - 1) * page_size
        end = start + page_size
        page_users = qs[start:end]

        serializer = AdminUserListSerializer(page_users, many=True)
        return Response({
            'count': total_count,
            'total_pages': total_pages,
            'totalPages': total_pages,
            'current_page': page,
            'currentPage': page,
            'page_size': page_size,
            'pageSize': page_size,
            'results': serializer.data
        }, status=status.HTTP_200_OK)


class AdminUserDetailView(APIView):
    """
    GET /api/v1/admin/users/{id}/
    Comprehensive safe user & employee details for Administrators.
    Excludes sensitive credentials (passwords, JWTs, hashes).
    """
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request, pk=None):
        user = User.objects.select_related('employee').filter(pk=pk).first()
        if not user:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = AdminUserDetailSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)


class AdminUserRoleUpdateView(APIView):
    """
    PATCH /api/v1/admin/users/{id}/role/
    Updates the system role of a target user.
    Security guardrails:
      - Only accessible by ADMIN.
      - Blocks demoting the last active administrator.
      - Blocks unsafe self-demotion if no other active admin exists.
      - Logs action in AdminAuditLog.
    """
    permission_classes = [IsAuthenticated, IsAdmin]

    def patch(self, request, pk=None):
        target_user = User.objects.select_related('employee').filter(pk=pk).first()
        if not target_user:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        new_role = (
            request.data.get('system_role') or
            request.data.get('role') or
            request.data.get('systemRole') or ''
        ).strip().upper()

        valid_roles = [Employee.ROLE_EMPLOYEE, Employee.ROLE_HR_MANAGER, Employee.ROLE_ADMIN]
        if new_role not in valid_roles:
            return Response(
                {'error': f"Invalid system role '{new_role}'. Must be one of: {', '.join(valid_roles)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Determine current system role
        old_role = Employee.ROLE_EMPLOYEE
        if hasattr(target_user, 'employee') and target_user.employee:
            old_role = target_user.employee.system_role
        elif target_user.is_superuser:
            old_role = Employee.ROLE_ADMIN

        # Guardrail: Prevent demoting the last remaining active ADMIN
        if old_role == Employee.ROLE_ADMIN and new_role != Employee.ROLE_ADMIN:
            active_admins = User.objects.filter(is_active=True).filter(
                Q(is_superuser=True) | Q(employee__system_role=Employee.ROLE_ADMIN)
            ).exclude(pk=target_user.pk).distinct().count()

            if active_admins == 0:
                if request.user.pk == target_user.pk:
                    return Response(
                        {'error': 'Cannot demote yourself as the last remaining active administrator.'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                return Response(
                    {'error': 'Cannot demote the last remaining active administrator.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Apply role change
        if hasattr(target_user, 'employee') and target_user.employee:
            target_user.employee.system_role = new_role
            target_user.employee.save(update_fields=['system_role'])
        else:
            # Create employee record linked to user
            Employee.objects.create(
                user=target_user,
                employee_id=f"EMP-ADM-{target_user.id:04d}",
                name=f"{target_user.first_name} {target_user.last_name}".strip() or target_user.username,
                email=target_user.email or f"{target_user.username}@novatech.io",
                role="System Administrator" if new_role == Employee.ROLE_ADMIN else "Employee",
                system_role=new_role
            )

        # If user is superuser and demoted away from admin, adjust flags safely
        if new_role != Employee.ROLE_ADMIN and target_user.is_superuser:
            target_user.is_superuser = False
            target_user.save(update_fields=['is_superuser'])

        # Audit log entry
        AdminAuditLog.objects.create(
            admin=request.user,
            action=AdminAuditLog.ACTION_ROLE_CHANGE,
            target_type='User',
            target_id=str(target_user.id),
            description=f"System role for '{target_user.username}' changed from '{old_role}' to '{new_role}' by {request.user.username}."
        )

        serializer = AdminUserDetailSerializer(target_user)
        return Response({
            'success': True,
            'message': f"System role updated to {new_role}.",
            'user': serializer.data
        }, status=status.HTTP_200_OK)


class AdminUserStatusUpdateView(APIView):
    """
    PATCH /api/v1/admin/users/{id}/status/
    Activates or deactivates a user account.
    Security guardrails:
      - Only accessible by ADMIN.
      - Blocks deactivating the last active administrator.
      - Logs action in AdminAuditLog.
    """
    permission_classes = [IsAuthenticated, IsAdmin]

    def patch(self, request, pk=None):
        target_user = User.objects.select_related('employee').filter(pk=pk).first()
        if not target_user:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        if 'is_active' in request.data:
            new_status = bool(request.data['is_active'])
        elif 'isActive' in request.data:
            new_status = bool(request.data['isActive'])
        elif 'status' in request.data:
            new_status = str(request.data['status']).strip().upper() == 'ACTIVE'
        else:
            return Response({'error': "Missing 'is_active' or 'status' field."}, status=status.HTTP_400_BAD_REQUEST)

        # Guardrail: Prevent deactivating the last remaining active ADMIN
        if not new_status:
            is_target_admin = target_user.is_active and (
                target_user.is_superuser or (
                    hasattr(target_user, 'employee') and
                    target_user.employee and
                    target_user.employee.system_role == Employee.ROLE_ADMIN
                )
            )
            if is_target_admin:
                active_admins = User.objects.filter(is_active=True).filter(
                    Q(is_superuser=True) | Q(employee__system_role=Employee.ROLE_ADMIN)
                ).exclude(pk=target_user.pk).distinct().count()

                if active_admins == 0:
                    return Response(
                        {'error': 'Cannot deactivate the last remaining active administrator.'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

        target_user.is_active = new_status
        target_user.save(update_fields=['is_active'])

        action_type = AdminAuditLog.ACTION_ACCOUNT_ACTIVATED if new_status else AdminAuditLog.ACTION_ACCOUNT_DEACTIVATED
        status_label = 'Active' if new_status else 'Inactive'

        AdminAuditLog.objects.create(
            admin=request.user,
            action=action_type,
            target_type='User',
            target_id=str(target_user.id),
            description=f"User account '{target_user.username}' status set to {status_label} by {request.user.username}."
        )

        serializer = AdminUserDetailSerializer(target_user)
        return Response({
            'success': True,
            'message': f"User account set to {status_label}.",
            'is_active': new_status,
            'isActive': new_status,
            'user': serializer.data
        }, status=status.HTTP_200_OK)


class AdminAuditLogListView(APIView):
    """
    GET /api/v1/admin/audit-logs/
    Paginated audit logs tracking administrative actions.
    Strictly protected by IsAuthenticated + IsAdmin permissions.
    """
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        action_filter = request.query_params.get('action', '').strip().upper()
        search_query = request.query_params.get('search', '').strip()

        try:
            page = max(1, int(request.query_params.get('page', 1)))
        except (ValueError, TypeError):
            page = 1

        try:
            page_size = min(100, max(1, int(request.query_params.get('page_size', 20))))
        except (ValueError, TypeError):
            page_size = 20

        qs = AdminAuditLog.objects.select_related('admin', 'admin__employee').all().order_by('-created_at')

        if action_filter and action_filter != 'ALL':
            qs = qs.filter(action=action_filter)

        if search_query:
            qs = qs.filter(
                Q(description__icontains=search_query) |
                Q(admin__username__icontains=search_query) |
                Q(admin__email__icontains=search_query) |
                Q(target_id__icontains=search_query)
            )

        total_count = qs.count()
        total_pages = max(1, (total_count + page_size - 1) // page_size) if total_count > 0 else 1

        start = (page - 1) * page_size
        end = start + page_size
        page_logs = qs[start:end]

        serializer = AdminAuditLogSerializer(page_logs, many=True)
        return Response({
            'count': total_count,
            'total_pages': total_pages,
            'totalPages': total_pages,
            'current_page': page,
            'currentPage': page,
            'page_size': page_size,
            'pageSize': page_size,
            'results': serializer.data
        }, status=status.HTTP_200_OK)


class AdminConfigurationView(APIView):
    """
    GET /api/v1/admin/configuration/
    Administrative platform settings, system information, and onboarding stage configurations.
    Strictly protected by IsAuthenticated + IsAdmin permissions.
    """
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        ensure_default_stages()
        stages = OnboardingStage.objects.all().order_by('stage_number')
        stages_data = AdminStageConfigSerializer(stages, many=True).data

        system_info = {
            'platformName': 'NOVA Tech Digital Employee Onboarding System',
            'platform_name': 'NOVA Tech Digital Employee Onboarding System',
            'version': 'v1.4.0 (Phase 3 Step 6C)',
            'environment': 'Production Ready',
            'authProvider': 'SimpleJWT + DRF RBAC',
            'auth_provider': 'SimpleJWT + DRF RBAC',
            'totalUsers': User.objects.count(),
            'total_users': User.objects.count(),
            'totalEmployees': Employee.objects.count(),
            'total_employees': Employee.objects.count(),
            'invitationExpiryHours': 48,
            'invitation_expiry_hours': 48,
            'notificationsStatus': 'Active (Database Engine)',
            'notifications_status': 'Active (Database Engine)',
            'stagesCount': stages.count(),
            'stages_count': stages.count(),
        }

        return Response({
            'system_info': system_info,
            'systemInfo': system_info,
            'stages': stages_data
        }, status=status.HTTP_200_OK)


class AdminStageConfigUpdateView(APIView):
    """
    PATCH /api/v1/admin/stages/{key}/
    Safely updates an onboarding stage configuration (is_active, estimated_time, title, description).
    Prevents corruption of employee progress records.
    """
    permission_classes = [IsAuthenticated, IsAdmin]

    def patch(self, request, key=None):
        stage = OnboardingStage.objects.filter(stage_id=key).first()
        if not stage and str(key).isdigit():
            stage = OnboardingStage.objects.filter(pk=int(key)).first()
        if not stage and str(key).isdigit():
            stage = OnboardingStage.objects.filter(stage_number=int(key)).first()

        if not stage:
            return Response({'error': f"Stage '{key}' not found."}, status=status.HTTP_404_NOT_FOUND)

        changed = False

        if 'is_active' in request.data or 'isActive' in request.data:
            val = request.data.get('isActive', request.data.get('is_active'))
            stage.is_active = bool(val)
            changed = True

        if 'estimated_time' in request.data or 'estimatedTime' in request.data:
            val = str(request.data.get('estimatedTime', request.data.get('estimated_time'))).strip()
            if val:
                stage.estimated_time = val
                changed = True

        if 'description' in request.data:
            val = str(request.data['description']).strip()
            if val:
                stage.description = val
                changed = True

        if 'title' in request.data:
            val = str(request.data['title']).strip()
            if val:
                stage.title = val
                changed = True

        if changed:
            stage.save()
            AdminAuditLog.objects.create(
                admin=request.user,
                action=AdminAuditLog.ACTION_CONFIG_CHANGE,
                target_type='OnboardingStage',
                target_id=str(stage.stage_id),
                description=f"Stage '{stage.title}' (ID: {stage.stage_id}) configuration updated by {request.user.username}."
            )

        serializer = AdminStageConfigSerializer(stage)
        return Response({
            'success': True,
            'message': f"Stage '{stage.title}' updated successfully.",
            'stage': serializer.data
        }, status=status.HTTP_200_OK)





