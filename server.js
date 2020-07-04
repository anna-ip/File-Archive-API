const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload')
const path = require('path')

const port = process.env.PORT || 7000
const app = express()

// enable files upload
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

//make uploads directory static
app.use(express.static('./public'))

//middlewares
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(fileUpload())

const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost/fileArchive'
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
mongoose.Promise = Promise

const File = mongoose.model('File', {
  extension: {
    type: String,
  },
  fileName: {
    type: String,
  },
  description: {
    type: String,
  },
  author: {
    type: String,
    require: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

app.get('/', (req, res) => {
  res.send('Hello world')
})

//add pagination
app.get('/files', async (req, res) => {
  const files = await File.find().sort({ createdAt: 'desc' }).limit(5).exec()
  res.json(files)
})

//Upload endpoint
//the uploaded file should preferable end up in like dropbox
app.post('/upload', (req, res) => {
  try {
    if (req.files === null) {
      return res.status(400).json({ msg: 'No file uploaded' })
    }
    const data = req.body
    const fileName = req.files.fileName //fileName same as name='' in the inputfield
    // const extension = path.extname(fileName)

    // const allowedExtensions = /xml|jpeg|jpg|pdf/

    // if (!allowedExtensions.test(extension)) throw 'Unsupported file type!'

    fileName.mv(`${__dirname}/code/public/uploads/${fileName.name}`, function (
      err
    ) {
      if (err) {
        console.log('Couldnt save the file')
        console.log(error)
      } else {
        console.log('File sucessfully uploaded')
      }
    })

    File.create(
      // res.send(
      {
        // extension: path.extname(fileName),
        extension: fileName.mimetype,
        fileName: fileName.name,
        description: data.description,
        author: data.author,
        createdAt: data.createdAt,
      },
      function (error, data) {
        if (error) {
          console.log('There was a problem adding this data to the database')
        } else {
          console.log('Data added to the database')
          console.log(data)
        }
      }
    )
  } catch (err) {
    //catch if path doesnt exist
    console.error(err)
    //500 server error
    return res.status(500).send(err)
  }
})

//Upload endpoint
//the uploaded file should preferable end up in like google drive
// app.post('/upload', (req, res) => {
// 	try {
// 		if (req.files === null) {
// 			return res.status(400).json({ msg: 'No file uploaded' })
// 		}
// 		const data = req.body;
// 		const file = req.files.file
// 		const fileName = file.name
// 		const extension = path.extname(fileName)
// 		//const user = file.user

// 		const allowedExtensions = /xml|jpeg|jpg|pdf/

// 		if (!allowedExtensions.test(extension)) throw 'Unsupported file type!'

// 		//mv = move the file to current dir/client(react)/public
// 		file.mv(`${__dirname}/client/public/uploads/${file.name}`)

// 		res.json({
// 			message: 'File uploaded successfully!',
// 			fileName: file.name,
// 			user: req.body,
// 			//user: data.user,
// 			description: req.body,
// 			//description: data.description,
// 			date: moment().add(10, 'days').calendar(),
// 			filePath: `uploads/${file.name}`,
// 			//filePath: `http://localhost:5000/uploads/${file.name}`,
// 			extension: path.extname(fileName)
// 		})
// 	} catch (err) { 	//catch if path doesnt exist
// 		console.error(err)
// 		//500 server error
// 		return res.status(500).send(err)
// 	}
// })

//delete files depending on the id
app.delete('/files:id', (req, res) => {})

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
