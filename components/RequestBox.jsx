import { useState } from "react";
import { eventAbi, eventAddresses } from "../constants";
import { useMoralis, useWeb3Contract } from "react-moralis";
import { useNotification } from "web3uikit";

export default function RequestBox() {
    const { chainId: chainIdHex, isWeb3Enabled } = useMoralis();
    const chainId = parseInt(chainIdHex);
    const eventAddress = chainId in eventAddresses ? eventAddresses[chainId][0] : null;

    const [sponsorAddress, setSponsorAddress] = useState();
    const [description, setDescription] = useState();
    const [timeTillStart, setTimeTillStart] = useState();
    const [timeToVote, setTimeToVote] = useState();

    const dispatch = useNotification();

    const changeSponsorAddress = (event) => {
        setSponsorAddress(event.target.value);
    };

    const changeDescription = (event) => {
        setDescription(event.target.value);
    };

    const changeTimeTillStart = (event) => {
        setTimeTillStart(event.target.value);
    };

    const changeTimeToVote = (event) => {
        setTimeToVote(event.target.value);
    };

    const { runContractFunction: requestBox } = useWeb3Contract({
        abi: eventAbi,
        contractAddress: eventAddress,
        functionName: "requestVoteBox",
        params: {
            sponsor: sponsorAddress,
            description: description,
            timeTillStart: timeTillStart,
            timeToVote: timeToVote,
        },
        msgValue: 0,
    });

    const handleCreateContract = async function (tx) {
        await tx.wait(1);
        handleNewNotification(tx);
    };

    const handleNewNotification = function () {
        dispatch({
            type: "info",
            message: "Transaction Complete!",
            title: "Tx Notification",
            position: "topR",
            icon: "e",
        });
    };

    return (
        <div>
            {isWeb3Enabled ? (
                <div className="text-center mt-10">
                    <p className="text-2xl m-3">Request a Vote:</p>
                    <div>
                        <div className="m-1">
                            <label>Sponsor Address: </label>
                            <input
                                className="border-2 rounded-lg border-slate-600"
                                onChange={changeSponsorAddress}
                            />
                        </div>
                        <div className="m-1">
                            <label>Description: </label>
                            <input
                                className="border-2 rounded-lg border-slate-600"
                                onChange={changeDescription}
                            />
                        </div>
                        <div className="m-1">
                            <label>Time Until Vote Begins: </label>
                            <input
                                className="border-2 rounded-lg border-slate-600"
                                onChange={changeTimeTillStart}
                            />
                        </div>
                        <div className="m-1">
                            <label>Amount of Time to Vote: </label>
                            <input
                                className="border-2 rounded-lg border-slate-600"
                                onChange={changeTimeToVote}
                            />
                        </div>
                    </div>
                    <button
                        className="p-1 m-2 w-20 bg-blue-400 rounded-lg active:bg-blue-500"
                        onClick={() => requestBox({ onSuccess: handleCreateContract })}
                    >
                        Request
                    </button>
                </div>
            ) : (
                <p className="text-center m-10 text-3xl">Wallet isn't Connected</p>
            )}
        </div>
    );
}
