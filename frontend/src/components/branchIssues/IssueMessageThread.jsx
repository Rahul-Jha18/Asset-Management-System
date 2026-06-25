import React, { useEffect, useRef } from "react";

const formatTime = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleString("en-NP");
};

export default function IssueMessageThread({ messages = [], currentUser }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  if (!messages.length) {
    return (
      <div className="it-message-empty">
        <div>💬</div>
        <strong>No messages yet</strong>
        <span>Start the conversation with a reply.</span>
      </div>
    );
  }

  return (
    <div className="it-message-thread">
      {messages.map((message) => {
        const mine =
          String(message.sender_user_id || "") === String(currentUser?.id || "") ||
          String(message.sender_name || "").toLowerCase() === String(currentUser?.name || "").toLowerCase();

        return (
          <div
            key={message.id}
            className={[
              "it-message",
              mine ? "it-message-mine" : "it-message-other",
              message.is_internal ? "it-message-internal" : "",
              message._sending ? "it-message-sending" : "",
            ].join(" ")}
          >
            <div className="it-message-head">
              <strong>{message.sender_name || message.sender_role || "User"}</strong>
              {message.sender_role && <span>{message.sender_role}</span>}
              {message.is_internal && <em>Internal</em>}
            </div>

            <p>{message.message}</p>

            <small>{message._sending ? "Sending..." : formatTime(message.created_at)}</small>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
