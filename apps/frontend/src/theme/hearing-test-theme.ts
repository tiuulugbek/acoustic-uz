// Acoustic Brand Theme Configuration for Hearing Test
export const acousticTheme = {
  colors: {
    // Primary brand colors
    primary: {
      main: '#1a4d7a',      // Deep blue - Acoustic brand
      light: '#2d6ba3',
      dark: '#0d2e4d',
      contrast: '#ffffff',
    },
    
    // Secondary/Accent colors
    secondary: {
      main: '#00a896',      // Teal/turquoise accent
      light: '#33bfb0',
      dark: '#007866',
      contrast: '#ffffff',
    },
    
    // Status colors
    success: {
      main: '#28a745',
      light: '#5cb85c',
      dark: '#1e7e34',
    },
    
    warning: {
      main: '#ffc107',
      light: '#ffcd38',
      dark: '#cc9a06',
    },
    
    error: {
      main: '#c41e3a',      // Red for Acoustic
      light: '#d64554',
      dark: '#9a1829',
    },
    
    // Neutral colors
    grey: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#eeeeee',
      300: '#e0e0e0',
      400: '#bdbdbd',
      500: '#9e9e9e',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
    },
    
    // Text colors
    text: {
      primary: '#212529',
      secondary: '#6c757d',
      disabled: '#9e9e9e',
    },
    
    // Background colors
    background: {
      default: '#ffffff',
      paper: '#fafafa',
      light: '#f5f5f5',
    },
  },
  
  // Typography
  typography: {
    fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem',// 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem',    // 48px
    },
    fontWeight: {
      light: 300,
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  
  // Spacing
  spacing: (factor: number) => `${0.25 * factor}rem`, // 4px base
  
  // Border radius
  borderRadius: {
    none: '0',
    sm: '0.25rem',   // 4px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    full: '9999px',
  },
  
  // Shadows
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },
  
  // Transitions
  transitions: {
    fast: '150ms',
    base: '300ms',
    slow: '500ms',
  },
};

// O'zbek va Rus tili matnlari
export const hearingTestTranslations = {
  uz: {
    welcome: {
      title: "Keling, sizning eshitishingizni",
      titleHighlight: "tekshiramiz",
      disclaimer: "Acoustic onlayn eshitish testi audiolog yoki shifokorga tashrif o'rnini bosmasligi va tibbiy tashxis hisoblanmasligi kerak.",
      consentText: "Iltimos, e'tibor bering, agar siz testni boshlasangiz, biz ma'lumotlaringizni qayta ishlash uchun sizning roziligingizni olamiz. Ma'lumotlar faqat test natijalarini taqdim etish uchun ishlatiladi. Biz sizning ma'lumotlaringizni test tugagandan keyin darhol o'chiramiz.",
      privacyLink: "Maxfiylik siyosati",
      continueButton: "Davom etish",
    },
    setup: {
      title: "Tinch joy toping va",
      titleHighlight: "naushnikni kiyib oling",
      step1: {
        number: "1",
        title: "Tinch joy toping",
        subtitle: "shovqin minimal bo'lgan joyda",
      },
      step2: {
        number: "2",
        title: "Naushnikni va qurilmangizni sozlang",
        subtitle: "maksimal ovoz qilib",
      },
      step3: {
        number: "3",
        title: "Naushnikni tekshiring",
        subtitle: "to'g'ri ishlashini ta'minlash uchun",
        playButton: "Musiqa ijro etish",
      },
      backButton: "Orqaga",
      continueButton: "Davom etish",
    },
    testStart: {
      ready: "Siz testga tayyorsiz!",
      title: "Keling,",
      leftEar: "chap quloq",
      rightEar: "o'ng quloq",
      titleSuffix: "dan boshlaymiz",
      backButton: "Orqaga",
      continueButton: "Davom etish",
    },
    calibration: {
      title: "Ovozni sozlang",
      titleAction: "Tortib yoki",
      titleButtons: "+/- tugmalaridan foydalaning",
      subtitle: "tovushni zo'rg'a eshitguncha ovozni moslang",
      instruction: "Naushnik va qurilmangizni maksimal ovoz qilib qo'ying",
      frequency: "Hz",
      tooltip: "Tovushni zo'rg'a eshitguncha ovozni sozlash uchun tortib yoki +/- tugmalaridan foydalaning",
      backButton: "Orqaga",
      continueButton: "Davom etish",
    },
    results: {
      noLoss: {
        title: "Eshitish yo'qotilishi",
        titleResult: "aniqlanmadi",
        subtitle: "Bu onlayn eshitish testi eshitish yo'qotilishini aniqlamadi. Ushbu baholash professional ko'rik yoki tibbiy tashxis o'rnini bosmaydi. Agar siz eshitish yo'qotilishidan shubhalansangiz, to'liq ko'rik uchun eshitish mutaxassisiga murojaat qiling.",
        leftEar: "Chap quloq",
        rightEar: "O'ng quloq",
        noLossDetected: "Yo'qotilish aniqlanmadi",
        aboutButton: "Eshitish haqida",
        findProfessional: "Mutaxassis topish",
      },
      withLoss: {
        title: "Eshitish yo'qotilishi",
        titleResult: "aniqlandi",
        subtitle: "Bu onlayn eshitish testi eshitish yo'qotilishini aniqladi. Batafsil ko'rik uchun eshitish mutaxassisiga murojaat qilishingizni tavsiya etamiz.",
      },
    },
  },
  ru: {
    welcome: {
      title: "Давайте проверим",
      titleHighlight: "ваш слух",
      disclaimer: "Онлайн тест слуха Acoustic не заменяет визит к аудиологу или врачу и не является медицинским диагнозом.",
      consentText: "Обратите внимание, что если вы начнете тест, мы получим ваше согласие на обработку ваших данных. Данные используются только для предоставления результатов теста. Мы удаляем ваши данные сразу после завершения теста.",
      privacyLink: "Политика конфиденциальности",
      continueButton: "Продолжить",
    },
    setup: {
      title: "Найдите тихое место и",
      titleHighlight: "наденьте наушники",
      step1: {
        number: "1",
        title: "Найдите тихое место",
        subtitle: "с минимальным шумом",
      },
      step2: {
        number: "2",
        title: "Настройте наушники и устройство",
        subtitle: "на максимальную громкость",
      },
      step3: {
        number: "3",
        title: "Проверьте наушники",
        subtitle: "чтобы убедиться, что они работают правильно",
        playButton: "Воспроизвести музыку",
      },
      backButton: "Назад",
      continueButton: "Продолжить",
    },
    testStart: {
      ready: "Вы готовы к тесту!",
      title: "Давайте начнем с",
      leftEar: "левого уха",
      rightEar: "правого уха",
      titleSuffix: "",
      backButton: "Назад",
      continueButton: "Продолжить",
    },
    calibration: {
      title: "Настройте громкость",
      titleAction: "Перетащите или",
      titleButtons: "используйте кнопки +/-",
      subtitle: "настройте громкость, пока не услышите звук",
      instruction: "Установите наушники и устройство на максимальную громкость",
      frequency: "Гц",
      tooltip: "Перетащите или используйте кнопки +/- для настройки громкости, пока не услышите звук",
      backButton: "Назад",
      continueButton: "Продолжить",
    },
    results: {
      noLoss: {
        title: "Потеря слуха",
        titleResult: "не обнаружена",
        subtitle: "Этот онлайн тест слуха не обнаружил потерю слуха. Эта оценка не заменяет профессиональный осмотр или медицинский диагноз. Если вы подозреваете потерю слуха, обратитесь к специалисту по слуху для полного осмотра.",
        leftEar: "Левое ухо",
        rightEar: "Правое ухо",
        noLossDetected: "Потеря не обнаружена",
        aboutButton: "О слухе",
        findProfessional: "Найти специалиста",
      },
      withLoss: {
        title: "Потеря слуха",
        titleResult: "обнаружена",
        subtitle: "Этот онлайн тест слуха обнаружил потерю слуха. Рекомендуем обратиться к специалисту по слуху для подробного осмотра.",
      },
    },
  },
};
