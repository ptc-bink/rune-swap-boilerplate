export const waitingSignPsbt = async (psbt: string, inputArray: Array<number>, address: string) => {
    const timeoutPromise = new Promise<void>((resolve) => {
        setTimeout(() => {
            resolve();
        }, 1000000); // 10 seconds timeout
    });

    // Race between the async function and timeout
    const result = await Promise.race([signPsbt(psbt, inputArray, address), timeoutPromise]);

    if (result === undefined) {
        //  user not signing psbt within 10s
        return { success: false, data: "User not signed within 10s" }
    } else {
        // user signed psbt
        return { success: true, data: result }
    }
};

const signPsbt = async (psbt: string, inputArray: Array<number>, address: string) => {
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