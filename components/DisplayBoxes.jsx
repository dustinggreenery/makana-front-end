import { eventAbi, eventAddresses } from "@/constants";
import { useEffect, useState } from "react";
import { useMoralis, useWeb3Contract } from "react-moralis";

export default function DisplayBoxes() {
    const { chainId: chainIdHex, isWeb3Enabled } = useMoralis();
    const chainId = parseInt(chainIdHex);
    const eventAddress = chainId in eventAddresses ? eventAddresses[chainId][0] : null;

    const [numSponsors, setNumSponsors] = useState(0);
    const [index, setIndex] = useState(-1);
    const [sponsor, setSponsor] = useState("0x..");

    const changeIndex = (event) => {
        setIndex(event.target.value);
    };

    const { runContractFunction: getNumSponsors } = useWeb3Contract({
        abi: eventAbi,
        contractAddress: eventAddress,
        functionName: "getNumSponsors",
        params: {},
    });

    const { runContractFunction: getSponsor } = useWeb3Contract({
        abi: eventAbi,
        contractAddress: eventAddress,
        functionName: "getSponsor",
        params: { index: index },
    });

    async function update() {
        const numSponsorsFromCall = (await getNumSponsors()).toString();
        setNumSponsors(parseInt(numSponsorsFromCall));
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            update();
        }
    }, [isWeb3Enabled]);

    return (
        <div className="flex justify-center">
            <div className="mx-5 px-4 py-3 bg-blue-200 rounded-lg">
                <p className="pb-2">
                    There are {numSponsors} sponsors with ballot boxes in this event.
                </p>
                <div className="text-center">
                    <label>Get Sponsor Address: </label>
                    <input onChange={changeIndex} className="w-10" />
                    <button
                        onClick={async () => setSponsor((await getSponsor()).toString())}
                        className="mx-2 px-3 bg-blue-400 py-0.5 rounded-lg active:bg-blue-500"
                    >
                        Get
                    </button>
                    <p className="text-center">{sponsor}</p>
                </div>
            </div>
        </div>
    );
}
