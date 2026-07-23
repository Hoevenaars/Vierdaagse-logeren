export const languages = {
  nl: 'Nederlands',
  en: 'English',
  de: 'Deutsch',
} as const;

export type Locale = keyof typeof languages;

export const defaultLocale: Locale = 'nl';

export const ui = {
  nl: {
    'nav.camping': 'Camping',
    'nav.particulier': 'Particulier',
    'nav.hotels': 'Hotels & B&B',
    'nav.gebieden': 'Gebieden',
    'nav.gids': 'Gids',
    'nav.faq': 'Veelgestelde vragen',
    'nav.overons': 'Over ons',
    'home.h1': 'Op tijd een slaapplek voor de Vierdaagse',
    'home.intro':
      'Elk jaar weer hetzelfde: de Vierdaagse trekt duizenden wandelaars en bezoekers naar Nijmegen, en het aantal overnachtingsplekken groeit niet mee. Wie op tijd is, heeft ruime keuze. Wie wacht, betaalt meer voor minder. Vierdaagse Logeren helpt je op tijd de juiste plek te vinden — camping, particulier of hotel.',
    'card.camping.title': 'Camping',
    'card.camping.text': 'Kamperen tijdens de Vierdaagse-week.',
    'card.particulier.title': 'Particuliere verhuur',
    'card.particulier.text': 'Een kamer, tuin of oprit bij iemand thuis.',
    'card.hotels.title': 'Hotels & B&B',
    'card.hotels.text': 'Meer comfort en privacy.',
    'footer.disclosure':
      'Deze site bevat affiliate-links. Vierdaagse Logeren is onafhankelijk van Stichting DE4D en de gemeente Nijmegen.',
  },
  en: {
    'nav.camping': 'Camping',
    'nav.particulier': 'Private stays',
    'nav.hotels': 'Hotels & B&B',
    'nav.gebieden': 'Areas',
    'nav.gids': 'Guide',
    'nav.faq': 'FAQ',
    'nav.overons': 'About us',
    'home.h1': 'Book your Four Days Marches stay in time',
    'home.intro':
      'Every year the same story: the Four Days Marches brings thousands of walkers and visitors to Nijmegen, and the number of places to stay does not grow with it. Book early and you have plenty of choice. Wait, and you pay more for less. Vierdaagse Logeren helps you find the right place in time — camping, a private stay, or a hotel.',
    'card.camping.title': 'Camping',
    'card.camping.text': 'Camping during Four Days Marches week.',
    'card.particulier.title': 'Private stays',
    'card.particulier.text': 'A room, garden, or driveway at someone\u2019s home.',
    'card.hotels.title': 'Hotels & B&B',
    'card.hotels.text': 'More comfort and privacy.',
    'footer.disclosure':
      'This site contains affiliate links. Vierdaagse Logeren is independent from Stichting DE4D and the municipality of Nijmegen.',
  },
  de: {
    'nav.camping': 'Camping',
    'nav.particulier': 'Privatunterkunft',
    'nav.hotels': 'Hotels & B&B',
    'nav.gebieden': 'Regionen',
    'nav.gids': 'Ratgeber',
    'nav.faq': 'Häufige Fragen',
    'nav.overons': 'Über uns',
    'home.h1': 'Rechtzeitig eine Unterkunft für den Vierdaagse',
    'home.intro':
      'Jedes Jahr dasselbe: Der Vierdaagse bringt Tausende Wanderer und Besucher nach Nijmegen, doch das Unterkunftsangebot wächst nicht mit. Wer früh bucht, hat die Wahl. Wer wartet, zahlt mehr für weniger. Vierdaagse Logeren hilft dir, rechtzeitig die richtige Unterkunft zu finden — Camping, privat oder Hotel.',
    'card.camping.title': 'Camping',
    'card.camping.text': 'Campen während der Vierdaagse-Woche.',
    'card.particulier.title': 'Privatunterkunft',
    'card.particulier.text': 'Ein Zimmer, Garten oder Stellplatz bei Privatpersonen.',
    'card.hotels.title': 'Hotels & B&B',
    'card.hotels.text': 'Mehr Komfort und Privatsphäre.',
    'footer.disclosure':
      'Diese Website enthält Affiliate-Links. Vierdaagse Logeren ist unabhängig von der Stichting DE4D und der Gemeinde Nijmegen.',
  },
} as const;
