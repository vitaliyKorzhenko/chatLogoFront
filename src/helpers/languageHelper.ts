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