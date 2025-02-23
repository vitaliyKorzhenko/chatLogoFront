import { Typography } from "@mui/material";
import { IChatMessage } from "../ClientData";

export function createTitle (source: string): string {
    let title= source === 'ua' ? 'Мова-Промова' : source === 'ru' ? 'Govorika' : 'Poland';
    return title;
}


// Функция для получения имени файла из URL
const getFileName = (url: string) => {
  const parts = url.split("/");
  return parts[parts.length - 1]; // Берём последний элемент пути (сам файл)
};

// Функция для проверки, является ли строка URL
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const renderMessageContent = (message: IChatMessage) => {
  console.info('message', message);
  switch (message.format) {
    case "voice":
    case "audio":
      return (
        <audio controls>
          <source src={message.text} type="audio/mpeg" />
          Браузер не поддерживает воспроизведение аудио.
        </audio>
      );

    case "photo":
    case "image":
      return (
        <img
          src={message.text}
          alt="Изображение"
          style={{ maxWidth: "100%", borderRadius: "8px" }}
        />
      );

    case "video":
      return (
        <video controls style={{ maxWidth: "100%", borderRadius: "8px" }}>
          <source src={message.text} type="video/mp4" />
          Ваш браузер не підтримує відтворення відео.
        </video>
      );

    case "video_note":
    case "vide_note": // Вариант кружка, как в Telegram
      return (
        <video
          controls
          style={{
            width: "200px",
            height: "200px",
            borderRadius: "50%",
            objectFit: "cover",
          }}
        >
          <source src={message.text} type="video/mp4" />
          Ваш браузер не підтримує відтворення відео.
        </video>
      );

    case "document":
    case "file": {
      const fileName = getFileName(message.text); // Получаем имя файла
      return (
        <a
          href={message.text}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#007bff", textDecoration: "none" }}
        >
          📄 {fileName} (Завантажити)
        </a>
      );
    }

    default:
      // Если тип не определён, но текст является валидным URL,
      // показываем его как ссылку для скачивания файла.
      if (isValidUrl(message.text)) {
        const fileName = getFileName(message.text);
        return (
          <a
            href={message.text}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "white", textDecoration: "none" }}
          >
            📄 {fileName} (Завантажити)
          </a>
        );
      }
      return (
        <Typography
          sx={{
            wordBreak: "break-word",
            whiteSpace: "pre-wrap",
            overflowWrap: "break-word",
          }}
        >
          {message.text}
        </Typography>
      );
  }
};



// export const renderMessageContent = (message: IChatMessage) => {
//     switch (message.format) {
//       case 'voice':
//   return (
//     <audio controls>
//       <source src={message.text} type="audio/ogg" />
//       <source src={message.text} type="audio/mpeg" />
//       Браузер не поддерживает воспроизведение аудио.
//     </audio>
//   );
//       case 'audio':
//         return (
//           <audio controls>
//             <source src={message.text} type="audio/mpeg" />
//             Браузер не поддерживает воспроизведение аудио.
//           </audio>
//         );
  
//       case 'photo':
//         return <img src={message.text} alt="Photo" style={{ maxWidth: '100%', borderRadius: '8px' }} />;
      
//       case 'image':
//         return <img src={message.text} alt="Photo" style={{ maxWidth: '100%', borderRadius: '8px' }} />;
  
//       case 'document':
//         return (
//           <a href={message.text} target="_blank" rel="noopener noreferrer" style={{ color: '#007bff' }}>
//             📄 Завантажити файл 
//           </a>
//         );
//       case 'file':
//        return (
//           <a href={message.text} target="_blank" rel="noopener noreferrer" style={{ color: '#007bff' }}>
//             📄 Завантажити файл 
//           </a>
//         );
  
//       case 'video':
//         return (
//           <video controls style={{ maxWidth: '100%', borderRadius: '8px' }}>
//             <source src={message.text} type="video/mp4" />
//             Ваш браузер не підтримує відтворення відео.
//           </video>
//         );
  
//       case 'video_note':
//       case 'vide_note': // Вариант кружка, как в Telegram
//         return (
//           <video
//             controls
//             style={{
//               width: '200px',
//               height: '200px',
//               borderRadius: '50%',
//               objectFit: 'cover',
//             }}
//           >
//             <source src={message.text} type="video/mp4" />
//             Ваш браузер не підтримує відтворення відео.
//           </video>
//         );
  
//         default:
//           return (
//             <Typography 
//               sx={{ 
//                 wordBreak: 'break-word',  // Разбивает длинные слова
//                 whiteSpace: 'pre-wrap',   // Сохраняет переносы строк
//                 overflowWrap: 'break-word' // Перенос длинного текста
//               }}
//             >
//               {message.text}
//             </Typography>
//           );
        
//     }
//   };