import { useEffect, useState } from 'react';
import Layout from './Layout';

function getCsrfToken() {
  return document.cookie.replace(/(?:(?:^|.*;\s*)XSRF-TOKEN\s*\=\s*([^;]*).*$)|^.*$/, "$1");
}

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard = ({ onLogout }: DashboardProps) => {
  const [user, setUser] = useState<any>(null);
  const [deals, setDeals] = useState<any[]>([]);
  const [myDeals, setMyDeals] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [newDeal, setNewDeal] = useState({ title: '', description: '' });
  
  // States עבור העלאת קבצים ושגיאות
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchUserData();
    fetchPublicDeals();
  }, []);

  const fetchUserData = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/debug/me', { credentials: 'include' }); 
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        
        const roles = JSON.stringify(data.roles || []); 
        
        if (roles.includes('BUSINESS') || roles.includes('ADMIN')) {
          fetchMyDeals();
        }
        if (roles.includes('ADMIN')) {
          fetchUsers();
        }
      } else {
        onLogout();
      }
    } catch (e) { console.error(e); }
  };

  const fetchPublicDeals = async () => {
    const res = await fetch('http://localhost:8080/api/deals/public', { credentials: 'include' });
    if (res.ok) setDeals(await res.json());
  };

  const fetchMyDeals = async () => {
    const res = await fetch('http://localhost:8080/api/deals/my-deals', { credentials: 'include' });
    if (res.ok) setMyDeals(await res.json());
  };

  const fetchUsers = async () => {
    const res = await fetch('http://localhost:8080/api/admin/users', { credentials: 'include' });
    if (res.ok) setUsersList(await res.json());
  };

  const handleCreateDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null); // איפוס שגיאות קודמות
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('title', newDeal.title);
    formData.append('description', newDeal.description);
    if (selectedFile) {
        formData.append('file', selectedFile);
    }

    try {
      const res = await fetch('http://localhost:8080/api/deals/create', {
        method: 'POST',
        headers: { 
          'X-XSRF-TOKEN': getCsrfToken() 
        },
        body: formData,
        credentials: 'include' 
      });

      if (res.ok) {
        setNewDeal({ title: '', description: '' });
        setSelectedFile(null); 
        fetchPublicDeals();
        fetchMyDeals();
        // הודעת הצלחה קצרה
        alert('Deal Created Successfully!');
      } else {
        const errorData = await res.json();
        // שליפת הודעת השגיאה הספציפית מהשרת (Rate Limit, File Type וכו')
        setErrorMessage(errorData.error || 'An unexpected error occurred. Please try again.');
      }
    } catch (err) {
      setErrorMessage('Server connection lost. Please check your network.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDeal = async (dealId: number) => {
    if (!confirm("Are you sure you want to delete this deal?")) return;
    
    try {
        const res = await fetch(`http://localhost:8080/api/deals/${dealId}`, { 
            method: 'DELETE',
            headers: { 'X-XSRF-TOKEN': getCsrfToken() },
            credentials: 'include'
        });
        
        if (res.ok) {
            fetchPublicDeals(); 
            fetchMyDeals();     
        } else {
            setErrorMessage("Unauthorized: You cannot delete this deal.");
        }
    } catch(e) { console.error(e); }
  };

  if (!user) return <div className="text-center p-10 mt-20 text-xl font-medium text-gray-400 animate-pulse">Loading secure profile...</div>;

  const rolesStr = (user.roles || []).map((r: any) => r.authority).join(', ');
  const isAdmin = rolesStr.includes('ADMIN');
  const isBusiness = rolesStr.includes('BUSINESS');
  const myEmail = user.username;

  return (
    <Layout>
      <div className="max-w-4xl w-full space-y-8 pb-20">
        
        {/* Header Section */}
        <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-md border-b-4 border-blue-500">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Hello, {user.username} 👋</h1>
            <p className="text-sm text-gray-500">Secure Access: <span className="font-mono bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100">{rolesStr}</span></p>
          </div>
          <button onClick={onLogout} className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg transition-all shadow hover:shadow-lg font-semibold">
            Logout
          </button>
        </div>

        {/* --- AREA 1: ADMIN ONLY --- */}
        {isAdmin && (
          <div className="bg-red-50 border border-red-100 p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-bold text-red-700 mb-4 flex items-center gap-2">
                <span>👮‍♂️</span> Admin Zone: All Users
            </h2>
            <div className="bg-white rounded-lg border border-red-100 overflow-hidden shadow-sm">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th></tr></thead>
                <tbody className="divide-y divide-gray-200">
                  {usersList.map((u: any) => (
                    <tr key={u.id} className="hover:bg-red-50/30 transition">
                      <td className="px-6 py-4 text-sm text-gray-700">{u.email}</td>
                      <td className="px-6 py-4"><span className="text-xs font-bold bg-gray-100 px-2 py-1 rounded">{u.role}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- AREA 2: BUSINESS & ADMIN --- */}
        {(isBusiness || isAdmin) && (
          <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-bold text-blue-700 mb-4 flex items-center gap-2">
                <span>💼</span> Business Zone: Create New Deal
            </h2>
            
            <form onSubmit={handleCreateDeal} className="flex flex-col gap-4">
              <div className="flex gap-4">
                <input 
                  placeholder="Deal Title" 
                  className="flex-1 p-3 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-400 outline-none transition-all"
                  value={newDeal.title}
                  onChange={e => setNewDeal({...newDeal, title: e.target.value})}
                  required
                />
                <input 
                  placeholder="Description" 
                  className="flex-1 p-3 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-400 outline-none transition-all"
                  value={newDeal.description}
                  onChange={e => setNewDeal({...newDeal, description: e.target.value})}
                  required
                />
              </div>
              
              <div className="flex items-center gap-4 bg-white p-4 rounded-lg border border-dashed border-blue-300">
                <div className="bg-blue-50 p-2 rounded-full">📷</div>
                <div className="flex flex-col flex-1">
                    <label className="text-xs font-bold text-blue-800 uppercase tracking-tight">Add Image (Only PNG/JPG)</label>
                    <input 
                      type="file"
                      accept="image/*"
                      onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                      className="text-sm text-gray-500 file:hidden cursor-pointer mt-1"
                    />
                    {selectedFile && <span className="text-xs text-green-600 mt-1 font-medium">Selected: {selectedFile.name}</span>}
                </div>
              </div>

              {/* הודעת שגיאה אינטראקטיבית למשתמש */}
              {errorMessage && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded shadow-sm animate-shake">
                    <p className="text-sm font-bold flex items-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                        Upload Failed: {errorMessage}
                    </p>
                </div>
              )}

              <button 
                type="submit" 
                disabled={isSubmitting}
                className={`bg-blue-600 text-white px-6 py-3 rounded-lg transition-all font-bold shadow-md ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700 hover:shadow-lg active:scale-95'}`}
              >
                {isSubmitting ? 'Processing...' : 'Publish Secure Deal'}
              </button>
            </form>
          </div>
        )}

        {/* --- AREA 3: PUBLIC FEED --- */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span>🌎</span> Public Deals Feed
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {deals.map((deal: any) => {
                const isOwner = deal.owner?.email === myEmail;
                const canDelete = isAdmin || isOwner;

                return (
                  <div key={deal.id} className="border border-gray-100 rounded-2xl hover:shadow-2xl transition-all duration-300 bg-white overflow-hidden relative flex flex-col group">
                    
                    {deal.imagePath ? (
                        <div className="h-52 w-full bg-gray-100 overflow-hidden relative">
                            <img 
                                src={`http://localhost:8080/api/deals/images/${deal.imagePath}`} 
                                alt={deal.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/400x200?text=Secure+Image+Unavailable'; }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                        </div>
                    ) : (
                        <div className="h-52 w-full bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                             <span className="text-blue-200 text-6xl drop-shadow-sm">🏷️</span>
                        </div>
                    )}

                    <div className="p-5 flex-grow">
                        <h3 className="font-bold text-xl text-blue-900 mb-2 group-hover:text-blue-600 transition-colors">{deal.title}</h3>
                        <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 italic">"{deal.description}"</p>
                        
                        <div className="mt-5 pt-4 border-t border-gray-50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-[10px] text-blue-600 font-bold">
                                    {deal.owner?.fullName?.charAt(0) || 'U'}
                                </div>
                                <div className="text-[10px] uppercase tracking-widest text-gray-400 font-extrabold">
                                    {deal.owner?.fullName || deal.owner?.email}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {canDelete && (
                        <button 
                            onClick={() => handleDeleteDeal(deal.id)}
                            className="absolute top-3 right-3 bg-white/80 backdrop-blur-md text-red-500 hover:bg-red-500 hover:text-white p-2.5 rounded-full shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
                            title="Remove Deal"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    )}
                  </div>
                );
            })}
            {deals.length === 0 && (
                <div className="col-span-full text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400">
                    <p className="text-lg italic font-medium">The marketplace is empty. Be the first to post a deal!</p>
                </div>
            )}
          </div>
        </div>

      </div>
    </Layout>
  );
};

export default Dashboard;