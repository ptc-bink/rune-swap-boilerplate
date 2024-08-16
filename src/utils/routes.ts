import axios from 'axios';
import { usersURL } from './config';

export const getGeneratePsbt = async (data: any) => {
    try {
        const res = await axios.post(`${usersURL}/generatePsbt`, data);

        if (res.status === 200) {
            return res.data.data
        }
    } catch (error) {
        throw error
    }
}

export const pushTx = async (success: boolean, data: any) => {
    try {
        const res = await axios.post(`${usersURL}/pushPsbt`, { success: success, data: data });

        if (res.status === 200) {
            return res.data.data
        }
    } catch (error) {
        throw error
    }
}