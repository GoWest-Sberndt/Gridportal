import React, { useEffect, useState } from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'elevenlabs-convai': {
        'agent-id': string;
      };
    }
  }
}

interface ElevenLabsWidgetProps {
  agentId?: string;
  enabled?: boolean;
}

const ElevenLabsWidget: React.FC<ElevenLabsWidgetProps> = ({ 
  agentId = "agent_01jzy2mazrfpvsgy50kf59jq1g",
  enabled = false // Disabled by default to prevent errors
}) => {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only load if enabled
    if (!enabled) return;

    // Load the ElevenLabs script if it hasn't been loaded yet
    const existingScript = document.querySelector('script[src="https://unpkg.com/@elevenlabs/convai-widget-embed"]');
    
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed';
      script.async = true;
      script.type = 'text/javascript';
      
      script.onload = () => {
        setScriptLoaded(true);
      };
      
      script.onerror = () => {
        setError('Failed to load ElevenLabs widget script');
        console.warn('ElevenLabs ConversationalAI widget failed to load');
      };
      
      document.head.appendChild(script);
    } else {
      setScriptLoaded(true);
    }

    // Add error event listener to catch widget errors
    const handleError = (event: ErrorEvent) => {
      if (event.message?.includes('ConversationalAI') || event.message?.includes('convai')) {
        console.warn('ElevenLabs ConversationalAI widget error:', event.message);
        setError('ConversationalAI widget configuration error');
      }
    };

    window.addEventListener('error', handleError);
    
    return () => {
      window.removeEventListener('error', handleError);
    };
  }, [enabled]);

  // Don't render if disabled or if there's an error
  if (!enabled || error) {
    return null;
  }

  return (
    <div 
      className="fixed top-4 right-4" 
      style={{ zIndex: 9999 }}
    >
      {scriptLoaded && (
        <elevenlabs-convai agent-id={agentId}></elevenlabs-convai>
      )}
    </div>
  );
};

export default ElevenLabsWidget;