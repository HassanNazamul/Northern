
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../state';
import { setUser } from '../state/slices/userSlice';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        dispatch(setUser(email));
        navigate('/gallery');
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-neutral-950 text-neutral-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-neutral-900 rounded-xl shadow-lg border border-neutral-800">
                <h1 className="text-2xl font-bold text-center text-amber-500">Login</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-neutral-400 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-neutral-100 placeholder-neutral-500"
                            placeholder="Enter your email"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-2 px-4 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-colors duration-200"
                    >
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
