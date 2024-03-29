const express = require('express')
const multer = require('multer')
const fs = require('fs')
const MongoClient = require('mongodb').MongoClient
const ObjectId = require('mongodb').ObjectID
const myurl = 'mongodb://localhost:27017'
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

// Get Files function
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
  res.send({ files: res.locals.filenames })
})

app.post('/uploadphoto', upload.single('picture'), (req, res) => {
  const img = fs.readFileSync(req.file.path)
  const encode_image = img.toString('base64')

  const finalImg = {
    contentType: req.file.mimetype,
    image: new Buffer(encode_image, 'base64')
  }

  db.collection('photos').insertOne(finalImg, (err, result) => {
    if (err) return console.log(err)
    console.log('saved to database')
    res.redirect('/')
  })
})

app.get('/photos', (req, res) => {
  db.collection('photos').find().toArray((err, result) => {
    if (err) return console.log(err)
    res.send(result)
  })
})

app.get('/photo/:id', (req, res) => {
  const filename = req.params.id
  db.collection('photos').findOne({ _id: ObjectId(filename) }, (err, result) => {
    if (err) return console.log(err)
    res.contentType('image/jpeg')
    res.send(result.image.buffer)
  })
})

MongoClient.connect(myurl, (err, client) => {
  if (err) return console.log(err)
  db = client.db('test')
  app.listen(PORT, () => {
    console.log('Listening on port', PORT)
  })
})
