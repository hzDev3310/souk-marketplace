<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Souk AI account is ready</title>
</head>
<body style="margin:0; padding:0; background:#f5f7fb; font-family:Arial, Helvetica, sans-serif; color:#111827;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7fb; padding:32px 0;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" max-width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:24px; overflow:hidden; border:1px solid #e5e7eb;">
                    <tr>
                        <td style="padding:28px 32px; background:linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%); color:#ffffff;">
                            <div style="display:flex; align-items:center; gap:12px; margin-bottom:12px;">
                                <img src="https://drive.google.com/uc?export=view&id=1YjoD3qGuOBk1T51Ho60KaxEn9Bs6evZg" alt="Souk AI" width="48" height="48" style="border-radius:12px; background:#ffffff; padding:4px; object-fit:contain;">
                                <span style="font-size:22px; font-weight:800; letter-spacing:1px;">Souk AI</span>
                            </div>
                            <h1 style="margin:12px 0 0; font-size:28px; line-height:1.2; color:#ffffff;">Welcome to Souk AI</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:32px;">
                            <p style="margin:0 0 16px; font-size:16px; line-height:1.7; color:#1f2937;">
                                Hello {{ $user->name }} {{ $user->family_name }},
                            </p>
                            <p style="margin:0 0 20px; font-size:16px; line-height:1.7; color:#1f2937;">
                                Your account has been created successfully on Souk AI. You can log in anytime using the temporary password below and track your orders.
                            </p>

                            <table role="presentation" cellpadding="0" cellspacing="0" style="margin:20px 0; background:#ecfdf5; border:1px solid #a7f3d0; border-radius:16px; width:100%;">
                                <tr>
                                    <td style="padding:18px 20px;">
                                        <div style="font-size:11px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; color:#047857; margin-bottom:8px;">Temporary password</div>
                                        <div style="font-size:26px; font-weight:700; letter-spacing:2px; color:#065f46; font-family:Courier New, monospace;">{{ $password }}</div>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin:0 0 12px; font-size:15px; line-height:1.7; color:#374151;">
                                Email: <strong>{{ $user->email }}</strong>
                            </p>

                            <p style="margin:0 0 20px; font-size:15px; line-height:1.7; color:#374151;">
                                For your security, we recommend changing this password after your first login.
                            </p>

                            <p style="margin:0; font-size:14px; line-height:1.7; color:#4b5563;">
                                Thank you for shopping with Souk AI.<br>
                                The Souk AI Team
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:20px 32px 28px; background:#f8fafc; border-top:1px solid #e5e7eb; font-size:12px; color:#6b7280; text-align:center; line-height:1.7;">
                            Souk AI • Your marketplace for modern shopping<br>
                            Need help? Contact us at support@souk.ai
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
