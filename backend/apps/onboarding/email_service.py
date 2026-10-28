"""
NOVA Tech Email Delivery Service
Handles candidate onboarding invitation delivery and email notifications
via configurable SMTP (e.g. Gmail, SendGrid, Amazon SES) or dev backends.
"""

import logging
import socket
import smtplib
from smtplib import SMTPException
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.utils import timezone

logger = logging.getLogger(__name__)


class EmailDeliveryError(Exception):
    """Raised when email delivery fails via SMTP or chosen email backend."""
    pass


def send_invitation_email(invitation, raw_token, invitation_url):
    """
    Sends a cryptographically linked onboarding invitation email to the candidate's personal email address.

    Args:
        invitation (CandidateInvitation): The invitation database record.
        raw_token (str): The unhashed cryptographic token (urlsafe).
        invitation_url (str): The full URL to the registration page.

    Raises:
        EmailDeliveryError: If SMTP credentials are missing or email delivery fails.
    """
    recipient_email = (invitation.email or '').strip()
    if not recipient_email:
        raise EmailDeliveryError("Recipient email address is missing.")

    # Honest failure check: if SMTP backend is configured but credentials are unset
    backend_name = getattr(settings, 'EMAIL_BACKEND', '') or ''
    host_user = getattr(settings, 'EMAIL_HOST_USER', '') or ''
    host_password = getattr(settings, 'EMAIL_HOST_PASSWORD', '') or ''
    email_host = getattr(settings, 'EMAIL_HOST', 'smtp.gmail.com')
    email_port = getattr(settings, 'EMAIL_PORT', 587)
    use_tls = getattr(settings, 'EMAIL_USE_TLS', False)
    use_ssl = getattr(settings, 'EMAIL_USE_SSL', False)
    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', None) or 'NOVA Tech Onboarding <onboarding@novatech.io>'

    # Safe diagnostics logging (never logs secret passwords or invitation tokens)
    logger.info(
        f"[email_service:diagnostics] Backend: {backend_name} | Host: {email_host}:{email_port} | "
        f"TLS: {use_tls} | SSL: {use_ssl} | From: {from_email} | Recipient: {recipient_email} | "
        f"User configured: {bool(host_user)} ({len(host_user)} chars) | "
        f"Password configured: {bool(host_password)} ({len(host_password)} chars)"
    )

    if 'smtp.EmailBackend' in backend_name and (not host_user or not host_password):
        missing = []
        if not host_user:
            missing.append("EMAIL_HOST_USER")
        if not host_password:
            missing.append("EMAIL_HOST_PASSWORD")
        error_msg = (
            f"SMTP email delivery is not configured on Render. Missing environment variable(s): {', '.join(missing)}. "
            f"Please configure EMAIL_HOST_USER (e.g. your Gmail address) and EMAIL_HOST_PASSWORD (16-character Google App Password) "
            f"in Render Dashboard Environment settings to send live invitation emails."
        )
        logger.error(f"[email_service:unconfigured] {error_msg}")
        raise EmailDeliveryError(error_msg)

    # Format dates
    expiry_time = invitation.expires_at.astimezone(timezone.get_current_timezone())
    expiry_str = expiry_time.strftime("%A, %B %d, %Y at %I:%M %p %Z")
    joining_date_str = str(invitation.joining_date or "To be confirmed")

    subject = f"Welcome to NOVA Tech - Complete Your Employee Onboarding Registration"

    # Plaintext message
    text_content = f"""Hello {invitation.full_name},

Welcome to NOVA Tech!

You have been formally invited to join NOVA Tech as a {invitation.job_title} in the {invitation.department} department.

Onboarding Offer Details:
- Role / Designation: {invitation.job_title}
- Department: {invitation.department}
- Reporting Manager: {invitation.manager}
- Joining Date: {joining_date_str}
- Allocated Employee ID: {invitation.employee_id or 'Auto-assigned upon activation'}

To activate your employee account and begin your onboarding journey, please open the following secure link and set your account password:

{invitation_url}

IMPORTANT SECURITY & EXPIRY NOTICE:
- This invitation link is unique to your personal email address ({recipient_email}) and single-use.
- This link is valid for 48 hours and expires on: {expiry_str}.
- Never share or forward this link to anyone.
- If you have questions or require assistance, please contact NOVA Tech HR Operations.

Best regards,
People & Culture Operations
NOVA Tech Platform
"""

    # Rich, responsive HTML email
    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #0b0f19; width: 100%; padding: 32px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 580px; background-color: #111827; border: 1px solid #1f2937; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);">
          <!-- Brand Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #06b6d4 100%); padding: 32px 28px; text-align: center;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center">
                    <div style="font-size: 26px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                      NOVA Tech
                    </div>
                    <div style="font-size: 13px; font-weight: 500; color: #e0e7ff; margin-top: 4px; letter-spacing: 0.5px; text-transform: uppercase;">
                      Digital Employee Onboarding Platform
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 32px 28px;">
              <h1 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #ffffff; line-height: 1.3;">
                Welcome to the Team, {invitation.full_name}!
              </h1>
              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #94a3b8;">
                We are thrilled to welcome you to <strong>NOVA Tech</strong>. An official employee profile has been prepared for you. Please activate your account and establish your secure password to complete your onboarding registration.
              </p>

              <!-- Position Details Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #0f172a; border: 1px solid #1e293b; border-radius: 12px; margin-bottom: 28px;">
                <tr>
                  <td style="padding: 18px 20px;">
                    <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #818cf8; letter-spacing: 0.8px; margin-bottom: 12px;">
                      Onboarding Offer Summary
                    </div>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="font-size: 13px; line-height: 1.8;">
                      <tr>
                        <td style="color: #64748b; width: 40%; padding: 4px 0;">Designation / Role:</td>
                        <td style="color: #f1f5f9; font-weight: 600; padding: 4px 0;">{invitation.job_title}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; padding: 4px 0;">Department:</td>
                        <td style="color: #f1f5f9; font-weight: 600; padding: 4px 0;">{invitation.department}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; padding: 4px 0;">Reporting Manager:</td>
                        <td style="color: #f1f5f9; font-weight: 600; padding: 4px 0;">{invitation.manager}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; padding: 4px 0;">Joining Date:</td>
                        <td style="color: #f1f5f9; font-weight: 600; padding: 4px 0;">{joining_date_str}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; padding: 4px 0;">Allocated ID:</td>
                        <td style="color: #38bdf8; font-weight: 600; font-family: monospace; padding: 4px 0;">{invitation.employee_id or 'Auto-assigned'}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Call To Action Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    <a href="{invitation_url}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 700; padding: 14px 32px; border-radius: 10px; box-shadow: 0 4px 14px rgba(79, 70, 229, 0.4); text-align: center;">
                      Start Onboarding &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Expiry Alert -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #172554; border-left: 4px solid #38bdf8; border-radius: 8px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 12px 16px; font-size: 12px; color: #bae6fd; line-height: 1.5;">
                    <strong>Security Notice:</strong> This invitation link is cryptographically signed and valid for <strong>48 hours</strong> (expires on <strong>{expiry_str}</strong>). It can only be activated once.
                  </td>
                </tr>
              </table>

              <!-- Fallback Direct Link -->
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #64748b; line-height: 1.5;">
                If the button above does not work, copy and paste this link into your browser:
              </p>
              <div style="background-color: #0f172a; border: 1px solid #1e293b; border-radius: 8px; padding: 10px; word-break: break-all; font-family: monospace; font-size: 11px; color: #818cf8; margin-bottom: 24px;">
                {invitation_url}
              </div>

              <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #94a3b8;">
                If you were not expecting this invitation or need onboarding assistance, please reach out directly to NOVA Tech People & Culture Operations.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0b0f19; border-top: 1px solid #1f2937; padding: 20px 28px; text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 11px; color: #64748b;">
                &copy; 2026 NOVA Tech Solutions. All rights reserved.
              </p>
              <p style="margin: 0; font-size: 11px; color: #475569;">
                This automated invitation was sent to <span style="color: #64748b;">{recipient_email}</span>.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""

    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', None) or 'NOVA Tech Onboarding <onboarding@novatech.io>'

    try:
        msg = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=from_email,
            to=[recipient_email]
        )
        msg.attach_alternative(html_content, "text/html")
        sent_count = msg.send(fail_silently=False)

        if sent_count == 0:
            raise EmailDeliveryError(f"Email delivery engine reported 0 messages sent to {recipient_email}.")

        logger.info(f"Successfully delivered onboarding invitation email to {recipient_email} for {invitation.full_name}.")
        return True

    except smtplib.SMTPAuthenticationError as exc:
        err_msg = (
            f"SMTP authentication failed for '{host_user}'. "
            f"Please verify EMAIL_HOST_USER and EMAIL_HOST_PASSWORD in Render Dashboard. "
            f"If using Gmail, ensure 2-Step Verification is active and use a 16-character Google App Password."
        )
        logger.error(f"[email_service:auth_error] {err_msg} (SMTP code: {getattr(exc, 'smtp_code', 'unknown')})")
        raise EmailDeliveryError(err_msg) from exc
    except (smtplib.SMTPConnectError, socket.timeout, TimeoutError) as exc:
        err_msg = (
            f"Failed to connect to SMTP server ({email_host}:{email_port}). "
            f"Network connection timed out or port is blocked."
        )
        logger.error(f"[email_service:connect_error] {err_msg}: {exc}")
        raise EmailDeliveryError(err_msg) from exc
    except (SMTPException, OSError, ConnectionError) as exc:
        err_msg = f"Failed to deliver invitation email via SMTP to {recipient_email}: {str(exc)}"
        logger.error(f"[email_service:smtp_error] {err_msg}", exc_info=True)
        raise EmailDeliveryError(err_msg) from exc
    except Exception as exc:
        err_msg = f"Unexpected failure sending invitation email to {recipient_email}: {str(exc)}"
        logger.error(f"[email_service:unexpected_error] {err_msg}", exc_info=True)
        raise EmailDeliveryError(err_msg) from exc


def send_activation_confirmation_email(employee):
    """
    Optional confirmation email sent after successful account password activation.
    """
    recipient_email = (employee.email or '').strip()
    if not recipient_email:
        return False

    backend_name = getattr(settings, 'EMAIL_BACKEND', '') or ''
    host_user = getattr(settings, 'EMAIL_HOST_USER', '') or ''
    host_password = getattr(settings, 'EMAIL_HOST_PASSWORD', '') or ''

    if 'smtp.EmailBackend' in backend_name and (not host_user or not host_password):
        # Do not fail activation if confirmation email cannot be sent due to unconfigured SMTP
        logger.info("[email_service] Skipping optional activation confirmation email: SMTP unconfigured.")
        return False

    frontend_url = getattr(settings, 'FRONTEND_URL', 'https://digital-employee-onboarding-system.vercel.app').rstrip('/')
    login_url = f"{frontend_url}/login"

    subject = f"Your NOVA Tech Employee Account is Active - Welcome Onboard"

    text_content = f"""Hello {employee.name},

Congratulations! Your NOVA Tech employee account has been successfully activated.

Account Credentials & Details:
- Name: {employee.name}
- Email / Username: {employee.email}
- Employee ID: {employee.employee_id}
- System Role: Employee
- Department: {employee.department}
- Designation: {employee.role}

You can log in to your workspace and onboarding dashboard at any time using this link:
{login_url}

Best regards,
People & Culture Operations
NOVA Tech Platform
"""

    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>{subject}</title></head>
<body style="margin: 0; padding: 0; background-color: #0b0f19; font-family: sans-serif; color: #e2e8f0;">
  <div style="max-width: 560px; margin: 30px auto; background-color: #111827; border: 1px solid #1f2937; border-radius: 14px; overflow: hidden;">
    <div style="background: linear-gradient(135deg, #4f46e5, #06b6d4); padding: 24px; text-align: center; color: white;">
      <h2 style="margin: 0; font-size: 22px;">NOVA Tech</h2>
      <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">Account Activation Confirmed</p>
    </div>
    <div style="padding: 24px;">
      <h3 style="color: #ffffff; margin-top: 0;">Welcome Onboard, {employee.name}!</h3>
      <p style="color: #94a3b8; font-size: 14px; line-height: 1.6;">
        Your employee account has been securely activated. You can now access your onboarding tasks, submit required documents, review policies, and track your milestone progress.
      </p>
      <div style="background-color: #0f172a; border: 1px solid #1e293b; border-radius: 8px; padding: 14px; font-size: 13px; margin: 18px 0;">
        <div style="margin-bottom: 6px;"><strong>Email:</strong> {employee.email}</div>
        <div style="margin-bottom: 6px;"><strong>Employee ID:</strong> <span style="color: #38bdf8; font-family: monospace;">{employee.employee_id}</span></div>
        <div><strong>Role:</strong> {employee.role} ({employee.department})</div>
      </div>
      <div style="text-align: center; margin: 24px 0;">
        <a href="{login_url}" style="background-color: #4f46e5; color: white; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block;">
          Go to Sign In
        </a>
      </div>
    </div>
  </div>
</body>
</html>
"""
    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', None) or 'NOVA Tech Onboarding <onboarding@novatech.io>'
    try:
        msg = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=from_email,
            to=[recipient_email]
        )
        msg.attach_alternative(html_content, "text/html")
        msg.send(fail_silently=True)
        return True
    except Exception as exc:
        logger.warning(f"Failed to send activation confirmation email to {recipient_email}: {exc}")
        return False
