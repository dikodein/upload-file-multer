const express = require('express')
const multer = require('multer')
const fs = require('fs')
const PORT = 4000

const app = express()

app.use(express.urlencoded({ extended: true }))

// Set Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads')
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now())
  }
})

const upload = multer({ storage })

// Get Files middleware
function getDirectoryContent (req, res, next) {
  fs.readdir('uploads', (err, files) => {
    if (err) return next(err)
    res.locals.filenames = files
    next()
  })
}

// Routes
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

app.post('/uploadfile', upload.single('myFile'), (req, res) => {
  const file = req.file
  if (!file) {
    const error = new Error('Please upload a file')
    error.httpStatusCode = 400
    return next(error)
  }
  res.send(file)
})

app.post('/uploadmultiple', upload.array('myFiles', 12), (req, res, next) => {
  const files = req.files
  if (!files) {
    const error = new Error('Please choose files')
    error.httpStatusCode = 400
    return next(error)
  }
  res.send(files)
})

app.get('/files', getDirectoryContent, (req, res) => {
  // build a response using res.locals.filenames here.
  // just sending the names is silly, and so for demonstration only
  res.send({ files: res.locals.filenames })
})

app.listen(PORT, () => {
  console.log('Listening on port', PORT)
})