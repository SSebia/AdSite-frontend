import apiClient from 'src/utils/apiClient';
import { getToken } from 'src/services/userService';

export const getAds = async () => {
    const response = await apiClient.get('ads', {
        headers: {
            'Authorization': `Bearer ${getToken()}`
        }
    });
    return response.data;
}

export const getCategories = async () => {
    const response = await apiClient.get('category', {
        headers: {
            'Authorization': `Bearer ${getToken()}`
        }
    });
    return response.data;
}

export const getComments = async (bookID) => {
    const response = await apiClient.get(`ads/comments/${bookID}`, {
        headers: {
            'Authorization': `Bearer ${getToken()}`
        }
    });
    return response.data;
}
