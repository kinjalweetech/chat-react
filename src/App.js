// // import logo from './logo.svg';
// import "./App.css";
// import React, { useState, useEffect } from "react";
// import { io } from "socket.io-client";

// const App = () => {
//   const [message, setMessage] = useState([]);
//   const [socket, setSocket] = useState(null);

//   useEffect(() => {
//     // Create a connection to the server
//     const socketCon = io("http://192.168.29.16:8080");

//     // Save the socket instance to state
//     setSocket(socketCon);

//     // Listen for messages from the server
//     socketCon.on("message", () => {
//       console.log(message, "this message from server");
//       setMessage((prevmessage) => [...prevmessage, message]);
//     });

//     // Cleanup on unmount
//     return () => {
//       socketCon.disconnect();
//     };
//   }, [message]);

//   //EMIT MESSAGE FROM SERVER SIDE
//   const sendMessage = () => {
//     if (socket) {
//       socket.emit("message", "hello server..!");
//     }
//   };

//   return (
//     <>
//       <div>
//         <h1>Socket.io client</h1>
//         <button onClick={sendMessage}>send message to server</button>
//         <ul>
//           {message.map((msg, index) => (
//             <li key={index}>{msg}</li>
//           ))}
//         </ul>
//       </div>
//     </>
//   );
// };

// export default App;

import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import "./ChatApp.css";

const socket = io("http://localhost:8000"); // Your server URL

const ChatApp = () => {
  const [country, setCountry] = useState("India"); // Only manage the selected country
  const [countries, setCountries] = useState(["India", "USA", "UK"]); // Initial country list
  const [message, setMessage] = useState(""); // Message input state
  const [messages, setMessages] = useState([]); // Array to hold chat messages
  const [customCountry, setCustomCountry] = useState(""); // Custom country input
  const messagesEndRef = useRef(null); // Reference for auto-scrolling chat

  // When the country is changed or on first render
  useEffect(() => {
    // Join selected country room
    socket.emit("join_country", country);

    // Receive chat history when the country changes
    socket.on("chat_history", (history) => {
      setMessages(history.map((msg) => msg.message)); // Map history to message array
    });

    // Receive new messages in real-time
    socket.on("receive_message", (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage.message]);
    });

    return () => {
      socket.off("chat_history");
      socket.off("receive_message");
    };
  }, [country]);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = () => {
    if (message.trim()) {
      const username = "USER_128"; // Replace with actual username logic
      socket.emit("send_message", { username, country, message });
      setMessage(""); 
    }
  };

  const addCustomCountry = () => {
    if (customCountry.trim() && !countries.includes(customCountry.trim())) {
      setCountries((prev) => [...prev, customCountry.trim()]); // Add new country to the list
      setCountry(customCountry.trim()); // Switch to the new country
      setCustomCountry(""); 
    }
  };

  return (
    <div className="chat-container">
      <div className="input-field">
        <h1>Chat in {country}</h1>
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)} // Handle country selection
        >
          {countries.map((cntry, index) => (
            <option key={index} value={cntry}>
              {cntry}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={customCountry}
          onChange={(e) => setCustomCountry(e.target.value)}
          placeholder="Add a country..."
        />
        <button onClick={addCustomCountry}>Add Country</button>
      </div>

      <div className="message-display">
        {messages.map((msg, index) => (
          <div style={{display: "flex", gap: "0.5em"}}>
            <p key={index}>USER_128:</p>
            <p style={{fontWeight: "inherit"}}> {msg}</p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="message-box">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatApp;
