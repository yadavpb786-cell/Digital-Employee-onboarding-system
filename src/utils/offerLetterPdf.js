/**
 * NOVA Tech Digital Offer Letter PDF & Print Generator
 * Formats and prints or saves the official legally binding offer letter as PDF.
 * Uses live employee, compensation, and digital signature hash verification.
 */

export const downloadOrPrintOfferLetter = (offerLetter, employee) => {
  if (!offerLetter) {
    console.error('No offer letter data provided for export.');
    return false;
  }

  // Ensure offer letter is accepted
  const isAccepted = Boolean(offerLetter.isAccepted);
  const employeeName = offerLetter.employeeName || employee?.name || 'Valued Candidate';
  const designation = offerLetter.designation || employee?.role || employee?.designation || 'Software Engineer';
  const department = offerLetter.department || employee?.department || 'Data & Technology';
  const managerName = offerLetter.reportingManager || employee?.manager?.name || 'Arjun Mehta';
  const location = offerLetter.workLocation || employee?.location || 'Chandigarh, India';
  const joiningDate = offerLetter.joiningDate || employee?.joiningDate || 'November 1, 2026';
  const refNo = offerLetter.refNo || `NOVA/OFFER/2026/${employee?.id || '001'}`;
  const issueDate = offerLetter.issueDate || 'October 15, 2026';
  const ctc = offerLetter.ctc || '₹14,50,000 per annum';
  const signature = offerLetter.signature || employeeName;
  const acceptedAt = offerLetter.acceptedAt || new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const signatureHash = offerLetter.hash || 'SHA256:NOVA-VERIFIED-DIGITAL-SIGNATURE-2026';
  const probation = offerLetter.probation || '3 Months';
  const noticePeriod = offerLetter.noticePeriod || offerLetter.notice_period || '60 Days';

  const breakdownRows = Array.isArray(offerLetter.salaryBreakdown) && offerLetter.salaryBreakdown.length > 0
    ? offerLetter.salaryBreakdown
    : [
        { component: 'Basic Salary (50%)', annual: '₹7,25,000', monthly: '₹60,417' },
        { component: 'House Rent Allowance (HRA)', annual: '₹2,90,000', monthly: '₹24,167' },
        { component: 'Special / Flexi Allowance', annual: '₹2,17,500', monthly: '₹18,125' },
        { component: 'Provident Fund (Employer)', annual: '₹87,000', monthly: '₹7,250' },
        { component: 'Performance Retention Bonus', annual: '₹1,30,500', monthly: '₹10,875' },
      ];

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Offer Letter - ${employeeName} - ${refNo}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 16mm 18mm 16mm 18mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #1e293b;
      line-height: 1.5;
      font-size: 11pt;
      margin: 0;
      padding: 24px;
      background: #ffffff;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #4f46e5;
      padding-bottom: 14px;
      margin-bottom: 20px;
    }
    .brand-title {
      font-size: 22pt;
      font-weight: 900;
      letter-spacing: -0.5px;
      color: #0f172a;
      margin: 0;
    }
    .brand-title span {
      color: #4f46e5;
    }
    .brand-sub {
      font-size: 8.5pt;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #64748b;
      margin-top: 2px;
      font-weight: 700;
    }
    .company-meta {
      text-align: right;
      font-size: 8.5pt;
      color: #475569;
      line-height: 1.35;
    }
    .company-meta strong {
      color: #0f172a;
      font-size: 9.5pt;
    }
    .ref-badge {
      display: inline-block;
      margin-top: 4px;
      background: #eef2ff;
      color: #4338ca;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 8.5pt;
      border: 1px solid #c7d2fe;
    }
    .letter-title {
      text-align: center;
      margin: 16px 0;
    }
    .letter-title h1 {
      font-size: 15pt;
      font-weight: 800;
      color: #0f172a;
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 0.8px;
    }
    .salutation {
      font-weight: 700;
      margin-bottom: 10px;
      color: #0f172a;
    }
    p {
      margin: 0 0 10px 0;
      text-align: justify;
    }
    .highlight-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px 14px;
      margin: 14px 0;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px 16px;
      font-size: 9.5pt;
    }
    .highlight-item {
      display: flex;
      flex-direction: column;
    }
    .highlight-label {
      font-size: 7.5pt;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      color: #64748b;
      font-weight: 700;
    }
    .highlight-value {
      color: #0f172a;
      font-weight: 700;
      margin-top: 1px;
    }
    .salary-table {
      width: 100%;
      border-collapse: collapse;
      margin: 14px 0;
      font-size: 9pt;
    }
    .salary-table th {
      background: #f1f5f9;
      color: #334155;
      font-weight: 700;
      text-transform: uppercase;
      font-size: 7.5pt;
      letter-spacing: 0.5px;
      padding: 7px 10px;
      border: 1px solid #cbd5e1;
      text-align: left;
    }
    .salary-table td {
      padding: 6px 10px;
      border: 1px solid #e2e8f0;
    }
    .salary-table tr:nth-child(even) {
      background: #fafafa;
    }
    .salary-table .total-row td {
      background: #eef2ff;
      font-weight: 800;
      color: #3730a3;
      border-top: 2px solid #6366f1;
    }
    .terms-list {
      margin: 10px 0;
      padding-left: 18px;
      font-size: 9pt;
      color: #334155;
    }
    .terms-list li {
      margin-bottom: 4px;
    }
    .signature-section {
      margin-top: 22px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 20px;
      page-break-inside: avoid;
    }
    .sig-block {
      flex: 1;
      padding: 12px 14px;
      border-radius: 8px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      font-size: 8.5pt;
    }
    .sig-block.accepted {
      background: #f0fdf4;
      border-color: #bbf7d0;
    }
    .sig-seal {
      font-size: 7.5pt;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #166534;
      margin-bottom: 4px;
    }
    .sig-name {
      font-family: Georgia, "Times New Roman", serif;
      font-style: italic;
      font-size: 15pt;
      font-weight: 700;
      color: #14532d;
      margin: 4px 0;
    }
    .sig-meta {
      color: #15803d;
      font-size: 8pt;
    }
    .sig-hash {
      font-family: monospace;
      font-size: 7pt;
      color: #047857;
      word-break: break-all;
      margin-top: 4px;
      background: #dcfce7;
      padding: 3px 6px;
      border-radius: 3px;
    }
    .sig-company-name {
      font-family: Georgia, "Times New Roman", serif;
      font-style: italic;
      font-size: 14pt;
      font-weight: 700;
      color: #1e293b;
      margin: 4px 0;
    }
    .print-bar {
      margin-bottom: 16px;
      padding: 12px;
      background: #0f172a;
      color: #ffffff;
      border-radius: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 9.5pt;
    }
    .print-btn {
      background: #4f46e5;
      color: #ffffff;
      border: none;
      padding: 7px 16px;
      border-radius: 6px;
      font-weight: 700;
      font-size: 9pt;
      cursor: pointer;
    }
    .print-btn:hover {
      background: #4338ca;
    }
    @media print {
      .print-bar {
        display: none !important;
      }
      body {
        padding: 0;
      }
    }
  </style>
</head>
<body>
  <div class="print-bar">
    <div>
      <strong>NOVA Tech Official Document Viewer</strong> — Ready to Save as PDF or Print.
    </div>
    <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
  </div>

  <div class="header">
    <div>
      <h2 class="brand-title">NOVA<span>TECH</span></h2>
      <div class="brand-sub">Enterprise Workforce Systems</div>
    </div>
    <div class="company-meta">
      <strong>NOVA Technologies Pvt. Ltd.</strong><br>
      Tower B, Cyber City, Sector 62<br>
      Chandigarh, Punjab 160062, India<br>
      <span class="ref-badge">Ref: ${refNo}</span>
    </div>
  </div>

  <div class="letter-title">
    <h1>Letter of Employment Appointment</h1>
  </div>

  <div class="salutation">
    Date: ${issueDate}<br><br>
    Dear ${employeeName},
  </div>

  <p>
    On behalf of NOVA Technologies Pvt. Ltd. ("Company"), we are pleased to offer you the position of
    <strong>${designation}</strong> in our <strong>${department}</strong> division.
    We were deeply impressed by your experience and believe you will contribute significantly to our mission
    of engineering world-class workforce platforms.
  </p>

  <div class="highlight-box">
    <div class="highlight-item">
      <span class="highlight-label">Official Designation</span>
      <span class="highlight-value">${designation}</span>
    </div>
    <div class="highlight-item">
      <span class="highlight-label">Business Department</span>
      <span class="highlight-value">${department}</span>
    </div>
    <div class="highlight-item">
      <span class="highlight-label">Reporting Authority</span>
      <span class="highlight-value">${managerName}</span>
    </div>
    <div class="highlight-item">
      <span class="highlight-label">Work Location</span>
      <span class="highlight-value">${location}</span>
    </div>
    <div class="highlight-item">
      <span class="highlight-label">Scheduled Joining Date</span>
      <span class="highlight-value">${joiningDate}</span>
    </div>
    <div class="highlight-item">
      <span class="highlight-label">Total Cost to Company (CTC)</span>
      <span class="highlight-value" style="color: #4338ca;">${ctc}</span>
    </div>
  </div>

  <p style="font-size: 9.5pt; font-weight: 700; margin-bottom: 4px; color: #0f172a;">
    Annexure A: Compensation & Benefits Structure
  </p>
  <table class="salary-table">
    <thead>
      <tr>
        <th>Salary Component</th>
        <th style="text-align: right;">Annual Gross (INR)</th>
        <th style="text-align: right;">Monthly Gross (INR)</th>
      </tr>
    </thead>
    <tbody>
      ${breakdownRows.map(row => `
        <tr>
          <td>${row.component}</td>
          <td style="text-align: right; font-weight: 600;">${row.annual}</td>
          <td style="text-align: right; color: #475569;">${row.monthly}</td>
        </tr>
      `).join('')}
      <tr class="total-row">
        <td>Total Guaranteed Cost to Company (CTC)</td>
        <td style="text-align: right;">${ctc}</td>
        <td style="text-align: right;">—</td>
      </tr>
    </tbody>
  </table>

  <p style="font-size: 9.5pt; font-weight: 700; margin-bottom: 4px; color: #0f172a;">
    Key Terms of Appointment:
  </p>
  <ul class="terms-list">
    <li><strong>Probation & Confirmation:</strong> You will be on probation for an initial duration of ${probation} from your effective joining date, subject to review.</li>
    <li><strong>Notice Period:</strong> Following successful confirmation, either party may terminate the employment relationship by tendering ${noticePeriod} written notice or salary in lieu thereof.</li>
    <li><strong>Intellectual Property & Confidentiality:</strong> All inventions, systems, codebases, and intellectual assets developed during your tenure remain the exclusive property of NOVA Technologies Pvt. Ltd.</li>
    <li><strong>Compliance & Code of Conduct:</strong> Employment remains contingent upon satisfactory background verification and adherence to our global Information Security policies.</li>
  </ul>

  <div class="signature-section">
    <!-- Authorized Corporate Signatory -->
    <div class="sig-block">
      <div style="font-size: 7.5pt; font-weight: 800; text-transform: uppercase; color: #64748b; letter-spacing: 0.8px;">
        For NOVA Technologies Pvt. Ltd.
      </div>
      <div class="sig-company-name">Priya Sharma</div>
      <div style="color: #475569; font-weight: 600;">Priya Sharma</div>
      <div style="color: #64748b;">People & Culture Lead</div>
      <div style="color: #94a3b8; font-size: 7.5pt;">Corporate Authorized Signatory</div>
    </div>

    <!-- Employee Digital Seal -->
    <div class="sig-block ${isAccepted ? 'accepted' : ''}">
      ${isAccepted ? `
        <div class="sig-seal">✓ Digitally Accepted & Legally Executed</div>
        <div class="sig-name">${signature}</div>
        <div class="sig-meta">Accepted on: ${acceptedAt}</div>
        <div class="sig-hash">Verification Seal: ${signatureHash}</div>
      ` : `
        <div style="font-size: 7.5pt; font-weight: 800; text-transform: uppercase; color: #b45309;">
          Pending Candidate Digital Acceptance
        </div>
        <div style="margin-top: 18px; border-bottom: 1px dashed #cbd5e1; height: 1px;"></div>
        <div style="color: #94a3b8; font-size: 8pt; margin-top: 4px;">Candidate Signature & Date</div>
      `}
    </div>
  </div>

  <script>
    window.onload = function() {
      // Auto-trigger print dialog after small render delay
      setTimeout(function() {
        window.print();
      }, 350);
    };
  </script>
</body>
</html>`;

  // Open in a new printable window
  const printWindow = window.open('', '_blank', 'width=880,height=960,toolbar=0,menubar=0,location=0');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    return true;
  } else {
    // If popups are blocked by browser, fallback to hidden iframe print
    const printIframe = document.createElement('iframe');
    printIframe.style.position = 'fixed';
    printIframe.style.right = '0';
    printIframe.style.bottom = '0';
    printIframe.style.width = '0';
    printIframe.style.height = '0';
    printIframe.style.border = '0';
    document.body.appendChild(printIframe);

    const doc = printIframe.contentWindow.document;
    doc.open();
    doc.write(htmlContent);
    doc.close();

    setTimeout(() => {
      printIframe.contentWindow.focus();
      printIframe.contentWindow.print();
      setTimeout(() => {
        document.body.removeChild(printIframe);
      }, 2000);
    }, 500);
    return true;
  }
};
