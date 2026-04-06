'use client';

import { useEffect, useMemo, useState } from "react";
import type { NSArrival, NSMessage } from "@/types/ns";

const DUTCH_TIMEZONE = "Europe/Amsterdam";
const STALE_GRACE_MINUTES = 5;
const LIVE_TICK_MS = 10_000;

type ArrivalBoardProps = {
    arrivals: NSArrival[];
    messages?: NSMessage[];
    error?: string;
};

function formatDutchTime(date: Date): string {
    return date.toLocaleTimeString("nl-NL", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: DUTCH_TIMEZONE,
    });
}

function getArrivalReferenceTime(arrival: NSArrival): Date | null {
    const referenceTime = new Date(arrival.actualDateTime || arrival.plannedDateTime);

    return Number.isNaN(referenceTime.getTime()) ? null : referenceTime;
}

function isVisibleArrival(arrival: NSArrival, now: Date): boolean {
    const referenceTime = getArrivalReferenceTime(arrival);

    if (!referenceTime) {
        return true;
    }

    return referenceTime.getTime() >= now.getTime() - STALE_GRACE_MINUTES * 60_000;
}

function getMessageTone(msg: NSMessage) {
    if (msg.type === "DISRUPTION" || msg.severity === "HIGH") {
        return {
            bgColor: "bg-red-50",
            borderColor: "border-red-500",
            textColor: "text-red-700",
            icon: "🚨",
        };
    }

    if (msg.type === "CAUTION" || msg.severity === "MEDIUM") {
        return {
            bgColor: "bg-orange-50",
            borderColor: "border-orange-500",
            textColor: "text-orange-700",
            icon: "⚠️",
        };
    }

    return {
        bgColor: "bg-blue-50",
        borderColor: "border-blue-500",
        textColor: "text-blue-700",
        icon: "ℹ️",
    };
}

function getTrainMessageTone(msg: NSMessage) {
    if (msg.type === "DISRUPTION" || msg.severity === "HIGH") {
        return {
            bgColor: "bg-red-100",
            textColor: "text-red-700",
            icon: "🚨",
        };
    }

    if (msg.type === "CAUTION" || msg.severity === "MEDIUM") {
        return {
            bgColor: "bg-orange-100",
            textColor: "text-orange-700",
            icon: "⚠️",
        };
    }

    return {
        bgColor: "bg-blue-100",
        textColor: "text-blue-700",
        icon: "ℹ️",
    };
}

export default function ArrivalBoard({ arrivals, messages, error }: ArrivalBoardProps) {
    const [now, setNow] = useState<Date | null>(null);

    useEffect(() => {
        const updateNow = () => setNow(new Date());

        updateNow();
        const timer = setInterval(updateNow, LIVE_TICK_MS);

        return () => clearInterval(timer);
    }, []);

    const visibleArrivals = useMemo(() => {
        if (!now) {
            return arrivals;
        }

        return arrivals.filter((arrival) => isVisibleArrival(arrival, now));
    }, [arrivals, now]);

    const hiddenCount = arrivals.length - visibleArrivals.length;

    return (
        <>
            {error && (
                <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-lg shadow-md">
                    <div className="flex items-center">
                        <span className="text-xl mr-2">⚠️</span>
                        <span className="font-semibold">Error: {error}</span>
                    </div>
                </div>
            )}

            {messages && messages.length > 0 && (
                <div className="mb-6 space-y-2">
                    {messages.map((msg, index) => {
                        const tone = getMessageTone(msg);

                        return (
                            <div key={index} className={`p-4 ${tone.bgColor} border-l-4 ${tone.borderColor} ${tone.textColor} rounded-lg shadow-md`}>
                                <div className="flex items-start">
                                    <span className="text-xl mr-2 shrink-0">{tone.icon}</span>
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
                ) : visibleArrivals.length === 0 && hiddenCount > 0 ? (
                    <div className="p-8 text-center text-gray-500 bg-white rounded-lg shadow-md">
                        <div className="text-4xl mb-2">🕒</div>
                        <p className="text-lg">Alle zichtbare aankomsttijden zijn inmiddels voorbij</p>
                        <p className="mt-2 text-sm text-gray-400">
                            Verlopen ritten worden automatisch verborgen zodra de geplande of werkelijke tijd is gepasseerd.
                        </p>
                    </div>
                ) : (
                    visibleArrivals.map((train, index) => {
                        const plannedTime = new Date(train.plannedDateTime);
                        const actualTime = new Date(train.actualDateTime || train.plannedDateTime);
                        const displayTime = Number.isNaN(actualTime.getTime()) ? plannedTime : actualTime;
                        const plannedValid = !Number.isNaN(plannedTime.getTime());
                        const actualValid = !Number.isNaN(actualTime.getTime());
                        const delayMinutes = plannedValid && actualValid
                            ? Math.max(0, Math.round((actualTime.getTime() - plannedTime.getTime()) / 60000))
                            : 0;

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
                                                const tone = getTrainMessageTone(msg);

                                                return (
                                                    <div key={msgIndex} className={`p-2 ${tone.bgColor} ${tone.textColor} rounded text-xs`}>
                                                        <div className="flex items-start gap-2">
                                                            <span className="shrink-0">{tone.icon}</span>
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
                                        {formatDutchTime(displayTime)}
                                    </div>
                                    {!train.cancelled && delayMinutes > 0 && (
                                        <div className="text-sm text-gray-500 mt-1">
                                            <span className="line-through">
                                                {formatDutchTime(plannedTime)}
                                            </span>
                                        </div>
                                    )}
                                    {!train.cancelled && delayMinutes === 0 && (
                                        <div className="text-xs text-gray-400 mt-1">
                                            Gepland: {formatDutchTime(plannedTime)}
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
        </>
    );
}
