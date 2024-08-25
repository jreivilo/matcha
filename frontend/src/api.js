const API_URL = 'http://localhost:3000';

export const getUserInfo = async (username) => {
    let userInfo = {};
    try {
        let response = await fetch(`${API_URL}/user/getinfo`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username }),
            credentials: 'include',
        });
        response = await response.json();
        userInfo = { displayUser: response.user };

    } catch (error) {
        console.error('Error fetching user info:', error);
    }
    
    try {
        let response = await fetch(`${API_URL}/like/liked-by`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username }),
            credentials: 'include',
        });
        response = await response.json();
        userInfo = { ...userInfo, liked_by: response };

    } catch (error) {
        console.error('Error fetching liked by:', error);
    }

    try {
        let response = await fetch(`${API_URL}/block/blocked-by`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username }),
            credentials: 'include',
        });
        response = await response.json();
        userInfo = { ...userInfo, blocked_by: response };

    } catch (error) {
        console.error('Error fetching blocked by:', error);
    }
    console.log("Wow no error after 3 api calls! Here's the data:", JSON.stringify(userInfo));
    return userInfo;
};

export const toggleLike = async (src, dest, liked) => {
    const apiUrl = liked? `${API_URL}/like/add` : `${API_URL}/like/delete`
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: src, liked_username: dest }),
        credentials: 'include',
  });
  return response.json();
};

export const toggleBlock = async (src, dest, liked) => {
    const apiUrl = liked? `${API_URL}/block/add` : `${API_URL}/block/delete`;  
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: src, blocked_username: dest }),
        credentials: 'include',
  });
  return response.json();
};