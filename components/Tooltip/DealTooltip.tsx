import React from "react";
import Image from 'next/image'
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import { styled } from "@mui/material/styles";

const DealTooltip : React.FC<any> = ({tooltipProp}:any)=>{
    const DealTooltipStyled = styled(({ className, ...props }: TooltipProps) => (
        <Tooltip {...props} classes={{ popper: className }} />
      ))(({ theme }) => ({
        [`& .${tooltipClasses.tooltip}`]: {
          backgroundColor: 'white',
          color: 'rgba(0, 0, 0, 0.87)',
          maxWidth: 300,
          fontSize: theme.typography.pxToRem(12),
          border: '1px solid #dadde9',
          margin:'30px 0px'
        },
      }));
    return(
        <>
          <DealTooltipStyled
                 title={
                   <React.Fragment>
                     <div style={{ margin: "15px 5px" }}>
                       <p
                         style={{
                           fontSize: "18px",
                           fontWeight: "700",
                           lineHeight: "21px",
                           marginBottom: "10px",
                         }}
                       >
                         NDA rounds{" "}
                       </p>
                       <div
                         style={{
                           fontSize: "14px",
                           fontWeight: "400",
                           lineHeight: "16px",
                           color: "#96A4B4",
                           marginBottom: "10px",
                         }}
                       >
                         Acquisition opportunity of a mixed-use building in
                         perfect condition with a coworking space on the ground
                         floor. 24 furnished flats divided between the first and
                         fourth floors.
                       </div>
                       <div
                         style={{
                           fontSize: "14px",
                           fontWeight: "400",
                           lineHeight: "16px",
                           color: "#96A4B4",
                         }}
                       >
                         Acquisition opportunity of a mixed-use building in
                         perfect condition with a coworking space on the ground
                         floor.
                       </div>
                     </div>
                   </React.Fragment>
                 }
               >
                 <Image alt="deal-tool-tip" src={tooltipProp} width={18} height={18}/>
               </DealTooltipStyled>
        </>
    )
}
export default DealTooltip;