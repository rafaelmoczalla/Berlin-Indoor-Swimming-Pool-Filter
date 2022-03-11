import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

var app = express();
app.use(cors());
var port = process.env.PORT || 5000;

// create a GET route
app.get('/api*', (req, res) => {
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const url = req.url.toString().substring(5);

  fetch(url, {
    method: 'GET'
  }).then(response => {
    if (response.ok) {
      return response.text();
    } else {
      console.error('Cannot communicate with website.');
    }

    return 'failed';
  }).then(text => {
    res.send(text);
  }).catch(error => {
    res.send(error.toString());
  });
});

// This displays message that the server running and listening to specified port
app.listen(port, () => console.log(`Listening on port ${port}`));