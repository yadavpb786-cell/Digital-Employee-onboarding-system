import datetime
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.utils import timezone
from apps.onboarding.models import (
    Employee,
    EmployeeProfile,
    OnboardingDocument,
    OfferLetter,
    CompanyPolicy,
    PolicyAcknowledgement,
    TrainingModule,
    EmployeeTrainingProgress,
    QuizQuestion,
    FirstDaySession,
    FirstDayProgress,
    OnboardingStage,
    EmployeeStageProgress,
    OnboardingFeedback
)


class Command(BaseCommand):
    help = 'Seeds initial realistic demo data for the NOVA Tech Employee Onboarding System.'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.NOTICE("Seeding NOVA Tech onboarding database..."))

        # ----------------------------------------------------------------------
        # 1. Seed Manager & HR Partner Employees & Users
        # ----------------------------------------------------------------------
        manager_emp, _ = Employee.objects.update_or_create(
            employee_id="EMP-2026-0010",
            defaults={
                "name": "Arjun Mehta",
                "email": "arjun.mehta@novatech.io",
                "role": "Engineering Director",
                "system_role": Employee.ROLE_HR_MANAGER,
                "designation": "Engineering Director",
                "department": "Data & Technology",
                "joining_date": "Monday, January 15, 2024",
                "joining_time": "09:00 AM",
                "location": "NOVA Tech – Chandigarh Office",
                "work_mode": "On-site",
                "manager_name": "Vikram Malhotra",
                "manager_role": "VP of Engineering",
                "manager_email": "vikram.malhotra@novatech.io",
                "manager_avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
                "hr_name": "Priya Sharma",
                "hr_role": "People & Culture Lead",
                "hr_email": "priya.sharma@novatech.io",
                "hr_avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
                "hr_availability": "Available Mon-Fri, 9:00 AM - 6:00 PM IST",
                "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"
            }
        )

        hr_emp, _ = Employee.objects.update_or_create(
            employee_id="EMP-2026-0012",
            defaults={
                "name": "Priya Sharma",
                "email": "priya.sharma@novatech.io",
                "role": "People & Culture Lead",
                "system_role": Employee.ROLE_ADMIN,
                "designation": "People & Culture Lead",
                "department": "People Operations",
                "joining_date": "Monday, March 04, 2024",
                "joining_time": "09:00 AM",
                "location": "NOVA Tech – Chandigarh Office",
                "work_mode": "Hybrid (3 Days Office / 2 Days Remote)",
                "manager_name": "Ananya Sen",
                "manager_role": "Chief People Officer",
                "manager_email": "ananya.sen@novatech.io",
                "manager_avatar": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200",
                "hr_name": "Priya Sharma",
                "hr_role": "People & Culture Lead",
                "hr_email": "priya.sharma@novatech.io",
                "hr_avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
                "hr_availability": "Available Mon-Fri, 9:00 AM - 6:00 PM IST",
                "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200"
            }
        )

        # Ensure Django User accounts exist with secure credentials for authentication
        user_arjun, _ = User.objects.get_or_create(
            username="arjun.mehta",
            defaults={"email": "arjun.mehta@novatech.io", "first_name": "Arjun", "last_name": "Mehta"}
        )
        user_arjun.set_password("NovaTech@2026")
        user_arjun.save()
        manager_emp.user = user_arjun
        manager_emp.system_role = Employee.ROLE_HR_MANAGER
        manager_emp.save(update_fields=['user', 'system_role'])

        user_priya, _ = User.objects.get_or_create(
            username="priya.sharma",
            defaults={"email": "priya.sharma@novatech.io", "first_name": "Priya", "last_name": "Sharma"}
        )
        user_priya.set_password("NovaTech@2026")
        user_priya.is_staff = True
        user_priya.is_superuser = True
        user_priya.save()
        hr_emp.user = user_priya
        hr_emp.system_role = Employee.ROLE_ADMIN
        hr_emp.save(update_fields=['user', 'system_role'])

        user_rahul, _ = User.objects.get_or_create(
            username="rahul.kumar",
            defaults={"email": "rahul.kumar@novatech.io", "first_name": "Rahul", "last_name": "Kumar"}
        )
        user_rahul.set_password("NovaTech@2026")
        user_rahul.save()

        # ----------------------------------------------------------------------
        # 2. Seed Demo Employee: Rahul Kumar
        # ----------------------------------------------------------------------
        employee, _ = Employee.objects.update_or_create(
            employee_id="EMP-2026-8941",
            defaults={
                "user": user_rahul,
                "name": "Rahul Kumar",
                "email": "rahul.kumar@novatech.io",
                "role": "Software Engineer",
                "system_role": Employee.ROLE_EMPLOYEE,
                "designation": "Software Engineer",
                "department": "Data & Technology",
                "joining_date": "Monday, September 21, 2026",
                "joining_time": "09:30 AM",
                "location": "NOVA Tech – Chandigarh Office",
                "work_mode": "Hybrid (3 Days Office / 2 Days Remote)",
                "manager_name": manager_emp.name,
                "manager_role": manager_emp.role,
                "manager_email": manager_emp.email,
                "manager_avatar": manager_emp.avatar,
                "hr_name": hr_emp.name,
                "hr_role": hr_emp.role,
                "hr_email": hr_emp.email,
                "hr_avatar": hr_emp.avatar,
                "hr_availability": "Available Mon-Fri, 9:00 AM - 6:00 PM IST",
                "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200"
            }
        )

        # Keep Rahul Kumar as the newest created employee so Employee.objects.first() resolves to Rahul
        now = timezone.now()
        past_time = now - datetime.timedelta(days=180)
        Employee.objects.filter(employee_id="EMP-2026-0010").update(created_at=past_time)
        Employee.objects.filter(employee_id="EMP-2026-0012").update(created_at=past_time)
        Employee.objects.filter(employee_id="EMP-2026-8941").update(created_at=now)

        # Seed EmployeeProfile
        EmployeeProfile.objects.update_or_create(
            employee=employee,
            defaults={
                "phone": "+91 98765 43210",
                "date_of_birth": "1998-07-14",
                "blood_group": "O+",
                "address": "Flat 402, Silicon Heights, Sector 62",
                "city": "Chandigarh",
                "state": "Punjab",
                "pincode": "160062",
                "emergency_contact_name": "Sunita Kumar",
                "emergency_contact_relation": "Mother",
                "emergency_contact_phone": "+91 98765 11223",
                "is_completed": True
            }
        )

        # ----------------------------------------------------------------------
        # 3. Seed Onboarding Documents
        # ----------------------------------------------------------------------
        initial_docs = [
            ("Passport / National Aadhaar Card", "Identification", "Uploaded", "Verified", "Sep 01, 2026", "2.4 MB", "National ID verified and encrypted in secure compliance vault.", True),
            ("Permanent Address Verification Document", "Identification", "Uploaded", "Verified", "Sep 01, 2026", "1.8 MB", "Permanent address proof verified by HR Operations.", True),
            ("Bachelor of Technology Degree & Marksheets", "Academic", "Uploaded", "Verified", "Sep 01, 2026", "4.1 MB", "B.Tech Computer Science degree verified by People Ops.", True),
            ("Direct Deposit Bank Mandate & Cancelled Cheque", "Finance", "Uploaded", "Pending Verification", "Sep 02, 2026", "850 KB", "Under verification by Finance & Payroll Operations.", True),
            ("Passport Size Digital Photograph", "Identification", "Uploaded", "Verified", "Aug 31, 2026", "920 KB", "Approved for corporate smart ID badge printing.", True),
            ("Previous Employment Relieving & Experience Letter", "Employment", "Uploaded", "Pending Verification", "Sep 03, 2026", "1.1 MB", "Relieving documentation under review by HR Compliance.", True),
            ("Signed Employment Agreement", "Legal", "Uploaded", "Verified", "Aug 28, 2026", "1.2 MB", "Digitally executed NDA and terms of service.", True)
        ]
        for name, dtype, ustatus, vstatus, dt, sz, rm, req in initial_docs:
            OnboardingDocument.objects.update_or_create(
                employee=employee,
                name=name,
                defaults={
                    "document_type": dtype,
                    "upload_status": ustatus,
                    "verification_status": vstatus,
                    "date_str": dt,
                    "size_str": sz,
                    "remarks": rm,
                    "is_required": req
                }
            )

        # ----------------------------------------------------------------------
        # 4. Seed Offer Letter (Initial State: NOT accepted)
        # ----------------------------------------------------------------------
        OfferLetter.objects.update_or_create(
            employee=employee,
            defaults={
                "ref_no": "NOVA/OFFER/2026/0894",
                "issue_date": "August 25, 2026",
                "ctc": "₹14,50,000 per annum",
                "salary_breakdown": [
                    {"component": "Basic Salary", "annual": "₹7,25,000", "monthly": "₹60,417"},
                    {"component": "House Rent Allowance (HRA)", "annual": "₹2,90,000", "monthly": "₹24,167"},
                    {"component": "Special Allowance", "annual": "₹2,15,000", "monthly": "₹17,917"},
                    {"component": "Performance Bonus (Target)", "annual": "₹1,20,000", "monthly": "Disbursed Annually"},
                    {"component": "Provident Fund (Employer)", "annual": "₹60,000", "monthly": "₹5,000"},
                    {"component": "Medical Insurance & Wellness Allowance", "annual": "₹40,000", "monthly": "₹3,333"}
                ],
                "probation": "3 Months from Joining Date",
                "notice_period": "30 Days during probation, 60 Days thereafter",
                "is_accepted": False,
                "accepted_at": None,
                "signature": "",
                "signature_hash": ""
            }
        )

        # ----------------------------------------------------------------------
        # 5. Seed Company Policies (Rahul has NOT acknowledged all policies)
        # ----------------------------------------------------------------------
        policies_data = [
            ("pol-1", "Code of Professional Conduct & Ethics", "Compliance", "8 mins", 
             "Sets forth the ethical foundation, anti-bribery standards, mutual respect, and legal compliance required across all NOVA Tech global entities.",
             ["Zero-tolerance for discrimination, harassment, or retaliation in any form.", "Mandatory protection of proprietary assets, intellectual property, and trade secrets.", "Prompt disclosure of conflicts of interest and outside business engagements."],
             True, "Sep 01, 2026"),
            ("pol-2", "Leave, Time-Off & Wellness Policy", "Benefits", "6 mins",
             "Clear rules outlining paid time off, sick leave, compassionate leave, floating holidays, and sabbatical guidelines.",
             ["24 days of annual paid time off accrued pro-rata from day of joining.", "Planned leaves longer than 3 days require 10 days advance approval by manager.", "Annual mental health wellness days provided to every team member."],
             False, None),
            ("pol-3", "Information Security & ISO 27001 Policy", "Security", "12 mins",
             "Comprehensive framework ensuring confidential client information, zero-trust network access, and incident reporting protocols remain unbroken.",
             ["Multi-Factor Authentication (MFA) is strictly mandatory on all hardware and services.", "Never share passwords, API tokens, or SSH keys through unsecured channels.", "Report suspected phishing or unauthorized access immediately to security@novatech.io."],
             False, None),
            ("pol-4", "Remote & Hybrid Work Policy", "Workplace", "5 mins",
             "Guidelines governing asynchronous collaboration, core availability hours, workspace ergonomic stipend, and hybrid office attendance.",
             ["Core collaboration hours are 10:00 AM – 4:00 PM IST for cross-functional meetings.", "Hybrid engineering personnel are expected on-site 3 days weekly.", "Workstations and confidential meetings must take place in secure environments."],
             True, "Sep 02, 2026"),
            ("pol-5", "Employee Handbook & POSH Compliance", "HR & Culture", "10 mins",
             "Comprehensive internal handbook explaining organizational hierarchy, grievance redressal, POSH compliance, and culture of inclusivity.",
             ["Internal Complaints Committee (ICC) established for prompt redressal.", "Safe, confidential reporting channels available 24/7.", "Annual mandatory refresher training for all employees."],
             False, None)
        ]
        for pid, title, cat, rt, summ, pts, ack, ack_date in policies_data:
            pol, _ = CompanyPolicy.objects.update_or_create(
                policy_id=pid,
                defaults={"title": title, "category": cat, "read_time": rt, "summary": summ, "key_points": pts}
            )
            PolicyAcknowledgement.objects.update_or_create(
                employee=employee,
                policy=pol,
                defaults={"acknowledged": ack, "acknowledged_at": ack_date}
            )

        # ----------------------------------------------------------------------
        # 6. Seed Training Modules (Realistic partial completion)
        # ----------------------------------------------------------------------
        training_data = [
            ("tr-1", "Welcome to NOVA Tech", "Company history, vision, executive leadership, and strategic goals for 2026.", "20 mins", "Orientation", "Sparkles", 4, 100, "Completed", [
                {"id": "l-1", "title": "Founding Story & Milestones", "duration": "5 mins", "completed": True},
                {"id": "l-2", "title": "Executive Leadership & Board", "duration": "5 mins", "completed": True},
                {"id": "l-3", "title": "Product Roadmap & Ecosystem", "duration": "5 mins", "completed": True},
                {"id": "l-4", "title": "Global Offices & Hybrid Model", "duration": "5 mins", "completed": True}
            ]),
            ("tr-2", "Company Culture & Values", "Core principles of innovation, transparency, inclusivity, and continuous learning.", "30 mins", "Culture", "HeartHandshake", 5, 60, "In Progress", [
                {"id": "l-5", "title": "Core Values in Action", "duration": "6 mins", "completed": True},
                {"id": "l-6", "title": "Inclusivity & Psychological Safety", "duration": "6 mins", "completed": True},
                {"id": "l-7", "title": "Feedback & Performance Rhythm", "duration": "6 mins", "completed": True},
                {"id": "l-8", "title": "Collaborative Tooling (Slack, Notion)", "duration": "6 mins", "completed": False},
                {"id": "l-9", "title": "Social Impact & Employee Giving", "duration": "6 mins", "completed": False}
            ]),
            ("tr-3", "Information Security Awareness", "Best practices for data protection, password management, and phishing prevention.", "45 mins", "Compliance", "ShieldAlert", 6, 0, "Not Started", [
                {"id": "l-10", "title": "Data Classification Standards", "duration": "7 mins", "completed": False},
                {"id": "l-11", "title": "Password Best Practices & MFA", "duration": "8 mins", "completed": False},
                {"id": "l-12", "title": "Identifying Social Engineering & Phishing", "duration": "8 mins", "completed": False},
                {"id": "l-13", "title": "Endpoint Security & Device Encryption", "duration": "7 mins", "completed": False},
                {"id": "l-14", "title": "Secure Software Development Lifecycle", "duration": "8 mins", "completed": False},
                {"id": "l-15", "title": "Incident Reporting Procedures", "duration": "7 mins", "completed": False}
            ]),
            ("tr-4", "Workplace Policies", "Essential understanding of leave policies, POSH guidelines, and workplace etiquette.", "25 mins", "Governance", "FileCheck", 4, 0, "Not Started", [
                {"id": "l-16", "title": "POSH Framework & Redressal", "duration": "6 mins", "completed": False},
                {"id": "l-17", "title": "Workplace Health & Ergonomics", "duration": "6 mins", "completed": False},
                {"id": "l-18", "title": "Time Off & Holiday Calendars", "duration": "6 mins", "completed": False},
                {"id": "l-19", "title": "Diversity, Equity & Inclusion Guidelines", "duration": "7 mins", "completed": False}
            ]),
            ("tr-5", "Tools & Technology", "Developer toolchain overview: Git, CI/CD, cloud infrastructure, and internal portals.", "35 mins", "Engineering", "Laptop", 5, 0, "Not Started", [
                {"id": "l-20", "title": "Git Branching & PR Guidelines", "duration": "7 mins", "completed": False},
                {"id": "l-21", "title": "CI/CD Pipelines & Automated Testing", "duration": "7 mins", "completed": False},
                {"id": "l-22", "title": "Cloud Environments & Secret Management", "duration": "7 mins", "completed": False},
                {"id": "l-23", "title": "Observability & Sentry Monitoring", "duration": "7 mins", "completed": False},
                {"id": "l-24", "title": "Internal Developer Portal & Documentation", "duration": "7 mins", "completed": False}
            ]),
            ("tr-6", "Data Privacy & Compliance", "GDPR, DPDP Act 2023 compliance, customer data handling, and privacy standards.", "25 mins", "Legal", "Lock", 4, 0, "Not Started", [
                {"id": "l-25", "title": "Overview of Data Protection Laws", "duration": "6 mins", "completed": False},
                {"id": "l-26", "title": "Customer Data Privacy Standards", "duration": "6 mins", "completed": False},
                {"id": "l-27", "title": "Data Retention & Disposal Policies", "duration": "6 mins", "completed": False},
                {"id": "l-28", "title": "Privacy Breach Escalation Protocol", "duration": "7 mins", "completed": False}
            ])
        ]
        for mid, title, desc, dur, cat, icon, mcnt, prog, st, lessons in training_data:
            mod, _ = TrainingModule.objects.update_or_create(
                module_id=mid,
                defaults={"title": title, "description": desc, "duration": dur, "category": cat, "icon": icon, "modules_count": mcnt, "lessons": lessons}
            )
            EmployeeTrainingProgress.objects.update_or_create(
                employee=employee,
                module=mod,
                defaults={"progress": prog, "status": st, "completed_modules": mcnt if prog == 100 else (3 if prog == 60 else 0)}
            )

        # ----------------------------------------------------------------------
        # 7. Seed Quiz Questions (5 questions covering core areas)
        # ----------------------------------------------------------------------
        quiz_data = [
            ("q-1", "What is NOVA Tech's core protocol when you receive an email requesting urgent password updates or financial wire transfers?",
             ["Reply immediately to verify the sender's identity.", "Forward it to your personal email to inspect headers.", "Do not click any links; immediately report it via the PhishAlarm tool and notify IT Security.", "Delete the email and ignore it without reporting."],
             2, "Information Security", "Suspicious emails must always be escalated via the PhishAlarm tool so IT Security can block domain-wide threats."),
            ("q-2", "Under the NOVA Tech Hybrid Work Policy, what are the mandatory core collaboration hours for synchronous meetings?",
             ["08:00 AM – 12:00 PM IST", "10:00 AM – 04:00 PM IST", "01:00 PM – 08:00 PM IST", "No set hours; communication is 100% asynchronous."],
             1, "Workplace Conduct", "Core collaboration hours from 10:00 AM to 04:00 PM IST ensure smooth cross-functional coordination across sprints."),
            ("q-3", "How many days in advance must planned annual leaves longer than 3 consecutive days be submitted in the HR portal?",
             ["24 hours in advance", "5 days in advance", "10 days in advance", "Advance notice is not required"],
             2, "Company Policies", "Submitting leaves 10 days in advance allows engineering squads to adjust sprint commitments and on-call rotations."),
            ("q-4", "Where should employee credentials, private SSH keys, and cloud API tokens be stored at NOVA Tech?",
             ["In a shared Google Doc accessible by the squad", "Committed inside private GitHub code repositories", "Stored locally in plain text in the home directory", "In the corporate Enterprise Password Manager and cloud secret vaults using MFA"],
             3, "Data Privacy", "All secrets must be stored within approved enterprise secret vaults with Multi-Factor Authentication enabled."),
            ("q-5", "Who is your primary point of contact for day-one hardware provisioning and IT system credentials?",
             ["Priya Sharma (HR) & DevOps IT Helpdesk", "Any team colleague on Slack", "Building security reception", "External hardware vendor"],
             0, "Onboarding Basics", "People Ops Lead Priya Sharma coordinates directly with the DevOps IT Helpdesk for seamless hardware setup.")
        ]
        for qid, qtext, opts, ans, cat, exp in quiz_data:
            QuizQuestion.objects.update_or_create(
                question_id=qid,
                defaults={"question": qtext, "options": opts, "correct_answer": ans, "category": cat, "explanation": exp}
            )

        # ----------------------------------------------------------------------
        # 8. Seed First-Day Orientation Sessions (Monday, September 21, 2026)
        # ----------------------------------------------------------------------
        sessions_data = [
            ("fdt-1", 1, "09:30 AM – 10:15 AM", "Welcome & HR Introduction", "Priya Sharma (People Ops)", "Main Lobby & Reception", "Collect your visitor smart badge, meet your HR partner, and receive your official NOVA Tech welcome pack.", "HR", "completed"),
            ("fdt-2", 2, "10:15 AM – 11:30 AM", "Company Orientation", "Executive Leadership Team", "Auditorium & Live Stream", "Learn about NOVA Tech's founding story, mission, core values, and strategic milestones for 2026.", "Orientation", "in-progress"),
            ("fdt-3", 3, "11:30 AM – 12:30 PM", "IT Setup & Account Activation", "Karan Singh (IT & DevOps)", "Engineering Pod 4B", "MacBook configuration, 2FA YubiKey hardware tokens, VPN setup, and IDE environment installation.", "IT Setup", "upcoming"),
            ("fdt-4", 4, "12:30 PM – 01:45 PM", "Manager Introduction", "Arjun Mehta (Engineering Director)", "NOVA Bistro & Cafeteria", "Welcome lunch with your reporting manager and introduction to initial team objectives.", "Manager", "upcoming"),
            ("fdt-5", 5, "02:00 PM – 03:00 PM", "Team Introduction", "Data & Technology Squad", "Pod 4B Collaboration Nook", "Meet fellow engineers and your onboarding mentor Neha Kapoor.", "Team", "upcoming"),
            ("fdt-6", 6, "03:00 PM – 04:00 PM", "Security & Compliance", "InfoSec & Compliance Team", "Training Room 2", "Detailed security briefing, data protection practices, and compliance sign-offs.", "Security", "upcoming"),
            ("fdt-7", 7, "04:00 PM – 05:00 PM", "Role & Project Overview", "Arjun Mehta", "Meeting Room C", "Deep dive into your project backlog, sprint cycles, codebase architecture, and 30-day deliverables.", "Overview", "upcoming"),
            ("fdt-8", 8, "05:00 PM – 05:30 PM", "First-Day Wrap-up", "Priya Sharma", "HR Hub Room B", "End-of-day check-in, addressing blockers, and preview of Day 2 schedule.", "Wrap-up", "upcoming")
        ]
        for sid, ord_val, tm, title, host, loc, desc, stype, init_status in sessions_data:
            sess, _ = FirstDaySession.objects.update_or_create(
                session_id=sid,
                defaults={"order": ord_val, "time_slot": tm, "title": title, "host": host, "location": loc, "description": desc, "session_type": stype}
            )
            FirstDayProgress.objects.update_or_create(
                employee=employee,
                session=sess,
                defaults={"status": init_status}
            )

        # ----------------------------------------------------------------------
        # 9. Seed Exactly 10 Onboarding Stages (Using exact keys in views.py)
        # ----------------------------------------------------------------------
        stages_data = [
            ("profile", 1, "Employee Profile", "Personal details, emergency contacts, address, and designation.", "/profile", "UserCheck", "Personal Data", "5 mins", "completed", True),
            ("documents", 2, "Document Submission", "Submit government ID, educational records, and bank details.", "/documents", "FileUp", "Compliance", "15 mins", "current", False),
            ("offerLetter", 3, "Offer Letter Acceptance", "Review terms of employment, CTC compensation, and digitally sign.", "/offer-letter", "FileSignature", "Legal", "5 mins", "pending", False),
            ("policies", 4, "Company Policies", "Acknowledge Code of Conduct, Information Security, and WFH guidelines.", "/policies", "BookOpen", "Governance", "20 mins", "pending", False),
            ("training", 5, "Mandatory Training", "Complete security awareness, culture, and technical modules.", "/training", "GraduationCap", "Learning", "30 mins", "pending", False),
            ("quiz", 6, "Onboarding Quiz", "Knowledge check on company culture, guidelines, and security protocols.", "/quiz", "HelpCircle", "Assessment", "10 mins", "pending", False),
            ("manager", 7, "Department & Manager", "Meet your reporting manager Arjun Mehta and align on 30-day goals.", "/team", "Users", "Team Alignment", "15 mins", "pending", False),
            ("firstDay", 8, "First Day Action Plan", "Review detailed schedule for orientation day, reception, and lunch.", "/first-day", "Calendar", "Orientation", "10 mins", "pending", False),
            ("feedback", 9, "Onboarding Feedback", "Share your onboarding ratings and comments to help us improve.", "/feedback", "MessageSquare", "Feedback", "5 mins", "pending", False),
            ("completed", 10, "Onboarding Complete", "All milestones completed. Download your Graduation Certificate!", "/onboarding", "Award", "Graduation", "Done", "pending", False)
        ]
        for sid, num, title, desc, path, icon, cat, etime, init_status, is_done in stages_data:
            stage_obj, _ = OnboardingStage.objects.update_or_create(
                stage_id=sid,
                defaults={"stage_number": num, "title": title, "description": desc, "path": path, "icon": icon, "category": cat, "estimated_time": etime}
            )
            EmployeeStageProgress.objects.update_or_create(
                employee=employee,
                stage=stage_obj,
                defaults={"status": init_status, "is_completed": is_done}
            )

        # ----------------------------------------------------------------------
        # 10. Feedback: Left empty for user submission
        # ----------------------------------------------------------------------
        # Intentionally no fake completed feedback records seeded so employee can submit fresh.

        # ----------------------------------------------------------------------
        # Output Summary
        # ----------------------------------------------------------------------
        emp_count = Employee.objects.count()
        doc_count = OnboardingDocument.objects.count()
        pol_count = CompanyPolicy.objects.count()
        tr_count = TrainingModule.objects.count()
        q_count = QuizQuestion.objects.count()
        sess_count = FirstDaySession.objects.count()
        stage_count = OnboardingStage.objects.count()
        progress_records = (
            EmployeeTrainingProgress.objects.count() +
            EmployeeStageProgress.objects.count() +
            FirstDayProgress.objects.count() +
            PolicyAcknowledgement.objects.count()
        )

        self.stdout.write(self.style.SUCCESS(
            f"[OK] Seeding complete:\n"
            f"  Employees: {emp_count}\n"
            f"  Documents: {doc_count}\n"
            f"  Policies: {pol_count}\n"
            f"  Training Modules: {tr_count}\n"
            f"  Quiz Questions: {q_count}\n"
            f"  First-Day Sessions: {sess_count}\n"
            f"  Onboarding Stages: {stage_count}\n"
            f"  Total Progress Records: {progress_records}\n"
            f"  Offer Letter Status: Unaccepted (Ready for digital signature)\n"
            f"  Feedback: Empty (Ready for employee submission)"
        ))
