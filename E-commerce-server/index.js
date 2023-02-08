require('dotenv').config()
const app = require('./app/src')
const port = process.env.PORT || 5000
app.listen(port, () => { console.log('now we listen to port ' + port) })