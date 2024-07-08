import React from 'react'

function Loading() {

    return <div className='container mt-5' style={{justifyContent:'center',textAlign:'center',}}>
     <div className="spinner-border text-success"  style={{width: '10rem' , height: '10rem',marginTop:'200px'}} role="status">
    <span className="visually-hidden">Loading...</span>
  </div>
  </div>
  
}

export default Loading
