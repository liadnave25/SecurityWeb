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
        console.error("Failed to fetch user data");
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
    const res = await fetch('http://localhost:8080/api/deals/create', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-XSRF-TOKEN': getCsrfToken() 
      },
      body: JSON.stringify(newDeal),
      credentials: 'include' 
    });
    if (res.ok) {
      alert('Deal Created!');
      setNewDeal({ title: '', description: '' });
      fetchPublicDeals();
      fetchMyDeals();
    } else {
      alert('Failed. Do you have permission?');
    }
  };

  const handleDeleteDeal = async (dealId: number) => {
    if (!confirm("Are you sure you want to delete this deal?")) return;
    
    try {
        const res = await fetch(`http://localhost:8080/api/deals/${dealId}`, { 
            method: 'DELETE',
            headers: { 
                'X-XSRF-TOKEN': getCsrfToken() 
            },
            credentials: 'include'
        });
        
        if (res.ok) {
            alert("Deleted successfully!");
            fetchPublicDeals(); 
            fetchMyDeals();     
        } else {
            alert("Unauthorized: You cannot delete this deal.");
        }
    } catch(e) { console.error(e); }
  };

  if (!user) return <div className="text-center p-10 mt-20 text-xl">Loading profile... (Check console if stuck)</div>;

  const rolesStr = (user.roles || []).map((r: any) => r.authority).join(', ');
  const isAdmin = rolesStr.includes('ADMIN');
  const isBusiness = rolesStr.includes('BUSINESS');
  const myEmail = user.username;

  return (
    <Layout>
      <div className="max-w-4xl w-full space-y-8">
        
        {/* Header Section */}
        <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-md">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Hello, {user.username} 👋</h1>
            <p className="text-sm text-gray-500">Your Authorization: <span className="font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded">{rolesStr}</span></p>
          </div>
          <button onClick={onLogout} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition">
            Logout
          </button>
        </div>

        {/* --- AREA 1: ADMIN ONLY --- */}
        {isAdmin && (
          <div className="bg-red-50 border border-red-200 p-6 rounded-xl">
            <h2 className="text-xl font-bold text-red-700 mb-4">👮‍♂️ Admin Zone: All Users</h2>
            <div className="bg-white rounded-lg border overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th></tr></thead>
                <tbody className="divide-y divide-gray-200">
                  {usersList.map((u: any) => (
                    <tr key={u.id}>
                      <td className="px-6 py-4">{u.email}</td>
                      <td className="px-6 py-4">{u.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- AREA 2: BUSINESS & ADMIN --- */}
        {(isBusiness || isAdmin) && (
          <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl">
            <h2 className="text-xl font-bold text-blue-700 mb-4">💼 Business Zone: Create New Deal</h2>
            <form onSubmit={handleCreateDeal} className="flex gap-4">
              <input 
                placeholder="Deal Title (e.g., 50% Off Pizza)" 
                className="flex-1 p-2 rounded border"
                value={newDeal.title}
                onChange={e => setNewDeal({...newDeal, title: e.target.value})}
                required
              />
              <input 
                placeholder="Description" 
                className="flex-1 p-2 rounded border"
                value={newDeal.description}
                onChange={e => setNewDeal({...newDeal, description: e.target.value})}
                required
              />
              <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">Create</button>
            </form>
            
            <h3 className="font-bold mt-6 mb-2 text-gray-700">My Personal Deals:</h3>
            <ul className="list-disc pl-5">
              {myDeals.map((d: any) => (
                <li key={d.id} className="text-gray-600 flex justify-between w-1/2">
                    <span>{d.title}</span>
                    {/* DELETE BUTTON */}
                    <button onClick={() => handleDeleteDeal(d.id)} className="text-red-500 text-xs hover:underline">Delete</button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* --- AREA 3: PUBLIC FEED --- */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-bold text-gray-800 mb-4">🌎 Public Deals Feed</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {deals.map((deal: any) => {
                const isOwner = deal.owner?.email === myEmail;
                const canDelete = isAdmin || isOwner;

                return (
                  <div key={deal.id} className="border p-4 rounded-lg hover:shadow-lg transition relative">
                    <h3 className="font-bold text-lg text-thiscount-blue-dark">{deal.title}</h3>
                    <p className="text-gray-600">{deal.description}</p>
                    <div className="mt-2 text-xs text-gray-400">Owner: {deal.owner?.fullName || deal.owner?.email}</div>
                    
                    {/* כפתור מחיקה מותנה */}
                    {canDelete && (
                        <button 
                            onClick={() => handleDeleteDeal(deal.id)}
                            className="absolute top-4 right-4 text-red-500 hover:text-white hover:bg-red-500 border border-red-500 px-2 py-1 rounded text-xs transition duration-200"
                        >
                            Delete
                        </button>
                    )}
                  </div>
                );
            })}
            {deals.length === 0 && <p className="text-gray-400">No deals yet.</p>}
          </div>
        </div>

      </div>
    </Layout>
  );
};

export default Dashboard;