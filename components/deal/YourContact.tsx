import styles from '@styles/Deal.module.scss';
import useTrans from '@hooks/useTrans';
import { DealResponseType } from 'types/deal';
import { get } from 'lodash';
import YourContactItem from './YourContactItem';

export interface YourContactProps {
  deal: DealResponseType;
}

export default function YourContact({ deal }: YourContactProps) {
  const trans = useTrans();
  const userByLeaderBrokerId = get(deal, 'userByLeaderBrokerId');
  const userByOwnerId = get(deal, 'userByOwnerId');
  return (
    <div className={styles.yourContacts}>
      <h3 className={styles.title_are_you_interested_deal}>
        {trans.common['yourContacts']}
      </h3>

      {userByLeaderBrokerId && get(userByLeaderBrokerId, 'id') && (
        <YourContactItem contact={userByLeaderBrokerId} />
      )}
      {userByOwnerId &&
        get(userByOwnerId, 'id') &&
        get(userByLeaderBrokerId, 'id') != get(userByOwnerId, 'id') && (
          <YourContactItem contact={userByOwnerId} />
        )}
    </div>
  );
}
