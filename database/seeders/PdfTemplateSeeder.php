<?php

namespace Database\Seeders;

use App\Models\PdfTemplate;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PdfTemplateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Yahrzeit Donation Letter Template
        PdfTemplate::create([
            'name' => 'Yahrzeit Donation Letter',
            'slug' => 'yahrzeit-donation-letter',
            'description' => 'Letter requesting donations in memory of a deceased member, includes Hebrew date and family member information.',
            'category' => 'letter',
            'is_active' => true,
            'available_fields' => [
                [
                    'name' => 'date',
                    'label' => 'Letter Date',
                    'type' => 'date',
                    'description' => 'Date the letter is being sent',
                    'required' => true,
                ],
                [
                    'name' => 'family_member_name',
                    'label' => 'Family Member Name',
                    'type' => 'text',
                    'description' => 'Name of the recipient (family member)',
                    'required' => true,
                ],
                [
                    'name' => 'family_member_address',
                    'label' => 'Family Member Address',
                    'type' => 'textarea',
                    'description' => 'Complete mailing address of the family member',
                    'required' => true,
                ],
                [
                    'name' => 'deceased_name',
                    'label' => 'Deceased Name',
                    'type' => 'text',
                    'description' => 'Name of the deceased person being remembered',
                    'required' => true,
                ],
                [
                    'name' => 'hebrew_date',
                    'label' => 'Hebrew Date',
                    'type' => 'text',
                    'description' => 'Hebrew date of the yahrzeit',
                    'required' => true,
                ],
                [
                    'name' => 'gregorian_date',
                    'label' => 'Gregorian Date',
                    'type' => 'date',
                    'description' => 'Gregorian calendar date when yahrzeit will be observed this year',
                    'required' => true,
                ],
                [
                    'name' => 'synagogue_name',
                    'label' => 'Synagogue Name',
                    'type' => 'text',
                    'description' => 'Name of the synagogue',
                    'required' => false,
                    'default_value' => 'Our Synagogue',
                ],
                [
                    'name' => 'contact_phone',
                    'label' => 'Contact Phone',
                    'type' => 'text',
                    'description' => 'Synagogue contact phone number',
                    'required' => false,
                ],
                [
                    'name' => 'contact_email',
                    'label' => 'Contact Email',
                    'type' => 'text',
                    'description' => 'Synagogue contact email',
                    'required' => false,
                ],
            ],
            'html_content' => '<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: Georgia, serif;
            line-height: 1.6;
            color: #333;
            max-width: 650px;
            margin: 0 auto;
            padding: 40px 20px;
        }
        .letterhead {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 2px solid #2c5aa0;
        }
        .synagogue-name {
            font-size: 24px;
            font-weight: bold;
            color: #2c5aa0;
            margin-bottom: 10px;
        }
        .date {
            text-align: right;
            margin-bottom: 30px;
            color: #666;
        }
        .address {
            margin-bottom: 30px;
        }
        .salutation {
            margin-bottom: 20px;
        }
        .body-text {
            margin-bottom: 20px;
            text-align: justify;
        }
        .yahrzeit-info {
            background-color: #f5f5f5;
            padding: 20px;
            margin: 30px 0;
            border-left: 4px solid #2c5aa0;
        }
        .yahrzeit-info strong {
            color: #2c5aa0;
        }
        .signature {
            margin-top: 40px;
        }
        .footer {
            margin-top: 60px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            text-align: center;
            font-size: 12px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="letterhead">
        <div class="synagogue-name">{{synagogue_name}}</div>
    </div>

    <div class="date">{{date}}</div>

    <div class="address">
        {{family_member_name}}<br>
        {{family_member_address}}
    </div>

    <div class="salutation">
        Dear {{family_member_name}},
    </div>

    <div class="body-text">
        As we approach the yahrzeit of your beloved <strong>{{deceased_name}}</strong>, we wanted to reach out 
        to you with our heartfelt condolences and remembrance.
    </div>

    <div class="yahrzeit-info">
        <p style="margin: 0 0 10px 0;">
            <strong>Yahrzeit Observance:</strong>
        </p>
        <p style="margin: 0 0 5px 0;">
            Hebrew Date: <strong>{{hebrew_date}}</strong>
        </p>
        <p style="margin: 0;">
            This year observed on: <strong>{{gregorian_date}}</strong>
        </p>
    </div>

    <div class="body-text">
        During this time of remembrance, many families choose to honor their loved ones through acts of 
        charity and goodness. We invite you to consider making a yahrzeit donation in memory of 
        {{deceased_name}}. Your contribution helps sustain our community and continues the legacy of 
        those we remember.
    </div>

    <div class="body-text">
        A donation made in memory of {{deceased_name}} will be acknowledged in our community newsletter 
        and will help support our ongoing programs and services. We will also mention {{deceased_name}}\'s 
        name during our yahrzeit memorial prayers.
    </div>

    <div class="body-text">
        If you would like to make a donation or have any questions, please don\'t hesitate to contact us. 
        We are here to support you during this time of remembrance.
    </div>

    <div class="body-text">
        May the memory of {{deceased_name}} continue to be a blessing.
    </div>

    <div class="signature">
        <p>With warm regards,</p>
        <p style="margin-top: 40px;">
            <strong>{{synagogue_name}}</strong>
        </p>
    </div>

    <div class="footer">
        {{contact_phone}} • {{contact_email}}
    </div>
</body>
</html>',
        ]);
    }
}

