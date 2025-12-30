import { useState, useEffect } from 'react';

declare global {
    interface Window {
        fbAsyncInit: () => void;
        FB: any;
    }
}

interface FacebookSDKProps {
    appId: string;
    version?: string;
}

export function useFacebookSDK({ appId, version = 'v18.0' }: FacebookSDKProps) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!appId) return;

        // Check if script is already present
        if (document.getElementById('facebook-jssdk')) {
            setIsLoaded(true);
            return;
        }

        // Initialize callback
        window.fbAsyncInit = function () {
            window.FB.init({
                appId: appId,
                cookie: true,
                xfbml: true,
                version: version
            });
            setIsLoaded(true);
        };

        // Load SDK logic
        try {
            (function (d, s, id) {
                var js, fjs = d.getElementsByTagName(s)[0];
                if (d.getElementById(id)) { return; }
                js = d.createElement(s) as HTMLScriptElement; js.id = id;
                js.src = "https://connect.facebook.net/en_US/sdk.js";
                fjs.parentNode?.insertBefore(js, fjs);
            }(document, 'script', 'facebook-jssdk'));
        } catch (err: any) {
            setError(err);
        }
    }, [appId, version]);

    const login = (options: { scope: string; return_scopes?: boolean }) => {
        return new Promise<any>((resolve, reject) => {
            if (!window.FB) {
                reject(new Error('Facebook SDK not loaded'));
                return;
            }
            window.FB.login(function (response: any) {
                if (response.authResponse) {
                    resolve(response.authResponse);
                } else {
                    reject(new Error('User cancelled login or did not fully authorize.'));
                }
            }, options);
        });
    };

    const getLoginStatus = () => {
        return new Promise<any>((resolve, reject) => {
            if (!window.FB) {
                reject(new Error('Facebook SDK not loaded'));
                return;
            }
            window.FB.getLoginStatus(function (response: any) {
                resolve(response);
            });
        });
    };

    const api = (path: string, method: string = 'GET', params: any = {}) => {
        return new Promise<any>((resolve, reject) => {
            if (!window.FB) {
                reject(new Error('Facebook SDK not loaded'));
                return;
            }
            window.FB.api(path, method, params, function (response: any) {
                if (!response || response.error) {
                    reject(response ? response.error : new Error('API Error'));
                } else {
                    resolve(response);
                }
            });
        });
    };

    return { isLoaded, error, login, getLoginStatus, api };
}
