import React from 'react';

const colors = ['#1016b0', '#05b39b', '#67c1e7', '#f9be37'];

const LoadingDots = () => {
  return (
    <div className="w-full h-full flex items-center justify-center py-10">
      <div className="flex items-end space-x-4">
        {colors.map((color, index) => (
          <span
            key={index}
            className="inline-block rounded-full animate-bounce-seq"
            style={{
              width: 28,
              height: 28,
              backgroundColor: color,
              animationDelay: `${index * 0.12}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default LoadingDots;


