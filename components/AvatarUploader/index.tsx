import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import styled from 'styled-components';
import { useMutation } from '@apollo/client';
import { Box, LinearProgress } from '@mui/material';

import UploadIcon from '@public/images/upload-image-icon.png';
import { GENERATE_SIGNED_URL } from '@graphql/deal-details';
import { INSERT_IMAGE, UPDATE_USER } from '@graphql/user-query';
import { Auth } from '@utils/auth';
import { parseJwt } from '@utils/common';
const auth = new Auth();

type StyledUploadZoneProps = {
  background: any;
};

const StyledUploadZone = styled.div<StyledUploadZoneProps>`
  height: 150px;
  width: 150px;
  border: ${(props) => `${props.background ? '0px' : '1px'} dashed #3455d1`};
  border-radius: 75px;
  background: #edf5fe;
  background-image: ${(props) => `url(${props.background})` || null};
  display: flex;
  align-items: center;
  justify-content: center;
  background-size: cover;
`;

const AvatarUploader: React.FC<any> = ({
  userImage,
  userId,
  setIsUploadError,
  setIsUploadSuccess,
}) => {
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [uploading, setUploading] = React.useState(false);
  const [generateSignedUrl] = useMutation(GENERATE_SIGNED_URL);
  const [insertImage] = useMutation(INSERT_IMAGE);
  const [updateUserImage] = useMutation(UPDATE_USER);

  const onDrop = useCallback((fileData) => {
    if (fileData[0]) {
      setUploading(true);
      setIsUploadError(false);
      const file = fileData[0];
      const fileUrl = URL.createObjectURL(file);
      setSelectedFile(fileUrl);
      generateSignedUrl({
        variables: {
          name: file?.name,
          type: file?.type,
          bucket: 'images',
        },
        onCompleted: async (res) => {
          const signedUrl = res?.generateSignedUrl?.url;
          fetch(signedUrl, {
            method: 'PUT',
            body: file,
            headers: {
              'Content-Type': file?.type,
            },
          }).then(
            ({ status, url }) => {
              if (status !== 200) throw new Error('Upload file error');
              const formattedUrl = url.split('?')[0];
              const user = auth.getUser();
              const decodedUserInfo = parseJwt(user.token);

              insertImage({
                variables: {
                  id: decodedUserInfo.sub as string,
                  url: formattedUrl,
                },
                onCompleted: async (response) => {
                  updateUserImage({
                    variables: {
                      id: userId,
                      usersSetInput: {
                        primary_image_id: response.insert_images_one?.id,
                      },
                    },
                    onCompleted: () => {
                      setIsUploadSuccess(true);
                      setUploading(false);
                    },
                    onError: () => {
                      setIsUploadError(true);
                      setUploading(false);
                    },
                  });
                },
                onError: () => {
                  setIsUploadError(true);
                  setUploading(false);
                },
              });
            },
            () => {
              setIsUploadError(true);
              setUploading(false);
            }
          );
        },
        onError: () => {
          setIsUploadError(true);
        },
      });
    }
  }, []);
  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    multiple: false,
    accept: '.png, .jpg, .jpeg',
  });

  return (
    <>
      <StyledUploadZone
        {...getRootProps()}
        background={selectedFile || userImage?.url}
      >
        <input {...getInputProps()} />
        {!selectedFile && !userImage?.url && <img src={UploadIcon.src} />}
      </StyledUploadZone>
      {uploading && (
        <Box sx={{ width: '100%', marginTop: '20px' }}>
          <LinearProgress />
        </Box>
      )}
    </>
  );
};

export default AvatarUploader;
