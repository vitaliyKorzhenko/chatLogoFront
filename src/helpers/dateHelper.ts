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
      
      // Если не получилось, возможно это уже отформатированная строка
      // Пытаемся извлечь компоненты даты из строки вида "20.03.2025, 14:25"
      const match = dateInput.match(/(\d{1,2})\.(\d{1,2})\.(\d{4}),\s*(\d{1,2}):(\d{1,2})/);
      if (match) {
        const [, day, month, year, hours, minutes] = match;
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes));
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
  const date = safeParseDate(dateInput);
  if (!date) return "Invalid Date";
  
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  return `${day}-${month}-${year} ${hours}:${minutes}`;
};

/**
 * Форматирует дату для отображения в формате "DD-MM" (для группировки)
 * @param dateInput - дата в любом формате
 * @returns отформатированная строка или "Invalid Date" если не удалось распарсить
 */
export const formatDateKey = (dateInput: string | Date | number): string => {
  const date = safeParseDate(dateInput);
  if (!date) return "Invalid Date";
  
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  
  return `${day}-${month}`;
};

/**
 * Создает timestamp строку для новых сообщений
 * @returns строка в формате "DD.MM.YYYY, HH:MM"
 */
export const createTimestampString = (): string => {
  const now = new Date();
  const day = now.getDate().toString().padStart(2, '0');
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const year = now.getFullYear();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  
  return `${day}.${month}.${year}, ${hours}:${minutes}`;
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