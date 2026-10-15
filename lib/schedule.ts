export interface ServiceInfo {
  name: string;
  day: string;
  time: string;
  tagline: string;
  computedDate: Date;
}

export function getThirdThursday(year: number, month: number): Date {
  // month is 0-indexed (0 = January, 11 = December)
  let thursdayCount = 0;
  for (let day = 1; day <= 31; day++) {
    const date = new Date(year, month, day, 18, 0, 0); // Power Night is 6:00 PM (18:00)
    if (date.getMonth() !== month) break;
    if (date.getDay() === 4) { // 4 = Thursday
      thursdayCount++;
      if (thursdayCount === 3) {
        return date;
      }
    }
  }
  return new Date();
}

export function getUpcomingServices(): ServiceInfo[] {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const services: { name: string; dayIndex: number; hour: number; minute: number; tagline: string }[] = [
    { name: 'Sunday Worship Service', dayIndex: 0, hour: 8, minute: 0, tagline: 'Come hungry for the Word and experience the fullness of His glory.' },
    { name: 'Bible Study', dayIndex: 1, hour: 18, minute: 0, tagline: 'Deep-dive study into the scriptures for spiritual maturity and strength.' },
    { name: 'Revival Hour', dayIndex: 4, hour: 17, minute: 0, tagline: 'A high-impact prayer hour of healing, deliverance, and restoration.' },
  ];

  const list: ServiceInfo[] = [];

  // 1. Regular weekly services
  services.forEach((s) => {
    // Get the date of this service in the current week
    const serviceDate = new Date(now);
    const daysDiff = (s.dayIndex - now.getDay() + 7) % 7;
    serviceDate.setDate(now.getDate() + daysDiff);
    serviceDate.setHours(s.hour, s.minute, 0, 0);

    // If it has passed today, move to next week
    if (serviceDate < now) {
      serviceDate.setDate(serviceDate.getDate() + 7);
    }

    list.push({
      name: s.name,
      day: s.dayIndex === 0 ? 'Sunday' : s.dayIndex === 1 ? 'Monday' : 'Thursday',
      time: s.hour >= 12 ? `${s.hour - 12 || 12}:00 PM` : `${s.hour}:00 AM`,
      tagline: s.tagline,
      computedDate: serviceDate,
    });
  });

  // 2. Power Night (3rd Thursday)
  // Check current month first
  let powerNightDate = getThirdThursday(currentYear, currentMonth);
  if (powerNightDate < now) {
    // Already passed this month, compute for next month
    if (currentMonth === 11) {
      powerNightDate = getThirdThursday(currentYear + 1, 0);
    } else {
      powerNightDate = getThirdThursday(currentYear, currentMonth + 1);
    }
  }

  list.push({
    name: 'Power Night',
    day: '3rd Thursday',
    time: '6:00 PM',
    tagline: 'An atmospheric night of intense deliverance, raw prayers, and supernatural miracles.',
    computedDate: powerNightDate,
  });

  // Sort services by closest upcoming date
  list.sort((a, b) => a.computedDate.getTime() - b.computedDate.getTime());

  return list;
}

export function getNextService(): ServiceInfo {
  const list = getUpcomingServices();
  return list[0];
}

export function formatServiceDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  return date.toLocaleDateString('en-US', options);
}
