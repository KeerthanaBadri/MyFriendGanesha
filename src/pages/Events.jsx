import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarPlus, Calendar, ArrowLeft, Trash2, Clock } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, orderBy } from 'firebase/firestore';

const Events = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        date: '',
        description: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const mandapId = localStorage.getItem('mandapId');
    const role = localStorage.getItem('role');
    const mandapName = localStorage.getItem('mandapName');

    useEffect(() => {
        fetchEvents();
    }, [mandapId]);

    const fetchEvents = async () => {
        if (!mandapId) return;
        try {
            const q = query(
                collection(db, "events"),
                where("mandapId", "==", mandapId)
            );
            const querySnapshot = await getDocs(q);
            const eventsList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            // Sort by date client-side
            eventsList.sort((a, b) => new Date(a.date) - new Date(b.date));
            setEvents(eventsList);
        } catch (err) {
            console.error("Error fetching events: ", err);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddEvent = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (formData.title.length < 3) {
            setError('Event title must be at least 3 characters');
            return;
        }

        if (!formData.date) {
            setError('Please select a date');
            return;
        }

        try {
            await addDoc(collection(db, "events"), {
                title: formData.title,
                date: formData.date,
                description: formData.description || '',
                mandapId: mandapId,
                createdAt: new Date().toISOString()
            });

            setSuccess('Event added successfully!');
            setFormData({ title: '', date: '', description: '' });
            fetchEvents();
        } catch (err) {
            console.error("Error adding event: ", err);
            setError('Failed to add event');
        }
    };

    const handleDeleteEvent = async (eventId) => {
        if (!window.confirm('Are you sure you want to delete this event?')) return;

        try {
            await deleteDoc(doc(db, "events", eventId));
            fetchEvents();
        } catch (err) {
            console.error("Error deleting event: ", err);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const isUpcoming = (dateString) => {
        return new Date(dateString) >= new Date().setHours(0, 0, 0, 0);
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
                    {mandapName && (
                        <h2 className="text-xl font-semibold text-orange-800 mb-2 tracking-wide uppercase">{mandapName}</h2>
                    )}
                    <h1 className="text-3xl font-bold text-gray-900">Event Schedule</h1>
                    <p className="text-gray-600 mt-2">
                        {role === 'admin' ? 'Manage events for your Mandap' : 'View upcoming events'}
                    </p>
                </div>

                <div className={`grid grid-cols-1 ${role === 'admin' ? 'md:grid-cols-2' : ''} gap-8`}>
                    {/* Add Event Form - Admin Only */}
                    {role === 'admin' && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="glass-card p-6 rounded-2xl"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-orange-100 rounded-full">
                                    <CalendarPlus className="w-6 h-6 text-orange-600" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-800">Add New Event</h2>
                            </div>

                            <form onSubmit={handleAddEvent} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        required
                                        value={formData.title}
                                        onChange={handleChange}
                                        className="input-field"
                                        placeholder="e.g., Ganesh Puja Day 1"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                    <input
                                        type="date"
                                        name="date"
                                        required
                                        value={formData.date}
                                        onChange={handleChange}
                                        className="input-field"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                                    <textarea
                                        name="description"
                                        rows="3"
                                        value={formData.description}
                                        onChange={handleChange}
                                        className="input-field resize-none"
                                        placeholder="Event details..."
                                    />
                                </div>

                                {error && <p className="text-red-500 text-sm">{error}</p>}
                                {success && <p className="text-green-600 text-sm">{success}</p>}

                                <button
                                    type="submit"
                                    className="w-full bg-orange-600 text-white font-bold py-3 rounded-xl hover:bg-orange-700 transition-colors"
                                >
                                    Add Event
                                </button>
                            </form>
                        </motion.div>
                    )}

                    {/* Events List */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`glass-card p-6 rounded-2xl ${role !== 'admin' ? 'md:col-span-1' : ''}`}
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-blue-100 rounded-full">
                                <Calendar className="w-6 h-6 text-blue-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">Upcoming Events</h2>
                        </div>

                        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                            {events.length > 0 ? (
                                events.map((event) => (
                                    <div
                                        key={event.id}
                                        className={`p-4 rounded-xl border ${isUpcoming(event.date)
                                                ? 'bg-white/80 border-orange-200'
                                                : 'bg-gray-50 border-gray-200 opacity-60'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900">{event.title}</h3>
                                                <div className="flex items-center gap-2 mt-1 text-sm text-orange-700">
                                                    <Clock className="w-4 h-4" />
                                                    {formatDate(event.date)}
                                                    {!isUpcoming(event.date) && (
                                                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">Past</span>
                                                    )}
                                                </div>
                                                {event.description && (
                                                    <p className="text-gray-500 text-sm mt-2">{event.description}</p>
                                                )}
                                            </div>
                                            {role === 'admin' && (
                                                <button
                                                    onClick={() => handleDeleteEvent(event.id)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete Event"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-gray-500 py-8">
                                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                    <p>No events scheduled yet.</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Events;
