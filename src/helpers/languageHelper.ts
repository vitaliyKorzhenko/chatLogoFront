export function getNewMessageText (source : string): string  {
    let text = 'New Messsages';

    switch (source) {
        case 'ua':
            text = 'Нові повідомлення';
            break;
        case 'ru':
            text = 'Новые сообщения';
            break;
        case 'pl':
            text = 'Nowe wiadomości';
            break;
    }
    return text;
}

export function viaEmailMessage (source: string): string {
    let text = 'Send via email';

    switch (source) {
        case 'ua':
            text = 'Надіслати поштою';
            break;
        case 'ru':
            text = 'Отправить по почте';
            break;
        case 'pl':
            text = 'Wyślij e-mailem';
            break;
    }
    return text;
}


// ('Новое Повідомлення!', {
//     body: `Повідомлення від кліента: ${newMessage.text}`,

export function newMessageNotification (source: string): string {
    let text = 'New Message!';

    switch (source) {
        case 'ua':
            text = 'Нове повідомлення!';
            break;
        case 'ru':
            text = 'Новое сообщение!';
            break;
        case 'pl':
            text = 'Nowa wiadomość!';
            break;
    }
    return text;
}

export function messageFromClient (source: string): string {
    let text = 'Message from client:';

    switch (source) {
        case 'ua':
            text = 'Повідомлення від клієнта:';
            break;
        case 'ru':
            text = 'Сообщение от клиента:';
            break;
        case 'pl':
            text = 'Wiadomość od klienta:';
            break;
    }
    return text;
}

//Not Active

export function notActive (source: string): string {
    let text = 'Not Active';

    switch (source) {
        case 'ua':
            text = 'Не активний';
            break;
        case 'ru':
            text = 'Не активен';
            break;
        case 'pl':
            text = 'Nieaktywny';
            break;
    }
    return text;
}



//Students

export function studentsText (source: string): string {
    let text = 'Students';

    switch (source) {
        case 'ua':
            text = 'Учні';
            break;
        case 'ru':
            text = 'Ученики';
            break;
        case 'pl':
            text = 'Studenci';
            break;
    }
    return text;
}

//Chat 

export function chatText (source: string): string {
    let text = 'Chat';

    switch (source) {
        case 'ua':
            text = 'Чат';
            break;
        case 'ru':
            text = 'Чат';
            break;
        case 'pl':
            text = 'Czat';
            break;
    }
    return text;
}


export interface IDialogText {
    title: string;
    message: string;
    allow: string;
    howToEnable: string;
    later: string;
    linkTgCopy?: string;

}
export const getDialogText = (lang: string): IDialogText => {
    
    switch (lang) {
      case "ua":
        return {
          title: "📢 Дозвольте сповіщення!",
          message: "Щоб чат працював коректно і ви отримували нові повідомлення, потрібно увімкнути сповіщення.",
          allow: "Дозволити сповіщення",
          howToEnable: "Як увімкнути сповіщення?",
          later: "Пізніше",
          linkTgCopy: "Посилання на чат скопійовано",
        };
      case "pl":
        return {
          title: "📢 Zezwól na powiadomienia!",
          message: "Aby czat działał poprawnie i abyś otrzymywał nowe wiadomości, musisz włączyć powiadomienia.",
          allow: "Zezwól na powiadomienia",
          howToEnable: "Jak włączyć powiadomienia?",
          later: "Później",
          linkTgCopy: "Link do czatu skopiowany",
        };
      case "ru":
        return {
            title: "📢 Разрешите уведомления!",
            message: "Чтобы чат работал корректно и вы получали новые сообщения, необходимо включить уведомления.",
            allow: "Разрешить уведомления",
            howToEnable: "Как включить уведомления?",
            later: "Позже",
            linkTgCopy: "Ссылка на чат скопирована",
          };
      default:
        return {
            title: "📢 Дозвольте сповіщення!",
            message: "Щоб чат працював коректно і ви отримували нові повідомлення, потрібно увімкнути сповіщення.",
            allow: "Дозволити сповіщення",
            howToEnable: "Як увімкнути сповіщення?",
            later: "Пізніше",
            linkTgCopy: "Посилання на чат скопійовано",
        };
    }
  };

 export const notifSettings = (lang: string) => {
    switch (lang) {
      case "ru":
        return "⚠️ Ваш браузер не позволяет автоматически открыть настройки.\n\n🚀 Включите уведомления вручную:\n1️⃣ Перейдите в настройки браузера.\n2️⃣ Найдите раздел 'Уведомления'.\n3️⃣ Разрешите уведомления для этого сайта.";
  
      case "ua":
        return "⚠️ Ваш браузер не дозволяє автоматично відкрити налаштування.\n\n🚀 Увімкніть сповіщення вручну:\n1️⃣ Перейдіть у налаштування браузера.\n2️⃣ Знайдіть розділ 'Сповіщення'.\n3️⃣ Дозвольте сповіщення для цього сайту.";
  
      case "pl":
        return "⚠️ Twoja przeglądarka nie pozwala na automatyczne otwarcie ustawień.\n\n🚀 Włącz powiadomienia ręcznie:\n1️⃣ Przejdź do ustawień przeglądarki.\n2️⃣ Znajdź sekcję 'Powiadomienia'.\n3️⃣ Zezwól na powiadomienia dla tej strony.";
  
      default:
        return "⚠️ Your browser does not allow automatic opening of settings.\n\n🚀 Enable notifications manually:\n1️⃣ Go to your browser settings.\n2️⃣ Find the 'Notifications' section.\n3️⃣ Allow notifications for this site.";
    }
  };


export const getTgLink = (lang: string) => {
    switch (lang) {
      case "ru":
        return "Ссылка на чат скопирована";
  
      case "ua":
        return "Посилання на чат скопійовано";
  
      case "pl":
        return "Link do czatu skopiowany";
  
      default:
        return "Посилання на чат скопійовано";
    }
  }
  
  

  