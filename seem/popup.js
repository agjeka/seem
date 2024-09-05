document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.getElementById('login-button');
    const logoutButton = document.getElementById('logout-button');
    const statusDiv = document.getElementById('status');
  
    function updateUI(isLoggedIn, username = '') {
      loginButton.style.display = isLoggedIn ? 'none' : 'block';
      logoutButton.style.display = isLoggedIn ? 'block' : 'none';
      statusDiv.textContent = isLoggedIn ? `Logged in as ${username}` : 'Not logged in';
    }
  
    function getSpotifyProfile(token) {
      fetch('https://api.spotify.com/v1/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(response => response.json())
      .then(data => {
        console.log('User profile:', data);
        updateUI(true, data.display_name || data.id);
      })
      .catch(error => {
        console.error('Error fetching profile:', error);
        updateUI(false);
      });
    }
  
    chrome.storage.local.get(['spotifyAccessToken'], (result) => {
      if (result.spotifyAccessToken) {
        getSpotifyProfile(result.spotifyAccessToken);
      } else {
        updateUI(false);
      }
    });

    loginButton.addEventListener('click', () => {
      chrome.runtime.sendMessage({action: 'login'}, (response) => {
        if (response && response.success) {
          console.log('Logged in successfully');
          chrome.storage.local.get(['spotifyAccessToken'], (result) => {
            if (result.spotifyAccessToken) {
              getSpotifyProfile(result.spotifyAccessToken);
            }
          });
        } else {
          console.error('Login failed', response ? response.error : 'Unknown error');
          statusDiv.textContent = `Login failed: ${response ? response.error : 'Unknown error'}`;
        }
      });
    });

    logoutButton.addEventListener('click', () => {
      chrome.runtime.sendMessage({action: 'logout'}, (response) => {
        if (response && response.success) {
          console.log('Logged out successfully');
          updateUI(false);
        } else {
          console.error('Logout failed');
          statusDiv.textContent = 'Logout failed. Please try again.';
        }
      });
    });
});