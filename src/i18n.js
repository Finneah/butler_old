import I18n from 'react-native-i18n';

import en from './locale/en.json';
import de from './locale/de.json';

// Should the app fallback to English if user locale doesn't exists
I18n.fallbacks = true;

I18n.translations = {de, en: de}; // Np support for english at the moment

// export function _setTranslations(language) {
//     language == 'de' ? (I18n.translations = {de}) : (I18n.translations = {en});
// }
export const currentLocale = I18n.currentLocale();
// Is it a RTL language?
// export const isRTL =
//     currentLocale.indexOf('he') === 0 || currentLocale.indexOf('ar') === 0;

// // Allow RTL alignment in RTL languages
// ReactNative.I18nManager.allowRTL(isRTL);

export function strings(name, params = {}) {
    try {
        if (name) {
            var key = I18n.t(
                name.charAt(0).toLowerCase() + name.slice(1),
                params
            );

            // If key is missing its easy to see in console
            if (key.indexOf('[missing') != -1) {
                console.info('MISSING', key);
            }
            return key;
        }
        return '';
    } catch (error) {
        console.info(error);
    }
}

export default I18n;
