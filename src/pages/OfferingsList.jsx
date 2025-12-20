import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, Download, IndianRupee, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, orderBy, getDocs, where, limit, startAfter } from 'firebase/firestore';

const OfferingsList = () => {
    const [offerings, setOfferings] = useState([]);
    const [lastVisible, setLastVisible] = useState(null);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    const role = localStorage.getItem('role');
    const mandapId = localStorage.getItem('mandapId');
    const mandapName = localStorage.getItem('mandapName');

    const PAGE_SIZE = 20;

    const fetchOfferings = async (isLoadMore = false, passedSearchTerm = searchTerm) => {
        if (loading || (!hasMore && isLoadMore)) return;

        try {
            setLoading(true);

            let q;
            const collectionRef = collection(db, "offerings");
            const constraints = [where("mandapId", "==", mandapId)];

            // Server-side search logic
            if (passedSearchTerm.trim()) {
                const search = passedSearchTerm.trim();
                // Simple prefix search trick for Firestore
                constraints.push(where("name", ">=", search));
                constraints.push(where("name", "<=", search + '\uf8ff'));
            } else {
                constraints.push(orderBy("timestamp", "desc"));
            }

            if (isLoadMore && lastVisible) {
                q = query(collectionRef, ...constraints, startAfter(lastVisible), limit(PAGE_SIZE));
            } else {
                q = query(collectionRef, ...constraints, limit(PAGE_SIZE));
            }

            const querySnapshot = await getDocs(q);
            const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];

            const offeringsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            if (isLoadMore) {
                setOfferings(prev => [...prev, ...offeringsData]);
            } else {
                setOfferings(offeringsData);
            }

            setLastVisible(lastDoc);
            setHasMore(querySnapshot.docs.length === PAGE_SIZE);
        } catch (err) {
            console.error("Error fetching offerings: ", err);
        } finally {
            setLoading(false);
        }
    };

    // Debounced search effect
    useEffect(() => {
        if (!mandapId) return;

        const timer = setTimeout(() => {
            setLastVisible(null);
            setHasMore(true);
            fetchOfferings(false, searchTerm);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm, mandapId]);

    const totalAmount = offerings.reduce((sum, item) => sum + Number(item.rupees), 0);

    if (!mandapId) {
        return (
            <div className="min-h-screen bg-orange-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Update Required</h2>
                    <p className="text-gray-600 mb-6">
                        We have updated the system to support multiple Mandaps.
                        Please log out and log in again to sync your account.
                    </p>
                    <button
                        onClick={() => {
                            localStorage.removeItem('currentUser');
                            navigate('/login');
                        }}
                        className="w-full bg-orange-600 text-white font-bold py-3 rounded-xl hover:bg-orange-700 transition-colors"
                    >
                        Log In Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen bg-orange-50 py-8 px-4 sm:px-6 lg:px-8 relative"
            style={{
                backgroundImage: `linear-gradient(rgba(255, 247, 237, 0.7), rgba(255, 247, 237, 0.75)), url('/ganesh-bg.png')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed'
            }}
        >
            {/* Header Buttons */}
            <div className="absolute top-4 right-4 md:top-8 md:right-8 flex gap-3 z-50">
                {role === 'admin' && (
                    <div className="flex gap-2">
                        <button
                            onClick={() => navigate('/manage-users')}
                            className="p-2 bg-purple-100 rounded-full hover:bg-purple-200 text-purple-700 transition-colors flex items-center gap-2 px-4 shadow-sm"
                            title="Manage Staff"
                        >
                            <span className="text-sm font-semibold">Staff</span>
                        </button>
                        <button
                            onClick={() => navigate('/expenses')}
                            className="p-2 bg-green-100 rounded-full hover:bg-green-200 text-green-700 transition-colors flex items-center gap-2 px-4 shadow-sm"
                            title="Manage Expenses"
                        >
                            <IndianRupee className="w-4 h-4" />
                            <span className="text-sm font-semibold">Expenses</span>
                        </button>
                    </div>
                )}

                <button
                    onClick={() => {
                        localStorage.removeItem('currentUser');
                        navigate('/login');
                    }}
                    className="p-2 bg-red-100 rounded-full hover:bg-red-200 text-red-700 transition-colors flex items-center gap-2 px-4 shadow-sm"
                    title="Logout"
                >
                    <span className="text-sm font-semibold">Logout</span>
                </button>
            </div>

            <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => navigate('/donate')}
                        className="flex items-center text-orange-700 hover:text-orange-900 font-medium transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" /> Back to Form
                    </button>
                    <div className="text-right">
                        <p className="text-sm text-gray-500 uppercase tracking-widest font-semibold">Recent Total</p>
                        <p className="text-3xl font-bold text-green-700 font-mono">₹ {totalAmount.toLocaleString()}</p>
                        <p className="text-[10px] text-gray-400 font-semibold italic">*showing total of loaded records</p>
                    </div>
                </div>

                <div className="mb-8 text-center text-orange-900">
                    {mandapName && (
                        <h2 className="text-3xl font-bold text-orange-800 mb-3 tracking-wide uppercase">{mandapName}</h2>
                    )}
                    <h1 className="text-3xl font-bold text-gray-900">Offerings History (v2.0)</h1>
                    <p className="text-gray-500 mt-2">List of all devotees who have contributed</p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-orange-100">
                    {/* Search Bar */}
                    <div className="p-4 border-b border-orange-100 bg-orange-50/50">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by name directly from database..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-orange-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Table Header */}
                    <div className="grid grid-cols-12 gap-2 p-4 bg-orange-100/50 text-sm font-bold text-orange-900 border-b border-orange-200">
                        <div className="col-span-3">Devotee Name</div>
                        <div className="col-span-2">Gothram</div>
                        <div className="col-span-2">Submitted By</div>
                        <div className="col-span-3">Details</div>
                        <div className="col-span-2 text-right">Amount</div>
                    </div>

                    {/* List */}
                    <div className="divide-y divide-orange-50">
                        {offerings.length > 0 ? (
                            <>
                                {offerings.map((offering, index) => (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        key={offering.id}
                                        className="grid grid-cols-12 gap-2 p-4 items-center hover:bg-orange-50 transition-colors text-orange-900"
                                    >
                                        <div className="col-span-3 font-medium text-gray-900">
                                            {offering.name}
                                            <div className="text-xs text-gray-400 font-normal truncate" title={offering.phone}>{offering.phone}</div>
                                        </div>
                                        <div className="col-span-2 text-gray-600 text-sm">{offering.gothram}</div>
                                        <div className="col-span-2">
                                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700">
                                                {offering.submittedBy || 'Anonymous'}
                                            </span>
                                        </div>
                                        <div className="col-span-3 text-xs text-gray-400 truncate" title={offering.address}>
                                            {offering.address}
                                            <div className="flex items-center mt-1 text-gray-400">
                                                <Calendar className="w-3 h-3 mr-1" />
                                                {new Date(offering.timestamp).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div className="col-span-2 text-right font-bold text-green-700 font-mono">
                                            ₹ {Number(offering.rupees).toLocaleString()}
                                        </div>
                                    </motion.div>
                                ))}

                                {hasMore && (
                                    <div className="p-4 text-center bg-orange-50/30">
                                        <button
                                            onClick={() => fetchOfferings(true)}
                                            disabled={loading}
                                            className="px-6 py-2 bg-white border border-orange-200 text-orange-700 font-semibold rounded-lg hover:bg-orange-50 transition-colors shadow-sm disabled:opacity-50"
                                        >
                                            {loading ? 'Loading...' : 'Load More Devotees'}
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="p-12 text-center text-gray-500">
                                <p>{loading ? 'Loading...' : 'No offerings found matching your search.'}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OfferingsList;
