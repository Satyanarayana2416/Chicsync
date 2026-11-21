
import React from 'react';
import { SettingsIcon } from './icons/SettingsIcon';

const ApiKeyInstructions: React.FC = () => {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 bg-black/60 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="api-key-modal-title"
        >
            <div
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-xl m-4 p-6 md:p-8 text-slate-800 dark:text-slate-200 animate-pop-in"
            >
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/50">
                        <SettingsIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <h2 id="api-key-modal-title" className="text-2xl font-bold mt-4">Application Setup Required</h2>
                    <p className="mt-2 text-slate-500 dark:text-slate-400">
                        To use this application, you need to provide your own Google Gemini API key.
                    </p>
                </div>

                <div className="mt-6 text-left bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 space-y-3">
                   <h3 className="font-semibold">How to Securely Set Up Your API Key:</h3>
                   <ol className="list-decimal list-inside text-sm space-y-4 text-slate-600 dark:text-slate-300">
                        <li>
                            <strong>First, DELETE any old keys.</strong> Then, get a new API key from{' '}
                            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400">
                                Google AI Studio
                            </a>.
                        </li>
                        <li>
                            <strong>(CRITICAL STEP) Restrict your new key.</strong> In Google AI Studio, find your new key, click the menu (⋮), and select "Edit". Under "API restrictions", choose "Websites" and add your app's URL (e.g., `your-app-name.onrender.com`). This prevents anyone else from using your key.
                        </li>
                        <li>Go to your project dashboard on your hosting provider (e.g., Render, Vercel).</li>
                        <li>Find the <strong>Environment Variables</strong> section in your project settings.</li>
                        <li>Create a new variable with these details:
                            <div className="mt-2 p-2 bg-slate-200 dark:bg-slate-800 rounded text-xs font-mono">
                                <div><strong>Key:</strong> <span className="text-indigo-600 dark:text-indigo-400">API_KEY</span></div>
                                <div><strong>Value:</strong> <span className="text-indigo-600 dark:text-indigo-400">paste_your_new_RESTRICTED_api_key_here</span></div>
                            </div>
                        </li>
                        <li>Save the variable and <strong>manually re-deploy</strong> your application for the changes to take effect.</li>
                   </ol>
                </div>
                
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="text-left bg-yellow-50 border border-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-800/50 rounded-lg p-4 space-y-2">
                        <h3 className="font-semibold text-yellow-800 dark:text-yellow-300">Seeing a "Free Tier" error?</h3>
                        <p className="text-sm text-yellow-700 dark:text-yellow-400">
                            If you see errors about usage limits but haven't used the app, your API key is likely exposed. <strong>Restricting your key (Step 2)</strong> is the only permanent fix for this.
                        </p>
                    </div>
                     <div className="text-left bg-red-50 border border-red-200 dark:bg-red-900/30 dark:border-red-800/50 rounded-lg p-4 space-y-2">
                         <h3 className="font-semibold text-red-800 dark:text-red-300">Getting a "limit: 0" Quota Error?</h3>
                         <p className="text-sm text-red-700 dark:text-red-400">
                             This specific error means the Google Cloud project for your API key is not configured correctly. In your Google Cloud Console, ensure:
                             <br/>1. The <strong>"Generative Language API"</strong> is enabled.
                             <br/>2. Your project is linked to a <strong>billing account</strong> (required even for the free tier).
                         </p>
                     </div>
                </div>
            </div>
        </div>
    );
};

export default ApiKeyInstructions;