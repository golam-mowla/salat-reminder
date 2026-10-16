const TIMEZONES = [
  { value: 'Asia/Dhaka', labelBn: 'ঢাকা, বাংলাদেশ (UTC+6)', offset: '+06:00' },
  { value: 'Asia/Riyadh', labelBn: 'রিয়াদ / মক্কা, সৌদি আরব (UTC+3)', offset: '+03:00' },
  { value: 'Asia/Dubai', labelBn: 'দুবাই, সংযুক্ত আরব আমিরাত (UTC+4)', offset: '+04:00' },
  { value: 'Asia/Kolkata', labelBn: 'কলকাতা / নতুন দিল্লি, ভারত (UTC+5:30)', offset: '+05:30' },
  { value: 'Asia/Karachi', labelBn: 'করাচি / ইসলামাবাদ, পাকিস্তান (UTC+5)', offset: '+05:00' },
  { value: 'Asia/Kuala_Lumpur', labelBn: 'কুয়ালালামপুর, মালয়েশিয়া (UTC+8)', offset: '+08:00' },
  { value: 'Asia/Singapore', labelBn: 'সিঙ্গাপুর (UTC+8)', offset: '+08:00' },
  { value: 'Asia/Jakarta', labelBn: 'জাকার্তা, ইন্দোনেশিয়া (UTC+7)', offset: '+07:00' },
  { value: 'Asia/Tokyo', labelBn: 'টোকিও, জাপান (UTC+9)', offset: '+09:00' },
  { value: 'Europe/London', labelBn: 'লন্ডন, যুক্তরাজ্য (UTC+0/+1)', offset: '+00:00' },
  { value: 'Europe/Paris', labelBn: 'প্যারিস / বার্লিন / রোম (UTC+1/+2)', offset: '+01:00' },
  { value: 'Europe/Istanbul', labelBn: 'ইস্তাম্বুল, তুরস্ক (UTC+3)', offset: '+03:00' },
  { value: 'America/New_York', labelBn: 'নিউ ইয়র্ক, যুক্তরাষ্ট্র ইস্টার্ন (UTC-5/-4)', offset: '-05:00' },
  { value: 'America/Chicago', labelBn: 'শিকাগো, যুক্তরাষ্ট্র সেন্ট্রাল (UTC-6/-5)', offset: '-06:00' },
  { value: 'America/Los_Angeles', labelBn: 'লস অ্যাঞ্জেলেস, প্যাসিফিক (UTC-8/-7)', offset: '-08:00' },
  { value: 'America/Toronto', labelBn: 'টরন্টো, কানাডা (UTC-5/-4)', offset: '-05:00' },
  { value: 'Australia/Sydney', labelBn: 'সিডনি / মেলবোর্ন, অস্ট্রেলিয়া (UTC+10/+11)', offset: '+10:00' },
  { value: 'Etc/UTC', labelBn: 'সর্বজনীন সমন্বিত সময় (UTC/GMT)', offset: '+00:00' },
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TIMEZONES };
}
