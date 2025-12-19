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
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();
    const role = localStorage.getItem('role');
    const mandapName = localStorage.getItem('mandapName');

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Special handling for phone - only allow digits and max 10 characters
        if (name === 'phone') {
            const numericValue = value.replace(/\D/g, '').slice(0, 10);
            setFormData({ ...formData, [name]: numericValue });
        }
        // Special handling for rupees - only allow positive numbers
        else if (name === 'rupees') {
            const numericValue = value.replace(/[^0-9]/g, '');
            setFormData({ ...formData, [name]: numericValue });
        }
        else {
            setFormData({ ...formData, [name]: value });
        }

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        } else if (formData.name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
        }

        if (!formData.gothram.trim()) {
            newErrors.gothram = 'Gothram is required';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!/^\d{10}$/.test(formData.phone.trim())) {
            newErrors.phone = 'Enter a valid 10-digit phone number';
        }

        if (!formData.rupees || parseFloat(formData.rupees) <= 0) {
            newErrors.rupees = 'Amount must be greater than 0';
        }

        if (!formData.address.trim()) {
            newErrors.address = 'Address is required';
        } else if (formData.address.trim().length < 5) {
            newErrors.address = 'Address must be at least 5 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

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
        setErrors({});
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
                backgroundImage: `linear-gradient(rgba(255, 247, 237, 0.7), rgba(255, 247, 237, 0.75)), url('/ganesh-bg.png')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed'
            }}
        >
            <div className="max-w-3xl mx-auto">
                {/* Top Navigation Bar */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex gap-3">
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

                    <button
                        onClick={() => navigate('/offerings')}
                        className="p-2 bg-orange-100 rounded-full hover:bg-orange-200 text-orange-700 transition-colors flex items-center gap-2 px-4 shadow-sm"
                        title="View History"
                    >
                        <History className="w-5 h-5" />
                        <span className="text-sm font-semibold">History</span>
                    </button>
                </div>

                <div className="text-center mb-10">
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

                    {mandapName && (
                        <div className="mb-4">
                            <h2 className="text-3xl font-bold text-orange-800 mb-1 tracking-wide uppercase">{mandapName}</h2>
                            <p className="text-orange-700 italic font-medium text-lg">"गणेश विघ्न हटाते नहीं, वे विवेक से नियंत्रित करते हैं"</p>
                        </div>
                    )}
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">New Offering Entry</h1>
                    <p className="text-lg text-gray-600">Please fill in the devotee's details below.</p>
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
                                className={`input-field ${errors.name ? 'border-red-500 focus:ring-red-200' : ''}`}
                                placeholder="Enter full name"
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                <ScrollText className="w-4 h-4 text-orange-500" /> Gothram
                            </label>
                            <input
                                type="text"
                                name="gothram"
                                value={formData.gothram}
                                onChange={handleChange}
                                className={`input-field ${errors.gothram ? 'border-red-500 focus:ring-red-200' : ''}`}
                                placeholder="Enter gothram"
                            />
                            {errors.gothram && <p className="text-red-500 text-xs mt-1">{errors.gothram}</p>}
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
                                className={`input-field ${errors.phone ? 'border-red-500 focus:ring-red-200' : ''}`}
                                placeholder="Enter 10-digit number"
                            />
                            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
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
                                className={`input-field font-mono text-lg ${errors.rupees ? 'border-red-500 focus:ring-red-200' : ''}`}
                                placeholder="₹ 0.00"
                            />
                            {errors.rupees && <p className="text-red-500 text-xs mt-1">{errors.rupees}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-orange-500" /> Address
                        </label>
                        <textarea
                            name="address"
                            rows="3"
                            value={formData.address}
                            onChange={handleChange}
                            className={`input-field resize-none ${errors.address ? 'border-red-500 focus:ring-red-200' : ''}`}
                            placeholder="Enter complete address"
                        />
                        {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
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
