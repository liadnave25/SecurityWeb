import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from './Layout';

function getCsrfToken() {
  return document.cookie.replace(/(?:(?:^|.*;\s*)XSRF-TOKEN\s*\=\s*([^;]*).*$)|^.*$/, "$1");
}

interface DashboardProps {
  onLogout: () => void;
  onNavigateToAbout?: () => void;
}

const Dashboard = ({ onLogout, onNavigateToAbout }: DashboardProps) => {
  const [user, setUser] = useState<any>(null);
  const [deals, setDeals] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [newDeal, setNewDeal] = useState({ title: '', description: '' });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'X-XSRF-TOKEN': getCsrfToken() },
        credentials: 'include',
      });
    } catch (e) {
      console.error('Logout error', e);
    } finally {
      onLogout();
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchPublicDeals();
  }, []);

  const fetchUserData = async () => {
    try {
      const res = await fetch('/api/debug/me', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        const roles = JSON.stringify(data.roles || []);
        if (roles.includes('ADMIN')) {
          fetchUsers();
        }
      } else {
        onLogout();
      }
    } catch (e) { console.error(e); }
  };

  const fetchPublicDeals = async () => {
    const res = await fetch('/api/deals/public', { credentials: 'include' });
    if (res.ok) setDeals(await res.json());
  };

  const fetchUsers = async () => {
    const res = await fetch('/api/admin/users', { credentials: 'include' });
    if (res.ok) setUsersList(await res.json());
  };

  const handleCreateDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('title', newDeal.title);
    formData.append('description', newDeal.description);
    if (selectedFile) {
      formData.append('file', selectedFile);
    }

    try {
      const res = await fetch('/api/deals/create', {
        method: 'POST',
        headers: { 'X-XSRF-TOKEN': getCsrfToken() },
        body: formData,
        credentials: 'include'
      });

      if (res.ok) {
        setNewDeal({ title: '', description: '' });
        setSelectedFile(null);
        fetchPublicDeals();
        setSuccessMessage('Deal published successfully!');
        setTimeout(() => setSuccessMessage(null), 4000);
      } else {
        const errorData = await res.json();
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
      const res = await fetch(`/api/deals/${dealId}`, {
        method: 'DELETE',
        headers: { 'X-XSRF-TOKEN': getCsrfToken() },
        credentials: 'include'
      });

      if (res.ok) {
        fetchPublicDeals();
      } else {
        setErrorMessage("Unauthorized: You cannot delete this deal.");
      }
    } catch (e) { console.error(e); }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-tc-bg">
        <div className="flex items-center gap-3 text-tc-muted">
          <svg className="w-5 h-5 animate-spin text-tc-blue" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Loading secure profile...
        </div>
      </div>
    );
  }

  const rolesStr = (user.roles || []).map((r: any) => r.authority).join(', ');
  const isAdmin = rolesStr.includes('ADMIN');
  const isBusiness = rolesStr.includes('BUSINESS');
  const myEmail = user.username;

  const sectionVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <Layout onNavigateToAbout={onNavigateToAbout}>
      <div className="max-w-4xl w-full space-y-6 pb-20">

        {/* Header */}
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="tc-card p-5 flex justify-between items-center"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-tc-blue/10 border border-tc-blue/20 flex items-center justify-center font-bold text-tc-blue text-sm flex-shrink-0">
              {user.username?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-lg font-bold text-tc-text">{user.username}</h1>
              <span className="tc-badge bg-tc-elevated border-tc-border text-tc-muted font-mono text-[11px]">
                {rolesStr}
              </span>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleLogout}
            className="tc-btn-danger text-sm"
          >
            Log Out
          </motion.button>
        </motion.div>

        {/* Admin Zone */}
        {isAdmin && (
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.35, delay: 0.05, ease: 'easeOut' }}
            className="tc-card p-6 border-tc-purple/30"
          >
            <h2 className="text-base font-bold text-tc-purple mb-4 flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              Admin — All Users
            </h2>
            <div className="rounded-xl overflow-hidden border border-tc-border">
              <table className="min-w-full divide-y divide-tc-border">
                <thead className="bg-tc-elevated">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-tc-muted uppercase tracking-wider">Email</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-tc-muted uppercase tracking-wider">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-tc-border">
                  {usersList.map((u: any) => (
                    <tr key={u.id} className="hover:bg-tc-elevated transition-colors duration-150">
                      <td className="px-5 py-3.5 text-sm text-tc-text">{u.email}</td>
                      <td className="px-5 py-3.5">
                        <span className="tc-badge bg-tc-purple/10 border-tc-purple/30 text-tc-purple font-mono">
                          {u.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Business Zone */}
        {(isBusiness || isAdmin) && (
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.35, delay: 0.1, ease: 'easeOut' }}
            className="tc-card p-6 border-tc-blue/20"
          >
            <h2 className="text-base font-bold text-tc-blue mb-4 flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
              </svg>
              Business — Publish Deal
            </h2>

            <form onSubmit={handleCreateDeal} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  placeholder="Deal Title"
                  className="tc-input"
                  value={newDeal.title}
                  onChange={e => setNewDeal({ ...newDeal, title: e.target.value })}
                  required
                />
                <input
                  placeholder="Description"
                  className="tc-input"
                  value={newDeal.description}
                  onChange={e => setNewDeal({ ...newDeal, description: e.target.value })}
                  required
                />
              </div>

              <div className="flex items-center gap-4 bg-tc-elevated border border-dashed border-tc-border rounded-xl p-4">
                <div className="w-9 h-9 bg-tc-blue/10 border border-tc-blue/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-tc-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <label className="text-xs font-bold text-tc-muted uppercase tracking-wider block mb-1">
                    Attach Image (PNG / JPG only)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                    className="text-sm text-tc-muted file:hidden cursor-pointer"
                  />
                  {selectedFile && (
                    <span className="text-xs text-tc-emerald mt-1 block font-medium truncate">
                      {selectedFile.name}
                    </span>
                  )}
                </div>
              </div>

              <AnimatePresence>
                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 bg-tc-red/10 border border-tc-red/30 text-tc-red rounded-lg px-4 py-3 text-sm"
                  >
                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errorMessage}
                  </motion.div>
                )}
                {successMessage && (
                  <motion.div
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 bg-tc-emerald/10 border border-tc-emerald/30 text-tc-emerald rounded-lg px-4 py-3 text-sm"
                  >
                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {successMessage}
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.97 }}
                className="tc-btn-primary self-start px-8"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Publishing...
                  </span>
                ) : 'Publish Deal'}
              </motion.button>
            </form>
          </motion.div>
        )}

        {/* Public Feed */}
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.35, delay: 0.15, ease: 'easeOut' }}
          className="tc-card p-6"
        >
          <h2 className="text-base font-bold text-tc-text mb-5 flex items-center gap-2">
            <svg className="w-4 h-4 text-tc-muted" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16A8 8 0 0010 2zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clipRule="evenodd" />
            </svg>
            Public Deals Feed
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {deals.map((deal: any) => {
              const isOwner = deal.owner?.email === myEmail;
              const canDelete = isAdmin || isOwner;

              return (
                <motion.div
                  key={deal.id}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="bg-tc-elevated border border-tc-border rounded-2xl overflow-hidden flex flex-col group relative shadow-dark-sm hover:shadow-dark-md hover:border-tc-blue/30 transition-colors duration-200"
                >
                  {deal.imagePath ? (
                    <div className="h-44 w-full overflow-hidden">
                      <img
                        src={`/api/deals/images/${deal.imagePath}`}
                        alt={deal.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/400x200?text=Image+Unavailable'; }}
                      />
                    </div>
                  ) : (
                    <div className="h-44 w-full bg-tc-surface flex items-center justify-center border-b border-tc-border">
                      <svg className="w-12 h-12 text-tc-faint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                  )}

                  <div className="p-5 flex-grow">
                    <h3 className="font-bold text-tc-text mb-1.5 group-hover:text-tc-blue transition-colors duration-200">
                      {deal.title}
                    </h3>
                    <p className="text-tc-muted text-sm leading-relaxed line-clamp-2">
                      {deal.description}
                    </p>
                    <div className="mt-4 pt-4 border-t border-tc-border flex items-center gap-2">
                      <div className="w-5 h-5 bg-tc-blue/10 rounded-full flex items-center justify-center text-[9px] text-tc-blue font-bold flex-shrink-0">
                        {deal.owner?.fullName?.charAt(0) || 'U'}
                      </div>
                      <span className="text-[11px] uppercase tracking-widest text-tc-faint font-bold truncate">
                        {deal.owner?.fullName || deal.owner?.email}
                      </span>
                    </div>
                  </div>

                  {canDelete && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDeleteDeal(deal.id)}
                      className="absolute top-3 right-3 bg-tc-bg/80 backdrop-blur-sm text-tc-red hover:bg-tc-red hover:text-white p-2 rounded-full shadow-dark-sm transition-colors duration-200 opacity-0 group-hover:opacity-100"
                      title="Delete Deal"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </motion.button>
                  )}
                </motion.div>
              );
            })}

            {deals.length === 0 && (
              <div className="col-span-full text-center py-16 rounded-2xl border-2 border-dashed border-tc-border text-tc-faint">
                <svg className="w-10 h-10 mx-auto mb-3 text-tc-border" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-sm font-medium">No deals yet. Be the first to publish one.</p>
              </div>
            )}
          </div>
        </motion.div>

      </div>
    </Layout>
  );
};

export default Dashboard;
