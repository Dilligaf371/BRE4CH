import { useState, useEffect, useCallback } from 'react';

export type SocmintPlatform = 'telegram' | 'snapchat' | 'x';
export type SocmintSeverity = 'critical' | 'high' | 'medium' | 'low';

export interface SocmintItem {
  id: string;
  platform: SocmintPlatform;
  source: string;
  content: string;
  timestamp: number;
  severity: SocmintSeverity;
  language: string;
  location?: string;
  flagged: boolean;
}

const TELEGRAM_GROUPS = [
  'IRGC_QF_Ops', 'Sepah_Pasdaran', 'BasijResistance', 'Ansar_Allah_Media',
  'PMU_Iraq_Ops', 'Kataib_Hzbllh', 'IranDefenseWatch', 'PersianGulfMil',
  'QasemSoleimani_Legacy', 'ResistanceAxis_EN', 'IRNA_MilNews', 'TehranTimes_Def',
];

const SNAPCHAT_SOURCES = [
  'Snap Map Tehran', 'Snap Map Isfahan', 'Snap Map Bandar Abbas', 'Snap Map Shiraz',
  'Snap Map Tabriz', 'Snap Map Kharg Island', 'Snap Map Bushehr', 'Snap Map Arak',
];

const X_ACCOUNTS = [
  '@ABORAGIB1', '@IntelCrab', '@sentdefender', '@TehranTimes79', '@AuroraIntel',
  '@ELINTNews', '@claborquaye', '@OSINTdefender', '@WarMonitors', '@IranIntl_En',
  '@RALee85', '@IsraelRadar_', '@AirDefenseNet', '@GeoConfirmed', '@MarQs__',
];

const X_MESSAGES: { content: string; severity: SocmintSeverity }[] = [
  { content: 'BREAKING: Satellite imagery shows new fires at Parchin military complex following second wave of strikes', severity: 'critical' },
  { content: 'CONFIRMED: IRGC Aerospace Force TEL convoy spotted moving south on Route 71 — 4x Shahab-3 launchers', severity: 'critical' },
  { content: 'Multiple amateur videos showing SAM launches from Tehran — S-300 battery at Imam Khomeini active', severity: 'high' },
  { content: 'OSINT: Flight radar shows all Iranian airspace now NOTAM restricted — total military control', severity: 'high' },
  { content: 'IDF spokesperson confirms Arrow-3 exo-atmospheric intercepts over Jordan — debris field in Syrian desert', severity: 'high' },
  { content: 'Unverified: Reports of explosions near Kharg Island oil terminal — oil price spike $8/barrel', severity: 'high' },
  { content: 'CENTCOM releases video of DDG-121 USS Frank E. Petersen Jr. firing Standard Missiles at Iranian BMs', severity: 'medium' },
  { content: 'Analysis: Iran has now expended estimated 60% of its medium-range ballistic missile stockpile in 36 hours', severity: 'medium' },
  { content: 'Dubai airports resuming limited operations after overnight closures due to drone threat — Emirates rerouting', severity: 'medium' },
  { content: 'GEOINT: Before/after imagery of Isfahan 8th TAB shows 3 hangars destroyed, runway cratered at 2 points', severity: 'high' },
  { content: 'IRGC Telegram channels claiming successful strike on Nevatim AB — IDF denies significant damage', severity: 'medium' },
  { content: 'Kuwait MoD: 97 ballistic missiles and 283 drones intercepted over Kuwaiti territory in past 24 hours', severity: 'critical' },
];

const TELEGRAM_MESSAGES: { content: string; severity: SocmintSeverity; language: string }[] = [
  { content: 'ادعای حمله هوایی به اصفهان - آتش‌سوزی گسترده گزارش شده', severity: 'critical', language: 'FA' },
  { content: 'تصاویر سقوط پهپاد در نزدیکی پایگاه هوایی شیراز', severity: 'high', language: 'FA' },
  { content: 'گزارش حرکت کاروان نظامی در جاده تهران-اصفهان', severity: 'high', language: 'FA' },
  { content: 'VIDEO: Anti-aircraft fire visible over Tehran skyline - multiple SAMs launched', severity: 'critical', language: 'EN' },
  { content: 'صدای انفجار شدید در اطراف نطنز - ساکنان در پناهگاه', severity: 'critical', language: 'FA' },
  { content: 'PMU sources confirm rocket launch against Al Udeid - unverified', severity: 'high', language: 'EN' },
  { content: 'تحرکات نظامی غیرعادی در بندرعباس - ناوچه‌ها از بندر خارج شدند', severity: 'high', language: 'FA' },
  { content: 'Resistance forces claim downing of US MQ-9 drone near Natanz', severity: 'medium', language: 'EN' },
  { content: 'آژیر خطر در خارک - تخلیه کارکنان پایانه نفتی آغاز شد', severity: 'critical', language: 'FA' },
  { content: 'Secondary explosions reported Parchin military complex - SIGACT', severity: 'critical', language: 'EN' },
  { content: 'گروه بسیج: بسیج سراسری نیروها در سراسر تهران', severity: 'medium', language: 'FA' },
  { content: 'Kataib claims successful attack on Camp Arifjan Kuwait - not confirmed by CENTCOM', severity: 'high', language: 'EN' },
  { content: 'آتش‌سوزی در پالایشگاه آبادان پس از اصابت موشک', severity: 'high', language: 'FA' },
  { content: 'IRGCN fast boats departing Jask - heading toward Strait of Hormuz', severity: 'high', language: 'EN' },
  { content: 'منابع مقاومت: سامانه اس-300 تهران فعال و آتشباری می‌کند', severity: 'medium', language: 'FA' },
  { content: 'Ansar Allah media wing claims Houthi drone launched toward Nevatim AB', severity: 'high', language: 'EN' },
  { content: 'قطع اینترنت در استان اصفهان - جنگ سایبری ادامه دارد', severity: 'medium', language: 'FA' },
  { content: 'FLASH: Tunnels near Fordow showing unusual vehicle traffic on satellite', severity: 'critical', language: 'EN' },
];

const SNAPCHAT_MESSAGES: { content: string; severity: SocmintSeverity }[] = [
  { content: 'Geolocated video: Large fire visible from Isfahan industrial zone - matching UCF coords', severity: 'critical' },
  { content: 'Crowd panic footage Tehran Valiasr Square - air raid sirens active', severity: 'high' },
  { content: 'Snap Map heat activity spike: Bandar Abbas port area - military movement', severity: 'high' },
  { content: 'User footage: Contrails over Shiraz consistent with ballistic intercept', severity: 'medium' },
  { content: 'Geolocated: Smoke column Parchin military complex - 35.52N 51.77E', severity: 'critical' },
  { content: 'Crowd gathering Bushehr - reports of evacuation order for NPP perimeter', severity: 'high' },
  { content: 'Night vision footage: Anti-aircraft fire Tabriz - multiple bursts', severity: 'medium' },
  { content: 'Snap Map: Road closures Tehran-Qom highway - military checkpoints', severity: 'medium' },
  { content: 'GEOLOCATED: Fires at Kharg Island oil terminal - matching P1 target coords', severity: 'critical' },
  { content: 'User video: Low-flying aircraft over Arak - possibly cruise missiles', severity: 'high' },
  { content: 'Snap activity drop-off Isfahan region - possible internet shutdown', severity: 'medium' },
  { content: 'Multiple users reporting explosions near Semnan space center', severity: 'high' },
];

function generateSocmintItem(): SocmintItem {
  const roll = Math.random();
  const platform: SocmintPlatform = roll < 0.4 ? 'telegram' : roll < 0.7 ? 'x' : 'snapchat';

  if (platform === 'telegram') {
    const msg = TELEGRAM_MESSAGES[Math.floor(Math.random() * TELEGRAM_MESSAGES.length)];
    const group = TELEGRAM_GROUPS[Math.floor(Math.random() * TELEGRAM_GROUPS.length)];
    return {
      id: `socm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      platform,
      source: `t.me/${group}`,
      content: msg.content,
      timestamp: Date.now(),
      severity: msg.severity,
      language: msg.language,
      flagged: msg.severity === 'critical',
    };
  } else if (platform === 'x') {
    const msg = X_MESSAGES[Math.floor(Math.random() * X_MESSAGES.length)];
    const account = X_ACCOUNTS[Math.floor(Math.random() * X_ACCOUNTS.length)];
    return {
      id: `socm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      platform,
      source: account,
      content: msg.content,
      timestamp: Date.now(),
      severity: msg.severity,
      language: 'EN',
      flagged: msg.severity === 'critical',
    };
  } else {
    const msg = SNAPCHAT_MESSAGES[Math.floor(Math.random() * SNAPCHAT_MESSAGES.length)];
    const source = SNAPCHAT_SOURCES[Math.floor(Math.random() * SNAPCHAT_SOURCES.length)];
    return {
      id: `socm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      platform,
      source,
      content: msg.content,
      timestamp: Date.now(),
      severity: msg.severity,
      language: 'EN',
      location: source.replace('Snap Map ', ''),
      flagged: msg.severity === 'critical',
    };
  }
}

export function useSocmintFeed(maxItems = 40): SocmintItem[] {
  const [items, setItems] = useState<SocmintItem[]>(() => {
    const initial: SocmintItem[] = [];
    for (let i = 0; i < 6; i++) {
      const item = generateSocmintItem();
      item.timestamp = Date.now() - (6 - i) * 8000;
      initial.push(item);
    }
    return initial;
  });

  const addItem = useCallback(() => {
    setItems(prev => {
      const newItem = generateSocmintItem();
      const updated = [newItem, ...prev];
      return updated.slice(0, maxItems);
    });
  }, [maxItems]);

  useEffect(() => {
    const interval = setInterval(addItem, 4000 + Math.random() * 6000);
    return () => clearInterval(interval);
  }, [addItem]);

  return items;
}
