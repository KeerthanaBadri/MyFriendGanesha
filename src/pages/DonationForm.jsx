import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { IndianRupee, MapPin, Phone, User, ScrollText, Sparkles, CheckCircle, History, Users, MessageCircle, MessageSquare, Calendar, Flower } from 'lucide-react';
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
        // Generate a random receipt number for visual effect
        const receiptNo = `OFF-${Math.floor(100000 + Math.random() * 900000)}`;
        const dateStr = new Date().toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const receiptMessage = `🙏 *Devotional Offering Receipt - ${mandapName}*

Receipt No: ${receiptNo}
Date: ${dateStr}

Devotee: ${formData.name}
Gothram: ${formData.gothram}
Amount: ₹${formData.rupees}

"Ganesha will bless you with wisdom and prosperity."

Thank you for your generous contribution to ${mandapName}! 🎉`;

        const encodedMessage = encodeURIComponent(receiptMessage);

        const handlePrint = () => {
            window.print();
        };

        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 print:bg-white print:p-0">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-full max-w-md print:shadow-none"
                >
                    {/* Success Icon (hidden on print) */}
                    <div className="text-center mb-6 print:hidden">
                        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Offering Submitted!</h2>
                    </div>

                    {/* Receipt Card */}
                    <div
                        id="receipt-content"
                        className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-orange-100 relative print:border-2 print:border-black print:rounded-none print:shadow-none"
                    >
                        {/* Decorative Header (hidden on print) */}
                        <div className="bg-gradient-to-r from-orange-500 to-red-600 h-2 print:hidden"></div>

                        <div className="p-8 space-y-6">
                            {/* Mandap Header */}
                            <div className="text-center border-b border-orange-100 pb-6">
                                <Flower className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                                <h3 className="text-2xl font-bold text-orange-800 uppercase tracking-tight">{mandapName}</h3>
                                <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest">Devotional Offering Receipt</p>
                            </div>

                            {/* Receipt Details */}
                            <div className="space-y-4">
                                <div className="flex justify-between text-xs text-gray-500 font-mono">
                                    <span>#{receiptNo}</span>
                                    <span>{dateStr}</span>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-sm py-2 border-b border-gray-50">
                                        <span className="text-gray-500 uppercase tracking-wider font-semibold">Devotee</span>
                                        <span className="font-bold text-gray-900">{formData.name}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm py-2 border-b border-gray-50">
                                        <span className="text-gray-500 uppercase tracking-wider font-semibold">Gothram</span>
                                        <span className="font-bold text-gray-900">{formData.gothram}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-4 bg-orange-50/50 px-4 rounded-xl">
                                        <span className="text-orange-900 uppercase tracking-wider font-bold">Total Amount</span>
                                        <span className="text-3xl font-black text-orange-700 font-mono">₹{Number(formData.rupees).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Quote */}
                            <div className="text-center px-4 py-4 bg-gray-50 rounded-xl relative overflow-hidden">
                                <Sparkles className="absolute top-2 left-2 w-4 h-4 text-orange-200" />
                                <p className="text-sm text-gray-600 italic leading-relaxed">
                                    "May Lord Ganesha shower his choicest blessings upon you and your family."
                                </p>
                                <Sparkles className="absolute bottom-2 right-2 w-4 h-4 text-orange-200" />
                            </div>

                            {/* Footer */}
                            <div className="text-center pt-4 opacity-50 text-[10px] uppercase tracking-[0.2em] font-bold">
                                Digital Receipt System
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons (hidden on print) */}
                    <div className="mt-8 space-y-3 print:hidden">
                        <div className="grid grid-cols-2 gap-3">
                            <a
                                href={`https://wa.me/91${formData.phone}?text=${encodedMessage}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 p-4 bg-green-500 text-white rounded-2xl hover:bg-green-600 transition-all font-bold shadow-lg hover:shadow-xl hover:-translate-y-1"
                            >
                                <MessageCircle className="w-5 h-5" /> WhatsApp
                            </a>
                            <a
                                href={`sms:${formData.phone}?&body=${encodedMessage}`}
                                className="flex items-center justify-center gap-2 p-4 bg-blue-500 text-white rounded-2xl hover:bg-blue-600 transition-all font-bold shadow-lg hover:shadow-xl hover:-translate-y-1"
                            >
                                <MessageSquare className="w-5 h-5" /> SMS
                            </a>
                        </div>

                        <button
                            onClick={handlePrint}
                            className="w-full flex items-center justify-center gap-2 py-4 bg-white border-2 border-orange-200 text-orange-700 font-bold rounded-2xl hover:bg-orange-50 transition-all shadow-md hover:shadow-lg"
                        >
                            <ScrollText className="w-5 h-5" /> Print/Save Receipt
                        </button>

                        <button
                            onClick={resetForm}
                            className="w-full py-4 text-gray-500 font-semibold hover:text-orange-600 transition-colors"
                        >
                            Add Another Offering
                        </button>
                    </div>
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
