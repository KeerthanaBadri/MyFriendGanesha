import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { CheckCircle, Loader2 } from 'lucide-react';
import ReceiptCard from '../components/ReceiptCard';

const ReceiptView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [offering, setOffering] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOffering = async () => {
            try {
                const docRef = doc(db, "offerings", id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setOffering(docSnap.data());
                } else {
                    setError("Receipt not found");
                }
            } catch (err) {
                console.error("Error fetching receipt:", err);
                setError("Failed to load receipt");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchOffering();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-orange-50">
                <Loader2 className="w-10 h-10 text-orange-600 animate-spin mb-4" />
                <p className="text-orange-800 font-medium">Loading your receipt...</p>
            </div>
        );
    }

    if (error || !offering) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-orange-50 p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h2>
                    <p className="text-gray-600 mb-6">{error || "This receipt link is invalid."}</p>
                    <button
                        onClick={() => navigate('/login')}
                        className="w-full bg-orange-600 text-white font-bold py-3 rounded-xl hover:bg-orange-700 transition-colors"
                    >
                        Go to Home
                    </button>
                </div>
            </div>
        );
    }

    const dateStr = new Date(offering.timestamp).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const receiptNo = `ID-${id.slice(0, 9).toUpperCase()}`;

    return (
        <div
            className="min-h-screen bg-orange-50 flex items-center justify-center p-4 relative"
            style={{
                backgroundImage: `linear-gradient(rgba(255, 247, 237, 0.8), rgba(255, 247, 237, 0.85)), url('/ganesh-bg.png')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            }}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full max-w-md"
            >
                <div className="text-center mb-6">
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 border-2 border-green-200">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Verified Receipt</h2>
                </div>

                <ReceiptCard
                    mandapName={offering.mandapName}
                    receiptNo={receiptNo}
                    dateStr={dateStr}
                    name={offering.name}
                    gothram={offering.gothram}
                    rupees={offering.rupees}
                />

                <div className="mt-8 text-center">
                    <p className="text-gray-500 text-xs flex items-center justify-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-500" /> This is an electronically generated receipt
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default ReceiptView;
