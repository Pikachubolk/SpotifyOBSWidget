const SpotifyWebApi = require('spotify-web-api-node');
const fs = require('fs-extra');
const path = require('path');

require('dotenv').config();

const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: process.env.SPOTIFY_REDIRECT_URI
});

const sessionFilePath = path.join(__dirname, 'sessions.json');

function loadSessions() {
    if (fs.existsSync(sessionFilePath)) {
        return fs.readJsonSync(sessionFilePath);
    } else {
        return {};
    }
}

function saveSessions(sessions) {
    fs.writeJsonSync(sessionFilePath, sessions);
}

const sessions = loadSessions();

exports.getAuthUrl = () => {
    const scopes = ['user-read-playback-state'];
    return spotifyApi.createAuthorizeURL(scopes);
};

exports.handleCallback = async (code) => {
    const data = await spotifyApi.authorizationCodeGrant(code);
    const accessToken = data.body['access_token'];
    const sessionId = generateSessionId();
    sessions[sessionId] = accessToken;
    saveSessions(sessions);
    return sessionId;
};

exports.getNowPlaying = async (sessionId) => {
    spotifyApi.setAccessToken(sessions[sessionId]);
    try {
        const playbackState = await spotifyApi.getMyCurrentPlaybackState();
        if (playbackState.body && playbackState.body.is_playing) {
            const track = playbackState.body.item;
            return {
                track_name: track.name,
                artist_name: track.artists[0].name,
                album_art: track.album.images[0].url, // Assuming the first image is the desired size
                obs_link: `obs://now-playing-link/${track.id}`
            };
        } else {
            return { error: 'No track is currently playing.' };
        }
    } catch (error) {
        return { error: 'Failed to retrieve now playing data.' };
    }
};

function generateSessionId() {
    return Math.random().toString(36).substr(2, 9);
}
