import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, Users, ArrowLeft, Trash2, Shield, User } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';

const ManageUsers = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const mandapId = localStorage.getItem('mandapId');
    const role = localStorage.getItem('role');
    const mandapName = localStorage.getItem('mandapName');

    useEffect(() => {
        if (role !== 'admin') {
            navigate('/donate');
            return;
        }
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const q = query(collection(db, "users"), where("mandapId", "==", mandapId));
            const querySnapshot = await getDocs(q);
            const usersList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setUsers(usersList);
        } catch (err) {
            console.error("Error fetching users: ", err);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (formData.username.length < 3) {
            setError('Username must be at least 3 characters');
            return;
        }
        if (formData.password.length < 4) {
            setError('Password must be at least 4 characters');
            return;
        }

        try {
            // Check availability
            const q = query(collection(db, "users"), where("username", "==", formData.username));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                setError('Username already exists');
                return;
            }

            // Create Staff User
            await addDoc(collection(db, "users"), {
                username: formData.username,
                password: formData.password,
                mandapId: mandapId,
                mandapName: mandapName,
                role: 'staff',
                createdAt: new Date().toISOString()
            });

            setSuccess('Staff user created successfully!');
            setFormData({ username: '', password: '' });
            fetchUsers();
        } catch (err) {
            console.error("Error adding user: ", err);
            setError('Failed to create user');
        }
    };

    return (
        <div
            className="min-h-screen bg-orange-50 py-8 px-4 sm:px-6 lg:px-8 relative"
            style={{
                backgroundImage: `linear-gradient(rgba(255, 247, 237, 0.9), rgba(255, 247, 237, 0.95)), url('/ganesh-bg.png')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed'
            }}
        >
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => navigate('/donate')}
                    className="flex items-center text-orange-700 hover:text-orange-900 font-medium transition-colors mb-6"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" /> Back to Dashboard
                </button>

                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-900">Manage Staff</h1>
                    <p className="text-gray-600 mt-2">{mandapName} - User Management</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Add User Form */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass-card p-6 rounded-2xl"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-orange-100 rounded-full">
                                <UserPlus className="w-6 h-6 text-orange-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">Add New Staff</h2>
                        </div>

                        <form onSubmit={handleAddUser} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    className="input-field"
                                    placeholder="Staff username"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <input
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="input-field"
                                    placeholder="Set password"
                                />
                            </div>

                            {error && <p className="text-red-500 text-sm">{error}</p>}
                            {success && <p className="text-green-600 text-sm">{success}</p>}

                            <button
                                type="submit"
                                className="w-full bg-orange-600 text-white font-bold py-3 rounded-xl hover:bg-orange-700 transition-colors"
                            >
                                Create Account
                            </button>
                        </form>
                    </motion.div>

                    {/* Users List */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass-card p-6 rounded-2xl"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-blue-100 rounded-full">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">Existing Users</h2>
                        </div>

                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                            {users.map((user) => (
                                <div key={user.id} className="flex items-center justify-between p-4 bg-white/50 rounded-xl border border-orange-100">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-full ${user.role === 'admin' ? 'bg-purple-100' : 'bg-gray-100'}`}>
                                            {user.role === 'admin' ?
                                                <Shield className={`w-4 h-4 ${user.role === 'admin' ? 'text-purple-600' : 'text-gray-600'}`} /> :
                                                <User className="w-4 h-4 text-gray-600" />
                                            }
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-800">{user.username}</p>
                                            <p className="text-xs text-gray-500 uppercase">{user.role}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default ManageUsers;
