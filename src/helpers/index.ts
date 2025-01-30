export function createTitle (source: string): string {
    let title= source === 'ua' ? 'Мова-Промова' : source === 'ru' ? 'Govorika' : 'Poland';
    return title;
}