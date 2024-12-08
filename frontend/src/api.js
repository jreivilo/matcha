// const API_URL = 'http://localhost:3000';
const API_URL = import.meta.env.VITE_BACKEND_URL;

export const fetcher = async (url, body, method, headers = {}) => {
    const defaultHeaders = {
        'Content-Type': 'application/json',
        ...headers
    };

    const options = {
        method,
        headers: defaultHeaders,
        credentials: 'include',
    };

    if (body && (method !== 'GET' && method !== 'HEAD')) {
        options.body = JSON.stringify(body);
    }

    const fullurl = `${API_URL}${url}`;

    try {
        const response = await fetch(fullurl, options);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
            console.log(response);
        }

        return response.json();
    } catch (error) {
        console.error('Network or CORS error:', error);
        throw error;
    }
};

export const getUserInfo = async (username, viewer) => {

    let userInfo = {};

    try {
        const userResponse = await fetcher('/user/getinfo', { username }, 'POST');
        if (userResponse.error) {
            throw new Error(userResponse.error);
        }
        userInfo = { displayUser: userResponse.user };

        const picResponse = await fetcher('/image/get', { username }, 'POST');
        if (!picResponse.code) {
            userInfo.displayUser.pics = picResponse;
        }
        
        if (!viewer) {
            return userInfo;
        }

        const likedResponse = await fetcher(`/like/liked-by`, { username }, 'POST');
        if (likedResponse.success === true) {
            userInfo.displayUser.liked_by = likedResponse.liked_by_usernames;
        }

        const blockedResponse = await fetcher(`/block/blocked-by`, { username }, 'POST');
        if (blockedResponse.success === true) {
            userInfo.displayUser.blocked_by = blockedResponse.blocked_by_usernames;
        }

        const viewedResponse = await fetcher(`/view/viewed-by`, { username }, 'POST');
        if (viewedResponse && viewedResponse.success === true) {
            userInfo.displayUser.viewed_by = viewedResponse.viewed_by_usernames;
        }

        userInfo.isLiked = userInfo.displayUser.liked_by?.includes(viewer);
        userInfo.isBlocked = userInfo.displayUser.blocked_by?.includes(viewer);

        return userInfo;
    } catch (error) {
        console.error('Error fetching user info:', error);
        throw error;
    }
};

export const getProfileAuth = async (username) => {
    const userResponse = await fetcher('user/getinfo', { username }, 'POST');
    if (userResponse.error) {
        throw new Error(userResponse.error);
    }
    userInfo = { displayUser: userResponse.user };
    return userInfo;
};

export const getUserPics = async (username) => {
    const response = await fetcher('/image/get', { username}, 'POST'); 
    if (response.error) throw new Error(response.error);
    return response.code ? [] : response;
};

export const updateProfile = async ({ profileUsername, viewer, newUserData }) => {
    const apiUrl = '/user/profile';
    return fetcher(apiUrl, { username: viewer, ...newUserData }, 'POST');
};

export const toggleLike = async ({ profileUsername, viewer, isLiked }) => {
    if (profileUsername === viewer) {
        throw new Error('You cannot like yourself!');
    }
    const apiUrl = isLiked ? '/like/unlike' : '/like/like'; 
    return fetcher(apiUrl, { username: viewer, liked_username: profileUsername }, 'POST');
};

export const toggleBlock = async ({ profileUsername, viewer, isBlocked }) => {
    if (profileUsername === viewer) {
        throw new Error('You cannot block yourself!');
    }
    const apiUrl = isBlocked ? '/block/unblock' : '/block/block';
    return fetcher(apiUrl, { username: viewer, blocked_username: profileUsername }, 'POST');
};

export const uploadProfilePicture = async ({ username, file }) => {
    return fetcher('/image/add', { username, file }, 'POST');
};

export const deleteProfilePicture = async ({ username, imageNumber }) => {
    return fetcher('image/delete', { username, imageNumber }, 'DELETE');
};

export const changeMainPicture = async ({ username, image }) => {
    return fetcher('/image/change-main-picture', { username, image }, 'PUT');
};

export const markView = async ({ profileUsername, viewer }) => {
    if (!profileUsername || !viewer) {
        throw new Error('Missing parameters');
    }
    return fetcher('/view/view', { username: viewer, viewed_username: profileUsername }, 'POST');
};

export const getNotificationHistory = async (username) => {
    const res = await fetcher('/notification/history', { target: username }, 'POST');
    return res.notifications;
}

export const getChatHistory = async ({ sender, receiver}) => { 
    if (!sender || !receiver) throw new Error('Missing parameters');
    const res = await fetcher('/chat/messages', { sender, receiver }, 'POST')
    return res.messages
}

export const getMatches = async (username) => {
    const res = await fetcher('/match/get-user-matches', { username }, 'POST')
    return res.matches
}

export const sendMessage = async ({ sender, receiver, message }) => {
    return fetcher('/chat/add', { sender, receiver, message }, 'POST')
}