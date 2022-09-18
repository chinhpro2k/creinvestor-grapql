import { useRouter } from 'next/router';
import en from '../public/locales/en';
import de from '../public/locales/de';
import fr from '../public/locales/fr';

const useTrans = () => {
  const { locale } = useRouter();
  if (locale === 'de') return de;
  return locale === 'fr' ? fr : en;
};

export default useTrans;
