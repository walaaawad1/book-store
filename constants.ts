
import { Book, Track } from './types';

export const BOOKS: Book[] = [
  // القسم العلمي
  {
    id: 'chem',
    title: 'امتحانات الكيمياء',
    price: 320,
    track: Track.SCIENCE,
    image: '',
    description: 'كتاب المريح في الكيمياء - الطبعة الجديدة المنقحة.'
  },
  {
    id: 'phys',
    title: 'امتحانات الفيزياء',
    price: 320,
    track: Track.SCIENCE,
    image: '',
    description: 'كتاب المريح في الفيزياء - شامل الامتحانات والحلول.'
  },
  {
    id: 'bio',
    title: 'امتحانات علم الأحياء',
    price: 330,
    track: Track.SCIENCE,
    image: '',
    description: 'كتاب المريح في الأحياء - إعداد الأستاذ إبراهيم يوسف صالح النور.'
  },
  {
    id: 'eng',
    title: 'امتحانات العلوم الهندسية',
    price: 330,
    track: Track.SCIENCE,
    image: '',
    description: 'كتاب المريح في العلوم الهندسية - الطبعة المنقحة.'
  },
  {
    id: 'cs',
    title: 'امتحانات علوم الحاسوب',
    price: 330,
    track: Track.SCIENCE,
    image: '',
    description: 'كتاب المريح في علوم الحاسوب - لطلاب الشهادة الثانوية.'
  },
  {
    id: 'math-spec',
    title: 'رياضيات متخصصة (2)',
    price: 300,
    track: Track.SCIENCE,
    image: '',
    description: 'كتاب المريح في الرياضيات المتخصصة - الجزء الثاني.'
  },
  {
    id: 'math1',
    title: 'رياضيات (1)',
    price: 300,
    track: Track.SCIENCE,
    image: '',
    description: 'كتاب المريح في الرياضيات المتخصصة (1) - المساق الأساسي.'
  },
  // القسم الأدبي
  {
    id: 'geo',
    title: 'جغرافيا ودراسات بيئية',
    price: 290,
    track: Track.LITERARY,
    image: '',
    description: 'كتاب المريح في الجغرافيا - إعداد الأستاذ فتحي محمد سالم.'
  },
  {
    id: 'hist',
    title: 'امتحانات التاريخ',
    price: 290,
    track: Track.LITERARY,
    image: '',
    description: 'كتاب المريح في التاريخ - مبوبة حسب الوحدات والمقرر.'
  },
  // مواد مشتركة
  {
    id: 'arabic',
    title: 'امتحانات اللغة العربية',
    price: 310,
    track: Track.SCIENCE,
    image: '',
    description: 'كتاب المريح في اللغة العربية (البلاغة، القواعد، الأدب).'
  }
];

export const LEGAL_PAGES = {
  about: {
    title: 'من نحن',
    content: 'نحن مجموعة من الشباب السودانيين، ندرك مدى أهمية مرحلة الشهادة السودانية في حياة كل طالب وطالبة. لقد مررنا بنفس التجربة ونعرف التحديات التي تواجه الطلاب في الحصول على المراجع والمريحات التعليمية.'
  },
  terms: {
    title: 'الشروط والأحكام',
    content: 'بطلبك من موقعنا، نلتزم بتوصيل الكتب إليك في أسرع وقت. الأسعار نهائية والتوصيل لجميع المحافظات.'
  },
  privacy: {
    title: 'سياسة الخصوصية',
    content: 'نحن نقدّر خصوصيتك؛ بياناتك تُستخدم فقط لغرض التوصيل من قبل فريقنا، ولا نبيعها أو نشاركها مع أي طرف ثالث.'
  },
  cookies: {
    title: 'ملفات الكوكيز',
    content: 'يستخدم موقعنا ملفات الكوكيز لتحسين تجربة المستخدم وحفظ سلة المشتريات أثناء التصفح.'
  }
};
