import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import './AutoComplete.css'

export class Autocomplete extends Component {
  static propTypes = {
    suggestions: PropTypes.instanceOf(Array),
    handleChange: PropTypes.instanceOf(Function),
    className: PropTypes.string,
    userInput: PropTypes.string
  }
  static defaultProperty = {
    suggestions: []
  }

  constructor(props) {
    super(props)
    this.state = {
      filteredSuggestions: [],
      showSuggestions: false,
      userInput: '',
      songId: null
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.userInput !== prevProps.userInput) {
      this.setState({userInput: this.props.userInput})
    }
  }

  onChange = e => {
    const { suggestions, handleChange } = this.props
    const userInput = e.currentTarget.value

    const filteredSuggestions = Object.keys(suggestions)
      .filter( key => suggestions[key].value.toLowerCase().indexOf(userInput.toLowerCase()) > -1 )
      .map(key => suggestions[key])

    this.setState({
      filteredSuggestions,
      showSuggestions: true,
      userInput: e.currentTarget.value,
      songId: null
    })

    handleChange(e.currentTarget.value, null)
  }

  onClick = suggestion => {
    this.setState({
      filteredSuggestions: [],
      showSuggestions: false,
      userInput: suggestion.value,
      songId: suggestion.id
    })
    this.props.handleChange(suggestion.value, suggestion.id)
  }

  render() {
    const {
      onChange,
      onClick,
      onKeyDown,
      state: {
        filteredSuggestions,
        showSuggestions,
        userInput
      }
    } = this

    return (
      <Fragment>
        <input
          type='text'
          onChange={onChange}
          onKeyDown={onKeyDown}
          value={userInput}
          data-lpignore="true"
          className={this.props.className}
        />
        {showSuggestions && userInput && Object.keys(filteredSuggestions).length !== 0 && (
          <ul className="Autocomplete_suggestions">
            {Object.keys(filteredSuggestions).map((key, index) => {
              return (
                <li className="Autocomplete_suggestion" key={key} onClick={() => onClick(filteredSuggestions[key])}>
                  {filteredSuggestions[key].value}
                </li>
              )
            })}
          </ul>
        )}
        {showSuggestions && userInput && Object.keys(filteredSuggestions).length === 0 && (
          <div className="Autocomplete_no_suggestions">
            Not found, adding a new song
          </div>
        )}
      </Fragment>
    )
  }
}

export default Autocomplete
