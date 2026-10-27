from django.db import models
from django.contrib.auth.models import User


class Employee(models.Model):
    """Core Employee Identity record in NOVA Tech."""

    ROLE_EMPLOYEE = 'EMPLOYEE'
    ROLE_HR_MANAGER = 'HR_MANAGER'
    ROLE_ADMIN = 'ADMIN'

    SYSTEM_ROLE_CHOICES = [
        (ROLE_EMPLOYEE, 'Employee'),
        (ROLE_HR_MANAGER, 'HR Manager'),
        (ROLE_ADMIN, 'System Administrator'),
    ]

    user = models.OneToOneField(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='employee')
    employee_id = models.CharField(max_length=50, unique=True, default="EMP-2026-8941")
    name = models.CharField(max_length=150, default="Rahul Kumar")
    email = models.EmailField(unique=True, default="rahul.kumar@novatech.io")
    role = models.CharField(max_length=100, default="Software Engineer")
    system_role = models.CharField(
        max_length=20,
        choices=SYSTEM_ROLE_CHOICES,
        default=ROLE_EMPLOYEE,
        help_text="System authorization role for platform RBAC permissions."
    )
    designation = models.CharField(max_length=100, default="Software Engineer")
    department = models.CharField(max_length=100, default="Data & Technology")
    joining_date = models.CharField(max_length=100, default="Monday, September 21, 2026")
    joining_time = models.CharField(max_length=50, default="09:30 AM")
    location = models.CharField(max_length=200, default="NOVA Tech – Chandigarh Office")
    work_mode = models.CharField(max_length=100, default="Hybrid (3 Days Office / 2 Days Remote)")

    @property
    def is_employee_role(self):
        return self.system_role == self.ROLE_EMPLOYEE

    @property
    def is_hr_manager(self):
        return self.system_role == self.ROLE_HR_MANAGER

    @property
    def is_admin_role(self):
        return self.system_role == self.ROLE_ADMIN

    @property
    def is_hr_or_admin(self):
        return self.system_role in (self.ROLE_HR_MANAGER, self.ROLE_ADMIN)
    
    # Reporting Manager Details
    manager_name = models.CharField(max_length=150, default="Arjun Mehta")
    manager_role = models.CharField(max_length=100, default="Engineering Director")
    manager_email = models.EmailField(default="arjun.mehta@novatech.io")
    manager_avatar = models.URLField(default="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200")
    
    # HR Support Partner
    hr_name = models.CharField(max_length=150, default="Priya Sharma")
    hr_role = models.CharField(max_length=100, default="People & Culture Lead")
    hr_email = models.EmailField(default="priya.sharma@novatech.io")
    hr_avatar = models.URLField(default="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200")
    hr_availability = models.CharField(max_length=150, default="Available Mon-Fri, 9:00 AM - 6:00 PM IST")

    avatar = models.URLField(default="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Employee'
        verbose_name_plural = 'Employees'

    def __str__(self):
        return f"{self.name} ({self.employee_id})"


class EmployeeProfile(models.Model):
    """Personal identity, contact preferences, and emergency contact."""
    employee = models.OneToOneField(Employee, on_delete=models.CASCADE, related_name='profile')
    phone = models.CharField(max_length=30, default="+91 98765 43210")
    date_of_birth = models.DateField(default="1998-07-14")
    blood_group = models.CharField(max_length=10, default="O+")
    address = models.CharField(max_length=255, default="Flat 402, Silicon Heights, Sector 62")
    city = models.CharField(max_length=100, default="Chandigarh")
    state = models.CharField(max_length=100, default="Punjab")
    pincode = models.CharField(max_length=20, default="160062")
    
    # Emergency Contact
    emergency_contact_name = models.CharField(max_length=150, default="Sunita Kumar")
    emergency_contact_relation = models.CharField(max_length=50, default="Mother")
    emergency_contact_phone = models.CharField(max_length=30, default="+91 98765 11223")
    
    is_completed = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Employee Profile'
        verbose_name_plural = 'Employee Profiles'

    def __str__(self):
        return f"Profile of {self.employee.name}"


class OnboardingDocument(models.Model):
    """Required compliance and payroll documents."""
    VERIFICATION_STATUSES = [
        ('Not Uploaded', 'Not Uploaded'),
        ('Pending Verification', 'Pending Verification'),
        ('Verified', 'Verified'),
        ('Rejected', 'Rejected'),
    ]

    DOCUMENT_TYPES = [
        ('Identification', 'Identification'),
        ('Academic', 'Academic'),
        ('Legal', 'Legal'),
        ('Finance', 'Finance'),
        ('Employment', 'Employment'),
        ('HR Compliance', 'HR Compliance'),
    ]

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='documents')
    name = models.CharField(max_length=200)
    document_type = models.CharField(max_length=100, choices=DOCUMENT_TYPES)
    file = models.FileField(
        upload_to='onboarding_documents/%Y/%m/',
        null=True,
        blank=True,
        help_text="Uploaded document binary file (PDF, PNG, JPG)."
    )
    upload_status = models.CharField(max_length=50, default='Not Uploaded')
    verification_status = models.CharField(max_length=50, choices=VERIFICATION_STATUSES, default='Not Uploaded')
    date_str = models.CharField(max_length=50, default="Sep 01, 2026")
    size_str = models.CharField(max_length=50, default="1.5 MB")
    remarks = models.TextField(blank=True, default="")
    is_required = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def file_url(self):
        if self.file and hasattr(self.file, 'url'):
            return self.file.url
        return None

    class Meta:
        ordering = ['id']
        verbose_name = 'Onboarding Document'
        verbose_name_plural = 'Onboarding Documents'

    def __str__(self):
        return f"{self.name} - {self.verification_status}"


class OfferLetter(models.Model):
    """Official employment agreement and digital acceptance signature."""
    employee = models.OneToOneField(Employee, on_delete=models.CASCADE, related_name='offer_letter')
    ref_no = models.CharField(max_length=50, unique=True, default="NOVA/OFFER/2026/0894")
    issue_date = models.CharField(max_length=50, default="August 25, 2026")
    ctc = models.CharField(max_length=50, default="₹14,50,000 per annum")
    salary_breakdown = models.JSONField(default=list)
    probation = models.CharField(max_length=100, default="3 Months from Joining Date")
    notice_period = models.CharField(max_length=100, default="30 Days during probation, 60 Days thereafter")
    is_accepted = models.BooleanField(default=True)
    accepted_at = models.CharField(max_length=100, blank=True, null=True, default="August 28, 2026 at 11:42 AM IST")
    signature = models.CharField(max_length=150, blank=True, default="Rahul Kumar")
    signature_hash = models.CharField(max_length=128, blank=True, default="SHA256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def hash(self):
        return self.signature_hash

    class Meta:
        verbose_name = 'Offer Letter'
        verbose_name_plural = 'Offer Letters'

    def __str__(self):
        return f"OfferLetter {self.ref_no} ({'Signed' if self.is_accepted else 'Pending'})"


class CompanyPolicy(models.Model):
    """Company governance policy."""
    policy_id = models.CharField(max_length=50, unique=True)
    title = models.CharField(max_length=200)
    category = models.CharField(max_length=100)
    read_time = models.CharField(max_length=50, default="8 mins")
    summary = models.TextField()
    key_points = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['id']
        verbose_name = 'Company Policy'
        verbose_name_plural = 'Company Policies'

    def __str__(self):
        return self.title


class PolicyAcknowledgement(models.Model):
    """Acknowledgement of policies by an employee."""
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='policy_acknowledgements')
    policy = models.ForeignKey(CompanyPolicy, on_delete=models.CASCADE, related_name='acknowledgements')
    acknowledged = models.BooleanField(default=False)
    acknowledged_at = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['employee', 'policy'], name='unique_employee_policy')
        ]
        verbose_name = 'Policy Acknowledgement'
        verbose_name_plural = 'Policy Acknowledgements'

    def __str__(self):
        return f"{self.employee.name} - {self.policy.title} ({'Acknowledged' if self.acknowledged else 'Pending'})"


class TrainingModule(models.Model):
    """Learning curriculum module."""
    module_id = models.CharField(max_length=50, unique=True)
    title = models.CharField(max_length=200)
    description = models.TextField()
    duration = models.CharField(max_length=50)
    category = models.CharField(max_length=100)
    icon = models.CharField(max_length=50, default="GraduationCap")
    modules_count = models.IntegerField(default=4)
    lessons = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['id']
        verbose_name = 'Training Module'
        verbose_name_plural = 'Training Modules'

    def __str__(self):
        return self.title


class EmployeeTrainingProgress(models.Model):
    """Employee progress in a training module."""
    STATUS_CHOICES = [
        ('Not Started', 'Not Started'),
        ('In Progress', 'In Progress'),
        ('Completed', 'Completed'),
    ]

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='training_progresses')
    module = models.ForeignKey(TrainingModule, on_delete=models.CASCADE, related_name='employee_progresses')
    progress = models.IntegerField(default=0)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default="Not Started")
    completed_modules = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['employee', 'module'], name='unique_employee_training_progress')
        ]
        verbose_name = 'Employee Training Progress'
        verbose_name_plural = 'Employee Training Progresses'

    def __str__(self):
        return f"{self.employee.name} - {self.module.title} ({self.progress}%)"


class QuizQuestion(models.Model):
    """Multiple choice question for knowledge assessment."""
    question_id = models.CharField(max_length=50, unique=True)
    question = models.TextField()
    options = models.JSONField(default=list)
    correct_answer = models.IntegerField(default=0)
    category = models.CharField(max_length=100)
    explanation = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['id']
        verbose_name = 'Quiz Question'
        verbose_name_plural = 'Quiz Questions'

    def __str__(self):
        return f"{self.question_id}: {self.question[:40]}..."


class QuizSubmission(models.Model):
    """Employee quiz attempt results."""
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='quiz_submissions')
    score = models.IntegerField(default=0)
    total_questions = models.IntegerField(default=5)
    percentage = models.IntegerField(default=0)
    is_passed = models.BooleanField(default=False)
    user_answers = models.JSONField(default=dict)
    attempts = models.IntegerField(default=1)
    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-submitted_at']
        verbose_name = 'Quiz Submission'
        verbose_name_plural = 'Quiz Submissions'

    def __str__(self):
        return f"{self.employee.name} - Quiz {self.percentage}% ({'Pass' if self.is_passed else 'Fail'})"


class FirstDaySession(models.Model):
    """Schedule event for first day orientation."""
    session_id = models.CharField(max_length=50, unique=True)
    order = models.IntegerField(default=1)
    time_slot = models.CharField(max_length=100)
    title = models.CharField(max_length=200)
    host = models.CharField(max_length=150)
    location = models.CharField(max_length=150)
    description = models.TextField()
    session_type = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'id']
        verbose_name = 'First Day Session'
        verbose_name_plural = 'First Day Sessions'

    def __str__(self):
        return f"{self.time_slot} - {self.title}"


class FirstDayProgress(models.Model):
    """Employee completion status for a first day session."""
    STATUS_CHOICES = [
        ('upcoming', 'Upcoming'),
        ('in-progress', 'In Progress'),
        ('completed', 'Completed'),
    ]

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='first_day_progress')
    session = models.ForeignKey(FirstDaySession, on_delete=models.CASCADE, related_name='employee_progress')
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='upcoming')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['employee', 'session'], name='unique_employee_first_day_progress')
        ]
        verbose_name = 'First Day Progress'
        verbose_name_plural = 'First Day Progresses'

    def __str__(self):
        return f"{self.session.title} - {self.status}"


class OnboardingFeedback(models.Model):
    """New hire feedback and NPS rating."""
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='feedbacks')
    rating_journey = models.IntegerField(default=5)
    rating_documentation = models.IntegerField(default=5)
    rating_support = models.IntegerField(default=5)
    rating_training = models.IntegerField(default=5)
    nps_score = models.IntegerField(default=10)
    comments = models.TextField(blank=True, default="")
    is_submitted = models.BooleanField(default=False)
    submitted_at = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    @property
    def ratings(self):
        return {
            'journey': self.rating_journey,
            'documentation': self.rating_documentation,
            'support': self.rating_support,
            'training': self.rating_training,
        }

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Onboarding Feedback'
        verbose_name_plural = 'Onboarding Feedbacks'

    def __str__(self):
        return f"Feedback from {self.employee.name} (NPS: {self.nps_score})"


class OnboardingStage(models.Model):
    """The 10 milestones defining the employee onboarding experience."""
    stage_id = models.CharField(max_length=50, unique=True)
    stage_number = models.IntegerField()
    title = models.CharField(max_length=150)
    description = models.TextField()
    path = models.CharField(max_length=100)
    icon = models.CharField(max_length=50)
    category = models.CharField(max_length=100)
    estimated_time = models.CharField(max_length=50)
    is_active = models.BooleanField(default=True, help_text="Administrative toggle to enable/disable stage.")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['stage_number']
        verbose_name = 'Onboarding Stage'
        verbose_name_plural = 'Onboarding Stages'

    def __str__(self):
        return f"Stage {self.stage_number}: {self.title}"


class EmployeeStageProgress(models.Model):
    """Stage status for each employee."""
    STATUS_CHOICES = [
        ('completed', 'Completed'),
        ('current', 'Current'),
        ('pending', 'Pending'),
    ]

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='stages_progress')
    stage = models.ForeignKey(OnboardingStage, on_delete=models.CASCADE, related_name='employee_progress')
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='pending')
    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['employee', 'stage'], name='unique_employee_stage_progress')
        ]
        verbose_name = 'Employee Stage Progress'
        verbose_name_plural = 'Employee Stage Progresses'

    def __str__(self):
        return f"{self.employee.name} - {self.stage.title} ({self.status})"


class CandidateInvitation(models.Model):
    """
    Secure candidate onboarding invitation generated by HR Managers or Admins.
    Stores only the SHA-256 token hash; raw cryptographic token is never stored in DB.
    """
    STATUS_PENDING = 'PENDING'
    STATUS_ACCEPTED = 'ACCEPTED'
    STATUS_EXPIRED = 'EXPIRED'
    STATUS_CANCELLED = 'CANCELLED'

    STATUS_CHOICES = [
        (STATUS_PENDING, 'Pending'),
        (STATUS_ACCEPTED, 'Accepted'),
        (STATUS_EXPIRED, 'Expired'),
        (STATUS_CANCELLED, 'Cancelled'),
    ]

    email = models.EmailField(help_text="Candidate personal or official email address.")
    full_name = models.CharField(max_length=150, help_text="Full legal name of candidate.")
    employee_id = models.CharField(max_length=50, blank=True, null=True, help_text="Allocated unique employee ID.")
    job_title = models.CharField(max_length=100, default="Software Engineer")
    department = models.CharField(max_length=100, default="Data & Technology")
    joining_date = models.CharField(max_length=100, default="Monday, October 19, 2026")
    manager = models.CharField(max_length=150, default="Arjun Mehta")
    invited_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='sent_invitations',
        help_text="HR Manager or Administrator who issued the invite."
    )
    token_hash = models.CharField(max_length=64, unique=True, db_index=True, help_text="SHA-256 hash of the invitation token.")
    expires_at = models.DateTimeField(help_text="Timestamp when the invitation expires (48-hour default).")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    accepted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Candidate Invitation'
        verbose_name_plural = 'Candidate Invitations'

    def __str__(self):
        return f"Invite for {self.full_name} <{self.email}> [{self.status}]"

    @property
    def is_expired(self):
        from django.utils import timezone
        return self.status == self.STATUS_EXPIRED or (
            self.status == self.STATUS_PENDING and timezone.now() > self.expires_at
        )


class Notification(models.Model):
    """
    Real in-app notification for NOVA Tech platform users.
    User-scoped alerts for document updates, training milestones, policies,
    offer letters, candidate invitations, and system messages.
    """
    TYPE_DOCUMENT_UPLOADED = 'DOCUMENT_UPLOADED'
    TYPE_DOCUMENT_VERIFIED = 'DOCUMENT_VERIFIED'
    TYPE_DOCUMENT_REJECTED = 'DOCUMENT_REJECTED'
    TYPE_TRAINING_ASSIGNED = 'TRAINING_ASSIGNED'
    TYPE_TRAINING_COMPLETED = 'TRAINING_COMPLETED'
    TYPE_POLICY_PENDING = 'POLICY_PENDING'
    TYPE_POLICY_ACKNOWLEDGED = 'POLICY_ACKNOWLEDGED'
    TYPE_FIRST_DAY_REMINDER = 'FIRST_DAY_REMINDER'
    TYPE_FIRST_DAY_CONFIRMED = 'FIRST_DAY_CONFIRMED'
    TYPE_OFFER_LETTER = 'OFFER_LETTER'
    TYPE_ONBOARDING_PROGRESS = 'ONBOARDING_PROGRESS'
    TYPE_CANDIDATE_INVITATION = 'CANDIDATE_INVITATION'
    TYPE_FEEDBACK_REQUEST = 'FEEDBACK_REQUEST'
    TYPE_SYSTEM = 'SYSTEM'

    NOTIFICATION_TYPE_CHOICES = [
        (TYPE_DOCUMENT_UPLOADED, 'Document Uploaded'),
        (TYPE_DOCUMENT_VERIFIED, 'Document Verified'),
        (TYPE_DOCUMENT_REJECTED, 'Document Rejected'),
        (TYPE_TRAINING_ASSIGNED, 'Training Assigned'),
        (TYPE_TRAINING_COMPLETED, 'Training Completed'),
        (TYPE_POLICY_PENDING, 'Policy Pending'),
        (TYPE_POLICY_ACKNOWLEDGED, 'Policy Acknowledged'),
        (TYPE_FIRST_DAY_REMINDER, 'First Day Reminder'),
        (TYPE_FIRST_DAY_CONFIRMED, 'First Day Confirmed'),
        (TYPE_OFFER_LETTER, 'Offer Letter'),
        (TYPE_ONBOARDING_PROGRESS, 'Onboarding Progress'),
        (TYPE_CANDIDATE_INVITATION, 'Candidate Invitation'),
        (TYPE_FEEDBACK_REQUEST, 'Feedback Request'),
        (TYPE_SYSTEM, 'System Notification'),
    ]

    recipient = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='notifications',
        db_index=True,
        help_text="Target recipient user who receives this notification."
    )
    notification_type = models.CharField(
        max_length=50,
        choices=NOTIFICATION_TYPE_CHOICES,
        default=TYPE_SYSTEM,
        db_index=True
    )
    title = models.CharField(max_length=200)
    message = models.TextField()
    related_object_type = models.CharField(max_length=50, blank=True, null=True)
    related_object_id = models.CharField(max_length=50, blank=True, null=True)
    action_url = models.CharField(max_length=255, blank=True, null=True)
    is_read = models.BooleanField(default=False, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    read_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient', 'is_read', '-created_at']),
        ]
        verbose_name = 'Notification'
        verbose_name_plural = 'Notifications'

    def __str__(self):
        status_str = "Read" if self.is_read else "Unread"
        return f"[{status_str}] {self.recipient.username} - {self.title} ({self.notification_type})"

    def mark_as_read(self):
        from django.utils import timezone
        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()
            self.save(update_fields=['is_read', 'read_at'])


class AdminAuditLog(models.Model):
    """
    Lightweight audit log for tracking high-privilege administrative actions.
    Records role modifications, account activation/deactivations, and configuration changes.
    Strictly prohibits storing sensitive authentication secrets (passwords, tokens, hashes).
    """
    ACTION_ROLE_CHANGE = 'ROLE_CHANGE'
    ACTION_ACCOUNT_ACTIVATED = 'ACCOUNT_ACTIVATED'
    ACTION_ACCOUNT_DEACTIVATED = 'ACCOUNT_DEACTIVATED'
    ACTION_CONFIG_CHANGE = 'CONFIG_CHANGE'

    ACTION_CHOICES = [
        (ACTION_ROLE_CHANGE, 'Role Change'),
        (ACTION_ACCOUNT_ACTIVATED, 'Account Activated'),
        (ACTION_ACCOUNT_DEACTIVATED, 'Account Deactivated'),
        (ACTION_CONFIG_CHANGE, 'Configuration Changed'),
    ]

    admin = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='admin_audit_logs',
        help_text="Administrator who performed the action."
    )
    action = models.CharField(max_length=50, choices=ACTION_CHOICES, db_index=True)
    target_type = models.CharField(max_length=50, help_text="Entity type modified (User, OnboardingStage, SystemConfig).")
    target_id = models.CharField(max_length=50, blank=True, default="", help_text="ID of the modified target entity.")
    description = models.TextField(help_text="Human-readable description of the admin action taken.")
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['action', '-created_at']),
        ]
        verbose_name = 'Admin Audit Log'
        verbose_name_plural = 'Admin Audit Logs'

    def __str__(self):
        admin_name = self.admin.username if self.admin else 'System'
        return f"[{self.created_at.strftime('%Y-%m-%d %H:%M') if self.created_at else 'New'}] {admin_name} - {self.action}: {self.description[:40]}"



