import React from 'react';
import '../Map.css'

function Shubkeylogo() {
  return (
    <div className='p-2 bg-light fixed-header'>
    <img src={`${process.env.PUBLIC_URL}/Shubhkeylogo.png`} alt="logo" className='logo' width="180" height="35"/>
   </div>

  );
}

export default Shubkeylogo;
