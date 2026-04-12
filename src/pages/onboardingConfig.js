// ── Spiritual Orientations ─────────────────────────
export const SPIRITUAL_ORIENTATIONS = [
  { id: 'spiritual', title: 'Deeply spiritual / faith-based', desc: 'I have an active spiritual or religious practice' },
  { id: 'curious', title: 'Spiritually curious / open', desc: 'I am drawn to spiritual ideas but not committed to a path' },
  { id: 'philosophical', title: 'Philosophical / meaning-seeking', desc: 'I seek wisdom and meaning through ideas and inquiry' },
  { id: 'secular', title: 'Secular / rational', desc: 'I prefer grounded, evidence-based guidance' },
  { id: 'exploring', title: 'Still exploring', desc: 'I am not sure yet' },
  { id: 'private', title: 'Prefer not to say', desc: '' },
]

// Reveal tradition question only for these orientations
export const TRADITION_REVEAL = ['spiritual', 'curious']

// ── Traditions (Tier 1) ─────────────────────────────
export const TRADITIONS_T1 = [
  { id: 'abrahamic', title: 'Abrahamic', desc: 'Christianity, Islam, Judaism' },
  { id: 'dharmic', title: 'Dharmic', desc: 'Hinduism, Buddhism, Sikhism, Jainism' },
  { id: 'mystical', title: 'Mystical & Esoteric', desc: 'Sufism, Kabbalah, Hermeticism, Theosophy' },
  { id: 'earth', title: 'Earth & Indigenous', desc: 'Paganism, Shamanism, African Traditional, Indigenous' },
  { id: 'philosophical', title: 'Philosophical', desc: 'Stoicism, Taoism, Secular Humanism, Existentialism' },
  { id: 'eclectic', title: 'Personal & Eclectic', desc: 'Spiritual but not religious, multiple traditions' },
  { id: 'private', title: 'Prefer not to say', desc: '' },
]

// ── Traditions (Tier 2) ─────────────────────────────
// Each tier1 maps to grouped options for a <select> with <optgroup>s.
export const TRADITIONS_T2 = {
  abrahamic: [
    { group: 'Christianity', options: ['Catholic', 'Protestant', 'Orthodox', 'Evangelical', 'Anglican', 'Baptist', 'Pentecostal', 'Quaker', 'Christian Mystic', 'Non-denominational', 'General Christian'] },
    { group: 'Islam', options: ['Sunni', 'Shia', 'Sufi', 'Ahmadiyya', 'Progressive Muslim', 'General Muslim'] },
    { group: 'Judaism', options: ['Orthodox', 'Conservative', 'Reform', 'Reconstructionist', 'Renewal', 'Kabbalist', 'General Jewish'] },
  ],
  dharmic: [
    { group: 'Hinduism', options: ['Vedantic', 'Shaivite', 'Vaishnavite', 'Shakta', 'Tantric', 'ISKCON', 'Yoga-based', 'General Hindu'] },
    { group: 'Buddhism', options: ['Theravada', 'Mahayana', 'Vajrayana / Tibetan', 'Zen', 'Pure Land', 'Secular Buddhist', 'General Buddhist'] },
    { group: 'Sikhism', options: ['Khalsa', 'Nanakpanthi', 'Kundalini / 3HO', 'General Sikh'] },
  ],
  mystical: [
    { group: null, options: ['Sufi', 'Kabbalist', 'Christian Mystic / Gnostic', 'Hermetic', 'Rosicrucian', 'Thelema', 'Chaos Magick'] },
  ],
  earth: [
    { group: 'Paganism / Wicca', options: ['Wicca', 'Druidry', 'Asatru / Norse', 'Hellenism', 'Kemetic', 'Eclectic Pagan'] },
    { group: 'Shamanism', options: ['Core Shamanism', 'Traditional / Indigenous', 'Neo-Shamanic'] },
  ],
  philosophical: [
    { group: null, options: ['Classical Stoicism', 'Modern Stoicism', 'Philosophical Taoism', 'Religious Taoism', 'Secular Humanism', 'Existentialism'] },
  ],
  eclectic: [
    { group: null, options: ['Spiritual but not religious', 'Eclectic / multiple traditions', 'Still exploring'] },
  ],
  private: null,
}

// ── Esoteric Openness ───────────────────────────────
export const ESOTERIC_OPENNESS = [
  { id: 'active', title: 'I actively work with them' },
  { id: 'curious', title: "I'm curious and open" },
  { id: 'sceptical', title: "I'm sceptical but willing to explore metaphorically" },
  { id: 'grounded', title: 'I prefer to keep it grounded' },
]

// ── Worldview ───────────────────────────────────────
export const PURPOSE_VIEWS = [
  { id: 'destiny', title: 'I believe in destiny', desc: "I have a path I'm here to fulfil" },
  { id: 'created', title: 'I believe we create our own meaning', desc: 'Through our choices and actions' },
  { id: 'both', title: 'I hold both', desc: 'Destiny and free will working together' },
  { id: 'unsure', title: "I'm genuinely not sure", desc: 'Still working this out' },
]

export const CHANGE_APPROACHES = [
  { id: 'gradual', title: 'Gradual and steady', desc: 'I evolve slowly and intentionally' },
  { id: 'radical', title: 'Radical transformation', desc: 'I thrive on disruption and leaps' },
  { id: 'oscillate', title: 'I oscillate', desc: 'Depends on the area of life' },
  { id: 'resist', title: 'I resist change', desc: 'Even when I know I need it' },
]

export const DECISION_TRUSTS = [
  { id: 'logic', title: 'Logic and evidence', desc: 'I reason my way through' },
  { id: 'intuition', title: 'Intuition and feeling', desc: 'I trust what I sense' },
  { id: 'tradition', title: 'Tradition and wisdom of others', desc: 'I look to what has worked' },
  { id: 'combination', title: 'A combination of all', desc: 'Drawing on all three' },
]

// ── Gender ──────────────────────────────────────────
export const GENDERS = [
  { id: 'male', title: 'Male' },
  { id: 'female', title: 'Female' },
  { id: 'other', title: 'Other / Prefer not to specify' },
]

// ── Life Pillars ────────────────────────────────────
export const PILLARS = [
  { id: 'love', icon: '❤️', title: 'Love & Deep Connection' },
  { id: 'work', icon: '💼', title: 'Meaningful Work & Legacy' },
  { id: 'health', icon: '🫀', title: 'Health & Vitality' },
  { id: 'wealth', icon: '💰', title: 'Financial Freedom' },
  { id: 'spirit', icon: '🌿', title: 'Spiritual Growth & Awakening' },
  { id: 'family', icon: '👨‍👩‍👧', title: 'Family & Belonging' },
  { id: 'creative', icon: '🎨', title: 'Creative Expression' },
  { id: 'adventure', icon: '🌍', title: 'Adventure & Experience' },
  { id: 'service', icon: '🤝', title: 'Service & Contribution' },
  { id: 'peace', icon: '🧘', title: 'Inner Peace & Wellbeing' },
]

// ── Label lookups (for Profile summary views) ──────
export const labelFor = (list, id) => list.find(x => x.id === id)?.title || ''
