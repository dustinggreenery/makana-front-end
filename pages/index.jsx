import Head from "next/head";
import Header from "@/components/Header";
import { useMoralis, useWeb3Contract } from "react-moralis";
import { eventAbi, eventAddresses } from "@/constants";
import { useEffect, useState } from "react";
import DisplayBoxes from "@/components/DisplayBoxes";

export default function Home() {
    const { chainId: chainIdHex, isWeb3Enabled, account } = useMoralis();
    const chainId = parseInt(chainIdHex);
    const eventAddress = chainId in eventAddresses ? eventAddresses[chainId][0] : null;

    const [userAddress, setUserAddress] = useState("");
    const [nonprofit, setNonprofit] = useState();
    const [eventTitle, setEventTitle] = useState();
    const [governanceToken, setGovernanceToken] = useState();
    const [isNonprofit, setIsNonprofit] = useState();
    const [isSponsor, setIsSponsor] = useState();

    const { runContractFunction: getNonprofit } = useWeb3Contract({
        abi: eventAbi,
        contractAddress: eventAddress,
        functionName: "getNonprofit",
        params: {},
    });

    const { runContractFunction: getEventTitle } = useWeb3Contract({
        abi: eventAbi,
        contractAddress: eventAddress,
        functionName: "getEventTitle",
        params: {},
    });

    const { runContractFunction: getGovernanceToken } = useWeb3Contract({
        abi: eventAbi,
        contractAddress: eventAddress,
        functionName: "getGovernanceToken",
        params: {},
    });

    const { runContractFunction: getIsSponsor } = useWeb3Contract({
        abi: eventAbi,
        contractAddress: eventAddress,
        functionName: "isSponsor",
        params: { sponsor: userAddress },
    });

    async function update() {
        setNonprofit((await getNonprofit()).toString().toLowerCase());
        setEventTitle((await getEventTitle()).toString().toLowerCase());
        setGovernanceToken((await getGovernanceToken()).toString().toLowerCase());
        setIsSponsor((await getIsSponsor()).toString().toLowerCase());
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

    useEffect(() => {
        setIsNonprofit(nonprofit == userAddress);
    }, [nonprofit, userAddress]);

    return (
        <div className="mx-7">
            <Head>
                <title>Makana</title>
                <meta name="description" content="Community Arbitration" />
            </Head>
            <Header />
            <div>
                {isWeb3Enabled ? (
                    <div className="pt-2 px-4">
                        <div className="text-center pb-3">
                            <span className="text-sm">Event: </span>
                            <span className="text-2xl">{eventTitle}</span>
                        </div>
                        <div className="flex justify-center pb-5">
                            <div className="mx-5 px-4 py-3 bg-blue-200 rounded-lg">
                                <p className="text-lg">Nonprofit: </p>
                                <p className="text-base">{nonprofit}</p>
                            </div>
                            <div className="mx-5 px-4 py-3 bg-blue-200 rounded-lg">
                                <p className="text-lg">Governance Token: </p>
                                <p className="text-base">{governanceToken}</p>
                            </div>
                        </div>
                        <DisplayBoxes />
                        {isNonprofit ? (
                            <div className="mt-5 mx-5 px-4 py-3 text-center">
                                <p className="text-lg">You are the nonprofit in this event!</p>
                                <a
                                    className="px-3 bg-blue-400 py-0.5 rounded-lg active:bg-blue-500"
                                    href="/request"
                                >
                                    Request a New Ballot Box
                                </a>
                            </div>
                        ) : (
                            <div></div>
                        )}
                        {isSponsor == "true" ? (
                            <div className="mt-5 mx-5 px-4 py-3 text-center">
                                <p className="text-lg">You are a sponsor in this event!</p>
                                <a
                                    className="px-3 bg-blue-400 py-0.5 rounded-lg active:bg-blue-500"
                                    href="/confirm"
                                >
                                    View your Ballot Box
                                </a>
                            </div>
                        ) : (
                            <div></div>
                        )}
                        {!isNonprofit && isSponsor == "false" ? (
                            <div className="text-center mt-10">
                                <a
                                    className=" px-10 py-5 text-xl bg-blue-400  rounded-lg active:bg-blue-500"
                                    href="/vote"
                                >
                                    Viewing/Voting Page
                                </a>
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
