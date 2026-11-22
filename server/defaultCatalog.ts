export interface ServiceRecord {
  id: number;
  name_ar: string;
  name_fr: string;
  description_ar: string;
  description_fr: string;
  image: string;
}

export interface EquipmentRecord {
  id: number;
  name_ar: string;
  name_fr: string;
  description_ar: string;
  description_fr: string;
  specs_ar: string | null;
  specs_fr: string | null;
  image: string;
  category: 'rental' | 'sales';
  availability: 'available' | 'limited' | 'unavailable';
}

export interface ProjectRecord {
  id: number;
  title_ar: string;
  title_fr: string;
  description_ar: string;
  description_fr: string;
  category_ar: string | null;
  category_fr: string | null;
  image: string;
}

export const DEFAULT_SERVICES: ServiceRecord[] = [
  {
    id: 1,
    name_ar: 'كراء معدات البناء',
    name_fr: "Location d'équipements de construction",
    description_ar:
      'توفير معدات بناء حديثة ومفحوصة فنياً للكراء اليومي أو طويل الأمد لمشاريع البناء والأشغال العمومية في غليزان والمناطق المجاورة.',
    description_fr:
      "Mise à disposition d'équipements de chantier entretenus et contrôlés pour la location courte ou longue durée à Relizane et ses environs.",
    image: '/src/assets/images/equipment_construction_fleet_1795358134026.jpg',
  },
  {
    id: 2,
    name_ar: 'بيع معدات البناء',
    name_fr: "Vente d'équipements de construction",
    description_ar:
      'بيع معدات وآليات الورشات المعتمدة للمقاولين والحرفيين مع المرافقة الفنية لاختيار التجهيز المناسب لطبيعة العمل.',
    description_fr:
      'Commercialisation de matériels professionnels pour chantiers et ateliers avec accompagnement technique adapté aux exigences du terrain.',
    image: '/src/assets/images/service_construction_sales_1795359215190.jpg',
  },
  {
    id: 3,
    name_ar: 'مطارق الهدم الكبيرة والصغيرة',
    name_fr: 'Marteaux-piqueurs et brise-béton (grands et petits)',
    description_ar:
      'تجهيزات هدم وتكسير الخرسانة بمختلف الأحجام والقدرات، من المطارق الكهربائية الدقيقة إلى المطارق الهيدروليكية والهوائية الثقيلة.',
    description_fr:
      'Gamme complète de marteaux démolisseurs, des modèles compacts de précision aux brise-béton lourds hydrauliques et pneumatiques.',
    image: '/src/assets/images/service_demolition_hammers_1795358133016.jpg',
  },
  {
    id: 4,
    name_ar: 'الضواغط الصناعية',
    name_fr: 'Compresseurs industriels',
    description_ar:
      'ضواغط هواء صناعية عالية الأداء لتشغيل المعدات الهوائية وورشات الطلاء وأعمال الصيانة الميكانيكية المستمرة.',
    description_fr:
      "Compresseurs d'air industriels haute performance pour l'alimentation des outils pneumatiques, ateliers de peinture et maintenance.",
    image: '/src/assets/images/service_air_compressors_1795359215140.jpg',
  },
  {
    id: 5,
    name_ar: 'معدات الطلاء الصناعي',
    name_fr: 'Équipements de peinture industrielle',
    description_ar:
      'مضخات رش بدون هواء (Airless) ومعدات طلاء الهياكل المعدنية والواجهات بدقة عالية وكفاءة تشغيلية ثابتة.',
    description_fr:
      'Systèmes de pulvérisation airless haute pression et équipements de revêtement pour structures métalliques et surfaces industrielles.',
    image: '/src/assets/images/service_painting_equipment_1795358135259.jpg',
  },
  {
    id: 6,
    name_ar: 'معدات اللحام',
    name_fr: 'Équipements de soudage',
    description_ar:
      'أجهزة لحام احترافية (MIG / TIG / ARC) ومستلزماتها لتنفيذ أعمال التلحيم الهيكلي والصناعي في الورشات والمواقع.',
    description_fr:
      'Postes à souder professionnels (MIG / TIG / ARC) et accessoires dédiés aux assemblages métalliques en atelier et sur chantier.',
    image: '/src/assets/images/service_welding_station_1795359215078.jpg',
  },
  {
    id: 7,
    name_ar: 'التصنيع المعدني',
    name_fr: 'Fabrication métallique',
    description_ar:
      'تصميم وتنفيذ الهياكل المعدنية، الأبواب الصناعية، الحوامل الفولاذية، والأعمال الحديدية المخصصة وفق المواصفات الهندسية.',
    description_fr:
      'Conception et réalisation de charpentes, ouvrages métalliques, portails industriels et pièces mécano-soudées sur mesure.',
    image: '/src/assets/images/project_steel_fabrication_1795358133713.jpg',
  },
  {
    id: 8,
    name_ar: 'أعمال الهدم والتفكيك',
    name_fr: 'Démolition et démantèlement',
    description_ar:
      'تنفيذ عمليات الهدم الجزئي والكلي وتفكيك المنشآت والهياكل المعدنية وفق معايير السلامة وتنظيم الورشات.',
    description_fr:
      'Opérations de démolition contrôlée et de démantèlement de structures métalliques ou bétonnées dans le respect des normes de sécurité.',
    image: '/src/assets/images/service_demolition_site_1795359215539.jpg',
  },
  {
    id: 9,
    name_ar: 'الخدمات الصناعية',
    name_fr: 'Services industriels',
    description_ar:
      'حلول دعم وصيانة تقنية متكاملة للمصانع والورشات تشمل التركيب الميكانيكي، الصيانة الميدانية، وتجهيز مواقع العمل.',
    description_fr:
      "Prestations d'appui technique pour sites industriels incluant maintenance sur site, montage mécanique et équipement de chantiers.",
    image: '/src/assets/images/service_industrial_workshop_1795359214398.jpg',
  },
];

export const DEFAULT_EQUIPMENT: EquipmentRecord[] = [
  {
    id: 1,
    name_ar: 'مطرقة هدم ثقيلة هيدروليكية / كهربائية',
    name_fr: 'Marteau-piqueur lourd de démolition',
    description_ar:
      'مطرقة تكسير عالية الطاقة مخصصة لهدم الأساسات الخرسانية والأرضيات الصناعية الصلبة.',
    description_fr:
      'Brise-béton haute énergie conçu pour la démolition de dalles épaisses, fondations et ouvrages en béton armé.',
    specs_ar: 'الاستخدام: تكسير الخرسانة الثقيلة · نظام تثبيت سداسي · مقبض ممتص للاهتزازات',
    specs_fr: 'Usage : béton armé lourd · Emmanchement hexagonal · Système anti-vibrations',
    image: '/src/assets/images/service_demolition_hammers_1795358133016.jpg',
    category: 'rental',
    availability: 'available',
  },
  {
    id: 2,
    name_ar: 'مطرقة تكسير ومعدات هدم للمواقع',
    name_fr: 'Équipement de démolition et brise-béton de chantier',
    description_ar:
      'تجهيزات هدم وتكسير مناسبة لأعمال النحت والتجديد وتفكيك العناصر الخرسانية.',
    description_fr:
      'Matériels adaptés aux travaux de reprise, dépose sélective et démolition contrôlée sur chantier.',
    specs_ar: 'فحص فني شامل · جاهزية عالية · تشغيل مستمر',
    specs_fr: 'Contrôle technique complet · Haute robustesse · Travail intensif',
    image: '/src/assets/images/service_demolition_site_1795359215539.jpg',
    category: 'sales',
    availability: 'available',
  },
  {
    id: 3,
    name_ar: 'ضاغط هواء صناعي دوار ومتنقل',
    name_fr: "Compresseur d'air industriel rotatif et mobile",
    description_ar:
      'ضاغط صناعي موثوق يوفر تدفق هواء مستقر لتشغيل المطارق الهوائية ومعدات الرش الصناعي.',
    description_fr:
      "Compresseur industriel robuste assurant un débit d'air constant pour outillage pneumatique et cabines d'application.",
    specs_ar: 'نظام تبريد صناعي · ضغط تشغيل مستقر · هيكل فولاذي معزول',
    specs_fr: 'Refroidissement continu · Pression régulée · Châssis acier renforcé',
    image: '/src/assets/images/service_air_compressors_1795359215140.jpg',
    category: 'rental',
    availability: 'available',
  },
  {
    id: 4,
    name_ar: 'مجموعة لحام صناعي متعدد العمليات',
    name_fr: 'Poste à souder industriel multi-procédés',
    description_ar:
      'جهاز لحام احترافي يدعم اللحام بالقوس الكهربائي وMIG/TIG للأعمال المعدنية الثقيلة في الورشة والميدان.',
    description_fr:
      'Poste de soudage professionnel compatible MIG/MAG, TIG et électrode enrobée pour charpentes et tuyauteries.',
    specs_ar: 'تيار مستقر · حماية حرارية متكاملة · مناسب للفولاذ والألمنيوم',
    specs_fr: 'Arc stabilisé · Protection thermique · Acier, inox et structures lourdes',
    image: '/src/assets/images/service_welding_station_1795359215078.jpg',
    category: 'sales',
    availability: 'available',
  },
  {
    id: 5,
    name_ar: 'مضخة طلاء صناعي عالي الضغط (Airless)',
    name_fr: 'Pompe de peinture industrielle Airless',
    description_ar:
      'نظام رش طلاء صناعي عالي الضغط يضمن تغطية متجانسة للهياكل الفولاذية والمستودعات والواجهات.',
    description_fr:
      'Groupe de pulvérisation haute pression garantissant une application uniforme sur charpentes métalliques et façades.',
    specs_ar: 'خرطوم ضغط عالي · فوهات قابلة للتبديل · هيكل متنقل بعجلات',
    specs_fr: 'Flexible haute pression · Buses interchangeables · Chariot mobile robuste',
    image: '/src/assets/images/service_painting_equipment_1795358135259.jpg',
    category: 'rental',
    availability: 'available',
  },
  {
    id: 6,
    name_ar: 'معدات دك التربة وخلط الخرسانة والمولدات',
    name_fr: 'Compacteurs, bétonnières et groupes de chantier',
    description_ar:
      'تجهيزات أساسية لأعمال التسوية والخرسانة والمولدات المحمولة لورشات البناء والطرقات.',
    description_fr:
      "Équipements essentiels pour le compactage des sols, le malaxage du béton et l'alimentation électrique de chantier.",
    specs_ar: 'جاهزية ميدانية · صيانة دورية شاملة · فحص قبل التسليم',
    specs_fr: 'Prêt pour chantier · Entretien préventif vérifié · Contrôle avant départ',
    image: '/src/assets/images/service_construction_sales_1795359215190.jpg',
    category: 'rental',
    availability: 'limited',
  },
];

export const DEFAULT_PROJECTS: ProjectRecord[] = [
  {
    id: 1,
    title_ar: 'التصنيع والتركيب المعدني للهياكل الصناعية',
    title_fr: 'Fabrication et assemblage de structures métalliques',
    description_ar:
      'معرض توضيحي لقدرات الورشة في قطع وتجميع وتلحيم العوارض الفولاذية والهياكل الصناعية الثقيلة.',
    description_fr:
      "Aperçu des capacités d'atelier en découpe, assemblage et soudage de poutrelles et charpentes métalliques.",
    category_ar: 'التصنيع المعدني',
    category_fr: 'Fabrication métallique',
    image: '/src/assets/images/project_steel_fabrication_1795358133713.jpg',
  },
  {
    id: 2,
    title_ar: 'تجهيز الورشات بأسطول معدات البناء',
    title_fr: "Déploiement de parc d'équipements de chantier",
    description_ar:
      'توفير وتجهيز آليات الدك وخلط الخرسانة والمولدات لتلبية احتياجات الورشات الكبرى والمقاولات.',
    description_fr:
      'Préparation et mise à disposition de compacteurs, bétonnières et groupes de chantier contrôlés.',
    category_ar: 'معدات البناء',
    category_fr: 'Équipements de chantier',
    image: '/src/assets/images/equipment_construction_fleet_1795358134026.jpg',
  },
  {
    id: 3,
    title_ar: 'أعمال التكسير والهدم التقني المنظم',
    title_fr: 'Opérations de démolition et démantèlement',
    description_ar:
      'استخدام الآليات الثقيلة ومطارق الهدم في تفكيك العناصر الخرسانية والمنشآت بدقة وأمان.',
    description_fr:
      'Mise en œuvre de pelles équipées de brise-béton pour la démolition contrôlée et le démantèlement.',
    category_ar: 'الهدم والتفكيك',
    category_fr: 'Démolition & démantèlement',
    image: '/src/assets/images/service_demolition_site_1795359215539.jpg',
  },
  {
    id: 4,
    title_ar: 'الصيانة الميكانيكية والورشات الصناعية',
    title_fr: 'Maintenance mécanique et ateliers industriels',
    description_ar:
      'ورشات مجهزة بالرافعات الجسرية ومعدات التشغيل الميكانيكي لضمان جاهزية الآليات والمشاريع.',
    description_fr:
      'Ateliers équipés de ponts roulants et machines de précision pour le soutien technique industriel.',
    category_ar: 'الورشات الصناعية',
    category_fr: 'Ateliers industriels',
    image: '/src/assets/images/service_industrial_workshop_1795359214398.jpg',
  },
];
