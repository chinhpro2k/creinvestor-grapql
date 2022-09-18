import { LanguageOptions, LANGUAGE_ENUM } from '@model/accountSetting.model';

export const LANGUAGE_OPTIONS: LanguageOptions[] = [
  { value: LANGUAGE_ENUM.ENGLISH, label: 'English' },
  { value: LANGUAGE_ENUM.DEUTSH, label: 'Deutsh' },
  { value: LANGUAGE_ENUM.FRANCAIS, label: 'Francais' },
];

export enum LOCAL_STORAGE_KEYS {
  USER_ACTION_ON_DEAL = 'USER_ACTION_ON_DEAL'
}
