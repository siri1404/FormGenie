import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import FormPreview from './components/FormPreview';
import JsonOutput from './components/JsonOutput';
import { MagicIcon } from './components/icons/MagicIcon';
import { GoogleIcon } from './components/icons/GoogleIcon';
import { FormData } from './types';
import { generateFormFromText } from './services/geminiService';
import { createGoogleForm } from './services/googleFormsService';

// Fix for window.google property not existing on type Window
declare global {
  interface Window {
    google?: any;
  }
}

// Load Google OAuth client configuration from client.json
let GOOGLE_CLIENT_ID = "895209921143-8u53fd0esgeib50mlvm6udb1agh3393d.apps.googleusercontent.com";

// Load client configuration from client.json
const loadClientConfig = async () => {
  try {
    const response = await fetch('/client.json');
    const config = await response.json();
    GOOGLE_CLIENT_ID = config.web.client_id;
  } catch (error) {
    console.warn('Failed to load client.json, using default client ID:', error);
  }
};

const sampleText = `
Student Feedback Survey

Course Name: Introduction to Artificial Intelligence
Please provide your honest feedback to help us improve this course.

1. How would you rate the overall quality of this course?
- Excellent
- Good
- Average
- Poor

2. Which topics did you find most interesting? (Select all that apply)
[ ] Machine Learning Fundamentals
[ ] Natural Language Processing
[ ] Computer Vision
[ ] Reinforcement Learning

3. Please provide any specific suggestions for improving the course content.

4. Your Name (Optional)
`;

function App() {
  const [rawText, setRawText] = useState<string>('');
  const [formData, setFormData] = useState<FormData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);


  const [tokenClient, setTokenClient] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isCreatingGoogleForm, setIsCreatingGoogleForm] = useState<boolean>(false);
  const [googleFormUrl, setGoogleFormUrl] = useState<string | null>(null);
  const [googleApiError, setGoogleApiError] = useState<string | null>(null);

  useEffect(() => {
    const initializeGoogleAuth = async () => {
      await loadClientConfig();
      
      if (window.google?.accounts?.oauth2) {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: 'https://www.googleapis.com/auth/forms https://www.googleapis.com/auth/drive.file',
          callback: (tokenResponse: any) => {
            if (tokenResponse.error) {
              setGoogleApiError(tokenResponse.error_description);
              return;
            }
            setAccessToken(tokenResponse.access_token);
          },
        });
        setTokenClient(client);
      }
    };
    
    initializeGoogleAuth();
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!rawText.trim()) {
      setError("Please enter some text to generate a form.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setFormData(null);
    setGoogleFormUrl(null);
    setGoogleApiError(null);

    try {
      const generatedData = await generateFormFromText(rawText);
      setFormData(generatedData);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [rawText]);

  const handleUseSample = () => {
    setRawText(sampleText.trim());
    setError(null);
  };
  
  const handleGoogleSignIn = () => {
    if (tokenClient) {
        tokenClient.requestAccessToken();
    } else {
        setGoogleApiError("Google Sign-In is not ready yet. Please try again in a moment.");
    }
  };

  const handleCreateGoogleForm = async () => {
    if (!formData || !accessToken) return;
    setIsCreatingGoogleForm(true);
    setGoogleApiError(null);
    setGoogleFormUrl(null);

    try {
        const url = await createGoogleForm(formData, accessToken);
        setGoogleFormUrl(url);
    } catch (e) {
        if (e instanceof Error) {
            setGoogleApiError(e.message);
        } else {
            setGoogleApiError("An unknown error occurred while creating the Google Form.");
        }
    } finally {
        setIsCreatingGoogleForm(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
      <Header />
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <div className="flex flex-col space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="rawText" className="block text-lg font-semibold text-slate-800 dark:text-slate-200">
                  Paste your form text
                </label>
                <button 
                  onClick={handleUseSample}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  Use Sample
                </button>
              </div>
              <textarea
                id="rawText"
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Paste your survey, quiz, or feedback form text here..."
                className="w-full h-64 p-4 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-800 resize-y transition"
              />
            </div>
            
            <div>
              <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <MagicIcon className="h-5 w-5 mr-2" />
                    Generate Form
                  </>
                )}
              </button>
              {error && (
                <p className="mt-4 text-center text-sm text-red-600 dark:text-red-400">{error}</p>
              )}
            </div>

            {formData && (
              <div className="p-6 bg-slate-100 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
                <h3 className="font-semibold text-lg">Export to Google Forms</h3>
                {!accessToken ? (
                    <button onClick={handleGoogleSignIn} className="w-full flex items-center justify-center px-4 py-2 border border-slate-300 dark:border-slate-600 text-sm font-medium rounded-md shadow-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700">
                        <GoogleIcon className="w-5 h-5 mr-2" />
                        Sign in with Google to Create Form
                    </button>
                ) : (
                    <button onClick={handleCreateGoogleForm} disabled={isCreatingGoogleForm} className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400">
                      {isCreatingGoogleForm ? 'Creating...' : 'Create Google Form'}
                    </button>
                )}

                {googleApiError && <p className="text-sm text-red-600 dark:text-red-400">{googleApiError}</p>}
                {googleFormUrl && (
                  <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-md">
                    <p className="text-sm text-green-800 dark:text-green-200">
                      Success! Your form is ready. <a href={googleFormUrl} target="_blank" rel="noopener noreferrer" className="font-bold underline hover:text-green-600 dark:hover:text-green-300">View Form</a>
                    </p>
                  </div>
                )}
              </div>
            )}

            {formData && <JsonOutput data={formData} />}
          </div>

          <div className="h-[calc(100vh-10rem)] sticky top-24">
            <FormPreview formData={formData} />
          </div>

        </div>
      </main>
    </div>
  );
}

export default App;
