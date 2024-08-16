export const waitingSignPsbt = async (psbt: string, inputArray: Array<number>, address: string) => {
    const timeoutPromise = new Promise<void>((resolve) => {
        setTimeout(() => {
            resolve();
        }, 20000); // 20 seconds timeout
    });

    // Race between the async function and timeout
    const result = await Promise.race([signPsbt(psbt, inputArray, address), timeoutPromise]);

    console.log('result :>> ', result);

    if (result) {
        // user signed psbt
        return { success: true, data: result }
    } else {
        //  user not signing psbt within 10s
        return { success: false, data: "User not signed within 10s" }
    }
};

const signPsbt = async (psbt: string, inputArray: Array<number>, address: string) => {
    try {
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
    } catch (error) {
        console.log("error ====> ", error);
    }
}