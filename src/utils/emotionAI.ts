const EMOTION_LEXICON: Record<string, Record<string, number>> = {
  curious: {
    tell: 2, know: 2, what: 1, how: 1, why: 2, history: 3, about: 1,
    explain: 3, describe: 2, info: 2, information: 2, learn: 3, details: 2,
    facts: 3, discovery: 2, explore: 2, interesting: 2, curious: 3, wonder: 2,
    ancient: 2, origin: 2, story: 2, background: 2, heritage: 2
  },
  excited: {
    wow: 3, amazing: 3, awesome: 3, cool: 2, great: 2, fantastic: 3,
    love: 2, excited: 3, cant: 1, wait: 1, best: 2, wonderful: 3,
    incredible: 3, brilliant: 3, superb: 2, thrilled: 3, yay: 3,
    omg: 3, mind: 1, blowing: 2, spectacular: 3, '!': 1
  },
  bored: {
    bored: 3, boring: 3, idk: 3, whatever: 3, anything: 2, suggest: 2,
    dunno: 3, meh: 3, fine: 1, okay: 1, sure: 1, random: 2,
    something: 1, anywhere: 2, doesnt: 1, matter: 1, just: 1, pick: 2
  },
  romantic: {
    date: 3, anniversary: 3, romantic: 3, love: 2, couple: 3, partner: 3,
    wife: 3, husband: 3, girlfriend: 3, boyfriend: 3, honeymoon: 3,
    special: 2, evening: 2, beautiful: 2, elegant: 2, peaceful: 2,
    serene: 2, intimate: 3, together: 2, valentine: 3
  },
  family: {
    family: 3, kids: 3, children: 3, child: 3, son: 2, daughter: 2,
    parents: 2, grandparents: 2, toddler: 3, baby: 2, fun: 2,
    educational: 2, interactive: 2, playground: 2, friendly: 2,
    school: 2, trip: 1, outing: 2, picnic: 2, together: 1
  },
  budget: {
    cheap: 3, free: 3, affordable: 3, budget: 3, inexpensive: 3,
    low: 2, cost: 2, price: 2, ticket: 1, money: 2, expensive: 2,
    less: 2, minimum: 2, economic: 3, student: 2, discount: 3,
    offer: 2, save: 2, saving: 2, poor: 1, limited: 1
  },
  cultural: {
    culture: 3, heritage: 3, history: 3, historical: 3, traditional: 3,
    ancient: 3, monument: 3, artifact: 3, painting: 2, sculpture: 2,
    architecture: 3, civilization: 3, dynasty: 3, empire: 3, mughal: 3,
    british: 2, colonial: 2, independence: 2, freedom: 2, national: 2,
    tribal: 3, folk: 3, classical: 2, art: 2
  },
  adventurous: {
    adventure: 3, exciting: 3, unique: 3, unusual: 3, rare: 3,
    offbeat: 3, hidden: 3, unexplored: 3, different: 2, special: 2,
    thrilling: 3, challenge: 2, extreme: 2, wild: 2, discovery: 2,
    trek: 2, explore: 2, uncharted: 3, mysterious: 3, secret: 2
  },
  scientific: {
    science: 3, technology: 3, tech: 2, innovation: 3, invention: 3,
    space: 3, astronomy: 3, biology: 3, physics: 3, chemistry: 3,
    engineering: 3, robot: 3, digital: 2, modern: 2, future: 2,
    experiment: 3, laboratory: 3, natural: 2, exhibit: 2, interactive: 2
  }
};

// ── Intent Patterns ──────────────────────────────────────────────
const INTENT_PATTERNS = [
  { intent: 'book', patterns: ['book', 'reserve', 'ticket', 'buy', 'purchase', 'want to visit', 'plan to go', 'booking'] },
  { intent: 'search', patterns: ['find', 'search', 'show', 'list', 'museums in', 'near', 'around', 'where'] },
  { intent: 'compare', patterns: ['compare', 'difference', 'better', 'vs', 'versus', 'which is', 'best among'] },
  { intent: 'plan', patterns: ['plan', 'itinerary', 'day trip', 'full day', 'schedule', 'route', 'travel plan'] },
  { intent: 'info', patterns: ['tell me', 'what is', 'about', 'history of', 'information', 'explain', 'describe'] },
  { intent: 'cancel', patterns: ['cancel', 'refund', 'return', 'undo booking', 'cancel ticket'] },
  { intent: 'greet', patterns: ['hi', 'hello', 'hey', 'good morning', 'good evening', 'namaste', 'hola'] },
  { intent: 'thanks', patterns: ['thank', 'thanks', 'thank you', 'great', 'perfect', 'got it', 'okay'] },
];

// ── Language Detection ───────────────────────────────────────────
const LANGUAGE_PATTERNS: Record<string, RegExp> = {
  hindi: /[\u0900-\u097F]|kya|hai|mujhe|chahiye|batao|museum|delhi|mumbai|kahan/i,
  tamil: /[\u0B80-\u0BFF]|vanakkam|enna|museum|eppadi/i,
  telugu: /[\u0C00-\u0C7F]|namasthe|museum|cheppandi/i,
  bengali: /[\u0980-\u09FF]|museum|kolkata/i,
  marathi: /[\u0900-\u097F]|museum|mumbai|punyala/i,
};

// ── Occasion Detector ────────────────────────────────────────────
const OCCASION_PATTERNS: Record<string, string[]> = {
  school_trip: ['school', 'class', 'students', 'teacher', 'education', 'field trip', 'college'],
  solo_travel: ['solo', 'alone', 'myself', 'just me', 'single', 'backpacker', 'solo trip'],
  group_visit: ['group', 'friends', 'team', 'colleagues', 'office', 'gang', 'crew'],
  special_occasion: ['birthday', 'anniversary', 'celebration', 'special day', 'occasion', 'holiday'],
  tourist: ['tourist', 'visiting', 'traveler', 'travel', 'trip', 'vacation', 'holiday', 'tour'],
};

// ── Museum Type Preferences ──────────────────────────────────────
const TYPE_PREFERENCES: Record<string, string[]> = {
  Art: ['art', 'painting', 'sculpture', 'gallery', 'artist', 'creative', 'aesthetic', 'beautiful'],
  History: ['history', 'historical', 'ancient', 'heritage', 'past', 'civilization', 'dynasty', 'empire'],
  Science: ['science', 'technology', 'tech', 'innovation', 'space', 'biology', 'physics', 'experiment'],
  'Natural History': ['nature', 'animals', 'fossils', 'dinosaur', 'wildlife', 'biology', 'natural', 'geology'],
  Culture: ['culture', 'tradition', 'folk', 'tribal', 'indigenous', 'classical', 'dance', 'music'],
  Archaeological: ['archaeology', 'excavation', 'ruins', 'ancient', 'artifacts', 'dig', 'prehistoric'],
  Railway: ['train', 'railway', 'locomotive', 'rail', 'steam engine', 'transport'],
  Tribal: ['tribal', 'indigenous', 'adivasi', 'folk', 'primitive', 'traditional'],
};

// ── Naive Bayes Classifier ───────────────────────────────────────
class NaiveBayesEmotionClassifier {
  private priors: Record<string, number> = {};
  private likelihoods: Record<string, Record<string, number>> = {};
  private vocab: Set<string> = new Set();

  constructor() {
    // Initialize with our lexicon as training data
    this.train();
  }

  private train() {
    const emotions = Object.keys(EMOTION_LEXICON);
    const totalEmotions = emotions.length;

    emotions.forEach(emotion => {
      this.priors[emotion] = 1 / totalEmotions;
      this.likelihoods[emotion] = {};
      const words = EMOTION_LEXICON[emotion];
      const totalWeight = Object.values(words).reduce((a, b) => a + b, 0);

      Object.entries(words).forEach(([word, weight]) => {
        this.vocab.add(word);
        this.likelihoods[emotion][word] = weight / totalWeight;
      });
    });
  }

  classify(text: string): { emotion: string; confidence: number; scores: Record<string, number> } {
    const words = text.toLowerCase()
      .replace(/[^\w\s!?]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 1);

    const scores: Record<string, number> = {};

    Object.keys(EMOTION_LEXICON).forEach(emotion => {
      let score = Math.log(this.priors[emotion]);

      words.forEach(word => {
        if (this.likelihoods[emotion][word]) {
          score += Math.log(this.likelihoods[emotion][word] + 0.01);
        } else {
          score += Math.log(0.001); 
        }
      });

      scores[emotion] = score;
    });

    // Softmax normalization
    const maxScore = Math.max(...Object.values(scores));
    const expScores: Record<string, number> = {};
    let sumExp = 0;

    Object.entries(scores).forEach(([emotion, score]) => {
      expScores[emotion] = Math.exp(score - maxScore);
      sumExp += expScores[emotion];
    });

    const probabilities: Record<string, number> = {};
    Object.entries(expScores).forEach(([emotion, exp]) => {
      probabilities[emotion] = exp / sumExp;
    });

    const topEmotion = Object.entries(probabilities)
      .sort(([, a], [, b]) => b - a)[0];

    return {
      emotion: topEmotion[0],
      confidence: topEmotion[1],
      scores: probabilities
    };
  }
}

// ── Main EmotionAI Class ─────────────────────────────────────────
export class EmotionAI {
  private classifier: NaiveBayesEmotionClassifier;

  constructor() {
    this.classifier = new NaiveBayesEmotionClassifier();
  }

  analyze(text: string): EmotionAnalysis {
    const lower = text.toLowerCase();
    const words = lower.split(/\s+/);

    // 1. Emotion classification
    const { emotion, confidence, scores } = this.classifier.classify(text);

    // 2. Intent detection
    const intent = this.detectIntent(lower);

    // 3. Language detection
    const language = this.detectLanguage(text);

    // 4. Occasion detection
    const occasion = this.detectOccasion(lower);

    // 5. Museum type preference
    const museumTypePreference = this.detectMuseumType(lower);

    // 6. Sentiment polarity (-1 to 1)
    const sentiment = this.calculateSentiment(lower, words);

    // 7. Energy level (0-1)
    const energy = this.calculateEnergy(text, emotion);

    // 8. Budget sensitivity
    const budgetSensitive = scores['budget'] > 0.15;

    // 9. Extract entities
    const entities = this.extractEntities(text);

    return {
      emotion,
      confidence,
      allScores: scores,
      intent,
      language,
      occasion,
      museumTypePreference,
      sentiment,
      energy,
      budgetSensitive,
      entities,
      tone: this.getTone(emotion, sentiment, energy)
    };
  }

  private detectIntent(text: string): string {
    for (const { intent, patterns } of INTENT_PATTERNS) {
      if (patterns.some(p => text.includes(p))) return intent;
    }
    return 'general';
  }

  private detectLanguage(text: string): string {
    for (const [lang, pattern] of Object.entries(LANGUAGE_PATTERNS)) {
      if (pattern.test(text)) return lang;
    }
    return 'english';
  }

  private detectOccasion(text: string): string | null {
    for (const [occasion, patterns] of Object.entries(OCCASION_PATTERNS)) {
      if (patterns.some(p => text.includes(p))) return occasion;
    }
    return null;
  }

  private detectMuseumType(text: string): string[] {
    const types: string[] = [];
    for (const [type, keywords] of Object.entries(TYPE_PREFERENCES)) {
      if (keywords.some(k => text.includes(k))) types.push(type);
    }
    return types;
  }

  private calculateSentiment(text: string, words: string[]): number {
    const positive = ['good', 'great', 'love', 'best', 'amazing', 'wonderful', 'beautiful', 'excellent', 'perfect', 'happy', 'enjoy', 'like', 'fantastic'];
    const negative = ['bad', 'boring', 'hate', 'worst', 'terrible', 'awful', 'dull', 'waste', 'disappointing', 'poor', 'ugly', 'dislike'];
    const negators = ['not', "don't", "doesn't", "isn't", "aren't", 'never', 'no'];

    let score = 0;
    let negate = false;

    words.forEach(word => {
      if (negators.includes(word)) { negate = true; return; }
      if (positive.includes(word)) score += negate ? -1 : 1;
      if (negative.includes(word)) score += negate ? 1 : -1;
      negate = false;
    });

    return Math.max(-1, Math.min(1, score / Math.max(words.length / 5, 1)));
  }

  private calculateEnergy(text: string, emotion: string): number {
    let energy = 0.5;
    const exclamations = (text.match(/!/g) || []).length;
    const caps = (text.match(/[A-Z]{2,}/g) || []).length;
    energy += exclamations * 0.1 + caps * 0.05;
    if (['excited', 'adventurous'].includes(emotion)) energy += 0.2;
    if (['bored', 'romantic'].includes(emotion)) energy -= 0.2;
    return Math.max(0, Math.min(1, energy));
  }

  private extractEntities(text: string): Entities {
    const cities = ['delhi', 'mumbai', 'kolkata', 'chennai', 'bangalore', 'bengaluru',
      'hyderabad', 'jaipur', 'agra', 'varanasi', 'bhopal', 'pune', 'ahmedabad',
      'lucknow', 'patna', 'bhubaneswar', 'goa', 'kochi', 'mysore'];

    const museumKeywords = ['museum', 'gallery', 'sangrahalaya', 'vastu', 'kala'];

    const lower = text.toLowerCase();
    const detectedCities = cities.filter(c => lower.includes(c));

    const numbers = text.match(/\d+/g)?.map(Number) || [];
    const dates = text.match(/\b(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday|\d{1,2}[\/\-]\d{1,2})\b/gi) || [];

    return {
      cities: detectedCities,
      hasMuseumMention: museumKeywords.some(k => lower.includes(k)),
      numbers,
      dates,
      ticketCount: numbers.find(n => n >= 1 && n <= 20) || null,
    };
  }

  private getTone(emotion: string, sentiment: number, energy: number): string {
    if (emotion === 'excited' || energy > 0.7) return 'enthusiastic';
    if (emotion === 'bored') return 'engaging';
    if (emotion === 'romantic') return 'warm';
    if (emotion === 'cultural' || emotion === 'curious') return 'informative';
    if (emotion === 'family') return 'friendly';
    if (emotion === 'budget') return 'practical';
    if (emotion === 'adventurous') return 'adventurous';
    if (sentiment < -0.3) return 'empathetic';
    return 'helpful';
  }

  // Build system prompt based on emotion analysis
  buildSystemPrompt(analysis: EmotionAnalysis, conversationHistory: Message[]): string {
    const toneInstructions: Record<string, string> = {
      enthusiastic: 'Be energetic, use emojis, match their excitement!',
      engaging: 'Be interesting and surprising, capture their attention with unique facts',
      warm: 'Be warm, poetic, and romantic in your descriptions',
      informative: 'Be detailed, accurate, and intellectually stimulating',
      friendly: 'Be cheerful, simple, and family-friendly',
      practical: 'Focus on value, prices, and practical information',
      adventurous: 'Be bold, highlight unique and offbeat experiences',
      empathetic: 'Be understanding and supportive',
      helpful: 'Be clear, concise, and helpful',
    };

    const emotionContext: Record<string, string> = {
      curious: 'The user is curious and wants to learn. Share fascinating historical facts and stories.',
      excited: 'The user is excited! Match their energy and enthusiasm.',
      bored: 'The user seems bored or undecided. Suggest the most unique and interesting museums.',
      romantic: 'The user may be planning a romantic outing. Suggest scenic, artistic, peaceful museums.',
      family: 'The user is with family or kids. Suggest interactive, educational, child-friendly museums.',
      budget: 'The user is budget-conscious. Highlight free or cheap museum options.',
      cultural: 'The user loves culture and heritage. Focus on historical and cultural significance.',
      adventurous: 'The user wants unique experiences. Suggest offbeat, rare, unusual museums.',
      scientific: 'The user is interested in science. Highlight science and technology museums.',
    };

    return `You are Musema AI — India's most knowledgeable museum guide, built into the Musema booking platform. You give DETAILED, STRUCTURED, INFORMATION-RICH responses about Indian museums.

EMOTION: \${analysis.emotion} | INTENT: \${analysis.intent} | LANGUAGE: \${analysis.language}
\${analysis.museumTypePreference.length > 0 ? \`INTERESTS: \${analysis.museumTypePreference.join(', ')}\` : ''}
\${analysis.entities.cities.length > 0 ? \`CITIES: \${analysis.entities.cities.join(', ')}\` : ''}
\${analysis.budgetSensitive ? 'NOTE: User is budget-sensitive — highlight affordable options.' : ''}

EMOTIONAL CONTEXT: \${emotionContext[analysis.emotion] || 'Be helpful and informative.'}
TONE: \${toneInstructions[analysis.tone] || 'Be helpful.'}

═══════════════════════════════════════
RESPONSE FORMAT — CRITICAL RULES:
═══════════════════════════════════════

When asked about museums in a CITY or by INTEREST/TYPE — list EVERY museum you know about there. Format EACH museum like this:

🏛️ **[Museum Name]**
📍 *[City, State]*
🗂️ **Type:** [Art / History / Science / etc.]
📝 **About:** [2-3 sentence description of what makes it special, its history, key collections]
🎟️ **Entry:** Adult ₹[price] · Child ₹[price] · Foreign ₹[price]
⏰ **Timings:** [Opening hours, closed on]
✨ **Highlights:** [3-4 key exhibits or unique features as bullet points]
🌐 **Wikipedia:** https://en.wikipedia.org/wiki/[Museum_Name_underscored]
🌍 **Website:** [official website if known, else omit this line]
🎫 **Book here:** Type **"book ticket for [Museum Name]"** to book instantly

---

When asked about a SINGLE museum in detail — use the same card format above, then add:
- A **History** section with founding story and key milestones
- A **Collections** section listing major exhibits/galleries
- A **Visitor Tips** section with best time to visit, photography rules, nearby attractions

When asked a GENERAL QUESTION — answer conversationally but still structured with bold headers and bullet points. NO plain paragraphs.

═══════════════════════════════════════
LINKS — MANDATORY:
═══════════════════════════════════════
- ALWAYS include the Wikipedia link for every museum mentioned. Format: https://en.wikipedia.org/wiki/Museum_Name (replace spaces with underscores)
- Include official website if you know it (e.g. nationalmuseumindia.gov.in)
- Never skip links — they are the most useful part of the response

═══════════════════════════════════════
BOOKING RULES — CRITICAL:
═══════════════════════════════════════
- You CAN book tickets for ANY museum in India. NEVER say a city has no bookable museums.
- NEVER redirect users to external websites to book.
- The platform fetches any Indian museum live — if it exists in India, it can be booked.
- When user wants to book: tell them to type **"book ticket for [EXACT museum name]"**
- When user says "ok", "book", "yes", "proceed" after discussing a museum: proactively offer the booking command.
- NEVER output internal tags like [BOOKING_INTENT:...] in your response.

═══════════════════════════════════════
ACCURACY RULES — CRITICAL:
═══════════════════════════════════════
- NEVER invent or hallucinate museums. Only mention museums you are highly confident exist.
- If asked about museums in a city, list ALL real ones you know — do not truncate the list.
- It is better to list 8 real museums than 3. Be comprehensive.
- NEVER say "here are a few" — give the complete list.

RESPOND IN: \${analysis.language !== 'english' ? analysis.language + ' or English' : 'English'}\``
  }
}

// ── Types ────────────────────────────────────────────────────────
export interface EmotionAnalysis {
  emotion: string;
  confidence: number;
  allScores: Record<string, number>;
  intent: string;
  language: string;
  occasion: string | null;
  museumTypePreference: string[];
  sentiment: number;
  energy: number;
  budgetSensitive: boolean;
  entities: Entities;
  tone: string;
}

export interface Entities {
  cities: string[];
  hasMuseumMention: boolean;
  numbers: number[];
  dates: string[];
  ticketCount: number | null;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  analysis?: EmotionAnalysis;
  timestamp?: number;
}

export const emotionAI = new EmotionAI();