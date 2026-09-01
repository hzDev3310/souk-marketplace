@php($logoUrl = config('mail.logo_url'))
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 12px;background:#f1f5f9;"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#fff;border:1px solid #e2e8f0;border-radius:28px;overflow:hidden;">
    <tr><td style="padding:28px 32px;background:linear-gradient(135deg,#0f172a 0%,#1e1b4b 55%,#7c3aed 100%);color:#fff;">
        <table role="presentation" cellpadding="0" cellspacing="0"><tr>
            <td style="padding-right:12px;">
                @if($logoUrl)<img src="{{ $logoUrl }}" alt="Souk AI" width="44" height="44" style="display:block;border-radius:16px;background:#fff;padding:3px;object-fit:cover;" />
                @else<span style="display:inline-block;width:44px;height:44px;line-height:44px;border-radius:16px;background:#fff;color:#7c3aed;text-align:center;font-size:22px;font-weight:800;">S</span>@endif
            </td>
            <td style="font-size:21px;font-weight:800;letter-spacing:.3px;color:#fff;">Souk AI</td>
        </tr></table>
        <div style="margin-top:20px;font-size:27px;font-weight:800;line-height:1.25;">Your store is ready</div>
    </td></tr>
    <tr><td style="padding:32px;">
        <p style="margin:0 0 14px;font-size:16px;line-height:1.65;color:#334155;">Hello {{ $user->name }},</p>
        <p style="margin:0 0 22px;font-size:16px;line-height:1.65;color:#334155;">An administrator created your Souk AI store account. Use the credentials below to sign in to your dashboard.</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:20px;"><tr><td style="padding:20px 22px;">
            <div style="font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#64748b;">Email</div>
            <div style="margin-top:5px;font-size:16px;font-weight:700;color:#0f172a;">{{ $user->email }}</div>
            <div style="margin-top:18px;padding-top:16px;border-top:1px solid #e2e8f0;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#64748b;">Temporary password</div>
            <div style="margin-top:7px;font-family:'Courier New',monospace;font-size:22px;font-weight:800;letter-spacing:1px;color:#4f46e5;">{{ $password }}</div>
        </td></tr></table>
        <p style="margin:22px 0 0;font-size:14px;line-height:1.65;color:#64748b;">For security, change this password after your first sign-in.</p>
    </td></tr>
    <tr><td style="padding:20px 32px;background:#0f172a;text-align:center;font-size:12px;line-height:1.65;color:#cbd5e1;">Souk AI &bull; Your marketplace dashboard<br>Need help? Contact support@souk.ai</td></tr>
</table>
</td></tr></table>
</body></html>
