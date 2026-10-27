"""
Centralized Notification Service for NOVA Tech platform.
Handles in-app notification creation, HR/Admin distribution,
duplicate prevention, and read-state management.
"""

from django.utils import timezone
from django.contrib.auth.models import User
from .models import Notification, Employee


def create_notification(
    recipient,
    notification_type,
    title,
    message,
    related_object_type=None,
    related_object_id=None,
    action_url=None,
    prevent_duplicates=True
):
    """
    Creates an in-app notification for a given user.
    If prevent_duplicates is True and an identical unread notification exists,
    it returns the existing notification to prevent spamming.
    """
    if not recipient or not isinstance(recipient, User):
        return None

    if prevent_duplicates:
        # Check for unread duplicate for this recipient and event
        filter_kwargs = {
            'recipient': recipient,
            'notification_type': notification_type,
            'is_read': False
        }
        if related_object_id is not None:
            filter_kwargs['related_object_id'] = str(related_object_id)
        if related_object_type is not None:
            filter_kwargs['related_object_type'] = related_object_type

        existing = Notification.objects.filter(**filter_kwargs).first()
        if existing:
            return existing

    return Notification.objects.create(
        recipient=recipient,
        notification_type=notification_type,
        title=title,
        message=message,
        related_object_type=related_object_type,
        related_object_id=str(related_object_id) if related_object_id is not None else None,
        action_url=action_url,
        is_read=False
    )


def notify_hr_and_admins(
    notification_type,
    title,
    message,
    action_url=None,
    related_object_type=None,
    related_object_id=None,
    exclude_user=None,
    prevent_duplicates=True
):
    """
    Broadcasts an in-app notification to all active HR Managers and Administrators.
    """
    # 1. Users whose employee profile has system_role HR_MANAGER or ADMIN
    hr_users = User.objects.filter(
        employee__system_role__in=[Employee.ROLE_HR_MANAGER, Employee.ROLE_ADMIN],
        is_active=True
    ).distinct()

    # 2. Staff/superusers who may not have an Employee record
    staff_users = User.objects.filter(
        is_staff=True,
        is_active=True
    ).distinct()

    target_users = list(set(list(hr_users) + list(staff_users)))
    created_list = []

    for target in target_users:
        if exclude_user and target.id == exclude_user.id:
            continue
        notif = create_notification(
            recipient=target,
            notification_type=notification_type,
            title=title,
            message=message,
            related_object_type=related_object_type,
            related_object_id=related_object_id,
            action_url=action_url,
            prevent_duplicates=prevent_duplicates
        )
        if notif:
            created_list.append(notif)

    return created_list


def create_bulk_notifications(
    recipients,
    notification_type,
    title,
    message,
    action_url=None,
    related_object_type=None,
    related_object_id=None,
    prevent_duplicates=True
):
    """
    Creates notifications for multiple recipients.
    """
    created_list = []
    for r in recipients:
        notif = create_notification(
            recipient=r,
            notification_type=notification_type,
            title=title,
            message=message,
            related_object_type=related_object_type,
            related_object_id=related_object_id,
            action_url=action_url,
            prevent_duplicates=prevent_duplicates
        )
        if notif:
            created_list.append(notif)
    return created_list


def mark_notification_read(notification_id, user):
    """
    Marks a single notification as read if it belongs to user.
    Returns (notification, success_boolean).
    """
    try:
        notif = Notification.objects.get(id=notification_id, recipient=user)
        notif.mark_as_read()
        return notif, True
    except Notification.DoesNotExist:
        return None, False


def mark_all_notifications_read(user):
    """
    Marks all unread notifications for user as read.
    Returns count of updated records.
    """
    unread_qs = Notification.objects.filter(recipient=user, is_read=False)
    count = unread_qs.count()
    if count > 0:
        now = timezone.now()
        unread_qs.update(is_read=True, read_at=now)
    return count


def get_unread_count(user):
    """
    Returns unread notification count for user.
    """
    if not user or not user.is_authenticated:
        return 0
    return Notification.objects.filter(recipient=user, is_read=False).count()
