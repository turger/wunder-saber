import React, {Component} from 'react'
import AutoComplete from './AutoComplete'
import uuid from 'uuid'
import {addSong, addRow, getLeaderboardRef} from './firebase'
import {
  getDefaultDifficulty,
  getDefaultUsername,
  setDefaultDifficulty,
  setDefaultUsername
} from './store'
import './AddPoints.css'

class AddPoints extends Component {
  constructor(props) {
    super(props)
    this.state = {
      leaderboard: null,
      expanded: false,
      songNames: [],
      songName: '',
      songId: null,
      name: getDefaultUsername(),
      points: '',
      level: getDefaultDifficulty()
    }
  }

  componentDidMount() {
    this._leaderboardRef = getLeaderboardRef()
    this._leaderboardRef.on('value', (snap) => {
      const leaderboard = snap.val()
      this.setState({
        leaderboard,
        songNames: leaderboard ? Object.keys(leaderboard).map(key => ({value: leaderboard[key].songName, id: key})) : []
      })
    })
  }

  componentWillUnmount() {
    this._gameMastersOnlineRef.off()
  }

  expand = () => {
    this.setState({expanded: !this.state.expanded})
  }

  handleChange(event, key) {
    this.setState({[key]: event.target.value})
  }

  handleSongChange = (label, value) => {
    this.setState({songName: label, songId: value})
  }

  handleSubmit = async (e) => {
    e.preventDefault()
    const {songName, name, points, level} = this.state
    if (!songName || !name || !points || !level) return
    let songId = this.state.songId
    if (!songId) {
      songId = uuid.v4()
      await addSong(songId, songName)
    }
    const rowId = uuid.v4()
    await addRow(songId, rowId, name, points, level)
    this.setState({
      expanded: false,
      songName: '',
      songId: null,
      points: '',
    })
   setDefaultDifficulty(level)
   setDefaultUsername(name)
  }

  render() {
    const {expanded, songNames} = this.state

    return(
      <div className="Add_points">
        { expanded &&
          <button onClick={this.expand}>-</button>
        }
        { !expanded &&
          <button onClick={this.expand}>+</button>
        }
        { expanded &&
          <form className="Add_points_form" onSubmit={this.handleSubmit}>
            Song:
            <AutoComplete
              suggestions={songNames}
              handleChange={this.handleSongChange}
            />
            <label>
              Name:
              <input type="text" value={this.state.name} onChange={(e) => this.handleChange(e, 'name')} />
            </label>
            <label>
              Level:
              <select value={this.state.level} onChange={(e) => this.handleChange(e, 'level')}>
                {['Easy', 'Normal', 'Hard', 'Expert', 'Expert+'].map(lvl =>
                  <option key={lvl} value={lvl}>{lvl}</option>
                )}
              </select>
            </label>
            <label>
              Points:
              <input type="text" value={this.state.points} onChange={(e) => this.handleChange(e, 'points')} />
            </label>
            <input type="submit" value="Submit" />
          </form>
        }
      </div>
    )
  }
}

export default AddPoints
