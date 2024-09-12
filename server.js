const express = require('express');
const path = require('path');
const app = express();
const spotifyController = require('./controllers/spotifyController');

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile('index.html', { root: path.join(__dirname, 'views') });
});

app.get('/nowplaying.html', (req, res) => {
    res.sendFile('nowplaying.html', { root: path.join(__dirname, 'views') });
});

app.get('/login', spotifyController.login);

app.get('/callback', spotifyController.callback);

app.get('/nowplaying', spotifyController.getNowPlaying);

const port = 4000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
