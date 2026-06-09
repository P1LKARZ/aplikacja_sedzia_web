// // seedFirestore.js lub np. tymczasowy komponent React
// import { collection, setDoc, doc } from 'firebase/firestore';
// import { db } from './firebase';

// // WYWOŁAJ TĘ FUNKCJĘ RAZ
// export async function seedFirestore() {
//   // 1. DANE – ZMIEŃ NA SWOJE
//  const DRUZYNY = [
//   { id: 3,  nazwa: "Kolonia Bolesławiec",          platnosc: "delegacja" },
//   { id: 4,  nazwa: "Olsza Olszyna",                platnosc: "delegacja" },
//   { id: 5,  nazwa: "Łużyce Lubań",                 platnosc: "delegacja" },
//   { id: 6,  nazwa: "Orzeł Gościszów",              platnosc: "delegacja" },
//   { id: 7,  nazwa: "Granit Gierałtów",             platnosc: "delegacja" },
//   { id: 8,  nazwa: "Granica Miłoszów",             platnosc: "delegacja" },
//   { id: 9,  nazwa: "Parasol Wrocław",              platnosc: "delegacja" },
//   { id: 10, nazwa: "Jaworzanka Jawor",             platnosc: "delegacja" },
//   { id: 11, nazwa: "Bazalt Sulików",               platnosc: "delegacja" },
//   { id: 12, nazwa: "Przyszłość Dłużyna",           platnosc: "delegacja" },
//   { id: 13, nazwa: "LZS Brzeźnik",                 platnosc: "delegacja" },
//   { id: 14, nazwa: "Sparta Zebrzydowa",            platnosc: "delegacja" },
//   { id: 15, nazwa: "Olimpia Kamienna Góra",        platnosc: "delegacja" },
//   { id: 16, nazwa: "Royal Biedrzychowice",         platnosc: "delegacja" },
//   { id: 17, nazwa: "Czarni Lwówek",                platnosc: "delegacja" },
//   { id: 18, nazwa: "Apis Jędrzychowice",           platnosc: "delegacja" },
//   { id: 19, nazwa: "Chrobry Nowogrodziec",         platnosc: "delegacja" },
//   { id: 20, nazwa: "KS Łomnica",                   platnosc: "delegacja" },
//   { id: 21, nazwa: "Piast Czerwona Woda",          platnosc: "delegacja" },
//   { id: 22, nazwa: "LKS Ocice",                    platnosc: "delegacja" },
//   { id: 23, nazwa: "Zjednoczeni Nowogrodziec",     platnosc: "delegacja" },
//   { id: 24, nazwa: "KS Milików",                   platnosc: "delegacja" },
//   { id: 25, nazwa: "KS Czerna",                    platnosc: "delegacja" },
//   { id: 26, nazwa: "Chmielanka Chmieleń",          platnosc: "delegacja" },
//   { id: 27, nazwa: "Włókniarz Leśna",              platnosc: "delegacja" },
//   { id: 28, nazwa: "Iskra Kochlice",               platnosc: "delegacja" },
//   { id: 29, nazwa: "Stare Jaroszowice",            platnosc: "delegacja" },
//   { id: 30, nazwa: "Chrobry Głogów",               platnosc: "delegacja" },
//   { id: 31, nazwa: "GKS Raciborowice",             platnosc: "delegacja" },
//   { id: 32, nazwa: "Granica Bogatynia",            platnosc: "delegacja" },
//   { id: 33, nazwa: "Łużycka Akademia Sportu",      platnosc: "delegacja" },
//   { id: 34, nazwa: "LZS Niwnice",                  platnosc: "delegacja" },
//   { id: 35, nazwa: "Sudety Giebułtów",             platnosc: "delegacja" },
//   { id: 36, nazwa: "LZS Kościelnik",               platnosc: "delegacja" },
//   { id: 37, nazwa: "Włókniarz Mirsk",              platnosc: "delegacja" },
//   { id: 38, nazwa: "Orzeł Mysłakowice",            platnosc: "delegacja" },
//   { id: 39, nazwa: "Cosmos Radzimów",              platnosc: "delegacja" },
//   { id: 40, nazwa: "Nysa Zgorzelec",               platnosc: "delegacja" },
//   { id: 41, nazwa: "Victoria Jelenia Góra",        platnosc: "delegacja" },
//   { id: 42, nazwa: "Błęktni Studniska",            platnosc: "delegacja" },
//   { id: 43, nazwa: "Legend Squad Radogoszcz",      platnosc: "delegacja" },
//   { id: 45, nazwa: "GKS Warta Bolesławiecka",      platnosc: "edelegacja" },
//   { id: 46, nazwa: "GKS Gromadka",                 platnosc: "edelegacja" },
//   { id: 47, nazwa: "Piast Zawidów",                platnosc: "edelegacja" },
//   { id: 48, nazwa: "Orzeł Platerówka",             platnosc: "edelegacja" },
//   { id: 49, nazwa: "Górnik Polkowice",             platnosc: "edelegacja" },
//   { id: 50, nazwa: "Orzeł Platerówka",             platnosc: "edelegacja" },
//   { id: 51, nazwa: "Stella Lubomierz",             platnosc: "edelegacja" },
//   { id: 52, nazwa: "Victoria Ruszów",              platnosc: "edelegacja" },
//   { id: 53, nazwa: "Iskra Łagów",                  platnosc: "edelegacja" },
//   { id: 54, nazwa: "Leśnik Osiecznica",            platnosc: "edelegacja" },
//   { id: 55, nazwa: "KS Czerna",                    platnosc: "edelegacja" },
//   { id: 56, nazwa: "Football Academy",             platnosc: "edelegacja" },
//   { id: 57, nazwa: "Hutnik Pieńsk",                platnosc: "edelegacja" },
//   { id: 58, nazwa: "GKS Tomaszów",                 platnosc: "edelegacja" },
//   { id: 59, nazwa: "WKS Żarki Średnie",            platnosc: "edelegacja" },
//   { id: 60, nazwa: "Gryf Gryfów",                  platnosc: "edelegacja" },
//   { id: 61, nazwa: "Moto-Jelcz Oława",             platnosc: "edelegacja" },
//   { id: 62, nazwa: "Lotnik Jeżów Sudecki",         platnosc: "edelegacja" },
//   { id: 63, nazwa: "BKS Bolesławiec",              platnosc: "edelegacja" },
//   { id: 64, nazwa: "Olimpia Kowary",               platnosc: "edelegacja" },
//   { id: 65, nazwa: "Majdan Bolesławice",           platnosc: "edelegacja" },
//   { id: 66, nazwa: "Korona Radostów",              platnosc: "edelegacja" },
//   { id: 67, nazwa: "Górnik Węgliniec",             platnosc: "edelegacja" },
//   { id: 68, nazwa: "Zryw Ubocze",                  platnosc: "edelegacja" },
//   { id: 69, nazwa: "KKS Jelenia Góra",             platnosc: "edelegacja" },
//   { id: 70, nazwa: "GKS Iwiny",                    platnosc: "edelegacja" },
//   { id: 71, nazwa: "LZS Nowa",                     platnosc: "edelegacja" },
//   { id: 72, nazwa: "LKS Mierzwin",                 platnosc: "edelegacja" },
//   { id: 73, nazwa: "KS Kotliska",                  platnosc: "edelegacja" },
//   { id: 74, nazwa: "Pogoń Świerzawa",              platnosc: "edelegacja" },
//   { id: 75, nazwa: "Dąbrowa Bolesławiecka",        platnosc: "edelegacja" },
//   { id: 76, nazwa: "Bielawianka Bielawa",          platnosc: "edelegacja" },
//   { id: 77, nazwa: "Bielawianka Bielawa",          platnosc: "edelegacja" },
//   { id: 78, nazwa: "Piast Wykroty",                platnosc: "delegacja" },
//   { id: 79, nazwa: "Znicz Kruszyn",                platnosc: "delegacja" },
//   { id: 80, nazwa: "Miedź Legnica",                platnosc: "edelegacja" },
//   { id: 81, nazwa: "Śląsk Wrocław",                platnosc: "edelegacja" },
//   { id: 82, nazwa: "Lechia Zielona Góra",          platnosc: "edelegacja" },
//   { id: 83, nazwa: "Twardy Świętoszów",            platnosc: "delegacja" },
//   { id: 84, nazwa: "Fatma Pobiedna",               platnosc: "delegacja" },
//   { id: 85, nazwa: "KS Maciejowa",                 platnosc: "delegacja" },
//   { id: 86, nazwa: "Juvenia Rybnica",              platnosc: "delegacja" },
//   { id: 87, nazwa: "UKS Gminy Miękinia",           platnosc: "edelegacja" },
//   { id: 88, nazwa: "KS Górnik Sosnowiec",          platnosc: "edelegacja" },
//   { id: 89, nazwa: "Chaos Wrocław",                platnosc: "edelegacja" },
//   { id: 90, nazwa: "KU AZS UZ Zielona Góra",       platnosc: "edelegacja" },
//   { id: 91, nazwa: "GKS Mirków-Długołęka",         platnosc: "edelegacja" },
//   { id: 92, nazwa: "Lechia Dzierżoniów",           platnosc: "edelegacja" },
// ];  
//  const SEDZIOWIE = [
//   { id: 4,  imie: "Maciej Kwiecień" },
//   { id: 5,  imie: "Maciej Michałeczko" },
//   { id: 6,  imie: "Maciej Michałeczko" },
//   { id: 7,  imie: "Aneta Bargiel" },
//   { id: 8,  imie: "Sławomir Turkiewicz" },
//   { id: 9,  imie: "Igor Jaśkiewicz" },
//   { id: 11, imie: "Bartek Gajewnik" },
//   { id: 12, imie: "Marcin Kozioł" },
//   { id: 13, imie: "Piotr Bajer" },
//   { id: 14, imie: "Tomasz Sobol" },
//   { id: 15, imie: "Ja" },
//   { id: 16, imie: "Filip Grzesiak" },
//   { id: 17, imie: "Marcin Zapiór" },
//   { id: 18, imie: "Sławomir Dmuchowski" },
//   { id: 19, imie: "Krystian Ołota" },
//   { id: 20, imie: "Sławomir Wydysz" },
//   { id: 21, imie: "Maciej Dobrowolski" },
//   { id: 22, imie: "Konrad Małachowski" },
//   { id: 23, imie: "Kuba Kowalczyk" },
//   { id: 24, imie: "Kacper Kłobut" },
// ];

//  const POZIOMY = [
//   { id: 1,  nazwa: "A SG",                          kasa: 199, podatek: 21 },
//   { id: 2,  nazwa: "A SA",                          kasa: 154, podatek: 16 },
//   { id: 3,  nazwa: "B SG",                          kasa: 176, podatek: 19 },
//   { id: 4,  nazwa: "B SA",                          kasa: 131, podatek: 14 },
//   { id: 5,  nazwa: "Okręgówka SA",                  kasa: 212, podatek: 23 },
//   { id: 6,  nazwa: "Okręgówka SG",                  kasa: 262, podatek: 28 },
//   { id: 7,  nazwa: "IV Liga SA",                    kasa: 240, podatek: 25 },
//   { id: 8,  nazwa: "LDJ Starszych SG",              kasa: 185, podatek: 20 },
//   { id: 9,  nazwa: "LDJ Starszych SA",              kasa: 149, podatek: 16 },
//   { id: 10, nazwa: "LDJ Młodszych SG",              kasa: 176, podatek: 19 },
//   { id: 11, nazwa: "LDJ Młodszych SA",              kasa: 140, podatek: 15 },
//   { id: 12, nazwa: "O Juniorów SG",                 kasa: 136, podatek: 14 },
//   { id: 13, nazwa: "O juniorów SA",                 kasa: 104, podatek: 15 },
//   { id: 14, nazwa: "O juniorów młodszych SG",       kasa: 122, podatek: 13 },
//   { id: 15, nazwa: "O juniorów młodszych SA",       kasa: 95,  podatek: 10 },
//   { id: 16, nazwa: "Wojewódzka młodzik/trampkarz SG", kasa: 108, podatek: 12 },
//   { id: 17, nazwa: "Wojewódzka młodzik/trampkarz SA", kasa: 99,  podatek: 11 },
//   { id: 18, nazwa: "Trampkarz",                     kasa: 99,  podatek: 12 },
//   { id: 19, nazwa: "Młodzik",                       kasa: 86,  podatek: 9 },
//   { id: 20, nazwa: "CLJ U17",                       kasa: 226, podatek: 28 },
//   { id: 21, nazwa: "Czasowy II Liga Futsalu",       kasa: 200, podatek: 24 },
// ];



//   // DRUZYNY
//   for (const d of DRUZYNY) {
//     const ref = doc(db, 'public', 'druzyny', 'info', String(d.id));
//     await setDoc(ref, { nazwa: d.nazwa, platnosc: d.platnosc });
//   }

//   // POZIOMY
//   for (const p of POZIOMY) {
//     const ref = doc(db, 'public', 'poziom', 'info', String(p.id));
//     await setDoc(ref, { nazwa: p.nazwa, kasa: p.kasa, podatek: p.podatek });
//   }

//   // SEDZIOWIE
//   for (const s of SEDZIOWIE) {
//     const ref = doc(db, 'public', 'sedziowie', 'info', String(s.id));
//     await setDoc(ref, { imie: s.imie });
//   }

//   console.log('Seed zakończony');
// }
