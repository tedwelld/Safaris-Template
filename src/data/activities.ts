export interface Activity {
  id: string;
  title: string;
  region: 'Victoria Falls, Zimbabwe' | 'Livingstone & Zambezi, Zambia';
  duration: string;
  description: string;
  details: string;
  note: string;
  priceUsd: number | null;
  icon: string;
}

// Add approved per-person USD rates here. null means a personalised quote is required.
export const activities: Activity[] = [
  { id: 'falls-zimbabwe', title: 'Guided Victoria Falls walk', region: 'Victoria Falls, Zimbabwe', duration: 'Allow 2–3 hours', icon: 'pi-map', priceUsd: null,
    description: 'Explore the rainforest paths and viewpoints overlooking the Falls with a guide, with time for photographs and stories about the landscape.',
    details: 'A walking experience for visitors who want to see the Falls up close. Expect uneven paths, steps and spray; bring comfortable shoes and protection for cameras.',
    note: 'Ask for park entrance fees, transfers and accessibility arrangements in your quote.' },
  { id: 'cruise-zimbabwe', title: 'Zambezi sunset cruise', region: 'Victoria Falls, Zimbabwe', duration: 'Allow 2–3 hours', icon: 'pi-sun', priceUsd: null,
    description: 'Unwind on the upper Zambezi as the evening light changes over the river. Watch for birds and animals along the banks.',
    details: 'A relaxed boat outing suited to a slower-paced afternoon. Wildlife sightings are never guaranteed; boat type, drinks and meals depend on the selected cruise.',
    note: 'Confirm transfers, refreshments and river fees with your chosen departure.' },
  { id: 'flight-zimbabwe', title: 'Helicopter flight over the Falls', region: 'Victoria Falls, Zimbabwe', duration: 'Flight length confirmed on quote', icon: 'pi-send', priceUsd: null,
    description: 'See the Falls, the river and the surrounding gorge from the air on a scenic helicopter flight.',
    details: 'Choose a flight option with the team before booking. Check-in and transfers add time beyond the flight itself.',
    note: 'Weather, aircraft availability and operator weight limits apply. Flight routes and duration must be confirmed.' },
  { id: 'rafting', title: 'Batoka Gorge white-water rafting', region: 'Victoria Falls, Zimbabwe', duration: 'Allow a full day; route dependent', icon: 'pi-bolt', priceUsd: null,
    description: 'Join a guided rafting adventure on the Zambezi below the Falls, travelling through the dramatic Batoka Gorge.',
    details: 'An active outing involving rapids and access into and out of the gorge. The operator will assess swimming ability, fitness and suitability before confirming.',
    note: 'Routes and departures depend on river levels. Minimum ages and safety requirements are operator-specific.' },
  { id: 'game-drive', title: 'Zambezi National Park game drive', region: 'Victoria Falls, Zimbabwe', duration: 'Half-day options', icon: 'pi-compass', priceUsd: null,
    description: 'Explore the bush and river landscapes in a safari vehicle with a guide, looking for wildlife and learning about the local environment.',
    details: 'Morning and afternoon outings offer different light and wildlife opportunities. Sightings vary naturally and cannot be guaranteed.',
    note: 'Confirm park fees, transfers, vehicle arrangements and child age policies in advance.' },
  { id: 'falls-zambia', title: 'Mosi-oa-Tunya Falls walk', region: 'Livingstone & Zambezi, Zambia', duration: 'Allow 2–3 hours', icon: 'pi-map', priceUsd: null,
    description: 'Discover the Zambian viewpoints of Victoria Falls on a guided walk, with changing perspectives on the river and gorge.',
    details: 'Water levels change the experience through the year: spray can be intense at high water and some sections can be dry at low water.',
    note: 'Park fees and transfers are confirmed in your quote. Cross-border travel may require separate documents and fees.' },
  { id: 'island', title: 'Livingstone Island visit', region: 'Livingstone & Zambezi, Zambia', duration: 'Scheduled guided excursion', icon: 'pi-map-marker', priceUsd: null,
    description: 'Visit Livingstone Island with an authorised guide for a close view of the Falls from the Zambian side.',
    details: 'Ask about the available island visit and meal options. A Devil’s Pool experience is a separate, conditional possibility and is never guaranteed with an island enquiry.',
    note: 'Access and any swimming depend on river levels and operator approval. Age, health and safety restrictions apply.' },
  { id: 'cruise-zambia', title: 'Livingstone sunset river cruise', region: 'Livingstone & Zambezi, Zambia', duration: 'Allow 2–3 hours', icon: 'pi-sun', priceUsd: null,
    description: 'Depart from the Livingstone side for an evening on the upper Zambezi, taking in river scenery and watching for birdlife.',
    details: 'A gentle alternative to an adventure activity. Tell us whether you prefer a simple cruise or an option with a meal.',
    note: 'Boat, meal, drinks, transfers and river fees vary by package; your quote will itemise them.' },
  { id: 'canoe-zambia', title: 'Upper Zambezi canoe safari', region: 'Livingstone & Zambezi, Zambia', duration: 'Half-day or full-day options', icon: 'pi-compass', priceUsd: null,
    description: 'Paddle sections of the upper Zambezi with a specialist guide, exploring channels and observing the riverside environment.',
    details: 'An active river experience requiring attention to the guide’s instructions. Share your paddling experience and any mobility needs before booking.',
    note: 'Routes, fitness requirements and age limits depend on conditions and the selected operator.' },
  { id: 'livingstone-culture', title: 'Livingstone town & cultural visit', region: 'Livingstone & Zambezi, Zambia', duration: 'Half-day options', icon: 'pi-users', priceUsd: null,
    description: 'Explore Livingstone’s history and daily life with a local guide, with an itinerary shaped around your interest in markets, heritage and culture.',
    details: 'Discuss the stops you would like to include, such as a museum or craft market. Community visits depend on host availability and permission.',
    note: 'Museum entries, purchases and transfers are quoted separately unless explicitly included.' },
];
export const money = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
export function calculateTotal(items: Activity[], pax: number) {
  const validPax = Number.isInteger(pax) && pax >= 1 && pax <= 100;
  const subtotal = validPax ? items.reduce((sum, item) => sum + (item.priceUsd ?? 0) * pax, 0) : 0;
  return { subtotal, complete: validPax && items.length > 0 && items.every(item => item.priceUsd !== null), unpriced: items.filter(item => item.priceUsd === null).length };
}
