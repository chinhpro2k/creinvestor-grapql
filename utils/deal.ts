import { get, isString } from 'lodash';
import { DocumentFileResponseType, DocumentFileType } from 'types/deal';

export function getDetailContactName(contact: {
  first_name: string;
  last_name: string;
}): string {
  let contactName = get(contact, 'first_name');
  if (get(contact, 'last_name')) {
    contactName += ' ' + get(contact, 'last_name');
  }
  return contactName ? contactName.trim() : '';
}

function getDocumentFileTypeWithLocale(
  filteredData: DocumentFileResponseType[],
  locale: string
): DocumentFileType[] {
  const files: DocumentFileType[] = filteredData.map((item) => {
    return {
      fileName: get(item, 'filename'),
      category: get(item, 'fileType.label_' + locale),
      url: item.url,
      mimetype: get(item, 'mimetype'),
    };
  });
  return files;
}

export function getDocumentByTypes(
  documentFiles: DocumentFileResponseType[],
  types: string[],
  onlyGroupTypes: string[],
  locale = 'en'
): DocumentFileType[] {
  const filteredData = documentFiles.filter((item) => {
    const type = get(item, 'fileType.type') as string;
    const group = get(item, 'fileType.group') as string;
    if (onlyGroupTypes.length) {
      return types.indexOf(type) !== -1 && onlyGroupTypes.indexOf(group) !== -1
        ? true
        : false;
    } else {
      return types.indexOf(type) !== -1 ? true : false;
    }
  });
  return getDocumentFileTypeWithLocale(filteredData, locale);
}

export function getDocumentByExceptTypes(
  documentFiles: DocumentFileResponseType[],
  exceptTypes: string[],
  onlyGroupTypes: string[],
  locale = 'en'
): DocumentFileType[] {
  const filteredData = documentFiles.filter((item) => {
    const type = get(item, 'fileType.type') as string;
    const group = get(item, 'fileType.group') as string;
    if (onlyGroupTypes.length) {
      return exceptTypes.indexOf(type) !== -1 ||
        onlyGroupTypes.indexOf(group) === -1
        ? false
        : true;
    } else {
      return exceptTypes.indexOf(type) !== -1 ? false : true;
    }
  });
  return getDocumentFileTypeWithLocale(filteredData, locale);
}

export function getDocuments(
  documentFiles: DocumentFileResponseType[],
  groupTypes: string[],
  locale = 'en'
): DocumentFileType[] {
  const filteredData = documentFiles.filter((item) => {
    const type = get(item, 'fileType.group') as string;
    return groupTypes.indexOf(type) !== -1 ? true : false;
  });
  return getDocumentFileTypeWithLocale(filteredData, locale);
}

export function isShownGeneralInfos(text: string | null): boolean{
  const limit = 8;
  if (!isString(text)) {
    return false;
  }
  const items = text.split('</li>');
  if (items.length - 1 > limit) {
    return true;
  }
  return false;
};

export function getExcerptGeneralInfos(text: string | null): string{
  const limit = 8;
  if (!isString(text)) {
    return '';
  }
  const items = text.split('</li>');
  if (items.length - 1 > limit) {
    let output = '';
    for(let index = 0; index < items.length; index++) {
      if (index < limit) {
        output += items[index] + '</li>';
      }
    }
    output += '</ul>';
    return output;
  }
  return text;
};
