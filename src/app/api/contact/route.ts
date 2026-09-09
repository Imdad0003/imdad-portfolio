import { NextRequest, NextResponse } from "next/server";

// Simple in-memory IP rate limiter (IP -> timestamps[])
const submissionLimitMap = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowMs = 10 * 60 * 1000; // 10 minutes
  const maxSubmissions = 5;

  const timestamps = submissionLimitMap.get(ip) || [];
  const recent = timestamps.filter((t) => now - t < windowMs);

  if (recent.length >= maxSubmissions) {
    return true;
  }

  recent.push(now);
  submissionLimitMap.set(ip, recent);
  return false;
}

// Basic HTML sanitization
function sanitize(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .trim();
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TARGET_EMAIL = "imdad.builds@gmail.com";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    if (isRateLimited(ip)) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many submissions received. Please wait a few minutes before submitting again.",
        },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid request payload." },
        { status: 400 }
      );
    }

    const {
      name,
      email,
      phone,
      service,
      services,
      businessName,
      budget,
      message,
      projectDetails,
      _hp,
    } = body;

    // Honeypot anti-spam check: if bot filled this hidden field, safely exit
    if (_hp && typeof _hp === "string" && _hp.trim().length > 0) {
      console.warn("[Contact API] Honeypot triggered with value:", _hp);
      return NextResponse.json(
        { success: true, message: "Inquiry received successfully." },
        { status: 200 }
      );
    }

    // Input Validations
    if (!name || typeof name !== "string" || name.trim().length < 2 || name.trim().length > 100) {
      return NextResponse.json(
        { success: false, error: "Please enter your full name (2–100 characters)." },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim()) || email.trim().length > 120) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    if (!phone || typeof phone !== "string" || !phone.trim()) {
      return NextResponse.json(
        { success: false, error: "Please enter your WhatsApp number so I can contact you." },
        { status: 400 }
      );
    }

    const phoneDigits = phone.replace(/\D/g, "");
    if (phoneDigits.length < 10 || phoneDigits.length > 15) {
      return NextResponse.json(
        {
          success: false,
          error: "Please enter a valid WhatsApp / phone number (at least 10 digits).",
        },
        { status: 400 }
      );
    }

    const rawMessage =
      (typeof message === "string" && message.trim()) ||
      (typeof projectDetails === "string" && projectDetails.trim()) ||
      "";

    if (rawMessage.length < 5 || rawMessage.length > 5000) {
      return NextResponse.json(
        { success: false, error: "Please describe your project or inquiry (at least 5 characters)." },
        { status: 400 }
      );
    }

    const cleanName = sanitize(name);
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone && typeof phone === "string" ? sanitize(phone).slice(0, 40) : "";
    const cleanBusiness =
      businessName && typeof businessName === "string" ? sanitize(businessName).slice(0, 100) : "";

    let cleanService = "General Inquiry";
    if (service && typeof service === "string" && service.trim()) {
      cleanService = sanitize(service).slice(0, 100);
    } else if (Array.isArray(services) && services.length > 0) {
      cleanService = sanitize(services.filter((s) => typeof s === "string").join(", ")).slice(0, 150);
    }

    const cleanBudget = budget && typeof budget === "string" && budget.trim() ? sanitize(budget).slice(0, 80) : "Not specified";
    const cleanMessage = sanitize(rawMessage);

    const now = new Date();
    const istTime = now.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "full",
      timeStyle: "medium",
    });

    // Generate Clean HTML Email Template
    const htmlBody = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Project Inquiry</title>
</head>
<body style="margin:0;padding:0;background-color:#F8F4E9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#180D1D;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F8F4E9;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#ffffff;border-radius:16px;border:1px solid rgba(80,45,85,0.12);overflow:hidden;box-shadow:0 6px 24px rgba(80,45,85,0.06);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#180D1D,#2B1435);padding:28px 32px;">
              <h1 style="margin:0;color:#F8F4E9;font-size:20px;font-weight:800;letter-spacing:-0.5px;">
                IMDAD DIGITAL STUDIO
              </h1>
              <p style="margin:6px 0 0 0;color:#F6DBC0;font-size:12px;font-family:monospace;letter-spacing:1.5px;text-transform:uppercase;">
                New Client Inquiry Received
              </p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 20px 0;font-size:14px;line-height:1.6;color:#56475C;">
                You received a new inquiry through the <strong>imdad-portfolio</strong> contact form:
              </p>
              <!-- Info Table -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FAF2EA;border-radius:12px;border:1px solid #F6DBC0;margin-bottom:24px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <table width="100%" cellpadding="6" cellspacing="0" style="font-size:13px;">
                      <tr>
                        <td width="130" style="color:#7A3F26;font-weight:bold;vertical-align:top;">Client Name:</td>
                        <td style="color:#180D1D;font-weight:bold;">${cleanName}</td>
                      </tr>
                      ${
                        cleanBusiness
                          ? `<tr>
                        <td style="color:#7A3F26;font-weight:bold;vertical-align:top;">Brand / Company:</td>
                        <td style="color:#180D1D;font-weight:bold;">${cleanBusiness}</td>
                      </tr>`
                          : ""
                      }
                      <tr>
                        <td style="color:#7A3F26;font-weight:bold;vertical-align:top;">Client Email:</td>
                        <td><a href="mailto:${cleanEmail}" style="color:#935073;text-decoration:underline;">${cleanEmail}</a></td>
                      </tr>
                      <tr>
                        <td style="color:#7A3F26;font-weight:bold;vertical-align:top;">WhatsApp / Phone:</td>
                        <td style="color:#180D1D;font-weight:bold;"><a href="https://wa.me/${cleanPhone.replace(/[^0-9]/g, "")}" style="color:#180D1D;text-decoration:none;">${cleanPhone}</a></td>
                      </tr>
                      <tr>
                        <td style="color:#7A3F26;font-weight:bold;vertical-align:top;">Service Needed:</td>
                        <td style="color:#180D1D;font-weight:600;">${cleanService}</td>
                      </tr>
                      <tr>
                        <td style="color:#7A3F26;font-weight:bold;vertical-align:top;">Budget Range:</td>
                        <td style="color:#180D1D;font-weight:600;">${cleanBudget}</td>
                      </tr>
                      <tr>
                        <td style="color:#7A3F26;font-weight:bold;vertical-align:top;">Timestamp:</td>
                        <td style="color:#7A6880;font-size:12px;">${istTime} (IST)</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Message Details -->
              <h2 style="margin:0 0 10px 0;font-size:12px;font-family:monospace;text-transform:uppercase;color:#7A6880;letter-spacing:1px;">
                Project Goals &amp; Scope:
              </h2>
              <div style="background-color:#ffffff;border:1px solid rgba(80,45,85,0.12);border-radius:12px;padding:18px;font-size:14px;line-height:1.6;color:#180D1D;white-space:pre-wrap;">${cleanMessage}</div>

              <!-- Action Link -->
              <div style="margin-top:28px;text-align:center;">
                <a href="mailto:${cleanEmail}?subject=Re:%20Your%20Inquiry%20with%20Imdad%20Digital%20Studio" style="display:inline-block;background-color:#180D1D;color:#F8F4E9;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:13px;">
                  Reply Directly to ${cleanName}
                </a>
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:#FAF9F6;padding:18px 32px;border-top:1px solid rgba(80,45,85,0.08);text-align:center;color:#7A6880;font-size:11px;">
              Delivered to <strong>${TARGET_EMAIL}</strong> • Reply-To: <strong>${cleanEmail}</strong>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    // Plain Text Fallback
    const textBody = `NEW CLIENT INQUIRY - IMDAD DIGITAL STUDIO
==========================================
Client Name: ${cleanName}
${cleanBusiness ? `Brand / Company: ${cleanBusiness}\n` : ""}Client Email: ${cleanEmail}
WhatsApp / Phone: ${cleanPhone}
Service Needed: ${cleanService}
Estimated Budget: ${cleanBudget}
Submitted At: ${istTime} (IST)

PROJECT GOALS & SCOPE:
------------------------------------------
${cleanMessage}

------------------------------------------
Reply directly to this email to respond to ${cleanName} (${cleanEmail}).`;

    // Primary Provider: Resend (Recommended for Next.js / Vercel)
    const resendApiKey = process.env.RESEND_API_KEY;
    const resendFrom = process.env.RESEND_FROM_EMAIL || "Imdad Studio Inquiries <onboarding@resend.dev>";

    if (resendApiKey) {
      console.log(`[Contact API] Attempting email dispatch via Resend to ${TARGET_EMAIL}...`);

      const resendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: resendFrom,
          to: [TARGET_EMAIL],
          reply_to: cleanEmail,
          subject: `New Inquiry from ${cleanName} - ${cleanService}`,
          html: htmlBody,
          text: textBody,
        }),
      });

      const resendData = await resendRes.json().catch(() => ({}));

      if (!resendRes.ok) {
        console.error("[Contact API] Resend dispatch error:", {
          status: resendRes.status,
          response: resendData,
        });

        const providerMessage =
          (typeof resendData?.message === "string" && resendData.message) ||
          "Unable to deliver inquiry via email provider at this moment.";

        return NextResponse.json(
          {
            success: false,
            error: providerMessage,
            code: resendData?.name || "PROVIDER_DELIVERY_ERROR",
          },
          { status: resendRes.status >= 400 && resendRes.status < 600 ? resendRes.status : 502 }
        );
      }

      console.log(`[Contact API] Resend accepted email. Resend ID: ${resendData?.id}`);

      return NextResponse.json(
        {
          success: true,
          message: "Inquiry sent successfully.",
          emailId: resendData?.id,
        },
        { status: 200 }
      );
    }

    // Fallback Provider 2: Brevo (formerly Sendinblue)
    const brevoApiKey = process.env.BREVO_API_KEY;
    if (brevoApiKey) {
      const brevoRes = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": brevoApiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender: { name: "Imdad Digital Studio", email: "contact@imdad.dev" },
          to: [{ email: TARGET_EMAIL, name: "Imdad" }],
          replyTo: { email: cleanEmail, name: cleanName },
          subject: `New Inquiry from ${cleanName} - ${cleanService}`,
          htmlContent: htmlBody,
          textContent: textBody,
        }),
      });

      if (!brevoRes.ok) {
        const errorData = await brevoRes.json().catch(() => ({}));
        console.error("[Contact API] Brevo sending error:", errorData);
        return NextResponse.json(
          {
            success: false,
            error: "Unable to deliver inquiry via email provider at this moment. Please reach out via WhatsApp.",
          },
          { status: 502 }
        );
      }

      return NextResponse.json(
        { success: true, message: "Inquiry sent successfully." },
        { status: 200 }
      );
    }

    // If neither provider is configured:
    console.warn(
      "[Contact API] No email API key found (RESEND_API_KEY). Please add RESEND_API_KEY to .env.local and to Vercel environment variables."
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Email delivery service is currently being configured. Please contact Imdad directly via WhatsApp (+91 7352608269) or email imdad.builds@gmail.com.",
        code: "NO_PROVIDER_CONFIGURED",
      },
      { status: 503 }
    );
  } catch (err) {
    console.error("[Contact API] Server error:", err);
    return NextResponse.json(
      { success: false, error: "An unexpected server error occurred. Please try again later." },
      { status: 500 }
    );
  }
}
