import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';

export const LoadingSpinner = () => {
  const [dots, setDots] = useState('');
  
  // animate the dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev.length >= 3) return '';
        return prev + '.';
      });
    }, 400);
    
    return () => clearInterval(interval);
  }, []);
  
  // brand coloured green spinner indicator with larger size
  const antIcon = <LoadingOutlined style={{ fontSize: 40, color: '#52c41a' }} spin />;
  
  // override the fullscreen spinner background color and add custom styling
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
      .ant-spin-fullscreen {
        background-color: white !important;
      }
      
      @keyframes fadeIn {
        0% { opacity: 0; transform: translateY(10px); }
        100% { opacity: 1; transform: translateY(0); }
      }
      
      .loading-tip {
        animation: fadeIn 0.5s ease-out;
        font-weight: 500;
      }
      
      .text-with-dots {
        position: relative;
        display: inline-block;
      }
      
      .dot-container {
        position: absolute;
        left: 100%;
        top: 0;
        width: 36px;
        text-align: left;
      }
    `;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  return (
    <Spin 
      indicator={antIcon}
      tip={
        <div className="loading-tip" style={{ 
          marginTop: 16, 
          color: "black", 
          fontSize: "16px",
          textAlign: "center"
        }}>
          <div style={{ 
            display: "flex", 
            justifyContent: "center", 
            alignItems: "center" 
          }}>
            <div className="text-with-dots">
            We're cooking up your test results.
              <span className="dot-container">{dots}</span>
            </div>
          </div>
          <p style={{ 
            fontSize: "14px", 
            opacity: 0.8, 
            marginTop: 8 
          }}>
            Almost there!
          </p>
        </div>
      }
      fullscreen
    />
  );
};
