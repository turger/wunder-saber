import React, {Component} from 'react'
import Tesseract from 'tesseract.js'
import jimp from 'jimp'
import _ from 'lodash'
import './ImageReader.css'

class ImageReader extends Component {
  constructor(props) {
    super(props)
    this.state = {
      upload: null,
      mimeType: null,
      editedUpload: null,
      document: {},
      loading: false
    }
  }

  handleChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      const upload = URL.createObjectURL(event.target.files[0])
      this.setState({upload, mimeType: file.type})
    } else {
      this.setState({upload: null})
    }
  }

  generateText = async () => {
    const {upload, mimeType} = this.state
    if (!upload) return
    this.setState({loading: true})

    // First edit image to make it easier to read for tesseract
    const img = await jimp.read(upload)
      .then(image => {
        image
          .normalize()
          .brightness(-0.5)
          .contrast(0.8)
        return image
      })
      .catch('Image edit error', console.error)

    const buffer = await img.getBufferAsync(mimeType)
    const blob = new Blob([buffer])

    this.setState({editedUpload: URL.createObjectURL(blob)})

    // Read text from image
    Tesseract.recognize(blob, {
      lang: 'eng'
    })
    .catch(err => {
      console.error(err)
    })
    .then(result => {
      let confidence = result.confidence
      let text = result.text
      this.props.autoFillFromImageText(text)
      this.setState({
        document: {
          text: text,
          confidence: confidence,
        },
        loading: false
      })
    })
  }

  render() {
    const {
      upload,
      document,
      editedUpload,
      loading
    } = this.state

    return (
      <div className='Image_reader'>
        <div className='File_uploader'>
          <label className='File_uploader_container'>
            Upload image
            <input type='file' onChange={this.handleChange} />
          </label>
          { upload && <img className='File_uploader_image' alt='upload' src={upload} /> }
          <button className='File_uploader_generate_button' onClick={this.generateText}>Generate</button>
        </div>

        { loading && <div>(loading spinner here)</div> }

        {!loading && !_.isEmpty(document) && editedUpload &&
          <div className='File_results'>
            <img className='File_results_image' alt='editedUpload' src={editedUpload} />
            <div className='File_results_score'>
              Confidence Score: {document.confidence}
            </div>
            <div className='File_results_output'>
              Output: {document.text}
            </div>
          </div>
        }
      </div>
    )
  }
}

export default ImageReader
