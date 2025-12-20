import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarPlus, Calendar, ArrowLeft, Trash2, Clock, Send, X, Copy, Check, MessageSquare } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, orderBy } from 'firebase/firestore';

const Events = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [lastVisibleEvent, setLastVisibleEvent] = useState(null);
    const [hasMoreEvents, setHasMoreEvents] = useState(true);
    const [loadingEvents, setLoadingEvents] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        date: '',
        description: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showNotifyModal, setShowNotifyModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [devotees, setDevotees] = useState([]);
    const [copied, setCopied] = useState(false);
    const [loadingDevotees, setLoadingDevotees] = useState(false);
    const [sendingToAll, setSendingToAll] = useState(false);
    const [sendProgress, setSendProgress] = useState(0);

    const mandapId = localStorage.getItem('mandapId');
    const role = localStorage.getItem('role');
    const mandapName = localStorage.getItem('mandapName');

    const PAGE_SIZE = 5;

    useEffect(() => {
        fetchEvents();
    }, [mandapId]);

    const fetchEvents = async (isLoadMore = false) => {
        if (!mandapId || (loadingEvents) || (!hasMoreEvents && isLoadMore)) return;

        try {
            setLoadingEvents(true);
            let q;
            const collectionRef = collection(db, "events");
            const constraints = [
                where("mandapId", "==", mandapId),
                orderBy("date", "asc")
            ];

            if (isLoadMore && lastVisibleEvent) {
                q = query(collectionRef, ...constraints, startAfter(lastVisibleEvent), limit(PAGE_SIZE));
            } else {
                q = query(collectionRef, ...constraints, limit(PAGE_SIZE));
            }

            const querySnapshot = await getDocs(q);
            const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];

            const eventsList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            if (isLoadMore) {
                setEvents(prev => [...prev, ...eventsList]);
            } else {
                setEvents(eventsList);
            }

            setLastVisibleEvent(lastDoc);
            setHasMoreEvents(querySnapshot.docs.length === PAGE_SIZE);
        } catch (err) {
            console.error("Error fetching events: ", err);
        } finally {
            setLoadingEvents(false);
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

    const [lastVisibleDevotee, setLastVisibleDevotee] = useState(null);
    const [hasMoreDevotees, setHasMoreDevotees] = useState(true);

    const DEVOTEE_PAGE_SIZE = 50;

    const fetchDevotees = async (isLoadMore = false) => {
        if (loadingDevotees || (!hasMoreDevotees && isLoadMore)) return;
        setLoadingDevotees(true);
        try {
            let q;
            const collectionRef = collection(db, "offerings");
            const constraints = [where("mandapId", "==", mandapId)];

            if (isLoadMore && lastVisibleDevotee) {
                q = query(collectionRef, ...constraints, startAfter(lastVisibleDevotee), limit(DEVOTEE_PAGE_SIZE));
            } else {
                q = query(collectionRef, ...constraints, limit(DEVOTEE_PAGE_SIZE));
            }

            const querySnapshot = await getDocs(q);
            const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];

            const phoneNumbers = new Set(isLoadMore ? devotees : []);
            querySnapshot.docs.forEach(doc => {
                const phone = doc.data().phone;
                if (phone && phone.length >= 10) {
                    phoneNumbers.add(phone);
                }
            });

            setDevotees(Array.from(phoneNumbers));
            setLastVisibleDevotee(lastDoc);
            setHasMoreDevotees(querySnapshot.docs.length === DEVOTEE_PAGE_SIZE);
        } catch (err) {
            console.error("Error fetching devotees: ", err);
        } finally {
            setLoadingDevotees(false);
        }
    };

    const handleNotifyDevotees = async (event) => {
        setSelectedEvent(event);
        setShowNotifyModal(true);
        setCopied(false);
        await fetchDevotees();
    };

    const buildNotificationMessage = () => {
        if (!selectedEvent) return '';
        return `${mandapName || 'Mandap'} - Event Notification\n\n${selectedEvent.title}\nDate: ${formatDate(selectedEvent.date)}\n${selectedEvent.description ? `\nNote: ${selectedEvent.description}` : ''}\n\nYou are cordially invited!`;
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(buildNotificationMessage());
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    };

    const closeModal = () => {
        setShowNotifyModal(false);
        setSelectedEvent(null);
        setDevotees([]);
        setSendingToAll(false);
        setSendProgress(0);
    };

    const sendToAllDevotees = async () => {
        if (devotees.length === 0) return;

        const message = encodeURIComponent(buildNotificationMessage());

        // Detect OS for correct SMS separator
        // iOS/Mac uses comma (,), Android/others use semicolon (;)
        const isIOS = /iPad|iPhone|iPod|Macintosh/.test(navigator.userAgent);
        const separator = isIOS ? ',' : ';';

        // Combine all phone numbers with country code prefix
        const combinedPhones = devotees.map(phone => `+91${phone}`).join(separator);

        // Open a single link with all recipients
        window.open(`sms:${combinedPhones}?body=${message}`, '_blank');

        setSendProgress(devotees.length);
        setTimeout(() => setSendProgress(0), 2000);
    };

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
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <button
                        onClick={() => navigate('/donate')}
                        className="flex items-center text-orange-700 hover:text-orange-900 font-medium transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" /> Back to Dashboard
                    </button>
                    {role === 'admin' && (
                        <button
                            onClick={() => navigate('/expenses')}
                            className="p-2 bg-green-100 rounded-full hover:bg-green-200 text-green-700 transition-colors flex items-center gap-2 px-4 shadow-sm"
                        >
                            <IndianRupee className="w-4 h-4" />
                            <span className="text-sm font-semibold">Expenses</span>
                        </button>
                    )}
                </div>

                <div className="mb-8 text-center">
                    {mandapName && (
                        <h2 className="text-3xl font-bold text-orange-800 mb-3 tracking-wide uppercase">{mandapName}</h2>
                    )}
                    <h1 className="text-3xl font-bold text-gray-900">Event Schedule</h1>
                    <p className="text-sm text-orange-600 italic mt-2 max-w-lg mx-auto leading-relaxed">
                        "Ganesha does not remove every obstacle; he places some to protect you and removes others to guide you"
                    </p>
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
                                                <div className="flex gap-1">
                                                    {isUpcoming(event.date) && (
                                                        <button
                                                            onClick={() => handleNotifyDevotees(event)}
                                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                            title="Send to Devotees"
                                                        >
                                                            <Send className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDeleteEvent(event.id)}
                                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete Event"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
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
                            {hasMoreEvents && (
                                <button
                                    onClick={() => fetchEvents(true)}
                                    disabled={loadingEvents}
                                    className="w-full py-3 bg-white border border-orange-100 text-orange-700 font-semibold rounded-xl hover:bg-orange-50 transition-colors disabled:opacity-50 mt-4"
                                >
                                    {loadingEvents ? 'Loading...' : 'Load More Events'}
                                </button>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Notification Modal */}
            {showNotifyModal && selectedEvent && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 pt-20"
                    onClick={closeModal}
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-4 p-6 pb-0">
                            <h3 className="text-xl font-bold text-gray-900">Send to Devotees</h3>
                            <button
                                onClick={closeModal}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto">
                            {/* Message Preview */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Message to Send</label>
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 whitespace-pre-wrap text-sm">
                                    {buildNotificationMessage()}
                                </div>
                                <button
                                    onClick={copyToClipboard}
                                    className={`mt-3 w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl font-semibold transition-all ${copied
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                                        }`}
                                >
                                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    {copied ? 'Copied!' : 'Copy Message'}
                                </button>
                            </div>

                            {/* Devotee List */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Loaded Devotees ({devotees.length})
                                    </label>
                                    {devotees.length > 0 && !loadingDevotees && (
                                        <button
                                            onClick={sendToAllDevotees}
                                            disabled={sendingToAll}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${sendingToAll
                                                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                                : 'bg-green-600 text-white hover:bg-green-700'
                                                }`}
                                        >
                                            <Send className="w-4 h-4" />
                                            {sendingToAll
                                                ? `Opening Messages...`
                                                : 'Send Group SMS'
                                            }
                                        </button>
                                    )}
                                </div>

                                {sendingToAll && (
                                    <div className="mb-3">
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `100%` }}
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 text-center mt-1">
                                            Preparing Group Message...
                                        </p>
                                    </div>
                                )}

                                {loadingDevotees ? (
                                    <div className="text-center py-8 text-gray-500">
                                        Loading devotees...
                                    </div>
                                ) : (
                                    <>
                                        <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
                                            {devotees.map((phone, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                                                >
                                                    <span className="font-mono text-sm">{phone}</span>
                                                    <a
                                                        href={`sms:+91${phone}?body=${encodeURIComponent(buildNotificationMessage())}`}
                                                        className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm font-semibold hover:bg-green-600 transition-colors"
                                                    >
                                                        <MessageSquare className="w-3 h-3" />
                                                        Send SMS
                                                    </a>
                                                </div>
                                            ))}

                                            {hasMoreDevotees && (
                                                <button
                                                    onClick={() => fetchDevotees(true)}
                                                    disabled={loadingDevotees}
                                                    className="w-full py-2 bg-gray-100 text-gray-600 font-semibold rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 text-sm"
                                                >
                                                    {loadingDevotees ? 'Loading...' : 'Load More Devotees'}
                                                </button>
                                            )}
                                        </div>

                                        {!loadingDevotees && devotees.length === 0 && (
                                            <div className="text-center py-8 text-gray-500">
                                                <p>No devotees found for this mandap.</p>
                                                <p className="text-sm mt-1">Devotees are added when they make offerings.</p>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )
            }
        </div >
    );
};

export default Events;
