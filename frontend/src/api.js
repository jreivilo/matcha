const API_URL = 'http://localhost:3000';

export const getUserInfo = async (username) => {
    const userInfo = {};
    // TODO: add like, block and whatever else is missing
    const response = await fetch(`${API_URL}/user/getinfo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
        credentials: 'include',
    });
    userInfo = { ...response.json() };
    response = await fetch(`${API_URL}/like/liked-by/${username}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
        credentials: 'include',
    });
    userInfo.liked_by = response.json();
    response = await fetch(`${API_URL}/block/blocked-by/${username}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
        credentials: 'include',
    });
    userInfo.blocked_by = response.json();
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