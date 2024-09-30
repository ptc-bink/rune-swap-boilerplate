import axios from 'axios';
import { backendApi } from '../config';
import toast from 'react-hot-toast';
import { delay } from '../action';

export const getSwapPsbt = async (data: any) => {
    try {
        const res = await axios.post(`${backendApi}/swap/generatePsbt`, data);

        console.log('res.data :>> ', res.data);

    if (res.status === 200) {
        if (res.data.success) {
            return res.data.payload
        } else {
            alert(res.data.data)
        }
    }
} catch (error) {
    throw error
}
}

export const pushTx = async (data: any) => {
    try {
        const res = await axios.post(`${backendApi}/swap/pushPsbt`, data);

        console.log('res.data :>> ', res.data);
        if (res.status === 200) {
            return res.data.payload
        }
    } catch (error) {
        throw error
    }
}

export const cancelRuneSwap = async (data: any) => {
    try {
        const res = await axios.post(`${backendApi}/swap/cancelPushPsbt`, data);

        console.log('res.data :>> ', res.data);
        if (res.status === 200) {
            return res.data.payload
        }
    } catch (error) {
        throw error
    }
}