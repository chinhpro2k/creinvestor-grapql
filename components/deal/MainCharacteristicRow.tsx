import styles from '@styles/Deal.module.scss';
import { formatNumber } from '@utils/number';
import { get } from 'lodash';

export interface MainCharacteristicRowProps {
  title: string;
  fieldName: string;
  deal: {[key: string]: string | null | number}
}

export default function MainCharacteristicRow({ deal, fieldName, title }: MainCharacteristicRowProps) {
  const isFieldNull = (dealObj: {[key: string]: string | null | number}, _fieldName: string) => {
    if (get(dealObj, _fieldName, null) === null) {
      return true;
    }
    return false;
  }

  return (
    <div className={styles.main_characteristic_row}>
      <div style={{ height: isFieldNull(deal, fieldName) ? '27px' : 'auto' }}>
        {!isFieldNull(deal, fieldName) ? title : ''}
      </div>
      {!isFieldNull(deal, fieldName) && (<div>
        {formatNumber(get(deal, fieldName) || 0)}
      </div>)}
    </div>
  );
}
