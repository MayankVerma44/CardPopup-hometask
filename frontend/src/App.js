import React, { useState, useEffect } from 'react';
import axios from 'axios';

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minHeight: '100vh',
    padding: '15px',
    backgroundColor: '#f5f5f5'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '30px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    textAlign: 'center'
  },
  heading: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: '50px',
    textAlign: 'center'
  },
  input: {
    width: '100%',
    padding: '14px 5px',
    marginBottom: '15px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px'
  },
  button: {
    width: '100%',
    padding: '14px 20px',
    backgroundColor: '#635bff',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    marginTop: '20px'
  },
  buttonHover: {
    backgroundColor: '#4b44d1'
  },
  buttonDisabled: {
    backgroundColor: '#a5a5a5',
    cursor: 'not-allowed'
  },
  error: {
    backgroundColor: '#fff2f2',
    color: '#ff4444',
    padding: '12px',
    borderRadius: '6px',
    marginTop: '16px',
    fontSize: '14px'
  },
  success: {
    backgroundColor: '#f0fff4',
    color: '#48bb78',
    padding: '12px',
    borderRadius: '6px',
    marginTop: '16px',
    fontSize: '14px'
  },
  thankYouContainer: {
    textAlign: 'center',
    marginTop: '20px'
  },
  checkmark: {
    fontSize: '48px',
    color: '#48bb78',
    marginBottom: '20px'
  },
  thankYouHeading: {
    fontSize: '24px',
    color: '#2d3748',
    marginBottom: '12px'
  },
  thankYouMessage: {
    color: '#4a5568',
    marginBottom: '24px'
  },
  orderDetails: {
    backgroundColor: '#f7fafc',
    padding: '16px',
    borderRadius: '8px',
    marginTop: '20px'
  },
  orderInfo: {
    fontSize: '14px',
    color: '#4a5568',
    marginBottom: '8px'
  }
};

const PaymentApp = () => {
  const [orderToken, setOrderToken] = useState('');
  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('');

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://sandbox-merchant.revolut.com/embed.js';
    script.async = true;
    script.onload = () => console.log('Revolut Checkout script loaded successfully');
    script.onerror = () => console.log('Revolut Checkout script failed to load');
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const createOrder = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:5000/api/create-order', {
        amount: amount,
        currency: 'GBP',
        email: email
      });

      if (response.status !== 200) {
        throw new Error('Order creation failed');
      }

      const data = response.data;
      setOrderToken(data.token);
      initializePayment(data.token);
    } catch (error) {
      setError('Failed to create order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const initializePayment = async (token) => {
    if (!token) {
      setError('Invalid payment token');
      return;
    }

    try {
      if (typeof window.RevolutCheckout === 'undefined') {
        throw new Error('Revolut Checkout not loaded');
      }

      const instance = await window.RevolutCheckout(token);
      
      instance.payWithPopup({
        locale: 'en',
        mode: 'popup',
        email: email,
        features: {
          customerEmailRequired: true,
        },
        onSuccess(...args) {
          setPaymentComplete(true);
          setPaymentStatus('success');
          console.log('Payment successful. Callback arguments:', args);
        },
        onError(error) {
          setPaymentComplete(true);
          setPaymentStatus('error');
          setError(`Payment failed: ${error.message}`);
        },
        onCancel() {
          setPaymentComplete(true);
          setPaymentStatus('cancelled');
          setError('Payment was cancelled');
        }
      });

    } catch (error) {
      setError(`Failed to initialize payment: ${error.message}`);
    }
  };

  const ThankYouPage = () => (
    <div style={styles.thankYouContainer}>
      {paymentStatus === 'success' && (
        <>
          <div style={styles.checkmark}>✓</div>
          <h2 style={styles.thankYouHeading}>Thank You!</h2>
          <p style={styles.thankYouMessage}>Your payment was successful.</p>
          <div style={styles.orderDetails}>
            <p style={styles.orderInfo}>Amount Paid: £{amount}.00</p>
            <p style={styles.orderInfo}>Email: {email}</p>
            <p style={styles.orderInfo}>Transaction Status: Completed</p>
          </div>
        </>
      )}
      
      {paymentStatus === 'error' && (
        <>
          <div style={{...styles.checkmark, color: '#ff4444'}}>✗</div>
          <h2 style={styles.thankYouHeading}>Payment Failed</h2>
          <div style={styles.error}>{error}</div>
        </>
      )}
      
      {paymentStatus === 'cancelled' && (
        <>
          <div style={{...styles.checkmark, color: '#f6ad55'}}>⚠</div>
          <h2 style={styles.thankYouHeading}>Payment Cancelled</h2>
          <p style={styles.thankYouMessage}>Your payment was cancelled.</p>
        </>
      )}
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.heading}>Card Payment Implementation</h1>

        {!paymentComplete ? (
          <>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
            />
            <input
              type="number"
              placeholder="Enter amount (GBP)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={styles.input}
              required
            />
            <button
              onClick={createOrder}
              disabled={isLoading}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              style={{
                ...styles.button,
                ...(isHovered && !isLoading ? styles.buttonHover : {}),
                ...(isLoading ? styles.buttonDisabled : {})
              }}
            >
              {isLoading ? 'Processing...' : `Pay Now`}
            </button>
          </>
        ) : (
          <ThankYouPage />
        )}

        {!paymentComplete && error && (
          <div style={styles.error}>
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentApp;
