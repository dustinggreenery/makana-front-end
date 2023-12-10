import { useEffect, useState } from "react";
import { eventAbi, eventAddresses } from "../constants";
import { useMoralis, useWeb3Contract } from "react-moralis";
import { useNotification } from "web3uikit";

export default function ConfirmBox() {
    const { chainId: chainIdHex, isWeb3Enabled, account } = useMoralis();
    const chainId = parseInt(chainIdHex);
    const eventAddress = chainId in eventAddresses ? eventAddresses[chainId][0] : null;

    const [userAddress, setUserAddress] = useState("");
    const [description, setDescription] = useState();
    const [startTime, setStartTime] = useState();
    const [timeToVote, setTimeToVote] = useState();
    const [boxConfirmed, setBoxConfirmed] = useState();

    const dispatch = useNotification();

    const { runContractFunction: getDescription } = useWeb3Contract({
        abi: eventAbi,
        contractAddress: eventAddress,
        functionName: "getBallotBoxDescription",
        params: { sponsor: userAddress },
    });

    const { runContractFunction: getStartTime } = useWeb3Contract({
        abi: eventAbi,
        contractAddress: eventAddress,
        functionName: "getBallotBoxStartTime",
        params: { sponsor: userAddress },
    });

    const { runContractFunction: getTimeToVote } = useWeb3Contract({
        abi: eventAbi,
        contractAddress: eventAddress,
        functionName: "getBallotBoxTimeToVote",
        params: { sponsor: userAddress },
    });

    const { runContractFunction: getBoxConfirmed } = useWeb3Contract({
        abi: eventAbi,
        contractAddress: eventAddress,
        functionName: "ballotBoxConfirmed",
        params: { sponsor: userAddress },
    });

    const { runContractFunction: confirmBox } = useWeb3Contract({
        abi: eventAbi,
        contractAddress: eventAddress,
        functionName: "confirmVoteBox()",
        params: { sponsor: userAddress },
        msgValue: 0,
    });

    async function update() {
        setDescription((await getDescription()).toString().toLowerCase());
        setStartTime((await getStartTime()).toString().toLowerCase());
        setTimeToVote((await getTimeToVote()).toString().toLowerCase());
        setBoxConfirmed((await getBoxConfirmed()).toString().toLowerCase());
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            setUserAddress(account);
        }
    }, [isWeb3Enabled]);

    useEffect(() => {
        if (userAddress != "") {
            update();
        }
    }, [userAddress]);

    const handleTransaction = async function (tx) {
        await tx.wait(1);
        handleNewNotification(tx);
        update();
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
                    <p className="text-2xl m-3">Your Ballot Box Information:</p>
                    <div>
                        <p className="m-0.5">Description: {description}</p>
                        <p className="m-0.5">Voting Period Start Time: {startTime}</p>
                        <p className="m-0.5">Voting Period Time: {timeToVote}</p>

                        {boxConfirmed == "false" ? (
                            <div>
                                <span className="text-lg">This is a requested ballot box. </span>
                                <button
                                    className="px-3 bg-blue-400 py-0.5 rounded-lg active:bg-blue-500"
                                    onClick={() => confirmBox({ onSuccess: handleTransaction })}
                                >
                                    Accept?
                                </button>
                            </div>
                        ) : (
                            <div>
                                <a
                                    className="px-3 bg-blue-400 py-0.5 rounded-lg active:bg-blue-500"
                                    href="/vote"
                                >
                                    View Ballot Box Status
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <p className="text-center m-10 text-3xl">Wallet isn't Connected</p>
            )}
        </div>
    );
}
