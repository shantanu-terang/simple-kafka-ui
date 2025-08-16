import { toast } from "react-toastify";
import type { MessageType } from "../utils/useTopicState";

type MessageRowProps = {
  message: MessageType
  isExpanded: boolean;
  onToggleExpand: () => void;
  onResend: () => Promise<void>;
};

export function MessageRow({ message, isExpanded, onToggleExpand, onResend }: MessageRowProps) {

  const formatTimestamp = (timestamp: string | number | Date) => {
    return new Date(timestamp).toString();
  };


  const formatJSON = (obj: unknown) => {
    return JSON.stringify(obj, null, 2);
  };

  const parseJSON = (jsonString: string) => {
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Invalid JSON:', error);
      toast.error('Invalid JSON format in message');
      return {};
    }
}
//   const getMessagePreview = (msg: string) => {
//     return JSON.stringify(msg).substring(0, 100) + '...';
//   };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  };

  return (
    <>
      <tr className={`message-row ${isExpanded ? 'expanded' : ''}`}>
        <td>
          <button className="expand-btn" onClick={onToggleExpand}>
            <i className={`fas ${isExpanded ? 'fa-chevron-down' : 'fa-chevron-right'}`}></i>
          </button>
        </td>
        <td>{message.offset}</td>
        <td title={`${message.from_now} (${formatTimestamp(message.timestamp)})`} className="timestamp">
            {/* {formatTimestamp(message.timestamp)} */}
            {message.timestamp}
        </td>
        
        <td className="message-preview">
          {message.message}
        </td>
      </tr>
      
      {isExpanded && (
        <tr>
          <td colSpan={5} className="message-details">
            
            <div className="message-json">
                <button 
                className="copy-btn" style={{ right: 155 }}
                onClick={() => {
                    toast.info('Not implemented yet! This feature will be available in future releases.');
                } }
                title="Replay Messages from this offset"
              >
                <i className="fas fa-play"></i> Replay
              </button>
                <button 
                className="copy-btn" style={{ right: 75 }}
                onClick={onResend}
                title="Resend Message"
              >
                <i className="fas fa-refresh"></i> Resend
              </button>
              <button 
                className="copy-btn"
                onClick={() => {
                    toast.promise(
                      copyToClipboard(message.message),
                      {
                        pending: 'Copying message...',
                        success: 'Message copied to clipboard',
                        error: 'Failed to copy Message'
                      }
                    );
                }}
                title="Copy JSON"
              >
                <i className="fas fa-copy"></i> Copy
              </button>
              { formatJSON(parseJSON(message.message)) }
            </div>
          </td>
        </tr>
      )}
    </>
  );
};