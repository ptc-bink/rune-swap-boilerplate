import axios from 'axios';
import { backendApi } from '../config';
import toast from 'react-hot-toast';

export const getSendBtcPsbt = async (data: any) => {
    try {
        const res = await axios.post(`${backendApi}/airdrop/userSendBtcPsbt`, data);

        console.log('res.data :>> ', res.data);

        if (res.status === 200) {
            if (res.data.success) {
                return res.data.payload;
            } else {
                return toast.error(res.data.message);
            }
        }
    } catch (error) {
        throw error
    }
}

export const pushSendBtcTx = async (data: any) => {
    try {
        const res = await axios.post(`${backendApi}/airdrop/pushSendBtcTx`, data);

        console.log('res.data :>> ', res.data);

        if (res.status === 200) {
            if (res.data.success) {
                return res.data.payload;
            } else {
                return toast.error(res.data.message);
            }
        }
    } catch (error) {
        throw error
    }
}