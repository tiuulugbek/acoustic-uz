import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding posts...');

  // Get categories
  const bemorlar = await prisma.postCategory.findUnique({ where: { slug: 'bemorlar' } });
  const bolalar = await prisma.postCategory.findUnique({ where: { slug: 'bolalar' } });

  if (!bemorlar || !bolalar) {
    console.error('❌ Categories not found. Please run seed-post-categories.ts first.');
    process.exit(1);
  }

  // Posts from https://sluh.by/hearing-about/ (Bemorlar category)
  const bemorlarPosts = [
    {
      title_uz: 'Yoshga bog\'liq eshitish pasayishi. Presbiakuzis',
      title_ru: 'Возрастное снижение слуха. Пресбиакузис',
      slug: 'yoshga-bog-liq-eshitish-pasayishi-presbiakuzis',
      excerpt_uz: 'Eshitish pasayishi jarayoni 30-40 yoshda boshlanishi mumkin va dastlab ko\'rinadigan belgilarsiz davom etishi mumkin.',
      excerpt_ru: 'Процесс ухудшения слуха с возрастом может начаться уже в 30-40 лет и первое время протекать без видимых симптомов.',
      body_uz: `<h2>Yoshga bog'liq eshitish pasayishi</h2>
<p>Eshitish pasayishi jarayoni 30-40 yoshda boshlanishi mumkin va dastlab ko'rinadigan belgilarsiz davom etishi mumkin. Bu tabiiy jarayon bo'lib, ko'pchilik odamlarda yuzaga keladi.</p>
<p>Presbiakuzis - bu yoshga bog'liq eshitish pasayishi bo'lib, asosan yuqori chastotali tovushlarni eshitish qobiliyatining asta-sekin pasayishi bilan tavsiflanadi.</p>
<h3>Belgilar</h3>
<ul>
<li>Odamlar nutqini tushunishda qiyinchilik</li>
<li>Shovqinli muhitda eshitish qiyinlashadi</li>
<li>Telefon suhbatlarida qiyinchilik</li>
<li>Televizor yoki radio ovozini balandroq qilish zarurati</li>
</ul>
<h3>Sabablari</h3>
<p>Yoshga bog'liq eshitish pasayishining asosiy sabablari:</p>
<ul>
<li>Ichki quloqning yoshi bilan o'zgarishi</li>
<li>Asab hujayralarining sonining kamayishi</li>
<li>Qon aylanishining yomonlashishi</li>
<li>Shovqin ta'sirining yig'ilishi</li>
</ul>
<h3>Davolash</h3>
<p>Yoshga bog'liq eshitish pasayishini to'liq tiklash mumkin emas, lekin eshitish apparatlari yordamida yaxshilash mumkin. Muntazam eshitish tekshiruvi va professional maslahat muhimdir.</p>`,
      body_ru: `<h2>Возрастное снижение слуха</h2>
<p>Процесс ухудшения слуха с возрастом может начаться уже в 30-40 лет и первое время протекать без видимых симптомов. Это естественный процесс, который происходит у большинства людей.</p>
<p>Пресбиакузис - это возрастное снижение слуха, которое характеризуется постепенным ухудшением способности слышать высокочастотные звуки.</p>
<h3>Симптомы</h3>
<ul>
<li>Трудности с пониманием речи людей</li>
<li>Слух ухудшается в шумной обстановке</li>
<li>Трудности при телефонных разговорах</li>
<li>Необходимость увеличивать громкость телевизора или радио</li>
</ul>
<h3>Причины</h3>
<p>Основные причины возрастного снижения слуха:</p>
<ul>
<li>Изменения внутреннего уха с возрастом</li>
<li>Уменьшение количества нервных клеток</li>
<li>Ухудшение кровообращения</li>
<li>Накопление воздействия шума</li>
</ul>
<h3>Лечение</h3>
<p>Возрастное снижение слуха нельзя полностью восстановить, но можно улучшить с помощью слуховых аппаратов. Важны регулярные проверки слуха и профессиональные консультации.</p>`,
      categoryId: bemorlar.id,
      postType: 'article',
      status: 'published',
      tags: ['eshitish', 'yosh', 'presbiakuzis'],
    },
    {
      title_uz: 'Qandli diabet va eshitish yo\'qotilishi',
      title_ru: 'Сахарный диабет и тугоухость',
      slug: 'qandli-diabet-va-eshitish-yo-qotilishi',
      excerpt_uz: 'Qondagi yuqori glyukoza darajasi diabetda eshitish yo\'qotilishining rivojlanishi uchun xavf omili.',
      excerpt_ru: 'Высокий уровень глюкозы в крови, как фактор риска развития тугоухости при диабете.',
      body_uz: `<h2>Qandli diabet va eshitish yo'qotilishi</h2>
<p>Qondagi yuqori glyukoza darajasi diabetda eshitish yo'qotilishining rivojlanishi uchun xavf omili hisoblanadi.</p>
<p>Diabet bilan og'rigan odamlarda eshitish muammolari tez-tez uchraydi va bu muammo diabetning uzoq muddatli asoratlaridan biri bo'lishi mumkin.</p>
<h3>Bog'liqlik</h3>
<p>Diabet va eshitish yo'qotilishi o'rtasidagi bog'liqlik quyidagicha:</p>
<ul>
<li>Qon tomirlarining zararlanishi</li>
<li>Asab hujayralarining o'zgarishi</li>
<li>Qon aylanishining yomonlashishi</li>
<li>Yallig'lanish jarayonlari</li>
</ul>
<h3>Oldini olish</h3>
<p>Diabet bilan og'rigan odamlar uchun muhim:</p>
<ul>
<li>Qon shakari darajasini nazorat qilish</li>
<li>Muntazam eshitish tekshiruvlaridan o'tish</li>
<li>Salomatlikli turmush tarzini saqlash</li>
<li>Professional maslahat olish</li>
</ul>`,
      body_ru: `<h2>Сахарный диабет и тугоухость</h2>
<p>Высокий уровень глюкозы в крови является фактором риска развития тугоухости при диабете.</p>
<p>У людей с диабетом проблемы со слухом встречаются часто, и это может быть одним из долгосрочных осложнений диабета.</p>
<h3>Связь</h3>
<p>Связь между диабетом и потерей слуха следующая:</p>
<ul>
<li>Повреждение кровеносных сосудов</li>
<li>Изменения нервных клеток</li>
<li>Ухудшение кровообращения</li>
<li>Воспалительные процессы</li>
</ul>
<h3>Профилактика</h3>
<p>Для людей с диабетом важно:</p>
<ul>
<li>Контролировать уровень сахара в крови</li>
<li>Регулярно проходить проверки слуха</li>
<li>Вести здоровый образ жизни</li>
<li>Получать профессиональные консультации</li>
</ul>`,
      categoryId: bemorlar.id,
      postType: 'article',
      status: 'published',
      tags: ['diabet', 'eshitish', 'sog\'liq'],
    },
    {
      title_uz: 'Eshitish organining tuzilishi',
      title_ru: 'Строение органа слуха',
      slug: 'eshitish-organining-tuzilishi',
      excerpt_uz: 'Odam eshitish organi qanday tuzilgan, nimalardan iborat va qanday ishlaydi - buni siz ushbu maqolada bilib olasiz.',
      excerpt_ru: 'Как устроен, из чего состоит и как работает орган слуха человека Вы узнаете в данной статье.',
      body_uz: `<h2>Eshitish organining tuzilishi</h2>
<p>Odam eshitish organi murakkab tuzilishga ega bo'lib, uchta asosiy qismdan iborat:</p>
<h3>1. Tashqi quloq</h3>
<p>Tashqi quloq quloq yorig'i va eshitish kanalidan iborat. U tovush to'lqinlarini yig'adi va o'rta quloqqa uzatadi.</p>
<h3>2. O'rta quloq</h3>
<p>O'rta quloq timpanik pardadan va uchta suyakdan (bolg'a, zanjir, uzangi) iborat. Ular tovushni kuchaytiradi va ichki quloqqa uzatadi.</p>
<h3>3. Ichki quloq</h3>
<p>Ichki quloq kokleadan (snail) iborat bo'lib, unda eshitish reseptorlari joylashgan. Bu yerda tovush signali elektr signaliga aylantiriladi va miyaga uzatiladi.</p>
<h3>Qanday ishlaydi?</h3>
<p>Tovush to'lqinlari tashqi quloqdan o'rta quloq orqali ichki quloqqa yetib boradi. Ichki quloqda tovush signali elektr signaliga aylantiriladi va eshitish nervi orqali miyaga uzatiladi.</p>`,
      body_ru: `<h2>Строение органа слуха</h2>
<p>Орган слуха человека имеет сложное строение и состоит из трех основных частей:</p>
<h3>1. Наружное ухо</h3>
<p>Наружное ухо состоит из ушной раковины и слухового канала. Оно собирает звуковые волны и передает их в среднее ухо.</p>
<h3>2. Среднее ухо</h3>
<p>Среднее ухо состоит из барабанной перепонки и трех косточек (молоточек, наковальня, стремечко). Они усиливают звук и передают его во внутреннее ухо.</p>
<h3>3. Внутреннее ухо</h3>
<p>Внутреннее ухо состоит из улитки (cochlea), где расположены слуховые рецепторы. Здесь звуковой сигнал преобразуется в электрический сигнал и передается в мозг.</p>
<h3>Как это работает?</h3>
<p>Звуковые волны проходят от наружного уха через среднее ухо во внутреннее ухо. Во внутреннем ухе звуковой сигнал преобразуется в электрический сигнал и передается в мозг через слуховой нерв.</p>`,
      categoryId: bemorlar.id,
      postType: 'article',
      status: 'published',
      tags: ['quloq', 'tuzilish', 'anatomiya'],
    },
    {
      title_uz: 'Eshitish yo\'qotilishi turlari va darajalari',
      title_ru: 'Типы и степени тугоухости',
      slug: 'eshitish-yo-qotilishi-turlari-va-darajalari',
      excerpt_uz: 'Eshitish yo\'qotilishi nima, eshitish qobiliyatiga qarab qanday turlari mavjud, qanday davolash usullari bor.',
      excerpt_ru: 'Что такое тугоухость, какие виды тугоухости различают в зависимости от порогов слышимости, какие методы лечения существуют.',
      body_uz: `<h2>Eshitish yo'qotilishi turlari va darajalari</h2>
<p>Eshitish yo'qotilishi (tugouxoсть) - bu eshitish qobiliyatining pasayishi bo'lib, turli sabablar va darajalarda bo'lishi mumkin.</p>
<h3>Turlari</h3>
<p>Eshitish yo'qotilishi uchta asosiy turga bo'linadi:</p>
<ul>
<li><strong>Konduktiv tugouxoсть</strong> - tashqi yoki o'rta quloqning muammosi</li>
<li><strong>Sensorinevral tugouxoсть</strong> - ichki quloq yoki eshitish nervining muammosi</li>
<li><strong>Aralash tugouxoсть</strong> - ikkala turdagi muammolar</li>
</ul>
<h3>Darajalari</h3>
<p>Eshitish yo'qotilishi quyidagi darajalarga bo'linadi:</p>
<ul>
<li><strong>Yengil</strong> - 20-40 dB</li>
<li><strong>O'rta</strong> - 41-55 dB</li>
<li><strong>O'rtacha og'ir</strong> - 56-70 dB</li>
<li><strong>Og'ir</strong> - 71-90 dB</li>
<li><strong>Chuqur</strong> - 90 dB dan yuqori</li>
</ul>
<h3>Davolash</h3>
<p>Davolash usullari tugouxoсть turi va darajasiga bog'liq:</p>
<ul>
<li>Eshitish apparatlari</li>
<li>Koklear implantlar</li>
<li>Dori-darmonlar</li>
<li>Jarrohlik</li>
</ul>`,
      body_ru: `<h2>Типы и степени тугоухости</h2>
<p>Тугоухость - это снижение способности слышать, которое может быть вызвано различными причинами и иметь разные степени.</p>
<h3>Типы</h3>
<p>Тугоухость делится на три основных типа:</p>
<ul>
<li><strong>Кондуктивная тугоухость</strong> - проблема наружного или среднего уха</li>
<li><strong>Сенсоневральная тугоухость</strong> - проблема внутреннего уха или слухового нерва</li>
<li><strong>Смешанная тугоухость</strong> - оба типа проблем</li>
</ul>
<h3>Степени</h3>
<p>Тугоухость делится на следующие степени:</p>
<ul>
<li><strong>Легкая</strong> - 20-40 дБ</li>
<li><strong>Умеренная</strong> - 41-55 дБ</li>
<li><strong>Умеренно тяжелая</strong> - 56-70 дБ</li>
<li><strong>Тяжелая</strong> - 71-90 дБ</li>
<li><strong>Глубокая</strong> - более 90 дБ</li>
</ul>
<h3>Лечение</h3>
<p>Методы лечения зависят от типа и степени тугоухости:</p>
<ul>
<li>Слуховые аппараты</li>
<li>Кохлеарные импланты</li>
<li>Лекарства</li>
<li>Хирургия</li>
</ul>`,
      categoryId: bemorlar.id,
      postType: 'article',
      status: 'published',
      tags: ['tugouxoсть', 'daraja', 'davolash'],
    },
    {
      title_uz: 'Eshitish buzilishining sabablari va belgilari',
      title_ru: 'Причины и признаки нарушения слуха',
      slug: 'eshitish-buzilishining-sabablari-va-belgilari',
      excerpt_uz: 'Eshitish buzilishining qanday belgilari mavjud, qanday sabablar neyrosensor yoki konduktiv tugouxoстьni keltirib chiqaradi.',
      excerpt_ru: 'Какие симптомы могут говорить о нарушении слуха, какие причины вызывают появление нейросенсорной или кондуктивной тугоухости.',
      body_uz: `<h2>Eshitish buzilishining sabablari va belgilari</h2>
<p>Eshitish buzilishi turli sabablar bilan yuzaga kelishi mumkin va erta aniqlash muhimdir.</p>
<h3>Belgilar</h3>
<p>Eshitish buzilishining asosiy belgilari:</p>
<ul>
<li>Odamlar nutqini tushunishda qiyinchilik</li>
<li>Shovqinli muhitda eshitish qiyinlashadi</li>
<li>Televizor yoki radio ovozini balandroq qilish zarurati</li>
<li>Telefon suhbatlarida qiyinchilik</li>
<li>Quloqda shovqin yoki vijirlash</li>
<li>Ba\'zi tovushlarni eshitmaslik</li>
</ul>
<h3>Sabablari</h3>
<p>Neyrosensor tugouxoсть sabablari:</p>
<ul>
<li>Yoshga bog'liq o'zgarishlar</li>
<li>Shovqin ta'siri</li>
<li>Dori-darmonlar</li>
<li>Kasalliklar</li>
<li>Genetik omillar</li>
</ul>
<p>Konduktiv tugouxoсть sabablari:</p>
<ul>
<li>Quloq kirining to'planishi</li>
<li>O'rta quloq infeksiyalari</li>
<li>Tympanik pardaning yorilishi</li>
<li>O'rta quloq suyaklarining muammolari</li>
</ul>`,
      body_ru: `<h2>Причины и признаки нарушения слуха</h2>
<p>Нарушение слуха может возникать по различным причинам, и важно выявить его на ранней стадии.</p>
<h3>Симптомы</h3>
<p>Основные признаки нарушения слуха:</p>
<ul>
<li>Трудности с пониманием речи людей</li>
<li>Слух ухудшается в шумной обстановке</li>
<li>Необходимость увеличивать громкость телевизора или радио</li>
<li>Трудности при телефонных разговорах</li>
<li>Шум или звон в ушах</li>
<li>Неспособность слышать некоторые звуки</li>
</ul>
<h3>Причины</h3>
<p>Причины нейросенсорной тугоухости:</p>
<ul>
<li>Возрастные изменения</li>
<li>Воздействие шума</li>
<li>Лекарства</li>
<li>Заболевания</li>
<li>Генетические факторы</li>
</ul>
<p>Причины кондуктивной тугоухости:</p>
<ul>
<li>Накопление ушной серы</li>
<li>Инфекции среднего уха</li>
<li>Разрыв барабанной перепонки</li>
<li>Проблемы с косточками среднего уха</li>
</ul>`,
      categoryId: bemorlar.id,
      postType: 'article',
      status: 'published',
      tags: ['belgilar', 'sabablar', 'tugouxoсть'],
    },
    {
      title_uz: 'Otoskleroz va eshitish yo\'qotilishi',
      title_ru: 'Отосклероз и тугоухость',
      slug: 'otoskleroz-va-eshitish-yo-qotilishi',
      excerpt_uz: 'Otoskleroz - o\'rtacha yoshdagi odamlarda eshitish yo\'qotilishining eng keng tarqalgan sababi. Xavf omillari, diagnostika usullari va davolash usullari.',
      excerpt_ru: 'Отосклероз - самая частая причина тугоухости у людей среднего возраста. Факторы риска, методы диагностики и способы лечения.',
      body_uz: `<h2>Otoskleroz va eshitish yo'qotilishi</h2>
<p>Otoskleroz - o'rta yoshdagi odamlarda eshitish yo'qotilishining eng keng tarqalgan sababi hisoblanadi.</p>
<p>Bu kasallik o'rta quloq suyaklarining noto'g'ri o'sishi bilan tavsiflanadi, bu esa tovush o'tkazilishini buzadi.</p>
<h3>Xavf omillari</h3>
<ul>
<li>Genetik moyillik</li>
<li>Ayollar ko'proq ta'sirlanadi</li>
<li>Hormonal o'zgarishlar</li>
<li>Hamilelik</li>
</ul>
<h3>Belgilar</h3>
<ul>
<li>Asta-sekin eshitish pasayishi</li>
<li>Quloqda shovqin</li>
<li>Vertigo (bosh aylanishi)</li>
<li>Bir quloqda ko'proq muammo</li>
</ul>
<h3>Diagnostika</h3>
<p>Otosklerozni aniqlash uchun quyidagi tekshiruvlar o'tkaziladi:</p>
<ul>
<li>Audiometriya</li>
<li>Tympanometriya</li>
<li>Kompyuter tomografiyasi</li>
</ul>
<h3>Davolash</h3>
<p>Davolash usullari:</p>
<ul>
<li>Eshitish apparatlari</li>
<li>Jarrohlik (stapedektomiya)</li>
<li>Dori-darmonlar (ba'zi hollarda)</li>
</ul>`,
      body_ru: `<h2>Отосклероз и тугоухость</h2>
<p>Отосклероз является самой частой причиной тугоухости у людей среднего возраста.</p>
<p>Это заболевание характеризуется неправильным ростом косточек среднего уха, что нарушает передачу звука.</p>
<h3>Факторы риска</h3>
<ul>
<li>Генетическая предрасположенность</li>
<li>Женщины страдают чаще</li>
<li>Гормональные изменения</li>
<li>Беременность</li>
</ul>
<h3>Симптомы</h3>
<ul>
<li>Постепенное снижение слуха</li>
<li>Шум в ушах</li>
<li>Головокружение</li>
<li>Больше проблем в одном ухе</li>
</ul>
<h3>Диагностика</h3>
<p>Для диагностики отосклероза проводятся следующие исследования:</p>
<ul>
<li>Аудиометрия</li>
<li>Тимпанометрия</li>
<li>Компьютерная томография</li>
</ul>
<h3>Лечение</h3>
<p>Методы лечения:</p>
<ul>
<li>Слуховые аппараты</li>
<li>Хирургия (стапедэктомия)</li>
<li>Лекарства (в некоторых случаях)</li>
</ul>`,
      categoryId: bemorlar.id,
      postType: 'article',
      status: 'published',
      tags: ['otoskleroz', 'kasallik', 'davolash'],
    },
  ];

  // Posts from https://sluh.by/deti-i-sluh/ (Bolalar category)
  const bolalarPosts = [
    {
      title_uz: 'Bolalarda eshitish yo\'qotilishining sabablari',
      title_ru: 'Причины тугоухости у детей',
      slug: 'bolalarda-eshitish-yo-qotilishining-sabablari',
      excerpt_uz: 'Bolalarda eshitish yo\'qotilishining asosiy sabablari va ularni oldini olish usullari.',
      excerpt_ru: 'Основные причины тугоухости у детей и способы их предотвращения.',
      body_uz: `<h2>Bolalarda eshitish yo'qotilishining sabablari</h2>
<p>Bolalarda eshitish yo'qotilishi turli sabablar bilan yuzaga kelishi mumkin. Erta aniqlash va davolash muhimdir.</p>
<h3>Konnatal sabablar</h3>
<ul>
<li>Genetik omillar</li>
<li>Hamilelik davridagi infeksiyalar</li>
<li>Erta tug'ilish</li>
<li>Vazn yetishmovchiligi</li>
<li>Asfiksiya</li>
</ul>
<h3>Perinatal sabablar</h3>
<ul>
<li>Tug'ilish travmasi</li>
<li>Qon o'zgarishlari</li>
<li>Nafas olish muammolari</li>
<li>Infeksiyalar</li>
</ul>
<h3>Postnatal sabablar</h3>
<ul>
<li>O'rta quloq infeksiyalari</li>
<li>Meningit</li>
<li>Qizilcha</li>
<li>Shovqin ta'siri</li>
<li>Dori-darmonlar</li>
</ul>
<h3>Oldini olish</h3>
<p>Bolalarda eshitish yo'qotilishining oldini olish uchun:</p>
<ul>
<li>Muntazam skrining tekshiruvlari</li>
<li>Vaksinatsiya</li>
<li>Shovqindan himoya</li>
<li>Muntazam tekshiruvlar</li>
</ul>`,
      body_ru: `<h2>Причины тугоухости у детей</h2>
<p>Тугоухость у детей может возникать по различным причинам. Важны раннее выявление и лечение.</p>
<h3>Врожденные причины</h3>
<ul>
<li>Генетические факторы</li>
<li>Инфекции во время беременности</li>
<li>Преждевременные роды</li>
<li>Низкий вес при рождении</li>
<li>Асфиксия</li>
</ul>
<h3>Перинатальные причины</h3>
<ul>
<li>Родовая травма</li>
<li>Изменения крови</li>
<li>Проблемы с дыханием</li>
<li>Инфекции</li>
</ul>
<h3>Постнатальные причины</h3>
<ul>
<li>Инфекции среднего уха</li>
<li>Менингит</li>
<li>Краснуха</li>
<li>Воздействие шума</li>
<li>Лекарства</li>
</ul>
<h3>Профилактика</h3>
<p>Для предотвращения тугоухости у детей:</p>
<ul>
<li>Регулярные скрининговые проверки</li>
<li>Вакцинация</li>
<li>Защита от шума</li>
<li>Регулярные проверки</li>
</ul>`,
      categoryId: bolalar.id,
      postType: 'article',
      status: 'published',
      tags: ['bolalar', 'sabablar', 'oldini-olish'],
    },
    {
      title_uz: 'Bolalarda eshitish buzilishining belgilari',
      title_ru: 'Признаки нарушения слуха у детей',
      slug: 'bolalarda-eshitish-buzilishining-belgilari',
      excerpt_uz: 'Bolalarda eshitish buzilishining qanday belgilari mavjud va ularni qanday aniqlash mumkin.',
      excerpt_ru: 'Какие признаки нарушения слуха существуют у детей и как их можно выявить.',
      body_uz: `<h2>Bolalarda eshitish buzilishining belgilari</h2>
<p>Bolalarda eshitish buzilishini erta aniqlash muhimdir, chunki bu nutq va til rivojlanishiga ta'sir qiladi.</p>
<h3>Yosh bolalarda belgilar</h3>
<ul>
<li>Ovozga javob bermaydi</li>
<li>Ismga javob bermaydi</li>
<li>Tovushlarni takrorlamaydi</li>
<li>Nutq rivojlanishi kechikadi</li>
<li>Televizor yoki musiqa ovozini balandroq qiladi</li>
</ul>
<h3>Kattaroq bolalarda belgilar</h3>
<ul>
<li>Ko'pincha "nima?" deb so'raydi</li>
<li>Nutqni tushunmaydi</li>
<li>Maktabda muammolarga duch keladi</li>
<li>Ijtimoiy izolyatsiya</li>
<li>Xulq-atvor muammolari</li>
</ul>
<h3>Qanday tekshirish</h3>
<p>Ota-onalar quyidagilarni kuzatishi kerak:</p>
<ul>
<li>Bolaning eshitish reaksiyalari</li>
<li>Nutq rivojlanishi</li>
<li>Ijtimoiy o'zaro munosabatlar</li>
<li>Maktabdagi muvaffaqiyat</li>
</ul>
<p>Agar shubha bo'lsa, mutaxassislarga murojaat qilish kerak.</p>`,
      body_ru: `<h2>Признаки нарушения слуха у детей</h2>
<p>Важно выявить нарушение слуха у детей на ранней стадии, так как это влияет на развитие речи и языка.</p>
<h3>Признаки у маленьких детей</h3>
<ul>
<li>Не реагирует на звуки</li>
<li>Не реагирует на имя</li>
<li>Не повторяет звуки</li>
<li>Задержка речевого развития</li>
<li>Увеличивает громкость телевизора или музыки</li>
</ul>
<h3>Признаки у старших детей</h3>
<ul>
<li>Часто спрашивает "что?"</li>
<li>Не понимает речь</li>
<li>Испытывает проблемы в школе</li>
<li>Социальная изоляция</li>
<li>Проблемы с поведением</li>
</ul>
<h3>Как проверить</h3>
<p>Родители должны наблюдать за:</p>
<ul>
<li>Реакциями ребенка на звуки</li>
<li>Развитием речи</li>
<li>Социальными взаимодействиями</li>
<li>Успехами в школе</li>
</ul>
<p>При подозрении необходимо обратиться к специалистам.</p>`,
      categoryId: bolalar.id,
      postType: 'article',
      status: 'published',
      tags: ['bolalar', 'belgilar', 'tekshiruv'],
    },
    {
      title_uz: 'Bolada eshitish yo\'qotilishini qanday aniqlash mumkin',
      title_ru: 'Как определить у ребенка тугоухость',
      slug: 'bolada-eshitish-yo-qotilishini-qanday-aniqlash-mumkin',
      excerpt_uz: 'Bolada eshitish yo\'qotilishini aniqlash usullari va qanday tekshiruvlar o\'tkaziladi.',
      excerpt_ru: 'Методы определения тугоухости у ребенка и какие проверки проводятся.',
      body_uz: `<h2>Bolada eshitish yo'qotilishini qanday aniqlash mumkin</h2>
<p>Bolada eshitish yo'qotilishini aniqlash uchun turli diagnostik usullar mavjud.</p>
<h3>Skrining tekshiruvlari</h3>
<p>Yangi tug'ilgan chaqaloqlarda skrining tekshiruvlari o'tkaziladi:</p>
<ul>
<li>Otoakustik emissiya (OAE)</li>
<li>Eshitish miya stem responsi (ABR)</li>
</ul>
<h3>Klinik tekshiruvlar</h3>
<p>Kattaroq bolalar uchun:</p>
<ul>
<li>Audiometriya</li>
<li>Tympanometriya</li>
<li>Nutq eshitish testlari</li>
</ul>
<h3>Qachon tekshirish kerak</h3>
<ul>
<li>Tug'ilganda (skrining)</li>
<li>3 oylikda</li>
<li>6 oylikda</li>
<li>1 yoshda</li>
<li>Maktabga kirishdan oldin</li>
<li>Shubha bo'lganda</li>
</ul>
<h3>Muhimlik</h3>
<p>Erta aniqlash va davolash bolaning nutq va til rivojlanishi uchun juda muhimdir.</p>`,
      body_ru: `<h2>Как определить у ребенка тугоухость</h2>
<p>Для определения тугоухости у ребенка существуют различные диагностические методы.</p>
<h3>Скрининговые проверки</h3>
<p>У новорожденных проводятся скрининговые проверки:</p>
<ul>
<li>Отоакустическая эмиссия (ОАЭ)</li>
<li>Слуховой ответ ствола мозга (ABR)</li>
</ul>
<h3>Клинические проверки</h3>
<p>Для старших детей:</p>
<ul>
<li>Аудиометрия</li>
<li>Тимпанометрия</li>
<li>Речевые слуховые тесты</li>
</ul>
<h3>Когда проверять</h3>
<ul>
<li>При рождении (скрининг)</li>
<li>В 3 месяца</li>
<li>В 6 месяцев</li>
<li>В 1 год</li>
<li>Перед школой</li>
<li>При подозрении</li>
</ul>
<h3>Важность</h3>
<p>Раннее выявление и лечение очень важны для развития речи и языка у ребенка.</p>`,
      categoryId: bolalar.id,
      postType: 'article',
      status: 'published',
      tags: ['bolalar', 'diagnostika', 'tekshiruv'],
    },
    {
      title_uz: 'Bolani eshitish tekshiruviga qanday tayyorlash kerak',
      title_ru: 'Как подготовить ребенка к проверке слуха',
      slug: 'bolani-eshitish-tekshiruviga-qanday-tayyorlash-kerak',
      excerpt_uz: 'Bolani eshitish tekshiruviga tayyorlash uchun qanday qadamlarni amalga oshirish kerak.',
      excerpt_ru: 'Какие шаги необходимо предпринять для подготовки ребенка к проверке слуха.',
      body_uz: `<h2>Bolani eshitish tekshiruviga qanday tayyorlash kerak</h2>
<p>Bolani eshitish tekshiruviga to'g'ri tayyorlash muvaffaqiyatli natijalar olish uchun muhimdir.</p>
<h3>Tayyorgarlik</h3>
<ul>
<li>Bolaga nima bo'lishini tushuntirish</li>
<li>Qo'rqmasligini tushuntirish</li>
<li>O'yin shaklida tushuntirish</li>
<li>Tinch va xotirjam muhit yaratish</li>
</ul>
<h3>Tekshiruv kuni</h3>
<ul>
<li>Bolani yaxshi uxlashga ruxsat berish</li>
<li>Ovqatlanishni ta'minlash</li>
<li>Qulay kiyim kiyish</li>
<li>Sevimli o'yinchoqlarni olib kelish</li>
<li>Vaqtida kelish</li>
</ul>
<h3>Tekshiruv davomida</h3>
<ul>
<li>Tinch bo'lish</li>
<li>Mutaxassislarga ishonish</li>
<li>Bolani qo'llab-quvvatlash</li>
<li>Savollar berish</li>
</ul>
<h3>Natijalardan keyin</h3>
<p>Agar muammo aniqlansa, mutaxassislar bilan davolash rejasini muhokama qilish kerak.</p>`,
      body_ru: `<h2>Как подготовить ребенка к проверке слуха</h2>
<p>Правильная подготовка ребенка к проверке слуха важна для получения успешных результатов.</p>
<h3>Подготовка</h3>
<ul>
<li>Объяснить ребенку, что будет происходить</li>
<li>Объяснить, что не нужно бояться</li>
<li>Объяснить в игровой форме</li>
<li>Создать спокойную и расслабленную атмосферу</li>
</ul>
<h3>День проверки</h3>
<ul>
<li>Дать ребенку хорошо выспаться</li>
<li>Обеспечить питание</li>
<li>Одеть удобную одежду</li>
<li>Принести любимые игрушки</li>
<li>Прийти вовремя</li>
</ul>
<h3>Во время проверки</h3>
<ul>
<li>Быть спокойным</li>
<li>Доверять специалистам</li>
<li>Поддерживать ребенка</li>
<li>Задавать вопросы</li>
</ul>
<h3>После результатов</h3>
<p>Если выявлена проблема, необходимо обсудить план лечения со специалистами.</p>`,
      categoryId: bolalar.id,
      postType: 'article',
      status: 'published',
      tags: ['bolalar', 'tayyorgarlik', 'tekshiruv'],
    },
    {
      title_uz: 'Bolalarda eshitishni tuzatishning xususiyatlari',
      title_ru: 'Особенности коррекции слуха у детей',
      slug: 'bolalarda-eshitishni-tuzatishning-xususiyatlari',
      excerpt_uz: 'Bolalarda eshitishni tuzatishning o\'ziga xos xususiyatlari va qanday yondashuvlar qo\'llaniladi.',
      excerpt_ru: 'Особенности коррекции слуха у детей и какие подходы применяются.',
      body_uz: `<h2>Bolalarda eshitishni tuzatishning xususiyatlari</h2>
<p>Bolalarda eshitishni tuzatish kattalar bilan solishtirganda o'ziga xos xususiyatlarga ega.</p>
<h3>Eshitish apparatlari</h3>
<p>Bolalar uchun eshitish apparatlari:</p>
<ul>
<li>Kuchli va bardoshli</li>
<li>Bolalar uchun maxsus dizayn</li>
<li>Rangli va qiziqarli</li>
<li>Ota-onalar uchun boshqaruv</li>
</ul>
<h3>Koklear implantlar</h3>
<p>Ba'zi hollarda koklear implantlar tavsiya etiladi:</p>
<ul>
<li>Chuqur eshitish yo'qotilishi</li>
<li>Eshitish apparatlari yordam bermaydi</li>
<li>Erta yoshda</li>
</ul>
<h3>Reabilitatsiya</h3>
<p>Davolashdan keyin reabilitatsiya muhimdir:</p>
<ul>
<li>Nutq terapiyasi</li>
<li>Eshitish mashqlari</li>
<li>Ota-onalar bilan ishlash</li>
<li>Maktab yordami</li>
</ul>
<h3>Muntazam kuzatuv</h3>
<p>Bolalarda muntazam kuzatuv va sozlashlar zarurdir, chunki ular o'sib boradi va o'zgaradi.</p>`,
      body_ru: `<h2>Особенности коррекции слуха у детей</h2>
<p>Коррекция слуха у детей имеет свои особенности по сравнению со взрослыми.</p>
<h3>Слуховые аппараты</h3>
<p>Слуховые аппараты для детей:</p>
<ul>
<li>Мощные и прочные</li>
<li>Специальный дизайн для детей</li>
<li>Яркие и интересные</li>
<li>Управление для родителей</li>
</ul>
<h3>Кохлеарные импланты</h3>
<p>В некоторых случаях рекомендуются кохлеарные импланты:</p>
<ul>
<li>Глубокая потеря слуха</li>
<li>Слуховые аппараты не помогают</li>
<li>В раннем возрасте</li>
</ul>
<h3>Реабилитация</h3>
<p>После лечения важна реабилитация:</p>
<ul>
<li>Речевая терапия</li>
<li>Слуховые упражнения</li>
<li>Работа с родителями</li>
<li>Школьная поддержка</li>
</ul>
<h3>Регулярное наблюдение</h3>
<p>У детей необходимы регулярное наблюдение и настройки, так как они растут и меняются.</p>`,
      categoryId: bolalar.id,
      postType: 'article',
      status: 'published',
      tags: ['bolalar', 'tuzatish', 'davolash'],
    },
    {
      title_uz: 'Bolalarda quloq infeksiyalari',
      title_ru: 'Ушные инфекции у детей',
      slug: 'bolalarda-quloq-infeksiyalari',
      excerpt_uz: 'Bolalarda quloq infeksiyalari, ularning sabablari, belgilari va davolash usullari.',
      excerpt_ru: 'Ушные инфекции у детей, их причины, симптомы и методы лечения.',
      body_uz: `<h2>Bolalarda quloq infeksiyalari</h2>
<p>Quloq infeksiyalari bolalarda juda keng tarqalgan va ularni to'g'ri davolash muhimdir.</p>
<h3>Turlari</h3>
<ul>
<li><strong>O'rta quloq infeksiyasi (otit)</strong> - eng keng tarqalgan</li>
<li><strong>Tashqi quloq infeksiyasi</strong> - eshitish kanalidagi infeksiya</li>
<li><strong>Ichki quloq infeksiyasi</strong> - kam uchraydi, lekin jiddiy</li>
</ul>
<h3>Belgilar</h3>
<ul>
<li>Quloq og'rig'i</li>
<li>Ishqalanish</li>
<li>Harorat</li>
<li>Yomon eshitish</li>
<li>Quloqdan suyuqlik oqishi</li>
<li>Yomon uyqu</li>
<li>Yomon ishtaha</li>
</ul>
<h3>Sabablari</h3>
<ul>
<li>Bakterial infeksiyalar</li>
<li>Virusli infeksiyalar</li>
<li>Allergiya</li>
<li>Yumshoq to'qimalar shishishi</li>
</ul>
<h3>Davolash</h3>
<ul>
<li>Antibiotiklar (bakterial infeksiyalar uchun)</li>
<li>Og'riq qoldiruvchi dori-darmonlar</li>
<li>Harorat pasaytiruvchi dori-darmonlar</li>
<li>Ba'zi hollarda jarrohlik</li>
</ul>
<h3>Oldini olish</h3>
<ul>
<li>Vaksinatsiya</li>
<li>Shovqindan himoya</li>
<li>Muntazam gigiyena</li>
<li>Muntazam tekshiruvlar</li>
</ul>`,
      body_ru: `<h2>Ушные инфекции у детей</h2>
<p>Ушные инфекции очень распространены у детей, и важно правильно их лечить.</p>
<h3>Типы</h3>
<ul>
<li><strong>Инфекция среднего уха (отит)</strong> - наиболее распространенная</li>
<li><strong>Инфекция наружного уха</strong> - инфекция слухового канала</li>
<li><strong>Инфекция внутреннего уха</strong> - встречается редко, но серьезно</li>
</ul>
<h3>Симптомы</h3>
<ul>
<li>Боль в ухе</li>
<li>Раздражительность</li>
<li>Лихорадка</li>
<li>Плохой слух</li>
<li>Выделения из уха</li>
<li>Плохой сон</li>
<li>Плохой аппетит</li>
</ul>
<h3>Причины</h3>
<ul>
<li>Бактериальные инфекции</li>
<li>Вирусные инфекции</li>
<li>Аллергия</li>
<li>Отек мягких тканей</li>
</ul>
<h3>Лечение</h3>
<ul>
<li>Антибиотики (при бактериальных инфекциях)</li>
<li>Обезболивающие препараты</li>
<li>Жаропонижающие препараты</li>
<li>Хирургия в некоторых случаях</li>
</ul>
<h3>Профилактика</h3>
<ul>
<li>Вакцинация</li>
<li>Защита от шума</li>
<li>Регулярная гигиена</li>
<li>Регулярные проверки</li>
</ul>`,
      categoryId: bolalar.id,
      postType: 'article',
      status: 'published',
      tags: ['bolalar', 'infeksiya', 'davolash'],
    },
  ];

  // Create all posts
  for (const post of [...bemorlarPosts, ...bolalarPosts]) {
    const created = await prisma.post.upsert({
      where: { slug: post.slug },
      update: {},
      create: {
        ...post,
        publishAt: new Date(),
      },
    });
    console.log(`✅ Created post: ${post.title_uz}`);
  }

  console.log('✨ Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });









