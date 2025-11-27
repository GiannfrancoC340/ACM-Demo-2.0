import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function WhatsAppLinked() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const whatsappNumber = searchParams.get('whatsappNumber');
    const verified = searchParams.get('verified');

    console.log('[WhatsAppLinked] Mounted');
    console.log('[WhatsAppLinked] URL params:', { whatsappNumber, verified });

    // If no whatsappNumber in URL, just go back
    if (!whatsappNumber) {
      console.warn('[WhatsAppLinked] No whatsappNumber in URL, sending back to /settings');
      navigate('/settings', { replace: true });
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('[WhatsAppLinked] onAuthStateChanged fired. user =', user);

      if (!user) {
        console.warn('[WhatsAppLinked] No logged in user. Redirecting to /login');
        navigate('/login', { replace: true });
        return;
      }

      try {
        console.log('[WhatsAppLinked] Writing to Firestore for uid:', user.uid);
        await setDoc(
          doc(db, 'users', user.uid),
          {
            whatsappNumber: whatsappNumber,
            whatsappVerified: verified === 'true',
            whatsappNotificationsEnabled: true,
            whatsappConnectedAt: new Date().toISOString(),
          },
          { merge: true }
        );
        console.log('[WhatsAppLinked] Successfully saved WhatsApp info to Firestore');
      } catch (error) {
        console.error('[WhatsAppLinked] Error saving WhatsApp info:', error);
      }

      // Replace history so this callback page is not in back stack
      navigate('/settings', { replace: true });
    });

    return () => {
      console.log('[WhatsAppLinked] Cleanup unsubscribe');
      unsubscribe();
    };
  }, [searchParams, navigate]);

  return (
    <div style={{ 
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '30px',
      background: 'linear-gradient(135deg, #f0f4ff, #dfe9f3)'
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        textAlign: 'center',
        maxWidth: '500px'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>💬</div>
        <h2 style={{ color: '#25d366', marginBottom: '10px' }}>
          Linking your WhatsApp account...
        </h2>
        <p style={{ color: '#666' }}>
          Please wait, redirecting you back to Settings.
        </p>
        <div style={{
          marginTop: '20px',
          width: '100%',
          height: '4px',
          background: '#f0f0f0',
          borderRadius: '2px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: '100%',
            height: '100%',
            background: '#25d366',
            animation: 'loading 1.5s ease-in-out infinite'
          }}></div>
        </div>
      </div>
      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}