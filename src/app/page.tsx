'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import EmojiPicker from 'emoji-picker-react'
import { DEFAULT_COUNTRY, FALLBACK_BUDGETS, FALLBACK_COUNTRIES, FALLBACK_VIBES } from '@/lib/travel-options'
import TourMe from '@/modules/TourMe'

/* ─── Types ──────────────────────────────────────────── */
interface VlogAuthor {
  id: string; handle: string; initials: string; avatarColor: string
  verified: boolean; followers?: number; vlogCount?: number
}
interface ItineraryDay {
  id: string; day: number; activity: string; cost?: number | null
  locked: boolean; highlights?: string | null; foodTips?: string | null
  gettingThere?: string | null; tips?: string | null
  clipDescription?: string | null
  mediaUrl?: string | null; mediaType?: 'image' | 'video' | string | null
  media?: MediaItem[] | null
}
interface Review {
  id: string; authorName: string; rating: number; text: string; createdAt: string
}
interface VlogCard {
  id: string; title: string; location: string; cost?: number | null
  currency: string; rating: number; views: number; likes: number
  credits: number; thumbnailColor: string; trending: boolean; author: VlogAuthor
  country?: string
  description?: string | null; youtubeUrl?: string | null; facebookUrl?: string | null
  tiktokUrl?: string | null; instagramUrl?: string | null; duration?: number | null; coverImage?: string | null
}
interface VlogDetail extends VlogCard {
  country: string; region: string; vibe: string; ratingCount: number
  itinerary: ItineraryDay[]; reviews: Review[]
}
interface UserProfile {
  id: string; handle: string; name: string; bio?: string | null; tagline?: string | null
  initials: string; avatarColor: string; country?: string | null; travelStyle?: string | null
  avatarImage?: string | null; coverImage?: string | null
  verified: boolean; followers: number; vlogCount: number; avgRating: number
  totalViews: number; credits: number; earnings: number
  youtubeUrl?: string | null; instagramUrl?: string | null; tiktokUrl?: string | null
}
interface MediaItem {
  url: string; type: 'image' | 'video'
}
interface ItineraryFormDay {
  day: number; activity: string; cost: string; locked: boolean
  mediaUrl?: string; mediaType?: 'image' | 'video' | null
  clipUrl?: string
  clipUrls?: string[]
  media?: MediaItem[]
  mediaCarouselIndex?: number
  highlights?: string; foodTips?: string; gettingThere?: string; tips?: string
  expanded?: boolean
}
interface SavedDraft {
  id: string; savedAt: number; title: string
  data: { videoUrl: string; altLinks: { fb: string; tt: string; ig: string }; postForm: typeof defaultPostForm; itinDays: ItineraryFormDay[]; postStep: number }
}
const defaultPostForm = { title: '', description: '', country: DEFAULT_COUNTRY, cities: '', vibe: '', credits: 2, coverImage: '', cost: '', duration: '' }
const CREDIT_PESO_RATE = 5
const RECOMMENDED_CREDIT_RATE = 0.01
const recommendedCreditsForCost = (cost: number) =>
  cost > 0 ? Math.ceil((cost * RECOMMENDED_CREDIT_RATE) / CREDIT_PESO_RATE) : 0
const clampNumber = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)
const defaultItinDays: ItineraryFormDay[] = [
  { day: 1, activity: '', cost: '', locked: false, expanded: false },
  { day: 2, activity: '', cost: '', locked: false, expanded: false },
  { day: 3, activity: '', cost: '', locked: true, expanded: false },
]
const SHORT_CLIP_MAX_SECONDS = 60
const stripTemporaryUploadUrls = <T extends { coverImage?: string }>(form: T) => ({
  ...form,
  coverImage: form.coverImage?.startsWith('blob:') ? '' : form.coverImage || '',
})

const stableImageLock = (value: string) =>
  value.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
const fallbackCoverImage = (title: string, location?: string | null, country?: string | null) =>
  `https://loremflickr.com/1200/800/${encodeURIComponent(location || title)},${encodeURIComponent(country || '')},travel/all?lock=${stableImageLock(title)}`
const coverForVlog = (v: { title: string; location?: string | null; country?: string | null; coverImage?: string | null }) =>
  v.coverImage || fallbackCoverImage(v.title, v.location, v.country)
const CITIES_BY_COUNTRY: Record<string, string[]> = {
  'Philippines': ['Manila', 'Cebu', 'Davao', 'Siargao', 'Palawan', 'Boracay', 'Baguio', 'Iloilo', 'Cagayan de Oro', 'Dumaguete', 'Coron', 'El Nido', 'Vigan', 'Bacolod', 'Zamboanga', 'Tacloban', 'Cabanatuan', 'Quezon City', 'Makati', 'Pasig'],
  'Japan': ['Tokyo', 'Kyoto', 'Osaka', 'Hiroshima', 'Nagoya', 'Yokohama', 'Kobe', 'Sapporo', 'Fukuoka', 'Nara', 'Kanazawa', 'Takayama', 'Kawagoe', 'Nikko', 'Hakone', 'Kamakura', 'Okinawa', 'Nagasaki', 'Matsumoto', 'Sendai'],
  'Vietnam': ['Ho Chi Minh City', 'Hanoi', 'Da Nang', 'Hoi An', 'Nha Trang', 'Sapa', 'Halong Bay', 'Can Tho', 'Hue', 'Phu Quoc', 'Ninh Binh', 'Quy Nhon', 'Dalat', 'Mekong Delta', 'Cat Ba Island'],
  'Thailand': ['Bangkok', 'Phuket', 'Chiang Mai', 'Pattaya', 'Krabi', 'Koh Samui', 'Koh Phi Phi', 'Ayutthaya', 'Chiang Rai', 'Hua Hin', 'Koh Tao', 'Koh Lanta', 'Sukhothai', 'Lampang', 'Nakhon Ratchasima'],
  'Indonesia': ['Jakarta', 'Bali', 'Yogyakarta', 'Bandung', 'Surabaya', 'Lombok', 'Flores', 'Sumatra', 'Borneo', 'Sulawesi', 'Ubud', 'Seminyak', 'Sanur', 'Kuta', 'Gili Islands', 'Komodo', 'Borobudur', 'Prambanan', 'Tanah Lot', 'Mount Bromo'],
  'USA': ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville', 'Fort Worth', 'Columbus', 'Charlotte', 'San Francisco', 'Miami', 'Seattle', 'Denver', 'Boston'],
  'Canada': ['Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Ottawa', 'Edmonton', 'Winnipeg', 'Quebec City', 'Hamilton', 'Kitchener', 'London', 'Victoria', 'Halifax', 'Saskatoon', 'Niagara Falls'],
  'Mexico': ['Mexico City', 'Guadalajara', 'Monterrey', 'Cancun', 'Playa del Carmen', 'Puerto Vallarta', 'Los Cabos', 'Mazatlan', 'Acapulco', 'Cozumel', 'Merida', 'Oaxaca', 'Guanajuato', 'San Miguel de Allende', 'Tulum'],
  'United Kingdom': ['London', 'Manchester', 'Birmingham', 'Leeds', 'Glasgow', 'Liverpool', 'Newcastle', 'Sheffield', 'Bristol', 'Edinburgh', 'Cardiff', 'Belfast', 'Oxford', 'Cambridge', 'Bath'],
  'France': ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier', 'Bordeaux', 'Lille', 'Cannes', 'Monaco', 'Versailles', 'Provence', 'Loire Valley'],
  'Germany': ['Berlin', 'Munich', 'Frankfurt', 'Cologne', 'Hamburg', 'Dresden', 'Düsseldorf', 'Dortmund', 'Essen', 'Leipzig', 'Nuremberg', 'Heidelberg', 'Rothenburg', 'Neuschwanstein', 'Black Forest'],
  'Spain': ['Madrid', 'Barcelona', 'Valencia', 'Seville', 'Bilbao', 'Malaga', 'Palma', 'Las Palmas', 'Alicante', 'Cordoba', 'Granada', 'Toledo', 'Salamanca', 'San Sebastian', 'Ibiza'],
  'Italy': ['Rome', 'Milan', 'Venice', 'Florence', 'Naples', 'Turin', 'Palermo', 'Genoa', 'Bologna', 'Verona', 'Pisa', 'Siena', 'Amalfi', 'Cinque Terre', 'Lake Como'],
  'Australia': ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Hobart', 'Canberra', 'Gold Coast', 'Sunshine Coast', 'Newcastle', 'Wollongong', 'Cairns', 'Darwin', 'Fremantle', 'Byron Bay'],
  'New Zealand': ['Auckland', 'Wellington', 'Christchurch', 'Hamilton', 'Tauranga', 'Dunedin', 'Palmerston North', 'Rotorua', 'Queenstown', 'Wanaka', 'Napier', 'Nelson', 'Gisborne', 'Invercargill', 'Greymouth'],
  'South Korea': ['Seoul', 'Busan', 'Incheon', 'Daegu', 'Daejeon', 'Gwangju', 'Ulsan', 'Gyeongju', 'Jeju', 'Gangneung', 'Suwon', 'Jeonju', 'Andong', 'Nami Island', 'Myeongdong'],
  'China': ['Beijing', 'Shanghai', 'Guangzhou', 'Shenzhen', 'Chengdu', 'Hangzhou', 'Wuhan', 'Xi\'an', 'Chongqing', 'Nanjing', 'Suzhou', 'Guilin', 'Zhangjiajie', 'Yangshuo', 'Harbin'],
  'India': ['Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Jaipur', 'Lucknow', 'Chandigarh', 'Agra', 'Varanasi', 'Goa', 'Kerala', 'Rajasthan'],
  'Malaysia': ['Kuala Lumpur', 'George Town', 'Ipoh', 'Johor Bahru', 'Kota Kinabalu', 'Kuching', 'Petaling Jaya', 'Shah Alam', 'Selangor', 'Penang', 'Langkawi', 'Malacca', 'Putrajaya', 'Klang', 'Subang Jaya'],
  'Singapore': ['Singapore', 'Marina Bay', 'Sentosa', 'Orchard', 'Changi', 'Jurong', 'Bukit Timah', 'East Coast', 'Geylang', 'Kallang'],
  'Brazil': ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Fortaleza', 'Belo Horizonte', 'Manaus', 'Curitiba', 'Recife', 'Porto Alegre', 'Iguazu Falls', 'Bahia', 'Amazon', 'Copacabana', 'Ipanema'],
  'Argentina': ['Buenos Aires', 'Córdoba', 'Rosario', 'Mendoza', 'La Plata', 'San Miguel de Tucumán', 'Mar del Plata', 'Salta', 'Bariloche', 'Ushuaia', 'Iguazu Falls', 'Patagonia', 'Tango District', 'La Boca', 'San Telmo'],
  'Peru': ['Lima', 'Cusco', 'Arequipa', 'Trujillo', 'Iquitos', 'Puno', 'Ayacucho', 'Huancayo', 'Tacna', 'Piura', 'Machu Picchu', 'Sacred Valley', 'Lake Titicaca', 'Amazon', 'Nazca Lines'],
  'Colombia': ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena', 'Santa Marta', 'Bogotá', 'Cúcuta', 'Bucaramanga', 'Manizales', 'Coffee Triangle', 'Tayrona', 'San Andrés', 'Providencia', 'Leticia'],
  'Chile': ['Santiago', 'Valparaíso', 'Viña del Mar', 'Concepción', 'La Serena', 'Temuco', 'Valdivia', 'Puerto Montt', 'Punta Arenas', 'Atacama', 'Patagonia', 'Easter Island', 'Atacama Desert', 'Lake District', 'Torres del Paine'],
  'Egypt': ['Cairo', 'Alexandria', 'Giza', 'Luxor', 'Aswan', 'Hurghada', 'Sharm El-Sheikh', 'Ismailia', 'Port Said', 'Suez', 'Nile Valley', 'Red Sea', 'Sinai', 'Oasis', 'Nile Delta'],
  'South Africa': ['Johannesburg', 'Cape Town', 'Durban', 'Pretoria', 'Port Elizabeth', 'Bloemfontein', 'Pietermaritzburg', 'East London', 'Polokwane', 'Nelspruit', 'Kruger National Park', 'Garden Route', 'Winelands', 'Drakensberg', 'Kruger'],
  'Kenya': ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Kericho', 'Nyeri', 'Muranga', 'Isiolo', 'Lamu', 'Masai Mara', 'Mount Kenya', 'Amboseli', 'Tsavo', 'Diani Beach'],
  'Turkey': ['Istanbul', 'Ankara', 'Izmir', 'Bursa', 'Antalya', 'Konya', 'Gaziantep', 'Adana', 'Diyarbakır', 'Mersin', 'Cappadocia', 'Ephesus', 'Troy', 'Pamukkale', 'Bodrum'],
  'Greece': ['Athens', 'Thessaloniki', 'Patras', 'Heraklion', 'Larissa', 'Volos', 'Rethymno', 'Chania', 'Rhodes', 'Mykonos', 'Santorini', 'Crete', 'Delphi', 'Meteora', 'Peloponnese'],
  'Portugal': ['Lisbon', 'Porto', 'Braga', 'Covilhã', 'Guarda', 'Castelo Branco', 'Évora', 'Faro', 'Funchal', 'Ponta Delgada', 'Algarve', 'Douro Valley', 'Sintra', 'Cascais', 'Madeira'],
  'Netherlands': ['Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht', 'Eindhoven', 'Groningen', 'Maastricht', 'Delft', 'Haarlem', 'Leiden', 'Windmills', 'Tulips', 'Canals', 'Volendam', 'Marken'],
  'Belgium': ['Brussels', 'Antwerp', 'Ghent', 'Bruges', 'Liège', 'Charleroi', 'Namur', 'Mons', 'Tournai', 'Ostend', 'Flanders', 'Wallonia', 'Ardennes', 'Spa', 'Waterloo'],
  'Switzerland': ['Zurich', 'Geneva', 'Basel', 'Bern', 'Lausanne', 'Lucerne', 'St. Gallen', 'Schaffhausen', 'Neuchâtel', 'Fribourg', 'Alps', 'Interlaken', 'Zermatt', 'Jungfrau', 'Matterhorn'],
  'Austria': ['Vienna', 'Salzburg', 'Innsbruck', 'Graz', 'Linz', 'Klagenfurt', 'Villach', 'Wels', 'St. Pölten', 'Dornbirn', 'Tyrol', 'Salzkammergut', 'Hallstatt', 'Danube Valley', 'Vorarlberg'],
  'Czech Republic': ['Prague', 'Brno', 'Ostrava', 'Plzeň', 'Liberec', 'Ústí nad Labem', 'Hradec Králové', 'Pardubice', 'Olomouc', 'Zlín', 'Bohemia', 'Moravia', 'Krkonoše', 'Český Krumlov', 'Kutná Hora'],
  'Poland': ['Warsaw', 'Kraków', 'Łódź', 'Wrocław', 'Poznań', 'Gdańsk', 'Szczecin', 'Bydgoszcz', 'Lublin', 'Katowice', 'Tatra Mountains', 'Baltic Coast', 'Auschwitz', 'Malbork Castle', 'Białowieża'],
  'Hungary': ['Budapest', 'Debrecen', 'Szeged', 'Miskolc', 'Pécs', 'Győr', 'Nyíregyháza', 'Kecskemét', 'Szolnok', 'Szekszárd', 'Lake Balaton', 'Danube Bend', 'Thermal Baths', 'Eger', 'Tokaj'],
  'Romania': ['Bucharest', 'Cluj-Napoca', 'Timișoara', 'Iași', 'Constanța', 'Craiova', 'Brașov', 'Galați', 'Ploiești', 'Oradea', 'Carpathians', 'Transylvania', 'Black Sea', 'Danube Delta', 'Bran Castle'],
  'Bulgaria': ['Sofia', 'Plovdiv', 'Varna', 'Burgas', 'Ruse', 'Stara Zagora', 'Pleven', 'Sliven', 'Dobrich', 'Shumen', 'Black Sea Coast', 'Pirin Mountains', 'Rila Monastery', 'Bansko', 'Sozopol'],
  'Croatia': ['Zagreb', 'Split', 'Rijeka', 'Osijek', 'Zadar', 'Pula', 'Dubrovnik', 'Rovinj', 'Hvar', 'Korčula', 'Dalmatian Coast', 'Adriatic Sea', 'Plitvice Lakes', 'Istria', 'Dalmatia'],
  'Serbia': ['Belgrade', 'Novi Sad', 'Niš', 'Kragujevac', 'Subotica', 'Čačak', 'Jagodina', 'Vranje', 'Smederevo', 'Zemun', 'Danube', 'Danube Gorge', 'Kopaonik', 'Tara', 'Fruška Gora'],
  'Ukraine': ['Kyiv', 'Kharkiv', 'Odesa', 'Dnipro', 'Donetsk', 'Zaporizhzhia', 'Lviv', 'Mykolaiv', 'Mariupol', 'Luhansk', 'Carpathians', 'Black Sea', 'Dnieper River', 'Crimea', 'Carpathian Mountains'],
  'Russia': ['Moscow', 'St. Petersburg', 'Novosibirsk', 'Yekaterinburg', 'Nizhny Novgorod', 'Kazan', 'Chelyabinsk', 'Omsk', 'Samara', 'Rostov-on-Don', 'Siberia', 'Ural Mountains', 'Lake Baikal', 'Kamchatka', 'Caucasus'],
  'Israel': ['Tel Aviv', 'Jerusalem', 'Haifa', 'Beersheba', 'Netanya', 'Ashdod', 'Ashkelon', 'Ramat Gan', 'Petah Tikva', 'Holon', 'Dead Sea', 'Red Sea', 'Galilee', 'Negev', 'West Bank'],
  'Saudi Arabia': ['Riyadh', 'Jeddah', 'Mecca', 'Medina', 'Dammam', 'Khobar', 'Abha', 'Tabuk', 'Hail', 'Jizan', 'Red Sea', 'Arabian Desert', 'Asir Mountains', 'Empty Quarter', 'Rub\' al Khali'],
  'United Arab Emirates': ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Umm Al Quwain', 'Ras Al Khaimah', 'Fujairah', 'Al Ain', 'Ras Al Khaimah', 'Mushrif', 'Arabian Gulf', 'Desert', 'Palm Islands', 'Burj Khalifa', 'Sheikh Zayed Grand Mosque'],
  'Qatar': ['Doha', 'Al Rayyan', 'Al Wakrah', 'Umm Salal', 'Al Khor', 'Al Shamal', 'Dukhan', 'Al Shahaniya', 'Lusail', 'Madinat ash Shamal', 'Persian Gulf', 'Corniche', 'Museum of Islamic Art', 'Souq Waqif', 'The Pearl'],
  'Oman': ['Muscat', 'Salalah', 'Sohar', 'Nizwa', 'Sur', 'Ibri', 'Rustaq', 'Bahla', 'Haima', 'Duqm', 'Arabian Sea', 'Musandam Peninsula', 'Wadi Darbat', 'Jebel Akhdar', 'Wahiba Sands'],
  'Lebanon': ['Beirut', 'Tripoli', 'Sidon', 'Tyre', 'Baalbek', 'Byblos', 'Jounieh', 'Zahle', 'Broumana', 'Aley', 'Cedar Mountains', 'Mediterranean', 'Cedars of God', 'Bekaa Valley', 'Mount Lebanon'],
  'Jordan': ['Amman', 'Zarqa', 'Irbid', 'Aqaba', 'Jerash', 'Madaba', 'Karak', 'Ajloun', 'Petra', 'Dead Sea', 'Wadi Rum', 'Jordan River', 'Red Sea', 'Negev', 'Amman Citadel'],
  'Pakistan': ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Hyderabad', 'Peshawar', 'Quetta', 'Sialkot', 'Himalayas', 'Karakoram', 'Indus Valley', 'Hunza Valley', 'K2'],
  'Bangladesh': ['Dhaka', 'Chittagong', 'Khulna', 'Rajshahi', 'Sylhet', 'Barisal', 'Rangpur', 'Mymensingh', 'Narayanganj', 'Gazipur', 'Sundarbans', 'Cox\'s Bazar', 'Sylhet Tea Gardens', 'Ganges Delta', 'Bay of Bengal'],
  'Sri Lanka': ['Colombo', 'Kandy', 'Galle', 'Anuradhapura', 'Polonnaruwa', 'Jaffna', 'Trincomalee', 'Batticaloa', 'Matara', 'Negombo', 'Central Highlands', 'South Coast', 'Tea Plantations', 'Adam\'s Peak', 'Sigiriya'],
  'Myanmar': ['Yangon', 'Mandalay', 'Naypyidaw', 'Bagan', 'Taunggyi', 'Mawlamyine', 'Sittwe', 'Myitkyina', 'Lashio', 'Kyaikto', 'Irrawaddy River', 'Shan State', 'Inle Lake', 'Bagan Temples', 'Shwedagon Pagoda'],
  'Cambodia': ['Phnom Penh', 'Siem Reap', 'Battambang', 'Sihanoukville', 'Kampong Thom', 'Kratie', 'Mondulkiri', 'Ratanakiri', 'Kep', 'Kampot', 'Angkor Wat', 'Tonlé Sap', 'Mekong River', 'Cardamom Mountains', 'Koh Rong'],
  'Laos': ['Vientiane', 'Luang Prabang', 'Savannakhet', 'Pakse', 'Vang Vieng', 'Luang Namtha', 'Oudomxay', 'Thakhek', 'Khone Phapeng', 'Attapeu', 'Mekong River', 'Bolaven Plateau', 'Luang Prabang', 'Vang Vieng', 'Si Phan Don'],
  'Taiwan': ['Taipei', 'Kaohsiung', 'Taichung', 'Tainan', 'Keelung', 'Hsinchu', 'Chiayi', 'Yunlin', 'Changhua', 'Nantou', 'Alishan', 'Sun Moon Lake', 'Jiufen', 'Taroko Gorge', 'Kenting'],
  'Hong Kong': ['Hong Kong', 'Kowloon', 'New Territories', 'Victoria Peak', 'Central', 'Causeway Bay', 'Mong Kok', 'Tsim Sha Tsui', 'Stanley', 'Lantau Island', 'Victoria Harbour', 'Star Ferry', 'Peak Tram', 'Disneyland', 'Tian Tan Buddha'],
  'Macau': ['Macau', 'Taipa', 'Coloane', 'Outer Harbour', 'Inner Harbour', 'Zhuhai', 'Cotai Strip', 'Ruins of St. Paul\'s', 'A-Ma Temple', 'Mandarin\'s House'],
  'Iceland': ['Reykjavik', 'Akureyri', 'Hafnarfjörður', 'Kópavogur', 'Hveragerði', 'Borgarnes', 'Stykkishólmur', 'Ísafjörður', 'Egilsstaðir', 'Höfn', 'Golden Circle', 'Blue Lagoon', 'Geysers', 'Waterfalls', 'Glaciers'],
  'Norway': ['Oslo', 'Bergen', 'Trondheim', 'Stavanger', 'Kristiansand', 'Tromsø', 'Lillehammer', 'Ålesund', 'Bodø', 'Narvik', 'Fjords', 'Northern Lights', 'Lofoten Islands', 'Geirangerfjord', 'Sognefjord'],
  'Sweden': ['Stockholm', 'Gothenburg', 'Malmö', 'Uppsala', 'Västerås', 'Örebro', 'Linköping', 'Helsingborg', 'Jönköping', 'Norrköping', 'Stockholm Archipelago', 'Swedish Lapland', 'Vasa Museum', 'Drottningholm Palace', 'Visby'],
  'Finland': ['Helsinki', 'Espoo', 'Tampere', 'Vantaa', 'Turku', 'Oulu', 'Kuopio', 'Jyväskylä', 'Lahti', 'Pori', 'Lapland', 'Northern Lights', 'Thousand Lakes', 'Sauna Culture', 'Icehotel'],
  'Denmark': ['Copenhagen', 'Aarhus', 'Odense', 'Aalborg', 'Esbjerg', 'Randers', 'Kolding', 'Horsens', 'Silkeborg', 'Svendborg', 'Tivoli Gardens', 'Legoland', 'Kronborg Castle', 'Faroe Islands', 'Greenland'],
  'Ireland': ['Dublin', 'Cork', 'Galway', 'Limerick', 'Waterford', 'Drogheda', 'Dundalk', 'Athlone', 'Sligo', 'Derry', 'Cliffs of Moher', 'Ring of Kerry', 'Giant\'s Causeway', 'Connemara', 'Aran Islands'],
  'Scotland': ['Edinburgh', 'Glasgow', 'Aberdeen', 'Dundee', 'Inverness', 'Stirling', 'Perth', 'Ayr', 'Dumfries', 'Oban', 'Highlands', 'Loch Ness', 'Isle of Skye', 'Hebrides', 'Cairngorms'],
  'Wales': ['Cardiff', 'Swansea', 'Newport', 'Wrexham', 'Bangor', 'St Davids', 'Caernarfon', 'Conwy', 'Llandudno', 'Brecon', 'Snowdonia', 'Pembrokeshire Coast', 'Brecon Beacons', 'Gower Peninsula', 'Snowdon'],
  'Northern Ireland': ['Belfast', 'Derry', 'Lisburn', 'Armagh', 'Newry', 'Bangor', 'Carrickfergus', 'Ballymena', 'Coleraine', 'Dungannon', 'Giant\'s Causeway', 'Mourne Mountains', 'Lough Neagh', 'Carrick-a-Rede', 'Dark Hedges'],
  'Other': []
}

export default function Home() {
  /* ─── Navigation ─── */
  const [page, setPage] = useState('browse')
  const [prev, setPrev] = useState('browse')

  /* ─── Browse filters ─── */
  const [search, setSearch] = useState('')
  const [selectedVibes, setSelectedVibes] = useState<string[]>([])
  const [selectedCountries, setSelectedCountries] = useState<string[]>([])
  const [budget, setBudget] = useState('')
  const [accessFilter, setAccessFilter] = useState<'all' | 'unlock' | 'free'>('all')
  const [activeFilterTab, setActiveFilterTab] = useState<'vibe' | 'country' | 'budget'>('vibe')
  const [searchFallback, setSearchFallback] = useState(false)
  const [countryOptions, setCountryOptions] = useState(FALLBACK_COUNTRIES)
  const [vibeOptions, setVibeOptions] = useState(FALLBACK_VIBES)
  const [budgetOptions, setBudgetOptions] = useState(FALLBACK_BUDGETS)
  const [filtersOpen, setFiltersOpen] = useState(true)
  const [activeFeedId, setActiveFeedId] = useState<string | null>(null)
  const feedRefs = useRef<Record<string, HTMLDivElement | null>>({})

  /* ─── Data ─── */
  const [vlogs, setVlogs] = useState<VlogCard[]>([])
  const [myVlogs, setMyVlogs] = useState<VlogCard[]>([])
  const [vlog, setVlog] = useState<VlogDetail | null>(null)
  const [vlogLoading, setVlogLoading] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)

  /* ─── Detail UI ─── */
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [unlocked, setUnlocked] = useState(false)
  const [reviewText, setReviewText] = useState('')
  const [followStates, setFollowStates] = useState<Record<string, boolean>>({})

  /* ─── Post form ─── */
  const [postStep, setPostStep] = useState(1)
  const [videoUrl, setVideoUrl] = useState('')
  const [videoDetected, setVideoDetected] = useState('')
  const [showAltLinks, setShowAltLinks] = useState(false)
  const [altLinks, setAltLinks] = useState({ fb: '', tt: '', ig: '' })
  const [postForm, setPostForm] = useState({ ...defaultPostForm })
  const [itinDays, setItinDays] = useState<ItineraryFormDay[]>(defaultItinDays.map(d => ({ ...d })))
  const [publishing, setPublishing] = useState(false)
  const [publishError, setPublishError] = useState('')
  const [coverUploading, setCoverUploading] = useState(false)
  const [dayUploading, setDayUploading] = useState<Record<number, boolean>>({})
  const [aiAutoFilling, setAiAutoFilling] = useState(false)
  const [aiAutoFillError, setAiAutoFillError] = useState('')
  const [postView, setPostView] = useState<'form' | 'drafts'>('form')
  const [vibeInput, setVibeInput] = useState('')
  const [vibeFocused, setVibeFocused] = useState(false)
  const [cityInput, setCityInput] = useState('')
  const [cityFocused, setCityFocused] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState<Record<string, boolean>>({})
  const [emojiPickerField, setEmojiPickerField] = useState<string | null>(null)
  const [emojiPickerPosition, setEmojiPickerPosition] = useState<{ left: number; top: number } | null>(null)
  const [mediaModal, setMediaModal] = useState<{ title: string; items: MediaItem[]; index: number } | null>(null)
  const [creditsReviewed, setCreditsReviewed] = useState(false)
  const textareaRefs = useRef<Record<string, HTMLTextAreaElement | null>>({})
  const [drafts, setDrafts] = useState<SavedDraft[]>(() => {
    try { return JSON.parse(localStorage.getItem('tourista_drafts') || '[]') } catch { return [] }
  })
  const [pinnedVlogIds, setPinnedVlogIds] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem('tourista_pinned') || '[]')) } catch { return new Set() }
  })

  /* ─── Profile form ─── */
  const [pForm, setPForm] = useState({
    name: '', tagline: '', bio: '', country: DEFAULT_COUNTRY,
    travelStyle: 'Budget', youtubeUrl: '', instagramUrl: '', tiktokUrl: '',
    avatarImage: '', coverImage: '',
  })

  /* ─── Notifications ─── */
  const [nCnt, setNCnt] = useState(4)
  const [readN, setReadN] = useState<Set<string>>(new Set())

  /* ─── Dashboard split-view ─── */
  const [selectedMyVlogId, setSelectedMyVlogId] = useState<string | null>(null)
  const [dashboardMode, setDashboardMode] = useState<'list' | 'details' | 'post'>('list')
  const [editingVlogId, setEditingVlogId] = useState<string | null>(null)
  const [autoplayVlogId, setAutoplayVlogId] = useState<string | null>(null)
  const [tourMeOpen, setTourMeOpen] = useState(false)

  /* ─── Refs for file inputs ─── */
  const coverRef = useRef<HTMLInputElement>(null)
  const avatarRef = useRef<HTMLInputElement>(null)

  /* ══════════════════════════════════════════
     API helpers
  ══════════════════════════════════════════ */
  const fetchVlogs = useCallback(async () => {
    const p = new URLSearchParams()
    if (search) p.set('search', search)
    if (selectedVibes.length) p.set('vibe', selectedVibes.join(','))
    if (selectedCountries.length) p.set('country', selectedCountries.join(','))
    if (budget) p.set('budget', budget)
    if (accessFilter !== 'all') p.set('access', accessFilter)
    try {
      const r = await fetch(`/api/vlogs?${p}`)
      const d = await r.json()
      if (Array.isArray(d)) setVlogs(d)
      setSearchFallback(Boolean(search) && r.headers.get('x-search-fallback') === 'true')
    } catch { /* ignore */ }
  }, [search, selectedVibes, selectedCountries, budget, accessFilter])

  const fetchMyVlogs = useCallback(async () => {
    try {
      const r = await fetch('/api/vlogs?mine=true')
      const d = await r.json()
      if (Array.isArray(d)) setMyVlogs(d)
    } catch { /* ignore */ }
  }, [])

  const fetchProfile = useCallback(async () => {
    try {
      const r = await fetch('/api/profile')
      if (!r.ok) return
      const d: UserProfile = await r.json()
      setProfile(d)
      setPForm({
        name: d.name || '', tagline: d.tagline || '', bio: d.bio || '',
        country: d.country || DEFAULT_COUNTRY, travelStyle: d.travelStyle || 'Budget',
        youtubeUrl: d.youtubeUrl || '', instagramUrl: d.instagramUrl || '', tiktokUrl: d.tiktokUrl || '',
        avatarImage: d.avatarImage || '', coverImage: d.coverImage || '',
      })
    } catch { /* ignore */ }
  }, [])

  const fetchTravelOptions = useCallback(async () => {
    try {
      const r = await fetch('/api/travel-options')
      if (!r.ok) return
      const d: { countries?: string[]; vibes?: string[]; budgets?: string[] } = await r.json()
      if (Array.isArray(d.countries) && d.countries.length) setCountryOptions(d.countries)
      if (Array.isArray(d.vibes) && d.vibes.length) setVibeOptions(d.vibes)
      if (Array.isArray(d.budgets) && d.budgets.length) setBudgetOptions(d.budgets)
    } catch { /* keep fallback options */ }
  }, [])

  useEffect(() => { fetchVlogs() }, [fetchVlogs])
  useEffect(() => { fetchMyVlogs() }, [fetchMyVlogs])
  useEffect(() => { fetchProfile() }, [fetchProfile])
  useEffect(() => { fetchTravelOptions() }, [fetchTravelOptions])
  useEffect(() => {
    if (!activeFeedId) return
    if (!vlogs.some(v => v.id === activeFeedId)) {
      setActiveFeedId(null)
      setVlog(null)
    }
  }, [activeFeedId, vlogs])

  /* ══════════════════════════════════════════
     Navigation
  ══════════════════════════════════════════ */
  const closeVlogPanels = () => {
    setActiveFeedId(null)
    setSelectedMyVlogId(null)
    setDashboardMode('list')
    setEditingVlogId(null)
    setVlog(null)
    setUnlocked(false)
    setReviewText('')
  }
  const go = (p: string) => {
    setPrev(page)
    if (p === 'browse' || p === 'dashboard') closeVlogPanels()
    setPage(p)
  }
  const submitSearch = () => {
    closeVlogPanels()
    if (page !== 'browse') {
      setPrev(page)
      setPage('browse')
    }
  }
  const toggleVibeFilter = (value: string) => {
    setSelectedVibes(current =>
      current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value],
    )
  }
  const toggleCountryFilter = (value: string) => {
    setSelectedCountries(current =>
      current.includes(value)
        ? current.filter(c => c !== value)
        : [...current, value],
    )
  }

  const openD = async (from: string, vlogId?: string) => {
    setPrev(from); setPage('detail'); setUnlocked(false); setReviewText('')
    if (!vlogId) return
    setVlogLoading(true)
    try {
      const r = await fetch(`/api/vlogs/${vlogId}`)
      const d: VlogDetail = await r.json()
      setVlog(d); setLikeCount(d.likes); setLiked(false)
    } finally { setVlogLoading(false) }
  }

  const selectBrowseVlog = async (vlogId: string) => {
    setPage('browse')
    setActiveFeedId(vlogId)
    setVlog(null)
    setUnlocked(false)
    setReviewText('')
    setVlogLoading(true)
    feedRefs.current[vlogId]?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' })
    try {
      const r = await fetch(`/api/vlogs/${vlogId}`)
      const d: VlogDetail = await r.json()
      setVlog(d)
      setLikeCount(d.likes)
      setLiked(false)
    } finally {
      setVlogLoading(false)
    }
  }

  /* ══════════════════════════════════════════
     Video embed
  ══════════════════════════════════════════ */
  const getEmbedUrl = (url: string) => {
    const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&\s?]+)/)
    if (yt) return `https://www.youtube.com/embed/${yt[1]}?controls=1&rel=0`
    const ytShort = url.match(/youtube\.com\/shorts\/([^&\s?]+)/)
    if (ytShort) return `https://www.youtube.com/embed/${ytShort[1]}?controls=1&rel=0`
    const ytSearch = url.match(/youtube\.com\/results\?search_query=([^&]+)/)
    if (ytSearch) return `https://www.youtube.com/embed?listType=search&list=${ytSearch[1]}&controls=1&rel=0`
    return null
  }
  const withAutoplay = (url: string, muted = true) =>
    `${url}${url.includes('?') ? '&' : '?'}autoplay=1&mute=${muted ? '1' : '0'}&playsinline=1`
  const getFeedEmbedUrl = (v: VlogCard) => {
    const base = v.youtubeUrl ? getEmbedUrl(v.youtubeUrl) : null
    return base ? withAutoplay(base, true) : null
  }
  const getVlogEmbedUrl = (url?: string | null) => {
    if (!url) return null
    const base = getEmbedUrl(url)
    return base ? withAutoplay(base, false) : null
  }
  const directVideoUrl = (url: string) =>
    url.startsWith('blob:') ||
    url.startsWith('/api/uploads/') ||
    /\.(mp4|webm|ogg)(\?|#|$)/i.test(url)
  const clipPreviewUrl = (url: string) => {
    const embed = getEmbedUrl(url)
    return embed ? withAutoplay(embed) : null
  }

  const detectVideo = (url: string) => {
    setVideoUrl(url)
    if (!url) { setVideoDetected(''); return }
    if (url.includes('youtube') || url.includes('youtu.be')) setVideoDetected('YouTube link detected ✓')
    else if (url.includes('facebook') || url.includes('fb.com')) setVideoDetected('Facebook link detected ✓')
    else if (url.includes('tiktok')) setVideoDetected('TikTok link detected ✓')
    else if (url.includes('instagram')) setVideoDetected('Instagram link detected ✓')
    else setVideoDetected('')
  }

  const handleAIAutoFill = async () => {
    if (!videoUrl.trim()) {
      setAiAutoFillError('Please enter a YouTube URL first')
      return
    }

    if (!videoUrl.includes('youtube') && !videoUrl.includes('youtu.be')) {
      setAiAutoFillError('AI auto-fill currently only supports YouTube videos')
      return
    }

    setAiAutoFilling(true)
    setAiAutoFillError('')
    setPublishError('')

    try {
      const response = await fetch('/api/vlogs/auto-fill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ youtubeUrl: videoUrl })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to auto-fill')
      }

      const result = await response.json()
      const data = result.data

      // Populate form fields
      setPostForm(f => ({
        ...f,
        title: data.title || f.title,
        description: data.description || f.description,
        country: data.country || f.country,
        cities: data.cities || f.cities,
        vibe: data.vibe || f.vibe,
        coverImage: data.coverImage || f.coverImage,
        cost: data.cost || data.estimatedCost || f.cost,
        duration: data.duration ? String(data.duration) : f.duration,
      }))

      // Populate itinerary if provided
      if (data.itinerary && data.itinerary.length > 0) {
        const generatedTotalCost = data.itinerary.reduce((sum: number, day: any) => {
          const cleaned = String(day.cost || '').replace(/[^\d]/g, '')
          return sum + (parseInt(cleaned) || 0)
        }, 0)
        const newItinDays = data.itinerary.map((day: any, idx: number) => ({
          day: day.day || idx + 1,
          activity: day.activity || '',
          cost: day.cost || '',
          locked: idx >= 2, // Keep the first two AI-generated days open as the free preview.
          media: Array.isArray(day.media) ? day.media : [],
          mediaCarouselIndex: 0,
          highlights: day.highlights || '',
          foodTips: day.foodTips || '',
          gettingThere: day.gettingThere || '',
          tips: day.tips || '',
          expanded: true
        }))
        // Keep existing days if more than AI-generated
        const finalDays = newItinDays.length >= itinDays.length
          ? newItinDays
          : [...newItinDays, ...itinDays.slice(newItinDays.length)]
        setItinDays(finalDays)
        setPostForm(f => ({
          ...f,
          credits: generatedTotalCost > 0 ? recommendedCreditsForCost(generatedTotalCost) : f.credits,
        }))
      }

      // Show success message
      setVideoDetected('✨ AI auto-filled! Review and adjust as needed.')

    } catch (error: any) {
      setAiAutoFillError(error.message || 'Failed to auto-fill. Please try again.')
    } finally {
      setAiAutoFilling(false)
    }
  }

  /* ══════════════════════════════════════════
     Detail interactions
  ══════════════════════════════════════════ */
  const tLike = async () => {
    if (!vlog) return
    const next = !liked; setLiked(next); setLikeCount(c => next ? c + 1 : c - 1)
    await fetch(`/api/vlogs/${vlog.id}/like`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ liked: next }),
    })
  }

  const doUnlock = async () => {
    if (!vlog) return
    await fetch(`/api/vlogs/${vlog.id}/unlock`, { method: 'POST' })
    setUnlocked(true)
  }

  const submitReview = async () => {
    if (!vlog || !reviewText.trim()) return
    const r = await fetch(`/api/vlogs/${vlog.id}/reviews`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authorName: profile?.name || 'You', rating: 5, text: reviewText }),
    })
    const nr: Review = await r.json()
    setVlog(v => v ? { ...v, reviews: [nr, ...v.reviews] } : v)
    setReviewText('')
  }

  const tFollow = (id: string) => setFollowStates(p => ({ ...p, [id]: !p[id] }))

  /* ══════════════════════════════════════════
     Post vlog
  ══════════════════════════════════════════ */
  const nextStep = () => {
    setPublishError('')
    if (aiAutoFilling) {
      setPublishError('Please wait for AI to finish generating the vlog fields.')
      return
    }
    if (postStep === 1) {
      if (!videoUrl.trim()) { setPublishError('Please add a video link (YouTube, Facebook, TikTok, or Instagram).'); return }
      if (!postForm.title.trim()) { setPublishError('Please add a vlog title.'); return }
    }
    if (postStep === 2) {
      const hasDay = itinDays.some(d =>
        d.activity.trim() || clipUrlsForDay(d).some(url => url.trim()) || d.highlights?.trim() || d.foodTips?.trim() || d.gettingThere?.trim() || d.tips?.trim()
      )
      if (!hasDay) { setPublishError('Please fill in at least one itinerary day.'); return }
      setPostForm(f => ({ ...f, credits: calculateCreditsFromCost() }))
    }
    if (postStep === 3) {
      if (!creditsReviewed) {
        setPublishError('Please review and confirm the credits before publishing.')
        return
      }
      // Check that at least one day is unlocked (free)
      const hasFreeDays = itinDays.some(d => !d.locked && (d.activity.trim() || clipUrlsForDay(d).some(url => url.trim()) || d.highlights?.trim() || d.foodTips?.trim() || d.gettingThere?.trim() || d.tips?.trim()))
      if (!hasFreeDays) {
        setPublishError('Please unlock at least one itinerary day so tourists can preview your content.')
        return
      }
      publishVlog()
      return
    }
    setPostStep(s => s + 1)
  }
  const prevStepFn = () => {
    setPublishError('')
    setCreditsReviewed(false)
    if (postStep === 1) { go(editingVlogId ? 'dashboard' : 'browse'); return }
    setPostStep(s => s - 1)
  }

  const addDay = () => {
    const n = itinDays.length + 1
    setItinDays(d => [...d, { day: n, activity: '', cost: '', locked: n > 2, expanded: false }])
  }

  const updDay = (i: number, k: keyof ItineraryFormDay, v: string | boolean | null) =>
    setItinDays(d => d.map((x, j) => j === i ? { ...x, [k]: v } : x))

  const clipUrlsForDay = (day: Pick<ItineraryFormDay, 'clipUrl' | 'clipUrls'>) => {
    const urls = day.clipUrls?.length ? day.clipUrls : (day.clipUrl ? [day.clipUrl] : [''])
    return urls.length ? urls : ['']
  }

  const updateDayClipUrl = (dayIndex: number, clipIndex: number, value: string) => {
    setItinDays(days => days.map((day, index) => {
      if (index !== dayIndex) return day
      const clipUrls = clipUrlsForDay(day)
      clipUrls[clipIndex] = value
      return { ...day, clipUrl: clipUrls[0] || '', clipUrls }
    }))
  }

  const addDayClipUrl = (dayIndex: number) => {
    setItinDays(days => days.map((day, index) => {
      if (index !== dayIndex) return day
      const clipUrls = clipUrlsForDay(day)
      return { ...day, clipUrls: [...clipUrls, ''] }
    }))
  }

  const removeDayClipUrl = (dayIndex: number, clipIndex: number) => {
    setItinDays(days => days.map((day, index) => {
      if (index !== dayIndex) return day
      const next = clipUrlsForDay(day).filter((_, itemIndex) => itemIndex !== clipIndex)
      const clipUrls = next.length ? next : ['']
      return { ...day, clipUrl: clipUrls[0] || '', clipUrls }
    }))
  }

  const isShortClipLink = (url: string) => {
    const value = url.trim().toLowerCase()
    if (!value) return true
    return (
      value.includes('youtube.com/shorts/') ||
      value.includes('youtu.be/shorts/') ||
      value.includes('tiktok.com/') ||
      value.includes('instagram.com/reel/') ||
      value.includes('instagram.com/reels/') ||
      value.includes('facebook.com/reel/') ||
      value.includes('fb.watch/')
    )
  }

  const validateShortClipLink = (i: number) => {
    const invalidClipUrl = clipUrlsForDay(itinDays[i] || { clipUrl: '', clipUrls: [] })
      .map(url => url.trim())
      .find(url => url && !isShortClipLink(url))
    if (!invalidClipUrl) return true
    window.alert('Please use a short-form clip link that is 1 minute or less, such as YouTube Shorts, TikTok, Instagram Reels, or Facebook Reels. Longer clips will not be processed.')
    return false
  }

  const getVideoDuration = (file: File) =>
    new Promise<number>((resolve, reject) => {
      const video = document.createElement('video')
      const url = URL.createObjectURL(file)
      video.preload = 'metadata'
      video.onloadedmetadata = () => {
        const duration = video.duration
        URL.revokeObjectURL(url)
        resolve(duration)
      }
      video.onerror = () => {
        URL.revokeObjectURL(url)
        reject(new Error('Could not read video duration.'))
      }
      video.src = url
    })

  const positionEmojiPicker = useCallback((fieldId: string) => {
    const button = document.querySelector(`[data-emoji-field="${fieldId}"]`)
    if (!(button instanceof HTMLElement)) return

    const rect = button.getBoundingClientRect()
    setEmojiPickerPosition({
      left: Math.max(8, Math.min(rect.left, window.innerWidth - 244)),
      top: Math.max(8, Math.min(rect.bottom + 6, window.innerHeight - 250)),
    })
  }, [])

  const toggleEmojiPicker = (fieldId: string, event: any) => {
    const isOpen = emojiPickerField === fieldId
    setEmojiPickerField(isOpen ? null : fieldId)
    setShowEmojiPicker(p => ({ ...p, [fieldId]: !isOpen }))

    if (isOpen) {
      setEmojiPickerPosition(null)
      return
    }

    const rect = event.currentTarget.getBoundingClientRect()
    setEmojiPickerPosition({
      left: Math.max(8, Math.min(rect.left, window.innerWidth - 244)),
      top: Math.max(8, Math.min(rect.bottom + 6, window.innerHeight - 250)),
    })
  }

  useEffect(() => {
    if (!emojiPickerField) return

    const closeOrReposition = (event: Event) => {
      const target = event.target as Node | null
      if (target && (target as Element).closest?.('.emoji-popover, [data-emoji-field]')) return
      setEmojiPickerField(null)
      setEmojiPickerPosition(null)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setEmojiPickerField(null)
        setEmojiPickerPosition(null)
      }
    }
    const onMove = () => positionEmojiPicker(emojiPickerField)

    document.addEventListener('mousedown', closeOrReposition)
    document.addEventListener('keydown', onKeyDown)
    window.addEventListener('scroll', onMove, true)
    window.addEventListener('resize', onMove)

    return () => {
      document.removeEventListener('mousedown', closeOrReposition)
      document.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('scroll', onMove, true)
      window.removeEventListener('resize', onMove)
    }
  }, [emojiPickerField, positionEmojiPicker])

  const handleEmojiSelect = (fieldId: string, emoji: string) => {
    const textarea = textareaRefs.current[fieldId]
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = textarea.value
    const newText = text.substring(0, start) + emoji + text.substring(end)

    // Update the field based on fieldId pattern
    const match = fieldId.match(/^day-(\d+)-(.+)$/)
    if (match) {
      const dayIndex = parseInt(match[1])
      const fieldName = match[2] as keyof ItineraryFormDay
      updDay(dayIndex, fieldName, newText)
    }

    // Close emoji picker
    setShowEmojiPicker(p => ({ ...p, [fieldId]: false }))
    setEmojiPickerField(null)
    setEmojiPickerPosition(null)

    // Restore cursor position
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + emoji.length, start + emoji.length)
    }, 0)
  }

  const handleDayMedia = async (i: number, file: File) => {
    const isVideo = file.type.startsWith('video/')
    if (isVideo) {
      try {
        const duration = await getVideoDuration(file)
        if (duration > SHORT_CLIP_MAX_SECONDS) {
          window.alert('Each itinerary video clip should be 1 minute or less. This clip is longer than 1 minute and will not be processed.')
          return
        }
      } catch {
        window.alert('We could not verify this video length. Please upload a clip that is 1 minute or less.')
        return
      }
    }
    const localUrl = URL.createObjectURL(file)
    const mediaType = isVideo ? 'video' : 'image'

    // Add to media array at the beginning (latest first)
    setItinDays(d => d.map((x, j) => j === i ? {
      ...x,
      media: [{ url: localUrl, type: mediaType }, ...(x.media || [])],
      mediaCarouselIndex: 0
    } : x))

    setDayUploading(p => ({ ...p, [i]: true }))
    try {
      const url = await handleUpload(file)
      // Update with actual URL
      setItinDays(d => d.map((x, j) => j === i ? {
        ...x,
        media: (x.media || []).map(m => m.url === localUrl ? { ...m, url } : m)
      } : x))
      URL.revokeObjectURL(localUrl)
    } catch (e) {
      // Remove from media array on error
      setItinDays(d => d.map((x, j) => j === i ? {
        ...x,
        media: (x.media || []).filter(m => m.url !== localUrl)
      } : x))
      URL.revokeObjectURL(localUrl)
      setPublishError(e instanceof Error ? e.message : 'Media upload failed. Please try again.')
    } finally {
      setDayUploading(p => ({ ...p, [i]: false }))
    }
  }

  const mediaForDay = (day: ItineraryDay | ItineraryFormDay): MediaItem[] => {
    let storedMedia: MediaItem[] = []
    if ('clipDescription' in day && day.clipDescription) {
      try {
        const parsed = JSON.parse(day.clipDescription)
        if (Array.isArray(parsed?.media)) {
          storedMedia = parsed.media.filter((item: MediaItem) => Boolean(item.url))
        }
      } catch { /* ignore legacy free text */ }
    }
    const formMedia = 'media' in day && Array.isArray(day.media)
      ? day.media.filter(item => Boolean(item.url))
      : []
    const clipMedia = 'clipUrls' in day
      ? clipUrlsForDay(day).filter(Boolean).map(url => ({ url, type: 'video' as const }))
      : ('clipUrl' in day && day.clipUrl ? [{ url: day.clipUrl, type: 'video' as const }] : [])
    if (storedMedia.length || formMedia.length || clipMedia.length) {
      const seen = new Set<string>()
      return [...clipMedia, ...storedMedia, ...formMedia].filter(item => {
        if (seen.has(item.url)) return false
        seen.add(item.url)
        return true
      })
    }
    if ('mediaUrl' in day && day.mediaUrl) {
      return [{ url: day.mediaUrl, type: day.mediaType === 'video' ? 'video' : 'image' }]
    }
    return []
  }

  const openMediaModal = (title: string, items: MediaItem[], index = 0) => {
    if (!items.length) return
    setMediaModal({ title, items, index: Math.min(Math.max(index, 0), items.length - 1) })
  }

  const renderMediaPreview = (item: MediaItem, title: string) => {
    if (item.type !== 'video') return <img src={item.url} alt={title} />
    const previewUrl = clipPreviewUrl(item.url)
    if (previewUrl) {
      return <iframe src={previewUrl} title={title} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
    }
    if (directVideoUrl(item.url)) {
      return <video src={item.url} muted autoPlay loop playsInline />
    }
    return (
      <div className="clip-link-preview">
        <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        <span>Preview link</span>
      </div>
    )
  }

  const shiftMediaModal = (delta: number) => {
    setMediaModal(current => {
      if (!current) return current
      return {
        ...current,
        index: (current.index + delta + current.items.length) % current.items.length,
      }
    })
  }

  const removeDayMedia = (dayIndex: number, mediaIndex: number) => {
    setItinDays(days => days.map((day, index) => index === dayIndex ? {
      ...day,
      media: (day.media || []).filter((_, itemIndex) => itemIndex !== mediaIndex),
      mediaCarouselIndex: 0,
    } : day))
  }

  const removeDayMediaItem = (dayIndex: number, item: MediaItem, mediaIndex: number) => {
    const clipUrls = clipUrlsForDay(itinDays[dayIndex] || { clipUrl: '', clipUrls: [] })
    const clipIndex = clipUrls.findIndex(url => url === item.url)
    if (clipIndex >= 0) {
      removeDayClipUrl(dayIndex, clipIndex)
      return
    }
    removeDayMedia(dayIndex, mediaIndex - clipUrls.filter(Boolean).length)
  }

  const beginEditVlog = (detail: VlogDetail) => {
    const stripCountry = (location: string) => {
      const suffix = `, ${detail.country}`
      return location.toLowerCase().endsWith(suffix.toLowerCase())
        ? location.slice(0, -suffix.length)
        : location
    }

    setEditingVlogId(detail.id)
    setPostForm({
      title: detail.title || '',
      description: detail.description || '',
      country: detail.country || DEFAULT_COUNTRY,
      cities: stripCountry(detail.location || ''),
      vibe: detail.vibe || '',
      credits: detail.credits || 0,
      coverImage: detail.coverImage || '',
      cost: detail.cost ? String(detail.cost) : '',
      duration: detail.duration ? String(detail.duration) : '',
    })
    setVideoUrl(detail.youtubeUrl || detail.facebookUrl || detail.tiktokUrl || detail.instagramUrl || '')
    setVideoDetected('')
    setAltLinks({
      fb: detail.facebookUrl || '',
      tt: detail.tiktokUrl || '',
      ig: detail.instagramUrl || '',
    })
    setItinDays(detail.itinerary.length ? detail.itinerary.map(day => ({
      day: day.day,
      activity: day.activity || '',
      cost: day.cost ? String(day.cost) : '',
      locked: day.locked,
      media: mediaForDay(day),
      mediaUrl: day.mediaUrl || undefined,
      mediaType: day.mediaType === 'video' ? 'video' : day.mediaUrl ? 'image' : null,
      clipUrl: day.mediaType === 'video' ? day.mediaUrl || '' : '',
      clipUrls: mediaForDay(day).filter(item => item.type === 'video').map(item => item.url),
      highlights: day.highlights || '',
      foodTips: day.foodTips || '',
      gettingThere: day.gettingThere || '',
      tips: day.tips || '',
      expanded: true,
    })) : defaultItinDays.map(day => ({ ...day })))
    setPostStep(1)
    setPostView('form')
    setPublishError('')
    setCreditsReviewed(false)
    setVibeInput('')
    setVibeFocused(false)
    go('post')
  }

  const publishVlog = async () => {
    setPublishing(true); setPublishError('')
    try {
      const isYt = videoUrl.includes('youtube') || videoUrl.includes('youtu.be')
      const isFb = videoUrl.includes('facebook') || videoUrl.includes('fb.com')
      const isTt = videoUrl.includes('tiktok')
      const isIg = videoUrl.includes('instagram')
      const filledDays = itinDays.filter(d =>
        d.activity.trim() || clipUrlsForDay(d).some(url => url.trim()) || d.highlights?.trim() || d.foodTips?.trim() || d.gettingThere?.trim() || d.tips?.trim()
      )
      const invalidClip = filledDays.find(day => clipUrlsForDay(day).some(url => url.trim() && !isShortClipLink(url)))
      if (invalidClip) {
        setPublishError(`Day ${invalidClip.day} has a clip link that is not recognized as a short-form video. Use a YouTube Shorts, TikTok, Instagram Reels, or Facebook Reels link that is 1 minute or less.`)
        return
      }
      if (coverUploading || Object.values(dayUploading).some(Boolean)) {
        setPublishError('Please wait for uploads to finish before publishing.')
        return
      }
      if (postForm.coverImage?.startsWith('blob:')) {
        setPublishError('Cover photo is still uploading or failed. Please re-upload it before publishing.')
        return
      }
      const r = await fetch(editingVlogId ? `/api/vlogs/${editingVlogId}` : '/api/vlogs', {
        method: editingVlogId ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...postForm,
          credits: Math.max(0, Number(postForm.credits) || 0),
          youtubeUrl: isYt ? videoUrl : (altLinks.fb.includes('youtube') || altLinks.fb.includes('youtu.be') ? altLinks.fb : null),
          facebookUrl: isFb ? videoUrl : (altLinks.fb.includes('facebook') || altLinks.fb.includes('fb.com') ? altLinks.fb : null),
          tiktokUrl: isTt ? videoUrl : (altLinks.tt || null),
          instagramUrl: isIg ? videoUrl : (altLinks.ig || null),
          itinerary: filledDays.map(day => {
            const clipUrls = clipUrlsForDay(day).map(url => url.trim()).filter(Boolean)
            const uploadedMedia = day.media?.filter(m => !m.url.startsWith('blob:')) || []
            const media = [
              ...clipUrls.map(url => ({ url, type: 'video' as const })),
              ...uploadedMedia,
            ]
            const firstMedia = media[0]
            return {
              ...day,
              clipUrl: clipUrls[0] || '',
              clipUrls,
              mediaUrl: firstMedia?.url || day.mediaUrl || null,
              mediaType: firstMedia?.type || day.mediaType || null,
              media,
            }
          }),
        }),
      })
      if (!r.ok) { const e = await r.json().catch(() => ({})); setPublishError(e.error || `Failed to ${editingVlogId ? 'save changes' : 'publish'}. Please try again.`); return }
      const created: VlogCard = await r.json()
      setSelectedMyVlogId(created.id)
      setDashboardMode('details')
      setAutoplayVlogId(created.id)
      setVlog(null)
      setVlogLoading(true)
      setMyVlogs(current => [created, ...current.filter(v => v.id !== created.id)])
      fetchVlogs()
      fetchMyVlogs()
      setPrev(page)
      setPage('dashboard')
      try {
        const detailRes = await fetch(`/api/vlogs/${created.id}`)
        if (detailRes.ok) {
          const detail: VlogDetail = await detailRes.json()
          setVlog(detail)
          setLikeCount(detail.likes)
          setLiked(false)
          setUnlocked(false)
          setReviewText('')
        }
      } finally {
        setVlogLoading(false)
      }
      setPostForm({ ...defaultPostForm })
      setVideoUrl(''); setVideoDetected(''); setAltLinks({ fb:'', tt:'', ig:'' }); setPostStep(1)
      setVibeInput(''); setVibeFocused(false)
      setItinDays(defaultItinDays.map(d => ({ ...d })))
      setEditingVlogId(null)
    } catch (e) {
      setPublishError(e instanceof Error ? `Network error: ${e.message}` : 'Network error. Please try again.')
    } finally { setPublishing(false) }
  }

  const saveDraft = () => {
    try {
      const existing: SavedDraft[] = JSON.parse(localStorage.getItem('tourista_drafts') || '[]')
      const draftPostForm = stripTemporaryUploadUrls(postForm)
      const draftDays = itinDays.map(day => ({
        ...day,
        media: day.media?.filter(item => !item.url.startsWith('blob:')) || [],
      }))
      const newDraft: SavedDraft = {
        id: Date.now().toString(36),
        savedAt: Date.now(),
        title: draftPostForm.title.trim() || 'Untitled draft',
        data: { videoUrl, altLinks, postForm: draftPostForm, itinDays: draftDays, postStep },
      }
      const updated = [newDraft, ...existing].slice(0, 10)
      localStorage.setItem('tourista_drafts', JSON.stringify(updated))
      setDrafts(updated)
      setPostView('drafts')
    } catch { /* storage unavailable */ }
  }

  const loadDraftById = (id: string) => {
    try {
      const draft = drafts.find(d => d.id === id)
      if (!draft?.data) return
      const d = draft.data
      setVideoUrl(d.videoUrl || '')
      setAltLinks(d.altLinks || { fb: '', tt: '', ig: '' })
      setPostForm({ ...defaultPostForm, ...stripTemporaryUploadUrls(d.postForm || { ...defaultPostForm }) })
      setItinDays(Array.isArray(d.itinDays) && d.itinDays.length
        ? d.itinDays.map((day, index) => ({
          ...defaultItinDays[index],
          ...day,
          day: Number(day.day) || index + 1,
          cost: String(day.cost || ''),
          media: day.media?.filter(item => item.url && !item.url.startsWith('blob:')) || [],
          expanded: Boolean(day.expanded),
        }))
        : defaultItinDays.map(x => ({ ...x })))
      setPostStep(clampNumber(Number(d.postStep) || 1, 1, 3))
      setEditingVlogId(null)
      setCreditsReviewed(false)
      setPublishError('')
      setPostView('form')
    } catch {
      setPublishError('This draft could not be loaded. It may be from an older version of Tourista.')
    }
  }

  const deleteDraft = (id: string) => {
    try {
      const updated = drafts.filter(d => d.id !== id)
      localStorage.setItem('tourista_drafts', JSON.stringify(updated))
      setDrafts(updated)
    } catch { /* ignore */ }
  }

  const togglePin = (vlogId: string) => {
    setPinnedVlogIds(prev => {
      const next = new Set(prev)
      if (next.has(vlogId)) next.delete(vlogId); else next.add(vlogId)
      try { localStorage.setItem('tourista_pinned', JSON.stringify([...next])) } catch { /* ignore */ }
      return next
    })
  }

  const fmtDraftAge = (savedAt: number) => {
    const diff = Date.now() - savedAt
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  /* ══════════════════════════════════════════
     Profile edit
  ══════════════════════════════════════════ */
  const saveProfile = async () => {
    const response = await fetch('/api/profile', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pForm),
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      window.alert(error.error || 'Failed to save profile. Please try again.')
      return
    }
    await fetchProfile(); go('dashboard')
  }

  const handleUpload = async (file: File) => {
    if (file.size > 25 * 1024 * 1024) throw new Error('File is too large. Please upload a file under 25MB.')
    const fd = new FormData(); fd.append('file', file)
    const r = await fetch('/api/upload', { method: 'POST', body: fd })
    if (!r.ok) {
      const e = await r.json().catch(() => ({}))
      throw new Error(e.error || 'Upload failed')
    }
    return (await r.json()).url as string
  }

  const handleCoverUpload = async (file: File) => {
    const localUrl = URL.createObjectURL(file)
    setPostForm(p => ({ ...p, coverImage: localUrl }))
    setCoverUploading(true)
    try {
      const url = await handleUpload(file)
      setPostForm(p => ({ ...p, coverImage: url }))
      setTimeout(() => URL.revokeObjectURL(localUrl), 5000)
    } catch (e) {
      setPostForm(p => ({ ...p, coverImage: '' }))
      URL.revokeObjectURL(localUrl)
      setPublishError(e instanceof Error ? e.message : 'Cover photo upload failed. Please try again.')
    } finally {
      setCoverUploading(false)
    }
  }

  const handleProfileImageUpload = async (file: File, field: 'avatarImage' | 'coverImage') => {
    const localUrl = URL.createObjectURL(file)
    setPForm(p => ({ ...p, [field]: localUrl }))
    try {
      const url = await handleUpload(file)
      setPForm(p => ({ ...p, [field]: url }))
      setTimeout(() => URL.revokeObjectURL(localUrl), 5000)
    } catch (e) {
      setPForm(p => ({ ...p, [field]: profile?.[field] || '' }))
      URL.revokeObjectURL(localUrl)
      window.alert(e instanceof Error ? e.message : 'Profile image upload failed. Please try again.')
    }
  }

  /* ══════════════════════════════════════════
     Notifications
  ══════════════════════════════════════════ */
  const rdN = (id: string) => {
    if (readN.has(id)) return
    setReadN(s => new Set([...s, id])); setNCnt(n => Math.max(0, n - 1))
  }
  const clrAll = () => { setReadN(new Set(['n1','n2','n3','n4'])); setNCnt(0) }

  /* ══════════════════════════════════════════
     Helpers
  ══════════════════════════════════════════ */
  const fmtCost = (cost?: number | null, cur?: string) => {
    if (!cost) return ''
    return cur === 'JPY' ? `¥${cost.toLocaleString()}` : `₱${cost.toLocaleString()}`
  }
  const activeFilters = [
    ...selectedVibes,
    ...selectedCountries,
    budget,
    accessFilter === 'free' ? 'Free only' : accessFilter === 'unlock' ? 'Unlock only' : '',
  ].filter(Boolean)
  const embedUrl = getVlogEmbedUrl(vlog?.youtubeUrl)
  const relatedCreatorVlogs = vlog
    ? vlogs.filter(v => v.author.id === vlog.author.id && v.id !== vlog.id).slice(0, 3)
    : []
  const countryFilters = countryOptions.filter(c => c !== 'All countries' && c !== 'All regions')
  const budgetFilters = budgetOptions.filter(b => b !== 'Any budget' && b !== 'Free vlogs only')
  const updCr = (v: number) => {
    setPostForm(f => ({ ...f, credits: v }))
  }

  const calculateCreditsFromCost = () => {
    // Sum all day costs
    const totalDayCost = itinDays.reduce((sum, day) => {
      if (!day.cost.trim()) return sum
      const cleaned = day.cost.replace(/[₱$,\s]/g, '')
      const num = parseInt(cleaned) || 0
      return sum + num
    }, 0)

    return recommendedCreditsForCost(totalDayCost)
  }

  /* ══════════════════════════════════════════
     Step indicator helper
  ══════════════════════════════════════════ */
  const stepDot = (n: number) => {
    if (n < postStep) return 'sd dn'
    if (n === postStep) return 'sd ac'
    return 'sd'
  }
  const stepLbl = (n: number) => n === postStep ? 'sl2 ac' : 'sl2'
  const stepLine = (n: number) => n < postStep ? 'sln dn' : 'sln'
  const activeModalItem = mediaModal ? mediaModal.items[mediaModal.index] : null

  /* ══════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════ */
  return (
    <>
      <h2 className="sr-only">Tourista — travel vlog portal</h2>

      {/* ── NEW TOP NAVIGATION BAR ───────────────────────────────── */}
      <div className="topnav">
        <div className="topnav-inner">
          {/* Logo */}
          <div className="tn-logo" onClick={() => go('browse')}>
            <svg width="24" height="28" viewBox="0 0 80 90" fill="none">
              <path d="M40 8C24 8 14 20 14 34c0 18 26 46 26 46S66 52 66 34C66 20 56 8 40 8z" fill="#5dba7a" stroke="#2A7A50" strokeWidth="2.5"/>
              <polygon points="40,18 50,25 50,39 40,46 30,39 30,25" fill="rgba(255,255,255,.2)" stroke="#2A7A50" strokeWidth="1.2"/>
              <path d="M40 18v28M30 25h20M30 39h20" stroke="#2A7A50" strokeWidth="1" opacity=".4"/>
              <path d="M52 11Q64 4 61 16Q56 18 51 16Z" fill="#4aaa62" stroke="#2A7A50" strokeWidth="1.8"/>
              <circle cx="59" cy="10" r="2" fill="#2A7A50"/>
            </svg>
            <div className="tn-logo-t">Tourista</div>
          </div>

          {/* Search Bar */}
          <div className="tn-search">
            <div className="tn-search-icon">
              <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </div>
            <input
              type="text"
              placeholder="Search destinations, vloggers..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') submitSearch()
              }}
            />
            {search && (
              <button type="button" className="tn-search-clear" onClick={() => { setSearch(''); setSearchFallback(false) }} aria-label="Clear search">
                <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="tn-actions">
            <button className="tn-btn" onClick={() => go('notif')} aria-label="Notifications">
              <svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              <span className="tn-btn-label">Notifications</span>
              {nCnt > 0 && <span className="tn-dot"/>}
            </button>
            <button className="tn-btn" onClick={() => go('dashboard')} aria-label="Dashboard">
              <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>
              <span className="tn-btn-label">Dashboard</span>
            </button>
            <button className="tn-btn tn-tour" onClick={() => setTourMeOpen(true)} aria-label="Tour me">
              <svg viewBox="0 0 24 24"><path d="M9 18l-6 3V6l6-3 6 3 6-3v15l-6 3-6-3z"/><path d="M9 3v15M15 6v15"/></svg>
              <span className="tn-btn-label">Tour me</span>
            </button>
            <button className="tn-btn tn-post" onClick={() => {
              setPostForm({ ...defaultPostForm })
              setVideoUrl(''); setVideoDetected(''); setAltLinks({ fb:'', tt:'', ig:'' })
              setItinDays(defaultItinDays.map(d => ({ ...d }))); setPostStep(1); setPublishError('')
              setVibeInput(''); setVibeFocused(false)
              setPostView('form')
              setEditingVlogId(null)
              go('post')
            }}>
              <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              <span className="tn-btn-label">Post vlog</span>
            </button>
          </div>
        </div>
      </div>

      {/* Old navigation hidden - using new topnav instead */}

      <TourMe
        open={tourMeOpen}
        onClose={() => setTourMeOpen(false)}
        vlogs={vlogs}
        profileInitials={profile?.initials || 'ME'}
      />
      {/* ── FILTER BAR ───────────────────────────────── */}
      {page === 'browse' && (
        <div className="filterbar">
          <div className="filterbar-inner">
            <div className="fb-tabs">
              <button className={`fb-tab${activeFilterTab === 'vibe' ? ' on' : ''}`} onClick={() => setActiveFilterTab('vibe')}>
                Vibe {selectedVibes.length > 0 && <span className="fb-tab-count">{selectedVibes.length}</span>}
              </button>
              <button className={`fb-tab${activeFilterTab === 'country' ? ' on' : ''}`} onClick={() => setActiveFilterTab('country')}>
                Country {selectedCountries.length > 0 && <span className="fb-tab-count">{selectedCountries.length}</span>}
              </button>
              <button className={`fb-tab${activeFilterTab === 'budget' ? ' on' : ''}`} onClick={() => setActiveFilterTab('budget')}>
                Budget {budget && <span className="fb-tab-count">{budget}</span>}
              </button>
            </div>
            <div className="access-filter" aria-label="Unlock filter">
              {[
                { value: 'all', label: 'All vlogs' },
                { value: 'unlock', label: 'Unlock only' },
                { value: 'free', label: 'Free only' },
              ].map(option => (
                <button
                  key={option.value}
                  type="button"
                  className={`access-filter-btn${accessFilter === option.value ? ' on' : ''}`}
                  onClick={() => setAccessFilter(option.value as typeof accessFilter)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Filter chips - show only for active tab */}
          <div className="filterbar-chips-wrapper">
            <button className="fb-arrow fb-arrow-left" aria-label="Scroll left">
              <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <div className="fb-chips">
              {activeFilterTab === 'vibe' && (
                <>
                  {vibeOptions.map(v => (
                    <span key={v} className={`fb-chip${selectedVibes.includes(v) ? ' on' : ''}`} onClick={() => toggleVibeFilter(v)}>
                      <span className="fb-chip-img" style={{backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%232A7A50" width="100" height="100"/></svg>')`}}/>
                      {v}
                    </span>
                  ))}
                </>
              )}
              {activeFilterTab === 'country' && (
                <>
                  {countryFilters.map(c => (
                    <span key={c} className={`fb-chip${selectedCountries.includes(c) ? ' on' : ''}`} onClick={() => toggleCountryFilter(c)}>
                      <span className="fb-chip-img" style={{backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="%230876A8"/></svg>')`}}/>
                      {c}
                    </span>
                  ))}
                </>
              )}
              {activeFilterTab === 'budget' && (
                <>
                  {budgetFilters.map(b => (
                    <span key={b} className={`fb-chip${budget === b ? ' on' : ''}`} onClick={() => setBudget(budget === b ? '' : b)}>
                      <span className="fb-chip-img" style={{backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23D08A0A" width="100" height="100"/></svg>')`}}/>
                      {b}
                    </span>
                  ))}
                </>
              )}
            </div>
            <button className="fb-arrow fb-arrow-right" aria-label="Scroll right">
              <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          BROWSE - GOOGLE IMAGES STYLE
      ══════════════════════════════════════ */}
      {page === 'browse' && (
        <div className="tn-page">
          <div className={`gi-layout${vlog && activeFeedId ? ' with-panel' : ''}`}>
            {/* Vlog Grid */}
            {searchFallback && search && (
              <div className="search-fallback-note">
                No exact matches for <strong>{search}</strong>. You may like these vlogs.
              </div>
            )}
            {vlogs.length === 0 ? (
              <div className="vl-empty">No vlogs found — try adjusting your filters.</div>
            ) : (
              <div className="gi-grid">
                {vlogs.map(v => {
                  const isActive = activeFeedId === v.id
                  const feedEmbed = isActive ? getFeedEmbedUrl(v) : null
                  const coverImage = coverForVlog(v)
                  return (
                    <div
                      key={v.id}
                      className={`gi-card${isActive ? ' on' : ''}`}
                      data-vlog-id={v.id}
                      ref={node => { feedRefs.current[v.id] = node }}
                      onClick={() => selectBrowseVlog(v.id)}
                    >
                      <div className={`gi-thumb ${v.thumbnailColor}`}>
                        {coverImage ? (
                          <img src={coverImage} alt={v.title}/>
                        ) : feedEmbed ? (
                          <iframe src={feedEmbed} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen title={v.title}/>
                        ) : (
                          <>
                            <div className="gi-thumb-play">
                              <div className="gi-thumb-play-btn">
                                <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                              </div>
                            </div>
                          </>
                        )}
                        {v.credits > 0 && <div className="gi-cred-badge">✦ {v.credits}</div>}
                      </div>
                      <div className="gi-title">{v.title}</div>
                      <div className="gi-info">
                        <div className={`gi-info-avatar av ${v.author.avatarColor}`}>{v.author.initials}</div>
                        <div className="gi-info-handle">{v.author.handle}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Detail Panel (right side on desktop, bottom sheet on mobile) */}
            {vlog && activeFeedId && vlog.id === activeFeedId && (
              <div key={vlog.id} className="gi-panel">
                <div className="gi-panel-header">
                  <div className="gi-panel-source">
                    <div className={`gi-panel-source-icon av ${vlog.author.avatarColor}`}>{vlog.author.initials}</div>
                    <div className="gi-panel-handle">{vlog.author.handle}</div>
                  </div>
                  <div className="gi-panel-nav">
                    <button className="gi-panel-navbtn" title="Previous">
                      <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
                    </button>
                    <button className="gi-panel-navbtn" title="Next">
                      <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
                    </button>
                  </div>
                  <button className="gi-panel-close" onClick={() => setActiveFeedId(null)}>×</button>
                </div>
                <div className="gi-panel-body">
                  {/* Media */}
                  <div className={`gi-panel-media${coverForVlog(vlog) ? '' : ' ' + vlog.thumbnailColor}`}>
                    {embedUrl ? (
                      <iframe src={embedUrl} width="100%" height="100%" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen title={vlog.title}/>
                    ) : (
                      <img src={coverForVlog(vlog)} alt={vlog.title}/>
                    )}
                    <button className="gi-panel-zoom" title="Expand">
                      <svg viewBox="0 0 24 24"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
                    </button>
                  </div>

                  <div className="won" style={{ marginTop:0, marginBottom:'14px' }}>
                    <span>Watch on:</span>
                    {vlog.youtubeUrl ? (
                      <a href={vlog.youtubeUrl} target="_blank" rel="noopener noreferrer" className="pp">
                        <span className="pdot" style={{ background:'#f00' }}/> YouTube â†—
                      </a>
                    ) : null}
                    {vlog.facebookUrl ? (
                      <a href={vlog.facebookUrl} target="_blank" rel="noopener noreferrer" className="pp">
                        <span className="pdot" style={{ background:'#1877f2' }}/> Facebook â†—
                      </a>
                    ) : null}
                    {vlog.tiktokUrl ? (
                      <a href={vlog.tiktokUrl} target="_blank" rel="noopener noreferrer" className="pp">
                        <span className="pdot" style={{ background:'#111' }}/> TikTok â†—
                      </a>
                    ) : null}
                    {vlog.instagramUrl ? (
                      <a href={vlog.instagramUrl} target="_blank" rel="noopener noreferrer" className="pp">
                        <span className="pdot" style={{ background:'#e1306c' }}/> Instagram â†—
                      </a>
                    ) : null}
                  </div>

                  {/* Title & Meta */}
                  <div className="gi-panel-title">{vlog.title}</div>
                  <div className="gi-panel-meta">
                    <span>📍 {vlog.location}</span>
                    {vlog.cost && <span>💰 {fmtCost(vlog.cost, vlog.currency)}</span>}
                    <span>⭐ {vlog.rating}</span>
                    {vlog.duration && <span>📅 {vlog.duration} days</span>}
                  </div>

                  {/* Description */}
                  {vlog.description && <div className="gi-panel-copy">{vlog.description}</div>}

                  {/* Actions */}
                  <div className="gi-panel-actions">
                    <button className="gi-panel-btn gi-panel-btn-primary" onClick={tLike}>
                      <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                      {likeCount}
                    </button>
                    <button className="gi-panel-btn gi-panel-btn-secondary">
                      <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                      {vlog.reviews.length}
                    </button>
                  </div>

                  {/* Unlock Box */}
                  {vlog.credits > 0 && !unlocked && (
                    <div style={{ padding:'12px', background:'var(--yl)', borderRadius:'10px', marginBottom:'14px' }}>
                      <div style={{ fontSize:'13px', fontWeight:600, color:'var(--y1)', marginBottom:'6px' }}>Unlock itinerary</div>
                      <div style={{ fontSize:'12px', color:'var(--y1)', marginBottom:'8px', opacity:0.8 }}>{vlog.credits} credits · ₱{vlog.credits * CREDIT_PESO_RATE}</div>
                      <button className="gi-panel-btn gi-panel-btn-primary" onClick={doUnlock} style={{ background:'var(--y)', color:'var(--y1)', fontSize:'12px', padding:'8px' }}>
                        Unlock
                      </button>
                    </div>
                  )}

                  {/* Itinerary with Short Clips */}
                  {vlog.itinerary.length > 0 && (() => {
                    // Collect all video clips from unlocked days
                    const allClips = vlog.itinerary
                      .filter(day => !day.locked || unlocked)
                      .flatMap(day => {
                        const dayMedia = mediaForDay(day)
                        return dayMedia
                          .filter(item => item.type === 'video')
                          .map(item => ({ ...item, dayNumber: day.day, activity: day.activity }))
                      })

                    return (
                      <>
                        <div className="gi-panel-section-title">Day-by-day itinerary</div>
                        <div className="itinerary-with-clips">
                          {/* Left side: Itinerary */}
                          <div className="itinerary-list">
                            {vlog.itinerary.map(day => (
                              <div key={day.id} className="gi-itinerary-card" style={{ opacity: day.locked && !unlocked ? 0.55 : 1 }}>
                                <div className="gi-itinerary-head">
                                  <div className="gi-itinerary-day" style={{ color: day.locked && !unlocked ? 'var(--color-text-secondary)' : 'var(--g)' }}>
                                    Day {day.day}
                                  </div>
                                  <div className="gi-itinerary-activity">{day.activity}</div>
                                </div>
                                {(day.cost && (!day.locked || unlocked)) && (
                                  <div style={{ fontSize:'11px', color:'var(--color-text-secondary)', marginBottom:'6px' }}>💰 ₱{day.cost.toLocaleString()}</div>
                                )}
                                {day.locked && !unlocked ? (
                                  <div style={{ fontSize:'11px', color:'var(--color-text-secondary)', display:'flex', alignItems:'center', gap:'4px' }}>
                                    <svg viewBox="0 0 24 24" width="12" height="12" style={{ stroke:'currentColor', fill:'none', strokeWidth:2 }}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                                    Unlock to see the full day plan
                                  </div>
                                ) : (
                                  <>
                                    {day.highlights && <div style={{ fontSize:'11px', color:'var(--color-text-secondary)', marginBottom:'4px' }}>✨ {day.highlights}</div>}
                                    {day.foodTips && <div style={{ fontSize:'11px', color:'var(--color-text-secondary)', marginBottom:'4px' }}>🍜 {day.foodTips}</div>}
                                  </>
                                )}
                              </div>
                            ))}
                          </div>

                          {/* Right side: Autoplaying Short Clips */}
                          {allClips.length > 0 && (
                            <div className="clips-sidebar">
                              <div className="clips-sidebar-header">
                                <svg viewBox="0 0 24 24" width="16" height="16" style={{ stroke:'currentColor', fill:'none', strokeWidth:2 }}>
                                  <polygon points="5 3 19 12 5 21 5 3"/>
                                </svg>
                                <span>Short clips ({allClips.length})</span>
                              </div>
                              <div className="clips-feed">
                                {allClips.map((clip, index) => {
                                  const previewUrl = clipPreviewUrl(clip.url)
                                  return (
                                    <div key={`${clip.url}-${index}`} className="clip-item">
                                      <div className="clip-video">
                                        {previewUrl ? (
                                          <iframe
                                            src={previewUrl}
                                            title={`Day ${clip.dayNumber} clip`}
                                            allow="autoplay; encrypted-media; picture-in-picture"
                                            allowFullScreen
                                          />
                                        ) : directVideoUrl(clip.url) ? (
                                          <video src={clip.url} muted autoPlay loop playsInline />
                                        ) : (
                                          <div className="clip-link-preview">
                                            <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                                            <span>View clip</span>
                                          </div>
                                        )}
                                      </div>
                                      <div className="clip-info">
                                        <div className="clip-day">Day {clip.dayNumber}</div>
                                        <div className="clip-activity">{clip.activity}</div>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    )
                  })()}

                  {/* More from creator */}
                  {relatedCreatorVlogs.length > 0 && (
                    <div className="gi-panel-more">
                      <div className="gi-panel-more-lbl">More from {vlog.author.handle}</div>
                      <div className="gi-panel-more-grid">
                        {relatedCreatorVlogs.map(v => (
                          <div key={v.id} className="gi-panel-more-card" onClick={() => selectBrowseVlog(v.id)}>
                            <div className={`gi-thumb ${v.thumbnailColor}`} style={{ backgroundImage: `url('${coverForVlog(v)}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}/>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          DETAIL
      ══════════════════════════════════════ */}
      {page === 'detail' && (
        <div className="page on">
          <div className="w">
            <div className="bk" onClick={() => go(prev)}>
              <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
              Back to {prev === 'profile' ? 'Profile' : prev === 'dashboard' ? 'Dashboard' : 'Explore'}
            </div>

            {vlogLoading ? (
              <div className="loading">
                <span className="loading-dot"/><span className="loading-dot"/><span className="loading-dot"/>
              </div>
            ) : vlog ? (
              <>
                {/* Video */}
                <div className="vbox">
                  <div className={`vpl ${vlog.coverImage ? '' : vlog.thumbnailColor}`}>
                    {embedUrl ? (
                      <iframe src={embedUrl} width="100%" height="100%" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen title={vlog.title}/>
                    ) : vlog.coverImage ? (
                      <img src={vlog.coverImage} alt={vlog.title}/>
                    ) : (
                      <>
                        <div className="vbadge">Preview</div>
                        <div className="vpbig"><svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg></div>
                      </>
                    )}
                  </div>
                  <div className="won">
                    <span>Watch on:</span>
                    {vlog.youtubeUrl ? (
                      <a href={vlog.youtubeUrl} target="_blank" rel="noopener noreferrer" className="pp">
                        <span className="pdot" style={{ background:'#f00' }}/> YouTube ↗
                      </a>
                    ) : <div className="pp"><span className="pdot" style={{ background:'#f00' }}/> YouTube ↗</div>}
                    {vlog.facebookUrl ? (
                      <a href={vlog.facebookUrl} target="_blank" rel="noopener noreferrer" className="pp">
                        <span className="pdot" style={{ background:'#1877f2' }}/> Facebook ↗
                      </a>
                    ) : <div className="pp"><span className="pdot" style={{ background:'#1877f2' }}/> Facebook ↗</div>}
                    {vlog.tiktokUrl ? (
                      <a href={vlog.tiktokUrl} target="_blank" rel="noopener noreferrer" className="pp">
                        <span className="pdot" style={{ background:'#111' }}/> TikTok ↗
                      </a>
                    ) : <div className="pp"><span className="pdot" style={{ background:'#111' }}/> TikTok ↗</div>}
                    {vlog.instagramUrl ? (
                      <a href={vlog.instagramUrl} target="_blank" rel="noopener noreferrer" className="pp">
                        <span className="pdot" style={{ background:'#e1306c' }}/> Instagram ↗
                      </a>
                    ) : null}
                    <span style={{ fontSize:'11px', color:'var(--color-text-secondary)' }}>Same vlog · pick your platform</span>
                  </div>
                </div>

                {/* Title + author */}
                <div className="dtt">{vlog.title}</div>
                <div className="dvl" onClick={() => go('dashboard')}>
                  <div className={`av ${vlog.author.avatarColor}`} style={{ width:'34px', height:'34px', fontSize:'11px' }}>{vlog.author.initials}</div>
                  <div>
                    <div className="dvln">{vlog.author.handle} {vlog.author.verified && <span className="bx bf" style={{ fontSize:'10px' }}>✓ Verified</span>}</div>
                    <div className="dvls">{vlog.author.vlogCount} vlogs · {((vlog.author.followers || 0) / 1000).toFixed(1)}k followers</div>
                  </div>
                  <button className={`fbtn${followStates[vlog.author.id] ? ' fol' : ''}`}
                    onClick={e => { e.stopPropagation(); tFollow(vlog.author.id) }}>
                    {followStates[vlog.author.id] ? 'Following' : 'Follow'}
                  </button>
                </div>

                {/* Stats */}
                <div className="s4">
                  <div className="sb"><div className="sv">{fmtCost(vlog.cost, vlog.currency) || '—'}</div><div className="sl">Total cost</div></div>
                  <div className="sb"><div className="sv">{vlog.duration ? `${vlog.duration} days` : '—'}</div><div className="sl">Duration</div></div>
                  <div className="sb"><div className="sv">★ {vlog.rating}</div><div className="sl">Rating</div></div>
                  <div className="sb"><div className="sv">{vlog.views >= 1000 ? `${(vlog.views/1000).toFixed(1)}k` : vlog.views}</div><div className="sl">Views</div></div>
                </div>

                {vlog.description && <div className="dd">{vlog.description}</div>}

                {/* Engagement */}
                <div className="eng">
                  <button className={`eb${liked ? ' lk' : ''}`} onClick={tLike}>
                    <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                    {likeCount}
                  </button>
                  <button className="eb">
                    <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    {vlog.reviews.length}
                  </button>
                  <button className="eb">
                    <svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                    Share
                  </button>
                  <button className="eb">
                    <svg viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                    Save
                  </button>
                </div>

                {/* Unlock box */}
                {vlog.credits > 0 && (
                  <div className="ulb" id="ulb">
                    {unlocked ? (
                      <div style={{ display:'flex', alignItems:'center', gap:'9px', color:'var(--g)', fontSize:'14px', fontWeight:500 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                        Full itinerary unlocked — enjoy your trip!
                      </div>
                    ) : (
                      <>
                        <div className="ulh">
                          <div className="uln">Unlock full itinerary</div>
                          <div className="ulp">{vlog.credits} {vlog.credits === 1 ? 'credit' : 'credits'}</div>
                        </div>
                        <div className="uld">
                          Get all locked days with costs, descriptions, booking contacts &amp; exclusive clips from {vlog.author.handle}.
                        </div>
                        <button className="ulc" onClick={doUnlock}>
                          Unlock for {vlog.credits} {vlog.credits === 1 ? 'credit' : 'credits'} — ₱{vlog.credits * CREDIT_PESO_RATE}
                        </button>
                      </>
                    )}
                  </div>
                )}

                {/* Itinerary */}
                {vlog.itinerary.length > 0 && (
                  <>
                    <div className="slbl" style={{ marginBottom:'12px' }}>Day-by-day itinerary</div>
                    {vlog.itinerary.map(day => (
                      <div key={day.id} className="id" style={{ opacity: day.locked && !unlocked ? 0.45 : 1 }}>
                        <div className="ir1">
                          <div className="iday" style={{ color: day.locked && !unlocked ? 'var(--color-text-secondary)' : 'var(--g)' }}>
                            Day {day.day}
                          </div>
                          <div className="inn">{day.activity}</div>
                          {(day.cost && (!day.locked || unlocked)) && (
                            <div className="ico"><span className="ico-lbl">Cost</span> ₱{day.cost.toLocaleString()}</div>
                          )}
                        </div>
                        {(!day.locked || unlocked) && (() => {
                          const dayMedia = mediaForDay(day)
                          if (!dayMedia.length) return null
                          return (
                            <>
                              <div className="detail-media-grid">
                                {dayMedia.map((item, mediaIndex) => (
                                  <div
                                    key={`${item.url}-${mediaIndex}`}
                                    className="day-media-card"
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => openMediaModal(`Day ${day.day} photos & videos`, dayMedia, mediaIndex)}
                                    onKeyDown={event => {
                                      if (event.key === 'Enter' || event.key === ' ') openMediaModal(`Day ${day.day} photos & videos`, dayMedia, mediaIndex)
                                    }}
                                  >
                                    {renderMediaPreview(item, `Day ${day.day} media ${mediaIndex + 1}`)}
                                    <span className="day-media-card-overlay">View</span>
                                  </div>
                                ))}
                              </div>
                              <button type="button" className="day-media-open compact" onClick={() => openMediaModal(`Day ${day.day} photos & videos`, dayMedia, 0)}>
                                View media ({dayMedia.length})
                              </button>
                            </>
                          )
                        })()}
                        {day.locked && !unlocked ? (
                          <div className="ilk">
                            <svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                            Unlock to see cost, description &amp; clip
                          </div>
                        ) : (
                          <>
                            {day.highlights && <div className="idc"><strong>✨ Highlights:</strong> {day.highlights}</div>}
                            {day.foodTips && <div className="idc"><strong>🍜 Food tips:</strong> {day.foodTips}</div>}
                            {day.gettingThere && <div className="idc"><strong>🚌 Getting around:</strong> {day.gettingThere}</div>}
                            {day.tips && <div className="idc"><strong>💡 Tips:</strong> {day.tips}</div>}
                          </>
                        )}
                      </div>
                    ))}
                  </>
                )}

                {/* Reviews */}
                <div className="rlbl">Reviews ({vlog.ratingCount})</div>
                {vlog.reviews.map(r => (
                  <div key={r.id} className="ri">
                    <div className="rh">
                      <div className="av ag" style={{ width:'26px', height:'26px', fontSize:'9px' }}>
                        {r.authorName.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()}
                      </div>
                      <div className="rn">{r.authorName}</div>
                      <div className="rs">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                      <div className="rt">{new Date(r.createdAt).toLocaleDateString('en', { month:'short', day:'numeric' })}</div>
                    </div>
                    <div className="rtx">{r.text}</div>
                  </div>
                ))}
                <div className="rir">
                  <input className="rin" type="text" placeholder="Share your experience..."
                    value={reviewText} onChange={e => setReviewText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && submitReview()}/>
                  <button className="rsb" onClick={submitReview}>Post</button>
                </div>
              </>
            ) : (
              <div className="loading">Vlog not found.</div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          PROFILE
      ══════════════════════════════════════ */}
      {page === 'profile' && (
        <div className="page on">
          <div className="w" style={{ paddingTop:0 }}>
            <div style={{ border:'1px solid var(--color-border-tertiary)', borderRadius:'14px', overflow:'hidden', marginTop:'20px' }}>
              <div className="pcv" style={profile?.coverImage ? { backgroundImage: `url('${profile.coverImage}')`, backgroundSize: 'cover', backgroundPosition: 'center' } : { background:'linear-gradient(135deg,var(--g1),var(--g))' }}>
                <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'44px', opacity:.08 }}>🌿</div>
              </div>
              <div className="pbar">
                <div className="pavw"><div className="pavi">{profile?.avatarImage ? <img src={profile.avatarImage} alt={profile.name || 'Profile'} /> : profile?.initials || 'M'}</div></div>
                <div style={{ flex:1, paddingBottom:'2px' }}>
                  <div className="pn">{profile?.name || 'MarisolRoams'}</div>
                  <div className="ps">
                    {profile?.verified && '✓ Verified · '}
                    {profile?.country} · {((profile?.followers || 0)/1000).toFixed(1)}k followers
                  </div>
                </div>
                <div className="pac">
                  <button className="edbtn" onClick={() => go('edit')}>
                    <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    Edit profile
                  </button>
                  <button className={`fbtn${followStates['pf'] ? ' fol' : ''}`} onClick={() => tFollow('pf')}>
                    {followStates['pf'] ? 'Following' : 'Follow'}
                  </button>
                </div>
              </div>
              <div className="ptbs">
                <div className="pt on">Vlogs</div>
                <div className="pt">About</div>
                <div className="pt">Reviews</div>
              </div>
              <div className="pstats">
                <div className="pst"><div className="psv">{profile?.vlogCount || 48}</div><div className="psl">Vlogs</div></div>
                <div className="pst"><div className="psv">{profile?.avgRating || 4.8}</div><div className="psl">Avg rating</div></div>
                <div className="pst"><div className="psv">{((profile?.totalViews || 38000)/1000).toFixed(0)}k</div><div className="psl">Views</div></div>
                <div className="pst"><div className="psv">{profile?.credits || 432}</div><div className="psl">Credits</div></div>
              </div>
              {pinnedVlogIds.size > 0 && (
                <div style={{ padding:'12px 16px 0' }}>
                  <div style={{ fontSize:'12px', fontWeight:700, color:'var(--g)', letterSpacing:'.04em', marginBottom:'8px', display:'flex', alignItems:'center', gap:'5px' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--g)" stroke="none"><path d="M16 2L12 6 8 2 4 6l4 4-4 8h4l4-4 4 4h4l-4-8 4-4z"/></svg>
                    PINNED
                  </div>
                  <div className="vg" style={{ marginBottom:'0' }}>
                    {vlogs.filter(v => pinnedVlogIds.has(v.id)).map((v) => (
                      <div key={v.id} className="vgc" style={{ position:'relative', outline:'2px solid var(--g)', outlineOffset:'-2px', borderRadius:'12px' }} onClick={() => openD('profile', v.id)}>
                        <div className={`vgth ${v.thumbnailColor}`} style={v.coverImage ? { backgroundImage: `url('${v.coverImage}')`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
                          <div className="vp"><svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg></div>
                        </div>
                        <div className="vgi">
                          <div className="vgn">{v.title.length > 28 ? v.title.slice(0,28)+'…' : v.title}</div>
                          <div className="vgm">{v.views >= 1000 ? `${(v.views/1000).toFixed(1)}k` : v.views} views · {v.credits > 0 ? `✦ ${v.credits} credits` : '✓ Free'}</div>
                        </div>
                        <button onClick={e => { e.stopPropagation(); togglePin(v.id) }}
                          style={{ position:'absolute', top:'6px', right:'6px', background:'var(--g)', border:'none', borderRadius:'6px', width:'22px', height:'22px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}
                          title="Unpin">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="white" stroke="none"><path d="M16 2L12 6 8 2 4 6l4 4-4 8h4l4-4 4 4h4l-4-8 4-4z"/></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div style={{ padding: pinnedVlogIds.size > 0 ? '10px 16px 0' : '0' }}>
                {pinnedVlogIds.size > 0 && (
                  <div style={{ fontSize:'12px', fontWeight:700, color:'var(--color-text-secondary)', letterSpacing:'.04em', marginBottom:'8px' }}>ALL VLOGS</div>
                )}
              </div>
              <div className="vg">
                {vlogs.slice(0,4).map((v) => (
                  <div key={v.id} className="vgc" style={{ position:'relative' }} onClick={() => openD('profile', v.id)}>
                    <div className={`vgth ${v.thumbnailColor}`} style={v.coverImage ? { backgroundImage: `url('${v.coverImage}')`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
                      <div className="vp"><svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg></div>
                    </div>
                    <div className="vgi">
                      <div className="vgn">{v.title.length > 28 ? v.title.slice(0,28)+'…' : v.title}</div>
                      <div className="vgm">{v.views >= 1000 ? `${(v.views/1000).toFixed(1)}k` : v.views} views · {v.credits > 0 ? `✦ ${v.credits} credits` : '✓ Free'}</div>
                    </div>
                    <button onClick={e => { e.stopPropagation(); togglePin(v.id) }}
                      style={{ position:'absolute', top:'6px', right:'6px', background: pinnedVlogIds.has(v.id) ? 'var(--g)' : 'rgba(0,0,0,.32)', border:'none', borderRadius:'6px', width:'22px', height:'22px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', opacity: pinnedVlogIds.has(v.id) ? 1 : 0, transition:'opacity .15s' }}
                      className="pin-btn"
                      title={pinnedVlogIds.has(v.id) ? 'Unpin' : 'Pin to profile'}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="white" stroke="none"><path d="M16 2L12 6 8 2 4 6l4 4-4 8h4l4-4 4 4h4l-4-8 4-4z"/></svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          EDIT PROFILE
      ══════════════════════════════════════ */}
      {page === 'edit' && (
        <div className="page on">
          <div className="w">
            <div style={{ fontSize:'22px', fontWeight:700, marginBottom:'4px' }}>Edit profile</div>
            <div style={{ fontSize:'13.5px', color:'var(--color-text-secondary)', marginBottom:'20px' }}>Update how tourists and vloggers see you</div>

            <input ref={coverRef} type="file" accept="image/*" style={{ display:'none' }}
              onChange={async e => { if (e.target.files?.[0]) await handleProfileImageUpload(e.target.files[0], 'coverImage'); e.currentTarget.value = '' }}/>
            <div className="ecv" onClick={() => coverRef.current?.click()} style={pForm.coverImage ? { backgroundImage: `url('${pForm.coverImage}')`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}>
              <div className="ecvb">Change cover photo</div>
            </div>

            <input ref={avatarRef} type="file" accept="image/*" style={{ display:'none' }}
              onChange={async e => { if (e.target.files?.[0]) await handleProfileImageUpload(e.target.files[0], 'avatarImage'); e.currentTarget.value = '' }}/>
            <div className="eav">
              <div className="efav" onClick={() => avatarRef.current?.click()}>
                {pForm.avatarImage ? <img src={pForm.avatarImage} alt="Profile preview" /> : profile?.initials || 'M'}
                <div className="efavc">+</div>
              </div>
              <div style={{ fontSize:'13px', color:'var(--color-text-secondary)' }}>Tap to change profile photo</div>
            </div>

            <div className="fg">
              <label>Display name</label>
              <input className="fi" type="text" value={pForm.name} onChange={e => setPForm(f => ({ ...f, name: e.target.value }))}/>
            </div>
            <div className="fg">
              <label>Tagline</label>
              <input className="fi" type="text" value={pForm.tagline} onChange={e => setPForm(f => ({ ...f, tagline: e.target.value }))}/>
            </div>
            <div className="fg">
              <label>About you</label>
              <textarea className="fi" value={pForm.bio} onChange={e => setPForm(f => ({ ...f, bio: e.target.value }))}/>
            </div>
            <div className="fr">
              <div className="fg">
                <label>Country / base</label>
                <select className="fi" value={pForm.country} onChange={e => setPForm(f => ({ ...f, country: e.target.value }))}>
                  {countryOptions.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="fg">
                <label>Travel style</label>
                <select className="fi" value={pForm.travelStyle} onChange={e => setPForm(f => ({ ...f, travelStyle: e.target.value }))}>
                  <option>Budget</option><option>Mid-range</option><option>Luxury</option>
                </select>
              </div>
            </div>
            <div className="fg">
              <label>Social links (optional)</label>
              <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                <div className="xr">
                  <span className="xd" style={{ background:'#f00' }}/>
                  <input className="xi" type="text" placeholder="YouTube channel link" value={pForm.youtubeUrl} onChange={e => setPForm(f => ({ ...f, youtubeUrl: e.target.value }))}/>
                </div>
                <div className="xr">
                  <span className="xd" style={{ background:'#e1306c' }}/>
                  <input className="xi" type="text" placeholder="Instagram profile" value={pForm.instagramUrl} onChange={e => setPForm(f => ({ ...f, instagramUrl: e.target.value }))}/>
                </div>
                <div className="xr">
                  <span className="xd" style={{ background:'#111' }}/>
                  <input className="xi" type="text" placeholder="TikTok profile" value={pForm.tiktokUrl} onChange={e => setPForm(f => ({ ...f, tiktokUrl: e.target.value }))}/>
                </div>
              </div>
            </div>
            <div style={{ display:'flex', gap:'10px', justifyContent:'flex-end', paddingTop:'16px', borderTop:'1px solid var(--color-border-tertiary)' }}>
              <button className="bb" onClick={() => go('dashboard')}>Cancel</button>
              <button className="nb" onClick={saveProfile}>Save changes</button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          POST A VLOG
      ══════════════════════════════════════ */}
      {page === 'post' && (
        <div className="page on">
          <div className="w">

            {/* ── Drafts-only view ── */}
            {postView === 'drafts' && (
              <div>
                <div style={{ marginBottom:'20px' }}>
                  <div>
                    <div style={{ fontSize:'22px', fontWeight:800, color:'var(--color-text-primary)' }}>Saved drafts</div>
                    <div style={{ fontSize:'13.5px', color:'var(--color-text-secondary)', marginTop:'2px' }}>Pick up where you left off, or start fresh.</div>
                  </div>
                </div>
                {drafts.length === 0 ? (
                  <div style={{ textAlign:'center', padding:'48px 0', color:'var(--color-text-secondary)', fontSize:'14px' }}>No saved drafts yet.</div>
                ) : (
                  <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                    {drafts.map(d => (
                      <div key={d.id} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'14px 16px', border:'1px solid var(--color-border-tertiary)', borderRadius:'14px', background:'var(--color-bg-secondary)' }}>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:'14px', fontWeight:700, color:'var(--color-text-primary)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{d.title}</div>
                          <div style={{ fontSize:'12px', color:'var(--color-text-secondary)', marginTop:'3px' }}>Saved {fmtDraftAge(d.savedAt)}</div>
                        </div>
                        <button onClick={() => loadDraftById(d.id)}
                          style={{ flexShrink:0, padding:'7px 16px', fontSize:'13px', fontWeight:600, background:'var(--g)', color:'#fff', border:'none', borderRadius:'9px', cursor:'pointer' }}>
                          Continue
                        </button>
                        <button onClick={() => deleteDraft(d.id)}
                          style={{ flexShrink:0, width:'32px', height:'32px', display:'flex', alignItems:'center', justifyContent:'center', background:'none', border:'1px solid var(--color-border-tertiary)', borderRadius:'9px', cursor:'pointer', color:'var(--color-text-secondary)', fontSize:'18px' }}
                          title="Delete draft">×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Form view ── */}
            {postView === 'form' && <>
            <div style={{ fontSize:'24px', fontWeight:800, marginBottom:'4px', color:'var(--color-text-primary)' }}>Post a vlog</div>
          <div style={{ fontSize:'14px', color:'var(--color-text-secondary)', marginBottom:'22px' }}>
            {editingVlogId ? 'Update your vlog details, itinerary, media, and credits.' : 'Share your journey. Earn when tourists unlock your itinerary.'}
          </div>

            {/* Step indicator */}
            <div className="steps">
              <div className="si2">
                <div className={stepDot(1)}>{postStep > 1 ? '✓' : '1'}</div>
                <div className={stepLbl(1)}>Video &amp; info</div>
              </div>
              <div className={stepLine(1)}/>
              <div className="si2">
                <div className={stepDot(2)}>{postStep > 2 ? '✓' : '2'}</div>
                <div className={stepLbl(2)}>Itinerary</div>
              </div>
              <div className={stepLine(2)}/>
              <div className="si2">
                <div className={stepDot(3)}>3</div>
                <div className={stepLbl(3)}>Credits &amp; publish</div>
              </div>
            </div>

            {/* Step 1 */}
            {postStep === 1 && (
              <div>
                <div className="vlbx">
                  <div style={{ fontSize:'14px', fontWeight:700, marginBottom:'4px', display:'flex', alignItems:'center', gap:'5px' }}>
                    Paste your video link <span className="req-star">*</span>
                  </div>
                  <div style={{ fontSize:'13px', color:'var(--g1)', lineHeight:'1.6' }}>
                    Add a link from YouTube, Facebook, TikTok, or Instagram. Tourists watch a preview here on Tourista.
                  </div>
                  <div className="vlbr">
                    <input className="vli" type="text" placeholder="e.g. https://youtube.com/watch?v=..."
                      value={videoUrl} onChange={e => detectVideo(e.target.value)}/>
                    <button
                      className="vlbb"
                      style={{
                        background: aiAutoFilling ? 'var(--g1)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        marginLeft: '8px',
                        cursor: aiAutoFilling || !videoUrl.trim() ? 'not-allowed' : 'pointer',
                        opacity: aiAutoFilling || !videoUrl.trim() ? 0.6 : 1
                      }}
                      onClick={handleAIAutoFill}
                      disabled={aiAutoFilling || !videoUrl.trim()}
                    >
                      {aiAutoFilling ? '⏳ Generating...' : '✨ Auto-fill with AI'}
                    </button>
                  </div>
                  {videoDetected && (
                    <div className="detp">
                      <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                      {videoDetected}
                    </div>
                  )}
                  {aiAutoFillError && (
                    <div style={{
                      marginTop: '8px',
                      padding: '10px 14px',
                      background: '#fee',
                      border: '1px solid #fcc',
                      borderRadius: '8px',
                      fontSize: '13px',
                      color: '#c33',
                      lineHeight: '1.5'
                    }}>
                      {aiAutoFillError}
                    </div>
                  )}
                  <div className="aml" onClick={() => setShowAltLinks(s => !s)}>
                    + Add same vlog from another platform (optional)
                  </div>
                  {showAltLinks && (
                    <div className="xls on" style={{ marginTop:'9px' }}>
                      <div className="xr"><span className="xd" style={{ background:'#1877f2' }}/><input className="xi" type="text" placeholder="Facebook link (same vlog)" value={altLinks.fb} onChange={e => setAltLinks(a => ({ ...a, fb: e.target.value }))}/></div>
                      <div className="xr"><span className="xd" style={{ background:'#111' }}/><input className="xi" type="text" placeholder="TikTok link (same vlog)" value={altLinks.tt} onChange={e => setAltLinks(a => ({ ...a, tt: e.target.value }))}/></div>
                      <div className="xr"><span className="xd" style={{ background:'#e1306c' }}/><input className="xi" type="text" placeholder="Instagram Reel (same vlog)" value={altLinks.ig} onChange={e => setAltLinks(a => ({ ...a, ig: e.target.value }))}/></div>
                    </div>
                  )}
                </div>
                <div className="fg">
                  <label>Vlog title <span className="req-star">*</span></label>
                  <input className={`fi${!postForm.title.trim() && publishError ? ' err' : ''}`} type="text"
                    placeholder="e.g. Siargao in 7 days — surfing, lagoons & local eats"
                    value={postForm.title} onChange={e => { setPostForm(f => ({ ...f, title: e.target.value })); setPublishError('') }}/>
                </div>
                <div className="fg">
                  <label>Description</label>
                  <textarea className="fi" placeholder="Tell tourists what makes this trip special — highlights, vibes, who it's for..."
                    value={postForm.description} onChange={e => setPostForm(f => ({ ...f, description: e.target.value }))}/>
                </div>
                <div className="fg">
                  <label>Cover photo</label>
                  <div style={{ fontSize:'12px', color:'var(--color-text-secondary)', marginBottom:'10px', padding:'10px 12px', background:'var(--color-background-secondary)', borderRadius:'8px', borderLeft:'3px solid var(--gm)' }}>
                    💡 <strong>This is the first thing tourists see!</strong> Choose a stunning, eye-catching image that represents your vlog. A great cover photo increases clicks and views.
                  </div>
                  {postForm.coverImage ? (
                    <div className="cover-preview">
                      <img src={postForm.coverImage} alt="Cover"
                        onError={() => setPublishError('Cover photo preview unavailable, but your photo was saved. You can continue posting.')}/>
                      {coverUploading && (
                        <div style={{ position:'absolute', inset:0, background:'rgba(255,255,255,.6)', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'12px', fontSize:'13px', color:'var(--g)', fontWeight:600 }}>
                          Uploading…
                        </div>
                      )}
                      <button className="cover-remove" onClick={() => setPostForm(f => ({ ...f, coverImage: '' }))}>×</button>
                    </div>
                  ) : (
                    <div className={`upload-zone${coverUploading ? ' upload-zone-uploading' : ''}`}
                      onClick={() => {
                        if (coverUploading) return
                        const inp = document.createElement('input')
                        inp.type = 'file'; inp.accept = 'image/*'
                        inp.onchange = (e) => {
                          const f = (e.target as HTMLInputElement).files?.[0]
                          if (f) handleCoverUpload(f)
                        }
                        inp.click()
                      }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-secondary)" strokeWidth="1.6" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                      <div>
                        <div style={{ fontSize:'13.5px', fontWeight:600, color:'var(--color-text-secondary)' }}>{coverUploading ? 'Uploading…' : 'Click to upload cover photo'}</div>
                        <div style={{ fontSize:'12px', color:'var(--color-text-secondary)', marginTop:'2px' }}>JPG, PNG or WebP · Recommended 16:9</div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="fr">
                  <div className="fg">
                    <label>Country</label>
                    <select className="fi" value={postForm.country} onChange={e => setPostForm(f => ({ ...f, country: e.target.value }))}>
                      {countryOptions.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="fg">
                    <label>Cities / locations</label>
                    <div className="vti">
                      {postForm.cities.split(',').filter(Boolean).map(city => (
                        <span key={city} className="vtag">
                          {city}
                          <button type="button" className="vtag-x" onClick={() => {
                            const cities = postForm.cities.split(',').filter(Boolean).filter(c => c !== city)
                            setPostForm(f => ({ ...f, cities: cities.join(',') }))
                          }}>×</button>
                        </span>
                      ))}
                      <div className="vti-wrap">
                        <input
                          type="text"
                          className="vti-in"
                          placeholder={postForm.cities ? '' : 'Search cities...'}
                          value={cityInput}
                          onChange={e => setCityInput(e.target.value)}
                          onFocus={() => setCityFocused(true)}
                          onBlur={() => { setTimeout(() => setCityFocused(false), 150) }}
                          onKeyDown={e => {
                            if (e.key === 'Enter' && cityInput.trim()) {
                              e.preventDefault()
                              const existing = postForm.cities.split(',').filter(Boolean)
                              const match = (CITIES_BY_COUNTRY[postForm.country] || []).find(c => c.toLowerCase() === cityInput.trim().toLowerCase())
                              const val = match || cityInput.trim()
                              if (!existing.includes(val)) {
                                setPostForm(f => ({ ...f, cities: [...existing, val].join(',') }))
                              }
                              setCityInput('')
                            }
                          }}
                        />
                        {(cityFocused) && (() => {
                          const existing = postForm.cities.split(',').filter(Boolean)
                          const availableCities = CITIES_BY_COUNTRY[postForm.country] || []
                          const opts = availableCities.filter(c => !existing.includes(c) && (!cityInput || c.toLowerCase().includes(cityInput.toLowerCase())))
                          return opts.length > 0 || cityInput.trim() ? (
                            <div className="vdrop">
                              {opts.map(c => (
                                <div key={c} className="vopt" onMouseDown={() => {
                                  setPostForm(f => ({ ...f, cities: [...existing, c].join(',') }))
                                  setCityInput('')
                                }}>
                                  {c}
                                </div>
                              ))}
                              {cityInput.trim() && !opts.find(c => c.toLowerCase() === cityInput.toLowerCase()) && (
                                <div className="vopt" onMouseDown={() => {
                                  setPostForm(f => ({ ...f, cities: [...existing, cityInput.trim()].join(',') }))
                                  setCityInput('')
                                }} style={{ fontWeight: 600, color: 'var(--g)' }}>
                                  + Add &quot;{cityInput.trim()}&quot; as custom location
                                </div>
                              )}
                            </div>
                          ) : null
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="fg">
                  <label>Vibe</label>
                  <div className="vti">
                    {postForm.vibe.split(',').filter(Boolean).map(tag => (
                      <span key={tag} className="vtag">
                        {tag}
                        <button type="button" className="vtag-x" onClick={() => {
                          const tags = postForm.vibe.split(',').filter(Boolean).filter(t => t !== tag)
                          setPostForm(f => ({ ...f, vibe: tags.join(',') }))
                        }}>×</button>
                      </span>
                    ))}
                    <div className="vti-wrap">
                      <input
                        type="text"
                        className="vti-in"
                        placeholder={postForm.vibe ? '' : 'Search vibes...'}
                        value={vibeInput}
                        onChange={e => setVibeInput(e.target.value)}
                        onFocus={() => setVibeFocused(true)}
                        onBlur={() => { setTimeout(() => setVibeFocused(false), 150) }}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && vibeInput.trim()) {
                            e.preventDefault()
                            const existing = postForm.vibe.split(',').filter(Boolean)
                            const match = vibeOptions.find(v => v.toLowerCase() === vibeInput.trim().toLowerCase())
                            const val = match || vibeInput.trim()
                            if (!existing.includes(val)) {
                              setPostForm(f => ({ ...f, vibe: [...existing, val].join(',') }))
                            }
                            setVibeInput('')
                          }
                          if (e.key === 'Backspace' && !vibeInput) {
                            const tags = postForm.vibe.split(',').filter(Boolean)
                            if (tags.length) setPostForm(f => ({ ...f, vibe: tags.slice(0,-1).join(',') }))
                          }
                        }}
                      />
                      {(vibeFocused) && (() => {
                        const existing = postForm.vibe.split(',').filter(Boolean)
                        const opts = vibeOptions.filter(v => !existing.includes(v) && (!vibeInput || v.toLowerCase().includes(vibeInput.toLowerCase())))
                        return opts.length > 0 ? (
                          <div className="vdrop">
                            {opts.map(v => (
                              <div key={v} className="vopt" onMouseDown={() => {
                                setPostForm(f => ({ ...f, vibe: [...existing, v].join(',') }))
                                setVibeInput('')
                              }}>{v}</div>
                            ))}
                          </div>
                        ) : null
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2 */}
            {postStep === 2 && (
              <div>
                <div className="step-hint">
                  Add each day with a summary and optional cost. Mark days as <strong>Locked</strong> so tourists pay credits to access them — that&apos;s how you earn. Expand any day to add photos, food tips, and travel notes.
                </div>
                <div className="short-clip-note post-wide">Each day can include a short clip link or upload. Video clips must be 1 minute or less, otherwise they will not be processed.</div>
                {itinDays.map((d, i) => (
                  <div key={d.day} className={`day-card${d.expanded ? ' open' : ''}`}>
                    {/* Day header row */}
                    <div className="day-hdr">
                      <span className="ibd">D{d.day}</span>
                      <input className="ibin" type="text"
                        placeholder={`Day ${d.day} — e.g. Island hopping at Sugba Lagoon`}
                        value={d.activity} onChange={e => updDay(i, 'activity', e.target.value)}/>
                      <button className={`tog ${d.locked ? 'tgl' : 'tgf'}`}
                        onClick={() => updDay(i, 'locked', !d.locked)}>
                        {d.locked ? '🔒 Locked' : '✓ Free'}
                      </button>
                      <button className="day-toggle" onClick={() => updDay(i, 'expanded', !d.expanded)}>
                        {d.expanded ? '▲ Less' : '＋ Details'}
                      </button>
                    </div>

                    {/* Expanded detail panel */}
                    {d.expanded && (
                      <div className="day-body">
                        {/* Cost field for all days */}
                        <div className="emoji-field">
                          <span className="day-sub-lbl">💰 Cost for this day</span>
                          <input className="fi" type="text" placeholder="e.g. ₱2,500"
                            value={d.cost} onChange={e => updDay(i, 'cost', e.target.value)}/>
                        </div>

                        {/* Media carousel gallery */}
                        <div>
                          <div className="short-clip-note">Each itinerary video clip should be 1 minute or less. Longer clips will not be processed.</div>
                          <div className="short-clip-links">
                            {clipUrlsForDay(d).map((clipUrl, clipIndex) => (
                              <div key={clipIndex} className="short-clip-link">
                                <input
                                  className="fi"
                                  type="url"
                                  placeholder="Short clip link, e.g. https://www.youtube.com/shorts/xwxVLYISc5g"
                                  value={clipUrl}
                                  onChange={e => updateDayClipUrl(i, clipIndex, e.target.value)}
                                  onBlur={() => validateShortClipLink(i)}
                                />
                                {clipUrlsForDay(d).length > 1 && (
                                  <button type="button" className="clip-link-remove" aria-label="Remove clip link" onClick={() => removeDayClipUrl(i, clipIndex)}>
                                    x
                                  </button>
                                )}
                              </div>
                            ))}
                            <button type="button" className="clip-link-add" onClick={() => addDayClipUrl(i)}>
                              + Add another short clip link
                            </button>
                          </div>
                          <span className="day-sub-lbl">📸 Photos & videos for this day</span>
                          {(() => {
                            const dayMedia = mediaForDay(d)
                            if (!dayMedia.length) return null
                            return (
                              <>
                                <div className="day-media-grid">
                                  {dayMedia.map((item, mediaIndex) => (
                                    <div
                                      key={`${item.url}-${mediaIndex}`}
                                      className="day-media-card"
                                      role="button"
                                      tabIndex={0}
                                      onClick={() => openMediaModal(`Day ${d.day} photos & videos`, dayMedia, mediaIndex)}
                                      onKeyDown={event => {
                                        if (event.key === 'Enter' || event.key === ' ') openMediaModal(`Day ${d.day} photos & videos`, dayMedia, mediaIndex)
                                      }}
                                    >
                                      {renderMediaPreview(item, `Day ${d.day} media ${mediaIndex + 1}`)}
                                      <span className="day-media-card-overlay">View</span>
                                      <button
                                        type="button"
                                        className="day-media-remove"
                                        aria-label="Remove media"
                                        onClick={event => {
                                          event.stopPropagation()
                                          removeDayMediaItem(i, item, mediaIndex)
                                        }}
                                      >
                                        x
                                      </button>
                                    </div>
                                  ))}
                                </div>
                                <button type="button" className="day-media-open" onClick={() => openMediaModal(`Day ${d.day} photos & videos`, dayMedia, 0)}>
                                  View media ({dayMedia.length})
                                </button>
                              </>
                            )
                          })()}
                          {/* Add more button */}
                          <div
                            className={`day-media-zone${dayUploading[i] ? ' upload-zone-uploading' : ''}`}
                            onClick={() => {
                              if (dayUploading[i]) return
                              const inp = document.createElement('input')
                              inp.type = 'file'; inp.accept = 'image/*,video/*'; inp.multiple = true
                              inp.onchange = (e) => {
                                const files = (e.target as HTMLInputElement).files
                                if (files) {
                                  Array.from(files).forEach(f => handleDayMedia(i, f))
                                }
                              }
                              inp.click()
                            }}
                            style={{ marginTop: (d.media && d.media.length > 0) ? '10px' : '0' }}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-secondary)" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                            <span style={{ fontSize:'12.5px', color:'var(--color-text-secondary)', fontWeight:500 }}>
                              {dayUploading[i] ? 'Uploading...' : (d.media && d.media.length > 0 ? 'Add more photos/video clips' : 'Upload photos or video clips')}
                            </span>
                          </div>
                        </div>

                        {/* Highlights */}
                        <div className="emoji-field">
                          <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'4px' }}>
                            <span className="day-sub-lbl">✨ Highlights</span>
                            <button
                              type="button"
                              data-emoji-field={`day-${i}-highlights`}
                              onClick={(event) => toggleEmojiPicker(`day-${i}-highlights`, event)}
                              style={{ background:'none', border:'none', cursor:'pointer', fontSize:'16px', padding:'0 2px' }}
                              title="Add emoji"
                            >
                              😊
                            </button>
                          </div>
                          <textarea className="fi" style={{ minHeight:'100px' }}
                            ref={el => { if (el) textareaRefs.current[`day-${i}-highlights`] = el }}
                            placeholder="What made this day special? e.g. Watched the sunset at Cloud 9, swam in the lagoon..."
                            value={d.highlights || ''}
                            onChange={e => updDay(i, 'highlights', e.target.value)}/>
                          {emojiPickerField === `day-${i}-highlights` && (
                            <div className="emoji-popover" style={emojiPickerPosition || undefined}>
                              <EmojiPicker
                                onEmojiClick={(e) => handleEmojiSelect(`day-${i}-highlights`, e.emoji)}
                                width={224}
                                height={231}
                                previewConfig={{ showPreview: false }}
                              />
                            </div>
                          )}
                        </div>

                        {/* Food tips */}
                        <div className="emoji-field">
                          <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'4px' }}>
                            <span className="day-sub-lbl">🍜 Food tips</span>
                            <button
                              type="button"
                              data-emoji-field={`day-${i}-foodTips`}
                              onClick={(event) => toggleEmojiPicker(`day-${i}-foodTips`, event)}
                              style={{ background:'none', border:'none', cursor:'pointer', fontSize:'16px', padding:'0 2px' }}
                              title="Add emoji"
                            >
                              😊
                            </button>
                          </div>
                          <textarea className="fi" style={{ minHeight:'100px' }}
                            ref={el => { if (el) textareaRefs.current[`day-${i}-foodTips`] = el }}
                            placeholder="Best restaurants, must-try dishes, estimated meal cost..."
                            value={d.foodTips || ''}
                            onChange={e => updDay(i, 'foodTips', e.target.value)}/>
                          {emojiPickerField === `day-${i}-foodTips` && (
                            <div className="emoji-popover" style={emojiPickerPosition || undefined}>
                              <EmojiPicker
                                onEmojiClick={(e) => handleEmojiSelect(`day-${i}-foodTips`, e.emoji)}
                                width={224}
                                height={231}
                                previewConfig={{ showPreview: false }}
                              />
                            </div>
                          )}
                        </div>

                        {/* Getting around */}
                        <div className="emoji-field">
                          <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'4px' }}>
                            <span className="day-sub-lbl">🚌 Getting around</span>
                            <button
                              type="button"
                              data-emoji-field={`day-${i}-gettingThere`}
                              onClick={(event) => toggleEmojiPicker(`day-${i}-gettingThere`, event)}
                              style={{ background:'none', border:'none', cursor:'pointer', fontSize:'16px', padding:'0 2px' }}
                              title="Add emoji"
                            >
                              😊
                            </button>
                          </div>
                          <textarea className="fi" style={{ minHeight:'100px' }}
                            ref={el => { if (el) textareaRefs.current[`day-${i}-gettingThere`] = el }}
                            placeholder="Transport used, how to get there, fare estimates..."
                            value={d.gettingThere || ''}
                            onChange={e => updDay(i, 'gettingThere', e.target.value)}/>
                          {emojiPickerField === `day-${i}-gettingThere` && (
                            <div className="emoji-popover" style={emojiPickerPosition || undefined}>
                              <EmojiPicker
                                onEmojiClick={(e) => handleEmojiSelect(`day-${i}-gettingThere`, e.emoji)}
                                width={224}
                                height={231}
                                previewConfig={{ showPreview: false }}
                              />
                            </div>
                          )}
                        </div>

                        {/* Tips */}
                        <div className="emoji-field">
                          <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'4px' }}>
                            <span className="day-sub-lbl">💡 Tips & budget breakdown</span>
                            <button
                              type="button"
                              data-emoji-field={`day-${i}-tips`}
                              onClick={(event) => toggleEmojiPicker(`day-${i}-tips`, event)}
                              style={{ background:'none', border:'none', cursor:'pointer', fontSize:'16px', padding:'0 2px' }}
                              title="Add emoji"
                            >
                              😊
                            </button>
                          </div>
                          <textarea className="fi" style={{ minHeight:'100px' }}
                            ref={el => { if (el) textareaRefs.current[`day-${i}-tips`] = el }}
                            placeholder="Money-saving tips, what to avoid, booking advice, entrance fees..."
                            value={d.tips || ''}
                            onChange={e => updDay(i, 'tips', e.target.value)}/>
                          {emojiPickerField === `day-${i}-tips` && (
                            <div className="emoji-popover" style={emojiPickerPosition || undefined}>
                              <EmojiPicker
                                onEmojiClick={(e) => handleEmojiSelect(`day-${i}-tips`, e.emoji)}
                                width={224}
                                height={231}
                                previewConfig={{ showPreview: false }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <div className="ibadd" onClick={addDay}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Add another day
                </div>
              </div>
            )}

            {/* Step 3 */}
            {postStep === 3 && (() => {
              const calculatedCredits = calculateCreditsFromCost()
              const totalDayCost = itinDays.reduce((sum, day) => {
                if (!day.cost.trim()) return sum
                const cleaned = day.cost.replace(/[₱$,\s]/g, '')
                const num = parseInt(cleaned) || 0
                return sum + num
              }, 0)
              const selectedCredits = Math.max(0, Number(postForm.credits) || 0)
              const maxCredits = Math.max(20, calculatedCredits * 2, selectedCredits)
              return (
              <div>
                <div className="fg">
                  <label>Credits to unlock your full itinerary</label>
                  <div className="crc">
                    <div className="crt">
                      <span className="crl">Credits per tourist</span>
                      <span className="crv">{selectedCredits === 0 ? 'Free' : `${selectedCredits} credit${selectedCredits > 1 ? 's' : ''}`}</span>
                    </div>
                    <div style={{ padding: '12px 14px', background: 'var(--color-bg-secondary)', borderRadius: '8px', fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '12px' }}>
                      <strong style={{ color: 'var(--color-text-primary)' }}>Recommended value:</strong>
                      <div style={{ marginTop: '8px', fontSize: '12px', lineHeight: '1.6' }}>
                        Total itinerary cost: <strong>₱{totalDayCost.toLocaleString()}</strong><br/>
                        1% creator value: <strong>₱{Math.ceil(totalDayCost * RECOMMENDED_CREDIT_RATE).toLocaleString()}</strong><br/>
                        ÷ ₱{CREDIT_PESO_RATE} per credit = <strong>{calculatedCredits} credit{calculatedCredits > 1 ? 's' : ''}</strong>
                      </div>
                    </div>
                    <div className="credit-ruler">
                      <div className="credit-ruler-top">
                        <span>Free</span>
                        <span>Recommended: {calculatedCredits}</span>
                        <span>{maxCredits} credits</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={maxCredits}
                        step={1}
                        value={selectedCredits}
                        onChange={e => updCr(parseInt(e.target.value, 10))}
                        className="credit-range"
                        aria-label="Credits per tourist"
                      />
                      <div className="credit-ruler-bottom">
                        <button type="button" className="credit-mini" onClick={() => updCr(calculatedCredits)}>Use recommended</button>
                        <input
                          type="number"
                          min={0}
                          max={maxCredits}
                          value={selectedCredits}
                          onChange={e => updCr(Math.max(0, parseInt(e.target.value, 10) || 0))}
                          className="credit-number"
                          aria-label="Custom credits"
                        />
                      </div>
                    </div>
                    <div className="cri">
                      {selectedCredits === 0
                        ? 'Free vlog — great for building your audience.'
                        : <>At {selectedCredits} credit{selectedCredits > 1 ? 's' : ''} at PHP {selectedCredits * CREDIT_PESO_RATE} per tourist, 80% to you = <strong>PHP {selectedCredits * CREDIT_PESO_RATE * 0.8}</strong>. Est. 50 unlocks/month = <strong>PHP {(selectedCredits * CREDIT_PESO_RATE * 0.8 * 50).toLocaleString()} passive income</strong></>
                      }
                    </div>
                  </div>
                </div>
                <div style={{ padding:'14px 16px', border:'1.5px solid var(--gm)', borderRadius:'12px', fontSize:'13px', lineHeight:'1.75', color:'var(--color-text-secondary)', background:'var(--gp)' }}>
                  <strong style={{ color:'var(--g1)', display:'block', marginBottom:'6px', fontSize:'14px' }}>✅ Ready to publish?</strong>
                  Your vlog will go live immediately. Tourists can browse your itinerary and pay credits to unlock locked days. Make sure costs are accurate.
                </div>
                <div style={{ display:'flex', alignItems:'flex-start', gap:'10px', padding:'14px 16px', border:'1.5px solid var(--color-border-tertiary)', borderRadius:'12px', background:'var(--color-bg-secondary)', marginTop:'12px' }}>
                  <input
                    type="checkbox"
                    id="credits-review-checkbox"
                    checked={creditsReviewed}
                    onChange={(e) => setCreditsReviewed(e.target.checked)}
                    style={{ marginTop:'3px', cursor:'pointer', width:'18px', height:'18px', minWidth:'18px' }}
                  />
                  <label htmlFor="credits-review-checkbox" style={{ cursor:'pointer', fontSize:'13px', color:'var(--color-text-primary)', lineHeight:'1.5' }}>
                    I&apos;ve reviewed the credits and understand the pricing. I also confirm that at least one itinerary day is unlocked for tourists to preview.
                  </label>
                </div>
              </div>
            )})()}

            {publishError && (
              <div className="ferr">
                <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {publishError}
              </div>
            )}
            <div className="ff">
              <button className="bb" onClick={prevStepFn}>← Back</button>
              <div style={{ display:'flex', alignItems:'center', gap:'9px' }}>
                {postStep < 3 && (
                  <button className="bb" onClick={saveDraft}>Save draft</button>
                )}
                <button className="nb" onClick={nextStep} disabled={publishing || aiAutoFilling || (postStep === 3 && !creditsReviewed)}>
                  {postStep === 3 ? (publishing ? (editingVlogId ? 'Saving…' : 'Publishing…') : (editingVlogId ? 'Save changes →' : 'Publish →')) : 'Continue →'}
                </button>
              </div>
            </div>

            {/* Saved drafts */}
            {drafts.length > 0 && (
              <div style={{ marginTop:'32px', paddingTop:'24px', borderTop:'1px solid var(--color-border-tertiary)' }}>
                <div style={{ fontSize:'14px', fontWeight:700, color:'var(--color-text-primary)', marginBottom:'12px', display:'flex', alignItems:'center', gap:'7px' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                  Saved drafts
                  <span style={{ fontSize:'12px', fontWeight:500, color:'var(--color-text-secondary)', background:'var(--color-border-tertiary)', borderRadius:'10px', padding:'1px 7px' }}>{drafts.length}</span>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                  {drafts.map(d => (
                    <div key={d.id} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'11px 14px', border:'1px solid var(--color-border-tertiary)', borderRadius:'12px', background:'var(--color-bg-secondary)' }}>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:'13.5px', fontWeight:600, color:'var(--color-text-primary)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{d.title}</div>
                        <div style={{ fontSize:'12px', color:'var(--color-text-secondary)', marginTop:'2px' }}>Saved {fmtDraftAge(d.savedAt)}</div>
                      </div>
                      <button onClick={() => loadDraftById(d.id)}
                        style={{ flexShrink:0, padding:'5px 13px', fontSize:'12.5px', fontWeight:600, background:'var(--g)', color:'#fff', border:'none', borderRadius:'8px', cursor:'pointer' }}>
                        Load
                      </button>
                      <button onClick={() => deleteDraft(d.id)}
                        style={{ flexShrink:0, width:'28px', height:'28px', display:'flex', alignItems:'center', justifyContent:'center', background:'none', border:'1px solid var(--color-border-tertiary)', borderRadius:'8px', cursor:'pointer', color:'var(--color-text-secondary)', fontSize:'16px', lineHeight:1 }}
                        title="Delete draft">×</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            </>}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          DASHBOARD - SPLIT VIEW
      ══════════════════════════════════════ */}
      {page === 'dashboard' && (
        <div className="tn-page">
          <div className={`gi-layout dashboard-layout${selectedMyVlogId || dashboardMode !== 'list' ? ' with-panel' : ''}`}>
            <div className="dash-compact-summary">
              <div className="dash-compact-profile">
                <div className="dash-compact-avatar">{profile?.avatarImage ? <img src={profile.avatarImage} alt={profile.name || 'Profile'} /> : profile?.initials || 'M'}</div>
                <div className="dash-compact-copy">
                  <div className="dash-compact-name">{profile?.name || 'MarisolRoams'}</div>
                  <div className="dash-compact-meta">@{profile?.handle || 'marisolroams'} Â· {profile?.country || DEFAULT_COUNTRY}</div>
                  {profile?.tagline && <div className="dash-compact-tagline">{profile.tagline}</div>}
                </div>
                <button className="edbtn dash-compact-edit" onClick={() => go('edit')}>
                  <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  Edit profile
                </button>
              </div>
              <div className="dash-compact-kpis">
                <div className="dash-mini-kpi"><span>Earnings</span><strong>â‚±{(profile?.earnings || 4320).toLocaleString()}</strong></div>
                <div className="dash-mini-kpi"><span>Views</span><strong>{((profile?.totalViews || 38400)/1000).toFixed(1)}k</strong></div>
                <div className="dash-mini-kpi"><span>Vlogs</span><strong>{myVlogs.length || profile?.vlogCount || 48}</strong></div>
                <div className="dash-mini-kpi"><span>Avg rating</span><strong>{(profile?.avgRating || 4.8).toFixed(1)}</strong></div>
              </div>
            </div>
            {/* Left Panel - Dashboard KPIs & Vlog List */}
            <div className="gi-panel-left" style={{ padding:'20px' }}>
              <div className="dashboard-left-content" style={{ width:'100%' }}>
                <div className="dash-profile">
                  <div className="dash-cover" style={profile?.coverImage ? { backgroundImage: `url('${profile.coverImage}')`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}>
                    <div className="dash-cover-mark">Tourista</div>
                  </div>
                  <div className="dash-profile-body">
                    <div className="dash-avatar">{profile?.avatarImage ? <img src={profile.avatarImage} alt={profile.name || 'Profile'} /> : profile?.initials || 'M'}</div>
                    <div className="dash-profile-main">
                      <div className="dash-profile-row">
                        <div className="emoji-field">
                          <div className="dash-name">{profile?.name || 'MarisolRoams'}</div>
                          <div className="dash-meta">
                            {profile?.verified && 'Verified · '}
                            @{profile?.handle || 'marisolroams'} · {profile?.country || DEFAULT_COUNTRY}
                          </div>
                        </div>
                        <button className="edbtn" onClick={() => go('edit')}>
                          <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          Edit profile
                        </button>
                      </div>
                      {profile?.tagline && <div className="dash-tagline">{profile.tagline}</div>}
                      {profile?.bio && <div className="dash-bio">{profile.bio}</div>}
                      <div className="dash-socials">
                        {profile?.youtubeUrl && <a href={profile.youtubeUrl} target="_blank" rel="noopener noreferrer"><span className="pdot" style={{ background:'#f00' }}/> YouTube</a>}
                        {profile?.instagramUrl && <a href={profile.instagramUrl} target="_blank" rel="noopener noreferrer"><span className="pdot" style={{ background:'#e1306c' }}/> Instagram</a>}
                        {profile?.tiktokUrl && <a href={profile.tiktokUrl} target="_blank" rel="noopener noreferrer"><span className="pdot" style={{ background:'#111' }}/> TikTok</a>}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="dash-compact-summary">
                  <div className="dash-compact-profile">
                    <div className="dash-compact-avatar">{profile?.avatarImage ? <img src={profile.avatarImage} alt={profile.name || 'Profile'} /> : profile?.initials || 'M'}</div>
                    <div className="dash-compact-copy">
                      <div className="dash-compact-name">{profile?.name || 'MarisolRoams'}</div>
                      <div className="dash-compact-meta">@{profile?.handle || 'marisolroams'} Â· {profile?.country || DEFAULT_COUNTRY}</div>
                      {profile?.tagline && <div className="dash-compact-tagline">{profile.tagline}</div>}
                    </div>
                    <button className="edbtn dash-compact-edit" onClick={() => go('edit')}>
                      <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      Edit profile
                    </button>
                  </div>
                  <div className="dash-compact-kpis">
                    <div className="dash-mini-kpi"><span>Earnings</span><strong>â‚±{(profile?.earnings || 4320).toLocaleString()}</strong></div>
                    <div className="dash-mini-kpi"><span>Views</span><strong>{((profile?.totalViews || 38400)/1000).toFixed(1)}k</strong></div>
                    <div className="dash-mini-kpi"><span>Vlogs</span><strong>{myVlogs.length || profile?.vlogCount || 48}</strong></div>
                    <div className="dash-mini-kpi"><span>Avg rating</span><strong>{(profile?.avgRating || 4.8).toFixed(1)}</strong></div>
                  </div>
                </div>
                <div className="dashboard-summary-title" style={{ fontSize:'22px', fontWeight:700, marginBottom:'3px' }}>
                  Dashboard
                </div>
                <div className="dashboard-summary-subtitle" style={{ fontSize:'14px', color:'var(--color-text-secondary)', marginBottom:'20px' }}>Your profile, vlogs, and performance in one place</div>
                <div className="kpig">
                  <div className="kp">
                    <div className="kpl">Earnings</div>
                    <div className="kpv" style={{ color:'var(--y)' }}>₱{(profile?.earnings || 4320).toLocaleString()}</div>
                    <div className="kpc up">↑ +18%</div>
                  </div>
                  <div className="kp">
                    <div className="kpl">Credits</div>
                    <div className="kpv">{profile?.credits || 432}</div>
                    <div className="kpc up">↑ +64</div>
                  </div>
                  <div className="kp">
                    <div className="kpl">Views</div>
                    <div className="kpv">{((profile?.totalViews || 38400)/1000).toFixed(1)}k</div>
                    <div className="kpc up">↑ +2.1k</div>
                  </div>
                  <div className="kp">
                    <div className="kpl">Vlogs</div>
                    <div className="kpv">{myVlogs.length || profile?.vlogCount || 48}</div>
                    <div className="kpc dw" style={{ color:'var(--color-text-secondary)' }}>2 in review</div>
                  </div>
                  <div className="kp">
                    <div className="kpl">Followers</div>
                    <div className="kpv">{((profile?.followers || 0)/1000).toFixed(1)}k</div>
                    <div className="kpc up">Creator profile</div>
                  </div>
                  <div className="kp">
                    <div className="kpl">Avg rating</div>
                    <div className="kpv">{(profile?.avgRating || 4.8).toFixed(1)}</div>
                    <div className="kpc up">Across vlogs</div>
                  </div>
                  <div className="kp">
                    <div className="kpl">Base</div>
                    <div className="kpv dash-kpv-text">{profile?.country || DEFAULT_COUNTRY}</div>
                    <div className="kpc up">{profile?.travelStyle || 'Budget'} travel</div>
                  </div>
                  <div className="kp">
                    <div className="kpl">Handle</div>
                    <div className="kpv dash-kpv-text">@{profile?.handle || 'marisolroams'}</div>
                    <div className="kpc up">{profile?.verified ? 'Verified' : 'Creator'}</div>
                  </div>
                </div>
                <div className="dashboard-summary-chart" style={{ marginBottom:'22px' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'11px' }}>
                    <span style={{ fontSize:'14px', fontWeight:600 }}>Monthly earnings</span>
                    <span style={{ fontSize:'12px', color:'var(--color-text-secondary)' }}>Oct: 86 unlocks</span>
                  </div>
                  <div className="ca">
                    <div className="brs">
                      {[28,40,32,55,47,66,51,76,62,94].map((h, i) => (
                        <div key={i} className={`bar${i === 9 ? ' hi' : ''}`} style={{ height:`${h}%` }}/>
                      ))}
                    </div>
                    <div className="blbs">
                      {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct'].map(m => (
                        <div key={m} className="blb">{m}</div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="dashboard-vlogs-title" style={{ marginBottom:'11px' }}>
                  <span style={{ fontSize:'14px', fontWeight:600 }}>My vlogs</span>
                </div>
                <div className="gi-grid dash-vlog-grid">
                  {myVlogs.length === 0 ? (
                    <div className="dash-empty">
                      No vlogs yet. <span style={{ color:'var(--g)', cursor:'pointer', fontWeight:600 }} onClick={() => { setPostForm({ ...defaultPostForm }); setVideoUrl(''); setVideoDetected(''); setAltLinks({ fb:'', tt:'', ig:'' }); setItinDays(defaultItinDays.map(d => ({ ...d }))); setPostStep(1); setPublishError(''); setVibeInput(''); setVibeFocused(false); setPostView('form'); setEditingVlogId(null); go('post') }}>Post your first vlog →</span>
                    </div>
                  ) : myVlogs.map(v => (
                    <div
                      key={v.id}
                      className={`gi-card${selectedMyVlogId === v.id ? ' on' : ''}`}
                      onClick={async (e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setSelectedMyVlogId(v.id)
                        setDashboardMode('details')
                        setVlog(null)
                        setVlogLoading(true)
                        try {
                          const r = await fetch(`/api/vlogs/${v.id}`)
                          const d: VlogDetail = await r.json()
                          setVlog(d)
                          setLikeCount(d.likes)
                          setLiked(false)
                          setUnlocked(false)
                          setReviewText('')
                        } finally {
                          setVlogLoading(false)
                        }
                      }}
                    >
                      <div className={`gi-thumb ${v.thumbnailColor}`}>
                        <img src={coverForVlog(v)} alt={v.title}/>
                        <div className="gi-thumb-play">
                          <div className="gi-thumb-play-btn">
                            <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                          </div>
                        </div>
                        {v.credits > 0 ? <div className="gi-cred-badge">{v.credits} unlocks</div> : <div className="gi-cred-badge free">Free</div>}
                      </div>
                      <div className="gi-title">{v.title}</div>
                      <div className="gi-info">
                        <div className={`gi-info-avatar av ${v.author.avatarColor}`}>{v.author.initials}</div>
                        <div className="gi-info-handle">{v.views >= 1000 ? `${(v.views/1000).toFixed(1)}k` : v.views} views · {v.likes} likes</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Panel - Vlog Details */}
            {selectedMyVlogId && (
              <div key={selectedMyVlogId} className="gi-panel">
                {/* DETAILS MODE */}
                {dashboardMode === 'details' && selectedMyVlogId && (
                  <>
                    {vlogLoading ? (
                      <div style={{ padding:'20px', textAlign:'center', color:'var(--color-text-secondary)' }}>
                        <div style={{ fontSize:'14px', marginBottom:'10px' }}>Loading vlog details...</div>
                        <div style={{ display:'inline-block', width:'30px', height:'30px', border:'3px solid var(--gl)', borderTop:'3px solid var(--g)', borderRadius:'50%', animation:'spin 1s linear infinite' }}/>
                      </div>
                    ) : vlog && selectedMyVlogId === vlog.id ? (
                      <>
                        <div className="gi-panel-header">
                          <div className="gi-panel-source">
                            <div className={`gi-panel-source-icon av ${vlog.author.avatarColor}`}>{vlog.author.initials}</div>
                            <div className="gi-panel-handle">{vlog.author.handle}</div>
                          </div>
                          <div className="gi-panel-nav">
                            <button className="gi-panel-navbtn" title="Previous" onClick={() => {
                              const idx = myVlogs.findIndex(v => v.id === selectedMyVlogId)
                              if (idx > 0) {
                                const prevVlog = myVlogs[idx - 1]
                                setSelectedMyVlogId(prevVlog.id)
                                setVlogLoading(true)
                                fetch(`/api/vlogs/${prevVlog.id}`).then(r => r.json()).then(d => {
                                  setVlog(d)
                                  setLikeCount(d.likes)
                                  setLiked(false)
                                  setUnlocked(false)
                                  setReviewText('')
                                  setVlogLoading(false)
                                })
                              }
                            }}>
                              <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
                            </button>
                            <button className="gi-panel-navbtn" title="Next" onClick={() => {
                              const idx = myVlogs.findIndex(v => v.id === selectedMyVlogId)
                              if (idx < myVlogs.length - 1) {
                                const nextVlog = myVlogs[idx + 1]
                                setSelectedMyVlogId(nextVlog.id)
                                setVlogLoading(true)
                                fetch(`/api/vlogs/${nextVlog.id}`).then(r => r.json()).then(d => {
                                  setVlog(d)
                                  setLikeCount(d.likes)
                                  setLiked(false)
                                  setUnlocked(false)
                                  setReviewText('')
                                  setVlogLoading(false)
                                })
                              }
                            }}>
                              <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
                            </button>
                          </div>
                          <button className="gi-panel-close" onClick={() => { setSelectedMyVlogId(null); setDashboardMode('list') }}>×</button>
                        </div>
                        <div className="gi-panel-body">
                          {/* Media */}
                          <div className={`gi-panel-media${vlog.coverImage ? '' : ' ' + vlog.thumbnailColor}`}>
                            {getVlogEmbedUrl(vlog.youtubeUrl) ? (
                              <iframe key={`${vlog.id}-${autoplayVlogId === vlog.id ? 'autoplay' : 'player'}`} src={getVlogEmbedUrl(vlog.youtubeUrl) || ''} width="100%" height="100%" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen title={vlog.title}/>
                            ) : vlog.coverImage ? (
                              <img src={vlog.coverImage} alt={vlog.title}/>
                            ) : (
                              <>
                                <div style={{ position:'absolute', fontSize:'11px', background:'rgba(0,0,0,.6)', color:'#fff', padding:'4px 8px', borderRadius:'4px' }}>Preview</div>
                                <svg viewBox="0 0 24 24" width="40" height="40" style={{ stroke:'rgba(255,255,255,.6)', fill:'none', strokeWidth:1.5 }}>
                                  <polygon points="5 3 19 12 5 21 5 3"/>
                                </svg>
                              </>
                            )}
                            <button className="gi-panel-zoom" title="Expand">
                              <svg viewBox="0 0 24 24"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
                            </button>
                          </div>

                          <div className="won" style={{ marginTop:0, marginBottom:'14px' }}>
                            <span>Watch on:</span>
                            {vlog.youtubeUrl ? (
                              <a href={vlog.youtubeUrl} target="_blank" rel="noopener noreferrer" className="pp">
                                <span className="pdot" style={{ background:'#f00' }}/> YouTube ↗
                              </a>
                            ) : null}
                            {vlog.facebookUrl ? (
                              <a href={vlog.facebookUrl} target="_blank" rel="noopener noreferrer" className="pp">
                                <span className="pdot" style={{ background:'#1877f2' }}/> Facebook ↗
                              </a>
                            ) : null}
                            {vlog.tiktokUrl ? (
                              <a href={vlog.tiktokUrl} target="_blank" rel="noopener noreferrer" className="pp">
                                <span className="pdot" style={{ background:'#111' }}/> TikTok ↗
                              </a>
                            ) : null}
                            {vlog.instagramUrl ? (
                              <a href={vlog.instagramUrl} target="_blank" rel="noopener noreferrer" className="pp">
                                <span className="pdot" style={{ background:'#e1306c' }}/> Instagram ↗
                              </a>
                            ) : null}
                          </div>

                          {/* Title & Meta */}
                          <div className="gi-panel-title">{vlog.title}</div>
                          <div className="gi-panel-meta">
                            <span>📍 {vlog.location}</span>
                            {vlog.cost && <span>💰 {fmtCost(vlog.cost, vlog.currency)}</span>}
                            <span>⭐ {vlog.rating}</span>
                            {vlog.duration && <span>📅 {vlog.duration} days</span>}
                          </div>

                          {/* Description */}
                          {vlog.description && <div className="gi-panel-copy">{vlog.description}</div>}

                          {/* Actions */}
                          <div className="gi-panel-actions">
                            <button className="gi-panel-btn gi-panel-btn-primary" onClick={tLike}>
                              <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                              {likeCount}
                            </button>
                            <button className="gi-panel-btn gi-panel-btn-secondary">
                              <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                              {vlog.reviews.length}
                            </button>
                            <button className="gi-panel-btn gi-panel-btn-secondary" onClick={() => beginEditVlog(vlog)}>
                              <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                              Edit
                            </button>
                          </div>

                          {/* Unlock Box */}
                          {vlog.credits > 0 && !unlocked && (
                            <div style={{ padding:'12px', background:'var(--yl)', borderRadius:'10px', marginBottom:'14px' }}>
                              <div style={{ fontSize:'13px', fontWeight:600, color:'var(--y1)', marginBottom:'6px' }}>Unlock itinerary</div>
                              <div style={{ fontSize:'12px', color:'var(--y1)', marginBottom:'8px', opacity:0.8 }}>{vlog.credits} credits · ₱{vlog.credits * CREDIT_PESO_RATE}</div>
                              <button className="gi-panel-btn gi-panel-btn-primary" onClick={doUnlock} style={{ background:'var(--y)', color:'var(--y1)', fontSize:'12px', padding:'8px' }}>
                                Unlock
                              </button>
                            </div>
                          )}

                          {/* Itinerary */}
                          {vlog.itinerary && vlog.itinerary.length > 0 && (
                            <div className="gi-panel-itinerary">
                              <div className="gi-panel-section-title">Itinerary</div>
                              {vlog.itinerary.map(day => (
                                <div key={day.id} className="gi-itinerary-card">
                                  <div className="gi-itinerary-head">
                                    <div className="gi-itinerary-day">Day {day.day}</div>
                                    <div className="gi-itinerary-activity">{day.activity}</div>
                                  </div>
                                  {day.cost && <div className="gi-itinerary-detail">Estimated cost: PHP {day.cost.toLocaleString()}</div>}
                                  {day.highlights && <div className="dashboard-day-detail"><strong>Highlights:</strong> {day.highlights}</div>}
                                  {day.foodTips && <div className="dashboard-day-detail"><strong>Food tips:</strong> {day.foodTips}</div>}
                                  {day.gettingThere && <div className="dashboard-day-detail"><strong>Getting around:</strong> {day.gettingThere}</div>}
                                  {day.tips && <div className="dashboard-day-detail"><strong>Tips:</strong> {day.tips}</div>}
                                  {(() => {
                                    const dayMedia = mediaForDay(day)
                                    if (!dayMedia.length) return null
                                    return (
                                      <>
                                        <div className="detail-media-grid">
                                          {dayMedia.map((item, mediaIndex) => (
                                            <div
                                              key={`${item.url}-${mediaIndex}`}
                                              className="day-media-card"
                                              role="button"
                                              tabIndex={0}
                                              onClick={() => openMediaModal(`Day ${day.day} photos & videos`, dayMedia, mediaIndex)}
                                              onKeyDown={event => {
                                                if (event.key === 'Enter' || event.key === ' ') openMediaModal(`Day ${day.day} photos & videos`, dayMedia, mediaIndex)
                                              }}
                                            >
                                              {renderMediaPreview(item, `Day ${day.day} media ${mediaIndex + 1}`)}
                                              <span className="day-media-card-overlay">View</span>
                                            </div>
                                          ))}
                                        </div>
                                        <button type="button" className="day-media-open compact" onClick={() => openMediaModal(`Day ${day.day} photos & videos`, dayMedia, 0)}>
                                  View media ({dayMedia.length})
                                        </button>
                                      </>
                                    )
                                  })()}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Reviews */}
                          {vlog.reviews && vlog.reviews.length > 0 && (
                            <div style={{ marginTop:'16px' }}>
                              <div style={{ fontSize:'13px', fontWeight:600, marginBottom:'12px' }}>Reviews ({vlog.reviews.length})</div>
                              {vlog.reviews.slice(0, 3).map(review => (
                                <div key={review.id} style={{ padding:'10px', background:'var(--bg-secondary)', borderRadius:'6px', marginBottom:'8px', fontSize:'12px' }}>
                                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'4px' }}>
                                    <div style={{ fontWeight:600 }}>{review.authorName}</div>
                                    <div>{'⭐'.repeat(review.rating)}</div>
                                  </div>
                                  <div style={{ color:'var(--color-text-secondary)' }}>{review.text}</div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <div style={{ padding:'20px', textAlign:'center', color:'var(--color-text-secondary)' }}>
                        <div style={{ fontSize:'13px' }}>Vlog not found</div>
                      </div>
                    )}
                  </>
                )}

              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          NOTIFICATIONS
      ══════════════════════════════════════ */}
      {page === 'notif' && (
        <div className="page on">
          <div className="w">
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' }}>
              <span style={{ fontSize:'21px', fontWeight:700 }}>Notifications</span>
              <span style={{ fontSize:'13px', color:'var(--g)', cursor:'pointer', fontWeight:500 }} onClick={clrAll}>Mark all read</span>
            </div>
            <div className="nl">
              {[
                { id:'n1', bg:'var(--yl)', icon:'✦', text: <><strong>Janna P.</strong> unlocked &ldquo;Siargao in 7 days&rdquo; — you earned ₱16</>, time:'12 minutes ago' },
                { id:'n2', bg:'#f0f0ff', icon:'★', text: <><strong>Rico G.</strong> left a 5-star review — &ldquo;Totally worth the credits!&rdquo;</>, time:'3 hours ago' },
                { id:'n3', bg:'var(--gl)', icon:'👤', text: <><strong>Ana Cruz</strong> and 3 others started following you</>, time:'Yesterday' },
                { id:'n4', bg:'var(--yl)', icon:'✦', text: <><strong>Mark T.</strong> unlocked &ldquo;Siargao in 7 days&rdquo; — you earned ₱16</>, time:'Yesterday' },
                { id:'n5', bg:'var(--bl)', icon:'📈', text: <>&ldquo;Cebu island hopping&rdquo; is trending in PH — 408 new views this week</>, time:'2 days ago' },
              ].map(n => (
                <div key={n.id} className={`nr${!readN.has(n.id) && n.id !== 'n5' ? ' ur' : ''}`} onClick={() => rdN(n.id)}>
                  <div className="nic" style={{ background:n.bg }}>{n.icon}</div>
                  <div style={{ flex:1 }}>
                    <div className="ntx">{n.text}</div>
                    <div className="ntm">{n.time}</div>
                  </div>
                  {!readN.has(n.id) && n.id !== 'n5' && <div className="nd2"/>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {mediaModal && activeModalItem && (
        <div className="media-modal" role="dialog" aria-modal="true" aria-label={mediaModal.title}>
          <div className="media-modal-shell">
            <div className="media-modal-head">
              <div className="media-modal-title">{mediaModal.title}</div>
              <button type="button" className="media-modal-close" aria-label="Close media carousel" onClick={() => setMediaModal(null)}>x</button>
            </div>
            <div className="media-modal-stage">
              {mediaModal.items.length > 1 && (
                <button type="button" className="media-modal-nav prev" aria-label="Previous media" onClick={() => shiftMediaModal(-1)}>
                  <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
              )}
              {activeModalItem.type === 'video' && clipPreviewUrl(activeModalItem.url) ? (
                <iframe src={clipPreviewUrl(activeModalItem.url) || ''} title={mediaModal.title} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
              ) : activeModalItem.type === 'video' && directVideoUrl(activeModalItem.url) ? (
                <video src={activeModalItem.url} controls autoPlay playsInline />
              ) : activeModalItem.type === 'video' ? (
                <a className="media-modal-link-preview" href={activeModalItem.url} target="_blank" rel="noopener noreferrer">
                  <span>Open short clip</span>
                  <strong>{activeModalItem.url}</strong>
                </a>
              ) : (
                <img src={activeModalItem.url} alt={`${mediaModal.title} ${mediaModal.index + 1}`} />
              )}
              {mediaModal.items.length > 1 && (
                <button type="button" className="media-modal-nav next" aria-label="Next media" onClick={() => shiftMediaModal(1)}>
                  <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              )}
            </div>
            <div className="media-modal-footer">
              <div className="media-modal-count">{mediaModal.index + 1} / {mediaModal.items.length}</div>
              <div className="media-modal-thumbs">
                {mediaModal.items.map((item, index) => (
                  <button
                    key={`${item.url}-${index}`}
                    type="button"
                    className={`media-modal-thumb${index === mediaModal.index ? ' on' : ''}`}
                    aria-label={`Show media ${index + 1}`}
                    onClick={() => setMediaModal(current => current ? { ...current, index } : current)}
                  >
                    {renderMediaPreview(item, `${mediaModal.title} thumbnail ${index + 1}`)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
