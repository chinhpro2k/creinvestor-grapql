import {Alert, Checkbox, FormControl, FormControlLabel, FormGroup, InputAdornment, TextField} from "@mui/material";
import Snackbar from "@mui/material/Snackbar";
import * as React from "react";
import Skeleton from "@mui/material/Skeleton";

const PreferencesSkeleton = () => {
  return(
    <div className="layout-right">
      <div className="title-header">
        <Skeleton variant="text" />
        <Skeleton variant="text" />
      </div>
      <div className="budget">
        <Skeleton variant="text" />
        <div className="field-budget">
          <Skeleton variant="text" height={56}/>
          <Skeleton variant="text" height={56}/>
        </div>
      </div>

      <div className="check-box-list property-type">
        <div className="title-checkbox-list">
          <Skeleton variant="text" />
          <Skeleton variant="text" />
        </div>
        <FormControl component="fieldset" variant="standard">
          <FormGroup>
            <Skeleton variant="rectangular" width={210} height={118} />
          </FormGroup>
        </FormControl>
      </div>
      <div className="regions">
        <Skeleton variant="text" />
        <div className="input-regions">
          <Skeleton variant="text" />
          <div className="icon">
            <Skeleton variant="text" />
          </div>
        </div>
        <Skeleton variant="text" />
        <Skeleton variant="rectangular" width={210} height={118} />
        <div className="list-suggest">
          <Skeleton variant="rectangular" width={210} height={118} />
        </div>
      </div>
      <div className="check-box-list purchase-type">
        <div className="title-checkbox-list">
          <Skeleton variant="text" />
          <Skeleton variant="text" />
        </div>
        <FormControl component="fieldset" variant="standard">
          <FormGroup>
            <Skeleton variant="rectangular" width={210} height={118} />
          </FormGroup>
        </FormControl>
      </div>
      <div className="check-box-list  strategies">
        <div className="title-checkbox-list">
          <Skeleton variant="text" />
          <Skeleton variant="text" />
        </div>
        <FormControl component="fieldset" variant="standard">
          <FormGroup>
            <FormControlLabel
              control={
                <Skeleton variant="text" />
              }
              label="Core"
            />
            <FormControlLabel
              control={
                <Skeleton variant="text" />
              }
              label="Core plus"
            />
            <FormControlLabel
              control={
                <Skeleton variant="text" />
              }
              label="Value add"
            />
            <FormControlLabel
              control={
                <Skeleton variant="text" />
              }
              label="Opportunistic"
            />
          </FormGroup>
        </FormControl>
      </div>
      <div className="check-box-list  other">
        <div className="title-checkbox-list">
          <Skeleton variant="text" />
          <Skeleton variant="text" />
        </div>
        <FormControl component="fieldset" variant="standard">
          <FormGroup>
            <FormControlLabel
              control={
                <Skeleton variant="text" />
              }
              label="Lex koller compliant"
            />
            <FormControlLabel
              control={
                <Skeleton variant="text" />
              }
              label="Only indirect investments"
            />
          </FormGroup>
        </FormControl>
      </div>
      <Skeleton variant="rectangular" width={210} height={118} />

      <Skeleton variant="rectangular" width={210} height={118} />
    </div>
  )
}
export default PreferencesSkeleton;
