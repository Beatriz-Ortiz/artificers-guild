import { useEffect, useState } from 'react';

interface Props {
  text: string;
  speed?: number; // ms per character
  onComplete?: () => void;
}

export default function TypewriterText({ text, speed = 35, onComplete }: Props) {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    setDisplayed('');
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        onComplete?.();
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed, onComplete]);

  return <span>{displayed}</span>;
}
