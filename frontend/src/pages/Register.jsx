import React from 'react';
import VoterRegistration from '../components/VoterRegistration';

function Register() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-display font-bold text-dark-100 mb-2">
          Voter Registration
        </h1>
        <p className="text-dark-400">
          Register once with your face photo to participate in elections
        </p>
      </div>
      <VoterRegistration />
    </div>
  );
}

export default Register;
