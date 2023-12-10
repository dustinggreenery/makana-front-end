import Head from "next/head";
import Header from "@/components/Header";
import { useMoralis, useWeb3Contract } from "react-moralis";
import { boxAbi, eventAbi, eventAddresses, results, states } from "@/constants";
import { useEffect, useState } from "react";
import { useNotification } from "web3uikit";

export default function Home() {
    const { chainId: chainIdHex, isWeb3Enabled, account } = useMoralis();
    const chainId = parseInt(chainIdHex);
    const eventAddress = chainId in eventAddresses ? eventAddresses[chainId][0] : null;

    const [userAddress, setUserAddress] = useState("");

    const [sponsor, setSponsor] = useState("0x");
    const [isSponsor, setIsSponsor] = useState();

    const [description, setDescription] = useState();
    const [startTime, setStartTime] = useState();
    const [timeToVote, setTimeToVote] = useState();
    const [confirmed, setConfirmed] = useState();

    const [bbAddress, setBbAddress] = useState("0x");

    const [state, setState] = useState(-1);
    const [time, setTime] = useState();

    const [support, setSupport] = useState("s");
    const [hasVoted, setHasVoted] = useState();

    const [result, setResult] = useState();
    const [ballotsFor, setBallotsFor] = useState();
    const [ballotsAgainst, setBallotsAgainst] = useState();

    const dispatch = useNotification();

    const changeSponsor = (event) => {
        setSponsor(event.target.value);
    };

    const changeSupport = (event) => {
        setSupport(event.target.value);
    };

    const { runContractFunction: getIsSponsor } = useWeb3Contract({
        abi: eventAbi,
        contractAddress: eventAddress,
        functionName: "isSponsor",
        params: {
            sponsor: sponsor,
        },
    });

    const { runContractFunction: getDescription } = useWeb3Contract({
        abi: eventAbi,
        contractAddress: eventAddress,
        functionName: "getBallotBoxDescription",
        params: {
            sponsor: sponsor,
        },
    });

    const { runContractFunction: getStartTime } = useWeb3Contract({
        abi: eventAbi,
        contractAddress: eventAddress,
        functionName: "getBallotBoxStartTime",
        params: {
            sponsor: sponsor,
        },
    });

    const { runContractFunction: getTimeToVote } = useWeb3Contract({
        abi: eventAbi,
        contractAddress: eventAddress,
        functionName: "getBallotBoxTimeToVote",
        params: {
            sponsor: sponsor,
        },
    });

    const { runContractFunction: getConfirmed } = useWeb3Contract({
        abi: eventAbi,
        contractAddress: eventAddress,
        functionName: "ballotBoxConfirmed",
        params: {
            sponsor: sponsor,
        },
    });

    const { runContractFunction: getBbAddress } = useWeb3Contract({
        abi: eventAbi,
        contractAddress: eventAddress,
        functionName: "getBallotBox",
        params: {
            sponsor: sponsor,
        },
    });

    const { runContractFunction: getState } = useWeb3Contract({
        abi: boxAbi,
        contractAddress: bbAddress,
        functionName: "getState",
        params: {},
    });

    const { runContractFunction: clock } = useWeb3Contract({
        abi: boxAbi,
        contractAddress: bbAddress,
        functionName: "clock",
        params: {},
    });

    const { runContractFunction: getHasVoted } = useWeb3Contract({
        abi: boxAbi,
        contractAddress: bbAddress,
        functionName: "addressHasVoted",
        params: { voter: userAddress },
    });

    const { runContractFunction: getResult } = useWeb3Contract({
        abi: boxAbi,
        contractAddress: bbAddress,
        functionName: "getResult",
        params: {},
    });

    const { runContractFunction: getBallotsFor } = useWeb3Contract({
        abi: boxAbi,
        contractAddress: bbAddress,
        functionName: "getBallotsFor",
        params: {},
    });

    const { runContractFunction: getBallotsAgainst } = useWeb3Contract({
        abi: boxAbi,
        contractAddress: bbAddress,
        functionName: "getBallotsAgainst",
        params: {},
    });

    const { runContractFunction: vote } = useWeb3Contract({
        abi: boxAbi,
        contractAddress: bbAddress,
        functionName: "vote",
        params: { support: support },
    });

    const { runContractFunction: performUpkeep, error } = useWeb3Contract({
        abi: boxAbi,
        contractAddress: bbAddress,
        functionName: "performUpkeep",
        params: { performData: "0x00" },
    });

    useEffect(() => {
        console.log(error);
    }, [error]);

    async function enterSponsor() {
        setIsSponsor((await getIsSponsor()).toString().toLowerCase() == "true");
    }

    async function updateVoteBox() {
        setDescription((await getDescription()).toString().toLowerCase());
        setStartTime((await getStartTime()).toString().toLowerCase());
        setTimeToVote((await getTimeToVote()).toString().toLowerCase());
        setConfirmed((await getConfirmed()).toString().toLowerCase() == "true");
    }

    async function updateAddress() {
        setBbAddress((await getBbAddress()).toString().toLowerCase());
    }

    async function updateState() {
        setState(parseInt((await getState()).toString()));
        setTime(parseInt((await clock()).toString()));
    }

    async function updateBallotBox() {
        if (state == 1) {
            setHasVoted((await getHasVoted()).toString());
        } else if (state == 2) {
            setResult(parseInt((await getResult()).toString()));
            setBallotsFor(parseInt((await getBallotsFor()).toString()));
            setBallotsAgainst(parseInt((await getBallotsAgainst()).toString()));
        }
    }

    async function voteFunc() {
        if (support == "y") {
            setSupport(true);
        } else if (support == "n") {
            setSupport(false);
        }
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            setUserAddress(account);
        }
    }, [isWeb3Enabled]);

    useEffect(() => {
        if (isSponsor) {
            updateVoteBox();
        }
    }, [isSponsor]);

    useEffect(() => {
        if (confirmed) {
            updateAddress();
        }
    }, [confirmed]);

    useEffect(() => {
        if (bbAddress != "0x") {
            updateState();
        }
    }, [bbAddress]);

    useEffect(() => {
        if (state != -1) {
            updateBallotBox();
        }
    }, [state]);

    useEffect(() => {
        if (support == true || support == false) {
            vote({ onSuccess: handleTransaction });
        }
    }, [support]);

    const handleTransaction = async function (tx) {
        await tx.wait(1);
        handleNewNotification(tx);
        updateBallotBox();
    };

    const handleUpkeep = async function (tx) {
        await tx.wait(1);
        handleNewNotification(tx);
        updateState();
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
        <div className="mx-7">
            <Head>
                <title>Makana</title>
                <meta name="description" content="Community Arbitration" />
            </Head>
            <Header />
            <div>
                {isWeb3Enabled ? (
                    <div>
                        <div className="text-center p-4 pb-1">
                            <label className="text-lg">Ballot Box's Sponsor's Address: </label>
                            <input
                                className="text-lg w-96 p-0.5 px-1 border-2 rounded-lg border-slate-600"
                                onChange={changeSponsor}
                            />
                        </div>
                        <div className="text-center">
                            <button
                                className="text-lg px-5 py-1 my-1.5 bg-blue-400 rounded-lg active:bg-blue-500"
                                onClick={() => enterSponsor()}
                            >
                                Enter
                            </button>
                        </div>
                        {isSponsor ? (
                            <div>
                                <div className="flex justify-center p-3">
                                    <div className="mx-7 px-6 py-4 bg-blue-200 rounded-lg">
                                        <p className="text-lg font-semibold">Description:</p>
                                        <p>{description}</p>
                                    </div>
                                    <div className="mx-7 px-6 py-4 bg-blue-200 rounded-lg">
                                        <p className="text-lg font-semibold">Starting Time: </p>
                                        <p>{startTime}</p>
                                    </div>
                                    <div className="mx-7 px-6 py-4 bg-blue-200 rounded-lg">
                                        <p className="text-lg font-semibold">Time to Vote: </p>
                                        <p>{timeToVote}</p>
                                    </div>
                                </div>
                                {confirmed ? (
                                    <div>
                                        <div className="flex justify-center p-3">
                                            <div className="mx-7 px-6 py-4 bg-blue-200 rounded-lg">
                                                <p className="text-lg font-semibold">
                                                    Ballot Box Address:
                                                </p>
                                                <p>{bbAddress}</p>
                                            </div>
                                            <div className="mx-7 px-6 py-4 bg-blue-200 rounded-lg">
                                                <p className="text-lg font-semibold">State: </p>
                                                <p>{states[state]}</p>
                                            </div>
                                            <div className="mx-7 px-6 py-4 bg-blue-200 rounded-lg">
                                                <p className="text-lg font-semibold">
                                                    Current Time:
                                                </p>
                                                <p>{time}</p>
                                            </div>
                                        </div>
                                        {state == 1 && hasVoted == "false" ? (
                                            <div className="flex justify-center my-4">
                                                <div className="mx-7 px-6 py-4 bg-blue-200 rounded-lg">
                                                    <p className="text-lg font-semibold text-center">
                                                        Vote for Ballot Box
                                                    </p>
                                                    <label>Support (y/n): </label>
                                                    <input
                                                        className="w-10 mr-2"
                                                        onChange={changeSupport}
                                                    />
                                                    <button
                                                        className="mx-2 px-3 bg-blue-400 py-0.5 rounded-lg active:bg-blue-500"
                                                        onClick={() => voteFunc()}
                                                    >
                                                        Vote
                                                    </button>
                                                </div>
                                            </div>
                                        ) : state == 1 && hasVoted == "true" ? (
                                            <div className="flex justify-center my-4">
                                                <div className="mx-7 px-6 py-4 bg-blue-200 rounded-lg text-lg font-semibold text-center">
                                                    You have voted for this ballot box!
                                                </div>
                                            </div>
                                        ) : state == 2 ? (
                                            <div className="flex justify-center p-3">
                                                <div className="mx-7 px-6 py-4 bg-blue-200 rounded-lg">
                                                    <p className="text-lg font-semibold">Result:</p>
                                                    <p>{results[result]}</p>
                                                </div>
                                                <div className="mx-7 px-6 py-4 bg-blue-200 rounded-lg">
                                                    <p className="text-lg font-semibold">
                                                        Ballots For:
                                                    </p>
                                                    <p>{ballotsFor}</p>
                                                </div>
                                                <div className="mx-7 px-6 py-4 bg-blue-200 rounded-lg">
                                                    <p className="text-lg font-semibold">
                                                        Ballots Against:
                                                    </p>
                                                    <p>{ballotsAgainst}</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div></div>
                                        )}
                                        {chainId == 1442 || chainId == 31337 ? (
                                            <div className="text-center m-3">
                                                <p className="text-lg font-semibold">
                                                    Chainlink Automation doesn't support this chain.
                                                </p>
                                                <button
                                                    className="text-lg px-5 py-1 my-1.5 bg-blue-400 rounded-lg active:bg-blue-500"
                                                    onClick={() =>
                                                        performUpkeep({
                                                            onSuccess: handleUpkeep,
                                                        })
                                                    }
                                                >
                                                    Perform Upkeep
                                                </button>
                                            </div>
                                        ) : (
                                            <div></div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center m-3 text-lg font-semibold">
                                        This Sponsor has not Accepted the Ballot Box
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div></div>
                        )}
                    </div>
                ) : (
                    <p className="text-center m-10 text-3xl">Wallet isn't Connected</p>
                )}
            </div>
        </div>
    );
}
