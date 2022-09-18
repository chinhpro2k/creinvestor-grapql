import React, { FunctionComponent } from 'react';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import CircularProgress from '@mui/material/CircularProgress';

export interface ExportQAData {
  No: string;
  Question: string;
  Answers: string;
  'Answered by': string;
  'Answer date': string;
}
export interface ICallback {
  success: boolean;
  data: Array<Record<string, any>>;
}
interface IExportCSV {
  fileName: any;
  handleClickExport: (callback: (callback: ICallback) => void) => void;
  loading: boolean;
}

export const ExportQACsv: FunctionComponent<IExportCSV> = ({
  fileName,
  handleClickExport,
  loading,
}) => {
  const fileType =
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
  const fileExtension = '.xlsx';
  const exportToCSV = async () => {
    handleClickExport((callback: ICallback) => {
      if (callback.success) {
        const no = XLSX.utils.json_to_sheet(callback.data);
        const wb = {
          Sheets: { Data: no },
          SheetNames: ['Data'],
        };
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], { type: fileType });
        FileSaver.saveAs(data, fileName + fileExtension);
      }
    });
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      onClick={(_e) => exportToCSV()}
    >
      {loading ? (
        <CircularProgress size={20} />
      ) : (
        <p> Export all questions to Excel</p>
      )}
    </div>
  );
};
