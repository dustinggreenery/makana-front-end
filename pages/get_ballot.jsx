import Head from "next/head";
import Header from "@/components/Header";
import { useMoralis, useWeb3Contract } from "react-moralis";
import { ballotAbi, ballotAddresses } from "@/constants";
import { useEffect, useState } from "react";
import { useNotification } from "web3uikit";

export default function Home() {
    const { chainId: chainIdHex, isWeb3Enabled, account } = useMoralis();
    const chainId = parseInt(chainIdHex);
    const ballotAddress = chainId in ballotAddresses ? ballotAddresses[chainId][0] : null;

    const [userAddress, setUserAddress] = useState("");
    const [votes, setVotes] = useState();

    const dispatch = useNotification();

    const { runContractFunction: getVotes } = useWeb3Contract({
        abi: ballotAbi,
        contractAddress: ballotAddress,
        functionName: "getVotes",
        params: { account: userAddress },
    });

    const { runContractFunction: mintNFT } = useWeb3Contract({
        abi: ballotAbi,
        contractAddress: ballotAddress,
        functionName: "mintNFT",
        params: {},
    });

    const { runContractFunction: delegate } = useWeb3Contract({
        abi: ballotAbi,
        contractAddress: ballotAddress,
        functionName: "delegate",
        params: { delegatee: userAddress },
    });

    async function mint() {
        mintNFT({ onSuccess: handleTransaction });
    }

    async function delegateVote() {
        delegate({ onSuccess: handleTransaction });
    }

    async function update() {
        setVotes((await getVotes()).toString());
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
        <div className="mx-7">
            <Head>
                <title>Makana</title>
                <meta name="description" content="Community Arbitration" />
            </Head>
            <Header />
            {isWeb3Enabled ? (
                <div>
                    {votes == "1" ? (
                        <p className="text-center m-10 text-2xl">You have a ballot!</p>
                    ) : (
                        <div className="flex justify-center">
                            <button
                                className="m-10 px-10 py-5 text-2xl bg-blue-400  rounded-lg active:bg-blue-500"
                                onClick={() => mint()}
                            >
                                Mint a Ballot
                            </button>
                            <button
                                className="m-10 px-10 py-5 text-2xl bg-blue-400  rounded-lg active:bg-blue-500"
                                onClick={() => delegateVote()}
                            >
                                Receive Voting Power
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <p className="text-center m-10 text-3xl">Wallet isn't Connected</p>
            )}
        </div>
    );
}
