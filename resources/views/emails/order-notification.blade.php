@php
    $isRtl = $locale === 'ar';
    $statusKeys = [
        'en_attente' => 'website.orders.pending',
        'confirme' => 'website.orders.confirmed',
        'imported_to_depot' => 'website.orders.warehouse',
        'en_livraison' => 'website.orders.inTransit',
        'livree' => 'website.orders.delivered',
        'retournee' => 'website.orders.returned',
        'annule' => 'website.orders.cancelled',
    ];
    $statusLabel = __($statusKeys[$order->status] ?? 'common.status.unknown');
    $previousStatusLabel = $previousStatus ? __($statusKeys[$previousStatus] ?? 'common.status.unknown') : null;
    $roleLabel = __('email.order.role.' . $recipientRole);
    $logoUrl = config('mail.logo_url');
@endphp
<!DOCTYPE html>
<html lang="{{ $locale }}" dir="{{ $isRtl ? 'rtl' : 'ltr' }}">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 12px;">
    <tr><td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#ffffff;border:1px solid #e2e8f0;border-radius:28px;overflow:hidden;">
            <tr><td style="padding:28px 32px;background:linear-gradient(135deg,#0f172a 0%,#1e1b4b 55%,#7c3aed 100%);color:#ffffff;">
                <table role="presentation" cellpadding="0" cellspacing="0"><tr>
                    <td style="padding-{{ $isRtl ? 'left' : 'right' }}:12px;">
                        @if($logoUrl)
                            <img src="{{ $logoUrl }}" alt="Souk AI" width="44" height="44" style="display:block;border-radius:16px;background:#ffffff;padding:3px;object-fit:cover;" />
                        @else
                            <span style="display:inline-block;width:44px;height:44px;line-height:44px;border-radius:16px;background:#ffffff;color:#7c3aed;text-align:center;font-size:22px;font-weight:800;">S</span>
                        @endif
                    </td>
                    <td style="font-size:21px;font-weight:800;letter-spacing:.4px;color:#ffffff;">Souk AI</td>
                </tr></table>
                <div style="margin-top:20px;font-size:26px;font-weight:800;line-height:1.25;">{{ $event === 'placed' ? __('email.order.titlePlaced') : __('email.order.titleStatus') }}</div>
            </td></tr>
            <tr><td style="padding:32px;">
                <div style="display:inline-block;margin-bottom:18px;padding:7px 12px;border-radius:999px;background:#eef2ff;color:#4f46e5;font-size:11px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;">{{ $roleLabel }}</div>
                <p style="margin:0 0 14px;font-size:16px;line-height:1.65;color:#334155;">{{ __('email.order.hello', ['name' => $recipientName ?: __('email.order.customer')]) }}</p>
                <p style="margin:0 0 22px;font-size:16px;line-height:1.65;color:#334155;">{{ $event === 'placed' ? __('email.order.placedMessage') : __('email.order.statusMessage') }}</p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:20px;">
                    <tr><td style="padding:20px 22px;">
                        <div style="font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#64748b;">{{ __('email.confirmation.orderNumber') }}</div>
                        <div style="margin-top:5px;font-family:Courier New,monospace;font-size:22px;font-weight:800;color:#0f172a;">{{ $order->order_number }}</div>
                        <div style="margin-top:18px;padding-top:16px;border-top:1px solid #e2e8f0;font-size:12px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;color:#64748b;">{{ __('email.order.currentStatus') }}</div>
                        <div style="margin-top:7px;font-size:16px;font-weight:800;color:#4f46e5;">{{ $statusLabel }}</div>
                        @if($event === 'status_changed' && $previousStatusLabel)
                            <div style="margin-top:10px;font-size:13px;color:#64748b;">{{ __('email.order.previousStatus', ['status' => $previousStatusLabel]) }}</div>
                        @endif
                    </td></tr>
                </table>
                <p style="margin:22px 0 0;font-size:14px;line-height:1.65;color:#64748b;">{{ __('email.confirmation.track') }}</p>
            </td></tr>
            <tr><td style="padding:20px 32px;background:#0f172a;text-align:center;font-size:12px;line-height:1.65;color:#cbd5e1;">{{ __('email.confirmation.footer') }}<br>{{ __('email.confirmation.footerHelp') }}</td></tr>
        </table>
    </td></tr>
</table>
</body>
</html>
