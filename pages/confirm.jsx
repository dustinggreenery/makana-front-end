import Head from "next/head";
import Header from "@/components/Header";
import ConfirmBox from "@/components/ConfirmBox";

export default function Home() {
    return (
        <div className="mx-7">
            <Head>
                <title>Makana</title>
                <meta name="description" content="Community Arbitration" />
            </Head>
            <Header />
            <ConfirmBox />
        </div>
    );
}
