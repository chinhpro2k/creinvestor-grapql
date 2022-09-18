import {useLazyQuery, useMutation, useQuery} from '@apollo/client';
import {ExportQACsv, ExportQAData, ICallback} from '@components/exportQACsv';
import {INSERT_DEAL_QAS} from '@graphql/deal-qa-insert';
import {GET_DEAL_QAS} from '@graphql/deal-qa-list';
import {Pagination} from '@mui/material';
import Skeleton from '@mui/material/Skeleton';
import {isArray} from 'lodash';
import moment from 'moment';
import * as React from 'react';
import {useEffect, useState} from 'react';

interface IProps {
  id: string | string[] | undefined;
  canPostQA: boolean;
}

const QAS = ({ id, canPostQA }: IProps) => {
  const LIMIT_QA = 10;
  const [pageQA, setPageQA] = React.useState(1);
  const [searchQA, setSearchQA] = React.useState('');
  const [question, setQuestion] = useState<string>('');
  const [questionError, setQuestionError] = useState<string>('');
  const [textSearch, setTextSearch] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const skeletonLoads = [];
  for (let i = 0; i < LIMIT_QA; i++) {
    skeletonLoads.push(
      <Skeleton
        key={i}
        animation="wave"
        style={{ marginBottom: '32px' }}
        height={21}
      />
    );
  }
  // @ts-ignore
  const [insert] = useMutation(INSERT_DEAL_QAS, {
    onCompleted: (_data) => {
      setQuestion('');
      setQuestionError('');
      qas.refetch({ offset: 0 });
    },
    onError: (_err) => {
      setQuestionError('An error occurred during execution');
    },
  });
  const qas = useQuery(GET_DEAL_QAS, {
    variables: {
      deal_id: id,
      limit: LIMIT_QA,
      offset: (pageQA - 1) * LIMIT_QA,
      search: '%' + searchQA + '%',
    },
  });
  const [getQas2] = useLazyQuery(GET_DEAL_QAS);
  const deal_questions =
    qas.data && qas.data?.deal_questions && isArray(qas.data.deal_questions)
      ? qas.data?.deal_questions
      : [];
  const qaCount =
    qas.data && qas.data?.deal_questions_aggregate
      ? qas.data?.deal_questions_aggregate.aggregate.total
      : 0;
  const handleChangePageQA = (
    _event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    setPageQA(page);
  };
  useEffect(() => {
    if (qas.loading) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
  }, [qas.loading]);
  const handleGetQuestion = (e: any) => {
    setQuestion(e.currentTarget.value);
  };
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setSearchQA(textSearch);
      setPageQA(1);
    }, 2000);

    return () => clearTimeout(delayDebounceFn);
  }, [textSearch]);

  const handleSearch = (e: any) => {
    setTextSearch(e.currentTarget.value.trim());
  };
  const handleClickSearch = () => {
    setSearchQA(textSearch);
    setPageQA(1);
  };
  const handleClickSendQuestion = () => {
    if (question.trim().length > 0) {
      insert({
        variables: {
          dealId: id,
          question: question.trim(),
        },
      });
    } else {
      setQuestionError('Please enter question');
    }
  };
  const getCurrentDate = () => {
    const today = new Date();
    return `${today.getDate()}${
      today.getMonth() + 1
    }${today.getFullYear()}${today.getHours()}${today.getMinutes()}${today.getSeconds()}`;
  };
  const handleSetDataExport = (value: Record<string, any>): ExportQAData => {
    return {
      No: value.id ? value.id : '',
      Question: value.question
          ? value.question + ' - ' + handleShowQuestionTime(value.created_at)
          : '',
      Answers: value?.deal_answers ? value?.deal_answers[0]?.answers : '',
      'Answered by':
          value?.deal_answers && value?.deal_answers.length > 0
              ? `${value?.deal_answers[0]?.user.first_name} ${value?.deal_answers[0]?.user.last_name}`
              : '',
      'Answer date':
          value?.deal_answers && value?.deal_answers.length > 0
              ? value.deal_answers[0]?.created_at
              : '',
    };
  };
  const [loadingExport, setLoadingExport] = useState<boolean>(false);
  const handleExport = (callback: any) => {
    setLoadingExport(true);
    getQas2({
      variables: {
        deal_id: id,
        limit: 999999,
        offset: 0,
        search: '%' + searchQA + '%',
      },
      onCompleted: (_data) => {
        const data: ExportQAData[] = [];
        if (Array.isArray(_data.deal_questions)) {
          _data.deal_questions.forEach((value: any) => {
            const obj: ExportQAData = handleSetDataExport(value);
            data.push(obj);
          });
        }
        const obj1: ICallback = {
          success: true,
          data: data,
        };
        setTimeout(() => {
          callback(obj1);
          setLoadingExport(false);
        }, 5000);
      },
    });
  };
  const handleShowAnswerTime = (time: string) => {
    if (time) {
      return moment(new Date(time)).format('MMM D, YYYY');
    } else return '';
  };
  const handleShowQuestionTime = (time: string) => {
    if (time) {
      return moment(new Date(time)).format('MM.DD.YY');
    }
    return '';
  };
  return (
    <div>
      <div className="box-search" style={{ position: 'relative' }}>
        <input
          onChange={(e: any) => handleSearch(e)}
          style={{ width: '100%', padding: '14.5px 24px' }}
          placeholder={'Search for a question'}
        />
        <div
          onClick={() => handleClickSearch()}
          className="search-icon"
          style={{
            position: 'absolute',
            top: '12px',
            right: '24px',
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g filter="url(#filter0_i_2494_8059)">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M4.87381 14.2218C7.45519 16.8032 11.6404 16.8032 14.2218 14.2218C16.8032 11.6404 16.8032 7.45519 14.2218 4.87381C11.6404 2.29244 7.45519 2.29244 4.87381 4.87381C2.29244 7.45519 2.29244 11.6404 4.87381 14.2218ZM2.79649 16.2991C6.52513 20.0278 12.5705 20.0278 16.2991 16.2991C20.0278 12.5705 20.0278 6.52513 16.2991 2.79649C12.5705 -0.932162 6.52513 -0.932162 2.79649 2.79649C-0.932162 6.52513 -0.932162 12.5705 2.79649 16.2991Z"
                fill="#3455D1"
              />
              <path
                d="M14.7411 14.7411C15.3148 14.1675 16.2448 14.1675 16.8185 14.7411L23.5698 21.4924C24.1434 22.0661 24.1434 22.9961 23.5698 23.5698C22.9961 24.1434 22.0661 24.1434 21.4924 23.5698L14.7411 16.8185C14.1675 16.2448 14.1675 15.3148 14.7411 14.7411Z"
                fill="#3455D1"
              />
            </g>
            <defs>
              <filter
                id="filter0_i_2494_8059"
                x="0"
                y="0"
                width="25"
                height="27"
                filterUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB"
              >
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feBlend
                  mode="normal"
                  in="SourceGraphic"
                  in2="BackgroundImageFix"
                  result="shape"
                />
                <feColorMatrix
                  in="SourceAlpha"
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                  result="hardAlpha"
                />
                <feOffset dx="1" dy="3" />
                <feGaussianBlur stdDeviation="2" />
                <feComposite
                  in2="hardAlpha"
                  operator="arithmetic"
                  k2="-1"
                  k3="1"
                />
                <feColorMatrix
                  type="matrix"
                  values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.2 0"
                />
                <feBlend
                  mode="normal"
                  in2="shape"
                  result="effect1_innerShadow_2494_8059"
                />
              </filter>
            </defs>
          </svg>
        </div>
      </div>
      {isLoading ? (
        <div>{skeletonLoads}</div>
      ) : (
        <div>
          {deal_questions.map((ques: any, qIndex: number) => (
            <div className="qa" key={ques.id}>
              <h3>
                {qIndex + LIMIT_QA * (pageQA - 1) + 1}. {ques.question} -{' '}
                {handleShowQuestionTime(ques.created_at)}
              </h3>
              <p className="desc">{ques.deal_answers[0]?.answers}</p>
              <p className="time">
                {handleShowAnswerTime(
                  ques.deal_answers[0] ? ques.deal_answers[0].created_at : ''
                )}
              </p>
            </div>
          ))}
        </div>
      )}

      {Math.ceil(qaCount / LIMIT_QA) > 1 && (
        <div className={'pagination'}>
          <Pagination
            count={Math.ceil(qaCount / LIMIT_QA)}
            page={pageQA}
            onChange={handleChangePageQA}
          />
        </div>
      )}
      {deal_questions.length > 0 && (
        <div className="export-excel">
          <ExportQACsv
            loading={loadingExport}
            handleClickExport={(callback) => handleExport(callback)}
            fileName={`RealAdvisor_Q&A_${getCurrentDate()}`}
          />
        </div>
      )}
      <div className="send-question">
        <textarea
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            handleGetQuestion(e)
          }
          placeholder={'Write your question here'}
          value={question}
        />
        <div
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <button
            disabled={!canPostQA}
            style={{ cursor: 'pointer' }}
            onClick={() => handleClickSendQuestion()}
          >
            <svg
              width="27"
              height="24"
              viewBox="0 0 27 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2.03366 23.1999L25.3003 13.2266C26.3803 12.7599 26.3803 11.2399 25.3003 10.7733L2.03366 0.799941C1.15366 0.413275 0.180326 1.06661 0.180326 2.01327L0.166992 8.15994C0.166992 8.82661 0.660325 9.39994 1.32699 9.47994L20.167 11.9999L1.32699 14.5066C0.660325 14.5999 0.166992 15.1733 0.166992 15.8399L0.180326 21.9866C0.180326 22.9333 1.15366 23.5866 2.03366 23.1999Z"
                fill="white"
              />
            </svg>
            Send your question
          </button>
        </div>
        {questionError && <p className="error">{questionError}</p>}
      </div>
    </div>
  );
};
export default QAS;
