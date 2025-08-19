
// import React, { useEffect, useState } from 'react';
// import axios from 'axios';

// const ChatHistoryPage = () => {
//   const [chats, setChats] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchChats = async () => {
//       try {
//         const token = localStorage.getItem('token');
//         if (!token) {
//           setError('User not authenticated');
//           setLoading(false);
//           return;
//         }

//         const response = await axios.get('http://localhost:3000/api/chat', {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });

//         setChats(response.data);
//       } catch (err) {
//         console.error('Error fetching chats:', err);
//         setError(err.response?.data?.message || 'Error fetching chats');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchChats();
//   }, []);

//   if (loading) return <div>Loading chat history...</div>;
//   if (error) return <div style={{ color: 'red' }}>{error}</div>;
//   if (chats.length === 0) return <div>No chat history found.</div>;

//   return (
//     <div className="chat-history space-y-4">
//       {chats.map((chat) => (
//         <div key={chat.id} className="chat-message">
//           <div className="question p-2 bg-blue-100 rounded-md mb-1">
//             <strong>You:</strong> {chat.question}
//           </div>
//           <div className="answer p-2 bg-gray-100 rounded-md">
//             <strong>AI:</strong> {chat.answer}
//           </div>
//           <div className="text-xs text-gray-400 mt-1">
//             {new Date(chat.created_at).toLocaleString()}
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default ChatHistoryPage;
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ChatHistoryPage = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('User not authenticated');
          setLoading(false);
          return;
        }

        const response = await axios.get('https://nexintelai-user.onrender.com/api/chat', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setChats(response.data);
      } catch (err) {
        console.error('Error fetching chats:', err);
        setError(err.response?.data?.message || 'Error fetching chats');
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, []);

  // Function to generate a topic title from the first question
  const generateTopicTitle = (question) => {
    if (!question) return 'Untitled Chat';
    
    // Truncate long questions and create a meaningful title
    const words = question.trim().split(' ');
    if (words.length <= 8) {
      return question;
    }
    return words.slice(0, 8).join(' ') + '...';
  };

  // Function to format date like Claude AI
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return 'Today';
    } else if (diffDays === 2) {
      return 'Yesterday';
    } else if (diffDays <= 7) {
      return `${diffDays - 1} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  // Handle chat click to navigate to AI analysis page
  const handleChatClick = (fileId, sessionId) => {
    navigate(`/analysis/${fileId}/${sessionId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-gray-500">Loading chat history...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-red-500 bg-red-50 px-4 py-2 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 text-center">
        <div className="text-gray-400 text-lg mb-2">No conversations yet</div>
        <div className="text-gray-500 text-sm">Start a new chat to see your history here</div>
      </div>
    );
  }

  return (
    <div className="chat-history-container max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Chat History</h1>
        <p className="text-gray-600">Your recent conversations</p>
      </div>

      <div className="space-y-2">
        {chats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => handleChatClick(chat.file_id, chat.session_id)}
            className="chat-item group cursor-pointer bg-white hover:bg-gray-50 border border-gray-200 rounded-lg p-4 transition-all duration-200 hover:shadow-md hover:border-gray-300"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-200 mb-1">
                  {generateTopicTitle(chat.question)}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-2">
                  {chat.question}
                </p>
              </div>
              <div className="ml-4 flex-shrink-0">
                <span className="text-xs text-gray-400">
                  {formatDate(chat.created_at)}
                </span>
              </div>
            </div>
            
            {/* Optional: Show a preview of the AI response */}
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-sm text-gray-600 line-clamp-1">
                <span className="font-medium">AI:</span> {chat.answer}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Optional: Load more button if you implement pagination */}
      {chats.length >= 20 && (
        <div className="mt-8 text-center">
          <button className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors duration-200">
            Load older conversations
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatHistoryPage;