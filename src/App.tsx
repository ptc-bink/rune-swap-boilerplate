import React, { useState } from 'react';
import {
  getAddress,
  AddressPurpose,
  BitcoinNetworkType
} from 'sats-connect';

import Unisat from "./assets/unisat.jpg"
import './App.css';
import { WalletTypes } from './utils/config';
import { cancelRuneSwap, getSwapPsbt, pushTx } from './utils/routes/swapRoutes';
import { delay, signPsbt, waitingSignPsbt } from './utils/action';
import toast from 'react-hot-toast';
import { testRoutes } from './utils/routes/testRoutes';
import { getTaprootMusigList } from './utils/routes/userRoutes';
import { getSendBtcPsbt, pushSendBtcTx } from './utils/routes/airdropRoute';

const Wallet: React.FC = () => {

  const [address, setAddress] = useState<string>("");
  const [pubkey, setPubkey] = useState<string>("");
  const [sendingAmount, setSendingAmount] = useState<number>(0);
  const [sendingAddress, setSendingAddress] = useState<string>("");
  const [walletConnected, setWalletConnected] = useState<boolean>(false);
  const [walletType, setWalletType] = useState<string>("");
  const [txId, setTxId] = useState<string>("");
  const [adminList, setAdminList] = useState<string[]>([]);

  const connectUnisatWallet = async () => {
    try {
      // const tempAdminList = await getTaprootMusigList();
      const tempAddress = await (window as any).unisat.requestAccounts();
      const pubkey = await (window as any).unisat.getPublicKey();

      // setAdminList(tempAdminList);
      setAdminList([]);
      setAddress(tempAddress[0]);
      setPubkey(pubkey);
      setWalletConnected(true);
      setWalletType("Unisat");

    } catch (err) {
      throw (err);
    }
  };

  const handleSubmit = async () => {
    if (!pubkey || !address || !sendingAmount) {
      return alert("You should set token sending amount");
    }

    // if (!adminList.includes(sendingAddress)) {
    //   return alert("You should select Musig Address on the list");
    // }

    const data = {
      userPubkey: pubkey,
      userAddress: address,
      sendingAmount: sendingAmount,
      adminAddress: sendingAddress
    };

    console.log('data :>> ', data);

    const res = await getSwapPsbt(data);

    if (res) {
      const { amount1, amount2, multisigInputArray, psbt, userInputArray } = res;
      const signResult = await waitingSignPsbt(psbt, address, userInputArray);

      console.log('signResult :>> ', signResult);

      // user signed successfully
      if (signResult.success) {
        const data = {
          psbt: psbt,
          userSignedHexedPsbt: signResult.data,
          amount1: amount1,
          amount2: amount2,
          userInputArray,
          multisigInputArray,
          adminAddress: sendingAddress
        }

        const txId = await pushTx(data);

        if (txId) {
          toast.success("Rune swap successfully!")

          return setTxId(txId);
        } else {
          const data = {
            adminAddress: sendingAddress
          }
          const res = await cancelRuneSwap(data);

          return toast.error("Try again later")
        }
      } else {
        const res = await cancelRuneSwap(sendingAddress);

        toast.error("Try again later");
      }
    } else {
      await delay(20000);

      const data = {
        adminAddress: sendingAddress
      }
      await cancelRuneSwap(data);
    }
  }

  const handleClaim = async () => {
    const data = {
      userAddress: address,
      sendingAmount: sendingAmount,
      adminAddress: sendingAddress
    }

    const sendBtcres = await getSendBtcPsbt(data);

    if (sendBtcres) {
      const signResult = await signPsbt(sendBtcres, address);

      console.log('signResult :>> ', signResult);

      if (signResult) {
        const data = {
          userAddress: address,
          adminAddress: sendingAddress,
          rawTx: signResult
        }
        const pushTx = await pushSendBtcTx(data);
      }
    }
  }

  return (
    <div className="App">
      <header className="App-header test-[#FFFFFF]">
        {walletConnected
          ? <div className='flex flex-col gap-4'>
            <div className='flex flex-col gap-2'>
              <div className='flex gap-2'>
                <p>Address</p>
                <p>{address}</p>
              </div>
              <div className='flex gap-2'>
                <p>public key</p>
                <p>{pubkey}</p>
              </div>
              <div className='flex gap-2'>
                <p>Musig Wallet List</p>
                {adminList.map((item: string) => {
                  return <p>{item}</p>
                })}
              </div>
              <div className='flex gap-2'>
                <p>Set MusigWallet</p>
                <input type="string" className='text-slate-950' value={sendingAddress} placeholder='Enter one in Musig wallet list' onChange={(e) => setSendingAddress(e.target.value)} />
              </div>
              <div className='flex gap-2'>
                <p>Set Amount</p>
                <input type="number" className='text-slate-950' value={sendingAmount} onChange={(e) => setSendingAmount(e.target.valueAsNumber)} />
              </div>
              <div className='flex gap-2'>
                {
                  txId && <>
                    <p>Txid</p>
                    <p>{txId}</p>
                  </>
                }
              </div>
            </div>
            <div><button onClick={() => handleSubmit()}>Submit</button></div>
            <div><button onClick={() => handleClaim()}>Claim airdrop</button></div>
          </div>
          : <div className='flex'>
            <button
              className="flex hover:cursor-pointer bg-[#131417] broder-[#252B35] broder-1 flex-col items-center w-full px-4 py-8 rounded-xl gap-2"
              onClick={connectUnisatWallet}
            >
              <img alt='unisat' src={Unisat} className="w-10 h-10 rounded-md " />
              <p className="font-bold text-[16px] leading-5">Unisat</p>
            </button>
            {/* <button
              className="flex hover:cursor-pointer bg-[#131417] broder-[#252B35] broder-1 flex-col items-center w-full px-4 py-8 rounded-xl gap-2"
              onClick={connectXverseWallet}
            >
              <img src={Unisat} className="w-10 h-10 rounded-md " />
              <p className="font-bold text-[16px] leading-5">Xverse</p>
            </button>
            <button
              className="flex hover:cursor-pointer bg-[#131417] broder-[#252B35] broder-1 flex-col items-center w-full px-4 py-8 rounded-xl gap-2"
              onClick={connectHiroWallet}
            >
              <img src={Unisat} className="w-10 h-10 rounded-md " />
              <p className="font-bold text-[16px] leading-5">Hiro</p>
            </button> */}
          </div>}
      </header>
    </div>
  );

}

export default Wallet;
