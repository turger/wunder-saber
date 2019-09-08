import React from 'react'
import classNames from 'classnames'
import Trophy from './images/trophy.png'
import Star from './images/star.png'
import './Ranking.css'

const Ranking = ({ranking}) => (
  <div className={classNames('Ranking',
    { 'Ranking_trophy': ranking < 4 },
    { 'Ranking_star': ranking >= 4 },
    { 'Ranking_star_bignum': ranking >= 10 }
  )}>
    <img src={ ranking < 4 ? Trophy : Star } alt="ranking"/>
    <div className="Ranking_number"> { ranking } </div>
  </div>
)

export default Ranking
