export const waitingSignPsbt = async (psbt: string, address: string, inputArray?: Array<number>) => {
    const timeoutPromise = new Promise<void>((resolve) => {
        setTimeout(() => {
            resolve();
        }, 20000); // 20 seconds timeout
    });

    // Race between the async function and timeout
    const result = await Promise.race([signPsbt(psbt, address, inputArray), timeoutPromise]);

    console.log('result :>> ', result);

    if (result) {
        // user signed psbt
        return { success: true, data: result }
    } else {
        //  user not signing psbt within 20s
        return { success: false, data: "User not signed within 20s" }
    }
};

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const signPsbt = async (psbt: string, address: string, inputArray?: Array<number>) => {
    try {
        const toSignInputs: { index: number; address: string }[] = [];

        let signedPsbt

        if (inputArray) {
            inputArray.map((value: number) =>
                toSignInputs.push({
                    index: value,
                    address: address,
                })
            );

            signedPsbt = await (window as any).unisat.signPsbt(psbt, { autoFinalized: false, toSignInputs: toSignInputs });
        } else {
            signedPsbt = await (window as any).unisat.signPsbt(psbt, { autoFinalized: false });
        }

        return signedPsbt;
    } catch (error) {
        console.log("error ====> ", error);
    }
}