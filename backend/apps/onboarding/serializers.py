from django.contrib.auth.models import User
from rest_framework import serializers
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


class EmployeeProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmployeeProfile
        fields = [
            'phone',
            'date_of_birth',
            'blood_group',
            'address',
            'city',
            'state',
            'pincode',
            'emergency_contact_name',
            'emergency_contact_relation',
            'emergency_contact_phone',
            'is_completed',
            'created_at',
            'updated_at'
        ]

    def validate_blood_group(self, value):
        valid = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
        if value and value not in valid:
            raise serializers.ValidationError(f"Blood group must be one of: {', '.join(valid)}")
        return value

    def validate_phone(self, value):
        if value and len(str(value).strip()) < 5:
            raise serializers.ValidationError("Phone number must contain at least 5 digits.")
        return value


class EmployeeSerializer(serializers.ModelSerializer):
    profile = EmployeeProfileSerializer(read_only=True)
    manager = serializers.SerializerMethodField()
    hrSupport = serializers.SerializerMethodField()
    systemRole = serializers.CharField(source='system_role', read_only=True)

    class Meta:
        model = Employee
        fields = [
            'id',
            'employee_id',
            'name',
            'email',
            'role',
            'system_role',
            'systemRole',
            'designation',
            'department',
            'joining_date',
            'joining_time',
            'location',
            'work_mode',
            'avatar',
            'manager',
            'hrSupport',
            'profile'
        ]

    def get_manager(self, obj):
        return {
            'name': obj.manager_name,
            'role': obj.manager_role,
            'email': obj.manager_email,
            'avatar': obj.manager_avatar
        }

    def get_hrSupport(self, obj):
        return {
            'name': obj.hr_name,
            'role': obj.hr_role,
            'email': obj.hr_email,
            'avatar': obj.hr_avatar,
            'availability': obj.hr_availability
        }


class OnboardingDocumentSerializer(serializers.ModelSerializer):
    type = serializers.CharField(source='document_type', required=False)
    uploadStatus = serializers.CharField(source='upload_status', read_only=True)
    verificationStatus = serializers.CharField(source='verification_status', read_only=True)
    date = serializers.CharField(source='date_str', read_only=True)
    size = serializers.CharField(source='size_str', read_only=True)
    required = serializers.BooleanField(source='is_required', required=False)
    file_url = serializers.SerializerMethodField()
    fileUrl = serializers.SerializerMethodField()

    class Meta:
        model = OnboardingDocument
        fields = [
            'id',
            'name',
            'type',
            'document_type',
            'file',
            'file_url',
            'fileUrl',
            'upload_status',
            'uploadStatus',
            'verification_status',
            'verificationStatus',
            'date',
            'date_str',
            'size',
            'size_str',
            'remarks',
            'required',
            'is_required',
        ]
        read_only_fields = [
            'id',
            'upload_status',
            'uploadStatus',
            'verification_status',
            'verificationStatus',
            'date_str',
            'date',
            'size_str',
            'size',
        ]

    def get_file_url(self, obj):
        if not obj.file:
            return None
        request = self.context.get('request')
        if request is not None:
            return request.build_absolute_uri(obj.file.url)
        return obj.file.url

    def get_fileUrl(self, obj):
        return self.get_file_url(obj)

    def validate_name(self, value):
        if value is not None and not str(value).strip():
            raise serializers.ValidationError("Document name cannot be blank.")
        return str(value).strip() if value else value


class OfferLetterSerializer(serializers.ModelSerializer):
    employeeName = serializers.CharField(source='employee.name', read_only=True)
    designation = serializers.CharField(source='employee.designation', read_only=True)
    department = serializers.CharField(source='employee.department', read_only=True)
    reportingManager = serializers.CharField(source='employee.manager_name', read_only=True)
    joiningDate = serializers.CharField(source='employee.joining_date', read_only=True)
    workLocation = serializers.CharField(source='employee.location', read_only=True)
    salaryBreakdown = serializers.JSONField(source='salary_breakdown')
    isAccepted = serializers.BooleanField(source='is_accepted')
    acceptedAt = serializers.CharField(source='accepted_at')
    refNo = serializers.CharField(source='ref_no')
    issueDate = serializers.CharField(source='issue_date')
    hash = serializers.CharField(source='signature_hash', read_only=True)

    class Meta:
        model = OfferLetter
        fields = [
            'refNo',
            'issueDate',
            'employeeName',
            'designation',
            'department',
            'reportingManager',
            'joiningDate',
            'workLocation',
            'ctc',
            'salaryBreakdown',
            'probation',
            'notice_period',
            'isAccepted',
            'acceptedAt',
            'signature',
            'hash'
        ]


class CompanyPolicySerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='policy_id')
    readTime = serializers.CharField(source='read_time')
    keyPoints = serializers.JSONField(source='key_points')
    acknowledged = serializers.SerializerMethodField()
    acknowledgedAt = serializers.SerializerMethodField()

    class Meta:
        model = CompanyPolicy
        fields = [
            'id',
            'title',
            'category',
            'readTime',
            'summary',
            'keyPoints',
            'acknowledged',
            'acknowledgedAt'
        ]

    def get_acknowledged(self, obj):
        request = self.context.get('request')
        employee = getattr(request, 'employee', None) or Employee.objects.first()
        if not employee:
            return False
        ack = PolicyAcknowledgement.objects.filter(employee=employee, policy=obj).first()
        return ack.acknowledged if ack else False

    def get_acknowledgedAt(self, obj):
        request = self.context.get('request')
        employee = getattr(request, 'employee', None) or Employee.objects.first()
        if not employee:
            return None
        ack = PolicyAcknowledgement.objects.filter(employee=employee, policy=obj).first()
        return ack.acknowledged_at if ack else None


class PolicyAcknowledgementSerializer(serializers.ModelSerializer):
    class Meta:
        model = PolicyAcknowledgement
        fields = ['id', 'employee', 'policy', 'acknowledged', 'acknowledged_at', 'created_at']


class TrainingModuleSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='module_id')
    modulesCount = serializers.IntegerField(source='modules_count')
    progress = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    completedModules = serializers.SerializerMethodField()

    class Meta:
        model = TrainingModule
        fields = [
            'id',
            'title',
            'description',
            'duration',
            'category',
            'icon',
            'modulesCount',
            'lessons',
            'progress',
            'status',
            'completedModules'
        ]

    def get_progress(self, obj):
        request = self.context.get('request')
        employee = getattr(request, 'employee', None) or Employee.objects.first()
        if not employee:
            return 0
        tp = EmployeeTrainingProgress.objects.filter(employee=employee, module=obj).first()
        return tp.progress if tp else 0

    def get_status(self, obj):
        request = self.context.get('request')
        employee = getattr(request, 'employee', None) or Employee.objects.first()
        if not employee:
            return 'Not Started'
        tp = EmployeeTrainingProgress.objects.filter(employee=employee, module=obj).first()
        return tp.status if tp else 'Not Started'

    def get_completedModules(self, obj):
        request = self.context.get('request')
        employee = getattr(request, 'employee', None) or Employee.objects.first()
        if not employee:
            return 0
        tp = EmployeeTrainingProgress.objects.filter(employee=employee, module=obj).first()
        return tp.completed_modules if tp else 0


class EmployeeTrainingProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmployeeTrainingProgress
        fields = ['id', 'employee', 'module', 'progress', 'status', 'completed_modules', 'updated_at']

    def validate_progress(self, value):
        if not (0 <= value <= 100):
            raise serializers.ValidationError("Progress must be between 0 and 100.")
        return value


class QuizQuestionSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='question_id')
    correctAnswer = serializers.IntegerField(source='correct_answer')

    class Meta:
        model = QuizQuestion
        fields = [
            'id',
            'question',
            'options',
            'correctAnswer',
            'category',
            'explanation'
        ]


class QuizSubmissionSerializer(serializers.ModelSerializer):
    userAnswers = serializers.JSONField(source='user_answers')
    isPassed = serializers.BooleanField(source='is_passed')
    totalQuestions = serializers.IntegerField(source='total_questions')

    class Meta:
        model = QuizSubmission
        fields = [
            'id',
            'score',
            'totalQuestions',
            'percentage',
            'isPassed',
            'userAnswers',
            'attempts',
            'submitted_at'
        ]


class FirstDaySessionSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='session_id')
    time = serializers.CharField(source='time_slot')
    type = serializers.CharField(source='session_type')
    status = serializers.SerializerMethodField()

    class Meta:
        model = FirstDaySession
        fields = [
            'id',
            'time',
            'title',
            'host',
            'location',
            'description',
            'type',
            'status'
        ]

    def get_status(self, obj):
        request = self.context.get('request')
        employee = getattr(request, 'employee', None) or Employee.objects.first()
        if not employee:
            return 'upcoming'
        fdp = FirstDayProgress.objects.filter(employee=employee, session=obj).first()
        return fdp.status if fdp else 'upcoming'


class FirstDayProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = FirstDayProgress
        fields = ['id', 'employee', 'session', 'status', 'updated_at']


class OnboardingFeedbackSerializer(serializers.ModelSerializer):
    npsScore = serializers.IntegerField(source='nps_score')
    isSubmitted = serializers.BooleanField(source='is_submitted')
    submittedAt = serializers.CharField(source='submitted_at')
    ratings = serializers.SerializerMethodField()

    class Meta:
        model = OnboardingFeedback
        fields = [
            'ratings',
            'npsScore',
            'comments',
            'isSubmitted',
            'submittedAt'
        ]

    def get_ratings(self, obj):
        return {
            'journey': obj.rating_journey,
            'documentation': obj.rating_documentation,
            'support': obj.rating_support,
            'training': obj.rating_training
        }

    def validate_nps_score(self, value):
        if not (0 <= value <= 10):
            raise serializers.ValidationError("NPS score must be between 0 and 10.")
        return value


def get_employee_for_request(request):
    if not request:
        return Employee.objects.first()
    user = getattr(request, 'user', None)
    if user and user.is_authenticated:
        if hasattr(user, 'employee') and user.employee:
            return user.employee
        emp = Employee.objects.filter(user=user).first()
        if emp:
            return emp
        if getattr(user, 'email', None):
            emp = Employee.objects.filter(email=user.email).first()
            if emp:
                return emp
        emp = Employee.objects.filter(employee_id=user.username).first()
        if emp:
            return emp
    if hasattr(request, 'employee') and request.employee:
        return request.employee
    return Employee.objects.first()


class OnboardingStageSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='stage_id')
    stageNumber = serializers.IntegerField(source='stage_number')
    estimatedTime = serializers.CharField(source='estimated_time')
    status = serializers.SerializerMethodField()
    isCompleted = serializers.SerializerMethodField()
    overallProgress = serializers.SerializerMethodField()

    class Meta:
        model = OnboardingStage
        fields = [
            'id',
            'stageNumber',
            'title',
            'description',
            'path',
            'icon',
            'category',
            'estimatedTime',
            'status',
            'isCompleted',
            'overallProgress'
        ]

    def get_status(self, obj):
        request = self.context.get('request')
        employee = get_employee_for_request(request)
        if not employee:
            return 'pending'
        sp = EmployeeStageProgress.objects.filter(employee=employee, stage=obj).first()
        return sp.status if sp else 'pending'

    def get_isCompleted(self, obj):
        request = self.context.get('request')
        employee = get_employee_for_request(request)
        if not employee:
            return False
        sp = EmployeeStageProgress.objects.filter(employee=employee, stage=obj).first()
        return sp.is_completed if sp else False

    def get_overallProgress(self, obj):
        request = self.context.get('request')
        employee = get_employee_for_request(request)
        if not employee:
            return 0
        total = OnboardingStage.objects.filter(is_active=True).count()
        if total == 0:
            return 0
        completed = EmployeeStageProgress.objects.filter(
            employee=employee, stage__is_active=True, is_completed=True
        ).count()
        return round((completed / total) * 100)


class EmployeeStageProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmployeeStageProgress
        fields = ['id', 'employee', 'stage', 'status', 'is_completed', 'updated_at']


class CandidateInvitationSerializer(serializers.ModelSerializer):
    fullName = serializers.CharField(source='full_name', read_only=True)
    employeeId = serializers.CharField(source='employee_id', read_only=True)
    jobTitle = serializers.CharField(source='job_title', read_only=True)
    joiningDate = serializers.CharField(source='joining_date', read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    expiresAt = serializers.DateTimeField(source='expires_at', read_only=True)
    acceptedAt = serializers.DateTimeField(source='accepted_at', read_only=True)
    isExpired = serializers.BooleanField(source='is_expired', read_only=True)

    class Meta:
        model = CandidateInvitation
        fields = [
            'id',
            'email',
            'full_name',
            'fullName',
            'employee_id',
            'employeeId',
            'job_title',
            'jobTitle',
            'department',
            'joining_date',
            'joiningDate',
            'manager',
            'status',
            'created_at',
            'createdAt',
            'expires_at',
            'expiresAt',
            'accepted_at',
            'acceptedAt',
            'is_expired',
            'isExpired',
        ]
        read_only_fields = [
            'id',
            'employee_id',
            'status',
            'created_at',
            'expires_at',
            'accepted_at',
            'is_expired'
        ]


class CandidateInvitationPreviewSerializer(serializers.ModelSerializer):
    fullName = serializers.CharField(source='full_name', read_only=True)
    jobTitle = serializers.CharField(source='job_title', read_only=True)
    joiningDate = serializers.CharField(source='joining_date', read_only=True)
    expiresAt = serializers.DateTimeField(source='expires_at', read_only=True)

    class Meta:
        model = CandidateInvitation
        fields = [
            'email',
            'full_name',
            'fullName',
            'job_title',
            'jobTitle',
            'department',
            'joining_date',
            'joiningDate',
            'manager',
            'status',
            'expires_at',
            'expiresAt'
        ]
        read_only_fields = fields


class NotificationSerializer(serializers.ModelSerializer):
    type = serializers.CharField(source='notification_type', read_only=True)
    notificationType = serializers.CharField(source='notification_type', read_only=True)
    actionUrl = serializers.CharField(source='action_url', read_only=True)
    isRead = serializers.BooleanField(source='is_read', read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    readAt = serializers.DateTimeField(source='read_at', read_only=True)

    class Meta:
        model = Notification
        fields = [
            'id',
            'type',
            'notification_type',
            'notificationType',
            'title',
            'message',
            'related_object_type',
            'related_object_id',
            'action_url',
            'actionUrl',
            'is_read',
            'isRead',
            'created_at',
            'createdAt',
            'read_at',
            'readAt'
        ]
        read_only_fields = fields


class AdminAuditLogSerializer(serializers.ModelSerializer):
    admin_username = serializers.SerializerMethodField()
    adminUsername = serializers.SerializerMethodField()
    admin_email = serializers.SerializerMethodField()
    adminEmail = serializers.SerializerMethodField()
    admin_name = serializers.SerializerMethodField()
    adminName = serializers.SerializerMethodField()
    targetType = serializers.CharField(source='target_type', read_only=True)
    targetId = serializers.CharField(source='target_id', read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = AdminAuditLog
        fields = [
            'id',
            'admin',
            'admin_username',
            'adminUsername',
            'admin_email',
            'adminEmail',
            'admin_name',
            'adminName',
            'action',
            'target_type',
            'targetType',
            'target_id',
            'targetId',
            'description',
            'created_at',
            'createdAt'
        ]
        read_only_fields = fields

    def get_admin_username(self, obj):
        return obj.admin.username if obj.admin else 'System'

    def get_adminUsername(self, obj):
        return self.get_admin_username(obj)

    def get_admin_email(self, obj):
        return obj.admin.email if obj.admin else ''

    def get_adminEmail(self, obj):
        return self.get_admin_email(obj)

    def get_admin_name(self, obj):
        if not obj.admin:
            return 'System'
        if hasattr(obj.admin, 'employee') and obj.admin.employee:
            return obj.admin.employee.name
        full = f"{obj.admin.first_name} {obj.admin.last_name}".strip()
        return full or obj.admin.username

    def get_adminName(self, obj):
        return self.get_admin_name(obj)


class AdminUserListSerializer(serializers.ModelSerializer):
    system_role = serializers.SerializerMethodField()
    systemRole = serializers.SerializerMethodField()
    employee = serializers.SerializerMethodField()
    isActive = serializers.BooleanField(source='is_active', read_only=True)
    dateJoined = serializers.DateTimeField(source='date_joined', read_only=True)
    lastLogin = serializers.DateTimeField(source='last_login', read_only=True)

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'is_active',
            'isActive',
            'is_staff',
            'is_superuser',
            'date_joined',
            'dateJoined',
            'last_login',
            'lastLogin',
            'system_role',
            'systemRole',
            'employee'
        ]
        read_only_fields = fields

    def get_system_role(self, obj):
        if hasattr(obj, 'employee') and obj.employee:
            return obj.employee.system_role
        return Employee.ROLE_ADMIN if obj.is_superuser else Employee.ROLE_EMPLOYEE

    def get_systemRole(self, obj):
        return self.get_system_role(obj)

    def get_employee(self, obj):
        if not hasattr(obj, 'employee') or not obj.employee:
            return None
        emp = obj.employee
        total_stages = OnboardingStage.objects.filter(is_active=True).count() or 10
        comp_count = emp.stages_progress.filter(stage__is_active=True, is_completed=True).count()
        progress = round((comp_count / total_stages) * 100) if total_stages > 0 else 0
        return {
            'id': emp.id,
            'employee_id': emp.employee_id,
            'employeeId': emp.employee_id,
            'name': emp.name,
            'role': emp.role,
            'job_title': emp.role,
            'jobTitle': emp.role,
            'designation': emp.designation,
            'department': emp.department,
            'joining_date': emp.joining_date,
            'joiningDate': emp.joining_date,
            'manager': emp.manager_name,
            'manager_name': emp.manager_name,
            'managerName': emp.manager_name,
            'avatar': emp.avatar,
            'onboarding_progress': progress,
            'onboardingProgress': progress,
            'work_mode': emp.work_mode,
            'workMode': emp.work_mode,
            'location': emp.location
        }


class AdminUserDetailSerializer(serializers.ModelSerializer):
    system_role = serializers.SerializerMethodField()
    systemRole = serializers.SerializerMethodField()
    employee = serializers.SerializerMethodField()
    isActive = serializers.BooleanField(source='is_active', read_only=True)
    dateJoined = serializers.DateTimeField(source='date_joined', read_only=True)
    lastLogin = serializers.DateTimeField(source='last_login', read_only=True)

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'is_active',
            'isActive',
            'is_staff',
            'is_superuser',
            'date_joined',
            'dateJoined',
            'last_login',
            'lastLogin',
            'system_role',
            'systemRole',
            'employee'
        ]
        read_only_fields = fields

    def get_system_role(self, obj):
        if hasattr(obj, 'employee') and obj.employee:
            return obj.employee.system_role
        return Employee.ROLE_ADMIN if obj.is_superuser else Employee.ROLE_EMPLOYEE

    def get_systemRole(self, obj):
        return self.get_system_role(obj)

    def get_employee(self, obj):
        if not hasattr(obj, 'employee') or not obj.employee:
            return None
        emp = obj.employee
        total_stages = OnboardingStage.objects.filter(is_active=True).count() or 10
        comp_count = emp.stages_progress.filter(stage__is_active=True, is_completed=True).count()
        progress = round((comp_count / total_stages) * 100) if total_stages > 0 else 0

        # Detailed profile
        profile_data = None
        if hasattr(emp, 'profile') and emp.profile:
            p = emp.profile
            profile_data = {
                'phone': p.phone,
                'date_of_birth': str(p.date_of_birth),
                'dateOfBirth': str(p.date_of_birth),
                'blood_group': p.blood_group,
                'bloodGroup': p.blood_group,
                'address': p.address,
                'city': p.city,
                'state': p.state,
                'pincode': p.pincode,
                'emergency_contact_name': p.emergency_contact_name,
                'emergencyContactName': p.emergency_contact_name,
                'emergency_contact_relation': p.emergency_contact_relation,
                'emergencyContactRelation': p.emergency_contact_relation,
                'emergency_contact_phone': p.emergency_contact_phone,
                'emergencyContactPhone': p.emergency_contact_phone,
                'is_completed': p.is_completed,
                'isCompleted': p.is_completed,
            }

        # Stages progress
        stages_data = []
        emp_progress_map = {p.stage_id: p for p in emp.stages_progress.all()}
        for st in OnboardingStage.objects.order_by('stage_number').all():
            sp = emp_progress_map.get(st.id)
            stages_data.append({
                'stage_number': st.stage_number,
                'stageNumber': st.stage_number,
                'title': st.title,
                'status': sp.status if sp else 'pending',
                'is_completed': sp.is_completed if sp else False,
                'isCompleted': sp.is_completed if sp else False,
                'is_active': st.is_active,
                'isActive': st.is_active
            })

        # Offer letter status
        offer_letter_status = 'Pending'
        if hasattr(emp, 'offer_letter') and emp.offer_letter:
            offer_letter_status = 'Accepted' if emp.offer_letter.is_accepted else 'Pending'

        return {
            'id': emp.id,
            'employee_id': emp.employee_id,
            'employeeId': emp.employee_id,
            'name': emp.name,
            'email': emp.email,
            'role': emp.role,
            'job_title': emp.role,
            'jobTitle': emp.role,
            'designation': emp.designation,
            'department': emp.department,
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
                'email': emp.manager_email,
                'avatar': emp.manager_avatar
            },
            'hr_support': {
                'name': emp.hr_name,
                'role': emp.hr_role,
                'email': emp.hr_email,
                'avatar': emp.hr_avatar,
                'availability': emp.hr_availability
            },
            'profile': profile_data,
            'onboarding_progress': progress,
            'onboardingProgress': progress,
            'stages_progress': stages_data,
            'stagesProgress': stages_data,
            'offer_letter_status': offer_letter_status,
            'offerLetterStatus': offer_letter_status,
        }


class AdminStageConfigSerializer(serializers.ModelSerializer):
    stageId = serializers.CharField(source='stage_id', read_only=True)
    stageNumber = serializers.IntegerField(source='stage_number', read_only=True)
    estimatedTime = serializers.CharField(source='estimated_time', required=False)
    isActive = serializers.BooleanField(source='is_active', required=False)

    class Meta:
        model = OnboardingStage
        fields = [
            'id',
            'stage_id',
            'stageId',
            'stage_number',
            'stageNumber',
            'title',
            'description',
            'path',
            'icon',
            'category',
            'estimated_time',
            'estimatedTime',
            'is_active',
            'isActive',
            'created_at'
        ]
        read_only_fields = ['id', 'stage_id', 'stageId', 'stage_number', 'stageNumber', 'path', 'icon', 'category', 'created_at']



