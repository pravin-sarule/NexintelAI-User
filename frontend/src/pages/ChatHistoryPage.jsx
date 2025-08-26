
// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';

// const ChatHistoryPage = () => {
//   const [chats, setChats] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [searchQuery, setSearchQuery] = useState(''); // New state for search query
//   const navigate = useNavigate();

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

//   // Function to generate a topic title from the first question
//   const generateTopicTitle = (question) => {
//     if (!question) return 'Untitled Chat';
    
//     // Truncate long questions and create a meaningful title
//     const words = question.trim().split(' ');
//     if (words.length <= 8) {
//       return question;
//     }
//     return words.slice(0, 8).join(' ') + '...';
//   };

//   // Function to format date like Claude AI
//   const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     const now = new Date();
//     const diffTime = Math.abs(now - date);
//     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

//     if (diffDays === 1) {
//       return 'Today';
//     } else if (diffDays === 2) {
//       return 'Yesterday';
//     } else if (diffDays <= 7) {
//       return `${diffDays - 1} days ago`;
//     } else {
//       return date.toLocaleDateString('en-US', { 
//         month: 'short', 
//         day: 'numeric',
//         year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
//       });
//     }
//   };

//   // Handle chat click to navigate to AI analysis page
//   const handleChatClick = (fileId, sessionId) => {
//     navigate(`/analysis/${fileId}/${sessionId}`);
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-64">
//         <div className="text-gray-500">Loading chat history...</div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex items-center justify-center min-h-64">
//         <div className="text-red-500 bg-red-50 px-4 py-2 rounded-lg">
//           {error}
//         </div>
//       </div>
//     );
//   }

//   if (chats.length === 0) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-64 text-center">
//         <div className="text-gray-400 text-lg mb-2">No conversations yet</div>
//         <div className="text-gray-500 text-sm">Start a new chat to see your history here</div>
//       </div>
//     );
//   }

//   return (
//     <div className="chat-history-container max-w-4xl mx-auto p-4">
//       <div className="mb-6">
//         <h1 className="text-2xl font-semibold text-gray-900 mb-2">Chat History</h1>
//         <p className="text-gray-600">Your recent conversations</p>
//         <div className="mt-4">
//           <input
//             type="text"
//             placeholder="Search chats..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//           />
//         </div>
//       </div>

//       <div className="space-y-2">
//         {chats
//           .filter(chat =>
//             chat.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
//             chat.answer.toLowerCase().includes(searchQuery.toLowerCase())
//           )
//           .map((chat) => (
//             <div
//               key={chat.id}
//               onClick={() => handleChatClick(chat.file_id, chat.session_id)}
//               className="chat-item group cursor-pointer bg-white hover:bg-gray-50 border border-gray-200 rounded-lg p-4 transition-all duration-200 hover:shadow-md hover:border-gray-300"
//             >
//               <div className="flex items-start justify-between">
//                 <div className="flex-1 min-w-0">
//                   <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-200 mb-1">
//                     {generateTopicTitle(chat.question)}
//                   </h3>
//                   <p className="text-sm text-gray-500 line-clamp-2">
//                     {chat.question}
//                   </p>
//                 </div>
//                 <div className="ml-4 flex-shrink-0">
//                   <span className="text-xs text-gray-400">
//                     {formatDate(chat.created_at)}
//                   </span>
//                 </div>
//               </div>
              
//               {/* Optional: Show a preview of the AI response */}
//               <div className="mt-3 pt-3 border-t border-gray-100">
//                 <p className="text-sm text-gray-600 line-clamp-1">
//                   <span className="font-medium">AI:</span> {chat.answer}
//                 </p>
//               </div>
//             </div>
//           ))}
//       </div>

//       {/* Optional: Load more button if you implement pagination */}
//       {chats.length >= 20 && (
//         <div className="mt-8 text-center">
//           <button className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors duration-200">
//             Load older conversations
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ChatHistoryPage;


import React, { useEffect, useState } from 'react';

const ChatHistoryPage = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('User not authenticated');
          setLoading(false);
          return;
        }

        const response = await fetch('https://nexintelai-user.onrender.com/api/chat', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch chats');
        }

        const data = await response.json();
        setChats(data);
      } catch (err) {
        console.error('Error fetching chats:', err);
        setError(err.message || 'Error fetching chats');
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, []);

  const generateTopicTitle = (question) => {
    if (!question) return 'Untitled Chat';
    
    const words = question.trim().split(' ');
    if (words.length <= 8) {
      return question;
    }
    return words.slice(0, 8).join(' ') + '...';
  };

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

  const handleChatClick = (fileId, sessionId) => {
    // Replace with your navigation logic
    console.log(`Navigate to analysis/${fileId}/${sessionId}`);
    // For actual implementation, use: window.location.href = `/analysis/${fileId}/${sessionId}`;
    // Or integrate with your preferred routing solution
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-3xl mx-auto px-6 py-16">
          <div className="flex items-center justify-center h-64">
            <div className="text-slate-500 text-sm">Loading conversations...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-3xl mx-auto px-6 py-16">
          <div className="flex items-center justify-center h-64">
            <div className="text-slate-600 text-sm bg-slate-50 px-4 py-3 rounded-lg border border-slate-200">
              {error}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-3xl mx-auto px-6 py-16">
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="text-slate-600 text-lg font-medium mb-2">No conversations yet</div>
            <div className="text-slate-500 text-sm">Your chat history will appear here</div>
          </div>
        </div>
      </div>
    );
  }

  const filteredChats = chats.filter(chat =>
    chat.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-medium text-slate-900 mb-2">Conversations</h1>
          <p className="text-slate-600 text-sm mb-6">Your recent chat history</p>
          
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-300 focus:border-slate-300 placeholder:text-slate-400"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Chat List */}
        <div className="space-y-3">
          {filteredChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => handleChatClick(chat.file_id, chat.session_id)}
              className="group cursor-pointer block p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all duration-150"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-slate-900 group-hover:text-slate-700 transition-colors duration-150 mb-2 line-clamp-1">
                    {generateTopicTitle(chat.question)}
                  </h3>
                  <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed mb-3">
                    {chat.question}
                  </p>
                  
                  {/* AI Response Preview */}
                  <div className="flex items-start gap-2">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center mt-0.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-400"></div>
                    </div>
                    <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                      {chat.answer}
                    </p>
                  </div>
                </div>
                
                <div className="flex-shrink-0 text-right">
                  <span className="text-xs text-slate-400 font-medium">
                    {formatDate(chat.created_at)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        {chats.length >= 20 && (
          <div className="mt-12 text-center">
            <button className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors duration-150 font-medium">
              Load older conversations
            </button>
          </div>
        )}

        {/* No Results */}
        {searchQuery && filteredChats.length === 0 && (
          <div className="text-center py-12">
            <div className="text-slate-500 text-sm">No conversations match your search</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatHistoryPage;