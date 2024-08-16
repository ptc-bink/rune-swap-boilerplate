import React, { useState } from 'react';
import {
  getAddress,
  AddressPurpose,
  BitcoinNetworkType
} from 'sats-connect';

import Unisat from "./assets/unisat.jpg"
import './App.css';
import { WalletTypes } from './utils/config';
import { getGeneratePsbt, pushTx } from './utils/routes';
import { waitingSignPsbt } from './utils/action';
import toast from 'react-hot-toast';

const Wallet: React.FC = () => {

  const [address, setAddress] = useState<string>("");
  const [pubkey, setPubkey] = useState<string>("");
  const [ordinalAddress, setOrdinalAddress] = useState<string>("");
  const [ordinalPubkey, setOrdinalPubkey] = useState<string>("");
  const [sendingAmount, setSendingAmount] = useState<number>(0);
  const [walletConnected, setWalletConnected] = useState<boolean>(false);
  const [walletType, setWalletType] = useState<string>("");
  const [txId, setTxId] = useState<string>("");

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

    const { psbt, inputArray, amount1, amount2 } = await getGeneratePsbt(data);

    const signResult = await waitingSignPsbt(psbt, inputArray, address);

    // user signed successfully
    if (signResult.success) {
      const data = {
        userSignedHexedPsbt: signResult.data,
        amount1: amount1,
        amount2: amount2,
        inputArray,
        walletType
      }

      const txId = await pushTx(true, data);

      if (txId) {
        toast.success("Rune swap successfully!")
        return setTxId(txId);
      } else {
        return toast.error("Try again later")
      }
    } else {
      const txId = await pushTx(false, "sign psbt failed!");

      toast.error("Try again later");
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
              <div className='flex gap-2'>
                <p>Txid:</p>
                <p>{txId ? txId : ""}</p>
              </div>
            </div>
            <button onClick={handleSubmit}>Submit</button>
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
