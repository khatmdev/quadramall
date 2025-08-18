import axios from "axios";

export const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    const res = await axios.post('/auth/refresh', { refreshToken });
    localStorage.setItem('token', res.data.accessToken);
    return res.data.accessToken;
};