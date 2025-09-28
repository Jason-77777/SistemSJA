import React, { useState, useEffect } from 'react';

const CountdownTimer = ({ expiryDate }) => {
  const calculateTimeLeft = () => {
    const difference = +new Date(expiryDate) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        Jam: Math.floor((difference / (1000 * 60 * 60)) % 24),
        Menit: Math.floor((difference / 1000 / 60) % 60),
        Detik: Math.floor((difference / 1000) % 60),
      };
    }
    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearTimeout(timer);
  });

  const timerComponents = Object.entries(timeLeft).map(([interval, value]) => {
    return <span key={interval}>{value.toString().padStart(2, '0')} {interval} </span>;
  });

  return (
    <div style={{ color: '#dc3545', fontWeight: 'bold', fontSize: '14px', margin: '10px 0' }}>
      {timerComponents.length ? (
        <span>Batas waktu pembayaran: {timerComponents}</span>
      ) : (
        <span>Waktu pembayaran habis! Jadwal akan segera dibatalkan.</span>
      )}
    </div>
  );
};

export default CountdownTimer;