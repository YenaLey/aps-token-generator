"use client";

import { useState, useEffect, useCallback } from "react";
// import { FiCopy, FiLoader, FiEye } from "react-icons/fi";
import { FiCopy, FiLoader } from "react-icons/fi";

export default function TwoLeggedForm({
  onTokenSet,
}: {
  onTokenSet: () => void;
}) {
  const [creds, setCreds] = useState<Creds>({
    client_id: "",
    client_secret: "",
  });
  const [token, setToken] = useState<Token | null>(null);
  const [expiryTime, setExpiryTime] = useState(0);
  const [countdown, setCountdown] = useState(0);
  // const [file, setFile] = useState<File | null>(null);
  // const [urn, setUrn] = useState("");
  const [loading, setLoading] = useState({ auth: false, upload: false });

  const getToken = useCallback(async () => {
    setLoading({ auth: true, upload: false });
    try {
      const res = await fetch("/api/auth/twolegged", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(creds),
      });
      const data = await res.json();
      if (!res.ok) {
        alert("문제가 발생하였습니다. 다시 시도해주세요.");
        return;
      }
      setToken(data);
      onTokenSet();
      const expireAt = Date.now() + data.expires_in * 1000;
      setExpiryTime(expireAt);
      setCountdown(Math.floor((expireAt - Date.now()) / 1000));
    } catch (err) {
      console.error("Token fetch error:", err);
      alert("문제가 발생하였습니다. 다시 시도해주세요.");
    } finally {
      setLoading((s) => ({ auth: false, upload: s.upload }));
    }
  }, [creds, onTokenSet]);

  useEffect(() => {
    if (!token) return;
    const id = setInterval(() => {
      setCountdown(Math.floor((expiryTime - Date.now()) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [token, expiryTime]);

  useEffect(() => {
    if (token && countdown <= 60) {
      getToken();
    }
  }, [countdown, getToken, token]);

  const copyToken = async () => {
    if (token) {
      await navigator.clipboard.writeText(token.access_token);
      alert("토큰이 복사되었습니다.");
    }
  };
  // const copyUrn = async () => {
  //   if (urn) {
  //     await navigator.clipboard.writeText(urn);
  //     alert("Model URN이 복사되었습니다.");
  //   }
  // };
  // const viewModel = () => {
  //   const q = new URLSearchParams({
  //     urn,
  //     token: token?.access_token || "",
  //   }).toString();
  //   window.open(`/viewer?${q}`, "forgeViewer", "width=800,height=600");
  // };

  // const uploadTranslate = async () => {
  //   setLoading((s) => ({ auth: s.auth, upload: true }));
  //   if (!token) return;
  //   const form = new FormData();
  //   form.append("access_token", token.access_token);
  //   form.append("file", file as File);
  //   try {
  //     const res = await fetch("/api/upload", { method: "POST", body: form });
  //     const data = await res.json();
  //     setUrn(data.urn);
  //   } catch (e) {
  //     console.error("Upload error:", e);
  //     alert("문제가 발생하였습니다. 다시 시도해주세요.");
  //   } finally {
  //     setLoading((s) => ({ auth: s.auth, upload: false }));
  //   }
  // };

  return (
    <div className="space-y-4">
      <div>
        <label className="block font-medium">Client ID</label>
        <input
          className="mt-1 w-full border border-blue-200 rounded-md p-2"
          placeholder="Enter Client ID"
          value={creds.client_id}
          onChange={(e) => setCreds({ ...creds, client_id: e.target.value })}
        />
      </div>

      <div>
        <label className="block font-medium">Client Secret</label>
        <input
          type="password"
          className="mt-1 w-full border border-blue-200 rounded-md p-2"
          placeholder="Enter Client Secret"
          value={creds.client_secret}
          onChange={(e) =>
            setCreds({ ...creds, client_secret: e.target.value })
          }
        />
      </div>

      <button
        onClick={getToken}
        disabled={!creds.client_id || !creds.client_secret || loading.auth}
        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {loading.auth && <FiLoader className="animate-spin" />}
        Get Token
      </button>

      {token && (
        <div className="bg-white p-4 rounded-md shadow-md space-y-6">
          <div className="flex items-start gap-2">
            <div className="flex-grow">
              <p className="font-medium">Access Token:</p>
              <code className="break-all block text-sm text-gray-800">
                {token.access_token}
              </code>
            </div>
            <button
              onClick={copyToken}
              className="text-blue-600 hover:text-blue-800 p-1"
            >
              <FiCopy size={20} />
            </button>
          </div>
          <p>
            <span className="font-medium">Expires in:</span>{" "}
            <span className="font-semibold">{countdown}s</span>
          </p>

          {/* <div className="space-y-6">
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="block"
            />
            <button
              onClick={uploadTranslate}
              disabled={!file || loading.upload}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {loading.upload && <FiLoader className="animate-spin" />}
              Upload & Translate
            </button>
          </div>

          {urn && (
            <div className="flex items-center gap-2 mt-3">
              <div className="flex-grow">
                <p className="font-medium">Model URN:</p>
                <code className="break-all text-sm text-gray-700 flex-grow">
                  {urn}
                </code>
              </div>
              <button
                onClick={copyUrn}
                className="text-blue-600 hover:text-blue-800 p-1"
              >
                <FiCopy size={20} />
              </button>
              <button
                onClick={viewModel}
                className="text-blue-600 hover:text-blue-800 p-1"
              >
                <FiEye size={20} />
              </button>
            </div>
          )} */}
        </div>
      )}
    </div>
  );
}
