import axios from 'axios';
import { backendApi } from '../config';
import toast from 'react-hot-toast';

export const testRoutes = async (data: any) => {
    try {
        const res = await axios.get(`${backendApi}/test/test`);

        console.log('res.data :>> ', res.data);
    } catch (error) {
        throw error
    }
}

export const pushTx = async (success: boolean, data: any) => {
    try {
        const req = {
            success: success,
            data: data
        }

        console.log('req :>> ', req);

        const res = await axios.post(`${backendApi}/pushPsbt`, req);

        console.log('res.data :>> ', res.data);
        if (res.status === 200) {
            return res.data.data
        }
    } catch (error) {
        throw error
    }
}