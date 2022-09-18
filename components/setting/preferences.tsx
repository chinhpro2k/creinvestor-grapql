import {useLazyQuery, useMutation} from '@apollo/client';
import {GET_DEAL_PREFERENCES} from '@graphql/deal-preferrece';
import {UPDATE_DEAL_PREFERENCES} from '@graphql/deal-preferrece-update';
import {
  Alert,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  InputAdornment,
  TextField,
} from '@mui/material';
import Snackbar, {SnackbarOrigin} from '@mui/material/Snackbar';
import {parseJwt} from '@utils/common';
import {useRouter} from 'next/router';
import * as React from 'react';
import {useEffect, useRef, useState} from 'react';
import NumberFormat from 'react-number-format';
import {
  IDataPreferences,
  OrganisationReq,
  ProfilePurchaseTypeReq,
  ProfileRegionReq,
  ProfileUserTypeReq,
  Regions,
} from './interface';
import PreferencesSkeleton from "@components/skeleton/preferencesSkeleton";

export interface State extends SnackbarOrigin {
  open: boolean;
  message: string;
}

function NumberFormatCustom(props: any) {
  const {inputRef, onChange, ...other} = props;

  return (
    <NumberFormat
      {...other}
      getInputRef={inputRef}
      onValueChange={(values: any) => {
        onChange({
          target: {
            value: values.value,
          },
        });
      }}
      thousandSeparator={"'"}
      decimalSeparator={'.'}
      isNumericString
    />
  );
}

const Preferences = () => {
  const user = JSON.parse(localStorage.getItem('user') as string);
  const [organisationId, setOrganisationId] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [dataPreferences, setDataPreferences] = useState<IDataPreferences>();
  const router = useRouter();
  const {locale = 'en'} = router;
  const [dataCheckProperty, setDataCheckProperty] =
    useState<Record<string, any>>();
  const [dataCheckPurchase, setDataCheckPurchase] =
    useState<Record<string, any>>();
  const [dataChoseRegions, setDataChoseRegions] = useState<Regions[]>([]);
  const [showSuggest, setShowSuggest] = useState<boolean>(false);
  const [locationSearch, setLocationSearch] = useState<string>('');
  const [organisationReq, setOrganisationReq] = useState<OrganisationReq>();
  const [profileRegionReq, setProfileRegionReq] = useState<ProfileRegionReq[]>(
    []
  );
  const [userTypesReq, setUserTypesReq] = useState<ProfileUserTypeReq[]>([]);
  const [purchaseReq, setPurchaseReq] = useState<ProfilePurchaseTypeReq[]>([]);
  const suggestRef = useRef<HTMLDivElement>();
  const [dataSuggestRegion, setDataSuggestRegion] = useState<Regions[]>([]);
  const [otherChecked, setOtherChecked] = useState({
    core: false,
    core_plus: false,
    value_add: false,
    opportunistic: false,
    lex: false,
    only: false,
  });
  const [minBudget, setMinBudget] = useState<number>(0);
  const [maxBudget, setMaxBudget] = useState<number>(0);
  const [isSelectAll, setIsSelectAll] = useState<{
    property: boolean;
    purchase: boolean;
    strategies: boolean;
    other: boolean;
  }>({
    property: false,
    purchase: false,
    strategies: false,
    other: false,
  });
  const [regionErrorMessage, setRegionErrorMessage] = React.useState<string>('');
  const [updateSuccessMessage, setUpdateSuccessMessage] = React.useState<string>('');
  const [state, setState] = useState<State>({
    open: false,
    message: '',
    vertical: 'top',
    horizontal: 'center',
  });
  const {vertical, horizontal, open, message} = state;

  let handleTimeout: ReturnType<typeof setTimeout>;
  const clearRegionTimeout = () => {
    clearTimeout(handleTimeout);
  };
  const clearRegionTimeoutAndMessage = () => {
    setRegionErrorMessage('');
    clearRegionTimeout();
  };
  const hideRegionError = (afterMiliSeconds: number) => {
    handleTimeout = setTimeout(() => {
      clearRegionTimeoutAndMessage();
    }, afterMiliSeconds);
  };

  let handleUpdateTimeout: ReturnType<typeof setTimeout>;
  const clearUpdateTimeout = () => {
    clearTimeout(handleUpdateTimeout);
  };
  const clearUpdateTimeoutAndMessage = () => {
    setUpdateSuccessMessage('');
    clearUpdateTimeout();
  };
  const hideUpdateSuccessMessage = (afterMiliSeconds: number) => {
    handleUpdateTimeout = setTimeout(() => {
      clearUpdateTimeoutAndMessage();
    }, afterMiliSeconds);
  };


  // ================Query and mutation==============
  const [getData, pre] = useLazyQuery(GET_DEAL_PREFERENCES);
  const [insert] = useMutation(UPDATE_DEAL_PREFERENCES);

  // ================Effect==============
  useEffect(() => {
    if (organisationId !== '') {
      getData({
        variables: {
          organisation_id: organisationId,
        },
      });
    }
  }, [organisationId]);
  useEffect(() => {
    if (pre) {
      if (user) {
        const tokenData = parseJwt(user.token);
        setIsAdmin(tokenData.is_admin);
        setOrganisationId(
          tokenData['https://hasura.io/jwt/claims']['x-hasura-organisation-id']
        );
      }
      setDataPreferences(pre.data);
    }
  }, [pre]);
  useEffect(() => {
    window.addEventListener('click', handleClickOutSide);
    return () => {
      window.removeEventListener('click', handleClickOutSide);
    };
  });
  useEffect(() => {
    if (dataPreferences) {
      setMinBudget(dataPreferences.organisations[0].min_asset_size);
      setMaxBudget(dataPreferences.organisations[0].max_asset_size);
      setDataSuggestRegion(dataPreferences.regions);
      // ===============property types==============
      setDataCheckPropertyType('insert');
      // ===============purchase==============
      setDataPurchaseCheck('insert');
      // ==================regions=========
      const dataRegion = [...dataPreferences.regions];
      const dataOrganisation = [
        ...dataPreferences.organisations[0].profile_regions,
      ];
      const dataChose: Regions[] = [];
      dataRegion.forEach((value) => {
        if (dataOrganisation.length !== 0) {
          dataOrganisation.forEach((value2) => {
            if (value2.region_id === value.id) {
              dataChose.push(value);
            }
          });
        }
      });
      setDataChoseRegions(dataChose);

      // ==================strategies&other=========
      handleSetDataStrategiesOther(dataPreferences);
      setDataReq(dataPreferences);
    }
  }, [dataPreferences]);
  const handleSetDataStrategiesOther = (data: IDataPreferences) => {
    const objOther = {
      ...otherChecked,
      core: data.organisations[0].core ? data.organisations[0].core : false,
      core_plus: data.organisations[0].core_plus
        ? data.organisations[0].core_plus
        : false,
      lex: data.organisations[0].lex_koller_compliant
        ? data.organisations[0].lex_koller_compliant
        : false,
      only: data.organisations[0].only_indirect
        ? data.organisations[0].only_indirect
        : false,
      value_add: data.organisations[0].value_add
        ? data.organisations[0].value_add
        : false,
      opportunistic: data.organisations[0].opportunistic
        ? data.organisations[0].opportunistic
        : false,
    };
    setOtherChecked(objOther);
  };
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const obj = {
        ...organisationReq,
        min_asset_size: +minBudget,
        max_asset_size: +maxBudget,
      };
      setOrganisationReq(obj as OrganisationReq);
    }, 2000);

    return () => clearTimeout(delayDebounceFn);
  }, [minBudget, maxBudget]);

  // ===============function============
  const handleClick = (newState: SnackbarOrigin) => () => {
    setState({open: true, ...newState});
  };

  const handleClose = () => {
    setState({...state, open: false, message: ''});
  };
  const setDataReq = (data: IDataPreferences) => {
    if (data) {
      const objOrganisation: OrganisationReq = {
        core: data.organisations[0].core,
        core_plus: data.organisations[0].core_plus,
        lex_koller_compliant: data.organisations[0].lex_koller_compliant,
        max_asset_size: +data.organisations[0].max_asset_size,
        min_asset_size: +data.organisations[0].min_asset_size,
        only_indirect: data.organisations[0].only_indirect,
        opportunistic: data.organisations[0].opportunistic,
      } as OrganisationReq;
      const objProfileRegion: ProfileRegionReq[] = [];
      data.organisations[0].profile_regions.forEach((value) => {
        let arr: ProfileRegionReq = {
          organisation_id: organisationId,
          region_id: value.region_id,
        };
        objProfileRegion.push(arr);
      });
      const objUserType: ProfileUserTypeReq[] = [];
      data.organisations[0].profile_use_types.forEach((value) => {
        let arr: ProfileUserTypeReq = {
          organisation_id: organisationId,
          use_type_id: value.use_type_id,
        };
        objUserType.push(arr);
      });
      const objPurchase: ProfilePurchaseTypeReq[] = [];
      data.organisations[0].profile_purchase_types.forEach((value) => {
        let arr: ProfilePurchaseTypeReq = {
          organisation_id: organisationId,
          purchase_type_id: value.purchase_type_id,
        };
        objPurchase.push(arr);
      });
      setOrganisationReq(objOrganisation);
      setProfileRegionReq(objProfileRegion);
      setUserTypesReq(objUserType);
      setPurchaseReq(objPurchase);
    }
  };
  const setDataCheckPropertyType = (type: 'insert' | 'select' | 'remove') => {
    let obj = {};
    if (dataPreferences) {
      if (type === 'insert' || type === 'remove')
        dataPreferences.use_types.forEach((value) => {
          let name: string = 'item_' + value.id;
          let obj2 = {
            [name]: false,
          };
          Object.assign(obj, obj2);
        });
      if (type === 'select') {
        dataPreferences.use_types.forEach((value) => {
          let name: string = 'item_' + value.id;
          let obj2 = {
            [name]: true,
          };
          Object.assign(obj, obj2);
        });
      }
      if (type === 'insert') {
        dataPreferences.organisations[0].profile_use_types.forEach((value) => {
          let name: string = 'item_' + value.use_type_id;
          obj = {...obj, [name]: true};
        });
      }

      setDataCheckProperty(obj);
    }
  };
  const setDataPurchaseCheck = (type: string) => {
    let objPurchase = {};
    if (dataPreferences) {
      if (type === 'insert' || type === 'remove') {
        dataPreferences.purchase_types.forEach((value) => {
          let name: string = 'item_' + value.id;
          let obj2 = {
            [name]: false,
          };
          Object.assign(objPurchase, obj2);
        });
      }
      if (type === 'select') {
        dataPreferences.purchase_types.forEach((value) => {
          let name: string = 'item_' + value.id;
          let obj2 = {
            [name]: true,
          };
          Object.assign(objPurchase, obj2);
        });
      }
      if (type === 'insert') {
        dataPreferences.organisations[0].profile_purchase_types.forEach(
          (value) => {
            let name: string = 'item_' + value.purchase_type_id;
            objPurchase = {...objPurchase, [name]: true};
          }
        );
      }

      setDataCheckPurchase(objPurchase);
    }
  };
  const setDataCheckStrategies = (type: string) => {
    if (dataPreferences) {
      let objOther = {...otherChecked};
      if (type === 'insert') {
        handleInsertStrategies(dataPreferences);
      }
      if (type === 'remove') {
        objOther = {
          ...otherChecked,
          core: false,
          core_plus: false,
          value_add: false,
          opportunistic: false,
        };
      }
      if (type === 'select') {
        objOther = {
          ...otherChecked,
          core: true,
          core_plus: true,
          value_add: true,
          opportunistic: true,
        };
      }
      setOtherChecked(objOther);
    }
  };
  const handleInsertStrategies = (data: IDataPreferences) => {
    const objOther = {
      ...otherChecked,
      core: data.organisations[0] ? data.organisations[0].core : false,
      core_plus: data.organisations[0]
        ? data.organisations[0].core_plus
        : false,
      value_add: data.organisations[0]
        ? data.organisations[0].value_add
        : false,
      opportunistic: data.organisations[0]
        ? data.organisations[0].opportunistic
        : false,
    };
    setOtherChecked(objOther);
  };
  const setDataCheckOther = (type: 'insert' | 'select' | 'remove') => {
    if (dataPreferences) {
      let objOther = {...otherChecked};
      if (type === 'insert') {
        objOther = {
          ...otherChecked,
          lex: dataPreferences.organisations[0].lex_koller_compliant
            ? dataPreferences.organisations[0].lex_koller_compliant
            : false,
          only: dataPreferences.organisations[0].only_indirect
            ? dataPreferences.organisations[0].only_indirect
            : false,
        };
      }
      if (type === 'remove') {
        objOther = {
          ...otherChecked,
          lex: false,
          only: false,
        };
      }
      if (type === 'select') {
        objOther = {
          ...otherChecked,
          lex: true,
          only: true,
        };
      }
      setOtherChecked(objOther);
    }
  };
  const handleSave = async () => {
    insert({
      variables: {
        organisation_id: organisationId,
        profile_regions: profileRegionReq,
        profile_use_types: userTypesReq,
        profile_purchase_types: purchaseReq,
        organisation: organisationReq,
      },
    }).then((_response) => {
      handleClick({
        vertical: 'bottom',
        horizontal: 'right',
      });
      setState({
        ...state,
        open: false,
        message: ' Preferences has been successfully updated!',
        vertical: 'top',
        horizontal: 'right',
      });
      if (updateSuccessMessage) {
        clearUpdateTimeoutAndMessage();
      }
      setUpdateSuccessMessage('Preferences has been successfully updated!');
      hideUpdateSuccessMessage(10000);
    });
  };
  const handleClickOutSide = (e: any) => {
    const node = suggestRef.current;
    const {target} = e;
    if (node) {
      if (!node.contains(target)) {
        setShowSuggest(false);
      }
    }
  };
  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    id: number
  ) => {
    if (event) {
      let name = 'item_' + id;
      let obj = {...dataCheckProperty, [name]: event.target.checked};
      setDataCheckProperty(obj);
      if (event.target.checked) {
        let dataUserTypeReq: ProfileUserTypeReq[] = [...userTypesReq];
        let arr: ProfileUserTypeReq[] = dataUserTypeReq.filter((value) => {
          return value.use_type_id === id;
        });
        if (arr.length === 0) {
          dataUserTypeReq.push({
            organisation_id: organisationId,
            use_type_id: id,
          });
        }
        setUserTypesReq(dataUserTypeReq);
      } else {
        let dataUserTypeReq: ProfileUserTypeReq[] = [...userTypesReq];
        let arr: ProfileUserTypeReq[] = dataUserTypeReq.filter((value) => {
          return value.use_type_id !== id;
        });
        setUserTypesReq(arr);
      }
    }
  };
  const handleChangePurchase = (
    event: React.ChangeEvent<HTMLInputElement>,
    id: number
  ) => {
    if (event) {
      let name = 'item_' + id;
      let obj = {...dataCheckPurchase, [name]: event.target.checked};
      setDataCheckPurchase(obj);

      if (event.target.checked) {
        let purchaseReqReq: ProfilePurchaseTypeReq[] = [...purchaseReq];
        let arr: ProfilePurchaseTypeReq[] = purchaseReqReq.filter((value) => {
          return value.purchase_type_id === id;
        });
        if (arr.length === 0) {
          purchaseReqReq.push({
            organisation_id: organisationId,
            purchase_type_id: id,
          });
        }
        setPurchaseReq(purchaseReqReq);
      } else {
        let purchaseReqReq: ProfilePurchaseTypeReq[] = [...purchaseReq];
        let arr: ProfilePurchaseTypeReq[] = purchaseReqReq.filter((value) => {
          return value.purchase_type_id !== id;
        });
        setPurchaseReq(arr);
      }
    }
  };
  const handleDeleteRegion = (id: string) => {
    const arr = [...dataChoseRegions];
    let arr2 = arr.filter((item) => {
      return item.id !== id;
    });
    setDataChoseRegions(arr2);
    const arrReq: ProfileRegionReq[] = [];
    arr2.forEach((value) => {
      arrReq.push({
        organisation_id: organisationId,
        region_id: value.id,
      });
    });
    setProfileRegionReq(arrReq);
  };
  const handleFocusInput = () => {
    setShowSuggest(true);
  };
  const handleMouseOver = (_name: string) => {
    // setLocationSearch(_name)
  };
  const handleChoseSuggest = async (data: Regions) => {
    let arr: Regions[] = [...dataChoseRegions];
    let arr2 = arr.filter((value) => {
      return value.id === data.id;
    });
    if (arr2.length === 0) {
      if (regionErrorMessage) {
        clearRegionTimeoutAndMessage();
      }
      arr.push(data);
      setDataChoseRegions(arr);
      setShowSuggest(false);
      const arrReq: ProfileRegionReq[] = [];
      arr.forEach((value) => {
        arrReq.push({
          organisation_id: organisationId,
          region_id: value.id,
        });
      });
      setProfileRegionReq(arrReq);
    } else {
      handleClick({
        vertical: 'bottom',
        horizontal: 'right',
      });
      setState({
        ...state,
        open: false,
        message: 'The location already exists!',
        vertical: 'top',
        horizontal: 'right',
      });
      setShowSuggest(false);
      if (regionErrorMessage) {
        clearRegionTimeoutAndMessage();
      }
      setRegionErrorMessage('The location already exists!');
      hideRegionError(2000);
    }
  };
  const handleInputRegion = (e: any) => {
    setLocationSearch(e.currentTarget.value);
    if (dataPreferences) {
      let arr: Regions[] = dataPreferences.regions.filter((value) => {
        // @ts-ignore
        return (
          value[`label_${locale}`]
            .toLowerCase()
            .indexOf(e.currentTarget.value.toLowerCase()) !== -1
        );
      });
      setDataSuggestRegion(arr);
    }
  };
  const handleChangeCheckOther = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const obj = {...otherChecked, [event.target.name]: event.target.checked};
    setOtherChecked(obj);
    if (organisationReq) {
      let objOrganisationReq: OrganisationReq = {
        ...organisationReq,
        core: obj.core,
        core_plus: obj.core_plus,
        lex_koller_compliant: obj.lex,
        only_indirect: obj.only,
        opportunistic: obj.opportunistic,
        value_add: obj.value_add,
      };
      setOrganisationReq(objOrganisationReq);
    }
  };
  const handleSelectAll = (
    type: 'property' | 'purchase' | 'strategies' | 'other'
  ) => {
    switch (type) {
      case 'property':
        setIsSelectAll({
          ...isSelectAll,
          property: true,
        });
        setDataCheckPropertyType('select');
        let dataUserType: ProfileUserTypeReq[] = [];
        if (dataPreferences) {
          dataPreferences.use_types.forEach((value) => {
            let obj: ProfileUserTypeReq = {
              organisation_id: organisationId,
              use_type_id: value.id,
            };
            dataUserType.push(obj);
          });
          setUserTypesReq(dataUserType);
        }
        break;
      case 'purchase':
        setIsSelectAll({
          ...isSelectAll,
          purchase: true,
        });
        setDataPurchaseCheck('select');
        let dataPurchase: ProfilePurchaseTypeReq[] = [];
        if (dataPreferences) {
          dataPreferences.purchase_types.forEach((value) => {
            let obj: ProfilePurchaseTypeReq = {
              organisation_id: organisationId,
              purchase_type_id: value.id,
            };
            dataPurchase.push(obj);
          });
          setPurchaseReq(dataPurchase);
        }
        break;
      case 'strategies':
        setIsSelectAll({
          ...isSelectAll,
          strategies: true,
        });
        setDataCheckStrategies('select');
        let objStrategies = {
          ...organisationReq,
          core: true,
          core_plus: true,
          value_add: true,
          opportunistic: true,
        };
        setOrganisationReq(objStrategies as OrganisationReq);
        break;
      case 'other':
        setIsSelectAll({
          ...isSelectAll,
          other: true,
        });
        setDataCheckOther('select');
        let objOther = {
          ...organisationReq,
          lex_koller_compliant: true,
          only_indirect: true,
        };
        setOrganisationReq(objOther as OrganisationReq);
        break;
    }
  };
  const handleClearAll = (
    type: 'property' | 'purchase' | 'strategies' | 'other'
  ) => {
    switch (type) {
      case 'property':
        setIsSelectAll({
          ...isSelectAll,
          property: false,
        });
        setDataCheckPropertyType('remove');
        setUserTypesReq([]);
        break;
      case 'purchase':
        setIsSelectAll({
          ...isSelectAll,
          purchase: false,
        });
        setDataPurchaseCheck('remove');
        setPurchaseReq([]);
        break;
      case 'strategies':
        setIsSelectAll({
          ...isSelectAll,
          strategies: false,
        });
        setDataCheckStrategies('remove');
        let objStrategies = {
          ...organisationReq,
          core: false,
          core_plus: false,
          value_add: false,
          opportunistic: false,
        };
        setOrganisationReq(objStrategies as OrganisationReq);
        break;
      case 'other':
        setIsSelectAll({
          ...isSelectAll,
          other: false,
        });
        setDataCheckOther('remove');
        let objOther = {
          ...organisationReq,
          lex_koller_compliant: false,
          only_indirect: false,
        };
        setOrganisationReq(objOther as OrganisationReq);
        break;
    }
  };
  const handleChangeMinBudget = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setMinBudget(+event.target.value);
  };
  const handleChangeMaxBudget = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setMaxBudget(+event.target.value);
  };
  // ===============render============
  if (dataPreferences) {
    return (
      <div className="layout-right" key={dataPreferences}>
        <div className="title-header">
          <h2>Deal preferences</h2>
          <p>
            Manage your preferences to improve the pertinence of the received
            deals.
          </p>
        </div>
        <div className="budget">
          <h3>Budget</h3>
          <div className="field-budget">
            <TextField
              id="outlined-read-only-input"
              label="Min asset size"
              defaultValue={minBudget}
              value={minBudget}
              onChange={handleChangeMinBudget}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">CHF</InputAdornment>
                ),
                inputComponent: NumberFormatCustom as any,
              }}
            />
            <TextField
              id="outlined-read-only-input"
              label="Max asset size"
              defaultValue={maxBudget}
              value={maxBudget}
              onChange={handleChangeMaxBudget}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">CHF</InputAdornment>
                ),
                inputComponent: NumberFormatCustom as any,
              }}
            />
          </div>
        </div>

        <div className="check-box-list property-type">
          <div className="title-checkbox-list">
            <h3>Property types</h3>
            {isSelectAll['property'] ? (
              <p onClick={() => handleClearAll('property')}>Unselect all</p>
            ) : (
              <p onClick={() => handleSelectAll('property')}>Select all</p>
            )}
          </div>
          <FormControl component="fieldset" variant="standard">
            <FormGroup>
              {dataCheckProperty &&
                dataPreferences.use_types.map((value, i) => {
                  // @ts-ignore
                  return (
                    <FormControlLabel
                      key={i}
                      control={
                        <Checkbox
                          name={`item_${value.id}`}
                          checked={dataCheckProperty[`item_${value.id}`]}
                          onChange={(e) => handleChange(e, value.id)}
                        />
                      }
                      label={value[`label_${locale}`]}
                    />
                  );
                })}
            </FormGroup>
          </FormControl>
        </div>
        <div className="regions" ref={suggestRef}>
          <h3>Regions</h3>
          <div className="input-regions">
            <input
              placeholder="Enter location"
              onFocus={() => handleFocusInput()}
              value={locationSearch}
              onChange={(e: any) => handleInputRegion(e)}
            />
            <div className="icon">
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M11.76 10.27L17.49 16L16 17.49L10.27 11.76C9.2 12.53 7.91 13 6.5 13C2.91 13 0 10.09 0 6.5C0 2.91 2.91 0 6.5 0C10.09 0 13 2.91 13 6.5C13 7.91 12.53 9.2 11.76 10.27ZM6.5 2C4.01 2 2 4.01 2 6.5C2 8.99 4.01 11 6.5 11C8.99 11 11 8.99 11 6.5C11 4.01 8.99 2 6.5 2Z"
                  fill="#3455D1"
                />
              </svg>
            </div>
          </div>
          {regionErrorMessage && (<p className="errorText">{regionErrorMessage}</p>)}
          {showSuggest && (
            <div className="box-suggest">
              {dataSuggestRegion.map((value, i) => {
                return (
                  <div
                    key={i}
                    className="item-suggest"
                    onClick={() => handleChoseSuggest(value)}
                    onMouseOver={() =>
                      handleMouseOver(value[`label_${locale}`])
                    }
                  >
                    {value[`label_${locale}`]}
                  </div>
                );
              })}
            </div>
          )}
          <div className="list-suggest">
            {dataChoseRegions.map((value, i) => {
              return (
                <div className="item-suggest" key={i}>
                  <div className="name-item">
                    <p>{value[`label_${locale}`]}</p>
                  </div>
                  <div
                    className="close"
                    onClick={() => handleDeleteRegion(value.id)}
                  >
                    <svg
                      width="16"
                      height="17"
                      viewBox="0 0 16 17"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect
                        x="1.6001"
                        y="0.500122"
                        width="20.3645"
                        height="2.26272"
                        rx="1.13136"
                        transform="rotate(45 1.6001 0.500122)"
                        fill="#3455D1"
                      />
                      <rect
                        y="14.9"
                        width="20.3645"
                        height="2.26272"
                        rx="1.13136"
                        transform="rotate(-45 0 14.9)"
                        fill="#3455D1"
                      />
                    </svg>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="check-box-list purchase-type">
          <div className="title-checkbox-list">
            <h3>Purchase type</h3>
            {isSelectAll['purchase'] ? (
              <p onClick={() => handleClearAll('purchase')}>Unselect all</p>
            ) : (
              <p onClick={() => handleSelectAll('purchase')}>Select all</p>
            )}
          </div>
          <FormControl component="fieldset" variant="standard">
            <FormGroup>
              {dataCheckPurchase &&
                dataPreferences.purchase_types.map((value, i) => {
                  return (
                    <FormControlLabel
                      key={i}
                      control={
                        <Checkbox
                          name={`item_${value.id}`}
                          checked={dataCheckPurchase[`item_${value.id}`]}
                          onChange={(e) => handleChangePurchase(e, value.id)}
                        />
                      }
                      label={value[`label_${locale}`]}
                    />
                  );
                })}
            </FormGroup>
          </FormControl>
        </div>
        <div className="check-box-list  strategies">
          <div className="title-checkbox-list">
            <h3>Strategies</h3>
            {isSelectAll['strategies'] ? (
              <p onClick={() => handleClearAll('strategies')}>Unselect all</p>
            ) : (
              <p onClick={() => handleSelectAll('strategies')}>Select all</p>
            )}
          </div>
          <FormControl component="fieldset" variant="standard">
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    onChange={handleChangeCheckOther}
                    checked={otherChecked[`core`]}
                    name="core"
                  />
                }
                label="Core"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    onChange={handleChangeCheckOther}
                    checked={otherChecked[`core_plus`]}
                    name="core_plus"
                  />
                }
                label="Core plus"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    onChange={handleChangeCheckOther}
                    checked={otherChecked[`value_add`]}
                    name="value_add"
                  />
                }
                label="Value add"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    onChange={handleChangeCheckOther}
                    checked={otherChecked[`opportunistic`]}
                    name="opportunistic"
                  />
                }
                label="Opportunistic"
              />
            </FormGroup>
          </FormControl>
        </div>
        <div className="check-box-list  other">
          <div className="title-checkbox-list">
            <h3>Other</h3>
            {isSelectAll['other'] ? (
              <p onClick={() => handleClearAll('other')}>Unselect all</p>
            ) : (
              <p onClick={() => handleSelectAll('other')}>Select all</p>
            )}
          </div>
          <FormControl component="fieldset" variant="standard">
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    onChange={handleChangeCheckOther}
                    checked={otherChecked[`lex`]}
                    name="lex"
                  />
                }
                label="Lex koller compliant"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    onChange={handleChangeCheckOther}
                    checked={otherChecked[`only`]}
                    name="only"
                  />
                }
                label="Only indirect investments"
              />
            </FormGroup>
          </FormControl>
        </div>
        {isAdmin && (
          <>
            {!updateSuccessMessage && (<div className="btn-save" onClick={() => handleSave()}>
              Save my preferences
            </div>)}
            {updateSuccessMessage && (
              <>
                <div className="btn-save" style={{marginBottom: 0}} onClick={() => handleSave()}>
                  Save my preferences
                </div>
                <Alert severity="success" style={{marginTop: '10px', marginBottom: '50px'}}>
                  {updateSuccessMessage}
                </Alert>
              </>
            )}
          </>
        )}

        <Snackbar
          anchorOrigin={{vertical, horizontal}}
          open={open}
          onClose={handleClose}
          message={message}
          autoHideDuration={2000}
          key={vertical + horizontal}
        />
      </div>
    );
  } else return <PreferencesSkeleton/>

};

export default Preferences;
