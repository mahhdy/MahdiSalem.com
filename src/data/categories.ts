/**
 * Category Taxonomy for Content Organization
 *
 * This file defines the complete bilingual category system for organizing
 * articles, books, and statements across the website.
 */

export interface Category {
  slug: string;
  nameFa: string;
  nameEn: string;
  descriptionFa?: string;
  descriptionEn?: string;
  imagePath: string;
  parentCategory?: string;
  contentTypes: ('articles' | 'books' | 'statements' | 'multimedia' | 'dialogues')[];
}

export const categories: Category[] = [
  // Philosophy (فلسفه)
  {
    slug: 'ontology',
    nameFa: 'هستی‌شناسی',
    nameEn: 'Ontology',
    descriptionFa: 'مطالعات درباره ماهیت وجود، هستی و واقعیت',
    descriptionEn: 'Studies on the nature of being, existence, and reality',
    imagePath: '/images/categories/ontology.svg',
    parentCategory: 'philosophy',
    contentTypes: ['articles', 'books', 'multimedia', 'dialogues'],
  },
  {
    slug: 'epistemology',
    nameFa: 'معرفت‌شناسی',
    nameEn: 'Epistemology',
    descriptionFa: 'نظریه‌های مربوط به دانش، باور و توجیه',
    descriptionEn: 'Theories of knowledge, belief, and justification',
    imagePath: '/images/categories/epistemology.svg',
    parentCategory: 'philosophy',
    contentTypes: ['articles', 'books', 'multimedia', 'dialogues'],
  },
  {
    slug: 'semantics',
    nameFa: 'معناشناسی',
    nameEn: 'Semantics',
    descriptionFa: 'مطالعه معنا و مرجع در زبان و منطق',
    descriptionEn: 'Study of meaning and reference in language and logic',
    imagePath: '/images/categories/semantics.svg',
    parentCategory: 'philosophy',
    contentTypes: ['articles', 'books', 'multimedia', 'dialogues'],
  },
  {
    slug: 'methodology',
    nameFa: 'روش‌شناسی',
    nameEn: 'Methodology',
    descriptionFa: 'روش‌های پژوهش و تحقیق فلسفی',
    descriptionEn: 'Methods of philosophical research and inquiry',
    imagePath: '/images/categories/methodology.svg',
    parentCategory: 'philosophy',
    contentTypes: ['articles', 'books', 'multimedia', 'dialogues'],
  },
  {
    slug: 'philosophy-other',
    nameFa: 'سایر موضوعات فلسفی',
    nameEn: 'Other Philosophy',
    descriptionFa: 'موضوعات فلسفی عمومی و متفرقه',
    descriptionEn: 'General and miscellaneous philosophical topics',
    imagePath: '/images/categories/philosophy-other.svg',
    parentCategory: 'philosophy',
    contentTypes: ['articles', 'books', 'multimedia', 'dialogues'],
  },
  {
    slug: 'philosophy-of-politics',
    nameFa: 'فلسفه‌ی سیاسی',
    nameEn: 'Philosophy of Politics',
    descriptionFa: 'مطالعات فلسفی درباره سیاست و ایدئولوژی‌های سیاسی',
    descriptionEn: 'Philosophical studies on politics and political ideologies',
    imagePath: '/images/categories/philosophy-of-politics.svg',
    parentCategory: 'philosophy',
    contentTypes: ['articles', 'books', 'multimedia', 'dialogues'],
  },
  // Science (علم)
  {
    slug: 'philosophy-of-science',
    nameFa: 'فلسفه‌ی علم',
    nameEn: 'Philosophy of Science',
    descriptionFa: 'بررسی فلسفی روش‌ها، مفروضات و نتایج علمی',
    descriptionEn: 'Philosophical examination of scientific methods, assumptions, and results',
    imagePath: '/images/categories/philosophy-of-science.svg',
    parentCategory: 'science',
    contentTypes: ['articles', 'books', 'multimedia', 'dialogues'],
  },
  {
    slug: 'physics',
    nameFa: 'فیزیک',
    nameEn: 'Physics',
    descriptionFa: 'مطالعات مربوط به فیزیک و مبانی آن',
    descriptionEn: 'Studies on physics and its foundations',
    imagePath: '/images/categories/physics.svg',
    parentCategory: 'science',
    contentTypes: ['articles', 'books', 'multimedia', 'dialogues'],
  },
  {
    slug: 'quantum',
    nameFa: 'کوانتوم',
    nameEn: 'Quantum Mechanics',
    descriptionFa: 'مکانیک کوانتومی و تفسیرهای آن',
    descriptionEn: 'Quantum mechanics and its interpretations',
    imagePath: '/images/categories/quantum.svg',
    parentCategory: 'science',
    contentTypes: ['articles', 'books', 'multimedia', 'dialogues'],
  },
  {
    slug: 'biology',
    nameFa: 'زیست‌شناسی',
    nameEn: 'Biology',
    descriptionFa: 'موضوعات زیست‌شناسی و فلسفه زیست‌شناسی',
    descriptionEn: 'Biology topics and philosophy of biology',
    imagePath: '/images/categories/biology.svg',
    parentCategory: 'science',
    contentTypes: ['articles', 'books', 'multimedia', 'dialogues'],
  },
  {
    slug: 'neuroscience',
    nameFa: 'عصب‌شناسی',
    nameEn: 'Neuroscience',
    descriptionFa: 'علوم اعصاب و مسائل فلسفی مرتبط',
    descriptionEn: 'Neuroscience and related philosophical issues',
    imagePath: '/images/categories/neuroscience.svg',
    parentCategory: 'science',
    contentTypes: ['articles', 'books', 'multimedia', 'dialogues'],
  },

  // Logic & Mathematics (منطق و ریاضیات)
  {
    slug: 'philosophy-of-mathematics',
    nameFa: 'فلسفه‌ی ریاضیات',
    nameEn: 'Philosophy of Mathematics',
    descriptionFa: 'مطالعات فلسفی درباره ماهیت و مبانی ریاضیات',
    descriptionEn: 'Philosophical studies on the nature and foundations of mathematics',
    imagePath: '/images/categories/philosophy-of-mathematics.svg',
    parentCategory: 'logic-mathematics',
    contentTypes: ['articles', 'books', 'multimedia', 'dialogues'],
  },
  {
    slug: 'meta-logic',
    nameFa: 'فرا منطق',
    nameEn: 'Meta-logic',
    descriptionFa: 'مطالعه خواص سیستم‌های منطقی',
    descriptionEn: 'Study of properties of logical systems',
    imagePath: '/images/categories/meta-logic.svg',
    parentCategory: 'logic-mathematics',
    contentTypes: ['articles', 'books', 'multimedia', 'dialogues'],
  },
  {
    slug: 'model-theory',
    nameFa: 'نظریه‌ی مدل',
    nameEn: 'Model Theory',
    descriptionFa: 'مطالعه رابطه بین ساختارهای ریاضی و زبان‌های صوری',
    descriptionEn: 'Study of relationship between mathematical structures and formal languages',
    imagePath: '/images/categories/model-theory.svg',
    parentCategory: 'logic-mathematics',
    contentTypes: ['articles', 'books', 'multimedia', 'dialogues'],
  },
  {
    slug: 'proof-theory',
    nameFa: 'نظریه‌ی اثبات',
    nameEn: 'Proof Theory',
    descriptionFa: 'مطالعه ساختار و خواص اثبات‌های صوری',
    descriptionEn: 'Study of structure and properties of formal proofs',
    imagePath: '/images/categories/proof-theory.svg',
    parentCategory: 'logic-mathematics',
    contentTypes: ['articles', 'books', 'multimedia', 'dialogues'],
  },
  {
    slug: 'set-theory',
    nameFa: 'نظریه‌ی مجموعه‌ها',
    nameEn: 'Set Theory',
    descriptionFa: 'نظریه مجموعه‌ها و مبانی ریاضیات',
    descriptionEn: 'Set theory and foundations of mathematics',
    imagePath: '/images/categories/set-theory.svg',
    parentCategory: 'logic-mathematics',
    contentTypes: ['articles', 'books', 'multimedia', 'dialogues'],
  },
  {
    slug: 'recursion-theory',
    nameFa: 'نظریه‌ی بازگشتی',
    nameEn: 'Recursion Theory',
    descriptionFa: 'نظریه محاسبه‌پذیری و توابع بازگشتی',
    descriptionEn: 'Computability theory and recursive functions',
    imagePath: '/images/categories/recursion-theory.svg',
    parentCategory: 'logic-mathematics',
    contentTypes: ['articles', 'books', 'multimedia', 'dialogues'],
  },

  // Ethics (اخلاق)
  {
    slug: 'philosophy-of-ethics',
    nameFa: 'فلسفه‌ی اخلاق',
    nameEn: 'Philosophy of Ethics',
    descriptionFa: 'نظریه‌های اخلاقی و فراخلاق',
    descriptionEn: 'Ethical theories and meta-ethics',
    imagePath: '/images/categories/philosophy-of-ethics.svg',
    parentCategory: 'ethics',
    contentTypes: ['articles', 'books', 'multimedia', 'dialogues'],
  },
  {
    slug: 'descriptive-ethics',
    nameFa: 'اخلاق توصیفی',
    nameEn: 'Descriptive Ethics',
    descriptionFa: 'مطالعه توصیفی اخلاقیات و رفتارهای اخلاقی',
    descriptionEn: 'Descriptive study of morality and moral behaviors',
    imagePath: '/images/categories/descriptive-ethics.svg',
    parentCategory: 'ethics',
    contentTypes: ['articles', 'books', 'multimedia', 'dialogues'],
  },
  {
    slug: 'prescriptive-ethics',
    nameFa: 'اخلاق تجویزی',
    nameEn: 'Prescriptive Ethics',
    descriptionFa: 'اخلاق هنجاری و تجویزی',
    descriptionEn: 'Normative and prescriptive ethics',
    imagePath: '/images/categories/prescriptive-ethics.svg',
    parentCategory: 'ethics',
    contentTypes: ['articles', 'books', 'multimedia', 'dialogues'],
  },
  {
    slug: 'applied-ethics',
    nameFa: 'اخلاق کاربردی',
    nameEn: 'Applied Ethics',
    descriptionFa: 'کاربرد اصول اخلاقی در مسائل واقعی',
    descriptionEn: 'Application of ethical principles to real-world issues',
    imagePath: '/images/categories/applied-ethics.svg',
    parentCategory: 'ethics',
    contentTypes: ['articles', 'books', 'statements', 'multimedia', 'dialogues'],
  },

  // Politics (سیاست)
  {
    slug: 'descriptive-politics',
    nameFa: 'سیاست توصیفی',
    nameEn: 'Descriptive Politics',
    descriptionFa: 'تحلیل و توصیف سیستم‌های سیاسی',
    descriptionEn: 'Analysis and description of political systems',
    imagePath: '/images/categories/descriptive-politics.svg',
    parentCategory: 'politics',
    contentTypes: ['articles', 'books', 'statements', 'multimedia', 'dialogues'],
  },
  {
    slug: 'foundational-politics',
    nameFa: 'سیاست تاسیسی',
    nameEn: 'Foundational Politics',
    descriptionFa: 'مبانی نظری سیاست و فلسفه سیاسی',
    descriptionEn: 'Theoretical foundations of politics and political philosophy',
    imagePath: '/images/categories/foundational-politics.svg',
    parentCategory: 'politics',
    contentTypes: ['articles', 'books', 'multimedia', 'dialogues'],
  },
  {
    slug: 'iran',
    nameFa: 'ایران',
    nameEn: 'Iran',
    descriptionFa: 'مسائل سیاسی، اجتماعی و فرهنگی ایران',
    descriptionEn: 'Political, social, and cultural issues of Iran',
    imagePath: '/images/categories/iran.svg',
    parentCategory: 'politics',
    contentTypes: ['articles', 'books', 'statements', 'multimedia', 'dialogues'],
  },

  // Economics (اقتصاد)
  {
    slug: 'economics',
    nameFa: 'اقتصاد',
    nameEn: 'Economics',
    descriptionFa: 'مسائل اقتصادی و فلسفه اقتصاد',
    descriptionEn: 'Economic issues and philosophy of economics',
    imagePath: '/images/categories/economics.svg',
    contentTypes: ['articles', 'books', 'statements', 'multimedia', 'dialogues'],
  },

  // Life (زندگی)
  {
    slug: 'life',
    nameFa: 'زندگی',
    nameEn: 'Life',
    descriptionFa: 'تأملات درباره زندگی، تجربه و معنا',
    descriptionEn: 'Reflections on life, experience, and meaning',
    imagePath: '/images/categories/life.svg',
    contentTypes: ['articles', 'books', 'multimedia', 'dialogues'],
  },
  {
    slug: 'theology',
    nameFa: 'الاهیات و دین',
    nameEn: 'Theology',
    imagePath: '/images/categories/theology.svg',
    contentTypes: ['articles', 'books', 'statements', 'multimedia', 'dialogues'],
  },
  {
    slug: 'natural-theology',
    nameFa: 'الاهیات طبیعی',
    nameEn: 'Natural Theology',
    imagePath: '/images/categories/natural-theology.svg',
    parentCategory: 'theology',
    contentTypes: ['articles', 'books', 'statements', 'multimedia', 'dialogues'],
  },
];

/**
 * Get localized category name
 */
export function getCategoryName(slug: string, lang: 'fa' | 'en'): string {
  const cat = categories.find((c) => c.slug === slug);
  return cat ? (lang === 'fa' ? cat.nameFa : cat.nameEn) : slug;
}

/**
 * Get localized category description
 */
export function getCategoryDescription(slug: string, lang: 'fa' | 'en'): string | undefined {
  const cat = categories.find((c) => c.slug === slug);
  if (!cat) return undefined;
  return lang === 'fa' ? cat.descriptionFa : cat.descriptionEn;
}

/**
 * Get categories filtered by content type
 */
export function getCategoriesByContentType(contentType: 'articles' | 'books' | 'statements' | 'multimedia' | 'dialogues'): Category[] {
  return categories.filter((cat) => cat.contentTypes.includes(contentType));
}

/**
 * Get category by slug
 */
export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

/**
 * Get all category slugs
 */
export function getAllCategorySlugs(): string[] {
  return categories.map((c) => c.slug);
}
