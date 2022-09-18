import type { NextPage } from 'next';
import * as React from 'react';
import styles from '@styles/Home.module.css';
import { useQuery } from '@apollo/client';
import { Container } from '@mui/material';
import Layout from '@components/layout/layout';
import CardItem from '@components/card/card-item';
import HorizontalCardItem from '@components/card/horizontal-card-item';
import Button from '@mui/material/Button';
import { GET_DEALS_ACTIVE, GET_DEALS_CLOSED } from './api/overview-query';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import { useState } from 'react';
import { styled } from '@mui/material/styles';
import LoadingWrapper from '@components/wrapper/LoadingWrapper';

type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
  requireAuth?: boolean;
};

const SpanShowMore = styled('span')((props: any) => ({
  textAlign: 'center',
  fontWeight: 500,
  fontSize: '16px',
  lineHeight: '19px',
  color: !props.isDisabled ? '#3455D1' : '',
  marginLeft: '8px'
}));

const Overview: NextPageWithLayout = () => {
  const isSold = true;
  const [isShadowLeft, setIsShadowLeft] = useState<boolean>(false);
  const limit = 10;

  const useQueryMultiple = () => {
    const res2 = useQuery(GET_DEALS_CLOSED, {
      variables: {
        groupDealStatus: 'CLOSED',
        limit: 10,
        offset: 0,
      },
    });
    return [res2];
  };

  const [
    { loading: dealsClosedLoading, data: dealsClosed },
  ] = useQueryMultiple();

  const { data:dealsActive, fetchMore, loading: dealsActiveLoading } = useQuery(GET_DEALS_ACTIVE, {
    variables: {
      groupDealStatus: 'ACTIVE',
      offset: 0,
      limit,
      visibilityInvestor: 'LONG_LIST',
    },
  });
  const [newData, setNewData] = useState<any>([]);

  const mergeData =(existing: any, incoming:any)=>{
    return [...existing, ...incoming];
  }

  const currentLength = newData.length ? newData.length : limit;
  const showMore = () => {       
        fetchMore({
          variables: {
            offset: currentLength,
            limit: 10,
          },
        }).then(fetchMoreResult => {
          if (newData.length < limit) {
            const array = [...dealsActive?.deals, ...fetchMoreResult.data.deals];
            setNewData(array);
          } else {
            setNewData(mergeData(newData, fetchMoreResult.data.deals));
          }          
        });
  }

  const responsive = {
    superLargeDesktop: {
      breakpoint: { max: 4000, min: 3000 },
      items: 5,
    },
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 4,
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 2,
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
    },
  };
  const handleShowLeftShadow = (nextSlide:any)=>{
    nextSlide === 0 ? setIsShadowLeft(false): setIsShadowLeft(true);
  }

  const carouselProps = {
    slidesToSlide: 3,
    responsive,
    autoPlay: false,
    arrows: false,
    className: styles.carousel,
    partialVisible: false,
    itemClass: styles.carouselItem,
  };
  return (
    <>
       <LoadingWrapper queryStatus={{
      loading: dealsClosedLoading || dealsActiveLoading, 
    }}>
        <div className={styles.container}>
          <div className={styles.title}>My current deals</div>
          {dealsActive?.deals && dealsActive?.deals.length && (
            <div>
              {(newData.length < limit ? dealsActive?.deals : newData ).map((item: any) => {
                const itemT = {
                  ...item,
                  isSold: false,
                };
                return (
                  <div key={item?.id} className={styles.horizontalContainer}>
                    <HorizontalCardItem {...itemT} />
                  </div>
                );
              })}
              <div className={styles.showMore} >
              <Button variant="text" onClick={showMore} disabled={currentLength%10 != 0}> 
                <span className={currentLength%10 != 0 ? 'icon-show-more-disabled': 'icon-show-more'}></span>
                <SpanShowMore isDisabled={currentLength%10 != 0}>
                  Show more deals
                </SpanShowMore>
              </Button>
              </div>
            </div>
          )}
          <div className={styles.title}>Recently sold properties</div>
          {dealsClosed?.deals && dealsClosed?.deals.length && (
            <div style={{marginRight:'-40px'}}>
              <div className={isShadowLeft?styles.marginCarousel:styles.marginRightCarousel}>
              <Carousel {...carouselProps} beforeChange={nextSlide => handleShowLeftShadow(nextSlide)}>
                {dealsClosed?.deals?.map((item: any) => {
                  const itemT = {
                    ...item,
                    isSold,
                  };
                  return (
                    <div key={item.id} className={styles.cardItems}>
                      <CardItem {...itemT} />
                    </div>
                  );
                })}
              </Carousel>
              <div className={styles.shadowLeft}></div>
              {isShadowLeft &&
              <div className={styles.shadowRight}></div>
              }
              </div>
            </div>
          )}
        </div>
      </LoadingWrapper>
    </>
  );
};

Overview.requireAuth = true;

Overview.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <Container maxWidth="lg">
      <Layout>{page}</Layout>
    </Container>
  );
};

export default Overview;
