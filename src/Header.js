import React from 'react'

import leaves from './images/leaves.png'
import './Header.css'

const Header = () => {
  return (
    <div className="Header">
      <div className="Header_top">
        <img src={leaves} alt='leaves' className='Header_leaves Header_leaves_left'/>
        <h1>Beat saber</h1>
        <img src={leaves} alt='leaves' className='Header_leaves Header_leaves_right'/>
      </div>
      <div className="Header_title">Leaderboard</div>
    </div>
  )
}

export default Header
