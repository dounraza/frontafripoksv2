import api from "./api";

export const updateProfile = async (userId, profileData) => {
    try {
        const response = await api.put(`/api/auth/users/${userId}`, profileData, {
            headers: {
                'Content-Type': profileData instanceof FormData ? 'multipart/form-data' : 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};
