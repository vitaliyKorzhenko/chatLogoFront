// Единые функции для работы с датами во всем приложении

/**
 * Безопасно парсит дату из различных форматов
 * @param dateInput - может быть ISO строкой, timestamp строкой или Date объектом
 * @returns Date объект или null если не удалось распарсить
 */
export const safeParseDate = (dateInput: string | Date | number): Date | null => {
  if (!dateInput) return null;
  
  try {
    // Если это уже Date объект
    if (dateInput instanceof Date) {
      return isNaN(dateInput.getTime()) ? null : dateInput;
    }
    
    // Если это число (timestamp)
    if (typeof dateInput === 'number') {
      const date = new Date(dateInput);
      return isNaN(date.getTime()) ? null : date;
    }
    
    // Если это строка
    if (typeof dateInput === 'string') {
      // Пробуем парсить как ISO строку
      const date = new Date(dateInput);
      if (!isNaN(date.getTime())) {
        return date;
      }
      
      // Пытаемся извлечь компоненты даты из строки вида "20.03.2025, 14:25"
      const match1 = dateInput.match(/(\d{1,2})\.(\d{1,2})\.(\d{4}),\s*(\d{1,2}):(\d{1,2})/);
      if (match1) {
        const [, day, month, year, hours, minutes] = match1;
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes));
        return isNaN(date.getTime()) ? null : date;
      }
      
      // Пытаемся извлечь компоненты даты из строки вида "20-03-2025 14:25"
      const match2 = dateInput.match(/(\d{1,2})-(\d{1,2})-(\d{4})\s+(\d{1,2}):(\d{1,2})/);
      if (match2) {
        const [, day, month, year, hours, minutes] = match2;
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes));
        return isNaN(date.getTime()) ? null : date;
      }
      
      // Пытаемся извлечь компоненты даты из строки вида "20/03/2025 14:25"
      const match3 = dateInput.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{1,2})/);
      if (match3) {
        const [, day, month, year, hours, minutes] = match3;
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes));
        return isNaN(date.getTime()) ? null : date;
      }
      
      // Пытаемся извлечь компоненты даты из строки вида "20.03.2025 14:25" (без запятой)
      const match4 = dateInput.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})\s+(\d{1,2}):(\d{1,2})/);
      if (match4) {
        const [, day, month, year, hours, minutes] = match4;
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes));
        return isNaN(date.getTime()) ? null : date;
      }
      
      // Пытаемся извлечь компоненты даты из строки вида "01/15/2024, 10:30 AM" (локальный формат)
      const match5 = dateInput.match(/(\d{1,2})\/(\d{1,2})\/(\d{4}),\s*(\d{1,2}):(\d{2})\s*(AM|PM)/);
      if (match5) {
        const [, month, day, year, hours, minutes, ampm] = match5;
        let hour = parseInt(hours);
        if (ampm === 'PM' && hour !== 12) hour += 12;
        if (ampm === 'AM' && hour === 12) hour = 0;
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), hour, parseInt(minutes));
        return isNaN(date.getTime()) ? null : date;
      }
      
      // Пытаемся извлечь компоненты даты из строки вида "15/01/2024, 10:30 AM" (европейский формат)
      const match6 = dateInput.match(/(\d{1,2})\/(\d{1,2})\/(\d{4}),\s*(\d{1,2}):(\d{2})\s*(AM|PM)/);
      if (match6) {
        const [, day, month, year, hours, minutes, ampm] = match6;
        let hour = parseInt(hours);
        if (ampm === 'PM' && hour !== 12) hour += 12;
        if (ampm === 'AM' && hour === 12) hour = 0;
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), hour, parseInt(minutes));
        return isNaN(date.getTime()) ? null : date;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing date:', dateInput, error);
    return null;
  }
};

/**
 * Форматирует дату для отображения в формате "DD-MM-YYYY HH:MM"
 * @param dateInput - дата в любом формате
 * @returns отформатированная строка или "Invalid Date" если не удалось распарсить
 */
export const formatDateTime = (dateInput: string | Date | number): string => {
  // Простой парсинг как было в вебе
  let date: Date;
  
  if (dateInput instanceof Date) {
    date = dateInput;
  } else if (typeof dateInput === 'string') {
    date = new Date(dateInput);
  } else if (typeof dateInput === 'number') {
    date = new Date(dateInput);
  } else {
    return "Invalid Date";
  }
  
  if (isNaN(date.getTime())) {
    return "Invalid Date";
  }
  
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  return `${day}-${month}-${year} ${hours}:${minutes}`;
};

/**
 * Форматирует дату для отображения в формате "DD-MM-YYYY" (для группировки)
 * @param dateInput - дата в ISO формате
 * @returns отформатированная строка или "Invalid Date" если не удалось распарсить
 */
export const formatDateKey = (dateInput: string | Date | number): string => {
  // Простой парсинг ISO даты как было в вебе
  let date: Date;
  
  if (dateInput instanceof Date) {
    date = dateInput;
  } else if (typeof dateInput === 'string') {
    date = new Date(dateInput);
  } else if (typeof dateInput === 'number') {
    date = new Date(dateInput);
  } else {
    console.error('Invalid date input:', dateInput);
    return "Invalid Date";
  }
  
  if (isNaN(date.getTime())) {
    console.error('Failed to parse date for grouping:', dateInput);
    return "Invalid Date";
  }
  
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}-${month}-${year}`;
};

/**
 * Создает timestamp строку для новых сообщений
 * @returns строка в формате "MM/DD/YYYY, h:mm A"
 */
export const createTimestampString = (): string => {
  const now = new Date();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const year = now.getFullYear();
  const hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  
  return `${month}/${day}/${year}, ${displayHours}:${minutes} ${ampm}`;
};

/**
 * Конвертирует ISO строку в локальный формат для совместимости
 * @param isoString - ISO строка даты
 * @returns строка в локальном формате
 */
export const isoToLocalString = (isoString: string): string => {
  const date = safeParseDate(isoString);
  if (!date) return "Invalid Date";
  
  return date.toLocaleString([], {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}; 