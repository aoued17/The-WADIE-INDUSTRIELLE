-- WADIE INDUSTRIELLE — Initial Services, Equipment & Showcase Seed Data
-- Note: Zero pricing fields. No invented client projects or fake achievements.

INSERT INTO services (name_ar, name_fr, description_ar, description_fr, image)
SELECT * FROM (VALUES
  (
    'كراء معدات البناء',
    'Location d''équipements de construction',
    'توفير معدات بناء حديثة ومفحوصة فنياً للكراء اليومي أو طويل الأمد لمشاريع البناء والأشغال العمومية في غليزان والمناطق المجاورة.',
    'Mise à disposition d''équipements de chantier entretenus et contrôlés pour la location courte ou longue durée à Relizane et ses environs.',
    '/src/assets/images/equipment_construction_fleet_1795358134026.jpg'
  ),
  (
    'بيع معدات البناء',
    'Vente d''équipements de construction',
    'بيع معدات وآليات الورشات المعتمدة للمقاولين والحرفيين مع المرافقة الفنية لاختيار التجهيز المناسب لطبيعة العمل.',
    'Commercialisation de matériels professionnels pour chantiers et ateliers avec accompagnement technique adapté aux exigences du terrain.',
    '/src/assets/images/service_construction_sales_1795359215190.jpg'
  ),
  (
    'مطارق الهدم الكبيرة والصغيرة',
    'Marteaux-piqueurs et brise-béton (grands et petits)',
    'تجهيزات هدم وتكسير الخرسانة بمختلف الأحجام والقدرات، من المطارق الكهربائية الدقيقة إلى المطارق الهيدروليكية والهوائية الثقيلة.',
    'Gamme complète de marteaux démolisseurs, des modèles compacts de précision aux brise-béton lourds hydrauliques et pneumatiques.',
    '/src/assets/images/service_demolition_hammers_1795358133016.jpg'
  ),
  (
    'الضواغط الصناعية',
    'Compresseurs industriels',
    'ضواغط هواء صناعية عالية الأداء لتشغيل المعدات الهوائية وورشات الطلاء وأعمال الصيانة الميكانيكية المستمرة.',
    'Compresseurs d''air industriels haute performance pour l''alimentation des outils pneumatiques, ateliers de peinture et maintenance.',
    '/src/assets/images/service_air_compressors_1795359215140.jpg'
  ),
  (
    'معدات الطلاء الصناعي',
    'Équipements de peinture industrielle',
    'مضخات رش بدون هواء (Airless) ومعدات طلاء الهياكل المعدنية والواجهات بدقة عالية وكفاءة تشغيلية ثابتة.',
    'Systèmes de pulvérisation airless haute pression et équipements de revêtement pour structures métalliques et surfaces industrielles.',
    '/src/assets/images/service_painting_equipment_1795358135259.jpg'
  ),
  (
    'معدات اللحام',
    'Équipements de soudage',
    'أجهزة لحام احترافية (MIG / TIG / ARC) ومستلزماتها لتنفيذ أعمال التلحيم الهيكلي والصناعي في الورشات والمواقع.',
    'Postes à souder professionnels (MIG / TIG / ARC) et accessoires dédiés aux assemblages métalliques en atelier et sur chantier.',
    '/src/assets/images/service_welding_station_1795359215078.jpg'
  ),
  (
    'التصنيع المعدني',
    'Fabrication métallique',
    'تصميم وتنفيذ الهياكل المعدنية، الأبواب الصناعية، الحوامل الفولاذية، والأعمال الحديدية المخصصة وفق المواصفات الهندسية.',
    'Conception et réalisation de charpentes, ouvrages métalliques, portails industriels et pièces mécano-soudées sur mesure.',
    '/src/assets/images/project_steel_fabrication_1795358133713.jpg'
  ),
  (
    'أعمال الهدم والتفكيك',
    'Démolition et démantèlement',
    'تنفيذ عمليات الهدم الجزئي والكلي وتفكيك المنشآت والهياكل المعدنية وفق معايير السلامة وتنظيم الورشات.',
    'Opérations de démolition contrôlée et de démantèlement de structures métalliques ou bétonnées dans le respect des normes de sécurité.',
    '/src/assets/images/service_demolition_site_1795359215539.jpg'
  ),
  (
    'الخدمات الصناعية',
    'Services industriels',
    'حلول دعم وصيانة تقنية متكاملة للمصانع والورشات تشمل التركيب الميكانيكي، الصيانة الميدانية، وتجهيز مواقع العمل.',
    'Prestations d''appui technique pour sites industriels incluant maintenance sur site, montage mécanique et équipement de chantiers.',
    '/src/assets/images/service_industrial_workshop_1795359214398.jpg'
  )
) AS v(name_ar, name_fr, description_ar, description_fr, image)
WHERE NOT EXISTS (SELECT 1 FROM services);

INSERT INTO equipment (name_ar, name_fr, description_ar, description_fr, specs_ar, specs_fr, image, category, availability)
SELECT * FROM (VALUES
  (
    'مطرقة هدم ثقيلة هيدروليكية / كهربائية',
    'Marteau-piqueur lourd de démolition',
    'مطرقة تكسير عالية الطاقة مخصصة لهدم الأساسات الخرسانية والأرضيات الصناعية الصلبة.',
    'Brise-béton haute énergie conçu pour la démolition de dalles épaisses, fondations et ouvrages en béton armé.',
    'الاستخدام: تكسير الخرسانة الثقيلة · نظام تثبيت سداسي · مقبض ممتص للاهتزازات',
    'Usage : béton armé lourd · Emmanchement hexagonal · Système anti-vibrations',
    '/src/assets/images/service_demolition_hammers_1795358133016.jpg',
    'rental',
    'available'
  ),
  (
    'مطرقة تكسير ومعدات هدم للمواقع',
    'Équipement de démolition et brise-béton de chantier',
    'تجهيزات هدم وتكسير مناسبة لأعمال النحت والتجديد وتفكيك العناصر الخرسانية.',
    'Matériels adaptés aux travaux de reprise, dépose sélective et démolition contrôlée sur chantier.',
    'فحص فني شامل · جاهزية عالية · تشغيل مستمر',
    'Contrôle technique complet · Haute robustesse · Travail intensif',
    '/src/assets/images/service_demolition_site_1795359215539.jpg',
    'sales',
    'available'
  ),
  (
    'ضاغط هواء صناعي دوار ومتنقل',
    'Compresseur d''air industriel rotatif et mobile',
    'ضاغط صناعي موثوق يوفر تدفق هواء مستقر لتشغيل المطارق الهوائية ومعدات الرش الصناعي.',
    'Compresseur industriel robuste assurant un débit d''air constant pour outillage pneumatique et cabines d''application.',
    'نظام تبريد صناعي · ضغط تشغيل مستقر · هيكل فولاذي معزول',
    'Refroidissement continu · Pression régulée · Châssis acier renforcé',
    '/src/assets/images/service_air_compressors_1795359215140.jpg',
    'rental',
    'available'
  ),
  (
    'مجموعة لحام صناعي متعدد العمليات',
    'Poste à souder industriel multi-procédés',
    'جهاز لحام احترافي يدعم اللحام بالقوس الكهربائي وMIG/TIG للأعمال المعدنية الثقيلة في الورشة والميدان.',
    'Poste de soudage professionnel compatible MIG/MAG, TIG et électrode enrobée pour charpentes et tuyauteries.',
    'تيار مستقر · حماية حرارية متكاملة · مناسب للفولاذ والألمنيوم',
    'Arc stabilisé · Protection thermique · Acier, inox et structures lourdes',
    '/src/assets/images/service_welding_station_1795359215078.jpg',
    'sales',
    'available'
  ),
  (
    'مضخة طلاء صناعي عالي الضغط (Airless)',
    'Pompe de peinture industrielle Airless',
    'نظام رش طلاء صناعي عالي الضغط يضمن تغطية متجانسة للهياكل الفولاذية والمستودعات والواجهات.',
    'Groupe de pulvérisation haute pression garantissant une application uniforme sur charpentes métalliques et façades.',
    'خرطوم ضغط عالي · فوهات قابلة للتبديل · هيكل متنقل بعجلات',
    'Flexible haute pression · Buses interchangeables · Chariot mobile robuste',
    '/src/assets/images/service_painting_equipment_1795358135259.jpg',
    'rental',
    'available'
  ),
  (
    'معدات دك التربة وخلط الخرسانة والمولدات',
    'Compacteurs, bétonnières et groupes de chantier',
    'تجهيزات أساسية لأعمال التسوية والخرسانة والمولدات المحمولة لورشات البناء والطرقات.',
    'Équipements essentiels pour le compactage des sols, le malaxage du béton et l''alimentation électrique de chantier.',
    'جاهزية ميدانية · صيانة دورية شاملة · فحص قبل التسليم',
    'Prêt pour chantier · Entretien préventif vérifié · Contrôle avant départ',
    '/src/assets/images/service_construction_sales_1795359215190.jpg',
    'rental',
    'limited'
  )
) AS v(name_ar, name_fr, description_ar, description_fr, specs_ar, specs_fr, image, category, availability)
WHERE NOT EXISTS (SELECT 1 FROM equipment);

INSERT INTO projects (title_ar, title_fr, description_ar, description_fr, category_ar, category_fr, image)
SELECT * FROM (VALUES
  (
    'التصنيع والتركيب المعدني للهياكل الصناعية',
    'Fabrication et assemblage de structures métalliques',
    'معرض توضيحي لقدرات الورشة في قطع وتجميع وتلحيم العوارض الفولاذية والهياكل الصناعية الثقيلة.',
    'Aperçu des capacités d''atelier en découpe, assemblage et soudage de poutrelles et charpentes métalliques.',
    'التصنيع المعدني',
    'Fabrication métallique',
    '/src/assets/images/project_steel_fabrication_1795358133713.jpg'
  ),
  (
    'تجهيز الورشات بأسطول معدات البناء',
    'Déploiement de parc d''équipements de chantier',
    'توفير وتجهيز آليات الدك وخلط الخرسانة والمولدات لتلبية احتياجات الورشات الكبرى والمقاولات.',
    'Préparation et mise à disposition de compacteurs, bétonnières et groupes de chantier contrôlés.',
    'معدات البناء',
    'Équipements de chantier',
    '/src/assets/images/equipment_construction_fleet_1795358134026.jpg'
  ),
  (
    'أعمال التكسير والهدم التقني المنظم',
    'Opérations de démolition et démantèlement',
    'استخدام الآليات الثقيلة ومطارق الهدم في تفكيك العناصر الخرسانية والمنشآت بدقة وأمان.',
    'Mise en œuvre de pelles équipées de brise-béton pour la démolition contrôlée et le démantèlement.',
    'الهدم والتفكيك',
    'Démolition & démantèlement',
    '/src/assets/images/service_demolition_site_1795359215539.jpg'
  ),
  (
    'الصيانة الميكانيكية والورشات الصناعية',
    'Maintenance mécanique et ateliers industriels',
    'ورشات مجهزة بالرافعات الجسرية ومعدات التشغيل الميكانيكي لضمان جاهزية الآليات والمشاريع.',
    'Ateliers équipés de ponts roulants et machines de précision pour le soutien technique industriel.',
    'الورشات الصناعية',
    'Ateliers industriels',
    '/src/assets/images/service_industrial_workshop_1795359214398.jpg'
  )
) AS v(title_ar, title_fr, description_ar, description_fr, category_ar, category_fr, image)
WHERE NOT EXISTS (SELECT 1 FROM projects);
