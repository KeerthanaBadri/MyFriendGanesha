import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { IndianRupee, Tag, Calendar, Plus, Trash2, ArrowLeft, Loader2, Filter, Receipt, TrendingDown, ClipboardList } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, query, where, orderBy, getDocs, deleteDoc, doc, limit, startAfter } from 'firebase/firestore';

const ExpenseManager = () => {
    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        category: 'Rituals',
        date: new Date().toISOString().split('T')[0]
    });
    const [expenses, setExpenses] = useState([]);
    const [totalExpenses, setTotalExpenses] = useState(0);
    const [totalCollections, setTotalCollections] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [lastVisible, setLastVisible] = useState(null);
    const [hasMore, setHasMore] = useState(false);
    const [error, setError] = useState(null);

    const navigate = useNavigate();
    const mandapId = localStorage.getItem('mandapId');
    const role = localStorage.getItem('role');

    const categories = ['Rituals', 'Food', 'Decoration', 'Electricity', 'Maintenance', 'Publicity', 'Other'];

    useEffect(() => {
        if (role !== 'admin') {
            navigate('/donate');
            return;
        }
        fetchExpenses();
        fetchTotalExpenses();
        fetchTotalCollections();
    }, [role, mandapId]);

    const fetchTotalCollections = async () => {
        if (!mandapId) return;
        try {
            const q = query(collection(db, "offerings"), where("mandapId", "==", mandapId));
            const querySnapshot = await getDocs(q);
            const total = querySnapshot.docs.reduce((acc, doc) => acc + Number(doc.data().rupees || 0), 0);
            setTotalCollections(total);
        } catch (err) {
            console.error("Error fetching total collections:", err);
        }
    };

    const fetchTotalExpenses = async () => {
        try {
            const q = query(collection(db, "expenses"), where("mandapId", "==", mandapId));
            const querySnapshot = await getDocs(q);
            const total = querySnapshot.docs.reduce((acc, doc) => acc + Number(doc.data().amount), 0);
            setTotalExpenses(total);
        } catch (err) {
            console.error("Error fetching total expenses:", err);
        }
    };

    const fetchExpenses = async (isLoadMore = false) => {
        setLoading(!isLoadMore);
        setError(null);
        try {
            // Fetch everything for the mandap and sort in memory for now
            // This avoids "Missing Index" errors which block the list from loading
            const q = query(
                collection(db, "expenses"),
                where("mandapId", "==", mandapId)
            );

            const querySnapshot = await getDocs(q);
            let allExpenses = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                // Ensure amount is a number for sorting/display
                amount: Number(doc.data().amount)
            }));

            // Sort by date (desc) then by timestamp (desc) to show newest first
            allExpenses.sort((a, b) => {
                const dateCompare = (b.date || '').localeCompare(a.date || '');
                if (dateCompare !== 0) return dateCompare;
                return (b.timestamp || '').localeCompare(a.timestamp || '');
            });

            setExpenses(allExpenses);
            setHasMore(false); // Disable pagination since we're loading all for reliability
        } catch (err) {
            console.error("Error fetching expenses:", err);
            setError("Failed to load expenses. Please check your internet connection.");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.description || !formData.amount || !formData.date) return;

        setSubmitting(true);
        try {
            const newExpense = {
                ...formData,
                amount: Number(formData.amount),
                mandapId: mandapId,
                createdBy: localStorage.getItem('currentUser'),
                timestamp: new Date().toISOString()
            };

            await addDoc(collection(db, "expenses"), newExpense);

            setFormData({
                description: '',
                amount: '',
                category: 'Rituals',
                date: new Date().toISOString().split('T')[0]
            });

            fetchExpenses();
            fetchTotalExpenses();
            fetchTotalCollections();
        } catch (err) {
            console.error("Error adding expense:", err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this expense?")) return;

        try {
            await deleteDoc(doc(db, "expenses", id));
            setExpenses(prev => prev.filter(exp => exp.id !== id));
            fetchTotalExpenses();
            fetchTotalCollections();
        } catch (err) {
            console.error("Error deleting expense:", err);
        }
    };

    return (
        <div className="min-h-screen bg-[#fffcf9] pb-12">
            {/* Header */}
            <div className="bg-white border-b border-orange-100 sticky top-0 z-30 px-4 py-4 shadow-sm">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/donate')}
                            className="p-2 hover:bg-orange-50 rounded-full text-orange-600 transition-colors"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Expense Manager</h1>
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Track Mandap Spending</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex flex-col items-end px-3 border-r border-orange-100 text-right">
                            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">Collected</span>
                            <span className="text-sm font-bold text-green-700">₹{totalCollections.toLocaleString()}</span>
                        </div>
                        <div className="hidden sm:flex flex-col items-end px-3 border-r border-orange-100 text-right">
                            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">Spent</span>
                            <span className="text-sm font-bold text-red-600">₹{totalExpenses.toLocaleString()}</span>
                        </div>
                        <div className="bg-orange-50 px-4 py-1.5 rounded-full border border-orange-100 flex flex-col items-center">
                            <span className="text-[10px] text-orange-600 uppercase font-bold tracking-tighter">Balance</span>
                            <span className={`text-sm font-black ${(totalCollections - totalExpenses) >= 0 ? 'text-orange-900' : 'text-red-700'}`}>
                                ₹{(totalCollections - totalExpenses).toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-5xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Section */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl p-6 shadow-xl border border-orange-50 sticky top-24">
                        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Plus className="w-5 h-5 text-orange-600" /> Record New Expense
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Item/Description</label>
                                <input
                                    type="text"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="e.g., Flowers for Puja"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Amount (₹)</label>
                                <div className="relative">
                                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="number"
                                        name="amount"
                                        value={formData.amount}
                                        onChange={handleChange}
                                        className="input-field pl-10"
                                        placeholder="0"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Category</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="input-field appearance-none"
                                >
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleChange}
                                        className="input-field pl-10"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-orange-600 text-white font-bold py-3 rounded-xl hover:bg-orange-700 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                            >
                                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Plus className="w-5 h-5" /> Save Expense</>}
                            </button>
                        </form>
                    </div>
                </div>

                {/* List Section */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <ClipboardList className="w-5 h-5 text-orange-600" /> Recent Expenses
                        </h2>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-orange-50">
                            <Loader2 className="w-10 h-10 text-orange-600 animate-spin mb-4" />
                            <p className="text-gray-500">Loading expenses...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-10 bg-red-50 rounded-2xl border border-red-100">
                            <p className="text-red-600 font-medium">{error}</p>
                            <button
                                onClick={() => fetchExpenses()}
                                className="mt-4 text-sm font-bold text-red-700 underline"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : expenses.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-orange-50">
                            <Receipt className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                            <p className="text-gray-500">No expenses recorded yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <AnimatePresence>
                                {expenses.map((exp) => (
                                    <motion.div
                                        key={exp.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="bg-white p-5 rounded-2xl shadow-sm border border-orange-50 flex items-center justify-between hover:shadow-md transition-shadow group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600">
                                                <Tag className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900">{exp.description}</h3>
                                                <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                                    <span className="bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">{exp.category}</span>
                                                    <span>•</span>
                                                    <span>{new Date(exp.date).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6">
                                            <div className="text-right">
                                                <span className="text-lg font-black text-gray-900">₹{Number(exp.amount).toLocaleString()}</span>
                                            </div>
                                            <button
                                                onClick={() => handleDelete(exp.id)}
                                                className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {hasMore && (
                                <button
                                    onClick={() => fetchExpenses(true)}
                                    className="w-full py-4 bg-white border border-gray-100 rounded-2xl text-gray-500 font-bold hover:bg-gray-50 transition-colors"
                                >
                                    Load More Expenses
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ExpenseManager;
