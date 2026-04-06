import ArrivalBoard from "@/components/arrivalBoard";
import RefreshData from "@/components/refreshData";
import { getArrivals } from "@/lib/ns-api";
import type { NSArrival, NSMessage } from "@/types/ns";

export const dynamic = "force-static";

export default async function Home() {
    let arrivals: NSArrival[] = [];
    let messages: NSMessage[] = [];
    let error: string | undefined;

    try {
        const data = await getArrivals("RTD");
        arrivals = data?.arrivals || [];
        messages = data?.messages || [];
    } catch (e) {
        error = e instanceof Error ? e.message : "Failed to fetch arrivals";
    }

    return (
        <main className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
            <RefreshData interval={10000} />
            <div className="max-w-4xl mx-auto px-4 py-8">
                <header className="mb-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                        🚆 Live Treintijden
                    </h1>
                    <p className="text-lg text-gray-600 font-medium">
                        Station Rotterdam Centraal
                    </p>
                </header>

                <ArrivalBoard arrivals={arrivals} messages={messages} error={error} />
            </div>
        </main>
    );
}