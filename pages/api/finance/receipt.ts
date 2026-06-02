import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from "../../../lib/server/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const id = (req.query.id || req.query['id']) as string;
    if (!id) return res.status(400).send('Missing receipt id');

    const { data: fee } = await supabase.from('fees').select('*').eq('id', id).maybeSingle();
    if (!fee) return res.status(404).send('Fee not found');

    const { data: student } = await supabase.from('students').select('*').eq('id', fee.student_id).maybeSingle();

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Receipt ${fee.id}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: #ffffff;
      padding: 40px;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    .header {
      display: flex;
      gap: 20px;
      align-items: center;
      border-bottom: 3px solid #667eea;
      padding-bottom: 24px;
      margin-bottom: 28px;
    }
    .logo-container {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 120px;
      height: 120px;
      background: #f8fafc;
      border-radius: 20px;
      border: 3px solid #e2e8f0;
      padding: 8px;
    }
    .logo {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      width: auto;
      height: auto;
    }
    .header-text h1 {
      font-size: 28px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 4px;
      letter-spacing: -0.5px;
    }
    .header-text .subtitle {
      color: #64748b;
      font-size: 13px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .content {
      margin: 28px 0;
    }
    .receipt-row {
      display: flex;
      justify-content: space-between;
      padding: 16px 0;
      border-bottom: 1px solid #e2e8f0;
      align-items: center;
    }
    .receipt-row:last-child {
      border-bottom: none;
    }
    .receipt-row .label {
      color: #64748b;
      font-size: 13px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .receipt-row .value {
      font-size: 15px;
      font-weight: 700;
      color: #0f172a;
      text-align: right;
    }
    .amount-section {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 24px;
      border-radius: 16px;
      margin: 24px 0;
      text-align: center;
    }
    .amount-label {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      opacity: 0.9;
      margin-bottom: 8px;
    }
    .amount-value {
      font-size: 38px;
      font-weight: 900;
      letter-spacing: -1px;
    }
    .status-badge {
      display: inline-block;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .status-paid {
      background: #dcfce7;
      color: #166534;
    }
    .status-pending {
      background: #fef3c7;
      color: #92400e;
    }
    .status-partial {
      background: #dbeafe;
      color: #1e40af;
    }
    .footer {
      margin-top: 32px;
      padding-top: 24px;
      border-top: 2px solid #e2e8f0;
      text-align: center;
      color: #64748b;
      font-size: 11px;
    }
    .footer-note {
      margin-top: 16px;
      padding: 12px;
      background: #f8fafc;
      border-left: 4px solid #667eea;
      border-radius: 4px;
      font-size: 10px;
      color: #475569;
    }
    @media print {
      body { background: white; padding: 0; }
      .container { box-shadow: none; border-radius: 0; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo-container">
        <img src="/icon-512.png" alt="School Logo" class="logo" />
      </div>
      <div class="header-text">
        <h1>Changara Township School</h1>
        <div class="subtitle">Official Payment Receipt</div>
      </div>
    </div>

    <div class="content">
      <div class="receipt-row">
        <span class="label">Learner Name</span>
        <span class="value">${student?.name || 'N/A'}</span>
      </div>
      <div class="receipt-row">
        <span class="label">Admission Number</span>
        <span class="value">${student?.admission_number || 'N/A'}</span>
      </div>
      <div class="receipt-row">
        <span class="label">Class</span>
        <span class="value">${student?.class || 'N/A'}</span>
      </div>
      <div class="receipt-row">
        <span class="label">Billing Term</span>
        <span class="value">${fee.term}</span>
      </div>
      <div class="receipt-row">
        <span class="label">Date Recorded</span>
        <span class="value">${new Date(fee.date).toLocaleDateString()}</span>
      </div>
    </div>

    <div class="amount-section">
      <div class="amount-label">Amount Paid</div>
      <div class="amount-value">KSH ${Number(fee.amount).toLocaleString()}</div>
    </div>

    <div class="content">
      ${fee.tuition_amount != null ? `
      <div class="receipt-row">
        <span class="label">Tuition</span>
        <span class="value">KSH ${Number(fee.tuition_amount).toLocaleString()}</span>
      </div>
      ` : ''}
      ${fee.food_brought_text ? `
      <div class="receipt-row">
        <span class="label">Food Brought (Note)</span>
        <span class="value">${String(fee.food_brought_text)}</span>
      </div>
      ` : ''}
      ${fee.food_items && Object.keys(fee.food_items).length > 0 ? `
        <div style="margin: 20px 0;">
          <div style="font-weight: 700; color: #0f172a; font-size: 14px; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Food Items Breakdown</div>
          ${Object.entries(fee.food_items).map(([item, quantity]: [string, any]) => `
            <div class="receipt-row" style="padding: 10px 0;">
              <span class="label">${item}${quantity?.quantity ? ` (×${quantity.quantity})` : ''}</span>
              <span class="value">KSH ${Number(quantity?.total || 0).toLocaleString()}</span>
            </div>
          `).join('')}
        </div>
      ` : ''}
    </div>

    <div class="content">
      <div class="receipt-row" style="border-bottom: 3px solid #667eea; padding: 16px 0 12px 0;">
        <span class="label" style="font-weight: 900;">Total Amount</span>
        <span class="value" style="font-size: 18px; color: #667eea;">KSH ${Number(fee.amount).toLocaleString()}</span>
      </div>
      <div class="receipt-row">
        <span class="label">Payment Status</span>
        <span class="value">
          <span class="status-badge status-${fee.status}">
            ${fee.status === 'paid' ? '✓ Settled' : fee.status === 'pending' ? '⏳ Pending' : '◐ Partial'}
          </span>
        </span>
      </div>
      <div class="receipt-row">
        <span class="label">Receipt ID</span>
        <span class="value">#${fee.id}</span>
      </div>
    </div>

    <div class="footer">
      <div>This is an official receipt issued by Changara Township School management system.</div>
      <div style="margin-top: 8px;">Generated: ${new Date().toLocaleString()}</div>
      <div class="footer-note">
        Please keep this receipt for your records. In case of disputes, contact the school administration within 7 days.
      </div>
    </div>
  </div>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `inline; filename=receipt_${fee.id}.html`);
    res.status(200).send(html);
  } catch (err: any) {
    res.status(500).send(err.message || 'Server error');
  }
}
