import { downloadFile, downloadFilesAsZip, getExcerpt } from '@utils/common';
import styles from '@styles/Deal.module.scss';
import { Box, Grid } from '@mui/material';
import { DownloadAllButton } from '@components/button/DownloadAllButton';
import useTrans from '@hooks/useTrans';
import { DocumentFileResponseType, DocumentFileType } from 'types/deal';
import {
  getDocumentByExceptTypes,
  getDocumentByTypes,
  getDocuments,
} from '@utils/deal';

export interface DocumentTabProps {
  dataRoom: string;
  locale: string;
  signedNda: boolean;
  signedNbo: boolean;
  documentFiles: DocumentFileResponseType[];
}

export default function DocumentTab({
  dataRoom,
  locale,
  signedNda,
  signedNbo,
  documentFiles = [],
}: DocumentTabProps) {
  const trans = useTrans();
  let detailedDocs: DocumentFileType[] = [
    {
      fileName: 'sales-memo.pdf',
      category: 'Sales Memo',
      url: 'https://www.pngall.com/wp-content/uploads/8/Sample-PNG-Image.png',
      mimetype: 'image/png',
    },
    {
      fileName: 'building-plan.pdf',
      category: 'Building Plan',
      url: 'https://storage.googleapis.com/cre-investor-test/ahttltuawe__vatican_shadow_mosaique___timepad_ru.pdf',
      mimetype: 'application/pdf',
    },
    {
      fileName: 'commercial-register.pdf',
      category: 'Commercial Register',
      url: 'https://storage.googleapis.com/cre-investor-test/ahttltuawe__vatican_shadow_mosaique___timepad_ru.pdf',
      mimetype: 'application/pdf',
    },
    {
      fileName: 'rental-status.pdf',
      category: 'Rental Status',
      url: 'https://storage.googleapis.com/cre-investor-test/ahttltuawe__vatican_shadow_mosaique___timepad_ru.pdf',
      mimetype: 'application/pdf',
    },
  ];

  const teaserFileTypes = ['NDA', 'TEASER'];
  const teaserDocs = getDocumentByTypes(
    documentFiles,
    teaserFileTypes,
    ['DEAL'],
    locale
  );
  let myDocs: DocumentFileType[] = getDocuments(documentFiles, [
    'ORGANISATION',
  ]);
  if (signedNda) {
    detailedDocs = getDocumentByExceptTypes(
      documentFiles,
      teaserFileTypes,
      ['DEAL'],
      locale
    );
  }

  const downdloadFile = (url: string, mimetype: string, fileName: string) => {
    downloadFile(url, mimetype, fileName);
  };

  const detailedOnlyDocuments = detailedDocs.filter((file) => {
    return file.mimetype.indexOf('application/') !== -1 ? true : false;
  });

  const detailedOnlyImages = detailedDocs.filter((file) => {
    return file.mimetype.indexOf('image/') !== -1 ? true : false;
  });

  const downloadAllImages = async (fileName: string) => {
    downloadFilesAsZip(detailedOnlyImages, fileName);
  };

  const downloadAllDocuments = async (fileName: string) => {
    downloadFilesAsZip(detailedOnlyDocuments, fileName);
  };

  return (
    <>
      <h3 className={styles.section_title} style={{ marginTop: 0 }}>
        {trans.common['dataRoom']}
      </h3>
      {!signedNbo && (
        <div className="lockedSection">
          <h4>{trans.common['thisSectionIsLocked']}</h4>
          <p>{trans.common['pleaseUploadYourNBOToHaveFullAccess']}</p>
        </div>
      )}
      {signedNbo && (
        <a
          className={`${styles.data_room_link} ${
            signedNbo ? '' : 'lockedSectionContentDataRoom'
          }`}
          href={dataRoom}
          target="_blank"
          rel="noreferrer"
        >
          {getExcerpt(dataRoom, 37)}
        </a>
      )}
      {!signedNbo && (
        <a
          className={`${styles.data_room_link} ${
            signedNbo ? '' : 'lockedSectionContentDataRoom'
          }`}
          rel="noreferrer"
        >
          {getExcerpt(dataRoom, 37)}
        </a>
      )}

      <h3 className={styles.section_title}>
        {trans.common['detailedDocuments']}
      </h3>
      {!signedNda && (
        <div className="lockedSection">
          <h4>{trans.common['thisSectionIsLocked']}</h4>
          <p>{trans.common['pleaseUploadYourNBOToHaveFullAccess']}</p>
        </div>
      )}
      <div
        className={`${styles.file_contents} ${
          signedNda ? '' : 'lockedSectionContent'
        }`}
      >
        <Grid container>
          {detailedDocs.map((doc) => (
            <Grid
              item
              xs={12}
              md={6}
              key={`detail_doc_${doc.fileName}`}
              style={{ paddingTop: '16px' }}
            >
              <div className={styles.pdf_file}>
                <div>{doc.fileName}</div>
                <div className={styles.pdf_file_category}>{doc.category}</div>
              </div>
            </Grid>
          ))}
          <Box
            display="flex"
            justifyContent="center"
            sx={{ width: 1, marginTop: '16px' }}
          >
            {signedNda && detailedOnlyDocuments.length > 0 && (
              <DownloadAllButton
                name={trans.common['downloadAllDocuments']}
                onClick={() => downloadAllDocuments('detailedDocs.zip')}
              />
            )}
            {!signedNda && detailedOnlyDocuments.length > 0 && (
              <DownloadAllButton name={trans.common['downloadAllDocuments']} />
            )}
          </Box>
          <Box
            display="flex"
            justifyContent="center"
            sx={{ width: 1 }}
            style={{ marginTop: 16 }}
          >
            {signedNda && detailedOnlyImages.length > 0 && (
              <DownloadAllButton
                name={trans.common['downloadAllPictures']}
                onClick={() => downloadAllImages('detailedImages.zip')}
              />
            )}
            {!signedNda && detailedOnlyImages.length > 0 && (
              <DownloadAllButton name={trans.common['downloadAllPictures']} />
            )}
          </Box>
        </Grid>
      </div>

      <h3 className={styles.section_title}>{trans.common['myDocuments']}</h3>
      <div className={styles.file_contents}>
        <Grid container>
          {myDocs.map((doc) => (
            <Grid
              item
              xs={12}
              md={6}
              key={`my_doc_${doc.fileName}`}
              style={{ paddingTop: '16px' }}
            >
              <div className={styles.pdf_file}>
                <div
                  onClick={() =>
                    downdloadFile(doc.url, doc.mimetype, doc.fileName)
                  }
                >
                  {doc.fileName}
                </div>
                <div className={styles.pdf_file_category}>{doc.category}</div>
              </div>
            </Grid>
          ))}
        </Grid>
      </div>

      <h3 className={styles.section_title}>
        {trans.common['teaserDocuments']}
      </h3>
      <div className={styles.file_contents}>
        <Grid container>
          {teaserDocs.map((doc) => (
            <Grid
              item
              xs={12}
              md={6}
              key={`teaser_doc_${doc.fileName}`}
              style={{ paddingTop: '16px' }}
            >
              <div className={styles.pdf_file}>
                <div
                  onClick={() =>
                    downdloadFile(doc.url, doc.mimetype, doc.fileName)
                  }
                >
                  {doc.fileName}
                </div>
                <div className={styles.pdf_file_category}>{doc.category}</div>
              </div>
            </Grid>
          ))}
        </Grid>
      </div>
    </>
  );
}
