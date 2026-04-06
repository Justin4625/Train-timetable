'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

type RefreshDataProps = {
    interval?: number;
};

export default function RefreshData({ interval = 60000 }: RefreshDataProps) {
    const router = useRouter();

    useEffect(() => {
        const timer = setInterval(() => {
            router.refresh();
        }, interval);

        return () => clearInterval(timer);
    }, [router, interval]);

    return null;
}