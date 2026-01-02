import React from 'react';

const LoadingSpinner: React.FC = () => (
  <div className="spinner" style={{ textAlign: 'center', margin: '2rem' }}>
    <div className="lds-dual-ring"></div>
    <span>Loading...</span>
    <style>{`
      .lds-dual-ring {
        display: inline-block;
        width: 32px;
        height: 32px;
      }
      .lds-dual-ring:after {
        content: " ";
        display: block;
        width: 24px;
        height: 24px;
        margin: 4px;
        border-radius: 50%;
        border: 4px solid #4F8EF7;
        border-color: #4F8EF7 transparent #4F8EF7 transparent;
        animation: lds-dual-ring 1.2s linear infinite;
      }
      @keyframes lds-dual-ring {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

export default LoadingSpinner;
