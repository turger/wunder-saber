import React, {Component} from 'react'
import Ranking from './Ranking'
import {getLeaderboardRef} from './firebase'
import './Leaderboard.css'

class Leaderboard extends Component {
  constructor(props) {
    super(props)
    this.state = {
      leaderboard: null
    }
    this._leaderboardRef = null
  }

  componentDidMount() {
    this._leaderboardRef = getLeaderboardRef()
    this._leaderboardRef.on('value', (snap) => {
      const leaderboard = snap.val()
      this.setState({leaderboard})
    })
  }

  componentWillUnmount() {
    this._gameMastersOnlineRef.off()
  }

  sortByBestAndSlice = (data) => {
    const array = Object.keys(data).map(key => data[key])
    return array.sort((a, b) => b.points - a.points).slice(0,10)
  }

  render() {
    const {leaderboard} = this.state
    if (!leaderboard) return <span role="img" aria-label="shrug" className="Leaderboard">🤷‍</span>

    return(
      <div className="Leaderboard">
        { Object.keys(leaderboard).map(id =>
          <div className="Leaderboard_song" key={`${id}`} >
            <div className="Leaderboard_song_name">{leaderboard[id].songName}</div>
            <div className="Leaderboard_rows">
              { leaderboard[id].rows && this.sortByBestAndSlice(leaderboard[id].rows).map((row, i) =>
                <div key={`${id.songName}${i}`} className="Leaderboard_row">
                  <Ranking ranking={i+1}/>
                  <div className="Leaderboard_name">{row.name}</div>
                  <div className="Leaderboard_points">{row.points}</div>
                  <div className="Leaderboard_level">{row.level}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }
}

export default Leaderboard
