const spotifyModel = require('../models/spotifyModel');

exports.login = (req, res) => {
    const authUrl = spotifyModel.getAuthUrl();
    res.redirect(authUrl);
};

exports.callback = async (req, res) => {
    const code = req.query.code;
    const sessionId = await spotifyModel.handleCallback(code);
    res.redirect(`/nowplaying.html?sessionid=${sessionId}`);
};

exports.getNowPlaying = async (req, res) => {
    const sessionId = req.query.sessionid;
    const nowPlaying = await spotifyModel.getNowPlaying(sessionId);

    if (nowPlaying.error) {
        res.json({ error: nowPlaying.error });
    } else {
        res.json({
            track_name: nowPlaying.track_name,
            artist_name: nowPlaying.artist_name,
            album_art: nowPlaying.album_art,
            obs_link: nowPlaying.obs_link
        });
    }
};
