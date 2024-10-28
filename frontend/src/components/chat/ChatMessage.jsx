import React from 'react';

function ChatMessage({ message }) {
    return (
        <div className="chatmsg">
            <p>{message.author}: {message.text}</p>
        </div>
    )
}

export default ChatMessage;