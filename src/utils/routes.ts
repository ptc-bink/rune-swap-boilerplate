import axios from 'axios';
import { usersURL } from './config';
import toast from 'react-hot-toast';

export const getGeneratePsbt = async (data: any) => {
    try {
        const res = await axios.post(`${usersURL}/generatePsbt`, data);

        console.log('res.data :>> ', res.data);

        if (res.status === 200) {
            if (res.data.success) {
                return res.data.data
            } else {
                alert(res.data.data)
            }
        }
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

        const res = await axios.post(`${usersURL}/pushPsbt`, req);

        console.log('res.data :>> ', res.data);
        if (res.status === 200) {
            return res.data.data
        }
    } catch (error) {
        throw error
    }
}