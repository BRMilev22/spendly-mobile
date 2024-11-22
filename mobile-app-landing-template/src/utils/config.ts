import type { TemplateConfig } from "./configType";

const templateConfig: TemplateConfig = {
  name: "Spendly",
  seo: {
    title: "Spendly - Управлявай финансите си с лекота",
    description:
      "Spendly е мобилно приложение, което ти помага да управляваш разходите си по лесен и интуитивен начин.",
  },
  backgroundGrid: false,
  logo: "/icon.png",
  theme: "corporate",
  forceTheme: false,
  showThemeSwitch: true,
  appStoreLink: "",
  googlePlayLink: "",
  footer: {
    legalLinks: {
      termsAndConditions: true,
      cookiesPolicy: true,
      privacyPolicy: true,
    },
    socials: {
      instagram: "",
      facebook: "",
      twitter: "",
    },
    links: [
      { href: "/#features", title: "Функционалности" },
      { href: "/#how-it-works", title: "Как работи" },
      { href: "/#pricing", title: "Цени" },
      { href: "/#faq", title: "Често задавани въпроси" },
    ],
  },
  topNavbar: {
    cta: "Изтегли приложението",
    disableWidthAnimation: true,
    hideAppStore: true,
    hideGooglePlay: true,
    links: [
      { href: "/#features", title: "Функционалности" },
      { href: "/#how-it-works", title: "Как работи" },
      { href: "/#pricing", title: "Цени" },
      { href: "/#faq", title: "Често задавани въпроси" },
    ],
  },
  appBanner: {
    id: "app-banner",
    title: "Изтегли Spendly още днес!",
    subtitle:
      "Открий удобен начин за управление на личните си финанси, където и да се намираш.",
    screenshots: [
      "/screenshots/1.webp",
      "/screenshots/2.webp",
      "/screenshots/3.webp",
    ],
  },
  home: {
    seo: {
      title: "Spendly - Лесно и удобно приложение за финанси",
      description:
        "Spendly е твоето решение за следене на разходите и планиране на бюджета. Изтегли приложението сега!",
    },
    testimonials: {
      id: "testimonials",
      title: "Отзиви",
      subtitle: "Какво казват нашите потребители",
      cards: [
        {
          name: "Иван Иванов",
          comment:
            "Spendly промени начина, по който следя разходите си. Приложението е изключително интуитивно и лесно за използване.",
        },
        {
          name: "Мария Петрова",
          comment:
            "С помощта на Spendly мога да планирам бюджета си и да спестявам по-ефективно. Силно препоръчвам!",
        },
        {
          name: "Георги Георгиев",
          comment:
            "Приложението е страхотно! Лесно е за използване и ми помага да следя разходите си без усилие.",
        },
      ],
    },
    partners: {
      title: "Доверено от",
      logos: ["/misc/companies/vscpi.png"],
    },
    howItWorks: {
      id: "how-it-works",
      title: "Как работи",
      subtitle: "Лесен процес в няколко стъпки",
      steps: [
        {
          title: "Инсталирай приложението",
          subtitle:
            "Изтегли Spendly и го инсталирай на своето устройство.",
          image: "/stock/01.webp",
        },
        {
          title: "Създай акаунт",
          subtitle:
            "Регистрирай се с твоите данни за минути.",
          image: "/stock/02.webp",
        },
        {
          title: "Добави разходите си",
          subtitle:
            "Започни да въвеждаш своите разходи и приходи.",
          image: "/stock/03.webp",
        },
        {
          title: "Анализирай бюджета си",
          subtitle:
            "Получавай полезни статистики и съвети.",
          image: "/stock/04.webp",
        },
      ],
    },
    features: {
      id:"features",
      title:"Функционалности",
      subtitle:"Spendly предлага иновативни инструменти за ефективно управление на финансите ти.",
      cards:[
        {
          title:"Проследяване на разходи.",
          subtitle:"Лесно и бързо добавяне на разходи.",
          icon:"/3D/money-front-color.webp"
        },{
          title:"Сканиране на касови бележки.",
          subtitle:"Сканирай касовите си бележки, за да запазиш разходите си лесно.",
          icon:"/3D/camera-front-color.webp"
        },{
          title:"Напомняния.",
          subtitle:"Настрой напомняния за важни плащания и срокове.",
          icon:"/3D/bulb-front-color.webp"
        },{
          title:"История на разходите.",
          subtitle:"Следи историята на разходите си и анализирай тенденциите.",
          icon:"/3D/wallet-front-color.webp"
        },
     ]
   },
   faq:{
     id:"faq",
     title:"Често задавани въпроси.",
     qa:[
       {
         question:"Как да създам акаунт?",
         answer:"Натисни бутона 'Регистрация' и въведете своите данни."
       },
       {
         question:"Колко струва приложението?",
         answer:"Spendly е напълно безплатно за ползване!"
       },
       {
         question:"Как мога да сканирам касови бележки?",
         answer:"Приложението има функция за сканиране, която автоматично разпознава информацията от касовата бележка."
       },
       {
         question:"Мога ли да получавам напомняния?",
         answer:"Да, можеш да настроиш напомняния за важни плащания и срокове."
       }
     ]
   },
   header:{
     headline:"Поемете контрол над финансите си.",
     subtitle:"Ефективно управление на разходите.",
     screenshots:["/screenshots/1.webp"],
     usersDescription:"100+ души вече ползват приложението.",
     headlineMark:[1,3]
   },
   pricing:{
     id:"pricing",
     title:"Цени.",
     subtitle:"Spendly е напълно безплатно!",
     actionText:"Изтегли приложението безплатно!",
     plans:[
       {
         title:"Безплатен план.",
         price:"0 лв/месец.",
         rows:["Всички основни функции.","Няма ограничения."]
       }
     ]
   }
}
};

export default templateConfig;
