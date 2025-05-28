import React, { useEffect } from 'react';
import { selectCurrentToken } from '../store/authSlice';
import { useSelector } from 'react-redux'
import SendRequest from '../../src/api/SendRequest';

const Profile = () => {
    const  token  = useSelector(selectCurrentToken)
    //this makes so that it will always verify the token once when the page is loaded at first
    useEffect(()=>{
        (async () => {
            try {
                const data = await SendRequest(token);
                console.log('Verification result:', data);
            } catch (error) {
                console.error(error);
                toast.error('Session expired. Please login again.');
            }
        })();
    },[token])

    return (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 transition-colors duration-200">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Your Profile</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-200 mb-4">Personal Information</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                            <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">John Doe</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                            <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">john@example.com</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;