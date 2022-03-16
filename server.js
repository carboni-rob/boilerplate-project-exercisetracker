const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require("body-parser");
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: "false" }));
app.use(bodyParser.json());

const users = [];
const logs = {};

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.route('/api/users')
  .get(function(req, res) {
    res.json(users);
  })
  .post(function(req, res) {
    const newUser = {
      username: req.body.username,
      _id: `${Date.now()}`
    }
    users.push(newUser)
    res.json(newUser);
  })

app.post('/api/users/:_id/exercises', function(req, res) {
  const { _id } = req.params;
  const { description, duration, date } = req.body;
  const user = users.find(user => user._id === _id);
  const formattedDate = new Date(date || null).toDateString();
  const newExercise = { description, duration: parseInt(duration), date: formattedDate };
  const userLogs = logs[_id] || [];
  userLogs.push(newExercise);
  logs[_id] = userLogs;
  res.json({ ...user, ...newExercise })
});

app.get('/api/users/:_id/logs', function(req, res) {
  const { _id } = req.params;
  const { from, to, limit } = req.query;
  const user = users.find(user => user._id === _id);
  const userLogs = logs[_id];
  let filteredUserLogs = userLogs;
  if (from) {
    const fromDate = new Date(from);
    const filteredFromDateUserLogs = filteredUserLogs.filter(log => new Date(log.date) > fromDate);
    filteredUserLogs = filteredFromDateUserLogs;
  }
  if (to) {
    const toDate = new Date(from);
    const filteredToDateUserLogs = filteredUserLogs.filter(log => new Date(log.date) < toDate);
    filteredUserLogs = filteredToDateUserLogs;
  }
  if (limit) {
    filteredUserLogs.length = limit;
  }

  const result = {
    ...user,
    log: userLogs,
    count: userLogs.length
  }
  const jsonResult = JSON.stringify(result);
  console.log(jsonResult);
  res.send(result);
});




const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
