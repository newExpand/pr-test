
      import React from 'react';
      
      const TestComponent: React.FC = () => {
        const isEnabled = true;
        return <div>{isEnabled && 'Enabled'}</div>;
      };
      
      export default TestComponent;
    