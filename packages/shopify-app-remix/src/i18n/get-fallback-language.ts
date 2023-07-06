import {FallbackLng} from 'i18next';

export function getFallbackLng(
  optionLng: FallbackLng | undefined | false,
): string {
  if (typeof optionLng === 'string') {
    return optionLng;
  } else if (Array.isArray(optionLng)) {
    return optionLng[0];
  } else if (typeof optionLng === 'object') {
    return Object.entries(optionLng)[0][0];
  } else {
    return 'en';
  }
}
