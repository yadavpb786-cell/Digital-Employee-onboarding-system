from django.urls import path, include
from rest_framework.routers import DefaultRouter, APIRootView
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    LoginView,
    LogoutView,
    AuthMeView,
    ChangePasswordView,
    EmployeeProfileView,
    OnboardingDocumentViewSet,
    OfferLetterView,
    OfferLetterAcceptView,
    CompanyPolicyViewSet,
    TrainingModuleViewSet,
    QuizViewSet,
    FirstDaySessionViewSet,
    OnboardingFeedbackView,
    OnboardingStageViewSet,
    RoleVerificationEmployeeView,
    RoleVerificationHRView,
    RoleVerificationAdminView,
    RoleVerificationHROrAdminView,
    CandidateInvitationViewSet,
    CandidateInvitationPreviewView,
    CandidateInvitationAcceptView,
    HRDashboardView,
    HREmployeeListView,
    HREmployeeDetailView,
    HRAnalyticsView,
    NotificationListView,
    NotificationUnreadCountView,
    NotificationMarkReadView,
    NotificationMarkAllReadView,
    AdminDashboardView,
    AdminUserListView,
    AdminUserDetailView,
    AdminUserRoleUpdateView,
    AdminUserStatusUpdateView,
    AdminAuditLogListView,
    AdminConfigurationView,
    AdminStageConfigUpdateView
)


class OnboardingAPIRootView(APIRootView):
    """NOVA Tech Onboarding API v1 Root Directory."""
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        resp = super().get(request, *args, **kwargs)
        if hasattr(resp, 'data') and isinstance(resp.data, dict):
            resp.data['auth-login'] = request.build_absolute_uri('/api/v1/auth/login/')
            resp.data['auth-refresh'] = request.build_absolute_uri('/api/v1/auth/refresh/')
            resp.data['auth-logout'] = request.build_absolute_uri('/api/v1/auth/logout/')
            resp.data['auth-me'] = request.build_absolute_uri('/api/v1/auth/me/')
            resp.data['auth-change-password'] = request.build_absolute_uri('/api/v1/auth/change-password/')
            resp.data['profile'] = request.build_absolute_uri('/api/v1/profile/')
            resp.data['offer-letter'] = request.build_absolute_uri('/api/v1/offer-letter/')
            resp.data['offer-letter-accept'] = request.build_absolute_uri('/api/v1/offer-letter/accept/')
            resp.data['feedback'] = request.build_absolute_uri('/api/v1/feedback/')
            resp.data['invitations'] = request.build_absolute_uri('/api/v1/invitations/')
            resp.data['invitations-preview'] = request.build_absolute_uri('/api/v1/invitations/preview/')
            resp.data['invitations-accept'] = request.build_absolute_uri('/api/v1/invitations/accept/')
            resp.data['hr-dashboard'] = request.build_absolute_uri('/api/v1/hr/dashboard/')
            resp.data['hr-employees'] = request.build_absolute_uri('/api/v1/hr/employees/')
            resp.data['hr-analytics'] = request.build_absolute_uri('/api/v1/hr/analytics/')
            resp.data['notifications'] = request.build_absolute_uri('/api/v1/notifications/')
            resp.data['notifications-unread-count'] = request.build_absolute_uri('/api/v1/notifications/unread-count/')
            resp.data['admin-dashboard'] = request.build_absolute_uri('/api/v1/admin/dashboard/')
            resp.data['admin-users'] = request.build_absolute_uri('/api/v1/admin/users/')
            resp.data['admin-audit-logs'] = request.build_absolute_uri('/api/v1/admin/audit-logs/')
            resp.data['admin-configuration'] = request.build_absolute_uri('/api/v1/admin/configuration/')
        return resp


class OnboardingRouter(DefaultRouter):
    APIRootView = OnboardingAPIRootView


router = OnboardingRouter()
router.register(r'documents', OnboardingDocumentViewSet, basename='document')
router.register(r'policies', CompanyPolicyViewSet, basename='policy')
router.register(r'training', TrainingModuleViewSet, basename='training')
router.register(r'quiz', QuizViewSet, basename='quiz')
router.register(r'first-day', FirstDaySessionViewSet, basename='firstday')
router.register(r'stages', OnboardingStageViewSet, basename='stage')
router.register(r'invitations', CandidateInvitationViewSet, basename='invitation')

urlpatterns = [
    path('auth/login/', LoginView.as_view(), name='auth-login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='auth-refresh'),
    path('auth/logout/', LogoutView.as_view(), name='auth-logout'),
    path('auth/me/', AuthMeView.as_view(), name='auth-me'),
    path('auth/change-password/', ChangePasswordView.as_view(), name='auth-change-password'),
    # Role-based access control test verification endpoints (Phase 3 Step 1)
    path('auth/role-test/employee/', RoleVerificationEmployeeView.as_view(), name='role-test-employee'),
    path('auth/role-test/hr/', RoleVerificationHRView.as_view(), name='role-test-hr'),
    path('auth/role-test/admin/', RoleVerificationAdminView.as_view(), name='role-test-admin'),
    path('auth/role-test/hr-or-admin/', RoleVerificationHROrAdminView.as_view(), name='role-test-hr-or-admin'),
    path('profile/', EmployeeProfileView.as_view(), name='employee-profile'),
    path('offer-letter/', OfferLetterView.as_view(), name='offer-letter'),
    path('offer-letter/accept/', OfferLetterAcceptView.as_view(), name='offer-letter-accept'),
    path('feedback/', OnboardingFeedbackView.as_view(), name='onboarding-feedback'),
    path('invitations/preview/', CandidateInvitationPreviewView.as_view(), name='invitation-preview'),
    path('invitations/accept/', CandidateInvitationAcceptView.as_view(), name='invitation-accept'),
    # HR Portal & Candidate Tracking Dashboard endpoints (Phase 3 Step 5 & 6A)
    path('hr/dashboard/', HRDashboardView.as_view(), name='hr-dashboard'),
    path('hr/employees/', HREmployeeListView.as_view(), name='hr-employees'),
    path('hr/employees/<str:pk>/', HREmployeeDetailView.as_view(), name='hr-employee-detail'),
    path('hr/analytics/', HRAnalyticsView.as_view(), name='hr-analytics'),
    # In-App Notifications (Phase 3 Step 6B)
    path('notifications/', NotificationListView.as_view(), name='notification-list'),
    path('notifications/unread-count/', NotificationUnreadCountView.as_view(), name='notification-unread-count'),
    path('notifications/<int:pk>/read/', NotificationMarkReadView.as_view(), name='notification-mark-read'),
    path('notifications/read-all/', NotificationMarkAllReadView.as_view(), name='notification-read-all'),
    # Admin Portal & System Administration endpoints (Phase 3 Step 6C)
    path('admin/dashboard/', AdminDashboardView.as_view(), name='admin-dashboard'),
    path('admin/users/', AdminUserListView.as_view(), name='admin-users'),
    path('admin/users/<int:pk>/', AdminUserDetailView.as_view(), name='admin-user-detail'),
    path('admin/users/<int:pk>/role/', AdminUserRoleUpdateView.as_view(), name='admin-user-role'),
    path('admin/users/<int:pk>/status/', AdminUserStatusUpdateView.as_view(), name='admin-user-status'),
    path('admin/audit-logs/', AdminAuditLogListView.as_view(), name='admin-audit-logs'),
    path('admin/configuration/', AdminConfigurationView.as_view(), name='admin-configuration'),
    path('admin/stages/<str:key>/', AdminStageConfigUpdateView.as_view(), name='admin-stage-config'),
    path('', include(router.urls)),
]
