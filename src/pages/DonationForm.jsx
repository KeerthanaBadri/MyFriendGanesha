import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { IndianRupee, MapPin, Phone, User, ScrollText, Sparkles, CheckCircle, History, Users, MessageCircle, MessageSquare, Calendar } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

const DonationForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        gothram: '',
        phone: '',
        address: '',
        rupees: ''
    });
    const [submitted, setSubmitted] = useState(false);
    const navigate = useNavigate();
    const role = localStorage.getItem('role');
    const mandapName = localStorage.getItem('mandapName');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Save to Firestore
            const currentUser = localStorage.getItem('currentUser') || 'anonymous';
            const mandapId = localStorage.getItem('mandapId');

            await addDoc(collection(db, "offerings"), {
                ...formData,
                submittedBy: currentUser,
                mandapId: mandapId,
                timestamp: new Date().toISOString()
            });

            setSubmitted(true);
        } catch (err) {
            console.error("Error adding document: ", err);
            // Optionally handle error state here
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            gothram: '',
            phone: '',
            address: '',
            rupees: ''
        });
        setSubmitted(false);
    };

    if (submitted) {
        const message = `Thank you ${formData.name} for donating ₹${formData.rupees} to ${mandapName}.` + (formData.gothram ? ` (Gothram: ${formData.gothram})` : '');
        const encodedMessage = encodeURIComponent(message);

        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-sm w-full"
                >
                    <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Offering Received!</h2>
                    <p className="text-gray-600 mb-8">Thank you for your generous contribution.</p>

                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <a
                            href={`https://wa.me/91${formData.phone}?text=${encodedMessage}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 p-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-semibold text-sm"
                        >
                            <MessageCircle className="w-4 h-4" /> WhatsApp
                        </a>
                        <a
                            href={`sms:${formData.phone}?&body=${encodedMessage}`}
                            className="flex items-center justify-center gap-2 p-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-semibold text-sm"
                        >
                            <MessageSquare className="w-4 h-4" /> SMS
                        </a>
                    </div>

                    <button
                        onClick={resetForm}
                        className="w-full bg-orange-600 text-white font-bold py-3 rounded-xl hover:bg-orange-700 transition-colors"
                    >
                        Add Another Offering
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen bg-orange-50 py-12 px-4 sm:px-6 lg:px-8 relative"
            style={{
                backgroundImage: `linear-gradient(rgba(255, 247, 237, 0.9), rgba(255, 247, 237, 0.95)), url('/ganesh-bg.png')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed'
            }}
        >
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-10 relative">
                    {/* Header Buttons */}
                    <div className="absolute top-4 left-4 md:top-8 md:left-8 flex gap-3 z-50">
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

                        {role === 'admin' && (
                            <button
                                onClick={() => navigate('/manage-users')}
                                className="p-2 bg-purple-100 rounded-full hover:bg-purple-200 text-purple-700 transition-colors flex items-center gap-2 px-4 shadow-sm"
                                title="Manage Staff"
                            >
                                <Users className="w-4 h-4" />
                                <span className="text-sm font-semibold">Staff</span>
                            </button>
                        )}

                        <button
                            onClick={() => navigate('/events')}
                            className="p-2 bg-blue-100 rounded-full hover:bg-blue-200 text-blue-700 transition-colors flex items-center gap-2 px-4 shadow-sm"
                            title="View Events"
                        >
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm font-semibold">Events</span>
                        </button>
                    </div>

                    <div className="flex items-center justify-center gap-4 mb-4">
                        <motion.div
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="flex items-center justify-center gap-2"
                        >
                            <Sparkles className="text-orange-600 w-6 h-6" />
                            <span className="text-orange-800 font-semibold tracking-wide uppercase text-sm">Devotional Offering</span>
                        </motion.div>
                    </div>

                    <button
                        onClick={() => navigate('/offerings')}
                        className="absolute top-4 right-4 md:top-8 md:right-8 p-2 bg-orange-100 rounded-full hover:bg-orange-200 text-orange-700 transition-colors"
                        title="View History"
                    >
                        <History className="w-5 h-5" />
                    </button>

                    {mandapName && (
                        <h2 className="text-xl font-semibold text-orange-800 mb-2 tracking-wide uppercase">{mandapName}</h2>
                    )}
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">New Offering Entry</h1>
                    <p className="text-lg text-gray-600 relative z-10">Please fill in the devotee's details below.</p>
                </div>

                <motion.form
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    onSubmit={handleSubmit}
                    className="glass-card rounded-2xl p-8 md:p-10 space-y-8 relative overflow-hidden"
                >
                    {/* Decorative side accent */}
                    <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-orange-400 to-red-600"></div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                <User className="w-4 h-4 text-orange-500" /> Devotee Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="Enter full name"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                <ScrollText className="w-4 h-4 text-orange-500" /> Gothram
                            </label>
                            <input
                                type="text"
                                name="gothram"
                                required
                                value={formData.gothram}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="Enter gothram"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                <Phone className="w-4 h-4 text-orange-500" /> Phone Number
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="Enter 10-digit number"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                <IndianRupee className="w-4 h-4 text-orange-500" /> Amount (Rupees)
                            </label>
                            <input
                                type="number"
                                name="rupees"
                                min="1"
                                value={formData.rupees}
                                onChange={handleChange}
                                className="input-field font-mono text-lg"
                                placeholder="₹ 0.00"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-orange-500" /> Address
                        </label>
                        <textarea
                            name="address"
                            rows="3"
                            required
                            value={formData.address}
                            onChange={handleChange}
                            className="input-field resize-none"
                            placeholder="Enter complete address"
                        />
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-orange-600 to-red-700 text-white font-bold py-4 rounded-xl hover:shadow-xl hover:translate-y-[-2px] transition-all duration-200 flex items-center justify-center gap-2 text-lg"
                        >
                            <Sparkles className="w-5 h-5" />
                            Submit Offering
                        </button>
                    </div>
                </motion.form>
            </div>
        </div>
    );
};

export default DonationForm;
