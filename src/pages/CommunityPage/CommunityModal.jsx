// src/pages/CommunityPage/CommunityModal.jsx
import React, { useCallback, useEffect, useState } from "react";
import ReactDOM from "react-dom";

let _show;
export const modal = {
  alert: (message, title = "알림") =>
    new Promise((resolve) => _show && _show({ type: "alert", title, message, resolve })),
  confirm: (message, title = "확인") =>
    new Promise((resolve) => _show && _show({ type: "confirm", title, message, resolve })),
  prompt: (message, defaultValue = "", title = "입력") =>
    new Promise((resolve) => _show && _show({ type: "prompt", title, message, input: defaultValue, resolve })),
};

export function ModalRoot() {
  const [state, setState] = useState(null);

  useEffect(() => {
    _show = (payload) => setState(payload);
    return () => { _show = null; };
  }, []);

  const close = useCallback((v) => {
    if (state?.resolve) state.resolve(v);
    setState(null);
  }, [state]);

  if (!state) return null;

  const { type, title, message } = state;
  const portalEl = document.getElementById("modal-root") || document.body;

  return ReactDOM.createPortal(
    <div className="cm-overlay" role="dialog" aria-modal="true">
      <div className="cm-modal" role="document">
        <div className="cm-header">
          <h3>{title}</h3>
          <button
            className="cm-x"
            onClick={() => close(type === "confirm" ? false : undefined)}
            aria-label="닫기"
          >
            ×
          </button>
        </div>

        <div className="cm-body">
          <p className="cm-message">{String(message || "")}</p>
          {type === "prompt" && (
            <input
              autoFocus
              className="cm-input"
              defaultValue={state.input || ""}
              onChange={(e) => (state.input = e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") close(state.input || ""); }}
            />
          )}
        </div>

        <div className="cm-actions">
          {type === "alert" && (
            <button className="cm-btn primary" onClick={() => close(true)}>확인</button>
          )}
          {type === "confirm" && (
            <>
              <button className="cm-btn" onClick={() => close(false)}>취소</button>
              <button className="cm-btn primary" onClick={() => close(true)}>확인</button>
            </>
          )}
          {type === "prompt" && (
            <>
              <button className="cm-btn" onClick={() => close(null)}>취소</button>
              <button className="cm-btn primary" onClick={() => close(state.input || "")}>확인</button>
            </>
          )}
        </div>
      </div>
    </div>,
    portalEl
  );
}
