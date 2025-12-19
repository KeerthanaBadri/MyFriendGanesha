import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Flower, Lock, User } from 'lucide-react';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const q = query(collection(db, "users"), where("username", "==", username), where("password", "==", password));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const userData = querySnapshot.docs[0].data();

                // Fetch Mandap Name from 'mandaps' collection (Normalization)
                let mandapName = '';
                if (userData.mandapId) {
                    const mandapDocRef = doc(db, "mandaps", userData.mandapId);
                    const mandapDoc = await getDoc(mandapDocRef);
                    if (mandapDoc.exists()) {
                        mandapName = mandapDoc.data().name;
                    }
                }

                localStorage.setItem('currentUser', userData.username);
                localStorage.setItem('mandapId', userData.mandapId || 'default');
                localStorage.setItem('role', userData.role || 'staff');
                localStorage.setItem('mandapName', mandapName); // Store fetched name
                navigate('/donate');
            } else {
                setError('Invalid credentials');
            }
        } catch (err) {
            console.error("Error logging in: ", err);
            setError('Login failed. Please try again.');
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
                <div className="text-center mb-8">
                    <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                        <Flower className="w-8 h-8 text-orange-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
                    <p className="text-gray-500">Sign in to manage offerings</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 block">Username</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="input-field pl-10"
                                placeholder="Enter username"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 block">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input-field pl-10"
                                placeholder="Enter password"
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
                        Sign In
                    </button>

                    <div className="text-center mt-4">
                        <p className="text-sm text-gray-600">
                            Don't have an account?{' '}
                            <button
                                type="button"
                                onClick={() => navigate('/register')}
                                className="text-orange-600 hover:text-orange-700 font-semibold hover:underline"
                            >
                                Register here
                            </button>
                        </p>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default Login;
