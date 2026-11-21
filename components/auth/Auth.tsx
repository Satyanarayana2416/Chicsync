import React, { useState } from 'react';
import App from '../../App';
import LoginPage from './LoginPage';
import SignupPage from './SignupPage';
import { translations } from '../../lib/translations';
import { useAuth } from '../../contexts/AuthContext';
import { SparklesIcon } from '../icons/SparklesIcon';

const Auth: React.FC = () => {
    const { user, isLoading } = useAuth();
    const [view, setView] = useState<'login' | 'signup'>('login');
    const [signupSuccess, setSignupSuccess] = useState(false);
    
    // Using a fixed language for auth pages for simplicity
    const t = translations['en'];

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900">
                <SparklesIcon className="w-12 h-12 text-indigo-600 animate-pulse" />
                <p className="mt-4 text-slate-600 font-medium">Loading...</p>
            </div>
        );
    }

    if (user) {
        return <App />;
    }

    if (view === 'login') {
        return <LoginPage 
            switchToSignup={() => { setSignupSuccess(false); setView('signup'); }} 
            t={t} 
            signupSuccess={signupSuccess} 
        />;
    }

    return <SignupPage 
        switchToLogin={() => setView('login')} 
        t={t}
        onSignupSuccess={() => { setSignupSuccess(true); setView('login'); }}
    />;
};

export default Auth;