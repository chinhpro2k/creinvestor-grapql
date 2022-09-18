import type { NextPage } from 'next';
import React, { useState } from 'react';
import Head from 'next/head';
import styles from '@styles/Deal.module.scss';
import { useRouter } from 'next/router';
import Link from 'next/link';
import useTrans from '@hooks/useTrans';
import { getExcerpt } from '@utils/common';
import QAS from '@components/deal/QAS';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { Alert, Box, CircularProgress, Container, Tab } from '@mui/material';
import Layout from '../../components/layout/layout';
import { styled } from '@mui/material/styles';
import { Loader } from '@googlemaps/js-api-loader';
import { useQuery } from '@apollo/client';
import { GET_DEAL_DETAILS } from '../../graphql/deal-details';
import { get, isArray, isString } from 'lodash';
import DocumentTab from '@components/deal/DocumentTab';
import DealCardWrapper from '@components/dealCardWrapper/DealCardWrapper';
import { STATUS } from '@constants/card-item.constants';
import PhotoSlider from '@components/deal/PhotoSlider';
import { formatSquare, formatCurrency, formatNumber } from '@utils/number';
import Script from 'next/script';
import Image from 'next/image';
import MainCharacteristicRow from '@components/deal/MainCharacteristicRow';
import ViewGoogleMapIcon from '@public/images/view_google_map_icon.svg';
import { getExcerptGeneralInfos, isShownGeneralInfos } from '@utils/deal';

type NextPageWithLayout = NextPage & {
  getLayout?: (page: React.ReactElement) => React.ReactNode;
  requireAuth?: boolean;
};
const CustomTabList = styled(TabList)({
  minHeight: '19px',
  marginTop: '48px',
  '& .MuiTabs-indicator': {
    backgroundColor: '#3455D1',
  },
});

const CustomTab = styled(Tab)({
  textTransform: 'none',
  paddingTop: 0,
  paddingBottom: 7,
  minHeight: '19px',
  fontStyle: 'normal',
  fontWeight: 700,
  fontSize: '16px',
  lineHeight: '19px',
  textAlign: 'center',
  color: '#96A4B4',
  mixBlendMode: 'normal',
  marginRight: '82px',
  '&.Mui-selected': {
    color: '#3455D1 !important',
  },
});

const CustomTabPanel = styled(TabPanel)({
  padding: 0,
  marginTop: 48,
});

const Deal: NextPageWithLayout = () => {
  const [value, setValue] = React.useState('1');
  const [showMore, setShowMore] = React.useState(false);
  const [showMoreGeneralInfo, setShowMoreGeneralInfo] = React.useState(false);
  const [loadedMap, setLoadedMap] = React.useState(false);
  const [dealImages, setDealImages] = React.useState([]);
  const [totalImage, setTotalImage] = React.useState(0);
  const googlemap = React.useRef(null);
  const { locale = 'en' } = useRouter();
  const router = useRouter();
  const { id } = router.query;
  const limit = 277;
  const trans = useTrans();
  const [isLoadingRedirectNDA, setIsLoadingRedirectNDA] =
    useState<boolean>(false);
  React.useEffect(() => {
    if (router) {
      handleLoadingAndRedirectNDA(router.query);
      const str = router.asPath ? router.asPath : '';
      const arrStr = str.split('#');
      if (arrStr.length > 1) {
        switch (arrStr[1]) {
          case 'overview':
            setValue('1');
            break;
          case 'documents':
            setValue('2');
            break;
          case 'qa':
            setValue('3');
            break;
          default:
            setValue('1');
            break;
        }
      }
    }
  }, [router]);
  const handleLoadingAndRedirectNDA = (query: any) => {
    if (query) {
      if (query.event === 'signing_complete' && query.signedNDA === 'true') {
        setIsLoadingRedirectNDA(true);
        setTimeout(() => {
          setIsLoadingRedirectNDA(false);
          window.location = `/deal/${id}`;
        }, 60 * 1000);
      }
    }
  };
  const showReadMoreButton = (text: string) => isString(text) && text.length > limit;
  const handleChange = (
    _event: React.SyntheticEvent<Element, Event>,
    newValue: string
  ) => {
    if (+newValue === 1) {
      setLoadedMap(false);
    } else {
      setLoadedMap(true);
    }
    setValue(newValue);
    switch (+newValue) {
      case 1:
        router.push('#overview');
        break;
      case 2:
        router.push('#documents');
        break;
      case 3:
        router.push('#qa');
        break;
      default:
        router.push('#overview');
        break;
    }
  };
  React.useEffect(() => {
    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY as string,
      version: 'weekly',
    });
    let map;
    const centerPoint = { lat: -34.397, lng: 150.644 };
    const mapOptions = {
      center: centerPoint,
      zoom: 10,
      mapTypeId: 'satellite',
      fullscreenControl: true,
      mapTypeControl: true,
      streetViewControl: true,
      zoomControl: true,
      styles: [
        {
          featureType: 'all',
          elementType: 'all',
          stylers: [
            {
              visibility: 'on',
            },
          ],
        },
        {
          featureType: 'administrative.country',
          elementType: 'labels',
          stylers: [
            {
              visibility: 'on',
            },
          ],
        },
      ],
    };
    const whiteCircle = {
      path: false,
      fillOpacity: 1,
      fillColor: 'rgba(52, 85, 209, 0.25)',
      strokeOpacity: 1.0,
      strokeColor: 'rgba(52, 85, 209, 0.25)',
      strokeWeight: 1.0,
      scale: 65.0,
    };
    if (googlemap.current && !loadedMap) {
      loader.load().then(() => {
        mapOptions.mapTypeId = google.maps.MapTypeId.HYBRID;
        whiteCircle.path = google.maps.SymbolPath.CIRCLE;
        map = new google.maps.Map(googlemap.current, mapOptions);
        const latLng = new google.maps.LatLng(centerPoint.lat, centerPoint.lng);
        const newCircle = new google.maps.Marker({
          icon: whiteCircle,
          position: latLng,
        });
        newCircle.setMap(map);
        setLoadedMap(true);
      });
    }
  });

  const response = useQuery(GET_DEAL_DETAILS, {
    fetchPolicy: 'no-cache',
    variables: { id, r_id: id?.toString() },
  });

  const { loading, error, data, refetch } = response;

  const deal = data && data?.deals && isArray(data.deals) ? data.deals[0] : {};
  const signedNda = get(deal, 'leads[0].nda_signed', false);
  const signedNbo = false;
  const documentFiles = get(data, 'fileByDealId', []);

  const canPostQA =
    deal?.leads &&
    isArray(deal.leads) &&
    deal.leads.length > 0 &&
    deal.leads[0]?.is_interested;
  const isShowTabQA =
    deal?.leads &&
    isArray(deal.leads) &&
    deal.leads.length > 0 &&
    [STATUS.NBO_SUBMITTED, STATUS.BO_SUBMITTED, STATUS.CLOSING].includes(
      deal.leads[0]?.pipeline_stage?.group
    );

  React.useEffect(() => {
    if (response?.data) {
      const { deals } = response.data;
      if (deals[0]?.deal_images) {
        setDealImages(deals[0]?.deal_images);
      }
      if (deals[0]?.deal_images_aggregate?.aggregate?.total) {
        setTotalImage(deals[0]?.deal_images_aggregate?.aggregate?.total);
      }
    }
  }, [response]);

  const renderDefaultValue = (_value: any) => _value || '-';
  const isEmptyValue = (_value: number | null) => _value === null;
  const mainCharacterFields = [
    {fieldName: 'arcade_ground_floor', fieldTitle: 'Arcade (ground floor)'},
    {fieldName: 'apartment_1_room', fieldTitle: 'Apartment 1 room'},
    {fieldName: 'apartment_2_rooms', fieldTitle: 'Apartment 2 rooms'},
    {fieldName: 'apartment_5_rooms', fieldTitle: 'Apartment 5 rooms'},
    {fieldName: 'apartment_6_rooms_with_parental_suite', fieldTitle: 'Apartment 6 rooms with parental suite'},
    {fieldName: 'indoor_parking_spaces', fieldTitle: 'Indoor parking spaces'},
  ];
  const isShownGeneralInfoReadMore = isShownGeneralInfos(get(deal, 'general_information'));
  return (
    <div className={styles.container}>
      <Head>
        <title>Deal Page</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        ></meta>
        <link
          href="https://calendly.com/assets/external/widget.css"
          rel="stylesheet"
        />
      </Head>

      <Script
        src="https://calendly.com/assets/external/widget.js"
        type="text/javascript"
      ></Script>

      {!loading && error && (
        <Alert severity="error">Error when getting data from server!</Alert>
      )}
      {(loading || isLoadingRedirectNDA) && (
        <Box
          sx={{ position: 'relative' }}
          style={{ left: '48%', top: '40%', position: 'absolute' }}
        >
          <CircularProgress />
        </Box>
      )}
      {!loading && !isLoadingRedirectNDA && (
        <div className="deal_detail_content">
          <div className="main_content">
            {totalImage > 0 && (
              <PhotoSlider
                dealImages={dealImages}
                totalImage={totalImage}
                dealName={get(deal, 'name')}
                isNDASigned={get(deal, 'leads[0].nda_signed', '')}
              />
            )}

            <div className="main_content_left">
              <Link href="/overview">
                <a className="back_page_link">
                  <span />
                  {trans.common['returnToOpportunities']}
                </a>
              </Link>
              <h2 className={`page_title ${styles.page_title_deal}`}>
                {get(deal, 'name')}
              </h2>
              <div className={styles.page_subtitle_deal}>
                {get(deal, 'title_' + locale) || get(deal, 'title_en')}
              </div>

              <TabContext value={value}>
                <CustomTabList onChange={handleChange} aria-label="Tabs">
                  <CustomTab label={trans.common['overview']} value="1" />
                  <CustomTab label={trans.common['documents']} value="2" />
                  {isShowTabQA && (
                    <CustomTab label={trans.common['qas']} value="3" />
                  )}
                </CustomTabList>
                <CustomTabPanel value="1">
                  <div>
                    <div className="overview_block overview_block_1">
                      {!isEmptyValue(get(deal, 'rental_surface_total')) && (<div>
                        {renderDefaultValue(
                          formatSquare(get(deal, 'rental_surface_total'))
                        )}
                      </div>)}
                      {!isEmptyValue(get(deal, 'rental_surface_total')) && (
                        <div>Rental status</div>
                      )}
                    </div>

                    <div className="overview_block overview_block_2">
                      {!isEmptyValue(get(deal, 'expected_rent')) && (<div>
                        {renderDefaultValue(
                          formatCurrency(
                            get(deal, 'expected_rent'),
                            get(deal, 'currency_type')
                          )
                        )}
                      </div>)}
                      {!isEmptyValue(get(deal, 'expected_rent')) && (
                        <div>Expected rent</div>
                      )}
                    </div>

                    <div className="overview_block overview_block_3">
                      {!isEmptyValue(get(deal, 'flat_number')) && (<div>
                        {renderDefaultValue(
                          formatNumber(get(deal, 'flat_number'))
                        )}
                      </div>)}
                      {!isEmptyValue(get(deal, 'flat_number')) && (
                        <div>Apartments</div>
                      )}
                    </div>

                    <div className="overview_block overview_block_4">
                      {!isEmptyValue(get(deal, 'rental_surface_trade')) && (<div>
                        {renderDefaultValue(
                          formatSquare(get(deal, 'rental_surface_trade'))
                        )}
                      </div>)}
                      {!isEmptyValue(get(deal, 'rental_surface_trade')) && (
                        <div>Commercial surface</div>
                      )}
                    </div>
                  </div>

                  <h4 className={styles.section_title}>Description</h4>
                  <div className={styles.overview_description}>
                    {!showMore && (
                      <p>
                        {getExcerpt(
                          get(deal, 'description_' + locale) ||
                            get(deal, 'description_en'),
                          limit
                        )}
                      </p>
                    )}
                    {showMore && (
                      <p>
                        {get(deal, 'description_' + locale) ||
                          get(deal, 'description_en')}
                      </p>
                    )}
                    {showReadMoreButton(
                      get(deal, 'description_' + locale) ||
                        get(deal, 'description_en')
                    ) && (
                      <button
                        className={styles.overview_readmore}
                        onClick={() => {
                          setShowMore(!showMore);
                        }}
                      >
                        {showMore
                          ? trans.common['readLess']
                          : trans.common['readMore']}
                      </button>
                    )}
                  </div>

                  <h4 className={styles.section_title}>Location</h4>
                  <div id="map" ref={googlemap} className="google_map"></div>
                  <div className={styles.google_map_view}>
                    <div className={styles.google_map_view_subtitle}>
                      {trans.common['viewIn3DOnGoogleEarth']}
                    </div>
                    <Image src={ViewGoogleMapIcon} alt="Vercel Logo" width={7} height={13} />
                  </div>

                  <h4 className={styles.section_title}>General information</h4>
                  <div className={styles.general_information}>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: !showMoreGeneralInfo ? getExcerptGeneralInfos(get(deal, 'general_information')) :
                        get(deal, 'general_information'),
                      }}
                    />
                    {isShownGeneralInfoReadMore && (
                      <button
                        className={styles.overview_readmore}
                        onClick={() => {
                          setShowMoreGeneralInfo(!showMoreGeneralInfo);
                        }}
                      >
                        {showMoreGeneralInfo
                          ? trans.common['readLess']
                          : trans.common['readMore']}
                      </button>
                    )}
                  </div>

                  <h4 className={styles.section_title}>Main characteristics</h4>
                  <div className={styles.main_characteristics}>
                    {mainCharacterFields.map((item) => {
                      return (
                        <MainCharacteristicRow key={item.fieldName} deal={deal} title={item.fieldTitle} 
                          fieldName={item.fieldName} />
                      );
                    })}
                  </div>
                </CustomTabPanel>
                <CustomTabPanel value="2">
                  <DocumentTab
                    dataRoom="https://services.intralinks.com/login-123456789"
                    signedNda={signedNda}
                    signedNbo={signedNbo}
                    documentFiles={documentFiles}
                    locale={locale}
                  />
                </CustomTabPanel>
                {isShowTabQA && (
                  <CustomTabPanel value="3" className="QAS">
                    <QAS id={id} canPostQA={canPostQA} />
                  </CustomTabPanel>
                )}
              </TabContext>
            </div>
            <div className="main_content_right">
              <DealCardWrapper deal={deal} data={data} refetch={refetch} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

Deal.requireAuth = true;

Deal.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <Container maxWidth="lg">
      <Layout>{page}</Layout>
    </Container>
  );
};

export default Deal;
