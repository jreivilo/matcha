const API_URL = 'http://localhost:3000';

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

    try {
        const response = await fetch(url, options);

        if (!response.ok) {
            // throw new Error(`HTTP error! status: ${response.status}`);
            console.log(response);
        }

        return response.json();
    } catch (error) {
        console.error('Network or CORS error:', error);
        // throw error;
    }
};

export const getUserInfo = async (username, viewer) => {
    let userInfo = {};

    try {
        const userResponse = await fetcher(`${API_URL}/user/getinfo`, { username }, 'POST');
        userInfo = { displayUser: userResponse.user };

        const picResponse = await fetcher(`${API_URL}/image/get`, { username }, 'POST');
        if (!picResponse.code) {
            userInfo.displayUser.pics = picResponse;
        }
        
        if (!viewer) {
            return userInfo;
        }

        const likedResponse = await fetcher(`${API_URL}/like/liked-by`, { username }, 'POST');
        if (likedResponse.success === true) {
            userInfo.displayUser.liked_by = likedResponse.liked_by_usernames;
        }

        const blockedResponse = await fetcher(`${API_URL}/block/blocked-by`, { username }, 'POST');
        if (blockedResponse.success === true) {
            userInfo.displayUser.blocked_by = blockedResponse.blocked_by_usernames;
        }

        const viewedResponse = await fetcher(`${API_URL}/view/viewed-by`, { username }, 'POST');
        if (viewedResponse.success === true) {
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

export const toggleLike = async ({ profileUsername, viewer, isLiked }) => {
    if (profileUsername === viewer) {
        throw new Error('You cannot like yourself!');
    }
    const apiUrl = isLiked ? `${API_URL}/like/unlike` : `${API_URL}/like/like`;
    return fetcher(apiUrl, { username: viewer, liked_username: profileUsername }, 'POST');
};

export const toggleBlock = async ({ profileUsername, viewer, isBlocked }) => {
    if (profileUsername === viewer) {
        throw new Error('You cannot block yourself!');
    }
    const apiUrl = isBlocked ? `${API_URL}/block/unblock` : `${API_URL}/block/block`;
    return fetcher(apiUrl, { username: viewer, blocked_username: profileUsername }, 'POST');
};

export const uploadProfilePicture = async ({ username, file }) => {
    const apiUrl = `${API_URL}/image/add`;
    return fetcher(apiUrl, { username, file }, 'POST');
};

export const deleteProfilePicture = async ({ username, imageName }) => {
    const apiUrl = `${API_URL}/image/delete`;
    const imageNumber = imageName.split('_')[1].split('.')[0];
    return fetcher(apiUrl, { username, imageNumber }, 'DELETE');
};

export const changeMainPicture = async ({ username, image }) => {
    const apiUrl = `${API_URL}/image/change-main-picture`;
    return fetcher(apiUrl, { username, image }, 'PUT');
};

export const markView = async ({ profileUsername, viewer }) => {
    const apiUrl = `${API_URL}/view/view`;
    return fetcher(apiUrl, { username: viewer, viewed_username: profileUsername }, 'POST');
};
