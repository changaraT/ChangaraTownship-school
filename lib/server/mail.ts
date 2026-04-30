export async function sendEmail({ to, subject, htmlContent }: { to: string; subject: string; htmlContent: string }) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.warn("BREVO_API_KEY not set. Email will be simulated.");
    console.log(`SIMULATED EMAIL TO: ${to}\nSUBJECT: ${subject}\nCONTENT: ${htmlContent}`);
    return;
  }

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: "Changara Township School",
          email: "changaratownship@gmail.com",
        },
        to: [{ email: to }],
        subject,
        htmlContent,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Brevo API error:", error);
    }
  } catch (err) {
    console.error("Failed to send email via Brevo", err);
  }
}
