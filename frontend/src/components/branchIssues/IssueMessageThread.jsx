import React, { useEffect, useRef } from "react";

const formatTime = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleString("en-NP");
};

const initials = (name = "") =>
  String(name || "U")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export default function IssueMessageThread({ messages = [], currentUser }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  if (!messages.length) {
    return (
      <div className="it-message-empty">
        <div className="it-message-empty-glyph" aria-hidden="true" />
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
              "it-message-row",
              mine ? "it-message-row-mine" : "",
            ].join(" ")}
          >
            {!mine && <span className="it-message-avatar">{initials(message.sender_name)}</span>}

            <div
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
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}