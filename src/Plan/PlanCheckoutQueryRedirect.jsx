import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
export default function CheckoutQueryRedirect() {
  const { search } = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    const qs = new URLSearchParams(search);
    const code = (qs.get("planCode") || qs.get("code") || "").trim();
    const months = Number(qs.get("months") || qs.get("term") || 0) || 1;
    if (code) navigate(`/plan/checkout/${encodeURIComponent(code)}/${months}`, { replace: true });
    else navigate(`/plans`, { replace: true });
  }, [search, navigate]);
  return null;
}
