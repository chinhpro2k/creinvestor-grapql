import * as React from 'react';
import { saveAs } from 'file-saver';
import { DocumentFileType } from 'types/deal';
import JSZip from 'jszip';

export const useScrollTo = ({ offset = 0 }: { offset?: number }) => {
  const htmlElRef = React.useRef<React.ElementRef<'div'> | null>(null);
  const executeScroll = () => {
    if (htmlElRef.current) {
      window.scrollTo({
        left: 0,
        top: htmlElRef.current.offsetTop - offset,
        behavior: 'smooth',
      });
    }
  };

  return [executeScroll, htmlElRef];
};

export function parseJwt(token: string) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join('')
  );

  return JSON.parse(jsonPayload);
}

export function getUrlWithLanguage(locale: string, path: string) {
  return locale + '/' + path;
}

export function getExcerpt(text: string, maxLen = 50): string {
  if (text === null || text === undefined) {
    return '';
  }
  if (text.length > maxLen) {
    return text.substring(0, maxLen) + '...';
  }
  return text;
}

export function downloadFile(url: string, mimetype: string, fileName: string) {
  const xhttp = new XMLHttpRequest();
  xhttp.open('GET', url);
  xhttp.responseType = 'blob';
  xhttp.setRequestHeader('Content-type', mimetype);
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      const file = new Blob([xhttp.response], {
        type: mimetype,
      });
      saveAs(file, fileName);
    }
  };
  xhttp.send();
}

export function downloadFilesAsZip(
  files: DocumentFileType[],
  fileName: string
) {
  let count = 0;
  const zip = new JSZip();
  files.forEach(function (file) {
    const xhttp = new XMLHttpRequest();
    xhttp.open('GET', file.url);
    xhttp.responseType = 'blob';
    xhttp.setRequestHeader('Content-type', file.mimetype);
    xhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        zip.file(file.fileName, xhttp.response);
        count++;
        if (count == files.length) {
          zip.generateAsync({ type: 'blob' }).then(function (content) {
            saveAs(content, fileName);
          });
        }
      }
    };
    xhttp.send();
  });
}

export function getValueBaseOnLang(obj: any, property: string): any { 
  const lang = 'en';
  return obj && obj[`${property}_${lang}`] || '';
}
