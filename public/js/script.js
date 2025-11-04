document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('sessionid');
    
    // Track current track to prevent unnecessary updates
    let currentTrackName = null;
    let currentArtistName = null;
    let currentAlbumName = null;

    function clamp(num, min, max) {
        return Math.min(max, Math.max(min, num));
    }

    function resizeLayout() {
        const player = document.getElementById('player');
        const trackInfoElement = document.getElementById('track-info');
        const trackNameElement = document.getElementById('track-name');
        const artistNameElement = document.getElementById('artist-name');
        const albumNameElement = document.getElementById('album-name');

        if (!player || !trackInfoElement || !trackNameElement) return;

        const width = player.clientWidth;
        const height = player.clientHeight;

        // Art size scales with smallest dimension, works for tiny and large containers
        const minDimension = Math.min(width, height);
        const artSize = clamp(minDimension * 0.7, 30, 600);
        player.style.setProperty('--art-size', `${Math.round(artSize)}px`);
        
        // Gap scales with width, smaller for tiny containers
        const gap = clamp(width * 0.025, 4, 50);
        player.style.setProperty('--gap', `${Math.round(gap)}px`);

        // Font sizes based on height with better scaling for small containers
        // Use smaller multipliers and lower minimums for tiny containers
        const trackSize = clamp(height * 0.18, 8, 120);
        const artistSize = clamp(height * 0.12, 6, 80);
        const albumSize = clamp(height * 0.10, 5, 60);

        trackNameElement.style.fontSize = `${Math.round(trackSize)}px`;
        artistNameElement && (artistNameElement.style.fontSize = `${Math.round(artistSize)}px`);
        albumNameElement && (albumNameElement.style.fontSize = `${Math.round(albumSize)}px`);

        // Adjust spacing for very small containers
        const marginBottom = clamp(height * 0.02, 2, 20);
        if (trackNameElement.parentElement) {
            trackNameElement.parentElement.style.marginBottom = `${Math.round(marginBottom)}px`;
        }
        if (artistNameElement) {
            artistNameElement.style.marginBottom = `${Math.round(marginBottom)}px`;
        }

        // Re-evaluate scrolling based on available width
        setTimeout(() => {
            const containerWidth = trackInfoElement.clientWidth;
            const textWidth = trackNameElement.scrollWidth;
            if (textWidth > containerWidth) {
                const baseSpeed = 60; // pixels per second
                const duration = Math.max(8, textWidth / baseSpeed);
                trackNameElement.setAttribute('data-text', trackNameElement.innerText);
                trackNameElement.style.setProperty('--scroll-duration', `${duration}s`);
                void trackNameElement.offsetWidth; // restart animation if needed
                trackNameElement.classList.add('scrolling');
            } else {
                trackNameElement.classList.remove('scrolling');
                trackNameElement.removeAttribute('data-text');
            }
        }, 100);
    }

    function updateNowPlaying() {
        fetch(`/nowplaying?sessionid=${sessionId}`)
            .then(response => response.json())
            .then(data => {
                const trackNameElement = document.getElementById('track-name');
                const artistNameElement = document.getElementById('artist-name');
                const albumNameElement = document.getElementById('album-name');
                const albumArtElement = document.getElementById('album-art');

                if (data.error) {
                    // Only update if different from current state
                    if (currentTrackName !== null) {
                        trackNameElement.innerText = 'Error: ' + data.error;
                        artistNameElement.innerText = '';
                        albumNameElement.innerText = '';
                        albumArtElement.src = '../images/default-album-art.png';
                        trackNameElement.classList.remove('scrolling');
                        trackNameElement.removeAttribute('data-text');
                        currentTrackName = null;
                        currentArtistName = null;
                        currentAlbumName = null;
                    }
                } else {
                    // Only update if track has changed (prevents animation restart)
                    if (currentTrackName !== data.track_name || 
                        currentArtistName !== data.artist_name || 
                        currentAlbumName !== data.album_name) {
                        
                        // Update current track info
                        currentTrackName = data.track_name;
                        currentArtistName = data.artist_name;
                        currentAlbumName = data.album_name;

                        // Update DOM
                        artistNameElement.innerText = data.artist_name;
                        albumNameElement.innerText = data.album_name || 'Unknown Album';
                        albumArtElement.src = data.album_art;

                        // Remove scrolling class first to reset animation
                        trackNameElement.classList.remove('scrolling');
                        trackNameElement.removeAttribute('data-text');
                        trackNameElement.style.removeProperty('--scroll-duration');
                        
                        // Update text
                        trackNameElement.innerText = data.track_name;

                        // Recalculate layout and scrolling with new content
                        resizeLayout();
                    }
                    // If track hasn't changed, do nothing (keeps animation running smoothly)
                }
            })
            .catch(error => console.error('Error fetching now playing data:', error));
    }

    // Update every 5 seconds
    setInterval(updateNowPlaying, 5000);

    // Initial layout + update
    window.addEventListener('resize', resizeLayout);
    updateNowPlaying();
    resizeLayout();
});
