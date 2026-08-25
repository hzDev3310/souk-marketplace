<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SettingSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            // Branding
            ['key' => 'website_logo', 'value' => null, 'type' => 'image', 'group' => 'branding'],

            // AI Search
            ['key' => 'gemini_api_key', 'value' => '', 'type' => 'password', 'group' => 'ai'],
            ['key' => 'gemini_embedding_model', 'value' => 'models/gemini-embedding-001', 'type' => 'select', 'group' => 'ai'],

            // Hero Section
            ['key' => 'hero_title_en', 'value' => 'Discover *Unique* Style', 'type' => 'text', 'group' => 'hero'],
            ['key' => 'hero_title_fr', 'value' => 'Découvrez un Style *Unique*', 'type' => 'text', 'group' => 'hero'],
            ['key' => 'hero_title_ar', 'value' => 'اكتشف أسلوباً *فريداً*', 'type' => 'text', 'group' => 'hero'],
            
            ['key' => 'hero_subtitle_en', 'value' => 'Shop the latest trends from the best creators and brands worldwide.', 'type' => 'text', 'group' => 'hero'],
            ['key' => 'hero_subtitle_fr', 'value' => 'Achetez les dernières tendances des meilleurs créateurs et marques mondiales.', 'type' => 'text', 'group' => 'hero'],
            ['key' => 'hero_subtitle_ar', 'value' => 'تسوق أحدث الصيحات من أفضل المبدعين والعلامات التجارية حول العالم.', 'type' => 'text', 'group' => 'hero'],
            
            ['key' => 'hero_image', 'value' => 'hero-banner.webp', 'type' => 'image', 'group' => 'hero'],
            
            // Design Tokens
            ['key' => 'primary_color', 'value' => '#6366f1', 'type' => 'color', 'group' => 'design'],
            ['key' => 'secondary_color', 'value' => '#f43f5e', 'type' => 'color', 'group' => 'design'],
            ['key' => 'radius', 'value' => '28px', 'type' => 'text', 'group' => 'design'],
            
            // Contact
            ['key' => 'contact_email', 'value' => 'support@soukai.com', 'type' => 'text', 'group' => 'general'],
            ['key' => 'contact_phone', 'value' => '+216 00 000 000', 'type' => 'text', 'group' => 'general'],
            ['key' => 'contact_address_en', 'value' => 'Tunis, Tunisia', 'type' => 'text', 'group' => 'general'],
            ['key' => 'contact_address_fr', 'value' => 'Tunis, Tunisie', 'type' => 'text', 'group' => 'general'],
            ['key' => 'contact_address_ar', 'value' => 'تونس، تونس', 'type' => 'text', 'group' => 'general'],
            ['key' => 'contact_location_url', 'value' => '', 'type' => 'text', 'group' => 'general'],
            ['key' => 'website_name', 'value' => 'Souk AI', 'type' => 'text', 'group' => 'general'],

            // Pages
            ['key' => 'footer_about_en', 'value' => 'Souk AI helps shoppers discover trusted stores, standout products, and a smoother way to buy online.', 'type' => 'text', 'group' => 'pages'],
            ['key' => 'footer_about_fr', 'value' => 'Souk AI aide les clients a decouvrir des boutiques fiables, des produits remarquables et une experience d achat plus fluide.', 'type' => 'text', 'group' => 'pages'],
            ['key' => 'footer_about_ar', 'value' => 'يساعد Souk AI المتسوقين على اكتشاف متاجر موثوقة ومنتجات مميزة وتجربة شراء اكثر سلاسة.', 'type' => 'text', 'group' => 'pages'],

            ['key' => 'about_title_en', 'value' => 'About Souk AI', 'type' => 'text', 'group' => 'pages'],
            ['key' => 'about_title_fr', 'value' => 'A propos de Souk AI', 'type' => 'text', 'group' => 'pages'],
            ['key' => 'about_title_ar', 'value' => 'من نحن', 'type' => 'text', 'group' => 'pages'],
            ['key' => 'about_content_en', 'value' => "Souk AI is a modern marketplace built to connect customers with trusted stores and carefully selected products.\n\nWe focus on clarity, speed, and confidence at every step of the shopping journey.", 'type' => 'text', 'group' => 'pages'],
            ['key' => 'about_content_fr', 'value' => "Souk AI est une marketplace moderne concue pour connecter les clients a des boutiques fiables et a des produits soigneusement selectionnes.\n\nNous mettons l accent sur la clarte, la rapidite et la confiance a chaque etape du parcours d achat.", 'type' => 'text', 'group' => 'pages'],
            ['key' => 'about_content_ar', 'value' => "Souk AI هو متجر الكتروني حديث يربط العملاء بمتاجر موثوقة ومنتجات مختارة بعناية.\n\nنركز على الوضوح والسرعة والثقة في كل خطوة من رحلة الشراء.", 'type' => 'text', 'group' => 'pages'],

            ['key' => 'terms_title_en', 'value' => 'Terms and Conditions', 'type' => 'text', 'group' => 'pages'],
            ['key' => 'terms_title_fr', 'value' => 'Conditions generales', 'type' => 'text', 'group' => 'pages'],
            ['key' => 'terms_title_ar', 'value' => 'الشروط والاحكام', 'type' => 'text', 'group' => 'pages'],
            ['key' => 'terms_content_en', 'value' => "By using Souk AI, you agree to use the platform lawfully and provide accurate information when placing orders.\n\nStores are responsible for their catalog content, pricing, and fulfillment commitments.", 'type' => 'text', 'group' => 'pages'],
            ['key' => 'terms_content_fr', 'value' => "En utilisant Souk AI, vous acceptez d utiliser la plateforme de maniere legale et de fournir des informations exactes lors de vos commandes.\n\nLes boutiques sont responsables du contenu de leur catalogue, de leurs prix et de leurs engagements de livraison.", 'type' => 'text', 'group' => 'pages'],
            ['key' => 'terms_content_ar', 'value' => "باستخدام Souk AI، فإنك توافق على استخدام المنصة بشكل قانوني وتقديم معلومات صحيحة عند اجراء الطلبات.\n\nتتحمل المتاجر مسؤولية محتوى منتجاتها واسعارها والتزاماتها في التنفيذ.", 'type' => 'text', 'group' => 'pages'],

            ['key' => 'contact_title_en', 'value' => 'Contact Us', 'type' => 'text', 'group' => 'pages'],
            ['key' => 'contact_title_fr', 'value' => 'Contactez-nous', 'type' => 'text', 'group' => 'pages'],
            ['key' => 'contact_title_ar', 'value' => 'اتصل بنا', 'type' => 'text', 'group' => 'pages'],
            ['key' => 'contact_content_en', 'value' => "Reach out to our team for store support, orders, partnerships, or any question about the platform.\n\nWe will get back to you as quickly as possible.", 'type' => 'text', 'group' => 'pages'],
            ['key' => 'contact_content_fr', 'value' => "Contactez notre equipe pour l assistance des boutiques, les commandes, les partenariats ou toute question sur la plateforme.\n\nNous vous repondrons dans les meilleurs delais.", 'type' => 'text', 'group' => 'pages'],
            ['key' => 'contact_content_ar', 'value' => "تواصل مع فريقنا بخصوص دعم المتاجر او الطلبات او الشراكات او اي سؤال يتعلق بالمنصة.\n\nسنعود اليك في اقرب وقت ممكن.", 'type' => 'text', 'group' => 'pages'],
        ];

        foreach ($settings as $setting) {
            DB::table('settings')->updateOrInsert(
                ['key' => $setting['key']],
                array_merge($setting, ['created_at' => now(), 'updated_at' => now()])
            );
        }
    }
}
