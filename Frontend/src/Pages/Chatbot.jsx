import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { FaCalendarAlt, FaMapMarkerAlt, FaBolt } from 'react-icons/fa';
import simplytixLogo from '/simplytix.svg';
import './Chatbot.css';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatContainerRef = useRef(null);

  const toggleChat = () => {
    if (!isOpen) {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          sender: 'bot',
          text: 'Hello! I\'m **TixBot**, your SimplyTix assistant! 🎫\n\nI can help you with:\n- 🎪 Finding events and shows\n- 🎟️ Checking ticket prices and availability\n- 📅 Event schedules and locations\n- 💳 Payment and booking information\n- 👤 Account and booking history\n\nWhat would you like to know?'
        },
      ]);
    }
    setIsOpen(!isOpen);
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMsg = inputMessage;
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: 'user', text: userMsg },
    ]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const response = await fetch('http://localhost:3008/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMsg }),
      });

      if (!response.ok) throw new Error('Failed to fetch');

      const data = await response.json();

      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'bot', text: data.response },
      ]);
    } catch (error) {
      console.error('Error:', error);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          sender: 'bot',
          text: '🔧 Oops! I encountered a technical issue. Please try again in a moment.\n\nIn the meantime, you can:\n- Browse events on the dashboard\n- Check your tickets\n- View your account details'
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const suggestedQuestions = [
    "What events are happening this weekend?",
    "Show me workshops in my area",
    "What are the ticket prices?",
    "How do I book tickets?"
  ];

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="bg-black shadow-2xl rounded-2xl w-full max-w-sm sm:w-96 h-[32rem] fixed bottom-0 right-0 sm:bottom-6 sm:right-6 flex flex-col chatbot-container border border-gray-700">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-gray-700 bg-gray-900 rounded-t-2xl">
            <div className="flex items-center gap-2">
              <img src={simplytixLogo} alt="SimplyTix Logo" className="w-8 h-8 rounded-full" />
              <div>
                <h2 className="text-lg font-bold text-white">TixBot</h2>
                <p className="text-xs text-gray-400">SimplyTix Assistant</p>
              </div>
            </div>
            <button
              onClick={toggleChat}
              className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-800"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
                   viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Chat messages */}
          <div
            ref={chatContainerRef}
            className="flex-1 p-4 overflow-y-auto bg-gray-950 space-y-4"
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-2 max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-br from-blue-500 to-cyan-600'
                      : 'bg-gray-800'
                  }`}>
                    {msg.sender === 'user' ? (
                      <span className="text-white text-sm font-bold">U</span>
                    ) : (
                      <img src={simplytixLogo} alt="SimplyTix Logo" className="w-6 h-6" />
                    )}
                  </div>

                  {/* Message */}
                  <div
                    className={`p-3 rounded-2xl shadow-sm ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-br-sm'
                        : 'bg-gray-800 text-gray-200 border border-gray-700 rounded-bl-sm'
                    }`}
                  >
                    <div className={`text-sm ${msg.sender === 'user' ? 'text-white' : 'text-gray-200'}`}>
                      <ReactMarkdown
                        components={{
                          p: ({children}) => <p className="mb-2 last:mb-0">{children}</p>,
                          strong: ({children}) => <strong className={msg.sender === 'user' ? 'text-yellow-200' : 'text-cyan-400'}>{children}</strong>
                        }}
                      >
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
                    <img src={simplytixLogo} alt="SimplyTix Logo" className="w-6 h-6" />
                  </div>
                  <div className="bg-gray-800 p-3 rounded-2xl rounded-bl-sm shadow-sm border border-gray-700">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick suggestions */}
            {messages.length === 0 && (
              <div className="space-y-2">
                <p className="text-gray-400 text-sm text-center mb-4">Try asking me about:</p>
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setInputMessage(question);
                      setTimeout(() => sendMessage(), 100);
                    }}
                    className="w-full text-left p-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-sm text-gray-200 hover:text-white transition-colors shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-center space-x-2">
                      <FaBolt className="text-cyan-400 text-xs" />
                      <span>{question}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-700 bg-gray-900 rounded-b-2xl">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ask about events, tickets, bookings..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isTyping}
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-200 placeholder-gray-500"
              />
              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-gray-600 disabled:to-gray-600 text-white px-5 py-3 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isTyping ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                  </svg>
                )}
              </button>
            </div>

            {/* Quick actions */}
            <div className="flex flex-wrap gap-2 mt-3">
              <button
                onClick={() => {setInputMessage("What events are happening today?"); setTimeout(() => sendMessage(), 100);}}
                className="text-xs bg-gray-800 text-gray-300 px-3 py-1 rounded-full hover:bg-gray-700 transition-colors"
              >
                <FaCalendarAlt className="inline mr-1" /> Today's Events
              </button>
              <button
                onClick={() => {setInputMessage("Show me ticket prices"); setTimeout(() => sendMessage(), 100);}}
                className="text-xs bg-gray-800 text-gray-300 px-3 py-1 rounded-full hover:bg-gray-700 transition-colors"
              >
                <img src="/simplytix.svg" alt="Ticket" className="inline mr-1 w-4 h-4" /> Prices
              </button>
              <button
                onClick={() => {setInputMessage("Help me find events near me"); setTimeout(() => sendMessage(), 100);}}
                className="text-xs bg-gray-800 text-gray-300 px-3 py-1 rounded-full hover:bg-gray-700 transition-colors"
              >
                <FaMapMarkerAlt className="inline mr-1" /> Near Me
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={toggleChat}
          className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-full p-4 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 border-2 border-gray-700"
        >
          <div className="flex items-center justify-center relative">
            <img src="/simplytix.svg" alt="Ticket" className="h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse"></div>
          </div>
        </button>
      )}
    </div>
  );
};

export default ChatBot;