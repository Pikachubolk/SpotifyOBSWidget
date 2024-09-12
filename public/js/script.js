document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('sessionid');

    function updateNowPlaying() {
        fetch(`/nowplaying?sessionid=${sessionId}`)
            .then(response => response.json())
            .then(data => {
                const trackNameElement = document.getElementById('track-name');

                if (data.error) {
                    trackNameElement.innerText = 'Error: ' + data.error;
                    document.getElementById('artist-name').innerText = '';
                    document.getElementById('album-art').src = '../images/default-album-art.png'; // Path to a default image
                } else {
                    trackNameElement.innerText = data.track_name;
                    document.getElementById('artist-name').innerText = data.artist_name;
                    document.getElementById('album-art').src = data.album_art;

                    // Check if the text overflows and apply scrolling if needed
                    if (trackNameElement.scrollWidth > trackNameElement.clientWidth) {
                        trackNameElement.classList.add('scrolling');
                    } else {
                        trackNameElement.classList.remove('scrolling');
                    }
                }
            })
            .catch(error => console.error('Error fetching now playing data:', error));
    }

    // Update every 5 seconds
    setInterval(updateNowPlaying, 5000);

    // Initial update
    updateNowPlaying();
});
