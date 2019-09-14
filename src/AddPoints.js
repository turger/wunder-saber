import React, {Component, Fragment} from 'react'
import uuid from 'uuid'
import classNames from 'classnames'
import AutoComplete from './AutoComplete'
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
      level: getDefaultDifficulty(),
      formError: false
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
    if (!songName || !name || !points || !level) {
      this.setState({formError: true})
      return
    }
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
      formError: false
    })
   setDefaultDifficulty(level)
   setDefaultUsername(name)
  }

  render() {
    const {
      expanded,
      songNames,
      formError,
      songName,
      name,
      level,
      points
    } = this.state

    return(
      <div className='Add_points'>
        { !expanded &&
          <div className='Add_points_button Add_points_button_open' onClick={this.expand}>+</div>
        }
        { expanded &&
          <Fragment>
            <form className='Add_points_form' onSubmit={this.handleSubmit}>
              <div className='Add_points_row'>
                <div className='Add_points_label'>Song</div>
                <AutoComplete
                  suggestions={songNames}
                  handleChange={this.handleSongChange}
                  className={classNames('Add_points_input', { 'Add_points_input_error': formError && !songName })}
                />
              </div>
              <div className='Add_points_row'>
                <div className='Add_points_label'>Name</div>
                <input
                  type='text'
                  value={name}
                  onChange={(e) => this.handleChange(e, 'name')}
                  data-lpignore='true'
                  className={classNames('Add_points_input', { 'Add_points_input_error': formError && !name })}
                />
              </div>
              <div className='Add_points_row'>
                <div className='Add_points_label'>Level</div>
                <select
                  value={level}
                  onChange={(e) => this.handleChange(e, 'level')}
                  className={classNames('Add_points_input', { 'Add_points_input_error': formError && !level })}
                >
                  {['Easy', 'Normal', 'Hard', 'Expert', 'Expert+'].map(lvl =>
                    <option key={lvl} value={lvl}>{lvl}</option>
                  )}
                </select>
              </div>
              <div className='Add_points_row'>
                <div className='Add_points_label'>Points</div>
                <input
                  type='number'
                  value={points}
                  onChange={(e) => this.handleChange(e, 'points')}
                  data-lpignore='true'
                  className={classNames('Add_points_input', { 'Add_points_input_error': formError && !points })}
                />
              </div>
              <input className='Add_points_submit' type='submit' value='Submit' />
            </form>
            <div className='Add_points_button Add_points_button_close' onClick={this.expand}>-</div>
          </Fragment>
        }
      </div>
    )
  }
}

export default AddPoints
