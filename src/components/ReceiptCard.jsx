import React from 'react';
import { Flower, Sparkles } from 'lucide-react';

const ReceiptCard = ({ 
    mandapName, 
    receiptNo, 
    dateStr, 
    name, 
    gothram, 
    rupees,
    showPrintStyles = false 
}) => {
    return (
        <div
            id="receipt-content"
            className={`bg-white rounded-2xl shadow-2xl overflow-hidden border border-orange-100 relative ${
                showPrintStyles ? 'print:border-2 print:border-black print:rounded-none print:shadow-none' : ''
            }`}
        >
            {/* Decorative Header */}
            <div className={`bg-gradient-to-r from-orange-500 to-red-600 h-2 ${showPrintStyles ? 'print:hidden' : ''}`}></div>

            <div className="p-8 space-y-6">
                {/* Mandap Header */}
                <div className="text-center border-b border-orange-100 pb-6">
                    <Flower className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                    <h3 className="text-2xl font-bold text-orange-800 uppercase tracking-tight">
                        {mandapName || "Ganesh Mandap"}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-bold">
                        Devotional Offering Receipt
                    </p>
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
                            <span className="font-bold text-gray-900">{name}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm py-2 border-b border-gray-50">
                            <span className="text-gray-500 uppercase tracking-wider font-semibold">Gothram</span>
                            <span className="font-bold text-gray-900">{gothram}</span>
                        </div>
                        <div className="flex justify-between items-center py-4 bg-orange-50/50 px-4 rounded-xl">
                            <span className="text-orange-900 uppercase tracking-wider font-bold">Total Amount</span>
                            <span className="text-3xl font-black text-orange-700 font-mono">
                                ₹{Number(rupees).toLocaleString()}
                            </span>
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
    );
};

export default ReceiptCard;
