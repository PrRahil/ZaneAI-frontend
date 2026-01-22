"use client";

import CookieConsent from "react-cookie-consent";

export function CookieConsentComponent() {
    return (
        <CookieConsent
            location="bottom"
            buttonText="Accept All"
            declineButtonText="Reject All"
            enableDeclineButton
            cookieName="cookie_consent"
            style={{
                background: "hsl(var(--card))",
                color: "hsl(var(--card-foreground))",
                borderTop: "1px solid hsl(var(--border))",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "1rem",
                boxShadow: "0 -4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
            buttonStyle={{
                background: "hsl(var(--primary))",
                color: "hsl(var(--primary-foreground))",
                fontSize: "14px",
                borderRadius: "calc(var(--radius) - 2px)",
                padding: "8px 16px",
                fontWeight: 500,
                margin: "0 8px 0 0",
            }}
            declineButtonStyle={{
                background: "transparent",
                color: "hsl(var(--muted-foreground))",
                fontSize: "14px",
                border: "1px solid hsl(var(--border))",
                borderRadius: "calc(var(--radius) - 2px)",
                padding: "8px 16px",
                fontWeight: 500,
                margin: "0",
            }}
            onAccept={() => {
                if (typeof window !== "undefined") {
                    window.dispatchEvent(new Event("cookie_consent_updated"));
                }
            }}
            onDecline={() => {
                console.log("Cookies declined");
            }}
            expires={150}
        >
            <div className="flex flex-col gap-1">
                <span className="font-semibold flex items-center gap-2">
                    We respect your privacy
                </span>
                <span className="text-sm text-muted-foreground">
                    We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic.
                </span>
            </div>
        </CookieConsent>
    );
}

export { CookieConsentComponent as CookieConsent };
