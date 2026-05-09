/**
 * Smart legal search — Google-like featured answer + structured blocks.
 * Reuses Nyaya intelligence; adds bilingual copy and related queries.
 */
import {
  buildNyayaResponseFromQuery,
  type NyayaCaseCategory,
  type NyayaIntelResponse,
  type NyayaLawRef,
  type NyayaLawyerCard,
} from './nyayaLegalIntelligence';

export type SearchUiLang = 'en' | 'hi';

export type SmartLegalCaseTypeChip = {
  key: string;
  label: string;
};

export type SmartLegalSearchResult = {
  query: string;
  detectedLang: SearchUiLang | 'mixed';
  /** 2–3 line featured snippet (English) */
  featuredEn: string;
  /** 2–3 line featured snippet (Hindi) */
  featuredHi: string;
  caseTypes: SmartLegalCaseTypeChip[];
  explanationEn: string;
  explanationHi: string;
  legalSections: NyayaLawRef[];
  steps: string[];
  noticeTemplateId: string | null;
  lawyers: NyayaLawyerCard[];
  relatedQueries: string[];
  intel: NyayaIntelResponse;
};

function takeSnippet(text: string, maxLen = 280): string {
  const t = text.replace(/\s+/g, ' ').trim();
  if (t.length <= maxLen) return t;
  const cut = t.slice(0, maxLen);
  const last = Math.max(cut.lastIndexOf('.'), cut.lastIndexOf('।'), cut.lastIndexOf(' '));
  return (last > 120 ? cut.slice(0, last + 1) : cut).trim() + '…';
}

/** Devanagari = likely Hindi (or Marathi etc.) — UI treats as Hindi toggle. */
export function detectQueryLanguage(query: string): SmartLegalSearchResult['detectedLang'] {
  const hasDeva = /[\u0900-\u097F]/.test(query);
  const hasLat = /[a-zA-Z]/.test(query);
  if (hasDeva && hasLat) return 'mixed';
  if (hasDeva) return 'hi';
  return 'en';
}

const HINDI_FEATURED: Record<NyayaCaseCategory, string> = {
  employment:
    'कर्मचारी के रूप में आपकी मजदूरी समय पर देय है। औद्योगिक विवाद अधिनियम और राज्य के दुकान अधिनियम के तहत शिकायत दर्ज कराई जा सकती है। वकील से सही फोरम चुनें।',
  matrimonial:
    'रखरखाव (गुजारा) और तलाक व्यक्तिगत कानून व धारा 125 CrPC पर निर्भर करते हैं। तथ्य और आय के प्रमाण जुटाएं।',
  property:
    'संपत्ति विवाद में दस्तावेज़, कब्ज़ा और सीमाएँ महत्वपूर्ण हैं। TPA और CPC के तहत नागरिक उपचार संभव हैं।',
  criminal:
    'FIR, जमानत और जांच CrPC से चलती है। IPC/BNS धाराएँ तथ्यों पर निर्भर हैं। शीघ्र कानूनी सलाह लें।',
  consumer:
    'उपभोक्ता संरक्षण अधिनियम 2019 के तहत जिला/राज्य आयोग में शिकायत दायर की जा सकती है। बिल और चैट सहेजें।',
  general:
    'आपके मुद्दे को स्पष्ट करने के लिए तिथियाँ, पक्ष और दस्तावेज़ सूची बनाएं। सही अधिनियम वकील तय करेगा।',
};

const HINDI_EXPL_LONG: Record<NyayaCaseCategory, string> = {
  employment:
    'भारत में मजदूरी, बोनस और समाप्ति कई कानूनों से जुड़ी होती है। पहले लिखित मांग पत्र भेजें, फिर श्रम विभाग या न्यायालय का रास्ता चुनें। कंपनी की नीति और आपकी नियुक्ति पत्र पढ़ें।',
  matrimonial:
    'विवाह कानून व्यक्तिगत है। रखरखाव के लिए आय-व्यय का प्रमाण जरूरी है। क्रूरता जैसे गंभीर आरोपों पर तुरंत वकील से बात करें।',
  property:
    'बैनामा, नक्शा, कर रसीद और कब्ज़े के सबूत इकट्ठा करें। किरायानामा या RERA — स्थिति के अनुसार फोरम अलग हो सकता है।',
  criminal:
    'पुलिस में शिकायत स्पष्ट समयरेखा के साथ दें। ऑनलाइन धोखाधड़ी में लेनदेन सबूत सुरक्षित रखें। जमानत और चार्जशीट की प्रक्रिया वकील समझाएगा।',
  consumer:
    'दोषपूर्ण सामान या सेवा के लिए लिखित शिकायत, वारंटी और ईमेल सहेजें। मूल्य के अनुसार आयोग चुनें।',
  general:
    'सामान्य मार्गदर्शन है, वकील के बिना अदालत में दावा न करें। अपने राज्य के नियम और समय सीमा ध्यान में रखें।',
};

const RELATED_POOL: Record<NyayaCaseCategory, string[]> = {
  employment: [
    'PF नहीं जमा हुआ तो क्या करें?',
    'बिना नोटिस टर्मिनेशन वैध है?',
    'Labour court में केस कैसे दाखिल करें?',
    'Notice period कितना होना चाहिए?',
    'Salary slip न मिले तो सबूत क्या?',
  ],
  matrimonial: [
    'Section 125 maintenance कैसे मिलती है?',
    'Mutual divorce की प्रक्रिया',
    'Child custody interim order',
    'Domestic violence में तुरंत क्या करें?',
    'Alimony vs maintenance अंतर',
  ],
  property: [
    'Boundary dispute में injunction',
    'RERA complaint builder delay',
    'Tenant deposit वापसी',
    'Title verification कैसे करें?',
    'Possession suit timelines',
  ],
  criminal: [
    'FIR कैसे दर्ज कराएं?',
    'Anticipatory bail कब लें?',
    'Online fraud complaint cyber cell',
    'Cheque bounce Section 138',
    'Criminal vs civil remedy',
  ],
  consumer: [
    'Defective phone refund consumer forum',
    'E-commerce गलत उत्पाद शिकायत',
    'Insurance claim reject appeal',
    'Service deficiency compensation',
    'District vs State commission limit',
  ],
  general: [
    'Legal notice कब भेजें?',
    'Limitation period क्या है?',
    'Document notarization India',
    'Free legal aid eligibility',
    'Mediation vs court case',
  ],
};

function caseTypeChips(intel: NyayaIntelResponse): SmartLegalCaseTypeChip[] {
  const k = intel.case_type_key;
  const base: SmartLegalCaseTypeChip[] = [
    { key: k, label: intel.category_label.split('—')[0].trim() || intel.issue_title },
  ];
  const extra: Record<NyayaCaseCategory, SmartLegalCaseTypeChip[]> = {
    employment: [
      { key: 'wages', label: 'Wages & bonus' },
      { key: 'labour', label: 'Labour forum' },
    ],
    matrimonial: [
      { key: '125', label: 'Maintenance (125 CrPC)' },
      { key: 'family', label: 'Family court' },
    ],
    property: [
      { key: 'civil', label: 'Civil suit / CPC' },
      { key: 'possession', label: 'Possession & title' },
    ],
    criminal: [
      { key: 'fir', label: 'FIR & investigation' },
      { key: 'bail', label: 'Bail & trial' },
    ],
    consumer: [
      { key: 'cpa', label: 'CPA 2019 forums' },
      { key: 'deficiency', label: 'Deficiency of service' },
    ],
    general: [
      { key: 'docs', label: 'Documents & proof' },
      { key: 'forum', label: 'Choosing right forum' },
    ],
  };
  return [...base, ...(extra[k] ?? [])].slice(0, 4);
}

function relatedFor(intel: NyayaIntelResponse, query: string): string[] {
  const pool = RELATED_POOL[intel.case_type_key];
  const q = query.toLowerCase();
  const scored = pool.map((r) => ({ r, s: r.toLowerCase().split(' ').filter((w) => w.length > 2 && q.includes(w)).length }));
  scored.sort((a, b) => b.s - a.s);
  const out = scored.map((x) => x.r);
  if (out.length >= 5) return out.slice(0, 5);
  return [...new Set([...out, ...pool])].slice(0, 5);
}

export function buildSmartLegalSearchResult(query: string): SmartLegalSearchResult {
  const trimmed = query.trim();
  const intel = buildNyayaResponseFromQuery(trimmed);
  const detectedLang = detectQueryLanguage(trimmed);
  const featuredEn = takeSnippet(intel.case_understanding, 260);
  const featuredHi = takeSnippet(HINDI_FEATURED[intel.case_type_key], 320);
  const explanationEn = intel.case_understanding;
  const explanationHi = HINDI_EXPL_LONG[intel.case_type_key];

  return {
    query: trimmed,
    detectedLang,
    featuredEn,
    featuredHi,
    caseTypes: caseTypeChips(intel),
    explanationEn,
    explanationHi,
    legalSections: intel.legal_mapping.slice(0, 3),
    steps: intel.recommended_actions,
    noticeTemplateId: intel.notice_template_id,
    lawyers: intel.lawyer_cards,
    relatedQueries: relatedFor(intel, trimmed),
    intel,
  };
}
