import { useEffect, useRef, useState } from "react";
import { P, F } from "../theme";

const RESET_MS = 2000;

function ShareIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function ShareButton({ title, url, variant = "default", headerTone = "dark" }) {
  const [status, setStatus] = useState("idle");
  const timerRef = useRef(null);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const scheduleReset = (next) => {
    setStatus(next);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setStatus("idle"), RESET_MS);
  };

  const copyToClipboard = async (shareUrl) => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      scheduleReset("copied");
    } catch {
      scheduleReset("error");
    }
  };

  const handleClick = async () => {
    if (status !== "idle") return;
    const shareTitle = title ?? document.title;
    const shareUrl = url ?? window.location.href;

    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({ title: shareTitle, url: shareUrl });
        return;
      } catch (err) {
        if (err && err.name === "AbortError") return;
      }
    }

    await copyToClipboard(shareUrl);
  };

  const isMinimal = variant === "minimal";
  const isHeader = variant === "header";
  const isCopied = status === "copied";
  const isError = status === "error";
  const showLabel = !isMinimal;

  const labelText = isCopied ? "Link copied!" : isError ? "Couldn't copy link" : "Share";
  const liveText = isCopied ? "Link copied" : isError ? "Couldn't copy link" : "";

  // Header variant sits on a dark bar by default; the light tone is for the
  // white tool-page headers (ink idle/hover, AA-dark status colors).
  const onLightHeader = isHeader && headerTone === "light";
  const headerIdleColor = onLightHeader ? P.textLight : "rgba(255,255,255,0.55)";
  const headerHoverColor = onLightHeader ? P.navy : "rgba(255,255,255,0.95)";
  const headerActiveColor = isError
    ? (onLightHeader ? P.danger : P.dangerLight)
    : (onLightHeader ? P.success : P.successLight);

  const baseBg = isHeader ? "transparent" : P.navy;
  const hoverBg = isHeader ? "transparent" : P.navyLight;
  const errorBg = isHeader ? "transparent" : P.danger;
  const background = isError ? errorBg : baseBg;

  const buttonStyle = isHeader
    ? {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        minHeight: 44,
        padding: "0 8px",
        background: "transparent",
        color: isCopied || isError ? headerActiveColor : headerIdleColor,
        border: "none",
        borderRadius: 6,
        fontFamily: F.body,
        fontSize: 13,
        fontWeight: 500,
        letterSpacing: 0.1,
        cursor: status === "idle" ? "pointer" : "default",
        transition: "color 0.15s ease",
        WebkitTapHighlightColor: "transparent",
      }
    : {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: showLabel ? 8 : 0,
        minHeight: 44,
        minWidth: isMinimal ? 44 : "auto",
        padding: isMinimal ? "0 12px" : "8px 14px",
        background,
        color: P.cream,
        border: "none",
        borderRadius: 8,
        fontFamily: F.body,
        fontSize: 13,
        fontWeight: 600,
        letterSpacing: 0.2,
        cursor: status === "idle" ? "pointer" : "default",
        transition: "background 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease",
        WebkitTapHighlightColor: "transparent",
      };

  const onMouseEnter = (e) => {
    if (status !== "idle" || isError) return;
    if (isHeader) {
      e.currentTarget.style.color = headerHoverColor;
      return;
    }
    e.currentTarget.style.background = hoverBg;
    e.currentTarget.style.boxShadow = "0 4px 12px rgba(15, 37, 48, 0.18)";
  };
  const onMouseLeave = (e) => {
    if (isError) return;
    if (isHeader) {
      e.currentTarget.style.color = isCopied ? headerActiveColor : headerIdleColor;
      return;
    }
    e.currentTarget.style.background = background;
    e.currentTarget.style.boxShadow = "none";
  };

  return (
    <>
      <style>{`
        .mg-share-btn:focus-visible {
          outline: 2px solid ${P.gold};
          outline-offset: 2px;
        }
        @media print {
          .mg-share-btn { display: none !important; }
        }
      `}</style>
      <button
        type="button"
        className="mg-share-btn no-print"
        aria-label="Share this page"
        onClick={handleClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        style={buttonStyle}
      >
        {isCopied ? <CheckIcon /> : <ShareIcon />}
        {showLabel && <span>{labelText}</span>}
      </button>
      <span
        aria-live="polite"
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: "hidden",
          clip: "rect(0,0,0,0)",
          whiteSpace: "nowrap",
          border: 0,
        }}
      >
        {liveText}
      </span>
    </>
  );
}
