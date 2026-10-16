// বাংলাদেশের ৬৪ জেলার সঠিক ভৌগোলিক স্থানাঙ্ক (অক্ষাংশ ও দ্রাঘিমাংশ) এবং বিভাগ
const BANGLADESH_DISTRICTS = [
  // ঢাকা বিভাগ
  { id: 'dhaka', bn: 'ঢাকা', en: 'Dhaka', division: 'ঢাকা', lat: 23.8103, lng: 90.4125 },
  { id: 'gazipur', bn: 'গাজীপুর', en: 'Gazipur', division: 'ঢাকা', lat: 24.0023, lng: 90.4264 },
  { id: 'narayanganj', bn: 'নারায়ণগঞ্জ', en: 'Narayanganj', division: 'ঢাকা', lat: 23.6238, lng: 90.5000 },
  { id: 'narsingdi', bn: 'নরসিংদী', en: 'Narsingdi', division: 'ঢাকা', lat: 23.9322, lng: 90.7154 },
  { id: 'munshiganj', bn: 'মুন্সীগঞ্জ', en: 'Munshiganj', division: 'ঢাকা', lat: 23.5422, lng: 90.5305 },
  { id: 'manikganj', bn: 'মানিকগঞ্জ', en: 'Manikganj', division: 'ঢাকা', lat: 23.8617, lng: 90.0003 },
  { id: 'tangail', bn: 'টাঙ্গাইল', en: 'Tangail', division: 'ঢাকা', lat: 24.2513, lng: 89.9167 },
  { id: 'faridpur', bn: 'ফরিদপুর', en: 'Faridpur', division: 'ঢাকা', lat: 23.6071, lng: 89.8429 },
  { id: 'madaripur', bn: 'মাদারীপুর', en: 'Madaripur', division: 'ঢাকা', lat: 23.1641, lng: 90.1897 },
  { id: 'shariatpur', bn: 'শরীয়তপুর', en: 'Shariatpur', division: 'ঢাকা', lat: 23.2423, lng: 90.3541 },
  { id: 'gopalganj', bn: 'গোপালগঞ্জ', en: 'Gopalganj', division: 'ঢাকা', lat: 23.0051, lng: 89.8266 },
  { id: 'rajbari', bn: 'রাজবাড়ী', en: 'Rajbari', division: 'ঢাকা', lat: 23.7574, lng: 89.6445 },
  { id: 'kishoreganj', bn: 'কিশোরগঞ্জ', en: 'Kishoreganj', division: 'ঢাকা', lat: 24.4449, lng: 90.7766 },

  // চট্টগ্রাম বিভাগ
  { id: 'chattogram', bn: 'চট্টগ্রাম', en: 'Chattogram', division: 'চট্টগ্রাম', lat: 22.3569, lng: 91.7832 },
  { id: 'coxsbazar', bn: 'কক্সবাজার', en: "Cox's Bazar", division: 'চট্টগ্রাম', lat: 21.4272, lng: 92.0058 },
  { id: 'cumilla', bn: 'কুমিল্লা', en: 'Cumilla', division: 'চট্টগ্রাম', lat: 23.4607, lng: 91.1809 },
  { id: 'feni', bn: 'ফেনী', en: 'Feni', division: 'চট্টগ্রাম', lat: 23.0186, lng: 91.3966 },
  { id: 'noakhali', bn: 'নোয়াখালী', en: 'Noakhali', division: 'চট্টগ্রাম', lat: 22.8696, lng: 91.0998 },
  { id: 'lakshmipur', bn: 'লক্ষ্মীপুর', en: 'Lakshmipur', division: 'চট্টগ্রাম', lat: 22.9425, lng: 90.8412 },
  { id: 'brahmanbaria', bn: 'ব্রাহ্মণবাড়িয়া', en: 'Brahmanbaria', division: 'চট্টগ্রাম', lat: 23.9571, lng: 91.1119 },
  { id: 'chandpur', bn: 'চাঁদপুর', en: 'Chandpur', division: 'চট্টগ্রাম', lat: 23.2333, lng: 90.6667 },
  { id: 'khagrachhari', bn: 'খাগড়াছড়ি', en: 'Khagrachhari', division: 'চট্টগ্রাম', lat: 23.1193, lng: 91.9847 },
  { id: 'rangamati', bn: 'রাঙ্গামাটি', en: 'Rangamati', division: 'চট্টগ্রাম', lat: 22.6533, lng: 92.1753 },
  { id: 'bandarban', bn: 'বান্দরবান', en: 'Bandarban', division: 'চট্টগ্রাম', lat: 22.1953, lng: 92.2184 },

  // রাজশাহী বিভাগ
  { id: 'rajshahi', bn: 'রাজশাহী', en: 'Rajshahi', division: 'রাজশাহী', lat: 24.3636, lng: 88.6241 },
  { id: 'bogura', bn: 'বগুড়া', en: 'Bogura', division: 'রাজশাহী', lat: 24.8465, lng: 89.3777 },
  { id: 'pabna', bn: 'পাবনা', en: 'Pabna', division: 'রাজশাহী', lat: 24.0064, lng: 89.2372 },
  { id: 'sirajganj', bn: 'সিরাজগঞ্জ', en: 'Sirajganj', division: 'রাজশাহী', lat: 24.4534, lng: 89.7008 },
  { id: 'naogaon', bn: 'নওগাঁ', en: 'Naogaon', division: 'রাজশাহী', lat: 24.7936, lng: 88.9318 },
  { id: 'natore', bn: 'নাটোর', en: 'Natore', division: 'রাজশাহী', lat: 24.4206, lng: 88.9322 },
  { id: 'chapainawabganj', bn: 'চাঁপাইনবাবগঞ্জ', en: 'Chapai Nawabganj', division: 'রাজশাহী', lat: 24.5965, lng: 88.2775 },
  { id: 'joypurhat', bn: 'জয়পুরহাট', en: 'Joypurhat', division: 'রাজশাহী', lat: 25.1015, lng: 89.0277 },

  // খুলনা বিভাগ
  { id: 'khulna', bn: 'খুলনা', en: 'Khulna', division: 'খুলনা', lat: 22.8456, lng: 89.5403 },
  { id: 'jashore', bn: 'যশোর', en: 'Jashore', division: 'খুলনা', lat: 23.1664, lng: 89.2081 },
  { id: 'kushtia', bn: 'কুষ্টিয়া', en: 'Kushtia', division: 'খুলনা', lat: 23.9013, lng: 89.1205 },
  { id: 'satkhira', bn: 'সাতক্ষীরা', en: 'Satkhira', division: 'খুলনা', lat: 22.7185, lng: 89.0705 },
  { id: 'bagerhat', bn: 'বাগেরহাট', en: 'Bagerhat', division: 'খুলনা', lat: 22.6516, lng: 89.7859 },
  { id: 'chuadanga', bn: 'চুয়াডাঙ্গা', en: 'Chuadanga', division: 'খুলনা', lat: 23.6402, lng: 88.8418 },
  { id: 'jhenaidah', bn: 'ঝিনাইদহ', en: 'Jhenaidah', division: 'খুলনা', lat: 23.5448, lng: 89.1539 },
  { id: 'magura', bn: 'মাগুরা', en: 'Magura', division: 'খুলনা', lat: 23.4873, lng: 89.4198 },
  { id: 'meherpur', bn: 'মেহেরপুর', en: 'Meherpur', division: 'খুলনা', lat: 23.7622, lng: 88.6318 },
  { id: 'narail', bn: 'নড়াইল', en: 'Narail', division: 'খুলনা', lat: 23.1725, lng: 89.5127 },

  // বরিশাল বিভাগ
  { id: 'barishal', bn: 'বরিশাল', en: 'Barishal', division: 'বরিশাল', lat: 22.7010, lng: 90.3535 },
  { id: 'patuakhali', bn: 'পটুয়াখালী', en: 'Patuakhali', division: 'বরিশাল', lat: 22.3596, lng: 90.3299 },
  { id: 'bhola', bn: 'ভোলা', en: 'Bhola', division: 'বরিশাল', lat: 22.6859, lng: 90.6481 },
  { id: 'pirojpur', bn: 'পিরোজপুর', en: 'Pirojpur', division: 'বরিশাল', lat: 22.5841, lng: 89.9720 },
  { id: 'barguna', bn: 'বরগুনা', en: 'Barguna', division: 'বরিশাল', lat: 22.1570, lng: 90.1256 },
  { id: 'jhalokati', bn: 'ঝালকাঠি', en: 'Jhalokati', division: 'বরিশাল', lat: 22.6406, lng: 90.1987 },

  // সিলেট বিভাগ
  { id: 'sylhet', bn: 'সিলেট', en: 'Sylhet', division: 'সিলেট', lat: 24.8949, lng: 91.8687 },
  { id: 'moulvibazar', bn: 'মৌলভীবাজার', en: 'Moulvibazar', division: 'সিলেট', lat: 24.4829, lng: 91.7774 },
  { id: 'habiganj', bn: 'হবিগঞ্জ', en: 'Habiganj', division: 'সিলেট', lat: 24.3749, lng: 91.4155 },
  { id: 'sunamganj', bn: 'সুনামগঞ্জ', en: 'Sunamganj', division: 'সিলেট', lat: 25.0658, lng: 91.3950 },

  // রংপুর বিভাগ
  { id: 'rangpur', bn: 'রংপুর', en: 'Rangpur', division: 'রংপুর', lat: 25.7439, lng: 89.2752 },
  { id: 'dinajpur', bn: 'দিনাজপুর', en: 'Dinajpur', division: 'রংপুর', lat: 25.6217, lng: 88.6354 },
  { id: 'kurigram', bn: 'কুড়িগ্রাম', en: 'Kurigram', division: 'রংপুর', lat: 25.8054, lng: 89.6362 },
  { id: 'gaibandha', bn: 'গাইবান্ধা', en: 'Gaibandha', division: 'রংপুর', lat: 25.3288, lng: 89.5403 },
  { id: 'nilphamari', bn: 'নীলফামারী', en: 'Nilphamari', division: 'রংপুর', lat: 25.9318, lng: 88.8560 },
  { id: 'panchagarh', bn: 'পঞ্চগড়', en: 'Panchagarh', division: 'রংপুর', lat: 26.3411, lng: 88.5542 },
  { id: 'thakurgaon', bn: 'ঠাকুরগাঁও', en: 'Thakurgaon', division: 'রংপুর', lat: 26.0337, lng: 88.4617 },
  { id: 'lalmonirhat', bn: 'লালমনিরহাট', en: 'Lalmonirhat', division: 'রংপুর', lat: 25.9923, lng: 89.2847 },

  // ময়মনসিংহ বিভাগ
  { id: 'mymensingh', bn: 'ময়মনসিংহ', en: 'Mymensingh', division: 'ময়মনসিংহ', lat: 24.7471, lng: 90.4203 },
  { id: 'jamalpur', bn: 'জামালপুর', en: 'Jamalpur', division: 'ময়মনসিংহ', lat: 24.9375, lng: 89.9378 },
  { id: 'sherpur', bn: 'শেরপুর', en: 'Sherpur', division: 'ময়মনসিংহ', lat: 25.0205, lng: 90.0153 },
  { id: 'netrokona', bn: 'নেত্রকোণা', en: 'Netrokona', division: 'ময়মনসিংহ', lat: 24.8709, lng: 90.7279 },
];

const INTERNATIONAL_CITIES = [
  { id: 'makkah', bn: 'মক্কা মুকাররমা', en: 'Makkah', country: 'সৌদি আরব', lat: 21.4225, lng: 39.8262, timezone: 'Asia/Riyadh' },
  { id: 'madinah', bn: 'মদীনা মুনাওয়ারা', en: 'Madinah', country: 'সৌদি আরব', lat: 24.5247, lng: 39.5692, timezone: 'Asia/Riyadh' },
  { id: 'dubai', bn: 'দুবাই', en: 'Dubai', country: 'সংযুক্ত আরব আমিরাত', lat: 25.2048, lng: 55.2708, timezone: 'Asia/Dubai' },
  { id: 'riyadh', bn: 'রিয়াদ', en: 'Riyadh', country: 'সৌদি আরব', lat: 24.7136, lng: 46.6753, timezone: 'Asia/Riyadh' },
  { id: 'kualalumpur', bn: 'কুয়ালালামপুর', en: 'Kuala Lumpur', country: 'মালয়েশিয়া', lat: 3.1390, lng: 101.6869, timezone: 'Asia/Kuala_Lumpur' },
  { id: 'london', bn: 'লন্ডন', en: 'London', country: 'যুক্তরাজ্য', lat: 51.5074, lng: -0.1278, timezone: 'Europe/London' },
  { id: 'newyork', bn: 'নিউ ইয়র্ক', en: 'New York', country: 'যুক্তরাষ্ট্র', lat: 40.7128, lng: -74.0060, timezone: 'America/New_York' },
  { id: 'kolkata', bn: 'কলকাতা', en: 'Kolkata', country: 'ভারত', lat: 22.5726, lng: 88.3639, timezone: 'Asia/Kolkata' },
  { id: 'toronto', bn: 'টরন্টো', en: 'Toronto', country: 'কানাডা', lat: 43.6532, lng: -79.3832, timezone: 'America/Toronto' },
  { id: 'sydney', bn: 'সিডনি', en: 'Sydney', country: 'অস্ট্রেলিয়া', lat: -33.8688, lng: 151.2093, timezone: 'Australia/Sydney' },
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BANGLADESH_DISTRICTS, INTERNATIONAL_CITIES };
}
