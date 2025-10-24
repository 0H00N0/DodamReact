// src/pages/CommunityPage/CommunityModalProvider.jsx
import React, { useEffect } from "react";
import { ModalRoot, modal } from "./CommunityModal";

export default function CommunityModalProvider({ children }) {
  useEffect(() => {
    if (window.__COMMUNITY_MODAL_SHIM__) return;

    const _alert = window.alert;
    const _confirm = window.confirm;
    const _prompt = window.prompt;

    window.alert = (msg) => { modal.alert(msg); };
    window.confirm = async (msg) => !!(await modal.confirm(msg));
    window.prompt = async (msg, def = "") => {
      const v = await modal.prompt(msg, def);
      return v ?? null;
    };

    window.__COMMUNITY_MODAL_SHIM__ = { _alert, _confirm, _prompt };
    return () => {
      if (window.__COMMUNITY_MODAL_SHIM__) {
        window.alert = _alert;
        window.confirm = _confirm;
        window.prompt = _prompt;
        delete window.__COMMUNITY_MODAL_SHIM__;
      }
    };
  }, []);

  return (
    <>
      {children}
      <ModalRoot />
    </>
  );
}
