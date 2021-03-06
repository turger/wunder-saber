import React, {Component} from 'react'
import uuid from 'uuid'
import _ from 'lodash'
import classNames from 'classnames'
import AutoComplete from './AutoComplete'
import ImageReader from './ImageReader'
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
    this._leaderboardRef.off()
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

  autoFillFromImageText = imageText => {
    const text = imageText.toLowerCase()
    const {songNames} = this.state

    const foundSongName = songNames.find(songName => {
      const songNameRegex = new RegExp(songName.value, 'gi')
      return text.match(songNameRegex)
    })
    if (!_.isEmpty(foundSongName)) {
      this.handleSongChange(foundSongName.value, foundSongName.id)
    }

    const pointRegex = /( )[0-9]{3}( ){0,1}[0-9]{3}( )/g
    const foundPoints = text.match(pointRegex)
    if (foundPoints && foundPoints.length > 0) {
      const points = foundPoints[0].replace(/\s/g, '')
      this.setState({points})
    }
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
          <div className='Add_points_form'>
            <ImageReader
              autoFillFromImageText={this.autoFillFromImageText}
            />
            <form onSubmit={this.handleSubmit}>
              <div className='Add_points_row'>
                <div className='Add_points_label'>Song</div>
                <AutoComplete
                  userInput={songName}
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
          </div>
        }
      </div>
    )
  }
}

export default AddPoints
