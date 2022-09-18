import { Grid, Typography } from '@mui/material';
import { DealContactResponseType } from 'types/deal';
import { getDetailContactName } from '@utils/deal';
import { get, isEmpty, isObject } from 'lodash';
import Image from 'next/image';
import PicDefault from '@public/images/pic_placeholder.png';

export interface YourContactItemProps {
  contact: DealContactResponseType;
}

export default function YourContactItem({ contact }: YourContactItemProps) {
  return (
    <>
      {isObject(contact) && !isEmpty(contact) && get(contact, 'id') && (
        <Grid container className="yourContactItem">
          <Grid item xs="auto">
            <div className="pr32">
              <div className="roundedNextImage">
                <Image
                  src={
                    get(contact, 'image.url')
                      ? get(contact, 'image.url')
                      : PicDefault.src
                  }
                  alt="Real advisor"
                  width={100}
                  height={100}
                  quality={100}
                />
              </div>
            </div>
          </Grid>
          <Grid item xs="auto">
            <div>
              <Typography
                variant="h6"
                paragraph={true}
                className="yourContactName"
                mt={1}
              >
                {getDetailContactName(contact)}
              </Typography>
              <Typography
                variant="body1"
                style={{ whiteSpace: 'pre-line' }}
                mt={0}
                className="aboutParagraph"
              >
                {get(contact, 'job_title')}
              </Typography>
              <Typography
                variant="body1"
                style={{ whiteSpace: 'pre-line' }}
                mt={0}
                className="aboutParagraph"
              >
                {get(contact, 'mobile_phone')}
              </Typography>
              <Typography
                variant="body1"
                style={{ whiteSpace: 'pre-line' }}
                mt={0}
                className="aboutParagraph"
              >
                <a href={'mailto:' + get(contact, 'email')}>
                  {get(contact, 'email')}
                </a>
              </Typography>
            </div>
          </Grid>
        </Grid>
      )}
    </>
  );
}
