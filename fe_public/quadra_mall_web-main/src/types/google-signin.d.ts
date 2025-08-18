declare global {
    interface Window {
        google: {
            accounts: {
                id: {
                    initialize: (params: { client_id: string; callback: (response: any) => void }) => void;
                    renderButton: (element: HTMLElement, options: { theme: string; size: string }) => void;
                    prompt: () => void;
                };
            };
        };
    }
}

export {};