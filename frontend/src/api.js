const API_URL = 'http://localhost:3000';

const fetcher = async (url, body, method, headers = 'default') => {
    if (headers === 'default') {
        headers = { 'Content-Type': 'application/json',};
    }
    const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(body),
        credentials: 'include',
    });
    return response.json();
}

export const getUserInfo = async (username, viewer) => {
    let userInfo = {};
    try {
        const userResponse = await fetcher(
            `${API_URL}/user/getinfo`, { username }, 'POST'
        )
        userInfo = { displayUser: userResponse.user };
    } catch (error) {
        console.error('Error fetching user info:', error);
    }
    
    try {
        const likedResponse = await fetcher(
            `${API_URL}/like/liked-by`, { username }, 'POST' )
        if (likedResponse.success === true) {
            userInfo = {
                displayUser: {
                    ...userInfo.displayUser,
                    liked_by: likedResponse.liked_by_usernames,
                },
            };
        }

    } catch (error) {
        console.error('Error fetching liked by:', error);
    }
    try {
        const blockedResponse = await fetcher(
            `${API_URL}/block/blocked-by`, { username }, 'POST' )
        if (blockedResponse.success === true) {
            userInfo = {
                displayUser: {
                    ...userInfo.displayUser,
                    blocked_by: blockedResponse.blocked_by_usernames,
                },
            };
        }
    } catch (error) { console.error('Error fetching blocked by:', error);}
    
    userInfo = {
        ...userInfo,
        isLiked: userInfo.displayUser.liked_by?.includes(viewer),
        isBlocked: userInfo.displayUser.blocked_by?.includes(viewer),
    }

    try {
        const picResponse = await fetcher(
            `${API_URL}/image/get`, { username }, 'POST'
        )
        if (!picResponse.code) {
            userInfo = {
                ...userInfo,
                displayUser: {
                    ...userInfo.displayUser,
                    pics: picResponse,
                }
            }
        }
    } catch (error) {
        console.log("Error fetching profile pictures: ", error);
    }
    return userInfo;
};

export const toggleLike = async (data) => {
    const { profileUsername, viewer, isLiked } = data;
    if (profileUsername === viewer) { throw new Error(`You cannot like yourself! ${profileUsername}, ${viewer}`); }
    const apiUrl = isLiked? `${API_URL}/like/unlike`: `${API_URL}/like/like`
    console.log(`isLiked: ${isLiked}, url: ${apiUrl}`);
    try {
        let response = await fetcher(
            apiUrl, { username : viewer, liked_username: profileUsername }, 'POST'
        )
        return response;
    } catch (error) {
        console.error('Error fetching user info:', error);
        throw new Error('Failed to toggle like');
    }
};

export const toggleBlock = async (data) => {
    const { profileUsername, viewer, isBlocked } = data;
    if (profileUsername === viewer) { throw new Error('You cannot block yourself!'); }
    console.log("toggleblock profileusername: ", profileUsername);
    console.log("toogleblock viewer: ", viewer);
    const apiUrl = isBlocked? `${API_URL}/block/unblock` : `${API_URL}/block/block`;
    console.log("about to send: ", apiUrl);
    try {
        let response = await fetcher(
            apiUrl, { username : viewer, blocked_username: profileUsername }, 'POST'
        )
        return response;
    } catch (error) {
        console.error('Error fetching user info:', error);
        throw new Error('Failed to toggle block');
    }
};

export const uploadProfilePicture = async ( { username, file}) => {
    const apiUrl = `${API_URL}/image/add`;
    const response = await fetcher(apiUrl, { username, file}, 'POST')
    return response.data;
};

export const deleteProfilePicture = async ({ username, imageName }) => {
    const apiUrl = `${API_URL}/image/delete`;
    const imageNumber = imageName.split('_')[1].split('.')[0];
    const response = await fetcher( apiUrl, { username, imageNumber, }, 'DELETE')
    return response.data;
};
