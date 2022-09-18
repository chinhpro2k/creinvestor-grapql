import { get } from 'lodash';
import de from 'svg-country-flags/png100px/de.png';
import gb from 'svg-country-flags/png100px/gb.png';
import fr from 'svg-country-flags/png100px/fr.png';

export function getLangFlag(lang: string) {
  const flags = { de, fr, en: gb } as {
    de: any;
    fr: any;
    en: any;
  };
  return get(flags, lang + '.src');
}
