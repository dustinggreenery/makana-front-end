import { ConnectButton } from "web3uikit";

export default function Header() {
    return (
        <div className="p-2 mb-2 flex flex-row content-center border-b-2  ">
            <h1 className="py-2.5 px-6 text-center text-2xl">
                <a href="/">Makana</a>
            </h1>
            <div className="py-1 px-6 ml-auto">
                <ConnectButton moralisAuth={false} />
            </div>
        </div>
    );
}
