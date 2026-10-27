from rest_framework.permissions import BasePermission
from .models import Employee


def get_employee_for_user(user):
    """Resolves the Employee instance associated with the authenticated User."""
    if not user or not user.is_authenticated:
        return None
    if hasattr(user, 'employee') and user.employee:
        return user.employee
    emp = Employee.objects.filter(user=user).first()
    if emp:
        return emp
    if user.email:
        emp = Employee.objects.filter(email=user.email).first()
        if emp:
            return emp
    return Employee.objects.filter(employee_id=user.username).first()


class IsEmployee(BasePermission):
    """
    Allows access to users with any valid system role (EMPLOYEE, HR_MANAGER, ADMIN)
    who possess an active Employee identity record.
    """
    message = "Access restricted to valid employee accounts."

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        emp = get_employee_for_user(request.user)
        if not emp:
            return False
        return emp.system_role in (
            Employee.ROLE_EMPLOYEE,
            Employee.ROLE_HR_MANAGER,
            Employee.ROLE_ADMIN,
        )


class IsHRManager(BasePermission):
    """
    Allows access strictly to users with the HR_MANAGER system role.
    """
    message = "Access restricted to HR Managers."

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        emp = get_employee_for_user(request.user)
        return bool(emp and emp.system_role == Employee.ROLE_HR_MANAGER)


class IsAdmin(BasePermission):
    """
    Allows access to System Administrators (ADMIN system role or Django superuser).
    """
    message = "Access restricted to System Administrators."

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.user.is_superuser:
            return True
        emp = get_employee_for_user(request.user)
        return bool(emp and emp.system_role == Employee.ROLE_ADMIN)


class IsHROrAdmin(BasePermission):
    """
    Allows access to either HR Managers or System Administrators.
    """
    message = "Access restricted to HR Managers and Administrators."

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.user.is_superuser:
            return True
        emp = get_employee_for_user(request.user)
        return bool(
            emp and emp.system_role in (Employee.ROLE_HR_MANAGER, Employee.ROLE_ADMIN)
        )
