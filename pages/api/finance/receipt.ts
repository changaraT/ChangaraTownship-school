import { VercelRequest, VercelResponse } from "@vercel/node";
import { supabase } from "../../../lib/server/supabase";

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
    body{font-family:Arial,sans-serif;padding:24px;color:#0f172a}
    .container{max-width:720px;margin:0 auto;background:#fff;padding:28px;border-radius:16px;border:1px solid #e6eef8}
    .header{display:flex;gap:16px;align-items:center}
    .logo{width:96px;height:96px;object-fit:cover;border-radius:16px}
    h1{margin:0;font-size:20px}
    .row{display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px dashed #eee}
    .muted{color:#64748b;font-size:13px}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="/logo.jpg" class="logo" />
      <div>
        <h1>Changara Township School</h1>
        <div class="muted">Statutory Payment Receipt</div>
      </div>
    </div>

    <div style="margin-top:18px">
      <div class="row"><div class="muted">Beneficiary</div><div><strong>${student?.name || ''}</strong></div></div>
      <div class="row"><div class="muted">Admission</div><div><strong>${student?.admission_number || ''}</strong></div></div>
      <div class="row"><div class="muted">Class</div><div><strong>${student?.class || ''}</strong></div></div>
      <div class="row"><div class="muted">Term</div><div><strong>${fee.term}</strong></div></div>
      <div class="row"><div class="muted">Date</div><div><strong>${new Date(fee.date).toLocaleString()}</strong></div></div>
      <div class="row"><div class="muted">Amount</div><div><strong>KSH ${Number(fee.amount).toLocaleString()}</strong></div></div>
      <div class="row"><div class="muted">Status</div><div><strong>${fee.status}</strong></div></div>
    </div>

    <div style="margin-top:24px;text-align:center;color:#64748b;font-size:12px">Generated on ${new Date().toLocaleString()} by Changara Township School</div>
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
