const API_URL = 'http://localhost:3000';

export const getUserInfo = async (username, viewer) => {
    console.log("profileUsername", username);

    let userInfo = {};
    try {
        let response = await fetch(`${API_URL}/user/getinfo`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username }),
            credentials: 'include',
        });
        const userResponse = await response.json();
        userInfo = { displayUser: userResponse.user };
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
        const likedResponse = await response.json();
        if (likedResponse.success === true) {
            userInfo = {
                displayUser: {
                    ...userInfo.displayUser,
                    liked_by: likedResponse.liked_by_usernames,
                },
            };
        }
        console.log("Liked by: ", userInfo.displayUser.liked_by)

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
        const blockedResponse = await response.json();
        if (blockedResponse.success === true) {
            userInfo = {
                displayUser: {
                    ...userInfo.displayUser,
                    blocked_by: blockedResponse.blocked_by_usernames,
                },
            };
        }
        console.log("Blocks for this user: ", userInfo.displayUser.blocked_by)
    } catch (error) {
        console.error('Error fetching blocked by:', error);
    }
    let isLiked = userInfo.displayUser.liked_by?.includes(viewer);
    let isBlocked = userInfo.displayUser.blocked_by?.includes(viewer);
    userInfo = {
        ...userInfo,
        isLiked,
        isBlocked,
    }
    console.log("Wow no error after 3 api calls! Here's the data:", JSON.stringify(userInfo));
    return userInfo;
};

export const toggleLike = async (profileUsername, viewer, isLiked) => {
    const apiUrl = isLiked? `${API_URL}/like/unlike`: `${API_URL}/like/like`
    console.log("about to send: ", apiUrl);
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username : viewer, liked_username: profileUsername }),  
            credentials: 'include',
        });
    // console.log("I got in toggleLike!!");
    // const apiUrl = isLiked? `${API_URL}/like/unlike`: `${API_URL}/like/like`
    // console.log("about to send: ", apiUrl);
    // try {
    //     const response = await fetch(apiUrl, {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify({ username : src?.username, liked_username: profileUsername }),  
    //         credentials: 'include',
    //     });
    } catch (error) {
        console.error('Error fetching user info:', error);
        throw new Error('Failed to toggle like');
    }
  if (response.success !== true) { throw new Error('Failed to toggle like'); }
  return response.json();
};

export const toggleBlock = async (profileUsername, viewer, isBlocked) => {
    console.log("toggleblock profileusername: ", profileUsername);
    const apiUrl = isBlocked? `${API_URL}/block/unblock` : `${API_URL}/block/block`;  
    console.log("about to send: ", apiUrl);
    try {
        let response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'accept' : 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username : viewer, blocked_username: profileUsername }),
            credentials: 'include',
        });
    } catch (error) {
        console.error('Error fetching user info:', error);
        throw new Error('Failed to toggle block');
    }
    if (response.success !== true) { throw new Error('Failed to toggle block'); }
    return response.json();
};
