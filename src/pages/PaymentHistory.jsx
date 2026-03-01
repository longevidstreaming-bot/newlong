import React from 'react';
import PaymentHistory from '../components/payment/PaymentHistory';

export default function PaymentHistoryPage() {
  return (
    <div className="min-h-screen bg-[#121212] p-6">
      <div className="max-w-4xl mx-auto">
        <PaymentHistory />
      </div>
    </div>
  );
}