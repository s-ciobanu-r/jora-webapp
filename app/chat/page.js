"use client";

import { Suspense } from "react";
import ChatPage from "./ChatPage";

export default function Page() {
  return (
    <Suspense fallback={<div className="text-gray-300 p-10 text-center">Jora se pregătește…</div>}>
      <ChatPage />
    </Suspense>
  );
}
