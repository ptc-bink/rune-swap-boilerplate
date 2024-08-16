import React, { useState } from 'react';
import {
  getAddress,
  AddressPurpose,
  BitcoinNetworkType
} from 'sats-connect';

import Unisat from "./assets/unisat.jpg"
import axios from 'axios';
import './App.css';
import { usersURL, WalletTypes } from './utils';

const Wallet: React.FC = () => {

  const [address, setAddress] = useState<string>("");
  const [pubkey, setPubkey] = useState<string>("");
  const [ordinalAddress, setOrdinalAddress] = useState<string>("");
  const [ordinalPubkey, setOrdinalPubkey] = useState<string>("");
  const [sendingAmount, setSendingAmount] = useState<number>(0);
  const [walletConnected, setWalletConnected] = useState<boolean>(false);
  const [walletType, setWalletType] = useState<string>("");

  const connectUnisatWallet = async () => {
    try {
      const tempAddress = await (window as any).unisat.requestAccounts();
      const pubkey = await (window as any).unisat.getPublicKey();

      setAddress(tempAddress[0]);
      setPubkey(pubkey);
      setWalletConnected(true);
      setWalletType("Unisat");

    } catch (err) {
      throw (err);
    }
  };

  const connectXverseWallet = async () => {
    await getAddress({
      payload: {
        purposes: [
          AddressPurpose.Ordinals,
          AddressPurpose.Payment,
          AddressPurpose.Stacks,
        ],
        message: "Ordinal Raffle Site",
        network: {
          type: BitcoinNetworkType.Testnet,
        },
      },
      onFinish: (response) => {
        setWalletType(WalletTypes.XVERSE);
        const paymentAddressItem = response.addresses.find(
          (address) => address.purpose === AddressPurpose.Payment
        );
        setAddress(paymentAddressItem?.address as string);
        setPubkey(paymentAddressItem?.publicKey as string);

        const ordinalsAddressItem = response.addresses.find(
          (address) => address.purpose === AddressPurpose.Ordinals
        );
        setOrdinalAddress(ordinalsAddressItem?.address as string);
        setOrdinalPubkey(ordinalsAddressItem?.publicKey as string);
        setWalletConnected(true);
        setWalletType("Xverse");
      },
      onCancel: () => alert("Request canceled"),
    });
  }

  const connectHiroWallet = async () => {
    setWalletConnected(true);
    setWalletType("Hiro");
  }

  const waitingSignPsbt = async (psbt: string, inputArray: Array<number>) => {
    const timeoutPromise = new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 1000000); // 10 seconds timeout
    });

    // Race between the async function and timeout
    const result = await Promise.race([signPsbt(psbt, inputArray), timeoutPromise]);

    if (result === undefined) {
      //  user not signing psbt within 10s
      return { success: false, data: "User not signed within 10s" }
    } else {
      // user signed psbt
      return { success: true, data: result }
    }
  };

  const signPsbt = async (psbt: string, inputArray: Array<number>) => {
    const toSignInputs: { index: number; address: string }[] = [];
    inputArray.map((value: number) =>
      toSignInputs.push({
        index: value,
        address: address,
      })
    );

    console.log("toSignInputs ==> ", toSignInputs);
    console.log('psbt :>> ', psbt);

    const signedPsbt = await (window as any).unisat.signPsbt(psbt, { autoFinalized: false, toSignInputs: toSignInputs });

    return signedPsbt;
  }

  const handleSubmit = async () => {
    if (pubkey === "" || address === "" || sendingAmount === 0 || !walletType) {
      return console.log("Invalid inputs");
    }

    const data = {
      pubkey: pubkey,
      address: address,
      ordinalPubkey: ordinalPubkey,
      ordinalAddress: ordinalAddress,
      sendingAmount: sendingAmount,
      walletType: walletType
    };

    console.log('data :>> ', data);

    try {
      const res = await axios.post(`${usersURL}/generatePsbt`, data);

      if (res.status === 200) {
        const { psbt, inputArray } = res.data.data;
        const signResult = await waitingSignPsbt(psbt, inputArray);

        // user signed successfully
        if (signResult.success) {
          const data = {
            userSignedHexedPsbt: signResult.data,
            amount1: res.data.data.amount1,
            amount2: res.data.data.amount2,
            inputArray,
            walletType
          }

          const txId = await axios.post(`${usersURL}/pushPsbt`, { success: true, data: data });

          console.log('txId :>> ', txId);
        } else {
          const txId = await axios.post(`${usersURL}/pushPsbt`, { success: false, data: "sign psbt failed!!!" });

          console.log("Try again later");
        }
      } else {
        return alert("Try again later")
      }
    } catch (error) {
      throw error
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
                <p>Set Amount</p>
                <input type="number" className='text-slate-950' value={sendingAmount} onChange={(e) => setSendingAmount(e.target.valueAsNumber)} />
              </div>
            </div>
            <button onClick={handleSubmit}>Submit</button>
          </div>
          : <div className='flex'>
            <button
              className="flex hover:cursor-pointer bg-[#131417] broder-[#252B35] broder-1 flex-col items-center w-full px-4 py-8 rounded-xl gap-2"
              onClick={connectUnisatWallet}
            >
              <img src={Unisat} className="w-10 h-10 rounded-md " />
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
