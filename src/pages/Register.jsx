import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, Lock, User, ArrowLeft, Building2 } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, query, where, getDocs, doc, setDoc } from 'firebase/firestore';

const Register = () => {
    const [formData, setFormData] = useState({
        mandapName: '',
        username: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        // Validate empty fields first
        if (!formData.mandapName.trim()) {
            setError('Mandap Name is required');
            return;
        }
        if (!formData.username.trim()) {
            setError('Username is required');
            return;
        }
        if (!formData.password.trim()) {
            setError('Password is required');
            return;
        }
        if (!formData.confirmPassword.trim()) {
            setError('Please confirm your password');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.username.length < 3) {
            setError('Username must be at least 3 characters');
            return;
        }

        if (formData.password.length < 4) {
            setError('Password must be at least 4 characters');
            return;
        }

        if (formData.mandapName.length < 3) {
            setError('Mandap Name must be at least 3 characters');
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

            // Generate a unique Mandap ID
            const mandapId = crypto.randomUUID();

            // Create Mandap Document (Normalized Data)
            await setDoc(doc(db, "mandaps", mandapId), {
                name: formData.mandapName,
                createdBy: formData.username,
                createdAt: new Date().toISOString()
            });

            // Save to Firestore as Admin (Linked to Mandap)
            await addDoc(collection(db, "users"), {
                username: formData.username,
                password: formData.password,
                mandapId: mandapId, // Only store ID, Name is in mandaps collection
                role: 'admin',
                createdAt: new Date().toISOString()
            });

            navigate('/login');
        } catch (err) {
            console.error("Error adding document: ", err);
            setError('Registration failed. Please try again.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-100 via-orange-50 to-red-50 relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-red-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card w-full max-w-md p-8 rounded-2xl relative z-10"
            >
                <Link to="/login" className="flex items-center text-orange-600 hover:text-orange-700 mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back to Login
                </Link>

                <div className="text-center mb-8">
                    <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                        <UserPlus className="w-8 h-8 text-orange-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Register Mandap</h1>
                    <p className="text-gray-500">Create your Mandap Admin Account</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-6">

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 block">Mandap Name</label>
                        <div className="relative">
                            <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                name="mandapName"
                                required
                                value={formData.mandapName}
                                onChange={handleChange}
                                className="input-field pl-10"
                                placeholder="Ex. Ganesh Mandal 2024"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 block">Username (Admin)</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                name="username"
                                required
                                value={formData.username}
                                onChange={handleChange}
                                className="input-field pl-10"
                                placeholder="Choose a username"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 block">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="password"
                                name="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="input-field pl-10"
                                placeholder="Create password"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 block">Confirm Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="password"
                                name="confirmPassword"
                                required
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="input-field pl-10"
                                placeholder="Confirm password"
                            />
                        </div>
                    </div>

                    {error && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-red-500 text-sm text-center"
                        >
                            {error}
                        </motion.p>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold py-3 rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
                    >
                        Register Mandap
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default Register;
