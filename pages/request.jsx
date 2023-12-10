import Head from "next/head";
import Header from "@/components/Header";
import RequestBox from "@/components/RequestBox";

export default function Home() {
    return (
        <div className="mx-7">
            <Head>
                <title>Makana</title>
                <meta name="description" content="Community Arbitration" />
            </Head>
            <Header />
            <RequestBox />
        </div>
    );
}
