from django.contrib import admin
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
    AdminAuditLog,
)


class EmployeeProfileInline(admin.StackedInline):
    model = EmployeeProfile
    can_delete = False
    verbose_name_plural = "Personal & Emergency Profile"
    extra = 0
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = (
        'employee_id',
        'name',
        'email',
        'role',
        'system_role',
        'department',
        'work_mode',
        'created_at',
    )
    list_filter = ('system_role', 'department', 'work_mode')
    search_fields = ('employee_id', 'name', 'email', 'role', 'designation', 'department')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at')
    inlines = [EmployeeProfileInline]
    fieldsets = (
        ("Account Link & System Authorization", {
            'fields': ('user', 'employee_id', 'system_role')
        }),
        ("Identity & Designation", {
            'fields': (
                'name',
                'email',
                'role',
                'designation',
                'department',
                'location',
                'work_mode',
                'joining_date',
                'joining_time',
                'avatar',
            )
        }),
        ("Reporting Manager Details", {
            'fields': (
                'manager_name',
                'manager_role',
                'manager_email',
                'manager_avatar',
            )
        }),
        ("HR Support Partner", {
            'fields': (
                'hr_name',
                'hr_role',
                'hr_email',
                'hr_avatar',
                'hr_availability',
            )
        }),
        ("Audit Metadata", {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )


@admin.register(EmployeeProfile)
class EmployeeProfileAdmin(admin.ModelAdmin):
    list_display = (
        'employee',
        'phone',
        'city',
        'blood_group',
        'emergency_contact_name',
        'emergency_contact_phone',
        'is_completed',
    )
    list_filter = ('is_completed', 'blood_group')
    search_fields = (
        'employee__name',
        'employee__employee_id',
        'employee__email',
        'phone',
        'emergency_contact_name',
        'emergency_contact_phone',
    )
    readonly_fields = ('created_at', 'updated_at')


@admin.register(OnboardingDocument)
class OnboardingDocumentAdmin(admin.ModelAdmin):
    list_display = (
        'name',
        'employee',
        'document_type',
        'upload_status',
        'verification_status',
        'is_required',
        'created_at',
    )
    list_filter = ('verification_status', 'upload_status', 'document_type', 'is_required')
    search_fields = (
        'name',
        'employee__name',
        'employee__employee_id',
        'employee__email',
        'remarks',
    )
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at')


@admin.register(OfferLetter)
class OfferLetterAdmin(admin.ModelAdmin):
    list_display = (
        'ref_no',
        'employee',
        'ctc',
        'is_accepted',
        'accepted_at',
        'signature',
    )
    list_filter = ('is_accepted',)
    search_fields = ('ref_no', 'employee__name', 'employee__employee_id', 'signature')
    readonly_fields = ('signature_hash', 'created_at', 'updated_at')


@admin.register(CompanyPolicy)
class CompanyPolicyAdmin(admin.ModelAdmin):
    list_display = ('policy_id', 'title', 'category', 'read_time', 'created_at')
    list_filter = ('category',)
    search_fields = ('policy_id', 'title', 'category', 'summary')
    readonly_fields = ('created_at',)


@admin.register(PolicyAcknowledgement)
class PolicyAcknowledgementAdmin(admin.ModelAdmin):
    list_display = ('employee', 'policy', 'acknowledged', 'acknowledged_at', 'created_at')
    list_filter = ('acknowledged',)
    search_fields = ('employee__name', 'employee__employee_id', 'policy__title')
    readonly_fields = ('created_at',)


@admin.register(TrainingModule)
class TrainingModuleAdmin(admin.ModelAdmin):
    list_display = ('module_id', 'title', 'category', 'duration', 'modules_count')
    list_filter = ('category',)
    search_fields = ('module_id', 'title', 'category', 'description')
    readonly_fields = ('created_at',)


@admin.register(EmployeeTrainingProgress)
class EmployeeTrainingProgressAdmin(admin.ModelAdmin):
    list_display = (
        'employee',
        'module',
        'progress',
        'status',
        'completed_modules',
        'updated_at',
    )
    list_filter = ('status',)
    search_fields = ('employee__name', 'employee__employee_id', 'module__title')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(QuizQuestion)
class QuizQuestionAdmin(admin.ModelAdmin):
    list_display = ('question_id', 'category', 'question_preview', 'correct_answer')
    list_filter = ('category',)
    search_fields = ('question_id', 'question', 'explanation')
    readonly_fields = ('created_at',)

    def question_preview(self, obj):
        if not obj.question:
            return ""
        return obj.question[:60] + "..." if len(obj.question) > 60 else obj.question
    question_preview.short_description = "Question Preview"


@admin.register(QuizSubmission)
class QuizSubmissionAdmin(admin.ModelAdmin):
    list_display = (
        'employee',
        'score',
        'total_questions',
        'percentage',
        'is_passed',
        'attempts',
        'submitted_at',
    )
    list_filter = ('is_passed',)
    search_fields = ('employee__name', 'employee__employee_id')
    readonly_fields = ('submitted_at',)


@admin.register(FirstDaySession)
class FirstDaySessionAdmin(admin.ModelAdmin):
    list_display = (
        'order',
        'session_id',
        'time_slot',
        'title',
        'host',
        'location',
        'session_type',
    )
    list_filter = ('session_type',)
    search_fields = ('session_id', 'title', 'host', 'location', 'description')
    ordering = ('order',)
    readonly_fields = ('created_at',)


@admin.register(FirstDayProgress)
class FirstDayProgressAdmin(admin.ModelAdmin):
    list_display = ('employee', 'session', 'status', 'updated_at')
    list_filter = ('status',)
    search_fields = ('employee__name', 'employee__employee_id', 'session__title')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(OnboardingFeedback)
class OnboardingFeedbackAdmin(admin.ModelAdmin):
    list_display = (
        'employee',
        'nps_score',
        'rating_journey',
        'rating_documentation',
        'rating_support',
        'rating_training',
        'is_submitted',
        'submitted_at',
    )
    list_filter = ('is_submitted', 'nps_score')
    search_fields = ('employee__name', 'employee__employee_id', 'comments')
    readonly_fields = ('created_at',)


@admin.register(OnboardingStage)
class OnboardingStageAdmin(admin.ModelAdmin):
    list_display = (
        'stage_number',
        'stage_id',
        'title',
        'category',
        'estimated_time',
        'is_active',
    )
    list_filter = ('is_active', 'category')
    search_fields = ('stage_id', 'title', 'category', 'description')
    ordering = ('stage_number',)
    readonly_fields = ('created_at',)


@admin.register(EmployeeStageProgress)
class EmployeeStageProgressAdmin(admin.ModelAdmin):
    list_display = ('employee', 'stage', 'status', 'is_completed', 'updated_at')
    list_filter = ('is_completed', 'status')
    search_fields = ('employee__name', 'employee__employee_id', 'stage__title')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(CandidateInvitation)
class CandidateInvitationAdmin(admin.ModelAdmin):
    list_display = (
        'email',
        'full_name',
        'department',
        'job_title',
        'status',
        'invited_by',
        'expires_at',
        'created_at',
    )
    list_filter = ('status', 'department')
    search_fields = ('email', 'full_name', 'employee_id', 'job_title', 'department')
    ordering = ('-created_at',)
    # Security: token_hash is strictly read-only to prevent tampering or leak
    readonly_fields = ('token_hash', 'created_at', 'accepted_at')


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = (
        'recipient',
        'title',
        'notification_type',
        'is_read',
        'created_at',
        'read_at',
    )
    list_filter = ('is_read', 'notification_type')
    search_fields = ('recipient__username', 'recipient__email', 'title', 'message')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'read_at')


@admin.register(AdminAuditLog)
class AdminAuditLogAdmin(admin.ModelAdmin):
    """
    Strictly read-only administration view for AdminAuditLog.
    Prevents adding, mutating, or deleting tamper-evident audit records.
    """
    list_display = (
        'created_at',
        'admin',
        'action',
        'target_type',
        'target_id',
        'description_preview',
    )
    list_filter = ('action', 'target_type', 'created_at')
    search_fields = ('admin__username', 'admin__email', 'target_id', 'description')
    ordering = ('-created_at',)
    readonly_fields = (
        'admin',
        'action',
        'target_type',
        'target_id',
        'description',
        'created_at',
    )

    def description_preview(self, obj):
        if not obj.description:
            return ""
        return obj.description[:80] + "..." if len(obj.description) > 80 else obj.description
    description_preview.short_description = "Description Preview"

    # Security: Disallow all modifications through Django Admin UI
    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
