import {getArrivals} from "@/lib/ns-api";
import {NSArrival} from "@/types/ns";
import RefreshData from "@/components/refreshData";

export default async function Home() {
    let arrivals: NSArrival[];
    let error;
    let data;

    try {
        data = await getArrivals("RTD");
        arrivals = data?.arrivals || [];
    } catch (e) {
        error = e instanceof Error ? e.message : 'Failed to fetch arrivals';
        arrivals = [];
    }

    return (
        <main className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
            <RefreshData interval={3000} />
            <div className="max-w-4xl mx-auto px-4 py-8">
                <header className="mb-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                        🚆 Live Treintijden
                    </h1>
                    <p className="text-lg text-gray-600 font-medium">
                        Station Rotterdam Centraal
                    </p>
                </header>

                {error && (
                    <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-lg shadow-md">
                        <div className="flex items-center">
                            <span className="text-xl mr-2">⚠️</span>
                            <span className="font-semibold">Error: {error}</span>
                        </div>
                    </div>
                )}

                {data?.messages && data.messages.length > 0 && (
                    <div className="mb-6 space-y-2">
                        {data.messages.map((msg, index) => {
                            let bgColor, borderColor, textColor, icon;

                            if (msg.type === 'DISRUPTION' || msg.severity === 'HIGH') {
                                bgColor = 'bg-red-50';
                                borderColor = 'border-red-500';
                                textColor = 'text-red-700';
                                icon = '🚨';
                            } else if (msg.type === 'CAUTION' || msg.severity === 'MEDIUM') {
                                bgColor = 'bg-orange-50';
                                borderColor = 'border-orange-500';
                                textColor = 'text-orange-700';
                                icon = '⚠️';
                            } else {
                                bgColor = 'bg-blue-50';
                                borderColor = 'border-blue-500';
                                textColor = 'text-blue-700';
                                icon = 'ℹ️';
                            }

                            return (
                                <div key={index} className={`p-4 ${bgColor} border-l-4 ${borderColor} ${textColor} rounded-lg shadow-md`}>
                                    <div className="flex items-start">
                                        <span className="text-xl mr-2 shrink-0">{icon}</span>
                                        <span className="font-medium">{msg.message}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="space-y-3">
                    {arrivals.length === 0 && !error ? (
                        <div className="p-8 text-center text-gray-500 bg-white rounded-lg shadow-md">
                            <div className="text-4xl mb-2">🔍</div>
                            <p className="text-lg">Geen treinen gevonden</p>
                        </div>
                    ) : (
                        arrivals.map((train, index) => {
                            const plannedTime = new Date(train.plannedDateTime);
                            const actualTime = new Date(train.actualDateTime);
                            const delayMinutes = Math.round((actualTime.getTime() - plannedTime.getTime()) / 60000);

                            return (
                                <div
                                    key={index}
                                    className={`p-5 border-l-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 flex justify-between items-center ${
                                        train.cancelled 
                                            ? 'border-red-500 bg-red-50' 
                                            : 'border-blue-600 bg-white'
                                    }`}
                                >
                                    <div className="flex-1">
                                        <div className="text-lg font-semibold text-gray-900 mb-1">
                                            {train.name} <span className="text-gray-600 font-normal text-base">uit {train.origin}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-700 flex-wrap">
                                            {train.plannedTrack && train.actualTrack && train.plannedTrack !== train.actualTrack ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-200 text-orange-800">
                                                    🔄 Spoor <span className="line-through mr-1">{train.plannedTrack}</span>→ {train.actualTrack}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-800">
                                                    Spoor {train.actualTrack}
                                                </span>
                                            )}

                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {train.trainCategory}
                                            </span>
                                            {delayMinutes > 0 && !train.cancelled && (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                                    ⏱️ +{delayMinutes} min
                                                </span>
                                            )}
                                            {delayMinutes === 0 && !train.cancelled && (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    ✓ Op tijd
                                                </span>
                                            )}
                                        </div>
                                        {train.messages && train.messages.length > 0 && (
                                            <div className="mt-3 space-y-2">
                                                {train.messages.map((msg, msgIndex) => {
                                                    let msgBgColor, msgTextColor, msgIcon;

                                                    if (msg.type === 'DISRUPTION' || msg.severity === 'HIGH') {
                                                        msgBgColor = 'bg-red-100';
                                                        msgTextColor = 'text-red-700';
                                                        msgIcon = '🚨';
                                                    } else if (msg.type === 'CAUTION' || msg.severity === 'MEDIUM') {
                                                        msgBgColor = 'bg-orange-100';
                                                        msgTextColor = 'text-orange-700';
                                                        msgIcon = '⚠️';
                                                    } else {
                                                        msgBgColor = 'bg-blue-100';
                                                        msgTextColor = 'text-blue-700';
                                                        msgIcon = 'ℹ️';
                                                    }

                                                    return (
                                                        <div key={msgIndex} className={`p-2 ${msgBgColor} ${msgTextColor} rounded text-xs`}>
                                                            <div className="flex items-start gap-2">
                                                                <span className="shrink-0">{msgIcon}</span>
                                                                <span>{msg.message}</span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-right ml-4">
                                        <div className={`font-mono text-2xl md:text-3xl font-bold ${
                                            train.cancelled ? 'line-through text-red-500' : 'text-blue-600'
                                        }`}>
                                            {actualTime.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                        {!train.cancelled && delayMinutes > 0 && (
                                            <div className="text-sm text-gray-500 mt-1">
                                                <span className="line-through">
                                                    {plannedTime.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        )}
                                        {!train.cancelled && delayMinutes === 0 && (
                                            <div className="text-xs text-gray-400 mt-1">
                                                Gepland: {plannedTime.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        )}
                                        {train.cancelled && (
                                            <span className="inline-block mt-1 text-xs font-bold text-red-600 uppercase bg-red-200 px-2 py-1 rounded">
                                                Vervallen
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </main>
    );
}