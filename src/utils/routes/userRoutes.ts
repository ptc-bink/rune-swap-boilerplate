import axios from 'axios';
import { backendApi } from '../config';
import toast from 'react-hot-toast';

export const getTaprootMusigList = async () => {
    try {
        const res = await axios.get(`${backendApi}/user/getTaprootMusigList`);

        if (res.status === 200) {
            return res.data;
        } 
    } catch (error) {
        throw error
    }
}