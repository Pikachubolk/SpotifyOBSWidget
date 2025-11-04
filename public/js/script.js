document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('sessionid');
    
    // Track current track to prevent unnecessary updates
    let currentTrackName = null;
    let currentArtistName = null;
    let currentAlbumName = null;

    function updateNowPlaying() {
        fetch(`/nowplaying?sessionid=${sessionId}`)
            .then(response => response.json())
            .then(data => {
                const trackNameElement = document.getElementById('track-name');
                const trackInfoElement = document.getElementById('track-info');
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

                        // Small delay to ensure DOM is updated and animation resets
                        setTimeout(() => {
                            const containerWidth = trackInfoElement.clientWidth;
                            const textWidth = trackNameElement.scrollWidth;
                            
                            // Check if the text overflows and apply scrolling if needed
                            if (textWidth > containerWidth) {
                                // Set the data-text attribute for seamless loop
                                trackNameElement.setAttribute('data-text', data.track_name);
                                
                                // Calculate dynamic duration based on text length
                                // Longer text = longer duration (proportional speed)
                                const baseSpeed = 50; // pixels per second
                                const duration = Math.max(10, (textWidth / baseSpeed));
                                trackNameElement.style.setProperty('--scroll-duration', `${duration}s`);
                                
                                // Force reflow to restart animation properly
                                void trackNameElement.offsetWidth;
                                
                                trackNameElement.classList.add('scrolling');
                            }
                        }, 50);
                    }
                    // If track hasn't changed, do nothing (keeps animation running smoothly)
                }
            })
            .catch(error => console.error('Error fetching now playing data:', error));
    }

    // Update every 5 seconds
    setInterval(updateNowPlaying, 5000);

    // Initial update
    updateNowPlaying();
});
