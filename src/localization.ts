export type LocalizationKeys = 
  | 'send'
  | 'logout'
  | 'chatTitle'
  | 'enterMessage'
  | 'loading'
  | 'error'
  | 'sendToEmail'
  | 'templates';

const localization = {
  ua: {
    send: 'Надіслати',
    logout: 'Вийти',
    chatTitle: 'Чат для вчителів',
    enterMessage: 'Введіть повідомлення',
    loading: 'Завантаження...',
    error: 'Щось пішло не так. Спробуйте ще раз.',
    sendToEmail: 'В email',
    templates: [
      'Посилання на урок',
      'Завдання для виконання',
      'Рекомендація для вивчення',
    ],
  },
  main: {
    send: 'Отправить',
    logout: 'Выйти',
    chatTitle: 'Чат для логопедов',
    enterMessage: 'Введите сообщение',
    loading: 'Загрузка...',
    error: 'Что-то пошло не так. Попробуйте еще раз.',
    sendToEmail: 'В email',
    templates: [
      'Ссылка на урок',
      'Задание для выполнения',
      'Рекомендация для изучения',
    ],
  },
  pl: {
    send: 'Wyślij',
    logout: 'Wyloguj się',
    chatTitle: 'Czat dla nauczycieli',
    enterMessage: 'Wpisz wiadomość',
    loading: 'Ładowanie...',
    error: 'Coś poszło nie tak. Spróbuj ponownie.',
    sendToEmail: 'Na email',
    templates: [
      'Link do lekcji',
      'Zadanie do wykonania',
      'Rekomendacja do nauki',
    ],
  },
};

export function getLocalizationText(source: 'ua' | 'main' | 'pl', key: LocalizationKeys): string | string[] {
  return localization[source]?.[key] || '';
}
