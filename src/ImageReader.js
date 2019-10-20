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
      editedUploads: [],
      document: {},
      loading: false
    }
  }

  handleChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      const upload = URL.createObjectURL(event.target.files[0])
      this.setState({upload, mimeType: file.type})

      this.setState({
        upload, mimeType: file.type
      }, async () => {
        await this.generateText()
      })
    } else {
      this.setState({upload: null})
    }
  }

  editImage = async (brightness, contrast) => {
    const {upload, mimeType} = this.state
    const img = await jimp.read(upload)
      .then(image => {
        image
          .cover(1000, 1000)
          .brightness(brightness)
          .contrast(contrast)
        return image
      })
      .catch('Image edit error', console.error)
    const buffer = await img.getBufferAsync(mimeType)
    return new Blob([buffer])
  }

  generateText = async () => {
    const {upload} = this.state
    if (!upload) return
    this.setState({loading: true})

    // First edit image to make it easier to read for tesseract
    const [blob1, blob2, blob3] = await Promise.all([
      this.editImage(-0.7, 0),
      this.editImage(-0.5, 0.2),
      this.editImage(-0.5, 0.6)
    ])

    this.setState({editedUploads: [URL.createObjectURL(blob1), URL.createObjectURL(blob2), URL.createObjectURL(blob3)]})

    let text = ''
    let confidence = ''
    // Read text from image
    await Promise.all([blob1, blob2, blob3].map(blob =>
      Tesseract.recognize(blob, 'eng')
        .catch(err => {
          console.error(err)
        })
        .then(result => {
          console.log('RESULT', result)
          confidence = `${confidence}-${result.data.confidence}`
          text = `${text}-${result.data.text}`
        })
    ))

    this.props.autoFillFromImageText(text)
    this.setState({
      document: {
        text: text.slice(1, -1),
        confidence: confidence.slice(1, -1),
      },
      loading: false
    })

  }

  render() {
    const {
      upload,
      document,
      editedUploads,
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
        </div>

        { loading && <div>(loading spinner here)</div> }

        {!loading && !_.isEmpty(document) && editedUploads.length > 0 &&
          <div className='File_results'>
            <div className='File_results_images'>
              { editedUploads.map(editedUpload =>
                <img className='File_results_image' alt='editedUpload' src={editedUpload} />
              )}
            </div>
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
